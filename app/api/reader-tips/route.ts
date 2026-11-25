import { env, request } from '@/lib/backend';

const maxSize = 570000;
const imageData = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export async function POST(incoming: Request) {
  if (incoming.headers.get('sec-fetch-site') !== 'same-origin' ||
      !incoming.headers.get('content-type')?.startsWith('application/json')) {
    return new Response(null, { status: 403 });
  }

  const reader = incoming.body?.getReader();
  if (!reader) return new Response(null, { status: 400 });
  const decoder = new TextDecoder();
  let size = 0;
  let raw = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxSize) {
      await reader.cancel();
      return new Response(null, { status: 413 });
    }
    raw += decoder.decode(value, { stream: true });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw + decoder.decode());
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch {
    return new Response(null, { status: 400 });
  }

  const field = (name: string) => typeof body[name] === 'string' ? body[name].trim() : '';
  const correction = body.action === 'correction';
  const article = field('article');
  const district = correction ? 'article-correction' : field('district');
  const upazila = correction ? article : field('upazila');
  const headline = correction ? 'Article correction · ' + article : field('headline');
  const details = (correction && field('quote') ? field('quote').slice(0, 800) + '\n\n' : '') + field('details');
  const contact = correction ? '' : field('contact');
  const photo = correction ? '' : field('photo');

  if (!/^[a-z][a-z-]{0,79}$/.test(district) || upazila.length > 80 ||
      (correction && !/^(\d{1,6}|[a-f0-9-]{36})$/.test(article)) ||
      headline.length < 5 || headline.length > 160 || contact.length > 160 ||
      details.length < (correction ? 5 : 20) || details.length > 4000 ||
      (photo && (photo.length > 546200 || !imageData.test(photo)))) {
    return new Response(null, { status: 400 });
  }

  try {
    const key = env('SUPABASE_SERVICE_ROLE_KEY');
    await request('/rest/v1/reader_tips', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ district, upazila, headline, details, contact, photo })
    }, key.startsWith('eyJ') ? key : undefined, key);
    return new Response(null, { status: 201 });
  } catch {
    return new Response(null, { status: 503 });
  }
}
