import { photo } from '@/lib/backend';
import { readerDetails } from '@/lib/reader-details';
import { newsPath } from '@/lib/format';
import { stories, breaking } from '@/lib/news';

const sections: Record<string, string> = {
  international: 'world',
  economy: 'business',
  technology: 'tech',
  lifestyle: 'life',
  districts: 'district'
};

export async function GET() {
  try {
    const published = { published: 'eq.true' };
    const [latest, lead, alerts] = await Promise.all([
      stories(published, 100),
      stories({ ...published, featured: 'eq.true' }, 1),
      breaking()
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
      live: { updates: [] },
      liveArchive: [],
      briefings: latest.length >= 5 ? { [today]: latest.slice(0, 5).map(item => item.id) } : {}
    });
  } catch {
    return Response.json({ error: 'News feed unavailable' }, { status: 503 });
  }
}
