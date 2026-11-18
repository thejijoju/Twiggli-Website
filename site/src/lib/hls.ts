/** Plays an HLS address (a host's video on Bunny Stream, see videoSrc.ts) in
 *  a <video>: natively where the browser can (Safari, iOS), elsewhere
 *  through hls.js, which is fetched only once a page has such a video.
 *
 *  Keeps the site's video conventions: a video with preload="none" (the
 *  reels on cards, started by lib/reelwalk.ts or on hover) fetches nothing
 *  until it is played; one that autoplays, or is asked to be eager (the
 *  dashboard's preview), starts loading at once. Muted, loop, poster and
 *  playsinline stay as the markup sets them. */
import { isHls } from './videoSrc.ts';

type HlsCtor = typeof import('hls.js').default;
let lib: Promise<HlsCtor> | null = null;
const load = () => (lib ??= import('hls.js/light').then((m) => m.default));
let native: boolean | null = null;
const canNative = () => {
  if (native === null) {
    try { native = document.createElement('video').canPlayType('application/vnd.apple.mpegurl') !== ''; } catch { native = false; }
  }
  return native;
};
const wired = new WeakMap<HTMLVideoElement, { url: string; destroy?: () => void }>();

export function playHls(video: HTMLVideoElement, url: string, { eager = false } = {}): void {
  const had = wired.get(video);
  if (had?.url === url) return;
  had?.destroy?.();
  if (!isHls(url)) { wired.delete(video); video.src = url; return; }
  const state: { url: string; destroy?: () => void } = { url };
  wired.set(video, state);
  if (canNative()) { if (video.getAttribute('src') !== url) video.src = url; return; }
  video.removeAttribute('src');
  load().then((Hls) => {
    if (wired.get(video) !== state) return;
    if (!Hls.isSupported()) { video.src = url; return; }
    const hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 12, startLevel: -1 });
    let started = false;
    const start = () => { if (!started) { started = true; hls.loadSource(url); } };
    let retried = false;
    hls.on(Hls.Events.ERROR, (_e, d) => {
      if (!d.fatal) return;
      // One more try on a network hiccup, then the card just shows its picture.
      if (d.type === Hls.ErrorTypes.NETWORK_ERROR && !retried) { retried = true; hls.startLoad(); return; }
      if (d.type === Hls.ErrorTypes.MEDIA_ERROR && !retried) { retried = true; hls.recoverMediaError(); return; }
      hls.destroy();
    });
    hls.attachMedia(video);
    state.destroy = () => { video.removeEventListener('play', start); hls.destroy(); };
    if (eager || video.autoplay || video.preload === 'auto' || video.preload === 'metadata') start();
    else video.addEventListener('play', start, { once: true });
  }).catch(() => { /* offline: the poster or picture stays */ });
}

/** Every <video data-hls> in `root`, and (watching the page) any added later. */
export function wireHls(root: ParentNode = document): void {
  const take = (n: ParentNode) => {
    if (n instanceof HTMLVideoElement && n.dataset.hls) playHls(n, n.dataset.hls);
    n.querySelectorAll?.<HTMLVideoElement>('video[data-hls]').forEach((v) => playHls(v, v.dataset.hls!));
  };
  take(root);
  new MutationObserver((list) => {
    for (const m of list) for (const n of m.addedNodes) if (n instanceof Element) take(n);
  }).observe(document.body, { childList: true, subtree: true });
}
