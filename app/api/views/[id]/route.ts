import { createHmac } from 'node:crypto';
import { env, request } from '@/lib/backend';
export async function POST(req: Request, {
  params
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const origin = req.headers.get('origin');
  if (!origin || new URL(req.url).origin !== origin) return new Response(null, {
    status: 403
  });
  const {
    id
  } = await params;
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) return new Response(null, {
    status: 400
  });
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const day = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Dhaka'
  }).format(new Date());
  const ip = req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const hash = createHmac('sha256', key).update([day, ip, req.headers.get('user-agent') || ''].join('|')).digest('hex');
  await request('/rest/v1/rpc/record_news_view', {
    method: 'POST',
    body: JSON.stringify({
      article_id: id,
      visitor_hash: hash
    })
  }, undefined, key);
  return new Response(null, {
    status: 204
  });
}
