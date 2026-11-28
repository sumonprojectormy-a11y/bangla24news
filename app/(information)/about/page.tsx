import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে',
  description: 'Bangla24 News-এর সংবাদ, পাঠক গাইড ও পাঠকের অংশগ্রহণ সম্পর্কে জানুন।',
  alternates: { canonical: 'https://www.bangla24.news/about' }
};

export default function About() {
  return <>
    <h1>আমাদের সম্পর্কে</h1>
    <p>Bangla24 News বাংলাদেশ, বিশ্ব ও প্রবাসের পাঠকদের জন্য একটি ডিজিটাল সংবাদমাধ্যম। আমাদের মূল ভাষা বাংলা। কিছু লেখা ইংরেজিতেও পড়া যায়।</p>
    <p>সংবাদের পাশাপাশি ঐতিহ্য, দৈনন্দিন জীবন ও নাগরিক বিষয় নিয়ে আমরা পাঠক গাইড প্রকাশ করি। ওয়েবসাইটে নমুনা হিসেবে চিহ্নিত লেখা প্রকাশিত সংবাদ হিসেবে ব্যবহার করবেন না।</p>
    <p><Link href="/#guides">পাঠক গাইড দেখুন</Link> · <Link href="/contact">যোগাযোগ করুন</Link></p>
  </>;
}
