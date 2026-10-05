/**
 * Cards already looked at read a little fainter, so a visitor scanning the
 * calendar or the hosts can tell what they have opened before. A card says
 * what it stands for with data-seen ("h:<host>", "s:<session>",
 * "sp:<space>"); clicking anywhere in it records that, and every card with
 * the same key, on any page, dims from then on. A host's own page counts
 * as a look at that host (data-seen-visit).
 *
 * Kept in this browser only. Storage can be missing or refuse (private
 * windows, blocked site data); the page simply never dims then.
 */
const KEY = 'twiggli-seen';
const MAX = 400;

const read = (): string[] => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list.filter((k) => typeof k === 'string') : [];
  } catch {
    return [];
  }
};

export function startSeen(): void {
  let seen = read();
  const set = new Set(seen);

  const paint = (key: string) =>
    document.querySelectorAll<HTMLElement>(`[data-seen="${CSS.escape(key)}"]`)
      .forEach((el) => el.classList.add('is-seen'));

  const mark = (key: string) => {
    if (!key) return;
    paint(key);
    if (set.has(key)) return;
    set.add(key);
    // Newest last; the oldest fall off so the list stays small.
    seen = [...seen, key].slice(-MAX);
    try { localStorage.setItem(KEY, JSON.stringify(seen)); } catch { /* storage refused */ }
  };

  document.querySelectorAll<HTMLElement>('[data-seen]').forEach((el) => {
    if (set.has(el.dataset.seen ?? '')) el.classList.add('is-seen');
  });
  document.querySelectorAll<HTMLElement>('[data-seen-visit]').forEach((el) => mark(el.dataset.seenVisit ?? ''));

  // Capture, so a card whose own handler stops the click still counts.
  document.addEventListener('click', (event) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>('[data-seen]');
    if (card) mark(card.dataset.seen ?? '');
  }, true);
}
