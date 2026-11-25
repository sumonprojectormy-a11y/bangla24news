import { notFound } from 'next/navigation';
import Link from 'next/link';
import { admin } from '@/lib/auth';
import { photo } from '@/lib/backend';
import { readerDetails, readerFields } from '@/lib/reader-details';
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
  const [cats, s, details] = await Promise.all([
    categories(),
    id === 'new' ? undefined : editArticle(id, token),
    readerDetails(id === 'new' ? { limit: '0' } : { id: 'eq.' + id }, token)
  ]);
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
      {details && <details>
        <summary>পাঠক সংস্করণের তথ্য</summary>
        <input type="hidden" name="reader_details" value="1" />
        {readerFields.map(([key, label, maxLength]) => <label key={key}>{label}
          <input name={key} maxLength={maxLength} defaultValue={details[0]?.reader_details[key]} />
        </label>)}
      </details>}
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
