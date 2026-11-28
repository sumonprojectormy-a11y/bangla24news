import type { MetadataRoute } from 'next';
import { rows } from '@/lib/backend';
import { categoryPath, newsPath } from '@/lib/format';
import { readerGuidePaths } from '@/lib/reader-guides.generated';

// Cache the completed sitemap while the shared backend client reads fresh rows.
export const dynamic = 'force-static';
export const revalidate = 1800;

const origin = 'https://www.bangla24.news';
const staticPaths = ['/', '/about', '/contact', '/privacy-policy'];

type SitemapRow = { id: string; slug: string; updated_at?: string };

async function sitemapEntries(table: 'news' | 'categories'): Promise<MetadataRoute.Sitemap> {
  const params: Record<string, string> = { select: 'id,slug', order: 'id.asc', limit: '1000' };
  const path = table === 'news' ? newsPath : categoryPath;
  if (table === 'news') {
    params.select += ',updated_at';
    params.published = 'eq.true';
  }

  const entries: MetadataRoute.Sitemap = [];
  while (true) {
    const page = await rows<SitemapRow>(table, params);
    if (page.length === 0) return entries;
    for (const row of page) {
      // The legacy demo articles are published rows, but are not editorial stories.
      if (table === 'news' && row.slug.startsWith('demo-')) continue;
      entries.push({ url: origin + path(row.slug), lastModified: row.updated_at });
    }
    // The server can return fewer rows than the requested limit.
    params.id = 'gt.' + page[page.length - 1].id;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([sitemapEntries('news'), sitemapEntries('categories')]);
  return [...[...staticPaths, ...readerGuidePaths].map(path => ({ url: origin + path })), ...posts, ...categories];
}
