import Link from 'next/link';
import { admin } from '@/lib/auth';
import { logout } from '../actions';
export const metadata = {
  title: 'নিউজরুম',
  robots: {
    index: false,
    follow: false
  }
};
export default async function Desk({
  children
}: {
  children: React.ReactNode;
}) {
  await admin();
  return <>
    <header className="bar">
      <nav className="wrap nav items-center">
        <Link href="/admin">ড্যাশবোর্ড</Link>
        <Link href="/admin/news">সংবাদ</Link>
        <Link href="/admin/categories">বিভাগ</Link>
        <Link href="/admin/tips">পাঠকের খবর</Link>
        <Link href="/">প্রচ্ছদ</Link>
        <form action={logout}>
          <button>বের হোন</button>
        </form>
      </nav>
    </header>
    <main className="wrap flow py-6">
      {children}
    </main>
  </>;
}
