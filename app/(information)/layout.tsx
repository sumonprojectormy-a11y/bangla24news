import Image from 'next/image';
import Link from 'next/link';

const links = [
  ['/about', 'আমাদের সম্পর্কে'],
  ['/contact', 'যোগাযোগ'],
  ['/privacy-policy', 'গোপনীয়তা নীতি']
] as const;

export default function InformationLayout({ children }: { children: React.ReactNode }) {
  return <>
    <header className="wrap py-5 text-center">
      <Link href="/" aria-label="Bangla24 News প্রচ্ছদ" className="inline-block max-w-full">
        <Image src="/reader/logo.png" width={230} height={48} alt="Bangla24 News" priority />
      </Link>
      <p className="mt-2">দেশের কথা, মানুষের কথা</p>
    </header>
    <main className="wrap py-5">
      <article className="flow mx-auto max-w-3xl py-4">{children}</article>
    </main>
    <footer className="foot">
      <nav className="wrap flex flex-wrap gap-x-5 gap-y-2 py-4" aria-label="প্রকাশনা">
        <Link href="/">প্রচ্ছদ</Link>
        {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
    </footer>
  </>;
}
