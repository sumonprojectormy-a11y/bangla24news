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
