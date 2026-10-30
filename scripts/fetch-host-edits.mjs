/**
 * Fetches what hosts changed in their Twiggli account (Firestore
 * collections hostProfiles and hostSlots, public to read — see
 * firestore.rules) into site/src/data/host-edits.json, which the build lays
 * over the copy and the schedule (site/src/data/hostEdits.ts). Runs in the
 * deploy workflow before the translation step and the build. If Firebase is
 * not set up yet or does not answer, the file is left as it is and the
 * build goes on.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'site/src/data/host-edits.json');

// The web app's public settings, the same ones the site ships (site/src/data/firebase.ts).
const cfg = readFileSync(join(ROOT, 'site/src/data/firebase.ts'), 'utf8');
const projectId = cfg.match(/projectId: '([^']*)'/)?.[1];
const apiKey = cfg.match(/apiKey: '([^']*)'/)?.[1];

/** Firestore's REST values ({ stringValue: 'x' }, …) as plain JSON. */
const plain = (v) => {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(plain);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, plain(x)]));
  return null;
};

async function docs(collection) {
  const out = [];
  let pageToken = '';
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?pageSize=300&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${collection}: ${res.status} ${await res.text()}`);
    const body = await res.json();
    for (const d of body.documents ?? []) out.push(Object.fromEntries(Object.entries(d.fields ?? {}).map(([k, v]) => [k, plain(v)])));
    pageToken = body.nextPageToken ?? '';
  } while (pageToken);
  return out;
}

if (!projectId || !apiKey) {
  console.log('host edits not fetched: Firebase is not set up yet (site/src/data/firebase.ts), keeping the file as it is');
} else {
  try {
    const [profiles, slots] = await Promise.all([docs('hostProfiles'), docs('hostSlots')]);
    const active = slots.filter((s) => s.active !== false).sort((a, b) => `${a.slug} ${a.time}`.localeCompare(`${b.slug} ${b.time}`));
    // Dates hosts created in their dashboard (functions/index.js publicEvents).
    let events = [];
    try {
      const r = await fetch(`https://europe-west3-${projectId}.cloudfunctions.net/publicEvents`);
      if (r.ok) events = (await r.json()).items ?? [];
    } catch (err) { console.log(`host dates not fetched: ${err.message}`); }
    writeFileSync(OUT, `${JSON.stringify({ fetched: new Date().toISOString(), profiles, slots: active, events }, null, 2)}\n`);
    console.log(`host edits: ${profiles.length} profile(s), ${active.length} slot(s), ${events.length} date(s)`);
  } catch (err) {
    console.log(`host edits not fetched, keeping the file as it is: ${err.message}`);
  }
}
