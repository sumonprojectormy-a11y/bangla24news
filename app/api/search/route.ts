import { search } from '@/lib/news';
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim().slice(0, 100) || '';
  return Response.json((await search(q, 6, 0)).map(({
    id,
    title,
    slug
  }) => ({
    id,
    title,
    slug
  })));
}
