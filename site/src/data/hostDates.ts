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
  // Qian, 12 Oct: her Try the Wheel tasters and the last-Friday handbuilding
  // class, booked through the class widget on her pottery-classes page,
  // which the feed's scrape of that page does not reach.
  { slug: 'qian', title: 'Try the Wheel', date: '2026-10-24', time: '13:00', duration: '2 h',
    price: '€85', spots: 2, district: 'Prenzlauer Berg', url: 'https://www.claygarden.studio/pottery-classes', onHostSite: true },
  { slug: 'qian', title: 'Try the Wheel', date: '2026-10-31', time: '13:00', duration: '2 h',
    price: '€85', spots: 2, district: 'Prenzlauer Berg', url: 'https://www.claygarden.studio/pottery-classes', onHostSite: true },
  { slug: 'qian', title: 'Handbuilding Workshop', date: '2026-11-27', time: '18:00', duration: '2 h',
    price: '€65', spots: 5, district: 'Prenzlauer Berg', url: 'https://www.claygarden.studio/pottery-classes', onHostSite: true },
];
