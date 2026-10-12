import type { Lang } from '../lib/url.ts';

/** Hosts we have a discount-code agreement with: people book on the host's
 *  own website with our code, a few percent off for them, a commission for
 *  us, reconciled monthly from the bookings that used the code. Their cards
 *  link straight to the host's booking page instead of opening our request
 *  form — and copy the code on the way — for every date bookable there.
 *  (A date only we know of, see hostDates.ts, keeps the request form.) */
export interface PartnerCode { code: string; percent: number }

export const partnerCodes: Record<string, PartnerCode> = {
  // Qian, Clay Garden Pottery Studio — agreed 12 Oct 2026: 5 % off for the
  // booker, 15 % of the original price to us, invoiced monthly.
  qian: { code: 'TWIGGLI5', percent: 5 },
};

/** The card's button: "Book with 5% off". */
export const partnerBook: Record<Lang, (p: number) => string> = {
  en: (p) => `Book with ${p}% off`,
  de: (p) => `Mit ${p} % Rabatt buchen`,
  fr: (p) => `Réserver avec -${p} %`,
  es: (p) => `Reservar con ${p} % de descuento`,
  it: (p) => `Prenota con il ${p}% di sconto`,
  nl: (p) => `Boek met ${p}% korting`,
  pl: (p) => `Rezerwuj z ${p}% zniżki`,
  tr: (p) => `%${p} indirimle rezervasyon`,
};

/** The note under the host: "5% off with code TWIGGLI5". */
export const partnerNote: Record<Lang, (p: number, code: string) => string> = {
  en: (p, c) => `${p}% off with code ${c}`,
  de: (p, c) => `${p} % Rabatt mit Code ${c}`,
  fr: (p, c) => `-${p} % avec le code ${c}`,
  es: (p, c) => `${p} % de descuento con el código ${c}`,
  it: (p, c) => `${p}% di sconto con il codice ${c}`,
  nl: (p, c) => `${p}% korting met code ${c}`,
  pl: (p, c) => `${p}% zniżki z kodem ${c}`,
  tr: (p, c) => `${c} koduyla %${p} indirim`,
};

/** Said once the code is on the clipboard. */
export const partnerCopied: Record<Lang, string> = {
  en: 'Code copied — paste it at checkout',
  de: 'Code kopiert – beim Bezahlen einfügen',
  fr: 'Code copié — collez-le au paiement',
  es: 'Código copiado: pégalo al pagar',
  it: 'Codice copiato: incollalo al pagamento',
  nl: 'Code gekopieerd — plak hem bij het afrekenen',
  pl: 'Kod skopiowany — wklej go przy płatności',
  tr: 'Kod kopyalandı — ödemede yapıştır',
};
