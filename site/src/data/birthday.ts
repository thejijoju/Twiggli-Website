import type { HenCopy } from './henParty.ts';

/** The birthday page (HenPartyPage.astro with occasion="birthday"):
 *  /de/birthday/ and /birthday/. Same build as the hen party page: real
 *  hosts with their group sizes and prices from content.ts. Made so that
 *  private groups see Twiggli is for them too, not only for companies
 *  (Jirel, 26.10). */
export const birthdayPicks: { slug: string; image: string; price?: number; area?: string }[] = [
  { slug: 'ceramic-kingdom', image: 'ceramic-kingdom' },
  { slug: 'munio', image: 'munio' },
  { slug: 'studio32', image: 'studio32' },
  { slug: 'tufttuft', image: 'tufttuft' },
  { slug: 'galleria-lucia', image: 'galleria-lucia-dipdye' },
  { slug: 'jem', image: 'jem-sushi' },
  { slug: 'druckrausch', image: 'druckrausch' },
  { slug: 'celina', image: 'celina' },
  { slug: 'angelo', image: 'angelo-roesten' },
];

const fmtRange = (min: number, max: number, unit: string, locale = 'en-GB') => {
  const n = (x: number) => x.toLocaleString(locale);
  return min === max ? `${n(min)} ${unit}` : `${n(min)}–${n(max)} ${unit}`;
};

export const birthdayCopy: Record<'en' | 'de', HenCopy> = {
  de: {
    title: 'Geburtstag feiern in Berlin: Workshop-Ideen für deine Gruppe | Twiggli',
    description: 'Geburtstag in Berlin mal anders: Töpfern, Kerzen gießen, Kochen, Tuften, Sushi und mehr. Private Workshops für 4 bis 20 Gäste, Vorschläge innerhalb von 24 Stunden.',
    kicker: 'Geburtstag in Berlin',
    h1: 'Ein Geburtstag, an den sich alle erinnern,', h1Hand: 'selbst gemacht',
    lede: 'Statt Restaurant und Bar: ein privater Workshop nur für dich und deine Leute. Töpfern, Kerzen gießen, zusammen kochen oder einen Teppich tuften. Alle machen mit, ihr lacht viel, und jede und jeder nimmt etwas Selbstgemachtes mit nach Hause.',
    facts: ['4–20 Personen', '2–3 Stunden', 'privat nur für euch', 'für Erwachsene & Kinder', 'auf Deutsch oder Englisch'],
    cta: 'Geburtstag anfragen', seeWorkshops: 'Ideen ansehen', free: 'Unverbindlich anfragen', freeNote: 'Erst wenn ihr den Termin bestätigt, ist es fest.',
    pickedTitle: 'Unsere Lieblingsideen für deinen Geburtstag',
    pickedSub: 'Alle privat für eure Gruppe, mit echten Berliner Maker*innen. Preise pro Person, direkt von den Gastgeber*innen.',
    picks: [
      { title: 'Töpfern an der Drehscheibe', tag: 'Der Klassiker' },
      { title: 'Kerzen mit getrockneten Blumen', tag: 'Gemütlich' },
      { title: 'Zusammen kochen & backen', tag: 'Für Genießer*innen' },
      { title: 'Teppich tuften', tag: 'Etwas ganz Neues' },
      { title: 'Kerzen färben (Dip-Dye)', tag: 'Bunt & fotogen' },
      { title: 'Sushi-Abend', tag: 'Lecker' },
      { title: 'Siebdruck auf T-Shirts', tag: 'Zum Anziehen' },
      { title: 'Mosaik oder Drink & Paint im Atelier', tag: 'Eigenes Atelier' },
      { title: 'Kaffee selbst rösten', tag: 'Für Kaffeefans' },
    ],
    people: (min, max) => (min <= 1 ? `bis ${max} Pers.` : fmtRange(min, max, 'Pers.')),
    hours: (min, max) => fmtRange(min, max, 'Std.', 'de-DE'),
    perPerson: (price) => `${price} p. P.`, from: 'ab ', onRequest: 'Preis auf Anfrage',
    ask: 'Diesen anfragen', moreHosts: 'Alle Workshops in Berlin ansehen',
    whyTitle: 'Warum ein Workshop zum Geburtstag?',
    why: [
      { title: 'Alle kommen ins Gespräch', copy: 'Freund*innen von früher, Kolleg*innen, Familie: Beim gemeinsamen Gestalten lernen sich alle ganz nebenbei kennen.' },
      { title: 'Ein Andenken statt Kater', copy: 'Tasse, Kerze, Shirt oder Teppich: Alle nehmen etwas mit, das noch lange an den Tag erinnert.' },
      { title: 'Ganz privat', copy: 'Der Raum gehört euch. Kuchen, Getränke und eure Playlist sind bei vielen Gastgeber*innen willkommen.' },
    ],
    howTitle: 'So einfach geht’s',
    steps: [
      { title: 'Datum & Gruppengröße nennen', copy: 'Zwei Minuten, unverbindlich. Sag uns gern, was das Geburtstagskind mag.' },
      { title: '2–3 Vorschläge in 24 Std.', copy: 'Passende Workshops mit Festpreis pro Person.' },
      { title: 'Feiern!', copy: 'Ihr bucht über uns, wir helfen bei allen Fragen.' },
    ],
    formTitle: 'Plant deinen Geburtstag',
    formLede: 'Wochenenden sind schnell weg. Schick uns deine Anfrage, wir melden uns innerhalb von 24 Stunden mit Vorschlägen.',
    bullets: ['Für 4 bis 20 Personen, größere Gruppen auf Anfrage', 'Im Atelier oder bei euch', 'Kuchen und Getränke oft willkommen*', 'Auch als Überraschung'],
    bride: 'Name des Geburtstagskinds', name: 'Dein Name', email: 'E-Mail', emailPh: 'du@beispiel.de', phone: 'Telefon', optional: 'optional',
    date: 'Wunschtermin', size: 'Gruppengröße', sizePh: 'z. B. 8', workshop: 'Workshop', notSure: 'Noch offen, macht uns Vorschläge',
    budget: 'Budget pro Person', budgetPh: 'z. B. 40–60 €', message: 'Sonst noch etwas', messagePh: 'Uhrzeit, Alter, was das Geburtstagskind liebt…',
    send: 'Geburtstag anfragen', sending: 'Wird gesendet…',
    sentTitle: 'Danke, wie schön!', sentBody: 'Deine Anfrage ist bei uns. Du bekommst innerhalb von 24 Stunden Vorschläge für deinen Geburtstag.',
    error: 'Das hat nicht geklappt. Versuch es bitte noch einmal oder schreib uns an {email}.',
    faqTitle: 'Häufige Fragen zum Geburtstag in Berlin',
    faq: [
      { q: 'Was kann man zum Geburtstag in Berlin machen?', a: 'Sehr beliebt sind private kreative Workshops: Töpfern, Kerzen gießen, zusammen kochen, Teppich tuften, Siebdruck oder ein Sushi-Abend. Alle machen mit, und jede und jeder nimmt etwas Selbstgemachtes mit nach Hause.' },
      { q: 'Was kostet ein Geburtstags-Workshop?', a: 'Die meisten Workshops kosten zwischen 40 und 90 € pro Person, Material inklusive. Den genauen Preis bekommt ihr mit unseren Vorschlägen innerhalb von 24 Stunden.' },
      { q: 'Für wie viele Personen?', a: 'Die meisten Gastgeber*innen nehmen Gruppen von 4 bis 20 Personen. Für größere Runden finden wir passende Workshops oder teilen die Gruppe auf.' },
      { q: 'Geht das auch für Kindergeburtstage?', a: 'Ja, einige Gastgeber*innen bieten Workshops für Kinder an. Schreib uns das Alter in die Anfrage, dann schlagen wir Passendes vor.' },
      { q: 'Wie früh sollten wir buchen?', a: 'Für Wochenenden am besten 3 bis 4 Wochen vorher. Unter der Woche geht es oft auch kurzfristig.' },
      { q: 'Kann man auch einen Gutschein verschenken?', a: 'Ja, mit einem Twiggli-Gutschein kann das Geburtstagskind sich selbst einen Workshop aussuchen.' },
    ],
  },
  en: {
    title: 'Birthday party in Berlin: creative workshop ideas | Twiggli',
    description: 'Celebrate your birthday in Berlin differently: pottery, candle making, cooking, tufting, sushi and more. Private workshops for 4 to 20 guests, ideas within 24 hours.',
    kicker: 'Birthday in Berlin',
    h1: 'A birthday everyone will remember,', h1Hand: 'handmade',
    lede: 'Skip the restaurant and bar: a private workshop just for you and your people. Pottery, candle making, cooking together or tufting a rug. Everyone joins in, you laugh a lot, and everyone takes something handmade home.',
    facts: ['4–20 people', '2–3 hours', 'private for your group', 'for adults & kids', 'in English or German'],
    cta: 'Plan my birthday', seeWorkshops: 'See the ideas', free: 'Free to ask', freeNote: 'Nothing is fixed until you confirm a date.',
    pickedTitle: 'Our favourite birthday ideas',
    pickedSub: 'All private for your group, with real Berlin makers. Prices per person, straight from the hosts.',
    picks: [
      { title: 'Pottery on the wheel', tag: 'The classic' },
      { title: 'Candles with dried flowers', tag: 'Cosy' },
      { title: 'Cooking & baking together', tag: 'For foodies' },
      { title: 'Rug tufting', tag: 'Something new' },
      { title: 'Dip-dye candles', tag: 'Colourful & photogenic' },
      { title: 'Sushi night', tag: 'Delicious' },
      { title: 'Screen printing on T-shirts', tag: 'To wear' },
      { title: 'Mosaic or drink & paint at the studio', tag: 'Your own studio' },
      { title: 'Roast your own coffee', tag: 'For coffee lovers' },
    ],
    people: (min, max) => (min <= 1 ? `up to ${max}` : fmtRange(min, max, 'people')),
    hours: (min, max) => fmtRange(min, max, 'h'),
    perPerson: (price) => `${price} pp`, from: 'from ', onRequest: 'price on request',
    ask: 'Ask for this one', moreHosts: 'See all workshops in Berlin',
    whyTitle: 'Why a workshop for your birthday?',
    why: [
      { title: 'Everyone gets talking', copy: 'Old friends, colleagues, family: making something together gets everyone chatting, no small talk needed.' },
      { title: 'A keepsake, not a hangover', copy: 'A mug, a candle, a shirt or a rug: everyone takes home something that reminds them of the day.' },
      { title: 'Completely private', copy: 'The room is yours. Cake, drinks and your playlist are welcome at many hosts.' },
    ],
    howTitle: 'How it works',
    steps: [
      { title: 'Tell us date & group size', copy: 'Two minutes, no commitment. Tell us what the birthday person loves.' },
      { title: 'Get 2–3 ideas within 24 h', copy: 'Workshops that fit, with a fixed price per person.' },
      { title: 'Celebrate!', copy: 'You book through us, and we help with any questions.' },
    ],
    formTitle: 'Plan your birthday',
    formLede: 'Weekends go fast. Send us your request and we’ll come back within 24 hours with ideas.',
    bullets: ['For 4 to 20 people, bigger groups on request', 'At the studio or at your place', 'Cake and drinks often welcome*', 'Works as a surprise too'],
    bride: 'Birthday person’s name', name: 'Your name', email: 'Email', emailPh: 'you@example.com', phone: 'Phone', optional: 'optional',
    date: 'Preferred date', size: 'Group size', sizePh: 'e.g. 8', workshop: 'Workshop', notSure: 'Not sure yet, suggest something',
    budget: 'Budget per person', budgetPh: 'e.g. €40–60', message: 'Anything else', messagePh: 'Time, age, what the birthday person loves…',
    send: 'Plan my birthday', sending: 'Sending…',
    sentTitle: 'Thank you, how lovely!', sentBody: 'We have your request and will send you birthday ideas within 24 hours.',
    error: 'That didn’t go through. Please try again, or write to us at {email}.',
    faqTitle: 'Birthday in Berlin: questions & answers',
    faq: [
      { q: 'What can you do for a birthday in Berlin?', a: 'Private creative workshops are a favourite: pottery, candle making, cooking together, rug tufting, screen printing or a sushi night. Everyone joins in and takes something handmade home.' },
      { q: 'How much does a birthday workshop cost?', a: 'Most workshops cost between €40 and €90 per person, materials included. You get the exact price with our ideas within 24 hours.' },
      { q: 'How many people can join?', a: 'Most hosts take groups of 4 to 20. For bigger groups we find the right workshop or split the group.' },
      { q: 'Do you do kids’ birthdays?', a: 'Yes, some hosts run workshops for children. Tell us their age in your request and we’ll suggest what fits.' },
      { q: 'How early should we book?', a: 'For weekends, ideally 3 to 4 weeks ahead. Weekdays often work at short notice.' },
      { q: 'Can I give a voucher instead?', a: 'Yes, with a Twiggli voucher the birthday person can pick their own workshop.' },
    ],
  },
};
