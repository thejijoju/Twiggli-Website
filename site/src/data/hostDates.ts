/** Dates a host has sent us themselves — by email, say — that the weekly
 *  feed does not pick up from their site. Laid over the feed when the site
 *  is built (sessions.ts); where the feed later finds the same date and
 *  start time, the feed's own entry wins and this one is dropped.
 *
 *  `onHostSite`: the date can be booked on the host's own website, so a
 *  partner host's discount link applies (partners.ts). Without it the card
 *  keeps the usual booking request form. */
export interface HostDate {
  slug: string;
  title: string;
  titleEn?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  duration?: string;
  price?: string;
  spots?: number;
  district?: string;
  /** The host's booking page for it. */
  url: string;
  onHostSite?: boolean;
}

export const hostDates: HostDate[] = [
  // Qian's dates now come straight from her Acuity account in the feed.
  // Anna Malerlebnisse (Antje) sends her dates by email (call of 22.10.26):
  // a public session every 4–6 weeks at the Begegnungsstätte Mehr Mitte,
  // Torstraße 190, €35 per person, booked on her own site.
  { slug: 'anna-malerlebnisse', title: 'Malerlebnis: Malen mit persönlicher Anleitung',
    titleEn: 'Malerlebnis: painting with personal guidance',
    date: '2026-11-14', time: '14:00', duration: '2 h', price: '€35', district: 'Mitte',
    url: 'https://malerlebnisse-anna.de/termine/anna-malerlebnis/?date=2026-11-14', onHostSite: true },
];
