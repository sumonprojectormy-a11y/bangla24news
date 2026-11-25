import { search, pageNumber } from '@/lib/news';
import { Grid, Pager } from '@/components/Stories';
export const metadata = {
  title: 'খবর খুঁজুন',
  robots: {
    index: false,
    follow: true
  }
};
export default async function Page({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}) {
  const args = await searchParams;
  const q = String(args.q || '').trim().slice(0, 100);
  const p = pageNumber(args.page);
  const list = q ? await search(q, 13, (p - 1) * 12) : [];
  return <div className="flow">
    <h1>সংবাদ অনুসন্ধান</h1>
    {q ? <>
      <p>“{q}” এর ফলাফল</p>
      <Grid items={list.slice(0, 12)} />
      <Pager page={p} more={list.length > 12} base={'/search?q=' + encodeURIComponent(q)} />
    </> : <p>ওপরের অনুসন্ধান ঘরে শিরোনামের শব্দ লিখুন।</p>}
  </div>;
}
