import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './url.ts';

export type Post = CollectionEntry<'blog'>;

/** A post's shared slug — its filename, with the language folder dropped. The
 *  two language versions of an article live at en/<slug>.md and de/<slug>.md,
 *  so they resolve to the same URL path and the language switch stays on the
 *  article rather than falling back to the homepage.
 *  (The collection id is slugified, so a `name.en.md` convention would fold
 *  the language into the slug — hence folders.) */
export const postSlug = (post: Post): string => post.id.replace(/^(en|de)\//, '');

/** Published posts for one language, newest first. Drafts are excluded in
 *  production but kept while developing so they can be previewed. */
export async function getPosts(lang: Lang): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => {
    if (data.lang !== lang) return false;
    return import.meta.env.PROD ? !data.draft : true;
  });
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const formatDate = (date: Date, lang: Lang): string =>
  date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
