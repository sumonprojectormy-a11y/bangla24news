import { breaking } from '@/lib/news';
export const dynamic = 'force-dynamic';
export async function GET() {
  return Response.json((await breaking()).map(({
    id,
    title,
    slug
  }) => ({
    id,
    title,
    slug
  })), {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
