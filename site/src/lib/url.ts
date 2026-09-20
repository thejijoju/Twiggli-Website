/** Prefixes an in-site absolute path with the deploy base (see astro.config.mjs
 *  `base`). Pass paths as written in the design, e.g. '/' or '/corporate/'. */
export const withBase = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return path === '/' ? `${base}/` : `${base}/${path.replace(/^\//, '')}`;
};

/** The site's languages. English is the default and lives at the root;
 *  every other language lives under its own prefix (/de/, /fr/ …).
 *
 *  Eight, chosen for a Berlin workshop crowd that is mostly European:
 *  German and English first, then the languages of the city's largest
 *  communities and of its most frequent visitors — French, Spanish, Italian,
 *  Dutch, Polish, Turkish. The legal pages and the blog exist in English and
 *  German only (see LEGAL_LANGS); everything else exists in all eight. */
export type Lang = 'en' | 'de' | 'fr' | 'es' | 'it' | 'nl' | 'pl' | 'tr';
export const LANGS: Lang[] = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'tr'];
export const DEFAULT_LANG: Lang = 'en';
/** Pages that carry legal weight, or hand-written articles, are not
 *  translated on the fly: they exist in these languages, and the others
 *  link to the English version. */
export const LEGAL_LANGS: Lang[] = ['en', 'de'];

export const isLang = (s: string | undefined | null): s is Lang =>
  !!s && (LANGS as string[]).includes(s);

/** What each language needs around it: its own name (what its speakers
 *  call it — the switcher shows that, never a translation of it), the flag
 *  that stands for it in the switcher, the locale that formats its dates,
 *  and the Open Graph locale. */
export const LANG_META: Record<Lang, { name: string; flag: string; locale: string; og: string }> = {
  en: { name: 'English', flag: 'gb', locale: 'en-GB', og: 'en_GB' },
  de: { name: 'Deutsch', flag: 'de', locale: 'de-DE', og: 'de_DE' },
  fr: { name: 'Français', flag: 'fr', locale: 'fr-FR', og: 'fr_FR' },
  es: { name: 'Español', flag: 'es', locale: 'es-ES', og: 'es_ES' },
  it: { name: 'Italiano', flag: 'it', locale: 'it-IT', og: 'it_IT' },
  nl: { name: 'Nederlands', flag: 'nl', locale: 'nl-NL', og: 'nl_NL' },
  pl: { name: 'Polski', flag: 'pl', locale: 'pl-PL', og: 'pl_PL' },
  tr: { name: 'Türkçe', flag: 'tr', locale: 'tr-TR', og: 'tr_TR' },
};

/** Locale-aware version of withBase: English stays unprefixed (the default
 *  locale), every other language lives under its prefix. Pass paths as
 *  written in the design, e.g. '/' or '/corporate/' — same as withBase. */
export const href = (lang: Lang, path: string): string =>
  lang === DEFAULT_LANG ? withBase(path) : withBase(`/${lang}${path === '/' ? '/' : path}`);

/** Strips the deploy base and any language prefix off a pathname, leaving
 *  the bare in-site path ('/corporate/'), plus the language it was in. */
export const splitLang = (pathname: string): { lang: Lang; bare: string } => {
  const base = import.meta.env.BASE_URL;
  let path = pathname;
  if (path.startsWith(base)) path = `/${path.slice(base.length)}`;
  const m = path.match(/^\/([a-z]{2})(\/|$)/);
  if (m && isLang(m[1]) && m[1] !== DEFAULT_LANG) {
    return { lang: m[1], bare: path.slice(m[1].length + 1) || '/' };
  }
  return { lang: DEFAULT_LANG, bare: path || '/' };
};

/** Given the current page's language-stripped path (e.g. '/corporate/'),
 *  builds the equivalent URL in another language — used by the language
 *  switcher and the redirect script. */
export const otherLangHref = (lang: Lang, strippedPath: string): string =>
  href(lang, strippedPath);
