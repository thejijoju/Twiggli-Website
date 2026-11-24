import type { APIRoute } from 'astro';
import { getHosts } from '../data/content.ts';
import { getSessions, getOnRequestAll, previewSessionsFor, previewOnRequestFor } from '../data/sessions.ts';
import { hostLang } from '../data/hostLang.ts';
import { isVoucherHost, takesIndividuals } from '../data/vouchers.ts';

/* What the weekly Twiggli tips (functions hostInsights, Jirel 24.11.26)
   compare a host with: every host's workshops with price and length, and
   for each kind of workshop what similar ones in Berlin cost. Only what
   the public pages already show (titles, prices, lengths, whether there
   is a video); nothing about guests. Built once per site build. */

/** Kinds of workshop people compare with each other, by words in the
 *  host's specialty and titles (German and English). `search` is what
 *  people type into Google for it, used in the title tip. */
const GROUPS: { key: string; re: RegExp; search: { de: string; en: string } }[] = [
  { key: 'candles', re: /kerze|candle|wachs|wax/i, search: { de: 'Kerzen gießen Workshop', en: 'candle making workshop' } },
  { key: 'perfume', re: /parfum|perfume|duft|scent|fragrance/i, search: { de: 'Parfum Workshop', en: 'perfume making workshop' } },
  { key: 'pottery', re: /töpfer|pottery|keramik|ceramic|wheel|drehscheibe|clay|ton\b|handbuild/i, search: { de: 'Töpferkurs', en: 'pottery class' } },
  { key: 'terrazzo', re: /terrazzo|marmor|marble|jesmonite|beton|concrete/i, search: { de: 'Terrazzo Workshop', en: 'terrazzo workshop' } },
  { key: 'bookbinding', re: /buchbind|bookbind|binding|notizbuch|notebook/i, search: { de: 'Buchbinden Workshop', en: 'bookbinding workshop' } },
  { key: 'mosaic', re: /mosaik|mosaic/i, search: { de: 'Mosaik Workshop', en: 'mosaic workshop' } },
  { key: 'print', re: /siebdruck|screen.?print|linol|lino|druck|print|cyanotyp|stempel|stamp/i, search: { de: 'Siebdruck Workshop', en: 'screen printing workshop' } },
  { key: 'painting', re: /malen|malkurs|painting|acryl|aquarell|watercolou?r|paint|zeichn|drawing|sketch/i, search: { de: 'Malkurs', en: 'painting class' } },
  { key: 'jewellery', re: /schmuck|jewel|silber|silver|ring|goldschmied/i, search: { de: 'Schmuck Workshop', en: 'jewellery workshop' } },
  { key: 'cooking', re: /koch|cook|pasta|sushi|kimchi|ramen|thai|backen|bak|sourdough|sauerteig|schokolad|chocolate|macaron/i, search: { de: 'Kochkurs', en: 'cooking class' } },
  { key: 'coffee', re: /kaffee|coffee/i, search: { de: 'Kaffee rösten Kurs', en: 'coffee roasting class' } },
  { key: 'tasting', re: /tasting|verkostung|wein|wine|bier|beer|whisky|spirit|gin/i, search: { de: 'Weinverkostung', en: 'wine tasting' } },
  { key: 'textile', re: /tuft|stick|embroider|strick|knit|näh|sew|weav|web|textil|quilt|mending|macram/i, search: { de: 'Textil Workshop', en: 'textile workshop' } },
  { key: 'wood', re: /holz|wood|whittl|schnitz|spoon|löffel|tischler|carv/i, search: { de: 'Holz Workshop', en: 'wood carving workshop' } },
  { key: 'leather', re: /leder|leather/i, search: { de: 'Leder Workshop', en: 'leather workshop' } },
  { key: 'glass', re: /glas|glass|tiffany/i, search: { de: 'Glas Workshop', en: 'glass workshop' } },
  { key: 'cosmetics', re: /kosmetik|cosmetic|seife|soap|creme/i, search: { de: 'Naturkosmetik Workshop', en: 'natural cosmetics workshop' } },
];
const groupOf = (text: string) => GROUPS.find((g) => g.re.test(text))?.key ?? '';

/** €49 · 49 € · €42–65 (the lower end) → 49; per-group prices are left out. */
const euros = (p?: string): number | undefined => {
  if (!p || /pauschal|flat|\/\s*bis|per group|pro gruppe/i.test(p)) return undefined;
  const m = p.replace(/\s/g, '').match(/(\d+(?:[.,]\d+)?)/);
  const n = m ? Number(m[1].replace(',', '.')) : NaN;
  return n >= 5 && n <= 600 ? n : undefined;
};
/** "1 h 45", "2–2.5 h", "1,5 Std.", "90 min" → hours (the lower end); courses over several dates are left out. */
const hours = (d?: string): number | undefined => {
  if (!d || /×|x\s*\d|days|tage|wochen|weeks/i.test(d)) return undefined;
  const s = d.replace(',', '.');
  const hm = s.match(/(\d+(?:\.\d+)?)\s*(?:h|std|stunden?|hours?)\b\.?\s*(\d{1,2})?/i);
  if (hm) return Number(hm[1]) + (hm[2] ? Number(hm[2]) / 60 : 0);
  const mins = s.match(/(\d+)\s*min/i);
  return mins ? Number(mins[1]) / 60 : undefined;
};
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (xs: number[], p: number) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))]; };
const r1 = (n: number) => Math.round(n * 10) / 10;

export const GET: APIRoute = () => {
  const hosts = getHosts('en', { withPreview: true });
  const sessionsEn = getSessions('en');
  const onReqEn = getOnRequestAll('en');
  type Listing = { title: string; price?: number; hours?: number; group: string; dated: boolean };
  const out: Record<string, {
    lang: string; name: string; activity: string; group: string; listings: Listing[];
    video: boolean; photos: number; upcoming30: number; upcoming: number; groupOffer: boolean; voucher: boolean; individuals: boolean;
  }> = {};
  // Per kind of workshop: each host's price per hour, once per host (their
  // typical workshop), so a host with many dates doesn't weigh more.
  const perHost: Record<string, Map<string, number[]>> = {};
  for (const h of hosts) {
    const lang = hostLang[h.slug] ?? 'de';
    const loc = lang === 'en' ? 'en' : 'de';
    const own = (loc === 'en' ? sessionsEn : getSessions('de')).filter((s) => s.host.slug === h.slug);
    const dated = own.length ? own : previewSessionsFor(h.slug, loc);
    const req = (loc === 'en' ? onReqEn : getOnRequestAll('de')).filter((o) => o.host.slug === h.slug);
    const reqs = req.length ? req : previewOnRequestFor(h.slug, loc);
    const kinds = GROUPS.filter((g) => g.re.test(`${h.specialty} ${h.name}`));
    const hostGroup = kinds.length === 1 ? kinds[0].key : groupOf(`${h.specialty} ${h.name}`);
    const fallback = kinds.length === 1 ? hostGroup : '';
    const seen = new Set<string>();
    const listings: Listing[] = [];
    for (const s of [...dated.map((x) => ({ ...x, dated: true })), ...reqs.map((x) => ({ ...x, dated: false }))]) {
      const k = s.title.trim().toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      const price = euros(s.price);
      const hrs = hours(s.duration ?? h.duration);
      listings.push({ title: s.title, ...(price ? { price } : {}), ...(hrs ? { hours: r1(hrs) } : {}), group: groupOf(s.title) || fallback, dated: s.dated });
    }
    for (const l of listings) {
      if (!l.price || !l.hours || !l.group || !l.dated) continue;
      (perHost[l.group] ??= new Map()).set(h.slug, [...(perHost[l.group].get(h.slug) ?? []), l.price / l.hours]);
    }
    out[h.slug] = {
      lang, name: h.name, activity: h.activity, group: hostGroup, listings: listings.slice(0, 20),
      video: Boolean(h.video), photos: (h.gallery?.length ?? 0) || (h.photo ? 1 : 0),
      upcoming30: dated.filter((s) => s.dayOffset <= 30).length, upcoming: dated.length,
      groupOffer: reqs.some((o) => /gruppe|group|team|firmen|company|privat|private|bei euch|für eure|at your|for your|vor ort|on-site|büro|office/i.test(o.title)),
      voucher: isVoucherHost(h.slug), individuals: takesIndividuals(h.slug),
    };
  }
  const groups: Record<string, { hosts: number; perHour: { p25: number; median: number; p75: number } }> = {};
  for (const [g, m] of Object.entries(perHost)) {
    const xs = [...m.values()].map((v) => median(v));
    if (xs.length < 4) continue;
    groups[g] = { hosts: xs.length, perHour: { p25: r1(pct(xs, 0.25)), median: r1(median(xs)), p75: r1(pct(xs, 0.75)) } };
  }
  const search = Object.fromEntries(GROUPS.map((g) => [g.key, { ...g.search, re: g.re.source }]));
  return new Response(JSON.stringify({ updated: new Date().toISOString(), groups, search, hosts: out }), { headers: { 'Content-Type': 'application/json' } });
};
