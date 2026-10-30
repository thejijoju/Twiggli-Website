/** Hosts who have left Twiggli. Their copy and pictures stay in the code,
 *  in case they come back, but getHosts() never returns them: no page, no
 *  card, no date, no search entry, no sitemap line, anywhere on the site.
 *  scripts/update-workshops.mjs skips their feeds too. */
export const archivedSlugs = new Set<string>([
  'sabine', // Sabine Alex, Mobile Dunkelkammer: left 30.10.26, stays on Konfetti
]);
