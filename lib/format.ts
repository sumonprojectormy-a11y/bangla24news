export const bn = (n: number) => new Intl.NumberFormat('bn-BD').format(n);
export function date(value: string, time = false) {
  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'long',
    ...(time ? {
      timeStyle: 'short' as const
    } : {}),
    timeZone: 'Asia/Dhaka'
  }).format(new Date(value));
}
export function slugify(value: string) {
  return value.normalize('NFC').toLowerCase().trim().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 180).replace(/-+$/, '');
}
export const newsPath = (slug: string) => '/news/' + encodeURIComponent(slug);
export const categoryPath = (slug: string) => '/category/' + encodeURIComponent(slug);
