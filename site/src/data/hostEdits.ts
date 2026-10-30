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

/** A date a host created in their dashboard ("Neuer Termin"). */
type EventRow = {
  id: string; slug: string; title: string; date: string; start: string; end?: string;
  repeat?: 'once' | 'weekly' | 'biweekly' | 'monthly'; until?: string;
  price?: number | null; seats?: number | null; minGuests?: number | null;
  languages?: string; location?: string;
};
const events = ((edits as { events?: EventRow[] }).events ?? []);

/** Length from start and end ("2.5 h"), when both are set. */
const hours = (start: string, end?: string): string | undefined => {
  if (!end) return undefined;
  const m = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const d = (m(end) - m(start)) / 60;
  return d > 0 ? `${Number.isInteger(d) ? d : d.toFixed(1)} h` : undefined;
};

/** Every dated session from hosts' dashboard dates within `daysAhead`,
 *  repeats expanded (12 weeks unless the host set an end). They are booked
 *  through our request form, like any date without a booking page. */
export function accountDates(daysAhead = 100): {
  slug: string; title: string; date: string; time: string; duration?: string; price?: string;
  spots?: number; minGuests?: number; languages?: string; district?: string; url: string; request: true;
}[] {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const last = new Date(today.getTime() + daysAhead * 86400000);
  const out: ReturnType<typeof accountDates> = [];
  for (const e of events) {
    const first = new Date(`${e.date}T00:00:00Z`);
    const until = e.until ? new Date(`${e.until}T00:00:00Z`) : new Date(first.getTime() + 84 * 86400000);
    const step = (d: Date): Date => {
      const n = new Date(d);
      if (e.repeat === 'weekly') n.setUTCDate(n.getUTCDate() + 7);
      else if (e.repeat === 'biweekly') n.setUTCDate(n.getUTCDate() + 14);
      else if (e.repeat === 'monthly') n.setUTCMonth(n.getUTCMonth() + 1);
      else n.setUTCFullYear(9999);
      return n;
    };
    for (let d = first; d <= until && d <= last; d = step(d)) {
      if (d < today) continue;
      out.push({
        slug: e.slug, title: e.title, date: d.toISOString().slice(0, 10), time: e.start,
        ...(hours(e.start, e.end) ? { duration: hours(e.start, e.end) } : {}),
        ...(typeof e.price === 'number' && e.price > 0 ? { price: `€${e.price}` } : {}),
        ...(typeof e.seats === 'number' && e.seats > 0 ? { spots: e.seats } : {}),
        ...(typeof e.minGuests === 'number' && e.minGuests > 1 ? { minGuests: e.minGuests } : {}),
        ...(e.languages ? { languages: e.languages } : {}),
        url: '',
        request: true,
      });
      if (e.repeat === 'once' || !e.repeat) break;
    }
  }
  return out;
}
