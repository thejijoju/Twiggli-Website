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
//   hostPublish      a host asks to put their draft (preview) page live;
//                    hostPublishApprove is Jirel's Approve link for it
//   hostTips         the dashboard's tips: dismissed ones, Jirel's notes
//
// The Stripe secret key lives in Firebase Secret Manager, never in this
// file or in the repo:  firebase functions:secrets:set STRIPE_SECRET_KEY
// See README.md here for setup and deploy.

import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule as onCron } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage as adminStorage } from 'firebase-admin/storage';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import QRCode from 'qrcode';
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
// Brevo's transactional API key (Secret Manager BREVO_API_KEY): sign-in codes
// go out through Brevo from no-reply@twiggli.com, so mail apps treat them as
// system mail (Jirel 14.11.26). Gmail stays the fallback.
const BREVO_API_KEY = defineSecret('BREVO_API_KEY');
// Bunny Stream's API key (Secret Manager BUNNY_STREAM_API_KEY): hosts'
// videos go to Bunny Stream (Jirel 18.11.26), photos stay on Firebase
// Storage. The key never leaves this function: the browser and the app only
// get a signature for one upload (hostVideo).
const BUNNY_STREAM_API_KEY = defineSecret('BUNNY_STREAM_API_KEY');
// No address is written in this repo (Jirel, 31.10.26): they come from
// functions/.env, which deploy-firebase.yml writes from encrypted GitHub
// secrets (INBOX_EMAIL, SENDER_EMAIL, ADMIN_EMAILS) and never commits.
const INBOX = process.env.INBOX_EMAIL ?? '';
const SENDER = process.env.SENDER_EMAIL || INBOX;

// In the beginning Jirel stays in the loop on everything (Jirel 18.11.26):
// every email the functions send to someone else also goes to her in BCC.
// Never codes (sign-in, 2FA, delete): those are marked noBcc.
{
  const make = nodemailer.createTransport.bind(nodemailer);
  nodemailer.createTransport = (...args) => {
    const tr = make(...args);
    const send = tr.sendMail.bind(tr);
    tr.sendMail = (o, ...rest) => {
      const { noBcc, ...msg } = o ?? {};
      const addr = (x) => String(x?.address ?? x ?? '').trim().toLowerCase();
      const to = [].concat(msg.to ?? []).map(addr);
      const bcc = [].concat(msg.bcc ?? []).map(addr).filter(Boolean);
      const me = INBOX.toLowerCase();
      if (!noBcc && me && !to.includes(me) && !bcc.includes(me)) msg.bcc = [...bcc, INBOX];
      return send(msg, ...rest);
    };
    return tr;
  };
}
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
  const range = encodeURIComponent("'Hosts & Emails'!A2:L400");
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${HOST_SHEET}/values/${range}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`sheet ${res.status}`);
  for (const r of (await res.json()).values ?? []) {
    const slugs = String(r[10] ?? '').toLowerCase().split(/[\s,;]+/);
    if (!slugs.includes(slug)) continue;
    const emails = String(r[3] ?? '').split(/[\s,;/]+/).filter(isEmail);
    // Column L: the language we write to them in (de, en or fr).
    const lang = /^(de|en|fr)$/.test(String(r[11] ?? '').trim()) ? String(r[11]).trim() : '';
    if (emails.length) return { emails, firstName: String(r[0] ?? '').trim().split(/\s+/)[0], lang };
  }
  return null;
};
/** What a host chose in Einstellungen (userSettings of the accounts that
 *  manage this page, hostMembers): { lang, notifyReviews, phone }, or {}. */
const hostPrefs = async (slug) => {
  try {
    const members = await getFirestore().collection('hostMembers').where('slugs', 'array-contains', slug).limit(5).get();
    for (const m of members.docs) {
      let u;
      try { u = await getAuth().getUserByEmail(m.id); } catch { continue; }
      const st = (await getFirestore().doc(`userSettings/${u.uid}`).get()).data();
      if (st) return { lang: st.langAt && /^(de|en|fr)$/.test(st.lang) ? st.lang : '', notifyReviews: st.notifyReviews ?? 'on', phone: st.phone ?? '' };
    }
  } catch (err) { console.error('hostPrefs', slug, err?.message); }
  return {};
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
  const what = /any space|beliebiges Studio|tout atelier/i.test(String(f.Studio ?? '')) ? (de ? 'Raum in Berlin' : 'Studio space in Berlin') : (f.Workshop || f.Studio || f.Type);
  const icon = f.Studio ? '🏠' : emojiFor(what);
  const host = String(f.Host ?? '').trim();
  const when = [String(f.Date ?? '').replace(/^\d{4}-\d\d-\d\d \((.*)\)$/, '$1'), f.Time].filter(Boolean).join(', ');
  // A request for no host in particular (group, team, Christmas party…):
  // we look for the hosts who fit first (Jirel 16.11.26).
  const general = !host && !f.Studio;
  // A studio request (Jirel 17.11.26): it goes to whoever runs the room,
  // or, for "any space", we look for one that fits.
  const room = f.Studio ? String(f.Studio).trim() : '';
  const anyRoom = /any space|beliebiges Studio|tout atelier/i.test(room);
  const pref = String(f['Preferred date'] ?? '').match(/^(\d{4})-(\d\d)-(\d\d)/);
  const prefDate = pref ? new Date(`${pref[0]}T12:00:00`).toLocaleDateString(de ? 'de-DE' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const where = String(f.Where ?? '');
  const anyDate = String(f.Date ?? '').match(/(\d{4})-(\d\d)-(\d\d)/);
  const roomDate = room && anyDate ? new Date(`${anyDate[0]}T12:00:00`).toLocaleDateString(de ? 'de-DE' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const rows = [
    [de ? 'Gastgeber:in' : 'Host', host],
    [de ? 'Wann' : 'When', room ? roomDate : (when || prefDate)],
    [de ? 'Beginn' : 'Start', room ? f['Start time'] : ''],
    [de ? 'Stunden' : 'Hours', room ? f.Hours : ''],
    [de ? 'Personen' : 'People', f.People || f['Group size']],
    [de ? 'Budget p. P.' : 'Budget pp', f['Budget per person'] ? `€${String(f['Budget per person']).replace(/[^\d.,]/g, '')}` : ''],
    [de ? 'Wo' : 'Where', general ? (/studio/i.test(where) ? (de ? 'In einem Atelier' : 'At a studio') : where) : ''],
  ].filter(([, v]) => v);
  const runs = String(f['Runs from'] ?? '').match(/\d+/)?.[0];
  const runsNote = !runs ? '' : de
    ? `Dieser Kurs findet ab ${runs} Teilnehmenden statt. Deine Anfrage wird bestätigt, sobald ${runs} Plätze gebucht sind, und erst dann zahlst du. Kommt er nicht zustande, wird nichts berechnet.`
    : `This class runs from ${runs} participants. Your request is confirmed as soon as ${runs} spots are booked, and only then do you pay. If it doesn’t fill up, nothing is charged.`;
  // Designed like the host's "New booking request" email (Jirel 09.11.26):
  // logo, purple kicker, one big line, a details card, what happens next.
  const t = de ? {
    kicker: 'Anfrage erhalten', head: `Danke${name ? `, ${esc(name)}` : ''}! ${icon}`,
    intro: `Deine Anfrage bei <b>Twiggli</b> ist gut angekommen. Wir haben sie direkt an ${host ? esc(host) : 'den Gastgeber'} weitergegeben.`,
    nextHead: 'Wie geht’s weiter?',
    next: `${host ? esc(host) : 'Der Gastgeber'} meldet sich direkt bei dir per E-Mail, meist innerhalb von 1–2 Tagen, um zu bestätigen oder einen anderen Termin vorzuschlagen. Du musst nichts weiter tun.`,
    q: 'Fragen? Antworte einfach auf diese E-Mail.', bye: 'Liebe Grüße', sig: 'Jirel, Gründerin @ <b>Twiggli</b>',
    subject: `Deine Anfrage bei Twiggli: ${what} ${icon}`,
    ...(room ? {
      kicker: 'Raumanfrage erhalten',
      intro: anyRoom
        ? 'Deine Raumanfrage bei <b>Twiggli</b> ist gut angekommen. Wir schauen jetzt, welcher unserer Räume an deinem Termin frei ist und zu deiner Gruppe passt.'
        : `Deine Raumanfrage bei <b>Twiggli</b> ist gut angekommen. Wir haben sie direkt an ${esc(room)} weitergegeben.`,
      next: anyRoom
        ? 'Wir melden uns innerhalb von 1–2 Tagen mit passenden Räumen bei dir. Du musst nichts weiter tun.'
        : 'Wer den Raum betreut, meldet sich direkt bei dir per E-Mail mit Verfügbarkeit und Preis, meist innerhalb von 1–2 Tagen. Du musst nichts weiter tun.',
    } : {}),
    ...(general ? {
      intro: 'Deine Anfrage bei <b>Twiggli</b> ist gut angekommen. Wir schauen jetzt, welche unserer Gastgeber:innen sie erfüllen können: an deinem Termin, für deine Gruppengröße, in deinem Budget und am passenden Ort.',
      next: 'Wir melden uns innerhalb von 1–2 Tagen mit den passenden Vorschlägen bei dir. Du musst nichts weiter tun.',
    } : {}),
  } : {
    kicker: 'Request received', head: `Thank you${name ? `, ${esc(name)}` : ''}! ${icon}`,
    intro: `Your request on <b>Twiggli</b> has reached us, and we've passed it straight on to ${host ? esc(host) : 'the host'}.`,
    nextHead: 'What happens next?',
    next: `${host ? esc(host) : 'The host'} will get in touch with you directly by email, usually within 1–2 days, to confirm or suggest another date. There is nothing else you need to do.`,
    q: 'Questions? Just reply to this email.', bye: 'Warm regards', sig: 'Jirel, Founder @ <b>Twiggli</b>',
    subject: `Your Twiggli request: ${what} ${icon}`,
    ...(room ? {
      kicker: 'Studio request received',
      intro: anyRoom
        ? 'Your studio request on <b>Twiggli</b> has reached us. We’re now checking which of our spaces is free on your date and fits your group.'
        : `Your studio request on <b>Twiggli</b> has reached us, and we've passed it straight on to ${esc(room)}.`,
      next: anyRoom
        ? 'We’ll get back to you within 1–2 days with spaces that fit. There is nothing else you need to do.'
        : 'Whoever runs the space will get in touch with you directly by email with availability and price, usually within 1–2 days. There is nothing else you need to do.',
    } : {}),
    ...(general ? {
      intro: 'Your request on <b>Twiggli</b> has reached us. We’re now checking which of our hosts can make it happen: on your date, for your group size, within your budget and in the right place.',
      next: 'We’ll get back to you within 1–2 days with the hosts who fit. There is nothing else you need to do.',
    } : {}),
  };
  const cell = 'padding:9px 0;border-bottom:1px solid #efe9e2;font-size:14px';
  const table = rows.map(([k, v]) => `<tr><td style="${cell};color:#6b7076">${esc(k)}</td><td align="right" style="${cell};font-weight:bold">${esc(v)}</td></tr>`).join('');
  const html = `<div style="padding:24px 0;font-family:Tahoma,Arial,sans-serif;color:#24272e">
<table width="600" align="center" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;border-radius:14px;overflow:hidden">
<tr><td style="padding:22px 30px 4px"><table cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="${SITE}/img/logo.png" width="34" height="34" alt="" style="display:block"></td><td style="padding-left:10px;vertical-align:middle;font-weight:bold;font-size:20px">Twiggli</td></tr></table></td></tr>
<tr><td style="padding:18px 30px 0">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6a3eec;font-weight:bold">${t.kicker}</p>
<h1 style="margin:0 0 10px;font-size:24px;line-height:1.25">${t.head}</h1>
<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#454a50">${t.intro}</p>
</td></tr>
<tr><td style="padding:14px 30px 0"><table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px"><tr><td style="padding:16px 18px">
<p style="margin:0 0 4px;font-size:17px;font-weight:bold">${esc(what)}</p>
<table width="100%" cellpadding="0" cellspacing="0">${table}</table>
</td></tr></table></td></tr>
<tr><td style="padding:18px 30px 0">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7076;font-weight:bold">${t.nextHead}</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#454a50">${t.next}${runsNote ? `<br><br>${runsNote}` : ''}</p>
<p style="margin:18px 0 22px;font-size:14px;line-height:1.6;color:#454a50">${t.q}<br><br>${t.bye} 💛<br>${t.sig}</p>
</td></tr>
<tr><td style="padding:14px 30px;font-size:11px;color:#888;line-height:1.6"><a href="${SITE}" style="color:#888">www.twiggli.com</a></td></tr>
</table></div>`;
  const text = `${t.head.replace(/<[^>]+>/g, '')}\n\n${t.intro.replace(/<[^>]+>/g, '')}\n\n${what}\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${t.next}${runsNote ? `\n\n${runsNote}` : ''}\n\n${t.q}\n\n${t.bye}\n${t.sig.replace(/<[^>]+>/g, '')}`;
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  await mail.sendMail({ from: { name: 'Twiggli', address: SENDER }, replyTo: SENDER, to, subject: t.subject, text, html });
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
  // German law (§§ 195, 199 BGB): a voucher stays valid until 31 December
  // of the third year after purchase. Codes issued before 09.11.26 were
  // stored with purchase date + 3 years, so every stored date is read as
  // the end of its year.
  const until = yearEnd(v.validUntil);
  if (until && until < new Date().toISOString().slice(0, 10)) return { error: 'expired' };
  // Amounts held for requests the host hasn't answered yet (7 days at most,
  // as long as Stripe keeps a card hold) are not available meanwhile.
  const balance = Math.round(((v.balance ?? 0) * 100) - heldCents(v)) / 100;
  if (!(balance > 0)) return { error: 'used' };
  if (v.hostSlug && hostSlug && v.hostSlug !== hostSlug) return { error: 'host', host: v.hostSlug };
  return { ok: true, hash, balance, validUntil: until, hostSlug: v.hostSlug ?? '', ref: v.ref ?? '' };
};

const COMPANY = 'Twiggli UG (haftungsbeschränkt) · Rodenkirchener Str. 147 · 50997 Köln';
const isoDay = (d) => d.toISOString().slice(0, 10);
/** 31 December of the year in an ISO date ('2029-10-31' → '2029-12-31'); '' stays ''. */
const yearEnd = (iso) => (/^\d{4}/.test(String(iso ?? '')) ? `${String(iso).slice(0, 4)}-12-31` : '');
/** A voucher bought on `d` is valid until 31 December three years later (§§ 195, 199 BGB). */
const legalUntil = (d) => `${d.getUTCFullYear() + 3}-12-31`;

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
      rows: [['Workshop', m.workshop], ['Bought by', m.buyer_name], ['For', recipient], ['Spots', String(people)], ['Value', eur(amount)], ['Voucher code', code]],
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
  const validUntil = legalUntil(today);
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
    photos: host ? await voucherPhotos(String(m.host_slug)) : [],
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

/** Up to three of the host's photos from their page, for a host voucher
 *  (Jirel 19.11.26: "pictures that fit the voucher"); none: the collage. */
const voucherPhotos = async (slug) => {
  if (!SLUG.test(slug)) return [];
  // Their photos only (a video still is often blurry: then the collage,
  // Jirel 20.11.26); tiny files are the plain placeholders some hosts have.
  const paths = [`/img/hosts/${slug}.jpg`, ...[1, 2, 3, 4, 5, 6].map((n) => `/img/hosts/${slug}-${n}.jpg`), `/img/hosts/${slug}-wide.jpg`];
  const got = await Promise.all(paths.map(async (p) => {
    try {
      const r = await fetch(`${SITE}${p}`, { signal: AbortSignal.timeout(5000) });
      if (!r.ok || !/jpe?g/.test(r.headers.get('content-type') ?? '')) return null;
      const b = Buffer.from(await r.arrayBuffer());
      return b.length > 8000 ? b : null;
    } catch { return null; }
  }));
  return got.filter(Boolean).slice(0, 3);
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
  const today = new Date();
  const code = 'TW-TEST-0000';
  const v = {
    lang, amount: 50, code, validUntil: legalUntil(today), date: isoDay(today), order: 'VC-TEST', company: COMPANY,
    recipient: gift ? 'Lena' : '', message: gift ? (lang === 'de' ? 'Alles Liebe zum Geburtstag! Such dir was Schönes aus.' : 'Happy birthday! Pick something lovely.') : '',
  };
  const ph = typeof req.query.host === 'string' && SLUG.test(req.query.host) ? req.query.host : '';
  if (ph) { v.host = ph; v.photos = await voucherPhotos(ph); }
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
        ? `VALID: €${v.balance} left, valid until ${yearEnd(v.validUntil)}${v.ref ? `, order ${v.ref}` : ''}. Deduct it from the price and note it on the voucher.`
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

/** Hosts who have left Twiggli (site/src/data/hosts/archived.ts): their
 *  requests go to Jirel only. */
const ARCHIVED_HOSTS = new Set(['sabine', 'celia', 'mampe', 'dirt', 'munio', 'loam', 'tufttuft']);

/** "New booking request": the request goes straight to the host the moment
 *  the guest sends it (Jirel, 09.11.26), in the designed layout of the
 *  forwards sent by hand before, in the host's language (column L of
 *  'Hosts & Emails'). Reply goes to the guest, Jirel in CC. Only for a
 *  request to one host (booking, group, date request) with a date not in
 *  the past; anything else stays with Jirel. Returns what happened, for
 *  the note to Jirel's inbox. */
/** Whether a page's host has a Twiggli account with Stripe connected
 *  (hostMembers/{email}.stripe.accountId, set by hostStripe / hostStripeOAuth). */
const hostStripeReady = async (slug) => {
  const members = await getFirestore().collection('hostMembers').where('slugs', 'array-contains', slug).limit(5).get();
  return members.docs.some((m) => /^acct_\w+$/.test(String(m.data()?.stripe?.accountId ?? '')));
};

const notifyHostRequest = async (doc, email, f) => {
  const data = (await doc.get()).data() ?? {};
  const slug = String(data.hostSlug ?? '');
  const type = String(f.Type ?? '');
  if (!SLUG.test(slug) || !/^(Booking request|Group booking request|Date request|Studio rental request)$/.test(type)) return '';
  // Studio requests go to whoever runs the room, the same way (Jirel 17.11.26).
  const studio = type === 'Studio rental request';
  if (data.hostMailedAt) return 'already sent';
  if (ARCHIVED_HOSTS.has(slug)) return 'NOT sent: host has left Twiggli';
  const iso = String(f.Date ?? '').match(/(\d{4}-\d\d-\d\d)/)?.[1] ?? '';
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
  if (iso && iso < today) return 'NOT sent: date is in the past';
  let who = null;
  try { who = await hostContact(slug); } catch (err) {
    console.error('host lookup failed', slug, err?.message);
    return `NOT sent: could not read 'Hosts & Emails' (${String(err?.message ?? err).slice(0, 80)}). Please forward by hand.`;
  }
  if (!who) return `NOT sent: no email for "${slug}" in 'Hosts & Emails'`;
  // Their own choice in Einstellungen → Präferenzen wins over column L.
  const lang = (await hostPrefs(slug)).lang || who.lang || HOST_LANG[slug] || 'de';
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
  const soon = iso === today ? 'today' : iso === tomorrow ? 'tomorrow' : '';
  const guest = String(f.Name ?? '').trim();
  const gFirst = guest.split(/\s+/)[0] || guest;
  const what = String((studio ? f.Studio : f.Workshop) ?? '').trim();
  const people = Number(String(f.People ?? '').match(/\d+/)?.[0] ?? 0);
  const prices = String(f.Price ?? '').replace(/\./g, '').match(/\d+(?:,\d+)?/g)?.map((x) => Number(x.replace(',', '.'))) ?? [];
  const one = prices.length === 1 ? prices[0] : 0;
  const eur = (n) => `€${(Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '')}`;
  const when = String(f.Date ?? '').replace(/^(?:preferred: )?\d{4}-\d\d-\d\d \((.*?)\)$/, '$1').replace(/^flexible: /, '');
  const often = /regular/i.test(String(f['How often'] ?? ''));
  // Accept / Decline buttons (Jirel 22.11.26), only for hosts with an account
  // and Stripe connected: each opens this request in their dashboard
  // (Messages), where the same confirm popup as there takes the answer.
  let buttons = false;
  if (type === 'Booking request' || type === 'Group booking request') {
    try { buttons = await hostStripeReady(slug); } catch (err) { console.error('stripe check failed', slug, err?.message); }
  }
  const T = {
    de: {
      kicker: `Neue ${studio ? 'Raumanfrage' : type === 'Group booking request' ? 'Gruppenanfrage' : type === 'Date request' ? 'Terminanfrage' : 'Buchungsanfrage'}${soon === 'today' ? ' · heute' : soon === 'tomorrow' ? ' · morgen' : ''}`,
      head: `Antworte auf ${esc(gFirst)}s Anfrage`,
      hi: `Hallo${who.firstName ? ` ${esc(who.firstName)}` : ''},`,
      intro: soon
        ? `${esc(guest)} möchte ${soon === 'today' ? '<b>heute</b>' : '<b>morgen</b>'} zu dir kommen. Bitte ruf an oder schreib so schnell wie möglich, am besten mit Antwort auf diese E-Mail (ich bin in CC).`
        : studio ? `${esc(guest)} möchte über <b>Twiggli</b> deinen Raum mieten. Bitte melde dich direkt bei ${esc(gFirst)} mit Verfügbarkeit und Preis, am einfachsten mit Antwort auf diese E-Mail (ich bin in CC).`
        : `${esc(guest)} hat über <b>Twiggli</b> bei dir angefragt. Bitte melde dich direkt bei ${esc(gFirst)}, am einfachsten mit Antwort auf diese E-Mail (ich bin in CC).`,
      date: type === 'Date request' ? `${esc(gFirst)} hat keinen passenden Termin gefunden. Magst du einen öffnen oder einen anderen vorschlagen?` : '',
      rows: studio ? [['Raum', what], ['Datum', when], ['Beginn', f['Start time']], ['Stunden', f.Hours], ['Wie oft', often ? 'Regelmäßig' : 'Einmalig'], ['Personen', f.People]]
        : [['Workshop', what], ['Datum', when], ['Uhrzeit', f.Time], ['Personen', f.People], ['Preis pro Person', f.Price]],
      msg: 'Nachricht', earn: 'Mögliche Einnahmen', earnNote: (g) => `${eur(g)} gesamt, ${eur(g * 0.85)} nach 15 % Twiggli-Provision (falls für dich vereinbart)`,
      contact: 'Kontakt', bye: 'Liebe Grüße', sig: 'Jirel, Gründerin @ <b>Twiggli</b>',
      yes: 'Annehmen', no: 'Ablehnen', act: `Beides öffnet die Anfrage direkt in deinem <b>Twiggli</b>-Konto, und ${esc(gFirst)} bekommt deine Antwort automatisch.`,
      subject: `Neue ${studio ? 'Raumanfrage' : 'Anfrage'} über Twiggli: ${what}${when ? `, ${when}` : ''}${people ? ` (${people} ${people === 1 ? 'Person' : 'Personen'})` : ''}${soon === 'today' ? ' · heute' : soon === 'tomorrow' ? ' · morgen' : ''} 💌`,
    },
    en: {
      kicker: `New ${studio ? 'studio request' : type === 'Group booking request' ? 'group request' : type === 'Date request' ? 'date request' : 'booking request'}${soon === 'today' ? ' · today' : soon === 'tomorrow' ? ' · tomorrow' : ''}`,
      head: `Reply to ${esc(gFirst)}'s request`,
      hi: `Hi${who.firstName ? ` ${esc(who.firstName)}` : ''},`,
      intro: soon
        ? `${esc(guest)} would like to come <b>${soon}</b>. Please call or write as soon as you can, easiest by replying to this email (I'm in CC).`
        : studio ? `${esc(guest)} would like to rent your space through <b>Twiggli</b>. Please get in touch with ${esc(gFirst)} directly with availability and price, easiest by replying to this email (I'm in CC).`
        : `${esc(guest)} sent you a request on <b>Twiggli</b>. Please get in touch with ${esc(gFirst)} directly, easiest by replying to this email (I'm in CC).`,
      date: type === 'Date request' ? `${esc(gFirst)} didn't find a date that works. Could you open one, or suggest another?` : '',
      rows: studio ? [['Space', what], ['Date', when], ['Start', f['Start time']], ['Hours', f.Hours], ['How often', often ? 'Regularly' : 'One time'], ['People', f.People]]
        : [['Workshop', what], ['Date', when], ['Time', f.Time], ['People', f.People], ['Price per person', f.Price]],
      msg: 'Message', earn: 'Your earnings', earnNote: (g) => `${eur(g)} in total, ${eur(g * 0.85)} after the 15% Twiggli commission (where agreed with you)`,
      contact: 'Contact', bye: 'Warm regards', sig: 'Jirel, Founder @ <b>Twiggli</b>',
      yes: 'Accept', no: 'Decline', act: `Both open the request straight in your <b>Twiggli</b> account, and ${esc(gFirst)} gets your answer automatically.`,
      subject: `New ${studio ? 'studio request' : 'request'} via Twiggli: ${what}${when ? `, ${when}` : ''}${people ? ` (${people} ${people === 1 ? 'person' : 'people'})` : ''}${soon ? ` · ${soon}` : ''} 💌`,
    },
    fr: {
      kicker: `Nouvelle demande${studio ? ' de location' : ''}${soon === 'today' ? ' · aujourd’hui' : soon === 'tomorrow' ? ' · demain' : ''}`,
      head: `Réponds à la demande de ${esc(gFirst)}`,
      hi: `Coucou${who.firstName ? ` ${esc(who.firstName)}` : ''},`,
      intro: soon
        ? `${esc(guest)} aimerait venir <b>${soon === 'today' ? 'aujourd’hui' : 'demain'}</b>. Appelle ou écris dès que possible, le plus simple en répondant à ce mail (je suis en copie).`
        : studio ? `${esc(guest)} aimerait louer ton espace via <b>Twiggli</b>. Contacte ${esc(gFirst)} directement avec tes disponibilités et ton prix, le plus simple en répondant à ce mail (je suis en copie).`
        : `${esc(guest)} t’a envoyé une demande sur <b>Twiggli</b>. Contacte ${esc(gFirst)} directement, le plus simple en répondant à ce mail (je suis en copie).`,
      date: type === 'Date request' ? `${esc(gFirst)} n’a pas trouvé de date qui convient. Tu peux en ouvrir une ou en proposer une autre ?` : '',
      rows: studio ? [['Espace', what], ['Date', when], ['Début', f['Start time']], ['Heures', f.Hours], ['Fréquence', often ? 'Régulièrement' : 'Une fois'], ['Personnes', f.People]]
        : [['Atelier', what], ['Date', when], ['Heure', f.Time], ['Personnes', f.People], ['Prix par personne', f.Price]],
      msg: 'Message', earn: 'Revenus possibles', earnNote: (g) => `${eur(g)} au total, ${eur(g * 0.85)} après la commission Twiggli de 15 % (si convenue avec toi)`,
      contact: 'Contact', bye: 'Bises', sig: 'Jirel, fondatrice @ <b>Twiggli</b>',
      yes: 'Accepter', no: 'Refuser', act: `Les deux ouvrent la demande directement dans ton espace <b>Twiggli</b>, et ${esc(gFirst)} reçoit ta réponse automatiquement.`,
      subject: `Nouvelle ${studio ? 'demande de location' : 'demande'} via Twiggli : ${what}${when ? `, ${when}` : ''}${people ? ` (${people} pers.)` : ''} 💌`,
    },
  }[lang] ?? null;
  if (!T) return '';
  const gross = !studio && one && people ? one * people : 0;
  const cell = 'padding:9px 0;border-bottom:1px solid #efe9e2;font-size:14px';
  const table = T.rows.filter(([, v]) => v).map(([k, v]) => `<tr><td style="${cell};color:#6b7076">${esc(k)}</td><td align="right" style="${cell};font-weight:bold">${esc(v)}</td></tr>`).join('');
  const message = String((studio ? f['Special notes'] : f.Message) ?? '').trim();
  const contact = [guest && `<b>${esc(guest)}</b>`, isEmail(email) && `<a href="mailto:${esc(email)}" style="color:#6a3eec">${esc(email)}</a>`, f.Phone && `<a href="tel:${esc(String(f.Phone).replace(/\s/g, ''))}" style="color:#6a3eec">${esc(f.Phone)}</a>`].filter(Boolean).join('<br>');
  const answerUrl = (act) => `${SITE}${lang === 'en' ? '' : `/${lang}`}/host/account/messages/?req=${encodeURIComponent(doc.id)}&act=${act}`;
  const actRow = buttons ? `<tr><td style="padding:18px 30px 0"><table cellpadding="0" cellspacing="0"><tr>
<td style="border-radius:10px;background:#6a3eec"><a href="${answerUrl('accept')}" style="display:inline-block;padding:12px 26px;font-size:15px;font-weight:bold;color:#fff;text-decoration:none;border-radius:10px">${T.yes}</a></td>
<td style="width:10px"></td>
<td style="border-radius:10px;border:1px solid #6a3eec"><a href="${answerUrl('decline')}" style="display:inline-block;padding:11px 24px;font-size:15px;font-weight:bold;color:#6a3eec;text-decoration:none;border-radius:10px">${T.no}</a></td>
</tr></table><p style="margin:10px 0 0;font-size:13px;line-height:1.5;color:#6b7076">${T.act}</p></td></tr>` : '';
  const html = `<div style="padding:24px 0;font-family:Tahoma,Arial,sans-serif;color:#24272e">
<table width="600" align="center" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;border-radius:14px;overflow:hidden">
<tr><td style="padding:22px 30px 4px"><table cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="${SITE}/img/logo.png" width="34" height="34" alt="" style="display:block"></td><td style="padding-left:10px;vertical-align:middle;font-weight:bold;font-size:20px">Twiggli</td></tr></table></td></tr>
<tr><td style="padding:18px 30px 0">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6a3eec;font-weight:bold">${T.kicker} ${emojiFor(what)}</p>
<h1 style="margin:0 0 12px;font-size:24px;line-height:1.25">${T.head}</h1>
<p style="margin:0 0 6px;font-size:14px;line-height:1.6;color:#454a50">${T.hi}</p>
<p style="margin:0 0 ${T.date ? 6 : 16}px;font-size:14px;line-height:1.6;color:#454a50">${T.intro}</p>
${T.date ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#454a50">${T.date}</p>` : ''}
</td></tr>
<tr><td style="padding:6px 30px 0"><table width="100%" cellpadding="0" cellspacing="0">${table}</table></td></tr>
${actRow}
${message ? `<tr><td style="padding:16px 30px 0"><p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7076;font-weight:bold">${T.msg}</p><p style="margin:0;padding:10px 14px;border-left:3px solid #6a3eec;font-size:14px;line-height:1.6;color:#454a50;white-space:pre-wrap">${esc(message)}</p></td></tr>` : ''}
${gross ? `<tr><td style="padding:16px 30px 0"><p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#1f8a4c;font-weight:bold">${T.earn}</p><p style="margin:0;font-size:15px;color:#1f8a4c;font-weight:bold">${T.earnNote(gross)}</p></td></tr>` : ''}
<tr><td style="padding:16px 30px 0"><p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7076;font-weight:bold">${T.contact}</p><p style="margin:0;font-size:14px;line-height:1.7">${contact}</p>
<p style="margin:20px 0 22px;font-size:14px;line-height:1.6;color:#454a50">${T.bye} 💛<br>${T.sig}</p></td></tr>
<tr><td style="padding:14px 30px;font-size:11px;color:#888;line-height:1.6"><a href="${SITE}" style="color:#888">www.twiggli.com</a></td></tr>
</table></div>`;
  const strip = (h) => String(h).replace(/<[^>]+>/g, '');
  const text = [T.hi, strip(T.intro), strip(T.date), '', ...T.rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`), buttons ? `\n${T.yes}: ${answerUrl('accept')}\n${T.no}: ${answerUrl('decline')}` : '', message ? `\n${T.msg}: ${message}` : '', gross ? `\n${T.earn}: ${T.earnNote(gross)}` : '', `\n${T.contact}: ${[guest, email, f.Phone].filter(Boolean).join(', ')}`, `\n${T.bye}\n${strip(T.sig)}`].filter((x) => x !== '').join('\n');
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  await mail.sendMail({
    from: { name: 'Twiggli', address: SENDER }, to: who.emails, ...(INBOX ? { cc: INBOX } : {}),
    ...(isEmail(email) ? { replyTo: [email, INBOX] } : {}), subject: T.subject, text, html,
  });
  await doc.update({ hostMailedAt: FieldValue.serverTimestamp(), hostMailedTo: who.emails });
  return `sent to ${who.emails.join(', ')} (${lang})`;
};

/** A saved request reaches people: the guest's "we got it" email and the
 *  note to Jirel's inbox (marked mailed). */
const deliverRequest = async (doc, subject, email, fields) => {
    // The guest hears that their request arrived (Jirel, 30.10.26), so they
  // don't send it twice. Only for requests, not for notes like vouchers.
  if (isEmail(email) && /request/i.test(String(fields.Type ?? '')) && !/voucher/i.test(String(fields.Type ?? ''))) {
    try { await confirmGuest(email, fields); } catch (err) { console.error('guest confirmation failed', doc.id, err?.message); }
  }
  // The host hears about it straight away (Jirel, 09.11.26); the note to
  // Jirel below says whether it went out.
  try {
    const sent = await notifyHostRequest(doc, email, fields);
    if (sent) fields['Host notified'] = sent;
  } catch (err) {
    console.error('host request mail failed', doc.id, err?.message);
    fields['Host notified'] = `NOT sent (error: ${String(err?.message ?? err).slice(0, 120)}). Please forward by hand.`;
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

// ── Two-factor sign-in (Jirel 15.11.26), opt-in per account ──────────────
// An authenticator app (TOTP, RFC 6238: SHA-1, 30 s, 6 digits) on top of the
// email code or Google. twoFactor/{uid} exists only while it is on and
// holds the secret encrypted (AES-256-GCM, key from _config/hostAccess) and
// eight one-time backup codes as hashes. A session that passed the second
// step carries the claim mfa (a custom token from twoFactor below); while
// 2FA is on, every function here and the Firestore host rules refuse a
// session without it. Only the website checks it: the app signs in on its own.
const tfaDoc = (uid) => getFirestore().doc(`twoFactor/${uid}`);
const tfaPendingDoc = (uid) => getFirestore().doc(`twoFactorPending/${uid}`);
const tfaCache = new Map();
const tfaOn = async (uid) => {
  const hit = tfaCache.get(uid);
  if (hit && hit.at > Date.now() - 60_000) return hit.on;
  const on = (await tfaDoc(uid).get()).exists;
  tfaCache.set(uid, { on, at: Date.now() });
  return on;
};
/** True when this account has 2FA on and the session skipped the second step. */
const mfaMissing = async (t) => !t.mfa && await tfaOn(t.uid);
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const b32encode = (buf) => {
  let bits = 0, val = 0, out = '';
  for (const byte of buf) { val = (val << 8) | byte; bits += 8; while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
};
const totpAt = (secret, step) => {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(step));
  const h = createHmac('sha1', secret).update(msg).digest();
  const o = h[h.length - 1] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, '0');
};
/** The 30-second step a code matches (one step either side for clock
 *  drift), or -1. */
const totpStep = (secret, code) => {
  const now = Math.floor(Date.now() / 30_000);
  for (const d of [0, -1, 1]) {
    const a = Buffer.from(totpAt(secret, now + d));
    const b = Buffer.from(String(code).padStart(6, '0').slice(0, 6));
    if (a.length === b.length && timingSafeEqual(a, b)) return now + d;
  }
  return -1;
};
const tfaKey = async () => createHash('sha256').update(`totp\n${await approveKey()}`).digest();
const seal = async (buf) => {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', await tfaKey(), iv);
  const enc = Buffer.concat([c.update(buf), c.final()]);
  return [iv, c.getAuthTag(), enc].map((x) => x.toString('base64')).join('.');
};
const unseal = async (str) => {
  const [iv, tag, enc] = String(str).split('.').map((x) => Buffer.from(x, 'base64'));
  const d = createDecipheriv('aes-256-gcm', await tfaKey(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]);
};
const backupHash = (key, code) => createHmac('sha256', key).update(`backup\n${code.replace(/[^a-z0-9]/gi, '').toLowerCase()}`).digest('hex');
const newBackupCodes = () => Array.from({ length: 8 }, () => {
  const raw = b32encode(randomBytes(6)).slice(0, 8).toLowerCase();
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
});

/** Who is calling, from the Firebase sign-in token the page sends. */
const caller = async (req) => {
  const m = /^Bearer (.+)$/.exec(req.get('authorization') ?? '');
  if (!m) return null;
  try {
    const t = await getAuth().verifyIdToken(m[1], true);
    if (await mfaMissing(t)) return null;
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

export const hostApprove = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 5 }, async (req, res) => {
  const email = String(req.query.e ?? '').toLowerCase();
  const slug = String(req.query.s ?? '');
  const k = String(req.query.k ?? '');
  const decline = req.query.a === 'decline';
  const page = (msg) => res.status(200).set('Content-Type', 'text/html; charset=utf-8')
    .send(`<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:Tahoma,sans-serif;max-width:520px;margin:60px auto;padding:0 16px"><h2>Twiggli host accounts</h2><p>${msg}</p></body>`);
  if (!SLUG.test(slug) || !isEmail(email) || !/^[0-9a-f]{64}$/.test(k)) return page('This link is not valid.');
  const want = Buffer.from(sign(await approveKey(), email, decline ? `decline:${slug}` : slug), 'hex');
  if (!timingSafeEqual(want, Buffer.from(k, 'hex'))) return page('This link is not valid.');
  const db = getFirestore();
  const appRef = db.doc(`hostApplications/${email}`);
  const application = (await appRef.get()).data();
  const newHost = application?.slug === slug;
  // Opening the link only asks: mail scanners open links on their own, so
  // access is given by the button (a POST), never by the visit.
  if (req.method !== 'POST') {
    if (decline) return page(`Decline <b>${esc(application?.name ?? email)}</b> (${esc(email)})? Their workshop stays offline and they get a short, friendly email.<form method="post"><button style="font-size:16px;background:#b3261e;color:#fff;border:0;padding:10px 18px;border-radius:8px;cursor:pointer">Decline</button></form>`);
    return page(`${newHost ? `Approve <b>${esc(application.name)}</b> (${esc(email)}) as a new host? Their workshop goes live and they can post freely from now on.` : `Give <b>${esc(email)}</b> access to edit <b>${esc(slug)}</b>?`}<form method="post"><button style="font-size:16px;background:#1f6f43;color:#fff;border:0;padding:10px 18px;border-radius:8px;cursor:pointer">Approve</button></form>`);
  }
  const waiting = newHost ? (await db.collection('hostEvents').where('slug', '==', slug).get()).docs.filter((d) => d.data().status === 'pending') : [];
  if (decline) {
    if (!newHost) return page('Nothing to decline.');
    await appRef.set({ status: 'declined', decidedAt: FieldValue.serverTimestamp() }, { merge: true });
    await Promise.all(waiting.map((d) => d.ref.set({ status: 'declined' }, { merge: true })));
    try { await mailHostStatus(email, application.name, waiting[0]?.data().title ?? '', 'declined', application.lang); } catch (err) { console.error('decline mail', err?.message); }
    return page(`Declined: <b>${esc(application.name)}</b> got a short, friendly email. Nothing of theirs is on Twiggli.`);
  }
  await grant(email, slug);
  if (newHost) {
    await db.doc(`pageOwners/${slug}`).set({ email, claimedAt: FieldValue.serverTimestamp() });
    await appRef.set({ status: 'approved', decidedAt: FieldValue.serverTimestamp() }, { merge: true });
    await Promise.all(waiting.map((d) => d.ref.set({ status: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() }, { merge: true })));
    try { await mailHostStatus(email, application.name, waiting[0]?.data().title ?? '', 'approved', application.lang); } catch (err) { console.error('approve mail', err?.message); }
    try { await mailJirel({ subject: `New host approved: ${application.name} (${slug})`, text: `${application.name} (${email}) is approved as "${slug}". Their page on twiggli.com still needs to be made from their first workshop (ask Claude).` }); } catch {}
    return page(`Approved: <b>${esc(application.name)}</b> is a host now and their workshop is live. They got an email. Their own page on the website still needs to be made (ask Claude).`);
  }
  await getFirestore().doc(`hostClaims/${email}__${slug}`).set({ status: 'approved', approvedAt: FieldValue.serverTimestamp() }, { merge: true });
  return page(`Approved: <b>${esc(email)}</b> can now edit <b>${esc(slug)}</b>. They see it the next time they open their account (twiggli.com/host/account/). Let them know it's ready.`);
});

/** Requests for the pages the caller manages (Jirel: any page she asks for). */
// A host with a second page (Jirel 20.11.26: Pia's Christmas painting is its
// own page, pia-christmas) manages both from one account.
const LINKED_PAGES = { pia: ['pia-christmas'] };
const mySlugs = async (email) => {
  const own = (await getFirestore().doc(`hostMembers/${email}`).get()).data()?.slugs ?? [];
  return [...new Set([...own, ...own.flatMap((s) => LINKED_PAGES[s] ?? [])])];
};

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
    // Accepted: the full address to pass on (the workshop's own place, else the studio).
    let where = '';
    if (action === 'accept') {
      try {
        const key = slugify(x.fields?.Workshop || '');
        const listing = key ? (await getFirestore().doc(`hostListings/${x.hostSlug}__${key}`).get()).data()?.edit : null;
        where = whereBox(await fullAddressFor(x.hostSlug, listing?.where ? listing : null), false).text;
      } catch (err) { console.error('accept address', err?.message); }
    }
    await mailJirel({
      subject: `Host ${ACTIONS[action] || 'wrote'}: ${x.subject}`,
      replyTo: isEmail(x.email) ? x.email : undefined,
      text: `${email} ${ACTIONS[action] || 'sent a message about'} the request from ${guest}.${when ? `\nSuggested time: ${when}` : ''}${entry.workshop ? `\nWorkshop: ${entry.workshop}` : ''}${entry.people ? `\nPeople: ${entry.people}` : ''}${entry.extras?.length ? `\nExtras: ${entry.extras.map((x) => `${x.name || 'extra'} €${x.amt}`).join(', ')}` : ''}${entry.total ? `\nOffered total: €${entry.total}` : ''}${entry.price ? ` (€${entry.price} per person)` : ''}${entry.reason ? `\nReason (not for the guest): ${entry.reason}` : ''}${message ? `\nMessage: ${message}` : ''}\n\nGuest: ${x.email || 'no email'}${where ? `\n\nFor the guest (full address, only now they are booked):\n${where}` : ''}`,
    });
  } catch (err) { console.error('hostReply note failed', err?.message); }
  return res.status(200).json({ status: ACTIONS[action] });
});

/** A host's reply to a paid booking's guest (dashboard Messages and Calendar):
 *  kept on the booking (thread) and emailed to the guest, who can answer by
 *  email straight to the host (Jirel in BCC, as every email). */
export const hostBookingReply = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const id = String(req.body?.id ?? '');
  const message = String(req.body?.message ?? '').replace(/\r/g, '').trim().slice(0, 2000);
  if (!/^(cs_(live|test)_\w{10,200}|vb[0-9a-f]{24})$/.test(id) || !message) return res.status(400).json({ error: 'Bad request' });
  const ref = getFirestore().doc(`bookings/${id}`);
  const bk = (await ref.get()).data();
  if (!bk || bk.status !== 'paid' || !(await mayEdit(email, bk.slug))) return res.status(403).json({ error: 'Not your booking' });
  const entry = { from: 'host', by: email, message, at: Date.now() };
  await ref.update({ thread: FieldValue.arrayUnion(entry) });
  const de = bk.lang === 'de';
  const host = bk.hostName || (de ? 'Deine Gastgeberin' : 'Your host');
  const first = String(bk.name ?? '').split(/\s+/)[0];
  try {
    const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
    await mail.sendMail({
      from: { name: `${bk.hostName || 'Twiggli'} via Twiggli`, address: SENDER }, replyTo: bk.hostEmail || SENDER, to: bk.email,
      subject: de ? `Nachricht von ${host}: ${bk.title}` : `Message from ${host}: ${bk.title}`,
      text: `${de ? 'Hallo' : 'Hi'} ${first},\n\n${message}\n\n${host}\n\n(${bk.title}, ${bk.date} ${bk.start}. ${de ? 'Antworte einfach auf diese E-Mail.' : 'Just reply to this email.'})`,
      html: `<div style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.6;color:#24272e;max-width:520px">${de ? 'Hallo' : 'Hi'} ${esc(first)},<div style="margin:14px 0;padding:12px 14px;border-radius:12px;background:#f3eeff;white-space:pre-line">💬 ${esc(message)}</div>${esc(host)}<br><span style="color:#8b87a0;font-size:13px">${esc(bk.title)}, ${esc(bk.date)} ${esc(bk.start)} · ${de ? 'Antworte einfach auf diese E-Mail.' : 'Just reply to this email.'}</span></div>`,
    });
  } catch (err) { console.error('booking reply mail failed', id, err?.message); }
  return res.status(200).json({ ok: true, entry: { from: 'host', message, at: entry.at } });
});

/** The studio address (Settings → Your studio): full address private
 *  (hostPrivate/{slug}), and only what guests may see goes on the page
 *  (hostProfiles place). For the host and for an admin acting as them. */
export const hostAddress = onRequest({ region: 'europe-west3', maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const b = req.body ?? {};
  const slug = String(b.slug ?? '');
  if (!SLUG.test(slug) || !(await mayEdit(email, slug))) return res.status(403).json({ error: 'Not your page' });
  const ref = getFirestore().doc(`hostPrivate/${slug}`);
  if (b.action === 'get') return res.status(200).json({ studio: (await ref.get()).data()?.studio ?? null });
  const studio = cleanAddress({ ...b, howTo: b.howTo ?? '' });
  delete studio.name;
  if (!studio.district) return res.status(400).json({ error: 'district' });
  const visible = visibleAddress(studio);
  await ref.set({ slug, studio, by: email, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  // The page shows only the visible part (and the studio's name, if any).
  const name = b.studioName !== undefined ? text(b.studioName, 80) : undefined;
  for (const lang of ['en', 'de']) {
    await getFirestore().doc(`hostProfiles/${slug}_${lang}`).set({ slug, lang, place: visible, ...(name !== undefined ? { studio: name } : {}), updated_at: new Date().toISOString(), updated_by: email }, { merge: true });
  }
  try { await mailJirel({ subject: `${slug}: studio address changed`, text: `${email} changed the studio address of ${slug}. Guests now see: "${visible}" (${studio.vis}).` }); } catch (err) { console.error('address note failed', err?.message); }
  return res.status(200).json({ studio, visible });
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

// ── Draft pages going live (Jirel 19.11.26) ─────────────────────────────
// A page Claude built as a preview (site/src/data/hosts/preview.ts) is the
// host's to finish in the dashboard. When they are happy with it they press
// "Publish my page": Jirel gets an email with an Approve link (the same
// signed GET-asks / POST-acts pattern as hostApprove), and once she approves,
// the slug goes into _config/publishedHosts. publicEvents hands that list to
// the build (scripts/fetch-host-edits.mjs), which takes the page out of
// preview: listed, searchable and in the sitemap from the next build on.
// pagePublish/{slug} (server-only, firestore.rules) remembers who asked.
const publishedSlugs = async () => (await getFirestore().doc('_config/publishedHosts').get()).data()?.slugs ?? [];

export const hostPublish = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const slug = String(req.body?.slug ?? '');
  if (!SLUG.test(slug)) return res.status(400).json({ error: 'Bad page' });
  if (!(await mayEdit(email, slug))) return res.status(403).json({ error: 'Not your page' });
  const ref = getFirestore().doc(`pagePublish/${slug}`);
  const old = (await ref.get()).data();
  const status = (await publishedSlugs()).includes(slug) ? 'approved' : old?.status === 'pending' ? 'pending' : 'draft';
  // The dashboard asks first, to show the right line under the button.
  if (req.body?.check || status !== 'draft') return res.status(200).json({ status });
  const name = text(req.body?.name, 120);
  // The page's path on the site, for Jirel to look at it first.
  const path = /^\/[a-z0-9/-]{1,120}\/$/.test(String(req.body?.page ?? '')) ? req.body.page : '';
  await ref.set({ slug, email, name, status: 'pending', askedAt: FieldValue.serverTimestamp() });
  const link = `${FUNCTIONS_URL}/hostPublishApprove?s=${slug}&k=${sign(await approveKey(), 'publish', slug)}`;
  try {
    await mailJirel({
      subject: `Publish request: ${name || email} wants "${slug}" live`,
      replyTo: email,
      text: `${name || email} (${email}) finished their draft page "${slug}" and asks to publish it.${path ? `\n\nThe draft: ${SITE}${path}` : ''}\n\nApprove: ${link}\n\nIgnore this email to keep it a draft.`,
      html: `<div style="font-family:Tahoma,sans-serif;font-size:15px"><p><b>${esc(name || email)}</b> (${esc(email)}) finished their draft page <b>${esc(slug)}</b> and asks to publish it.</p>${path ? `<p>The draft: <a href="${SITE}${path}">${SITE}${path}</a></p>` : ''}<p><a href="${link}" style="display:inline-block;background:#1f6f43;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Approve and publish</a></p><p style="color:#777">Not ready yet? Just ignore this email: the page stays a hidden draft.</p></div>`,
    });
  } catch (err) { console.error('hostPublish mail failed', err?.message); }
  return res.status(200).json({ status: 'pending' });
});

export const hostPublishApprove = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 5 }, async (req, res) => {
  const slug = String(req.query.s ?? '');
  const k = String(req.query.k ?? '');
  const page = (msg) => res.status(200).set('Content-Type', 'text/html; charset=utf-8')
    .send(`<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:Tahoma,sans-serif;max-width:520px;margin:60px auto;padding:0 16px"><h2>Twiggli host pages</h2><p>${msg}</p></body>`);
  if (!SLUG.test(slug) || !/^[0-9a-f]{64}$/.test(k)) return page('This link is not valid.');
  const want = Buffer.from(sign(await approveKey(), 'publish', slug), 'hex');
  if (!timingSafeEqual(want, Buffer.from(k, 'hex'))) return page('This link is not valid.');
  const db = getFirestore();
  const ask = (await db.doc(`pagePublish/${slug}`).get()).data();
  // Opening the link only asks (mail scanners open links): the button acts.
  if (req.method !== 'POST') return page(`Publish the page <b>${esc(slug)}</b>${ask?.email ? ` (asked by ${esc(ask.email)})` : ''}? It goes into the listings, search and the sitemap with the next site build (daily, or run the deploy).<form method="post"><button style="font-size:16px;background:#1f6f43;color:#fff;border:0;padding:10px 18px;border-radius:8px;cursor:pointer">Publish</button></form>`);
  await db.doc('_config/publishedHosts').set({ slugs: FieldValue.arrayUnion(slug), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await db.doc(`pagePublish/${slug}`).set({ slug, status: 'approved', decidedAt: FieldValue.serverTimestamp() }, { merge: true });
  if (ask?.email) {
    try {
      const prefs = await hostPrefs(slug).catch(() => null);
      const lang = prefs?.lang === 'de' || prefs?.lang === 'fr' ? prefs.lang : 'de';
      const first = String(ask.name || '').split(' ')[0];
      const T = {
        de: [`Deine Seite geht live${first ? `, ${first}` : ''}!`, 'Jirel hat deine Twiggli-Seite freigegeben. Mit dem nächsten Update der Website (spätestens morgen) steht sie in den Listen, in der Suche und im Kalender. Du kannst sie weiter jederzeit in deinem Konto bearbeiten.'],
        en: [`Your page is going live${first ? `, ${first}` : ''}!`, 'Jirel approved your Twiggli page. With the next website update (tomorrow at the latest) it shows up in the listings, in search and in the calendar. You can keep editing it in your account any time.'],
        fr: [`Ta page passe en ligne${first ? `, ${first}` : ''} !`, 'Jirel a validé ta page Twiggli. À la prochaine mise à jour du site (demain au plus tard), elle apparaît dans les listes, la recherche et le calendrier. Tu peux continuer à la modifier dans ton compte.'],
      }[lang];
      const sig = lang === 'de' ? 'Jirel, Gründerin @ Twiggli' : lang === 'fr' ? 'Jirel, fondatrice @ Twiggli' : 'Jirel, Founder @ Twiggli';
      const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
      await mail.sendMail({
        from: { name: 'Twiggli', address: SENDER }, to: ask.email, subject: T[0],
        text: `${T[1]}\n\n💛\n${sig}`,
        html: `<div style="font-family:Tahoma,sans-serif;font-size:15px;line-height:1.55;color:#1d1d1f;max-width:560px"><img src="${SITE}/img/logo.png" alt="Twiggli" width="110" style="display:block;margin-bottom:18px"><h2 style="font-size:20px;margin:0 0 12px">${esc(T[0])}</h2><p>${T[1]}</p><p>💛<br>${sig}</p></div>`,
      });
    } catch (err) { console.error('publish mail', err?.message); }
  }
  return page(`Approved: <b>${esc(slug)}</b> leaves preview with the next site build.${ask?.email ? ` ${esc(ask.email)} got an email.` : ''}`);
});

// ── Tips for a host's page (Jirel 19.11.26) ─────────────────────────────
// The dashboard checks a host's page itself (small photos, no studio
// address, Stripe, dates, video, descriptions, prices) and shows what the
// host can fix. Kept here, server-side: which tips each person dismissed
// (hostTipsSeen/{email}__{slug}: { dismissed: { id: level } }, a tip comes
// back when its level rises), and the notes Jirel writes for a host
// (hostTips/{slug}: { notes: [{ id, text, at }] }; only admins write them).
// Both collections are server-only (firestore.rules: no browser access).
export const hostTips = onRequest({ region: 'europe-west3', maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const slug = String(req.body?.slug ?? '');
  if (!SLUG.test(slug)) return res.status(400).json({ error: 'Bad page' });
  if (!(await mayEdit(email, slug))) return res.status(403).json({ error: 'Not your page' });
  const db = getFirestore();
  const tipsRef = db.doc(`hostTips/${slug}`);
  const seenRef = db.doc(`hostTipsSeen/${email}__${slug}`);
  const ID = /^[a-z0-9:_-]{1,60}$/;
  const action = String(req.body?.action ?? 'get');
  const notesOf = async () => ((await tipsRef.get()).data()?.notes ?? []).filter((x) => x && x.id && x.text);
  if (action === 'dismiss') {
    const id = String(req.body?.id ?? '');
    const level = Math.max(1, Math.min(999, Math.round(Number(req.body?.level) || 1)));
    if (!ID.test(id)) return res.status(400).json({ error: 'Bad tip' });
    await seenRef.set({ dismissed: { [id]: level }, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  } else if (action === 'forget') {
    // Tips that are fixed now: dismissing them again later starts afresh.
    const ids = (Array.isArray(req.body?.ids) ? req.body.ids : []).map(String).filter((x) => ID.test(x)).slice(0, 30);
    if (ids.length) await seenRef.set({ dismissed: Object.fromEntries(ids.map((x) => [x, FieldValue.delete()])) }, { merge: true });
  } else if (action === 'note' || action === 'unnote') {
    if (!ADMINS.includes(email)) return res.status(403).json({ error: 'Admins only' });
    const notes = await notesOf();
    if (action === 'note') {
      const body = String(req.body?.text ?? '').trim().slice(0, 600);
      if (!body) return res.status(400).json({ error: 'Empty note' });
      notes.push({ id: randomBytes(6).toString('hex'), text: body, at: Date.now() });
    }
    const keep = action === 'unnote' ? notes.filter((x) => x.id !== String(req.body?.id ?? '')) : notes;
    await tipsRef.set({ notes: keep.slice(-20), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  } else if (action !== 'get') return res.status(400).json({ error: 'Bad action' });
  const dismissed = (await seenRef.get()).data()?.dismissed ?? {};
  return res.status(200).json({ notes: await notesOf(), dismissed });
});

// ── Twiggli Support in Messages (Jirel 20.11.26: the dashboard is in beta,
// hosts report problems in one pinned conversation). Each host page has its
// own thread (hostSupport/{slug}/msgs); a host's message is emailed to the
// inbox, Jirel's reply (as admin) is emailed to the host.
export const hostSupport = onRequest({ region: 'europe-west3', maxInstances: 5, cors: false, secrets: [GMAIL_APP_PASSWORD] }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const slug = String(req.body?.slug ?? '');
  if (!SLUG.test(slug)) return res.status(400).json({ error: 'Bad page' });
  if (!(await mayEdit(email, slug))) return res.status(403).json({ error: 'Not your page' });
  const admin = ADMINS.includes(email);
  const db = getFirestore();
  const col = db.collection(`hostSupport/${slug}/msgs`);
  const action = String(req.body?.action ?? 'list');
  if (action === 'send') {
    const text = String(req.body?.text ?? '').trim().slice(0, 2000);
    const KINDS = ['bug', 'idea', 'question'];
    const kind = KINDS.includes(String(req.body?.kind)) ? String(req.body.kind) : '';
    // Screenshots and documents (Jirel 20.11.26): up to 5, uploaded to Storage first.
    const files = (Array.isArray(req.body?.files) ? req.body.files : []).slice(0, 5)
      .map((f) => ({ url: String(f?.url ?? '').slice(0, 600), name: String(f?.name ?? 'file').replace(/[^\w. ()-]/g, '_').slice(0, 80), type: String(f?.type ?? '').slice(0, 60) }))
      .filter((f) => /^https:\/\/firebasestorage\.googleapis\.com\//.test(f.url));
    const okShot = files.find((f) => f.type.startsWith('image/'))?.url ?? '';
    if (!text && !files.length) return res.status(400).json({ error: 'Empty message' });
    const where = String(req.body?.where ?? '').slice(0, 40);
    const device = String(req.body?.device ?? '').slice(0, 40);
    await col.add({ from: admin ? 'twiggli' : 'host', by: email, text, kind, shot: okShot, files, where, device, at: FieldValue.serverTimestamp() });
    await db.doc(`hostSupport/${slug}`).set({ last: Date.now(), [admin ? 'hostUnread' : 'adminUnread']: true }, { merge: true });
    try {
      const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
      if (!admin) {
        const label = { bug: 'Problem report', idea: 'Missing feature', question: 'Question' }[kind] || 'Support message';
        // The files themselves come along as attachments (and as links).
        const attachments = [];
        for (const f of files) {
          try {
            const r = await fetch(f.url, { signal: AbortSignal.timeout(10000) });
            const b = Buffer.from(await r.arrayBuffer());
            if (r.ok && b.length < 15e6) attachments.push({ filename: f.name, content: b, contentType: f.type || undefined });
          } catch { /* the link is in the text */ }
        }
        await mail.sendMail({ from: { name: 'Twiggli Support', address: SENDER }, to: INBOX, replyTo: email, subject: `${label}: ${slug} (${email})`, attachments,
          text: `${email} (page ${slug}) wrote in Twiggli Support:\n\n${text}\n\n${where ? `Sent from: ${where}` : ''}${device ? ` · ${device}` : ''}${files.length ? `\nFiles:\n${files.map((f) => `- ${f.name}: ${f.url}`).join('\n')}` : ''}\n\nReply by email (goes straight to them), or in their dashboard: Host öffnen → ${slug} → Nachrichten → Twiggli Support.` });
      } else {
        let who = null;
        try { who = await hostContact(slug); } catch { /* sheet unreadable: no email */ }
        const members = (await db.collection('hostMembers').where('slugs', 'array-contains', slug).limit(5).get()).docs.map((d) => d.id).filter((x) => !ADMINS.includes(x));
        const to = members[0] || who?.emails?.[0];
        if (to) {
          const de = (who?.lang || 'de') === 'de';
          const html = `<div style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.6;color:#24272e;max-width:560px"><p>${de ? 'Hallo' : 'Hi'}${who?.firstName ? ` ${esc(who.firstName)}` : ''},</p><p>${de ? 'du hast eine neue Antwort vom <b>Twiggli</b> Support:' : 'you have a new reply from <b>Twiggli</b> Support:'}</p><blockquote style="margin:0 0 14px;padding:10px 14px;border-left:3px solid #6A3EEC;background:#f6f2ff">${esc(text).replace(/\n/g, '<br>')}</blockquote><p>${de ? 'Du findest sie in deinem Konto unter Nachrichten → Twiggli Support.' : 'You will find it in your account under Messages → Twiggli Support.'}</p><p>${de ? 'Liebe Grüße 💛<br>Jirel, Gründerin @ <b>Twiggli</b>' : 'Warm regards 💛<br>Jirel, Founder @ <b>Twiggli</b>'}</p></div>`;
          await mail.sendMail({ from: { name: 'Twiggli', address: SENDER }, replyTo: SENDER, to, subject: de ? 'Neue Antwort vom Twiggli Support' : 'New reply from Twiggli Support', html, text: text });
        }
      }
    } catch (err) { console.error('hostSupport mail', err?.message); }
  } else if (action !== 'list') return res.status(400).json({ error: 'Bad action' });
  if (!admin) await db.doc(`hostSupport/${slug}`).set({ hostUnread: false }, { merge: true });
  else await db.doc(`hostSupport/${slug}`).set({ adminUnread: false }, { merge: true });
  const snap = await col.orderBy('at', 'asc').limitToLast(100).get();
  const msgs = snap.docs.map((d) => { const x = d.data(); return { id: d.id, from: x.from, text: x.text, kind: x.kind, shot: x.shot, files: x.files ?? [], where: x.where, device: x.device, at: x.at?.toMillis?.() ?? Date.now() }; });
  return res.status(200).json({ msgs });
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

// ── Videos on Bunny Stream (Jirel 18.11.26) ──
// Library and CDN are not secret (they are in every playback address).
const BUNNY_LIBRARY = '813734';
const BUNNY_CDN = 'vz-079644c8-c93.b-cdn.net';
const BUNNY_GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const BUNNY_PLAY = new RegExp(`^https://${BUNNY_CDN.replace(/\./g, '\\.')}/([0-9a-f-]{36})/playlist\\.m3u8$`);
const bunnyPlay = (id) => `https://${BUNNY_CDN}/${id}/playlist.m3u8`;
const bunnyThumb = (id) => `https://${BUNNY_CDN}/${id}/thumbnail.jpg`;
/** The Bunny video id of a playback address, or ''. */
const bunnyId = (url) => { const m = BUNNY_PLAY.exec(String(url ?? '')); return m && BUNNY_GUID.test(m[1]) ? m[1] : ''; };

/** Which Bunny videos in `list` this caller may put on a page: ones they
 *  uploaded (hostVideo create, hostVideos/{id}), ones uploaded for this
 *  page (the caller's right to the page is checked by the function that
 *  saves), or any for an admin. A Set of video ids, for cleanMedia. */
const bunnyAllowed = async (list, { email = '', uid = '', slug = '' } = {}) => {
  const ids = [...new Set((Array.isArray(list) ? list : []).slice(0, 12).map((m) => bunnyId(m?.url)).filter(Boolean))];
  if (!ids.length) return new Set();
  const docs = await Promise.all(ids.map((id) => getFirestore().doc(`hostVideos/${id}`).get().catch(() => null)));
  return new Set(ids.filter((id, i) => {
    const v = docs[i]?.data();
    if (!v) return false;
    return ADMINS.includes(email) || (uid && v.uid === uid) || (email && v.email === email) || (slug && v.slug === slug);
  }));
};

/** Photos and a video for a date or a workshop: the host's page pictures
 *  and reels already on the site, files they uploaded to Firebase Storage
 *  (hostMedia/<slug>/…, or their own app folder; photos, and videos saved
 *  before Bunny), or a video on Bunny Stream they uploaded (`bunny`, from
 *  bunnyAllowed), with Bunny's thumbnail as its poster. */
const cleanMedia = (list, slug, uid = '', bunny = new Set()) => (Array.isArray(list) ? list : []).slice(0, 12)
  .map((m) => {
    const type = m?.type === 'video' ? 'video' : 'photo';
    const url = String(m?.url ?? '');
    const id = type === 'video' ? bunnyId(url) : '';
    if (id) return { type, url, ...(String(m?.thumb ?? '') === bunnyThumb(id) ? { thumb: bunnyThumb(id) } : {}), bunny: bunny.has(id) };
    return { type, url };
  })
  .filter((m) => (m.bunny !== undefined ? m.bunny : /^\/img\/hosts\/[a-z0-9-]+\.(jpg|png|webp)$/.test(m.url)
    || /^\/video\/[a-z0-9-]+\.(mp4|jpg)$/.test(m.url)
    || m.url.startsWith(`https://firebasestorage.googleapis.com/v0/b/`) && m.url.includes(`hostMedia%2F${slug}%2F`)
    // Picked in the app: uploaded to the person's own app folder.
    || (uid && m.url.startsWith(`https://firebasestorage.googleapis.com/v0/b/`) && m.url.includes(`/o/users%2F${uid}%2F`))))
  .map(({ bunny: _b, ...m }) => m);

/** Which site entry a dashboard date takes over (Calendar tab, Jirel 18.11.26):
 *  "rec|<slug>|<workshop key>|<HH:MM>" for a weekly class from
 *  live-workshops.json, "date|<slug>|<YYYY-MM-DD>|<HH:MM>" for a date in
 *  hostDates.ts. The build leaves that entry out (publicEvents "replaced"). */
const REPLACES = /^(rec\|[a-z0-9-]{1,60}\|[a-z0-9-]{1,80}\|([01]\d|2[0-3]):[0-5]\d|date\|[a-z0-9-]{1,60}\|\d{4}-\d\d-\d\d\|(([01]\d|2[0-3]):[0-5]\d)?)$/;

// ── Where a workshop happens, and what guests see of it (Jirel 18.11.26) ──
// A host enters her studio's full address once (hostAddress → Firestore
// hostPrivate/{slug}, which no client may read). She picks what guests see
// before booking: the district, the street without number, or the full
// address. A date can be somewhere else (its own address and choice, kept on
// the hostEvents doc, which no client reads either) or at the guest's. Only
// the visible part ever leaves the functions (publicEvents, hostProfiles);
// booked guests get the full address in their confirmation.
const VIS = ['district', 'street', 'full'];
const WHERE = ['studio', 'other', 'guest'];
/** An address as entered, checked and trimmed. */
const cleanAddress = (a) => {
  const zip = String(a?.zip ?? '').trim();
  return {
    ...(a?.name !== undefined ? { name: text(a.name, 80) } : {}),
    street: text(a?.street, 120), zip: /^\d{5}$/.test(zip) ? zip : '', district: text(a?.district, 60),
    vis: VIS.includes(a?.vis) ? a.vis : 'district',
    ...(a?.howTo !== undefined ? { howTo: text(a.howTo, 200) } : {}),
  };
};
/** What guests see before booking: "Friedrichshain", "Boxhagener Str., Friedrichshain"
 *  or "Boxhagener Str. 12, 10245 Berlin" (with a venue's name in front, if any). */
const visibleAddress = (a) => {
  if (!a) return '';
  const noNumber = (a.street ?? '').replace(/\s+\d+\s*[a-zA-Z]?(\s*[-–/]\s*\d+\s*[a-zA-Z]?)?$/, '').trim();
  const parts = a.vis === 'full' ? [a.name, a.street, a.zip ? `${a.zip} Berlin` : ''] : a.vis === 'street' ? [a.name, noNumber, a.district] : [a.name, a.district];
  return parts.filter(Boolean).join(', ');
};
/** A host's studio address (private), or null. */
const studioOf = async (slug) => (await getFirestore().doc(`hostPrivate/${slug}`).get()).data()?.studio ?? null;
/** The full address for a booked guest: the date's own place, else the studio; none at the guest's. */
const fullAddressFor = async (slug, ev) => {
  if (ev?.where === 'guest') return null;
  const a = ev?.where === 'other' ? ev.place : await studioOf(slug);
  if (!a?.street) return null;
  const studio = ev?.where === 'other' ? null : await studioOf(slug);
  return { name: a.name || '', street: a.street, zip: a.zip, district: a.district, howTo: (ev?.where === 'other' ? '' : studio?.howTo) || '' };
};
/** "📍 Where to go" for a confirmation email (and the same lines as text). */
const whereBox = (a, de) => {
  if (!a) return { html: '', text: '' };
  const city = [a.zip, 'Berlin'].filter(Boolean).join(' ') + (a.district ? ` (${a.district})` : '');
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.street}, ${a.zip} Berlin`)}`;
  const html = `<div style="border:1px solid #e6dff2;border-radius:12px;padding:14px 16px;margin:0 0 18px;background:#faf8ff">`
    + `<div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#6a3eec;font-weight:bold;margin-bottom:4px">📍 ${de ? 'So findest du hin' : 'Where to go'}</div>`
    + `<div style="font-size:15px">${a.name ? `<b>${esc(a.name)}</b><br>` : ''}${esc(a.street)}<br>${esc(city)}</div>`
    + `${a.howTo ? `<div style="font-size:13px;color:#5b5f6b;margin-top:6px">${esc(a.howTo)}</div>` : ''}`
    + `<div style="margin-top:10px"><a href="${maps}" style="display:inline-block;background:#6a3eec;color:#fff;text-decoration:none;padding:7px 14px;border-radius:999px;font-size:13px">${de ? 'In Karten öffnen' : 'Open in Maps'}</a></div>`
    + `<div style="font-size:12px;color:#8b87a0;margin-top:10px">${de ? 'Die Adresse ist nur für dich und deine Gruppe: bitte nicht öffentlich teilen.' : 'This address is just for you and your group: please don’t share it publicly.'}</div></div>`;
  return { html, text: `${de ? 'So findest du hin' : 'Where to go'}: ${[a.name, a.street, city].filter(Boolean).join(', ')}${a.howTo ? ` (${a.howTo})` : ''}\n${maps}` };
};

/** A host's date, checked and trimmed; null when something is off. */
const cleanEvent = (b, uid = '', bunny = new Set()) => {
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
    media: cleanMedia(b.media, slug, uid, bunny),
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
    // Calendar tab: places changed for one date of a series, and single
    // dates of a series the host cancelled. Only when sent, so the
    // edit form (which doesn't send them) keeps what is saved.
    ...(b.seatsByDate && typeof b.seatsByDate === 'object' && !Array.isArray(b.seatsByDate) ? {
      seatsByDate: Object.fromEntries(Object.entries(b.seatsByDate).filter(([k]) => YMD.test(k)).slice(0, 200)
        .map(([k, v]) => [k, num(v, 500)]).filter(([, v]) => v !== null)),
    } : {}),
    ...(Array.isArray(b.exceptions) ? { exceptions: [...new Set(b.exceptions.map(String).filter((x) => YMD.test(x)))].sort().slice(-200) } : {}),
    // Taken over from the site's own schedule (see REPLACES), its English
    // title, and whether guests only send a request (no paying on the spot).
    ...(typeof b.replaces === 'string' && REPLACES.test(b.replaces) ? { replaces: b.replaces } : {}),
    ...(b.titleEn !== undefined ? { titleEn: text(b.titleEn, 120) } : {}),
    ...(typeof b.request === 'boolean' ? { request: b.request } : {}),
    // The workshop's page key (its title may differ), and whether this is a
    // weekly "on request" slot taken over from the site (guests ask; never paid on the spot).
    ...(typeof b.wkey === 'string' && LISTING_KEY.test(b.wkey) ? { wkey: b.wkey } : {}),
    ...(typeof b.onRequest === 'boolean' ? { onRequest: b.onRequest } : {}),
    // Where: the studio, somewhere else (its own address, private) or at the guest's.
    ...(WHERE.includes(b.where) ? { where: b.where, place: b.where === 'other' ? cleanAddress(b.place) : null } : {}),
  };
};
/** The public line for a date (location) from where it is: worked out here, never typed by the client. */
const placeLine = async (ev) => {
  if (ev.where === 'guest') return { location: '', locExact: true, district: '' };
  const a = ev.where === 'other' ? ev.place : ev.where === 'studio' ? await studioOf(ev.slug) : null;
  if (!a) return ev.where ? { location: ev.location || '', locExact: false, district: '' } : {};
  return { location: visibleAddress(a) || ev.location || '', locExact: a.vis === 'full', district: a.district || '' };
};

/** The host's own account for a page, for dates an admin creates for them:
 *  payments go to the host's Stripe (bookingCheckout reads `by`), not Jirel's. */
const pageOwner = async (slug, email) => {
  if (!ADMINS.includes(email)) return email;
  const m = await getFirestore().collection('hostMembers').where('slugs', 'array-contains', slug).limit(5).get().catch(() => ({ docs: [] }));
  return m.docs.map((d) => d.id).find((e) => !ADMINS.includes(e)) ?? email;
};

// ── New hosts (Jirel 17.11.26, "option B") ──
// Anyone may put together a workshop in the app (or on the site), but to
// publish they must have connected Stripe (no garbage postings), and their
// first workshop waits for Jirel: she gets its pictures, text and the name
// on the Stripe account with Approve / Decline. Approving gives them their
// own page (hostMembers) and puts the workshop live; from then on they post
// freely. Their workshops wait in hostEvents with status "pending".
const slugify = (s) => String(s ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

/** Stripe connected far enough to take payments (or at least set up). */
const stripeReady = async (email) => {
  const st = (await getFirestore().doc(`hostMembers/${email}`).get()).data()?.stripe;
  return !!(st?.accountId && (st.chargesEnabled || st.detailsSubmitted));
};

const newHostEvent = async (req, res, email, uid, body) => {
  const db = getFirestore();
  if (!(await stripeReady(email))) return res.status(409).json({ error: 'stripe', message: 'Connect Stripe to publish' });
  const name = text(body.hostName, 80);
  if (!name) return res.status(400).json({ error: 'name', message: 'Please add your name or your studio’s name' });
  const appRef = db.doc(`hostApplications/${email}`);
  const app = (await appRef.get()).data();
  if (app?.status === 'declined') return res.status(403).json({ error: 'declined' });
  let slug = app?.slug;
  if (!slug) {
    const base = slugify(name) || 'host';
    slug = base;
    for (let i = 2; i < 50; i++) {
      const taken = (await db.doc(`pageOwners/${slug}`).get()).exists
        || !(await db.collection('hostApplications').where('slug', '==', slug).limit(1).get()).empty
        || !(await db.collection('hostEvents').where('slug', '==', slug).limit(1).get()).empty;
      if (!taken) break;
      slug = `${base}-${i}`;
    }
  }
  const ev = cleanEvent({ ...body, slug }, uid, await bunnyAllowed(body.media, { email, uid }));
  if (!ev) return res.status(400).json({ error: 'Please fill in title, date and time' });
  const doc = await db.collection('hostEvents').add({ ...ev, status: 'pending', by: email, uid, hostName: name, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  const first = !app;
  await appRef.set({ email, uid, name, slug, status: 'pending', lang: text(body.lang, 5) || 'en', ...(first ? { createdAt: FieldValue.serverTimestamp() } : {}), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  if (first) {
    // Who Stripe says they are, for Jirel's check.
    let who = '';
    try {
      const acct = (await db.doc(`hostMembers/${email}`).get()).data()?.stripe?.accountId;
      const r = await stripe(STRIPE_CONNECT_KEY.value(), `accounts/${acct}`);
      const a = await r.json();
      if (r.ok) {
        who = [a.business_profile?.name, a.settings?.dashboard?.display_name, a.business_profile?.url, a.email, a.country,
          a.charges_enabled ? 'payments on' : 'payments not yet on'].filter(Boolean).join(' · ');
      }
    } catch (err) { console.error('stripe lookup', err?.message); }
    const key = await approveKey();
    const approve = `${FUNCTIONS_URL}/hostApprove?e=${encodeURIComponent(email)}&s=${slug}&k=${sign(key, email, slug)}`;
    const decline = `${FUNCTIONS_URL}/hostApprove?e=${encodeURIComponent(email)}&s=${slug}&a=decline&k=${sign(key, email, `decline:${slug}`)}`;
    const pics = ev.media.map((m) => m.type === 'video'
      ? (bunnyId(m.url)
        // Bunny's own player page, which plays HLS in any mail client's browser.
        ? `<p><a href="https://iframe.mediadelivery.net/play/${BUNNY_LIBRARY}/${bunnyId(m.url)}"><img src="${esc(bunnyThumb(bunnyId(m.url)))}" alt="▶ Video" style="width:160px;height:160px;object-fit:cover;border-radius:10px"><br>▶ Video</a></p>`
        : `<p><a href="${esc(m.url)}">▶ Video</a></p>`)
      : `<img src="${esc(m.url)}" alt="" style="width:160px;height:160px;object-fit:cover;border-radius:10px;margin:0 6px 6px 0">`).join('');
    try {
      await mailJirel({
        subject: `New host: ${name} wants to publish "${ev.title}"`,
        replyTo: email,
        text: `${name} (${email}) wants to publish "${ev.title}" on ${ev.date} at ${ev.start}, €${ev.price ?? 0}, ${ev.seats ?? '?'} spots.\nStripe: ${who || 'connected'}\n\n${ev.description}\n\nApprove: ${approve}\nDecline: ${decline}`,
        html: `<div style="font-family:Tahoma,sans-serif;font-size:15px;line-height:1.5;max-width:620px">
<p style="color:#6A3EEC;font-weight:bold;margin:0">New host · waiting for you</p>
<h2 style="margin:4px 0 12px">${esc(name)}: ${esc(ev.title)}</h2>
<div>${pics}</div>
<p><b>${esc(ev.date)} · ${esc(ev.start)}${ev.end ? `–${esc(ev.end)}` : ''}</b> · €${ev.price ?? 0} · ${ev.seats ?? '?'} spots${ev.location ? ` · ${esc(ev.location)}` : ''}</p>
<p style="white-space:pre-line">${esc(ev.description)}</p>
<p><b>Email:</b> ${esc(email)}<br><b>Stripe:</b> ${esc(who || 'connected')}</p>
<p><a href="${approve}" style="display:inline-block;background:#1f6f43;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Approve</a>
&nbsp; <a href="${decline}" style="display:inline-block;background:#fff;color:#b3261e;border:1px solid #b3261e;padding:9px 18px;border-radius:8px;text-decoration:none">Decline</a></p>
<p style="color:#777">Approving gives them their own host page and puts this workshop live; after that they post without approval.</p></div>`,
      });
    } catch (err) { console.error('new host mail failed', err?.message); }
    try { await mailHostStatus(email, name, ev.title, 'pending', body.lang); } catch (err) { console.error('pending mail', err?.message); }
  }
  return res.status(200).json({ id: doc.id, status: 'pending' });
};

/** Short note to a new host: waiting, approved or declined (DE/EN/FR). */
const mailHostStatus = async (to, name, title, state, lang) => {
  const l = ['de', 'fr'].includes(lang) ? lang : 'en';
  const first = String(name).split(' ')[0];
  const T = {
    pending: {
      de: [`Danke, ${first}! Wir schauen uns „${title}“ an`, `Danke für deinen ersten Workshop auf Twiggli! Neue Gastgeber*innen schauen wir uns einmal kurz an, meist innerhalb eines Tages. Sobald er freigegeben ist, ist „${esc(title)}“ live und du bekommst eine Nachricht. Danach veröffentlichst du ohne Warten.`],
      en: [`Thanks, ${first}! We’re having a look at “${title}”`, `Thanks for your first workshop on Twiggli! We take a quick look at every new host, usually within a day. As soon as it’s approved, “${esc(title)}” goes live and we’ll let you know. After that you publish without waiting.`],
      fr: [`Merci, ${first} ! On regarde « ${title} »`, `Merci pour ton premier atelier sur Twiggli ! On regarde rapidement chaque nouvel·le hôte, en général sous un jour. Dès qu’il est validé, « ${esc(title)} » est en ligne et on te prévient. Ensuite, tu publies sans attendre.`],
    },
    approved: {
      de: [`Du bist dabei, ${first}! „${title}“ ist live 🎉`, `Willkommen bei Twiggli! „${esc(title)}“ ist jetzt live, auf der Website und in der App. Ab jetzt kannst du neue Workshops und Termine direkt veröffentlichen.`],
      en: [`You’re in, ${first}! “${title}” is live 🎉`, `Welcome to Twiggli! “${esc(title)}” is now live, on the website and in the app. From now on you can publish new workshops and dates straight away.`],
      fr: [`C’est validé, ${first} ! « ${title} » est en ligne 🎉`, `Bienvenue sur Twiggli ! « ${esc(title)} » est maintenant en ligne, sur le site et dans l’app. Désormais, tu publies tes ateliers et tes dates directement.`],
    },
    declined: {
      de: [`Zu deinem Workshop auf Twiggli`, `Danke für dein Interesse an Twiggli! Leider passt „${esc(title)}“ gerade nicht zu unserem Angebot, deshalb veröffentlichen wir ihn nicht. Wenn du Fragen hast, antworte einfach auf diese E-Mail.`],
      en: [`About your workshop on Twiggli`, `Thanks for your interest in Twiggli! Unfortunately “${esc(title)}” isn’t a fit for Twiggli right now, so we won’t publish it. If you have any questions, just reply to this email.`],
      fr: [`À propos de ton atelier sur Twiggli`, `Merci pour ton intérêt pour Twiggli ! Malheureusement, « ${esc(title)} » ne correspond pas à Twiggli pour le moment, donc on ne le publie pas. Si tu as des questions, réponds simplement à cet e-mail.`],
    },
  }[state][l];
  const sig = l === 'de' ? 'Jirel, Gründerin @ Twiggli' : l === 'fr' ? 'Jirel, fondatrice @ Twiggli' : 'Jirel, Founder @ Twiggli';
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  await mail.sendMail({
    from: { name: 'Twiggli', address: SENDER }, to, subject: T[0].replace(/<[^>]+>/g, ''),
    text: `${T[1].replace(/<[^>]+>/g, '')}\n\n💛\n${sig}`,
    html: `<div style="font-family:Tahoma,sans-serif;font-size:15px;line-height:1.55;color:#1d1d1f;max-width:560px"><img src="${SITE}/img/logo.png" alt="Twiggli" width="110" style="display:block;margin-bottom:18px"><h2 style="font-size:20px;margin:0 0 12px">${esc(T[0])}</h2><p>${T[1]}</p><p>💛<br>${sig}</p></div>`,
  });
};

export const hostEventSave = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD, STRIPE_CONNECT_KEY], maxInstances: 10, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const who = await callerIds(req);
  if (!who) return res.status(401).json({ error: 'Not signed in' });
  const { email, uid } = who;
  const body = req.body ?? {};
  // Someone without a host page yet (the app's Create, Jirel 17.11.26):
  // their first workshop waits for Jirel's approval.
  if (!body.slug && !ADMINS.includes(email) && !(await mySlugs(email)).length) return newHostEvent(req, res, email, uid, body);
  const col = getFirestore().collection('hostEvents');
  // Calendar tab: the first change to a date from the site's own schedule
  // turns that whole series into dashboard dates (one per weekday), all
  // marked with the entry they replace, in one go; the build then drops the
  // site's entry, so the public page never shows a date twice.
  if (Array.isArray(body.adopt)) {
    const bunny = await bunnyAllowed(body.adopt.slice(0, 7).flatMap((x) => (Array.isArray(x?.media) ? x.media : [])), { email, uid, slug: String(body.slug ?? '') });
    const evs = body.adopt.slice(0, 7).map((x) => cleanEvent({ ...x, slug: body.slug, replaces: body.replaces }, uid, bunny));
    if (!evs.length || evs.some((x) => !x || !x.replaces)) return res.status(400).json({ error: 'Bad dates' });
    if (!(await mayEdit(email, evs[0].slug))) return res.status(403).json({ error: 'Not your page' });
    const owner = await pageOwner(evs[0].slug, email);
    const items = await getFirestore().runTransaction(async (t) => {
      // Taken over already (a second tab, a double click): hand back what is there.
      const had = await t.get(col.where('slug', '==', evs[0].slug).where('replaces', '==', evs[0].replaces));
      if (!had.empty) return had.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: undefined, updatedAt: undefined }));
      return evs.map((x) => {
        const ref = col.doc();
        t.set(ref, { ...x, by: owner, editedBy: email, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
        return { id: ref.id, ...x, by: owner };
      });
    });
    return res.status(200).json({ items });
  }
  const ev = cleanEvent(body, uid, await bunnyAllowed(body.media, { email, uid, slug: String(body.slug ?? '') }));
  if (!ev) return res.status(400).json({ error: 'Please fill in title, date and time' });
  if (!(await mayEdit(email, ev.slug))) return res.status(403).json({ error: 'Not your page' });
  if (ev.where) Object.assign(ev, await placeLine(ev));
  const owner = await pageOwner(ev.slug, email);
  // As on Luma: no money without a connected Stripe account (hostStripe).
  // Dates that only take requests are paid later, through the offer.
  const id = String(req.body?.id ?? '');
  // The edit form doesn't send `request`: a request-only date stays one.
  const prev = /^[A-Za-z0-9]{10,40}$/.test(id) ? (await col.doc(id).get()).data() : undefined;
  const reqOnly = ev.request ?? prev?.request;
  // Dates taken over from the site's schedule, without a choice of their own,
  // follow the workshop's setting and take requests until Stripe is connected
  // (publicEvents "payable"), so editing them never needs Stripe first.
  const followsWorkshop = reqOnly === undefined && !!(ev.replaces || prev?.replaces);
  if (ev.price > 0 && reqOnly !== true && !followsWorkshop && !(await getFirestore().doc(`hostMembers/${owner}`).get()).data()?.stripe?.chargesEnabled) {
    return res.status(409).json({ error: 'stripe', message: 'Connect Stripe before you set a price' });
  }
  if (id) {
    if (!/^[A-Za-z0-9]{10,40}$/.test(id)) return res.status(400).json({ error: 'Bad id' });
    const old = await col.doc(id).get();
    if (!old.exists || old.data().slug !== ev.slug) return res.status(404).json({ error: 'Not found' });
    // The date stays the host's (payments, bookingCheckout), whoever edits it.
    await col.doc(id).set({ ...ev, by: old.data().by || owner, editedBy: email, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return res.status(200).json({ id });
  }
  const doc = await col.add({ ...ev, by: owner, editedBy: email, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
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
  // One that took over a date of the site's own schedule stays, marked
  // deleted, so that date does not come back from the site's data.
  if (snap.data().replaces) await ref.set({ status: 'deleted', editedBy: email, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  else await ref.delete();
  return res.status(200).json({ ok: true });
});

export const hostEvents = onRequest({ region: 'europe-west3', maxInstances: 10, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Not signed in' });
  const slug = String(req.body?.slug ?? '');
  if (!SLUG.test(slug) || !(await mayEdit(email, slug))) return res.status(403).json({ error: 'Not your page' });
  const snap = await getFirestore().collection('hostEvents').where('slug', '==', slug).get();
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: undefined, updatedAt: undefined }));
  const items = all.filter((x) => x.status !== 'deleted')
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
  // Site entries the host took over (also when they deleted them since).
  const replaced = [...new Set(all.map((x) => x.replaces).filter(Boolean))];
  // Paid bookings per date, for the Calendar tab (no guest contact details).
  const paid = await getFirestore().collection('bookings').where('slug', '==', slug).where('status', '==', 'paid').get().catch(() => ({ docs: [] }));
  // The guest's first name and message, and the replies (no email or phone: the dashboard never needs them).
  const bookings = paid.docs.map((d) => { const x = d.data(); return { id: d.id, eventId: x.eventId ?? '', date: x.date, start: x.start, title: x.title, people: x.people ?? 1, name: String(x.name ?? '').split(' ')[0], amount: (x.amount ?? 0) / 100, message: x.message ?? '', thread: (x.thread ?? []).map((t) => ({ from: t.from, message: t.message, at: t.at })), paidAt: x.paidAt?.toMillis?.() ?? 0,
    // Twiggli's fee as bookingCheckout charged it (the host's rate then), and a voucher's part.
    fee: (x.fee ?? 0) / 100, pct: Number.isFinite(x.commissionPct) ? x.commissionPct : null, voucher: (x.voucherCents ?? 0) / 100 }; });
  return res.status(200).json({ items, bookings, replaced });
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
    const seats = Math.round(Number(b.seats));
    // Title, price and line (as before), and now the rest of the workshop
    // (Jirel 18.11.26): what it is, how long, places per date, pictures and
    // video, and whether guests book straight away or send a request.
    const edit = {
      title: text(b.newTitle, 120), price: Number.isFinite(n) && n > 0 && n <= 5000 ? n : null, note: text(b.note, 220),
      description: String(b.description ?? '').replace(/\r/g, '').trim().slice(0, 3000),
      duration: /^\d{1,2}([.,]\d{1,2})?\s?(h|min)$/.test(text(b.duration, 12)) ? text(b.duration, 12).replace(',', '.') : '',
      seats: Number.isFinite(seats) && seats >= 1 && seats <= 500 ? seats : null,
      media: cleanMedia(b.media, slug, '', await bunnyAllowed(b.media, { email, slug })),
      booking: ['request', 'instant'].includes(b.booking) ? b.booking : '',
      // Page pictures the host removed with ✕, so they stay away when the editor opens again (Jirel 23.11.26).
      hidden: (Array.isArray(b.hidden) ? b.hidden : []).filter((u) => typeof u === 'string' && u.length <= 400).slice(0, 60),
      // Where it usually happens (dates can differ): its own address stays private (publicEvents).
      ...(WHERE.includes(b.where) ? { where: b.where, place: b.where === 'other' ? cleanAddress(b.place) : null } : {}),
    };
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

// ── hostVideo: a host's video goes straight to Bunny Stream (Jirel 18.11.26) ──
// The dashboard and the app ask for one upload at a time:
//   { action: 'create', slug?, title? } → creates the video in Bunny's library
//     and returns what a TUS upload to https://video.bunnycdn.com/tusupload
//     needs: { videoId, libraryId, expires, signature } (signature =
//     SHA256(libraryId + key + expires + videoId), good for 2 hours), plus
//     the playback and thumbnail addresses. hostVideos/{videoId} records who
//     uploaded it, so cleanMedia only takes a video its uploader (or the
//     page's host, or an admin) puts on a page.
//   { action: 'status', videoId } → Bunny's encoding state for its uploader.
// Any signed-in person may upload (new hosts in the app have no page yet),
// at most VIDEO_HOUR an hour and VIDEO_DAY a day.
const VIDEO_HOUR = 10;
const VIDEO_DAY = 30;
const BUNNY_STATES = ['created', 'uploaded', 'processing', 'transcoding', 'finished', 'error', 'uploadFailed', 'jitSegmenting', 'jitPlaylistsCreated'];
const bunnyApi = (path, init = {}) => fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY}${path}`, {
  ...init, headers: { AccessKey: BUNNY_STREAM_API_KEY.value(), accept: 'application/json', 'content-type': 'application/json', ...(init.headers ?? {}) },
});

export const hostVideo = onRequest({ region: 'europe-west3', secrets: [BUNNY_STREAM_API_KEY], maxInstances: 10, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const who = await callerIds(req);
  if (!who) return res.status(401).json({ error: 'Not signed in' });
  const { email, uid } = who;
  const b = req.body ?? {};
  const db = getFirestore();
  if (!BUNNY_STREAM_API_KEY.value()) return res.status(500).json({ error: 'Video uploads are not set up' });

  if (b.action === 'create') {
    const slug = String(b.slug ?? '');
    if (slug && (!SLUG.test(slug) || !(await mayEdit(email, slug)))) return res.status(403).json({ error: 'Not your page' });
    if (!ADMINS.includes(email)) {
      const now = Date.now();
      const quota = db.doc(`hostVideoQuota/${uid}`);
      const over = await db.runTransaction(async (t) => {
        const sent = ((await t.get(quota)).data()?.sent ?? []).filter((x) => now - x < 86400e3);
        if (sent.filter((x) => now - x < 3600e3).length >= VIDEO_HOUR || sent.length >= VIDEO_DAY) return true;
        t.set(quota, { sent: [...sent, now] });
        return false;
      });
      if (over) return res.status(429).json({ error: 'Too many videos', message: 'Too many videos for now, please try again later' });
    }
    const title = text(b.title, 120) || `${slug || email.split('@')[0]} ${new Date().toISOString().slice(0, 10)}`;
    let video;
    try {
      const r = await bunnyApi('/videos', { method: 'POST', body: JSON.stringify({ title }) });
      video = await r.json().catch(() => ({}));
      if (!r.ok || !BUNNY_GUID.test(String(video.guid ?? ''))) throw new Error(`bunny ${r.status}`);
    } catch (err) {
      console.error('hostVideo create', err?.message);
      return res.status(502).json({ error: 'Video service did not answer' });
    }
    const videoId = video.guid;
    await db.doc(`hostVideos/${videoId}`).set({ email, uid, slug, title, status: 'created', createdAt: FieldValue.serverTimestamp() });
    const expires = Math.floor(Date.now() / 1000) + 2 * 3600;
    const signature = createHash('sha256').update(`${BUNNY_LIBRARY}${BUNNY_STREAM_API_KEY.value()}${expires}${videoId}`).digest('hex');
    return res.status(200).json({
      videoId, libraryId: BUNNY_LIBRARY, expires, signature,
      tusEndpoint: 'https://video.bunnycdn.com/tusupload',
      url: bunnyPlay(videoId), thumb: bunnyThumb(videoId),
    });
  }

  if (b.action === 'status') {
    const videoId = String(b.videoId ?? '');
    if (!BUNNY_GUID.test(videoId)) return res.status(400).json({ error: 'Bad video' });
    const ref = db.doc(`hostVideos/${videoId}`);
    const v = (await ref.get()).data();
    const mine = v && (v.uid === uid || v.email === email || ADMINS.includes(email) || (v.slug && await mayEdit(email, v.slug)));
    if (!mine) return res.status(404).json({ error: 'Not found' });
    let x;
    try {
      const r = await bunnyApi(`/videos/${videoId}`);
      x = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(`bunny ${r.status}`);
    } catch (err) {
      console.error('hostVideo status', err?.message);
      return res.status(502).json({ error: 'Video service did not answer' });
    }
    const code = Number(x.status);
    const status = BUNNY_STATES[code] ?? 'unknown';
    // Playable once encoded (4), or as soon as the first resolution is out.
    const ready = code === 4 || (code === 3 && !!String(x.availableResolutions ?? '').trim());
    const failed = code === 5 || code === 6;
    if (status !== v.status) await ref.set({ status, updatedAt: FieldValue.serverTimestamp() }, { merge: true }).catch(() => {});
    return res.status(200).json({
      videoId, status, code, percent: Math.max(0, Math.min(100, Number(x.encodeProgress) || 0)), ready, failed,
      length: Number(x.length) || 0, url: bunnyPlay(videoId), thumb: bunnyThumb(videoId),
    });
  }
  return res.status(400).json({ error: 'Bad action' });
});

/** Public: every public date (no personal data), for the website build. */
export const publicEvents = onRequest({ region: 'europe-west3', maxInstances: 5 }, async (_req, res) => {
  const snap = await getFirestore().collection('hostEvents').where('visibility', '==', 'public').get();
  // Deleted accounts held for 30 days: purge the expired ones (this runs at
  // every daily build).
  try {
    const old = await getFirestore().collection('deletedAccounts').where('purgeAfter', '<', Date.now()).limit(20).get();
    await Promise.all(old.docs.map((x) => x.ref.delete()));
  } catch (err) { console.error('purge deleted', err?.message); }
  // Hosts who deleted their account: off the site at the next build.
  // Paused accounts too (Jirel 15.11.26): back once the host signs in again.
  const gone = [...((await getFirestore().doc('_config/goneHosts').get()).data()?.slugs ?? []), ...((await getFirestore().doc('_config/pausedHosts').get()).data()?.slugs ?? [])];
  let updated = 0;
  // Site entries hosts took over in the Calendar tab (any visibility, deleted ones too).
  const taken = await getFirestore().collection('hostEvents').where('replaces', '>', '').get().catch(() => ({ docs: [] }));
  const replaced = [...new Set(taken.docs.map((d) => { updated = Math.max(updated, d.data().updatedAt?.toMillis?.() ?? 0); return d.data().replaces; }))];
  const live = snap.docs.filter((d) => !gone.includes(d.data().slug) && !['pending', 'declined', 'deleted'].includes(d.data().status));
  // Whether the date's host can take payments now (Stripe connected): if not,
  // the site takes requests for it instead of a checkout that would fail.
  const owners = [...new Set(live.map((d) => d.data().by).filter(Boolean))];
  const ready = new Set((await Promise.all(owners.map(async (e) => ((await getFirestore().doc(`hostMembers/${e}`).get()).data()?.stripe?.chargesEnabled ? e : ''))
    .map((p) => p.catch(() => '')))).filter(Boolean));
  // Studios: what guests see before booking (the full address never leaves here).
  const privs = (await getFirestore().collection('hostPrivate').get().catch(() => ({ docs: [] }))).docs;
  const studioBy = new Map(privs.map((d) => { updated = Math.max(updated, d.data().updatedAt?.toMillis?.() ?? 0); return [d.id, d.data().studio]; }));
  const studios = [...studioBy].filter(([s, a]) => a && !gone.includes(s)).map(([slug, a]) => ({ slug, visible: visibleAddress(a), district: a.district || '', exact: a.vis === 'full' }));
  const lineFor = (x) => {
    if (x.where === 'guest') return { location: '', locExact: true, district: '' };
    const a = x.where === 'other' ? x.place : x.where === 'studio' ? studioBy.get(x.slug) : null;
    return a ? { location: visibleAddress(a), locExact: a.vis === 'full', district: a.district || '' } : {};
  };
  const items = live.map((d) => {
    const x = d.data();
    updated = Math.max(updated, x.updatedAt?.toMillis?.() ?? 0);
    const { by, createdAt: _c, updatedAt: _u, editedBy: _e, place: _p, ...pub } = x;
    return { id: d.id, ...pub, ...lineFor(x), payable: ready.has(by) };
  });
  // Workshops hosts paused or deleted (hostListing), left out of the site.
  const listings = (await getFirestore().collection('hostListings').get()).docs
    .map((d) => { const x = d.data(); updated = Math.max(updated, x.updatedAt?.toMillis?.() ?? 0); return { slug: x.slug, key: x.key, status: x.status, edit: x.edit ?? null }; });
  const hidden = listings.filter((x) => LISTING_STATES.includes(x.status)).map(({ slug, key, status }) => ({ slug, key, status }));
  // And the hosts' own title, price and line for a workshop (hostListing edit).
  const edits = listings.filter((x) => x.edit && !LISTING_STATES.includes(x.status)).map(({ slug, key, edit }) => {
    const { place: _p, ...pub } = edit;
    return { slug, key, ...pub, ...(edit.where ? lineFor({ ...edit, slug }) : {}) };
  });
  // Draft pages Jirel approved for going live (hostPublishApprove).
  const published = await publishedSlugs().catch(() => []);
  res.set('Cache-Control', 'no-store').status(200).json({ updated, items, hidden, edits, gone, replaced, studios, published });
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
    const t = await getAuth().verifyIdToken(m[1], true);
    if (await mfaMissing(t)) return null;
    return t.email && t.email_verified ? { email: t.email.toLowerCase(), uid: t.uid } : null;
  } catch { return null; }
};

/** Tells Jirel when a host's Stripe gets connected or ready for payments
 *  (Jirel 23.11.26: "did Celina connect to Stripe?" had no answer). */
const mailStripeNews = async (email, what) => {
  try {
    const pages = await mySlugs(email);
    await mailJirel({
      subject: `Stripe ${what}: ${email}${pages.length ? ` (host: ${pages.join(', ')})` : ''}`,
      text: `${email}${pages.length ? ` (${pages.join(', ')})` : ''}: Stripe ${what}.`,
    });
  } catch (err) { console.error('stripe news mail', err?.message); }
};

export const hostStripe = onRequest({ ...OPTS, secrets: [STRIPE_CONNECT_KEY, GMAIL_APP_PASSWORD] }, async (req, res) => {
  if (!allow(req, res)) return;
  const who = await callerIds(req);
  if (!who) return res.status(401).json({ error: 'Not signed in' });
  const { email, uid } = who;
  // Anyone signed in: new hosts connect Stripe before they can publish.
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
    const before = (await memberRef.get()).data()?.stripe ?? {};
    if (state.chargesEnabled && !before.chargesEnabled) await mailStripeNews(email, 'ready for payments');
    else if (state.detailsSubmitted && !before.detailsSubmitted && !before.linked) await mailStripeNews(email, 'connected (payments not enabled yet)');
    await memberRef.set({ stripe: { ...state, checkedAt: FieldValue.serverTimestamp() } }, { merge: true });
    return res.status(200).json({ connected: true, chargesEnabled: state.chargesEnabled, detailsSubmitted: state.detailsSubmitted });
  }
  // "I already have a Stripe account", as on Luma: Stripe's own sign-in
  // (Connect OAuth) links the host's existing Standard account as it is.
  if (action === 'link') {
    if (!STRIPE_CONNECT_CLIENT_ID) return res.status(503).json({ error: 'link-not-configured' });
    const state = await oauthState(email, stripeLang(req.body?.lang));
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
  // From the app: a page saying "go back to the app".
  const back = req.body?.app ? `${SITE}/stripe-connect-setup-completed/` : stripeBack(stripeLang(req.body?.lang));
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

/** "New review on your page" for the host, once Jirel publishes it
 *  (Jirel 15.11.26), unless they switched it off in Einstellungen. */
const tellHostReview = async (r) => {
  if (r.test || !SLUG.test(String(r.host ?? ''))) return;
  const prefs = await hostPrefs(r.host);
  if (prefs.notifyReviews === 'off') return;
  const who = await hostContact(r.host).catch(() => null);
  if (!who?.emails?.length) return;
  const L = prefs.lang || who.lang || HOST_LANG[r.host] || 'de';
  const de = L === 'de';
  const fr = L === 'fr';
  const x = (d, e, f) => (de ? d : fr ? f : e);
  const stars = '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars);
  const page = `${SITE}${x('/de', '', '/fr')}/host/account/`;
  const name = r.showName && r.name ? esc(r.name) : x('Ein Gast', 'A guest', 'Un·e participant·e');
  const fn = who.firstName ? ` ${esc(who.firstName)}` : '';
  const hi = x(`Hallo${fn},`, `Hi${fn},`, `Coucou${fn},`);
  const w = r.workshop ? esc(r.workshop) : '';
  const lead = x(`${name} hat dir eine Bewertung geschrieben${w ? ` zu <b>${w}</b>` : ''}. Sie ist jetzt auf deiner Seite zu sehen:`, `${name} left you a review${w ? ` for <b>${w}</b>` : ''}. It's now on your page:`, `${name} t’a laissé un avis${w ? ` sur <b>${w}</b>` : ''}. Il est maintenant visible sur ta page :`);
  const html = `<div style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.6;color:#24272e;max-width:560px">
<p style="margin:0 0 14px">${hi}</p><p style="margin:0 0 10px">${lead}</p>
<p style="margin:0 0 6px;font-size:22px;color:#ffb72b;letter-spacing:2px">${stars}</p>
<p style="margin:0 0 16px;font-size:16px">“${esc(r.text)}”</p>
<p style="margin:0 0 18px"><a href="${page}" style="color:#6a3eec;font-weight:bold;text-decoration:none">${x('Zu deinem Twiggli-Konto', 'Go to your Twiggli account', 'Aller sur ton compte Twiggli')}</a></p>
<p style="margin:0 0 4px">${x('Herzlichen Glückwunsch und liebe Grüße', 'Congratulations and warm wishes', 'Félicitations et à bientôt')} 💛</p>
<p style="margin:0 0 18px">Jirel, ${x('Gründerin', 'Founder', 'Fondatrice')} @ <b>Twiggli</b></p>
<p style="margin:0;font-size:12px;color:#8a8a8a">${x('Diese E-Mails kannst du in deinem Konto unter Einstellungen → Präferenzen ausschalten.', 'You can turn these emails off in your account under Settings → Preferences.', 'Tu peux désactiver ces e-mails dans ton compte, sous Réglages → Préférences.')}</p></div>`;
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  await mail.sendMail({
    from: { name: 'Twiggli', address: SENDER }, replyTo: SENDER, to: who.emails[0],
    subject: x(`Neue Bewertung ${stars} auf deiner Twiggli-Seite`, `New review ${stars} on your Twiggli page`, `Nouvel avis ${stars} sur ta page Twiggli`),
    text: `${x('Neue Bewertung', 'New review', 'Nouvel avis')} ${stars}\n"${r.text}"\n${page}`, html,
  });
};

export const reviewDecide = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 5 }, async (req, res) => {
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
  const first = r.status !== 'published' && a === 'publish';
  await ref.update({ status: a === 'publish' ? 'published' : 'rejected', decidedAt: FieldValue.serverTimestamp() });
  if (first) { try { await tellHostReview(r); } catch (err) { console.error('review host mail', id, err?.message); } }
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
  // No end date: the series runs on (Jirel 18.11.26), like Luma and Google Calendar.
  const until = ev.until ? new Date(`${ev.until}T00:00:00Z`) : new Date(Date.UTC(9999, 0, 1));
  const d = new Date(`${date}T00:00:00Z`);
  if (d > until) return false;
  const days = Math.round((d - first) / 86400000);
  if (Array.isArray(ev.exceptions) && ev.exceptions.includes(date)) return false;
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
  if (!evSnap.exists || ev.visibility === 'private' || ev.request === true || ev.onRequest === true || ev.status === 'deleted' || !(ev.price > 0) || !onSchedule(ev, date)) return res.status(404).json({ error: 'not-bookable' });
  if (new Date(`${date}T${ev.start}:00+01:00`).getTime() < Date.now()) return res.status(409).json({ error: 'past' });
  const member = (await db.doc(`hostMembers/${ev.by}`).get()).data() ?? {};
  const account = member.stripe?.accountId;
  if (!account || !member.stripe?.chargesEnabled) return res.status(409).json({ error: 'host-not-ready' });
  const seats = Number.isInteger(ev.seatsByDate?.[date]) ? ev.seatsByDate[date] : ev.seats;
  if (seats) {
    const left = seats - (await placesTaken(eventId, date));
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
    eventId, date, start: ev.start, slug: ev.slug, title: ev.title, location: (await placeLine(ev)).location ?? ev.location ?? '', cancel: ev.cancel ?? '7d',
    people, name, email, phone: text(b.phone, 60), message: String(b.message ?? '').replace(/\r/g, '').trim().slice(0, 1000), lang,
    // The host's first name as the page showed it, for "Your message to Evelyn: …".
    hostName: text(b.host, 80).split(' ')[0],
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
  // The full address, only now that the guest has booked (the date's own place, else the studio).
  let where = { html: '', text: '' };
  try {
    const ev = bk.eventId ? (await getFirestore().doc(`hostEvents/${bk.eventId}`).get()).data() : null;
    where = whereBox(await fullAddressFor(bk.slug, ev), de);
  } catch (err) { console.error('booking address', id, err?.message); }
  const day = new Date(`${bk.date}T12:00:00Z`).toLocaleDateString(de ? 'de-DE' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const eur = (c) => `€${(c / 100).toFixed(2).replace(/\.00$/, '')}`;
  const cancel = (CANCEL_TEXT[bk.cancel] ?? CANCEL_TEXT['7d'])[de ? 0 : 1];
  const first_ = bk.name.split(/\s+/)[0];
  const vc = bk.voucherCents ?? 0;
  const charged = bk.amount - vc;
  const rows = [[de ? 'Workshop' : 'Workshop', bk.title], [de ? 'Wann' : 'When', `${day}, ${bk.start}`], [de ? 'Wo' : 'Where', bk.location], [de ? 'Plätze' : 'Spots', String(bk.people)],
    ...(vc ? [[de ? 'Gutschein' : 'Voucher', `−${eur(vc)}`]] : []),
    [de ? 'Bezahlt' : 'Paid', eur(charged)], [de ? 'Stornierung' : 'Cancellation', cancel]].filter(([, v]) => v);
  const table = rows.map(([k, v]) => `<tr><td style="padding:5px 16px 5px 0;color:#8b87a0">${esc(k)}</td><td style="padding:5px 0"><b>${esc(v)}</b></td></tr>`).join('');
  const msgBox = (label) => (bk.message ? `<div style="margin:0 0 18px;padding:12px 14px;border-radius:12px;background:#f3eeff;border-left:3px solid #6a3eec"><div style="font-size:13px;color:#6a3eec;font-weight:bold;margin-bottom:4px">💬 ${esc(label)}</div><div style="white-space:pre-line">${esc(bk.message)}</div></div>` : '');
  // The guest sees their message arrived (the host's name as the page showed it).
  const yourMsg = msgBox(de ? `Deine Nachricht an ${bk.hostName || 'die Gastgeberin'}:` : `Your message to ${bk.hostName || 'your host'}:`);
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  try {
    await mail.sendMail({
      from: { name: 'Twiggli', address: SENDER }, replyTo: SENDER, to: bk.email,
      subject: de ? `Gebucht! ${bk.title} am ${day} ${emojiFor(bk.title)}` : `You're booked! ${bk.title} on ${day} ${emojiFor(bk.title)}`,
      html: `<div style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.6;color:#24272e;max-width:520px">${de ? `Hallo ${esc(first_)},<br><br>dein Platz ist sicher, wir freuen uns auf dich! 🎉` : `Hi ${esc(first_)},<br><br>your spot is reserved, we can't wait to see you! 🎉`}<table style="margin:16px 0;font-size:14px">${table}</table>${yourMsg}${where.html}${charged && de ? 'Die Zahlungsbestätigung von Stripe kommt in einer eigenen E-Mail. Fragen oder etwas ändern? Antworte einfach auf diese E-Mail.<br><br>Liebe Grüße 💛<br>Jirel von <b>Twiggli</b>' : de ? 'Fragen oder etwas ändern? Antworte einfach auf diese E-Mail.<br><br>Liebe Grüße 💛<br>Jirel von <b>Twiggli</b>' : `${charged ? 'Your payment receipt from Stripe comes in a separate email. ' : ''}Questions, or need to change something? Just reply to this email.<br><br>Warm regards 💛<br>Jirel from <b>Twiggli</b>`}</div>`,
    });
  } catch (err) { console.error('booking guest mail failed', id, err?.message); }
  // To the host, in the language she chose (Einstellungen → Präferenzen), else the one we write to her in.
  const hl = (await hostPrefs(bk.slug)).lang || HOST_LANG[bk.slug] || 'de';
  const HM = {
    de: { subj: `Neue Buchung über Twiggli: ${bk.title}, ${bk.date} ${bk.start} (${bk.people} ${bk.people === 1 ? 'Platz' : 'Plätze'}) 🎉`, hi: 'Hallo,<br><br>gerade wurde über Twiggli gebucht und bezahlt:', ws: 'Workshop', when: 'Wann', where: 'Wo', spots: 'Plätze', voucher: 'Gutschein', paid: 'Bezahlt', guest: 'Gast', payout: 'Auszahlung',
      stripe: (net, gross) => `<b>${net}</b> über Stripe (${gross} minus ${bk.commissionPct} % Twiggli${bk.commissionPct ? '' : ', erste Buchung provisionsfrei'}, abzüglich Stripe-Gebühren)`, vc: (net, gross) => `<b>${net}</b> für den Gutschein (${gross} minus 15 %), zahlt Twiggli bis zum 10. des Folgemonats aus`,
      msg: `Nachricht von ${first_}:`, there: 'Das Geld liegt schon auf deinem Stripe-Konto. ', reply: `Antworte auf diese E-Mail, um ${esc(first_)} direkt zu schreiben, oder in deinem Twiggli-Konto unter Nachrichten.`, bye: 'Liebe Grüße<br>Jirel, Gründerin @ <b>Twiggli</b>' },
    en: { subj: `New booking through Twiggli: ${bk.title}, ${bk.date} ${bk.start} (${bk.people} ${bk.people === 1 ? 'spot' : 'spots'}) 🎉`, hi: 'Hi,<br><br>someone just booked and paid through Twiggli:', ws: 'Workshop', when: 'When', where: 'Where', spots: 'Spots', voucher: 'Voucher', paid: 'Paid', guest: 'Guest', payout: 'Payout',
      stripe: (net, gross) => `<b>${net}</b> via Stripe (${gross} minus ${bk.commissionPct}% Twiggli${bk.commissionPct ? '' : ', first booking commission-free'}, less Stripe fees)`, vc: (net, gross) => `<b>${net}</b> for the voucher (${gross} minus 15%), paid out by Twiggli by the 10th of next month`,
      msg: `Message from ${first_}:`, there: 'The money is already in your Stripe account. ', reply: `Reply to this email to write to ${esc(first_)} directly, or in your Twiggli account under Messages.`, bye: 'Warm regards<br>Jirel, Founder @ <b>Twiggli</b>' },
    fr: { subj: `Nouvelle réservation via Twiggli : ${bk.title}, ${bk.date} ${bk.start} (${bk.people} ${bk.people === 1 ? 'place' : 'places'}) 🎉`, hi: 'Bonjour,<br><br>quelqu’un vient de réserver et de payer via Twiggli :', ws: 'Atelier', when: 'Quand', where: 'Où', spots: 'Places', voucher: 'Bon cadeau', paid: 'Payé', guest: 'Participant·e', payout: 'Versement',
      stripe: (net, gross) => `<b>${net}</b> via Stripe (${gross} moins ${bk.commissionPct} % Twiggli${bk.commissionPct ? '' : ', première réservation sans commission'}, moins les frais Stripe)`, vc: (net, gross) => `<b>${net}</b> pour le bon cadeau (${gross} moins 15 %), versé par Twiggli avant le 10 du mois suivant`,
      msg: `Message de ${first_} :`, there: 'L’argent est déjà sur ton compte Stripe. ', reply: `Réponds à cet e-mail pour écrire directement à ${esc(first_)}, ou dans ton compte Twiggli, rubrique Messages.`, bye: 'Belle journée<br>Jirel, fondatrice @ <b>Twiggli</b>' },
  };
  const h = HM[hl] ?? HM.de;
  const hDay = new Date(`${bk.date}T12:00:00Z`).toLocaleDateString(hl === 'de' ? 'de-DE' : hl === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const hRows = [[h.ws, bk.title], [h.when, `${hDay}, ${bk.start}`], [h.where, bk.location], [h.spots, String(bk.people)], ...(vc ? [[h.voucher, `−${eur(vc)}`]] : []), [h.paid, eur(charged)]].filter(([, v]) => v);
  const hTable = hRows.map(([k, v]) => `<tr><td style="padding:5px 16px 5px 0;color:#8b87a0">${esc(k)}</td><td style="padding:5px 0"><b>${esc(v)}</b></td></tr>`).join('');
  try {
    await mail.sendMail({
      from: { name: 'Twiggli', address: SENDER }, replyTo: bk.email, to: bk.hostEmail, cc: INBOX,
      subject: h.subj,
      html: `<div style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.6;color:#24272e;max-width:560px">${h.hi}${msgBox(h.msg)}<table style="margin:16px 0;font-size:14px">${hTable}<tr><td style="padding:5px 16px 5px 0;color:#8b87a0">${h.guest}</td><td style="padding:5px 0"><b>${esc(bk.name)}</b>, ${esc(bk.email)}${bk.phone ? `, ${esc(bk.phone)}` : ''}</td></tr><tr><td style="padding:5px 16px 5px 0;color:#8b87a0">${h.payout}</td><td style="padding:5px 0">${charged ? h.stripe(eur(charged - bk.fee), eur(charged)) : ''}${charged && vc ? '<br>' : ''}${vc ? h.vc(eur(Math.round(vc * 0.85)), eur(vc)) : ''}</td></tr></table>${charged ? h.there : ''}${h.reply}<br><br>${h.bye}</div>`,
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
const STRIPE_CONNECT_CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID || 'ca_QaWbR04JTLWo9PD1cyxjKX34tkG9H1Xg';
/** Back to the payments tab of the account, in the host's language. */
const stripeBack = (lang) => `${SITE}${lang === 'en' ? '' : lang === 'fr' ? '/fr' : '/de'}/host/account/settings/payments/`;
const stripeLang = (l) => (l === 'en' || l === 'fr' ? l : 'de');
/** Who started the linking, signed, so the way back can't be forged. */
const oauthState = async (email, lang) => {
  const raw = Buffer.from(JSON.stringify({ e: email, l: lang, t: Date.now() })).toString('base64url');
  const sig = createHmac('sha256', await approveKey()).update(`stripe-oauth\n${raw}`).digest('base64url');
  return `${raw}.${sig}`;
};

export const hostStripeOAuth = onRequest({ region: 'europe-west3', secrets: [STRIPE_CONNECT_KEY, GMAIL_APP_PASSWORD], maxInstances: 5 }, async (req, res) => {
  const [raw = '', sig = ''] = String(req.query.state ?? '').split('.');
  let st = null;
  try {
    const want = createHmac('sha256', await approveKey()).update(`stripe-oauth\n${raw}`).digest('base64url');
    if (want.length === sig.length && timingSafeEqual(Buffer.from(want), Buffer.from(sig))) st = JSON.parse(Buffer.from(raw, 'base64url').toString());
  } catch { st = null; }
  // On failure the reason goes along (short, plain text), so the dashboard
  // can show Stripe's own words instead of only "could not be opened"
  // (Jirel 20.11.26, after Pia's link failed on a key without OAuth rights).
  const back = (lang, how, why = '') => res.redirect(302, `${stripeBack(stripeLang(lang))}?stripe=${how}${why ? `&why=${encodeURIComponent(String(why).replace(/[^\w .,:;'()\-\/]/g, '').slice(0, 160))}` : ''}`);
  if (!st || Date.now() - st.t > 60 * 60 * 1000 || !isEmail(st.e)) return back('de', 'failed', 'link expired, please start again');
  if (req.query.error || !req.query.code) return back(st.l, 'cancelled');
  const r = await fetch('https://connect.stripe.com/oauth/token', {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRIPE_CONNECT_KEY.value()}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code: String(req.query.code) }),
  });
  const tok = await r.json().catch(() => ({}));
  if (!r.ok || !/^acct_\w+$/.test(String(tok.stripe_user_id ?? ''))) {
    console.error('hostStripeOAuth token failed', tok?.error, tok?.error_description);
    return back(st.l, 'failed', tok?.error_description || tok?.error || `Stripe status ${r.status}`);
  }
  const accountId = tok.stripe_user_id;
  let chargesEnabled = false;
  try {
    const a = await (await stripe(STRIPE_CONNECT_KEY.value(), `accounts/${accountId}`)).json();
    chargesEnabled = !!a.charges_enabled;
  } catch { /* checked again on the dashboard */ }
  await getFirestore().doc(`hostMembers/${st.e.toLowerCase()}`).set({ stripe: { accountId, chargesEnabled, linked: true, linkedAt: FieldValue.serverTimestamp() } }, { merge: true });
  // Right after linking, Stripe often still reports the account as not ready;
  // the dashboard checks again on return and sends "ready for payments" then.
  await mailStripeNews(st.e.toLowerCase(), chargesEnabled ? 'linked, ready for payments' : 'linked (status is confirmed the next time their dashboard loads)');
  return back(st.l, 'linked');
});

// ── Signing in with a 6-digit code (Jirel 13.11.26, like Luma) ───────────
// signinCode emails a code (valid 5 minutes; code only, no link since
// 13.11.26); signinVerify checks it and hands
// back a Firebase custom token, which the page signs in with. Codes are
// kept only as a keyed hash in Firestore signinCodes/{hash of the email},
// which no browser can read (firestore.rules). At most 5 wrong tries per
// code, one new code a minute and 6 an hour per address.
// createCustomToken needs the functions' service account to hold the role
// "Service Account Token Creator" on itself (functions/README.md).

const CODE_TTL = 5 * 60 * 1000; // 5 minutes (Jirel 13.11.26)
const codeDoc = (email) => getFirestore().doc(`signinCodes/${createHash('sha256').update(email).digest('hex')}`);
const signinHash = (key, email, code) => createHmac('sha256', key).update(`code\n${email}\n${code}`).digest('hex');

const codeMail = (lang, code, link, kind = 'signin') => {
  const de = lang === 'de';
  // kind 'confirm-on' / 'confirm-off': the code to turn two-factor on or off,
  // and the email says so (Jirel 15.11.26).
  const off = kind === 'confirm-off';
  const del = kind === 'confirm-delete';
  const confirm = del
    ? (de
      ? { subject: `Code zum Löschen deines Kontos: ${code}`, head: 'Code zum Löschen deines Twiggli-Kontos', lede: 'Das ist dein Twiggli-Bestätigungscode, um dein Konto endgültig zu löschen.', foot: `Du erkennst diese E-Mail nicht und glaubst, jemand gibt sich als du aus? Schreib uns an ${SENDER}.` }
      : { subject: `Code to delete your account: ${code}`, head: 'Code to delete your Twiggli account', lede: 'This is your Twiggli confirmation code to permanently delete your account.', foot: `Don't recognise this email and think someone may be impersonating you? Write to us at ${SENDER}.` })
    : kind.startsWith('confirm')
    ? (de
      ? { subject: `Code zum ${off ? 'Ausschalten' : 'Einschalten'} der 2FA: ${code}`, head: `Code zum ${off ? 'Ausschalten' : 'Einschalten'} der Zwei-Faktor-Authentifizierung`, lede: `Das ist dein Twiggli-Bestätigungscode, um die Zwei-Faktor-Authentifizierung ${off ? 'auszuschalten' : 'einzuschalten'}.`, foot: `Du erkennst diese E-Mail nicht und glaubst, jemand gibt sich als du aus? Schreib uns an ${SENDER}.` }
      : { subject: `Code to turn ${off ? 'off' : 'on'} 2FA: ${code}`, head: `Code to turn ${off ? 'off' : 'on'} two-factor authentication`, lede: `This is your Twiggli confirmation code to turn ${off ? 'off' : 'on'} two-factor authentication.`, foot: `Don't recognise this email and think someone may be impersonating you? Write to us at ${SENDER}.` })
    : {};
  const t0 = de
    ? { subject: `${code} ist dein Twiggli-Anmeldecode`, head: 'Dein Anmeldecode', lede: 'Gib diesen Code auf twiggli.com ein, um dich anzumelden.', or: 'Oder melde dich direkt an:', btn: 'Bei Twiggli anmelden', safe: 'Teile diesen Code mit niemandem und gib ihn nur auf unserer Website ein. Wir fragen dich nie per Telefon, Chat oder E-Mail danach.', foot: 'Du hast keinen Code angefordert? Dann kannst du diese E-Mail einfach ignorieren.' }
    : { subject: `${code} is your Twiggli sign-in code`, head: 'Your sign-in code', lede: 'Enter this code on twiggli.com to sign in.', or: 'Or sign in directly:', btn: 'Sign in to Twiggli', safe: 'Never share this code or enter it anywhere other than our website. We will never ask you for it by phone, chat or email.', foot: "Didn't ask for a code? You can safely ignore this email." };
  let t = { ...t0, ...confirm };
  // French (Jirel 15.11.26: emails in the language the host chose).
  if (lang === 'fr') {
    const fr0 = { subject: `${code} est ton code de connexion Twiggli`, head: 'Ton code de connexion', lede: 'Saisis ce code sur twiggli.com pour te connecter.', or: 'Ou connecte-toi directement :', btn: 'Se connecter à Twiggli', safe: 'Ne partage jamais ce code et ne le saisis que sur notre site. Nous ne te le demanderons jamais par téléphone, chat ou e-mail.', foot: "Tu n'as pas demandé de code ? Tu peux ignorer cet e-mail." };
    const notme = `Tu ne reconnais pas cet e-mail et penses que quelqu'un se fait passer pour toi ? Écris-nous à ${SENDER}.`;
    const frc = del
      ? { subject: `Code pour supprimer ton compte : ${code}`, head: 'Code pour supprimer ton compte Twiggli', lede: 'Voici ton code de confirmation Twiggli pour supprimer définitivement ton compte.', foot: notme }
      : kind.startsWith('confirm')
        ? { subject: `Code pour ${off ? 'désactiver' : 'activer'} la 2FA : ${code}`, head: `Code pour ${off ? 'désactiver' : 'activer'} l’authentification à deux facteurs`, lede: `Voici ton code de confirmation Twiggli pour ${off ? 'désactiver' : 'activer'} l’authentification à deux facteurs.`, foot: notme }
        : {};
    t = { ...fr0, ...frc };
  }
  const html = `<!doctype html><html><body style="margin:0;background:#f6f3ff;font-family:Tahoma,Arial,sans-serif;color:#24272e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#fff;border-radius:24px;padding:32px 28px;text-align:center">
<tr><td><img src="${SITE}/img/logo.png" width="44" height="44" alt="Twiggli" style="display:block;margin:0 auto 18px"></td></tr>
<tr><td style="font-size:20px;font-weight:bold;padding-bottom:8px">${t.head}</td></tr>
<tr><td style="font-size:14px;line-height:1.5;color:#5b5f6b;padding-bottom:22px">${t.lede.replace('twiggli.com', `<a href="${SITE}${de ? '/de' : lang === 'fr' ? '/fr' : ''}/host/account/" style="color:#6A3EEC;text-decoration:none;font-weight:bold">twiggli.com</a>`)}</td></tr>
<tr><td style="padding-bottom:24px;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;font-size:40px;font-weight:bold;line-height:1.1;color:#24272e;-webkit-user-select:all;user-select:all">${code}</td></tr>
${link ? `<tr><td style="font-size:13px;color:#5b5f6b;padding-bottom:10px">${t.or}</td></tr>
<tr><td style="padding-bottom:22px"><a href="${link}" style="display:inline-block;background:#6A3EEC;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;border-radius:999px;padding:12px 24px">${t.btn}</a></td></tr>` : ''}
<tr><td style="font-size:12px;color:#5b5f6b;line-height:1.5;padding-bottom:8px">${t.safe}</td></tr>
<tr><td style="font-size:12px;color:#8a8f9c;line-height:1.5">${t.foot}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${t.head}: ${code}\n\n${t.lede}${link ? `\n\n${t.or} ${link}` : ''}\n\n${t.safe}\n\n${t.foot}`;
  return { subject: t.subject, html, text };
};

export const signinCode = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD, BREVO_API_KEY], maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  if (!isEmail(email) || email.length > 200) return res.status(400).json({ error: 'email' });
  const lang = ['de', 'fr'].includes(req.body?.lang) ? req.body.lang : 'en';
  const ref = codeDoc(email);
  const now = Date.now();
  const prev = (await ref.get()).data();
  const hour = (prev?.sent ?? []).filter((t) => now - t < 3600e3);
  if (prev?.lastSent && now - prev.lastSent < 55e3) return res.status(429).json({ error: 'wait', wait: Math.ceil((60e3 - (now - prev.lastSent)) / 1000) });
  if (hour.length >= 6) return res.status(429).json({ error: 'hour' });
  const code = String(randomInt(0, 1e6)).padStart(6, '0');
  await ref.set({ hash: signinHash(await approveKey(), email, code), expires: now + CODE_TTL, tries: 0, lastSent: now, sent: [...hour, now] });
  // Code only, no sign-in link (Jirel 13.11.26): the email tells people to
  // type the code on twiggli.com and nowhere else, and a link would muddy that.
  const link = '';
  const m = codeMail(lang, code, link);
  // Brevo first (system mail from no-reply@twiggli.com), Gmail if that fails.
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY.value(), 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ sender: { name: 'Twiggli', email: 'no-reply@twiggli.com' }, to: [{ email }], subject: m.subject, htmlContent: m.html, textContent: m.text, tags: ['signin-code'] }),
    });
    if (r.ok) return res.status(200).json({ ok: true });
    console.error('code mail brevo', r.status, (await r.text()).slice(0, 300));
  } catch (err) {
    console.error('code mail brevo', err?.message);
  }
  try {
    const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
    await mail.sendMail({ from: { name: 'Twiggli', address: SENDER }, to: email, subject: m.subject, text: m.text, html: m.html, noBcc: true });
  } catch (err) {
    console.error('code mail', err?.message);
    return res.status(502).json({ error: 'mail' });
  }
  return res.status(200).json({ ok: true });
});

export const signinVerify = onRequest({ region: 'europe-west3', maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const code = String(req.body?.code ?? '').replace(/\D/g, '');
  if (!isEmail(email) || code.length !== 6) return res.status(400).json({ error: 'code' });
  const ref = codeDoc(email);
  const key = await approveKey();
  const verdict = await getFirestore().runTransaction(async (t) => {
    const d = (await t.get(ref)).data();
    if (!d?.hash || Date.now() > d.expires) return 'expired';
    if ((d.tries ?? 0) >= 5) return 'tries';
    const a = Buffer.from(signinHash(key, email, code), 'hex');
    const b = Buffer.from(d.hash, 'hex');
    if (a.length === b.length && timingSafeEqual(a, b)) { t.update(ref, { hash: FieldValue.delete(), expires: 0 }); return 'ok'; }
    t.update(ref, { tries: (d.tries ?? 0) + 1 });
    return (d.tries ?? 0) + 1 >= 5 ? 'tries' : 'wrong';
  });
  if (verdict !== 'ok') return res.status(verdict === 'wrong' ? 401 : 410).json({ error: verdict });
  let user;
  try { user = await getAuth().getUserByEmail(email); } catch { user = await getAuth().createUser({ email, emailVerified: true }); }
  if (!user.emailVerified) await getAuth().updateUser(user.uid, { emailVerified: true });
  try {
    return res.status(200).json({ token: await getAuth().createCustomToken(user.uid) });
  } catch (err) {
    console.error('custom token', err?.message);
    return res.status(500).json({ error: 'token' });
  }
});

// ── Profile numbers (Jirel 14.11.26, like Luma: hosted · attended) ────────
// hosted: requests to the caller's pages that they accepted; attended:
// the caller's own requests that a host accepted.
export const profileStats = onRequest({ region: 'europe-west3', maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const email = await caller(req);
  if (!email) return res.status(401).json({ error: 'Sign in first' });
  const col = getFirestore().collection('formRequests');
  const count = async (q) => (await q.count().get()).data().count;
  try {
    const attended = await count(col.where('email', '==', email).where('status', '==', 'accepted'));
    let hosted = 0;
    for (const s of (await mySlugs(email)).slice(0, 10)) hosted += await count(col.where('hostSlug', '==', s).where('status', '==', 'accepted'));
    return res.status(200).json({ hosted, attended });
  } catch (err) {
    console.error('profileStats', err?.message);
    return res.status(200).json({ hosted: null, attended: null });
  }
});

// ── Profile photo (Jirel 14.11.26): the page sends a small JPEG (resized in
// the browser), saved to Storage as avatars/<uid>-<time>.jpg with a download
// token, then set as the Firebase user's photoURL. { remove: true } clears it.
export const profilePhoto = onRequest({ region: 'europe-west3', maxInstances: 5, cors: false, memory: '512MiB' }, async (req, res) => {
  if (!allow(req, res)) return;
  const m = /^Bearer (.+)$/.exec(req.get('authorization') ?? '');
  let user;
  try { user = m ? await getAuth().verifyIdToken(m[1], true) : null; } catch { user = null; }
  if (user && await mfaMissing(user)) user = null;
  if (!user?.uid) return res.status(401).json({ error: 'Sign in first' });
  if (req.body?.remove) {
    await getAuth().updateUser(user.uid, { photoURL: null });
    return res.status(200).json({ ok: true, url: '' });
  }
  const d = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.image ?? ''));
  if (!d) return res.status(400).json({ error: 'image' });
  const buf = Buffer.from(d[2], 'base64');
  if (buf.length > 2 * 1024 * 1024) return res.status(413).json({ error: 'too big' });
  try {
    const bucket = adminStorage().bucket();
    const path = `avatars/${user.uid}-${Date.now()}.${d[1] === 'jpeg' ? 'jpg' : d[1]}`;
    const token = randomBytes(16).toString('hex');
    await bucket.file(path).save(buf, { contentType: `image/${d[1]}`, metadata: { cacheControl: 'public, max-age=31536000', metadata: { firebaseStorageDownloadTokens: token } } });
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
    await getAuth().updateUser(user.uid, { photoURL: url });
    return res.status(200).json({ ok: true, url });
  } catch (err) {
    console.error('profilePhoto', err?.message);
    return res.status(500).json({ error: 'upload' });
  }
});

// ── Account settings (Jirel 14.11.26, like Luma): first/last name, a short
// bio and social links, plus the email language. Kept in Firestore
// userSettings/{uid}; the name also becomes the account's displayName.
const SOCIAL = { instagram: /^[A-Za-z0-9._]{1,30}$/, tiktok: /^[A-Za-z0-9._]{1,30}$/, youtube: /^[A-Za-z0-9._-]{1,60}$/, linkedin: /^(in|company)\/[A-Za-z0-9_%-]{2,100}$/ };
export const userSettings = onRequest({ region: 'europe-west3', maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const m = /^Bearer (.+)$/.exec(req.get('authorization') ?? '');
  let user;
  try { user = m ? await getAuth().verifyIdToken(m[1], true) : null; } catch { user = null; }
  if (user && await mfaMissing(user)) user = null;
  if (!user?.uid) return res.status(401).json({ error: 'Sign in first' });
  const ref = getFirestore().doc(`userSettings/${user.uid}`);
  if (req.body?.action !== 'save') return res.status(200).json((await ref.get()).data() ?? {});
  const b = req.body ?? {};
  const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  const handle = (v) => clean(v, 80).replace(/^https?:\/\/(www\.)?[^/]+\/@?/i, '').replace(/^@/, '').replace(/\/+$/, '');
  const out = {
    first: clean(b.first, 40), last: clean(b.last, 40),
    bio: String(b.bio ?? '').trim().slice(0, 200),
    updatedAt: FieldValue.serverTimestamp(), email: user.email ?? '',
  };
  // The language is only set when the host picks it in Präferenzen
  // (langPick); langAt marks it as their own choice, which then also
  // decides the language of the automatic booking emails (hostPrefs).
  if (['en', 'de', 'fr'].includes(b.langPick)) { out.lang = b.langPick; out.langAt = Date.now(); }
  // Phone: only Twiggli sees it (Jirel 15.11.26), for same-day requests.
  const phone = clean(b.phone, 30);
  out.phone = /^\+?[0-9][0-9 ()/.-]{5,28}$/.test(phone) ? phone : '';
  // Email notifications that can be switched off. New requests always go out.
  // Notifications per topic and channel (Jirel 16.11.26): { key: { email, push } }.
  const NT = ['h_requests', 'h_bookings', 'h_messages', 'h_reminders', 'h_reviews', 'h_payouts', 'g_booking', 'g_changes', 'g_reminders', 'g_messages', 'g_waitlist', 'g_feedback', 't_news', 't_ideas'];
  const LOCKED = ['h_requests', 'h_bookings', 'g_booking', 'g_changes'];
  let nt = {};
  try { nt = JSON.parse(String(b.notifyJson ?? '{}')); } catch { nt = {}; }
  out.notify = Object.fromEntries(NT.map((k) => [k, { email: LOCKED.includes(k) || nt?.[k]?.email !== false, push: nt?.[k]?.push !== false }]));
  out.notifyReviews = out.notify.h_reviews.email ? 'on' : 'off';
  out.notifyNews = out.notify.t_news.email ? 'on' : 'off';
  for (const [k, re] of Object.entries(SOCIAL)) { const h = handle(b[k]); out[k] = re.test(h) ? h : ''; }
  const site = clean(b.website, 200);
  out.website = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(site) ? (site.startsWith('http') ? site : `https://${site}`) : '';
  await ref.set(out, { merge: true });
  const name = `${out.first} ${out.last}`.trim();
  if (name) await getAuth().updateUser(user.uid, { displayName: name });
  const { updatedAt, ...back } = (await ref.get()).data() ?? {};
  return res.status(200).json(back);
});

/** A system email from no-reply@twiggli.com: Brevo first, Gmail if that fails. */
const systemMail = async (to, m, tag) => {
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY.value(), 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ sender: { name: 'Twiggli', email: 'no-reply@twiggli.com' }, to: [{ email: to }], ...(INBOX && !/code/.test(tag) ? { bcc: [{ email: INBOX }] } : {}), subject: m.subject, htmlContent: m.html, textContent: m.text, tags: [tag] }),
    });
    if (r.ok) return true;
    console.error('system mail brevo', tag, r.status, (await r.text()).slice(0, 200));
  } catch (err) { console.error('system mail brevo', tag, err?.message); }
  try {
    const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
    await mail.sendMail({ from: { name: 'Twiggli', address: SENDER }, to, subject: m.subject, text: m.text, html: m.html, noBcc: /code/.test(tag) });
    return true;
  } catch (err) { console.error('system mail', tag, err?.message); return false; }
};

/** "Two-factor was turned on / off / a backup code was used" (Jirel
 *  15.11.26), so a host notices at once if it wasn't them. */
const securityMail = (lang, event) => {
  const de = lang === 'de';
  const when = new Date().toLocaleString(de ? 'de-DE' : 'en-GB', { timeZone: 'Europe/Berlin', dateStyle: 'long', timeStyle: 'short' });
  const T = de ? {
    on: ['Zwei-Faktor-Authentifizierung ist an', 'Ab jetzt fragen wir beim Anmelden zusätzlich nach dem Code aus deiner Authenticator-App.'],
    off: ['Zwei-Faktor-Authentifizierung ist aus', 'Beim Anmelden fragen wir jetzt nur noch nach dem Code per E-Mail.'],
    backup: ['Ein Backup-Code wurde benutzt', 'Jemand hat sich mit einem deiner Backup-Codes angemeldet. Dieser Code funktioniert ab jetzt nicht mehr.'],
    at: `Am ${when} Uhr (Berlin)`, notyou: `Warst du das nicht? Schreib uns sofort an <a href="mailto:${SENDER}" style="color:#6A3EEC;text-decoration:none;font-weight:bold">${SENDER}</a>, dann sichern wir dein Konto.`,
    subject: { on: 'Zwei-Faktor-Authentifizierung eingeschaltet', off: 'Zwei-Faktor-Authentifizierung ausgeschaltet', backup: 'Backup-Code für dein Twiggli-Konto benutzt' },
  } : {
    on: ['Two-factor authentication is on', "From now on we'll also ask for the code from your authenticator app when you sign in."],
    off: ['Two-factor authentication is off', "When you sign in we'll now only ask for the code by email."],
    backup: ['A backup code was used', 'Someone signed in with one of your backup codes. That code no longer works.'],
    at: `On ${when} (Berlin time)`, notyou: `Wasn't you? Write to us right away at <a href="mailto:${SENDER}" style="color:#6A3EEC;text-decoration:none;font-weight:bold">${SENDER}</a> and we'll secure your account.`,
    subject: { on: 'Two-factor authentication turned on', off: 'Two-factor authentication turned off', backup: 'Backup code used on your Twiggli account' },
  };
  if (lang === 'fr') {
    const quand = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Berlin', dateStyle: 'long', timeStyle: 'short' });
    Object.assign(T, {
      on: ['L’authentification à deux facteurs est activée', 'Désormais, nous te demanderons aussi le code de ton application d’authentification à la connexion.'],
      off: ['L’authentification à deux facteurs est désactivée', 'À la connexion, nous ne te demanderons plus que le code par e-mail.'],
      backup: ['Un code de secours a été utilisé', 'Quelqu’un s’est connecté avec l’un de tes codes de secours. Ce code ne fonctionne plus.'],
      at: `Le ${quand} (heure de Berlin)`, notyou: `Ce n’était pas toi ? Écris-nous tout de suite à <a href="mailto:${SENDER}" style="color:#6A3EEC;text-decoration:none;font-weight:bold">${SENDER}</a> et nous sécuriserons ton compte.`,
      subject: { on: 'Authentification à deux facteurs activée', off: 'Authentification à deux facteurs désactivée', backup: 'Code de secours utilisé sur ton compte Twiggli' },
    });
  }
  const [head, lede] = T[event];
  const html = `<!doctype html><html><body style="margin:0;background:#f6f3ff;font-family:Tahoma,Arial,sans-serif;color:#24272e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#fff;border-radius:24px;padding:32px 28px;text-align:center">
<tr><td><img src="${SITE}/img/logo.png" width="44" height="44" alt="Twiggli" style="display:block;margin:0 auto 18px"></td></tr>
<tr><td style="font-size:20px;font-weight:bold;padding-bottom:8px">${head}</td></tr>
<tr><td style="font-size:14px;line-height:1.5;color:#5b5f6b;padding-bottom:14px">${lede}</td></tr>
<tr><td style="font-size:13px;color:#8a8f9c;padding-bottom:20px">${T.at}</td></tr>
<tr><td style="font-size:13px;line-height:1.5;color:#24272e">${T.notyou}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${head}\n\n${lede}\n${T.at}\n\n${T.notyou.replace(/<[^>]+>/g, '')}`;
  return { subject: T.subject[event], html, text };
};
const tfaSudoDoc = (uid) => getFirestore().doc(`twoFactorSudo/${uid}`);

// Every change to two-factor needs a fresh email code first (Jirel 15.11.26,
// like Luma's "Confirm access"): confirmSend → confirmCheck { code } opens
// 10 minutes in which setup / enable / disable work.
// status → { on, since, verified }; setup → { qr (svg), secret, uri };
// enable { code } → { backup }; verify { code | backup } → { token };
// disable { code | backup } → { ok }. Wrong codes: 5 tries, then 10 minutes.
export const twoFactor = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD, BREVO_API_KEY], maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const m = /^Bearer (.+)$/.exec(req.get('authorization') ?? '');
  let t;
  try { t = m ? await getAuth().verifyIdToken(m[1], true) : null; } catch { t = null; }
  if (!t?.uid || !t.email) return res.status(401).json({ error: 'Sign in first' });
  const action = String(req.body?.action ?? 'status');
  const lang = ['en', 'fr'].includes(req.body?.lang) ? req.body.lang : 'de';
  const ref = tfaDoc(t.uid);
  const sudoRef = tfaSudoDoc(t.uid);
  const sudo = (await sudoRef.get()).data() ?? {};
  const now = Date.now();
  const tell = (event) => systemMail(t.email, securityMail(lang, event), `2fa-${event}`).catch(() => {});

  if (action === 'confirmSend') {
    const hour = (sudo.sent ?? []).filter((x) => now - x < 3600e3);
    if (sudo.lastSent && now - sudo.lastSent < 55e3) return res.status(429).json({ error: 'wait', wait: Math.ceil((60e3 - (now - sudo.lastSent)) / 1000) });
    if (hour.length >= 6) return res.status(429).json({ error: 'hour' });
    const code = String(randomInt(0, 1e6)).padStart(6, '0');
    await sudoRef.set({ hash: signinHash(await approveKey(), `sudo:${t.uid}`, code), expires: now + CODE_TTL, tries: 0, lastSent: now, sent: [...hour, now], until: 0 });
    const ok = await systemMail(t.email, codeMail(lang, code, '', req.body?.purpose === 'off' ? 'confirm-off' : req.body?.purpose === 'delete' ? 'confirm-delete' : 'confirm-on'), 'confirm-code');
    return ok ? res.status(200).json({ ok: true, to: t.email }) : res.status(502).json({ error: 'mail' });
  }
  if (action === 'confirmCheck') {
    const code = String(req.body?.code ?? '').replace(/\D/g, '');
    if (!sudo.hash || now > (sudo.expires ?? 0)) return res.status(410).json({ error: 'expired' });
    if ((sudo.tries ?? 0) >= 5) return res.status(429).json({ error: 'locked' });
    const a = Buffer.from(signinHash(await approveKey(), `sudo:${t.uid}`, code), 'hex');
    const b = Buffer.from(sudo.hash, 'hex');
    if (code.length !== 6 || a.length !== b.length || !timingSafeEqual(a, b)) {
      await sudoRef.update({ tries: (sudo.tries ?? 0) + 1 });
      return res.status(401).json({ error: 'wrong' });
    }
    await sudoRef.set({ hash: FieldValue.delete(), expires: 0, until: now + 10 * 60_000 }, { merge: true });
    return res.status(200).json({ ok: true });
  }
  const confirmed = (sudo.until ?? 0) > now;
  const snap = await ref.get();
  const d = snap.data();
  tfaCache.delete(t.uid);
  if (action === 'status') return res.status(200).json({ on: snap.exists, since: d?.since ?? null, verified: Boolean(t.mfa), confirmed });
  // Turning it on needs the email code first; turning it off is one click (Jirel 15.11.26).
  if (['setup', 'enable'].includes(action) && !confirmed) return res.status(403).json({ error: 'confirm' });

  let usedBackup = false;
  // Checks a code (or a backup code) against the saved secret; counts misses.
  const check = async (doc, secretBuf) => {
    if ((doc.lockUntil ?? 0) > Date.now()) return 'locked';
    const code = String(req.body?.code ?? '').replace(/\D/g, '');
    const backup = String(req.body?.backup ?? '').trim();
    if (code.length === 6) {
      const step = totpStep(secretBuf, code);
      if (step >= 0 && step > (doc.lastStep ?? -1)) { await ref.update({ lastStep: step, tries: 0 }); return 'ok'; }
    } else if (backup) {
      const h = backupHash(await approveKey(), backup);
      if ((doc.backup ?? []).includes(h)) { await ref.update({ backup: FieldValue.arrayRemove(h), tries: 0 }); usedBackup = true; return 'ok'; }
    }
    const tries = (doc.tries ?? 0) + 1;
    await ref.update(tries >= 5 ? { tries: 0, lockUntil: Date.now() + 10 * 60_000 } : { tries });
    return tries >= 5 ? 'locked' : 'wrong';
  };

  if (action === 'setup') {
    if (snap.exists) return res.status(409).json({ error: 'on' });
    const secret = randomBytes(20);
    const b32 = b32encode(secret);
    await tfaPendingDoc(t.uid).set({ secret: await seal(secret), expires: Date.now() + 15 * 60_000 });
    const label = encodeURIComponent(`Twiggli:${t.email}`);
    const uri = `otpauth://totp/${label}?secret=${b32}&issuer=Twiggli&algorithm=SHA1&digits=6&period=30`;
    const qr = await QRCode.toString(uri, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#16181d', light: '#0000' } });
    return res.status(200).json({ qr, secret: b32.match(/.{1,4}/g).join(' '), uri });
  }
  if (action === 'enable') {
    if (snap.exists) return res.status(409).json({ error: 'on' });
    const p = (await tfaPendingDoc(t.uid).get()).data();
    if (!p?.secret || Date.now() > p.expires) return res.status(410).json({ error: 'expired' });
    const secret = await unseal(p.secret);
    const step = totpStep(secret, String(req.body?.code ?? '').replace(/\D/g, ''));
    if (step < 0) return res.status(401).json({ error: 'wrong' });
    const codes = newBackupCodes();
    const key = await approveKey();
    await ref.set({ secret: p.secret, since: Date.now(), lastStep: step, tries: 0, backup: codes.map((c) => backupHash(key, c)) });
    await tfaPendingDoc(t.uid).delete();
    tfaCache.delete(t.uid);
    await tell('on');
    // This session just proved the app, so it may carry on.
    return res.status(200).json({ backup: codes, token: await getAuth().createCustomToken(t.uid, { mfa: Date.now() }) });
  }
  if (action === 'disable') {
    // One click, no code, no email (Jirel 15.11.26).
    if (snap.exists) {
      await ref.delete();
      tfaCache.delete(t.uid);
      await sudoRef.set({ until: 0 }, { merge: true });
      // No "turned off" email (Jirel 15.11.26): the email code to turn it off was enough.
    }
    return res.status(200).json({ ok: true });
  }
  if (action === 'verify') {
    if (!snap.exists) return res.status(200).json({ token: null });
    const verdict = await check(d, await unseal(d.secret));
    if (verdict !== 'ok') return res.status(verdict === 'locked' ? 429 : 401).json({ error: verdict });
    if (usedBackup) await tell('backup');
    try {
      return res.status(200).json({ token: await getAuth().createCustomToken(t.uid, { mfa: Date.now() }) });
    } catch (err) {
      console.error('2fa token', err?.message);
      return res.status(500).json({ error: 'token' });
    }
  }
  return res.status(400).json({ error: 'action' });
});

// ── Active devices and deleting the account (Jirel 15.11.26, like Luma) ──
// Every signed-in page load says hello (touch) with a random id kept in
// that browser; the settings list them. Signing out one device marks it,
// and that browser signs out on its next load; "all other devices" also
// revokes every sign-in token (the functions check revocation), and this
// device gets a fresh one.
const deviceLabel = (ua) => {
  const u = String(ua ?? '');
  const browser = /Edg\//.test(u) ? 'Edge' : /Firefox\//.test(u) ? 'Firefox' : /Chrome\//.test(u) ? 'Chrome' : /Safari\//.test(u) ? 'Safari' : 'Browser';
  const os = /iPhone|iPad/.test(u) ? 'iOS' : /Android/.test(u) ? 'Android' : /Mac OS X/.test(u) ? 'macOS' : /Windows/.test(u) ? 'Windows' : /Linux/.test(u) ? 'Linux' : '';
  return { browser, os, mobile: /iPhone|Android.*Mobile/.test(u) };
};
const devicesCol = (uid) => getFirestore().collection(`userDevices/${uid}/devices`);
export const accountDevices = onRequest({ region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 5, cors: false }, async (req, res) => {
  if (!allow(req, res)) return;
  const m = /^Bearer (.+)$/.exec(req.get('authorization') ?? '');
  let t;
  try { t = m ? await getAuth().verifyIdToken(m[1], true) : null; } catch { t = null; }
  if (!t?.uid) return res.status(401).json({ error: 'Sign in first' });
  const action = String(req.body?.action ?? 'list');
  const id = String(req.body?.device ?? '');
  const okId = /^[a-z0-9]{12,40}$/.test(id);
  const col = devicesCol(t.uid);
  const db = getFirestore();
  // The host pages only this account runs (pausing or deleting hides them).
  const ownSlugs = async (email) => {
    const mine = email ? ((await db.doc(`hostMembers/${email}`).get()).data()?.slugs ?? []) : [];
    const out = [];
    for (const slug of mine) {
      const others = await db.collection('hostMembers').where('slugs', 'array-contains', slug).get();
      if (!others.docs.some((x) => x.id !== email)) out.push(slug);
    }
    return out;
  };
  const note = async (subject, text) => {
    try {
      const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
      await mail.sendMail({ from: { name: 'Twiggli', address: INBOX }, to: INBOX, subject, text });
    } catch (err) { console.error('account note', err?.message); }
  };
  if (action === 'pause') {
    // Pause (Jirel 15.11.26): everything stays saved, but nothing of theirs
    // is shown to guests or search engines until they sign in again.
    const email = String(t.email ?? '').toLowerCase();
    const slugs = await ownSlugs(email);
    if (slugs.length) {
      await db.doc('_config/pausedHosts').set({ slugs: FieldValue.arrayUnion(...slugs) }, { merge: true });
      for (const slug of slugs) {
        const rv = await db.collection('guestReviews').where('host', '==', slug).where('status', '==', 'published').get();
        for (const x of rv.docs) await x.ref.update({ status: 'paused' });
      }
    }
    await db.doc(`userSettings/${t.uid}`).set({ pausedAt: Date.now(), pausedSlugs: slugs }, { merge: true });
    await getAuth().revokeRefreshTokens(t.uid);
    await note(`Account paused: ${email}`, `${email} paused their Twiggli account.${slugs.length ? ` ${slugs.join(', ')}: off the site with the next build (daily 02:30), reviews hidden now.` : ''} Everything stays saved; it comes back when they sign in again.`);
    return res.status(200).json({ ok: true });
  }
  if (action === 'touch') {
    if (!okId) return res.status(400).json({ error: 'device' });
    // Signing in again ends a pause: everything is shown again.
    const st = (await db.doc(`userSettings/${t.uid}`).get()).data();
    let unpaused = false;
    if (st?.pausedAt) {
      const slugs = st.pausedSlugs ?? [];
      if (slugs.length) {
        await db.doc('_config/pausedHosts').set({ slugs: FieldValue.arrayRemove(...slugs) }, { merge: true });
        for (const slug of slugs) {
          const rv = await db.collection('guestReviews').where('host', '==', slug).where('status', '==', 'paused').get();
          for (const x of rv.docs) await x.ref.update({ status: 'published' });
        }
      }
      await db.doc(`userSettings/${t.uid}`).set({ pausedAt: FieldValue.delete(), pausedSlugs: FieldValue.delete() }, { merge: true });
      await note(`Account back: ${t.email}`, `${t.email} signed in again, their paused account is active again.${slugs.length ? ` ${slugs.join(', ')} back on the site with the next build (daily 02:30).` : ''}`);
      unpaused = true;
    }
    const ref = col.doc(id);
    const d = (await ref.get()).data();
    if (d?.revoked) { await ref.delete(); return res.status(200).json({ signOut: true }); }
    // A sign-in on a new device (email code or Google): Jirel hears about it
    // (Jirel 18.11.26: stay in the loop, e.g. when a host first logs in).
    const who = String(t.email ?? '').toLowerCase();
    if (!d && who && !ADMINS.includes(who)) {
      const pages = (await db.doc(`hostMembers/${who}`).get()).data()?.slugs ?? [];
      const ua = String(req.get('user-agent') ?? '');
      const dev = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Mac OS/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'a browser';
      await note(`Signed in: ${who}${pages.length ? ` (host: ${pages.join(', ')})` : ''}`, `${who} signed in to Twiggli on ${dev}${pages.length ? `. Host of: ${pages.join(', ')}.` : '. No host page yet.'}`);
    }
    const city = String(req.get('x-client-geo-city') ?? req.get('x-appengine-city') ?? '').slice(0, 60);
    const country = String(req.get('x-client-geo-country') ?? req.get('x-appengine-country') ?? '').slice(0, 4);
    await ref.set({ ...deviceLabel(req.get('user-agent')), lastActive: Date.now(), ...(d ? {} : { since: Date.now() }), ...(city && city !== '?' ? { city } : {}), ...(country && country !== 'ZZ' ? { country } : {}) }, { merge: true });
    return res.status(200).json({ ok: true, unpaused });
  }
  if (action === 'payments') {
    // Payment history (Jirel 16.11.26): workshops booked and paid, and
    // vouchers bought, with this account's email. Newest first.
    const email = String(t.email ?? '').toLowerCase();
    const ms = (v) => v?.toMillis?.() ?? (typeof v === 'number' ? v : 0);
    const [bk, vc] = await Promise.all([
      getFirestore().collection('bookings').where('email', '==', email).limit(50).get().catch(() => ({ docs: [] })),
      getFirestore().collection('vouchers').where('buyer', '==', email).limit(50).get().catch(() => ({ docs: [] })),
    ]);
    const items = [
      ...bk.docs.map((x) => x.data()).filter((x) => x.status === 'paid').map((x) => ({ kind: 'booking', title: x.title, date: x.date, start: x.start, people: x.people, amount: x.amount ?? 0, voucher: x.paidBy === 'voucher', at: ms(x.paidAt) || ms(x.createdAt) })),
      ...vc.docs.map((x) => x.data()).map((x) => ({ kind: 'voucher', title: x.host || '', amount: x.amount ?? 0, at: ms(x.buyerConfirmedAt) || ms(x.createdAt) })),
    ].sort((a, b) => b.at - a.at);
    return res.status(200).json({ items });
  }
  if (action === 'list') {
    const snap = await col.orderBy('lastActive', 'desc').limit(20).get();
    return res.status(200).json({ devices: snap.docs.filter((x) => !x.data().revoked).map((x) => ({ id: x.id, ...x.data(), current: x.id === id })) });
  }
  if (action === 'revoke') {
    if (!okId || id === String(req.body?.current ?? '')) return res.status(400).json({ error: 'device' });
    await col.doc(id).set({ revoked: true }, { merge: true });
    return res.status(200).json({ ok: true });
  }
  if (action === 'revokeOthers') {
    const cur = String(req.body?.current ?? '');
    const snap = await col.get();
    const b = getFirestore().batch();
    snap.docs.forEach((x) => { if (x.id !== cur) b.set(x.ref, { revoked: true }, { merge: true }); });
    await b.commit();
    await getAuth().revokeRefreshTokens(t.uid);
    // This device stays signed in (with the second step if it had passed it).
    return res.status(200).json({ token: await getAuth().createCustomToken(t.uid, t.mfa ? { mfa: Date.now() } : undefined) });
  }
  if (action === 'delete') {
    // Needs the email code first ("Code zum Löschen deines Kontos").
    const sudo = (await tfaSudoDoc(t.uid).get()).data() ?? {};
    if (!((sudo.until ?? 0) > Date.now())) return res.status(403).json({ error: 'confirm' });
    const email = String(t.email ?? '').toLowerCase();
    // Their host pages: off the site, unless someone else still runs them.
    // What we may keep is held for 30 days in deletedAccounts/{uid} (not
    // public, not used), then purged; booking records stay for the tax
    // retention period (privacy policy, section on retention).
    const gone = await ownSlugs(email);
    const held = [];
    for (const slug of gone) {
      for (const c of ['hostProfiles', 'hostSlots', 'hostListings', 'hostEvents']) {
        const q = await db.collection(c).where('slug', '==', slug).get();
        for (const x of q.docs) { held.push({ c, id: x.id, data: x.data() }); await x.ref.delete(); }
      }
      const rv = await db.collection('guestReviews').where('host', '==', slug).get();
      for (const x of rv.docs) await x.ref.update({ status: 'withdrawn', withdrawnAt: Date.now() });
    }
    if (gone.length) await db.doc('_config/goneHosts').set({ slugs: FieldValue.arrayUnion(...gone) }, { merge: true });
    // Name and email are kept with it for the 30 days too (Jirel 15.11.26).
    const st = (await db.doc(`userSettings/${t.uid}`).get()).data() ?? {};
    let name = `${st.first ?? ''} ${st.last ?? ''}`.trim();
    if (!name) { try { name = (await getAuth().getUser(t.uid)).displayName ?? ''; } catch { /* none */ } }
    await db.doc(`deletedAccounts/${t.uid}`).set({ email, name, slugs: gone, deletedAt: Date.now(), purgeAfter: Date.now() + 30 * 864e5, held: JSON.stringify(held).slice(0, 900000) });
    await db.doc(`Users/${t.uid}`).delete().catch(() => {});
    const devs = await col.get();
    const b = db.batch();
    devs.docs.forEach((x) => b.delete(x.ref));
    for (const ref of [db.doc(`userSettings/${t.uid}`), tfaDoc(t.uid), tfaPendingDoc(t.uid), tfaSudoDoc(t.uid), ...(email ? [db.doc(`hostMembers/${email}`)] : [])]) b.delete(ref);
    await b.commit();
    try { const [files] = await adminStorage().bucket().getFiles({ prefix: `avatars/${t.uid}-` }); await Promise.all(files.map((f) => f.delete())); } catch (err) { console.error('delete avatars', err?.message); }
    await getAuth().deleteUser(t.uid);
    tfaCache.delete(t.uid);
    try {
      const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
      const until = new Date(Date.now() + 30 * 864e5).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
      await mail.sendMail({ from: { name: 'Twiggli', address: INBOX }, to: INBOX, subject: `Account deleted: ${name ? `${name}, ` : ''}${email}`, text: `${name ? `${name} (${email})` : email} deleted their Twiggli account on twiggli.com.

Done automatically:
- Login, profile, settings, photo, 2FA, devices, app profile (Users) deleted.
${gone.length ? `- Host page(s) ${gone.join(', ')}: off the site with the next build (daily 02:30), their dates, page texts and reviews are no longer shown.` : '- No host page of their own.'}
- Their name and email, and what we may keep, are held, not public, until ${until} (deletedAccounts), then deleted. Booking and payment records stay for the tax retention period.

Left for you by ${until}:
- Their row in 'Hosts & Emails' (and the other tabs).
- Brevo contact, if there is one.
${gone.length ? `- Add ${gone.join(', ')} to site/src/data/hosts/archived.ts and remove their copy and pictures (or ask me).` : ''}
- Stripe: they close their own Stripe account.` });
    } catch (err) { console.error('delete notice', err?.message); }
    return res.status(200).json({ ok: true });
  }
  return res.status(400).json({ error: 'action' });
});


// ── "How was it?": the review email, 24 hours after a workshop (Jirel
// 05.11.26, automated on the website 17.11.26 so its link goes straight
// to twiggli.com; Gmail's own sending turned links into redirects).
// Every hour from 9 to 20 o'clock: paid bookings, and requests a host got
// for one date, whose start is 24 h to 10 days past. Skipped: requests the
// host declined, duplicates, spam, tests, and anyone the 'booking requests'
// sheet marks as lost, cancelled, ill or on the waiting list. One ask per
// guest and host (reviewAsks), never more than two per guest in all.
const REVIEW_FROM = '2026-11-18'; // earlier ones were asked by hand
const reviewSheetText = async () => {
  const tok = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token?scopes=https://www.googleapis.com/auth/spreadsheets.readonly', { headers: { 'Metadata-Flavor': 'Google' } });
  if (!tok.ok) throw new Error(`token ${tok.status}`);
  const { access_token: token } = await tok.json();
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${HOST_SHEET}/values/${encodeURIComponent("'booking requests'!A1:AN400")}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`sheet ${res.status}`);
  return ((await res.json()).values ?? []).map((r) => r.join(' | '));
};
const hostCard = async (slug) => {
  const tok = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token?scopes=https://www.googleapis.com/auth/spreadsheets.readonly', { headers: { 'Metadata-Flavor': 'Google' } });
  const { access_token: token } = await tok.json();
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${HOST_SHEET}/values/${encodeURIComponent("'Hosts & Emails'!A2:K400")}`, { headers: { Authorization: `Bearer ${token}` } });
  for (const r of (await res.json()).values ?? []) {
    if (String(r[10] ?? '').toLowerCase().split(/[\s,;]+/).includes(slug)) return { first: String(r[0] ?? '').trim().split(/\s+/)[0], studio: String(r[1] ?? '').trim() };
  }
  return { first: '', studio: '' };
};
const reviewMail = ({ lang, first, workshop, hostLabel, hostFirst, studio, slug }) => {
  const de = lang === 'de';
  const link = `${SITE}${de ? '/de' : ''}/review/?${new URLSearchParams({ h: slug, n: first, w: workshop.slice(0, 60) })}`;
  const a = (t) => `<a href="${esc(link)}" style="color:#6A3EEC;font-weight:bold;text-decoration:none">${t}</a>`;
  const at = hostFirst && studio && studio !== hostFirst ? (de ? ` mit ${esc(hostFirst)} bei ${esc(studio)}` : ` with ${esc(hostFirst)} at ${esc(studio)}`) : hostFirst ? (de ? ` mit ${esc(hostFirst)}` : ` with ${esc(hostFirst)}`) : '';
  const subject = de ? `Wie war's bei ${hostLabel}? ⭐` : `How was it at ${hostLabel}? ⭐`;
  const html = `<div style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.6;color:#24272e;max-width:560px">
<p>${de ? 'Hallo' : 'Hi'} ${esc(first)},</p>
<p>${de ? `ich hoffe, es war schön bei <b>${esc(workshop)}</b>${at}!` : `I hope you had a lovely time at <b>${esc(workshop)}</b>${at}!`}</p>
<p>${de ? 'Magst du uns kurz erzählen, wie es war?' : 'Would you tell us briefly how it was?'}</p>
<ol style="padding-left:20px;margin:0 0 14px">
<li>${de ? 'Wie viele Sterne gibst du, 1 bis 5 ⭐?' : 'How many stars would you give, 1 to 5 ⭐?'}</li>
<li>${de ? 'Was hat dir am besten gefallen?' : 'What did you like most?'}</li>
<li>${de ? `Ein, zwei Sätze, die wir auf ${esc(hostLabel)}s Profil veröffentlichen dürfen?` : `One or two sentences we may publish on ${esc(hostLabel)}'s profile?`}</li>
</ol>
<p>${de ? `Antworte einfach auf diese E-Mail, oder schreib es ${a('hier')}.` : `Just reply to this email, or write it ${a('here')}.`}</p>
<p>${de ? 'Bewertungen sind Gold für kleine Studios und helfen ihnen, gefunden zu werden.' : 'Reviews are gold for small studios and help them get found.'}</p>
<p>${de ? 'Danke dir und liebe Grüße 💛<br>Jirel, Gründerin @ <b>Twiggli</b>' : 'Thank you and warm regards 💛<br>Jirel, Founder @ <b>Twiggli</b>'}</p>
<p style="font-size:12px;color:#8a8d96">${de ? 'Falls es doch nicht geklappt hat, antworte einfach kurz auf diese E-Mail, dann finden wir einen neuen Termin.' : "If it didn't work out in the end, just reply to this email and we'll find you a new date."}</p>
</div>`;
  const text = `${de ? 'Hallo' : 'Hi'} ${first},\n\n${html.replace(/<li>/g, '- ').replace(/<br>/g, '\n').replace(/<\/p>|<\/li>/g, '\n').replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').split('\n').slice(2).join('\n').trim()}\n\n${link}`;
  return { subject, html, text };
};
export const reviewAsk = onCron({ schedule: 'every 60 minutes', timeZone: 'Europe/Berlin', region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 1 }, async () => {
  const hour = Number(new Date().toLocaleString('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hour12: false }));
  if (hour < 9 || hour > 20) return;
  const db = getFirestore();
  const now = Date.now();
  const startOf = (iso, hm) => new Date(`${iso}T${/^\d\d:\d\d$/.test(hm ?? '') ? hm : '12:00'}:00+01:00`).getTime();
  const due = (t) => t <= now - 24 * 3600e3 && t >= now - 10 * 24 * 3600e3;
  const isTest = (e, n) => /(^|[^a-z])test([^a-z]|$)/i.test(`${n} ${e}`) || /jirel|twiggli\.com$/i.test(e);
  const todo = [];
  // Requests one host got (booking, group or date request)
  const since = new Date(now - 60 * 24 * 3600e3);
  const reqs = await db.collection('formRequests').where('createdAt', '>=', since).get();
  for (const d of reqs.docs) {
    const x = d.data();
    if (!x.hostSlug || x.spam || x.duplicateOf || x.reviewAskedAt || x.status === 'declined') continue;
    const f = x.fields ?? {};
    if (!/^(Booking request|Group booking request|Date request)$/.test(String(f.Type ?? ''))) continue;
    const iso = String(f.Date ?? '').match(/^(\d{4}-\d\d-\d\d)/)?.[1];
    if (!iso || iso < REVIEW_FROM || !due(startOf(iso, f.Time)) || !isEmail(x.email) || isTest(x.email, f.Name)) continue;
    todo.push({ ref: d.ref, email: String(x.email).toLowerCase(), slug: x.hostSlug, name: String(f.Name ?? '').trim(), workshop: String(f.Workshop ?? '').trim(), hostLabel: String(f.Host ?? '').trim(), lang: String(f.Language ?? '').startsWith('de') ? 'de' : 'en' });
  }
  // Paid bookings
  const paid = await db.collection('bookings').where('status', '==', 'paid').get();
  for (const d of paid.docs) {
    const b = d.data();
    if (b.reviewAskedAt || !(String(b.date ?? '') >= REVIEW_FROM) || !due(startOf(b.date, b.start)) || !isEmail(b.email) || isTest(b.email, b.name)) continue;
    todo.push({ ref: d.ref, email: String(b.email).toLowerCase(), slug: b.slug, name: String(b.name ?? '').trim(), workshop: String(b.title ?? '').trim(), hostLabel: '', lang: b.lang === 'de' ? 'de' : 'en' });
  }
  if (!todo.length) return;
  let sheet = [];
  try { sheet = await reviewSheetText(); } catch (err) { console.error('reviewAsk: sheet unreadable, waiting', err?.message); return; }
  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: INBOX, pass: GMAIL_APP_PASSWORD.value() } });
  for (const t of todo.slice(0, 20)) {
    const rows = sheet.filter((r) => r.toLowerCase().includes(t.email));
    // No review request for a host who has left Twiggli (Mampe, La HoCo: Jirel 22.11.26).
    if (ARCHIVED_HOSTS.has(t.slug)) { await t.ref.update({ reviewAskedAt: 'skipped' }); continue; }
    if (rows.some((r) => /\blost\b|verloren|cancel|abgesagt|storniert|did not happen|nicht stattgefunden|waiting list|warteliste|\bill\b|krank|rescheduled|verschoben/i.test(r))) { await t.ref.update({ reviewAskedAt: 'skipped' }); continue; }
    const key = createHash('sha256').update(`${t.email}|${t.slug}`).digest('hex').slice(0, 32);
    const askRef = db.doc(`reviewAsks/${key}`);
    if ((await askRef.get()).exists) { await t.ref.update({ reviewAskedAt: 'already' }); continue; }
    if ((await db.collection('reviewAsks').where('email', '==', t.email).get()).size >= 2) { await t.ref.update({ reviewAskedAt: 'limit' }); continue; }
    let card = { first: '', studio: '' };
    try { card = await hostCard(t.slug); } catch { /* the email works without */ }
    const first = t.name.split(/\s+/)[0] || (t.lang === 'de' ? 'du' : 'there');
    const hostLabel = t.hostLabel || card.studio || card.first || t.slug;
    const m = reviewMail({ lang: t.lang, first, workshop: t.workshop || hostLabel, hostLabel, hostFirst: card.first, studio: card.studio, slug: t.slug });
    try {
      await mail.sendMail({ from: { name: 'Twiggli', address: SENDER }, replyTo: SENDER, to: t.email, subject: m.subject, text: m.text, html: m.html });
      await askRef.set({ email: t.email, slug: t.slug, at: FieldValue.serverTimestamp() });
      await t.ref.update({ reviewAskedAt: FieldValue.serverTimestamp() });
    } catch (err) { console.error('reviewAsk: send failed', t.email, err?.message); }
  }
});
