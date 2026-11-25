import { siteURL } from '@/lib/backend';
import { newsPath } from '@/lib/format';
import { stories } from '@/lib/news';
import { readerDetails } from '@/lib/reader-details';

const escape = (text: string) => text.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
})[character]!);

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const district = query.get('district');
  const country = query.get('country');
  if (!district && !country) return new Response('Choose a district or country.', { status: 400 });

  try {
    const latest = await stories({
      published: 'eq.true',
      ...(query.get('mode') === 'breaking' ? { breaking: 'eq.true' } : {})
    }, 100);
    const extra = latest.length ? await readerDetails({
      published: 'eq.true',
      id: 'in.(' + latest.map(item => item.id).join(',') + ')'
    }) : [];
    const selected = new Set(extra?.filter(({ reader_details: details }) =>
      (district && details.district === district) || (country && details.country === country)
    ).map(item => item.id));
    const base = siteURL();
    const items = latest.filter(item => selected.has(item.id)).slice(0, 30).map(item => {
      const link = escape(base + newsPath(item.slug));
      const published = item.published_at ? '<pubDate>' + new Date(item.published_at).toUTCString() + '</pubDate>' : '';
      return '<item><guid>' + link + '</guid><link>' + link + '</link><title>' + escape(item.title) +
        '</title><description>' + escape(item.summary) + '</description>' + published + '</item>';
    }).join('');
    return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>' +
      '<title>Bangla24 News · আমার খবর</title><link>' + escape(base) + '</link>' +
      '<description>Bangla24 personal news feed</description>' + items + '</channel></rss>', {
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
    });
  } catch {
    return new Response('News feed unavailable', { status: 503 });
  }
}
