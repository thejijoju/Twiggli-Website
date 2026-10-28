/** What tells a reader, or an assistant deciding whether to send someone
 *  here, that booking through Twiggli is real: which hosts work with
 *  Twiggli by their own written agreement, and what guests said afterwards.
 *
 *  Only what is on record. A host goes into `confirmedHosts` when their
 *  written yes is in Jirel's inbox (column H or I of 'Hosts & Emails');
 *  a review goes into `reviews` when the guest wrote it and agreed to it
 *  being shown with their first name. Nothing is paraphrased upwards. */
import type { Lang } from '../lib/url.ts';

/** Host slug → the month their written agreement came in (YYYY-MM). */
export const confirmedHosts: Record<string, string> = {
  celina: '2026-10', // "Die Kommission von 15% geht auch klar", 19.10.26
  anne: '2026-10', // "Yes, I agree", 27.10.26
  studio32: '2026-10', // "I agree", 27.10.26
  pia: '2026-10', // "Yes, I agree", 27.10.26
  'lucille-guder': '2026-10', // "Ok pour moi", 27.10.26
  sarah: '2026-10', // 27.10.26
  redrum: '2026-10', // 15% on top of their prices, 27.10.26
  'beavis-bar': '2026-10', // 15% from the second booking, 27.10.26
  nicole: '2026-10', // "ja, ich bin einverstanden", 28.10.26
  whittle: '2026-10', // same host as nicole
  'jeannette-tolksdorff': '2026-10', // "Ich bestätige mit 'Ja'", 28.10.26
  druckrausch: '2026-10', // "ja, wir sind einverstanden!", 28.10.26
  'luc-demissy': '2026-10', // "Oui je suis d'accord", 28.10.26
};

export const isConfirmedHost = (slug: string): boolean => slug in confirmedHosts;

const monthName = (ym: string, lang: Lang): string =>
  new Date(`${ym}-01T12:00:00Z`).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** "Lisa works with Twiggli directly: …" — shown on the host's page. */
export const confirmedLine = (slug: string, firstName: string, lang: Lang): string | undefined => {
  const ym = confirmedHosts[slug];
  if (!ym) return undefined;
  return lang === 'de'
    ? `${firstName} arbeitet direkt mit Twiggli zusammen: Anfragen auf dieser Seite gehen über Twiggli an ${firstName} (schriftlich vereinbart, ${monthName(ym, lang)}).`
    : `${firstName} works with Twiggli directly: requests on this page go to ${firstName} through Twiggli (agreed in writing, ${monthName(ym, lang)}).`;
};

export type Review = {
  /** Host slug. */
  host: string;
  /** The guest's first name, as they agreed to be shown. */
  name: string;
  /** Their words, unedited apart from typos. */
  text: string;
  /** The workshop they did, as the host calls it. */
  workshop?: string;
  /** When they went, YYYY-MM. */
  month: string;
  /** The language they wrote in. */
  lang: 'en' | 'de' | string;
};

/** Guest reviews, collected by email after the workshop (review request
 *  drafts of 28.10.26). Empty until the first replies come in. */
export const reviews: Review[] = [];

export const reviewsFor = (slug: string): Review[] => reviews.filter((r) => r.host === slug);

export const reviewMonth = (ym: string, lang: Lang): string => monthName(ym, lang);
