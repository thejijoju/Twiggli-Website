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
import { getHosts, getWorkshopReel, type Host } from './content.ts';
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
const withWorkshopReel = (host: Host, slug: string, title: string): Host => {
  const reel = getWorkshopReel(slug, title);
  return reel ? { ...host, video: reel.video, poster: reel.poster } : host;
};

/** Real sessions scraped weekly from hosts' public schedules — see
 *  scripts/update-workshops.mjs. A host with real sessions in the window
 *  drops out of the placeholder rotation entirely, and their Book button
 *  leads to the host's own booking page. */
function liveSessions(hosts: Host[], lang: Lang): Session[] {
  const today = berlinTodayMs();
  const bySlug = new Map(hosts.map((h) => [h.slug, h]));
  const sessions: Session[] = [];

  for (const w of (liveData.workshops ?? []) as LiveWorkshop[]) {
    const host = bySlug.get(w.slug);
    if (!host) continue;
    const dayOffset = Math.round((Date.parse(w.date) - today) / 86400000);
    if (dayOffset < 0 || dayOffset >= DAYS_AHEAD) continue;
    sessions.push({
      id: `live-${w.slug}-${w.date}-${w.time ?? 'tba'}`,
      dayOffset,
      time: w.time,
      host: withWorkshopReel(host, w.slug, w.title),
      title: lang === 'en' && w.titleEn ? w.titleEn : w.title,
      place: host.place,
      // Real listings never get an invented district — the studio name is
      // accurate where the scrape carries no location.
      district: w.district ?? host.studio ?? host.place,
      bookUrl: w.url,
      ...(w.duration ? { duration: w.duration } : {}),
      ...(w.price ? { price: w.price } : {}),
      ...(typeof w.spots === 'number' ? { spots: w.spots } : {}),
      ...(w.image ? { image: w.image } : {}),
      ...(w.request ? { request: true } : {}),
      ...(w.kids ? { kids: true } : {}),
      ...(w.soldOut ? { soldOut: true } : {}),
    });
  }

  // Weekly-recurring classes: one session per matching weekday in the
  // window. berlinTodayMs is UTC midnight of the Berlin date, so getUTCDay
  // on it (plus whole days) is the Berlin weekday.
  for (const r of ((liveData as { recurring?: LiveRecurring[] }).recurring ?? [])) {
    const host = bySlug.get(r.slug);
    if (!host) continue;
    const wanted = new Set(r.weekdays.map((d) => WEEKDAY_INDEX[d]));
    for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
      const dow = new Date(today + dayOffset * 86400000).getUTCDay();
      if (!wanted.has(dow)) continue;
      sessions.push({
        id: `rec-${r.slug}-${hash(r.title)}-${dayOffset}`,
        dayOffset,
        time: r.time,
        host: withWorkshopReel(host, r.slug, r.title),
        title: lang === 'en' && r.titleEn ? r.titleEn : r.title,
        place: host.place,
        district: r.district ?? host.studio ?? host.place,
        bookUrl: r.url,
        ...(r.duration ? { duration: r.duration } : {}),
        ...(r.price ? { price: r.price } : {}),
        ...(r.kids ? { kids: true } : {}),
        ...(r.request ? { request: true } : {}),
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
