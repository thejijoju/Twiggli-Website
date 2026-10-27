/**
 * Fetches what hosts changed in their Twiggli account (Supabase tables
 * host_profiles and host_slots, public to read) into
 * site/src/data/host-edits.json, which the build lays over the copy and the
 * schedule (site/src/data/hostEdits.ts). Runs in the deploy workflow before
 * the translation step and the build. If Supabase does not answer, the file
 * is left as it is and the build goes on.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'site/src/data/host-edits.json');
const SUPABASE = 'https://kwympvwouzbhshtrptfp.supabase.co';

// The public anon key, the same one the site ships (site/src/data/vouchers.ts).
const anonKey = readFileSync(join(ROOT, 'site/src/data/vouchers.ts'), 'utf8').match(/anonKey: '([^']+)'/)?.[1];
if (!anonKey) throw new Error('anon key not found in vouchers.ts');

async function rows(table, query) {
  const res = await fetch(`${SUPABASE}/rest/v1/${table}?${query}`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

try {
  const [profiles, slots] = await Promise.all([
    rows('host_profiles', 'select=slug,lang,specialty,studio,blurb,group_size,duration,place,languages,price_note&order=slug,lang'),
    rows('host_slots', 'select=slug,title,weekdays,time,duration,price,active&active=eq.true&order=slug,time'),
  ]);
  writeFileSync(OUT, `${JSON.stringify({ fetched: new Date().toISOString(), profiles, slots }, null, 2)}\n`);
  console.log(`host edits: ${profiles.length} profile(s), ${slots.length} slot(s)`);
} catch (err) {
  console.log(`host edits not fetched, keeping the file as it is: ${err.message}`);
}
