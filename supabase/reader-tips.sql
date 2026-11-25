begin;
create table if not exists public.reader_tips (
  id uuid primary key default gen_random_uuid(),
  district text not null check (length(district) between 1 and 80),
  upazila text not null default '' check (length(upazila) <= 80),
  headline text not null check (length(headline) between 5 and 160),
  details text not null check (length(details) between 5 and 4000),
  contact text not null default '' check (length(contact) <= 160),
  photo text not null default '' check (length(photo) <= 546200),
  created_at timestamptz not null default now(),
  reviewed boolean not null default false
);
alter table public.reader_tips enable row level security;
revoke all on public.reader_tips from public, anon, authenticated;
grant insert on public.reader_tips to service_role;
grant select, update (reviewed) on public.reader_tips to authenticated;
drop policy if exists reader_tips_editor_read on public.reader_tips;
create policy reader_tips_editor_read on public.reader_tips for select to authenticated using ((select public.is_portal_admin()));
drop policy if exists reader_tips_editor_update on public.reader_tips;
create policy reader_tips_editor_update on public.reader_tips for update to authenticated using ((select public.is_portal_admin())) with check ((select public.is_portal_admin()));
commit;
