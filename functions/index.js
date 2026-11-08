// Twiggli's Cloud Functions on Firebase (region europe-west3, Frankfurt),
// replacing the Supabase Edge Functions in supabase/functions/. Same
// requests, same answers, so the site only swaps the URL
// (site/src/data/firebase.ts → VOUCHERS_ON_FIREBASE).
//
//   voucherCheckout  creates a Stripe Checkout Session (the Stripe-hosted
//                    page, kept as the fallback)
//   voucherPayment   creates or updates a PaymentIntent for our own
//                    checkout page (/checkout/, /de/checkout/)
//   formRequest      every form on the site (booking, group, studio,
//                    contact, host application, voucher notes …): saves
//                    the request in Firestore (formRequests) first, then
//                    emails it to Jirel. Replaces FormSubmit, which went
//                    down on 28.10.26 (error 521).
//   hostClaim        a signed-in host asks to edit a page: Jirel (ADMIN)
//                    gets access at once, anyone else waits for her Approve
//   hostApprove      the one-click Approve link in Jirel's email
//
// The Stripe secret key lives in Firebase Secret Manager, never in this
// file or in the repo:  firebase functions:secrets:set STRIPE_SECRET_KEY
// See README.md here for setup and deploy.

import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';
import { newVoucherCode, voucherMail, voucherPdf } from './voucher.js';

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
// An app password of the Gmail account the requests go to (Google account →
// Security → App passwords), so the function can mail Jirel from it.
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');
// The restricted key of the "Twiggli app" Stripe account, the Connect
// platform where hosts' Standard accounts live (Jirel 05.11.26): host
// onboarding and guests' bookings. Vouchers stay on STRIPE_SECRET_KEY
// (the "Twiggli Website" account).
const STRIPE_CONNECT_KEY = defineSecret('STRIPE_CONNECT_KEY');
// No address is written in this repo (Jirel, 31.10.26): they come from
// functions/.env, which deploy-firebase.yml writes from encrypted GitHub
// secrets (INBOX_EMAIL, SENDER_EMAIL, ADMIN_EMAILS) and never commits.
const INBOX = process.env.INBOX_EMAIL ?? '';
const SENDER = process.env.SENDER_EMAIL || INBOX;
const SLUG = /^[a-z0-9-]{1,60}$/;
// The hosts we already know live in Jirel's Google Sheet, tab "Hosts &
// Emails": column D the email(s), column K the Twiggli page (slug). Read at
// sign-in (never copied into this public repo), with the function's own
// service account, which the sheet is shared with (view only).
const HOST_SHEET = '1zS4UH_IHn2mPUsoGPLhID0C6ZdeAXnHof0YZJTjjVTo';
const knownSlugs = async (email) => {
  const tok = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token?scopes=https://www.googleapis.com/auth/spreadsheets.readonly', { headers: { 'Metadata-Flavor': 'Google' } });
  if (!tok.ok) throw new Error(`token ${tok.status}`);
  const { access_token: token } = await tok.json();
  const range = encodeURIComponent("'Hosts & Emails'!D2:K400");
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${HOST_SHEET}/values/${range}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`sheet ${res.status}`);
  const rows = (await res.json()).values ?? [];
  const out = new Set();
  for (const r of rows) {
    const emails = String(r[0] ?? '').toLowerCase().split(/[\s,;]+/).filter(Boolean);
    if (!emails.includes(email)) continue;
    for (const s of String(r[7] ?? '').toLowerCase().split(/[\s,;]+/)) if (SLUG.test(s)) out.add(s);
  }
  return [...out];
};
/** The host behind a Twiggli page, from the same sheet: their email(s)
 *  (column D) and first name (column A). Null when the sheet has no row. */
const hostContact = async (slug) => {
  const tok = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token?scopes=https://www.googleapis.com/auth/spreadsheets.readonly', { headers: { 'Metadata-Flavor': 'Google' } });
  if (!tok.ok) throw new Error(`token ${tok.status}`);
  const { access_token: token } = await tok.json();
  const range = encodeURIComponent("'Hosts & Emails'!A2:K400");
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${HOST_SHEET}/values/${range}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`sheet ${res.status}`);
  for (const r of (await res.json()).values ?? []) {
    const slugs = String(r[10] ?? '').toLowerCase().split(/[\s,;]+/);
    if (!slugs.includes(slug)) continue;
    const emails = String(r[3] ?? '').split(/[\s,;/]+/).filter(isEmail);
    if (emails.length) return { emails, firstName: String(r[0] ?? '').trim().split(/\s+/)[0] };
  }
  return null;
};
// May open every host's account without approval, and approves the others.
const ADMINS = String(process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
const FUNCTIONS_URL = 'https://europe-west3-twiggli-production.cloudfunctions.net';

initializeApp();

const ALLOWED_ORIGINS = ['https://www.twiggli.com', 'https://twiggli.com', 'http://localhost:4321', 'http://localhost:4399'];
const MIN_EUR = 20;
const MAX_EUR = 2000;
const SITE = 'https://www.twiggli.com';
const LANGS = ['de', 'en', 'fr', 'es', 'it', 'nl', 'pl', 'tr'];
const OPTS = { region: 'europe-west3', secrets: [STRIPE_SECRET_KEY], maxInstances: 10, cors: false };

/** CORS by hand, so only twiggli.com (and local builds) may call. */
const allow = (req, res) => {
  const origin = req.get('origin');
  res.set('Access-Control-Allow-Origin', origin && ALLOWED_ORIGINS.includes(origin) ? origin : SITE);
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'content-type, authorization, apikey, x-client-info');
  res.set('Vary', 'Origin');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return false; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return false; }
  return true;
};

/** Stripe metadata values are at most 500 characters. */
const text = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const isEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

const stripe = (key, path, params) =>
  fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

/** The buyer's choice, checked: amount in whole euros, language, host. */
const order = (body) => {
  const amount = Math.round(Number(body.amount));
  if (!Number.isFinite(amount) || amount < MIN_EUR || amount > MAX_EUR) return null;
  const lang = LANGS.includes(String(body.lang)) ? String(body.lang) : 'de';
  return {
    amount,
    lang,
    de: lang === 'de',
    host: text(body.host, 120),
    title: text(body.title, 160),
    people: Math.max(1, Math.min(10, Math.round(Number(body.people) || 1))),
    ref: String(body.ref ?? '').replace(/[^\w-]/g, '').slice(0, 60) || `vc-${Date.now().toString(36)}`,
  };
};

export const voucherCheckout = onRequest(OPTS, async (req, res) => {
  if (!allow(req, res)) return;
  const key = STRIPE_SECRET_KEY.value();
  if (!key) return res.status(500).json({ error: 'Stripe key missing' });
  const body = req.body ?? {};
  const o = order(body);
  if (!o) return res.status(400).json({ error: `Amount must be between ${MIN_EUR} and ${MAX_EUR} €` });
  const { amount, lang, de, host, title, people, ref } = o;

  const name = host
    ? `${de ? 'Twiggli-Gutschein' : 'Twiggli voucher'} · ${host}${title ? ` · ${title}` : ''}${people > 1 ? ` (${people} ${de ? 'Plätze' : 'places'})` : ''}`
    : (de ? 'Twiggli-Gutschein' : 'Twiggli voucher');
  const description = host
    ? (de ? '3 Jahre gültig · als PDF per E-Mail' : 'Valid for 3 years · sent as a PDF by email')
    : (de ? '3 Jahre gültig · bei allen teilnehmenden Hosts · als PDF per E-Mail' : 'Valid for 3 years · at every participating host · sent as a PDF by email');
  const page = lang === 'de' ? `${SITE}/de/gutschein/` : `${SITE}/voucher/`;

  const p = new URLSearchParams();
  p.set('mode', 'payment');
  p.set('locale', lang);
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
  if (body.email && isEmail(String(body.email))) p.set('customer_email', String(body.email));
  const meta = {
    kind: host ? 'host voucher' : 'general voucher',
    host: host || 'all participating hosts',
    host_slug: text(body.hostSlug, 80),
    workshop: title, people: String(people), amount_eur: String(amount), ref, lang,
  };
  for (const [k, v] of Object.entries(meta)) {
    p.set(`metadata[${k}]`, v);
    p.set(`payment_intent_data[metadata][${k}]`, v);
  }
  p.set('payment_intent_data[description]', name);

  const r = await stripe(key, 'checkout/sessions', p);
  const out = await r.json();
  if (!r.ok) return res.status(502).json({ error: out?.error?.message ?? 'Stripe error' });
  return res.status(200).json({ url: out.url, ref });
});

export const voucherPayment = onRequest(OPTS, async (req, res) => {
  if (!allow(req, res)) return;
  const key = STRIPE_SECRET_KEY.value();
  if (!key) return res.status(500).json({ error: 'Stripe key missing' });
  const body = req.body ?? {};
  const name = text(body.name, 120);
  const email = text(body.email, 200);
  const recipient = text(body.recipient, 200);
  const message = text(body.message, 480);
  // Who gets the PDF: the buyer, or straight to the person it is for.
  const deliver = body.deliver === 'them' ? 'them' : 'me';
  const recipientEmail = deliver === 'them' && isEmail(text(body.recipientEmail, 200)) ? text(body.recipientEmail, 200) : '';

  // ── update: refresh the buyer's details on an intent made earlier ──
  if (body.update) {
    const id = String(body.paymentIntentId ?? '');
    if (!/^pi_[A-Za-z0-9]+$/.test(id)) return res.status(400).json({ error: 'Bad payment id' });
    // Only whoever holds the intent's client secret (the page that made
    // it) may change it.
    const got = await stripe(key, `payment_intents/${id}`);
    const pi = await got.json();
    if (!got.ok) return res.status(502).json({ error: pi?.error?.message ?? 'Stripe error' });
    if (!body.clientSecret || pi.client_secret !== body.clientSecret) return res.status(403).json({ error: 'Not allowed' });
    if (!['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(pi.status)) {
      return res.status(409).json({ error: 'Payment can no longer be changed' });
    }
    const p = new URLSearchParams();
    p.set('metadata[recipient]', recipient);
    p.set('metadata[message]', message);
    p.set('metadata[deliver_to]', recipientEmail ? 'recipient' : 'buyer');
    p.set('metadata[recipient_email]', recipientEmail);
    p.set('metadata[buyer_name]', name);
    if (isEmail(email)) p.set('receipt_email', email);
    const r = await stripe(key, `payment_intents/${id}`, p);
    const out = await r.json();
    if (!r.ok) return res.status(502).json({ error: out?.error?.message ?? 'Stripe error' });
    return res.status(200).json({ ok: true });
  }

  // ── create ──
  const o = order(body);
  if (!o) return res.status(400).json({ error: `Amount must be between ${MIN_EUR} and ${MAX_EUR} €` });
  const { amount, lang, de, host, title, people, ref } = o;
  const description = host
    ? `${de ? 'Twiggli-Gutschein' : 'Twiggli voucher'} · ${host}${title ? ` · ${title}` : ''}${people > 1 ? ` (${people} ${de ? 'Plätze' : 'places'})` : ''} · ${ref}`
    : `${de ? 'Twiggli-Gutschein' : 'Twiggli voucher'} · ${de ? 'alle teilnehmenden Hosts' : 'all participating hosts'} · ${ref}`;

  const p = new URLSearchParams();
  p.set('amount', String(amount * 100));
  p.set('currency', 'eur');
  p.set('automatic_payment_methods[enabled]', 'true');
  p.set('description', description.slice(0, 1000));
  if (isEmail(email)) p.set('receipt_email', email);
  const meta = {
    kind: host ? 'host voucher' : 'general voucher',
    host: host || 'all participating hosts',
    host_slug: text(body.hostSlug, 80),
    workshop: title,
    people: host ? String(people) : '',
    amount_eur: String(amount),
    ref, lang, recipient, message,
    deliver_to: recipientEmail ? 'recipient' : 'buyer',
    recipient_email: recipientEmail,
    buyer_name: name,
  };
  for (const [k, v] of Object.entries(meta)) p.set(`metadata[${k}]`, v);

  const r = await stripe(key, 'payment_intents', p);
  const out = await r.json();
  if (!r.ok) return res.status(502).json({ error: out?.error?.message ?? 'Stripe error' });
  return res.status(200).json({ clientSecret: out.client_secret, ref, id: out.id });
});

/** Sends a plain notification to Jirel's own inbox (never to anyone else). */
const mailJirel = async ({ subject, text: body, html, replyTo }) => {
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  await mail.sendMail({ from: { name: 'Twiggli', address: INBOX }, to: INBOX, ...(replyTo ? { replyTo } : {}), subject, text: body, html });
};

/** "We've got your request": one short email to the guest, in German or
 *  English, from our public address (SENDER, a send-as address of Jirel's Gmail). */
/** An emoji for the kind of workshop, from words in its title. */
const EMOJI = [
  [/töpfer|pottery|ceramic|keramik|clay|ton\b|wheel|drehscheibe|handbuild|aufbau/i, '🏺'],
  [/kerze|candle|wachs|wax/i, '🕯️'],
  [/parfum|perfume|duft|fragrance|incense|räucher/i, '🌸'],
  [/bier|beer|brew|brau/i, '🍺'],
  [/whisk|rum|mezcal|gin|cocktail|tasting|verkostung|spirit|wein|wine/i, '🥃'],
  [/koch|cook|pasta|sushi|kimchi|back|bak|brot|bread|food|schokolade|chocolate|macaron|kaffee|coffee/i, '🍳'],
  [/schnitz|whittl|wood|holz|tischler|spoon|löffel/i, '🪵'],
  [/schmuck|jewel|silber|silver|ring\b|schmied|forg|blacksmith|messer|knife/i, '💍'],
  [/stick|embroider|knit|strick|tuft|quilt|näh|sew|textil|leder|leather|weav/i, '🧵'],
  [/foto|photo|cyanotyp|dunkelkammer|darkroom/i, '📷'],
  [/druck|print|linol|siebdruck/i, '🖨️'],
  [/buch|book|binding|papier|paper/i, '📚'],
  [/mosai|terrazzo|marmor|marble/i, '🧩'],
  [/kräuter|herb|forag|wild|terrari|pflanz|plant|blume|flower/i, '🌿'],
  [/honig|honey|imker|bee/i, '🐝'],
  [/trommel|drum|percussion|music|musik|sing|voice|dance|tanz/i, '🥁'],
  [/mal|paint|acryl|aquarell|watercolou?r|zeichn|draw|sketch|art|kunst|graffiti/i, '🎨'],
];
const emojiFor = (title) => EMOJI.find(([re]) => re.test(String(title ?? '')))?.[1] ?? '✨';

const confirmGuest = async (to, f) => {
  const de = String(f.Language ?? '').startsWith('de');
  const name = String(f.Name ?? '').trim().split(/\s+/)[0];
  const what = f.Workshop || f.Studio || f.Type;
  const icon = f.Studio ? '🏠' : emojiFor(what);
  const when = [String(f.Date ?? '').replace(/^\d{4}-\d\d-\d\d \((.*)\)$/, '$1'), f.Time].filter(Boolean).join(', ');
  const rows = [
    [de ? 'Workshop' : 'Workshop', `${what} ${icon}`],
    [de ? 'Gastgeber' : 'Host', f.Host],
    [de ? 'Wann' : 'When', when],
    [de ? 'Personen' : 'People', f.People],
  ].filter(([, v]) => v);
  const intro = de
    ? `Hallo${name ? ` ${esc(name)}` : ''},<br><br>danke für deine Anfrage bei <b>Twiggli</b>! Sie ist gut bei uns angekommen:`
    : `Hi${name ? ` ${esc(name)}` : ''},<br><br>thank you for your request on <b>Twiggli</b>! It has reached us:`;
  const runs = String(f['Runs from'] ?? '').match(/\d+/)?.[0];
  const runsNote = !runs ? '' : de
    ? `Dieser Kurs findet ab ${runs} Teilnehmenden statt. Deine Anfrage wird bestätigt, sobald ${runs} Plätze gebucht sind, und erst dann zahlst du. Kommt er nicht zustande, wird nichts berechnet.<br><br>`
    : `This class runs from ${runs} participants. Your request is confirmed as soon as ${runs} places are booked, and only then do you pay. If it doesn’t fill up, nothing is charged.<br><br>`;
  const outro = runsNote + (de
    ? 'Wir geben sie direkt an den Gastgeber weiter. Er oder sie meldet sich bei dir per E-Mail, meist innerhalb von 1–2 Tagen. Du musst nichts weiter tun.<br><br>Fragen? Antworte einfach auf diese E-Mail.<br><br>Liebe Grüße 💛<br>Jirel von <b>Twiggli</b>'
    : 'We pass it straight on to the host, who will get back to you by email, usually within 1–2 days. There is nothing else you need to do.<br><br>Questions? Just reply to this email.<br><br>Warm regards 💛<br>Jirel from <b>Twiggli</b>');
  const table = rows.map(([k, v]) => `<tr><td style="padding:4px 14px 4px 0;color:#777">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`).join('');
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  await mail.sendMail({
    from: { name: 'Twiggli', address: SENDER },
    replyTo: SENDER,
    to,
    subject: de ? `Deine Anfrage bei Twiggli: ${what} ${icon}` : `Your Twiggli request: ${what} ${icon}`,
    text: `${de ? 'Danke für deine Anfrage bei Twiggli' : 'Thank you for your request on Twiggli'}.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${de ? 'Der Gastgeber meldet sich bei dir per E-Mail, meist innerhalb von 1–2 Tagen.' : 'The host will get back to you by email, usually within 1–2 days.'}\n\n💛 Jirel, Twiggli`,
    html: `<div style="font-family:Tahoma,sans-serif;font-size:14px;line-height:1.5">${intro}<table style="margin:14px 0;font-size:14px">${table}</table>${outro}</div>`,
  });
};

/** HTML-escaped, for the email table. */
const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** "You just bought a voucher": one email to the buyer, from the payment
 *  as Stripe holds it (never from what the page sent), and on purpose
 *  WITHOUT the code: the code travels only in the voucher PDF, to whoever
 *  is to receive it, so it can't be used twice (Jirel, 31.10.26). Sent
 *  once per payment (vouchers/{paymentIntent}). */
const confirmVoucherBuyer = async (piId) => {
  if (!/^pi_[A-Za-z0-9]+$/.test(piId)) return;
  const key = STRIPE_SECRET_KEY.value();
  if (!key) return;
  const got = await stripe(key, `payment_intents/${piId}`);
  const pi = await got.json();
  if (!got.ok || !['succeeded', 'processing'].includes(pi.status)) return;
  const to = pi.receipt_email;
  if (!isEmail(to)) return;
  const m = pi.metadata ?? {};
  try {
    await getFirestore().doc(`vouchers/${pi.id}`).create({
      ref: m.ref ?? '', amount: pi.amount / 100, buyer: to, buyerName: m.buyer_name ?? '',
      recipient: m.recipient ?? '', recipientEmail: m.recipient_email ?? '', deliverTo: m.deliver_to ?? 'buyer',
      host: m.host ?? '', hostSlug: m.host_slug ?? '', message: m.message ?? '', lang: m.lang ?? '',
      pdfSent: false, buyerConfirmedAt: FieldValue.serverTimestamp(),
    });
  } catch { return; } // already confirmed
  // The voucher itself: its code, its PDF and the email that carries it.
  // Sent to the buyer, that email is their order confirmation too.
  let sentTo = '';
  // Off until Jirel has seen the test emails and says yes (31.10.26):
  // VOUCHER_AUTO=on in functions/.env switches it on.
  if (process.env.VOUCHER_AUTO === 'on') {
    try { sentTo = await issueVoucher(pi, m, to); } catch (err) { console.error('voucher issue failed', pi.id, err?.message); }
  }
  if (sentTo) return; // the voucher emails confirm the order; the plain note below only if they failed
  const de = String(m.lang ?? '').startsWith('de');
  const name = String(m.buyer_name ?? '').trim().split(/\s+/)[0];
  const general = !m.host_slug;
  const amount = `${pi.amount / 100} €`;
  const forWhom = m.recipient ? String(m.recipient) : '';
  const toThem = m.deliver_to === 'recipient' && isEmail(m.recipient_email);
  const rows = [
    [de ? 'Gutschein' : 'Voucher', general ? (de ? 'Twiggli-Gutschein, bei allen teilnehmenden Hosts' : 'Twiggli voucher, at all participating hosts') : `${m.host}${m.workshop ? ` · ${m.workshop}` : ''}`],
    [de ? 'Betrag' : 'Amount', amount],
    ...(forWhom ? [[de ? 'Für' : 'For', forWhom]] : []),
    [de ? 'Gültig' : 'Valid', de ? '3 Jahre' : '3 years'],
    [de ? 'Wohin' : 'Sent to', toThem ? m.recipient_email : to],
  ];
  const next = toThem
    ? (de ? `Wir schicken den Gutschein als PDF direkt an ${esc(m.recipient_email)}${m.message ? ', mit deiner Nachricht' : ''}. Den Gutscheincode findet nur die beschenkte Person darin, damit er nicht zweimal eingelöst werden kann.`
          : `We'll send the voucher as a PDF straight to ${esc(m.recipient_email)}${m.message ? ', with your message' : ''}. Only the person receiving it will find the voucher code inside, so it can't be used twice.`)
    : (de ? 'Deinen Gutschein mit dem Code bekommst du in Kürze in einer eigenen E-Mail als PDF, zum Ausdrucken oder Weiterschicken.'
          : 'Your voucher with its code follows shortly in a separate email as a PDF, ready to print or pass on.');
  const table = rows.map(([k, v]) => `<tr><td style="padding:4px 14px 4px 0;color:#777">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`).join('');
  const intro = de
    ? `Hallo${name ? ` ${esc(name)}` : ''},<br><br>vielen Dank für deinen Gutscheinkauf bei <b>Twiggli</b>! Deine Zahlung ist angekommen 🎁`
    : `Hi${name ? ` ${esc(name)}` : ''},<br><br>thank you for buying a <b>Twiggli</b> voucher! Your payment has arrived 🎁`;
  const outro = de
    ? `${next}<br><br>Fragen? Antworte einfach auf diese E-Mail.<br><br>Liebe Grüße 💛<br>Jirel von <b>Twiggli</b>`
    : `${next}<br><br>Questions? Just reply to this email.<br><br>Warm regards 💛<br>Jirel from <b>Twiggli</b>`;
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  await mail.sendMail({
    from: { name: 'Twiggli', address: SENDER },
    replyTo: SENDER,
    to,
    subject: de ? `Danke für deinen Twiggli-Gutschein (${amount}) 🎁` : `Thank you for your Twiggli voucher (${amount}) 🎁`,
    text: `${de ? 'Danke für deinen Gutscheinkauf bei Twiggli.' : 'Thank you for buying a Twiggli voucher.'}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${next.replace(/<[^>]+>/g, '')}\n\n💛 Jirel, Twiggli`,
    html: `<div style="font-family:Tahoma,sans-serif;font-size:14px;line-height:1.5">${intro}<table style="margin:14px 0;font-size:14px">${table}</table>${outro}</div>`,
  });
};

// ── Redeeming a voucher ──
// Codes are kept only as an HMAC with a server-side key (_config/vouchers,
// which no browser can read), so neither the repo nor the database holds
// a usable code. New codes are entered by an admin (voucherCreate) or,
// later, made by the purchase itself.
const voucherKey = async () => {
  const ref = getFirestore().doc('_config/vouchers');
  const snap = await ref.get();
  if (snap.exists && snap.data().key) return snap.data().key;
  const key = randomBytes(32).toString('hex');
  await ref.set({ key }, { merge: true });
  return key;
};
const cleanCode = (code) => String(code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeHash = async (raw) => createHmac('sha256', await voucherKey()).update(raw).digest('hex');
const HOLD_MS = 7 * 24 * 3600 * 1000;
/** Cents of a voucher held for open requests (holds older than 7 days lapse). */
const heldCents = (v) => Object.values(v.holds ?? {}).reduce((n, h) => n + (Date.now() - (h?.at ?? 0) < HOLD_MS ? (h?.cents ?? 0) : 0), 0);

/** The voucher behind a code, or why it can't be used at this host. */
const lookupVoucher = async (code, hostSlug) => {
  const raw = cleanCode(code);
  if (raw.length < 8 || raw.length > 20) return { error: 'invalid' };
  const hash = await codeHash(raw);
  const ref = getFirestore().doc(`voucherCodes/${hash}`);
  let snap = await ref.get();
  if (!snap.exists) {
    // Vouchers sold by hand are listed in the encrypted VOUCHER_SEEDS
    // secret ("CODE|amount|valid until|order", one per line or ";"), never
    // in the repo; the first use puts the code in the database.
    const seed = String(process.env.VOUCHER_SEEDS ?? '').split(/[;\n]/).map((l) => l.split('|').map((x) => x.trim()))
      .find(([c]) => cleanCode(c) === raw);
    if (seed) {
      const [, amount, validUntil, order, host] = seed;
      await ref.create({
        amount: Number(amount), balance: Number(amount), validUntil: validUntil ?? '', ref: order ?? '', hostSlug: host ?? '',
        last4: raw.slice(-4), createdBy: 'seed', createdAt: FieldValue.serverTimestamp(), redemptions: [],
      }).catch(() => {});
      snap = await ref.get();
    }
  }
  if (!snap.exists) return { error: 'invalid' };
  const v = snap.data();
  if (v.validUntil && v.validUntil < new Date().toISOString().slice(0, 10)) return { error: 'expired' };
  // Amounts held for requests the host hasn't answered yet (7 days at most,
  // as long as Stripe keeps a card hold) are not available meanwhile.
  const balance = Math.round(((v.balance ?? 0) * 100) - heldCents(v)) / 100;
  if (!(balance > 0)) return { error: 'used' };
  if (v.hostSlug && hostSlug && v.hostSlug !== hostSlug) return { error: 'host', host: v.hostSlug };
  return { ok: true, hash, balance, validUntil: v.validUntil ?? '', hostSlug: v.hostSlug ?? '', ref: v.ref ?? '' };
};

const COMPANY = 'Twiggli UG (haftungsbeschränkt) · Rodenkirchener Str. 147 · 50997 Köln';
const isoDay = (d) => d.toISOString().slice(0, 10);

/** The voucher email, with its PDF and our icon, from our public address. */
const sendVoucherMail = async (to, parts, pdf, code) => { // pdf null: no attachment
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  await mail.sendMail({
    from: { name: 'Twiggli', address: SENDER }, replyTo: SENDER, to,
    // Jirel gets a hidden copy of every voucher email (05.11.26).
    ...(INBOX && to !== INBOX ? { bcc: INBOX } : {}),
    subject: parts.subject, text: parts.text, html: parts.html,
    attachments: [
      { filename: 'twiggli.png', content: parts.icon, cid: 'twiggli-icon' },
      ...(pdf ? [{ filename: `Twiggli-${code}.pdf`, content: pdf, contentType: 'application/pdf' }] : []),
    ],
  });
};

/** The language we write to each voucher host in (as in our emails to
 *  them); everyone else gets German. */
const HOST_LANG = {
  anne: 'en', studio32: 'en', pia: 'en', 'fave-studio': 'en', angelo: 'en', ana: 'en', pigi: 'en',
  'lucille-guder': 'fr',
};

/** "Someone bought a voucher for you": a short, warm note to the host of a
 *  host voucher, with who bought it, who it is for, and the code (Jirel,
 *  08.11.26). General vouchers have no host yet, so nobody is told until
 *  one is used for a booking. Sent once per payment, Jirel in BCC. */
const notifyVoucherHost = async (piId, m, code, amount) => {
  const slug = String(m.host_slug ?? '');
  if (!SLUG.test(slug)) return;
  const ref = getFirestore().doc(`vouchers/${piId}`);
  if ((await ref.get()).data()?.hostNotifiedAt) return;
  const who = await hostContact(slug);
  if (!who) { console.error('voucher host: no email in the sheet for', slug); return; }
  const lang = HOST_LANG[slug] ?? 'de';
  const eur = (n) => (lang === 'en' ? `€${n % 1 ? n.toFixed(2) : n}` : `${(n % 1 ? n.toFixed(2) : String(n)).replace('.', ',')} €`);
  const keep = Math.round(amount * 85) / 100;
  const people = Number(m.people) || 1;
  const recipient = String(m.recipient ?? '').trim();
  const recipientFirst = recipient.split(/\s+/)[0];
  const t = {
    de: {
      subject: 'Glückwunsch! Jemand hat einen Gutschein für dich gekauft 🎁',
      hi: `Hey ${who.firstName}!`, congrats: 'Glückwunsch! 🎉 Gerade hat jemand einen <b>Twiggli</b>-Gutschein für deinen Workshop gekauft:',
      rows: [['Workshop', m.workshop], ['Gekauft von', m.buyer_name], ['Für', recipient], ['Plätze', String(people)], ['Wert', eur(amount)], ['Gutscheincode', code]],
      next: `Du musst jetzt nichts tun. ${recipientFirst || 'Die Person'} löst den Gutschein beim Buchen auf deiner <b>Twiggli</b>-Seite ein. Sobald das passiert, sage ich dir Bescheid: Die Buchung kommt dann per E-Mail und in dein Dashboard, markiert mit „mit Gutschein bezahlt“, und du bestätigst sie wie gewohnt.`,
      pay: `Nach dem Workshop bekommst du den Betrag bis zum 10. des Folgemonats, abzüglich 15 % Provision (bei ${eur(amount)} sind das ${eur(keep)} für dich).`,
    },
    en: {
      subject: 'Congrats! Someone bought a voucher for you 🎁',
      hi: `Hey ${who.firstName}!`, congrats: 'Congrats! 🎉 Someone just bought a <b>Twiggli</b> voucher for your workshop:',
      rows: [['Workshop', m.workshop], ['Bought by', m.buyer_name], ['For', recipient], ['Places', String(people)], ['Value', eur(amount)], ['Voucher code', code]],
      next: `There's nothing you need to do now. ${recipientFirst || 'They'} redeem${recipientFirst ? 's' : ''} the voucher when booking on your <b>Twiggli</b> page. As soon as that happens, I'll let you know: the booking arrives by email and in your dashboard, marked "paid with voucher", and you confirm it as usual.`,
      pay: `After the workshop, you get the amount by the 10th of the following month, minus 15% commission (for ${eur(amount)} that's ${eur(keep)} for you).`,
    },
    fr: {
      subject: "Félicitations ! Quelqu'un a acheté un bon cadeau pour toi 🎁",
      hi: `Coucou ${who.firstName} !`, congrats: "Félicitations ! 🎉 Quelqu'un vient d'acheter un bon cadeau <b>Twiggli</b> pour ton atelier :",
      rows: [['Atelier', m.workshop], ['Acheté par', m.buyer_name], ['Pour', recipient], ['Places', String(people)], ['Valeur', eur(amount)], ['Code', code]],
      next: `Tu n'as rien à faire pour l'instant. ${recipientFirst || 'La personne'} utilisera le bon en réservant sur ta page <b>Twiggli</b>. Dès que c'est le cas, je te préviens : la réservation arrive par e-mail et dans ton tableau de bord, marquée « payé avec un bon », et tu la confirmes comme d'habitude.`,
      pay: `Après l'atelier, tu reçois le montant avant le 10 du mois suivant, moins 15 % de commission (pour ${eur(amount)}, cela fait ${eur(keep)} pour toi).`,
    },
  }[lang];
  const rows = t.rows.filter(([, v]) => String(v ?? '').trim());
  const table = rows.map(([k, v]) => `<tr><td style="padding:4px 14px 4px 0;color:#777">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`).join('');
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  await mail.sendMail({
    from: { name: 'Twiggli', address: SENDER }, replyTo: SENDER, to: who.emails,
    ...(INBOX ? { bcc: INBOX } : {}),
    subject: t.subject,
    text: `${t.hi}\n\n${t.congrats.replace(/<[^>]+>/g, '')}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${t.next.replace(/<[^>]+>/g, '')}\n\n${t.pay}\n\nCheers,\nJirel`,
    html: `<div style="font-family:Tahoma,sans-serif;font-size:14px;line-height:1.5">${esc(t.hi)}<br><br>${t.congrats}<table style="margin:14px 0;font-size:14px">${table}</table>${t.next}<br><br>${t.pay}<br><br>Cheers,<br>Jirel</div>`,
  });
  await ref.set({ hostNotifiedAt: FieldValue.serverTimestamp(), hostNotifiedTo: who.emails.length }, { merge: true });
};

/** A paid voucher: a new code (kept only as its HMAC), its PDF, and the
 *  email to the buyer, or straight to the person it is for. Returns who
 *  got it: 'buyer' or 'recipient'. */
const issueVoucher = async (pi, m, buyer) => {
  const amount = pi.amount / 100;
  const today = new Date();
  const until = new Date(today); until.setFullYear(until.getFullYear() + 3);
  const validUntil = isoDay(until);
  let code = '';
  for (let i = 0; i < 5 && !code; i++) {
    const c = newVoucherCode();
    try {
      await getFirestore().doc(`voucherCodes/${await codeHash(cleanCode(c))}`).create({
        amount, balance: amount, validUntil, ref: m.ref ?? '', hostSlug: m.host_slug ?? '',
        last4: cleanCode(c).slice(-4), paymentIntent: pi.id, createdBy: 'purchase', createdAt: FieldValue.serverTimestamp(), redemptions: [],
      });
      code = c;
    } catch { /* taken: draw again */ }
  }
  if (!code) throw new Error('no free code');
  const de = String(m.lang ?? '').startsWith('de');
  // How it was paid, as the buyer will recognise it.
  let payment = de ? 'Online bezahlt (Stripe)' : 'Paid online (Stripe)';
  try {
    if (pi.payment_method) {
      const r = await stripe(STRIPE_SECRET_KEY.value(), `payment_methods/${pi.payment_method}`);
      const pm = await r.json();
      if (r.ok && pm.card) payment = `${String(pm.card.brand).replace(/^\w/, (x) => x.toUpperCase())} •••• ${pm.card.last4}${pm.card.wallet?.type ? ` (${pm.card.wallet.type.replace('_', ' ')})` : ''}`;
      else if (r.ok && pm.type) payment = pm.type.replace(/_/g, ' ').replace(/^\w/, (x) => x.toUpperCase());
    }
  } catch { /* keep the plain label */ }
  const host = m.host_slug ? m.host : '';
  const pdf = await voucherPdf({
    lang: m.lang, amount, code, validUntil, date: isoDay(today), order: String(m.ref ?? '').toUpperCase(),
    host, workshop: m.workshop, recipient: m.recipient, message: m.message, company: COMPANY,
  });
  const toThem = m.deliver_to === 'recipient' && isEmail(m.recipient_email);
  const common = { lang: m.lang, buyerName: m.buyer_name, amount, code, validUntil, order: String(m.ref ?? '').toUpperCase(), date: isoDay(today), payment, host, site: SITE, company: COMPANY };
  if (toThem) {
    await sendVoucherMail(m.recipient_email, voucherMail({ ...common, gift: true, firstName: String(m.recipient ?? '').trim().split(/\s+/)[0], message: m.message }), pdf, code);
    // The buyer's copy: the order, without the code or the PDF.
    await sendVoucherMail(buyer, voucherMail({ ...common, gift: false, sentTo: m.recipient_email, message: m.message, firstName: String(m.buyer_name ?? '').trim().split(/\s+/)[0] }), null, code);
  } else {
    await sendVoucherMail(buyer, voucherMail({ ...common, gift: false, firstName: String(m.buyer_name ?? '').trim().split(/\s+/)[0] }), pdf, code);
  }
  await getFirestore().doc(`vouchers/${pi.id}`).update({ pdfSent: true, codeLast4: cleanCode(code).slice(-4), sentTo: toThem ? m.recipient_email : buyer });
  try { await notifyVoucherHost(pi.id, m, code, amount); } catch (err) { console.error('voucher host note failed', pi.id, err?.message); }
  return toThem ? 'recipient' : 'buyer';
};

/** A test voucher email to Jirel's own inbox only, to see what buyers
 *  get: ?lang=de|en and &kind=buyer|gift. The code in it is not stored,
 *  so it can't be redeemed. At most one a minute. */
export const voucherPreview = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 1 }, async (req, res) => {
  const page = (msg) => res.status(200).set('Content-Type', 'text/html; charset=utf-8')
    .send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:system-ui;padding:40px;max-width:520px;margin:auto"><h2>Twiggli</h2><p>${msg}</p></body>`);
  const ref = getFirestore().doc('_config/voucherPreview');
  const last = (await ref.get()).data()?.at ?? 0;
  if (Date.now() - last < 60000) return page('Bitte eine Minute warten, dann noch einmal.');
  await ref.set({ at: Date.now() });
  const lang = req.query.lang === 'en' ? 'en' : 'de';
  const gift = req.query.kind === 'gift';
  const today = new Date(); const until = new Date(today); until.setFullYear(until.getFullYear() + 3);
  const code = 'TW-TEST-0000';
  const v = {
    lang, amount: 50, code, validUntil: isoDay(until), date: isoDay(today), order: 'VC-TEST', company: COMPANY,
    recipient: gift ? 'Lena' : '', message: gift ? (lang === 'de' ? 'Alles Liebe zum Geburtstag! Such dir was Schönes aus.' : 'Happy birthday! Pick something lovely.') : '',
  };
  const pdf = await voucherPdf({ ...v, test: true });
  const base = { ...v, test: true, buyerName: 'Jirel', payment: 'Visa •••• 4242', site: SITE };
  if (gift) {
    // As if Jirel had paid with Lena as the recipient: Lena's voucher, and
    // Jirel's order confirmation without the code. Both to Jirel's inbox.
    await sendVoucherMail(INBOX, voucherMail({ ...base, gift: true, firstName: 'Lena' }), pdf, code);
    await sendVoucherMail(INBOX, voucherMail({ ...base, gift: false, firstName: 'Jirel', sentTo: 'lena@example.com' }), null, code);
  } else {
    await sendVoucherMail(INBOX, voucherMail({ ...base, gift: false, firstName: 'Jirel' }), pdf, code);
  }
  return page(gift
    ? (lang === 'de' ? 'Gesendet: zwei E-Mails sind unterwegs in dein Postfach, Lenas Gutschein und deine Bestellbestätigung ohne Code.' : 'Sent: two emails are on their way to your inbox, Lena’s voucher and your order confirmation without the code.')
    : (lang === 'de' ? 'Gesendet: deine Bestellbestätigung mit dem Gutschein ist unterwegs in dein Postfach.' : 'Sent: your order confirmation with the voucher is on its way to your inbox.'));
});

/** An admin enters a voucher sold by hand (its PDF made outside the site). */
export const voucherCreate = onRequest({ region: 'europe-west3', maxInstances: 2, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email || !ADMINS.includes(email)) return res.status(403).json({ error: 'Admins only' });
  const raw = cleanCode(req.body?.code);
  const amount = Math.round(Number(req.body?.amount));
  const validUntil = String(req.body?.validUntil ?? '');
  if (raw.length < 8 || raw.length > 20 || !(amount > 0 && amount <= 2000) || !/^\d{4}-\d\d-\d\d$/.test(validUntil)) return res.status(400).json({ error: 'Bad voucher' });
  try {
    await getFirestore().doc(`voucherCodes/${await codeHash(raw)}`).create({
      amount, balance: amount, validUntil, hostSlug: text(req.body?.hostSlug, 80), ref: text(req.body?.ref, 40),
      last4: raw.slice(-4), createdBy: email, createdAt: FieldValue.serverTimestamp(), redemptions: [],
    });
  } catch { return res.status(409).json({ error: 'exists' }); }
  return res.status(200).json({ ok: true });
});

/** The booking form's "Redeem voucher": is this code good here? */
export const voucherCheck = onRequest({ region: 'europe-west3', maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const out = await lookupVoucher(req.body?.code, text(req.body?.hostSlug, 80));
  if (!out.ok) return res.status(200).json({ ok: false, error: out.error });
  return res.status(200).json({ ok: true, balance: out.balance, validUntil: out.validUntil });
});

export const formRequest = onRequest(
  { region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD, STRIPE_SECRET_KEY], maxInstances: 10, cors: false },
  async (req, res) => {
    if (!allow(req, res)) return;
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    if (body._honey) return res.status(200).json({ success: 'true' }); // bots fill the hidden field
    const subject = text(body._subject, 300) || 'Message from twiggli.com';
    const email = text(body.email, 200);
    // The visitor's fields, as sent: FormSubmit's own keys (_subject, …) left out.
    const fields = Object.fromEntries(
      Object.entries(body)
        .filter(([k, v]) => !k.startsWith('_') && v != null && String(v).trim() !== '')
        .slice(0, 60)
        .map(([k, v]) => [text(k, 80), String(v).slice(0, 4000)]),
    );
    if (!Object.keys(fields).length) return res.status(400).json({ success: 'false', message: 'Empty form' });

    // Spam bots fill every text field with a random run of letters
    // ("IhXiQPtVBBnIVtJwlowtCm", host application of 01.11.26): no spaces,
    // 10+ letters, case flipping back and forth. Two or more such fields
    // and it is a bot: kept in Firestore (marked spam), but nobody is mailed.
    const gibberish = (v) => /^[A-Za-z]{10,}$/.test(v) && (v.match(/[a-z][A-Z]|[A-Z][a-z]/g) ?? []).length >= 5;
    // Newsletter bots sign up Gmail addresses with dots scattered through
    // them ("an.u.la.fuw.51.6@gmail.com", 07.11.26): Gmail ignores dots, so
    // every variant reaches the same inbox and slips past filters. Three or
    // more dots with two or more one- or two-character pieces is never a
    // real person's way of writing their address.
    const dottedGmail = (e) => {
      const m = /^([^@]+)@(gmail|googlemail)\.com$/i.exec(e);
      if (!m) return false;
      const parts = m[1].split('.');
      return parts.length >= 4 && parts.filter((x) => x.length <= 2).length >= 2;
    };
    const signup = /newsletter signup/i.test(String(fields.Type ?? ''));
    const spam = (signup && dottedGmail(email))
      || Object.entries(fields).filter(([k, v]) => !/^(Type|Sent from|Language|Came from|Interested in)$/.test(k) && gibberish(String(v).trim())).length >= 2;
    if (spam) {
      await getFirestore().collection('formRequests').add({ subject, email, fields, origin: req.get('origin') ?? '', createdAt: FieldValue.serverTimestamp(), mailed: false, spam: true }).catch(() => {});
      return res.status(200).json({ success: 'true' });
    }

    // A voucher code in a booking: checked again here, so the email says
    // whether it is good, and the request is noted on the voucher.
    let voucherHash = '';
    if (fields['Voucher code']) {
      const v = await lookupVoucher(fields['Voucher code'], text(body._hostSlug, 80));
      fields['Voucher check'] = v.ok
        ? `VALID: €${v.balance} left, valid until ${v.validUntil}${v.ref ? `, order ${v.ref}` : ''}. Deduct it from the price and note it on the voucher.`
        : `NOT VALID (${v.error}). Do not accept it.`;
      if (v.ok) voucherHash = v.hash;
    }

    // The same person sending the same request again within a day (people
    // resend when unsure it went through): saved, but nobody is emailed twice.
    let duplicateOf = '';
    if (isEmail(email)) {
      const since = Date.now() - 24 * 3600 * 1000;
      const same = await getFirestore().collection('formRequests').where('email', '==', email).get();
      duplicateOf = same.docs.find((d) => d.data().subject === subject && (d.data().createdAt?.toMillis?.() ?? 0) > since)?.id ?? '';
    }

    // Saved first, so a request is never lost even if the email fails.
    const hostSlug = SLUG.test(String(body._hostSlug ?? '')) ? String(body._hostSlug) : '';
    const doc = await getFirestore().collection('formRequests').add({
      subject, email, fields, origin: req.get('origin') ?? '', createdAt: FieldValue.serverTimestamp(), mailed: false,
      ...(duplicateOf ? { duplicateOf } : {}),
      // A request for one host lands in their Messages (hostInbox).
      ...(hostSlug && !duplicateOf ? { hostSlug, status: 'pending', thread: [] } : {}),
    });
    if (duplicateOf) return res.status(200).json({ success: 'true', id: doc.id, duplicate: true });
    if (voucherHash) {
      await getFirestore().doc(`voucherCodes/${voucherHash}`).update({
        redemptions: FieldValue.arrayUnion({ requestId: doc.id, hostSlug: text(body._hostSlug, 80), at: Date.now(), status: 'requested' }),
      }).catch(() => {});
    }

    // Paying with a voucher on a request (07.11.26, as Luma's coupon): the
    // voucher is held, and anything it doesn't cover is held on the guest's
    // card (Stripe, Twiggli's account, captured later). Both are only taken
    // once the host accepts (hostReply); a decline releases them, and an
    // unanswered hold lapses after 7 days.
    const totalCents = Math.round(Number(body._totalCents));
    if (body._voucherHold === true && voucherHash && hostSlug && totalCents > 0 && totalCents < 1000000) {
      const vRef = getFirestore().doc(`voucherCodes/${voucherHash}`);
      let voucherCents = 0;
      await getFirestore().runTransaction(async (t) => {
        const vd = (await t.get(vRef)).data() ?? {};
        voucherCents = Math.max(0, Math.min(totalCents, Math.round((vd.balance ?? 0) * 100) - heldCents(vd)));
        if (voucherCents) t.update(vRef, { [`holds.${doc.id}`]: { cents: voucherCents, at: Date.now() } });
      });
      const chargeCents = totalCents - voucherCents;
      const eurs = (c) => `€${(c / 100).toFixed(2).replace(/\.00$/, '')}`;
      fields.Payment = chargeCents
        ? `Voucher ${eurs(voucherCents)} held + ${eurs(chargeCents)} held on the guest's card (Twiggli's Stripe). Both are taken only when the host accepts.`
        : `Voucher ${eurs(voucherCents)} held: covers the whole price (${eurs(totalCents)}). Taken only when the host accepts.`;
      await doc.update({ fields, hold: { voucherHash, voucherCents, totalCents, chargeCents, at: Date.now() }, ...(chargeCents ? { status: 'awaiting_payment' } : {}) });
      if (chargeCents) {
        const de = String(fields.Language ?? '').startsWith('de');
        const p = new URLSearchParams();
        p.set('mode', 'payment');
        p.set('locale', de ? 'de' : 'en');
        if (isEmail(email)) p.set('customer_email', email);
        p.set('success_url', `${SITE}${de ? '/de' : ''}/booking/confirmed/?hold={CHECKOUT_SESSION_ID}`);
        p.set('cancel_url', typeof body._back === 'string' && body._back.startsWith(SITE) ? body._back.slice(0, 400) : `${SITE}${de ? '/de' : ''}/`);
        p.set('line_items[0][quantity]', '1');
        p.set('line_items[0][price_data][currency]', 'eur');
        p.set('line_items[0][price_data][unit_amount]', String(chargeCents));
        p.set('line_items[0][price_data][product_data][name]', `${text(fields.Workshop, 120) || 'Workshop'}${fields.Date ? ` · ${text(fields.Date, 40)}` : ''}`);
        p.set('line_items[0][price_data][product_data][description]', de
          ? `Rest nach Gutschein (${eurs(voucherCents)}). Wird erst abgebucht, wenn der Gastgeber bestätigt.`
          : `Rest after your voucher (${eurs(voucherCents)}). Only charged once the host confirms.`);
        p.set('payment_intent_data[capture_method]', 'manual');
        p.set('payment_intent_data[description]', `Twiggli request ${doc.id}: ${text(fields.Workshop, 80)} (${text(fields.Name, 60)})`);
        for (const [k, v] of Object.entries({ kind: 'twiggli voucher request', request_id: doc.id, host: hostSlug })) { p.set(`metadata[${k}]`, v); p.set(`payment_intent_data[metadata][${k}]`, v); }
        const r = await stripe(STRIPE_SECRET_KEY.value(), 'checkout/sessions', p);
        const sj = await r.json();
        if (!r.ok) {
          console.error('hold checkout', sj?.error?.message);
          await vRef.update({ [`holds.${doc.id}`]: FieldValue.delete() }).catch(() => {});
          await doc.update({ status: 'payment_failed' });
          return res.status(502).json({ success: 'false', message: 'payment' });
        }
        await doc.update({ 'hold.session': sj.id });
        // Jirel and the guest hear about it once the card is held (holdConfirm).
        return res.status(200).json({ success: 'true', id: doc.id, url: sj.url });
      }
    }

    await deliverRequest(doc, subject, email, fields);
    return res.status(200).json({ success: 'true', id: doc.id });
  },
);

/** A saved request reaches people: the guest's "we got it" email and the
 *  note to Jirel's inbox (marked mailed). */
const deliverRequest = async (doc, subject, email, fields) => {
    // The guest hears that their request arrived (Jirel, 30.10.26), so they
  // don't send it twice. Only for requests, not for notes like vouchers.
  if (isEmail(email) && /request/i.test(String(fields.Type ?? '')) && !/voucher/i.test(String(fields.Type ?? ''))) {
    try { await confirmGuest(email, fields); } catch (err) { console.error('guest confirmation failed', doc.id, err?.message); }
  }
  // A paid voucher: the buyer's confirmation, checked against Stripe.
  if (/voucher paid/i.test(String(fields.Type ?? ''))) {
    try { await confirmVoucherBuyer(String(fields['Stripe PaymentIntent'] ?? '')); } catch (err) { console.error('voucher confirmation failed', doc.id, err?.message); }
  }

  try {
    const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
    const rows = Object.entries(fields)
      .map(([k, v]) => `<tr><th align="left" valign="top" style="padding:6px 12px;background:#f4f4f4">${esc(k)}</th><td style="padding:6px 12px;white-space:pre-wrap">${esc(v)}</td></tr>`)
      .join('');
    await mail.sendMail({
      from: { name: 'Twiggli Formular', address: INBOX },
      to: INBOX,
      ...(isEmail(email) ? { replyTo: email } : {}),
      subject,
      text: Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n'),
      html: `<table style="font-family:Tahoma,sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`,
    });
    await doc.update({ mailed: true });
  } catch (err) {
    // Still saved in Firestore (formRequests, mailed: false).
    console.error('formRequest mail failed', doc.id, err?.message);
  }
};

/** Back from Stripe after a voucher request with a rest to pay: once the
 *  card is held, the request goes out like any other (deliverRequest). */
export const holdConfirm = onRequest({ ...OPTS, secrets: [STRIPE_SECRET_KEY, GMAIL_APP_PASSWORD] }, async (req, res) => {
  if (!allow(req, res)) return;
  const sid = String(req.body?.session_id ?? '');
  if (!/^cs_(live|test)_\w{10,200}$/.test(sid)) return res.status(400).json({ error: 'bad-request' });
  const snap = await getFirestore().collection('formRequests').where('hold.session', '==', sid).limit(1).get();
  if (snap.empty) return res.status(404).json({ error: 'not-found' });
  const doc = snap.docs[0].ref;
  const x = snap.docs[0].data();
  const out = (status) => ({ status, workshop: x.fields?.Workshop ?? '', date: x.fields?.Date ?? '', time: x.fields?.Time ?? '', people: x.fields?.People ?? '', voucher: (x.hold?.voucherCents ?? 0) / 100, held: (x.hold?.chargeCents ?? 0) / 100 });
  if (x.status !== 'awaiting_payment') return res.status(200).json(out('held'));
  const r = await stripe(STRIPE_SECRET_KEY.value(), `checkout/sessions/${sid}?expand[]=payment_intent`);
  const s = await r.json();
  if (!r.ok) return res.status(502).json({ error: 'stripe' });
  if (s.status !== 'complete' || s.payment_intent?.status !== 'requires_capture') return res.status(200).json(out('unpaid'));
  const first = await getFirestore().runTransaction(async (t) => {
    const cur = (await t.get(doc)).data();
    if (cur.status !== 'awaiting_payment') return false;
    t.update(doc, { status: 'pending', 'hold.paymentIntent': s.payment_intent.id });
    return true;
  });
  if (first) await deliverRequest(doc, x.subject, x.email, x.fields);
  return res.status(200).json(out('held'));
});

/** On the host's answer: accepted takes the voucher and charges the held
 *  card; declined releases both. Throws when the card hold has lapsed. */
const settleHold = async (ref, x, accepted) => {
  const h = x.hold;
  if (!h || h.settled) return;
  const pi = h.paymentIntent;
  if (pi) {
    const r = await stripe(STRIPE_SECRET_KEY.value(), `payment_intents/${pi}/${accepted ? 'capture' : 'cancel'}`, new URLSearchParams());
    if (!r.ok && accepted) { const e = await r.json().catch(() => ({})); throw new Error(e?.error?.message || 'capture failed'); }
  }
  const vRef = getFirestore().doc(`voucherCodes/${h.voucherHash}`);
  await getFirestore().runTransaction(async (t) => {
    const vd = (await t.get(vRef)).data();
    if (vd && accepted && h.voucherCents) {
      t.update(vRef, {
        balance: Math.max(0, Math.round((vd.balance ?? 0) * 100) - h.voucherCents) / 100,
        [`holds.${ref.id}`]: FieldValue.delete(),
        redemptions: FieldValue.arrayUnion({ requestId: ref.id, hostSlug: x.hostSlug, amount: h.voucherCents / 100, at: Date.now(), status: 'redeemed' }),
      });
    } else if (vd) t.update(vRef, { [`holds.${ref.id}`]: FieldValue.delete() });
    t.update(ref, { 'hold.settled': accepted ? 'taken' : 'released', 'hold.settledAt': Date.now() });
  });
};

/** The key that signs Approve links: made once, kept in Firestore
 *  (_config/hostAccess), which no browser can read (firestore.rules). */
const approveKey = async () => {
  const ref = getFirestore().doc('_config/hostAccess');
  const snap = await ref.get();
  if (snap.exists && snap.data().key) return snap.data().key;
  const key = randomBytes(32).toString('hex');
  await ref.set({ key }, { merge: true });
  return key;
};
const sign = (key, email, slug) => createHmac('sha256', key).update(`${email}\n${slug}`).digest('hex');

/** Who is calling, from the Firebase sign-in token the page sends. */
const caller = async (req) => {
  const m = /^Bearer (.+)$/.exec(req.get('authorization') ?? '');
  if (!m) return null;
  try {
    const t = await getAuth().verifyIdToken(m[1]);
    return t.email && t.email_verified ? t.email.toLowerCase() : null;
  } catch { return null; }
};

const grant = (email, slug) =>
  getFirestore().doc(`hostMembers/${email}`).set({ slugs: FieldValue.arrayUnion(slug), updatedAt: FieldValue.serverTimestamp() }, { merge: true });

export const hostClaim = onRequest(
  { region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 5, cors: false },
  async (req, res) => {
    if (!allow(req, res)) return;
    const email = await caller(req);
    if (!email) return res.status(401).json({ error: 'Not signed in' });
    // The dashboard asks this instead of carrying the admin list in the page.
    if (req.body?.whoami) return res.status(200).json({ admin: ADMINS.includes(email) });
    if (req.body?.auto) {
      let slugs = [];
      try { slugs = await knownSlugs(email); } catch (err) { console.error('host sheet', err?.message); }
      for (const s of slugs) await grant(email, s);
      return res.status(200).json({ status: slugs.length ? 'granted' : 'unknown', slugs });
    }
    const slug = String(req.body?.slug ?? '');
    const name = text(req.body?.name, 120);
    const note = text(req.body?.note, 600);
    if (!SLUG.test(slug)) return res.status(400).json({ error: 'Bad page' });
    if (ADMINS.includes(email)) {
      await grant(email, slug);
      return res.status(200).json({ status: 'granted' });
    }
    const db = getFirestore();
    // A personal invite link Jirel emailed to the host: the page is theirs at
    // once, the first time it is used.
    const invite = String(req.body?.invite ?? '');
    if (invite) {
      const want = Buffer.from(sign(await approveKey(), 'invite', slug), 'hex');
      const got = /^[0-9a-f]{64}$/.test(invite) ? Buffer.from(invite, 'hex') : Buffer.alloc(0);
      if (got.length !== want.length || !timingSafeEqual(want, got)) return res.status(403).json({ error: 'Bad invite' });
      const owner = db.doc(`pageOwners/${slug}`);
      const taken = await owner.get();
      if (taken.exists && taken.data().email !== email) return res.status(409).json({ status: 'taken' });
      await owner.set({ email, claimedAt: FieldValue.serverTimestamp() });
      await grant(email, slug);
      try {
        await mailJirel({ subject: `Host account: ${slug} claimed by ${email}`, text: `${name || email} (${email}) opened their invite link and now manages "${slug}".` });
      } catch (err) { console.error('invite note failed', err?.message); }
      return res.status(200).json({ status: 'granted' });
    }
    const claimRef = db.doc(`hostClaims/${email}__${slug}`);
    const old = await claimRef.get();
    if (old.exists && old.data().status === 'pending') return res.status(200).json({ status: 'pending' });
    await claimRef.set({ email, slug, name, note, status: 'pending', createdAt: FieldValue.serverTimestamp() });
    const link = `${FUNCTIONS_URL}/hostApprove?e=${encodeURIComponent(email)}&s=${slug}&k=${sign(await approveKey(), email, slug)}`;
    try {
      await mailJirel({
        subject: `Host account: ${name || email} wants to edit "${slug}"`,
        replyTo: email,
        text: `${name || email} (${email}) wants to edit the page "${slug}".${note ? `\n\nNote: ${note}` : ''}\n\nApprove: ${link}\n\nIgnore this email to say no.`,
        html: `<div style="font-family:Tahoma,sans-serif;font-size:15px"><p><b>${esc(name || email)}</b> (${esc(email)}) wants to edit the page <b>${esc(slug)}</b> on twiggli.com.</p>${note ? `<p>Note: ${esc(note)}</p>` : ''}<p><a href="${link}" style="display:inline-block;background:#1f6f43;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Approve</a></p><p style="color:#777">Not them? Just ignore this email: nothing happens.</p></div>`,
      });
    } catch (err) { console.error('hostClaim mail failed', err?.message); }
    return res.status(200).json({ status: 'pending' });
  },
);

export const hostApprove = onRequest({ region: 'europe-west3', maxInstances: 5 }, async (req, res) => {
  const email = String(req.query.e ?? '').toLowerCase();
  const slug = String(req.query.s ?? '');
  const k = String(req.query.k ?? '');
  const page = (msg) => res.status(200).set('Content-Type', 'text/html; charset=utf-8')
    .send(`<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:Tahoma,sans-serif;max-width:520px;margin:60px auto;padding:0 16px"><h2>Twiggli host accounts</h2><p>${msg}</p></body>`);
  if (!SLUG.test(slug) || !isEmail(email) || !/^[0-9a-f]{64}$/.test(k)) return page('This link is not valid.');
  const want = Buffer.from(sign(await approveKey(), email, slug), 'hex');
  if (!timingSafeEqual(want, Buffer.from(k, 'hex'))) return page('This link is not valid.');
  // Opening the link only asks: mail scanners open links on their own, so
  // access is given by the button (a POST), never by the visit.
  if (req.method !== 'POST') {
    return page(`Give <b>${esc(email)}</b> access to edit <b>${esc(slug)}</b>?<form method="post"><button style="font-size:16px;background:#1f6f43;color:#fff;border:0;padding:10px 18px;border-radius:8px;cursor:pointer">Approve</button></form>`);
  }
  await grant(email, slug);
  await getFirestore().doc(`hostClaims/${email}__${slug}`).set({ status: 'approved', approvedAt: FieldValue.serverTimestamp() }, { merge: true });
  return page(`Approved: <b>${esc(email)}</b> can now edit <b>${esc(slug)}</b>. They see it the next time they open their account (twiggli.com/host/account/). Let them know it's ready.`);
});

/** Requests for the pages the caller manages (Jirel: any page she asks for). */
const mySlugs = async (email) => ((await getFirestore().doc(`hostMembers/${email}`).get()).data()?.slugs ?? []);

export const hostInbox = onRequest({ region: 'europe-west3', maxInstances: 10, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const slug = String(req.body?.slug ?? '');
  if (!SLUG.test(slug) || !(ADMINS.includes(email) || (await mySlugs(email)).includes(slug))) return res.status(403).json({ error: 'Not your page' });
  // Sorted here rather than in the query, which would need a composite index.
  const snap = await getFirestore().collection('formRequests').where('hostSlug', '==', slug).get();
  // "About the guest", as on Airbnb: how often they asked on Twiggli, how
  // they found us and in which language (only counts, never other hosts').
  const emails = [...new Set(snap.docs.map((d) => d.data().email).filter(isEmail))].slice(0, 30);
  const asked = {};
  await Promise.all(emails.map(async (e) => {
    const n = await getFirestore().collection('formRequests').where('email', '==', e).count().get().catch(() => null);
    asked[e] = n?.data().count ?? 1;
  }));
  // A voucher request still on Stripe's page (or abandoned there) is not a request yet.
  const items = snap.docs.filter((d) => !['awaiting_payment', 'payment_failed'].includes(d.data().status)).map((d) => {
    const x = d.data();
    return {
      id: d.id, subject: x.subject, fields: x.fields, status: x.status, thread: x.thread ?? [], createdAt: x.createdAt?.toMillis?.() ?? 0,
      ...(x.hold ? { hold: { voucher: (x.hold.voucherCents ?? 0) / 100, card: (x.hold.chargeCents ?? 0) / 100, settled: x.hold.settled ?? '' } } : {}),
      guest: { requests: asked[x.email] ?? 1, cameFrom: String(x.fields?.['Came from'] ?? ''), lang: String(x.fields?.Language ?? '') },
    };
  }).sort((a, b) => b.createdAt - a.createdAt).slice(0, 200);
  return res.status(200).json({ items });
});

// offer: another date and/or price for the guest (Airbnb's "special offer");
// message: a note without changing the request's status.
const ACTIONS = { accept: 'accepted', decline: 'declined', suggest: 'suggested', offer: 'offered', message: '' };

export const hostReply = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD, STRIPE_SECRET_KEY], maxInstances: 10, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const id = String(req.body?.id ?? '');
  const action = String(req.body?.action ?? '');
  const message = text(req.body?.message, 2000);
  const when = text(req.body?.when, 120);
  const price = Math.round(Number(req.body?.price) * 100) / 100;
  const reason = text(req.body?.reason, 80);
  if (!/^[A-Za-z0-9]{10,40}$/.test(id) || !(action in ACTIONS)) return res.status(400).json({ error: 'Bad request' });
  if (action === 'message' && !message) return res.status(400).json({ error: 'Empty message' });
  const ref = getFirestore().doc(`formRequests/${id}`);
  const snap = await ref.get();
  const x = snap.data();
  if (!x?.hostSlug || !(ADMINS.includes(email) || (await mySlugs(email)).includes(x.hostSlug))) return res.status(403).json({ error: 'Not your request' });
  // A voucher request: accepting takes the voucher and charges the held card.
  if (x.hold && (action === 'accept' || action === 'decline')) {
    try { await settleHold(ref, x, action === 'accept'); } catch (err) {
      console.error('settleHold', id, err?.message);
      return res.status(409).json({ error: 'payment', message: 'The card hold has lapsed (7 days). Ask the guest to pay at the studio, or write to Jirel.' });
    }
  }
  const entry = { by: email, action, message, when, at: Date.now(),
    ...(action === 'offer' && price > 0 && price < 10000 ? { price } : {}), ...(action === 'decline' && reason ? { reason } : {}),
    // The offer in full: which workshop, when, for how many, at what total.
    ...(action === 'offer' ? {
      workshop: text(req.body?.workshop, 160),
      date: /^\d{4}-\d\d-\d\d$/.test(String(req.body?.date ?? '')) ? String(req.body.date) : '',
      time: /^\d\d:\d\d$/.test(String(req.body?.time ?? '')) ? String(req.body.time) : '',
      people: Math.max(1, Math.min(500, Math.round(Number(req.body?.people) || 0))) || undefined,
      total: Number(req.body?.total) > 0 && Number(req.body?.total) < 100000 ? Math.round(Number(req.body.total) * 100) / 100 : undefined,
      extras: Array.isArray(req.body?.extras) ? req.body.extras.slice(0, 10).map((x) => ({ name: text(x?.name, 80), amt: Math.round(Number(x?.amt) * 100) / 100 })).filter((x) => x.amt > 0 && x.amt < 100000) : undefined,
    } : {}) };
  for (const k of Object.keys(entry)) if (entry[k] === undefined || entry[k] === '') delete entry[k];
  await ref.update({ ...(ACTIONS[action] ? { status: ACTIONS[action] } : {}), thread: FieldValue.arrayUnion(entry) });
  // Jirel sees every answer; the guest is NOT emailed automatically (she
  // decides about that), so she passes it on until then.
  try {
    const guest = x.fields?.Name || x.email || 'the guest';
    await mailJirel({
      subject: `Host ${ACTIONS[action] || 'wrote'}: ${x.subject}`,
      replyTo: isEmail(x.email) ? x.email : undefined,
      text: `${email} ${ACTIONS[action] || 'sent a message about'} the request from ${guest}.${when ? `\nSuggested time: ${when}` : ''}${entry.workshop ? `\nWorkshop: ${entry.workshop}` : ''}${entry.people ? `\nPeople: ${entry.people}` : ''}${entry.extras?.length ? `\nExtras: ${entry.extras.map((x) => `${x.name || 'extra'} €${x.amt}`).join(', ')}` : ''}${entry.total ? `\nOffered total: €${entry.total}` : ''}${entry.price ? ` (€${entry.price} per person)` : ''}${entry.reason ? `\nReason (not for the guest): ${entry.reason}` : ''}${message ? `\nMessage: ${message}` : ''}\n\nGuest: ${x.email || 'no email'}`,
    });
  } catch (err) { console.error('hostReply note failed', err?.message); }
  return res.status(200).json({ status: ACTIONS[action] });
});

/** Jirel only: every page's personal invite link, to email to the hosts. */
export const hostInviteLinks = onRequest({ region: 'europe-west3', maxInstances: 2, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email || !ADMINS.includes(email)) return res.status(403).json({ error: 'Admins only' });
  const slugs = (Array.isArray(req.body?.slugs) ? req.body.slugs : []).map(String).filter((s) => SLUG.test(s)).slice(0, 300);
  const key = await approveKey();
  const owners = await getFirestore().collection('pageOwners').get();
  const claimed = Object.fromEntries(owners.docs.map((d) => [d.id, d.data().email]));
  return res.status(200).json({ links: slugs.map((s) => ({ slug: s, invite: sign(key, 'invite', s), claimedBy: claimed[s] ?? '' })) });
});

// ── Dates hosts create in their dashboard ("Neuer Termin") ──────────────
// Saved in Firestore hostEvents; publicEvents hands the upcoming ones to the
// website build (scripts/fetch-host-edits.mjs), which turns them into
// bookable request dates on the host's page and in the calendar.

const REPEATS = ['once', 'weekly', 'biweekly', 'monthly'];
const CANCELS = ['24h', '7d', '14d', 'none', 'move']; // move: no refund, but can be moved to a later date
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const YMD = /^\d{4}-\d\d-\d\d$/;

/** The caller may edit this host page (or is Jirel). */
const mayEdit = async (email, slug) => ADMINS.includes(email) || (await mySlugs(email)).includes(slug);

/** A host's date, checked and trimmed; null when something is off. */
const cleanEvent = (b) => {
  const slug = String(b.slug ?? '');
  const date = String(b.date ?? '');
  const start = String(b.start ?? '');
  const end = String(b.end ?? '');
  const title = text(b.title, 120);
  if (!SLUG.test(slug) || !YMD.test(date) || !HHMM.test(start) || (end && !HHMM.test(end)) || !title) return null;
  const num = (v, max) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= 0 && n <= max ? n : null; };
  const until = String(b.until ?? '');
  return {
    slug, title, date, start, end,
    repeat: REPEATS.includes(b.repeat) ? b.repeat : 'once',
    until: YMD.test(until) ? until : '',
    // A video and/or photos: their page's own pictures, or files they
    // uploaded to Firebase Storage (hostMedia/<slug>/…).
    media: (Array.isArray(b.media) ? b.media : []).slice(0, 12)
      .map((m) => ({ type: m?.type === 'video' ? 'video' : 'photo', url: String(m?.url ?? '') }))
      .filter((m) => /^\/img\/hosts\/[a-z0-9-]+\.(jpg|png|webp)$/.test(m.url)
        || m.url.startsWith(`https://firebasestorage.googleapis.com/v0/b/`) && m.url.includes(`hostMedia%2F${slug}%2F`)),
    location: text(b.location, 160),
    description: String(b.description ?? '').slice(0, 3000),
    price: num(b.price, 5000),
    seats: num(b.seats, 500),
    // "Runs from X participants": below that the class is cancelled and
    // nobody pays (shown to guests on the date and in the request form).
    minGuests: num(b.minGuests, 500) || null,
    decideHours: num(b.decideHours, 336) ?? 48,
    approve: b.approve !== false,
    languages: text(b.languages, 60),
    cancel: CANCELS.includes(b.cancel) ? b.cancel : '7d',
    visibility: b.visibility === 'private' ? 'private' : 'public',
  };
};

export const hostEventSave = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 10, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const ev = cleanEvent(req.body ?? {});
  if (!ev) return res.status(400).json({ error: 'Please fill in title, date and time' });
  if (!(await mayEdit(email, ev.slug))) return res.status(403).json({ error: 'Not your page' });
  // As on Luma: no money without a connected Stripe account (hostStripe).
  if (ev.price > 0 && !(await getFirestore().doc(`hostMembers/${email}`).get()).data()?.stripe?.chargesEnabled) {
    return res.status(409).json({ error: 'stripe', message: 'Connect Stripe before you set a price' });
  }
  const col = getFirestore().collection('hostEvents');
  const id = String(req.body?.id ?? '');
  if (id) {
    if (!/^[A-Za-z0-9]{10,40}$/.test(id)) return res.status(400).json({ error: 'Bad id' });
    const old = await col.doc(id).get();
    if (!old.exists || old.data().slug !== ev.slug) return res.status(404).json({ error: 'Not found' });
    await col.doc(id).set({ ...ev, by: email, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return res.status(200).json({ id });
  }
  const doc = await col.add({ ...ev, by: email, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  try {
    await mailJirel({ subject: `New date from ${ev.slug}: ${ev.title}, ${ev.date} ${ev.start}`, text: `${email} added "${ev.title}" on ${ev.date} at ${ev.start} (${ev.repeat}), ${ev.seats ?? '?'} seats, €${ev.price ?? '?'}${ev.minGuests ? `, runs from ${ev.minGuests}` : ''}.` });
  } catch (err) { console.error('event note failed', err?.message); }
  return res.status(200).json({ id: doc.id });
});

export const hostEventDelete = onRequest({ region: 'europe-west3', maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const id = String(req.body?.id ?? '');
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) return res.status(400).json({ error: 'Bad id' });
  const ref = getFirestore().doc(`hostEvents/${id}`);
  const snap = await ref.get();
  if (!snap.exists || !(await mayEdit(email, snap.data().slug))) return res.status(403).json({ error: 'Not your date' });
  await ref.delete();
  return res.status(200).json({ ok: true });
});

export const hostEvents = onRequest({ region: 'europe-west3', maxInstances: 10, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const slug = String(req.body?.slug ?? '');
  if (!SLUG.test(slug) || !(await mayEdit(email, slug))) return res.status(403).json({ error: 'Not your page' });
  const snap = await getFirestore().collection('hostEvents').where('slug', '==', slug).get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: undefined, updatedAt: undefined }))
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
  return res.status(200).json({ items });
});

// ── Listings: a host pauses or deletes a workshop ──
// Saved in Firestore hostListings/{slug}__{key} (key = the workshop's page
// key, slugify of its title). Paused: off the site until the host puts it
// back online; deleted: off the site for good (Jirel can restore it). The
// build (scripts/fetch-host-edits.mjs via publicEvents) leaves both out,
// within the hour (host-dates.yml).
const LISTING_KEY = /^[a-z0-9-]{1,120}$/;
const LISTING_STATES = ['paused', 'deleted'];

export const hostListing = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const b = req.body ?? {};
  const slug = String(b.slug ?? '');
  if (!SLUG.test(slug) || !(await mayEdit(email, slug))) return res.status(403).json({ error: 'Not your page' });
  const col = getFirestore().collection('hostListings');
  if (b.action === 'list') {
    const snap = await col.where('slug', '==', slug).get();
    return res.status(200).json({ items: snap.docs.map((d) => { const x = d.data(); return { key: x.key, title: x.title, status: x.status, price: x.price ?? '', image: x.image ?? '', edit: x.edit ?? null }; }) });
  }
  const key = String(b.key ?? '');
  if (!LISTING_KEY.test(key)) return res.status(400).json({ error: 'Bad workshop' });
  const ref = col.doc(`${slug}__${key}`);
  const title = text(b.title, 160);
  // Edit: the host's own title, price per person and a short line for the
  // workshop, laid over what the site shows (the page address stays).
  if (b.action === 'edit') {
    const n = Math.round(Number(b.price));
    const edit = { title: text(b.newTitle, 120), price: Number.isFinite(n) && n > 0 && n <= 5000 ? n : null, note: text(b.note, 220) };
    const prev = (await ref.get()).data();
    await ref.set({ slug, key, title, status: prev?.status ?? 'live', edit, by: email, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    try {
      await mailJirel({ subject: `${slug}: "${title || key}" edited`, text: `${email} edited "${title || key}" (${slug}): title "${edit.title}", price ${edit.price ?? '-'}, note "${edit.note}". The site follows within the hour.` });
    } catch (err) { console.error('listing note failed', err?.message); }
    return res.status(200).json({ ok: true });
  }
  // Back online is saved too (not deleted), so its time reaches publicEvents
  // "updated" and the hourly check republishes the site (host-dates.yml).
  if (b.status === 'live' || LISTING_STATES.includes(b.status)) {
    await ref.set({ slug, key, title, status: b.status, price: text(b.price, 40), image: String(b.image ?? '').slice(0, 400), by: email, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  } else {
    return res.status(400).json({ error: 'Bad status' });
  }
  try {
    const what = b.status === 'live' ? 'back online' : b.status;
    await mailJirel({ subject: `${slug}: "${title || key}" ${what}`, text: `${email} set "${title || key}" (${slug}) to ${what}. The site follows with the next deploy.` });
  } catch (err) { console.error('listing note failed', err?.message); }
  return res.status(200).json({ ok: true });
});

/** Public: every public date (no personal data), for the website build. */
export const publicEvents = onRequest({ region: 'europe-west3', maxInstances: 5 }, async (_req, res) => {
  const snap = await getFirestore().collection('hostEvents').where('visibility', '==', 'public').get();
  let updated = 0;
  const items = snap.docs.map((d) => {
    const x = d.data();
    updated = Math.max(updated, x.updatedAt?.toMillis?.() ?? 0);
    const { by: _by, createdAt: _c, updatedAt: _u, ...pub } = x;
    return { id: d.id, ...pub };
  });
  // Workshops hosts paused or deleted (hostListing), left out of the site.
  const listings = (await getFirestore().collection('hostListings').get()).docs
    .map((d) => { const x = d.data(); updated = Math.max(updated, x.updatedAt?.toMillis?.() ?? 0); return { slug: x.slug, key: x.key, status: x.status, edit: x.edit ?? null }; });
  const hidden = listings.filter((x) => LISTING_STATES.includes(x.status)).map(({ slug, key, status }) => ({ slug, key, status }));
  // And the hosts' own title, price and line for a workshop (hostListing edit).
  const edits = listings.filter((x) => x.edit && !LISTING_STATES.includes(x.status)).map(({ slug, key, edit }) => ({ slug, key, ...edit }));
  res.set('Cache-Control', 'no-store').status(200).json({ updated, items, hidden, edits });
});

// ── Payouts: Stripe Connect, as Luma does it ──
// A host who charges money connects a Stripe account: Stripe's own
// onboarding either creates a new one or signs them into the one they
// have ("standard" accounts, the same kind the app creates). The account
// id is kept on hostMembers/{email}; a host who already connected in the
// app (Users/{uid}.stripe.accountId) keeps that account.

/** The signed-in caller's email and uid, from the Firebase token. */
const callerIds = async (req) => {
  const m = /^Bearer (.+)$/.exec(req.get('authorization') ?? '');
  if (!m) return null;
  try {
    const t = await getAuth().verifyIdToken(m[1]);
    return t.email && t.email_verified ? { email: t.email.toLowerCase(), uid: t.uid } : null;
  } catch { return null; }
};

export const hostStripe = onRequest({ ...OPTS, secrets: [STRIPE_CONNECT_KEY] }, async (req, res) => {
  if (!allow(req, res)) return;
  const who = await callerIds(req);
  if (!who) return res.status(401).json({ error: 'Not signed in' });
  const { email, uid } = who;
  if (!ADMINS.includes(email) && !(await mySlugs(email)).length) return res.status(403).json({ error: 'Hosts only' });
  const key = STRIPE_CONNECT_KEY.value();
  if (!key) return res.status(500).json({ error: 'Stripe key missing' });
  const db = getFirestore();
  const memberRef = db.doc(`hostMembers/${email}`);
  let accountId = (await memberRef.get()).data()?.stripe?.accountId;
  if (!accountId) {
    const app = (await db.doc(`Users/${uid}`).get()).data()?.stripe?.accountId;
    if (typeof app === 'string' && /^acct_\w+$/.test(app)) accountId = app;
  }
  const action = String(req.body?.action ?? 'status');
  // An id that is not an account of this platform (left over from a test or
  // another Stripe account, "No such account"): forget it, so the host can
  // connect afresh instead of being stuck on it (Jirel's test, 06.11.26).
  if (accountId) {
    const r = await stripe(key, `accounts/${accountId}`);
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      if (r.status === 404 || /no such account/i.test(e?.error?.message ?? '') || e?.error?.code === 'account_invalid') {
        console.warn('hostStripe: dropping unknown account', accountId, email);
        accountId = undefined;
        await memberRef.set({ stripe: FieldValue.delete() }, { merge: true });
      } else if (action === 'status') {
        return res.status(502).json({ error: e?.error?.message ?? 'Stripe error' });
      }
    }
  }
  if (action === 'status') {
    if (!accountId) return res.status(200).json({ connected: false, chargesEnabled: false });
    const r = await stripe(key, `accounts/${accountId}`);
    const a = await r.json();
    if (!r.ok) return res.status(502).json({ error: a?.error?.message ?? 'Stripe error' });
    const state = { accountId, chargesEnabled: !!a.charges_enabled, detailsSubmitted: !!a.details_submitted };
    await memberRef.set({ stripe: { ...state, checkedAt: FieldValue.serverTimestamp() } }, { merge: true });
    return res.status(200).json({ connected: true, chargesEnabled: state.chargesEnabled, detailsSubmitted: state.detailsSubmitted });
  }
  // "I already have a Stripe account", as on Luma: Stripe's own sign-in
  // (Connect OAuth) links the host's existing Standard account as it is.
  if (action === 'link') {
    if (!STRIPE_CONNECT_CLIENT_ID) return res.status(503).json({ error: 'link-not-configured' });
    const lang = req.body?.lang === 'en' ? 'en' : 'de';
    const state = await oauthState(email, lang);
    const q = new URLSearchParams({ response_type: 'code', client_id: STRIPE_CONNECT_CLIENT_ID, scope: 'read_write', state,
      redirect_uri: `${FUNCTIONS_URL}/hostStripeOAuth`, stripe_landing: 'login', 'stripe_user[email]': email });
    return res.status(200).json({ url: `https://connect.stripe.com/oauth/authorize?${q}` });
  }
  if (action !== 'connect') return res.status(400).json({ error: 'Bad request' });
  if (!accountId) {
    const p = new URLSearchParams({ type: 'standard', country: 'DE', email });
    p.set('metadata[twiggli_email]', email);
    const r = await stripe(key, 'accounts', p);
    const a = await r.json();
    if (!r.ok) return res.status(502).json({ error: a?.error?.message ?? 'Stripe error' });
    accountId = a.id;
    await memberRef.set({ stripe: { accountId, chargesEnabled: false, createdAt: FieldValue.serverTimestamp() } }, { merge: true });
  }
  // The dashboard exists in English and German only.
  const back = `${SITE}${req.body?.lang === 'en' ? '' : '/de'}/host/account/`;
  const p = new URLSearchParams({ account: accountId, type: 'account_onboarding', return_url: `${back}?stripe=return`, refresh_url: `${back}?stripe=refresh` });
  const r = await stripe(key, 'account_links', p);
  const link = await r.json();
  if (!r.ok) return res.status(502).json({ error: link?.error?.message ?? 'Stripe error' });
  return res.status(200).json({ url: link.url });
});

// ── Guest reviews (05.11.26) ──
// The review page (site/src/components/ReviewPage.astro) posts here. A review
// is saved as "pending" and mailed to Jirel with Publish / Reject buttons:
// nothing is shown on the site until she publishes it (Jirel, 05.11.26).
// Published reviews are served by publicReviews and drawn on the host's page
// in the browser, so publishing needs no deploy. Each mail also carries a
// Remove link, so a published review (or a test) can be taken down again.
const reviewSig = async (id, action) => createHmac('sha256', await approveKey()).update(`review\n${id}\n${action}`).digest('hex');
const reviewLink = async (id, action) => `${FUNCTIONS_URL}/reviewDecide?id=${id}&a=${action}&sig=${await reviewSig(id, action)}`;

export const reviewSubmit = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  if (b._honey) return res.status(200).json({ success: 'true' });
  const stars = Math.round(Number(b.stars));
  const reviewText = String(b.text ?? '').trim().slice(0, 1200);
  const host = SLUG.test(String(b.host ?? '')) ? String(b.host) : '';
  if (!(stars >= 1 && stars <= 5) || reviewText.length < 3 || !host) return res.status(400).json({ success: 'false', message: 'Stars, text and host are needed' });
  const review = {
    host,
    hostName: text(b.hostName, 120),
    workshop: text(b.workshop, 160),
    name: text(b.name, 60),
    showName: b.showName === true || b.showName === 'true',
    stars,
    text: reviewText,
    lang: text(b.lang, 5) || 'en',
    month: new Date().toISOString().slice(0, 7),
    status: 'pending',
    test: b.test === true || b.test === 'true',
    createdAt: FieldValue.serverTimestamp(),
  };
  const doc = await getFirestore().collection('guestReviews').add(review);
  try {
    const [pub, rej, del] = await Promise.all([reviewLink(doc.id, 'publish'), reviewLink(doc.id, 'reject'), reviewLink(doc.id, 'delete')]);
    const starLine = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    const btn = (href, label, bg, fg) => `<table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 8px 8px 0"><tr><td bgcolor="${bg}" style="border-radius:10px"><a href="${href}" style="display:inline-block;padding:12px 20px;color:${fg};font-weight:bold;text-decoration:none">${label}</a></td></tr></table>`;
    const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
    await mail.sendMail({
      from: { name: 'Twiggli Reviews', address: INBOX },
      to: INBOX,
      subject: `${review.test ? '[TEST] ' : ''}New review ${starLine} for ${review.hostName || host} from ${review.name || 'a guest'}`,
      text: `${starLine}\n"${reviewText}"\n${review.name} · ${review.workshop} · ${review.hostName || host}\nShow first name: ${review.showName ? 'yes' : 'no'}\n\nPublish: ${pub}\nReject: ${rej}\nRemove later: ${del}`,
      html: `<div style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.6;color:#24272e;max-width:560px">
<p style="margin:0 0 4px;color:#8a8a8a">New review for <b>${esc(review.hostName || host)}</b>${review.workshop ? ` · ${esc(review.workshop)}` : ''}</p>
<p style="margin:0 0 8px;font-size:24px;color:#ffb72b;letter-spacing:2px">${starLine}</p>
<p style="margin:0 0 8px;font-size:16px">“${esc(reviewText)}”</p>
<p style="margin:0 0 18px;color:#555">${esc(review.name || 'No name')} · show first name: <b>${review.showName ? 'yes' : 'no'}</b></p>
<p style="margin:0 0 6px">Nothing is shown on twiggli.com until you publish it.</p>
${btn(pub, 'Publish on the host’s page', '#6a3eec', '#ffffff')}${btn(rej, 'Reject', '#eeeeee', '#24272e')}
<p style="margin:14px 0 0;font-size:12px;color:#8a8a8a">Take it down later (also deletes it): <a href="${del}" style="color:#8a8a8a">remove this review</a></p></div>`,
    });
  } catch (err) { console.error('review mail failed', doc.id, err?.message); }
  return res.status(200).json({ success: 'true', id: doc.id });
});

export const reviewDecide = onRequest({ region: 'europe-west3', maxInstances: 5 }, async (req, res) => {
  const id = String(req.query.id ?? '');
  const a = String(req.query.a ?? '');
  const sig = String(req.query.sig ?? '');
  const page = (title, body) => res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title><body style="font-family:Tahoma,Arial,sans-serif;background:#f4f4ff;margin:0;padding:48px 16px"><div style="max-width:480px;margin:0 auto;background:#fff;border-radius:18px;padding:28px 24px;box-shadow:0 18px 50px rgba(106,62,236,.18)"><p style="margin:0 0 12px;font-weight:bold;color:#6a3eec;font-size:20px">twiggli</p><h1 style="font-size:22px;margin:0 0 10px">${esc(title)}</h1>${body}</div></body>`);
  if (!/^[A-Za-z0-9]{10,40}$/.test(id) || !['publish', 'reject', 'delete'].includes(a)) return page('Link not valid', '<p>This link is incomplete.</p>');
  const want = Buffer.from(await reviewSig(id, a));
  if (want.length !== Buffer.from(sig).length || !timingSafeEqual(want, Buffer.from(sig))) return page('Link not valid', '<p>This link is not signed by Twiggli.</p>');
  const ref = getFirestore().doc(`guestReviews/${id}`);
  const snap = await ref.get();
  if (!snap.exists) return page('Already removed', '<p>This review no longer exists.</p>');
  const r = snap.data();
  if (a === 'delete') { await ref.delete(); return page('Review removed', `<p>The review from ${esc(r.name || 'a guest')} is deleted and no longer shown.</p>`); }
  await ref.update({ status: a === 'publish' ? 'published' : 'rejected', decidedAt: FieldValue.serverTimestamp() });
  return a === 'publish'
    ? page('Published 🎉', `<p>The review from ${esc(r.name || 'a guest')} is now on ${esc(r.hostName || r.host)}'s page.</p><p><a href="${SITE}/" style="color:#6a3eec;font-weight:bold">Open twiggli.com</a></p>`)
    : page('Rejected', '<p>This review will not be shown.</p>');
});

export const publicReviews = onRequest({ region: 'europe-west3', maxInstances: 5 }, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  // ?summary=1: stars per host for the small rating on workshop cards.
  if (req.query.summary === '1') {
    const all = await getFirestore().collection('guestReviews').where('status', '==', 'published').get();
    const sum = {};
    for (const d of all.docs) {
      const r = d.data();
      const x = (sum[r.host] ??= { total: 0, count: 0 });
      x.total += r.stars; x.count += 1;
    }
    const hosts = Object.fromEntries(Object.entries(sum).map(([k, v]) => [k, { avg: Math.round((v.total / v.count) * 10) / 10, count: v.count }]));
    return res.set('Cache-Control', 'public, max-age=60').status(200).json({ hosts });
  }
  const host = String(req.query.h ?? '');
  if (!SLUG.test(host)) return res.status(400).json({ items: [] });
  const snap = await getFirestore().collection('guestReviews').where('host', '==', host).where('status', '==', 'published').get();
  const items = snap.docs.map((d) => {
    const r = d.data();
    return { stars: r.stars, text: r.text, name: r.showName ? r.name : '', workshop: r.workshop, month: r.month, lang: r.lang };
  });
  res.set('Cache-Control', 'public, max-age=60').status(200).json({ items });
});

// ── Guests pay a host's date directly (Stripe Connect, Standard, as Luma) ──
// A priced date a host created in their account is paid on the host's own
// Stripe account (a "direct charge"); Twiggli's commission comes off as the
// application fee, so the money never passes through Twiggli. A booking is
// kept in bookings/{checkout session id}: "pending" while the guest is on
// Stripe's page (holding the places for 30 minutes), "paid" once Stripe says
// so, when guest, host and Jirel get their emails. Commission per host:
// hostMembers/{email}.commissionPct (0 for a free first booking), else 15.
const DEFAULT_COMMISSION = 15;
const stripeAs = (key, account, path, params) =>
  fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Stripe-Account': account },
    body: params,
  });

/** Whether `date` is one of the event's dates (its repeats included). */
const onSchedule = (ev, date) => {
  if (!YMD.test(date) || date < ev.date) return false;
  const first = new Date(`${ev.date}T00:00:00Z`);
  const until = ev.until ? new Date(`${ev.until}T00:00:00Z`) : new Date(first.getTime() + 84 * 86400000);
  const d = new Date(`${date}T00:00:00Z`);
  if (d > until) return false;
  const days = Math.round((d - first) / 86400000);
  if (!ev.repeat || ev.repeat === 'once') return days === 0;
  if (ev.repeat === 'weekly') return days % 7 === 0;
  if (ev.repeat === 'biweekly') return days % 14 === 0;
  if (ev.repeat === 'monthly') return d.getUTCDate() === first.getUTCDate();
  return false;
};

/** Places taken on one date: paid bookings, plus checkouts still open. */
const placesTaken = async (eventId, date) => {
  const snap = await getFirestore().collection('bookings').where('eventId', '==', eventId).where('date', '==', date).get();
  const fresh = Date.now() - 31 * 60 * 1000;
  return snap.docs.reduce((n, d) => {
    const b = d.data();
    const live = b.status === 'paid' || (b.status === 'pending' && (b.createdAt?.toMillis?.() ?? 0) > fresh);
    return n + (live ? b.people : 0);
  }, 0);
};

const CANCEL_TEXT = {
  '24h': ['Kostenlos stornierbar bis 24 Stunden vorher.', 'Free cancellation up to 24 hours before.'],
  '7d': ['Kostenlos stornierbar bis 7 Tage vorher.', 'Free cancellation up to 7 days before.'],
  '14d': ['Kostenlos stornierbar bis 14 Tage vorher.', 'Free cancellation up to 14 days before.'],
  none: ['Keine Erstattung bei Stornierung.', 'No refunds on cancellation.'],
  move: ['Keine Erstattung, aber du kannst auf einen späteren Termin wechseln.', 'No refund, but you can move to a later date.'],
};

export const bookingCheckout = onRequest({ ...OPTS, secrets: [STRIPE_CONNECT_KEY] }, async (req, res) => {
  if (!allow(req, res)) return;
  const key = STRIPE_CONNECT_KEY.value();
  const b = req.body ?? {};
  const eventId = String(b.eventId ?? '');
  const date = String(b.date ?? '');
  const people = Math.round(Number(b.people));
  const email = text(b.email, 200);
  const name = text(b.name, 120);
  const lang = b.lang === 'de' ? 'de' : 'en';
  const de = lang === 'de';
  if (!/^[A-Za-z0-9]{10,40}$/.test(eventId) || !(people >= 1 && people <= 50) || !isEmail(email) || !name) return res.status(400).json({ error: 'bad-request' });
  const db = getFirestore();
  const evSnap = await db.doc(`hostEvents/${eventId}`).get();
  const ev = evSnap.data();
  if (!evSnap.exists || ev.visibility === 'private' || !(ev.price > 0) || !onSchedule(ev, date)) return res.status(404).json({ error: 'not-bookable' });
  if (new Date(`${date}T${ev.start}:00+01:00`).getTime() < Date.now()) return res.status(409).json({ error: 'past' });
  const member = (await db.doc(`hostMembers/${ev.by}`).get()).data() ?? {};
  const account = member.stripe?.accountId;
  if (!account || !member.stripe?.chargesEnabled) return res.status(409).json({ error: 'host-not-ready' });
  if (ev.seats) {
    const left = ev.seats - (await placesTaken(eventId, date));
    if (people > left) return res.status(409).json({ error: 'full', left: Math.max(0, left) });
  }
  const pct = Number.isFinite(member.commissionPct) ? Math.max(0, Math.min(30, member.commissionPct)) : DEFAULT_COMMISSION;
  const total = ev.price * 100 * people;
  // A Twiggli voucher (07.11.26): its value comes off the price. The guest
  // pays the rest on the host's Stripe; Twiggli pays the voucher part out to
  // the host with the monthly voucher payout (minus 15%, as agreed). The
  // voucher's balance is taken only once the booking is paid.
  let voucherCents = 0;
  let voucherHash = '';
  if (b.voucher) {
    const v = await lookupVoucher(b.voucher, ev.slug);
    if (!v.ok) return res.status(409).json({ error: 'voucher', reason: v.error });
    voucherCents = Math.min(total, Math.round(v.balance * 100));
    voucherHash = v.hash;
  }
  const charge = total - voucherCents;
  const fee = Math.round(charge * pct / 100);
  const page = `${SITE}${de ? '/de' : ''}/booking/confirmed/`;
  const back = typeof b.back === 'string' && b.back.startsWith(SITE) ? b.back.slice(0, 400) : `${SITE}${de ? '/de' : ''}/`;
  const when = `${new Date(`${date}T12:00:00Z`).toLocaleDateString(de ? 'de-DE' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' })}, ${ev.start}`;
  const booking = {
    eventId, date, start: ev.start, slug: ev.slug, title: ev.title, location: ev.location ?? '', cancel: ev.cancel ?? '7d',
    people, name, email, phone: text(b.phone, 60), message: String(b.message ?? '').slice(0, 1000), lang,
    hostEmail: ev.by, account, amount: total, fee, commissionPct: pct, status: 'pending', createdAt: FieldValue.serverTimestamp(),
    ...(voucherCents ? { voucherHash, voucherCents } : {}),
  };
  // The voucher covers everything: booked at once, no Stripe.
  if (!charge) {
    const id = `vb${randomBytes(12).toString('hex')}`;
    const ref = db.doc(`bookings/${id}`);
    try {
      await db.runTransaction(async (t) => {
        const vRef = db.doc(`voucherCodes/${voucherHash}`);
        const vd = (await t.get(vRef)).data();
        if (!vd || Math.round((vd.balance ?? 0) * 100) < voucherCents) throw new Error('voucher-used');
        t.update(vRef, { balance: Math.round(vd.balance * 100 - voucherCents) / 100, redemptions: FieldValue.arrayUnion({ bookingId: id, hostSlug: ev.slug, amount: voucherCents / 100, at: Date.now(), status: 'redeemed' }) });
        t.set(ref, { ...booking, status: 'paid', paidBy: 'voucher', paidAt: FieldValue.serverTimestamp() });
      });
    } catch { return res.status(409).json({ error: 'voucher', reason: 'used' }); }
    await sendBookingMails(id, { ...booking, status: 'paid', paidBy: 'voucher' });
    return res.status(200).json({ url: `${page}?b=${id}&e=${eventId}` });
  }
  const p = new URLSearchParams();
  p.set('mode', 'payment');
  p.set('locale', lang);
  p.set('customer_email', email);
  p.set('success_url', `${page}?session_id={CHECKOUT_SESSION_ID}&e=${eventId}`);
  p.set('cancel_url', back);
  p.set('expires_at', String(Math.floor(Date.now() / 1000) + 30 * 60));
  // With a voucher, one line for the rest (Stripe has no negative lines).
  const voucherLine = voucherCents ? (de ? `Gutschein −€${(voucherCents / 100).toFixed(2).replace(/\.00$/, '')} angerechnet` : `Voucher −€${(voucherCents / 100).toFixed(2).replace(/\.00$/, '')} applied`) : '';
  p.set('line_items[0][quantity]', voucherCents ? '1' : String(people));
  p.set('line_items[0][price_data][currency]', 'eur');
  p.set('line_items[0][price_data][unit_amount]', String(voucherCents ? charge : ev.price * 100));
  p.set('line_items[0][price_data][product_data][name]', `${voucherCents ? `${people}× ` : ''}${ev.title} · ${when}`);
  p.set('line_items[0][price_data][product_data][description]', [voucherLine, (CANCEL_TEXT[ev.cancel] ?? CANCEL_TEXT['7d'])[de ? 0 : 1], ev.location].filter(Boolean).join(' · '));
  if (fee > 0) p.set('payment_intent_data[application_fee_amount]', String(fee));
  p.set('payment_intent_data[description]', `Twiggli: ${ev.title}, ${date} ${ev.start}, ${people}× (${name})`);
  const meta = { kind: 'twiggli booking', event_id: eventId, date, start: ev.start, people: String(people), name, slug: ev.slug, commission_pct: String(pct) };
  for (const [k, v] of Object.entries(meta)) { p.set(`metadata[${k}]`, v); p.set(`payment_intent_data[metadata][${k}]`, v); }
  const r = await stripeAs(key, account, 'checkout/sessions', p);
  const s = await r.json();
  if (!r.ok) { console.error('bookingCheckout', s?.error?.message); return res.status(502).json({ error: 'stripe', message: s?.error?.message }); }
  await db.doc(`bookings/${s.id}`).set(booking);
  return res.status(200).json({ url: s.url });
});

export const bookingConfirm = onRequest({ ...OPTS, secrets: [STRIPE_CONNECT_KEY, GMAIL_APP_PASSWORD] }, async (req, res) => {
  if (!allow(req, res)) return;
  const id = String(req.body?.session_id ?? '');
  // cs_…: paid on Stripe; vb…: paid in full with a voucher (bookingCheckout).
  if (!/^cs_(live|test)_\w{10,200}$/.test(id) && !/^vb[0-9a-f]{24}$/.test(id)) return res.status(400).json({ error: 'bad-request' });
  const ref = getFirestore().doc(`bookings/${id}`);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'not-found' });
  let bk = snap.data();
  const out = () => ({ status: bk.status, title: bk.title, date: bk.date, start: bk.start, location: bk.location, people: bk.people, amount: bk.amount / 100, voucher: (bk.voucherCents ?? 0) / 100, name: bk.name, cancel: bk.cancel, slug: bk.slug });
  if (bk.status === 'paid') return res.status(200).json(out());
  const r = await stripeAs(STRIPE_CONNECT_KEY.value(), bk.account, `checkout/sessions/${id}`);
  const s = await r.json();
  if (!r.ok) return res.status(502).json({ error: 'stripe' });
  if (s.payment_status !== 'paid') return res.status(200).json({ ...out(), status: 'unpaid' });
  // Paid: mark it once (two tabs could confirm at the same moment).
  const first = await getFirestore().runTransaction(async (t) => {
    const cur = (await t.get(ref)).data();
    if (cur.status === 'paid') return false;
    // The voucher part is taken from the code now that the rest is paid.
    let short = false;
    if (cur.voucherHash && cur.voucherCents) {
      const vRef = getFirestore().doc(`voucherCodes/${cur.voucherHash}`);
      const vd = (await t.get(vRef)).data();
      const have = Math.round((vd?.balance ?? 0) * 100);
      short = have < cur.voucherCents; // used up meanwhile: Jirel sorts it out
      if (vd) t.update(vRef, { balance: Math.max(0, have - cur.voucherCents) / 100, redemptions: FieldValue.arrayUnion({ bookingId: id, hostSlug: cur.slug, amount: cur.voucherCents / 100, at: Date.now(), status: 'redeemed' }) });
    }
    t.update(ref, { status: 'paid', paidAt: FieldValue.serverTimestamp(), paymentIntent: String(s.payment_intent ?? ''), ...(short ? { voucherShort: true } : {}) });
    return true;
  });
  bk = { ...bk, status: 'paid' };
  if (!first) return res.status(200).json(out());
  await sendBookingMails(id, bk);
  return res.status(200).json(out());
});

/** The emails for a paid booking: the guest's confirmation, and the host's
 *  note (Jirel in CC), with the voucher part shown where there is one. */
const sendBookingMails = async (id, bk) => {
  const de = bk.lang === 'de';
  const day = new Date(`${bk.date}T12:00:00Z`).toLocaleDateString(de ? 'de-DE' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const eur = (c) => `€${(c / 100).toFixed(2).replace(/\.00$/, '')}`;
  const cancel = (CANCEL_TEXT[bk.cancel] ?? CANCEL_TEXT['7d'])[de ? 0 : 1];
  const first_ = bk.name.split(/\s+/)[0];
  const vc = bk.voucherCents ?? 0;
  const charged = bk.amount - vc;
  const rows = [[de ? 'Workshop' : 'Workshop', bk.title], [de ? 'Wann' : 'When', `${day}, ${bk.start}`], [de ? 'Wo' : 'Where', bk.location], [de ? 'Plätze' : 'Places', String(bk.people)],
    ...(vc ? [[de ? 'Gutschein' : 'Voucher', `−${eur(vc)}`]] : []),
    [de ? 'Bezahlt' : 'Paid', eur(charged)], [de ? 'Stornierung' : 'Cancellation', cancel]].filter(([, v]) => v);
  const table = rows.map(([k, v]) => `<tr><td style="padding:5px 16px 5px 0;color:#8b87a0">${esc(k)}</td><td style="padding:5px 0"><b>${esc(v)}</b></td></tr>`).join('');
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  try {
    await mail.sendMail({
      from: { name: 'Twiggli', address: SENDER }, replyTo: SENDER, to: bk.email,
      subject: de ? `Gebucht! ${bk.title} am ${day} ${emojiFor(bk.title)}` : `You're booked! ${bk.title} on ${day} ${emojiFor(bk.title)}`,
      html: `<div style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.6;color:#24272e;max-width:520px">${de ? `Hallo ${esc(first_)},<br><br>dein Platz ist sicher, wir freuen uns auf dich! 🎉` : `Hi ${esc(first_)},<br><br>your place is booked, we can't wait to see you! 🎉`}<table style="margin:16px 0;font-size:14px">${table}</table>${charged && de ? 'Die Zahlungsbestätigung von Stripe kommt in einer eigenen E-Mail. Fragen oder etwas ändern? Antworte einfach auf diese E-Mail.<br><br>Liebe Grüße 💛<br>Jirel von <b>Twiggli</b>' : de ? 'Fragen oder etwas ändern? Antworte einfach auf diese E-Mail.<br><br>Liebe Grüße 💛<br>Jirel von <b>Twiggli</b>' : `${charged ? 'Your payment receipt from Stripe comes in a separate email. ' : ''}Questions, or need to change something? Just reply to this email.<br><br>Warm regards 💛<br>Jirel from <b>Twiggli</b>`}</div>`,
    });
  } catch (err) { console.error('booking guest mail failed', id, err?.message); }
  try {
    await mail.sendMail({
      from: { name: 'Twiggli', address: SENDER }, replyTo: bk.email, to: bk.hostEmail, cc: INBOX,
      subject: `Neue Buchung über Twiggli: ${bk.title}, ${bk.date} ${bk.start} (${bk.people} ${bk.people === 1 ? 'Platz' : 'Plätze'}) 🎉`,
      html: `<div style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.6;color:#24272e;max-width:560px">Hallo,<br><br>gerade wurde über Twiggli gebucht und bezahlt:<table style="margin:16px 0;font-size:14px">${table}<tr><td style="padding:5px 16px 5px 0;color:#8b87a0">Gast</td><td style="padding:5px 0"><b>${esc(bk.name)}</b>, ${esc(bk.email)}${bk.phone ? `, ${esc(bk.phone)}` : ''}</td></tr>${bk.message ? `<tr><td style="padding:5px 16px 5px 0;color:#8b87a0">Nachricht</td><td style="padding:5px 0">${esc(bk.message)}</td></tr>` : ''}<tr><td style="padding:5px 16px 5px 0;color:#8b87a0">Auszahlung</td><td style="padding:5px 0">${charged ? `<b>${eur(charged - bk.fee)}</b> über Stripe (${eur(charged)} minus ${bk.commissionPct} % Twiggli${bk.commissionPct ? '' : ', erste Buchung provisionsfrei'}, abzüglich Stripe-Gebühren)` : ''}${charged && vc ? '<br>' : ''}${vc ? `<b>${eur(Math.round(vc * 0.85))}</b> für den Gutschein (${eur(vc)} minus 15 %), zahlt Twiggli bis zum 10. des Folgemonats aus` : ''}</td></tr></table>${charged ? 'Das Geld liegt schon auf deinem Stripe-Konto. ' : ''} Antworte auf diese E-Mail, um ${esc(first_)} direkt zu schreiben.<br><br>Liebe Grüße<br>Jirel, Gründerin @ <b>Twiggli</b></div>`,
    });
  } catch (err) { console.error('booking host mail failed', id, err?.message); }
};

// ── Paid vouchers still waiting for their code and PDF ──
// Vouchers bought while automatic sending was off (VOUCHER_AUTO) have
// pdfSent: false. This sends each one, exactly as a new purchase would,
// to the address the buyer chose. It can only deliver what was paid for,
// once (a claim flag stops a second run), so it needs no sign-in.
export const voucherIssuePending = onRequest({ region: 'europe-west3', secrets: [STRIPE_SECRET_KEY, GMAIL_APP_PASSWORD], maxInstances: 1 }, async (_req, res) => {
  if (process.env.VOUCHER_AUTO !== 'on') return res.status(409).json({ error: 'automatic sending is off' });
  const snap = await getFirestore().collection('vouchers').where('pdfSent', '==', false).get();
  const done = [];
  for (const d of snap.docs) {
    const claimed = await getFirestore().runTransaction(async (t) => {
      const cur = (await t.get(d.ref)).data();
      if (cur.pdfSent !== false || cur.issuing) return false;
      t.update(d.ref, { issuing: true });
      return true;
    });
    if (!claimed) continue;
    try {
      const r = await stripe(STRIPE_SECRET_KEY.value(), `payment_intents/${d.id}`);
      const pi = await r.json();
      if (!r.ok || pi.status !== 'succeeded') throw new Error(pi?.error?.message ?? `status ${pi.status}`);
      const sentTo = await issueVoucher(pi, pi.metadata ?? {}, d.data().buyer);
      done.push({ ref: d.data().ref, sentTo });
    } catch (err) {
      console.error('pending voucher failed', d.id, err?.message);
      await d.ref.update({ issuing: false });
    }
  }
  return res.status(200).json({ sent: done.length, done });
});

// ── Linking an existing Stripe account (Connect OAuth, Standard) ──
// The Connect client id of the "Twiggli app" Stripe account (public, it
// appears in Stripe's sign-in address). Empty: the button says it's not set up.
const STRIPE_CONNECT_CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID || '';
/** Who started the linking, signed, so the way back can't be forged. */
const oauthState = async (email, lang) => {
  const raw = Buffer.from(JSON.stringify({ e: email, l: lang, t: Date.now() })).toString('base64url');
  const sig = createHmac('sha256', await approveKey()).update(`stripe-oauth\n${raw}`).digest('base64url');
  return `${raw}.${sig}`;
};

export const hostStripeOAuth = onRequest({ region: 'europe-west3', secrets: [STRIPE_CONNECT_KEY], maxInstances: 5 }, async (req, res) => {
  const [raw = '', sig = ''] = String(req.query.state ?? '').split('.');
  let st = null;
  try {
    const want = createHmac('sha256', await approveKey()).update(`stripe-oauth\n${raw}`).digest('base64url');
    if (want.length === sig.length && timingSafeEqual(Buffer.from(want), Buffer.from(sig))) st = JSON.parse(Buffer.from(raw, 'base64url').toString());
  } catch { st = null; }
  const back = (lang, how) => res.redirect(302, `${SITE}${lang === 'en' ? '' : '/de'}/host/account/?stripe=${how}`);
  if (!st || Date.now() - st.t > 60 * 60 * 1000 || !isEmail(st.e)) return back('de', 'failed');
  if (req.query.error || !req.query.code) return back(st.l, 'cancelled');
  const r = await fetch('https://connect.stripe.com/oauth/token', {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRIPE_CONNECT_KEY.value()}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code: String(req.query.code) }),
  });
  const tok = await r.json().catch(() => ({}));
  if (!r.ok || !/^acct_\w+$/.test(String(tok.stripe_user_id ?? ''))) {
    console.error('hostStripeOAuth token failed', tok?.error, tok?.error_description);
    return back(st.l, 'failed');
  }
  const accountId = tok.stripe_user_id;
  let chargesEnabled = false;
  try {
    const a = await (await stripe(STRIPE_CONNECT_KEY.value(), `accounts/${accountId}`)).json();
    chargesEnabled = !!a.charges_enabled;
  } catch { /* checked again on the dashboard */ }
  await getFirestore().doc(`hostMembers/${st.e.toLowerCase()}`).set({ stripe: { accountId, chargesEnabled, linked: true, linkedAt: FieldValue.serverTimestamp() } }, { merge: true });
  return back(st.l, 'linked');
});
