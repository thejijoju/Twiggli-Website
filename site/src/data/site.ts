/** Site-wide chrome: nav, footer columns, social, store links.
 *  Edit here, not in the components. */

import { href, withBase, LEGAL_LANGS, type Lang } from '../lib/url.ts';
import { ACTIVITY_ORDER, activityCopy, activityHref, hubHref } from './seo.ts';
import { ui } from './i18n.ts';

export type NavLink = { label: string; href: string; external?: boolean };

/** The booking/host web app. Every "Get Started" on the site points here. */
export const appUrl = 'https://app.twiggli.com/';

/** Where every request the site sends lands: corporate and group enquiries
 *  from the contact form, and the calendar's "Request to book" mails. The
 *  site is static, so a request is a prefilled email the visitor sends
 *  from their own mail app — there is no server to post a form to. */
export const requestEmail = 'jirel.kuenen@gmail.com';

/** Shown on the legal pages, which exist in English and German only.
 *  Update when the documents change. */
const legalUpdatedText: Record<Lang, string> = {
  en: '5 August 2026',
  de: '5. August 2026',
  fr: '5 août 2026',
  es: '5 de agosto de 2026',
  it: '5 agosto 2026',
  nl: '5 augustus 2026',
  pl: '5 sierpnia 2026',
  tr: '5 Ağustos 2026',
};

/* '#' means the account does not exist yet — the icon renders but goes
   nowhere. Swap in the real URL as each one is set up. */
export const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/twiggli.app/', icon: 'instagram' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61566072013440', icon: 'facebook' },
  /* The '?si=' share token is dropped on purpose: it tags every visitor as
     having arrived from one particular share link, which skews the channel's
     traffic-source stats. The bare handle URL works the same. */
  { label: 'YouTube', href: 'https://www.youtube.com/@twiggliapp', icon: 'youtube' },
  /* The company page under its vanity name — the same page as
     /company/105193590/, readable as a link. The admin-only forms of the
     URL (/admin/dashboard/, ?viewAsMember=true) resolve for page admins and
     nobody else, so they stay out. */
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/twiggliapp/', icon: 'linkedin' },
] as const;

/**
 * Official Apple / Google badge artwork, one per language — both stores
 * ship localized marks (labels baked into the SVG), so the badge itself
 * switches with the site language, not just its alt text. Languages
 * without their own artwork here fall back to the English badge.
 */
const storeBadges: Partial<Record<Lang, { appStore: string; googlePlay: string }>> = {
  en: { appStore: '/img/store/app-store-badge-en.svg', googlePlay: '/img/store/google-play-badge-en.svg' },
  de: { appStore: '/img/store/app-store-badge-de.svg', googlePlay: '/img/store/google-play-badge-de.svg' },
};

/** Everything the chrome (Nav, Footer, CookieBanner, StoreButtons) needs,
 *  resolved for one language. The wording comes from i18n.ts; this only
 *  pairs each label with its URL.
 *
 *  Impressum is a single German-only page shared by every language version
 *  of the site — see impressum.astro — so its link always points at the root
 *  path. The other legal pages and the blog exist in English and German
 *  only (LEGAL_LANGS): from any other language they link to the English
 *  version rather than to a page that is not there. */
export function getSiteData(lang: Lang) {
  const t = ui(lang);
  /* The language the legal pages and the blog are read in from this one. */
  const docLang: Lang = LEGAL_LANGS.includes(lang) ? lang : 'en';

  /* PNG, not JPEG — the mark's rounded corners need real transparency, or
     they render as white notches against the page and the dark footer. */
  const brand = { name: 'Twiggli', tagline: t.brand.tagline, logo: withBase('/img/logo.png') };

  const navLinks: NavLink[] = [
    { label: t.nav.home, href: href(lang, '/') },
    { label: t.nav.getStarted, href: appUrl, external: true },
    { label: t.nav.workshops, href: hubHref(lang) },
    { label: t.nav.happening, href: href(lang, '/happening-today/') },
    /* Points at /corporatebookings/, which is the corporate page — the
       pitch and the directory of makers who can run the session are one
       page now. */
    { label: t.nav.corporate, href: href(lang, '/corporatebookings/') },
    { label: t.nav.spaces, href: href(lang, '/studio-rental/') },
    { label: t.nav.blog, href: href(docLang, '/blog/') },
    { label: t.nav.contact, href: href(lang, '/contact/') },
  ];

  const secondaryLinks: NavLink[] = [
    { label: t.footer.howItWorks, href: href(lang, '/how-it-works/') },
    { label: t.footer.hosts, href: href(lang, '/corporatebookings/') },
    { label: t.footer.host, href: href(lang, '/host/') },
  ];

  const workshopLinks: NavLink[] = ACTIVITY_ORDER.map((activity) => ({
    label: activityCopy[lang][activity].h1,
    href: activityHref(lang, activity),
  }));

  const legalLinks: NavLink[] = [
    { label: t.footer.terms, href: href(docLang, '/terms-of-service/') },
    { label: t.footer.privacy, href: href(docLang, '/privacy-policy/') },
    { label: t.footer.impressum, href: href('en', '/impressum/') },
  ];

  const badges = storeBadges[lang] ?? storeBadges.en!;
  const storeLinks = {
    appStore: { label: t.footer.appStore, href: '#', badge: withBase(badges.appStore) },
    googlePlay: { label: t.footer.googlePlay, href: '#', badge: withBase(badges.googlePlay) },
  };

  return {
    brand,
    navLinks,
    secondaryLinks,
    workshopLinks,
    workshopColumnLabel: t.footer.workshops,
    legalLinks,
    socialLinks,
    storeLinks,
    copyright: t.footer.copyright,
    legalUpdated: legalUpdatedText[lang],
    /** Where the legal pages and the blog are read from this language. */
    docLang,
  };
}
