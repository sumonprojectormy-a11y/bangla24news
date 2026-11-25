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
