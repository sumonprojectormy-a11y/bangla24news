'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import { admin, allowed, sessionCookie } from '@/lib/auth';
import { BackendError, query, request } from '@/lib/backend';
import { editArticle } from '@/lib/news';
import { slugify } from '@/lib/format';
class InputError extends Error {}
function message(error: unknown) {
  if (error instanceof InputError) return error.message;
  if (error instanceof BackendError) {
    if (error.code === '23505') return 'এই স্লাগ বা নাম ইতিমধ্যে ব্যবহৃত হয়েছে।';
    if (error.code === '23503') return 'বিভাগটি অন্য সংবাদে ব্যবহৃত হচ্ছে, অথবা আর বিদ্যমান নেই।';
    if (error.status === 401 || error.status === 403) return 'অধিবেশন শেষ হয়েছে অথবা অনুমতি নেই। আবার প্রবেশ করুন।';
  }
  return 'কাজটি সম্পন্ন হয়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
}
function value(f: FormData, k: string, max: number) {
  const v = String(f.get(k) || '').trim();
  if (!v || v.length > max) throw new InputError('প্রয়োজনীয় ঘর ও লেখার দৈর্ঘ্য পরীক্ষা করুন।');
  return v;
}
export async function login(_: string, f: FormData) {
  let token: string, expires: number;
  try {
    const r = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({
        email: String(f.get('email') || '').trim(),
        password: String(f.get('password') || '')
      })
    });
    const data = await r.json();
    token = data.access_token;
    expires = data.expires_in;
    if (!(await allowed(token))) return 'এই হিসাবে সম্পাদকীয় প্রবেশাধিকার নেই।';
  } catch {
    return 'প্রবেশ করা যায়নি। ইমেইল, পাসওয়ার্ড ও সংযোগ পরীক্ষা করুন।';
  }
  ;
  (await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expires
  });
  redirect('/admin');
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  try {
    if (token) await request('/auth/v1/logout?scope=local', {
      method: 'POST'
    }, token);
  } catch {} finally {
    jar.delete(sessionCookie);
  }
  redirect('/admin/login');
}
async function upload(file: File, token: string) {
  if (file.size > 2097152) throw new InputError('ছবি সর্বোচ্চ ২ মেগাবাইট হতে পারে।');
  const bytes = Buffer.from(await file.arrayBuffer());
  const format = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) ? ['jpg', 'image/jpeg'] : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? ['png', 'image/png'] : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? ['webp', 'image/webp'] : null;
  if (!format) throw new InputError('JPG, PNG অথবা WebP ছবি বেছে নিন।');
  const name = randomUUID() + '.' + format[0];
  await request('/storage/v1/object/news-thumbnails/' + name, {
    method: 'POST',
    headers: {
      'Content-Type': format[1]
    },
    body: new Uint8Array(bytes)
  }, token);
  return name;
}
async function removeImage(path: string, token: string) {
  // An edit has already committed. A cleanup failure must not turn success into a retry.
  try {
    await request('/storage/v1/object/news-thumbnails/' + path, {
      method: 'DELETE'
    }, token);
  } catch {
    console.warn('Thumbnail cleanup deferred', path);
  }
}
async function mutate(table: string, id: string, revision: string, method: string, data: unknown, token: string) {
  const params: Record<string, string> = {
    select: 'id'
  };
  if (method !== 'POST') {
    if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id) || !/^[1-9][0-9]*$/.test(revision)) {
      throw new InputError('সঠিক রেকর্ড নির্বাচন করে আবার চেষ্টা করুন।');
    }
    params.id = 'eq.' + id;
    params.revision = 'eq.' + revision;
  }
  const result = await request(query(table, params), {
    method,
    headers: {
      Prefer: 'return=representation'
    },
    body: data === undefined ? undefined : JSON.stringify(data)
  }, token);
  if (!(await result.json()).length) throw new InputError('অন্য সম্পাদক পরিবর্তন করেছেন। পাতা রিফ্রেশ করুন।');
}
export async function saveNews(id: string, revision: string, _: string, f: FormData) {
  const token = await admin();
  let uploaded: string | undefined;
  try {
    const title = value(f, 'title', 240),
      slug = slugify(String(f.get('slug') || title));
    if (!slug) throw new InputError('একটি বৈধ স্লাগ দিন।');
    const data = {
      title,
      slug,
      summary: value(f, 'summary', 800),
      content: value(f, 'content', 100000),
      reporter: value(f, 'reporter', 120),
      category_id: value(f, 'category_id', 36),
      breaking: f.has('breaking'),
      featured: f.has('featured'),
      published: f.has('published')
    };
    const current = id ? await editArticle(id, token) : undefined;
    if (id && String(current?.revision) !== revision) throw new InputError('সংবাদটি বদলে গেছে। রিফ্রেশ করুন।');
    const file = f.get('image');
    if (file instanceof File && file.size) uploaded = await upload(file, token);
    const thumbnail = uploaded || (f.has('remove_image') ? null : current?.thumbnail || null);
    await mutate('news', id, revision, id ? 'PATCH' : 'POST', {
      ...data,
      thumbnail
    }, token);
    if (current?.thumbnail && current.thumbnail !== thumbnail) await removeImage(current.thumbnail, token);
  } catch (e) {
    if (uploaded && (e instanceof InputError || e instanceof BackendError && e.status < 500)) await removeImage(uploaded, token);
    return message(e);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/news');
}
export async function deleteNews(id: string, revision: string, _: string, f: FormData) {
  const token = await admin();
  if (!f.has('confirm')) return 'মুছে ফেলার সম্মতি দিন।';
  try {
    const current = await editArticle(id, token);
    await mutate('news', id, revision, 'DELETE', undefined, token);
    if (current?.thumbnail) await removeImage(current.thumbnail, token);
  } catch (e) {
    return message(e);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/news');
}
export async function saveCategory(id: string, revision: string, _: string, f: FormData) {
  const token = await admin();
  try {
    const name = value(f, 'name', 100),
      slug = slugify(String(f.get('slug') || name));
    if (!slug) throw new InputError('বৈধ স্লাগ দিন।');
    await mutate('categories', id, revision, id ? 'PATCH' : 'POST', {
      name,
      slug
    }, token);
  } catch (e) {
    return message(e);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/categories');
}
export async function deleteCategory(id: string, revision: string, _: string, f: FormData) {
  const token = await admin();
  if (!f.has('confirm')) return 'মুছে ফেলার সম্মতি দিন।';
  try {
    await mutate('categories', id, revision, 'DELETE', undefined, token);
  } catch (e) {
    return message(e);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/categories');
}
