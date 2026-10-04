/**
 * The calendar map (DayMap.astro), run from DayPicker's script.
 *
 * Three states, on the day picker as data-map: "open" — on a wide screen
 * the map stands beside the workshops, on a phone it covers the page;
 * "expanded" — on a wide screen it takes the whole width; "closed". A wide
 * screen always starts open — the map is the view, closing it is for this
 * visit only; a phone starts closed, since there the map covers the list.
 *
 * One marker per neighbourhood with something on the day on show, for the
 * filters in force other than the neighbourhood itself, labelled with a
 * price as a rental map is: a single workshop's own, or "from" the
 * cheapest where there are several. Only where none has a price does a
 * marker fall back to how many. A marker picks its
 * neighbourhood through the filter bar's own district pills, so the list,
 * the pills and the map never disagree. Hovering a workshop lights its
 * marker.
 *
 * MapLibre is loaded the first time the map is shown, from copies served
 * beside the tiles (scripts/copy-maplibre.mjs), with the tiles read
 * straight out of one file by range requests (pmtiles).
 */
import type * as MapLibre from 'maplibre-gl';

export interface DayMapHooks {
  /** Workshops of the day on show that pass every filter but the district. */
  sessions: () => HTMLElement[];
  /** The district filter in force, or "all". */
  district: () => string;
  /** Sets the district filter ("all" to drop it). */
  pick: (district: string) => void;
  /** Which day is on show, to frame the map anew when it changes. */
  day: () => string;
}

type State = 'open' | 'expanded' | 'closed';
const WIDE = '(min-width: 1100px)';

export function startDayMap(root: HTMLElement, hooks: DayMapHooks): { update: () => void } {
  const pane = root.querySelector<HTMLElement>('[data-daymap]');
  const canvas = pane?.querySelector<HTMLElement>('[data-daymap-canvas]');
  if (!pane || !canvas) return { update: () => {} };

  const places: Record<string, [number, number]> = JSON.parse(pane.dataset.places || '{}');
  const wide = matchMedia(WIDE);
  const expandBtn = pane.querySelector<HTMLButtonElement>('[data-map-expand]');
  const closeBtn = pane.querySelector<HTMLButtonElement>('[data-map-close]');
  const onlineBtn = pane.querySelector<HTMLButtonElement>('[data-map-online]');
  const showBtn = pane.querySelector<HTMLButtonElement>('[data-map-show]');

  let lib: typeof MapLibre | null = null;
  let map: MapLibre.Map | null = null;
  let loading: Promise<void> | null = null;
  // `el` is the button; MapLibre moves its wrapper, by transform, so the
  // button is free to grow on hover.
  const markers = new Map<string, { marker: MapLibre.Marker; el: HTMLButtonElement; wrap: HTMLElement }>();
  let framed = '';
  let hot = '';

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

  const setState = (state: State) => {
    root.dataset.map = state;
    // The expand button's name, for when a narrow map shows only its arrow.
    if (expandBtn) {
      const name = (state === 'expanded' ? expandBtn.dataset.less : expandBtn.dataset.more) ?? '';
      expandBtn.setAttribute('aria-label', name);
      expandBtn.title = name;
    }
    // A phone's map covers the page; the page under it should not scroll.
    document.documentElement.classList.toggle('map-locked', state !== 'closed' && !wide.matches);
    if (state !== 'closed') load().then(update);
  };

  /** Price pills are wide, and the middle of the city is close-packed: where
   *  two would overlap at the zoom in force, the later (more southerly) one
   *  steps down below the other. Zoomed in far enough, every pill sits back
   *  on its own neighbourhood. */
  const declutter = () => {
    if (!map) return;
    const placed: { l: number; r: number; t: number; b: number }[] = [];
    const order = [...markers.entries()].sort((a, b) => places[b[0]][1] - places[a[0]][1]);
    for (const [name, m] of order) {
      const at = map.project(places[name]);
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

  /** Fits the map round the day's markers, once per day shown. */
  const frame = (names: string[]) => {
    if (!map || !lib) return;
    const day = hooks.day();
    if (day === framed) return;
    const points = names.map((n) => places[n]).filter(Boolean);
    if (!points.length) return;
    framed = day;
    const bounds = new lib.LngLatBounds(points[0], points[0]);
    for (const p of points) bounds.extend(p);
    map.fitBounds(bounds, { padding: { top: 76, bottom: 44, left: 36, right: 36 }, maxZoom: 12.6, duration: 500 });
  };

  const update = () => {
    // Per neighbourhood: how many, and the cheapest price shown on a card
    // ("€76–100" and "€119+" count by their first figure; a free one by 0).
    const counts = new Map<string, { n: number; price: string; low: number }>();
    for (const li of hooks.sessions()) {
      const name = li.dataset.district || '';
      const entry = counts.get(name) ?? { n: 0, price: '', low: Infinity };
      entry.n++;
      const text = li.querySelector('.session-price')?.firstChild?.textContent?.trim() ?? '';
      const figure = text.match(/\d+(?:[.,]\d+)?/);
      const value = figure ? Number(figure[0].replace(',', '.')) : text ? 0 : Infinity;
      if (value < entry.low) Object.assign(entry, { low: value, price: text });
      counts.set(name, entry);
    }
    const district = hooks.district();

    if (onlineBtn) {
      const online = counts.get('Online')?.n ?? 0;
      onlineBtn.hidden = online === 0;
      const strong = onlineBtn.querySelector('strong');
      if (strong) strong.textContent = String(online);
      onlineBtn.classList.toggle('is-active', district === 'Online');
    }
    // On a phone, the button back to the list says what it will show.
    if (showBtn) {
      const shown = district === 'all'
        ? [...counts.values()].reduce((sum, e) => sum + e.n, 0)
        : counts.get(district)?.n ?? 0;
      showBtn.textContent = shown === 1
        ? (pane.dataset.showOne ?? '')
        : (pane.dataset.showMany ?? '').replace('{n}', String(shown));
      showBtn.hidden = wide.matches;
    }

    if (!map || !lib) return;
    for (const [name, m] of markers) {
      if (counts.has(name)) continue;
      m.marker.remove();
      markers.delete(name);
    }
    for (const [name, entry] of counts) {
      if (!places[name]) continue;
      let m = markers.get(name);
      if (!m) {
        const wrap = document.createElement('div');
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'mapmark';
        el.addEventListener('click', (event) => {
          event.stopPropagation();
          hooks.pick(hooks.district() === name ? 'all' : name);
        });
        wrap.append(el);
        m = { marker: new lib.Marker({ element: wrap, anchor: 'center' }).setLngLat(places[name]).addTo(map), el, wrap };
        markers.set(name, m);
      }
      // "€76–100" or "€119+" already reads as a starting price; "from" goes
      // in front of the figure alone.
      const cheapest = entry.price.match(/^\D*\d+(?:[.,]\d+)?/)?.[0] ?? entry.price;
      m.el.textContent = !entry.price
        ? String(entry.n)
        : entry.n === 1
          ? entry.price
          : (pane.dataset.from ?? '{p}').replace('{p}', cheapest);
      m.el.classList.toggle('is-price', !!entry.price);
      m.el.classList.toggle('is-active', district === name);
      m.el.classList.toggle('is-hot', hot === name);
      // The lit and the chosen marker sit above their neighbours.
      m.wrap.style.zIndex = hot === name ? '3' : district === name ? '2' : '';
      m.el.title = `${name} · ${entry.n}`;
      m.el.setAttribute('aria-label', `${name}: ${entry.n}`);
      m.el.setAttribute('aria-pressed', String(district === name));
    }
    frame([...counts.keys()]);
    declutter();
  };

  // A workshop under the pointer lights its neighbourhood on the map.
  const sessionsEl = root.querySelector<HTMLElement>('.daysessions');
  const light = (name: string) => {
    if (name === hot) return;
    hot = name;
    const district = hooks.district();
    for (const [n, m] of markers) {
      m.el.classList.toggle('is-hot', n === hot);
      m.wrap.style.zIndex = n === hot ? '3' : district === n ? '2' : '';
    }
  };
  sessionsEl?.addEventListener('mouseover', (event) => {
    const li = (event.target as HTMLElement).closest<HTMLElement>('.session');
    light(li?.dataset.district ?? '');
  });
  sessionsEl?.addEventListener('mouseleave', () => light(''));

  root.querySelectorAll<HTMLButtonElement>('[data-map-open]').forEach((b) =>
    b.addEventListener('click', () => setState('open')));
  closeBtn?.addEventListener('click', () => setState('closed'));
  expandBtn?.addEventListener('click', () => setState(root.dataset.map === 'expanded' ? 'open' : 'expanded'));
  onlineBtn?.addEventListener('click', () => hooks.pick(hooks.district() === 'Online' ? 'all' : 'Online'));
  showBtn?.addEventListener('click', () => {
    setState('closed');
    root.querySelector('.daysessions')?.scrollIntoView({ block: 'start' });
  });
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

  return { update };
}
