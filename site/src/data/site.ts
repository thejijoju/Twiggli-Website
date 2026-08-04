/** Site-wide chrome: nav, footer columns, social links. Edit here, not in
 *  the components — Nav and Footer both read from this file. */

export const brand = {
  name: 'Twiggli',
  logo: '/img/logo.jpg',
  tagline: "Discover Berlin's most unique experiences — through video",
};

export type NavLink = { label: string; href: string };

/** The three links the design ships in the nav bar. */
export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Get Started', href: '/hosts/' },
  { label: 'Contact', href: '/contact/' },
];

/** Additional pages, linked from the footer only — the nav in the design
 *  holds exactly three links and widening it would change its layout. */
export const secondaryLinks: NavLink[] = [
  { label: 'How it works', href: '/how-it-works/' },
  { label: 'Host with Twiggli', href: '/host/' },
  { label: 'Corporate events', href: '/corporate/' },
];

export const socialLinks = [
  { label: 'Instagram', href: '#', icon: 'instagram' },
  { label: 'Facebook', href: '#', icon: 'facebook' },
  { label: 'YouTube', href: '#', icon: 'youtube' },
  { label: 'LinkedIn', href: '#', icon: 'linkedin' },
] as const;

export const copyright = '© 2026 Twiggli. All rights reserved.';
