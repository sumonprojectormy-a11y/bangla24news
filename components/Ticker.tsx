'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { newsPath } from '@/lib/format';
type Item = {
  id: string;
  title: string;
  slug: string;
};
export default function Ticker({
  initial
}: {
  initial: Item[];
}) {
  const [items, setItems] = useState(initial),
    [paused, pause] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    const timer = setInterval(async () => {
      try {
        const r = await fetch('/api/breaking', {
          signal: abort.signal,
          cache: 'no-store'
        });
        if (r.ok) setItems(await r.json());
      } catch {}
    }, 30000);
    return () => {
      clearInterval(timer);
      abort.abort();
    };
  }, []);
  if (!items.length) return null;
  return <div className="ticker wrap">
    <strong className="ticker-label">ব্রেকিং নিউজ</strong>
    <div className="ticker-window">
      <div className={'track ' + (paused ? 'paused' : '')}>
        {[...items, ...items].map((s, i) => <Link key={i} href={newsPath(s.slug)} aria-hidden={i >= items.length || undefined} tabIndex={i >= items.length ? -1 : 0}>
          {s.title}
        </Link>)}
      </div>
    </div>
    <button className="quiet" onClick={() => pause(!paused)} aria-label={paused ? 'চালু করুন' : 'বিরতি'}>
      {paused ? '▶' : 'Ⅱ'}
    </button>
  </div>;
}
