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
  /** No refund, but the guest can move the ticket to a later date (fave studio, 04.11.26). */
  cMove: string;
  publish: string;
  saveChanges: string;
  publishNote: string;
  stripeTitle: string;
  stripeBody: string;
  stripeBtn: string;
  stripeLinkBtn: string;
  stripeLinkOff: string;
  stripeLinked: string;
  stripeWait: string;
  stripeDone: string;
  stripePending: string;
  stripeFail: string;
  stripeNeeded: string;
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
  /** The messages view, Airbnb-style (three columns): list, conversation, request. */
  ib: Record<string, string>;
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
  ib: {
    details: 'Request details', unread: 'Unread',
    oTitle: 'Send {name} an offer', oSub: '{name} will have 48 hours to book. Your dates stay open in the meantime.', oTrip: 'Workshop details', oWorkshop: 'Workshop', oDate: 'Date', oDatePick: 'Choose a date', oAsked: 'Guest’s preferred date', oSubtotalLine: 'Total', oFee: 'Service fee (host, {pct} %)', oTime: 'Time', oGuests: 'People',
    oPricing: 'Your price', oUsual: 'Guests usually pay {each} per person.', oUsualNone: 'Set a price for the whole group.', oSubtotal: 'Workshop price for the group (€)', oSubNote: 'Includes materials. This price replaces your usual price for this booking. Add anything on top below as an extra.', oExtraAdd: '+ Add an extra (snacks & drinks, extra hour, travel, special wishes …)', oExtraPh: 'e.g. Snacks & drinks', oExtraName: 'Extra', oExtraAmt: 'Amount in €', oLine: '{n} × {each}', oGuestPays: 'The guest pays', oYou: 'You could earn', priority: 'Needs your answer', recent: 'Recent', pick: 'Pick a conversation on the left.',
    inquiry: 'Booking request', reqTab: 'Requests', reqTitle1: 'Your request', reqTitleN: 'Your requests', reqFor: 'Request for {date}', hLeft: '{n} hours left', hLeft1: '1 hour left', mLeft: '{n} min left', timeUp: 'Time is up', said: '{name} wrote:', decide: 'Decide within {time} to keep your response rate.', msgBtn: 'Message', asked: '{name} asked about {what}', until: 'You have until {when} to respond', late: 'The 48 hours are over: answer as soon as you can, the guest is still waiting.',
    respond: 'Respond', total: 'total', perPerson: 'per person', guests: '{n} guests', guest1: '1 guest',
    accept: 'Accept', offer: 'Make an offer', decline: 'Decline', offerTitle: 'Your offer', offerWhen: 'Date and time (optional)', offerPrice: 'Price per person in € (optional)', offerSend: 'Send offer', offerNeed: 'Add a date or a price.',
    declineHead: 'Decline {name}’s request', declineTitle: 'Why are you declining?', declinePh: 'e.g. What a shame, I’m already fully booked that day. Maybe another time!', declineNote: 'The guest never sees your reason. We suggest other hosts to them.', declineSend: 'Decline request',
    rBooked: 'Already booked that day', rSize: 'Group too big or too small', rAway: 'I\'m away', rFit: 'Not the right fit', rOther: 'Other',
    about: 'About {name}', reqN: '{n} requests on Twiggli', req1: 'First request on Twiggli', came: 'Found Twiggli via {src}', speaks: 'Writes in {lang}',
    write: 'Write a message…', send: 'Send', saved: 'Saved replies', saveThis: '+ Save this text as a reply', noSaved: 'No saved replies yet.',
    you: 'You', accepted: 'You accepted.', declined: 'You declined.', suggested: 'You suggested {when}.', offered: 'You made an offer: {what}.', sent: 'Sent. We pass it on to the guest.',
    todoStripe: 'Connect Stripe to receive payments', todoStripeSub: 'Guests can then book and pay your dates straight away.', todoGo: 'Connect',
    msg1: 'Looking forward to it! Please bring clothes that can get a little dirty.', msg2: 'The studio is on the ground floor; ring the bell marked with my name.', msg3: 'All materials are included, you don\'t need to bring anything.',
  },
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
  cMove: 'no refund, but can be moved to a later date',
  publish: 'Publish date',
  saveChanges: 'Save changes',
  publishNote: 'Shows on your page and in the Twiggli calendar within the hour.',
  stripeTitle: 'Accept payments',
  stripeBody: 'Your account is not set up to accept payments yet. We use Stripe to process payments: connect your Stripe account or set up a new one. It usually takes less than 5 minutes.',
  stripeBtn: 'Create a Stripe account',
  stripeLinkBtn: 'I already have a Stripe account',
  stripeLinkOff: 'Linking an existing Stripe account is not switched on yet. Please create one with the button above.',
  stripeLinked: 'Your Stripe account is linked.',
  stripeWait: 'Opening Stripe…',
  stripeDone: 'Stripe connected: you can take payments.',
  stripePending: 'Stripe still needs a few details from you before you can take payments.',
  stripeFail: 'Stripe could not be opened. Please try again in a moment.',
  stripeNeeded: 'To publish a date with a price, connect Stripe first (or set the price to 0).',
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
  ib: {
    details: 'Anfragedetails', unread: 'Ungelesen',
    oTitle: 'Sende {name} ein Angebot', oSub: '{name} hat 48 Stunden Zeit zu buchen. Deine Termine bleiben in der Zeit offen.', oTrip: 'Workshop-Details', oWorkshop: 'Workshop', oDate: 'Datum', oDatePick: 'Datum wählen', oAsked: 'Wunschtermin des Gastes', oSubtotalLine: 'Gesamt', oFee: 'Servicegebühr (Gastgeber, {pct} %)', oTime: 'Uhrzeit', oGuests: 'Personen',
    oPricing: 'Dein Preis', oUsual: 'Gäste zahlen bei dir normalerweise {each} pro Person.', oUsualNone: 'Lege einen Preis für die ganze Gruppe fest.', oSubtotal: 'Workshop-Preis für die Gruppe (€)', oSubNote: 'Inklusive Material. Dieser Preis ersetzt für diese Buchung deinen üblichen Preis. Alles, was dazukommt, trägst du unten als Extra ein.', oExtraAdd: '+ Extra hinzufügen (Snacks & Getränke, Extrastunde, Anfahrt, Sonderwünsche …)', oExtraPh: 'z. B. Snacks & Getränke', oExtraName: 'Extra', oExtraAmt: 'Betrag in €', oLine: '{n} × {each}', oGuestPays: 'Der Gast zahlt', oYou: 'Du könntest verdienen', priority: 'Warten auf deine Antwort', recent: 'Zuletzt', pick: 'Wähle links eine Unterhaltung aus.',
    inquiry: 'Buchungsanfrage', reqTab: 'Anfragen', reqTitle1: 'Deine Anfrage', reqTitleN: 'Deine Anfragen', reqFor: 'Anfrage für {date}', hLeft: 'Noch {n} Std.', hLeft1: 'Noch 1 Std.', mLeft: 'Noch {n} Min.', timeUp: 'Zeit abgelaufen', said: '{name} schrieb:', decide: 'Entscheide innerhalb von {time}, damit deine Antwortrate gut bleibt.', msgBtn: 'Nachricht schreiben', asked: '{name} fragt nach {what}', until: 'Du hast bis {when} Zeit zu antworten', late: 'Die 48 Stunden sind um: Antworte bitte so bald wie möglich, der Gast wartet noch.',
    respond: 'Antworten', total: 'gesamt', perPerson: 'pro Person', guests: '{n} Gäste', guest1: '1 Gast',
    accept: 'Annehmen', offer: 'Angebot machen', decline: 'Ablehnen', offerTitle: 'Dein Angebot', offerWhen: 'Datum und Uhrzeit (optional)', offerPrice: 'Preis pro Person in € (optional)', offerSend: 'Angebot senden', offerNeed: 'Gib ein Datum oder einen Preis an.',
    declineHead: 'Anfrage von {name} ablehnen', declineTitle: 'Warum lehnst du ab?', declinePh: 'z. B. Schade, an dem Tag bin ich leider schon ausgebucht. Vielleicht ein andermal!', declineNote: 'Der Gast sieht deinen Grund nie. Wir schlagen ihm andere Gastgeber vor.', declineSend: 'Anfrage ablehnen',
    rBooked: 'An dem Tag schon ausgebucht', rSize: 'Gruppe zu groß oder zu klein', rAway: 'Ich bin nicht da', rFit: 'Passt nicht zu mir', rOther: 'Anderes',
    about: 'Über {name}', reqN: '{n} Anfragen auf Twiggli', req1: 'Erste Anfrage auf Twiggli', came: 'Kam über {src} zu Twiggli', speaks: 'Schreibt auf {lang}',
    write: 'Nachricht schreiben…', send: 'Senden', saved: 'Gespeicherte Antworten', saveThis: '+ Diesen Text als Antwort speichern', noSaved: 'Noch keine gespeicherten Antworten.',
    you: 'Du', accepted: 'Du hast angenommen.', declined: 'Du hast abgelehnt.', suggested: 'Du hast {when} vorgeschlagen.', offered: 'Dein Angebot: {what}.', sent: 'Gesendet. Wir geben es an den Gast weiter.',
    todoStripe: 'Verbinde Stripe, um Zahlungen zu erhalten', todoStripeSub: 'Dann können Gäste deine Termine direkt buchen und bezahlen.', todoGo: 'Verbinden',
    msg1: 'Ich freu mich auf euch! Bitte zieht Kleidung an, die etwas abbekommen darf.', msg2: 'Das Studio ist im Erdgeschoss, klingelt bitte bei meinem Namen.', msg3: 'Alles Material ist inklusive, ihr müsst nichts mitbringen.',
  },
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
  cMove: 'keine Erstattung, aber auf einen späteren Termin übertragbar',
  publish: 'Termin veröffentlichen',
  saveChanges: 'Änderungen speichern',
  publishNote: 'Erscheint innerhalb einer Stunde auf deiner Seite und im Twiggli-Kalender.',
  stripeTitle: 'Zahlungen annehmen',
  stripeBody: 'Dein Konto ist noch nicht für Zahlungen eingerichtet. Wir nutzen Stripe für die Zahlungen: Verbinde dein Stripe-Konto oder leg ein neues an. Das dauert meist keine 5 Minuten.',
  stripeBtn: 'Neues Stripe-Konto erstellen',
  stripeLinkBtn: 'Ich habe schon ein Stripe-Konto',
  stripeLinkOff: 'Das Verknüpfen eines bestehenden Stripe-Kontos ist noch nicht freigeschaltet. Bitte erstelle eines über den Button oben.',
  stripeLinked: 'Dein Stripe-Konto ist verknüpft.',
  stripeWait: 'Stripe wird geöffnet…',
  stripeDone: 'Stripe ist verbunden: du kannst Zahlungen annehmen.',
  stripePending: 'Stripe braucht noch ein paar Angaben von dir, bevor du Zahlungen annehmen kannst.',
  stripeFail: 'Stripe ließ sich nicht öffnen. Bitte versuch es gleich noch einmal.',
  stripeNeeded: 'Um einen Termin mit Preis zu veröffentlichen, verbinde zuerst Stripe (oder setz den Preis auf 0).',
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
