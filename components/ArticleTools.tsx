'use client';

import { useEffect, useState } from 'react';
export default function ArticleTools({
  id,
  url,
  title
}: {
  id: string;
  url: string;
  title: string;
}) {
  function saveArticle() {
    try {
      const stored = JSON.parse(localStorage.getItem('saved') || '[]');
      const ids = new Set(Array.isArray(stored) ? stored : []);
      ids.add(id);
      localStorage.setItem('saved', JSON.stringify([...ids]));
      set('পড়ার তালিকায় যোগ হয়েছে।');
    } catch {
      set('পড়ার তালিকা সংরক্ষণ করা যায়নি।');
    }
  }
  const [notice, set] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  async function sendCorrection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setSending(true);
    setFeedback('');
    try {
      const response = await fetch('/api/reader-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'correction', article: id, quote: fields.get('quote'), details: fields.get('details') })
      });
      if (!response.ok) throw new Error('Submission failed');
      form.reset();
      setFeedback('আপনার সংশোধনের অনুরোধ নিউজরুমে পৌঁছেছে।');
    } catch {
      setFeedback('পাঠানো যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setSending(false);
    }
  }
  useEffect(() => {
    void fetch('/api/views/' + id, {
      method: 'POST',
      keepalive: true
    }).catch(() => {});
  }, [id]);
  return <div className="flex flex-wrap items-center gap-4 rule py-2">
    <a target="_blank" rel="noopener noreferrer" href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)}>ফেসবুক</a>
    <a target="_blank" rel="noopener noreferrer" href={'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url)}>হোয়াটসঅ্যাপ</a>
    <button className="quiet" onClick={async () => {
      try {
        await navigator.clipboard.writeText(url);
        set('লিংক কপি হয়েছে।');
      } catch {
        set(url);
      }
    }}>লিংক কপি</button>
    <button type="button" className="quiet" onClick={saveArticle}>পড়ার তালিকায় রাখুন</button>
    <span role="status">
      {notice}
    </span>
    <details className="w-full">
      <summary className="cursor-pointer">ভুল জানান</summary>
      <form onSubmit={sendCorrection} className="form panel flow mt-3">
        <label>সংশ্লিষ্ট বাক্য (ঐচ্ছিক)<textarea name="quote" rows={2} maxLength={800} /></label>
        <label>কী সংশোধন করা দরকার?<textarea name="details" rows={3} required minLength={5} maxLength={2000} /></label>
        <button type="submit" disabled={sending}>{sending ? 'পাঠানো হচ্ছে…' : 'নিউজরুমে পাঠান'}</button>
        <p role="status">{feedback}</p>
      </form>
    </details>
  </div>;
}
