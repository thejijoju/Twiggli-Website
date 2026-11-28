// ── Twiggli connectors for Claude, ChatGPT and other assistants (MCP) ─────
// Jirel 28.11.26. Two servers, both stateless (Streamable HTTP, JSON):
//  · publicMcp: anyone may use it. Searches the live workshop catalogue
//    (twiggli.com/catalog.json, rebuilt every morning) and always sends
//    people to the Twiggli page to book. No personal data at all.
//  · adminMcp: only for Jirel. Reads requests, bookings, hosts, vouchers and
//    payouts from Firestore. Read-only. Reached through a secret link
//    (/adminMcp/<token>): the token is made here and only ever emailed to
//    the Twiggli inbox, so nobody else (not even an assistant) sees it.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

const SITE = 'https://www.twiggli.com';

/** Runs one MCP request on a fresh server (no sessions kept). */
export const serveMcp = async (req, res, build) => {
  if (req.method === 'GET' || req.method === 'DELETE') {
    res.status(405).set('Allow', 'POST').json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null });
    return;
  }
  const server = build();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => { transport.close().catch(() => {}); server.close().catch(() => {}); });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
};

/** Every tool here only reads (directory requirement: annotate it). */
const RO = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const out = (obj) => ({ content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 1) }] });

// ── Public ────────────────────────────────────────────────────────────────
let cache = { at: 0, data: null };
const catalog = async () => {
  if (cache.data && Date.now() - cache.at < 30 * 60000) return cache.data;
  const r = await fetch(`${SITE}/catalog.json`, { headers: { 'User-Agent': 'twiggli-mcp' } });
  if (!r.ok) throw new Error(`catalog ${r.status}`);
  cache = { at: Date.now(), data: await r.json() };
  return cache.data;
};
const firstPrice = (p) => { const m = String(p ?? '').replace(',', '.').match(/\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const card = (w, dates) => ({
  id: w.id, title: w.title, host: w.host, ...(w.studio ? { studio: w.studio } : {}), category: w.category, district: w.district,
  price: w.price || 'on request', duration: w.duration, languages: w.languages,
  next: (dates ?? w.dates).slice(0, 5).map((d) => `${d.date}${d.time ? ` ${d.time}` : ''}${d.soldOut ? ' (sold out)' : d.spots !== undefined ? ` (${d.spots} left)` : ''}`),
  ...(w.onRequest ? { onRequest: true } : {}), giftVoucher: !!w.voucher, book: w.url,
});

export const buildPublic = () => {
  const s = new McpServer({ name: 'twiggli', version: '1.0.0' }, {
    instructions: 'Twiggli lists hands-on creative workshops with independent makers in Berlin (pottery, painting, candles, printmaking, cooking, crafts, wellbeing…). Use search_workshops to find classes by topic, date, district or budget, then share the "book" link: booking, private groups and gift vouchers all happen on twiggli.com. Prices are per person in euros unless stated.',
  });
  s.registerTool('search_workshops', {
    title: 'Search Berlin workshops',
    annotations: RO,
    description: 'Find creative workshops in Berlin on Twiggli. All filters are optional. Returns up to `limit` classes with price, district, length, next dates and the link to book.',
    inputSchema: {
      query: z.string().optional().describe('What the person wants, e.g. "pottery wheel", "candle", "date night", "kids"'),
      category: z.string().optional().describe('ceramics, art, craft, food, wellbeing, music, photography…'),
      district: z.string().optional().describe('Berlin district, e.g. Kreuzberg, Neukölln, Prenzlauer Berg'),
      date_from: z.string().optional().describe('YYYY-MM-DD, earliest date'),
      date_to: z.string().optional().describe('YYYY-MM-DD, latest date'),
      max_price: z.number().optional().describe('Highest price per person in euros'),
      language: z.string().optional().describe('e.g. English, German'),
      include_on_request: z.boolean().optional().describe('Also list classes without fixed dates that run on request (default true)'),
      limit: z.number().int().min(1).max(25).optional(),
    },
  }, async (a) => {
    const c = await catalog();
    const words = norm(a.query).split(/\s+/).filter((w) => w.length > 2);
    const hits = [];
    for (const w of c.workshops) {
      if (a.include_on_request === false && w.onRequest) continue;
      const hay = norm([w.title, w.host, w.studio, w.specialty, w.category, w.district, w.about].join(' '));
      const score = words.length ? words.filter((x) => hay.includes(x)).length : 1;
      if (words.length && !score) continue;
      if (a.category && !norm(w.category).includes(norm(a.category))) continue;
      if (a.district && !norm(w.district).includes(norm(a.district))) continue;
      if (a.language && !norm(w.languages).includes(norm(a.language).slice(0, 4))) continue;
      const p = firstPrice(w.price);
      if (a.max_price !== undefined && p !== null && p > a.max_price) continue;
      let dates = w.dates;
      if (a.date_from || a.date_to) {
        dates = dates.filter((d) => (!a.date_from || d.date >= a.date_from) && (!a.date_to || d.date <= a.date_to));
        if (!dates.length && !w.onRequest) continue;
      }
      hits.push({ w, dates, score, soon: dates[0]?.date ?? '9999' });
    }
    hits.sort((x, y) => y.score - x.score || x.soon.localeCompare(y.soon));
    const list = hits.slice(0, a.limit ?? 10).map((h) => card(h.w, h.dates));
    return out({ found: hits.length, shown: list.length, workshops: list, groups: c.groupsUrl, giftVouchers: c.voucherUrl, note: 'Booking is free to request; people pay only once the host confirms, or straight away where online payment is shown.' });
  });
  s.registerTool('get_workshop', {
    title: 'Workshop details',
    annotations: RO,
    description: 'Full details of one Twiggli workshop by its id (from search_workshops): about the host, all upcoming dates, languages, group sizes, link to book.',
    inputSchema: { id: z.string().describe('The id from search_workshops, e.g. "ceramic-kingdom/try-the-wheel"') },
  }, async ({ id }) => {
    const c = await catalog();
    const w = c.workshops.find((x) => x.id === id) ?? c.workshops.find((x) => x.id.endsWith(`/${id}`));
    if (!w) return out(`No workshop with id "${id}". Use search_workshops first.`);
    return out({ ...card(w, w.dates), next: w.dates.map((d) => `${d.date}${d.time ? ` ${d.time}` : ''}${d.soldOut ? ' (sold out)' : d.spots !== undefined ? ` (${d.spots} left)` : ''}`), about: w.about, specialty: w.specialty, groups: w.groups, book_de: w.url_de });
  });
  s.registerTool('list_categories', {
    title: 'Workshop categories',
    annotations: RO,
    description: 'The kinds of workshops on Twiggli and how many classes each has, plus the districts they take place in.',
    inputSchema: {},
  }, async () => {
    const c = await catalog();
    const count = (key) => Object.entries(c.workshops.reduce((m, w) => { const k = w[key] || 'other'; m[k] = (m[k] ?? 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
    return out({ updated: c.updated, categories: count('category'), districts: count('district').slice(0, 30) });
  });
  return s;
};

// ── Admin (read-only) ─────────────────────────────────────────────────────
const ms = (t) => t?.toMillis?.() ?? (typeof t === 'number' ? t : 0);
const day = (t) => (ms(t) ? new Date(ms(t)).toISOString().slice(0, 16).replace('T', ' ') : '');

export const buildAdmin = (db) => {
  const s = new McpServer({ name: 'twiggli-admin', version: '1.0.0' }, {
    instructions: 'Read-only view of Twiggli\'s live data (Firestore): booking requests with their message threads, paid bookings, hosts (account, Stripe, commission), vouchers and payouts owed. Times are UTC. Contains personal data: use it only to run Twiggli.',
  });
  s.registerTool('requests', {
    title: 'Booking requests',
    annotations: RO,
    description: 'Recent requests (newest first): who, which host and workshop, date, people, status, payment hold, last message.',
    inputSchema: { days: z.number().int().min(1).max(120).optional().describe('How far back (default 14)'), host: z.string().optional().describe('Host page slug, e.g. ceramic-kingdom'), status: z.string().optional().describe('pending, accepted, declined, preapproved, paid, expired…') },
  }, async ({ days = 14, host, status }) => {
    const since = new Date(Date.now() - days * 86400000);
    const snap = await db.collection('formRequests').where('createdAt', '>=', since).orderBy('createdAt', 'desc').limit(300).get();
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => !x.spam && (!host || x.hostSlug === host) && (!status || x.status === status)).map((x) => ({
      id: x.id, at: day(x.createdAt), type: x.fields?.Type, host: x.hostSlug ?? '', workshop: x.fields?.Workshop || x.fields?.Studio || '', date: x.fields?.Date ?? '', people: x.fields?.People ?? '',
      guest: x.fields?.Name ?? '', status: x.status ?? '', ...(x.hold ? { hold: { card: (x.hold.chargeCents ?? 0) / 100, voucher: (x.hold.voucherCents ?? 0) / 100, settled: x.hold.settled ?? '', payout: x.hold.payout ?? '' } } : {}),
      messages: (x.thread ?? []).length, last: (x.thread ?? []).slice(-1).map((t) => `${t.from === 'guest' ? 'guest' : 'host'}: ${t.action}${t.message ? ` "${String(t.message).slice(0, 140)}"` : ''}`)[0] ?? '',
    }));
    return out({ count: list.length, requests: list.slice(0, 80) });
  });
  s.registerTool('request', {
    title: 'One request in full',
    annotations: RO,
    description: 'Every field of one request and its whole message thread (host and guest).',
    inputSchema: { id: z.string() },
  }, async ({ id }) => {
    const d = await db.doc(`formRequests/${id}`).get();
    if (!d.exists) return out('Not found.');
    const x = d.data();
    return out({ id, at: day(x.createdAt), subject: x.subject, host: x.hostSlug, status: x.status, fields: x.fields, hold: x.hold ?? null, preapproval: x.preapproval ? { total: (x.preapproval.cents ?? 0) / 100, until: day(x.preapproval.until) } : null,
      thread: (x.thread ?? []).map((t) => ({ at: day(t.at), from: t.from === 'guest' ? 'guest' : (t.by ?? 'host'), action: t.action, message: t.message ?? '', ...(t.when ? { when: t.when } : {}), ...(t.total ? { total: t.total } : {}) })) });
  });
  s.registerTool('bookings', {
    title: 'Paid and reserved bookings',
    annotations: RO,
    description: 'Bookings made and paid online (newest first): workshop, date, people, amount, Twiggli fee, voucher part, status.',
    inputSchema: { days: z.number().int().min(1).max(365).optional().describe('Created within the last N days (default 30)'), host: z.string().optional() },
  }, async ({ days = 30, host }) => {
    const since = new Date(Date.now() - days * 86400000);
    const snap = await db.collection('bookings').where('createdAt', '>=', since).orderBy('createdAt', 'desc').limit(300).get();
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((b) => !host || b.slug === host).map((b) => ({
      id: b.id, created: day(b.createdAt), host: b.slug, title: b.title, date: b.date, start: b.start, people: b.people, guest: b.name, status: b.status,
      amount: (b.amount ?? 0) / 100, fee: (b.fee ?? 0) / 100, voucher: (b.voucherCents ?? 0) / 100, ...(b.requestId ? { request: b.requestId } : {}),
    }));
    return out({ count: list.length, bookings: list });
  });
  s.registerTool('hosts', {
    title: 'Host accounts',
    annotations: RO,
    description: 'Everyone with a Twiggli host account: email, pages, Stripe connected or not, commission rate.',
    inputSchema: { host: z.string().optional().describe('Only this page slug') },
  }, async ({ host }) => {
    const snap = await db.collection('hostMembers').get();
    const list = snap.docs.map((d) => ({ email: d.id, ...d.data() })).filter((m) => !host || (m.slugs ?? []).includes(host)).map((m) => ({
      email: m.email, pages: m.slugs ?? [], stripe: m.stripe?.accountId ? (m.stripe.chargesEnabled ? 'ready' : 'linked, not ready') : 'not connected',
      commissionPct: Number.isFinite(m.commissionPct) ? m.commissionPct : 'default 15', ...(m.stripe?.linkedAt ? { stripeSince: day(m.stripe.linkedAt) } : {}),
    }));
    return out({ count: list.length, hosts: list });
  });
  s.registerTool('vouchers', {
    title: 'Vouchers',
    annotations: RO,
    description: 'All Twiggli voucher codes (only their last 4 characters): value, balance, host, valid until, held for pending requests, redemptions, and which Stripe account the money is on.',
    inputSchema: { open_only: z.boolean().optional().describe('Only vouchers with money left') },
  }, async ({ open_only }) => {
    const snap = await db.collection('voucherCodes').get();
    const list = snap.docs.map((d) => d.data()).filter((v) => !open_only || (v.balance ?? 0) > 0).map((v) => ({
      code: `…${v.last4 ?? ''}`, ref: v.ref ?? '', host: v.hostSlug || 'general', amount: v.amount, balance: v.balance, validUntil: v.validUntil ?? '', account: v.stripeAccount || 'web',
      held: Object.values(v.holds ?? {}).reduce((n, h) => n + (h?.cents ?? 0), 0) / 100,
      redeemed: (v.redemptions ?? []).filter((r) => r.status === 'redeemed').map((r) => `${r.hostSlug} €${r.amount} ${day(r.at)}`),
    }));
    return out({ count: list.length, vouchers: list });
  });
  s.registerTool('payouts', {
    title: 'What Twiggli owes hosts',
    annotations: RO,
    description: 'Voucher payouts (paid automatically to Stripe, or to transfer by bank) and card holds charged for hosts without Stripe that still need a bank transfer.',
    inputSchema: {},
  }, async () => {
    const v = await db.collection('voucherPayouts').get();
    const vouchers = v.docs.map((d) => ({ ref: d.id, ...d.data() })).map((p) => ({ host: p.hostSlug, net: (p.netCents ?? 0) / 100, gross: (p.voucherCents ?? 0) / 100, status: p.status, ...(p.reason ? { reason: p.reason } : {}), what: p.what ?? '', at: day(p.at) }));
    const h = await db.collection('formRequests').where('hold.payout', '==', 'owed').get();
    const cards = h.docs.map((d) => ({ id: d.id, ...d.data() })).map((x) => ({ request: x.id, host: x.hostSlug, net: (x.hold?.payoutCents ?? 0) / 100, gross: (x.hold?.chargeCents ?? 0) / 100, guest: x.fields?.Name ?? '', workshop: x.fields?.Workshop ?? '', settled: day(x.hold?.settledAt) }));
    return out({ voucherPayouts: vouchers, cardHoldsToTransfer: cards });
  });
  return s;
};
