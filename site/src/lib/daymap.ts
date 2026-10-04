/**
 * The calendar map (DayMap.astro), run from DayPicker's script on the
 * shared side-map engine (lib/sidemap.ts).
 *
 * One marker per neighbourhood with something on the day on show, for the
 * filters in force other than the neighbourhood itself, labelled with a
 * price as a rental map is: a single workshop's own, or "from" the
 * cheapest where there are several. Only where none has a price does a
 * marker fall back to how many. A marker picks its neighbourhood through
 * the filter bar's own district pills, so the list, the pills and the map
 * never disagree. Hovering a workshop lights its marker.
 */
import { startSideMap, type Mark } from './sidemap.ts';

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

export function startDayMap(root: HTMLElement, hooks: DayMapHooks): { update: () => void } {
  const pane = root.querySelector<HTMLElement>('[data-sidemap]');
  if (!pane) return { update: () => {} };

  const places: Record<string, [number, number]> = JSON.parse(pane.dataset.places || '{}');
  const onlineBtn = pane.querySelector<HTMLButtonElement>('[data-map-online]');
  const showBtn = pane.querySelector<HTMLButtonElement>('[data-map-show]');

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
      showBtn.hidden = !!side?.isWide();
    }

    const marks: Mark[] = [];
    for (const [name, entry] of counts) {
      if (!places[name]) continue;
      // "€76–100" or "€119+" already reads as a starting price; "from" goes
      // in front of the figure alone.
      const cheapest = entry.price.match(/^\D*\d+(?:[.,]\d+)?/)?.[0] ?? entry.price;
      marks.push({
        id: name,
        at: places[name],
        label: !entry.price
          ? String(entry.n)
          : entry.n === 1
            ? entry.price
            : (pane.dataset.from ?? '{p}').replace('{p}', cheapest),
        title: `${name} · ${entry.n}`,
        active: district === name,
      });
    }
    side?.setMarks(marks);
    side?.frame(marks.map((m) => m.at), hooks.day());
  };

  const side = startSideMap(root, {
    onPick: (name) => hooks.pick(hooks.district() === name ? 'all' : name),
    onShow: () => update(),
  });

  // A workshop under the pointer lights its neighbourhood on the map.
  const sessionsEl = root.querySelector<HTMLElement>('.daysessions');
  sessionsEl?.addEventListener('mouseover', (event) => {
    const li = (event.target as HTMLElement).closest<HTMLElement>('.session');
    side?.light(li?.dataset.district ?? '');
  });
  sessionsEl?.addEventListener('mouseleave', () => side?.light(''));

  onlineBtn?.addEventListener('click', () => hooks.pick(hooks.district() === 'Online' ? 'all' : 'Online'));
  showBtn?.addEventListener('click', () => {
    side?.setState('closed');
    root.querySelector('.daysessions')?.scrollIntoView({ block: 'start' });
  });

  return { update };
}
