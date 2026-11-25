export interface Category {
  id: string;
  name: string;
  slug: string;
  revision: number;
}
export interface Story {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  categories: Category;
  summary: string;
  reporter: string;
  thumbnail: string | null;
  published_at: string | null;
  updated_at: string;
  breaking: boolean;
  featured: boolean;
  published: boolean;
  revision: number;
  views: number;
}
export interface Article extends Story {
  content: string;
}
export type FormAction = (previous: string, fields: FormData) => Promise<string>;
