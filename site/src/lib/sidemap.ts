/**
 * A map beside a list, laid out like a rental site's search — the engine
 * under the calendar map (lib/daymap.ts) and the studio map (SpacesPage),
 * with its pane in SideMap.astro.
 *
 * Three states, on the root as data-map: "open" — on a wide screen the map
 * stands beside the list, on a phone it covers the page; "expanded" — on a
 * wide screen it takes the whole width; "closed". A wide screen always
 * starts open — the map is the view, closing it is for this visit only; a
 * phone starts closed, since there the map covers the list.
 *
 * The page hands it markers — a place, a short label (a price, as a rental
 * map shows), a name — and hears back which one was picked. Pills that
 * would overlap at the zoom in force step apart; zoomed in far enough,
 * each sits back on its own place.
 *
 * MapLibre is loaded the first time the map is shown, from copies served
 * beside the tiles (scripts/copy-maplibre.mjs), with the tiles read
 * straight out of one file by range requests (pmtiles).
 */
import type * as MapLibre from 'maplibre-gl';

export type MapState = 'open' | 'expanded' | 'closed';
const WIDE = '(min-width: 1100px)';

export interface Mark {
  id: string;
  /** [longitude, latitude] */
  at: [number, number];
  label: string;
  /** Spoken and shown on hover. */
  title: string;
  /** Chosen: drawn in the accent colour. */
  active?: boolean;
}

export interface SideMap {
  setMarks: (marks: Mark[]) => void;
  /** Lights one marker, as when its card is under the pointer ("" for none). */
  light: (id: string) => void;
  /** Fits the map round these points, once per key (a day, say). */
  frame: (points: [number, number][], key: string) => void;
  setState: (state: MapState) => void;
  isWide: () => boolean;
}

export function startSideMap(
  root: HTMLElement,
  opts: { onPick?: (id: string) => void; onShow?: () => void } = {},
): SideMap | null {
  const pane = root.querySelector<HTMLElement>('[data-sidemap]');
  const canvas = pane?.querySelector<HTMLElement>('[data-sidemap-canvas]');
  if (!pane || !canvas) return null;

  const wide = matchMedia(WIDE);
  const expandBtn = pane.querySelector<HTMLButtonElement>('[data-map-expand]');
  const closeBtn = pane.querySelector<HTMLButtonElement>('[data-map-close]');

  let lib: typeof MapLibre | null = null;
  let map: MapLibre.Map | null = null;
  let loading: Promise<void> | null = null;
  // `el` is the button; MapLibre moves its wrapper, by transform, so the
  // button is free to grow on hover.
  const markers = new Map<string, { marker: MapLibre.Marker; el: HTMLButtonElement; wrap: HTMLElement; mark: Mark }>();
  let marks: Mark[] = [];
  let hot = '';
  let framed = '';
  let pendingFrame: { points: [number, number][]; key: string } | null = null;

  const load = () =>
    (loading ??= (async () => {
      const origin = location.origin;
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = '/map/lib/maplibre-gl.css';
      document.head.append(css);
      const [ml, { Protocol }, style] = await Promise.all([
        import(/* @vite-ignore */ `${origin}/map/lib/maplibre-gl.mjs`) as Promise<typeof MapLibre>,
        import('pmtiles'),
        fetch('/map/style.json').then((r) => r.json()),
      ]);
      lib = ml;
      ml.addProtocol('pmtiles', new Protocol().tile);
      style.glyphs = origin + style.glyphs;
      style.sources.protomaps.url = `pmtiles://${origin}/map/berlin.pmtiles`;
      map = new ml.Map({
        container: canvas,
        style,
        center: [13.4, 52.515],
        zoom: 10.4,
        minZoom: 9,
        maxZoom: 16.5,
        maxBounds: [[12.85, 52.25], [13.95, 52.76]],
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
      });
      map.touchZoomRotate.disableRotation();
      map.addControl(new ml.NavigationControl({ showCompass: false }), 'bottom-right');
      map.on('zoomend', () => declutter());
      // The pane changes size with the layout, not only with the window.
      new ResizeObserver(() => map?.resize()).observe(canvas);
    })());

  const zFor = (m: Mark) => (m.id === hot ? '3' : m.active ? '2' : '');

  /** Where two pills would overlap at the zoom in force, the more southerly
   *  steps down below the other. */
  const declutter = () => {
    if (!map) return;
    const placed: { l: number; r: number; t: number; b: number }[] = [];
    const order = [...markers.values()].sort((a, b) => b.mark.at[1] - a.mark.at[1]);
    for (const m of order) {
      const at = map.project(m.mark.at);
      const w = m.el.offsetWidth, h = m.el.offsetHeight;
      const box = (dy: number) => ({ l: at.x - w / 2, r: at.x + w / 2, t: at.y - h / 2 + dy, b: at.y + h / 2 + dy });
      let dy = 0;
      for (let i = 0; i < 6; i++) {
        const me = box(dy);
        const hit = placed.find((p) => me.l < p.r + 3 && me.r > p.l - 3 && me.t < p.b + 3 && me.b > p.t - 3);
        if (!hit) break;
        dy = hit.b + 4 - (at.y - h / 2);
      }
      m.marker.setOffset([0, dy]);
      placed.push(box(dy));
    }
  };

  const render = () => {
    if (!map || !lib) return;
    const ids = new Set(marks.map((m) => m.id));
    for (const [id, m] of markers) {
      if (ids.has(id)) continue;
      m.marker.remove();
      markers.delete(id);
    }
    for (const mark of marks) {
      let m = markers.get(mark.id);
      if (!m) {
        const wrap = document.createElement('div');
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'mapmark';
        el.addEventListener('click', (event) => {
          event.stopPropagation();
          opts.onPick?.(mark.id);
        });
        wrap.append(el);
        m = { marker: new lib.Marker({ element: wrap, anchor: 'center' }).setLngLat(mark.at).addTo(map), el, wrap, mark };
        markers.set(mark.id, m);
      }
      m.mark = mark;
      m.marker.setLngLat(mark.at);
      m.el.textContent = mark.label;
      m.el.title = mark.title;
      m.el.setAttribute('aria-label', mark.title);
      m.el.setAttribute('aria-pressed', String(!!mark.active));
      m.el.classList.toggle('is-active', !!mark.active);
      m.el.classList.toggle('is-hot', hot === mark.id);
      m.wrap.style.zIndex = zFor(mark);
    }
    if (pendingFrame) frame(pendingFrame.points, pendingFrame.key);
    declutter();
  };

  const frame = (points: [number, number][], key: string) => {
    if (!map || !lib) {
      pendingFrame = { points, key };
      return;
    }
    pendingFrame = null;
    if (key === framed || !points.length) return;
    framed = key;
    const bounds = new lib.LngLatBounds(points[0], points[0]);
    for (const p of points) bounds.extend(p);
    map.fitBounds(bounds, { padding: { top: 76, bottom: 44, left: 36, right: 36 }, maxZoom: 12.6, duration: 500 });
  };

  const light = (id: string) => {
    if (id === hot) return;
    hot = id;
    for (const m of markers.values()) {
      m.el.classList.toggle('is-hot', m.mark.id === hot);
      m.wrap.style.zIndex = zFor(m.mark);
    }
  };

  const setState = (state: MapState) => {
    root.dataset.map = state;
    // The expand button's name, for when a narrow map shows only its arrow.
    if (expandBtn) {
      const name = (state === 'expanded' ? expandBtn.dataset.less : expandBtn.dataset.more) ?? '';
      expandBtn.setAttribute('aria-label', name);
      expandBtn.title = name;
    }
    // A phone's map covers the page; the page under it should not scroll.
    document.documentElement.classList.toggle('map-locked', state !== 'closed' && !wide.matches);
    if (state !== 'closed') load().then(() => { render(); opts.onShow?.(); });
  };

  root.querySelectorAll<HTMLButtonElement>('[data-map-open]').forEach((b) =>
    b.addEventListener('click', () => setState('open')));
  closeBtn?.addEventListener('click', () => setState('closed'));
  expandBtn?.addEventListener('click', () => setState(root.dataset.map === 'expanded' ? 'open' : 'expanded'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !wide.matches && root.dataset.map !== 'closed') setState('closed');
  });
  // Crossing the breakpoint: a phone never inherits a desktop's open map.
  wide.addEventListener('change', () => setState(wide.matches ? 'open' : 'closed'));

  // An earlier version remembered a close; forget it, so no one is left
  // without the map.
  try { localStorage.removeItem('twiggli-map'); } catch { /* private mode */ }
  root.dataset.mapLive = '';
  setState(wide.matches ? 'open' : 'closed');

  return {
    setMarks: (next) => { marks = next; render(); },
    light,
    frame,
    setState,
    isWide: () => wide.matches,
  };
}
