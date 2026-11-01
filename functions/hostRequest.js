// The email a host gets for a new booking request, in the style of the
// voucher email: Twiggli icon (cid:twiggli-icon), the request as a card,
// the potential earnings, and buttons that open a reply to the guest with
// Twiggli in CC. Used for drafts now; formRequest can use it later.

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const euro = (n, de) => {
  const v = Math.round(n * 100) / 100;
  const s = Number.isInteger(v) ? String(v) : v.toFixed(2);
  return de ? `${s.replace('.', ',')} €` : `€${s}`;
};

export const hostRequestMail = ({
  lang = 'de', hostFirstName, guestName, guestEmail, guestPhone, workshop, dateLabel, time,
  people, pricePerPerson, message, firstBooking = false, commission = 0.15, inbox, note, site = 'https://www.twiggli.com', buttons = false,
}) => {
  const de = String(lang).startsWith('de');
  const guestFirst = String(guestName || '').trim().split(/\s+/)[0] || (de ? 'Gast' : 'guest');
  const total = (Number(pricePerPerson) || 0) * (Number(people) || 0);
  const fee = firstBooking ? 0 : total * commission;
  const payout = total - fee;
  const pct = Math.round(commission * 100);

  const mail = (subject, body) => `mailto:${encodeURIComponent(guestEmail)}?cc=${encodeURIComponent(inbox)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const subj = `${workshop} · ${dateLabel}${time ? `, ${time}` : ''}`;
  const sign = hostFirstName ? `\n\n${hostFirstName}` : '';
  const accept = mail(de ? `Bestätigt: ${subj}` : `Confirmed: ${subj}`, de
    ? `Hallo ${guestFirst},\n\ndanke für deine Anfrage über Twiggli! Ich freue mich, ${people > 1 ? 'euch' : 'dich'} am ${dateLabel}${time ? ` um ${time} Uhr` : ''} zu sehen.\n\n`
    : `Hi ${guestFirst},\n\nthanks for your request via Twiggli! Looking forward to seeing you on ${dateLabel}${time ? ` at ${time}` : ''}.\n\n`);
  const propose = mail(de ? `Anderer Termin: ${workshop}` : `Another date: ${workshop}`, de
    ? `Hallo ${guestFirst},\n\ndanke für deine Anfrage über Twiggli! Am ${dateLabel} klappt es leider nicht. Würde einer dieser Termine passen?\n\n- \n- \n${sign}`
    : `Hi ${guestFirst},\n\nthanks for your request via Twiggli! ${dateLabel} doesn't work for me, unfortunately. Would one of these dates suit you?\n\n- \n- \n${sign}`);
  const decline = `mailto:${encodeURIComponent(inbox)}?subject=${encodeURIComponent(`${de ? 'Absage' : 'Decline'}: ${subj} (${guestName})`)}`;

  const row = (k, v) => `<tr><td style="padding:9px 0;border-bottom:1px solid #efe9e2;color:#6b7076;font-size:14px">${k}</td><td align="right" style="padding:9px 0;border-bottom:1px solid #efe9e2;font-size:14px;font-weight:bold">${v}</td></tr>`;
  const btn = (href, label, primary) => `<a href="${href}" style="display:block;text-align:center;text-decoration:none;font-size:15px;font-weight:bold;padding:13px 16px;border-radius:24px;margin:0 0 10px;${primary ? 'background:#6a3eec;color:#ffffff' : 'background:#ffffff;color:#24272e;border:1.5px solid #ddd5cb'}">${label}</a>`;

  const earnings = firstBooking
    ? (de ? `${people} × ${euro(pricePerPerson, de)} = <b>${euro(total, de)}</b>. Deine erste Buchung über <b>Twiggli</b> ist provisionsfrei, du bekommst also die vollen ${euro(total, de)}.`
          : `${people} × ${euro(pricePerPerson, de)} = <b>${euro(total, de)}</b>. Your first booking via <b>Twiggli</b> is commission-free, so you keep the full ${euro(total, de)}.`)
    : (de ? `${people} × ${euro(pricePerPerson, de)} = ${euro(total, de)}. Nach ${pct} % Provision bleiben dir <b>${euro(payout, de)}</b>.`
          : `${people} × ${euro(pricePerPerson, de)} = ${euro(total, de)}. After the ${pct}% commission you keep <b>${euro(payout, de)}</b>.`);

  const html = `<div style="background:#f3eee8;padding:24px 0;font-family:Tahoma,Arial,sans-serif;color:#24272e">
<table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="padding:22px 30px 4px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="cid:twiggli-icon" width="36" height="36" alt="Twiggli" style="display:block;border-radius:9px"></td><td style="padding-left:10px;vertical-align:middle;font-weight:bold;font-size:20px">Twiggli</td></tr></table></td></tr>
<tr><td style="padding:18px 30px 0">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6a3eec;font-weight:bold">${de ? 'Neue Buchungsanfrage' : 'New booking request'}</p>
<h1 style="margin:0 0 10px;font-size:24px;line-height:1.25">${de ? `Antworte auf ${esc(guestFirst)}s Anfrage` : `Respond to ${esc(guestFirst)}’s request`}</h1>
<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#454a50">${de ? `Hallo${hostFirstName ? ` ${esc(hostFirstName)}` : ''}, ${esc(guestFirst)} möchte über <b>Twiggli</b> bei dir buchen. Bitte melde dich innerhalb von 24 Stunden direkt bei ${esc(guestFirst)}.` : `Hi${hostFirstName ? ` ${esc(hostFirstName)}` : ''}, ${esc(guestFirst)} would like to book with you via <b>Twiggli</b>. Please reply to ${esc(guestFirst)} directly within 24 hours.`}</p>
${buttons ? `${btn(accept, de ? 'Zusagen' : 'Accept', true)}
${btn(propose, de ? 'Anderen Termin vorschlagen' : 'Suggest another date', false)}` : ''}
</td></tr>
<tr><td style="padding:14px 30px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f1;border-radius:12px"><tr><td style="padding:16px 18px">
<p style="margin:0 0 4px;font-size:17px;font-weight:bold">${esc(workshop)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row(de ? 'Datum' : 'Date', esc(dateLabel))}
${time ? row(de ? 'Uhrzeit' : 'Time', esc(time)) : ''}
${row(de ? 'Personen' : 'Guests', esc(people))}
${row(de ? 'Preis pro Person' : 'Price per person', euro(pricePerPerson, de))}
</table>
${message ? `<p style="margin:14px 0 0;font-size:14px;line-height:1.6;padding:10px 14px;border-left:3px solid #6a3eec;background:#ffffff;font-style:italic">„${esc(message)}“</p>` : ''}
</td></tr></table>
</td></tr>
<tr><td style="padding:18px 30px 0">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7076;font-weight:bold">${de ? 'Mögliche Einnahmen' : 'Potential earnings'}</p>
<p style="margin:0 0 4px;font-size:30px;font-weight:bold;color:#1f9d55">${euro(payout, de)}</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#454a50">${earnings}</p>
</td></tr>
${note ? `<tr><td style="padding:16px 30px 0"><p style="margin:0;font-size:14px;line-height:1.6;color:#454a50;padding:10px 14px;border-radius:10px;background:#fff6e0">${note}</p></td></tr>` : ''}
<tr><td style="padding:18px 30px 0">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7076;font-weight:bold">${de ? 'Kontakt' : 'Contact'}</p>
<p style="margin:0;font-size:14px;line-height:1.7">${esc(guestName)}<br><a href="mailto:${esc(guestEmail)}" style="color:#6a3eec">${esc(guestEmail)}</a>${guestPhone ? `<br>${esc(guestPhone)}` : ''}</p>
<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#6b7076">${de ? `Bitte setz mich in CC, wenn du ${esc(guestFirst)} schreibst${buttons ? ' (die Buttons machen das automatisch)' : ''}. Wenn es gar nicht passt, <a href="${decline}" style="color:#6b7076">sag mir kurz Bescheid</a>, dann kümmere ich mich darum.` : `Please keep me in CC when you write to ${esc(guestFirst)}${buttons ? ' (the buttons do this for you)' : ''}. If it doesn't work at all, <a href="${decline}" style="color:#6b7076">just let me know</a> and I'll take care of it.`}</p>
<p style="margin:18px 0 22px;font-size:14px;line-height:1.6;color:#454a50">${de ? 'Danke dir!' : 'Thank you!'}<br>Jirel, ${de ? 'Gründerin' : 'Founder'} @ <b>Twiggli</b></p>
</td></tr>
<tr><td style="background:#faf6f1;padding:14px 30px;font-size:11px;color:#888;line-height:1.6"><a href="${site}" style="color:#888">www.twiggli.com</a></td></tr>
</table></div>`;

  const subject = de
    ? `Neue Anfrage: ${workshop}, ${dateLabel}${time ? ` ${time}` : ''} (${people} ${Number(people) === 1 ? 'Person' : 'Personen'})`
    : `New request: ${workshop}, ${dateLabel}${time ? ` ${time}` : ''} (${people} ${Number(people) === 1 ? 'guest' : 'guests'})`;
  return { subject, html };
};
