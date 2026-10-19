// Reads the public profile of each Instagram account in
// scripts/data/ig-handles.json (a list of handles Twiggli follows): name,
// category, bio, website and public business email, one "BIO" line each, so
// outreach can tell the workshop hosts from everyone else. Read-only; it
// stops early if Instagram starts refusing. Run from
// .github/workflows/probe-page.yml with the url "bios:".

import { readFileSync } from 'node:fs';

const handles = JSON.parse(readFileSync(new URL('./data/ig-handles.json', import.meta.url), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => String(s ?? '').replace(/[\t\r\n]+/g, ' ').trim();

let refused = 0;
for (const h of handles) {
  let res;
  try {
    res = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(h)}`, {
      headers: {
        'user-agent': 'Instagram 219.0.0.12.117 Android',
        'x-ig-app-id': '936619743392459',
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });
  } catch { console.log(['BIO', h, 'error'].join('\t')); continue; }
  if (res.status === 429 || res.status === 401 || res.status === 403) {
    console.log(['BIO', h, `refused ${res.status}`].join('\t'));
    if (++refused >= 5) { console.log('Instagram keeps refusing; stopping.'); break; }
    await sleep(30000);
    continue;
  }
  refused = 0;
  let u;
  try { u = (await res.json())?.data?.user; } catch { u = null; }
  if (!u) { console.log(['BIO', h, `none ${res.status}`].join('\t')); await sleep(2500); continue; }
  console.log(['BIO', h, clean(u.full_name), clean(u.category_name), clean(u.biography).slice(0, 300),
    clean(u.external_url), clean(u.business_email), u.edge_followed_by?.count ?? ''].join('\t'));
  await sleep(2500 + Math.random() * 1500);
}
