// Lists the Berlin hosts on other workshop platforms (Konfetti, Subcultours,
// The Makery), one tab-separated line per host prefixed "LEAD", so outreach
// can see who teaches what and where. Read-only: it fetches public pages and
// prints; nothing is written or sent. Run from .github/workflows/probe-page.yml
// with the url "scrape:konfetti,subcultours,makery" (any subset).

const UA = 'Mozilla/5.0 (compatible; TwiggliScheduleBot/1.0; +https://www.twiggli.com)';
const only = (process.env.SCRAPE_URL || 'scrape:konfetti,subcultours,makery').replace(/^scrape:/, '').split(',').map((s) => s.trim());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
      if (res.status === 429 || res.status >= 500) { await sleep(2000 * (i + 1)); continue; }
      return { status: res.status, text: await res.text() };
    } catch { await sleep(1500 * (i + 1)); }
  }
  return { status: 0, text: '' };
}

// Runs `fn` over `items`, a few at a time, so no platform sees a burst.
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const it = items[i++]; await fn(it); await sleep(250); }
  }));
}

const clean = (s) => String(s ?? '').replace(/[\t\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;|&#160;/g, ' ');
const lead = (platform, name, crafts, area, url, extra = '') =>
  console.log(['LEAD', platform, clean(name), clean(crafts).slice(0, 220), clean(area), url, clean(extra).slice(0, 200)].join('\t'));

async function konfetti() {
  const { text } = await get('https://gokonfetti.com/sitemaps/sitemap-suppliers.xml');
  const urls = [...new Set([...text.matchAll(/<loc>(https:\/\/gokonfetti\.com\/de-de\/p\/[^<]+)<\/loc>/g)].map((m) => m[1]))];
  console.log(`konfetti: ${urls.length} supplier pages`);
  let berlin = 0;
  await pool(urls, 5, async (url) => {
    const { text: html } = await get(url);
    const events = [];
    for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const j = JSON.parse(m[1]);
        for (const e of [].concat(j['@graph'] ?? j)) if (e['@type'] === 'Event') events.push(e);
      } catch { /* not JSON we can read */ }
    }
    const inBerlin = events.filter((e) => /\bBerlin\b/.test(JSON.stringify(e.location ?? '')));
    if (!inBerlin.length) return;
    berlin++;
    const name = inBerlin[0].organizer?.name ?? decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '').replace(/<[^>]+>/g, ''));
    const titles = [...new Set(inBerlin.map((e) => e.name))].slice(0, 4).join(' | ');
    const addr = inBerlin[0].location?.address?.name ?? '';
    const prices = inBerlin.map((e) => e.offers?.price).filter(Boolean);
    lead('konfetti', name, titles, addr, url, `${inBerlin.length} Berlin events${prices.length ? `, from €${Math.min(...prices)}` : ''}`);
  });
  console.log(`konfetti: ${berlin} with Berlin events`);
}

async function subcultours() {
  const byHost = new Map();
  for (let page = 1; page < 40; page++) {
    const { text } = await get(`https://subcultours.com/products.json?limit=250&page=${page}`);
    let items = [];
    try { items = JSON.parse(text).products ?? []; } catch { break; }
    if (!items.length) break;
    for (const p of items) {
      const where = [p.title, ...(p.variants ?? []).map((v) => v.title)].join(' ');
      if (!/\bBerlin\b/.test(where)) continue;
      // Titles read "<Workshop> with <Host> in Berlin, Germany".
      const host = p.title.match(/\bwith (.+?) in Berlin\b/i)?.[1] ?? '(see page)';
      const rec = byHost.get(host) ?? { crafts: new Set(), urls: [], prices: [] };
      rec.crafts.add(`${p.product_type}: ${p.title.replace(/\s+with .+$/i, '')}`);
      rec.urls.push(`https://subcultours.com/products/${p.handle}`);
      for (const v of p.variants ?? []) if (v.price) rec.prices.push(Number(v.price));
      byHost.set(host, rec);
    }
  }
  for (const [host, r] of byHost)
    lead('subcultours', host, [...r.crafts].slice(0, 3).join(' | '), 'Berlin', r.urls[0], `${r.urls.length} listings${r.prices.length ? `, from €${Math.min(...r.prices)}` : ''}`);
  console.log(`subcultours: ${byHost.size} Berlin hosts`);
}

async function makery() {
  const base = 'https://themakery.de';
  const seeds = ['/workshops/alle-workshops', '/workshops/', '/workshops/kunst', '/workshops/handwerk', '/workshops/textil',
    '/workshops/essen-und-getraenke', '/workshops/pflanzen-und-blumen', '/workshops/kosmetik-und-pflege',
    '/workshops/kochen', '/workshops/naturkosmetik', '/workshops/kerzen', '/workshops/makramee', '/workshops/naehen',
    '/alle-erlebnisse', '/alle-erlebnisse/kunst', '/alle-erlebnisse/handwerk', '/alle-erlebnisse/textil',
    '/alle-erlebnisse/essen-und-getraenke', '/alle-erlebnisse/pflanzen-und-blumen', '/alle-erlebnisse/kosmetik-und-pflege', '/'];
  const found = new Set();
  const workshopLinks = (html) => [...html.matchAll(/(?:https:\/\/themakery\.de)?\/([a-z0-9_\-äöüß%]+)\/Berlin\/?["']/gi)].map((m) => `${base}/${m[1]}/Berlin`);
  for (const s of seeds) for (const u of workshopLinks((await get(base + s)).text)) found.add(u);
  // Each workshop page links a few others, so walk outwards until nothing new turns up.
  const seen = new Set();
  const byHost = new Map();
  let frontier = [...found];
  while (frontier.length && seen.size < 1500) {
    const next = [];
    await pool(frontier.filter((u) => !seen.has(u)), 4, async (url) => {
      seen.add(url);
      const { text: html } = await get(url);
      const flat = decode(html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
      const host = flat.match(/([^>]{2,60}?)\s+Dein\/e Gastgeber\/in/)?.[1]?.replace(/^.*-->\s*/, '') ?? '';
      const title = decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '').replace(/<[^>]+>/g, '');
      const area = flat.match(/Lage Berlin, ([^ ]+(?: [A-ZÄÖÜ][a-zäöüß]+)?)/)?.[1] ?? '';
      const price = flat.match(/Preis (\d+)€/)?.[1];
      if (host) {
        const rec = byHost.get(host) ?? { titles: new Set(), url, area, prices: [] };
        rec.titles.add(clean(title));
        if (price) rec.prices.push(Number(price));
        byHost.set(host, rec);
      }
      for (const u of workshopLinks(html)) if (!seen.has(u)) next.push(u);
    });
    frontier = [...new Set(next)];
  }
  for (const [host, r] of byHost)
    lead('makery', host, [...r.titles].slice(0, 4).join(' | '), `Berlin ${r.area}`, r.url, `${r.titles.size} workshops${r.prices.length ? `, from €${Math.min(...r.prices)}` : ''}`);
  console.log(`makery: ${seen.size} Berlin workshop pages, ${byHost.size} hosts`);
}

if (only.includes('subcultours')) await subcultours();
if (only.includes('makery')) await makery();
if (only.includes('konfetti')) await konfetti();
