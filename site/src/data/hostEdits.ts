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
/** Workshops a host paused or deleted in their dashboard (hostListing). */
const hidden = new Set(((edits as { hidden?: { slug: string; key: string }[] }).hidden ?? []).map((h) => `${h.slug}|${h.key}`));
/** Hosts who deleted their Twiggli account (functions accountDevices):
 *  nothing of theirs is shown anywhere (Jirel 15.11.26). */
export const goneSlugs = new Set<string>((edits as { gone?: string[] }).gone ?? []);
/** Whether a host took this workshop (its page key) off the site. */
export const isHiddenListing = (slug: string, key: string): boolean => hidden.has(`${slug}|${key}`);
/** A host's edit of a workshop (hostListing edit): title, price, line, and
 *  (Jirel 18.11.26) description, length, places per date, pictures/video and
 *  how guests book ('request': they send a request; 'instant': unchanged). */
export type ListingEdit = {
  slug: string; key: string; title?: string; price?: number | null; note?: string;
  description?: string; duration?: string; seats?: number | null;
  /** thumb: Bunny Stream's thumbnail of a video uploaded there (functions hostVideo). */
  media?: { type: string; url: string; thumb?: string }[]; booking?: '' | 'request' | 'instant';
  /** Page pictures and the page's video the host removed from this workshop (✕). */
  hidden?: string[];
  /** Where it usually happens: 'other' with its visible line, or at the guest's. */
  where?: 'studio' | 'other' | 'guest'; location?: string; locExact?: boolean; district?: string;
};
const listingEdits = new Map(((edits as { listingEdits?: ListingEdit[] }).listingEdits ?? []).map((e) => [`${e.slug}|${e.key}`, e]));
/** A host's own title, price per person and short line for a workshop. */
export const listingEdit = (slug: string, key: string): ListingEdit | undefined => listingEdits.get(`${slug}|${key}`);
const slots = ((edits as { slots?: SlotRow[] }).slots ?? []).filter((s) => s.active !== false);
/** Entries of the site's own schedule a host took over in the Calendar tab
 *  (functions REPLACES): "rec|<slug>|<workshop key>|<HH:MM>" for a weekly
 *  class, "date|<slug>|<YYYY-MM-DD>|<HH:MM>" for a hostDates.ts date. Their
 *  dates now come from the host's dashboard (accountDates), so the site's
 *  entry is left out: one source per date, never shown twice. */
const replaced = new Set<string>((edits as { replaced?: string[] }).replaced ?? []);
export const isReplaced = (key: string): boolean => replaced.has(key);
/** A weekly class of this host at this time was taken over, whatever key it
 *  was taken over under: the feed's title and the dashboard's workshop key can
 *  differ ("Vulva Painting mit Pia" vs "vulva-painting-workshop", Pia 23.11.26),
 *  and a host never runs two weekly classes at the same time. */
const replacedSlots = new Set([...replaced].filter((k) => k.startsWith('rec|')).map((k) => { const [, slug, , time] = k.split('|'); return `${slug}|${time}`; }));
export const isReplacedSlot = (slug: string, time: string): boolean => replacedSlots.has(`${slug}|${time}`);
/** A host's studio as guests see it before booking (Settings → Your studio):
 *  the visible line ("Friedrichshain", "Boxhagener Str., Friedrichshain" or
 *  the full address), the district, and whether that is the exact address.
 *  The full address itself never reaches the build. */
export type Studio = { slug: string; visible: string; district: string; exact: boolean };
const studios = new Map(((edits as { studios?: Studio[] }).studios ?? []).map((x) => [x.slug, x]));
export const studioOf = (slug: string): Studio | undefined => studios.get(slug);

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
  languages?: string; location?: string; titleEn?: string;
  /** The date's own choice: true = guests send a request, false = they book and pay straight away. */
  request?: boolean;
  /** Taken over from the site's own schedule (functions REPLACES). */
  replaces?: string;
  /** publicEvents: the host's Stripe can take payments now. */
  payable?: boolean;
  /** Where (dashboard "Where?"): the visible line, whether it is exact, the district. */
  where?: 'studio' | 'other' | 'guest'; locExact?: boolean; district?: string;
  /** The workshop's page key (Calendar tab), and whether it is an on-request weekly slot. */
  wkey?: string; onRequest?: boolean;
  /** Single dates of a series the host cancelled, and places changed for one date (Calendar tab). */
  exceptions?: string[]; seatsByDate?: Record<string, number>;
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
 *  repeats expanded (up to the host's end date, or on and on without one). They are booked
 *  through our request form, like any date without a booking page. */
export function accountDates(daysAhead = 100): {
  slug: string; title: string; titleEn?: string; date: string; time: string; duration?: string; price?: string;
  spots?: number; minGuests?: number; languages?: string; district?: string; url: string; request: true; eventId?: string;
  /** The date's own booking choice, and whether it was taken over from the site (sessions.ts decides with the workshop's). */
  reqChoice?: boolean; adopted?: boolean; key?: string; onRequest?: boolean;
  /** Set where the host chose where it is: the visible line, its district, and whether
   *  "exact address after booking" applies; atGuest: at the guest's location. */
  whereLine?: string; exactLater?: boolean; atGuest?: boolean;
}[] {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const last = new Date(today.getTime() + daysAhead * 86400000);
  const out: ReturnType<typeof accountDates> = [];
  for (const e of events) {
    const first = new Date(`${e.date}T00:00:00Z`);
    const until = e.until ? new Date(`${e.until}T00:00:00Z`) : last; // no end date: runs on (Jirel 18.11.26)
    const step = (d: Date): Date => {
      const n = new Date(d);
      if (e.repeat === 'weekly') n.setUTCDate(n.getUTCDate() + 7);
      else if (e.repeat === 'biweekly') n.setUTCDate(n.getUTCDate() + 14);
      else if (e.repeat === 'monthly') {
        // The same day of the month (as functions onSchedule): months without it are skipped.
        const day = first.getUTCDate();
        let k = (n.getUTCFullYear() - first.getUTCFullYear()) * 12 + n.getUTCMonth() - first.getUTCMonth();
        do { k++; n.setTime(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + k, day)); } while (n.getUTCDate() !== day && k < 240);
      }
      else n.setUTCFullYear(9999);
      return n;
    };
    for (let d = first; d <= until && d <= last; d = step(d)) {
      const day = d.toISOString().slice(0, 10);
      if (d < today || e.exceptions?.includes(day)) continue;
      const seats = typeof e.seatsByDate?.[day] === 'number' ? e.seatsByDate[day] : e.seats;
      out.push({
        slug: e.slug, title: e.title, ...(e.titleEn ? { titleEn: e.titleEn } : {}), date: day, time: e.start,
        ...(hours(e.start, e.end) ? { duration: hours(e.start, e.end) } : {}),
        ...(typeof e.price === 'number' && e.price > 0 ? { price: `€${e.price}` } : {}),
        ...(typeof seats === 'number' && seats > 0 ? { spots: seats } : {}),
        ...(typeof e.minGuests === 'number' && e.minGuests > 1 ? { minGuests: e.minGuests } : {}),
        ...(e.languages ? { languages: e.languages } : {}),
        // Priced: paid on the spot through the host's Stripe (DateRows, BookingDialog).
        // Priced, and the host's Stripe can take it (publicEvents "payable";
        // absent in older data: as before): payable on the spot, unless the
        // date or its workshop takes requests (sessions.ts).
        ...(typeof e.price === 'number' && e.price > 0 && e.id && e.payable !== false ? { eventId: e.id } : {}),
        ...(typeof e.request === 'boolean' ? { reqChoice: e.request } : {}),
        ...(e.replaces ? { adopted: true } : {}),
        // The workshop it belongs to: its own key, else the taken-over class's (rec|slug|KEY|time).
        ...(e.wkey || /^rec\|/.test(e.replaces ?? '') ? { key: e.wkey || e.replaces!.split('|')[2] } : {}),
        ...(e.onRequest ? { onRequest: true } : {}),
        ...(e.where === 'guest' ? { atGuest: true } : e.where && e.location ? { whereLine: e.location, exactLater: !e.locExact, ...(e.district ? { district: e.district } : {}) } : {}),
        url: '',
        request: true,
      });
      if (e.repeat === 'once' || !e.repeat) break;
    }
  }
  return out;
}
