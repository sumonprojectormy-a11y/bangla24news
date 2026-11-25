import { admin } from '@/lib/auth';
import { stories, pageNumber } from '@/lib/news';
import { Pager } from '@/components/Stories';
import Link from 'next/link';
export default async function News({
  searchParams
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const token = await admin(),
    p = pageNumber((await searchParams).page);
  const list = await stories({
    order: 'updated_at.desc,id.asc'
  }, 26, (p - 1) * 25, token);
  return <>
    <h1>সংবাদ পরিচালনা</h1>
    <Link className="button" href="/admin/news/new">নতুন সংবাদ</Link>
    <ul>
      {list.slice(0, 25).map(s => <li key={s.id} className="rule flex justify-between gap-4 py-2">
        <Link href={'/admin/news/' + s.id}>
          {s.title}
        </Link>
        <span className="by">
          {s.published ? 'প্রকাশিত' : 'খসড়া'}
        </span>
      </li>)}
    </ul>
    <Pager page={p} more={list.length > 25} base="/admin/news" />
  </>;
}
