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
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
// An app password of the Gmail account the requests go to (Google account →
// Security → App passwords), so the function can mail Jirel from it.
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');
const INBOX = 'jirel.kuenen@gmail.com';
// May open every host's account without approval, and approves the others.
const ADMINS = ['jirel.kuenen@gmail.com', 'jirelkuenen@gmail.com', 'hello@twiggli.com'];
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

/** HTML-escaped, for the email table. */
const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const formRequest = onRequest(
  { region: 'europe-west3', secrets: [GMAIL_APP_PASSWORD], maxInstances: 10, cors: false },
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

    // Saved first, so a request is never lost even if the email fails.
    const doc = await getFirestore().collection('formRequests').add({
      subject, email, fields, origin: req.get('origin') ?? '', createdAt: FieldValue.serverTimestamp(), mailed: false,
    });

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
const SLUG = /^[a-z0-9-]{1,60}$/;

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
    const slug = String(req.body?.slug ?? '');
    const name = text(req.body?.name, 120);
    const note = text(req.body?.note, 600);
    if (!SLUG.test(slug)) return res.status(400).json({ error: 'Bad page' });
    if (ADMINS.includes(email)) {
      await grant(email, slug);
      return res.status(200).json({ status: 'granted' });
    }
    const db = getFirestore();
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
