/** Fills every rating tag on the page ("★ 5.0 (1)" after a host's name,
 *  components/RatingTag.astro) from published guest reviews, with one call
 *  for the whole page, kept for five minutes in this tab. */
import { functionsBase } from '../data/firebase.ts';

type Summary = Record<string, { avg: number; count: number }>;
const KEY = 'twiggli-ratings';

const load = async (): Promise<Summary> => {
  try {
    const hit = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    if (hit && Date.now() - hit.at < 5 * 60 * 1000) return hit.hosts;
  } catch { /* storage blocked */ }
  const res = await fetch(`${functionsBase}/publicReviews?summary=1`);
  const { hosts } = res.ok ? await res.json() : { hosts: {} };
  try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), hosts })); } catch { /* storage blocked */ }
  return hosts ?? {};
};

export const startRatings = (): void => {
  const tags = document.querySelectorAll<HTMLElement>('[data-rv]');
  if (!tags.length) return;
  load().then((hosts) => {
    const de = document.documentElement.lang.startsWith('de');
    tags.forEach((el) => {
      const r = hosts[el.dataset.rv ?? ''];
      if (!r) return;
      const avg = de ? r.avg.toFixed(1).replace('.', ',') : r.avg.toFixed(1);
      el.textContent = `★ ${avg} (${r.count})`;
      el.title = de ? `${r.count} ${r.count === 1 ? 'Bewertung' : 'Bewertungen'}` : `${r.count} ${r.count === 1 ? 'review' : 'reviews'}`;
      el.hidden = false;
    });
  }).catch(() => {});
};
