/** Umami Cloud, for one question: which cards send people to a host.
 *
 *  Fill in the website id from the Umami dashboard (Settings → Websites →
 *  the site → Edit, the "Website ID" field) and the script goes in on the
 *  next build. While it is empty nothing is loaded and nothing is sent, so
 *  the site runs exactly as it does now until someone means to turn this on.
 *
 *  The id can also come from the environment at build time — set
 *  PUBLIC_UMAMI_ID in the deploy workflow — which keeps it out of the repo
 *  if you would rather it were not here. It is not a secret either way: the
 *  id is visible to anyone reading the page source.
 */
export const umamiWebsiteId =
  import.meta.env.PUBLIC_UMAMI_ID ?? '2a2d9060-5a35-4dd3-8ce7-3eb0bf375a1f';

/** Umami Cloud's EU endpoint. Self-hosting later means changing this line
 *  and nothing else. */
export const umamiScript = 'https://cloud.umami.is/script.js';

/** Whether to load it at all. */
export const analyticsOn = Boolean(umamiWebsiteId);
