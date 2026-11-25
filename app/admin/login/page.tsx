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
