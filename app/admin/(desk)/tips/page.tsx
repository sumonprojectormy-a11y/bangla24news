import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/auth';
import { query, request, rows } from '@/lib/backend';
import { date } from '@/lib/format';

type Tip = {
  id: string;
  district: string;
  upazila: string;
  headline: string;
  details: string;
  contact: string;
  photo: string;
  created_at: string;
  reviewed: boolean;
};

async function markReviewed(form: FormData) {
  'use server';
  const token = await admin();
  const id = String(form.get('id') ?? '');
  if (!/^[a-f0-9-]{36}$/.test(id)) return;
  await request(query('reader_tips', { id: 'eq.' + id }), {
    method: 'PATCH',
    body: JSON.stringify({ reviewed: true })
  }, token);
  revalidatePath('/admin/tips');
}

export default async function Tips() {
  const token = await admin();
  const tips = await rows<Tip>('reader_tips', {
    select: '*',
    order: 'reviewed.asc,created_at.desc',
    limit: '20'
  }, token).catch(() => null);

  return <>
    <h1>পাঠকের পাঠানো খবর</h1>
    {tips === null && <p>পাঠকের খবর এখন লোড করা যাচ্ছে না।</p>}
    {tips?.length === 0 && <p>এখনও কোনো খবর জমা পড়েনি।</p>}
    {tips?.map(tip => <article className="panel flow" key={tip.id}>
      <h2>{tip.headline}</h2>
      <p className="by">{tip.district} {tip.upazila} · {date(tip.created_at, true)}</p>
      <p className="whitespace-pre-wrap">{tip.details}</p>
      {tip.contact && <p>{tip.contact}</p>}
      {/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(tip.photo) &&
        <a className="button" href={tip.photo} download={tip.id + '.' + tip.photo.slice(11, tip.photo.indexOf(';'))}>ছবি ডাউনলোড</a>}
      {tip.reviewed ? <p>পর্যালোচিত</p> : <form action={markReviewed}>
        <input type="hidden" name="id" value={tip.id} />
        <button>পর্যালোচনা সম্পন্ন</button>
      </form>}
    </article>)}
  </>;
}
