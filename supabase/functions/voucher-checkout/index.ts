// Twiggli voucher checkout — a Supabase Edge Function (Deno).
//
// The site posts what the buyer picked (a general amount, or a host's
// voucher with the number of places); this creates a Stripe Checkout
// Session for exactly that amount and answers with its URL, so every
// voucher is two clicks: pick, pay. Stripe asks for name, email, card and
// the recipient; the host, places and our reference ride along as metadata.
//
// Secrets (Supabase → Edge Functions → Secrets), never in this file:
//   STRIPE_SECRET_KEY   sk_test_… while testing, sk_live_… once live
//
// Deploy: Supabase dashboard → Edge Functions → "voucher-checkout",
// paste this file, and switch "Verify JWT" off (the site calls it
// anonymously; it can only ever open a payment page).

const ALLOWED_ORIGINS = ['https://www.twiggli.com', 'https://twiggli.com', 'http://localhost:4321', 'http://localhost:4399'];
const MIN_EUR = 20;
const MAX_EUR = 2000;
const SITE = 'https://www.twiggli.com';

type Body = {
  amount: number;          // euros, whole number
  host?: string;           // host name, or empty for a general voucher
  hostSlug?: string;
  title?: string;          // the workshop, for a host's voucher
  people?: number;
  ref?: string;            // our reference (vc-…), also in the inbox note
  lang?: string;
  email?: string;
};

const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : SITE,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Vary': 'Origin',
});

const json = (data: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors(origin), 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405, origin);

  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) return json({ error: 'Stripe key missing' }, 500, origin);

  let body: Body;
  try { body = await req.json(); } catch { return json({ error: 'Bad JSON' }, 400, origin); }

  const amount = Math.round(Number(body.amount));
  if (!Number.isFinite(amount) || amount < MIN_EUR || amount > MAX_EUR) {
    return json({ error: `Amount must be between ${MIN_EUR} and ${MAX_EUR} €` }, 400, origin);
  }
  const lang = ['de', 'en', 'fr', 'es', 'it', 'nl', 'pl', 'tr'].includes(String(body.lang)) ? String(body.lang) : 'de';
  const de = lang === 'de';
  const host = String(body.host ?? '').slice(0, 120);
  const title = String(body.title ?? '').slice(0, 160);
  const people = Math.max(1, Math.min(10, Math.round(Number(body.people) || 1)));
  const ref = String(body.ref ?? '').replace(/[^\w-]/g, '').slice(0, 60) || `vc-${Date.now().toString(36)}`;

  const name = host
    ? `${de ? 'Twiggli-Gutschein' : 'Twiggli voucher'} · ${host}${title ? ` · ${title}` : ''}${people > 1 ? ` (${people} ${de ? 'Plätze' : 'places'})` : ''}`
    : (de ? 'Twiggli-Gutschein' : 'Twiggli voucher');
  const description = host
    ? (de ? '3 Jahre gültig · als PDF per E-Mail' : 'Valid for 3 years · sent as a PDF by email')
    : (de ? '3 Jahre gültig · bei allen teilnehmenden Hosts · als PDF per E-Mail' : 'Valid for 3 years · at every participating host · sent as a PDF by email');
  const page = lang === 'de' ? `${SITE}/de/gutschein/` : `${SITE}/voucher/`;

  const p = new URLSearchParams();
  p.set('mode', 'payment');
  p.set('locale', lang === 'tr' ? 'tr' : lang);
  p.set('client_reference_id', ref);
  p.set('success_url', `${page}?danke=1`);
  p.set('cancel_url', page);
  p.set('line_items[0][quantity]', '1');
  p.set('line_items[0][price_data][currency]', 'eur');
  p.set('line_items[0][price_data][unit_amount]', String(amount * 100));
  p.set('line_items[0][price_data][product_data][name]', name);
  p.set('line_items[0][price_data][product_data][description]', description);
  p.set('billing_address_collection', 'auto');
  p.set('custom_fields[0][key]', 'recipient');
  p.set('custom_fields[0][label][type]', 'custom');
  p.set('custom_fields[0][label][custom]', de ? 'Für wen ist der Gutschein?' : 'Who is the voucher for?');
  p.set('custom_fields[0][type]', 'text');
  p.set('custom_fields[0][optional]', 'true');
  p.set('custom_fields[1][key]', 'message');
  p.set('custom_fields[1][label][type]', 'custom');
  p.set('custom_fields[1][label][custom]', de ? 'Persönliche Nachricht (optional)' : 'Personal message (optional)');
  p.set('custom_fields[1][type]', 'text');
  p.set('custom_fields[1][optional]', 'true');
  if (body.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) p.set('customer_email', body.email);
  const meta: Record<string, string> = {
    kind: host ? 'host voucher' : 'general voucher',
    host: host || 'all participating hosts',
    host_slug: String(body.hostSlug ?? '').slice(0, 80),
    workshop: title, people: String(people), amount_eur: String(amount), ref, lang,
  };
  for (const [k, v] of Object.entries(meta)) {
    p.set(`metadata[${k}]`, v);
    p.set(`payment_intent_data[metadata][${k}]`, v);
  }
  p.set('payment_intent_data[description]', name);

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: p,
  });
  const out = await res.json();
  if (!res.ok) return json({ error: out?.error?.message ?? 'Stripe error' }, 502, origin);
  return json({ url: out.url, ref }, 200, origin);
});
