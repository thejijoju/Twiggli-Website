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
    title: 'Handbuilding Class with Clay Garden Studio', price: '€65' },
  { slug: 'qian', name: 'Qian — Clay Garden special workshops', mode: 'dates-de',
    url: 'https://www.claygarden.studio/special-workshops',
    title: 'Tea & Pottery Workshop' },
  // Weekly-recurring German schedule ("Dienstags I 18 - 20 Uhr I …"); the
  // parser emits `recurring` entries the site expands into dated sessions.
  { slug: 'nina', name: 'Nina Kranz — Kurse', url: 'https://www.ninakranzart.com/privat-freizeit', mode: 'recurring-de' },
  // German dated list ("Samstag, 29. August 2026"). One product per page,
  // so title and price come from this config when the page yields none.
  { slug: 'karen-rose', name: 'Karen-Rose — Bio Naturkosmetik', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=227019',
    title: 'Bio Naturkosmetik Workshop', price: '€65', duration: '3 h' },
  { slug: 'karen-rose', name: 'Karen-Rose — Keramikgießen | Terrazzo', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=263590&rwstep=product',
    title: 'Keramikgießen | Terrazzo Workshop', titleEn: 'Ceramic Casting | Terrazzo Workshop',
    price: '€59', duration: '3 h' },
  { slug: 'karen-rose', name: 'Karen-Rose — Duftkerzen', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=229230',
    title: 'Duftkerzen Workshop (vegan + nachhaltig)',
    titleEn: 'Scented Candle Workshop (vegan + sustainable)', price: '€55', duration: '2 h' },
  { slug: 'karen-rose', name: 'Karen-Rose — Naturkosmetik Essentials', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=264518',
    title: 'Bio Naturkosmetik Workshop - Essentials',
    titleEn: 'Organic Natural Cosmetics Workshop - Essentials', price: '€49', duration: '2 h' },
  { slug: 'karen-rose', name: 'Karen-Rose — Terrazzo Schmuck', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=320775',
    title: 'Terrazzo Schmuck', titleEn: 'Terrazzo Jewelry', price: '€59', duration: '3 h' },
  { slug: 'karen-rose', name: 'Karen-Rose — Shampoo Naturkosmetik', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=229220',
    title: 'Shampoo Naturkosmetik Workshop', titleEn: 'Shampoo Natural Cosmetics Workshop',
    price: '€55', duration: '3 h' },
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
    title: 'Seife Sieden Workshop', titleEn: 'Soap Making Workshop', price: '€99', duration: '3 h' },
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
      .map((w) => ({ slug: source.slug, sourceUrl: source.url, ...w }));
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
  const testSource = { slug: 'test', url: 'test', title: 'Test Workshop', price: '€65' };
  const fn =
    process.env.PARSE_TEST_MODE === 'dates-de'
      ? fromGermanDates
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
