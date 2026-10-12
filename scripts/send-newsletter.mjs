// Sends the weekly "This week in Berlin" email through Brevo: one campaign
// per language list, its body the page the site build just wrote
// (site/dist/<lang>/newsletter/this-week/index.html, WeeklyEmail.astro).
//
// Needs BREVO_API_KEY (secret), BREVO_SENDER_EMAIL and BREVO_LIST_EN /
// BREVO_LIST_DE (list ids). Without the key it explains and exits cleanly,
// so the workflow can be in place before the account is. TEST_EMAIL sends
// a test to that address only instead of mailing the list.
import { readFileSync, existsSync } from 'node:fs';

const key = process.env.BREVO_API_KEY;
if (!key) {
  console.log('BREVO_API_KEY is not set — nothing sent. Add it under Settings → Secrets and variables → Actions.');
  process.exit(0);
}
const sender = process.env.BREVO_SENDER_EMAIL;
const test = process.env.TEST_EMAIL?.trim();
const lists = { en: process.env.BREVO_LIST_EN, de: process.env.BREVO_LIST_DE };
const MIN_PICKS = 3;

const api = async (path, body) => {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
};

const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
let failed = false;
for (const [lang, listId] of Object.entries(lists)) {
  if (!listId && !test) { console.log(`[${lang}] no list id — skipped`); continue; }
  const file = `site/dist/${lang === 'en' ? '' : `${lang}/`}newsletter/this-week/index.html`;
  if (!existsSync(file)) { console.log(`[${lang}] ${file} missing — build first`); failed = true; continue; }
  const html = readFileSync(file, 'utf8');
  const subject = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'This week in Berlin';
  const picks = (html.match(/class="card" width="50%" valign="top"/g) ?? []).length;
  if (picks < MIN_PICKS) { console.log(`[${lang}] only ${picks} workshops this week — not sent`); continue; }
  try {
    const { id } = await api('/emailCampaigns', {
      name: `This week ${today} (${lang})`,
      subject,
      sender: { name: 'Twiggli', email: sender },
      htmlContent: html,
      ...(listId ? { recipients: { listIds: [Number(listId)] } } : {}),
    });
    if (test) {
      await api(`/emailCampaigns/${id}/sendTest`, { emailTo: [test] });
      console.log(`[${lang}] test of campaign ${id} sent to ${test} (${picks} workshops)`);
    } else {
      await api(`/emailCampaigns/${id}/sendNow`, {});
      console.log(`[${lang}] campaign ${id} sent to list ${listId} (${picks} workshops)`);
    }
  } catch (err) {
    console.log(`[${lang}] ${err.message}`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
