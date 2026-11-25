'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { newsPath } from '@/lib/format';
export default function Search() {
  const [q, set] = useState(''),
    [open, show] = useState(false),
    [items, list] = useState<{
      id: string;
      title: string;
      slug: string;
    }[]>([]);
  useEffect(() => {
    if (!q.trim() || !open) return;
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const r = await fetch('/api/search?q=' + encodeURIComponent(q), {
          signal: abort.signal
        });
        if (r.ok && !abort.signal.aborted) list(await r.json());
      } catch {}
    }, 250);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [q, open]);
  return <form action="/search" role="search" className="relative flex gap-1" onBlur={e => {
    if (!e.currentTarget.contains(e.relatedTarget)) show(false);
  }} onKeyDown={e => {
    if (e.key === 'Escape') show(false);
  }}>
    <input type="search" name="q" aria-label="খবর খুঁজুন" placeholder="খবর খুঁজুন…" maxLength={100} value={q} onFocus={() => show(true)} onChange={e => {
      set(e.target.value);
      list([]);
      show(true);
    }} />
    <button>খুঁজুন</button>
    {open && q.trim() && items.length > 0 && <ul className="absolute top-full z-10 w-full bg-white shadow-lg">
      {items.map(item => <li key={item.id}>
        <Link className="block border-b p-2" href={newsPath(item.slug)} onClick={() => show(false)}>
          {item.title}
        </Link>
      </li>)}
    </ul>}
  </form>;
}
