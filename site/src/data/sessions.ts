/** Upcoming workshop sessions for the "Happening today" page.
 *
 *  PLACEHOLDER — these are generated from the real host list so the page has
 *  plausible content to lay out, not a real booking feed. Replace `getSessions`
 *  with a fetch from the booking backend when one exists; the page only needs
 *  the shape below.
 *
 *  Dates are expressed as `dayOffset` (0 = today) rather than absolute dates.
 *  The site is statically built, so any date baked in at build time would be
 *  wrong by the next morning — the browser resolves offsets against its own
 *  clock instead.
 */
import { getHosts, type Host } from './content.ts';
import type { Lang } from '../lib/url.ts';

export type Session = {
  id: string;
  dayOffset: number;
  time: string;
  host: Host;
  title: string;
  place: string;
  /** Berlin district, shown on the feed card. PLACEHOLDER — picked
   *  deterministically until sessions carry a real venue. */
  district: string;
  spots: number;
  price: string;
};

const DISTRICTS = [
  'Mitte', 'Prenzlauer Berg', 'Kreuzberg', 'Neukölln', 'Friedrichshain',
  'Charlottenburg', 'Schöneberg', 'Wedding', 'Moabit', 'Lichtenberg',
];

/** Deterministic, so a rebuild does not reshuffle the schedule. */
const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const START_TIMES = ['10:00', '11:30', '14:00', '16:00', '18:30', '19:00'];

export const DAYS_AHEAD = 21;

export function getSessions(lang: Lang): Session[] {
  const hosts = getHosts(lang);
  const free = { en: 'Free', de: 'Kostenlos' }[lang];
  const sessions: Session[] = [];

  for (let day = 0; day < DAYS_AHEAD; day++) {
    // two to four sessions a day, rotating through the makers
    const count = 2 + (hash(`d${day}`) % 3);
    for (let n = 0; n < count; n++) {
      const host = hosts[(day * 3 + n * 5) % hosts.length];
      const seed = hash(`${day}-${n}-${host.slug}`);
      const priced = seed % 5 !== 0;
      sessions.push({
        id: `${day}-${n}-${host.slug}`,
        dayOffset: day,
        time: START_TIMES[seed % START_TIMES.length],
        host,
        title: host.specialty,
        place: host.place,
        district: DISTRICTS[seed % DISTRICTS.length],
        spots: 2 + (seed % 9),
        price: priced ? `€${25 + (seed % 6) * 10}` : free,
      });
    }
  }

  return sessions.sort((a, b) =>
    a.dayOffset - b.dayOffset || a.time.localeCompare(b.time),
  );
}
