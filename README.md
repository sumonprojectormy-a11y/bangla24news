# Bangla24 News

A Bengali newsroom and public news site built with Next.js App Router, TypeScript, Tailwind CSS and Supabase. The masthead uses **দেশের কথা, মানুষের কথা**. The repository root is the Vercel project root.

## 1. Project map

See **SOURCE.md** for the complete file tree, database setup SQL and a file-by-file code listing. The executable source lives at those same paths. The original binary artwork and exact npm lockfile are included.

## 2. Set up Supabase

1. Create a fresh Supabase project. In **SQL Editor**, run **supabase/schema.sql** in its entirety, once. It creates categories, articles, editor membership, view receipts, database functions, RLS policies, seven Bengali categories and the public thumbnail bucket. It expects Supabase's standard Auth and Storage schemas. Enable the Data API with the public schema exposed.
2. In **Authentication**, enable email/password sign-in. For an invitation-only newsroom, disable public sign-ups. Create a confirmed email/password user using **Authentication → Users**. There is no default editor password.
3. In SQL Editor run the query below, substituting the editor's actual email. Check that it returns a UUID. An ordinary Auth account has no editorial rights.

```sql
insert into portal_private.admins(user_id)
select id from auth.users where lower(email) = lower('editor@example.com')
on conflict (user_id) do update set user_id = excluded.user_id
returning user_id;
```

4. Optionally run **supabase/demo.sql** in a preview project to publish seven clearly labelled sample stories. Skip this step to start with an empty newsroom. To revoke an editor's access, delete that user's row from portal_private.admins.

## 3. Run locally

Use Node.js 24 with npm. From the repository root:

```sh
cp .env.example .env.local
npm ci
```

Fill in the four variables in .env.local before starting the site.

| Variable | Value |
| --- | --- |
| SUPABASE_URL | HTTPS project URL, without a trailing slash |
| SUPABASE_PUBLISHABLE_KEY | Project publishable key or legacy anon key |
| SUPABASE_SERVICE_ROLE_KEY | Server-only service-role JWT for the view-count function. Keep this secret out of Git and client code. |
| SITE_URL | Public origin used for canonical URLs and Facebook thumbnails. Use http://localhost:3000 locally. |

```sh
npm run dev
```

Visit / for the public site or /admin for the newsroom. For a production-mode check:

```sh
npm run typecheck
npm run build
npm start
```

## 4. Publish an article

Sign in at /admin/login. Open **সংবাদ → নতুন সংবাদ**, enter the headline, select a category, fill in reporter, summary and article body. The editor generates a Bengali slug from the title and allows an override. Slugs must be unique. The body supports headings, bold, italic, quotes and bullet lists with a preview. A JPEG, PNG or WebP upload may be up to 2 MiB. Public Storage URLs can be shared as soon as an image is uploaded, including images belonging to drafts.

Check **প্রকাশ করুন** to publish. Check **প্রধান সংবাদ** to select a lead candidate or **ব্রেকিং নিউজ** to add the article to the ticker. The newest featured article leads the homepage. Drafts stay out of public lists and article URLs. The ticker polls every 30 seconds. Live search matches headline text. Most read uses counted article views, deduplicated by article, Dhaka calendar day and a hashed browser/network signature. These counts are approximate. Editors sign in again when their Supabase access token expires.

## 5. Deploy on Vercel

1. Extract the ZIP. Push the folder containing package.json, package-lock.json and the app directory to your GitHub repository. The supplied .gitignore excludes .env.local, build output and dependencies.
2. Import the repository in Vercel, choose the Next.js preset and Node.js 24.x, and point the root at the folder containing package.json. Use **npm ci** for installation and **npm run build** for the build command. Leave the output directory on its framework default.
3. Set all four variables in Vercel before building. Use the final HTTPS domain for SITE_URL. Set preview variables separately if preview posts should use a different domain or database. Redeploy after changing the Supabase host because the allowed image host is part of the build configuration.
4. Open /admin on the deployed HTTPS domain. Publish a test article with a Bengali slug and image. Open it signed out, verify its image and Facebook share URL, and test live search. Check that a draft gives a 404 when signed out. Revisit the dashboard after opening a published article to check the view counter.
5. If a dashboard login fails, check email confirmation and the allowlist entry. If thumbnails fail, check the project host, Storage policies and news-thumbnails bucket. If canonical links point at an old deployment, correct SITE_URL and redeploy.

## Verification scope

The included source passed a local optimized Next.js build with TypeScript and zero-warning ESLint. The production server was smoke-tested using HTTP fixtures for Supabase. Those checks included public routes, a percent-encoded Bengali article URL, missing stories, search, the breaking endpoint, social metadata, anonymous and non-editor access, and editor dashboard pages. Live database policies, real sign-in, uploads and deployment require your own Supabase and Vercel projects.

### Reader edition

The homepage serves the responsive reader edition in `public/reader`. Production articles load from Supabase through `/api/news` and open at their existing `/news/[slug]` URLs. The original server-rendered listings are available at `/archive`. Sample stories and photos are labeled in the reader edition.

Run `supabase/reader-tips.sql` in the production Supabase SQL Editor to enable the reader-tip and correction forms. The API uses the existing server-only `SUPABASE_SERVICE_ROLE_KEY`. Editors can review submissions under `/admin/tips`.

Run `supabase/reader-details.sql` to enable district, country, translations of headlines and summaries, and notice fields in the existing news editor. District and country tags also power My News and its RSS feed.

## Reader guides and the sitemap

Publish reader guides as HTML in `public/blog/` with a single self-referencing
canonical URL under `https://www.bangla24.news/blog/`. Keep drafts outside
`public/`; use a robots noindex directive for public previews that should stay
out of search. The standard `npm run build` command discovers published guides
automatically. No sitemap list needs a separate edit.
