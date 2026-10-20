/** The hen party page (HenPartyPage.astro): JGA in German at /de/jga/,
 *  hen party in English at /jga/. Like the Christmas page, the workshops are
 *  real hosts with group sizes and prices from content.ts; a pick can carry
 *  its own price or area where the host's general one does not fit (Pia's
 *  vulva painting has its own €40 ticket). */
export const henPicks: { slug: string; image: string; price?: number; area?: string }[] = [
  { slug: 'pia', image: 'pia-vulva', price: 40, area: 'Friedrichshain' },
  { slug: 'munio', image: 'munio' },
  { slug: 'galleria-lucia', image: 'galleria-lucia-dipdye' },
  { slug: 'celina', image: 'celina' },
  { slug: 'karen-rose', image: 'karen-rose-naturkosmetik' },
  { slug: 'qian', image: 'qian' },
  { slug: 'jem', image: 'jem-sushi' },
  { slug: 'rebeca', image: 'rebeca' },
  { slug: 'maximiliana', image: 'maximiliana' },
];

export interface HenCopy {
  title: string; description: string;
  kicker: string; h1: string; h1Hand: string; lede: string;
  facts: string[]; cta: string; seeWorkshops: string; free: string; freeNote: string;
  pickedTitle: string; pickedSub: string;
  picks: { title: string; tag: string }[];
  people: (min: number, max: number) => string; hours: (min: number, max: number) => string;
  perPerson: (price: string) => string; from: string; onRequest: string; ask: string; moreHosts: string;
  whyTitle: string; why: { title: string; copy: string }[];
  howTitle: string; steps: { title: string; copy: string }[];
  formTitle: string; formLede: string; bullets: string[];
  bride: string; name: string; email: string; emailPh: string; phone: string; optional: string;
  date: string; size: string; sizePh: string; workshop: string; notSure: string;
  budget: string; budgetPh: string; message: string; messagePh: string;
  send: string; sending: string; sentTitle: string; sentBody: string; error: string;
  faqTitle: string; faq: { q: string; a: string }[];
}

const fmtRange = (min: number, max: number, unit: string, locale = 'en-GB') => {
  const n = (x: number) => x.toLocaleString(locale);
  return min === max ? `${n(min)} ${unit}` : `${n(min)}–${n(max)} ${unit}`;
};

export const henCopy: Record<'en' | 'de', HenCopy> = {
  de: {
    title: 'JGA Berlin: Workshop-Ideen für den Junggesellinnenabschied | Twiggli',
    description: 'Die schönsten JGA-Ideen in Berlin: Vulva Painting, Kerzen gießen, Töpfern, Naturkosmetik, Sushi und mehr. Private Workshops für 4 bis 20 Mädels, Vorschläge innerhalb von 24 Stunden.',
    kicker: 'JGA in Berlin',
    h1: 'Ein JGA, über den ihr noch lange redet,', h1Hand: 'mit Herz & Händen',
    lede: 'Statt Bauchladen und Kneipentour: ein privater Workshop nur für euch. Malen, Kerzen gießen, Töpfern oder Kosmetik rühren, mit Sekt, Musik und ganz viel Lachen. Am Ende nimmt jede etwas Selbstgemachtes mit nach Hause, und die Braut sowieso.',
    facts: ['4–20 Personen', '2–3 Stunden', 'ab 40 € pro Person', 'privat nur für euch', 'Sekt mitbringen erlaubt*'],
    cta: 'JGA anfragen', seeWorkshops: 'Ideen ansehen', free: 'Unverbindlich anfragen', freeNote: 'Erst wenn ihr den Termin bestätigt, ist es fest.',
    pickedTitle: 'Unsere Top-Ideen für euren JGA',
    pickedSub: 'Alle privat für eure Gruppe, mit echten Berliner Maker*innen. Preise pro Person, direkt von den Gastgeberinnen.',
    picks: [
      { title: 'Vulva Painting', tag: 'Der JGA-Hit' },
      { title: 'Kerzen mit getrockneten Blumen', tag: 'Romantisch' },
      { title: 'Kerzen färben (Dip-Dye)', tag: 'Bunt & fotogen' },
      { title: 'Mosaik oder Drink & Paint im Atelier', tag: 'Eigenes Atelier' },
      { title: 'Naturkosmetik & Seife rühren', tag: 'Wellness-Vibes' },
      { title: 'Tee & Töpfern', tag: 'Ruhig & gemütlich' },
      { title: 'Sushi-Abend', tag: 'Für Genießerinnen' },
      { title: 'Linoldruck & Porträtmalerei', tag: 'Kreativ & locker' },
      { title: 'Aquarell & Vögel skizzieren', tag: 'Entspannt' },
    ],
    people: (min, max) => (min <= 1 ? `bis ${max} Pers.` : fmtRange(min, max, 'Pers.')),
    hours: (min, max) => fmtRange(min, max, 'Std.', 'de-DE'),
    perPerson: (price) => `${price} p. P.`, from: 'ab ', onRequest: 'Preis auf Anfrage',
    ask: 'Diesen anfragen', moreHosts: 'Alle Workshops in Berlin ansehen',
    whyTitle: 'Warum ein Workshop zum JGA?',
    why: [
      { title: 'Alle machen mit', copy: 'Ob Schwester, Schwiegermutter oder beste Freundin aus Schulzeiten: Beim gemeinsamen Gestalten kommt jede ins Gespräch, ganz ohne Peinlich-Spiele.' },
      { title: 'Ein Andenken für immer', copy: 'Kerze, Tasse, Bild oder Seife: Jede nimmt etwas mit, und die Braut bekommt eine Erinnerung an den Tag, die nicht im Handy verschwindet.' },
      { title: 'Ganz privat', copy: 'Der Raum gehört euch. Sekt, Snacks, Deko und eure Playlist sind bei vielen Gastgeberinnen willkommen.' },
    ],
    howTitle: 'So einfach geht’s',
    steps: [
      { title: 'Datum & Gruppengröße nennen', copy: 'Zwei Minuten, unverbindlich. Sag uns gern, was die Braut mag.' },
      { title: '2–3 Vorschläge in 24 Std.', copy: 'Passende Workshops mit Festpreis pro Person.' },
      { title: 'Feiern!', copy: 'Ihr bucht direkt bei der Gastgeberin, wir helfen bei allen Fragen.' },
    ],
    formTitle: 'Plant euren JGA',
    formLede: 'Samstage im Frühling und Sommer sind schnell weg. Schick uns deine Anfrage, wir melden uns innerhalb von 24 Stunden mit Vorschlägen.',
    bullets: ['Für 4 bis 20 Personen, größere Gruppen auf Anfrage', 'Im Atelier oder bei euch zu Hause / in der Ferienwohnung', 'Sekt, Snacks und Deko oft willkommen*', 'Auch als Überraschung für die Braut'],
    bride: 'Name der Braut', name: 'Dein Name', email: 'E-Mail', emailPh: 'du@beispiel.de', phone: 'Telefon', optional: 'optional',
    date: 'Wunschtermin', size: 'Gruppengröße', sizePh: 'z. B. 8', workshop: 'Workshop', notSure: 'Noch offen, macht uns Vorschläge',
    budget: 'Budget pro Person', budgetPh: 'z. B. 40–60 €', message: 'Sonst noch etwas', messagePh: 'Uhrzeit, Motto, was die Braut liebt…',
    send: 'JGA anfragen', sending: 'Wird gesendet…',
    sentTitle: 'Danke, wie schön!', sentBody: 'Deine Anfrage ist bei uns. Du bekommst innerhalb von 24 Stunden Vorschläge für euren JGA.',
    error: 'Das hat nicht geklappt. Versuch es bitte noch einmal oder schreib uns an {email}.',
    faqTitle: 'Häufige Fragen zum JGA in Berlin',
    faq: [
      { q: 'Was kann man beim JGA in Berlin machen?', a: 'Sehr beliebt sind kreative Workshops nur für eure Gruppe: Vulva Painting, Kerzen gießen, Töpfern, Naturkosmetik rühren, Malen oder ein Sushi-Abend. Das ist entspannter als eine Kneipentour, alle machen mit und jede nimmt etwas Selbstgemachtes mit nach Hause.' },
      { q: 'Was kostet ein JGA-Workshop?', a: 'Die meisten Workshops kosten zwischen 40 und 70 € pro Person, Material inklusive. Den genauen Preis bekommt ihr mit unseren Vorschlägen innerhalb von 24 Stunden.' },
      { q: 'Für wie viele Personen?', a: 'Die meisten Gastgeberinnen nehmen Gruppen von 4 bis 20 Personen. Für größere Runden finden wir passende Workshops oder teilen die Gruppe auf.' },
      { q: 'Dürfen wir Sekt und Snacks mitbringen?', a: 'Bei vielen Gastgeberinnen ja. Wir sagen euch bei jedem Vorschlag, was erlaubt ist.' },
      { q: 'Wie früh sollten wir buchen?', a: 'Für Samstage im Frühling und Sommer am besten 6 bis 8 Wochen vorher. Unter der Woche oder im Winter geht es oft auch kurzfristig.' },
      { q: 'Geht das auch auf Englisch?', a: 'Ja, viele Workshops gibt es auf Deutsch und Englisch, ideal für internationale Freundinnen.' },
    ],
  },
  en: {
    title: 'Hen party in Berlin: creative workshop ideas | Twiggli',
    description: 'The best hen party ideas in Berlin: vulva painting, candle making, pottery, natural cosmetics, sushi and more. Private workshops for 4 to 20 friends, ideas within 24 hours.',
    kicker: 'Hen party in Berlin',
    h1: 'A hen party you’ll all remember,', h1Hand: 'made with love',
    lede: 'Skip the pub crawl: a private workshop just for your group. Painting, candle making, pottery or mixing your own cosmetics, with bubbly, music and lots of laughs. Everyone takes something handmade home, the bride included.',
    facts: ['4–20 people', '2–3 hours', 'from €40 per person', 'private for your group', 'bring the bubbly*'],
    cta: 'Plan our hen party', seeWorkshops: 'See the ideas', free: 'Free to ask', freeNote: 'Nothing is fixed until you confirm a date.',
    pickedTitle: 'Our top hen party ideas',
    pickedSub: 'All private for your group, with real Berlin makers. Prices per person, straight from the hosts.',
    picks: [
      { title: 'Vulva painting', tag: 'The hen party hit' },
      { title: 'Candles with dried flowers', tag: 'Romantic' },
      { title: 'Dip-dye candles', tag: 'Colourful & photogenic' },
      { title: 'Mosaic or drink & paint at the studio', tag: 'Your own studio' },
      { title: 'Natural cosmetics & soap', tag: 'Spa vibes' },
      { title: 'Tea & pottery', tag: 'Calm & cosy' },
      { title: 'Sushi night', tag: 'For foodies' },
      { title: 'Linocut & portrait painting', tag: 'Creative & relaxed' },
      { title: 'Watercolour bird sketching', tag: 'Laid-back' },
    ],
    people: (min, max) => (min <= 1 ? `up to ${max}` : fmtRange(min, max, 'people')),
    hours: (min, max) => fmtRange(min, max, 'h'),
    perPerson: (price) => `${price} pp`, from: 'from ', onRequest: 'price on request',
    ask: 'Ask for this one', moreHosts: 'See all workshops in Berlin',
    whyTitle: 'Why a workshop for the hen party?',
    why: [
      { title: 'Everyone joins in', copy: 'Sister, mother-in-law or best friend from school: making something together gets everyone talking, no awkward games needed.' },
      { title: 'A keepsake forever', copy: 'A candle, a mug, a painting or soap: everyone takes something home, and the bride gets a memory that doesn’t disappear into a phone.' },
      { title: 'Completely private', copy: 'The room is yours. Bubbly, snacks, decorations and your playlist are welcome at many hosts.' },
    ],
    howTitle: 'How it works',
    steps: [
      { title: 'Tell us date & group size', copy: 'Two minutes, no commitment. Tell us what the bride loves.' },
      { title: 'Get 2–3 ideas within 24 h', copy: 'Workshops that fit, with a fixed price per person.' },
      { title: 'Celebrate!', copy: 'You book directly with the host, and we help with any questions.' },
    ],
    formTitle: 'Plan your hen party',
    formLede: 'Spring and summer Saturdays go fast. Send us your request and we’ll come back within 24 hours with ideas.',
    bullets: ['For 4 to 20 people, bigger groups on request', 'At the studio or at your place / holiday flat', 'Bubbly, snacks and decorations often welcome*', 'Works as a surprise for the bride too'],
    bride: 'Bride’s name', name: 'Your name', email: 'Email', emailPh: 'you@example.com', phone: 'Phone', optional: 'optional',
    date: 'Preferred date', size: 'Group size', sizePh: 'e.g. 8', workshop: 'Workshop', notSure: 'Not sure yet, suggest something',
    budget: 'Budget per person', budgetPh: 'e.g. €40–60', message: 'Anything else', messagePh: 'Time, theme, what the bride loves…',
    send: 'Plan our hen party', sending: 'Sending…',
    sentTitle: 'Thank you, how lovely!', sentBody: 'We have your request and will send you ideas for your hen party within 24 hours.',
    error: 'That didn’t go through. Please try again, or write to us at {email}.',
    faqTitle: 'Hen party in Berlin: questions & answers',
    faq: [
      { q: 'What can you do for a hen party in Berlin?', a: 'Private creative workshops are a favourite: vulva painting, candle making, pottery, mixing natural cosmetics, painting or a sushi night. More relaxed than a pub crawl, everyone joins in and takes something handmade home.' },
      { q: 'How much does a hen party workshop cost?', a: 'Most workshops cost between €40 and €70 per person, materials included. You get the exact price with our ideas within 24 hours.' },
      { q: 'How many people can join?', a: 'Most hosts take groups of 4 to 20. For bigger groups we find the right workshop or split the group.' },
      { q: 'Can we bring bubbly and snacks?', a: 'At many hosts, yes. We tell you with each idea what is allowed.' },
      { q: 'How early should we book?', a: 'For spring and summer Saturdays, ideally 6 to 8 weeks ahead. Weekdays and winter dates often work at short notice.' },
      { q: 'Is it in English?', a: 'Yes, many workshops run in English and German, ideal for international friends.' },
    ],
  },
};
