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
  try { sentTo = await issueVoucher(pi, m, to); } catch (err) { console.error('voucher issue failed', pi.id, err?.message); }
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
  if (!(v.balance > 0)) return { error: 'used' };
  if (v.hostSlug && hostSlug && v.hostSlug !== hostSlug) return { error: 'host', host: v.hostSlug };
  return { ok: true, hash, balance: v.balance, validUntil: v.validUntil ?? '', hostSlug: v.hostSlug ?? '', ref: v.ref ?? '' };
};

const COMPANY = 'Twiggli UG (haftungsbeschränkt) · Rodenkirchener Str. 147 · 50997 Köln';
const isoDay = (d) => d.toISOString().slice(0, 10);

/** The voucher email, with its PDF and our icon, from our public address. */
const sendVoucherMail = async (to, parts, pdf, code) => { // pdf null: no attachment
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  await mail.sendMail({
    from: { name: 'Twiggli', address: SENDER }, replyTo: SENDER, to,
    subject: parts.subject, text: parts.text, html: parts.html,
    attachments: [
      { filename: 'twiggli.png', content: parts.icon, cid: 'twiggli-icon' },
      ...(pdf ? [{ filename: `Twiggli-${code}.pdf`, content: pdf, contentType: 'application/pdf' }] : []),
    ],
  });
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
    return res.status(200).json({ success: 'true', id: doc.id });
  },
);

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
  const items = snap.docs.map((d) => {
    const x = d.data();
    return { id: d.id, subject: x.subject, fields: x.fields, status: x.status, thread: x.thread ?? [], createdAt: x.createdAt?.toMillis?.() ?? 0 };
  }).sort((a, b) => b.createdAt - a.createdAt).slice(0, 200);
  return res.status(200).json({ items });
});

const ACTIONS = { accept: 'accepted', decline: 'declined', suggest: 'suggested' };

export const hostReply = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 10, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const id = String(req.body?.id ?? '');
  const action = String(req.body?.action ?? '');
  const message = text(req.body?.message, 2000);
  const when = text(req.body?.when, 120);
  if (!/^[A-Za-z0-9]{10,40}$/.test(id) || !ACTIONS[action]) return res.status(400).json({ error: 'Bad request' });
  const ref = getFirestore().doc(`formRequests/${id}`);
  const snap = await ref.get();
  const x = snap.data();
  if (!x?.hostSlug || !(ADMINS.includes(email) || (await mySlugs(email)).includes(x.hostSlug))) return res.status(403).json({ error: 'Not your request' });
  const entry = { by: email, action, message, when, at: Date.now() };
  await ref.update({ status: ACTIONS[action], thread: FieldValue.arrayUnion(entry) });
  // Jirel sees every answer; the guest is NOT emailed automatically (she
  // decides about that), so she passes it on until then.
  try {
    const guest = x.fields?.Name || x.email || 'the guest';
    await mailJirel({
      subject: `Host ${ACTIONS[action]}: ${x.subject}`,
      replyTo: isEmail(x.email) ? x.email : undefined,
      text: `${email} ${ACTIONS[action]} the request from ${guest}.${when ? `\nSuggested time: ${when}` : ''}${message ? `\nMessage: ${message}` : ''}\n\nGuest: ${x.email || 'no email'}`,
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
const CANCELS = ['24h', '7d', '14d', 'none'];
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
  res.set('Cache-Control', 'no-store').status(200).json({ updated, items });
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

export const hostStripe = onRequest(OPTS, async (req, res) => {
  if (!allow(req, res)) return;
  const who = await callerIds(req);
  if (!who) return res.status(401).json({ error: 'Not signed in' });
  const { email, uid } = who;
  if (!ADMINS.includes(email) && !(await mySlugs(email)).length) return res.status(403).json({ error: 'Hosts only' });
  const key = STRIPE_SECRET_KEY.value();
  if (!key) return res.status(500).json({ error: 'Stripe key missing' });
  const db = getFirestore();
  const memberRef = db.doc(`hostMembers/${email}`);
  let accountId = (await memberRef.get()).data()?.stripe?.accountId;
  if (!accountId) {
    const app = (await db.doc(`Users/${uid}`).get()).data()?.stripe?.accountId;
    if (typeof app === 'string' && /^acct_\w+$/.test(app)) accountId = app;
  }
  const action = String(req.body?.action ?? 'status');
  if (action === 'status') {
    if (!accountId) return res.status(200).json({ connected: false, chargesEnabled: false });
    const r = await stripe(key, `accounts/${accountId}`);
    const a = await r.json();
    if (!r.ok) return res.status(502).json({ error: a?.error?.message ?? 'Stripe error' });
    const state = { accountId, chargesEnabled: !!a.charges_enabled, detailsSubmitted: !!a.details_submitted };
    await memberRef.set({ stripe: { ...state, checkedAt: FieldValue.serverTimestamp() } }, { merge: true });
    return res.status(200).json({ connected: true, chargesEnabled: state.chargesEnabled, detailsSubmitted: state.detailsSubmitted });
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
