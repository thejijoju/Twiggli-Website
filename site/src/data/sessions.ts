/** Upcoming workshop sessions for the "Happening today" page.
 *
 *  Every session is real: dated entries from hosts' own schedules
 *  (scraped weekly or entered by hand into live-workshops.json) plus
 *  weekly-recurring classes expanded across the visible window. Nothing
 *  is invented — a day with no real session shows the page's empty note.
 *
 *  Dates are converted to `dayOffset` (0 = today, Europe/Berlin) at build
 *  time; the deploy workflow rebuilds daily so they stay true.
 */
import { getHosts, getWorkshopReel, getWorkshopUsp, type Host } from './content.ts';
import type { Lang } from '../lib/url.ts';
import liveData from './live-workshops.json';

export type Session = {
  id: string;
  dayOffset: number;
  /** Absent when the host's booking page reveals the time only during
   *  checkout — the card then says so instead of inventing an hour. */
  time?: string;
  host: Host;
  title: string;
  place: string;
  /** Berlin district (or the studio name when no district is known),
   *  shown on the feed card. */
  district: string;
  /** Where the row's Book button, title and thumbnail lead: the host's
   *  own booking page. */
  bookUrl: string;
  /** Session-specific length; the card falls back to the host's. */
  duration?: string;
  /** Unknown for scraped sessions — the card then omits the line. */
  spots?: number;
  price?: string;
  /** The price before the reduction, where the host is running one. Shown
   *  struck through beside the price, so a sale reads as a sale rather than
   *  as a low number nobody can place. */
  priceWas?: string;
  /** The workshop's own picture, scraped from the host's booking page —
   *  the card thumbnail prefers it over the host's stock tile. */
  image?: string;
  /** Hosts whose booking platform must not be linked take requests by
   *  mail instead — the card's button becomes "Request booking". */
  request?: boolean;
  /** Designed for children — picked out by the feed's kids filter. */
  kids?: boolean;
  /** Fully booked right now — the card says so and offers "Notify me"
   *  instead of Book; the daily scrape flips it back when spots return. */
  soldOut?: boolean;
  /** The one thing that sells this workshop, in two or three words — see
   *  workshopUsps in content.ts. Absent for most. */
  usp?: string;
};

/** Shapes written by scripts/update-workshops.mjs. */
type LiveWorkshop = {
  slug: string;
  sourceUrl: string;
  title: string;
  /** English page title; `title` (the host's own wording) serves German. */
  titleEn?: string;
  date: string; // YYYY-MM-DD, Europe/Berlin
  time?: string; // HH:MM; absent when only the booking page shows it
  duration?: string;
  price?: string;
  /** Set where the host lists a sale price — see Session.priceWas. */
  priceWas?: string;
  district?: string;
  /** Live spots left, where the host's booking API reports it. */
  spots?: number;
  /** The workshop's own picture from the host's site, where the scrape
   *  found one. */
  image?: string;
  /** True when this host's card takes booking requests by mail instead of
   *  linking a booking page. */
  request?: boolean;
  /** True for workshops designed for children (flagged by the scrape from
   *  the title, or per-source). */
  kids?: boolean;
  /** True while the host's booking platform reports the session full. */
  soldOut?: boolean;
  url: string;
};

/** A weekly-recurring class (e.g. "Dienstags 18–20 Uhr") — expanded into a
 *  dated session on every matching weekday of the visible window at build
 *  time, so the daily rebuild keeps it rolling forever. */
type LiveRecurring = Omit<LiveWorkshop, 'date'> & {
  weekdays: string[]; // 'mon'…'sun'
};

/** A workshop a host runs only on inquiry — no published dates. Shown in
 *  the calendar's own "on request" section under the day feed. */
type LiveOnRequest = Omit<LiveWorkshop, 'date' | 'time'>;

export type OnRequestWorkshop = {
  id: string;
  host: Host;
  title: string;
  district: string;
  bookUrl: string;
  duration?: string;
  price?: string;
  request?: boolean;
  /** As on Session — see workshopUsps in content.ts. */
  usp?: string;
};

/** How many on-request workshops the section shows at once — one line of
 *  cards under the day feed. */
export const ON_REQUEST_SHOWN = 5;

/** Undated inquiry-only workshops for the feed's "on request" section.
 *
 *  There are more of these than fit on one line, so the section shows a
 *  window of ON_REQUEST_SHOWN that walks one place along per day — the
 *  deploy workflow rebuilds every morning, so a visitor coming back finds
 *  different makers rather than the same five forever. Never two from one
 *  host: hosts are the unit the window steps over, and a host offering
 *  several workshops cycles through them on the same clock.
 */
export function getOnRequest(lang: Lang): OnRequestWorkshop[] {
  const bySlug = new Map(getHosts(lang).map((h) => [h.slug, h]));
  const byHost = new Map<string, OnRequestWorkshop[]>();
  for (const o of ((liveData as { onRequest?: LiveOnRequest[] }).onRequest ?? [])) {
    const host = bySlug.get(o.slug);
    if (!host) continue;
    const entry: OnRequestWorkshop = {
      id: `req-${o.slug}-${hash(o.title)}`,
      host: withWorkshopReel(host, o.slug, o.title),
      title: lang === 'en' && o.titleEn ? o.titleEn : o.title,
      district: o.district ?? host.studio ?? host.place,
      bookUrl: o.url,
      ...(o.duration ? { duration: o.duration } : {}),
      ...(o.price ? { price: o.price } : {}),
      ...(o.request ? { request: true } : {}),
      ...(getWorkshopUsp(o.slug, o.title, lang)
        ? { usp: getWorkshopUsp(o.slug, o.title, lang) }
        : {}),
    };
    const forHost = byHost.get(o.slug);
    if (forHost) forHost.push(entry);
    else byHost.set(o.slug, [entry]);
  }

  const slugs = [...byHost.keys()];
  if (!slugs.length) return [];
  const day = Math.floor(berlinTodayMs() / 86400000);
  const out: OnRequestWorkshop[] = [];
  for (let i = 0; i < Math.min(ON_REQUEST_SHOWN, slugs.length); i++) {
    const forHost = byHost.get(slugs[(((day + i) % slugs.length) + slugs.length) % slugs.length])!;
    out.push(forHost[day % forHost.length]);
  }
  return out;
}

/** What a host's published sessions cost, as [cheapest, dearest] in euros.
 *
 *  There is no price on a host card — the directory describes what someone
 *  hosts, not what they charge — so the only real figures are the ones on
 *  their own listings, scraped with the sessions. A host with nothing
 *  published is absent from the map rather than guessed at.
 *
 *  These are per-person prices for a seat at a public session. A private
 *  group is quoted separately, which is why the directory labels them as
 *  such rather than presenting them as the price of a booking.
 */
export function getHostPriceRanges(): Map<string, [number, number]> {
  const out = new Map<string, [number, number]>();
  const priced = [
    ...((liveData as { workshops?: { slug: string; price?: string }[] }).workshops ?? []),
    ...((liveData as { recurring?: { slug: string; price?: string }[] }).recurring ?? []),
    ...((liveData as { onRequest?: { slug: string; price?: string }[] }).onRequest ?? []),
  ];
  for (const w of priced) {
    if (!w.price) continue;
    // "€66", "€40–100", "€168+" — every number in the string is a real
    // price for this session, so the ends of the span are its ends.
    const found = [...w.price.matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => Number(m[0].replace(',', '.')));
    if (!found.length) continue;
    const range = out.get(w.slug);
    const lo = Math.min(...found);
    const hi = Math.max(...found);
    out.set(w.slug, range ? [Math.min(range[0], lo), Math.max(range[1], hi)] : [lo, hi]);
  }
  return out;
}

const WEEKDAY_INDEX: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

/** Deterministic, used for stable recurring-session ids. */
const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

/** Widened from 21 so real scraped workshops a few months out (Clay
 *  Garden's and Karen-Rose's run 5–12 weeks ahead) still land on the strip. */
export const DAYS_AHEAD = 100;

/** Today in Berlin, as a UTC-midnight timestamp — the base the scraped
 *  absolute dates are converted to day offsets against. Build-time, so the
 *  deploy workflow rebuilds the site daily to keep offsets true. */
export const berlinTodayMs = (): number =>
  Date.parse(new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' }));

/** A workshop with its own footage shows that instead of the host's general
 *  reel, on its cards only — everywhere a host is drawn as a host, their own
 *  reel still stands. Swapping it on the session's copy of the host is all
 *  that takes: every surface already reads the reel off there. */
const withWorkshopReel = (host: Host, slug: string, title: string, pick = 0): Host => {
  const reel = getWorkshopReel(slug, title, pick);
  return reel ? { ...host, video: reel.video, poster: reel.poster } : host;
};

/** Where a workshop has more than one reel they are shown in turn, so the
 *  position of each date among that workshop's own dates is what picks one.
 *  Counted in calendar order rather than file order — the scrape appends new
 *  dates to the end of the feed, so the two would not agree. */
const dateOrdinals = (rows: { slug: string; title: string; date: string; time?: string }[]) => {
  const byWorkshop = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${row.slug}|${row.title}`;
    const group = byWorkshop.get(key);
    if (group) group.push(row);
    else byWorkshop.set(key, [row]);
  }
  const ordinals = new Map<typeof rows[number], number>();
  for (const group of byWorkshop.values()) {
    group
      .slice()
      .sort((a, b) => `${a.date}${a.time ?? ''}`.localeCompare(`${b.date}${b.time ?? ''}`))
      .forEach((row, i) => ordinals.set(row, i));
  }
  return ordinals;
};

/** Real sessions scraped weekly from hosts' public schedules — see
 *  scripts/update-workshops.mjs. A host with real sessions in the window
 *  drops out of the placeholder rotation entirely, and their Book button
 *  leads to the host's own booking page. */
function liveSessions(hosts: Host[], lang: Lang): Session[] {
  const today = berlinTodayMs();
  const bySlug = new Map(hosts.map((h) => [h.slug, h]));
  const sessions: Session[] = [];
  const usp = (slug: string, title: string) => getWorkshopUsp(slug, title, lang);
  const workshops = (liveData.workshops ?? []) as LiveWorkshop[];
  const ordinals = dateOrdinals(workshops);

  for (const w of workshops) {
    const host = bySlug.get(w.slug);
    if (!host) continue;
    const dayOffset = Math.round((Date.parse(w.date) - today) / 86400000);
    if (dayOffset < 0 || dayOffset >= DAYS_AHEAD) continue;
    sessions.push({
      id: `live-${w.slug}-${w.date}-${w.time ?? 'tba'}`,
      dayOffset,
      time: w.time,
      host: withWorkshopReel(host, w.slug, w.title, ordinals.get(w) ?? 0),
      title: lang === 'en' && w.titleEn ? w.titleEn : w.title,
      place: host.place,
      // Real listings never get an invented district — the studio name is
      // accurate where the scrape carries no location.
      district: w.district ?? host.studio ?? host.place,
      bookUrl: w.url,
      ...(w.duration ? { duration: w.duration } : {}),
      ...(w.price ? { price: w.price } : {}),
      ...(w.priceWas ? { priceWas: w.priceWas } : {}),
      ...(typeof w.spots === 'number' ? { spots: w.spots } : {}),
      ...(w.image ? { image: w.image } : {}),
      ...(w.request ? { request: true } : {}),
      ...(w.kids ? { kids: true } : {}),
      ...(w.soldOut ? { soldOut: true } : {}),
      ...(usp(w.slug, w.title) ? { usp: usp(w.slug, w.title) } : {}),
    });
  }

  // Weekly-recurring classes: one session per matching weekday in the
  // window. berlinTodayMs is UTC midnight of the Berlin date, so getUTCDay
  // on it (plus whole days) is the Berlin weekday.
  for (const r of ((liveData as { recurring?: LiveRecurring[] }).recurring ?? [])) {
    const host = bySlug.get(r.slug);
    if (!host) continue;
    const wanted = new Set(r.weekdays.map((d) => WEEKDAY_INDEX[d]));
    let occurrence = 0;
    for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
      const dow = new Date(today + dayOffset * 86400000).getUTCDay();
      if (!wanted.has(dow)) continue;
      sessions.push({
        id: `rec-${r.slug}-${hash(r.title)}-${dayOffset}`,
        dayOffset,
        time: r.time,
        // Post-increment: the first occurrence in the window is 0, so a
        // recurring class starts on its first reel like a dated one does.
        host: withWorkshopReel(host, r.slug, r.title, occurrence++),
        title: lang === 'en' && r.titleEn ? r.titleEn : r.title,
        place: host.place,
        district: r.district ?? host.studio ?? host.place,
        bookUrl: r.url,
        ...(r.duration ? { duration: r.duration } : {}),
        ...(r.price ? { price: r.price } : {}),
        ...(r.kids ? { kids: true } : {}),
        ...(r.request ? { request: true } : {}),
        ...(usp(r.slug, r.title) ? { usp: usp(r.slug, r.title) } : {}),
      });
    }
  }
  return sessions;
}

/** The feed carries only real sessions — dated ones scraped or entered
 *  from hosts' own schedules, and weekly-recurring classes expanded across
 *  the strip. Days with nothing real show the page's empty note; no
 *  invented filler. */
export function getSessions(lang: Lang): Session[] {
  const hosts = getHosts(lang);
  // Timeless sessions sort after timed ones within their day.
  return liveSessions(hosts, lang).sort(
    (a, b) => a.dayOffset - b.dayOffset || (a.time ?? '~').localeCompare(b.time ?? '~'),
  );
}
