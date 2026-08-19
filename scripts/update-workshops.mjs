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
  { slug: 'qian', name: 'Qian — Clay Garden pottery classes', url: 'https://www.claygarden.studio/pottery-classes' },
  { slug: 'qian', name: 'Qian — Clay Garden special workshops', url: 'https://www.claygarden.studio/special-workshops' },
  // Weekly-recurring German schedule ("Dienstags I 18 - 20 Uhr I …"); the
  // parser emits `recurring` entries the site expands into dated sessions.
  { slug: 'nina', name: 'Nina Kranz — Kurse', url: 'https://www.ninakranzart.com/privat-freizeit', mode: 'recurring-de' },
];

/** How far ahead a scraped session may be and still be kept. Slightly wider
 *  than the site's day strip so entries roll into view between runs. */
const KEEP_DAYS = 90;

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
      const offer = [].concat(e.offers ?? [])[0];
      const price =
        offer?.price != null && offer.price !== ''
          ? Number(offer.price) === 0
            ? 'Free'
            : `€${Math.round(Number(offer.price))}`
          : undefined;
      return {
        title: stripTags(String(e.name ?? 'Workshop')),
        date: berlinDate(start),
        time: berlinTime(start),
        ...(price ? { price } : {}),
        url: typeof e.url === 'string' && e.url.startsWith('http') ? e.url : sourceUrl,
      };
    })
    .filter(Boolean);
}

const UA = 'Mozilla/5.0 (compatible; TwiggliScheduleBot/1.0; +https://www.twiggli.com)';

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
      ...[...html.matchAll(/owner=(\d{4,12})/g)].map((m) => m[1]),
      ...[...html.matchAll(/"ownerI[dD]"\s*:\s*"?(\d{4,12})/g)].map((m) => m[1]),
      ...[...html.matchAll(/acuity[^"{}<>]{0,60}?(\d{7,10})/gi)].map((m) => m[1]),
    ];
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
          const probeUrl = `${base}/schedule.php?owner=${owner}`;
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
  console.log(JSON.stringify(fromGermanRecurring(html, { slug: 'test', url: 'test' }), null, 2));
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
