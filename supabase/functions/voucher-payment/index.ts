// Twiggli voucher payment — a Supabase Edge Function (Deno).
//
// Our own checkout page (/checkout/, /de/checkout/) shows Stripe's Payment
// Element and Express Checkout Element on twiggli.com itself, so the buyer
// never leaves the site. The page settles the amount and the buyer's details
// first, then calls this when they press "Pay": it creates a Stripe
// PaymentIntent for exactly that amount and answers with its client secret,
// which the page hands to stripe.confirmPayment. The host, places, recipient,
// message and our reference ride along as metadata.
//
// Two modes, both POST with JSON:
//   create  { amount, host?, hostSlug?, title?, people?, ref?, lang?,
//             name?, email?, recipient?, message? }  → { clientSecret, ref, id }
//   update  { update: true, paymentIntentId, clientSecret, name?, email?,
//             recipient?, message? }                  → { ok: true }
//           (a retry after a declined card reuses the intent; this refreshes
//           what the buyer may have edited in between)
//
// Secrets (Supabase → Edge Functions → Secrets), never in this file:
//   STRIPE_SECRET_KEY   sk_test_… while testing, sk_live_… once live
//
// Deploy: Supabase dashboard → Edge Functions → Deploy a new function →
// Via Editor, name it "voucher-payment", paste this file, and switch
// "Verify JWT" off (the site calls it anonymously; it can only ever prepare
// a payment the buyer still has to confirm with their own card).
// voucher-checkout (the Stripe-hosted page) stays as the fallback.

const ALLOWED_ORIGINS = ['https://www.twiggli.com', 'https://twiggli.com', 'http://localhost:4321', 'http://localhost:4399'];
const MIN_EUR = 20;
const MAX_EUR = 2000;
const SITE = 'https://www.twiggli.com';
const LANGS = ['de', 'en', 'fr', 'es', 'it', 'nl', 'pl', 'tr'];

type Body = {
  update?: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  amount?: number;         // euros, whole number
  host?: string;           // host name, or empty for a general voucher
  hostSlug?: string;
  title?: string;          // the workshop, for a host's voucher
  people?: number;
  ref?: string;            // our reference (vc-…), also in the inbox note
  lang?: string;
  name?: string;           // the buyer
  email?: string;
  recipient?: string;      // who the voucher is for
  message?: string;        // the personal message on the voucher
};

const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : SITE,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Vary': 'Origin',
});

const json = (data: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors(origin), 'Content-Type': 'application/json' } });

/** Stripe metadata values are at most 500 characters. */
const text = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

const stripe = (key: string, path: string, params?: URLSearchParams) =>
  fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405, origin);

  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) return json({ error: 'Stripe key missing' }, 500, origin);

  let body: Body;
  try { body = await req.json(); } catch { return json({ error: 'Bad JSON' }, 400, origin); }

  const name = text(body.name, 120);
  const email = text(body.email, 200);
  const recipient = text(body.recipient, 200);
  const message = text(body.message, 480);

  // ── update: refresh the buyer's details on an intent made earlier ──
  if (body.update) {
    const id = String(body.paymentIntentId ?? '');
    if (!/^pi_[A-Za-z0-9]+$/.test(id)) return json({ error: 'Bad payment id' }, 400, origin);
    // Only whoever holds the intent's client secret (the page that made
    // it) may change it.
    const got = await stripe(key, `payment_intents/${id}`);
    const pi = await got.json();
    if (!got.ok) return json({ error: pi?.error?.message ?? 'Stripe error' }, 502, origin);
    if (!body.clientSecret || pi.client_secret !== body.clientSecret) return json({ error: 'Not allowed' }, 403, origin);
    if (!['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(pi.status)) {
      return json({ error: 'Payment can no longer be changed' }, 409, origin);
    }
    const p = new URLSearchParams();
    p.set('metadata[recipient]', recipient);
    p.set('metadata[message]', message);
    p.set('metadata[buyer_name]', name);
    if (isEmail(email)) p.set('receipt_email', email);
    const res = await stripe(key, `payment_intents/${id}`, p);
    const out = await res.json();
    if (!res.ok) return json({ error: out?.error?.message ?? 'Stripe error' }, 502, origin);
    return json({ ok: true }, 200, origin);
  }

  // ── create ──
  const amount = Math.round(Number(body.amount));
  if (!Number.isFinite(amount) || amount < MIN_EUR || amount > MAX_EUR) {
    return json({ error: `Amount must be between ${MIN_EUR} and ${MAX_EUR} €` }, 400, origin);
  }
  const lang = LANGS.includes(String(body.lang)) ? String(body.lang) : 'de';
  const de = lang === 'de';
  const host = text(body.host, 120);
  const title = text(body.title, 160);
  const people = Math.max(1, Math.min(10, Math.round(Number(body.people) || 1)));
  const ref = String(body.ref ?? '').replace(/[^\w-]/g, '').slice(0, 60) || `vc-${Date.now().toString(36)}`;

  const description = host
    ? `${de ? 'Twiggli-Gutschein' : 'Twiggli voucher'} · ${host}${title ? ` · ${title}` : ''}${people > 1 ? ` (${people} ${de ? 'Plätze' : 'places'})` : ''} · ${ref}`
    : `${de ? 'Twiggli-Gutschein' : 'Twiggli voucher'} · ${de ? 'alle teilnehmenden Hosts' : 'all participating hosts'} · ${ref}`;

  const p = new URLSearchParams();
  p.set('amount', String(amount * 100));
  p.set('currency', 'eur');
  p.set('automatic_payment_methods[enabled]', 'true');
  p.set('description', description.slice(0, 1000));
  if (isEmail(email)) p.set('receipt_email', email);
  const meta: Record<string, string> = {
    kind: host ? 'host voucher' : 'general voucher',
    host: host || 'all participating hosts',
    host_slug: text(body.hostSlug, 80),
    workshop: title,
    people: host ? String(people) : '',
    amount_eur: String(amount),
    ref, lang, recipient, message,
    buyer_name: name,
  };
  for (const [k, v] of Object.entries(meta)) p.set(`metadata[${k}]`, v);

  const res = await stripe(key, 'payment_intents', p);
  const out = await res.json();
  if (!res.ok) return json({ error: out?.error?.message ?? 'Stripe error' }, 502, origin);
  return json({ clientSecret: out.client_secret, ref, id: out.id }, 200, origin);
});
