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
  /** A video on its way to Bunny Stream (functions hostVideo): {pct} is a number. */
  vidPrep: string;
  vidUp: string;
  vidProc: string;
  vidDone: string;
  vidFail: string;
  vidBusy: string;
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
  /** Calendar tab: one calendar per workshop (Jirel 18.11.26). */
  cal: Record<string, string>;
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
  cal: {
    sub: 'Each workshop has its own calendar. Pick one to see and edit its dates.', newWorkshop: '+ New workshop',
    request1: '1 request', requestN: '{n} requests',
    waitList: 'Waiting list', person1: '1 person', personN: '{n} people', week: 'Week', month: 'Month', prevMonth: 'Previous month', nextMonth: 'Next month', addDate: '+ Add date',
    places: 'Places', booked: '{b} / {s} booked', bookedOpen: '{b} booked', full: 'Full', placesDate: 'Places on this date', auto: 'Accept bookings automatically',
    waiting: '{n} waiting', waitNames: '{names} are waiting for a place.', waitName1: '{names} is waiting for a place.', firstTitle: 'No dates yet', firstSub: 'Add your first date and guests can book it on Twiggli. Each workshop then gets its own calendar here.', firstBtn: '+ Add your first date', panel: 'Selected date', prevWeek: 'Previous week', nextWeek: 'Next week', waitHint: 'Add {n} places and they’re asked first.', reqs: 'Requests for this date',
    editDate: 'Edit date', cancelDate: 'Cancel date', cancelQ: 'Cancel this date? Please let guests who already booked know.', cancelOneQ: 'Cancel only {date}? The other dates of this series stay.',
    pick: 'Pick a date to see its bookings.', none: 'No dates for this workshop yet. Add one with “+ Add date”.', listEmpty: 'No dates this month.',
    reply: 'Answer in messages', saved: 'Saved', fail: 'Couldn’t save, so your change was undone. Please try again.', close: 'Close', prev: 'Previous', next: 'Next',
    demo: 'Demo: nothing you change here is saved.',
    synced: 'Synced from your booking page', syncedNote: 'This date comes from {site}. Change it there: the next sync would overwrite changes made here.', syncedOpen: 'Open your booking page', yourSite: 'your booking page',
    leftN: '{n} places left', leftShort: '{n} left', soldOut: 'Sold out', fromSite: 'From your Twiggli page. Your first change here saves this series as your own dates, and the page keeps showing it once.',
    takenOver: 'Saved. These dates are now yours to edit here.', needStripe: 'To take bookings straight away, connect Stripe in Settings → Payments.', autoNeedsPrice: 'Set a price on this date first: guests then book and pay straight away.',
    editWs: 'Edit workshop', wsTitle: 'Edit workshop', wsSub: 'This is what guests see on Twiggli. The page address stays the same; changes show within the hour.', wsName: 'Title', wsDesc: 'Description', wsDescPh: 'What happens, what guests take home, who it is for…',
    wsDuration: 'Length', wsPrice: 'Price per person (€)', wsSeats: 'Places per date', wsNote: 'One line about it (optional)', wsNotePh: 'e.g. Everyone takes home their own painting.',
    wsMedia: 'Photos and video', wsMediaHint: 'Tap to choose; the first one is the cover.', wsPhoto: 'Photo', wsCover: 'Cover', wsUpPhotos: '+ Upload photos', wsUpVideo: '+ Upload a video',
    wsBooking: 'How guests book', wsReq: 'Guests send a request', wsReqHint: 'You confirm each booking; they pay once you accept.', wsInstant: 'Guests book and pay straight away', wsInstantHint: 'For dates with a price you manage here; needs Stripe (Settings → Payments). You can still change it per date.',
    onReq: 'On request', onReqLegend: 'Dashed: on request. Guests can ask for that day; nothing is booked yet.', onReqNote: 'Guests can ask for this day. Nothing is booked yet; you confirm each request.', fixDate: 'Turn into a fixed date', removeSlot: 'Remove this slot', removeSlotQ: 'Remove the slot on {date}? Guests can no longer ask for it.', removeWeekly: 'No more {day}s at {time}', removeWeeklyQ: 'Remove every {day} at {time}? Guests can no longer ask for it on your page.', fixed: 'Now a fixed date with places. Change them here.', inviteBtn: 'Copy invite link', inviteCopied: 'Invite link for {name} copied.', inviteHere: 'Invite link for {name}:', inviteClaimed: 'Already claimed by {who}. Link copied anyway:', inviteFail: 'Couldn’t get the link. Please try again.', untilStripe: 'Takes requests until Stripe is connected (Settings → Payments).', wsCancel: 'Cancel', wsSave: 'Save', wsSaved: 'Workshop saved: the page shows it within the hour.', wsFail: 'That didn’t work, nothing was changed. Please try again.', wsNeedName: 'Please give it a title.', wsBadDuration: 'Write the length like “2.5 h” or “90 min”.', and: '&', guests1: '1 person', guestsN: '{n} people', request: 'Request',
  },
  ib: {
    details: 'Request details', unread: 'Unread',
    oTitle: 'Send {name} an offer', oSub: '{name} will have 48 hours to book. Your dates stay open in the meantime.', oTrip: 'Workshop details', oWorkshop: 'Workshop', oDate: 'Date', oDatePick: 'Choose a date', oAsked: 'Guest’s preferred date', oSubtotalLine: 'Total', oFee: 'Service fee (host, {pct} %)', oTime: 'Time', oGuests: 'People',
    oPricing: 'Your price', oUsual: 'Guests usually pay {each} per person.', oUsualNone: 'Set a price for the whole group.', oSubtotal: 'Workshop price for the group (€)', oSubNote: 'Includes materials. This price replaces your usual price for this booking. Add anything on top below as an extra.', oExtraAdd: '+ Add an extra (snacks & drinks, extra hour, travel, special wishes …)', oExtraPh: 'e.g. Snacks & drinks', oExtraName: 'Extra', oExtraAmt: 'Amount in €', oLine: '{n} × {each}', oGuestPays: 'The guest pays', oYou: 'You could earn', priority: 'Needs your answer', recent: 'Recent', pick: 'Pick a conversation on the left.',
    inquiry: 'Booking request', reqTab: 'Requests', holdLapsed: 'The hold on the guest’s card has expired (after 7 days). Please write to hello@twiggli.com and we’ll sort it out.', holdVoucher: '🎁 Paid with a Twiggli voucher ({v}). It is taken when you accept; Twiggli pays you by the 10th of next month, minus 15%.', holdCard: '🎁 Paid with a Twiggli voucher ({v}) + {c} held on the guest’s card. Both are taken when you accept; Twiggli pays you by the 10th of next month, minus 15%.', holdTaken: '🎁 Paid ({v} via voucher and card). Twiggli pays you by the 10th of next month, minus 15%.', acTitle: 'Accept {name}’s request?', acNote: 'We’ll let {name} know you said yes and take care of the booking. You can still write to them any time.', acEarn: 'You earn {amt}', acYes: 'Yes, accept', acNo: 'Not yet', lsMore: 'More', lsEdit: 'Edit', lsAddDate: 'Add a date', lsView: 'View on Twiggli', lsCopy: 'Copy link', lsCopied: 'Link copied.', lsEditTitle: 'Edit workshop', lsEditSub: 'This is what guests see on Twiggli. The page address stays the same.', lsFTitle: 'Title', lsFPrice: 'Price per person (€)', lsFNote: 'One line about it (optional)', lsNotePh: 'e.g. Everyone takes home a jar of their own kimchi.', lsSave: 'Save', lsDoneEdit: 'Saved: it shows on the site within the hour.', lsTitle: 'Your workshops', lsSub: 'Pause a workshop to take it off Twiggli for a while, or delete it for good. Changes show on the site within an hour.', lsLive: 'Online', lsPaused: 'Paused', lsPause: 'Pause', lsResume: 'Put back online', lsDelete: 'Delete', lsDeleteQ: 'Delete “{title}”?', lsDeleteNote: 'It disappears from Twiggli with all its dates. Requests already sent stay in your messages. If you might offer it again, pause it instead.', lsDeleteYes: 'Delete for good', lsPauseInstead: 'Pause instead', lsDate1: '1 date', lsDates: '{n} dates', lsEmpty: 'No workshops on your page yet.', lsDoneLive: 'Back online: it shows on the site again within the hour.', lsDonePaused: 'Paused: it goes off the site within the hour.', lsDoneDeleted: 'Deleted: it goes off the site within the hour.', lsFail: 'That didn’t work. Please try again.', reqTitle1: 'Your request', reqTitleN: 'Your requests', reqFor: 'Request for {date}', hLeft: '{n} hours left', hLeft1: '1 hour left', mLeft: '{n} min left', timeUp: 'Time is up', said: '{name} wrote:', decide: 'Decide within {time} to keep your response rate.', msgBtn: 'Message', asked: '{name} asked about {what}', until: 'You have until {when} to respond', late: 'The 48 hours are over: answer as soon as you can, the guest is still waiting.',
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
  welcomeTitle: 'Hello, host!',
  welcomeLede: 'Everything for your workshops in one place.',
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
  vidPrep: 'Getting the upload ready…',
  vidUp: 'Uploading video… {pct} %',
  vidProc: 'Video uploaded. Preparing it for playback… {pct} %',
  vidDone: 'Video ready.',
  vidFail: 'The video didn’t upload. Please try again, or send it to {email}.',
  vidBusy: 'Preparing',
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
  untilHint: 'empty = keeps repeating',
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
  stripeBtn: 'Connect Stripe',
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
  cal: {
    sub: 'Jeder Workshop hat seinen eigenen Kalender. Wähle einen aus, um seine Termine zu sehen und zu bearbeiten.', newWorkshop: '+ Neuer Workshop',
    request1: '1 Anfrage', requestN: '{n} Anfragen',
    waitList: 'Warteliste', person1: '1 Person', personN: '{n} Personen', week: 'Woche', month: 'Monat', prevMonth: 'Voriger Monat', nextMonth: 'Nächster Monat', addDate: '+ Termin hinzufügen',
    places: 'Plätze', booked: '{b} / {s} gebucht', bookedOpen: '{b} gebucht', full: 'Voll', placesDate: 'Plätze an diesem Termin', auto: 'Buchungen automatisch annehmen',
    waiting: '{n} warten', waitNames: '{names} warten auf einen Platz.', waitName1: '{names} wartet auf einen Platz.', firstTitle: 'Noch keine Termine', firstSub: 'Füge deinen ersten Termin hinzu, dann können Gäste ihn auf Twiggli buchen. Jeder Workshop bekommt hier seinen eigenen Kalender.', firstBtn: '+ Ersten Termin hinzufügen', panel: 'Ausgewählter Termin', prevWeek: 'Vorige Woche', nextWeek: 'Nächste Woche', waitHint: 'Füge {n} Plätze hinzu, dann werden sie zuerst gefragt.', reqs: 'Anfragen für diesen Termin',
    editDate: 'Termin bearbeiten', cancelDate: 'Termin absagen', cancelQ: 'Diesen Termin absagen? Bitte sag Gästen Bescheid, die schon gebucht haben.', cancelOneQ: 'Nur den {date} absagen? Die anderen Termine der Reihe bleiben.',
    pick: 'Wähle einen Termin, um seine Buchungen zu sehen.', none: 'Für diesen Workshop gibt es noch keine Termine. Füge einen mit „+ Termin hinzufügen“ hinzu.', listEmpty: 'Keine Termine in diesem Monat.',
    reply: 'In Nachrichten antworten', saved: 'Gespeichert', fail: 'Konnte nicht speichern, deine Änderung ist zurückgesetzt. Bitte versuch es noch einmal.', close: 'Schließen', prev: 'Zurück', next: 'Weiter',
    demo: 'Demo: Was du hier änderst, wird nicht gespeichert.',
    synced: 'Aus deiner Buchungsseite', syncedNote: 'Dieser Termin kommt von {site}. Ändere ihn dort: Der nächste Abgleich würde Änderungen von hier überschreiben.', syncedOpen: 'Buchungsseite öffnen', yourSite: 'deiner Buchungsseite',
    leftN: 'Noch {n} Plätze frei', leftShort: '{n} frei', soldOut: 'Ausgebucht', fromSite: 'Von deiner Twiggli-Seite. Mit deiner ersten Änderung hier wird diese Reihe zu deinen eigenen Terminen, und die Seite zeigt sie weiter genau einmal.',
    takenOver: 'Gespeichert. Diese Termine kannst du jetzt hier bearbeiten.', needStripe: 'Um Buchungen direkt anzunehmen, verbinde Stripe unter Einstellungen → Zahlungen.', autoNeedsPrice: 'Lege zuerst einen Preis für diesen Termin fest: Dann buchen und zahlen Gäste direkt.',
    editWs: 'Workshop bearbeiten', wsTitle: 'Workshop bearbeiten', wsSub: 'So sehen Gäste ihn auf Twiggli. Die Adresse bleibt gleich; Änderungen sind innerhalb einer Stunde zu sehen.', wsName: 'Titel', wsDesc: 'Beschreibung', wsDescPh: 'Was passiert, was Gäste mitnehmen, für wen es ist…',
    wsDuration: 'Dauer', wsPrice: 'Preis pro Person (€)', wsSeats: 'Plätze pro Termin', wsNote: 'Ein Satz dazu (optional)', wsNotePh: 'z. B. Alle nehmen ihr eigenes Bild mit nach Hause.',
    wsMedia: 'Fotos und Video', wsMediaHint: 'Antippen zum Auswählen; das erste ist das Titelbild.', wsPhoto: 'Foto', wsCover: 'Titelbild', wsUpPhotos: '+ Fotos hochladen', wsUpVideo: '+ Video hochladen',
    wsBooking: 'Wie Gäste buchen', wsReq: 'Gäste senden eine Anfrage', wsReqHint: 'Du bestätigst jede Buchung; sie zahlen, sobald du annimmst.', wsInstant: 'Gäste buchen und zahlen direkt', wsInstantHint: 'Für Termine mit Preis, die du hier verwaltest; braucht Stripe (Einstellungen → Zahlungen). Pro Termin kannst du es weiter ändern.',
    onReq: 'Auf Anfrage', onReqLegend: 'Gestrichelt: auf Anfrage. Gäste können für den Tag anfragen; noch ist nichts gebucht.', onReqNote: 'Gäste können für diesen Tag anfragen. Noch ist nichts gebucht; du bestätigst jede Anfrage.', fixDate: 'Als festen Termin anlegen', removeSlot: 'Diesen Slot entfernen', removeSlotQ: 'Den Slot am {date} entfernen? Gäste können dafür nicht mehr anfragen.', removeWeekly: 'Kein {day} mehr um {time}', removeWeeklyQ: 'Jeden {day} um {time} entfernen? Gäste können dafür auf deiner Seite nicht mehr anfragen.', fixed: 'Jetzt ein fester Termin mit Plätzen. Ändere sie hier.', inviteBtn: 'Einladungslink kopieren', inviteCopied: 'Einladungslink für {name} kopiert.', inviteHere: 'Einladungslink für {name}:', inviteClaimed: 'Schon übernommen von {who}. Link trotzdem kopiert:', inviteFail: 'Link nicht bekommen. Bitte versuch es noch einmal.', untilStripe: 'Nimmt Anfragen an, bis Stripe verbunden ist (Einstellungen → Zahlungen).', wsCancel: 'Abbrechen', wsSave: 'Speichern', wsSaved: 'Workshop gespeichert: Innerhalb einer Stunde ist es auf der Seite.', wsFail: 'Das hat nicht geklappt, es wurde nichts geändert. Bitte versuch es noch einmal.', wsNeedName: 'Bitte gib ihm einen Titel.', wsBadDuration: 'Schreib die Dauer wie „2,5 h“ oder „90 min“.', and: '&', guests1: '1 Person', guestsN: '{n} Personen', request: 'Anfrage',
  },
  ib: {
    details: 'Anfragedetails', unread: 'Ungelesen',
    oTitle: 'Sende {name} ein Angebot', oSub: '{name} hat 48 Stunden Zeit zu buchen. Deine Termine bleiben in der Zeit offen.', oTrip: 'Workshop-Details', oWorkshop: 'Workshop', oDate: 'Datum', oDatePick: 'Datum wählen', oAsked: 'Wunschtermin des Gastes', oSubtotalLine: 'Gesamt', oFee: 'Servicegebühr (Gastgeber, {pct} %)', oTime: 'Uhrzeit', oGuests: 'Personen',
    oPricing: 'Dein Preis', oUsual: 'Gäste zahlen bei dir normalerweise {each} pro Person.', oUsualNone: 'Lege einen Preis für die ganze Gruppe fest.', oSubtotal: 'Workshop-Preis für die Gruppe (€)', oSubNote: 'Inklusive Material. Dieser Preis ersetzt für diese Buchung deinen üblichen Preis. Alles, was dazukommt, trägst du unten als Extra ein.', oExtraAdd: '+ Extra hinzufügen (Snacks & Getränke, Extrastunde, Anfahrt, Sonderwünsche …)', oExtraPh: 'z. B. Snacks & Getränke', oExtraName: 'Extra', oExtraAmt: 'Betrag in €', oLine: '{n} × {each}', oGuestPays: 'Der Gast zahlt', oYou: 'Du könntest verdienen', priority: 'Warten auf deine Antwort', recent: 'Zuletzt', pick: 'Wähle links eine Unterhaltung aus.',
    inquiry: 'Buchungsanfrage', reqTab: 'Anfragen', holdLapsed: 'Die Vormerkung auf der Karte des Gastes ist abgelaufen (nach 7 Tagen). Schreib bitte kurz an hello@twiggli.com, wir klären das.', holdVoucher: '🎁 Mit Twiggli-Gutschein bezahlt ({v}). Er wird abgebucht, sobald du annimmst; Twiggli zahlt dir das bis zum 10. des Folgemonats aus, minus 15 %.', holdCard: '🎁 Mit Twiggli-Gutschein ({v}) + {c} auf der Karte des Gastes vorgemerkt. Beides wird abgebucht, sobald du annimmst; Twiggli zahlt dir das bis zum 10. des Folgemonats aus, minus 15 %.', holdTaken: '🎁 Bezahlt ({v} per Gutschein und Karte). Twiggli zahlt dir das bis zum 10. des Folgemonats aus, minus 15 %.', acTitle: 'Anfrage von {name} annehmen?', acNote: 'Wir sagen {name}, dass du zusagst, und kümmern uns um die Buchung. Schreiben kannst du jederzeit.', acEarn: 'Du verdienst {amt}', acYes: 'Ja, annehmen', acNo: 'Noch nicht', lsMore: 'Mehr', lsEdit: 'Bearbeiten', lsAddDate: 'Termin hinzufügen', lsView: 'Auf Twiggli ansehen', lsCopy: 'Link kopieren', lsCopied: 'Link kopiert.', lsEditTitle: 'Workshop bearbeiten', lsEditSub: 'So sehen Gäste ihn auf Twiggli. Die Adresse der Seite bleibt gleich.', lsFTitle: 'Titel', lsFPrice: 'Preis pro Person (€)', lsFNote: 'Ein Satz dazu (optional)', lsNotePh: 'z. B. Alle nehmen ein Glas eigenes Kimchi mit nach Hause.', lsSave: 'Speichern', lsDoneEdit: 'Gespeichert: Innerhalb einer Stunde ist es auf der Seite.', lsTitle: 'Deine Workshops', lsSub: 'Pausiere einen Workshop, um ihn eine Weile von Twiggli zu nehmen, oder lösche ihn ganz. Änderungen sind innerhalb einer Stunde auf der Seite.', lsLive: 'Online', lsPaused: 'Pausiert', lsPause: 'Pausieren', lsResume: 'Wieder online', lsDelete: 'Löschen', lsDeleteQ: '„{title}“ löschen?', lsDeleteNote: 'Er verschwindet mit allen Terminen von Twiggli. Anfragen, die schon da sind, bleiben in deinen Nachrichten. Wenn du ihn vielleicht wieder anbietest, pausiere ihn lieber.', lsDeleteYes: 'Endgültig löschen', lsPauseInstead: 'Stattdessen pausieren', lsDate1: '1 Termin', lsDates: '{n} Termine', lsEmpty: 'Auf deiner Seite sind noch keine Workshops.', lsDoneLive: 'Wieder online: Innerhalb einer Stunde ist er wieder auf der Seite.', lsDonePaused: 'Pausiert: Innerhalb einer Stunde ist er von der Seite.', lsDoneDeleted: 'Gelöscht: Innerhalb einer Stunde ist er von der Seite.', lsFail: 'Das hat nicht geklappt. Bitte versuch es noch einmal.', reqTitle1: 'Deine Anfrage', reqTitleN: 'Deine Anfragen', reqFor: 'Anfrage für {date}', hLeft: 'Noch {n} Std.', hLeft1: 'Noch 1 Std.', mLeft: 'Noch {n} Min.', timeUp: 'Zeit abgelaufen', said: '{name} schrieb:', decide: 'Entscheide innerhalb von {time}, damit deine Antwortrate gut bleibt.', msgBtn: 'Nachricht schreiben', asked: '{name} fragt nach {what}', until: 'Du hast bis {when} Zeit zu antworten', late: 'Die 48 Stunden sind um: Antworte bitte so bald wie möglich, der Gast wartet noch.',
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
  welcomeTitle: 'Hallo, Gastgeber:in!',
  welcomeLede: 'Alles für deine Workshops an einem Ort.',
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
  vidPrep: 'Upload wird vorbereitet…',
  vidUp: 'Video lädt hoch… {pct} %',
  vidProc: 'Video hochgeladen. Es wird fürs Abspielen vorbereitet… {pct} %',
  vidDone: 'Video fertig.',
  vidFail: 'Das Video wurde nicht hochgeladen. Versuch es bitte noch einmal, oder schick es an {email}.',
  vidBusy: 'Wird vorbereitet',
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
  untilHint: 'leer = läuft weiter',
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
  stripeBtn: 'Stripe verbinden',
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

const fr: HostAccountCopy = {
  pageTitle: 'Ton compte hôte | Twiggli',
  title: 'Ton compte hôte',
  lede: 'Mets à jour ta page et ton planning hebdo toi-même. Les changements sont en ligne sur twiggli.com dès le lendemain matin.',
  email: 'Ton e-mail',
  emailPh: 'toi@email.com',
  sendLink: 'Continuer avec l’e-mail',
  sending: 'Envoi…',
  linkSent: 'Regarde ta boîte mail : on t’a envoyé un lien de connexion. Pas besoin de mot de passe.',
  noHost: 'On n’a pas encore trouvé de page hôte pour cet e-mail. Écris à {email} et on la reliera.',
  google: 'Se connecter avec Google',
  or: 'ou',
  tabToday: 'Aujourd’hui',
  tabCalendar: 'Calendrier',
  tabListings: 'Annonces',
  tabMessages: 'Messages',
  tabInvites: 'Invitations',
  fAll: 'Tout',
  fPending: 'En attente de toi',
  fConfirmed: 'Confirmées',
  msgsEmpty: 'Pas encore de demandes. Quand quelqu’un demande une date, elle apparaît ici.',
  wToday: 'Aujourd’hui',
  wUpcoming: 'À venir',
  todayEmpty: 'Tu n’as aucune réservation',
  invitesLede: 'Le lien personnel de chaque hôte. La personne qui l’ouvre et se connecte obtient la page directement, alors envoie chaque lien uniquement à son hôte.',
  invitesLoad: 'Afficher les liens d’invitation',
  inviteCopy: 'Copier le lien',
  inviteCopied: 'Copié',
  inviteClaimed: 'récupérée par {email}',
  inviteNote: 'Tu récupères la page “{name}”. Connecte-toi et elle est à toi.',
  stPending: 'Demande en attente',
  stAccepted: 'Confirmée',
  stDeclined: 'Refusée',
  stSuggested: 'Nouvel horaire proposé',
  review: 'Voir',
  accept: 'Accepter',
  decline: 'Refuser',
  suggest: 'Proposer un autre horaire',
  suggestWhen: 'Quelle date et quelle heure à la place ?',
  replyMsg: 'Message pour le participant (facultatif)',
  replyMsgPh: 'ex. Hâte de te voir ! Apporte un tablier.',
  sendReply: 'Envoyer',
  replied: 'C’est fait. On transmet ta réponse au participant.',
  guest: 'Participant',
  people: 'Personnes',
  phone: 'Téléphone',
  back: '← Tous les messages',
  cal: {
    sub: 'Chaque atelier a son propre calendrier. Choisis-en un pour voir et modifier ses dates.', newWorkshop: '+ Nouvel atelier',
    request1: '1 demande', requestN: '{n} demandes',
    waitList: 'Liste d’attente', person1: '1 personne', personN: '{n} personnes', week: 'Semaine', month: 'Mois', prevMonth: 'Mois précédent', nextMonth: 'Mois suivant', addDate: '+ Ajouter une date',
    places: 'Places', booked: '{b} / {s} réservées', bookedOpen: '{b} réservées', full: 'Complet', placesDate: 'Places à cette date', auto: 'Accepter les réservations automatiquement',
    waiting: '{n} en attente', waitNames: '{names} attendent une place.', waitName1: '{names} attend une place.', firstTitle: 'Pas encore de dates', firstSub: 'Ajoute ta première date et les participants pourront la réserver sur Twiggli. Chaque atelier aura ici son propre calendrier.', firstBtn: '+ Ajouter ta première date', panel: 'Date choisie', prevWeek: 'Semaine précédente', nextWeek: 'Semaine suivante', waitHint: 'Ajoute {n} places et on leur propose en premier.', reqs: 'Demandes pour cette date',
    editDate: 'Modifier la date', cancelDate: 'Annuler la date', cancelQ: 'Annuler cette date ? Préviens les participants qui ont déjà réservé.', cancelOneQ: 'Annuler seulement le {date} ? Les autres dates de la série restent.',
    pick: 'Choisis une date pour voir ses réservations.', none: 'Pas encore de dates pour cet atelier. Ajoutes-en une avec « + Ajouter une date ».', listEmpty: 'Aucune date ce mois-ci.',
    reply: 'Répondre dans les messages', saved: 'Enregistré', fail: 'Impossible d’enregistrer, ton changement a été annulé. Réessaie.', close: 'Fermer', prev: 'Précédent', next: 'Suivant',
    demo: 'Démo : rien de ce que tu changes ici n’est enregistré.',
    synced: 'Synchronisé depuis ta page de réservation', syncedNote: 'Cette date vient de {site}. Modifie-la là-bas : la prochaine synchronisation écraserait les changements faits ici.', syncedOpen: 'Ouvrir ta page de réservation', yourSite: 'ta page de réservation',
    leftN: 'Encore {n} places', leftShort: '{n} libres', soldOut: 'Complet', fromSite: 'Depuis ta page Twiggli. Ton premier changement ici enregistre cette série comme tes propres dates, et la page continue de l’afficher une seule fois.',
    takenOver: 'Enregistré. Tu peux maintenant modifier ces dates ici.', needStripe: 'Pour accepter les réservations directement, connecte Stripe dans Réglages → Paiements.', autoNeedsPrice: 'Fixe d’abord un prix pour cette date : les participants réservent et paient alors directement.',
    editWs: 'Modifier l’atelier', wsTitle: 'Modifier l’atelier', wsSub: 'C’est ce que les participants voient sur Twiggli. L’adresse ne change pas ; les changements apparaissent d’ici une heure.', wsName: 'Titre', wsDesc: 'Description', wsDescPh: 'Ce qui se passe, ce que les participants emportent, pour qui c’est…',
    wsDuration: 'Durée', wsPrice: 'Prix par personne (€)', wsSeats: 'Places par date', wsNote: 'Une phrase pour le décrire (facultatif)', wsNotePh: 'ex. Chacun repart avec sa propre peinture.',
    wsMedia: 'Photos et vidéo', wsMediaHint: 'Touche pour choisir ; la première est la couverture.', wsPhoto: 'Photo', wsCover: 'Couverture', wsUpPhotos: '+ Ajouter des photos', wsUpVideo: '+ Ajouter une vidéo',
    wsBooking: 'Comment on réserve', wsReq: 'Les participants envoient une demande', wsReqHint: 'Tu confirmes chaque réservation ; ils paient quand tu acceptes.', wsInstant: 'Les participants réservent et paient directement', wsInstantHint: 'Pour les dates avec un prix que tu gères ici ; nécessite Stripe (Réglages → Paiements). Tu peux toujours le changer par date.',
    onReq: 'Sur demande', onReqLegend: 'En pointillés : sur demande. On peut demander ce jour-là ; rien n’est encore réservé.', onReqNote: 'Les participants peuvent demander ce jour-là. Rien n’est encore réservé ; tu confirmes chaque demande.', fixDate: 'En faire une date fixe', removeSlot: 'Retirer ce créneau', removeSlotQ: 'Retirer le créneau du {date} ? On ne pourra plus le demander.', removeWeekly: 'Plus de {day} à {time}', removeWeeklyQ: 'Retirer chaque {day} à {time} ? On ne pourra plus le demander sur ta page.', fixed: 'C’est maintenant une date fixe avec des places. Modifie-les ici.', inviteBtn: 'Copier le lien d’invitation', inviteCopied: 'Lien d’invitation pour {name} copié.', inviteHere: 'Lien d’invitation pour {name} :', inviteClaimed: 'Déjà pris par {who}. Lien copié quand même :', inviteFail: 'Impossible d’obtenir le lien. Réessaie.', untilStripe: 'Prend des demandes tant que Stripe n’est pas connecté (Réglages → Paiements).', wsCancel: 'Annuler', wsSave: 'Enregistrer', wsSaved: 'Atelier enregistré : visible sur la page d’ici une heure.', wsFail: 'Ça n’a pas marché, rien n’a été changé. Réessaie.', wsNeedName: 'Donne-lui un titre.', wsBadDuration: 'Écris la durée comme « 2,5 h » ou « 90 min ».', and: '&', guests1: '1 personne', guestsN: '{n} personnes', request: 'Demande',
  },
  ib: {
    details: 'Détails de la demande', unread: 'Non lu',
    oTitle: 'Envoyer une offre à {name}', oSub: '{name} aura 48 heures pour réserver. Tes dates restent ouvertes en attendant.', oTrip: 'Détails de l’atelier', oWorkshop: 'Atelier', oDate: 'Date', oDatePick: 'Choisis une date', oAsked: 'Date souhaitée par le participant', oSubtotalLine: 'Total', oFee: 'Frais de service (hôte, {pct} %)', oTime: 'Heure', oGuests: 'Personnes',
    oPricing: 'Ton prix', oUsual: 'Les participants paient en général {each} par personne.', oUsualNone: 'Fixe un prix pour tout le groupe.', oSubtotal: 'Prix de l’atelier pour le groupe (€)', oSubNote: 'Matériel compris. Ce prix remplace ton prix habituel pour cette réservation. Ajoute tout supplément ci-dessous en extra.', oExtraAdd: '+ Ajouter un extra (snacks & boissons, heure en plus, déplacement, demandes spéciales …)', oExtraPh: 'ex. Snacks & boissons', oExtraName: 'Extra', oExtraAmt: 'Montant en €', oLine: '{n} × {each}', oGuestPays: 'Le participant paie', oYou: 'Tu pourrais gagner', priority: 'Attend ta réponse', recent: 'Récents', pick: 'Choisis une conversation à gauche.',
    inquiry: 'Demande de réservation', reqTab: 'Demandes', holdLapsed: 'La pré-autorisation sur la carte du participant a expiré (après 7 jours). Écris à hello@twiggli.com et on s’en occupe.', holdVoucher: '🎁 Payé avec un bon cadeau Twiggli ({v}). Il est débité quand tu acceptes ; Twiggli te paie avant le 10 du mois suivant, moins 15%.', holdCard: '🎁 Payé avec un bon cadeau Twiggli ({v}) + {c} bloqués sur la carte du participant. Les deux sont débités quand tu acceptes ; Twiggli te paie avant le 10 du mois suivant, moins 15%.', holdTaken: '🎁 Payé ({v} par bon cadeau et carte). Twiggli te paie avant le 10 du mois suivant, moins 15%.', acTitle: 'Accepter la demande de {name} ?', acNote: 'On prévient {name} que tu as dit oui et on s’occupe de la réservation. Tu peux toujours lui écrire quand tu veux.', acEarn: 'Tu gagnes {amt}', acYes: 'Oui, accepter', acNo: 'Pas encore', lsMore: 'Plus', lsEdit: 'Modifier', lsAddDate: 'Ajouter une date', lsView: 'Voir sur Twiggli', lsCopy: 'Copier le lien', lsCopied: 'Lien copié.', lsEditTitle: 'Modifier l’atelier', lsEditSub: 'C’est ce que les participants voient sur Twiggli. L’adresse de la page ne change pas.', lsFTitle: 'Titre', lsFPrice: 'Prix par personne (€)', lsFNote: 'Une phrase pour le décrire (facultatif)', lsNotePh: 'ex. Chacun repart avec son bocal de kimchi maison.', lsSave: 'Enregistrer', lsDoneEdit: 'Enregistré : visible sur le site d’ici une heure.', lsTitle: 'Tes ateliers', lsSub: 'Mets un atelier en pause pour le retirer de Twiggli un moment, ou supprime-le pour de bon. Les changements apparaissent sur le site d’ici une heure.', lsLive: 'En ligne', lsPaused: 'En pause', lsPause: 'Mettre en pause', lsResume: 'Remettre en ligne', lsDelete: 'Supprimer', lsDeleteQ: 'Supprimer “{title}” ?', lsDeleteNote: 'Il disparaît de Twiggli avec toutes ses dates. Les demandes déjà envoyées restent dans tes messages. Si tu penses le proposer à nouveau, mets-le plutôt en pause.', lsDeleteYes: 'Supprimer définitivement', lsPauseInstead: 'Mettre en pause', lsDate1: '1 date', lsDates: '{n} dates', lsEmpty: 'Pas encore d’ateliers sur ta page.', lsDoneLive: 'De retour en ligne : visible à nouveau sur le site d’ici une heure.', lsDonePaused: 'En pause : retiré du site d’ici une heure.', lsDoneDeleted: 'Supprimé : retiré du site d’ici une heure.', lsFail: 'Ça n’a pas marché. Réessaie.', reqTitle1: 'Ta demande', reqTitleN: 'Tes demandes', reqFor: 'Demande pour le {date}', hLeft: 'Encore {n} heures', hLeft1: 'Encore 1 heure', mLeft: 'Encore {n} min', timeUp: 'Temps écoulé', said: '{name} a écrit :', decide: 'Décide d’ici {time} pour garder ton taux de réponse.', msgBtn: 'Message', asked: '{name} a demandé {what}', until: 'Tu as jusqu’à {when} pour répondre', late: 'Les 48 heures sont passées : réponds dès que possible, le participant attend toujours.',
    respond: 'Répondre', total: 'au total', perPerson: 'par personne', guests: '{n} participants', guest1: '1 participant',
    accept: 'Accepter', offer: 'Faire une offre', decline: 'Refuser', offerTitle: 'Ton offre', offerWhen: 'Date et heure (facultatif)', offerPrice: 'Prix par personne en € (facultatif)', offerSend: 'Envoyer l’offre', offerNeed: 'Ajoute une date ou un prix.',
    declineHead: 'Refuser la demande de {name}', declineTitle: 'Pourquoi refuses-tu ?', declinePh: 'ex. Dommage, je suis déjà complet ce jour-là. Une prochaine fois peut-être !', declineNote: 'Le participant ne voit jamais ta raison. On lui propose d’autres hôtes.', declineSend: 'Refuser la demande',
    rBooked: 'Déjà réservé ce jour-là', rSize: 'Groupe trop grand ou trop petit', rAway: 'Je suis absent·e', rFit: 'Ça ne correspond pas', rOther: 'Autre',
    about: 'À propos de {name}', reqN: '{n} demandes sur Twiggli', req1: 'Première demande sur Twiggli', came: 'A découvert Twiggli via {src}', speaks: 'Écrit en {lang}',
    write: 'Écris un message…', send: 'Envoyer', saved: 'Réponses enregistrées', saveThis: '+ Enregistrer ce texte comme réponse', noSaved: 'Pas encore de réponses enregistrées.',
    you: 'Toi', accepted: 'Tu as accepté.', declined: 'Tu as refusé.', suggested: 'Tu as proposé {when}.', offered: 'Tu as fait une offre : {what}.', sent: 'Envoyé. On le transmet au participant.',
    todoStripe: 'Connecte Stripe pour recevoir des paiements', todoStripeSub: 'Les participants pourront alors réserver et payer tes dates directement.', todoGo: 'Connecter',
    msg1: 'Hâte de te voir ! Viens avec des vêtements qui peuvent se salir un peu.', msg2: 'Le studio est au rez-de-chaussée ; sonne à mon nom.', msg3: 'Tout le matériel est fourni, tu n’as rien à apporter.',
  },
  welcomeTitle: 'Coucou !',
  welcomeLede: 'Tout pour tes ateliers, au même endroit.',
  tabOverview: 'Aperçu',
  addDate: 'Date',
  notifications: 'Notifications',
  profile: 'Ton profil',
  pickEmoji: 'Ton emoji de profil',
  hello: 'Coucou',
  helloSub: 'Ta semaine en un coup d’œil',
  wPast: 'Passés',
  stOpen: 'En attente de toi',
  stOpenNote: 'à répondre',
  stOpenNone: 'tout est répondu',
  stBookings: 'Réservations',
  stBookingsNote: '{n} participants ce mois-ci',
  stEarnings: 'Revenus',
  stEarningsNote: 'ce mois-ci, après 15%',
  stNext: 'Prochaine date',
  stNextNone: 'rien de prévu pour l’instant',
  nextDates: 'Tes prochaines dates',
  pastDates: 'Réservations passées',
  today: 'Aujourd’hui',
  alertOne: '1 nouvelle demande t’attend',
  alertMany: '{n} nouvelles demandes t’attendent',
  bookedN: '{n} réservé(s)',
  noBookingYet: 'pas encore de réservation',
  mediaNone: 'Ta vidéo ou ta photo',
  mediaTip: 'Les vidéos font le plus de réservations : 10 à 30 secondes, filmées à la verticale avec ton téléphone, c’est parfait. Pas de vidéo ? Alors 3 à 8 photos. Ou les deux.',
  uploadVideo: 'Importer une vidéo',
  uploadPhotos: 'Importer des photos',
  mediaFromPage: 'Ou choisis parmi les photos de ta page :',
  uploading: 'Import…',
  uploadDone: 'Importé.',
  uploadFail: 'L’import n’est pas encore activé. Choisis une photo de ta page pour l’instant, ou envoie la vidéo à {email}.',
  vidPrep: 'Préparation de l’import…',
  vidUp: 'Import de la vidéo… {pct} %',
  vidProc: 'Vidéo importée. Préparation pour la lecture… {pct} %',
  vidDone: 'Vidéo prête.',
  vidFail: 'La vidéo n’a pas été importée. Réessaie, ou envoie-la à {email}.',
  vidBusy: 'En préparation',
  vPublic: 'Public',
  vPrivate: 'Uniquement avec le lien',
  titlePh: 'Comment s’appelle ton atelier ?',
  startLabel: 'Début',
  endLabel: 'Fin',
  repeat: 'Répéter',
  rOnce: 'Une fois',
  rWeekly: 'Chaque semaine',
  rBiweekly: 'Toutes les 2 semaines',
  rMonthly: 'Chaque mois',
  untilLabel: 'Jusqu’au',
  untilHint: 'vide = continue sans fin',
  locationPh: 'Où ? (ton studio, ou l’adresse)',
  descPh: 'Qu’est-ce que les gens vont faire ? (repris de ta page si tu laisses vide)',
  bookingSec: 'Réservation',
  priceLabel: 'Prix par personne (€)',
  seatsLabel: 'Places',
  minLabel: 'A lieu à partir de',
  minHint: 'participants, sinon c’est annulé et personne ne paie',
  approveLabel: 'Valider les demandes d’abord',
  langLabel: 'Langue',
  cancelLabel: 'Annulation',
  c24: 'gratuite jusqu’à 24 h avant',
  c7: 'gratuite jusqu’à 7 jours avant',
  c14: 'gratuite jusqu’à 14 jours avant',
  cNone: 'pas de remboursement',
  cMove: 'pas de remboursement, mais report possible à une date ultérieure',
  publish: 'Publier la date',
  saveChanges: 'Enregistrer les modifications',
  publishNote: 'Visible sur ta page et dans le calendrier Twiggli d’ici une heure.',
  stripeTitle: 'Accepter les paiements',
  stripeBody: 'Ton compte n’est pas encore prêt à recevoir des paiements. On utilise Stripe pour les paiements : connecte ton compte Stripe ou crées-en un. Ça prend en général moins de 5 minutes.',
  stripeBtn: 'Connecter Stripe',
  stripeLinkBtn: 'J’ai déjà un compte Stripe',
  stripeLinkOff: 'La liaison d’un compte Stripe existant n’est pas encore activée. Crées-en un avec le bouton ci-dessus.',
  stripeLinked: 'Ton compte Stripe est relié.',
  stripeWait: 'Ouverture de Stripe…',
  stripeDone: 'Stripe est connecté : tu peux recevoir des paiements.',
  stripePending: 'Stripe a encore besoin de quelques infos avant que tu puisses recevoir des paiements.',
  stripeFail: 'Impossible d’ouvrir Stripe. Réessaie dans un instant.',
  stripeNeeded: 'Pour publier une date avec un prix, connecte d’abord Stripe (ou mets le prix à 0).',
  published: 'Publié ! Visible sur ta page d’ici une heure.',
  yourDates: 'Tes dates',
  newDate: 'Nouvelle date',
  noOwnDates: 'Pas encore de dates. Crée ta première avec “Nouvelle date”.',
  editDate: 'Modifier',
  deleteDate: 'Supprimer',
  confirmDelete: 'Supprimer cette date ?',
  seatsN: '{n} places',
  runsFromN: 'à partir de {n}',
  repeatsWeekly: 'chaque semaine',
  repeatsBiweekly: 'toutes les 2 semaines',
  repeatsMonthly: 'chaque mois',
  notYetTitle: 'Tu n’es pas encore hôte sur Twiggli',
  notYetLede: 'Envie de proposer tes ateliers avec nous ? Parle-nous-en et on te recontacte.',
  notYetCta: 'Devenir hôte',
  claimTitle: 'Déjà sur Twiggli ? Récupère ta page',
  claimLede: 'Choisis ta page sur Twiggli. On vérifie que c’est bien toi et on la débloque, en général le jour même.',
  claimPage: 'Ta page',
  claimPagePh: 'Choisis ta page…',
  claimName: 'Ton nom',
  claimNote: 'Quelque chose à nous dire ? (facultatif)',
  claimNotePh: 'ex. Je gère le studio avec Anna',
  claimSend: 'Demander l’accès',
  claimSent: 'Merci ! On a bien reçu ta demande et on débloque ta page très vite. Tu la verras ici dès que c’est fait.',
  adminPick: 'Ouvrir n’importe quel hôte (admin)',
  signOut: 'Se déconnecter',
  signedInAs: 'Connecté·e en tant que {email}',
  hostPick: 'Page',
  tabPage: 'Ta page',
  tabSchedule: 'Planning hebdo',
  tabVouchers: 'Bons cadeaux',
  tabRequests: 'Demandes',
  textIn: 'Texte en',
  fSpecialty: 'Titre de ton atelier',
  fSpecialtyHint: 'Court, comme “Peinture de vulves & apprentissage ludique”.',
  fStudio: 'Nom du studio',
  fBlurb: 'Description',
  fBlurbHint: 'Ce que les gens font, ce qu’ils rapportent chez eux, à qui ça s’adresse.',
  fGroup: 'Taille du groupe',
  fGroupHint: 'ex. “Jusqu’à 10 au studio · 4 à 15 chez toi”',
  fDuration: 'Durée',
  fPlace: 'Lieu',
  fLanguages: 'Langues',
  fPriceNote: 'Note sur le prix',
  scheduleLede: 'Les jours et horaires où tu proposes ton atelier chaque semaine. Les participants envoient une demande de réservation et on te la transmet.',
  slotTitle: 'Atelier',
  slotDays: 'Jours',
  slotTime: 'Heure',
  slotDuration: 'Durée',
  slotPrice: 'Prix par personne (€)',
  addSlot: '+ Ajouter un horaire',
  removeSlot: 'Retirer',
  noSlots: 'Pas encore d’horaires hebdo. Ajoutes-en un, ou laisse vide si tu travailles uniquement sur demande.',
  days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  save: 'Enregistrer',
  saving: 'Enregistrement…',
  saved: 'Enregistré ! Ta page est mise à jour d’ici demain matin.',
  error: 'Ça n’a pas marché. Réessaie, ou écris-nous à {email}.',
  soonVouchers: 'Bientôt : retrouve tous les bons cadeaux vendus pour tes ateliers, et marque le code d’un participant comme utilisé en un clic.',
  soonRequests: 'Bientôt : les demandes de réservation arrivent ici, et tu les acceptes ou y réponds tout de suite.',
  viewPage: 'Voir ta page',
  soon: 'Les comptes hôtes ouvrent très bientôt. D’ici là, envoie toute modification de ta page à {email} et on la met à jour le jour même.',
};

export const hostAccountCopy = (lang: Lang): HostAccountCopy => (lang === 'de' ? de : lang === 'fr' ? fr : en);
