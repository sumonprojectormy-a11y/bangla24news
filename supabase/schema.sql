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
