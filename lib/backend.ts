import 'server-only';
export function env(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error('Missing configuration: ' + name);
  return value;
}
export function siteURL() {
  return new URL(process.env.SITE_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000')).origin;
}
export function photo(path: string | null) {
  return path ? env('SUPABASE_URL') + '/storage/v1/object/public/news-thumbnails/' + path : '/news-cover.webp';
}
export class BackendError extends Error {
  constructor(public status: number, public code: string) {
    super('Supabase request failed: ' + status + ' ' + code);
  }
}
export async function request(path: string, init: RequestInit = {}, token?: string, key = env('SUPABASE_PUBLISHABLE_KEY')) {
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  if (token) headers.set('Authorization', 'Bearer ' + token);else if (key.startsWith('eyJ')) headers.set('Authorization', 'Bearer ' + key);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(env('SUPABASE_URL').replace(/\/$/, '') + path, {
    ...init,
    headers,
    cache: 'no-store'
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new BackendError(response.status, String(error.code || error.error_code || 'request_failed'));
  }
  return response;
}
export function query(path: string, params: Record<string, string>) {
  return '/rest/v1/' + path + '?' + new URLSearchParams(params);
}
export async function rows<T>(path: string, params: Record<string, string>, token?: string): Promise<T[]> {
  return (await request(query(path, params), {}, token)).json();
}
