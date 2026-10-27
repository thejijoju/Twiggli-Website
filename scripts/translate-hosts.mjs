/**
 * Keeps the six translated host directories (site/src/data/hosts/{fr,es,it,
 * nl,pl,tr}.ts) in step with the English copy in content.ts, so hosts and
 * Jirel only ever write English and German.
 *
 * Each English entry is fingerprinted; hosts/translation-state.json records
 * the fingerprint each language was last translated from. A host whose
 * English changed, or who is missing from a language, is re-translated with
 * Claude; everything else is left as it is. Runs in the deploy workflow
 * before the build (needs ANTHROPIC_API_KEY and `@anthropic-ai/sdk`).
 *
 *   node scripts/translate-hosts.mjs           translate what is stale
 *   node scripts/translate-hosts.mjs --init    record current fingerprints only
 *   node scripts/translate-hosts.mjs --dry     list what is stale, change nothing
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'site/src/data');
const STATE = join(DATA, 'hosts/translation-state.json');
const LANGS = { fr: 'French', es: 'Spanish', it: 'Italian', nl: 'Dutch', pl: 'Polish', tr: 'Turkish' };
/** Fields that are written for the reader; the rest are copied from English. */
const TEXT = ['specialty', 'blurb', 'group', 'duration', 'place', 'priceNote'];
const ORDER = ['slug', 'name', 'specialty', 'studio', 'blurb', 'group', 'duration', 'place', 'languages', 'priceNote'];
const MODEL = 'claude-opus-5-5';

const mode = process.argv.includes('--init') ? 'init' : process.argv.includes('--dry') ? 'dry' : 'translate';

/* content.ts is TypeScript that reads files next to itself, so it is bundled
   into a throwaway module in the same folder and imported from there. */
async function loadCopy() {
  const { build } = await import(pathToFileURL(join(ROOT, 'site/node_modules/esbuild/lib/main.js')).href);
  const out = join(DATA, '.translate-hosts.tmp.mjs');
  const imports = Object.keys(LANGS)
    .map((l) => `export { hosts as ${l} } from './hosts/${l}.ts';`)
    .join('\n');
  await build({
    stdin: { contents: `export { hostsCopyBase } from './content.ts';\n${imports}`, resolveDir: DATA, loader: 'ts' },
    bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'warning',
    define: { 'import.meta.env.BASE_URL': '"/"' },
  });
  try {
    return await import(pathToFileURL(out).href);
  } finally {
    rmSync(out, { force: true });
  }
}

const fingerprint = (h) =>
  createHash('sha256').update(JSON.stringify(ORDER.map((k) => h[k] ?? null))).digest('hex').slice(0, 16);

const quote = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;

function entryToTs(h) {
  const f = (k) => (h[k] === undefined ? null : `${k}: ${quote(h[k])}`);
  const head = ['slug', 'name', 'specialty', 'studio'].map(f).filter(Boolean).join(', ');
  const tail = ['group', 'duration', 'place', 'languages', 'priceNote'].map(f).filter(Boolean).join(', ');
  return `  { ${head},\n    ${f('blurb')},\n    ${tail} },`;
}

function writeLang(lang, entries) {
  const file = join(DATA, `hosts/${lang}.ts`);
  const src = readFileSync(file, 'utf8');
  const head = src.slice(0, src.indexOf('export const hosts'));
  writeFileSync(file, `${head}export const hosts: HostCopy[] = [\n${entries.map(entryToTs).join('\n')}\n];\n`);
}

async function translate(client, lang, stale, examples) {
  const source = stale.map((h) => Object.fromEntries(['slug', ...TEXT].filter((k) => h[k] !== undefined).map((k) => [k, h[k]])));
  const prompt = `You translate the host directory of Twiggli, a Berlin platform for hands-on creative workshops, from English into ${LANGS[lang]}.

Write natural, warm ${LANGS[lang]} for someone browsing workshops in Berlin, in the same register as these existing entries:
${JSON.stringify(examples, null, 1)}

Rules:
- Translate only the fields given. Keep names of people, studios, streets, districts, products and course titles as they are.
- Keep numbers, prices, times and group sizes exactly. Use the number and time formats normal in ${LANGS[lang]}.
- No em dashes or en dashes as sentence punctuation; use commas, colons or full stops.
- Return only a JSON array with one object per input object, in the same order, with the same keys (including "slug").

Input:
${JSON.stringify(source, null, 1)}`;

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [{ role: 'user', content: prompt }],
  });
  if (response.stop_reason === 'refusal') throw new Error(`${lang}: refused (${response.stop_details?.category ?? 'no category'})`);
  if (response.stop_reason === 'max_tokens') throw new Error(`${lang}: output cut off at max_tokens`);
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const out = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
  if (!Array.isArray(out) || out.length !== stale.length) throw new Error(`${lang}: expected ${stale.length} entries, got ${out?.length}`);
  return out.map((t, i) => {
    if (t.slug !== stale[i].slug) throw new Error(`${lang}: entry ${i} is ${t.slug}, expected ${stale[i].slug}`);
    const merged = { ...stale[i] };
    for (const k of TEXT) if (stale[i][k] !== undefined && typeof t[k] === 'string' && t[k].trim()) merged[k] = t[k];
    return merged;
  });
}

const copy = await loadCopy();
const en = copy.hostsCopyBase.en;
let state = {};
try { state = JSON.parse(readFileSync(STATE, 'utf8')); } catch {}

let client;
if (mode === 'translate') {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  client = new Anthropic();
}

let changed = 0;
for (const lang of Object.keys(LANGS)) {
  const current = new Map(copy[lang].map((h) => [h.slug, h]));
  const seen = (state[lang] ??= {});
  const stale = en.filter((h) => !current.has(h.slug) || (mode !== 'init' && seen[h.slug] !== fingerprint(h)));

  if (mode === 'init') {
    for (const h of en) if (current.has(h.slug)) seen[h.slug] = fingerprint(h);
    console.log(`${lang}: recorded ${Object.keys(seen).length}, missing ${stale.map((h) => h.slug).join(', ') || 'none'}`);
    continue;
  }
  console.log(`${lang}: ${stale.length} to translate${stale.length ? ` (${stale.map((h) => h.slug).join(', ')})` : ''}`);
  if (mode === 'dry' || !stale.length) continue;

  const examples = copy[lang].filter((h) => !stale.some((s) => s.slug === h.slug)).slice(0, 2)
    .map((h) => Object.fromEntries(TEXT.filter((k) => h[k] !== undefined).map((k) => [k, h[k]])));
  for (let i = 0; i < stale.length; i += 8) {
    const done = await translate(client, lang, stale.slice(i, i + 8), examples);
    for (const h of done) {
      current.set(h.slug, h);
      seen[h.slug] = fingerprint(en.find((e) => e.slug === h.slug));
    }
  }
  // English order first, then anything the language has that English lost.
  const ordered = [...en.map((h) => current.get(h.slug)).filter(Boolean), ...[...current.values()].filter((h) => !en.some((e) => e.slug === h.slug))];
  writeLang(lang, ordered);
  changed++;
}

if (mode !== 'dry') writeFileSync(STATE, `${JSON.stringify(state, null, 2)}\n`);
console.log(mode === 'translate' ? `${changed} language file(s) updated` : 'done');
