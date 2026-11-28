import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'যোগাযোগ',
  description: 'Bangla24 News-এ খবর, সংশোধনের অনুরোধ বা পাঠকের মতামত পাঠানোর উপায়।',
  alternates: { canonical: 'https://www.bangla24.news/contact' }
};

export default function Contact() {
  return <>
    <h1>যোগাযোগ</h1>
    <h2>খবর পাঠান</h2>
    <p><Link href="/#send-tip">খবর পাঠানোর ফর্ম</Link> ব্যবহার করুন। কী ঘটেছে, কোথায় ও কখন ঘটেছে তা লিখুন। তথ্যের উৎস জানা থাকলে সেটিও উল্লেখ করুন।</p>
    <h2>ভুল ধরিয়ে দিন</h2>
    <p>কোনো লেখায় ‘সংশোধন পাঠান’ অপশন থাকলে সেটি ব্যবহার করুন। নইলে আমাদের ফেসবুক পেজে লেখার লিংক, যে অংশটি ভুল মনে হয়েছে এবং সঠিক তথ্যের উৎস পাঠাতে পারেন।</p>
    <h2>সাধারণ প্রশ্ন বা মতামত</h2>
    <p><a href="https://www.facebook.com/share/14y1x6hrfQR/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">Bangla24 News-এর ফেসবুক পেজ</a> ব্যবহার করুন। প্রকাশ্য মন্তব্যে ব্যক্তিগত তথ্য দেবেন না।</p>
  </>;
}
