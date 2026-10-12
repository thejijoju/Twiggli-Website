import type { Lang } from '../lib/url.ts';

/** How full a date is, where a host has told us and their own page does
 *  not say — "the 4th is already pretty full", "nine are coming". The weekly feed cannot know
 *  this and rewrites live-workshops.json from scratch, so it is kept here
 *  instead and laid over the feed when the site is built (sessions.ts).
 *
 *  Keyed "<host slug>|<YYYY-MM-DD>|<HH:MM>", the same date and start time
 *  the feed lists. A date that has passed simply stops matching; a host
 *  page that later says sold out wins over a note here. */
export interface AvailabilityNote {
  /** Close to full: the card says "Almost full". */
  almostFull?: boolean;
  /** How many are confirmed for it — from the host, or bookings the host
   *  has confirmed. Never a mere request. Shown from three upward. */
  going?: number;
}
export const availabilityNotes: Record<string, AvailabilityNote> = {
  // Deborah, 12 Oct: nine of the places taken, two more fit.
  'druckrausch|2026-11-04|18:30': { almostFull: true, going: 9 },
};

/** Below this, "who's going" is left off: one or two reads as empty. */
export const GOING_MIN = 3;

/** "9 going", under the host on a calendar card. */
export const goingLabel: Record<Lang, (n: number) => string> = {
  en: (n) => `${n} going`,
  de: (n) => `${n} gehen hin`,
  fr: (n) => `${n} participants`,
  es: (n) => `${n} asistentes`,
  it: (n) => `${n} partecipanti`,
  nl: (n) => `${n} gaan erheen`,
  pl: (n) => `Uczestnicy: ${n}`,
  tr: (n) => `${n} kişi katılıyor`,
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

/** "1 spot left", not "1 spots left": the singular, where the language
 *  has one. Everything else keeps the page's own plural wording. */
const oneSpot: Record<Lang, string> = {
  en: 'spot left',
  de: 'Platz frei',
  fr: 'place restante',
  es: 'plaza libre',
  it: 'posto libero',
  nl: 'plek vrij',
  pl: 'wolne miejsce',
  tr: 'yer kaldı',
};
export const spotsText = (n: number, lang: Lang, many: string): string =>
  n === 1 ? `1 ${oneSpot[lang]}` : `${n} ${many}`;
