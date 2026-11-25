import Link from 'next/link';
import Image from 'next/image';
import { categories, breaking } from '@/lib/news';
import { categoryPath } from '@/lib/format';
import Ticker from '@/components/Ticker';
import Search from '@/components/Search';
import PageTop from '@/components/PageTop';
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
    <header id="page-top" tabIndex={-1}>
      <div className="wrap by pt-2">
        <time dateTime={now.toISOString()}>
          {stamp('bn-BD')} · <span lang="en">
            {stamp('en-GB')}
          </span>
        </time>
      </div>
      <div className="mast wrap">
        <Link href="/" aria-label="Bangla24 News প্রচ্ছদ">
          <Image src="/reader/logo.png" alt="Bangla24 News" width={900} height={182} priority />
          <span className="block text-center text-sm">দেশের কথা, মানুষের কথা</span>
        </Link>
        <Search />
      </div>
      <div className="bar">
        <nav className="wrap nav" aria-label="বিভাগ">
          <Link href="/">প্রচ্ছদ</Link>
          <Link href="/#edition">ই-পেপার</Link>
          <Link href="/#guides">ব্যাখ্যা ও গাইড</Link>
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
      <div className="wrap footer-directory">
        <section>
          <Link href="/"><Image src="/reader/logo.png" width={230} height={48} alt="Bangla24 News" /></Link>
          <p>দেশের কথা, মানুষের কথা</p>
          <a href="https://www.facebook.com/share/14y1x6hrfQR/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">ফেসবুকে অনুসরণ করুন</a>
        </section>
        <section><h2>সংবাদ</h2><Link href="/#latest">সর্বশেষ</Link><Link href="/archive">সংবাদ আর্কাইভ</Link><Link href="/#district">জেলার খবর</Link></section>
        <section><h2>পাঠকসেবা</h2><Link href="/#photos">ছবির পাতা</Link><Link href="/#saved">পড়ার তালিকা</Link><Link href="/#send-tip">খবর পাঠান</Link></section>
        <section><h2>প্রকাশনা</h2><Link href="/#about">আমাদের সম্পর্কে</Link><Link href="/admin">নিউজরুম</Link><a href="#page-top">পাতার শুরুতে ফিরুন</a></section>
      </div>
    </footer>
    <PageTop />
  </>;
}
