/** Video pages: one page per host reel, with the reel as the main thing on
 *  the page, so Google can show it as a video result (Search Console:
 *  "Video isn't on a watch page" for the reels on host and class pages,
 *  Jirel 09.11.26). English and German only, like the blog.
 *
 *  Start with the first fifteen; add a host by adding a line. The reel,
 *  the copy and the dates all come from the host's own data — the page
 *  invents nothing. `seconds` is the reel's length (ffprobe), `uploaded`
 *  the day the file landed in the repo. */
import { getHosts } from './content.ts';
import { href, type Lang } from '../lib/url.ts';

export type VideoEntry = { slug: string; seconds: number; uploaded: string };

export const videoEntries: VideoEntry[] = [
  { slug: 'pia', seconds: 7, uploaded: '2026-10-12' },
  { slug: 'angelo', seconds: 42, uploaded: '2026-10-12' },
  { slug: 'munio', seconds: 15, uploaded: '2026-10-12' },
  { slug: 'pigi', seconds: 29, uploaded: '2026-11-03' },
  { slug: 'ceramic-kingdom', seconds: 22, uploaded: '2026-10-12' },
  { slug: 'druckrausch', seconds: 17, uploaded: '2026-10-12' },
  { slug: 'studio32', seconds: 24, uploaded: '2026-10-12' },
  { slug: 'dirt', seconds: 13, uploaded: '2026-10-12' },
  { slug: 'helka', seconds: 13, uploaded: '2026-10-12' },
  { slug: 'pastamadre', seconds: 18, uploaded: '2026-10-12' },
  { slug: 'daisuki', seconds: 15, uploaded: '2026-10-12' },
  { slug: 'galleria-lucia', seconds: 12, uploaded: '2026-10-12' },
  { slug: 'loom-lab', seconds: 11, uploaded: '2026-10-12' },
  { slug: 'jem', seconds: 8, uploaded: '2026-10-12' },
  { slug: 'anne', seconds: 8, uploaded: '2026-10-12' },
];

export const VIDEO_LANGS: Lang[] = ['en', 'de'];

/** Only hosts that are live (not archived, not in preview) and still have
 *  a reel get a page. */
export const videoHosts = (lang: Lang) => {
  const hosts = new Map(getHosts(lang).map((h) => [h.slug, h]));
  return videoEntries
    .map((e) => ({ entry: e, host: hosts.get(e.slug) }))
    .filter((v): v is { entry: VideoEntry; host: NonNullable<typeof v.host> } => !!v.host?.video);
};

export const hasVideoPage = (slug: string): boolean =>
  videoHosts('en').some((v) => v.host.slug === slug);

export const videoHref = (lang: Lang, slug: string): string =>
  href(VIDEO_LANGS.includes(lang) ? lang : 'en', `/videos/${slug}/`);

export const videosIndexHref = (lang: Lang): string =>
  href(VIDEO_LANGS.includes(lang) ? lang : 'en', '/videos/');

/** ISO 8601 duration, as schema.org wants it: 42 → "PT42S". */
export const isoDuration = (seconds: number): string =>
  seconds >= 60 ? `PT${Math.floor(seconds / 60)}M${seconds % 60}S` : `PT${seconds}S`;

export const videoCopy = {
  en: {
    kicker: 'Video',
    title: (specialty: string, name: string) => `${specialty} with ${name} in Berlin — video | Twiggli`,
    h1: (specialty: string, name: string) => `${specialty} with ${name}: a look inside the workshop`,
    description: (name: string, specialty: string, studio: string) =>
      `Watch ${name}'s ${specialty.toLowerCase()} workshop at ${studio} in Berlin, then see the upcoming dates and book on Twiggli.`,
    where: 'Where', length: 'Length', group: 'Group', languages: 'Languages',
    next: 'Next dates', book: 'See dates & book', profile: (name: string) => `More about ${name}`,
    onRequest: 'Dates on request: ask for one on the host page.',
    more: 'More workshop videos', all: 'All videos',
    watch: 'Watch the video',
    indexTitle: 'Workshop videos from Berlin — pottery, painting, cooking & more | Twiggli',
    indexH1: 'Workshop videos from Berlin',
    indexLede: "Short looks inside the studios of independent Berlin hosts: what you make, the room you make it in and the people who teach it. Every video leads to the workshop's dates.",
    indexDescription: 'Short videos from Berlin workshops: pottery, painting, cooking, candles and more. See inside the studio, then book a date on Twiggli.',
    crumbs: 'Videos',
  },
  de: {
    kicker: 'Video',
    title: (specialty: string, name: string) => `${specialty} mit ${name} in Berlin — Video | Twiggli`,
    h1: (specialty: string, name: string) => `${specialty} mit ${name}: ein Blick in den Workshop`,
    description: (name: string, specialty: string, studio: string) =>
      `Schau dir ${name}s Workshop (${specialty}) bei ${studio} in Berlin an und buche einen Termin auf Twiggli.`,
    where: 'Wo', length: 'Dauer', group: 'Gruppe', languages: 'Sprachen',
    next: 'Nächste Termine', book: 'Termine ansehen & buchen', profile: (name: string) => `Mehr über ${name}`,
    onRequest: 'Termine auf Anfrage: frag einfach auf der Seite des Hosts.',
    more: 'Weitere Workshop-Videos', all: 'Alle Videos',
    watch: 'Video ansehen',
    indexTitle: 'Workshop-Videos aus Berlin — Töpfern, Malen, Kochen & mehr | Twiggli',
    indexH1: 'Workshop-Videos aus Berlin',
    indexLede: 'Kurze Einblicke in die Studios unabhängiger Berliner Hosts: was du machst, wo du es machst und wer es dir zeigt. Jedes Video führt zu den Terminen des Workshops.',
    indexDescription: 'Kurze Videos aus Berliner Workshops: Töpfern, Malen, Kochen, Kerzen und mehr. Schau ins Studio und buche einen Termin auf Twiggli.',
    crumbs: 'Videos',
  },
} as const;
