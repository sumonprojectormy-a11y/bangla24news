begin;
alter table public.news add column if not exists reader_details jsonb not null default '{}'::jsonb
  check (jsonb_typeof(reader_details) = 'object' and pg_column_size(reader_details) <= 8192);
grant insert(reader_details), update(reader_details) on public.news to authenticated;
drop trigger news_stamp on public.news;
create trigger news_stamp before insert or update of title,slug,category_id,summary,content,reporter,thumbnail,breaking,featured,published,reader_details
  on public.news for each row execute function portal_private.stamp_news();
commit;
