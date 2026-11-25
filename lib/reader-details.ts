import { BackendError, rows } from './backend';

export const readerFields = [
  ['district', 'জেলার স্লাগ', 80],
  ['upazila', 'উপজেলা', 80],
  ['country', 'দেশের ইংরেজি নাম', 80],
  ['location', 'স্থান', 100],
  ['noticeDeadline', 'বিজ্ঞপ্তির শেষ তারিখ (YYYY-MM-DD)', 10],
  ['sourceUrl', 'মূল সূত্রের URL', 1500],
  ['en', 'ইংরেজি শিরোনাম', 240],
  ['descEn', 'ইংরেজি সারসংক্ষেপ', 800]
] as const;

type ReaderDetails = Partial<Record<(typeof readerFields)[number][0], string>>;

export async function readerDetails(filters: Record<string, string>, token?: string) {
  try {
    return await rows<{ id: string; reader_details: ReaderDetails }>('news', {
      ...filters,
      select: 'id,reader_details'
    }, token);
  } catch (error) {
    if (error instanceof BackendError && ['42703', 'PGRST204'].includes(error.code)) return null;
    throw error;
  }
}
