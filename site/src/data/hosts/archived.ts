/** Hosts who have left Twiggli. Their copy and pictures usually stay in the code,
 *  in case they come back (unless they asked for deletion), but getHosts() never returns them: no page, no
 *  card, no date, no search entry, no sitemap line, anywhere on the site.
 *  scripts/update-workshops.mjs skips their feeds too. */
export const archivedSlugs = new Set<string>([
  'sabine', // Sabine Alex, Mobile Dunkelkammer: left 30.10.26, stays on Konfetti
  'celia', // Cèlia Hoste, La HoCo (knitting): asked to be removed, 09.11.26
  'dirt', // Empire of Dirt (Julia & Kerstin): paused 14.11.26, starting again Jan/Feb 2027 and will get in touch; copy, pictures and reel kept
]);
