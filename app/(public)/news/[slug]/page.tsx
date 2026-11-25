import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { article, stories } from '@/lib/news';
import { photo, siteURL } from '@/lib/backend';
import { newsPath, categoryPath, date } from '@/lib/format';
import { Grid, Cover } from '@/components/Stories';
import ArticleText from '@/components/ArticleText';
import ArticleTools from '@/components/ArticleTools';
type Props = {
  params: Promise<{
    slug: string;
  }>;
};
export async function generateMetadata({
  params
}: Props): Promise<Metadata> {
  const s = await article((await params).slug);
  if (!s) notFound();
  const url = siteURL() + newsPath(s.slug),
    image = new URL(photo(s.thumbnail), siteURL()).href;
  return {
    title: s.title,
    description: s.summary,
    alternates: {
      canonical: url
    },
    openGraph: {
      type: 'article',
      siteName: 'Bangla24 News',
      locale: 'bn_BD',
      url,
      title: s.title,
      description: s.summary,
      publishedTime: s.published_at || undefined,
      modifiedTime: s.updated_at,
      authors: [s.reporter],
      images: [{
        url: image,
        alt: s.title
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: s.title,
      description: s.summary,
      images: [image]
    }
  };
}
export default async function Page({
  params
}: Props) {
  const s = await article((await params).slug);
  if (!s) notFound();
  const related = await stories({
    category_id: 'eq.' + s.category_id,
    id: 'neq.' + s.id
  }, 3);
  return <>
    <article className="flow mx-auto max-w-3xl">
      <Link className="kicker" href={categoryPath(s.categories.slug)}>
        {s.categories.name}
      </Link>
      <h1>
        {s.title}
      </h1>
      <p className="text-xl">
        {s.summary}
      </p>
      <p className="by">
        {s.reporter} · {s.published_at && date(s.published_at, true)} (ঢাকা)</p>
      <Cover s={s} priority />
      <ArticleTools id={s.id} url={siteURL() + newsPath(s.slug)} title={s.title} />
      <ArticleText text={s.content} />
    </article>
    <section className="section flow">
      <h2>সম্পর্কিত সংবাদ</h2>
      <Grid items={related} />
    </section>
  </>;
}
