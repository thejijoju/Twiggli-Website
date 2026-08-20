/**
 * Weekly workshop-feed updater.
 *
 * Fetches each configured host's public schedule page, extracts upcoming
 * classes/workshops, and writes them to site/src/data/live-workshops.json.
 * The site build (site/src/data/sessions.ts) shows these real sessions in
 * the /happening-today/ feed, with the Book button leading to the host's
 * own booking page instead of the app.
 *
 * Run by .github/workflows/update-workshops.yml on a weekly cron (and by
 * hand via workflow_dispatch). Designed to degrade safely: a source that
 * fails to fetch or parse keeps its previous entries (minus past dates)
 * and the feed falls back to the generated placeholder schedule for that
 * host, so a broken remote page can never blank the site.
 *
 * Extraction strategies, in order:
 *   1. schema.org JSON-LD Event objects (many booking widgets emit these).
 *   2. Wix Bookings visitor API — Wix pages render their schedule
 *      client-side, so the HTML carries no dates at all; the same-domain
 *      /_api/ endpoints serve them with a visitor token the site hands out.
 *   3. <time datetime="..."> elements, paired with the nearest heading.
 * Every run logs what each strategy found so a failing source can be
 * diagnosed from the Actions log alone.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../site/src/data/live-workshops.json');

/** Hosts whose public schedules we check. `slug` must match a host slug in
 *  site/src/data/content.ts; `url` is both the page scraped and where the
 *  feed's Book button sends people. Add a line per host as pages are found. */
const SOURCES = [
  // Each page carries one Acuity class widget, so title and fallback price
  // come from config; dates arrive via the headless render of the widget.
  { slug: 'qian', name: 'Qian — Clay Garden pottery classes', mode: 'dates-de',
    url: 'https://www.claygarden.studio/pottery-classes',
    title: 'Handbuilding Class with Clay Garden Studio', price: '€65',
    district: 'Prenzlauer Berg' },
  { slug: 'qian', name: 'Qian — Clay Garden special workshops', mode: 'dates-de',
    url: 'https://www.claygarden.studio/special-workshops',
    title: 'Tea & Pottery Workshop', district: 'Prenzlauer Berg' },
  // Weekly-recurring German schedule ("Dienstags I 18 - 20 Uhr I …"); the
  // parser emits `recurring` entries the site expands into dated sessions.
  { slug: 'nina', name: 'Nina Kranz — Kurse', url: 'https://www.ninakranzart.com/privat-freizeit', mode: 'recurring-de' },
  // German dated list ("Samstag, 29. August 2026"). One product per page,
  // so title and price come from this config when the page yields none.
  { slug: 'karen-rose', name: 'Karen-Rose — Bio Naturkosmetik', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=227019',
    title: 'Bio Naturkosmetik Workshop', price: '€65', duration: '3 h', district: 'Treptow' },
  { slug: 'karen-rose', name: 'Karen-Rose — Keramikgießen | Terrazzo', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=263590&rwstep=product',
    title: 'Keramikgießen | Terrazzo Workshop', titleEn: 'Ceramic Casting | Terrazzo Workshop',
    price: '€59', duration: '3 h', district: 'Treptow' },
  { slug: 'karen-rose', name: 'Karen-Rose — Duftkerzen', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=229230',
    title: 'Duftkerzen Workshop (vegan + nachhaltig)',
    titleEn: 'Scented Candle Workshop (vegan + sustainable)', price: '€55', duration: '2 h', district: 'Treptow' },
  { slug: 'karen-rose', name: 'Karen-Rose — Naturkosmetik Essentials', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=264518',
    title: 'Bio Naturkosmetik Workshop - Essentials',
    titleEn: 'Organic Natural Cosmetics Workshop - Essentials', price: '€49', duration: '2 h', district: 'Treptow' },
  { slug: 'karen-rose', name: 'Karen-Rose — Terrazzo Schmuck', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=320775',
    title: 'Terrazzo Schmuck', titleEn: 'Terrazzo Jewelry', price: '€59', duration: '3 h', district: 'Treptow' },
  { slug: 'karen-rose', name: 'Karen-Rose — Shampoo Naturkosmetik', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=229220',
    title: 'Shampoo Naturkosmetik Workshop', titleEn: 'Shampoo Natural Cosmetics Workshop',
    price: '€55', duration: '3 h', district: 'Treptow' },
  // Shopify shop: the collection's products.json carries every workshop,
  // its dated sessions (variants titled "DD.MM.YYYY - HH:MM"), per-date
  // price and availability — fully automatic, nothing configured per
  // workshop. New products in the collection appear on their own.
  { slug: 'galleria-lucia', name: 'Galleria Lucia — workshops', mode: 'shopify',
    url: 'https://www.gallerialucia.com/collections/workshops/products.json?limit=250',
    district: 'Lichtenberg' },
  // Each baking date on the page carries its own eventfrog.de ticket link,
  // and Eventfrog serves a .ics per event with the exact start/end — fully
  // automatic, new dates appear on their own. €55 is the organizer-set
  // ticket price shown on Eventfrog.
  { slug: 'kohfink', name: 'Imkerei Kohfink — Back-Kurse', mode: 'eventfrog',
    url: 'https://imkerei-kohfink.de/BACK-KURSE/',
    price: '€55', district: 'Kaulsdorf' },
  // Shopify catalog + Cowlendar booking modal ("you only see the dates
  // after clicking Book") — but Cowlendar's availability API answers plain
  // GETs, so every slot reads without a browser. Sessions run near-daily;
  // maxDays keeps the volume sane.
  { slug: 'munio', name: 'The Munio — workshops', mode: 'shopify-cowlendar',
    base: 'https://themunio.de', collection: 'workshops',
    url: 'https://themunio.de/collections/workshops',
    district: 'Schöneberg', maxDays: 45 },
  // Pasta Madre's Wix calendar renders every course server-side as
  // h2-titled blocks; the three solidarity prices (Tulpe/Lilie/Rose)
  // surface as a €76–100 range.
  { slug: 'pastamadre', name: 'Pasta Madre — Kurstermine', mode: 'titled-date-blocks',
    url: 'https://www.pastamadre.de/calendar-kurstermine', district: 'Wedding' },
  // Coffee and Bananas (Angelo & Linda's café) lists the roasting
  // workshop's upcoming dates as bare text on the homepage; booking and
  // price live on their tenfarmersandbananas.com shop.
  { slug: 'angelo', name: 'Coffee and Bananas — roasting workshops', mode: 'dated-time-list',
    url: 'https://www.coffeeandbananas.com/',
    startMarker: 'UPCOMING WORKSHOPS', endMarker: 'JETZT TEILNEHMEN',
    title: 'DIY Kaffeerösten', titleEn: 'DIY Coffee Roasting', price: '€59',
    district: 'Prenzlauer Berg',
    bookUrl: 'https://tenfarmersandbananas.com/produkt/diy-kaffeeroesten-in-berlin/' },
  // Squarespace site booking through Konfetti — the sitemap finds every
  // course page, each page's embedded widget names its Konfetti event, and
  // the calendar API serves the dates with live tickets left.
  { slug: 'ceramic-kingdom', name: 'Ceramic Kingdom — all classes', mode: 'konfetti',
    url: 'https://www.ceramickingdomberlin.com/sitemap.xml',
    pagePattern: '/en/(class|wheelthrowing|handbuilding|moldmaking|glazing|sgraffito|mini)',
    district: 'Neukölln' },
  // One Shopify product per workshop date; the date lives in the product
  // description ("Sonntag, 11. Oktober 2026 von 10 bis 17 Uhr"), which the
  // shopify mode's body-date fallback reads.
  { slug: 'bumerang', name: 'Berliner Bumerang — Workshops', mode: 'shopify',
    url: 'https://berliner-bumerang.de/products.json?limit=250',
    district: 'Lichtenberg' },
  // Sarah's workshop pages list dates as table rows ("23.08.2026 …
  // 11 - 13 Uhr … Hier buchen"), each row linking its own PayPal checkout.
  { slug: 'sarah', name: 'Sarah Niklowitz — Sunday Morning Pages & Brunch', mode: 'dated-time-list',
    url: 'https://sarahniklowitz.de/sunday-morning-pages-brunch/',
    startMarker: 'Next Dates',
    title: 'Sunday Morning Pages & Brunch', price: '€39',
    district: 'Prenzlauer Berg' },
  // Currently lists only past dates ("neue Termine folgen in Kürze") —
  // watched weekly so her next round appears by itself. Runs online.
  { slug: 'sarah', name: 'Sarah Niklowitz — Journaling für Beginner', mode: 'dated-time-list',
    url: 'https://sarahniklowitz.de/journaling-fuer-beginner/',
    startMarker: 'Nächste Termine',
    title: 'Journaling für Beginner', titleEn: 'Journaling for Beginners',
    duration: '2.5–3 h', district: 'Online' },
  // Each listing page links every date to its own checkout.<domain> ticket
  // page, which carries the authoritative date, time, title and price.
  { slug: 'monk-garden', name: 'The Monk Garden — Pilzwanderungen', mode: 'checkout-links-de',
    url: 'https://the-monk-garden.de/pilzwanderung-durch-den-wald/',
    titleEn: 'Mushroom Foraging Walk', duration: '3 h', district: 'Berliner Wald' },
  { slug: 'monk-garden', name: 'The Monk Garden — Wildkräuter-Wanderungen', mode: 'checkout-links-de',
    url: 'https://the-monk-garden.de/wildkrauter-wanderungen/',
    titleEn: 'Wild Herb Walk — Tempelhofer Feld', duration: '2.5–3 h', district: 'Tempelhof' },
  // WordPress page listing the whole schedule as pipe-separated German
  // lines under "Kommende Workshops für <X>:" headers; each entry links its
  // own Eversports booking page.
  { slug: 'beat-etage', name: 'Beat-Etage — kommende Workshops', mode: 'pipe-list-de',
    url: 'https://beat-etage.de/workshops/', district: 'Treptow',
    sections: {
      'Djembes & Dunduns': { title: 'Djembe & Dundun Workshop' },
      'Cajons': { title: 'Cajon Workshop' },
      'Handpan': { title: 'Handpan Workshop' },
    } },
  // Acuity Scheduling ("involves clicking") — but the scheduler embeds its
  // appointment catalog in the page HTML and serves availability as public
  // JSON, so the classes, prices and dates read with plain fetches.
  // The Acuity account behind senle.studio is Faye's — the schedule feeds
  // her existing host card.
  { slug: 'faye', name: 'Senlë Studio (Faye) — Incense Labs', mode: 'acuity',
    owner: '37478855', url: 'https://www.senle.studio/scheduling',
    district: 'Friedrichshain' },
  // Regiondo-hosted shop pages (unlike Karen-Rose's embedded widget) are
  // server-rendered with an Event JSON-LD block carrying the course's next
  // start date and price — the default strategy reads them. The 2027
  // courses enter the feed automatically once inside the keep window;
  // until then these report "no upcoming events", which is expected.
  { slug: 'kohfink', name: 'Imkerei Kohfink — Einsteigerkurse',
    url: 'https://imkerei-kohfink.regiondo.de/klassische-einsteigerkurse' },
  { slug: 'kohfink', name: 'Imkerei Kohfink — Theoriekurs',
    url: 'https://imkerei-kohfink.regiondo.de/theoriekurs-einfuhrung-in-die-imkerei' },
  // Wix Events: the events sitemap lists every event-detail page, and each
  // page carries a schema.org Event JSON-LD block (exact start/end, price,
  // status). Fully automatic — events Jem adds appear on their own;
  // cancelled or closed ones are skipped.
  { slug: 'jem', name: 'Jem — Fischtal Foodlab events', mode: 'wix-events-sitemap',
    url: 'https://www.fischtal-foodlab.com/event-pages-sitemap.xml',
    district: 'Zehlendorf' },
  // TEMP url: the general events page until this workshop's own
  // re-product-id link is known — it is both the seed's protection (a
  // failing source keeps its previous entries) and the Book target.
  { slug: 'karen-rose', name: 'Karen-Rose — Seife Sieden', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/',
    title: 'Seife Sieden Workshop', titleEn: 'Soap Making Workshop', price: '€99', duration: '3 h', district: 'Treptow' },
];

/** How far ahead a scraped session may be and still be kept. Slightly wider
 *  than the site's day strip so entries roll into view between runs. */
const KEEP_DAYS = 110;

const TZ = 'Europe/Berlin';

const berlinDate = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
const berlinTime = (d) =>
  new Date(d).toLocaleTimeString('de-DE', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const todayISO = berlinDate(Date.now());
const maxISO = berlinDate(Date.now() + KEEP_DAYS * 86400000);

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ');

const stripTags = (s) =>
  decodeEntities(
    s.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

/** Strategy 1: walk every JSON-LD block for schema.org Event-ish objects. */
function fromJsonLd(html, sourceUrl) {
  const events = [];
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    const types = [].concat(node['@type'] ?? []);
    if (types.some((t) => typeof t === 'string' && /event/i.test(t)) && node.startDate) {
      events.push(node);
    }
    Object.values(node).forEach(walk);
  };
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walk(JSON.parse(decodeEntities(m[1].trim())));
    } catch {
      /* malformed block — skip */
    }
  }
  return events
    .map((e) => {
      const start = Date.parse(e.startDate);
      if (Number.isNaN(start)) return null;
      // Cancelled / closed events stay in the page's markup — skip them so
      // the Book button never leads to a dead registration.
      if (/cancelled|postponed/i.test(String(e.eventStatus ?? ''))) return null;
      const end = Date.parse(e.endDate ?? '');
      const hours = (end - start) / 3600000;
      const duration =
        !Number.isNaN(end) && hours > 0 && hours <= 12
          ? `${Math.round(hours * 2) / 2} h`
          : undefined;
      // Offers may be a flat Offer or an AggregateOffer whose price sits in
      // lowPrice or in a nested offers[] (Wix Events emits the latter).
      const offer = [].concat(e.offers ?? [])[0];
      // Skip events every ticket type of which is sold out (Wix Events
      // marks both the aggregate and its nested offers) — the Book button
      // must never lead to a dead ticket page.
      const availabilities = [offer?.availability, ...[].concat(offer?.offers ?? []).map((o) => o?.availability)]
        .filter(Boolean)
        .map(String);
      if (availabilities.length && availabilities.every((a) => /soldout/i.test(a))) return null;
      const rawPrice = [offer?.price, offer?.lowPrice, [].concat(offer?.offers ?? [])[0]?.price]
        .find((p) => p != null && p !== '');
      const price =
        rawPrice != null
          ? Number(rawPrice) === 0
            ? 'Free'
            : `€${Math.round(Number(rawPrice))}`
          : undefined;
      return {
        title: stripTags(String(e.name ?? 'Workshop')),
        date: berlinDate(start),
        time: berlinTime(start),
        ...(duration ? { duration } : {}),
        ...(price ? { price } : {}),
        url: typeof e.url === 'string' && e.url.startsWith('http') ? e.url : sourceUrl,
      };
    })
    .filter(Boolean);
}

const UA = 'Mozilla/5.0 (compatible; TwiggliScheduleBot/1.0; +https://www.twiggli.com)';

/** Parser for pages listing workshops as German pipe-separated lines —
 *  "29.08.2026 | Samstag, 13-15 Uhr | ANFÄNGER:INNEN | … | 49 € | Buchung
 *  über Eversports" — grouped under "Kommende Workshops für <X>:" headers
 *  (Beat-Etage's format). Works on the raw markup so each entry keeps its
 *  own booking link; multi-day camps and past dates fall away. Times come
 *  from the "13-15 Uhr" range (start = session time, span = duration). */
function fromGermanPipeList(html, source) {
  const out = [];
  const marks = [...html.matchAll(/Kommende\s+Workshops\s+für\s+([^:<]+):/gi)].map((m) => ({
    name: stripTags(m[1]).replace(/\s+/g, ' ').trim(),
    headerStart: m.index,
    start: m.index + m[0].length,
  }));
  if (!marks.length) {
    console.log(`[${source.slug}] pipe-list: no "Kommende Workshops für …" sections found`);
    return [];
  }
  // Camps and the closing boilerplate end the schedule.
  let tailEnd = html.length;
  for (const re of [/SAFE\s+THE\s+DATE/i, /Anmeldungen\s+per\s+E?-?Mail/i]) {
    const m = re.exec(html);
    if (m && m.index > marks[0].start && m.index < tailEnd) tailEnd = m.index;
  }

  for (let i = 0; i < marks.length; i++) {
    const end = Math.min(i + 1 < marks.length ? marks[i + 1].headerStart : Infinity, tailEnd);
    const seg = html.slice(marks[i].start, end);
    const cfg = source.sections?.[marks[i].name] ?? {};
    const dates = [...seg.matchAll(/(\d{2})\.(\d{2})\.(\d{2,4})\b/g)];
    dates.forEach((m, idx) => {
      const entry = seg.slice(m.index, idx + 1 < dates.length ? dates[idx + 1].index : seg.length);
      const text = stripTags(entry);
      if (/\bCamp\b/i.test(text)) return;
      const year = m[3].length === 2 ? `20${m[3]}` : m[3];
      const month = Number(m[2]);
      if (month < 1 || month > 12 || Number(m[1]) > 31) return;
      const date = `${year}-${m[2]}-${m[1]}`;

      const range = text.match(/(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*Uhr/);
      let time;
      let duration;
      if (range) {
        time = `${String(range[1]).padStart(2, '0')}:${range[2] ?? '00'}`;
        const span =
          Number(range[3]) + Number(range[4] ?? 0) / 60 - (Number(range[1]) + Number(range[2] ?? 0) / 60);
        if (span > 0 && span <= 12) duration = `${Math.round(span * 2) / 2} h`;
      }
      const price = text.match(/(\d+(?:,\d+)?)\s*€/);
      const book = entry.match(/https:\/\/www\.eversports\.[a-z]+\/[^\s"'<>]+/);

      console.log(
        `[${source.slug}] pipe-list: "${marks[i].name}" ${date} ${time ?? '?'} ${price ? `€${price[1]}` : ''} ${book ? 'eversports' : 'page'}`,
      );
      out.push({
        title: cfg.title ?? `${marks[i].name} Workshop`,
        ...(cfg.titleEn ? { titleEn: cfg.titleEn } : {}),
        date,
        ...(time ? { time } : {}),
        ...(duration ? { duration } : {}),
        ...(price ? { price: `€${Math.round(Number(price[1].replace(',', '.')))}` } : {}),
        url: book ? decodeEntities(book[0]) : source.url,
      });
    });
  }
  return out;
}

/** Parser for pages that announce one workshop's upcoming dates as a bare
 *  text list — "Thu 20.08.2026 17.30-19.30 / Sat 22.08.2026 10.30-12.30…"
 *  (Coffee and Bananas' format). Title, price and booking link come from
 *  the source config; date, start time and duration from each line. The
 *  optional start/end markers fence the schedule off from other dates on
 *  the page, and duplicate date+time pairs collapse. */
function fromDatedTimeList(html, source) {
  let text = stripTags(html);
  if (source.startMarker) {
    const i = text.indexOf(source.startMarker);
    if (i >= 0) text = text.slice(i + source.startMarker.length);
  }
  if (source.endMarker) {
    const j = text.indexOf(source.endMarker);
    if (j > 0) text = text.slice(0, j);
  }
  const seen = new Set();
  const out = [];
  for (const m of text.matchAll(
    /(\d{2})\.(\d{2})\.(\d{2,4})\s+(\d{1,2})[.:](\d{2})\s*[-–]\s*(\d{1,2})[.:](\d{2})/g,
  )) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    const month = Number(m[2]);
    if (month < 1 || month > 12 || Number(m[1]) > 31) continue;
    const date = `${year}-${m[2]}-${m[1]}`;
    const time = `${String(m[4]).padStart(2, '0')}:${m[5]}`;
    if (seen.has(`${date} ${time}`)) continue;
    seen.add(`${date} ${time}`);
    const span = Number(m[6]) + Number(m[7]) / 60 - (Number(m[4]) + Number(m[5]) / 60);
    console.log(`[${source.slug}] dated-time-list: ${date} ${time} (${span} h)`);
    out.push({
      title: source.title,
      ...(source.titleEn ? { titleEn: source.titleEn } : {}),
      date,
      time,
      ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
      ...(source.price ? { price: source.price } : {}),
      url: source.bookUrl ?? source.url,
    });
  }
  if (out.length) return out;

  // Fallback for hour-only ranges laid out in table rows ("23.08.2026 …
  // 11 - 13 Uhr … Hier buchen", Sarah's format): parse per date slice in
  // the raw markup, so each entry keeps its own booking link (PayPal or
  // checkout host) instead of one shared page.
  let hay = html;
  if (source.startMarker) {
    const i = hay.indexOf(source.startMarker);
    if (i >= 0) hay = hay.slice(i);
  }
  if (source.endMarker) {
    const j = hay.indexOf(source.endMarker);
    if (j > 0) hay = hay.slice(0, j);
  }
  const dates = [...hay.matchAll(/(\d{2})\.(\d{2})\.(20\d{2})\b/g)];
  dates.forEach((m, idx) => {
    const month = Number(m[2]);
    if (month < 1 || month > 12 || Number(m[1]) > 31) return;
    const date = `${m[3]}-${m[2]}-${m[1]}`;
    const raw = hay.slice(m.index, idx + 1 < dates.length ? dates[idx + 1].index : hay.length);
    const row = stripTags(raw).slice(0, 200);
    const range = row.match(/(\d{1,2})(?:[.:](\d{2}))?\s*[-–]\s*(\d{1,2})(?:[.:](\d{2}))?\s*Uhr/);
    const single = range ? null : row.match(/(\d{1,2})(?:[.:](\d{2}))?\s*Uhr/);
    const t = range ?? single;
    if (!t) return;
    const time = `${String(t[1]).padStart(2, '0')}:${t[2] ?? '00'}`;
    if (seen.has(`${date} ${time}`)) return;
    seen.add(`${date} ${time}`);
    const span = range ? Number(range[3]) + Number(range[4] ?? 0) / 60 - (Number(range[1]) + Number(range[2] ?? 0) / 60) : 0;
    const rowPrice = row.match(/(\d+)\s*(?:€|Euro)\b/);
    const link = raw.match(/https?:\/\/(?:www\.)?(?:paypal\.com|checkout\.[a-z0-9.-]+)\/[^\s"'<>]+/);
    console.log(`[${source.slug}] dated-time-list (row): ${date} ${time} (${span || '?'} h) ${link ? 'own link' : 'page'}`);
    out.push({
      title: source.title,
      ...(source.titleEn ? { titleEn: source.titleEn } : {}),
      date,
      time,
      ...(span > 0 && span <= 12
        ? { duration: `${Math.round(span * 2) / 2} h` }
        : source.duration
          ? { duration: source.duration }
          : {}),
      ...(rowPrice ? { price: `€${rowPrice[1]}` } : source.price ? { price: source.price } : {}),
      url: link ? decodeEntities(link[0]) : (source.bookUrl ?? source.url),
    });
  });
  return out;
}

/** Parser for calendar pages built as h2-titled blocks — each workshop an
 *  <h2> heading followed by a written date (German "Samstag 22. August
 *  2026" or English "Sunday 30 August 2026"), a "15:00-19:30 Uhr" range,
 *  prices and a booking link (Pasta Madre's format). A block listing
 *  several prices (their solidarity model) becomes a €min–max range;
 *  sold-out blocks ("ausgebucht") are skipped. */
function fromTitledDateBlocks(html, source) {
  const MONTHS = {
    januar: '01', februar: '02', märz: '03', april: '04', mai: '05', juni: '06',
    juli: '07', august: '08', september: '09', oktober: '10', november: '11', dezember: '12',
    january: '01', february: '02', march: '03', may: '05', june: '06',
    july: '07', october: '10', december: '12',
  };
  const MONTH_NAMES = Object.keys(MONTHS).join('|');
  const heads = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  const out = [];
  // Their headings are styled lowercase; the card title-cases every word
  // ("Gemüse Fermentieren") so titles read as titles.
  const capitalize = (s) => s.replace(/\p{L}+/gu, (w) => w[0].toUpperCase() + w.slice(1));
  for (let i = 0; i < heads.length; i++) {
    const title = capitalize(stripTags(heads[i][1]).trim());
    if (!title) continue;
    const start = heads[i].index + heads[i][0].length;
    const block = html.slice(start, i + 1 < heads.length ? heads[i + 1].index : html.length);
    const text = stripTags(block);
    if (/ausgebucht|sold\s*out/i.test(text)) {
      console.log(`[${source.slug}] blocks: "${title}" sold out — skipped`);
      continue;
    }
    const dm = text.match(new RegExp(`(\\d{1,2})\\.?\\s+(${MONTH_NAMES})\\s+(20\\d{2})`, 'i'));
    if (!dm) continue;
    const date = `${dm[3]}-${MONTHS[dm[2].toLowerCase()]}-${dm[1].padStart(2, '0')}`;

    const range = text.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
    const time = range ? `${range[1].padStart(2, '0')}:${range[2]}` : undefined;
    const span = range
      ? Number(range[3]) + Number(range[4]) / 60 - (Number(range[1]) + Number(range[2]) / 60)
      : 0;

    const prices = [...text.matchAll(/(\d{2,3})[,.]\d{2}\s*€/g)].map((p) => Number(p[1]));
    const price = prices.length
      ? Math.min(...prices) === Math.max(...prices)
        ? `€${prices[0]}`
        : `€${Math.min(...prices)}–${Math.max(...prices)}`
      : undefined;

    // The block's own booking button, when it links anywhere.
    let book;
    for (const a of block.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      if (/reservieren|book\s*now|jetzt\s*buchen/i.test(stripTags(a[2]))) {
        book = decodeEntities(a[1]);
        break;
      }
    }

    console.log(
      `[${source.slug}] blocks: "${title}" ${date} ${time ?? '?'} ${price ?? ''} ${book ? 'link' : 'page'}`,
    );
    out.push({
      title,
      date,
      ...(time ? { time } : {}),
      ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
      ...(price ? { price } : {}),
      url: book && /^https?:/i.test(book) ? book : source.url,
    });
  }
  return out;
}

/** Strategy: Shopify catalog + Cowlendar booking app. The collection's
 *  products.json lists the workshops (title, price, variant); each product
 *  page embeds its Cowlendar calendar id, and Cowlendar's availability
 *  endpoint answers plain unauthenticated GETs with every bookable slot
 *  (start, duration, spots left) — verified live against The Munio's
 *  booking modal. Sessions run near-daily, so source.maxDays keeps the
 *  horizon short enough not to drown the rest of the calendar. */
async function fromShopifyCowlendar(source) {
  const res = await fetch(`${source.base}/collections/${source.collection}/products.json?limit=250`, {
    headers: { 'user-agent': UA, accept: 'application/json' },
  });
  if (!res.ok) {
    console.log(`[${source.slug}] cowlendar: products.json HTTP ${res.status}`);
    return [];
  }
  const products = (await res.json()).products ?? [];
  console.log(`[${source.slug}] cowlendar: ${products.length} products`);

  const horizon = source.maxDays ?? 45;
  const lastISO = berlinDate(Date.parse(todayISO) + horizon * 86400000);
  const months = [];
  for (let d = new Date(`${todayISO.slice(0, 7)}-01T00:00:00Z`); d.toISOString().slice(0, 7) <= lastISO.slice(0, 7); d.setUTCMonth(d.getUTCMonth() + 1)) {
    months.push(d.toISOString().slice(0, 7));
  }
  const out = [];

  for (const p of products) {
    const variant = p.variants?.[0];
    if (!variant) continue;
    const productUrl = `${source.base}/products/${p.handle}`;
    const minutes = Number(/(\d{2,3})\s*min/i.exec(p.title)?.[1] ?? (/1[.,]5\s*h/i.test(p.title) ? 90 : 60));
    const price = Number(variant.price) > 0 ? `€${Math.round(Number(variant.price))}` : undefined;

    let html = '';
    try {
      html = await (await fetch(productUrl, { headers: { 'user-agent': UA } })).text();
    } catch (err) {
      console.log(`[${source.slug}] cowlendar: ${p.handle} page: ${err.message.split('\n')[0]}`);
      continue;
    }
    // The page embeds Cowlendar's own product_handle → service_id map (as
    // escaped JSON inside a script string) — the authoritative calendar id
    // for this product. Bare 24-hex candidates stay as a fallback.
    const cfg = html.replace(/\\/g, '');
    const idByHandle = new Map(
      [...cfg.matchAll(/"product_handle":"([^"]+)","service_id":"([0-9a-f]{24})"/g)].map((m) => [m[1], m[2]]),
    );
    const mapped = idByHandle.get(p.handle);
    const candidates = mapped
      ? [mapped]
      : [...new Set([...html.matchAll(/\b[0-9a-f]{24}\b/g)].map((m) => m[0]))].slice(0, 8);
    if (!mapped) console.log(`[${source.slug}] cowlendar: "${p.title}": no service_id mapping — falling back to ${candidates.length} candidates`);
    let best = null;
    for (const id of candidates) {
      let slots = [];
      let ok = true;
      for (const ym of months) {
        const [y, mo] = ym.split('-');
        try {
          const av = await fetch(
            `https://app.cowlendar.com/extapi/calendar/${id}/availability?year=${y}&month=${Number(mo)}&timezone=Europe%2FBerlin&quantity_details%5B0%5D%5Btype%5D=default&quantity_details%5B0%5D%5Bquantity%5D=1&quantity_details%5B0%5D%5Bname%5D=Default&teammate_id=all&duration=${minutes}&is_manual=false&is_pos=false&adjacent_days=true&variant_id=${variant.id}`,
            { headers: { 'user-agent': UA, accept: 'application/json' } },
          );
          if (!av.ok) { ok = false; break; }
          const data = await av.json();
          if (!Array.isArray(data?.long)) { ok = false; break; }
          slots.push(...data.long);
        } catch { ok = false; break; }
        await new Promise((r2) => setTimeout(r2, 200));
      }
      if (!ok) continue;
      const seen = new Set();
      const entries = [];
      for (const s of slots) {
        const m = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/.exec(s?.slot_start ?? '');
        if (!m || s.is_bookable === false || s.qty_left === 0) continue;
        if (m[1] > lastISO || seen.has(s.slot_start)) continue;
        seen.add(s.slot_start);
        const hours = Number(s.slot_duration ?? minutes) / 60;
        entries.push({
          title: p.title.replace(/\s*\d+\s*min\b/i, '').replace(/\s*1[.,]5\s*h\b/i, '').trim(),
          date: m[1],
          time: m[2],
          duration: `${Math.round(hours * 2) / 2} h`,
          ...(price ? { price } : {}),
          ...(Number.isFinite(s.qty_left) ? { spots: s.qty_left } : {}),
          url: productUrl,
        });
      }
      if (!best || entries.length > best.entries.length) best = { id, entries };
      if (entries.length) break; // this calendar answers for this product
    }
    if (best) {
      out.push(...best.entries);
      console.log(`[${source.slug}] cowlendar: "${p.title}" calendar ${best.id}: ${best.entries.length} bookable slots ≤ ${lastISO}`);
    } else {
      console.log(`[${source.slug}] cowlendar: "${p.title}": no working calendar id among ${candidates.length} candidates`);
    }
  }
  return out;
}

/** Strategy for The Monk Garden's pattern: a listing page whose dated
 *  entries each link to their own checkout.<domain> ticket page, which
 *  states the full date and start time ("26.09.2026 um 10:00 Uhr"), the
 *  title and the per-person price. The checkout pages are the source of
 *  truth — no year-guessing from the listing's bare "26.09." tokens. */
async function fromCheckoutLinks(html, source) {
  const links = [
    ...new Set([...html.matchAll(/https?:\/\/checkout\.[a-z0-9.-]+\/[a-z0-9-]+/gi)].map((m) => m[0])),
  ];
  console.log(`[${source.slug}] checkout links found: ${links.length}`);
  const out = [];
  for (const link of links) {
    try {
      const r = await fetch(link, { headers: { 'user-agent': UA } });
      if (!r.ok) {
        console.log(`[${source.slug}] ${link}: HTTP ${r.status}`);
        continue;
      }
      const page = await r.text();
      const text = stripTags(page);
      const dm = text.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s*um\s*(\d{1,2}):(\d{2})\s*Uhr)?/);
      if (!dm) {
        console.log(`[${source.slug}] ${link}: no dated line found`);
        continue;
      }
      const title = stripTags(page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '').trim() || source.title || 'Workshop';
      const price = text.match(/(\d+)[.,](\d{2})\s*EUR/);
      const date = `${dm[3]}-${dm[2]}-${dm[1]}`;
      console.log(
        `[${source.slug}] checkout: "${title}" ${date} ${dm[4] ? `${dm[4]}:${dm[5]}` : 'no time'} ${price ? `€${price[1]}` : 'no price'}`,
      );
      out.push({
        title,
        ...(source.titleEn ? { titleEn: source.titleEn } : {}),
        date,
        ...(dm[4] ? { time: `${String(dm[4]).padStart(2, '0')}:${dm[5]}` } : {}),
        ...(source.duration ? { duration: source.duration } : {}),
        ...(price ? { price: `€${Math.round(Number(`${price[1]}.${price[2]}`))}` } : {}),
        url: link,
      });
    } catch (err) {
      console.log(`[${source.slug}] ${link}: ${err.message.split('\n')[0]}`);
    }
    await new Promise((r2) => setTimeout(r2, 300));
  }
  return out;
}

/** Strategy for sites booking through Konfetti (gokonfetti.com): course
 *  pages embed a booking iframe carrying an eventDescriptionId, and the
 *  widget reads its dates from a public JSON API — verified live against
 *  Ceramic Kingdom's scheduler:
 *  GET api.gokonfetti.com/v1/store/events/<id>/calendar?month=YYYY-MM
 *  answers plain unauthenticated fetches with per-day dates (UTC start/end,
 *  tickets left, price in cents). The site's sitemap finds the course
 *  pages; pages without a widget just contribute nothing. */
async function fromKonfetti(source) {
  const res = await fetch(source.url, {
    headers: { 'user-agent': UA, accept: 'application/xml,text/xml,*/*' },
  });
  if (!res.ok) {
    console.log(`[${source.slug}] konfetti: sitemap HTTP ${res.status}`);
    return [];
  }
  const xml = await res.text();
  const pat = source.pagePattern ? new RegExp(source.pagePattern) : /./;
  const pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeEntities(m[1])))].filter(
    (u) => pat.test(u),
  );
  console.log(`[${source.slug}] konfetti: ${pages.length} candidate pages from sitemap`);

  const horizon = source.maxDays ?? KEEP_DAYS;
  const lastISO = berlinDate(Date.parse(todayISO) + horizon * 86400000);
  const months = [];
  for (
    let d = new Date(`${todayISO.slice(0, 7)}-01T00:00:00Z`);
    d.toISOString().slice(0, 7) <= lastISO.slice(0, 7);
    d.setUTCMonth(d.getUTCMonth() + 1)
  ) {
    months.push(d.toISOString().slice(0, 7));
  }

  const out = [];
  const seenEvents = new Set();
  for (const page of pages) {
    let html = '';
    try {
      const r = await fetch(page, { headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.8' } });
      if (!r.ok) {
        console.log(`[${source.slug}] konfetti: page HTTP ${r.status} ${page}`);
        continue;
      }
      html = await r.text();
    } catch (e) {
      console.log(`[${source.slug}] konfetti: page fetch failed ${page}: ${e.message}`);
      continue;
    }
    // The widget id hides in whatever form Squarespace stored the embed —
    // a plain iframe URL, a data attribute, or JSON with escaped slashes and
    // unicode-escaped '=' — so match every spelling on an unescaped copy.
    const unescaped = decodeEntities(html.replace(/\\u003d/gi, '=').replace(/\\/g, ''));
    const ids = [
      ...new Set(
        [
          ...unescaped.matchAll(/eventDescriptionId=([a-z0-9]{4,})/gi),
          ...unescaped.matchAll(/event-description-id["'\s:=]+([a-z0-9]{4,})/gi),
          // The Squarespace snippet names the event on the wrapper div:
          // <div id='konfetti_iframe_wrapper' data-event-id='w2dr9z' …>
          ...unescaped.matchAll(/konfetti[\s\S]{0,300}?data-event-id=["']([a-z0-9]{4,})["']/gi),
        ].map((m) => m[1]),
      ),
    ];
    if (!ids.length) {
      const hits = [...unescaped.matchAll(/konfetti/gi)].slice(0, 3);
      for (const h of hits) {
        console.log(
          `[${source.slug}] konfetti: no id on ${page.split('/').pop()} — context: ${unescaped
            .slice(Math.max(0, h.index - 100), h.index + 140)
            .replace(/\s+/g, ' ')}`,
        );
      }
      if (!hits.length) console.log(`[${source.slug}] konfetti: no "konfetti" mention at all on ${page.split('/').pop()} (${html.length} bytes)`);
      continue;
    }
    const title =
      stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '').trim() ||
      decodeEntities(html.match(/<title>([^<]*)/i)?.[1] ?? '').split('—')[0].trim();
    for (const id of ids) {
      if (seenEvents.has(id)) continue;
      seenEvents.add(id);
      let kept = 0;
      for (const ym of months) {
        let days;
        try {
          const av = await fetch(`https://api.gokonfetti.com/v1/store/events/${id}/calendar?month=${ym}`, {
            headers: { 'user-agent': UA, accept: 'application/json' },
          });
          if (!av.ok) continue;
          days = await av.json();
        } catch {
          continue;
        }
        for (const day of Object.values(days ?? {})) {
          for (const s of day?.dates ?? []) {
            if (s?.status !== 'OPEN') continue;
            if (s.available_tickets_quantity === 0) continue;
            const startMs = Date.parse(s.start ?? '');
            if (Number.isNaN(startMs)) continue;
            const endMs = Date.parse(s.end ?? '');
            const span = Number.isNaN(endMs) ? 0 : (endMs - startMs) / 3600000;
            const cents = Number(s.product?.price?.amount);
            out.push({
              title,
              date: berlinDate(startMs),
              time: berlinTime(startMs),
              ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
              ...(Number.isFinite(cents) && cents > 0 ? { price: `€${Math.round(cents / 100)}` } : {}),
              ...(Number.isFinite(s.available_tickets_quantity) ? { spots: s.available_tickets_quantity } : {}),
              url: page,
            });
            kept++;
          }
        }
        await new Promise((r2) => setTimeout(r2, 200));
      }
      console.log(`[${source.slug}] konfetti: "${title}" [${id}] → ${kept} open dates`);
    }
  }
  return out;
}

/** Find `"key":` in a blob of HTML/JS and bracket-match the JSON value
 *  that follows. Returns the parsed value or null. */
function extractJsonAfterKey(text, key) {
  const m = new RegExp(`"${key}"\\s*:\\s*`).exec(text);
  if (!m) return null;
  const start = m.index + m[0].length;
  const open = text[start];
  if (open !== '[' && open !== '{') return null;
  const close = open === '[' ? ']' : '}';
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (!depth) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/** Strategy: Acuity Scheduling's own client API. The booking widget looks
 *  click-only, but /schedule.php?owner=<id> redirects to the account's
 *  /schedule/<hash>/ page whose HTML embeds the appointment catalog (ids,
 *  names, prices, durations, calendars), and the widget reads dates from a
 *  public JSON endpoint — verified live against Senlë Studio's scheduler:
 *  GET /api/scheduling/v1/availability/times?owner=<hash>&appointmentTypeId=…
 *  answers plain unauthenticated fetches. */
async function fromAcuity(source) {
  const base = 'https://app.acuityscheduling.com';
  const res = await fetch(`${base}/schedule.php?owner=${source.owner}`, {
    redirect: 'follow',
    headers: { 'user-agent': UA },
  });
  console.log(`[${source.slug}] acuity scheduler: HTTP ${res.status} at ${res.url}`);
  if (!res.ok) return [];
  const hash = res.url.match(/\/schedule\/([a-z0-9]+)/i)?.[1];
  if (!hash) {
    console.log(`[${source.slug}] acuity: no schedule hash in final url`);
    return [];
  }
  const html = await res.text();

  // Either a flat array or an object keyed by category name.
  const rawTypes = extractJsonAfterKey(html, 'appointmentTypes');
  const types = Array.isArray(rawTypes)
    ? rawTypes
    : rawTypes && typeof rawTypes === 'object'
      ? Object.values(rawTypes).flat()
      : null;
  if (!Array.isArray(types) || !types.length) {
    const i = html.search(/appointmentTypes/i);
    console.log(
      `[${source.slug}] acuity: appointmentTypes not parseable; context: ${i >= 0 ? `…${html.slice(Math.max(0, i - 100), i + 400).replace(/\s+/g, ' ')}…` : 'key absent'}`,
    );
    return [];
  }
  console.log(
    `[${source.slug}] acuity appointment types: ${types.map((t) => `${t?.name} [${t?.id}] €${t?.price} ${t?.duration}min`).join('; ')}`,
  );

  const out = [];
  for (const t of types) {
    if (!t?.id || !t?.name) continue;
    const cal = [].concat(t.calendarIDs ?? t.calendarIds ?? t.calendars ?? [])[0];
    const priceNum = Number(t.price);
    const minutes = Number(t.duration);
    try {
      const r = await fetch(
        `${base}/api/scheduling/v1/availability/times?owner=${hash}&appointmentTypeId=${t.id}${cal ? `&calendarId=${cal}` : ''}&startDate=${todayISO}&maxDays=${KEEP_DAYS}&timezone=Europe%2FBerlin`,
        { headers: { 'user-agent': UA, accept: 'application/json' } },
      );
      if (!r.ok) {
        console.log(`[${source.slug}] acuity times for "${t.name}": HTTP ${r.status}`);
        continue;
      }
      const days = await r.json();
      for (const slot of Object.values(days ?? {}).flat()) {
        const ms = Date.parse(slot?.time ?? '');
        if (Number.isNaN(ms)) continue;
        if (slot.slotsAvailable === 0) continue; // fully booked
        console.log(
          `[${source.slug}] acuity: "${t.name}" ${berlinDate(ms)} ${berlinTime(ms)} (${slot.slotsAvailable ?? '?'} spots)`,
        );
        out.push({
          title: stripTags(String(t.name)),
          date: berlinDate(ms),
          time: berlinTime(ms),
          ...(Number.isFinite(slot.slotsAvailable) ? { spots: slot.slotsAvailable } : {}),
          ...(minutes > 0 && minutes <= 720 ? { duration: `${Math.round((minutes / 60) * 2) / 2} h` } : {}),
          ...(Number.isFinite(priceNum) && priceNum > 0 ? { price: `€${Math.round(priceNum)}` } : {}),
          // Deep link straight into this class's date picker.
          url: `${base}/schedule/${hash}/appointment/${t.id}/calendar/${cal ?? 'any'}`,
        });
      }
    } catch (err) {
      console.log(`[${source.slug}] acuity times for "${t.name}": ${err.message.split('\n')[0]}`);
    }
    await new Promise((r2) => setTimeout(r2, 250));
  }
  return out;
}

/** Parse an iCalendar feed's VEVENTs into feed entries. Local (TZID)
 *  timestamps are taken as Berlin wall-clock; UTC ones are converted. */
function fromIcs(icsText, pageUrl, source) {
  // Unfold RFC 5545 continuation lines before matching.
  const text = icsText.replace(/\r?\n[ \t]/g, '');
  const out = [];
  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const get = (k) => block.match(new RegExp(`^${k}(?:;[^:\\r\\n]*)?:(.*)$`, 'mi'))?.[1]?.trim();
    const stamp = (raw) => raw?.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)/);
    const s = stamp(get('DTSTART'));
    if (!s) continue;
    const e = stamp(get('DTEND'));
    let date, time;
    if (s[7] === 'Z') {
      const ms = Date.parse(`${s[1]}-${s[2]}-${s[3]}T${s[4]}:${s[5]}:${s[6]}Z`);
      date = berlinDate(ms);
      time = berlinTime(ms);
    } else {
      date = `${s[1]}-${s[2]}-${s[3]}`;
      time = `${s[4]}:${s[5]}`;
    }
    let duration;
    if (e) {
      // Same-offset difference, so parsing both as UTC is safe.
      const hours =
        (Date.parse(`${e[1]}-${e[2]}-${e[3]}T${e[4]}:${e[5]}:${e[6]}Z`) -
          Date.parse(`${s[1]}-${s[2]}-${s[3]}T${s[4]}:${s[5]}:${s[6]}Z`)) /
        3600000;
      if (hours > 0 && hours <= 12) duration = `${Math.round(hours * 2) / 2} h`;
    }
    // "Workshop \"Honiglebkuchen backen\"" → "Honiglebkuchen backen".
    const summary = get('SUMMARY')
      ?.replace(/\\([,;])/g, '$1')
      .replace(/["„“]/g, '')
      .replace(/^\s*Workshop:?\s*/i, '')
      .trim();
    out.push({
      title: summary || source.title || 'Workshop',
      date,
      time,
      ...(duration ? { duration } : {}),
      ...(source.price ? { price: source.price } : {}),
      url: pageUrl,
    });
  }
  return out;
}

/** Wix Bookings app id — constant across all Wix sites. */
const WIX_BOOKINGS_APP = '13d21c63-b5ec-5912-8397-c3a5ddb27a97';

/** Strategy 2: the Wix Bookings visitor API. A Wix page's schedule is
 *  rendered client-side, so the dates never appear in the HTML; the site's
 *  own /_api/ endpoints serve them to any visitor holding the instance
 *  token that GET /_api/v1/access-tokens hands out. Returns null when the
 *  page isn't Wix, [] when it is but nothing could be read. */
async function fromWixBookings(source, html) {
  if (!/wix\.com|wixstatic|parastorage|thunderbolt/i.test(html)) return null;
  const origin = new URL(source.url).origin;
  const jsonHeaders = { 'user-agent': UA, accept: 'application/json' };

  const tokRes = await fetch(`${origin}/_api/v1/access-tokens`, { headers: jsonHeaders });
  console.log(`[${source.slug}] wix access-tokens: HTTP ${tokRes.status}`);
  if (!tokRes.ok) return [];
  const tokens = await tokRes.json();
  const instance = tokens?.apps?.[WIX_BOOKINGS_APP]?.instance;
  if (!instance) {
    console.log(`[${source.slug}] wix: no bookings token; app ids present: ${Object.keys(tokens?.apps ?? {}).join(', ') || 'none'}`);
    return [];
  }

  const authHeaders = { ...jsonHeaders, authorization: instance, 'content-type': 'application/json' };

  const svcRes = await fetch(`${origin}/_api/bookings/v2/services/query`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ query: { paging: { limit: 100 } } }),
  });
  console.log(`[${source.slug}] wix services query: HTTP ${svcRes.status}`);
  if (!svcRes.ok) {
    console.log(`[${source.slug}] wix services body: ${(await svcRes.text()).slice(0, 300)}`);
    return [];
  }
  const svcJson = await svcRes.json();
  const services = svcJson.services ?? [];
  console.log(
    `[${source.slug}] wix services: ${services.map((s) => `${s.name} (${s.type ?? '?'}) [${s.id}]`).join('; ') || 'none'}`,
  );
  if (!services.length) return [];

  const from = new Date().toISOString();
  const to = new Date(Date.now() + KEEP_DAYS * 86400000).toISOString();
  const avRes = await fetch(`${origin}/_api/bookings/v2/availability/query`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      query: {
        filter: { serviceId: { $in: services.map((s) => s.id) }, startDate: from, endDate: to },
      },
    }),
  });
  console.log(`[${source.slug}] wix availability query: HTTP ${avRes.status}`);
  if (!avRes.ok) {
    console.log(`[${source.slug}] wix availability body: ${(await avRes.text()).slice(0, 300)}`);
    return [];
  }
  const avJson = await avRes.json();
  const entries = avJson.availabilityEntries ?? [];
  console.log(`[${source.slug}] wix availability entries: ${entries.length}`);

  const byId = new Map(services.map((s) => [s.id, s]));
  const events = [];
  for (const entry of entries) {
    const slot = entry.slot ?? entry;
    const start = Date.parse(slot.startDate ?? '');
    if (Number.isNaN(start)) continue;
    if (entry.bookable === false) continue;
    const service = byId.get(slot.serviceId);
    const priceValue = service?.payment?.fixed?.price?.value;
    const servicePage = service?.urls?.servicePage?.url;
    events.push({
      title: service?.name ?? 'Workshop',
      date: berlinDate(start),
      time: berlinTime(start),
      ...(priceValue != null ? { price: `€${Math.round(Number(priceValue))}` } : {}),
      url: typeof servicePage === 'string' && servicePage.startsWith('http') ? servicePage : source.url,
    });
  }
  return events;
}

/** Parser for German weekly-schedule pages: lines shaped like
 *  "<Title> Dienstags I 18 - 20 Uhr I Berlin Spandau  89€ pro Person".
 *  Emits recurring entries (weekday + time), not dated ones. */
function fromGermanRecurring(html, source) {
  const DE_DAYS = { mo: 'mon', di: 'tue', mi: 'wed', do: 'thu', fr: 'fri', sa: 'sat', so: 'sun' };
  const text = stripTags(html);
  const results = [];
  const re =
    /((?:Mo(?:ntag)?|Di(?:enstag)?|Mi(?:ttwoch)?|Do(?:nnerstag)?|Fr(?:eitag)?|Sa(?:mstag)?|So(?:nntag)?)s?\.?(?:\s*(?:&|und)\s*(?:Mo|Di|Mi|Do|Fr|Sa|So)[a-zäöü]*\.?s?)*)\s*[I|l]\s*(\d{1,2}(?:[:.]\d{2})?)\s*(?:-|–|bis)\s*(\d{1,2}(?:[:.]\d{2})?)\s*Uhr/gi;

  const toTime = (raw) => {
    const [h, m = '00'] = raw.replace('.', ':').split(':');
    return `${h.padStart(2, '0')}:${m.padEnd(2, '0')}`;
  };
  const toHours = (raw) => {
    const [h, m = '0'] = raw.replace('.', ':').split(':');
    return Number(h) + Number(m) / 60;
  };

  for (const m of text.matchAll(re)) {
    const weekdays = [
      ...new Set(
        m[1]
          .split(/&|und/i)
          .map((d) => DE_DAYS[d.trim().slice(0, 2).toLowerCase()])
          .filter(Boolean),
      ),
    ];
    if (!weekdays.length) continue;

    // The class name is the text right before the weekday, back to the end
    // of the previous sentence, the previous class's price tail, or page
    // furniture like "Mehr Infos" / "Termine & Infos" buttons.
    const before = text.slice(Math.max(0, m.index - 90), m.index);
    // ALL-CAPS words are section headers ("AKTUELLE ANGEBOTE"), not class
    // names — treat them as boundaries too, then shed leading dashes and a
    // stray leading "Berlin" from a header tail.
    const title = before
      .split(/[.!?—€{}();|]|Spendenbasis|Infos|buchen|\b[A-ZÄÖÜẞ]{4,}\b|\s{3,}/)
      .pop()
      ?.replace(/^[\s\-–—:·]+/, '')
      .replace(/^Berlin\s+/, '')
      .trim();
    if (!title || title.length < 3 || title.length > 70) continue;

    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 140);
    const district = after.match(/Berlin\s+([A-ZÄÖÜ][A-Za-zäöüß]+(?:\s+St\.\s*[A-ZÄÖÜ][A-Za-zäöüß]+)?)/)?.[1];
    const price = after.match(/(\d{1,4})\s*€|€\s*(\d{1,4})/);
    const hours = toHours(m[3]) - toHours(m[2]);
    const duration =
      hours > 0 ? `${Number.isInteger(hours) ? hours : hours.toFixed(1)} h` : undefined;

    results.push({
      slug: source.slug,
      sourceUrl: source.url,
      title,
      weekdays,
      time: toTime(m[2]),
      ...(duration ? { duration } : {}),
      ...(price ? { price: `€${price[1] ?? price[2]}` } : {}),
      ...(district ? { district } : {}),
      url: source.url,
    });
  }

  // Dedupe repeats of the same class line elsewhere on the page.
  const seenKeys = new Set();
  return results.filter((r) => {
    const key = `${r.title}|${r.time}|${r.weekdays.join()}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });
}

/** Parser for Shopify workshop shops: the collection's products.json lists
 *  every workshop as a product whose variants are the dated sessions
 *  ("DD.MM.YYYY - HH:MM"), each with its own price and availability flag.
 *  Sold-out variants are skipped. Duration comes from the description
 *  ("Duration: 1.5 - 2 hours"). */
function fromShopify(jsonText, source) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    console.log(`[${source.slug}] shopify: response is not JSON`);
    return [];
  }
  const out = [];
  for (const product of data.products ?? []) {
    const body = stripTags(String(product.body_html ?? ''));
    const dur = body.match(/Duration:\s*([\d.,]+)(?:\s*(?:-|\u2013|to)\s*([\d.,]+))?\s*hours?/i);
    const duration = dur
      ? `${dur[1].replace(',', '.')}${dur[2] ? `\u2013${dur[2].replace(',', '.')}` : ''} h`
      : undefined;
    const productUrl = new URL(`/products/${product.handle}`, source.url).href;
    let kept = 0;
    for (const variant of product.variants ?? []) {
      if (variant.available === false) continue;
      const m = String(variant.title).match(/(\d{2})\.(\d{2})\.(\d{4})\s*[-\u2013]\s*(\d{1,2}):(\d{2})/);
      if (!m) continue;
      out.push({
        title: stripTags(String(product.title)),
        date: `${m[3]}-${m[2]}-${m[1]}`,
        time: `${m[4].padStart(2, '0')}:${m[5]}`,
        ...(duration ? { duration } : {}),
        ...(variant.price != null ? { price: `\u20ac${Math.round(Number(variant.price))}` } : {}),
        ...(source.district ? { district: source.district } : {}),
        url: productUrl,
      });
      kept++;
    }
    // Shops that create one product per workshop date (Berliner Bumerang)
    // carry the date in the description instead of the variants:
    // "Sonntag, 11. Oktober 2026 von 10 bis 17 Uhr".
    if (!kept) {
      const MONTHS_DE = {
        januar: '01', februar: '02', märz: '03', april: '04', mai: '05', juni: '06',
        juli: '07', august: '08', september: '09', oktober: '10', november: '11', dezember: '12',
      };
      const wm = body.match(
        /(\d{1,2})\.\s*(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s*(20\d{2})(?:\s*von\s*(\d{1,2})(?:[:.](\d{2}))?\s*bis\s*(\d{1,2})(?:[:.](\d{2}))?\s*Uhr)?/i,
      );
      const variant = (product.variants ?? []).find((v) => v.available !== false);
      if (wm && variant) {
        const date = `${wm[3]}-${MONTHS_DE[wm[2].toLowerCase()]}-${wm[1].padStart(2, '0')}`;
        const time = wm[4] ? `${wm[4].padStart(2, '0')}:${wm[5] ?? '00'}` : undefined;
        const span = wm[4] && wm[6]
          ? Number(wm[6]) + Number(wm[7] ?? 0) / 60 - (Number(wm[4]) + Number(wm[5] ?? 0) / 60)
          : 0;
        out.push({
          // A "OKTOBER - " style month prefix repeats what the date says.
          title: stripTags(String(product.title)).replace(/^\s*(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s*[-–]\s*/i, ''),
          date,
          ...(time ? { time } : {}),
          ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
          ...(variant.price != null ? { price: `€${Math.round(Number(variant.price))}` } : {}),
          ...(source.district ? { district: source.district } : {}),
          url: productUrl,
        });
        kept++;
        console.log(`[${source.slug}] shopify body-date: "${product.title}" ${date} ${time ?? ''}`);
      }
    }
    console.log(`[${source.slug}] shopify product "${product.title}": ${(product.variants ?? []).length} variants, ${kept} available dated sessions`);
  }
  return out;
}

/** Parser for dated-list pages: "Samstag, 29. August 2026" (German) or
 *  "Friday, September 25, 2026" (English), with the start time ("18 Uhr" /
 *  "18:00" / "6:00 PM") looked for around each date. A date with no time
 *  nearby is skipped and logged — better absent than wrong. */
function fromGermanDates(html, source) {
  const MONTHS = {
    januar: '01', februar: '02', märz: '03', april: '04', mai: '05', juni: '06',
    juli: '07', august: '08', september: '09', oktober: '10', november: '11', dezember: '12',
    january: '01', february: '02', march: '03', may: '05', june: '06',
    july: '07', october: '10', december: '12',
  };
  const MONTH_NAMES =
    'Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|January|February|March|May|June|July|October|December';
  // German "25. September 2026" and English "September 25, 2026".
  const re = new RegExp(
    `(?:(\\d{1,2})\\.\\s*(${MONTH_NAMES})|(${MONTH_NAMES})\\s+(\\d{1,2}),?)\\s*(20\\d{2})`,
    'gi',
  );

  // Try the visible text first; when a booking widget keeps its dates in
  // embedded JSON inside a script block, fall back to the raw markup — the
  // date strings still match there. \uXXXX escapes hide umlauts in JSON.
  const unescapeUmlauts = (s) =>
    s.replace(/\\u00e4/gi, 'ä').replace(/\\u00f6/gi, 'ö').replace(/\\u00fc/gi, 'ü').replace(/\\u00df/gi, 'ß');
  let text = stripTags(html);
  if (!re.test(text)) {
    text = unescapeUmlauts(decodeEntities(html));
    console.log(`[${source.slug}] no dates in visible text — scanning raw markup`);
  }
  re.lastIndex = 0;
  const out = [];

  for (const m of text.matchAll(re)) {
    const day = m[1] ?? m[4];
    const month = MONTHS[(m[2] ?? m[3]).toLowerCase()];
    const date = `${m[5]}-${month}-${day.padStart(2, '0')}`;
    const beforeCtx = text.slice(Math.max(0, m.index - 80), m.index);
    const afterCtx = text.slice(m.index + m[0].length, m.index + m[0].length + 160);
    const around = `${beforeCtx} § ${afterCtx}`;
    const TIME_RE = /(\d{1,2}):(\d{2})(?!\s*€)\s*(am|pm)?|(\d{1,2})\s*(?:Uhr|(am|pm))/i;
    // The time after the date belongs to it; one before may belong to the
    // previous entry in a list, so it is only a fallback.
    const timeMatch = afterCtx.match(TIME_RE) ?? beforeCtx.match(TIME_RE);
    let time = source.defaultTime;
    if (timeMatch) {
      let h = Number(timeMatch[4] ?? timeMatch[1]);
      const min = timeMatch[4] != null ? '00' : timeMatch[2];
      const ampm = (timeMatch[3] ?? timeMatch[5])?.toLowerCase();
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      time = `${String(h).padStart(2, '0')}:${min}`;
    }
    if (!time) {
      console.log(`[${source.slug}] date ${date} has no start time nearby — skipped. Context: …${around.replace(/\s+/g, ' ')}…`);
      continue;
    }
    const priceMatch = around.match(/(\d{1,3})(?:,\d{2})?\s*€/);
    out.push({
      title: source.title ?? 'Workshop',
      date,
      time,
      ...(source.titleEn ? { titleEn: source.titleEn } : {}),
      ...(source.duration ? { duration: source.duration } : {}),
      ...(priceMatch ? { price: `€${priceMatch[1]}` } : source.price ? { price: source.price } : {}),
      url: source.url,
    });
  }

  // Last resort, only when no written-out dates exist: numeric German
  // dates ("22.08.2026") — riskier, since any date on the page matches.
  if (!out.length) {
    for (const m of text.matchAll(/\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\b/g)) {
      const date = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
      const afterCtx = text.slice(m.index + m[0].length, m.index + m[0].length + 160);
      const beforeCtx = text.slice(Math.max(0, m.index - 80), m.index);
      const TIME_RE = /(\d{1,2}):(\d{2})(?!\s*€)\s*(am|pm)?|(\d{1,2})\s*(?:Uhr|(am|pm))/i;
      const tm = afterCtx.match(TIME_RE) ?? beforeCtx.match(TIME_RE);
      const time = tm
        ? `${String(Number(tm[4] ?? tm[1]) + ((tm[3] ?? tm[5])?.toLowerCase() === 'pm' && Number(tm[4] ?? tm[1]) < 12 ? 12 : 0)).padStart(2, '0')}:${tm[4] != null ? '00' : tm[2]}`
        : source.defaultTime;
      if (!time) {
        console.log(`[${source.slug}] numeric date ${date} has no time nearby — skipped`);
        continue;
      }
      out.push({
        title: source.title ?? 'Workshop',
        date,
        time,
        ...(source.titleEn ? { titleEn: source.titleEn } : {}),
        ...(source.duration ? { duration: source.duration } : {}),
        ...(source.price ? { price: source.price } : {}),
        url: source.url,
      });
    }
  }

  // The same date can appear more than once on a page — keep the first.
  const seenDates = new Set();
  return out.filter((w) => {
    const key = `${w.date}|${w.time}`;
    if (seenDates.has(key)) return false;
    seenDates.add(key);
    return true;
  });
}

/** Strategy 3: <time datetime> elements, titled by the nearest preceding heading. */
function fromTimeTags(html, sourceUrl) {
  const out = [];
  for (const m of html.matchAll(/<time[^>]*datetime=["']([^"']+)["'][^>]*>/gi)) {
    const start = Date.parse(m[1]);
    if (Number.isNaN(start)) continue;
    const before = html.slice(Math.max(0, m.index - 3000), m.index);
    const heading = [...before.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)].pop();
    out.push({
      title: heading ? stripTags(heading[1]) : 'Workshop',
      date: berlinDate(start),
      time: berlinTime(start),
      url: sourceUrl,
    });
  }
  return out;
}

/** Render a page in headless Chromium and return the HTML of the page and
 *  every iframe — the only way to see schedules that booking widgets
 *  (Acuity, Regiondo, …) draw client-side. Playwright is installed by the
 *  workflow; when it's absent (local runs) this quietly returns null. */
async function renderAllFrames(url, slug) {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
      // Widgets fetch their schedule after load — give them a moment.
      await page.waitForTimeout(8000);
      // Consent managers (Complianz on WordPress, Squarespace's own) hold
      // embedded booking scripts until cookies are accepted, so the widget
      // stays empty for a browser that never clicks. Accept, then wait for
      // the unblocked script to draw the schedule.
      const consentSelectors = [
        '#cmplz-btn-accept', '.cmplz-accept', '.cc-allow', '#onetrust-accept-btn-handler',
        'button:has-text("Alle akzeptieren")', 'button:has-text("Akzeptieren")',
        'button:has-text("Accept all")', 'button:has-text("Accept")',
      ];
      for (const selector of consentSelectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 400 })) {
            await button.click();
            console.log(`[${slug}] accepted cookie consent via ${selector}`);
            await page.waitForTimeout(8000);
            break;
          }
        } catch {
          /* selector not on this page — try the next */
        }
      }
      const parts = [];
      for (const frame of page.frames()) {
        try {
          parts.push(await frame.content());
        } catch {
          /* cross-origin frame that never loaded — skip */
        }
      }
      const combined = parts.join('\n');
      console.log(`[${slug}] headless render: ${page.frames().length} frames, ${combined.length} bytes`);
      return combined;
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.log(`[${slug}] headless render unavailable: ${err.message.split('\n')[0]}`);
    return null;
  }
}

async function scrape(source) {
  // Konfetti fetches its sitemap itself (with an XML accept — Squarespace
  // 406s the HTML-only one used for regular pages below).
  if (source.mode === 'konfetti') {
    const found = await fromKonfetti(source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] konfetti sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  const res = await fetch(source.url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; TwiggliScheduleBot/1.0; +https://www.twiggli.com)',
      accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  console.log(`[${source.slug}] fetched ${html.length} bytes`);

  if (source.mode === 'shopify') {
    const found = fromShopify(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({ slug: source.slug, sourceUrl: source.url, ...w }));
    console.log(`[${source.slug}] shopify sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'shopify-cowlendar') {
    const found = await fromShopifyCowlendar(source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] cowlendar sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'titled-date-blocks') {
    const found = fromTitledDateBlocks(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] titled-date-blocks sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'dated-time-list') {
    const found = fromDatedTimeList(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] dated-time-list sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'checkout-links-de') {
    const found = await fromCheckoutLinks(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] checkout sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'pipe-list-de') {
    const found = fromGermanPipeList(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] pipe-list sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'acuity') {
    const found = await fromAcuity(source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] acuity sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'eventfrog') {
    // The page links each date's tickets to eventfrog.de; every Eventfrog
    // event also serves a machine-readable .ics feed with the exact
    // start/end, so no HTML parsing is needed per event.
    const links = [
      ...new Set(
        [...html.matchAll(/https?:\/\/eventfrog\.[a-z]+\/[^\s"'<>]*?-(\d{10,25})\.html/gi)].map(
          (m) => `${m[0]} ${m[1]}`,
        ),
      ),
    ];
    console.log(`[${source.slug}] eventfrog ticket links: ${links.length}`);
    const workshops = [];
    for (const pair of links) {
      const [pageUrl, id] = pair.split(' ');
      try {
        const ics = await fetch(`https://eventfrog.de/stream/de/event/${id}.ics`, {
          headers: { 'user-agent': UA },
        });
        if (!ics.ok) {
          console.log(`[${source.slug}] ics ${id}: HTTP ${ics.status}`);
          continue;
        }
        for (const ev of fromIcs(await ics.text(), pageUrl, source)) {
          if (ev.date < todayISO || ev.date > maxISO) continue;
          console.log(
            `[${source.slug}] eventfrog event: "${ev.title}" ${ev.date} ${ev.time} ${ev.duration ?? ''} ${ev.price ?? 'no price'}`,
          );
          workshops.push({
            slug: source.slug,
            sourceUrl: source.url,
            ...ev,
            ...(source.district ? { district: source.district } : {}),
          });
        }
      } catch (err) {
        console.log(`[${source.slug}] ics ${id}: ${err.message.split('\n')[0]}`);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    console.log(`[${source.slug}] eventfrog events kept: ${workshops.length}`);
    return { workshops, recurring: [] };
  }

  if (source.mode === 'wix-events-sitemap') {
    // `html` is the site's Wix Events sitemap: every event-detail page ever
    // published, past ones included. Each live page carries a schema.org
    // Event JSON-LD block with exact start/end, price and status, so the
    // whole schedule — new events included — reads without configuration.
    const pages = [...new Set([...html.matchAll(/<loc>\s*([^<\s]+?)\s*<\/loc>/gi)].map((m) => m[1]))]
      .filter((u) => /\/event-details-registration\//.test(u) && !/\/form$/.test(u));
    console.log(`[${source.slug}] event pages in sitemap: ${pages.length}`);
    const workshops = [];
    const seen = new Set();
    for (const pageUrl of pages) {
      // Many URLs embed their event's date — skip clearly past ones without
      // fetching. Undated URLs are fetched; the date filter below decides.
      const embedded = pageUrl.match(/(20\d{2}-\d{2}-\d{2})-\d{2}-\d{2}$/);
      if (embedded && embedded[1] < todayISO) continue;
      try {
        const pres = await fetch(pageUrl, {
          redirect: 'follow',
          headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
        });
        if (!pres.ok) {
          console.log(`[${source.slug}] ${pageUrl}: HTTP ${pres.status}`);
          continue;
        }
        for (const ev of fromJsonLd(await pres.text(), pageUrl)) {
          if (ev.date < todayISO || ev.date > maxISO) continue;
          // The same event can sit at more than one sitemap URL.
          const key = `${ev.title}|${ev.date}|${ev.time}`;
          if (seen.has(key)) continue;
          seen.add(key);
          console.log(`[${source.slug}] event: "${ev.title}" ${ev.date} ${ev.time} ${ev.duration ?? ''} ${ev.price ?? 'no price'}`);
          workshops.push({
            slug: source.slug,
            sourceUrl: source.url,
            ...ev,
            ...(source.district ? { district: source.district } : {}),
            url: pageUrl,
          });
        }
      } catch (err) {
        console.log(`[${source.slug}] ${pageUrl}: ${err.message.split('\n')[0]}`);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    console.log(`[${source.slug}] wix events kept: ${workshops.length}`);
    return { workshops, recurring: [] };
  }

  if (source.mode === 'recurring-de') {
    const recurring = fromGermanRecurring(html, source);
    for (const r of recurring) {
      console.log(
        `[${source.slug}] recurring: "${r.title}" ${r.weekdays.join('+')} ${r.time} ${r.duration ?? ''} ${r.price ?? 'no price'} ${r.district ?? ''}`,
      );
    }
    console.log(`[${source.slug}] recurring classes parsed: ${recurring.length}`);
    return { workshops: [], recurring };
  }

  if (source.mode === 'dates-de') {
    let dated = fromGermanDates(html, source);
    let rendered = null;
    if (!dated.length) {
      // The schedule is drawn client-side — render the page for real.
      rendered = await renderAllFrames(source.url, source.slug);
      if (rendered) dated = fromGermanDates(rendered, source);
    }
    for (const w of dated) {
      console.log(`[${source.slug}] dated: "${w.title}" ${w.date} ${w.time} ${w.price ?? 'no price'}`);
    }
    if (!dated.length) {
      // Describe how the page mentions dates at all, for parser tuning —
      // against the rendered content when we have it.
      const hay = rendered ?? html;
      const numeric = [...new Set([...hay.matchAll(/\b\d{1,2}\.\d{1,2}\.20\d{2}\b/g)].map((m) => m[0]))];
      console.log(`[${source.slug}] numeric dates in ${rendered ? 'rendered' : 'raw'} content: ${numeric.slice(0, 15).join(', ') || 'none'}`);
      for (const marker of ['Samstag', 'Sonntag', '2026', 'Datum', 'regiondo-dates', 'select']) {
        const i = hay.indexOf(marker);
        console.log(
          i < 0
            ? `[${source.slug}] marker "${marker}": absent`
            : `[${source.slug}] marker "${marker}": …${hay.slice(Math.max(0, i - 150), i + 250).replace(/\s+/g, ' ')}…`,
        );
      }
    }
    const inRange = dated
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district && !w.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] dated entries kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  const ld = fromJsonLd(html, source.url);
  console.log(`[${source.slug}] json-ld events: ${ld.length}`);
  let found = ld;
  if (!found.length) {
    const wix = await fromWixBookings(source, html);
    if (wix !== null) {
      console.log(`[${source.slug}] wix bookings events: ${wix.length}`);
      found = wix;
    }
  }
  if (!found.length) {
    found = fromTimeTags(html, source.url);
    console.log(`[${source.slug}] <time> elements: ${found.length}`);
  }
  if (!found.length) {
    // Diagnostics for the Actions log, so the parser can be tuned without
    // re-fetching by hand: platform markers, embedded frames/scripts, and
    // any ISO-looking dates in the page.
    const isoDates = [...new Set([...html.matchAll(/20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}/g)].map((m) => m[0]))];
    console.log(`[${source.slug}] no structured events; raw ISO datetimes in page: ${isoDates.slice(0, 20).join(', ') || 'none'}`);
    const markers = ['wix', 'squarespace', 'acuity', 'shopify', 'webflow', 'jimdo', 'wordpress', 'eversports', 'bookwhen', 'calendly', 'momoyoga']
      .filter((m) => new RegExp(m, 'i').test(html));
    console.log(`[${source.slug}] platform markers: ${markers.join(', ') || 'none'}`);
    const frames = [...html.matchAll(/<iframe[^>]*src=["']([^"']+)["']/gi)].map((m) => m[1]);
    console.log(`[${source.slug}] iframes: ${frames.slice(0, 10).join(' | ') || 'none'}`);
    const embeds = [...html.matchAll(/https?:\/\/[^\s"'<>]*(?:acuity|scheduling|booking|widget|embed)[^\s"'<>]*/gi)]
      .map((m) => m[0]);
    console.log(`[${source.slug}] scheduler-ish urls: ${[...new Set(embeds)].slice(0, 10).join(' | ') || 'none'}`);

    // The site embeds Acuity Scheduling (Squarespace's acuity component).
    // The widget is built client-side from an owner id in the page config;
    // Acuity's own schedule.php page is server-rendered, so probe it and
    // log candidate class/date pairs for the parser.
    const ownerCandidates = [
      // Squarespace's acuity block carries the account in data-user-id.
      ...[...html.matchAll(/data-user-id="(\d{4,12})"/g)].map((m) => m[1]),
      ...[...html.matchAll(/owner=(\d{4,12})/g)].map((m) => m[1]),
      ...[...html.matchAll(/"ownerI[dD]"\s*:\s*"?(\d{4,12})/g)].map((m) => m[1]),
    ];
    const typeIds = [...new Set([...html.matchAll(/data-appointment-type-id="(\d{4,12})"/g)].map((m) => m[1]))];
    console.log(`[${source.slug}] acuity appointment types on page: ${typeIds.join(', ') || 'none'}`);
    console.log(`[${source.slug}] acuity owner candidates: ${[...new Set(ownerCandidates)].join(', ') || 'none'}`);
    if (!ownerCandidates.length) {
      // Show how the page references acuity, to find where the account id
      // actually lives.
      let shown = 0;
      for (const m of html.matchAll(/acuity/gi)) {
        if (shown >= 5) break;
        const ctx = html.slice(Math.max(0, m.index - 120), m.index + 180).replace(/\s+/g, ' ');
        if (/styles\.css|visitor\.js|embed\.js/.test(ctx) && shown > 0) continue;
        console.log(`[${source.slug}] acuity context ${++shown}: …${ctx}…`);
      }
    }
    const owner = ownerCandidates[0];
    if (owner) {
      for (const base of ['https://app.squarespacescheduling.com', 'https://app.acuityscheduling.com']) {
        try {
          const typePart = typeIds.length ? `&appointmentType=${typeIds[0]}` : '';
          const probeUrl = `${base}/schedule.php?owner=${owner}${typePart}`;
          const probe = await fetch(probeUrl, { headers: { 'user-agent': UA, accept: 'text/html' }, redirect: 'follow' });
          const body = await probe.text();
          console.log(`[${source.slug}] probe ${probeUrl}: HTTP ${probe.status}, ${body.length} bytes`);
          const monthDates = [...body.matchAll(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*20\d{2})?/g)]
            .map((m) => m[0]);
          console.log(`[${source.slug}] probe month-name dates: ${[...new Set(monthDates)].slice(0, 15).join(' | ') || 'none'}`);
          const times = [...new Set([...body.matchAll(/\b\d{1,2}:\d{2}\s*(?:am|pm)?\b/gi)].map((m) => m[0]))];
          console.log(`[${source.slug}] probe times: ${times.slice(0, 15).join(' | ') || 'none'}`);
          const classMarkers = [...new Set([...body.matchAll(/class[-_ ]?(?:name|signup|list|time)[^"']{0,40}/gi)].map((m) => m[0]))];
          console.log(`[${source.slug}] probe class markers: ${classMarkers.slice(0, 10).join(' | ') || 'none'}`);
          const first = monthDates.length ? body.indexOf(monthDates[0]) : -1;
          if (first >= 0) {
            console.log(`[${source.slug}] probe context: …${body.slice(Math.max(0, first - 600), first + 300).replace(/\s+/g, ' ')}…`);
            break;
          }
        } catch (probeErr) {
          console.log(`[${source.slug}] probe failed: ${probeErr.message}`);
        }
      }
    }
  }

  const inWindow = found
    .filter((w) => w.date >= todayISO && w.date <= maxISO)
    .map((w) => ({ slug: source.slug, sourceUrl: source.url, ...w }));
  console.log(`[${source.slug}] kept ${inWindow.length} within ${KEEP_DAYS} days`);
  return { workshops: inWindow, recurring: [] };
}

// Local test hook: PARSE_TEST=<html file> runs only the German-recurring
// parser against that file and prints the result, touching nothing.
if (process.env.PARSE_TEST) {
  const html = readFileSync(process.env.PARSE_TEST, 'utf8');
  const testSource = {
    slug: 'test', url: 'test', title: 'Test Workshop', price: '€65',
    startMarker: 'UPCOMING WORKSHOPS', endMarker: 'JETZT TEILNEHMEN',
  };
  const fn =
    process.env.PARSE_TEST_MODE === 'dates-de'
      ? fromGermanDates
      : process.env.PARSE_TEST_MODE === 'pipe-list-de'
        ? fromGermanPipeList
      : process.env.PARSE_TEST_MODE === 'dated-time-list'
        ? fromDatedTimeList
      : process.env.PARSE_TEST_MODE === 'titled-date-blocks'
        ? fromTitledDateBlocks
      : process.env.PARSE_TEST_MODE === 'json-ld'
        ? (h) => fromJsonLd(h, 'test')
        : process.env.PARSE_TEST_MODE === 'ics'
          ? (h, src) => fromIcs(h, 'test-page', src)
          : fromGermanRecurring;
  console.log(JSON.stringify(fn(html, testSource), null, 2));
  process.exit(0);
}

const previous = (() => {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    return { workshops: [], recurring: [], sources: [] };
  }
})();

const workshops = [];
const recurringOut = [];
const statuses = [];
for (const source of SOURCES) {
  try {
    const found = await scrape(source);
    const total = found.workshops.length + found.recurring.length;
    if (total) {
      workshops.push(...found.workshops);
      recurringOut.push(...found.recurring);
      statuses.push({ slug: source.slug, url: source.url, status: 'ok', count: total });
    } else {
      throw new Error('no upcoming events parsed');
    }
  } catch (err) {
    // Keep this source's previous entries rather than blanking them.
    // Matched by sourceUrl, so one failing page never clobbers or
    // duplicates a sibling page's fresh results for the same host.
    const keptDated = (previous.workshops ?? []).filter((w) => w.sourceUrl === source.url && w.date >= todayISO);
    const keptRecurring = (previous.recurring ?? []).filter((r) => r.sourceUrl === source.url);
    workshops.push(...keptDated);
    recurringOut.push(...keptRecurring);
    statuses.push({
      slug: source.slug,
      url: source.url,
      status: `failed: ${err.message}`,
      count: keptDated.length + keptRecurring.length,
    });
    console.error(
      `[${source.slug}] FAILED (${err.message}) — kept ${keptDated.length + keptRecurring.length} previous entries`,
    );
  }
}

// Two source pages on one domain can surface the same events (e.g. a
// site-wide booking API) — dedupe before writing.
const seen = new Set();
const unique = workshops.filter((w) => {
  const key = `${w.slug}|${w.date}|${w.time}|${w.title}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
unique.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

const seenRec = new Set();
const uniqueRecurring = recurringOut.filter((r) => {
  const key = `${r.slug}|${r.title}|${r.time}|${[...r.weekdays].sort().join()}`;
  if (seenRec.has(key)) return false;
  seenRec.add(key);
  return true;
});

writeFileSync(
  OUT,
  JSON.stringify(
    { updated: new Date().toISOString(), sources: statuses, recurring: uniqueRecurring, workshops: unique },
    null,
    2,
  ) + '\n',
);
console.log(`wrote ${unique.length} workshops + ${uniqueRecurring.length} recurring classes to ${OUT}`);
