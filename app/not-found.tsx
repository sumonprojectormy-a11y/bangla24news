import Link from 'next/link';
export default function Missing() {
  return <main className="wrap flow py-16">
    <h1>পাতাটি পাওয়া যায়নি</h1>
    <Link className="button" href="/">প্রচ্ছদে ফিরুন</Link>
  </main>;
}
