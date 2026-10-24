/** Everything the home page shows that comes from data rather than copy:
 *  the rows of real upcoming dates, the search pill's choices, the
 *  activities with a maker's face each, and the wall of makers. Shared by
 *  the live home page (HomePage.astro) and the design options under
 *  /de/preview/ (HomeOption.astro), so every draft shows the same real
 *  dates and hosts. */
import { activitiesOf, filterCopy, getHosts, hasMedia, inActivity, type ActivityKey, type Host } from './content.ts';
import { berlinTodayMs, capPerHostPerDay, getSessions, type Session } from './sessions.ts';
import { ACTIVITY_ORDER, occasionCopy, occasionHref, occasionSessions } from './seo.ts';
import { ui } from './i18n.ts';
import { homeDiscoverCopy } from './homeDiscover.ts';
import { homeFindCopy } from './homeFind.ts';
import { makerPictures } from './makerPictures.ts';
import { href, withBase, LANG_META, type Lang } from '../lib/url.ts';
import { bandsFor, priceFilterCopy } from './priceFilter.ts';

export type HomeRow = {
  id: 'this-week' | 'weekend' | 'evenings';
  title: string; hand: string; sub: string;
  link: string; linkText: string;
  list: Session[];
};

/* A picture per activity — the same clips the old activity row used. */
const catPic: Record<string, string> = {
  ceramics: 'ceramic-kingdom', art: 'rebeca', craft: 'tufttuft', food: 'jem-sushi',
  photography: 'anne', wellbeing: 'sarah', music: 'beat-etage',
};
export const activityThumb = (a: string): string => withBase(`/video/thumbs/${catPic[a]}.jpg`);
/** The square workshop photos the mail and the old home page use. */
export const mailPic = (name: string): string => withBase(`/img/mail/${name}.jpg`);
/** A card's picture: the workshop's own reel poster, the host's photo, or
 *  the picture from the host's booking page. */
export const cardImage = (s: Session): string | undefined => s.host.poster ?? s.host.photo ?? s.image;

/** Hosts whose card on the home page shows their main reel rather than the
 *  one cut for this workshop — where the workshop's own was the weaker
 *  picture (Jirel, 23.10.26). */
const PREFER_MAIN_REEL = new Set(['galleria-lucia']);

/** A host's picture for introducing them (makerPictures.ts), or nothing
 *  where we have none we know we may use. */
export const makerPic = (h: Host): string | undefined =>
  makerPictures[h.slug] === 'photo' ? h.photo : makerPictures[h.slug] === 'reel' ? h.poster : undefined;

export function getHomeData(lang: Lang) {
  const d = homeDiscoverCopy[lang];
  const find = homeFindCopy[lang];
  const occ = occasionCopy[lang];
  const f = filterCopy[lang];
  const locale = LANG_META[lang].locale;
  const calendarHref = href(lang, '/happening-today/');
  const hosts = getHosts(lang);

  /* ── The dates ───────────────────────────────────────────────────────
     Classes only (an open studio day is for people who already know the
     craft), nothing sold out, and only cards with a picture to show. */
  const bookable = (s: Session) => !s.openStudio && !s.soldOut && !!(s.host.poster || s.host.photo || s.image);
  const all = getSessions(lang).filter(bookable);
  const shownHosts = new Set<string>();
  /** Up to `max` dates, one per host, preferring hosts no earlier row has
   *  shown — variety sells the calendar better than one busy studio. */
  const pick = (list: Session[], max = 8) => {
    const fresh = list.filter((s) => !shownHosts.has(s.host.slug));
    const out: Session[] = [];
    const seen = new Set<string>();
    for (const s of [...fresh, ...list]) {
      if (seen.has(s.host.slug)) continue;
      seen.add(s.host.slug);
      out.push(s);
      if (out.length === max) break;
    }
    out.sort((a, b) => a.dayOffset - b.dayOffset || (a.time ?? '~').localeCompare(b.time ?? '~'));
    for (const s of out) shownHosts.add(s.host.slug);
    return out;
  };
  const soon = (s: Session) => s.dayOffset <= 13;
  const rows: HomeRow[] = ([
    { id: 'this-week', title: d.weekTitle, hand: d.weekHand, sub: d.weekSub, link: calendarHref, linkText: ui(lang).teaser.cta,
      list: pick(all.filter((s) => s.dayOffset <= 6)) },
    { id: 'weekend', title: occ.weekend.short, hand: '', sub: '', link: occasionHref(lang, 'weekend'), linkText: d.seeAll,
      list: pick(occasionSessions('weekend', lang).filter((s) => bookable(s) && soon(s))) },
    { id: 'evenings', title: occ.evenings.short, hand: '', sub: '', link: occasionHref(lang, 'evenings'), linkText: d.seeAll,
      list: pick(occasionSessions('evenings', lang).filter((s) => bookable(s) && soon(s))) },
  ] as HomeRow[]).filter((r) => r.list.length >= 3);

  const dayOf = (offset: number) => new Date(berlinTodayMs() + offset * 86400000);

  /* ── The search pill ─────────────────────────────────────────────────
     The same choices the calendar offers, so every combination lands on a
     filter that exists there: its activities, its districts (folded the
     way DayPicker folds them), and the next two weeks of days. */
  const calSessions = capPerHostPerDay(getSessions(lang));
  const presentActivities = new Set(calSessions.flatMap((s) => activitiesOf(s.host)));
  const whatOptions = ACTIVITY_ORDER.filter((a) => presentActivities.has(a)).map((a) => ({ value: a, label: f.activities[a] }));
  const districtOf = (s: Session): string => s.district.replace(/\s+St\.\s.*$/, '');
  const whereOptions = [...new Set(calSessions.map(districtOf))].sort((a, b) => a.localeCompare(b, locale));
  const priceOptions = bandsFor(calSessions.map((s) => s.price)).map((b) => ({ value: b.id, label: priceFilterCopy[lang].bands[b.id] }));
  const whenOptions = Array.from({ length: 14 }, (_, i) => ({
    value: dayOf(i).toISOString().slice(0, 10),
    label: i === 0 ? ui(lang).teaser.today : i === 1 ? ui(lang).teaser.tomorrow
      : dayOf(i).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }),
  }));

  const chips = [
    { label: find.today, href: calendarHref, icon: '⚡', tint: '#e6ddff' },
    { label: occ.weekend.short, href: occasionHref(lang, 'weekend'), icon: '🎉', tint: '#ffe1d3' },
    { label: occ.evenings.short, href: occasionHref(lang, 'evenings'), icon: '🌙', tint: '#dbe8ff' },
    { label: occ.kids.short, href: occasionHref(lang, 'kids'), icon: '🧸', tint: '#ffd9ee' },
    { label: find.team, href: href(lang, '/corporatebookings/'), icon: '🙌', tint: '#d9f3ea' },
    { label: find.solo, href: calendarHref, icon: '🙋', tint: '#ffe9a8' },
  ];

  /* ── Activities and makers ───────────────────────────────────────── */
  const counts = new Map<string, number>();
  for (const h of hosts) for (const a of activitiesOf(h)) counts.set(a, (counts.get(a) ?? 0) + 1);
  /* Each activity with one maker's own photo. */
  const activityFace = (a: ActivityKey): Host | undefined =>
    hosts.find((h) => makerPic(h) && h.activity === a) ?? hosts.find((h) => makerPic(h) && inActivity(h, a));

  /* A date card's media: the host's reel and its poster (the workshop's own
     cut where there is one), else their photo, else the picture from their
     booking page. */
  const mainBySlug = new Map(hosts.map((h) => [h.slug, h]));
  const cardMedia = (s: Session): { video?: string; poster?: string; still?: string } => {
    const reelHost = PREFER_MAIN_REEL.has(s.host.slug) ? mainBySlug.get(s.host.slug) ?? s.host : s.host;
    return reelHost.video
      ? { video: reelHost.video, poster: reelHost.poster }
      : { still: s.host.photo ?? s.image ?? s.host.poster };
  };

  /* Ten makers with a picture we may use, those with dates coming up first,
     taken round-robin across the activities so the wall is not all pottery. */
  const withDates = new Set(all.map((s) => s.host.slug));
  const faces = hosts.filter((h) => makerPic(h));
  const byActivity = new Map<string, Host[]>();
  for (const h of [...faces.filter((h) => withDates.has(h.slug)), ...faces.filter((h) => !withDates.has(h.slug))]) {
    const list = byActivity.get(h.activity) ?? [];
    list.push(h);
    byActivity.set(h.activity, list);
  }
  const makers: Host[] = [];
  while (makers.length < 10 && [...byActivity.values()].some((l) => l.length)) {
    for (const a of ACTIVITY_ORDER) {
      const next = byActivity.get(a)?.shift();
      if (next && makers.length < 10) makers.push(next);
    }
  }
  const listed = hosts.filter(hasMedia).length;

  return {
    hosts, all, rows, calendarHref, dayOf,
    whatOptions, whenOptions, whereOptions, priceOptions, chips,
    counts, activityFace, makers, listed, cardMedia,
  };
}
