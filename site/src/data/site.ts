/** Site-wide chrome: nav, footer columns, social, store links.
 *  Edit here, not in the components. */

import { href, withBase, type Lang } from '../lib/url.ts';

export type NavLink = { label: string; href: string; external?: boolean; emphasis?: boolean };

/** The booking/host web app. Every "Get Started" on the site points here. */
export const appUrl = 'https://app.twiggli.com/';

const brandCopy = {
  en: {
    name: 'Twiggli',
    tagline: "Discover Berlin's most unique experiences — through video",
  },
  de: {
    name: 'Twiggli',
    tagline: 'Entdecke Berlins einzigartigste Erlebnisse — im Video',
  },
};

const navLabels = {
  en: { home: 'Home', getStarted: 'Get Started', corporate: 'Bookings for Corporate', contact: 'Contact' },
  de: { home: 'Startseite', getStarted: 'Jetzt starten', corporate: 'Für Unternehmen', contact: 'Kontakt' },
};

const secondaryLabels = {
  en: { howItWorks: 'How it works', hosts: 'Our hosts', host: 'Host with Twiggli' },
  de: { howItWorks: 'So funktioniert’s', hosts: 'Unsere Gastgeber', host: 'Gastgeber werden' },
};

const legalLabels = {
  en: { terms: 'Terms of Service', privacy: 'Privacy Policy', impressum: 'Impressum' },
  de: { terms: 'Nutzungsbedingungen', privacy: 'Datenschutzerklärung', impressum: 'Impressum' },
};

const storeLabels = {
  en: { appStore: 'Download on the App Store', googlePlay: 'Get it on Google Play' },
  de: { appStore: 'Laden im App Store', googlePlay: 'Jetzt bei Google Play' },
};

const copyrightText = {
  en: '© 2026 Twiggli. All rights reserved.',
  de: '© 2026 Twiggli. Alle Rechte vorbehalten.',
};

/** Shown on the legal pages. Update when the documents change. */
const legalUpdatedText = {
  en: '5 August 2026',
  de: '5. August 2026',
};

export const socialLinks = [
  { label: 'Instagram', href: '#', icon: 'instagram' },
  { label: 'Facebook', href: '#', icon: 'facebook' },
  { label: 'YouTube', href: '#', icon: 'youtube' },
  { label: 'LinkedIn', href: '#', icon: 'linkedin' },
] as const;

/**
 * Official Apple / Google badge artwork, one per language — both stores
 * ship localized marks (labels baked into the SVG), so the badge itself
 * switches with the site language, not just its alt text.
 */
const storeBadges = {
  en: { appStore: '/img/store/app-store-badge-en.svg', googlePlay: '/img/store/google-play-badge-en.svg' },
  de: { appStore: '/img/store/app-store-badge-de.svg', googlePlay: '/img/store/google-play-badge-de.svg' },
};

/** Everything the chrome (Nav, Footer, CookieBanner, StoreButtons) needs,
 *  resolved for one language. Impressum is a single German-only page
 *  shared by both language versions of the site — see impressum.astro —
 *  so its link always points at the root path, never /de/impressum/. */
export function getSiteData(lang: Lang) {
  const brand = { ...brandCopy[lang], logo: withBase('/img/logo.jpg') };

  const navLinks: NavLink[] = [
    { label: navLabels[lang].home, href: href(lang, '/') },
    { label: navLabels[lang].getStarted, href: appUrl, external: true },
    { label: navLabels[lang].corporate, href: href(lang, '/corporate/'), emphasis: true },
    { label: navLabels[lang].contact, href: href(lang, '/contact/') },
  ];

  const secondaryLinks: NavLink[] = [
    { label: secondaryLabels[lang].howItWorks, href: href(lang, '/how-it-works/') },
    { label: secondaryLabels[lang].hosts, href: href(lang, '/hosts/') },
    { label: secondaryLabels[lang].host, href: href(lang, '/host/') },
  ];

  const legalLinks: NavLink[] = [
    { label: legalLabels[lang].terms, href: href(lang, '/terms-of-service/') },
    { label: legalLabels[lang].privacy, href: href(lang, '/privacy-policy/') },
    { label: legalLabels[lang].impressum, href: href('en', '/impressum/') },
  ];

  const storeLinks = {
    appStore: { label: storeLabels[lang].appStore, href: '#', badge: withBase(storeBadges[lang].appStore) },
    googlePlay: { label: storeLabels[lang].googlePlay, href: '#', badge: withBase(storeBadges[lang].googlePlay) },
  };

  return {
    brand,
    navLinks,
    secondaryLinks,
    legalLinks,
    socialLinks,
    storeLinks,
    copyright: copyrightText[lang],
    legalUpdated: legalUpdatedText[lang],
  };
}
