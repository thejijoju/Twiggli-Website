/** Site-wide chrome: nav, footer columns, social, store links.
 *  Edit here, not in the components. */

import { withBase } from '../lib/url.ts';

export const brand = {
  name: 'Twiggli',
  logo: withBase('/img/logo.jpg'),
  tagline: "Discover Berlin's most unique experiences — through video",
};

/** The booking/host web app. Every "Get Started" on the site points here. */
export const appUrl = 'https://app.twiggli.com/';

export type NavLink = { label: string; href: string; external?: boolean };

export const navLinks: NavLink[] = [
  { label: 'Home', href: withBase('/') },
  { label: 'Get Started', href: appUrl, external: true },
  { label: 'Bookings for Corporate', href: withBase('/corporate/') },
  { label: 'Contact', href: withBase('/contact/') },
];

/** Pages linked from the footer only — the nav in the design holds a short
 *  row and widening it further would push it into wrapping on laptops. */
export const secondaryLinks: NavLink[] = [
  { label: 'How it works', href: withBase('/how-it-works/') },
  { label: 'Our hosts', href: withBase('/hosts/') },
  { label: 'Host with Twiggli', href: withBase('/host/') },
];

export const legalLinks: NavLink[] = [
  { label: 'Terms of Service', href: withBase('/terms-of-service/') },
  { label: 'Privacy Policy', href: withBase('/privacy-policy/') },
  { label: 'Impressum', href: withBase('/impressum/') },
];

export const socialLinks = [
  { label: 'Instagram', href: '#', icon: 'instagram' },
  { label: 'Facebook', href: '#', icon: 'facebook' },
  { label: 'YouTube', href: '#', icon: 'youtube' },
  { label: 'LinkedIn', href: '#', icon: 'linkedin' },
] as const;

/**
 * App store listings.
 *
 * `badge` is optional: leave it empty and the design's text button renders.
 * Drop the OFFICIAL artwork into public/img/ and set the path to switch to
 * real badges — Apple and Google both licence those specifically for this
 * use, and both forbid redrawing their marks by hand, so use their files:
 *   Apple  → developer.apple.com/app-store/marketing/guidelines/
 *   Google → play.google.com/intl/en_us/badges/
 */
export const storeLinks = {
  appStore: {
    label: 'Download on the App Store',
    href: '#',
    badge: '',
  },
  googlePlay: {
    label: 'Get it on Google Play',
    href: '#',
    badge: '',
  },
};

export const copyright = '© 2026 Twiggli. All rights reserved.';

/** Shown on the legal pages. Update when the documents change. */
export const legalUpdated = '5 August 2026';
