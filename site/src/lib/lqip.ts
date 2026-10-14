import lqip from '../data/posterLqip.json';

/** A 12px blur of a reel's poster as a data URI (scripts/poster-thumbs.mjs),
 *  to paint behind a tile until its picture arrives, so a slow phone sees
 *  the picture coming into focus rather than a grey box. Takes the poster
 *  path with or without the deploy base. */
export const lqipFor = (poster?: string): string | undefined => {
  if (!poster) return undefined;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = base && poster.startsWith(base) ? poster.slice(base.length) : poster;
  return (lqip as Record<string, string>)[path];
};

/** The background style for a tile that shows `poster`, or nothing. */
export const lqipStyle = (poster?: string): string | undefined => {
  const uri = lqipFor(poster);
  return uri ? `background-image:url(${uri})` : undefined;
};
