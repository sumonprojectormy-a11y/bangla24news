import { notFound } from 'next/navigation';
import { category, stories, pageNumber } from '@/lib/news';
import { categoryPath } from '@/lib/format';
import { Grid, Pager } from '@/components/Stories';
type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};
export async function generateMetadata({
  params
}: Props) {
  const c = await category((await params).slug);
  return {
    title: c?.name || 'বিভাগ'
  };
}
export default async function Page({
  params,
  searchParams
}: Props) {
  const c = await category((await params).slug);
  if (!c) notFound();
  const p = pageNumber((await searchParams).page);
  const list = await stories({
    category_id: 'eq.' + c.id
  }, 13, (p - 1) * 12);
  return <div className="flow">
    <h1>
      {c.name}
    </h1>
    <Grid items={list.slice(0, 12)} />
    <Pager page={p} more={list.length > 12} base={categoryPath(c.slug)} />
  </div>;
}
