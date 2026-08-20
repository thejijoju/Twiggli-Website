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
import { getHosts, type Host } from './content.ts';
import type { Lang } from '../lib/url.ts';
import liveData from './live-workshops.json';

export type Session = {
  id: string;
  dayOffset: number;
  time: string;
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
};

/** Shapes written by scripts/update-workshops.mjs. */
type LiveWorkshop = {
  slug: string;
  sourceUrl: string;
  title: string;
  date: string; // YYYY-MM-DD, Europe/Berlin
  time: string; // HH:MM
  duration?: string;
  price?: string;
  district?: string;
  url: string;
};

/** A weekly-recurring class (e.g. "Dienstags 18–20 Uhr") — expanded into a
 *  dated session on every matching weekday of the visible window at build
 *  time, so the daily rebuild keeps it rolling forever. */
type LiveRecurring = Omit<LiveWorkshop, 'date'> & {
  weekdays: string[]; // 'mon'…'sun'
};

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
export const DAYS_AHEAD = 90;

/** Today in Berlin, as a UTC-midnight timestamp — the base the scraped
 *  absolute dates are converted to day offsets against. Build-time, so the
 *  deploy workflow rebuilds the site daily to keep offsets true. */
const berlinTodayMs = (): number =>
  Date.parse(new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' }));

/** Real sessions scraped weekly from hosts' public schedules — see
 *  scripts/update-workshops.mjs. A host with real sessions in the window
 *  drops out of the placeholder rotation entirely, and their Book button
 *  leads to the host's own booking page. */
function liveSessions(hosts: Host[]): Session[] {
  const today = berlinTodayMs();
  const bySlug = new Map(hosts.map((h) => [h.slug, h]));
  const sessions: Session[] = [];

  for (const w of (liveData.workshops ?? []) as LiveWorkshop[]) {
    const host = bySlug.get(w.slug);
    if (!host) continue;
    const dayOffset = Math.round((Date.parse(w.date) - today) / 86400000);
    if (dayOffset < 0 || dayOffset >= DAYS_AHEAD) continue;
    sessions.push({
      id: `live-${w.slug}-${w.date}-${w.time}`,
      dayOffset,
      time: w.time,
      host,
      title: w.title,
      place: host.place,
      // Real listings never get an invented district — the studio name is
      // accurate where the scrape carries no location.
      district: w.district ?? host.studio ?? host.place,
      bookUrl: w.url,
      ...(w.duration ? { duration: w.duration } : {}),
      ...(w.price ? { price: w.price } : {}),
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
        host,
        title: r.title,
        place: host.place,
        district: r.district ?? host.studio ?? host.place,
        bookUrl: r.url,
        ...(r.duration ? { duration: r.duration } : {}),
        ...(r.price ? { price: r.price } : {}),
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
  return liveSessions(hosts).sort(
    (a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time),
  );
}
