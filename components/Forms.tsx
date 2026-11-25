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
