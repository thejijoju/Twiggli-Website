import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog posts. One markdown file per post per language, filed by language:
 * `blog/en/<slug>.md` and `blog/de/<slug>.md` are the same article in two
 * languages and share a slug, so the language switch keeps you on the piece.
 * Drop a new file in either folder and it appears; nothing else to wire.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      /** ISO date, e.g. 2026-08-14. Sorted newest first. */
      date: z.coerce.date(),
      lang: z.enum(['en', 'de']),
      /** Shown on the card and at the top of the post. Optional. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** A short label above the title, e.g. "Berlin guide". */
      category: z.string().optional(),
      /** Keeps a post out of the listing while it is being written. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
