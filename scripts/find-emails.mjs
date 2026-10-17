// Finds the published contact email of each host in scripts/data/hosts-to-find.json
// (name, and their own site where it is already known), for outreach. Read-only: for every host it searches
// the web for their own site, reads the home, Kontakt and Impressum pages and
// prints what is published there, one "EMAIL" line per host. Nothing is sent.
// Run from .github/workflows/probe-page.yml with the url "emails:".

import { readFileSync } from 'node:fs';

const UA = 'Mozilla/5.0 (compatible; TwiggliScheduleBot/1.0; +https://www.twiggli.com)';
const hosts = JSON.parse(readFileSync(new URL('./data/hosts-to-find.json', import.meta.url), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Sites that list everybody: an address found there is the platform's, not the host's.
const PLATFORMS = /gokonfetti|subcultours|themakery|facebook|instagram|linkedin|youtube|tiktok|pinterest|google\.|yelp|tripadvisor|rausgegangen|eventbrite|airbnb|kindaling|visitberlin|meetup|xing|wikipedia|duckduckgo|bing\.|jimdo\.com\/|wix\.com|amazon|etsy|groupon|jochen-schweizer|mydays|tiqets|getyourguide|berlin\.de|kauperts|cylex|gelbeseiten|11880|dasoertliche|branchenbuch|stadtbranchenbuch|golocal|hotfrog|sellwerk/i;
const JUNK_MAIL = /(example|sentry|wixpress|domain|email@|your@|name@|@2x|\.png|\.jpg|\.webp|gokonfetti|subcultours|themakery|noreply|no-reply)/i;

async function get(url) {
  try {
    const ctl = AbortSignal.timeout(15000);
    const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'de,en' }, redirect: 'follow', signal: ctl });
    return res.ok ? await res.text() : '';
  } catch { return ''; }
}

// Cloudflare hides addresses as hex with an XOR key in the first byte.
const cfDecode = (hex) => {
  const k = parseInt(hex.slice(0, 2), 16);
  let s = '';
  for (let i = 2; i < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ k);
  return s;
};

function emailsIn(html) {
  const out = new Set();
  const text = html.replace(/&#64;|&#x40;|\[at\]|\(at\)| at /gi, '@').replace(/&#46;|\[dot\]|\(dot\)/gi, '.');
  for (const m of text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) out.add(m[0].toLowerCase());
  for (const m of html.matchAll(/data-cfemail="([0-9a-f]+)"|email-protection#([0-9a-f]+)/gi)) out.add(cfDecode(m[1] || m[2]).toLowerCase());
  return [...out].filter((e) => !JUNK_MAIL.test(e));
}

async function search(q) {
  const html = await get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`);
  const urls = [];
  for (const m of html.matchAll(/uddg=([^&"]+)/g)) {
    try { urls.push(decodeURIComponent(m[1])); } catch {}
  }
  return [...new Set(urls)].filter((u) => !PLATFORMS.test(u));
}

// Instagram handles linked from a page, minus the platform's own pages.
const igIn = (html) => [...new Set([...html.matchAll(/instagram\.com\/([A-Za-z0-9._]{2,30})/g)].map((m) => m[1].toLowerCase()))]
  .filter((u) => !/^(p|reel|reels|explore|accounts|stories|tv|gokonfetti|konfetti|subcultours|themakery\.de|themakery_de)$/.test(u));

// "insta:" as the url: only find each host's Instagram, from their site or a search.
if (process.env.FIND_MODE === 'insta') {
  for (const h of hosts) {
    let handles = h.site ? igIn(await get(new URL(h.site).origin)) : [];
    if (!handles.length) {
      const html = await get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(`${h.name} Berlin ${h.hint ?? ''} instagram`.trim())}`);
      const urls = [...html.matchAll(/uddg=([^&"]+)/g)].map((m) => { try { return decodeURIComponent(m[1]); } catch { return ''; } });
      handles = igIn(urls.join(' '));
      await sleep(1500);
    }
    console.log(['INSTA', h.key ?? h.name, handles.slice(0, 3).join(' ')].join('\t'));
  }
  process.exit(0);
}

for (const h of hosts) {
  // A site the research already found is used as is; otherwise search for one.
  let site = h.site ? new URL(h.site).origin : '';
  if (!site) {
    const found = await search(`${h.name} Berlin ${h.hint ?? ''} Impressum`.trim());
    await sleep(1500);
    site = found[0] ? new URL(found[0]).origin : '';
  }
  let emails = [];
  let owner = '';
  if (site) {
    for (const path of ['', '/impressum', '/kontakt', '/contact', '/imprint', '/pages/contact', '/legal-notice']) {
      const html = await get(site + path);
      if (!html) continue;
      emails.push(...emailsIn(html));
      if (!owner && /impressum|imprint/i.test(path)) {
        const flat = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        owner = flat.match(/(?:Inhaber(?:in)?|Verantwortlich|Vertreten durch|Geschäftsführer(?:in)?|Owner)[:\s]+([A-ZÄÖÜ][\wäöüß.-]+ [A-ZÄÖÜ][\wäöüß.-]+)/)?.[1] ?? '';
      }
      if (emails.length && owner) break;
    }
  }
  emails = [...new Set(emails)];
  console.log(['EMAIL', h.key ?? h.name, site, emails.join(' '), owner].join('\t'));
}
