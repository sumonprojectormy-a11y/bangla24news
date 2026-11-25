import { cache } from 'react';
import { rows } from './backend';
import type { Category, Story, Article } from './types';
const columns = 'id,title,slug,summary,category_id,reporter,thumbnail,published_at,updated_at,breaking,featured,published,revision,views,categories(id,name,slug,revision)';
export const categories = cache(async () => rows<Category>('categories', {
  select: '*',
  order: 'name.asc'
}));
export async function stories(filters: Record<string, string> = {}, limit = 12, offset = 0, token?: string) {
  return rows<Story>('news', {
    select: columns,
    order: 'published_at.desc.nullslast,id.asc',
    limit: String(limit),
    offset: String(offset),
    ...filters
  }, token);
}
function routeSlug(value: string) {
  // Dynamic route segments can arrive percent-encoded in a production build.
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}
export const article = cache(async (slug: string) => (await rows<Article>('news', {
  select: columns + ',content',
  slug: 'eq.' + routeSlug(slug),
  limit: '1'
}))[0]);
export async function editArticle(id: string, token: string) {
  return (await rows<Article>('news', {
    select: columns + ',content',
    id: 'eq.' + id,
    limit: '1'
  }, token))[0];
}
export const category = cache(async (slug: string) => (await rows<Category>('categories', {
  select: '*',
  slug: 'eq.' + routeSlug(slug),
  limit: '1'
}))[0]);
export const breaking = () => stories({
  breaking: 'eq.true',
  published: 'eq.true'
}, 8);
export const pageNumber = (v: string | undefined) => Math.min(100000, Math.max(1, Math.floor(Number(v) || 1)));
export function search(term: string, limit: number, offset: number) {
  // A single column filter avoids injecting PostgREST boolean expressions.
  const literal = term.replace(/[\\%_*]/g, ' ').trim();
  return literal ? stories({
    title: 'ilike.%' + literal + '%'
  }, limit, offset) : Promise.resolve([]);
}
