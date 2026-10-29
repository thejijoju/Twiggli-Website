import type { Lang } from '../lib/url.ts';

/** The host account page (HostAccountPage.astro at /host/account/ and
 *  /de/host/account/), in English and German, the two languages hosts write
 *  in. The other six languages are translated from the English copy. */
export interface HostAccountCopy {
  pageTitle: string;
  title: string;
  lede: string;
  email: string;
  emailPh: string;
  sendLink: string;
  sending: string;
  linkSent: string;
  noHost: string;
  claimTitle: string;
  claimLede: string;
  claimPage: string;
  claimPagePh: string;
  claimName: string;
  claimNote: string;
  claimNotePh: string;
  claimSend: string;
  claimSent: string;
  adminPick: string;
  signOut: string;
  signedInAs: string;
  hostPick: string;
  tabPage: string;
  tabSchedule: string;
  tabVouchers: string;
  tabRequests: string;
  textIn: string;
  fSpecialty: string;
  fSpecialtyHint: string;
  fStudio: string;
  fBlurb: string;
  fBlurbHint: string;
  fGroup: string;
  fGroupHint: string;
  fDuration: string;
  fPlace: string;
  fLanguages: string;
  fPriceNote: string;
  scheduleLede: string;
  slotTitle: string;
  slotDays: string;
  slotTime: string;
  slotDuration: string;
  slotPrice: string;
  addSlot: string;
  removeSlot: string;
  noSlots: string;
  days: [string, string, string, string, string, string, string];
  save: string;
  saving: string;
  saved: string;
  error: string;
  soonVouchers: string;
  soonRequests: string;
  viewPage: string;
  /** Shown while accounts are not open yet; {email} is the contact address. */
  soon: string;
}

const en: HostAccountCopy = {
  pageTitle: 'Your host account | Twiggli',
  title: 'Your host account',
  lede: 'Update your page and your weekly schedule yourself. Changes go live on twiggli.com by the next morning.',
  email: 'Your email',
  emailPh: 'the email you use with Twiggli',
  sendLink: 'Send me a sign-in link',
  sending: 'Sending…',
  linkSent: 'Check your inbox: we sent you a sign-in link. No password needed.',
  noHost: 'We couldn’t find a host page for this email yet. Write to {email} and we’ll connect it.',
  claimTitle: 'Claim your page',
  claimLede: 'Pick your page on Twiggli. We check it’s really you and unlock it, usually the same day.',
  claimPage: 'Your page',
  claimPagePh: 'Choose your page…',
  claimName: 'Your name',
  claimNote: 'Anything we should know? (optional)',
  claimNotePh: 'e.g. I run the studio together with Anna',
  claimSend: 'Request access',
  claimSent: 'Thanks! We’ve got your request and will unlock your page soon. You’ll see it here as soon as it’s done.',
  adminPick: 'Open any host (admin)',
  signOut: 'Sign out',
  signedInAs: 'Signed in as {email}',
  hostPick: 'Page',
  tabPage: 'Your page',
  tabSchedule: 'Weekly schedule',
  tabVouchers: 'Vouchers',
  tabRequests: 'Requests',
  textIn: 'Text in',
  fSpecialty: 'Title of your workshop',
  fSpecialtyHint: 'Short, like “Vulva painting & playful learning”.',
  fStudio: 'Studio name',
  fBlurb: 'Description',
  fBlurbHint: 'What people do, what they take home, who it is for.',
  fGroup: 'Group size',
  fGroupHint: 'e.g. “Up to 10 in the studio · 4–15 at your location”',
  fDuration: 'Length',
  fPlace: 'Where',
  fLanguages: 'Languages',
  fPriceNote: 'Price note',
  scheduleLede: 'The days and times you run your workshop every week. Guests send a booking request and we pass it on to you.',
  slotTitle: 'Workshop',
  slotDays: 'Days',
  slotTime: 'Time',
  slotDuration: 'Length',
  slotPrice: 'Price per person (€)',
  addSlot: '+ Add a time',
  removeSlot: 'Remove',
  noSlots: 'No weekly times yet. Add one, or leave it empty if you only work on request.',
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  save: 'Save',
  saving: 'Saving…',
  saved: 'Saved! Your page updates by tomorrow morning.',
  error: 'That didn’t work. Please try again, or write to us at {email}.',
  soonVouchers: 'Coming soon: see every voucher sold for your workshops, and mark a guest’s code as redeemed in one click.',
  soonRequests: 'Coming soon: booking requests land here, and you accept or reply right away.',
  viewPage: 'See your page',
  soon: 'Host accounts open very soon. Until then, send any change to your page to {email} and we update it the same day.',
};

const de: HostAccountCopy = {
  pageTitle: 'Dein Gastgeber-Konto | Twiggli',
  title: 'Dein Gastgeber-Konto',
  lede: 'Pflege deine Seite und deine Wochentermine selbst. Änderungen sind bis zum nächsten Morgen auf twiggli.com live.',
  email: 'Deine E-Mail',
  emailPh: 'die E-Mail, die du bei Twiggli nutzt',
  sendLink: 'Anmeldelink schicken',
  sending: 'Wird gesendet…',
  linkSent: 'Schau in dein Postfach: Wir haben dir einen Anmeldelink geschickt. Kein Passwort nötig.',
  noHost: 'Zu dieser E-Mail haben wir noch keine Gastgeber-Seite gefunden. Schreib uns an {email}, dann verbinden wir sie.',
  claimTitle: 'Deine Seite übernehmen',
  claimLede: 'Wähl deine Seite auf Twiggli. Wir prüfen kurz, dass du es bist, und schalten sie frei, meist noch am selben Tag.',
  claimPage: 'Deine Seite',
  claimPagePh: 'Wähl deine Seite…',
  claimName: 'Dein Name',
  claimNote: 'Sollen wir noch etwas wissen? (optional)',
  claimNotePh: 'z. B. Ich leite das Studio zusammen mit Anna',
  claimSend: 'Zugang anfragen',
  claimSent: 'Danke! Deine Anfrage ist da, wir schalten deine Seite bald frei. Sobald es soweit ist, siehst du sie hier.',
  adminPick: 'Jeden Gastgeber öffnen (Admin)',
  signOut: 'Abmelden',
  signedInAs: 'Angemeldet als {email}',
  hostPick: 'Seite',
  tabPage: 'Deine Seite',
  tabSchedule: 'Wochentermine',
  tabVouchers: 'Gutscheine',
  tabRequests: 'Anfragen',
  textIn: 'Text auf',
  fSpecialty: 'Titel deines Workshops',
  fSpecialtyHint: 'Kurz, z. B. „Vulva Painting & spielerisches Lernen“.',
  fStudio: 'Name des Studios',
  fBlurb: 'Beschreibung',
  fBlurbHint: 'Was man macht, was man mitnimmt, für wen es ist.',
  fGroup: 'Gruppengröße',
  fGroupHint: 'z. B. „Bis 10 im Studio · 4–15 bei euch“',
  fDuration: 'Dauer',
  fPlace: 'Wo',
  fLanguages: 'Sprachen',
  fPriceNote: 'Hinweis zum Preis',
  scheduleLede: 'Die Tage und Uhrzeiten, an denen dein Workshop jede Woche stattfindet. Gäste schicken eine Buchungsanfrage, wir leiten sie an dich weiter.',
  slotTitle: 'Workshop',
  slotDays: 'Tage',
  slotTime: 'Uhrzeit',
  slotDuration: 'Dauer',
  slotPrice: 'Preis pro Person (€)',
  addSlot: '+ Termin hinzufügen',
  removeSlot: 'Entfernen',
  noSlots: 'Noch keine Wochentermine. Füg einen hinzu, oder lass es leer, wenn du nur auf Anfrage arbeitest.',
  days: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  save: 'Speichern',
  saving: 'Wird gespeichert…',
  saved: 'Gespeichert! Deine Seite ist bis morgen früh aktualisiert.',
  error: 'Das hat nicht geklappt. Versuch es bitte noch einmal oder schreib uns an {email}.',
  soonVouchers: 'Bald hier: alle Gutscheine für deine Workshops auf einen Blick, und den Code eines Gastes mit einem Klick einlösen.',
  soonRequests: 'Bald hier: Buchungsanfragen landen direkt hier, und du nimmst sie an oder antwortest sofort.',
  viewPage: 'Deine Seite ansehen',
  soon: 'Gastgeber-Konten öffnen in Kürze. Bis dahin schick jede Änderung an deiner Seite an {email}, wir aktualisieren sie noch am selben Tag.',
};

export const hostAccountCopy = (lang: Lang): HostAccountCopy => (lang === 'de' ? de : en);
