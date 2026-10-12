import type { Lang } from '../lib/url.ts';

/** How full a date is, where a host has told us and their own page does
 *  not say — "the 4th is already pretty full". The weekly feed cannot know
 *  this and rewrites live-workshops.json from scratch, so it is kept here
 *  instead and laid over the feed when the site is built (sessions.ts).
 *
 *  Keyed "<host slug>|<YYYY-MM-DD>|<HH:MM>", the same date and start time
 *  the feed lists. A date that has passed simply stops matching; a host
 *  page that later says sold out wins over a note here. */
export const availabilityNotes: Record<string, 'almostFull'> = {
  // Deborah, 12 Oct: nine of the places taken, two more fit.
  'druckrausch|2026-11-04|18:30': 'almostFull',
};

/** The card's badge for such a date. */
export const almostFullLabel: Record<Lang, string> = {
  en: 'Almost full',
  de: 'Fast ausgebucht',
  fr: 'Presque complet',
  es: 'Casi completo',
  it: 'Quasi al completo',
  nl: 'Bijna vol',
  pl: 'Prawie pełne',
  tr: 'Neredeyse dolu',
};
