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
  notYetTitle: string;
  notYetLede: string;
  notYetCta: string;
  tabOverview: string;
  addDate: string;
  notifications: string;
  profile: string;
  pickEmoji: string;
  hello: string;
  helloSub: string;
  wPast: string;
  stOpen: string;
  stOpenNote: string;
  stOpenNone: string;
  stBookings: string;
  stBookingsNote: string;
  stEarnings: string;
  stEarningsNote: string;
  stNext: string;
  stNextNone: string;
  nextDates: string;
  pastDates: string;
  today: string;
  alertOne: string;
  alertMany: string;
  bookedN: string;
  noBookingYet: string;
  mediaNone: string;
  mediaTip: string;
  uploadVideo: string;
  uploadPhotos: string;
  mediaFromPage: string;
  uploading: string;
  uploadDone: string;
  uploadFail: string;
  vPublic: string;
  vPrivate: string;
  titlePh: string;
  startLabel: string;
  endLabel: string;
  repeat: string;
  rOnce: string;
  rWeekly: string;
  rBiweekly: string;
  rMonthly: string;
  untilLabel: string;
  untilHint: string;
  locationPh: string;
  descPh: string;
  bookingSec: string;
  priceLabel: string;
  seatsLabel: string;
  minLabel: string;
  minHint: string;
  approveLabel: string;
  langLabel: string;
  cancelLabel: string;
  c24: string;
  c7: string;
  c14: string;
  cNone: string;
  publish: string;
  saveChanges: string;
  publishNote: string;
  stripeTitle: string;
  stripeBody: string;
  stripeBtn: string;
  stripeWait: string;
  stripeDone: string;
  stripePending: string;
  stripeFail: string;
  published: string;
  yourDates: string;
  newDate: string;
  noOwnDates: string;
  editDate: string;
  deleteDate: string;
  confirmDelete: string;
  seatsN: string;
  runsFromN: string;
  repeatsWeekly: string;
  repeatsBiweekly: string;
  repeatsMonthly: string;
  claimTitle: string;
  google: string;
  or: string;
  tabToday: string;
  tabCalendar: string;
  tabListings: string;
  tabMessages: string;
  tabInvites: string;
  fAll: string;
  fPending: string;
  fConfirmed: string;
  msgsEmpty: string;
  wToday: string;
  wUpcoming: string;
  todayEmpty: string;
  invitesLede: string;
  invitesLoad: string;
  inviteCopy: string;
  inviteCopied: string;
  inviteClaimed: string;
  inviteNote: string;
  stPending: string;
  stAccepted: string;
  stDeclined: string;
  stSuggested: string;
  review: string;
  accept: string;
  decline: string;
  suggest: string;
  suggestWhen: string;
  replyMsg: string;
  replyMsgPh: string;
  sendReply: string;
  replied: string;
  guest: string;
  people: string;
  phone: string;
  back: string;
  welcomeTitle: string;
  welcomeLede: string;
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
  emailPh: 'you@email.com',
  sendLink: 'Continue with email',
  sending: 'Sending…',
  linkSent: 'Check your inbox: we sent you a sign-in link. No password needed.',
  noHost: 'We couldn’t find a host page for this email yet. Write to {email} and we’ll connect it.',
  google: 'Sign in with Google',
  or: 'or',
  tabToday: 'Today',
  tabCalendar: 'Calendar',
  tabListings: 'Listings',
  tabMessages: 'Messages',
  tabInvites: 'Invites',
  fAll: 'All',
  fPending: 'Waiting for you',
  fConfirmed: 'Confirmed',
  msgsEmpty: 'No requests yet. When someone asks for a date, it shows up here.',
  wToday: 'Today',
  wUpcoming: 'Upcoming',
  todayEmpty: 'You don’t have any bookings',
  invitesLede: 'Each host’s personal link. Whoever opens it and signs in gets that page straight away, so send each link only to its host.',
  invitesLoad: 'Show invite links',
  inviteCopy: 'Copy link',
  inviteCopied: 'Copied',
  inviteClaimed: 'claimed by {email}',
  inviteNote: 'You’re claiming the page “{name}”. Sign in and it’s yours.',
  stPending: 'Request pending',
  stAccepted: 'Confirmed',
  stDeclined: 'Declined',
  stSuggested: 'New time suggested',
  review: 'Review',
  accept: 'Accept',
  decline: 'Decline',
  suggest: 'Suggest another time',
  suggestWhen: 'Which date and time instead?',
  replyMsg: 'Message to the guest (optional)',
  replyMsgPh: 'e.g. Looking forward to it! Bring an apron.',
  sendReply: 'Send',
  replied: 'Done. We pass your answer on to the guest.',
  guest: 'Guest',
  people: 'People',
  phone: 'Phone',
  back: '← All messages',
  welcomeTitle: 'Welcome to Twiggli',
  welcomeLede: 'Sign in or create your host account.',
  tabOverview: 'Overview',
  addDate: 'Date',
  notifications: 'Notifications',
  profile: 'Your profile',
  pickEmoji: 'Your profile emoji',
  hello: 'Hi',
  helloSub: 'Your week at a glance',
  wPast: 'Past',
  stOpen: 'Waiting for you',
  stOpenNote: 'to answer',
  stOpenNone: 'all answered',
  stBookings: 'Bookings',
  stBookingsNote: '{n} guests this month',
  stEarnings: 'Earnings',
  stEarningsNote: 'this month, after 15%',
  stNext: 'Next date',
  stNextNone: 'nothing planned yet',
  nextDates: 'Your next dates',
  pastDates: 'Past bookings',
  today: 'Today',
  alertOne: '1 new request is waiting for you',
  alertMany: '{n} new requests are waiting for you',
  bookedN: '{n} booked',
  noBookingYet: 'no bookings yet',
  mediaNone: 'Your video or photo',
  mediaTip: 'Videos get the most bookings: 10–30 seconds, filmed upright on your phone, is perfect. No video? Then 3–8 photos. Or both.',
  uploadVideo: 'Upload video',
  uploadPhotos: 'Upload photos',
  mediaFromPage: 'Or pick from the photos on your page:',
  uploading: 'Uploading…',
  uploadDone: 'Uploaded.',
  uploadFail: 'Upload isn’t switched on yet. Pick a photo from your page for now, or send the video to {email}.',
  vPublic: 'Public',
  vPrivate: 'Only with the link',
  titlePh: 'What’s your workshop called?',
  startLabel: 'Start',
  endLabel: 'End',
  repeat: 'Repeat',
  rOnce: 'Once',
  rWeekly: 'Every week',
  rBiweekly: 'Every 2 weeks',
  rMonthly: 'Every month',
  untilLabel: 'Until',
  untilHint: 'empty = 12 weeks',
  locationPh: 'Where? (your studio, or the address)',
  descPh: 'What will people do? (taken from your page if you leave it empty)',
  bookingSec: 'Booking',
  priceLabel: 'Price per person (€)',
  seatsLabel: 'Seats',
  minLabel: 'Runs from',
  minHint: 'participants, otherwise it’s cancelled and nobody pays',
  approveLabel: 'Confirm requests first',
  langLabel: 'Language',
  cancelLabel: 'Cancellation',
  c24: 'free up to 24 h before',
  c7: 'free up to 7 days before',
  c14: 'free up to 14 days before',
  cNone: 'no refunds',
  publish: 'Publish date',
  saveChanges: 'Save changes',
  publishNote: 'Shows on your page and in the Twiggli calendar within the hour.',
  stripeTitle: 'Get paid with Stripe',
  stripeBody: 'To take money for this date, connect a Stripe account. Create a new one in a few minutes or sign in to the one you already have. Guests pay through Twiggli and the money goes straight to you.',
  stripeBtn: 'Connect Stripe',
  stripeWait: 'Opening Stripe…',
  stripeDone: 'Stripe connected: you can take payments.',
  stripePending: 'Stripe still needs a few details from you before you can take payments.',
  stripeFail: 'Stripe could not be opened. Please try again in a moment.',
  published: 'Published! It shows on your page within the hour.',
  yourDates: 'Your dates',
  newDate: 'New date',
  noOwnDates: 'No dates yet. Create your first one with “New date”.',
  editDate: 'Edit',
  deleteDate: 'Delete',
  confirmDelete: 'Delete this date?',
  seatsN: '{n} seats',
  runsFromN: 'runs from {n}',
  repeatsWeekly: 'every week',
  repeatsBiweekly: 'every 2 weeks',
  repeatsMonthly: 'every month',
  notYetTitle: 'You’re not a Twiggli host yet',
  notYetLede: 'Want to run your workshops with us? Tell us about them and we’ll get in touch.',
  notYetCta: 'Become a host',
  claimTitle: 'Already on Twiggli? Claim your page',
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
  emailPh: 'du@email.de',
  sendLink: 'Weiter mit E-Mail',
  sending: 'Wird gesendet…',
  linkSent: 'Schau in dein Postfach: Wir haben dir einen Anmeldelink geschickt. Kein Passwort nötig.',
  noHost: 'Zu dieser E-Mail haben wir noch keine Gastgeber-Seite gefunden. Schreib uns an {email}, dann verbinden wir sie.',
  google: 'Mit Google anmelden',
  or: 'oder',
  tabToday: 'Heute',
  tabCalendar: 'Kalender',
  tabListings: 'Angebote',
  tabMessages: 'Nachrichten',
  tabInvites: 'Einladungen',
  fAll: 'Alle',
  fPending: 'Warten auf dich',
  fConfirmed: 'Bestätigt',
  msgsEmpty: 'Noch keine Anfragen. Sobald jemand einen Termin anfragt, erscheint er hier.',
  wToday: 'Heute',
  wUpcoming: 'Demnächst',
  todayEmpty: 'Du hast keine Buchungen',
  invitesLede: 'Der persönliche Link jedes Gastgebers. Wer ihn öffnet und sich anmeldet, bekommt die Seite sofort, also schick jeden Link nur an seinen Gastgeber.',
  invitesLoad: 'Einladungslinks anzeigen',
  inviteCopy: 'Link kopieren',
  inviteCopied: 'Kopiert',
  inviteClaimed: 'übernommen von {email}',
  inviteNote: 'Du übernimmst die Seite „{name}“. Melde dich an, dann gehört sie dir.',
  stPending: 'Anfrage offen',
  stAccepted: 'Bestätigt',
  stDeclined: 'Abgelehnt',
  stSuggested: 'Neuer Termin vorgeschlagen',
  review: 'Ansehen',
  accept: 'Annehmen',
  decline: 'Ablehnen',
  suggest: 'Anderen Termin vorschlagen',
  suggestWhen: 'Welcher Tag und welche Uhrzeit stattdessen?',
  replyMsg: 'Nachricht an den Gast (optional)',
  replyMsgPh: 'z. B. Ich freu mich! Bring eine Schürze mit.',
  sendReply: 'Senden',
  replied: 'Erledigt. Wir geben deine Antwort an den Gast weiter.',
  guest: 'Gast',
  people: 'Personen',
  phone: 'Telefon',
  back: '← Alle Nachrichten',
  welcomeTitle: 'Willkommen bei Twiggli',
  welcomeLede: 'Melde dich an oder leg dein Gastgeber-Konto an.',
  tabOverview: 'Übersicht',
  addDate: 'Termin',
  notifications: 'Benachrichtigungen',
  profile: 'Dein Profil',
  pickEmoji: 'Dein Profil-Emoji',
  hello: 'Hallo',
  helloSub: 'Deine Woche auf einen Blick',
  wPast: 'Vergangen',
  stOpen: 'Warten auf dich',
  stOpenNote: 'zu beantworten',
  stOpenNone: 'alles beantwortet',
  stBookings: 'Buchungen',
  stBookingsNote: '{n} Gäste diesen Monat',
  stEarnings: 'Einnahmen',
  stEarningsNote: 'diesen Monat, nach 15 %',
  stNext: 'Nächster Termin',
  stNextNone: 'noch nichts geplant',
  nextDates: 'Deine nächsten Termine',
  pastDates: 'Vergangene Buchungen',
  today: 'Heute',
  alertOne: '1 neue Anfrage wartet auf dich',
  alertMany: '{n} neue Anfragen warten auf dich',
  bookedN: '{n} gebucht',
  noBookingYet: 'noch keine Buchung',
  mediaNone: 'Dein Video oder Foto',
  mediaTip: 'Videos bringen die meisten Buchungen: 10–30 Sekunden, hochkant mit dem Handy gefilmt, sind perfekt. Kein Video? Dann 3–8 Fotos. Oder beides.',
  uploadVideo: 'Video hochladen',
  uploadPhotos: 'Fotos hochladen',
  mediaFromPage: 'Oder wähl aus den Fotos deiner Seite:',
  uploading: 'Lädt hoch…',
  uploadDone: 'Hochgeladen.',
  uploadFail: 'Hochladen ist noch nicht freigeschaltet. Wähl solange ein Foto deiner Seite, oder schick das Video an {email}.',
  vPublic: 'Öffentlich',
  vPrivate: 'Nur mit Link',
  titlePh: 'Wie heißt dein Workshop?',
  startLabel: 'Beginn',
  endLabel: 'Ende',
  repeat: 'Wiederholen',
  rOnce: 'Einmalig',
  rWeekly: 'Jede Woche',
  rBiweekly: 'Alle 2 Wochen',
  rMonthly: 'Jeden Monat',
  untilLabel: 'Bis',
  untilHint: 'leer = 12 Wochen',
  locationPh: 'Wo? (dein Studio oder die Adresse)',
  descPh: 'Was machen die Leute? (leer = Text von deiner Seite)',
  bookingSec: 'Buchung',
  priceLabel: 'Preis pro Person (€)',
  seatsLabel: 'Plätze',
  minLabel: 'Findet statt ab',
  minHint: 'Teilnehmenden, sonst fällt er aus und niemand zahlt',
  approveLabel: 'Anfragen erst bestätigen',
  langLabel: 'Sprache',
  cancelLabel: 'Stornierung',
  c24: 'bis 24 Std. vorher kostenlos',
  c7: 'bis 7 Tage vorher kostenlos',
  c14: 'bis 14 Tage vorher kostenlos',
  cNone: 'keine Erstattung',
  publish: 'Termin veröffentlichen',
  saveChanges: 'Änderungen speichern',
  publishNote: 'Erscheint innerhalb einer Stunde auf deiner Seite und im Twiggli-Kalender.',
  stripeTitle: 'Bezahlung über Stripe',
  stripeBody: 'Damit du für diesen Termin Geld nehmen kannst, verbinde ein Stripe-Konto. Leg in wenigen Minuten ein neues an oder melde dich mit deinem bestehenden an. Die Gäste zahlen über Twiggli, das Geld geht direkt an dich.',
  stripeBtn: 'Mit Stripe verbinden',
  stripeWait: 'Stripe wird geöffnet…',
  stripeDone: 'Stripe ist verbunden: du kannst Zahlungen annehmen.',
  stripePending: 'Stripe braucht noch ein paar Angaben von dir, bevor du Zahlungen annehmen kannst.',
  stripeFail: 'Stripe ließ sich nicht öffnen. Bitte versuch es gleich noch einmal.',
  published: 'Veröffentlicht! Erscheint innerhalb einer Stunde auf deiner Seite.',
  yourDates: 'Deine Termine',
  newDate: 'Neuer Termin',
  noOwnDates: 'Noch keine Termine. Leg deinen ersten mit „Neuer Termin“ an.',
  editDate: 'Bearbeiten',
  deleteDate: 'Löschen',
  confirmDelete: 'Diesen Termin löschen?',
  seatsN: '{n} Plätze',
  runsFromN: 'ab {n}',
  repeatsWeekly: 'jede Woche',
  repeatsBiweekly: 'alle 2 Wochen',
  repeatsMonthly: 'jeden Monat',
  notYetTitle: 'Du bist noch kein Twiggli-Gastgeber',
  notYetLede: 'Möchtest du deine Workshops mit uns anbieten? Erzähl uns davon, wir melden uns.',
  notYetCta: 'Gastgeber werden',
  claimTitle: 'Schon bei Twiggli? Übernimm deine Seite',
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
