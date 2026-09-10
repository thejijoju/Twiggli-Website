/** The search-facing pages: /workshops/, one page per activity, one page
 *  per host — in both languages.
 *
 *  Why these exist: the site had 25 URLs, and every workshop lived on one
 *  of them, the happening-today calendar, behind #anchors. Nobody searching
 *  "Töpferkurs Berlin" or "rug tufting workshop Berlin" could be sent to a
 *  page about that, because there was none. These pages give each activity
 *  and each host a URL of its own with the query in the title, the heading
 *  and the first paragraph, and the host's real upcoming dates and times
 *  underneath — built from the same feed the calendar reads, so a date on a
 *  search result is a date the host is actually running.
 *
 *  Copy lives here so the three page components stay thin. The German
 *  headings are written for what people type, not translated from the
 *  English: "Töpferkurs Berlin" is the search, "Keramik-Workshops" is the
 *  category, and the title carries both. */

import { filterCopy, getHosts, type ActivityKey, type Host } from './content.ts';
import { berlinTodayMs, getOnRequestAll, getSessions, slugify, type OnRequestWorkshop, type Session } from './sessions.ts';
import { href, type Lang } from '../lib/url.ts';

/** The canonical origin, for structured data and social tags, which need
 *  absolute URLs. astro.config.mjs carries the same value as `site`. */
export const SITE = 'https://www.twiggli.com';
export const absolute = (path: string): string => new URL(path, SITE).href;

/** The order the activities are listed in, everywhere. Same as the
 *  calendar's pills. */
export const ACTIVITY_ORDER: ActivityKey[] = [
  'ceramics', 'art', 'craft', 'food', 'photography', 'wellbeing', 'music',
];

export type ActivityCopy = {
  /** Short label — nav, crumbs, cards. */
  short: string;
  /** The page's <title>. Search phrase first, brand last. */
  title: string;
  h1: string;
  lede: string;
  /** Meta description, ≤160 characters. */
  description: string;
};

export const activityCopy: Record<Lang, Record<ActivityKey, ActivityCopy>> = {
  en: {
    ceramics: {
      short: 'Pottery & ceramics',
      title: 'Pottery classes & ceramics workshops in Berlin — dates & booking | Twiggli',
      h1: 'Pottery classes & ceramics workshops in Berlin',
      lede: 'Wheel throwing, handbuilding, glazing and open studio time with independent Berlin ceramicists — real upcoming dates, prices and booking links, from Neukölln to Kreuzberg.',
      description: 'Pottery classes in Berlin: wheel throwing, handbuilding and glazing with independent ceramicists. Upcoming dates, times, prices and direct booking.',
    },
    art: {
      short: 'Art & printmaking',
      title: 'Painting, drawing & printmaking workshops in Berlin — dates & booking | Twiggli',
      h1: 'Painting, drawing & printmaking workshops in Berlin',
      lede: 'Linocut, screen printing, cyanotype, portrait drawing, urban sketching walks, acrylic and alcohol ink — art classes in Berlin with real dates and prices.',
      description: 'Art classes in Berlin: linocut, screen printing, cyanotype, portrait drawing, sketching walks and painting. Upcoming dates, prices and booking.',
    },
    craft: {
      short: 'Craft & making',
      title: 'Craft & DIY workshops in Berlin — candles, tufting, soap, forging & more | Twiggli',
      h1: 'Craft & DIY workshops in Berlin',
      lede: 'Candle making, rug tufting, soap and natural cosmetics, quilting, knitting, blacksmithing, whittling and silversmithing — hands-on craft workshops in Berlin with upcoming dates.',
      description: 'Craft workshops in Berlin: candle making, rug tufting, soap, quilting, knitting, blacksmithing, whittling, silversmithing. Real dates, prices and booking.',
    },
    food: {
      short: 'Food & drink',
      title: 'Cooking classes & food workshops in Berlin — sushi, pasta, tastings & more | Twiggli',
      h1: 'Cooking classes & food workshops in Berlin',
      lede: 'Sushi and kimchi, pasta and sourdough, coffee roasting, foraging walks, gin and spirit tastings — food and drink workshops in Berlin with real dates.',
      description: 'Cooking classes in Berlin: sushi, kimchi, pasta, sourdough, coffee roasting, foraging and spirit tastings. Upcoming dates, prices and booking.',
    },
    photography: {
      short: 'Photography',
      title: 'Photography workshops in Berlin — analog, darkroom & cyanotype | Twiggli',
      h1: 'Photography workshops in Berlin',
      lede: 'Analog film, darkroom and cyanotype, creative phone photography for teams — photography classes in Berlin with upcoming dates.',
      description: 'Photography workshops in Berlin: analog film, darkroom, cyanotype and creative photography sessions. Upcoming dates, prices and booking.',
    },
    wellbeing: {
      short: 'Wellbeing',
      title: 'Wellbeing & mindfulness workshops in Berlin — breathwork, writing & more | Twiggli',
      h1: 'Wellbeing & mindfulness workshops in Berlin',
      lede: 'Breathwork, movement, voice, meditation and creative writing — wellbeing sessions in Berlin for individuals and teams.',
      description: 'Wellbeing workshops in Berlin: breathwork, movement, voice, mindfulness and creative writing, for individuals and teams. Dates and booking.',
    },
    music: {
      short: 'Music & rhythm',
      title: 'Music & rhythm workshops in Berlin — handpan, cajon, percussion | Twiggli',
      h1: 'Music & rhythm workshops in Berlin',
      lede: 'Handpan, cajon, percussion and drumming workshops in Berlin — upcoming dates and booking.',
      description: 'Music workshops in Berlin: handpan, cajon, percussion and drumming classes with upcoming dates, prices and booking.',
    },
  },
  de: {
    ceramics: {
      short: 'Töpfern & Keramik',
      title: 'Töpferkurs Berlin — Keramik-Workshops mit Terminen & Buchung | Twiggli',
      h1: 'Töpferkurse & Keramik-Workshops in Berlin',
      lede: 'Drehscheibe, Aufbaukeramik, Glasieren und offene Werkstatt bei unabhängigen Berliner Keramikerinnen und Keramikern — echte Termine, Preise und Buchungslinks, von Neukölln bis Kreuzberg.',
      description: 'Töpferkurse in Berlin: Drehscheibe, Aufbaukeramik und Glasieren bei unabhängigen Keramik-Studios. Kommende Termine, Uhrzeiten, Preise und direkte Buchung.',
    },
    art: {
      short: 'Kunst & Druck',
      title: 'Malkurs & Zeichenkurs Berlin — Kunst- und Druck-Workshops mit Terminen | Twiggli',
      h1: 'Malkurse, Zeichenkurse & Druck-Workshops in Berlin',
      lede: 'Linoldruck, Siebdruck, Cyanotypie, Porträtzeichnen, Zeichenspaziergänge, Acryl und Alkoholtinte — Kunstkurse in Berlin mit echten Terminen und Preisen.',
      description: 'Kunstkurse in Berlin: Linoldruck, Siebdruck, Cyanotypie, Porträtzeichnen, Zeichenspaziergänge und Malen. Kommende Termine, Preise und Buchung.',
    },
    craft: {
      short: 'Handwerk & Kreatives',
      title: 'Kreativ-Workshop Berlin — Kerzen, Tufting, Seife, Schmieden & mehr | Twiggli',
      h1: 'Kreativ-Workshops & DIY-Kurse in Berlin',
      lede: 'Kerzen gießen, Teppiche tuften, Seife und Naturkosmetik, Quilten, Stricken, Schmieden, Schnitzen und Silberschmieden — Handwerks-Workshops in Berlin mit kommenden Terminen.',
      description: 'Kreativ-Workshops in Berlin: Kerzen gießen, Tufting, Seife, Quilten, Stricken, Schmieden, Schnitzen, Silberschmieden. Echte Termine, Preise und Buchung.',
    },
    food: {
      short: 'Kochen & Genuss',
      title: 'Kochkurs Berlin — Sushi, Pasta, Sauerteig, Tastings & mehr | Twiggli',
      h1: 'Kochkurse & Genuss-Workshops in Berlin',
      lede: 'Sushi und Kimchi, Pasta und Sauerteig, Kaffee rösten, Wildkräuterwanderungen, Gin- und Spirituosen-Tastings — Food-Workshops in Berlin mit echten Terminen.',
      description: 'Kochkurse in Berlin: Sushi, Kimchi, Pasta, Sauerteig, Kaffee rösten, Wildkräuter und Spirituosen-Tastings. Kommende Termine, Preise und Buchung.',
    },
    photography: {
      short: 'Fotografie',
      title: 'Fotokurs Berlin — Analogfotografie, Dunkelkammer & Cyanotypie | Twiggli',
      h1: 'Fotokurse & Fotografie-Workshops in Berlin',
      lede: 'Analogfilm, Dunkelkammer und Cyanotypie, kreative Handyfotografie für Teams — Fotografie-Workshops in Berlin mit kommenden Terminen.',
      description: 'Fotokurse in Berlin: Analogfilm, Dunkelkammer, Cyanotypie und kreative Fotografie-Sessions. Kommende Termine, Preise und Buchung.',
    },
    wellbeing: {
      short: 'Achtsamkeit',
      title: 'Achtsamkeit Berlin — Atemarbeit, Meditation & kreatives Schreiben | Twiggli',
      h1: 'Achtsamkeits- & Wellbeing-Workshops in Berlin',
      lede: 'Atemarbeit, Bewegung, Stimme, Meditation und kreatives Schreiben — Wellbeing-Sessions in Berlin für Einzelne und Teams.',
      description: 'Wellbeing-Workshops in Berlin: Atemarbeit, Bewegung, Stimme, Achtsamkeit und kreatives Schreiben, für Einzelne und Teams. Termine und Buchung.',
    },
    music: {
      short: 'Musik & Rhythmus',
      title: 'Handpan & Cajon Workshop Berlin — Percussion-Kurse mit Terminen | Twiggli',
      h1: 'Musik- & Rhythmus-Workshops in Berlin',
      lede: 'Handpan, Cajon, Percussion und Trommeln — Musik-Workshops in Berlin mit kommenden Terminen und Buchung.',
      description: 'Musik-Workshops in Berlin: Handpan, Cajon, Percussion und Trommelkurse mit kommenden Terminen, Preisen und Buchung.',
    },
  },
};

export const hubCopy: Record<Lang, { title: string; h1: string; lede: string; description: string; kicker: string }> = {
  en: {
    kicker: 'Find a workshop',
    title: 'Workshops in Berlin — pottery, cooking, crafts, art & more | Twiggli',
    h1: 'Workshops in Berlin',
    lede: 'Every class our hosts run in Berlin, by activity: ceramics, art and printmaking, crafts, cooking and tastings, photography, wellbeing and music. Real dates, real prices, booked straight with the host.',
    description: 'Workshops in Berlin by activity: pottery, art and printmaking, crafts, cooking, photography, wellbeing and music. Upcoming dates, prices and direct booking with independent hosts.',
  },
  de: {
    kicker: 'Workshop finden',
    title: 'Workshops in Berlin — Töpfern, Kochen, Kreativkurse, Kunst & mehr | Twiggli',
    h1: 'Workshops in Berlin',
    lede: 'Alle Kurse unserer Gastgeber in Berlin, nach Aktivität: Keramik, Kunst und Druck, Handwerk, Kochen und Tastings, Fotografie, Achtsamkeit und Musik. Echte Termine, echte Preise, direkt beim Host gebucht.',
    description: 'Workshops in Berlin nach Aktivität: Töpfern, Kunst und Druck, Kreativkurse, Kochkurse, Fotografie, Achtsamkeit und Musik. Kommende Termine, Preise und direkte Buchung bei unabhängigen Hosts.',
  },
};

/** Labels the three page components share. */
export const pageCopy = {
  en: {
    crumbsRoot: 'Workshops',
    inBerlin: 'Workshop in Berlin',
    upcoming: 'Upcoming dates & times',
    nextDates: 'Next dates',
    onRequest: 'On request',
    onRequestNote: 'Runs whenever you ask — the host sets a date around you.',
    noDates: 'No public dates published right now. Private sessions for groups run on request.',
    request: 'Request a private session',
    inquire: 'Inquire',
    book: 'Book',
    requestBooking: 'Request to book',
    soldOut: 'Sold out',
    waitingList: 'Waiting list',
    spots: 'spots left',
    timeTba: 'time when booking',
    today: 'Today',
    tomorrow: 'Tomorrow',
    calendar: 'See every workshop in Berlin on the calendar',
    moreIn: (short: string) => `More ${short.toLowerCase()} workshops in Berlin`,
    hosts: (n: number) => (n === 1 ? '1 host' : `${n} hosts`),
    dates: (n: number) => (n === 1 ? '1 upcoming date' : `${n} upcoming dates`),
    next: 'Next',
    allHosts: 'All hosts, A–Z',
    otherActivities: 'Other activities',
    studio: 'Studio', group: 'Group', duration: 'Length', place: 'Where', languages: 'Languages', price: 'Price',
    perPerson: 'per person',
    priceUnknown: 'On request',
    free: 'Free',
  },
  de: {
    crumbsRoot: 'Workshops',
    inBerlin: 'Workshop in Berlin',
    upcoming: 'Kommende Termine & Uhrzeiten',
    nextDates: 'Nächste Termine',
    onRequest: 'Auf Anfrage',
    onRequestNote: 'Läuft, wann du willst — der Host legt den Termin mit dir fest.',
    noDates: 'Gerade keine öffentlichen Termine. Private Sessions für Gruppen laufen auf Anfrage.',
    request: 'Private Session anfragen',
    inquire: 'Termin anfragen',
    book: 'Buchen',
    requestBooking: 'Buchung anfragen',
    soldOut: 'Ausgebucht',
    waitingList: 'Warteliste',
    spots: 'Plätze frei',
    timeTba: 'Uhrzeit bei Buchung',
    today: 'Heute',
    tomorrow: 'Morgen',
    calendar: 'Alle Workshops in Berlin im Kalender',
    moreIn: (short: string) => `Mehr ${short} in Berlin`,
    hosts: (n: number) => (n === 1 ? '1 Gastgeber' : `${n} Gastgeber`),
    dates: (n: number) => (n === 1 ? '1 kommender Termin' : `${n} kommende Termine`),
    next: 'Nächster',
    allHosts: 'Alle Gastgeber, A–Z',
    otherActivities: 'Andere Aktivitäten',
    studio: 'Studio', group: 'Gruppe', duration: 'Dauer', place: 'Wo', languages: 'Sprachen', price: 'Preis',
    perPerson: 'pro Person',
    priceUnknown: 'Auf Anfrage',
    free: 'Kostenlos',
  },
} satisfies Record<Lang, unknown>;

/* ── URLs ─────────────────────────────────────────────────────────────── */

export const hubHref = (lang: Lang): string => href(lang, '/workshops/');
export const activityHref = (lang: Lang, activity: ActivityKey): string =>
  href(lang, `/workshops/${activity}/`);
export const hostHref = (lang: Lang, host: Pick<Host, 'slug' | 'activity'>): string =>
  href(lang, `/workshops/${host.activity}/${host.slug}/`);

/* ── Dates ────────────────────────────────────────────────────────────── */

const isoDay = (dayOffset: number): string =>
  new Date(berlinTodayMs() + dayOffset * 86400000).toISOString().slice(0, 10);

/** Berlin's UTC offset on a given day, as "+02:00" — the feed stores wall
 *  clock times, and schema.org wants to know which wall. */
const berlinOffset = (date: string): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Berlin',
    timeZoneName: 'longOffset',
  }).formatToParts(new Date(`${date}T12:00:00Z`));
  const name = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+01:00';
  const offset = name.replace('GMT', '');
  return offset === '' ? '+00:00' : offset;
};

/** An ISO 8601 start for schema.org: the date alone when the host only
 *  reveals the hour at checkout, else date, time and the Berlin offset. */
export const sessionIso = (s: Pick<Session, 'dayOffset' | 'time'>): string => {
  const date = isoDay(s.dayOffset);
  return s.time ? `${date}T${s.time}:00${berlinOffset(date)}` : date;
};

/** "Sat 13 Sep" / "Sa., 13. Sep." — with Today / Tomorrow for the first two
 *  days, as the calendar does. */
export const formatDay = (dayOffset: number, lang: Lang): string => {
  const t = pageCopy[lang];
  if (dayOffset === 0) return t.today;
  if (dayOffset === 1) return t.tomorrow;
  return new Date(berlinTodayMs() + dayOffset * 86400000).toLocaleDateString(
    lang === 'de' ? 'de-DE' : 'en-GB',
    { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' },
  );
};

export const formatWhen = (s: Pick<Session, 'dayOffset' | 'time'>, lang: Lang): string =>
  s.time ? `${formatDay(s.dayOffset, lang)} · ${s.time}` : formatDay(s.dayOffset, lang);

/* ── Per-host and per-activity data ───────────────────────────────────── */

export const sessionsFor = (slug: string, lang: Lang): Session[] =>
  getSessions(lang).filter((s) => s.host.slug === slug);

/** Every on-request workshop a host lists — not the calendar's rotating
 *  window of five, which is a teaser; on the host's own page they all
 *  belong. */
export const onRequestFor = (slug: string, lang: Lang): OnRequestWorkshop[] =>
  getOnRequestAll(lang).filter((o) => o.host.slug === slug);

export const hostsIn = (activity: ActivityKey, lang: Lang): Host[] =>
  getHosts(lang).filter((h) => h.activity === activity);

/** The next session per host, in calendar order — what a card leads with. */
export const nextSessionByHost = (lang: Lang): Map<string, Session> => {
  const next = new Map<string, Session>();
  for (const s of getSessions(lang)) if (!next.has(s.host.slug)) next.set(s.host.slug, s);
  return next;
};

/* ── Host page copy ───────────────────────────────────────────────────── */

/** A specialty that already names its format — "Graffiti workshops",
 *  "Urban sketching walks", "Guided drink tastings" — should not have
 *  "workshop" bolted on after it. */
const namesFormat = (specialty: string): boolean =>
  /workshop|classes|class\b|sessions|walks|tours|tastings|courses|events|school|studio|kurs|führung|wanderung|session|schule|werkstatt/i.test(specialty);

export const hostTitle = (host: Host, lang: Lang): string => {
  const spec = host.specialty;
  if (lang === 'de') {
    return namesFormat(spec)
      ? `${spec} in Berlin — ${host.name} | Twiggli`
      : `${spec} Workshop in Berlin — ${host.name} | Twiggli`;
  }
  return namesFormat(spec)
    ? `${spec} in Berlin — ${host.name} | Twiggli`
    : `${spec} workshop in Berlin — ${host.name} | Twiggli`;
};

export const hostH1 = (host: Host, lang: Lang): string =>
  lang === 'de' ? `${host.specialty} mit ${host.name}` : `${host.specialty} with ${host.name}`;

/** The first paragraph under the heading: the query in a sentence, then
 *  the facts a searcher scans for — next date, group, length, languages. */
export const hostLede = (host: Host, sessions: Session[], lang: Lang): string => {
  const next = sessions[0];
  const spec = host.specialty;
  const where = host.studio && host.studio !== host.name ? `${host.studio}, ${host.place}` : host.place;
  if (lang === 'de') {
    const open = namesFormat(spec)
      ? `${spec} in Berlin mit ${host.name}`
      : `${spec} — Workshop in Berlin mit ${host.name}`;
    const when = next
      ? `${sessions.length === 1 ? 'Nächster Termin' : `${sessions.length} kommende Termine, der nächste`}: ${formatWhen(next, 'de')}${next.price ? `, ${next.price}` : ''}.`
      : 'Termine auf Anfrage.';
    return `${open}, ${where}. ${when} ${host.group} · ${host.duration} · ${host.languages}.`;
  }
  const open = namesFormat(spec)
    ? `${spec} in Berlin with ${host.name}`
    : `${spec.charAt(0).toLowerCase()}${spec.slice(1)} workshop in Berlin with ${host.name}`;
  const when = next
    ? `${sessions.length === 1 ? 'Next date' : `${sessions.length} upcoming dates, the next`}: ${formatWhen(next, 'en')}${next.price ? `, ${next.price}` : ''}.`
    : 'Dates on request.';
  return `${namesFormat(spec) ? '' : 'Book a '}${open}, ${where}. ${when} ${host.group} · ${host.duration} · ${host.languages}.`;
};

/** Meta description: the lede's opening, cut to fit a result snippet. */
export const hostDescription = (host: Host, sessions: Session[], lang: Lang): string => {
  const lede = hostLede(host, sessions, lang);
  if (lede.length <= 158) return lede;
  const cut = lede.slice(0, 155);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 120))}…`;
};

/** The picture a host page shares as — the reel's poster where there is
 *  one, else the photo — as an absolute URL, or nothing. */
export const hostImage = (host: Host): string | undefined =>
  host.poster ? absolute(host.poster) : host.photo ? absolute(host.photo) : undefined;

/** What the calendar labels the activity — the filter vocabulary, so the
 *  two never disagree. */
export const activityLabel = (activity: ActivityKey, lang: Lang): string =>
  filterCopy[lang].activities[activity];

/* ── Workshop pages: one per class a host runs ────────────────────────── */

export type Workshop = {
  key: string;
  title: string;
  host: Host;
  sessions: Session[];
};

export const workshopHref = (lang: Lang, host: Pick<Host, 'slug' | 'activity'>, key: string): string =>
  href(lang, `/workshops/${host.activity}/${host.slug}/${key}/`);

/** A host's classes, each with all of its upcoming dates, soonest first.
 *  A class with no date in the window has no page — nothing is invented. */
export const workshopsFor = (slug: string, lang: Lang): Workshop[] => {
  const byKey = new Map<string, Workshop>();
  for (const s of sessionsFor(slug, lang)) {
    const w = byKey.get(s.workshopKey);
    if (w) w.sessions.push(s);
    else byKey.set(s.workshopKey, { key: s.workshopKey, title: s.title, host: s.host, sessions: [s] });
  }
  return [...byKey.values()].sort((a, b) => a.sessions[0].dayOffset - b.sessions[0].dayOffset);
};

export const allWorkshops = (lang: Lang): Workshop[] =>
  getHosts(lang).flatMap((h) => workshopsFor(h.slug, lang));

export const workshopTitle = (w: Workshop, lang: Lang): string =>
  lang === 'de'
    ? `${w.title} — ${w.host.specialty} mit ${w.host.name}, Berlin | Twiggli`
    : `${w.title} — ${w.host.specialty} with ${w.host.name}, Berlin | Twiggli`;

export const workshopLede = (w: Workshop, lang: Lang): string => {
  const next = w.sessions[0];
  const n = w.sessions.length;
  const price = next.price ? `, ${next.price}` : '';
  const facts = `${next.duration ?? w.host.duration} · ${next.languages ?? w.host.languages}`;
  if (lang === 'de') {
    const when = n === 1 ? `Termin: ${formatWhen(next, 'de')}${price}.` : `${n} kommende Termine — der nächste ${formatWhen(next, 'de')}${price}.`;
    return `${w.title}: ${w.host.specialty} mit ${w.host.name} in ${next.district}, Berlin. ${when} ${facts}.`;
  }
  const spec = w.host.specialty;
  const what = namesFormat(spec) ? spec : `${spec.charAt(0).toLowerCase()}${spec.slice(1)} workshop`;
  const when = n === 1 ? `Date: ${formatWhen(next, 'en')}${price}.` : `${n} upcoming dates — next ${formatWhen(next, 'en')}${price}.`;
  return `${w.title}: ${namesFormat(spec) ? '' : 'a '}${what} with ${w.host.name} in ${next.district}, Berlin. ${when} ${facts}.`;
};

export const clip = (text: string, max = 158): string => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 3);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 40))}…`;
};

/* ── District pages ───────────────────────────────────────────────────── */

export type District = {
  slug: string;
  name: string;
  hosts: Host[];
  sessions: Session[];
};

/** A venue qualifier after the district folds into its district, as the
 *  calendar's filter does; "Online" is not a place in Berlin. */
const districtName = (s: Session): string => s.district.replace(/\s+St\.\s.*$/, '');
const NOT_A_DISTRICT = new Set(['Online']);

export const districtsFor = (lang: Lang): District[] => {
  const byName = new Map<string, District>();
  for (const s of getSessions(lang)) {
    const name = districtName(s);
    if (NOT_A_DISTRICT.has(name)) continue;
    let d = byName.get(name);
    if (!d) {
      d = { slug: slugify(name), name, hosts: [], sessions: [] };
      byName.set(name, d);
    }
    d.sessions.push(s);
    if (!d.hosts.some((h) => h.slug === s.host.slug)) d.hosts.push(s.host);
  }
  // A host whose address names the district belongs on its page even
  // between programmes.
  for (const h of getHosts(lang)) {
    for (const d of byName.values()) {
      if (h.place.includes(d.name) && !d.hosts.some((x) => x.slug === h.slug)) d.hosts.push(h);
    }
  }
  return [...byName.values()].sort((a, b) => b.sessions.length - a.sessions.length || a.name.localeCompare(b.name));
};

export const districtHref = (lang: Lang, slug: string): string => href(lang, `/workshops/berlin/${slug}/`);

export const districtCopy = (d: District, lang: Lang) => {
  const acts = ACTIVITY_ORDER.filter((a) => d.hosts.some((h) => h.activity === a));
  const shorts = acts.map((a) => activityCopy[lang][a].short);
  const list = shorts.length > 1 ? `${shorts.slice(0, -1).join(', ')} ${lang === 'de' ? 'und' : 'and'} ${shorts[shorts.length - 1]}` : shorts[0] ?? '';
  const t = pageCopy[lang];
  if (lang === 'de') {
    return {
      title: `Workshops in ${d.name}, Berlin — ${shorts.slice(0, 3).join(', ')} | Twiggli`,
      h1: `Workshops in ${d.name}`,
      lede: `Workshops in ${d.name}: ${list} — ${t.hosts(d.hosts.length)}, ${t.dates(d.sessions.length)}, mit Uhrzeiten, Preisen und direkter Buchung beim Host.`,
      description: clip(`Workshops in ${d.name}, Berlin: ${list}. ${t.hosts(d.hosts.length)}, ${t.dates(d.sessions.length)} mit Uhrzeiten, Preisen und Buchung.`),
      sectionTitle: (a: ActivityKey) => activityCopy.de[a].h1.replace(' in Berlin', ` in ${d.name}`),
    };
  }
  return {
    title: `Workshops in ${d.name}, Berlin — ${shorts.slice(0, 3).join(', ')} | Twiggli`,
    h1: `Workshops in ${d.name}`,
    lede: `Workshops in ${d.name}: ${list} — ${t.hosts(d.hosts.length)}, ${t.dates(d.sessions.length)}, with times, prices and direct booking with the host.`,
    description: clip(`Workshops in ${d.name}, Berlin: ${list}. ${t.hosts(d.hosts.length)}, ${t.dates(d.sessions.length)} with times, prices and booking.`),
    sectionTitle: (a: ActivityKey) => activityCopy.en[a].h1.replace(' in Berlin', ` in ${d.name}`),
  };
};

/* ── Occasion pages: weekend, evenings, kids ──────────────────────────── */

export type Occasion = 'weekend' | 'evenings' | 'kids';
export const OCCASIONS: Occasion[] = ['weekend', 'evenings', 'kids'];

const weekday = (s: Session): number =>
  new Date(berlinTodayMs() + s.dayOffset * 86400000).getUTCDay();

export const occasionSessions = (occasion: Occasion, lang: Lang): Session[] => {
  const all = getSessions(lang);
  if (occasion === 'weekend') return all.filter((s) => weekday(s) === 0 || weekday(s) === 6);
  if (occasion === 'evenings') return all.filter((s) => s.time !== undefined && s.time >= '18:00' && weekday(s) >= 1 && weekday(s) <= 5);
  return all.filter((s) => s.kids);
};

export const occasionHref = (lang: Lang, occasion: Occasion): string => href(lang, `/workshops/${occasion}/`);

export const occasionCopy: Record<Lang, Record<Occasion, { short: string; title: string; h1: string; lede: string; description: string; empty: string }>> = {
  en: {
    weekend: {
      short: 'At the weekend',
      title: 'Workshops in Berlin at the weekend — Saturday & Sunday dates, prices, booking | Twiggli',
      h1: 'Workshops in Berlin at the weekend',
      lede: 'Every Saturday and Sunday workshop our hosts run in Berlin over the coming weeks — pottery, cooking, crafts, art and more — with times, prices and direct booking.',
      description: 'Weekend workshops in Berlin: every Saturday and Sunday class from independent hosts — pottery, cooking, crafts, art. Times, prices and booking.',
      empty: 'No weekend dates published right now.',
    },
    evenings: {
      short: 'Evenings, after work',
      title: 'Evening workshops in Berlin — after-work classes from 6 pm | Twiggli',
      h1: 'Evening workshops in Berlin — after work',
      lede: 'Weekday workshops starting at 18:00 or later: pottery, printmaking, cooking, candle making and more, an evening at a time, with times, prices and direct booking.',
      description: 'Evening workshops in Berlin: weekday classes from 6 pm — pottery, printmaking, cooking, candles and more. Times, prices and booking.',
      empty: 'No evening dates published right now.',
    },
    kids: {
      short: 'For kids',
      title: 'Workshops for kids in Berlin — classes for children, dates & booking | Twiggli',
      h1: 'Workshops for kids in Berlin',
      lede: 'Classes designed for children, run by our hosts in Berlin, with dates, prices and booking. Family sessions for groups run on request through any host.',
      description: 'Workshops for kids in Berlin: classes designed for children from independent hosts, with upcoming dates, prices and booking.',
      empty: 'No dates for children published right now — family sessions run on request.',
    },
  },
  de: {
    weekend: {
      short: 'Am Wochenende',
      title: 'Workshops in Berlin am Wochenende — Samstag & Sonntag, Termine & Buchung | Twiggli',
      h1: 'Workshops in Berlin am Wochenende',
      lede: 'Alle Samstags- und Sonntags-Workshops unserer Gastgeber in Berlin in den kommenden Wochen — Töpfern, Kochen, Kreatives, Kunst und mehr — mit Uhrzeiten, Preisen und direkter Buchung.',
      description: 'Wochenend-Workshops in Berlin: alle Samstags- und Sonntagskurse unabhängiger Hosts — Töpfern, Kochen, Kreatives, Kunst. Uhrzeiten, Preise und Buchung.',
      empty: 'Gerade keine Wochenend-Termine veröffentlicht.',
    },
    evenings: {
      short: 'Abends, nach Feierabend',
      title: 'Feierabend-Workshops in Berlin — Kurse ab 18 Uhr | Twiggli',
      h1: 'Feierabend-Workshops in Berlin — abends ab 18 Uhr',
      lede: 'Workshops unter der Woche, die um 18 Uhr oder später beginnen: Töpfern, Druck, Kochen, Kerzen gießen und mehr, ein Abend pro Kurs, mit Uhrzeiten, Preisen und direkter Buchung.',
      description: 'Feierabend-Workshops in Berlin: Kurse unter der Woche ab 18 Uhr — Töpfern, Druck, Kochen, Kerzen und mehr. Uhrzeiten, Preise und Buchung.',
      empty: 'Gerade keine Abend-Termine veröffentlicht.',
    },
    kids: {
      short: 'Für Kinder',
      title: 'Kinder-Workshops in Berlin — Kurse für Kinder, Termine & Buchung | Twiggli',
      h1: 'Kinder-Workshops in Berlin',
      lede: 'Kurse für Kinder bei unseren Gastgebern in Berlin, mit Terminen, Preisen und Buchung. Familien-Sessions für Gruppen laufen bei jedem Host auf Anfrage.',
      description: 'Kinder-Workshops in Berlin: Kurse für Kinder bei unabhängigen Hosts, mit kommenden Terminen, Preisen und Buchung.',
      empty: 'Gerade keine Kinder-Termine veröffentlicht — Familien-Sessions laufen auf Anfrage.',
    },
  },
};

export const hubExtraCopy = {
  en: { byDistrict: 'Workshops by district', byOccasion: 'By occasion', theirWorkshops: 'Their workshops', allDates: 'all dates', backToHost: 'All workshops by', bookingNote: 'Booking opens on the host’s own page.' },
  de: { byDistrict: 'Workshops nach Bezirk', byOccasion: 'Nach Anlass', theirWorkshops: 'Ihre Workshops', allDates: 'alle Termine', backToHost: 'Alle Workshops von', bookingNote: 'Die Buchung läuft über die Seite des Hosts.' },
} satisfies Record<Lang, unknown>;

/** Sessions grouped by day, in order, for the occasion pages. */
export const byDay = (sessions: Session[]): [number, Session[]][] => {
  const groups = new Map<number, Session[]>();
  for (const s of sessions) {
    const g = groups.get(s.dayOffset);
    if (g) g.push(s);
    else groups.set(s.dayOffset, [s]);
  }
  return [...groups.entries()].sort((a, b) => a[0] - b[0]);
};
