'use client';

export default function ErrorPage({
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return <main className="wrap flow py-16">
    <h1>পাতাটি লোড করা যায়নি</h1>
    <button onClick={reset}>আবার চেষ্টা করুন</button>
  </main>;
}
