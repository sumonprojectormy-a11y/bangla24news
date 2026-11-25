import Link from 'next/link';
import Image from 'next/image';
import { categories, breaking } from '@/lib/news';
import { categoryPath } from '@/lib/format';
import Ticker from '@/components/Ticker';
import Search from '@/components/Search';
export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const [cats, alerts] = await Promise.all([categories(), breaking()]);
  const now = new Date();
  const stamp = (locale: string) => new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeZone: 'Asia/Dhaka'
  }).format(now);
  return <>
    <header>
      <div className="wrap by pt-2">
        <time dateTime={now.toISOString()}>
          {stamp('bn-BD')} · <span lang="en">
            {stamp('en-GB')}
          </span>
        </time>
      </div>
      <div className="mast wrap">
        <Link href="/" aria-label="Bangla24 News প্রচ্ছদ">
          <Image src="/masthead.png" alt="Bangla24 News" width={900} height={182} priority />
          <span className="block text-center text-sm">দেশের কথা, মানুষের কথা</span>
        </Link>
        <Search />
      </div>
      <div className="bar">
        <nav className="wrap nav" aria-label="বিভাগ">
          <Link href="/">প্রচ্ছদ</Link>
          {cats.map(c => <Link key={c.id} href={categoryPath(c.slug)}>
            {c.name}
          </Link>)}
        </nav>
      </div>
      <Ticker initial={alerts.map(({
        id,
        title,
        slug
      }) => ({
        id,
        title,
        slug
      }))} />
    </header>
    <main className="wrap py-5">
      {children}
    </main>
    <footer className="foot">
      <div className="wrap flex justify-between gap-4">
        <span>bangla24.news · দেশের কথা, মানুষের কথা</span>
        <Link href="/admin">নিউজরুম</Link>
      </div>
    </footer>
  </>;
}
