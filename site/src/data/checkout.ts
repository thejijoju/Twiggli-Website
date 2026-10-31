import type { Lang } from '../lib/url.ts';

/**
 * The words on our own voucher payment page (CheckoutPage.astro). English
 * and German for now; every other language gets the English page
 * (checkoutPath in vouchers.ts). '{amount}', '{n}', '{email}' and
 * '{reason}' are filled in on the page.
 */
export type CheckoutCopy = {
  pageTitle: string; close: string;
  hostTitle: string; generalTitle: string; lede: string;
  wish: string; wishHint: string; minNote: string; maxNote: string;
  places: string; perPerson: string; less: string; more: string;
  details: string; name: string; email: string;
  forWhom: string; recipient: string; recipientPh: string; message: string; messagePh: string;
  deliver: string; toMe: string; toThem: string; recipientEmail: string; recipientEmailPh: string; needRecipientEmail: string;
  payment: string; orCard: string; payNow: string; paying: string; secure: string;
  together: string; summary: string; valid: string; total: string;
  generalName: string; redeem: string;
  needName: string; needEmail: string;
  declined: string; failed: string; error: string; loadError: string;
  doneTitle: string; doneLede: string; doneBack: string;
  unknown: string; inactive: string; toVouchers: string;
};

const en: CheckoutCopy = {
  pageTitle: 'Pay for your voucher | Twiggli', close: 'Close',
  hostTitle: 'Give this workshop', generalTitle: 'Twiggli gift voucher',
  lede: 'Pay securely right here. You get the voucher as a PDF.',
  wish: 'Other', wishHint: 'Amount in €, from 20', minNote: 'The smallest voucher is €20.', maxNote: 'For more than €2,000, please write to us.',
  places: 'Places', perPerson: 'per person', less: 'One place fewer', more: 'One place more',
  details: 'Your info', name: 'Name', email: 'Email',
  forWhom: 'Who is the voucher for?', recipient: 'For whom?', recipientPh: 'e.g. Lena', message: 'Message', messagePh: 'A few words for the voucher',
  deliver: 'Where should we send it?', toMe: 'To me', toThem: 'Straight to them', recipientEmail: 'Their email', recipientEmailPh: 'lena@example.com', needRecipientEmail: 'Please enter the recipient’s email address.',
  payment: 'Payment', orCard: 'or by card', payNow: 'Pay now · {amount}', paying: 'Processing…',
  secure: 'Secure payment with Stripe',
  together: 'For 2 people: one voucher, redeemed together.', summary: 'Your order', valid: 'Valid for 3 years', total: 'Total',
  generalName: 'Twiggli gift voucher', redeem: 'Redeem a voucher',
  needName: 'Please enter your name.', needEmail: 'Please enter a valid email address.',
  declined: 'The payment didn’t go through: {reason} Please try again or use another payment method.',
  failed: 'The payment was cancelled or declined. You can try again right away.',
  error: 'That didn’t work. Please try again, or write to us at {email}.',
  loadError: 'The payment fields couldn’t load. Please reload the page, or write to us at {email}.',
  doneTitle: 'Thank you!', doneLede: 'Payment received. Your voucher arrives as a PDF within 24 hours.', doneBack: 'Back to Twiggli',
  unknown: 'We can’t find this voucher.', inactive: 'Paying online is coming soon. Until then you can request a voucher on our voucher page.', toVouchers: 'To the voucher page',
};

const de: CheckoutCopy = {
  pageTitle: 'Gutschein bezahlen | Twiggli', close: 'Schließen',
  hostTitle: 'Diesen Workshop verschenken', generalTitle: 'Twiggli-Gutschein',
  lede: 'Sicher bezahlen, direkt hier. Den Gutschein bekommst du als PDF.',
  wish: 'Anderer', wishHint: 'Betrag in €, ab 20', minNote: 'Ein Gutschein ist ab 20 € möglich.', maxNote: 'Für mehr als 2.000 € schreib uns bitte.',
  places: 'Plätze', perPerson: 'pro Person', less: 'Ein Platz weniger', more: 'Ein Platz mehr',
  details: 'Deine Angaben', name: 'Name', email: 'E-Mail',
  forWhom: 'Für wen ist der Gutschein?', recipient: 'Für wen?', recipientPh: 'z. B. Lena', message: 'Nachricht', messagePh: 'Ein paar Worte für den Gutschein',
  deliver: 'Wohin sollen wir ihn schicken?', toMe: 'An mich', toThem: 'An die beschenkte Person', recipientEmail: 'E-Mail der beschenkten Person', recipientEmailPh: 'lena@beispiel.de', needRecipientEmail: 'Bitte gib die E-Mail-Adresse der beschenkten Person ein.',
  payment: 'Zahlung', orCard: 'oder mit Karte', payNow: 'Jetzt bezahlen · {amount}', paying: 'Zahlung läuft…',
  secure: 'Sicher bezahlt mit Stripe',
  together: 'Für 2 Personen: ein Gutschein, gemeinsam einzulösen.', summary: 'Deine Bestellung', valid: '3 Jahre gültig', total: 'Gesamt',
  generalName: 'Twiggli-Gutschein', redeem: 'Gutschein einlösen',
  needName: 'Bitte gib deinen Namen ein.', needEmail: 'Bitte gib eine gültige E-Mail-Adresse ein.',
  declined: 'Die Zahlung hat nicht geklappt: {reason} Versuch es bitte noch einmal oder nimm eine andere Zahlungsart.',
  failed: 'Die Zahlung wurde abgebrochen oder abgelehnt. Du kannst es gleich noch einmal versuchen.',
  error: 'Das hat nicht geklappt. Versuch es bitte noch einmal oder schreib uns an {email}.',
  loadError: 'Die Zahlungsfelder konnten nicht geladen werden. Lade die Seite bitte neu oder schreib uns an {email}.',
  doneTitle: 'Danke!', doneLede: 'Zahlung erhalten. Dein Gutschein kommt innerhalb von 24 Stunden als PDF.', doneBack: 'Zurück zu Twiggli',
  unknown: 'Diesen Gutschein finden wir nicht.', inactive: 'Die Online-Zahlung startet bald. Bis dahin kannst du Gutscheine auf unserer Gutscheinseite anfragen.', toVouchers: 'Zur Gutscheinseite',
};

export const checkoutCopy = (lang: Lang): CheckoutCopy => (lang === 'de' ? de : en);
