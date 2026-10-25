import type { Lang } from '../lib/url.ts';

/**
 * The words on our own voucher payment page (CheckoutPage.astro). English
 * and German for now; every other language gets the English page
 * (checkoutPath in vouchers.ts). '{amount}', '{n}', '{email}' and
 * '{reason}' are filled in on the page.
 */
export type CheckoutCopy = {
  pageTitle: string; back: string;
  hostTitle: string; generalTitle: string; lede: string;
  amountTitle: string; wish: string; wishHint: string; minNote: string; maxNote: string;
  people: string; perPerson: string; onePerson: string; nPeople: string; less: string; more: string;
  details: string; name: string; email: string; emailHint: string;
  recipient: string; recipientPh: string; message: string; messagePh: string; optional: string;
  payment: string; orCard: string; payNow: string; paying: string; secure: string;
  summary: string; showSummary: string;
  host: string; workshop: string; places: string; amount: string; valid: string; validValue: string; total: string;
  generalName: string; generalSub: string; redeem: string;
  needName: string; needEmail: string;
  declined: string; failed: string; error: string; loadError: string;
  doneTitle: string; doneLede: string; doneFor: string; doneRef: string; doneReceipt: string; doneMore: string;
  unknown: string; inactive: string; toVouchers: string;
};

const en: CheckoutCopy = {
  pageTitle: 'Pay for your voucher | Twiggli', back: 'Back',
  hostTitle: 'Give this workshop', generalTitle: 'Twiggli gift voucher',
  lede: 'Pay securely right here. You get the voucher as a PDF.',
  amountTitle: 'Amount', wish: 'Your amount', wishHint: 'from €20', minNote: 'The smallest voucher is €20.', maxNote: 'For more than €2,000, please write to us.',
  people: 'People', perPerson: 'per person', onePerson: '1 person', nPeople: '{n} people', less: 'One person fewer', more: 'One person more',
  details: 'Your details', name: 'Your name', email: 'Your email', emailHint: 'Your receipt and the voucher go here.',
  recipient: 'Who is the voucher for?', recipientPh: 'e.g. Lena', message: 'Personal message', messagePh: 'A few words for the voucher', optional: 'optional',
  payment: 'Payment', orCard: 'or pay by card', payNow: 'Pay now · {amount}', paying: 'Processing…',
  secure: 'Encrypted and processed by Stripe. Twiggli never sees your card details.',
  summary: 'Your order', showSummary: 'Order summary',
  host: 'Host', workshop: 'Workshop', places: 'Places', amount: 'Amount', valid: 'Valid', validValue: '3 years', total: 'Total',
  generalName: 'Twiggli gift voucher', generalSub: 'Redeemable at every maker taking part', redeem: 'Redeem a voucher',
  needName: 'Please enter your name.', needEmail: 'Please enter a valid email address.',
  declined: 'The payment didn’t go through: {reason} Please try again or use another payment method.',
  failed: 'The payment was cancelled or declined. You can try again right away.',
  error: 'That didn’t work. Please try again, or write to us at {email}.',
  loadError: 'The payment fields couldn’t load. Please reload the page, or write to us at {email}.',
  doneTitle: 'Thank you! 🎁', doneLede: 'Payment received. Twiggli sends you the voucher as a PDF within 24 hours.',
  doneFor: 'For', doneRef: 'Reference', doneReceipt: 'Receipt to', doneMore: 'Discover more workshops',
  unknown: 'We can’t find this voucher.', inactive: 'Paying online is coming soon. Until then you can request a voucher on our voucher page.', toVouchers: 'To the voucher page',
};

const de: CheckoutCopy = {
  pageTitle: 'Gutschein bezahlen | Twiggli', back: 'Zurück',
  hostTitle: 'Diesen Workshop verschenken', generalTitle: 'Twiggli-Gutschein',
  lede: 'Sicher bezahlen, direkt hier. Den Gutschein bekommst du als PDF.',
  amountTitle: 'Betrag', wish: 'Wunschbetrag', wishHint: 'ab 20 €', minNote: 'Ein Gutschein ist ab 20 € möglich.', maxNote: 'Für mehr als 2.000 € schreib uns bitte.',
  people: 'Personen', perPerson: 'pro Person', onePerson: '1 Person', nPeople: '{n} Personen', less: 'Eine Person weniger', more: 'Eine Person mehr',
  details: 'Deine Angaben', name: 'Dein Name', email: 'Deine E-Mail', emailHint: 'Hierhin schicken wir Beleg und Gutschein.',
  recipient: 'Für wen ist der Gutschein?', recipientPh: 'z. B. Lena', message: 'Persönliche Nachricht', messagePh: 'Ein paar Worte für den Gutschein', optional: 'optional',
  payment: 'Zahlung', orCard: 'oder mit Karte zahlen', payNow: 'Jetzt bezahlen · {amount}', paying: 'Zahlung läuft…',
  secure: 'Verschlüsselt über Stripe. Twiggli sieht deine Kartendaten nie.',
  summary: 'Deine Bestellung', showSummary: 'Bestellübersicht',
  host: 'Host', workshop: 'Workshop', places: 'Plätze', amount: 'Betrag', valid: 'Gültig', validValue: '3 Jahre', total: 'Gesamt',
  generalName: 'Twiggli-Gutschein', generalSub: 'Einlösbar bei allen teilnehmenden Maker*innen', redeem: 'Gutschein einlösen',
  needName: 'Bitte gib deinen Namen ein.', needEmail: 'Bitte gib eine gültige E-Mail-Adresse ein.',
  declined: 'Die Zahlung hat nicht geklappt: {reason} Versuch es bitte noch einmal oder nimm eine andere Zahlungsart.',
  failed: 'Die Zahlung wurde abgebrochen oder abgelehnt. Du kannst es gleich noch einmal versuchen.',
  error: 'Das hat nicht geklappt. Versuch es bitte noch einmal oder schreib uns an {email}.',
  loadError: 'Die Zahlungsfelder konnten nicht geladen werden. Lade die Seite bitte neu oder schreib uns an {email}.',
  doneTitle: 'Danke! 🎁', doneLede: 'Zahlung erhalten. Twiggli schickt dir den Gutschein innerhalb von 24 Stunden als PDF.',
  doneFor: 'Für', doneRef: 'Referenz', doneReceipt: 'Beleg an', doneMore: 'Weitere Workshops entdecken',
  unknown: 'Diesen Gutschein finden wir nicht.', inactive: 'Die Online-Zahlung startet bald. Bis dahin kannst du Gutscheine auf unserer Gutscheinseite anfragen.', toVouchers: 'Zur Gutscheinseite',
};

export const checkoutCopy = (lang: Lang): CheckoutCopy => (lang === 'de' ? de : en);
