/** A workshop offered at the host's place and also at the guest's (office,
 *  home), with a flat extra for coming over: the host ticks it in Edit
 *  workshop (functions hostListing edit atGuest/atGuestFee, Anna 24.11.26). */
import { listingEdit } from './hostEdits.ts';
import type { Lang } from '../lib/url.ts';

/** The flat extra in € (0 = none), or undefined when it isn't offered at the guest's. */
export const atGuestFee = (slug: string, key?: string): number | undefined => {
  const e = key ? (listingEdit(slug, key) as { atGuest?: boolean; atGuestFee?: number | null; where?: string } | undefined) : undefined;
  if (!e?.atGuest || e.where === 'guest') return undefined;
  return typeof e.atGuestFee === 'number' && e.atGuestFee > 0 ? Math.round(e.atGuestFee) : 0;
};

/** "Bei dir vor Ort möglich · +€30 Anfahrt", or undefined. */
export const atGuestLine = (slug: string, key: string | undefined, lang: Lang): string | undefined => {
  const fee = atGuestFee(slug, key);
  if (fee === undefined) return undefined;
  const base = lang === 'de' ? 'Bei dir vor Ort möglich' : lang === 'fr' ? 'Aussi chez toi' : 'Also at your place';
  const extra = lang === 'de' ? 'Anfahrt' : lang === 'fr' ? 'déplacement' : 'travel';
  return fee ? `${base} · +€${fee} ${extra}` : base;
};
