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
