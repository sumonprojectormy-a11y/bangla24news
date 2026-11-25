import Link from 'next/link';
import { categories, stories } from '@/lib/news';
import { newsPath, categoryPath, bn } from '@/lib/format';
import { Grid, Cover } from '@/components/Stories';
export default async function Home() {
  const [cats, featured, latest, top] = await Promise.all([categories(), stories({
    featured: 'eq.true'
  }, 1), stories({}, 7), stories({
    order: 'views.desc,published_at.desc,id.asc'
  }, 5)]);
  const lead = featured[0] || latest[0];
  const blocks = await Promise.all(cats.map(async c => ({
    c,
    items: await stories({
      category_id: 'eq.' + c.id
    }, 3)
  })));
  return <>
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <section>
        {lead ? <>
          <Link href={newsPath(lead.slug)}>
            <Cover s={lead} priority />
            <span className="kicker">প্রধান সংবাদ</span>
            <h1>
              {lead.title}
            </h1>
          </Link>
          <p className="mt-3">
            {lead.summary}
          </p>
        </> : <div className="panel">
          <h1>প্রধান সংবাদ</h1>
          <p>প্রথম প্রতিবেদন প্রকাশের অপেক্ষায়।</p>
        </div>}
      </section>
      <aside className="panel">
        <h2>সর্বাধিক পঠিত</h2>
        <ol>
          {top.map((s, i) => <li key={s.id} className="border-b py-3">
            <Link href={newsPath(s.slug)}>
              <b className="kicker mr-3">
                {bn(i + 1)}
              </b>
              {s.title}
            </Link>
          </li>)}
        </ol>
      </aside>
    </div>
    <section className="section flow">
      <h2>শীর্ষ সংবাদ</h2>
      <Grid items={latest.filter(s => s.id !== lead?.id).slice(0, 6)} />
    </section>
    {blocks.filter(b => b.items.length).map(({
      c,
      items
    }) => <section className="section flow" key={c.id}>
      <h2>
        <Link href={categoryPath(c.slug)}>
          {c.name}
        </Link>
      </h2>
      <Grid items={items} />
    </section>)}
  </>;
}
