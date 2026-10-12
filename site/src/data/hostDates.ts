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
];
