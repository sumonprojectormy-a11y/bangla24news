import { admin } from '@/lib/auth';
import { request } from '@/lib/backend';
import { bn } from '@/lib/format';
import Link from 'next/link';
export default async function Dashboard() {
  const token = await admin();
  const stats = await (await request('/rest/v1/rpc/portal_stats', {
    method: 'POST',
    body: '{}'
  }, token)).json();
  return <>
    <h1>নিউজরুম</h1>
    <div className="grid gap-4 sm:grid-cols-3">
      {[['মোট সংবাদ', stats.news], ['মোট পাঠ', stats.views], ['বিভাগ', stats.categories]].map(([label, value]) => <div className="panel" key={label}>
        {label}
        <strong className="block text-3xl">
          {bn(Number(value))}
        </strong>
      </div>)}
    </div>
    <Link className="button" href="/admin/news/new">নতুন সংবাদ লিখুন</Link>
  </>;
}
