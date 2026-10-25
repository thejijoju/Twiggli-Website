import type { Host } from './content.ts';
import { getHostPriceRanges } from './sessions.ts';
import type { Lang } from '../lib/url.ts';

/**
 * Gift vouchers ("Gutscheine"). The single source of truth for who takes
 * them: only hosts who agreed to vouchers in writing are listed here, and
 * every voucher button, badge and link on the site — the host page's gift
 * box, the second button under a booking button, the badge and the
 * "Gift it" link on the tiles, the hosts on the voucher page — is shown for
 * these slugs and nobody else. Add a slug once the host has said yes.
 *
 *  - anna-malerlebnisse: agreed to vouchers (confirmed by Jirel, 24.10.26).
 *  - himapan-berlin: our agreement email of 22.10.26 names vouchers
 *    ("Auch für Gutscheine gelten 15 %…"), and Kirsten replied on 23.10.26
 *    "ich stimme unserer Vereinbarung zu".
 *  - chelti: NOT yet. The same voucher line was in their agreement email
 *    (22.10.26), but they have not confirmed it ("Ja") — they only sent
 *    photos. Add them once they do.
 *  - lucille-guder: agreed to vouchers (her reply to Jirel, 24.10.26). She
 *    is still a preview host, so the voucher page's host list (getHosts
 *    without `withPreview`) leaves her out until she goes live; only her
 *    own hidden page shows the voucher button and gift box.
 *
 * There is no payment system yet: every voucher button opens a request form
 * (VoucherDialog.astro) that lands in our inbox as "Voucher request", and
 * Jirel sends the payment link and the PDF by hand. Twiggli takes the
 * payment and pays the host their share (15 % commission, as agreed).
 *
 * Agreed to vouchers (confirmed by Jirel, 24.10.26), matched to their slugs:
 *  - sarah: Sarah, mindfulness & creative writing.
 *  - ceramic-kingdom: Madeline, Ceramic Kingdom.
 *  - petitejungle: Aurélie, Petite Jungle.
 *  - sabine: Sabine & Alex, Mobile Dunkelkammer.
 *  - druckrausch: Deborah, Druckrausch.
 *  - qian: NOT yet. Listed on 24.10.26, but her reply the same day asks
 *    how tracking, payout and the 3 years work before she decides. Taken
 *    off again until she says yes.
 *  - rebeca: Rebeca, Arte Gorda.
 *  - angelo: Angelo, Coffee and Bananas.
 *  - evelyn: Evelyn Cseh (Tuka Creative Club, at Ohma Studio).
 *  - nina: Nina Kranz Art.
 *  - ana: Ana Kavalis, Resonant Body.
 *  - helka: Lisa, Helka Ceramics.
 *  - maximiliana: Maximiliana Marti, bird sketching.
 *  - nicole / whittle: Nicole, Anybody Can Whittle (both of her cards).
 *  - pia: Pia, Vulva Painting (agreed in the WhatsApp group, 24.10.26).
 *  - studio32: Fred, studio32 Berlin (cooking studio, www.studio32.berlin).
 *  - anne: Anna Martynenko, creative photography (slug kept as "anne").
 * Both agreed in the host WhatsApp group (Jirel, 24.10.26).
 */
export const voucherHosts: string[] = [
  'anna-malerlebnisse', 'himapan-berlin', 'lucille-guder',
  'sarah', 'ceramic-kingdom', 'petitejungle', 'sabine', 'druckrausch', 'rebeca',
  'angelo', 'evelyn', 'nina', 'ana', 'helka', 'maximiliana',
  'nicole', 'whittle', 'pia', 'studio32', 'anne',
];

/**
 * Master switch. Off (25.10.26): vouchers are hidden on the site until the
 * hosts have the confirmation email with how tracking, payout and the
 * 3 years work. Off hides every gift button, badge and gift box, the
 * "🎁 Gutscheine" pill and the home teaser; /voucher/ itself still opens by
 * its address (no host list) for testing.
 */
export const VOUCHERS_ON = false;

export const isVoucherHost = (slug: string): boolean => VOUCHERS_ON && voucherHosts.includes(slug);

/** How long a voucher is valid, in years. */
export const VOUCHER_YEARS = 3;
/** The general Twiggli voucher's fixed amounts, and the smallest free amount. */
export const voucherAmounts = [25, 50, 75];
export const VOUCHER_MIN = 20;
/** The most people one host voucher covers. */
export const VOUCHER_MAX_PEOPLE = 10;

/** What one place costs for a voucher: the cheapest of the host's own dated
 *  sessions (a voucher is for a seat at one of those), otherwise the
 *  price they quoted per person. Anna: €35 (her open Malerlebnis), not the
 *  €57 she charges companies. */
export const voucherPrice = (host: Pick<Host, 'slug' | 'groupPrice'>): number | undefined => {
  const dated = getHostPriceRanges().get(host.slug);
  if (dated && dated[0] > 0) return dated[0];
  if (host.groupPrice == null) return undefined;
  return Array.isArray(host.groupPrice) ? host.groupPrice[0] : host.groupPrice;
};

/**
 * Stripe Payment Links for vouchers. A fixed amount with its own link goes
 * straight to Stripe in one click; anything else (the free amount, a host's
 * places) opens the short form, which only asks the amount and then hands
 * over to the "customers choose" link. Stripe collects name, email, card and
 * the recipient; a background note with the same reference still lands in
 * our inbox. While `live` is empty, the button
 * only appears for someone who opened the site with ?stripetest=1 (Jirel
 * testing with Stripe's test cards); everyone else gets today's flow, where
 * Jirel sends the payment link by hand.
 */
export const stripeVoucherLink: Record<'test' | 'live', { custom: string; fixed: Record<number, string> }> = {
  test: {
    // "Customers choose what to pay": the free amount and host vouchers.
    custom: 'https://buy.stripe.com/test_14AcN7aoWddw5ld46RfUQ00',
    // Fixed prices: a click on that amount goes straight to Stripe.
    fixed: {
      25: 'https://buy.stripe.com/test_6oU14pdB8ehAfZR6eZfUQ01',
      50: 'https://buy.stripe.com/test_3cI6oJfJg2yS8xp5aVfUQ02',
      75: 'https://buy.stripe.com/test_aFa6oJcx44H07tl32NfUQ03',
    },
  },
  live: { custom: '', fixed: {} },
};

/**
 * Our own checkout (supabase/functions/voucher-checkout): creates a Stripe
 * Checkout Session for the exact amount, host and places, so every voucher
 * is two clicks and the amount can't be changed at Stripe. When `url` is
 * set it replaces the Payment Links above; `live: false` keeps it to visits
 * with ?stripetest=1. The anon key is Supabase's public key, safe here.
 */
export const voucherCheckout = {
  url: 'https://kwympvwouzbhshtrptfp.supabase.co/functions/v1/voucher-checkout',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eW1wdndvdXpiaHNodHJwdGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NzUzNjYsImV4cCI6MjEwODQ1MTM2Nn0.hszNu1l3fJJsY9g47SAY4ZmKS0BP7OQwixQ_VMoxcYQ',
  live: false,
};

/** The "host" a general voucher is for, as it lands in our inbox. */
export const GENERAL_VOUCHER_HOST = 'General Twiggli voucher (any participating host)';

export type VoucherCopy = {
  /** Header and footer link. */
  nav: string;
  // A · the second button under a booking button.
  give: string; validNote: string;
  /** A · the small button under a tile's or a date row's booking button. */
  gift: string;
  // B · the gift box on the host page.
  boxTitle: string; boxEm: string; buy: string; boxNote: string;
  /** '{n}' stands for the number: the copy travels to the page as JSON. */
  onePerson: string; nPeople: string;
  // C · on the tiles.
  badge: string; tileLink: string;
  // The request form.
  formTitle: string; formLede: string; generalLede: string; generalTitle: string;
  people: string; amount: string; pick: string; wish: string; wishHint: string;
  buyerName: string; buyerEmail: string; recipient: string; recipientEmail: string;
  message: string; messagePh: string;
  delivery: string; toMe: string; toThem: string;
  optional: string; send: string; sending: string;
  sentTitle: string; sentBody: string; error: string; close: string;
  /** Stripe step: '{amount}' is the voucher's value. */
  payNow: string; payHint: string; paidTitle: string; paidBody: string;
  /** The form's intro when Stripe is on (no 'nothing to pay yet'). */
  payLede: string;
  /** '{host}' is the host's name. */
  validAt: string; validAny: string;
  // The voucher page.
  pageTitle: string; pageDescription: string;
  kicker: string; h1a: string; h1em: string; lede: string;
  cards: [string, string, string]; wishCard: string; wishFrom: string; choose: string;
  howTitle: string; howEm: string; steps: [string, string, string]; stepsCopy: [string, string, string];
  hostsTitle: string; hostsEm: string; hostsSub: string; perPerson: string; more: string;
  facts: [string, string, string];
  // The home page teaser.
  teaserKicker: string; teaserTitle: string; teaserEm: string; teaserCopy: string; teaserCta: string;
};

export const voucherCopy: Record<Lang, VoucherCopy> = {
  en: {
    nav: '🎁 Vouchers',
    give: '🎁 Give it as a voucher', validNote: 'Voucher valid for 3 years',
    gift: '🎁 Give as a gift',
    boxTitle: 'Give', boxEm: 'this experience', buy: 'Buy a voucher', boxNote: 'Valid for 3 years · as a PDF',
    onePerson: '1 person', nPeople: '{n} people',
    badge: '🎁 Voucher', tileLink: '🎁 Give as a gift',
    formTitle: 'Gift voucher', generalTitle: 'Twiggli gift voucher',
    formLede: 'Tell us who it’s for. Twiggli sends you the payment link and the voucher as a PDF. Nothing to pay yet.',
    generalLede: 'Pick an amount: whoever gets it chooses the workshop. Twiggli sends you the payment link and the voucher as a PDF. Nothing to pay yet.',
    people: 'Number of people', amount: 'Amount', pick: 'Choose an amount', wish: 'Your amount', wishHint: 'From €20',
    buyerName: 'Your name', buyerEmail: 'Your email', recipient: 'Who is it for?', recipientEmail: 'Their email',
    message: 'Personal message', messagePh: 'A few words for the voucher',
    delivery: 'Delivery', toMe: 'PDF by email to me', toThem: 'Straight to the person it’s for',
    optional: 'optional', send: 'Request voucher', sending: 'Sending…',
    sentTitle: 'Thank you!', sentBody: 'Twiggli will get back to you within 24 hours with the payment link and your voucher.',
    error: 'That didn’t go through. Please try again, or write to us at {email}.', close: 'Close',
    payNow: 'Pay now · {amount}', payHint: 'Pay securely with Stripe. Please enter {amount} on the payment page. Twiggli then sends you the voucher as a PDF.',
    paidTitle: 'Payment received, thank you! 🎁', paidBody: 'Twiggli sends you the voucher as a PDF within 24 hours.',
    payLede: 'Tell us who it’s for, then pay securely with Stripe. You get the voucher as a PDF.',
    validAt: 'Valid for 3 years · for {host}', validAny: 'Valid for 3 years · at every host taking part',
    pageTitle: 'Gift vouchers for workshops in Berlin | Twiggli',
    pageDescription: 'Give time, not stuff: a Twiggli voucher for €25, €50, €75 or any amount from €20, valid for 3 years and redeemable at Berlin makers’ workshops.',
    kicker: 'Gift vouchers', h1a: 'Give', h1em: 'time, not stuff', lede: 'A workshop with a Berlin maker: painting, crafting, making something with your own hands. Valid for 3 years, and whoever gets it picks the date.',
    cards: ['A lovely start', 'The classic', 'For something special'], wishCard: 'Your amount', wishFrom: 'from €20', choose: 'Choose',
    howTitle: 'How it', howEm: 'works',
    steps: ['Pick an amount', 'Twiggli sends the link + PDF', 'They book their maker'],
    stepsCopy: [
      '€25, €50, €75 or any amount from €20, and a personal message if you like.',
      'Within 24 hours you get the payment link, then the voucher as a PDF, to print or to forward.',
      'Whoever gets it books a workshop with any of the makers below, any time in the next 3 years.',
    ],
    hostsTitle: 'Where it', hostsEm: 'can be used', hostsSub: 'Makers who take Twiggli vouchers. More are joining.', perPerson: 'per person', more: 'See the workshop',
    facts: ['Valid for 3 years', 'PDF to print or forward', 'Pay by link, no account'],
    teaserKicker: 'Christmas gift idea', teaserTitle: 'Give', teaserEm: 'time, not stuff', teaserCopy: 'A voucher for a workshop with a Berlin maker: valid for 3 years, as a PDF to put under the tree.', teaserCta: 'Give a voucher',
  },
  de: {
    nav: '🎁 Gutscheine',
    give: '🎁 Als Gutschein verschenken', validNote: 'Gutschein 3 Jahre gültig',
    gift: '🎁 Als Gutschein verschenken',
    boxTitle: 'Verschenk', boxEm: 'dieses Erlebnis', buy: 'Gutschein kaufen', boxNote: '3 Jahre gültig · als PDF',
    onePerson: '1 Person', nPeople: '{n} Personen',
    badge: '🎁 Gutschein', tileLink: '🎁 Verschenken',
    formTitle: 'Gutschein verschenken', generalTitle: 'Twiggli-Gutschein',
    formLede: 'Sag uns, für wen er ist. Twiggli schickt dir den Zahlungslink und den Gutschein als PDF. Du zahlst noch nichts.',
    generalLede: 'Wähl einen Betrag, den Workshop sucht sich die beschenkte Person selbst aus. Twiggli schickt dir den Zahlungslink und den Gutschein als PDF. Du zahlst noch nichts.',
    people: 'Anzahl Personen', amount: 'Betrag', pick: 'Betrag wählen', wish: 'Wunschbetrag', wishHint: 'Ab 20 €',
    buyerName: 'Dein Name', buyerEmail: 'Deine E-Mail', recipient: 'Für wen ist er?', recipientEmail: 'E-Mail der beschenkten Person',
    message: 'Persönliche Nachricht', messagePh: 'Ein paar Worte für den Gutschein',
    delivery: 'Zustellung', toMe: 'PDF per E-Mail an mich', toThem: 'Direkt an die beschenkte Person',
    optional: 'optional', send: 'Gutschein anfragen', sending: 'Wird gesendet…',
    sentTitle: 'Danke!', sentBody: 'Twiggli meldet sich innerhalb von 24 Stunden mit dem Zahlungslink und deinem Gutschein.',
    error: 'Das hat nicht geklappt. Versuch es bitte noch einmal oder schreib uns an {email}.', close: 'Schließen',
    payNow: 'Jetzt bezahlen · {amount}', payHint: 'Sicher bezahlen mit Stripe. Bitte trag auf der Zahlungsseite {amount} ein. Danach schickt dir Twiggli den Gutschein als PDF.',
    paidTitle: 'Zahlung erhalten, danke! 🎁', paidBody: 'Twiggli schickt dir den Gutschein innerhalb von 24 Stunden als PDF.',
    payLede: 'Sag uns, für wen er ist, dann zahlst du sicher mit Stripe. Den Gutschein bekommst du als PDF.',
    validAt: '3 Jahre gültig · für {host}', validAny: '3 Jahre gültig · bei allen teilnehmenden Maker*innen',
    pageTitle: 'Gutscheine für Workshops in Berlin | Twiggli',
    pageDescription: 'Verschenk Zeit statt Zeug: ein Twiggli-Gutschein über 25, 50, 75 € oder deinen Wunschbetrag ab 20 €, 3 Jahre gültig und einlösbar bei Berliner Maker*innen.',
    kicker: 'Gutscheine', h1a: 'Verschenk', h1em: 'Zeit statt Zeug', lede: 'Ein Workshop bei Berliner Maker*innen: malen, gestalten, etwas mit den eigenen Händen machen. 3 Jahre gültig, den Termin sucht sich die beschenkte Person selbst aus.',
    cards: ['Ein schöner Anfang', 'Der Klassiker', 'Für etwas Besonderes'], wishCard: 'Wunschbetrag', wishFrom: 'ab 20 €', choose: 'Auswählen',
    howTitle: 'So', howEm: 'funktioniert’s',
    steps: ['Betrag wählen', 'Twiggli schickt Zahlungslink + PDF', 'Beschenkte bucht bei einer Maker*in ihrer Wahl'],
    stepsCopy: [
      '25, 50, 75 € oder ein Wunschbetrag ab 20 €, gern mit persönlicher Nachricht.',
      'Innerhalb von 24 Stunden bekommst du den Zahlungslink, danach den Gutschein als PDF zum Ausdrucken oder Weiterleiten.',
      'Die beschenkte Person bucht einen Workshop bei einer der Maker*innen unten, irgendwann in den nächsten 3 Jahren.',
    ],
    hostsTitle: 'Hier', hostsEm: 'einlösbar', hostsSub: 'Maker*innen, die Twiggli-Gutscheine annehmen. Es kommen laufend neue dazu.', perPerson: 'pro Person', more: 'Zum Workshop',
    facts: ['3 Jahre gültig', 'PDF zum Ausdrucken oder Weiterleiten', 'Bezahlen per Link, ohne Konto'],
    teaserKicker: 'Geschenkidee zu Weihnachten', teaserTitle: 'Verschenk', teaserEm: 'Zeit statt Zeug', teaserCopy: 'Ein Gutschein für einen Workshop bei Berliner Maker*innen: 3 Jahre gültig, als PDF für unter den Baum.', teaserCta: 'Gutschein verschenken',
  },
  fr: {
    nav: '🎁 Bons cadeaux',
    give: '🎁 Offrir en bon cadeau', validNote: 'Bon valable 3 ans',
    gift: '🎁 Offrir en bon cadeau',
    boxTitle: 'Offrez', boxEm: 'cette expérience', buy: 'Acheter un bon', boxNote: 'Valable 3 ans · en PDF',
    onePerson: '1 personne', nPeople: '{n} personnes',
    badge: '🎁 Bon cadeau', tileLink: '🎁 Offrir',
    formTitle: 'Offrir un bon cadeau', generalTitle: 'Bon cadeau Twiggli',
    formLede: 'Dites-nous à qui il est destiné. Twiggli vous envoie le lien de paiement et le bon en PDF. Rien à payer pour l’instant.',
    generalLede: 'Choisissez un montant : la personne qui le reçoit choisit son atelier. Twiggli vous envoie le lien de paiement et le bon en PDF. Rien à payer pour l’instant.',
    people: 'Nombre de personnes', amount: 'Montant', pick: 'Choisissez un montant', wish: 'Montant libre', wishHint: 'À partir de 20 €',
    buyerName: 'Votre nom', buyerEmail: 'Votre e-mail', recipient: 'Pour qui ?', recipientEmail: 'Son e-mail',
    message: 'Message personnel', messagePh: 'Quelques mots pour le bon',
    delivery: 'Envoi', toMe: 'PDF par e-mail à moi', toThem: 'Directement à la personne',
    optional: 'facultatif', send: 'Demander le bon', sending: 'Envoi…',
    sentTitle: 'Merci !', sentBody: 'Twiggli revient vers vous sous 24 heures avec le lien de paiement et votre bon.',
    error: 'Cela n’a pas fonctionné. Réessayez ou écrivez-nous à {email}.', close: 'Fermer',
    payNow: 'Payer maintenant · {amount}', payHint: 'Paiement sécurisé avec Stripe. Indiquez {amount} sur la page de paiement. Twiggli vous envoie ensuite le bon en PDF.',
    paidTitle: 'Paiement reçu, merci ! 🎁', paidBody: 'Twiggli vous envoie le bon en PDF sous 24 heures.',
    payLede: 'Dites-nous pour qui il est, puis payez en toute sécurité avec Stripe. Vous recevez le bon en PDF.',
    validAt: 'Valable 3 ans · chez {host}', validAny: 'Valable 3 ans · chez tous les hôtes participants',
    pageTitle: 'Bons cadeaux pour des ateliers à Berlin | Twiggli',
    pageDescription: 'Offrez du temps plutôt que des objets : un bon Twiggli de 25, 50, 75 € ou du montant de votre choix dès 20 €, valable 3 ans chez des créateurs berlinois.',
    kicker: 'Bons cadeaux', h1a: 'Offrez', h1em: 'du temps, pas des objets', lede: 'Un atelier avec un créateur berlinois : peindre, fabriquer, créer de ses mains. Valable 3 ans, et la personne choisit elle-même sa date.',
    cards: ['Un joli début', 'Le classique', 'Pour une occasion spéciale'], wishCard: 'Montant libre', wishFrom: 'dès 20 €', choose: 'Choisir',
    howTitle: 'Comment ça', howEm: 'marche',
    steps: ['Choisissez un montant', 'Twiggli envoie le lien + le PDF', 'La personne réserve chez le créateur de son choix'],
    stepsCopy: [
      '25, 50, 75 € ou un montant libre dès 20 €, avec un message personnel si vous voulez.',
      'Sous 24 heures, vous recevez le lien de paiement, puis le bon en PDF à imprimer ou à transférer.',
      'La personne réserve un atelier chez l’un des créateurs ci-dessous, quand elle veut dans les 3 ans.',
    ],
    hostsTitle: 'Où', hostsEm: 'l’utiliser', hostsSub: 'Les créateurs qui acceptent les bons Twiggli. D’autres arrivent.', perPerson: 'par personne', more: 'Voir l’atelier',
    facts: ['Valable 3 ans', 'PDF à imprimer ou transférer', 'Paiement par lien, sans compte'],
    teaserKicker: 'Idée cadeau pour Noël', teaserTitle: 'Offrez', teaserEm: 'du temps, pas des objets', teaserCopy: 'Un bon pour un atelier avec un créateur berlinois : valable 3 ans, en PDF à glisser sous le sapin.', teaserCta: 'Offrir un bon',
  },
  es: {
    nav: '🎁 Tarjetas regalo',
    give: '🎁 Regalar como vale', validNote: 'Vale válido 3 años',
    gift: '🎁 Regalar como vale',
    boxTitle: 'Regala', boxEm: 'esta experiencia', buy: 'Comprar vale', boxNote: 'Válido 3 años · en PDF',
    onePerson: '1 persona', nPeople: '{n} personas',
    badge: '🎁 Vale regalo', tileLink: '🎁 Regalar',
    formTitle: 'Regalar un vale', generalTitle: 'Vale regalo Twiggli',
    formLede: 'Cuéntanos para quién es. Twiggli te envía el enlace de pago y el vale en PDF. Todavía no pagas nada.',
    generalLede: 'Elige un importe: quien lo recibe elige el taller. Twiggli te envía el enlace de pago y el vale en PDF. Todavía no pagas nada.',
    people: 'Número de personas', amount: 'Importe', pick: 'Elige un importe', wish: 'Importe libre', wishHint: 'Desde 20 €',
    buyerName: 'Tu nombre', buyerEmail: 'Tu email', recipient: '¿Para quién es?', recipientEmail: 'Su email',
    message: 'Mensaje personal', messagePh: 'Unas palabras para el vale',
    delivery: 'Entrega', toMe: 'PDF por email a mí', toThem: 'Directamente a la persona',
    optional: 'opcional', send: 'Pedir el vale', sending: 'Enviando…',
    sentTitle: '¡Gracias!', sentBody: 'Twiggli te escribe en menos de 24 horas con el enlace de pago y tu vale.',
    error: 'No se ha podido enviar. Inténtalo de nuevo o escríbenos a {email}.', close: 'Cerrar',
    payNow: 'Pagar ahora · {amount}', payHint: 'Pago seguro con Stripe. Introduce {amount} en la página de pago. Después Twiggli te envía el vale en PDF.',
    paidTitle: '¡Pago recibido, gracias! 🎁', paidBody: 'Twiggli te envía el vale en PDF en menos de 24 horas.',
    payLede: 'Dinos para quién es y paga de forma segura con Stripe. Recibes el vale en PDF.',
    validAt: 'Válido 3 años · para {host}', validAny: 'Válido 3 años · con todos los anfitriones participantes',
    pageTitle: 'Vales regalo para talleres en Berlín | Twiggli',
    pageDescription: 'Regala tiempo, no cosas: un vale Twiggli de 25, 50, 75 € o el importe que quieras desde 20 €, válido 3 años con creadores de Berlín.',
    kicker: 'Vales regalo', h1a: 'Regala', h1em: 'tiempo, no cosas', lede: 'Un taller con un creador de Berlín: pintar, crear, hacer algo con tus propias manos. Válido 3 años, y quien lo recibe elige la fecha.',
    cards: ['Un bonito comienzo', 'El clásico', 'Para algo especial'], wishCard: 'Importe libre', wishFrom: 'desde 20 €', choose: 'Elegir',
    howTitle: 'Cómo', howEm: 'funciona',
    steps: ['Elige un importe', 'Twiggli envía enlace + PDF', 'Quien lo recibe reserva con el creador que quiera'],
    stepsCopy: [
      '25, 50, 75 € o un importe libre desde 20 €, con un mensaje personal si quieres.',
      'En menos de 24 horas recibes el enlace de pago y después el vale en PDF para imprimir o reenviar.',
      'Quien lo recibe reserva un taller con uno de los creadores de abajo, cuando quiera en los próximos 3 años.',
    ],
    hostsTitle: 'Dónde', hostsEm: 'canjearlo', hostsSub: 'Creadores que aceptan vales Twiggli. Se suman más.', perPerson: 'por persona', more: 'Ver el taller',
    facts: ['Válido 3 años', 'PDF para imprimir o reenviar', 'Pago por enlace, sin cuenta'],
    teaserKicker: 'Idea de regalo para Navidad', teaserTitle: 'Regala', teaserEm: 'tiempo, no cosas', teaserCopy: 'Un vale para un taller con un creador de Berlín: válido 3 años, en PDF para dejar bajo el árbol.', teaserCta: 'Regalar un vale',
  },
  it: {
    nav: '🎁 Buoni regalo',
    give: '🎁 Regalalo come buono', validNote: 'Buono valido 3 anni',
    gift: '🎁 Regalalo come buono',
    boxTitle: 'Regala', boxEm: 'questa esperienza', buy: 'Compra il buono', boxNote: 'Valido 3 anni · in PDF',
    onePerson: '1 persona', nPeople: '{n} persone',
    badge: '🎁 Buono regalo', tileLink: '🎁 Regala',
    formTitle: 'Regala un buono', generalTitle: 'Buono regalo Twiggli',
    formLede: 'Dicci per chi è. Twiggli ti manda il link di pagamento e il buono in PDF. Per ora non paghi nulla.',
    generalLede: 'Scegli un importo: chi lo riceve sceglie il workshop. Twiggli ti manda il link di pagamento e il buono in PDF. Per ora non paghi nulla.',
    people: 'Numero di persone', amount: 'Importo', pick: 'Scegli un importo', wish: 'Importo libero', wishHint: 'Da 20 €',
    buyerName: 'Il tuo nome', buyerEmail: 'La tua email', recipient: 'Per chi è?', recipientEmail: 'La sua email',
    message: 'Messaggio personale', messagePh: 'Qualche parola per il buono',
    delivery: 'Consegna', toMe: 'PDF via email a me', toThem: 'Direttamente alla persona',
    optional: 'facoltativo', send: 'Richiedi il buono', sending: 'Invio…',
    sentTitle: 'Grazie!', sentBody: 'Twiggli ti scrive entro 24 ore con il link di pagamento e il tuo buono.',
    error: 'Non è andata. Riprova o scrivici a {email}.', close: 'Chiudi',
    payNow: 'Paga ora · {amount}', payHint: 'Pagamento sicuro con Stripe. Inserisci {amount} nella pagina di pagamento. Poi Twiggli ti manda il buono in PDF.',
    paidTitle: 'Pagamento ricevuto, grazie! 🎁', paidBody: 'Twiggli ti manda il buono in PDF entro 24 ore.',
    payLede: 'Dicci per chi è, poi paga in sicurezza con Stripe. Ricevi il buono in PDF.',
    validAt: 'Valido 3 anni · per {host}', validAny: 'Valido 3 anni · presso tutti gli host aderenti',
    pageTitle: 'Buoni regalo per workshop a Berlino | Twiggli',
    pageDescription: 'Regala tempo, non cose: un buono Twiggli da 25, 50, 75 € o dell’importo che vuoi da 20 €, valido 3 anni presso maker berlinesi.',
    kicker: 'Buoni regalo', h1a: 'Regala', h1em: 'tempo, non cose', lede: 'Un workshop con un maker berlinese: dipingere, creare, fare qualcosa con le proprie mani. Valido 3 anni, e la data la sceglie chi lo riceve.',
    cards: ['Un bell’inizio', 'Il classico', 'Per qualcosa di speciale'], wishCard: 'Importo libero', wishFrom: 'da 20 €', choose: 'Scegli',
    howTitle: 'Come', howEm: 'funziona',
    steps: ['Scegli un importo', 'Twiggli manda link + PDF', 'Chi lo riceve prenota con il maker che preferisce'],
    stepsCopy: [
      '25, 50, 75 € o un importo libero da 20 €, con un messaggio personale se vuoi.',
      'Entro 24 ore ricevi il link di pagamento, poi il buono in PDF da stampare o inoltrare.',
      'Chi lo riceve prenota un workshop con uno dei maker qui sotto, quando vuole nei prossimi 3 anni.',
    ],
    hostsTitle: 'Dove', hostsEm: 'usarlo', hostsSub: 'I maker che accettano i buoni Twiggli. Altri si stanno aggiungendo.', perPerson: 'a persona', more: 'Vedi il workshop',
    facts: ['Valido 3 anni', 'PDF da stampare o inoltrare', 'Paghi con un link, senza account'],
    teaserKicker: 'Idea regalo per Natale', teaserTitle: 'Regala', teaserEm: 'tempo, non cose', teaserCopy: 'Un buono per un workshop con un maker berlinese: valido 3 anni, in PDF da mettere sotto l’albero.', teaserCta: 'Regala un buono',
  },
  nl: {
    nav: '🎁 Cadeaubonnen',
    give: '🎁 Geef het als cadeaubon', validNote: 'Cadeaubon 3 jaar geldig',
    gift: '🎁 Geef als cadeaubon',
    boxTitle: 'Geef', boxEm: 'deze ervaring', buy: 'Cadeaubon kopen', boxNote: '3 jaar geldig · als pdf',
    onePerson: '1 persoon', nPeople: '{n} personen',
    badge: '🎁 Cadeaubon', tileLink: '🎁 Cadeau geven',
    formTitle: 'Cadeaubon geven', generalTitle: 'Twiggli-cadeaubon',
    formLede: 'Vertel ons voor wie hij is. Twiggli stuurt je de betaallink en de cadeaubon als pdf. Je betaalt nog niets.',
    generalLede: 'Kies een bedrag: wie hem krijgt, kiest zelf de workshop. Twiggli stuurt je de betaallink en de cadeaubon als pdf. Je betaalt nog niets.',
    people: 'Aantal personen', amount: 'Bedrag', pick: 'Kies een bedrag', wish: 'Eigen bedrag', wishHint: 'Vanaf €20',
    buyerName: 'Je naam', buyerEmail: 'Je e-mail', recipient: 'Voor wie is hij?', recipientEmail: 'Diens e-mail',
    message: 'Persoonlijk bericht', messagePh: 'Een paar woorden voor op de bon',
    delivery: 'Bezorging', toMe: 'Pdf per e-mail naar mij', toThem: 'Direct naar de ontvanger',
    optional: 'optioneel', send: 'Cadeaubon aanvragen', sending: 'Bezig met verzenden…',
    sentTitle: 'Dank je!', sentBody: 'Twiggli neemt binnen 24 uur contact op met de betaallink en je cadeaubon.',
    error: 'Dat lukte niet. Probeer het opnieuw of mail ons op {email}.', close: 'Sluiten',
    payNow: 'Nu betalen · {amount}', payHint: 'Veilig betalen met Stripe. Vul op de betaalpagina {amount} in. Daarna stuurt Twiggli je de cadeaubon als pdf.',
    paidTitle: 'Betaling ontvangen, dank je! 🎁', paidBody: 'Twiggli stuurt je de cadeaubon binnen 24 uur als pdf.',
    payLede: 'Vertel ons voor wie hij is en betaal veilig met Stripe. Je krijgt de cadeaubon als pdf.',
    validAt: '3 jaar geldig · voor {host}', validAny: '3 jaar geldig · bij alle deelnemende makers',
    pageTitle: 'Cadeaubonnen voor workshops in Berlijn | Twiggli',
    pageDescription: 'Geef tijd in plaats van spullen: een Twiggli-cadeaubon van €25, €50, €75 of een eigen bedrag vanaf €20, 3 jaar geldig bij Berlijnse makers.',
    kicker: 'Cadeaubonnen', h1a: 'Geef', h1em: 'tijd in plaats van spullen', lede: 'Een workshop bij een Berlijnse maker: schilderen, maken, iets met je eigen handen doen. 3 jaar geldig, en de ontvanger kiest zelf de datum.',
    cards: ['Een mooi begin', 'De klassieker', 'Voor iets bijzonders'], wishCard: 'Eigen bedrag', wishFrom: 'vanaf €20', choose: 'Kiezen',
    howTitle: 'Zo', howEm: 'werkt het',
    steps: ['Kies een bedrag', 'Twiggli stuurt link + pdf', 'De ontvanger boekt bij een maker naar keuze'],
    stepsCopy: [
      '€25, €50, €75 of een eigen bedrag vanaf €20, desgewenst met een persoonlijk bericht.',
      'Binnen 24 uur krijg je de betaallink, daarna de cadeaubon als pdf om te printen of door te sturen.',
      'De ontvanger boekt een workshop bij een van de makers hieronder, wanneer hij wil in de komende 3 jaar.',
    ],
    hostsTitle: 'Hier', hostsEm: 'inwisselbaar', hostsSub: 'Makers die Twiggli-cadeaubonnen aannemen. Er komen er steeds meer bij.', perPerson: 'per persoon', more: 'Naar de workshop',
    facts: ['3 jaar geldig', 'Pdf om te printen of door te sturen', 'Betalen via link, zonder account'],
    teaserKicker: 'Cadeau-idee voor kerst', teaserTitle: 'Geef', teaserEm: 'tijd in plaats van spullen', teaserCopy: 'Een cadeaubon voor een workshop bij een Berlijnse maker: 3 jaar geldig, als pdf voor onder de boom.', teaserCta: 'Cadeaubon geven',
  },
  pl: {
    nav: '🎁 Bony podarunkowe',
    give: '🎁 Podaruj jako bon', validNote: 'Bon ważny 3 lata',
    gift: '🎁 Podaruj jako bon',
    boxTitle: 'Podaruj', boxEm: 'to przeżycie', buy: 'Kup bon', boxNote: 'Ważny 3 lata · jako PDF',
    onePerson: '1 osoba', nPeople: 'Osoby: {n}',
    badge: '🎁 Bon', tileLink: '🎁 Podaruj',
    formTitle: 'Podaruj bon', generalTitle: 'Bon podarunkowy Twiggli',
    formLede: 'Napisz, dla kogo jest bon. Twiggli wyśle ci link do płatności i bon w PDF. Na razie nic nie płacisz.',
    generalLede: 'Wybierz kwotę: osoba obdarowana sama wybierze warsztat. Twiggli wyśle ci link do płatności i bon w PDF. Na razie nic nie płacisz.',
    people: 'Liczba osób', amount: 'Kwota', pick: 'Wybierz kwotę', wish: 'Własna kwota', wishHint: 'Od 20 €',
    buyerName: 'Twoje imię', buyerEmail: 'Twój e-mail', recipient: 'Dla kogo?', recipientEmail: 'E-mail obdarowanej osoby',
    message: 'Osobista wiadomość', messagePh: 'Kilka słów na bon',
    delivery: 'Dostawa', toMe: 'PDF e-mailem do mnie', toThem: 'Bezpośrednio do obdarowanej osoby',
    optional: 'opcjonalnie', send: 'Poproś o bon', sending: 'Wysyłanie…',
    sentTitle: 'Dziękujemy!', sentBody: 'Twiggli odezwie się w ciągu 24 godzin z linkiem do płatności i twoim bonem.',
    error: 'Nie udało się. Spróbuj ponownie lub napisz do nas na {email}.', close: 'Zamknij',
    payNow: 'Zapłać teraz · {amount}', payHint: 'Bezpieczna płatność przez Stripe. Wpisz {amount} na stronie płatności. Potem Twiggli wyśle ci bon w PDF.',
    paidTitle: 'Płatność otrzymana, dziękujemy! 🎁', paidBody: 'Twiggli wyśle ci bon w PDF w ciągu 24 godzin.',
    payLede: 'Powiedz nam, dla kogo jest bon, a potem zapłać bezpiecznie przez Stripe. Bon dostaniesz w PDF.',
    validAt: 'Ważny 3 lata · u {host}', validAny: 'Ważny 3 lata · u wszystkich uczestniczących twórców',
    pageTitle: 'Bony podarunkowe na warsztaty w Berlinie | Twiggli',
    pageDescription: 'Podaruj czas, nie rzeczy: bon Twiggli na 25, 50, 75 € lub dowolną kwotę od 20 €, ważny 3 lata u berlińskich twórców.',
    kicker: 'Bony podarunkowe', h1a: 'Podaruj', h1em: 'czas, nie rzeczy', lede: 'Warsztat u berlińskiego twórcy: malowanie, rękodzieło, tworzenie własnymi rękami. Ważny 3 lata, a termin wybiera osoba obdarowana.',
    cards: ['Piękny początek', 'Klasyka', 'Na coś wyjątkowego'], wishCard: 'Własna kwota', wishFrom: 'od 20 €', choose: 'Wybierz',
    howTitle: 'Jak to', howEm: 'działa',
    steps: ['Wybierz kwotę', 'Twiggli wysyła link + PDF', 'Obdarowana osoba rezerwuje u wybranego twórcy'],
    stepsCopy: [
      '25, 50, 75 € lub własna kwota od 20 €, jeśli chcesz z osobistą wiadomością.',
      'W ciągu 24 godzin dostajesz link do płatności, a potem bon w PDF do wydruku lub przesłania dalej.',
      'Obdarowana osoba rezerwuje warsztat u jednego z twórców poniżej, kiedy chce w ciągu 3 lat.',
    ],
    hostsTitle: 'Gdzie', hostsEm: 'go wykorzystać', hostsSub: 'Twórcy, którzy przyjmują bony Twiggli. Dołączają kolejni.', perPerson: 'za osobę', more: 'Zobacz warsztat',
    facts: ['Ważny 3 lata', 'PDF do wydruku lub przesłania', 'Płatność przez link, bez konta'],
    teaserKicker: 'Pomysł na prezent świąteczny', teaserTitle: 'Podaruj', teaserEm: 'czas, nie rzeczy', teaserCopy: 'Bon na warsztat u berlińskiego twórcy: ważny 3 lata, jako PDF pod choinkę.', teaserCta: 'Podaruj bon',
  },
  tr: {
    nav: '🎁 Hediye çekleri',
    give: '🎁 Hediye çeki olarak ver', validNote: 'Hediye çeki 3 yıl geçerli',
    gift: '🎁 Hediye çeki olarak ver',
    boxTitle: 'Bu deneyimi', boxEm: 'hediye et', buy: 'Hediye çeki al', boxNote: '3 yıl geçerli · PDF olarak',
    onePerson: '1 kişi', nPeople: '{n} kişi',
    badge: '🎁 Hediye çeki', tileLink: '🎁 Hediye et',
    formTitle: 'Hediye çeki ver', generalTitle: 'Twiggli hediye çeki',
    formLede: 'Kimin için olduğunu yaz. Twiggli sana ödeme bağlantısını ve hediye çekini PDF olarak gönderir. Şimdilik bir şey ödemiyorsun.',
    generalLede: 'Bir tutar seç: hediye edilen kişi atölyeyi kendisi seçer. Twiggli sana ödeme bağlantısını ve hediye çekini PDF olarak gönderir. Şimdilik bir şey ödemiyorsun.',
    people: 'Kişi sayısı', amount: 'Tutar', pick: 'Bir tutar seç', wish: 'İstediğin tutar', wishHint: '20 €’dan itibaren',
    buyerName: 'Adın', buyerEmail: 'E-postan', recipient: 'Kimin için?', recipientEmail: 'Onun e-postası',
    message: 'Kişisel mesaj', messagePh: 'Hediye çeki için birkaç söz',
    delivery: 'Gönderim', toMe: 'PDF bana e-postayla', toThem: 'Doğrudan hediye edilen kişiye',
    optional: 'isteğe bağlı', send: 'Hediye çeki iste', sending: 'Gönderiliyor…',
    sentTitle: 'Teşekkürler!', sentBody: 'Twiggli 24 saat içinde ödeme bağlantısı ve hediye çekinle sana dönecek.',
    error: 'Gönderilemedi. Lütfen tekrar dene ya da bize {email} adresinden yaz.', close: 'Kapat',
    payNow: 'Şimdi öde · {amount}', payHint: 'Stripe ile güvenli ödeme. Ödeme sayfasında {amount} gir. Ardından Twiggli hediye çekini PDF olarak gönderir.',
    paidTitle: 'Ödeme alındı, teşekkürler! 🎁', paidBody: 'Twiggli hediye çekini 24 saat içinde PDF olarak gönderir.',
    payLede: 'Kimin için olduğunu söyle, ardından Stripe ile güvenle öde. Hediye çekini PDF olarak alırsın.',
    validAt: '3 yıl geçerli · {host} için', validAny: '3 yıl geçerli · katılan tüm ev sahiplerinde',
    pageTitle: 'Berlin’de atölyeler için hediye çekleri | Twiggli',
    pageDescription: 'Eşya değil zaman hediye et: 25, 50, 75 € ya da 20 €’dan başlayan istediğin tutarda, Berlinli üreticilerde 3 yıl geçerli bir Twiggli hediye çeki.',
    kicker: 'Hediye çekleri', h1a: 'Eşya değil', h1em: 'zaman hediye et', lede: 'Berlinli bir üreticiyle bir atölye: resim yapmak, el işi, kendi ellerinle bir şey üretmek. 3 yıl geçerli, tarihi hediye edilen kişi seçer.',
    cards: ['Güzel bir başlangıç', 'Klasik', 'Özel bir şey için'], wishCard: 'İstediğin tutar', wishFrom: '20 €’dan itibaren', choose: 'Seç',
    howTitle: 'Nasıl', howEm: 'işliyor',
    steps: ['Bir tutar seç', 'Twiggli bağlantı + PDF gönderir', 'Hediye edilen kişi istediği üreticide rezervasyon yapar'],
    stepsCopy: [
      '25, 50, 75 € ya da 20 €’dan başlayan istediğin tutar; istersen kişisel bir mesajla.',
      '24 saat içinde ödeme bağlantısını, ardından yazdırmak ya da iletmek için PDF hediye çekini alırsın.',
      'Hediye edilen kişi, önümüzdeki 3 yıl içinde dilediği zaman aşağıdaki üreticilerden birinde atölye ayırtır.',
    ],
    hostsTitle: 'Nerede', hostsEm: 'kullanılır', hostsSub: 'Twiggli hediye çeki kabul eden üreticiler. Yenileri katılıyor.', perPerson: 'kişi başı', more: 'Atölyeye git',
    facts: ['3 yıl geçerli', 'Yazdırmak ya da iletmek için PDF', 'Bağlantıyla ödeme, hesap gerekmez'],
    teaserKicker: 'Yılbaşı hediye fikri', teaserTitle: 'Eşya değil', teaserEm: 'zaman hediye et', teaserCopy: 'Berlinli bir üreticiyle bir atölye için hediye çeki: 3 yıl geçerli, ağacın altına koymak için PDF olarak.', teaserCta: 'Hediye çeki ver',
  },
};
