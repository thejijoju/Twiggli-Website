/** Prefixes an in-site absolute path with the deploy base (see astro.config.mjs
 *  `base`). Pass paths as written in the design, e.g. '/' or '/corporate/'. */
export const withBase = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return path === '/' ? `${base}/` : `${base}/${path.replace(/^\//, '')}`;
};

export type Lang = 'en' | 'de';
export const DEFAULT_LANG: Lang = 'en';

/** Locale-aware version of withBase: English stays unprefixed (the default
 *  locale), German pages live under /de/. Pass paths as written in the
 *  design, e.g. '/' or '/corporate/' — same as withBase. */
export const href = (lang: Lang, path: string): string =>
  lang === DEFAULT_LANG ? withBase(path) : withBase(`/${lang}${path === '/' ? '/' : path}`);

/** Given the current page's language-stripped path (e.g. '/corporate/'),
 *  builds the equivalent URL in the other language — used by the language
 *  switcher and the redirect script. */
export const otherLangHref = (lang: Lang, strippedPath: string): string =>
  href(lang === 'en' ? 'de' : 'en', strippedPath);
