// The voucher itself: its code, its PDF and the email that carries it.
//
// The PDF is the artwork in assets/bg-{de,en}.jpg (layout C, made once from
// HTML) with the parts that change printed on top: the amount, the code,
// who it is for and their message, and the line of details at the bottom.
// Fonts are Poppins and Caveat (SIL Open Font License), kept in assets/.
import { readFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const asset = (name) => readFileSync(new URL(`./assets/${name}`, import.meta.url));
const MM = 72 / 25.4;
const W = 210 * MM;
const H = 297 * MM;
const INK = rgb(0.141, 0.153, 0.18);
const MUTED = rgb(0.34, 0.365, 0.39);
const PURPLE = rgb(0.416, 0.243, 0.925);

/** A fresh code, TW-XXXX-XXXX, from letters and digits that can't be confused. */
export const newVoucherCode = () => {
  const a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const c = Array.from({ length: 8 }, () => a[randomInt(a.length)]).join('');
  return `TW-${c.slice(0, 4)}-${c.slice(4)}`;
};

const euro = (n, de) => (de ? `${n} €` : `€${n}`);
const day = (iso, de) => new Date(`${iso}T12:00:00`).toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** Lines of at most `width` points in `font` at `size`. */
const wrap = (text, font, size, width) => {
  const out = [];
  let line = '';
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) { out.push(line); line = word; } else line = next;
  }
  if (line) out.push(line);
  return out;
};

/**
 * The voucher PDF, as bytes.
 * @param {{ lang: string, amount: number, code: string, validUntil: string, date: string,
 *   order: string, host?: string, workshop?: string, recipient?: string, message?: string,
 *   company: string, test?: boolean }} v
 */
export const voucherPdf = async (v) => {
  const de = String(v.lang).startsWith('de');
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(de ? 'Twiggli-Gutschein' : 'Twiggli voucher');
  doc.setAuthor('Twiggli');
  const page = doc.addPage([W, H]);
  page.drawImage(await doc.embedJpg(asset(de ? 'bg-de.jpg' : 'bg-en.jpg')), { x: 0, y: 0, width: W, height: H });
  const regular = await doc.embedFont(asset('Poppins-Regular.ttf'), { subset: true });
  const semi = await doc.embedFont(asset('Poppins-SemiBold.ttf'), { subset: true });
  const bold = await doc.embedFont(asset('Poppins-Bold.ttf'), { subset: true });
  // Caveat's contextual letter forms come out garbled in pdf-lib: off.
  const hand = await doc.embedFont(asset('Caveat-SemiBold.ttf'), { features: { calt: false, liga: false, clig: false, rlig: false } });
  /** Centred text with its baseline `top` mm from the top of the page. */
  const centre = (text, font, size, top, color = INK) =>
    page.drawText(text, { x: (W - font.widthOfTextAtSize(text, size)) / 2, y: H - top * MM, size, font, color });

  centre(euro(v.amount, de), bold, 54, 128);
  const what = v.host
    ? (de ? `Für ${v.workshop ? `„${v.workshop}“ ` : 'einen Workshop '}bei ${v.host}` : `For ${v.workshop ? `“${v.workshop}” ` : 'a workshop '}with ${v.host}`)
    : (de ? 'Für jeden Workshop bei einer Berliner Maker*in: Töpfern, Kerzen, Drucken, Kochen und vieles mehr.'
          : 'For any workshop with a Berlin maker: pottery, candles, printmaking, cooking and much more.');
  wrap(what, regular, 10.5, 120 * MM).slice(0, 2).forEach((l, i) => centre(l, regular, 10.5, 141 + i * 5.2, MUTED));

  // Who it is for, and their message, in the handwriting.
  let top = 160;
  if (v.recipient) { centre(`${de ? 'Für' : 'For'} ${v.recipient}`, hand, 24, top, PURPLE); top += 9; }
  if (v.message) wrap(v.message, hand, 16, 130 * MM).slice(0, 3).forEach((l, i) => centre(l, hand, 16, top + i * 7, INK));

  centre(v.code, semi, 20, 214.5);
  if (v.test) centre(de ? 'TESTGUTSCHEIN · NICHT EINLÖSBAR' : 'TEST VOUCHER · NOT REDEEMABLE', bold, 9, 190, rgb(0.76, 0.2, 0.3));

  const details = [
    v.code,
    `${de ? 'Wert' : 'Value'} ${euro(v.amount, de)}`,
    `${de ? 'Datum' : 'Date'} ${day(v.date, de)}`,
    `${de ? 'Gültig bis' : 'Valid until'} ${day(v.validUntil, de)}`,
    `${de ? 'Bestellnr.' : 'Order no.'} ${v.order}`,
    v.host ? `${de ? 'Einlösbar bei' : 'Redeemable with'} ${v.host}` : (de ? 'Einlösbar bei allen teilnehmenden Hosts' : 'Redeemable at all participating hosts'),
    v.company,
    de ? 'Keine Barauszahlung. Ein Restwert bleibt auf dem Code.' : 'No cash payout. Any remaining value stays on the code.',
  ].join('  |  ');
  wrap(details, regular, 7, 182 * MM).slice(0, 3).forEach((l, i) =>
    page.drawText(l, { x: 14 * MM, y: H - (277 + i * 4) * MM, size: 7, font: regular, color: MUTED }));
  return Buffer.from(await doc.save());
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * The voucher email, with the PDF attached and our icon inline. `gift`:
 * written to the person it is for (from the buyer), else to the buyer.
 */
export const voucherMail = ({ lang, gift, firstName, buyerName, amount, code, validUntil, order, date, payment, host, message, site, company, test }) => {
  const de = String(lang).startsWith('de');
  const money = de ? `${amount},00 €` : `€${amount}.00`;
  const what = host ? (de ? `Twiggli-Gutschein · ${host}` : `Twiggli voucher · ${host}`) : (de ? 'Twiggli-Gutschein · alle teilnehmenden Hosts' : 'Twiggli voucher · any workshop at participating hosts');
  const hi = de ? `Hallo${firstName ? ` ${esc(firstName)}` : ''},` : `Hi${firstName ? ` ${esc(firstName)}` : ''},`;
  const intro = gift
    ? (de ? `${esc(buyerName || 'Jemand')} schenkt dir einen <b>Twiggli</b>-Gutschein über ${money}! 🎁 Du findest ihn als PDF im Anhang. Such dir einfach einen Workshop bei einer Berliner Maker*in aus.`
          : `${esc(buyerName || 'Someone')} is giving you a <b>Twiggli</b> voucher worth ${money}! 🎁 You'll find it attached as a PDF. Just pick a workshop with a Berlin maker.`)
    : (de ? 'vielen Dank für deinen Gutscheinkauf bei <b>Twiggli</b>! Dein Gutschein ist als PDF angehängt, zum Ausdrucken oder Weiterschenken.'
          : 'thank you for buying a <b>Twiggli</b> voucher! Your voucher is attached as a PDF, ready to print or pass on.');
  const title = gift ? (de ? 'Ein Geschenk für dich' : 'A gift for you') : `${de ? 'Bestellbestätigung' : 'Order confirmation'} ${order}`;
  const row = (k, val) => `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#555">${k}</td><td align="right" style="padding:6px 0;border-bottom:1px solid #eee;color:#555">${val}</td></tr>`;
  const html = `<div style="background:#f3eee8;padding:24px 0;font-family:Tahoma,Arial,sans-serif;color:#24272e">
<table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="padding:22px 30px 4px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="cid:twiggli-icon" width="36" height="36" alt="Twiggli" style="display:block;border-radius:9px"></td><td style="padding-left:10px;vertical-align:middle;font-weight:bold;font-size:20px">Twiggli</td></tr></table></td></tr>
<tr><td style="padding:18px 30px 6px">
${test ? `<p style="margin:0 0 12px;padding:8px 12px;border-radius:8px;background:#fde8ee;color:#a61b46;font-size:13px">${de ? 'Test: dieser Gutschein ist nicht einlösbar.' : 'Test: this voucher cannot be redeemed.'}</p>` : ''}
<h1 style="font-size:22px;margin:0 0 8px">${esc(title)}</h1>
<p style="font-size:14px;line-height:1.6;color:#454a50;margin:0 0 14px">${hi}<br><br>${intro}</p>
${gift && message ? `<p style="font-size:15px;line-height:1.6;margin:0 0 16px;padding:12px 16px;border-left:3px solid #6a3eec;background:#f7f4ff;font-style:italic">„${esc(message)}“</p>` : ''}
${gift ? '' : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse"><tr><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(what)}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #eee">1 × ${money}</td></tr><tr><td style="padding:10px 0;font-weight:bold">${de ? 'Gesamt' : 'Total'}</td><td align="right" style="padding:10px 0;font-weight:bold">${money}</td></tr></table>`}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1.5px dashed #6a3eec;border-radius:12px"><tr><td style="padding:14px 16px">
<div style="font-size:11px;color:#777;text-transform:uppercase;letter-spacing:1px">${de ? 'Gutscheincode · gültig bis' : 'Voucher code · valid until'} ${esc(day(validUntil, de))}</div>
<div style="font-family:'Courier New',monospace;font-size:20px;font-weight:bold;letter-spacing:1px;margin-top:4px">${esc(code)}</div></td></tr></table>
${gift ? '' : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13.5px;border-collapse:collapse">${row(de ? 'Bestellnr.' : 'Order no.', esc(order))}${row(de ? 'Datum' : 'Date', esc(day(date, de)))}${row(de ? 'Zahlung' : 'Payment', esc(payment))}<tr><td style="padding:6px 0;color:#555">${de ? 'Versand' : 'Delivery'}</td><td align="right" style="padding:6px 0;color:#555">${de ? 'PDF per E-Mail' : 'PDF by email'}</td></tr></table>`}
<p style="font-size:14px;line-height:1.6;color:#454a50;margin:18px 0 14px"><b>${de ? 'So löst du ihn ein:' : 'How to redeem:'}</b> ${de ? `Such dir auf <a href="${site}/de/voucher/" style="color:#6a3eec">twiggli.com/voucher</a> einen Workshop aus, klick auf „Anfragen“ und gib unter „Gutschein hinzufügen“ den Code ein. Oder antworte einfach auf diese E-Mail.` : `pick a workshop at <a href="${site}/voucher/" style="color:#6a3eec">twiggli.com/voucher</a>, click “Request” and enter the code under “Add a voucher”. Or simply reply to this email.`}</p>
<p style="font-size:14px;line-height:1.6;color:#454a50;margin:0 0 22px">${de ? 'Viel Freude beim Selbermachen! 💛' : 'Have fun making something! 💛'}<br>Jirel ${de ? 'von' : 'from'} <b>Twiggli</b></p>
</td></tr>
<tr><td style="background:#faf6f1;padding:16px 30px;font-size:11px;color:#888;line-height:1.6">${esc(company)} · <a href="${site}" style="color:#888">www.twiggli.com</a><br>${de ? 'Keine Barauszahlung. Ein Restwert bleibt auf dem Code.' : 'No cash payout. Any remaining value stays on the code.'}</td></tr>
</table></div>`;
  const subject = gift
    ? (de ? `${buyerName || 'Jemand'} schenkt dir einen Twiggli-Gutschein 🎁` : `${buyerName || 'Someone'} sent you a Twiggli voucher 🎁`)
    : (de ? `Bestellbestätigung ${order}: dein Twiggli-Gutschein 🎁` : `Order confirmation ${order}: your Twiggli voucher 🎁`);
  const text = `${title}\n\n${de ? 'Gutscheincode' : 'Voucher code'}: ${code}\n${de ? 'Wert' : 'Value'}: ${money}\n${de ? 'Gültig bis' : 'Valid until'}: ${day(validUntil, de)}\n\n${de ? 'Der Gutschein ist als PDF angehängt.' : 'The voucher is attached as a PDF.'}\n\nJirel, Twiggli`;
  return { subject, html, text, icon: asset('icon.png') };
};
