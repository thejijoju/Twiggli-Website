/** What hosts changed themselves in their Twiggli account (HostAccountPage,
 *  Firestore collections hostProfiles and hostSlots), laid over the copy and the
 *  schedule written in this repo. host-edits.json is refreshed before every
 *  deploy by scripts/fetch-host-edits.mjs; the copy in git stays empty, so a
 *  local build shows the site as written. */
import edits from './host-edits.json';

type ProfileRow = {
  slug: string; lang: 'en' | 'de';
  specialty?: string | null; studio?: string | null; blurb?: string | null; group_size?: string | null;
  duration?: string | null; place?: string | null; languages?: string | null; price_note?: string | null;
};
type SlotRow = {
  slug: string; title: string; weekdays: string[]; time: string;
  duration?: string | null; price?: number | null; active?: boolean;
};

const profiles = (edits as { profiles?: ProfileRow[] }).profiles ?? [];
const slots = ((edits as { slots?: SlotRow[] }).slots ?? []).filter((s) => s.active !== false);

/** Account field → HostCopy field. */
const FIELDS = {
  specialty: 'specialty', studio: 'studio', blurb: 'blurb', group_size: 'group',
  duration: 'duration', place: 'place', languages: 'languages', price_note: 'priceNote',
} as const;

/** The copy with each host's own edits on top; a field left empty in the
 *  account keeps what the site had. */
export function withHostEdits<T extends { slug: string }>(list: T[], lang: 'en' | 'de'): T[] {
  const bySlug = new Map(profiles.filter((p) => p.lang === lang).map((p) => [p.slug, p]));
  return list.map((h) => {
    const p = bySlug.get(h.slug);
    if (!p) return h;
    const out: Record<string, unknown> = { ...h };
    for (const [from, to] of Object.entries(FIELDS)) {
      const v = p[from as keyof ProfileRow];
      if (typeof v === 'string' && v.trim()) out[to] = v.trim();
    }
    return out as T;
  });
}

/** The weekly classes, with each host who set a schedule in their account
 *  getting exactly that schedule instead of the one written here. */
export function withHostSlots<R extends { slug: string }>(recurring: R[]): R[] {
  const own = new Set(slots.map((s) => s.slug));
  if (!own.size) return recurring;
  const fromAccounts = slots.map((s) => ({
    slug: s.slug,
    title: s.title,
    weekdays: s.weekdays,
    time: s.time,
    ...(s.duration ? { duration: s.duration } : {}),
    ...(typeof s.price === 'number' && s.price > 0 ? { price: `€${s.price}` } : {}),
    // Bookings still come to us as requests and are passed on.
    request: true,
    url: '',
  })) as unknown as R[];
  return [...recurring.filter((r) => !own.has(r.slug)), ...fromAccounts];
}
