/**
 * A description shown as its first lines, fading out, that opens in full
 * when tapped — in place of a "see more" button. Markup: a [data-fade]
 * wrapper around the text. Text that fits needs neither, so it is marked
 * .is-short and left as it is. Wrappers that arrive later (the group page
 * copies a card's details into its quick view) are found as they appear.
 */
const measure = (el: HTMLElement) => {
  if (el.dataset.fadeReady) return;
  el.dataset.fadeReady = '';
  // Longer than the three lines the closed box shows: worth a fade.
  const text = (el.firstElementChild as HTMLElement | null) ?? el;
  const line = parseFloat(getComputedStyle(text).lineHeight) || 24;
  const short = el.scrollHeight <= line * 3 + 4;
  el.classList.toggle('is-short', short);
  if (short) return;
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-expanded', 'false');
};

const toggle = (el: HTMLElement) => {
  if (el.classList.contains('is-short')) return;
  const open = !el.classList.contains('is-open');
  el.classList.toggle('is-open', open);
  el.setAttribute('aria-expanded', String(open));
};

export function startFadeText(): void {
  const scan = (root: ParentNode) =>
    root.querySelectorAll<HTMLElement>('[data-fade]').forEach((el) => {
      // Only once it is laid out; a hidden copy is measured when shown.
      if (el.offsetParent) measure(el);
    });
  scan(document);
  new MutationObserver(() => scan(document)).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', (event) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('[data-fade]');
    if (el && !(event.target as HTMLElement).closest('a')) toggle(el);
  });
  document.addEventListener('keydown', (event) => {
    const el = (event.target as HTMLElement).closest?.<HTMLElement>('[data-fade]');
    if (el && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); toggle(el); }
  });
}
