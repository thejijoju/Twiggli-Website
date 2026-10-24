import type { Lang } from '../lib/url.ts';

/** The price filter on the workshop filters: the home page's search pill
 *  (HomeSearch.astro), which hands `?price=` to the calendar, and the
 *  calendar's own filters (DayPicker.astro), which read it and keep it in
 *  the address.
 *
 *  Four bands, per person, on the same price the tiles show. The cut-offs
 *  follow the dates we carry: about one in seven costs €30 or less (drop-in
 *  classes, tastings), three in ten €30–50, a third €50–80 (most pottery and
 *  printing evenings), and a quarter more (wheel courses, full days). Nothing is free right now, so there is no "free" band — €0 would
 *  land in the first one.
 *
 *  The bands are closed at the top: €30 is "up to €30", €50 is "€30–50",
 *  €80 is "€50–80". A price given as a span ("€40–100") falls in every band
 *  it touches. A workshop with no price ("on request") cannot be placed, so
 *  it shows only while no band is picked.
 *
 *  This is a seat at a public date. The group-bookings directory has its own
 *  wider bands for whole-group prices (HostFilters.astro). */
export const PRICE_BANDS = [
  { id: '0-30', min: -1, max: 30 },
  { id: '30-50', min: 30, max: 50 },
  { id: '50-80', min: 50, max: 80 },
  { id: '80plus', min: 80, max: Infinity },
] as const;
export type PriceBand = (typeof PRICE_BANDS)[number]['id'];

/** "€66" → [66, 66], "€40–100" → [40, 100], "€9.90" → [9.9, 9.9]; nothing
 *  for a price with no figure in it. Every number in the string is a real
 *  price for the session, as getHostPriceRanges (sessions.ts) reads it. */
export const priceRange = (price?: string): [number, number] | undefined => {
  if (!price) return undefined;
  const found = [...price.matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => Number(m[0].replace(',', '.')));
  return found.length ? [Math.min(...found), Math.max(...found)] : undefined;
};

/** Whether a price span touches a band — the same test the calendar's
 *  script runs on the cards' data-price-min / data-price-max. */
export const inBand = (range: [number, number], band: (typeof PRICE_BANDS)[number]): boolean =>
  range[0] <= band.max && range[1] > band.min;

/** The bands at least one of these prices falls in, in order — no dead
 *  filters, as with the activities and districts. */
export const bandsFor = (prices: (string | undefined)[]): (typeof PRICE_BANDS)[number][] => {
  const ranges = prices.map(priceRange).filter((r): r is [number, number] => !!r);
  return PRICE_BANDS.filter((b) => ranges.some((r) => inBand(r, b)));
};

/** What a card carries for the filter: data-price-min / data-price-max, or
 *  nothing when the price is on request. */
export const priceAttrs = (price?: string): Record<string, number> => {
  const r = priceRange(price);
  return r ? { 'data-price-min': r[0], 'data-price-max': r[1] } : {};
};

export interface PriceFilterCopy {
  /** The home pill's field label, asked like its neighbours ("Was?"). */
  ask: string;
  /** No band picked. */
  any: string;
  bands: Record<PriceBand, string>;
}

export const priceFilterCopy: Record<Lang, PriceFilterCopy> = {
  en: { ask: 'Price?', any: 'Any price',
        bands: { '0-30': 'Up to €30', '30-50': '€30–50', '50-80': '€50–80', '80plus': '€80+' } },
  de: { ask: 'Preis?', any: 'Jeder Preis',
        bands: { '0-30': 'Bis 30 €', '30-50': '30–50 €', '50-80': '50–80 €', '80plus': 'Über 80 €' } },
  fr: { ask: 'Prix ?', any: 'Tous les prix',
        bands: { '0-30': 'Jusqu’à 30 €', '30-50': '30–50 €', '50-80': '50–80 €', '80plus': 'Plus de 80 €' } },
  es: { ask: '¿Precio?', any: 'Cualquier precio',
        bands: { '0-30': 'Hasta 30 €', '30-50': '30–50 €', '50-80': '50–80 €', '80plus': 'Más de 80 €' } },
  it: { ask: 'Prezzo?', any: 'Qualsiasi prezzo',
        bands: { '0-30': 'Fino a 30 €', '30-50': '30–50 €', '50-80': '50–80 €', '80plus': 'Oltre 80 €' } },
  nl: { ask: 'Prijs?', any: 'Elke prijs',
        bands: { '0-30': 'Tot € 30', '30-50': '€ 30–50', '50-80': '€ 50–80', '80plus': 'Meer dan € 80' } },
  pl: { ask: 'Cena?', any: 'Dowolna cena',
        bands: { '0-30': 'Do 30 €', '30-50': '30–50 €', '50-80': '50–80 €', '80plus': 'Powyżej 80 €' } },
  tr: { ask: 'Fiyat?', any: 'Her fiyat',
        bands: { '0-30': '30 €’ya kadar', '30-50': '30–50 €', '50-80': '50–80 €', '80plus': '80 € üzeri' } },
};

/** One price for a run of dates, as a list line shows it: the price itself
 *  when every priced date costs the same ("€59"), the span when they differ
 *  ("€45–65"), nothing when none is priced. Used where a workshop is listed
 *  by name with its next date, so the price is there on first view rather
 *  than one click further in. */
export const priceSummary = (prices: (string | undefined)[]): string | undefined => {
  const given = [...new Set(prices.filter((p): p is string => !!p && !!priceRange(p)))];
  if (given.length <= 1) return given[0];
  const ranges = given.map(priceRange) as [number, number][];
  const lo = Math.min(...ranges.map((r) => r[0]));
  const hi = Math.max(...ranges.map((r) => r[1]));
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
  return lo === hi ? `€${fmt(lo)}` : `€${fmt(lo)}–${fmt(hi)}`;
};
