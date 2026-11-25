import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/lib/types';
import { photo } from '@/lib/backend';
import { categoryPath, newsPath, bn } from '@/lib/format';
export function Cover({
  s,
  priority = false
}: {
  s: Story;
  priority?: boolean;
}) {
  return <Image className="storyimg" src={photo(s.thumbnail)} width={960} height={540} alt={s.title} sizes="(max-width:700px) 100vw, (max-width:1100px) 50vw, 640px" priority={priority} />;
}
export function Card({
  s
}: {
  s: Story;
}) {
  return <article className="card">
    <Link href={newsPath(s.slug)}>
      <Cover s={s} />
    </Link>
    <Link className="kicker" href={categoryPath(s.categories.slug)}>
      {s.categories.name}
    </Link>
    <h3>
      <Link href={newsPath(s.slug)}>
        {s.title}
      </Link>
    </h3>
  </article>;
}
export function Grid({
  items
}: {
  items: Story[];
}) {
  return items.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {items.map(s => <Card key={s.id} s={s} />)}
  </div> : <p className="by py-4">এই মুহূর্তে কোনো সংবাদ পাওয়া যায়নি।</p>;
}
export function Pager({
  page,
  more,
  base
}: {
  page: number;
  more: boolean;
  base: string;
}) {
  const link = (p: number) => base + (base.includes('?') ? '&' : '?') + 'page=' + p;
  return <nav aria-label="পাতা" className="my-6 flex gap-4">
    {page > 1 && <Link href={link(page - 1)}>আগের পাতা</Link>}
    <span>পৃষ্ঠা {bn(page)}
    </span>
    {more && <Link href={link(page + 1)}>পরের পাতা</Link>}
  </nav>;
}
