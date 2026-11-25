import { photo } from '@/lib/backend';
import { readerDetails } from '@/lib/reader-details';
import { newsPath } from '@/lib/format';
import { stories, breaking, category } from '@/lib/news';

const sections: Record<string, string> = {
  international: 'world',
  economy: 'business',
  technology: 'tech',
  lifestyle: 'life',
  districts: 'district'
};

async function liveCoverage() {
  const desk = await category('live');
  if (!desk) return [];
  const posts = await stories({ published: 'eq.true', category_id: 'eq.' + desk.id }, 100);
  const dates = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Dhaka' });
  const today = dates.format(new Date());
  const days = new Map<string, { time: string; title: string; text: string; path: string }[]>();
  for (const post of posts) {
    if (!post.published_at) continue;
    const day = dates.format(new Date(post.published_at));
    const updates = days.get(day) ?? [];
    updates.push({ time: post.published_at, title: post.title, text: post.summary, path: newsPath(post.slug) });
    days.set(day, updates);
  }
  return Array.from(days, ([id, updates]) => ({
    id, status: id === today ? 'live' : 'ended', title: updates[0].title, updates
  }));
}

export async function GET() {
  try {
    const published = { published: 'eq.true' };
    const [latest, lead, alerts, coverage] = await Promise.all([
      stories(published, 100),
      stories({ ...published, featured: 'eq.true' }, 1),
      breaking(),
      liveCoverage()
    ]);
    const items = new Map([...latest, ...lead, ...alerts].map(item => [item.id, item]));
    const details = items.size ? await readerDetails({ published: 'eq.true', id: 'in.(' + [...items.keys()].join(',') + ')' }) : [];
    const byId = new Map(details?.map(item => [item.id, item.reader_details]));
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Dhaka' }).format(new Date());
    return Response.json({
      articles: Array.from(items.values(), item => ({
        ...byId.get(item.id),
        id: item.id,
        section: sections[item.categories.slug] ?? item.categories.slug,
        bn: item.title,
        descBn: item.summary,
        byline: item.reporter,
        publishedAt: item.published_at,
        photoUrl: item.thumbnail ? photo(item.thumbnail) : null,
        path: newsPath(item.slug)
      })),
      lead: lead[0]?.id ?? latest[0]?.id ?? null,
      breaking: alerts.map(item => item.id),
      live: coverage[0]?.id === today ? coverage[0] : { updates: [] },
      liveArchive: coverage.filter(day => day.id !== today),
      briefings: latest.length >= 5 ? { [today]: latest.slice(0, 5).map(item => item.id) } : {}
    });
  } catch {
    return Response.json({ error: 'News feed unavailable' }, { status: 503 });
  }
}
