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
  const [notice, set] = useState('');
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
    <span role="status">
      {notice}
    </span>
  </div>;
}
