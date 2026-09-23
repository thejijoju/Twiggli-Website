/** What the site reports, and nothing else: a click that sends somebody to
 *  a host.
 *
 *  Booking happens on the host's own site, so a completed booking is not
 *  ours to see. The click that hands the visitor over is the closest thing
 *  to a conversion this site has, and knowing which card produced it is the
 *  whole question — the reels, the filters and the calendar are all there to
 *  make that click happen.
 *
 *  One listener on the document rather than a handler per card: the cards
 *  are rendered in half a dozen components and rebuilt whenever a filter
 *  runs, and a delegated listener covers every one of them, including the
 *  ones added after this was written.
 *
 *  Nothing is recorded about the visitor. Umami sets no cookie and stores no
 *  identifier, which is why the consent banner does not need to change.
 */

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Props) => void };
  }
}

/** Fire and forget. Safe before the script loads, safe if it never does —
 *  an ad blocker takes the script, not the page. */
export function track(name: string, props: Props = {}) {
  try {
    window.umami?.track(name, props);
  } catch {
    /* analytics must never break a booking link */
  }
}

/** Where the click landed, in the words a person would use, rather than a
 *  CSS class. */
function actionOf(link: Element): string {
  if (link.classList.contains('session-book')) return 'book';
  if (link.classList.contains('session-title')) return 'title';
  if (link.classList.contains('maker-request')) return 'request';
  if (link.closest('.session-thumb')) return 'tile';
  if (link.closest('.maker-media')) return 'tile';
  if (link.closest('.maker-name')) return 'host-name';
  if (link.closest('.session-host')) return 'host-name';
  return 'link';
}

/** The card the link sits in, if any. Sessions and directory cards both
 *  carry their own id already; the rest is what the card is about. */
function cardOf(link: Element): Props {
  const card = link.closest<HTMLElement>('[data-track-card]');
  if (!card) return {};
  const d = card.dataset;
  return {
    card: d.trackCard ?? '',
    ...(d.trackHost ? { host: d.trackHost } : {}),
    ...(d.trackTitle ? { title: d.trackTitle } : {}),
    ...(d.trackDate ? { date: d.trackDate } : {}),
    ...(card.id ? { id: card.id } : {}),
  };
}

export function startOutboundTracking() {
  document.addEventListener(
    'click',
    (event) => {
      const link = (event.target as Element | null)?.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') ?? '';

      // A request-by-mail is a conversion too — several hosts take bookings
      // no other way — so it counts alongside a click to a booking page.
      const mail = href.startsWith('mailto:');
      let leaves = mail;
      if (!mail) {
        try {
          leaves = new URL(href, location.href).origin !== location.origin;
        } catch {
          return; // not a url we can reason about: '#', 'javascript:', …
        }
      }
      // Requests that stay on the site (the directory's "Request event",
      // which opens the contact page) are the corporate equivalent of a
      // booking click, so they are worth the same event.
      const internalRequest = !leaves && link.classList.contains('maker-request');
      if (!leaves && !internalRequest) return;

      track('outbound', {
        action: actionOf(link),
        ...cardOf(link),
        // The destination's host, not the full url: it says which booking
        // platform the visitor was handed to without logging a query string
        // that may carry their prefilled name. A request that stays here
        // says so, rather than reporting our own domain as a destination.
        to: mail ? 'email' : internalRequest ? 'contact' : new URL(href, location.href).hostname,
        lang: document.documentElement.lang || 'en',
      });
    },
    // Capture, so the event is recorded even where something else stops the
    // click from bubbling.
    { capture: true },
  );
}
