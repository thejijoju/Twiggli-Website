/** Hosts' own videos live on Bunny Stream as HLS (…/playlist.m3u8, functions
 *  hostVideo, Jirel 18.11.26); the reels in this repo stay plain MP4s. A
 *  <video> gets an HLS address as data-hls instead of src, so no browser
 *  tries a format it cannot play: lib/hls.ts (loaded by Base.astro only on
 *  pages that have one) then plays it natively (Safari) or through hls.js. */
export const isHls = (url?: string | null): boolean => !!url && /\.m3u8(?:[?#]|$)/i.test(url);

/** Attributes for a <video>'s source: `{...videoSrc(url)}`. */
export const videoSrc = (url?: string | null): { src?: string; 'data-hls'?: string } =>
  !url ? {} : isHls(url) ? { 'data-hls': url } : { src: url };
