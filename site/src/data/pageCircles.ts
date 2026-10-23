/** The round pictures at the top of the main pages (PageCircles.astro),
 *  like the home page's: four per page, picked from what the page is about.
 *  Reel posters are swapped for their 240px square thumbnails
 *  (scripts/poster-thumbs.mjs), so four circles cost a few kilobytes. */
import { getHosts, inActivity, type ActivityKey, type Host } from './content.ts';
import { getSessions } from './sessions.ts';
import { spaces } from './spaces.ts';
import { activityThumb, makerPic } from './homeData.ts';
import { withBase, type Lang } from '../lib/url.ts';

/** The small square of a reel poster, else the picture as it is. */
const small = (src?: string): string | undefined => {
  if (!src) return undefined;
  const m = src.match(/\/video\/([^/]+)-poster\.jpg$/);
  return m ? withBase(`/video/thumbs/${m[1]}.jpg`) : src;
};
const hostPic = (h: Host) => small(h.poster ?? h.photo);
const four = (list: (string | undefined)[]) => [...new Set(list.filter((x): x is string => !!x))].slice(0, 4);

export const circlesFor = {
  /** The workshops hub and the blog: one picture per activity. */
  activities: () => four((['ceramics', 'food', 'craft', 'art'] as const).map((a) => activityThumb(a))),
  /** An activity page: its own hosts. */
  activity: (a: ActivityKey, lang: Lang) => four(getHosts(lang).filter((h) => inActivity(h, a)).map(hostPic)),
  /** The calendar: whoever is on today, then tomorrow. */
  calendar: (lang: Lang) => four(getSessions(lang).filter((s) => s.dayOffset <= 1 && !s.openStudio).map((s) => small(s.host.poster ?? s.host.photo))),
  /** Group bookings: hosts who take the biggest groups. */
  teams: (lang: Lang) => four(getHosts(lang).filter((h) => h.groupRange[1] >= 20).sort((a, b) => b.groupRange[1] - a.groupRange[1]).map(hostPic)),
  /** Studio rental: the hosts whose rooms are listed. */
  spaces: (lang: Lang) => {
    const bySlug = new Map(getHosts(lang).map((h) => [h.slug, h]));
    return four(spaces.map((s) => (s.slug ? bySlug.get(s.slug) : undefined)).map((h) => (h ? hostPic(h) : undefined)));
  },
  /** Becoming a host, about us: makers in pictures they gave us. */
  makers: (lang: Lang) => four(getHosts(lang).filter((h) => makerPic(h)).map((h) => small(makerPic(h)))),
};
