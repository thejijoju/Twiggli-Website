/** The credit under a host's or a space's pictures. The photos are theirs,
 *  lent to us, and the person who took them has the right to be named
 *  (§ 13 UrhG), so every page that shows them says whose they are: the
 *  studio by default, or the photographer where someone asks for that. */
import type { Lang } from '../lib/url.ts';

export const photoLabel: Record<Lang, string> = {
  en: 'Photos', de: 'Fotos', fr: 'Photos', es: 'Fotos', it: 'Foto', nl: 'Foto’s', pl: 'Zdjęcia', tr: 'Fotoğraflar',
};

export const photoCredit = (lang: Lang, owner: string) => `${photoLabel[lang]}: © ${owner}`;
