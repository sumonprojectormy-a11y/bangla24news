# Bangla24 News project reference

## 1. Complete project tree

```text
bangla24-news/
├── app/
│   ├── (public)/
│   │   ├── category/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── news/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── admin/
│   │   ├── (desk)/
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   ├── news/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── actions.ts
│   ├── api/
│   │   ├── breaking/
│   │   │   └── route.ts
│   │   ├── search/
│   │   │   └── route.ts
│   │   └── views/
│   │       └── [id]/
│   │           └── route.ts
│   ├── error.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
├── components/
│   ├── ArticleText.tsx
│   ├── ArticleTools.tsx
│   ├── Forms.tsx
│   ├── Search.tsx
│   ├── Stories.tsx
│   └── Ticker.tsx
├── lib/
│   ├── auth.ts
│   ├── backend.ts
│   ├── format.ts
│   ├── news.ts
│   └── types.ts
├── public/
│   ├── masthead.png
│   └── news-cover.webp
├── supabase/
│   ├── demo.sql
│   └── schema.sql
├── .env.example
├── .gitignore
├── README.md
├── SOURCE.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## 2. Supabase database and Storage setup

Run the complete block below in SQL Editor on a fresh Supabase project. Follow README.md to grant the first editor access.

```sql
-- Run once in a new Supabase project as postgres. All changes are transactional.
begin;
create schema if not exists portal_private;
revoke all on schema portal_private from public, anon, authenticated;
create table portal_private.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create function public.is_portal_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from portal_private.admins where user_id=(select auth.uid()))
$$;
revoke all on function public.is_portal_admin() from public, anon;
grant execute on function public.is_portal_admin() to authenticated;

create table public.categories (
 id uuid primary key default gen_random_uuid(), name text unique not null check(length(trim(name)) between 1 and 100),
 slug text unique not null check(length(slug) between 1 and 180 and slug !~ '[/?#%[:space:]]'), revision integer not null default 1
);
create table public.news (
 id uuid primary key default gen_random_uuid(), title text not null check(length(trim(title)) between 1 and 240),
 slug text unique not null check(length(slug) between 1 and 180 and slug !~ '[/?#%[:space:]]'),
 category_id uuid not null references public.categories(id) on delete restrict,
 summary text not null check(length(trim(summary)) between 1 and 800), content text not null check(length(trim(content)) between 1 and 100000),
 reporter text not null check(length(trim(reporter)) between 1 and 120),
 thumbnail text check(thumbnail ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$'),
 breaking boolean not null default false, featured boolean not null default false, published boolean not null default false,
 published_at timestamptz, updated_at timestamptz not null default now(), revision integer not null default 1,
 views bigint not null default 0 check(views>=0)
);
create index news_latest on public.news(published_at desc,id) where published;
create index news_category on public.news(category_id,published_at desc,id) where published;
create index news_most_read on public.news(views desc,published_at desc) where published;
create function portal_private.stamp_news() returns trigger language plpgsql set search_path='' as $$
begin
 if new.published and new.published_at is null then new.published_at=now(); end if;
 new.updated_at=now();
 if tg_op='UPDATE' then new.revision=old.revision+1; end if;
 return new;
end $$;
create trigger news_stamp before insert or update of title,slug,category_id,summary,content,reporter,thumbnail,breaking,featured,published on public.news for each row execute function portal_private.stamp_news();
create function portal_private.stamp_category() returns trigger language plpgsql set search_path='' as $$
begin new.revision=old.revision+1; return new; end $$;
create trigger category_stamp before update on public.categories for each row execute function portal_private.stamp_category();
alter table public.categories enable row level security;
alter table public.news enable row level security;
revoke all on public.categories,public.news from public,anon,authenticated;
grant select on public.categories,public.news to anon,authenticated;
grant insert(name,slug),update(name,slug),delete on public.categories to authenticated;
grant insert(title,slug,category_id,summary,content,reporter,thumbnail,breaking,featured,published),
 update(title,slug,category_id,summary,content,reporter,thumbnail,breaking,featured,published),delete on public.news to authenticated;
create policy categories_read on public.categories for select using(true);
create policy news_read on public.news for select using(published);
create policy categories_admin on public.categories for all to authenticated using((select public.is_portal_admin())) with check((select public.is_portal_admin()));
create policy news_admin on public.news for all to authenticated using((select public.is_portal_admin())) with check((select public.is_portal_admin()));
insert into public.categories(name,slug) values ('জাতীয়','national'),('রাজনীতি','politics'),('আন্তর্জাতিক','international'),('খেলাধুলা','sports'),('বিনোদন','entertainment'),('প্রযুক্তি','technology'),('অর্থনীতি','economy');
create table portal_private.view_receipts (
 article uuid references public.news(id) on delete cascade, day date, visitor text, primary key(article,day,visitor)
);
create index receipt_day on portal_private.view_receipts(day);
create function public.record_news_view(article_id uuid, visitor_hash text) returns void language plpgsql security definer set search_path='' as $$
declare today date=(now() at time zone 'Asia/Dhaka')::date;
begin
 if visitor_hash !~ '^[0-9a-f]{64}$' or visitor_hash is null then return; end if;
 if not exists(select 1 from public.news where id=article_id and published for key share) then return; end if;
 insert into portal_private.view_receipts values(article_id,today,visitor_hash) on conflict do nothing;
 if found then update public.news set views=views+1 where id=article_id; end if;
 if random()<0.01 then delete from portal_private.view_receipts where day<today-2; end if;
end $$;
revoke all on function public.record_news_view(uuid,text) from public,anon,authenticated;
grant execute on function public.record_news_view(uuid,text) to service_role;
create function public.portal_stats() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('news',count(*),'views',coalesce(sum(views),0),'categories',(select count(*) from public.categories))
 from public.news where (select public.is_portal_admin())
$$;
revoke all on function public.portal_stats() from public,anon;
grant execute on function public.portal_stats() to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('news-thumbnails','news-thumbnails',true,2097152,array['image/jpeg','image/png','image/webp']);
create policy thumbnail_upload on storage.objects for insert to authenticated with check(bucket_id='news-thumbnails' and (select public.is_portal_admin()));
create policy thumbnail_admin_read on storage.objects for select to authenticated using(bucket_id='news-thumbnails' and (select public.is_portal_admin()));
create policy thumbnail_admin_delete on storage.objects for delete to authenticated using(bucket_id='news-thumbnails' and (select public.is_portal_admin()));
commit;
```

## 3. Complete implementation

Each heading is a path relative to the repository root. Use the supplied package-lock.json for reproducible installs and the included image files at their listed paths.

### .env.example

```text
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SITE_URL=
```

### .gitignore

```text
node_modules
.next
.env*
!.env.example
.vercel
*.tsbuildinfo
```

### eslint.config.mjs

```js
import { defineConfig, globalIgnores } from 'eslint/config'
import next from 'eslint-config-next/core-web-vitals'
import ts from 'eslint-config-next/typescript'
export default defineConfig([...next,...ts,globalIgnores(['.next/**','next-env.d.ts'])])
```

### next-env.d.ts

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";
import "./.next/types/root-params.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

### next.config.mjs

```js
const host = process.env.SUPABASE_URL && new URL(process.env.SUPABASE_URL)
const config = {
  images: { remotePatterns: host ? [{protocol:'https',hostname:host.hostname,port:host.port,pathname:'/storage/v1/object/public/news-thumbnails/**'}] : [] },
  experimental: { serverActions: { bodySizeLimit: '3mb' } }
}

export default config
```

### package.json

```json
{
  "name": "bangla24-news-portal",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=22.13.0 <25"
  },
  "scripts": {
    "dev": "next dev",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "next typegen && tsc --noEmit",
    "build": "npm run lint && next build --webpack",
    "start": "next start"
  },
  "dependencies": {
    "next": "16.3.4",
    "react": "19.2.6",
    "react-dom": "19.2.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.2.1",
    "@types/node": "22.19.19",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "eslint": "9.39.4",
    "eslint-config-next": "16.3.4",
    "postcss": "8.5.23",
    "tailwindcss": "4.2.1",
    "typescript": "5.9.3"
  }
}
```

### postcss.config.mjs

```js
const config = { plugins: { '@tailwindcss/postcss': {} } }

export default config
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowJs": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### lib/auth.ts

```typescript
import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { BackendError, request } from './backend';
export const sessionCookie = 'portal_access';
export async function allowed(token: string) {
  try {
    await request('/auth/v1/user', {}, token);
    return (await (await request('/rest/v1/rpc/is_portal_admin', {
      method: 'POST',
      body: '{}'
    }, token)).json()) === true;
  } catch (error) {
    if (error instanceof BackendError && [401, 403].includes(error.status)) return false;
    throw error;
  }
}
export const admin = cache(async () => {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !(await allowed(token))) redirect('/admin/login');
  return token;
});
```

### lib/backend.ts

```typescript
import 'server-only';
export function env(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error('Missing configuration: ' + name);
  return value;
}
export function siteURL() {
  return new URL(process.env.SITE_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000')).origin;
}
export function photo(path: string | null) {
  return path ? env('SUPABASE_URL') + '/storage/v1/object/public/news-thumbnails/' + path : '/news-cover.webp';
}
export class BackendError extends Error {
  constructor(public status: number, public code: string) {
    super('Supabase request failed: ' + status + ' ' + code);
  }
}
export async function request(path: string, init: RequestInit = {}, token?: string, key = env('SUPABASE_PUBLISHABLE_KEY')) {
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  if (token) headers.set('Authorization', 'Bearer ' + token);else if (key.startsWith('eyJ')) headers.set('Authorization', 'Bearer ' + key);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(env('SUPABASE_URL').replace(/\/$/, '') + path, {
    ...init,
    headers,
    cache: 'no-store'
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new BackendError(response.status, String(error.code || error.error_code || 'request_failed'));
  }
  return response;
}
export function query(path: string, params: Record<string, string>) {
  return '/rest/v1/' + path + '?' + new URLSearchParams(params);
}
export async function rows<T>(path: string, params: Record<string, string>, token?: string): Promise<T[]> {
  return (await request(query(path, params), {}, token)).json();
}
```

### lib/format.ts

```typescript
export const bn = (n: number) => new Intl.NumberFormat('bn-BD').format(n);
export function date(value: string, time = false) {
  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'long',
    ...(time ? {
      timeStyle: 'short' as const
    } : {}),
    timeZone: 'Asia/Dhaka'
  }).format(new Date(value));
}
export function slugify(value: string) {
  return value.normalize('NFC').toLowerCase().trim().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 180).replace(/-+$/, '');
}
export const newsPath = (slug: string) => '/news/' + encodeURIComponent(slug);
export const categoryPath = (slug: string) => '/category/' + encodeURIComponent(slug);
```

### lib/news.ts

```typescript
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
  breaking: 'eq.true'
}, 8);
export const pageNumber = (v: string | undefined) => Math.min(100000, Math.max(1, Math.floor(Number(v) || 1)));
export function search(term: string, limit: number, offset: number) {
  // A single column filter avoids injecting PostgREST boolean expressions.
  const literal = term.replace(/[\\%_*]/g, ' ').trim();
  return literal ? stories({
    title: 'ilike.%' + literal + '%'
  }, limit, offset) : Promise.resolve([]);
}
```

### lib/types.ts

```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  revision: number;
}
export interface Story {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  categories: Category;
  summary: string;
  reporter: string;
  thumbnail: string | null;
  published_at: string | null;
  updated_at: string;
  breaking: boolean;
  featured: boolean;
  published: boolean;
  revision: number;
  views: number;
}
export interface Article extends Story {
  content: string;
}
export type FormAction = (previous: string, fields: FormData) => Promise<string>;
```

### components/ArticleText.tsx

```tsx
// The supported Markdown subset is rendered entirely as React text nodes.
export default function ArticleText({
  text
}: {
  text: string;
}) {
  function inline(line: string) {
    return line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((s, i) => s.startsWith('**') && s.endsWith('**') ? <strong key={i}>
    {s.slice(2, -2)}
  </strong> : s.startsWith('*') && s.endsWith('*') ? <em key={i}>
    {s.slice(1, -1)}
  </em> : s);
  }
  return <div className="prose">
    {text.trim().split(/\n\s*\n/).map((block, i) => {
      const lines = block.split('\n');
      if (lines.every(l => l.startsWith('- '))) return <ul key={i}>
      {lines.map((l, j) => <li key={j}>
        {inline(l.slice(2))}
      </li>)}
    </ul>;
      if (block.startsWith('### ')) return <h3 key={i}>
      {inline(block.slice(4))}
    </h3>;
      if (block.startsWith('## ')) return <h2 key={i}>
      {inline(block.slice(3))}
    </h2>;
      if (block.startsWith('> ')) return <blockquote key={i}>
      {inline(block.slice(2))}
    </blockquote>;
      return <p className="whitespace-pre-line" key={i}>
      {inline(block)}
    </p>;
    })}
  </div>;
}
```

### components/ArticleTools.tsx

```tsx
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
```

### components/Forms.tsx

```tsx
'use client';

import { useActionState, useState } from 'react';
import { slugify } from '@/lib/format';
import type { FormAction } from '@/lib/types';
import ArticleText from './ArticleText';
export function Form({
  action,
  children,
  button
}: {
  action: FormAction;
  children: React.ReactNode;
  button: string;
}) {
  const [error, submit, pending] = useActionState(action, '');
  return <form action={submit} className="form flow">
    <fieldset disabled={pending} className="flow">
      {children}
      <button type="submit">
        {pending ? 'অপেক্ষা করুন…' : button}
      </button>
    </fieldset>
    <p role="alert" className="error">
      {error}
    </p>
  </form>;
}
export function Titles({
  title = '',
  slug = '',
  category = false
}: {
  title?: string;
  slug?: string;
  category?: boolean;
}) {
  const [name, setName] = useState(title),
    [path, setPath] = useState(slug),
    [manual, setManual] = useState(Boolean(slug));
  return <>
    <label>
      {category ? 'বিভাগের নাম' : 'শিরোনাম'}
      <input required name={category ? 'name' : 'title'} maxLength={category ? 100 : 240} value={name} onChange={e => {
        setName(e.target.value);
        if (!manual) setPath(slugify(e.target.value));
      }} />
    </label>
    <label>স্লাগ<input name="slug" maxLength={180} value={path} onChange={e => {
        setPath(e.target.value);
        setManual(Boolean(e.target.value));
      }} />
    </label>
  </>;
}
export function Editor({
  initial
}: {
  initial: string;
}) {
  const [text, set] = useState(initial);
  return <>
    <label>প্রতিবেদন<textarea name="content" required maxLength={100000} rows={14} value={text} onChange={e => set(e.target.value)} />
    </label>
    <p className="by">অনুচ্ছেদের মাঝে ফাঁকা লাইন দিন। উপশিরোনামে ##, তালিকায় -, উদ্ধৃতিতে &gt;, গাঢ় লেখায় **শব্দ** এবং বাঁকা লেখায় *শব্দ* ব্যবহার করুন।</p>
    <details>
      <summary>লেখার পূর্বরূপ</summary>
      <ArticleText text={text} />
    </details>
  </>;
}
export function DeleteForm({
  action
}: {
  action: FormAction;
}) {
  return <details className="my-4">
    <summary className="cursor-pointer">মুছে ফেলুন</summary>
    <Form action={action} button="স্থায়ীভাবে মুছুন">
      <label>
        <span>
          <input required name="confirm" type="checkbox" /> হ্যাঁ, মুছে ফেলতে চাই</span>
      </label>
    </Form>
  </details>;
}
```

### components/Search.tsx

```tsx
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
```

### components/Stories.tsx

```tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/lib/types';
import { photo } from '@/lib/backend';
import { categoryPath, newsPath, bn } from '@/lib/format';
export function Cover({
  s,
  priority = false
}: {
  s: Story;
  priority?: boolean;
}) {
  return <Image className="storyimg" src={photo(s.thumbnail)} width={960} height={540} alt={s.title} sizes="(max-width:700px) 100vw, (max-width:1100px) 50vw, 640px" priority={priority} />;
}
export function Card({
  s
}: {
  s: Story;
}) {
  return <article className="card">
    <Link href={newsPath(s.slug)}>
      <Cover s={s} />
    </Link>
    <Link className="kicker" href={categoryPath(s.categories.slug)}>
      {s.categories.name}
    </Link>
    <h3>
      <Link href={newsPath(s.slug)}>
        {s.title}
      </Link>
    </h3>
  </article>;
}
export function Grid({
  items
}: {
  items: Story[];
}) {
  return items.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {items.map(s => <Card key={s.id} s={s} />)}
  </div> : <p className="by py-4">এই মুহূর্তে কোনো সংবাদ পাওয়া যায়নি।</p>;
}
export function Pager({
  page,
  more,
  base
}: {
  page: number;
  more: boolean;
  base: string;
}) {
  const link = (p: number) => base + (base.includes('?') ? '&' : '?') + 'page=' + p;
  return <nav aria-label="পাতা" className="my-6 flex gap-4">
    {page > 1 && <Link href={link(page - 1)}>আগের পাতা</Link>}
    <span>পৃষ্ঠা {bn(page)}
    </span>
    {more && <Link href={link(page + 1)}>পরের পাতা</Link>}
  </nav>;
}
```

### components/Ticker.tsx

```tsx
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
```

### app/(public)/category/[slug]/page.tsx

```tsx
import { notFound } from 'next/navigation';
import { category, stories, pageNumber } from '@/lib/news';
import { categoryPath } from '@/lib/format';
import { Grid, Pager } from '@/components/Stories';
type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};
export async function generateMetadata({
  params
}: Props) {
  const c = await category((await params).slug);
  return {
    title: c?.name || 'বিভাগ'
  };
}
export default async function Page({
  params,
  searchParams
}: Props) {
  const c = await category((await params).slug);
  if (!c) notFound();
  const p = pageNumber((await searchParams).page);
  const list = await stories({
    category_id: 'eq.' + c.id
  }, 13, (p - 1) * 12);
  return <div className="flow">
    <h1>
      {c.name}
    </h1>
    <Grid items={list.slice(0, 12)} />
    <Pager page={p} more={list.length > 12} base={categoryPath(c.slug)} />
  </div>;
}
```

### app/(public)/layout.tsx

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { categories, breaking } from '@/lib/news';
import { categoryPath } from '@/lib/format';
import Ticker from '@/components/Ticker';
import Search from '@/components/Search';
export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const [cats, alerts] = await Promise.all([categories(), breaking()]);
  const now = new Date();
  const stamp = (locale: string) => new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeZone: 'Asia/Dhaka'
  }).format(now);
  return <>
    <header>
      <div className="wrap by pt-2">
        <time dateTime={now.toISOString()}>
          {stamp('bn-BD')} · <span lang="en">
            {stamp('en-GB')}
          </span>
        </time>
      </div>
      <div className="mast wrap">
        <Link href="/" aria-label="Bangla24 News প্রচ্ছদ">
          <Image src="/masthead.png" alt="Bangla24 News" width={900} height={182} priority />
          <span className="block text-center text-sm">দেশের কথা, মানুষের কথা</span>
        </Link>
        <Search />
      </div>
      <div className="bar">
        <nav className="wrap nav" aria-label="বিভাগ">
          <Link href="/">প্রচ্ছদ</Link>
          {cats.map(c => <Link key={c.id} href={categoryPath(c.slug)}>
            {c.name}
          </Link>)}
        </nav>
      </div>
      <Ticker initial={alerts.map(({
        id,
        title,
        slug
      }) => ({
        id,
        title,
        slug
      }))} />
    </header>
    <main className="wrap py-5">
      {children}
    </main>
    <footer className="foot">
      <div className="wrap flex justify-between gap-4">
        <span>bangla24.news · দেশের কথা, মানুষের কথা</span>
        <Link href="/admin">নিউজরুম</Link>
      </div>
    </footer>
  </>;
}
```

### app/(public)/news/[slug]/page.tsx

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { article, stories } from '@/lib/news';
import { photo, siteURL } from '@/lib/backend';
import { newsPath, categoryPath, date } from '@/lib/format';
import { Grid, Cover } from '@/components/Stories';
import ArticleText from '@/components/ArticleText';
import ArticleTools from '@/components/ArticleTools';
type Props = {
  params: Promise<{
    slug: string;
  }>;
};
export async function generateMetadata({
  params
}: Props): Promise<Metadata> {
  const s = await article((await params).slug);
  if (!s) notFound();
  const url = siteURL() + newsPath(s.slug),
    image = new URL(photo(s.thumbnail), siteURL()).href;
  return {
    title: s.title,
    description: s.summary,
    alternates: {
      canonical: url
    },
    openGraph: {
      type: 'article',
      siteName: 'Bangla24 News',
      locale: 'bn_BD',
      url,
      title: s.title,
      description: s.summary,
      publishedTime: s.published_at || undefined,
      modifiedTime: s.updated_at,
      authors: [s.reporter],
      images: [{
        url: image,
        alt: s.title
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: s.title,
      description: s.summary,
      images: [image]
    }
  };
}
export default async function Page({
  params
}: Props) {
  const s = await article((await params).slug);
  if (!s) notFound();
  const related = await stories({
    category_id: 'eq.' + s.category_id,
    id: 'neq.' + s.id
  }, 3);
  return <>
    <article className="flow mx-auto max-w-3xl">
      <Link className="kicker" href={categoryPath(s.categories.slug)}>
        {s.categories.name}
      </Link>
      <h1>
        {s.title}
      </h1>
      <p className="text-xl">
        {s.summary}
      </p>
      <p className="by">
        {s.reporter} · {s.published_at && date(s.published_at, true)} (ঢাকা)</p>
      <Cover s={s} priority />
      <ArticleTools id={s.id} url={siteURL() + newsPath(s.slug)} title={s.title} />
      <ArticleText text={s.content} />
    </article>
    <section className="section flow">
      <h2>সম্পর্কিত সংবাদ</h2>
      <Grid items={related} />
    </section>
  </>;
}
```

### app/(public)/page.tsx

```tsx
import Link from 'next/link';
import { categories, stories } from '@/lib/news';
import { newsPath, categoryPath, bn } from '@/lib/format';
import { Grid, Cover } from '@/components/Stories';
export default async function Home() {
  const [cats, featured, latest, top] = await Promise.all([categories(), stories({
    featured: 'eq.true'
  }, 1), stories({}, 7), stories({
    order: 'views.desc,published_at.desc,id.asc'
  }, 5)]);
  const lead = featured[0] || latest[0];
  const blocks = await Promise.all(cats.map(async c => ({
    c,
    items: await stories({
      category_id: 'eq.' + c.id
    }, 3)
  })));
  return <>
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <section>
        {lead ? <>
          <Link href={newsPath(lead.slug)}>
            <Cover s={lead} priority />
            <span className="kicker">প্রধান সংবাদ</span>
            <h1>
              {lead.title}
            </h1>
          </Link>
          <p className="mt-3">
            {lead.summary}
          </p>
        </> : <div className="panel">
          <h1>প্রধান সংবাদ</h1>
          <p>প্রথম প্রতিবেদন প্রকাশের অপেক্ষায়।</p>
        </div>}
      </section>
      <aside className="panel">
        <h2>সর্বাধিক পঠিত</h2>
        <ol>
          {top.map((s, i) => <li key={s.id} className="border-b py-3">
            <Link href={newsPath(s.slug)}>
              <b className="kicker mr-3">
                {bn(i + 1)}
              </b>
              {s.title}
            </Link>
          </li>)}
        </ol>
      </aside>
    </div>
    <section className="section flow">
      <h2>শীর্ষ সংবাদ</h2>
      <Grid items={latest.filter(s => s.id !== lead?.id).slice(0, 6)} />
    </section>
    {blocks.filter(b => b.items.length).map(({
      c,
      items
    }) => <section className="section flow" key={c.id}>
      <h2>
        <Link href={categoryPath(c.slug)}>
          {c.name}
        </Link>
      </h2>
      <Grid items={items} />
    </section>)}
  </>;
}
```

### app/(public)/search/page.tsx

```tsx
import { search, pageNumber } from '@/lib/news';
import { Grid, Pager } from '@/components/Stories';
export const metadata = {
  title: 'খবর খুঁজুন',
  robots: {
    index: false,
    follow: true
  }
};
export default async function Page({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}) {
  const args = await searchParams;
  const q = String(args.q || '').trim().slice(0, 100);
  const p = pageNumber(args.page);
  const list = q ? await search(q, 13, (p - 1) * 12) : [];
  return <div className="flow">
    <h1>সংবাদ অনুসন্ধান</h1>
    {q ? <>
      <p>“{q}” এর ফলাফল</p>
      <Grid items={list.slice(0, 12)} />
      <Pager page={p} more={list.length > 12} base={'/search?q=' + encodeURIComponent(q)} />
    </> : <p>ওপরের অনুসন্ধান ঘরে শিরোনামের শব্দ লিখুন।</p>}
  </div>;
}
```

### app/admin/(desk)/categories/page.tsx

```tsx
import { admin } from '@/lib/auth';
import { categories } from '@/lib/news';
import { Form, Titles, DeleteForm } from '@/components/Forms';
import { saveCategory, deleteCategory } from '@/app/admin/actions';
export default async function Categories() {
  await admin();
  const list = await categories();
  return <>
    <h1>বিভাগ পরিচালনা</h1>
    <div className="panel">
      <h2>নতুন বিভাগ</h2>
      <Form action={saveCategory.bind(null, '', '')} button="যোগ করুন">
        <Titles category />
      </Form>
    </div>
    {list.map(c => <details key={c.id} className="panel">
      <summary className="cursor-pointer">
        {c.name}
      </summary>
      <Form action={saveCategory.bind(null, c.id, String(c.revision))} button="পরিবর্তন সংরক্ষণ">
        <Titles title={c.name} slug={c.slug} category />
      </Form>
      <DeleteForm action={deleteCategory.bind(null, c.id, String(c.revision))} />
    </details>)}
  </>;
}
```

### app/admin/(desk)/layout.tsx

```tsx
import Link from 'next/link';
import { admin } from '@/lib/auth';
import { logout } from '../actions';
export const metadata = {
  title: 'নিউজরুম',
  robots: {
    index: false,
    follow: false
  }
};
export default async function Desk({
  children
}: {
  children: React.ReactNode;
}) {
  await admin();
  return <>
    <header className="bar">
      <nav className="wrap nav items-center">
        <Link href="/admin">ড্যাশবোর্ড</Link>
        <Link href="/admin/news">সংবাদ</Link>
        <Link href="/admin/categories">বিভাগ</Link>
        <Link href="/">প্রচ্ছদ</Link>
        <form action={logout}>
          <button>বের হোন</button>
        </form>
      </nav>
    </header>
    <main className="wrap flow py-6">
      {children}
    </main>
  </>;
}
```

### app/admin/(desk)/news/[id]/page.tsx

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { admin } from '@/lib/auth';
import { photo } from '@/lib/backend';
import { categories, editArticle } from '@/lib/news';
import { Form, Titles, Editor, DeleteForm } from '@/components/Forms';
import { saveNews, deleteNews } from '@/app/admin/actions';
export default async function Edit({
  params
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const token = await admin(),
    {
      id
    } = await params;
  if (id !== 'new' && !/^[a-f0-9-]{36}$/i.test(id)) notFound();
  const [cats, s] = await Promise.all([categories(), id === 'new' ? undefined : editArticle(id, token)]);
  if (id !== 'new' && !s) notFound();
  const key = s?.id || '',
    rev = String(s?.revision || '');
  return <section className="panel flow mx-auto max-w-3xl">
    <h1>
      {s ? 'সংবাদ সম্পাদনা' : 'নতুন সংবাদ'}
    </h1>
    {!cats.length ? <Link href="/admin/categories">প্রথমে বিভাগ যোগ করুন</Link> : <Form action={saveNews.bind(null, key, rev)} button="সংরক্ষণ করুন">
      <Titles title={s?.title} slug={s?.slug} />
      <label>বিভাগ<select required name="category_id" defaultValue={s?.category_id || ''}>
          <option value="" disabled>বেছে নিন</option>
          {cats.map(c => <option key={c.id} value={c.id}>
            {c.name}
          </option>)}
        </select>
      </label>
      <label>প্রতিবেদক<input required maxLength={120} name="reporter" defaultValue={s?.reporter} />
      </label>
      <label>সারসংক্ষেপ<textarea required rows={3} maxLength={800} name="summary" defaultValue={s?.summary} />
      </label>
      <Editor initial={s?.content || ''} />
      <label>প্রধান ছবি · JPG, PNG, WebP · সর্বোচ্চ ২ মেগাবাইট<input type="file" name="image" accept="image/jpeg,image/png,image/webp" />
      </label>
      {s?.thumbnail && <div>
        <a className="underline" href={photo(s.thumbnail)} target="_blank" rel="noreferrer">বর্তমান ছবি দেখুন</a>
        <label>
          <span>
            <input type="checkbox" name="remove_image" /> বর্তমান ছবি সরান</span>
        </label>
      </div>}
      <div className="flex flex-wrap gap-4">
        {([['breaking', 'ব্রেকিং নিউজ'], ['featured', 'প্রধান সংবাদ'], ['published', 'প্রকাশ করুন']] as const).map(([k, label]) => <label key={k}>
          <span>
            <input type="checkbox" name={k} defaultChecked={s?.[k]} /> {label}
          </span>
        </label>)}
      </div>
    </Form>}
    {s && <DeleteForm action={deleteNews.bind(null, key, rev)} />}
  </section>;
}
```

### app/admin/(desk)/news/page.tsx

```tsx
import { admin } from '@/lib/auth';
import { stories, pageNumber } from '@/lib/news';
import { Pager } from '@/components/Stories';
import Link from 'next/link';
export default async function News({
  searchParams
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const token = await admin(),
    p = pageNumber((await searchParams).page);
  const list = await stories({
    order: 'updated_at.desc,id.asc'
  }, 26, (p - 1) * 25, token);
  return <>
    <h1>সংবাদ পরিচালনা</h1>
    <Link className="button" href="/admin/news/new">নতুন সংবাদ</Link>
    <ul>
      {list.slice(0, 25).map(s => <li key={s.id} className="rule flex justify-between gap-4 py-2">
        <Link href={'/admin/news/' + s.id}>
          {s.title}
        </Link>
        <span className="by">
          {s.published ? 'প্রকাশিত' : 'খসড়া'}
        </span>
      </li>)}
    </ul>
    <Pager page={p} more={list.length > 25} base="/admin/news" />
  </>;
}
```

### app/admin/(desk)/page.tsx

```tsx
import { admin } from '@/lib/auth';
import { request } from '@/lib/backend';
import { bn } from '@/lib/format';
import Link from 'next/link';
export default async function Dashboard() {
  const token = await admin();
  const stats = await (await request('/rest/v1/rpc/portal_stats', {
    method: 'POST',
    body: '{}'
  }, token)).json();
  return <>
    <h1>নিউজরুম</h1>
    <div className="grid gap-4 sm:grid-cols-3">
      {[['মোট সংবাদ', stats.news], ['মোট পাঠ', stats.views], ['বিভাগ', stats.categories]].map(([label, value]) => <div className="panel" key={label}>
        {label}
        <strong className="block text-3xl">
          {bn(Number(value))}
        </strong>
      </div>)}
    </div>
    <Link className="button" href="/admin/news/new">নতুন সংবাদ লিখুন</Link>
  </>;
}
```

### app/admin/actions.ts

```typescript
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import { admin, allowed, sessionCookie } from '@/lib/auth';
import { BackendError, query, request } from '@/lib/backend';
import { editArticle } from '@/lib/news';
import { slugify } from '@/lib/format';
class InputError extends Error {}
function message(error: unknown) {
  if (error instanceof InputError) return error.message;
  if (error instanceof BackendError) {
    if (error.code === '23505') return 'এই স্লাগ বা নাম ইতিমধ্যে ব্যবহৃত হয়েছে।';
    if (error.code === '23503') return 'বিভাগটি অন্য সংবাদে ব্যবহৃত হচ্ছে, অথবা আর বিদ্যমান নেই।';
    if (error.status === 401 || error.status === 403) return 'অধিবেশন শেষ হয়েছে অথবা অনুমতি নেই। আবার প্রবেশ করুন।';
  }
  return 'কাজটি সম্পন্ন হয়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
}
function value(f: FormData, k: string, max: number) {
  const v = String(f.get(k) || '').trim();
  if (!v || v.length > max) throw new InputError('প্রয়োজনীয় ঘর ও লেখার দৈর্ঘ্য পরীক্ষা করুন।');
  return v;
}
export async function login(_: string, f: FormData) {
  let token: string, expires: number;
  try {
    const r = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({
        email: String(f.get('email') || '').trim(),
        password: String(f.get('password') || '')
      })
    });
    const data = await r.json();
    token = data.access_token;
    expires = data.expires_in;
    if (!(await allowed(token))) return 'এই হিসাবে সম্পাদকীয় প্রবেশাধিকার নেই।';
  } catch {
    return 'প্রবেশ করা যায়নি। ইমেইল, পাসওয়ার্ড ও সংযোগ পরীক্ষা করুন।';
  }
  ;
  (await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expires
  });
  redirect('/admin');
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  try {
    if (token) await request('/auth/v1/logout?scope=local', {
      method: 'POST'
    }, token);
  } catch {} finally {
    jar.delete(sessionCookie);
  }
  redirect('/admin/login');
}
async function upload(file: File, token: string) {
  if (file.size > 2097152) throw new InputError('ছবি সর্বোচ্চ ২ মেগাবাইট হতে পারে।');
  const bytes = Buffer.from(await file.arrayBuffer());
  const format = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) ? ['jpg', 'image/jpeg'] : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? ['png', 'image/png'] : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? ['webp', 'image/webp'] : null;
  if (!format) throw new InputError('JPG, PNG অথবা WebP ছবি বেছে নিন।');
  const name = randomUUID() + '.' + format[0];
  await request('/storage/v1/object/news-thumbnails/' + name, {
    method: 'POST',
    headers: {
      'Content-Type': format[1]
    },
    body: new Uint8Array(bytes)
  }, token);
  return name;
}
async function removeImage(path: string, token: string) {
  // An edit has already committed. A cleanup failure must not turn success into a retry.
  try {
    await request('/storage/v1/object/news-thumbnails/' + path, {
      method: 'DELETE'
    }, token);
  } catch {
    console.warn('Thumbnail cleanup deferred', path);
  }
}
async function mutate(table: string, id: string, revision: string, method: string, data: unknown, token: string) {
  const params: Record<string, string> = {
    select: 'id'
  };
  if (method !== 'POST') {
    if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id) || !/^[1-9][0-9]*$/.test(revision)) {
      throw new InputError('সঠিক রেকর্ড নির্বাচন করে আবার চেষ্টা করুন।');
    }
    params.id = 'eq.' + id;
    params.revision = 'eq.' + revision;
  }
  const result = await request(query(table, params), {
    method,
    headers: {
      Prefer: 'return=representation'
    },
    body: data === undefined ? undefined : JSON.stringify(data)
  }, token);
  if (!(await result.json()).length) throw new InputError('অন্য সম্পাদক পরিবর্তন করেছেন। পাতা রিফ্রেশ করুন।');
}
export async function saveNews(id: string, revision: string, _: string, f: FormData) {
  const token = await admin();
  let uploaded: string | undefined;
  try {
    const title = value(f, 'title', 240),
      slug = slugify(String(f.get('slug') || title));
    if (!slug) throw new InputError('একটি বৈধ স্লাগ দিন।');
    const data = {
      title,
      slug,
      summary: value(f, 'summary', 800),
      content: value(f, 'content', 100000),
      reporter: value(f, 'reporter', 120),
      category_id: value(f, 'category_id', 36),
      breaking: f.has('breaking'),
      featured: f.has('featured'),
      published: f.has('published')
    };
    const current = id ? await editArticle(id, token) : undefined;
    if (id && String(current?.revision) !== revision) throw new InputError('সংবাদটি বদলে গেছে। রিফ্রেশ করুন।');
    const file = f.get('image');
    if (file instanceof File && file.size) uploaded = await upload(file, token);
    const thumbnail = uploaded || (f.has('remove_image') ? null : current?.thumbnail || null);
    await mutate('news', id, revision, id ? 'PATCH' : 'POST', {
      ...data,
      thumbnail
    }, token);
    if (current?.thumbnail && current.thumbnail !== thumbnail) await removeImage(current.thumbnail, token);
  } catch (e) {
    if (uploaded && (e instanceof InputError || e instanceof BackendError && e.status < 500)) await removeImage(uploaded, token);
    return message(e);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/news');
}
export async function deleteNews(id: string, revision: string, _: string, f: FormData) {
  const token = await admin();
  if (!f.has('confirm')) return 'মুছে ফেলার সম্মতি দিন।';
  try {
    const current = await editArticle(id, token);
    await mutate('news', id, revision, 'DELETE', undefined, token);
    if (current?.thumbnail) await removeImage(current.thumbnail, token);
  } catch (e) {
    return message(e);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/news');
}
export async function saveCategory(id: string, revision: string, _: string, f: FormData) {
  const token = await admin();
  try {
    const name = value(f, 'name', 100),
      slug = slugify(String(f.get('slug') || name));
    if (!slug) throw new InputError('বৈধ স্লাগ দিন।');
    await mutate('categories', id, revision, id ? 'PATCH' : 'POST', {
      name,
      slug
    }, token);
  } catch (e) {
    return message(e);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/categories');
}
export async function deleteCategory(id: string, revision: string, _: string, f: FormData) {
  const token = await admin();
  if (!f.has('confirm')) return 'মুছে ফেলার সম্মতি দিন।';
  try {
    await mutate('categories', id, revision, 'DELETE', undefined, token);
  } catch (e) {
    return message(e);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/categories');
}
```

### app/admin/login/page.tsx

```tsx
import { Form } from '@/components/Forms';
import { login } from '../actions';
export const metadata = {
  title: 'সম্পাদক প্রবেশ',
  robots: {
    index: false
  }
};
export default function Login() {
  return <main className="wrap py-12">
    <section className="panel flow mx-auto max-w-md">
      <h1>সম্পাদক প্রবেশ</h1>
      <Form action={login} button="প্রবেশ করুন">
        <label>ইমেইল<input type="email" name="email" required autoComplete="username" />
        </label>
        <label>পাসওয়ার্ড<input type="password" name="password" required autoComplete="current-password" />
        </label>
      </Form>
    </section>
  </main>;
}
```

### app/api/breaking/route.ts

```typescript
import { breaking } from '@/lib/news';
export const dynamic = 'force-dynamic';
export async function GET() {
  return Response.json((await breaking()).map(({
    id,
    title,
    slug
  }) => ({
    id,
    title,
    slug
  })), {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
```

### app/api/search/route.ts

```typescript
import { search } from '@/lib/news';
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim().slice(0, 100) || '';
  return Response.json((await search(q, 6, 0)).map(({
    id,
    title,
    slug
  }) => ({
    id,
    title,
    slug
  })));
}
```

### app/api/views/[id]/route.ts

```typescript
import { createHmac } from 'node:crypto';
import { env, request } from '@/lib/backend';
export async function POST(req: Request, {
  params
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const origin = req.headers.get('origin');
  if (!origin || new URL(req.url).origin !== origin) return new Response(null, {
    status: 403
  });
  const {
    id
  } = await params;
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) return new Response(null, {
    status: 400
  });
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const day = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Dhaka'
  }).format(new Date());
  const ip = req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const hash = createHmac('sha256', key).update([day, ip, req.headers.get('user-agent') || ''].join('|')).digest('hex');
  await request('/rest/v1/rpc/record_news_view', {
    method: 'POST',
    body: JSON.stringify({
      article_id: id,
      visitor_hash: hash
    })
  }, undefined, key);
  return new Response(null, {
    status: 204
  });
}
```

### app/error.tsx

```tsx
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
```

### app/globals.css

```css
@import url("https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap");
@import "tailwindcss";
@theme { --font-sans: 'Hind Siliguri', system-ui, sans-serif; }
:root{color-scheme:light;--ink:#202124;--red:#ab1027;--line:#dedcd6;--paper:#fffefa}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-sans);font-size:17px}a{color:inherit}a:hover{color:var(--red)}:focus-visible{outline:3px solid #155b9c;outline-offset:3px}.wrap{width:min(1180px,calc(100% - 2rem));margin-inline:auto}.mast{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 0}.mast img{width:clamp(180px,25vw,325px);height:auto}.nav{display:flex;overflow-x:auto;gap:1.4rem;white-space:nowrap;padding:.7rem 0;font-weight:600}.rule{border-block:1px solid var(--line)}.bar{background:#202124;color:white}.bar a:hover{color:#fff;text-decoration:underline}.section{border-top:3px solid var(--ink);padding-top:.6rem;margin-top:2rem}.section h2,h1,h2,h3{font-weight:700;line-height:1.3}.section h2,h2{font-size:1.4rem}h1{font-size:clamp(1.9rem,4vw,3.2rem)}.by{color:#645f5c;font-size:.9rem}.kicker{color:var(--red);font-weight:700}.storyimg{width:100%;height:auto;aspect-ratio:16/9;object-fit:cover}.card h3{font-size:1.2rem;margin-block:.3rem}.panel{padding:1.25rem;border:1px solid var(--line);background:white;border-radius:8px}.flow>*+*{margin-top:1rem}.form label{display:grid;gap:.25rem;font-weight:600}input:not([type=checkbox]),textarea,select{border:1px solid #a8a5a1;border-radius:4px;padding:.55rem .7rem;background:white;max-width:100%;width:100%}button,.button{cursor:pointer;font:inherit;display:inline-block;border-radius:4px;background:var(--red);color:white;padding:.5rem .9rem}button:hover,.button:hover{color:white;background:#800b1c}button:disabled{opacity:.65}.quiet{background:#eeeae5;color:var(--ink)}.error{color:#9e1020}.ticker{overflow:hidden;display:flex;align-items:center;gap:.7rem;padding-block:.5rem}.ticker-label{background:var(--red);color:white;padding:.25rem .65rem;white-space:nowrap;font-weight:700}.track{display:flex;width:max-content;gap:2rem;animation:crawl 36s linear infinite}.track a{white-space:nowrap}.ticker:hover .track,.ticker:focus-within .track,.paused{animation-play-state:paused}.ticker-window{overflow:hidden;flex:1}@keyframes crawl{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media(prefers-reduced-motion:reduce){.track{animation:none}.ticker-window{overflow-x:auto}}.prose{font-size:1.18rem;line-height:1.85;overflow-wrap:anywhere}.prose>*+*{margin-top:1rem}.prose ul{padding-left:1.6rem;list-style:disc}.prose blockquote{border-left:3px solid var(--red);padding-left:1rem}.prose h2{font-size:1.55rem}.prose h3{font-size:1.3rem}.foot{margin-top:3rem;padding:1.5rem 0;border-top:1px solid var(--line)}@media(max-width:700px){.mast{flex-wrap:wrap}.mast form{width:100%}.mast img{width:200px}}
```

### app/layout.tsx

```tsx
import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'Bangla24 News | বাংলা সংবাদ',
    template: '%s | Bangla24 News'
  },
  description: 'দেশের কথা, মানুষের কথা।'
};
export const dynamic = 'force-dynamic';
export default function Root({
  children
}: {
  children: React.ReactNode;
}) {
  return <html lang="bn">
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </head>
    <body className="font-sans">
      {children}
    </body>
  </html>;
}
```

### app/not-found.tsx

```tsx
import Link from 'next/link';
export default function Missing() {
  return <main className="wrap flow py-16">
    <h1>পাতাটি পাওয়া যায়নি</h1>
    <Link className="button" href="/">প্রচ্ছদে ফিরুন</Link>
  </main>;
}
```

### supabase/demo.sql

```sql
-- Optional. Run after schema.sql in a development or preview database.
-- The published examples are explicitly labelled as samples.
begin;
insert into public.news(title,slug,category_id,summary,content,reporter,published,featured,breaking)
select 'নমুনা প্রতিবেদন · ' || c.name, 'demo-' || c.slug, c.id,
 'এটি ' || c.name || ' বিভাগের একটি নমুনা প্রতিবেদন।',
 '## পাঠকের জন্য' || chr(10) || chr(10) ||
 'এই লেখাটি দিয়ে সংবাদপাতার বিন্যাস, বাংলা হরফ ও শেয়ার করার সুবিধা পরীক্ষা করা যাবে।' ||
 chr(10) || chr(10) || '**সম্পাদকের নোট**' || chr(10) || chr(10) ||
 'নিজস্ব প্রতিবেদন প্রকাশের আগে এই নমুনাটি সরিয়ে দিন।',
 'নমুনা বার্তা বিভাগ', true, c.slug='national', c.slug='national'
from public.categories c
where c.slug in ('national','politics','international','sports','entertainment','technology','economy')
on conflict(slug) do nothing;
commit;
```
