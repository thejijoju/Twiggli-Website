/** The Christmas team-party page (ChristmasPartyPage.astro), English and
 *  German. The workshops are real hosts with their own group sizes, lengths
 *  and group prices from content.ts; this file only names each one for the
 *  season and picks its picture (a 4:3 still from scripts/mail-crops.sh). */
export const christmasPicks = [
  { slug: 'galleria-lucia', image: 'galleria-lucia-dipdye' },
  { slug: 'qian', image: 'qian' },
  { slug: 'jem', image: 'jem-sushi' },
  { slug: 'evelyn', image: 'evelyn' },
  { slug: 'karen-rose', image: 'karen-rose-seife' },
  { slug: 'angelo', image: 'angelo' },
] as const;

export interface ChristmasCopy {
  title: string; description: string;
  kicker: string; h1: string; h1Hand: string; lede: string;
  facts: string[]; cta: string; seeWorkshops: string; free: string; freeNote: string;
  pickedTitle: string; pickedSub: string;
  picks: { title: string; tag: string }[];
  people: (min: number, max: number) => string; hours: (min: number, max: number) => string;
  perPerson: (price: string) => string; from: string; onRequest: string; ask: string; moreHosts: string;
  howTitle: string; steps: { title: string; copy: string }[];
  formTitle: string; formLede: string; bullets: string[];
  company: string; name: string; email: string; emailPh: string; phone: string; optional: string;
  date: string; size: string; sizePh: string; where: string; whereOptions: string[];
  workshop: string; notSure: string; budget: string; budgetPh: string; message: string; messagePh: string;
  send: string; sending: string; sentTitle: string; sentBody: string; error: string;
  banner: string; bannerCta: string;
}

const fmtRange = (min: number, max: number, unit: string, locale = 'en-GB') => {
  const n = (x: number) => x.toLocaleString(locale);
  return min === max ? `${n(min)} ${unit}` : `${n(min)}–${n(max)} ${unit}`;
};

export const christmasCopy: Record<'en' | 'de', ChristmasCopy> = {
  en: {
    title: 'Christmas party workshops for teams in Berlin | Twiggli',
    description: 'Private workshops for your team’s Christmas party in Berlin: candles, pottery, sushi, printing and more, for 6 to 1,000 people. Options and a quote within 24 hours.',
    kicker: 'Christmas party 2026',
    h1: 'Your team’s Christmas party,', h1Hand: 'made by hand',
    lede: 'Private workshops for teams of 6 to 1,000 in Berlin: candles, pottery, sushi, embroidery, coffee. At the studio, your office or a venue. Tell us your date and group size, and we’ll come back within 24 hours with options and a quote.',
    facts: ['6–1,000 people', '2–4 hours', 'from €45 per person', 'one invoice', 'English & German'],
    cta: 'Get a quote', seeWorkshops: 'See the workshops', free: 'Free to ask', freeNote: 'No commitment until you confirm a date.',
    pickedTitle: 'Workshops teams love',
    pickedSub: 'All run privately for your group. Group prices per person, from the hosts themselves.',
    picks: [
      { title: 'Dip-dye candles', tag: 'Christmas favourite' },
      { title: 'Tea & pottery', tag: 'Calm & cosy' },
      { title: 'Sushi & kimchi night', tag: 'Big groups' },
      { title: 'Embroidery & textile printing', tag: 'For big teams' },
      { title: 'Natural soap & cosmetics', tag: 'Gifts to take home' },
      { title: 'Roast your own coffee', tag: 'For coffee lovers' },
    ],
    people: (min, max) => (min <= 1 ? `up to ${max}` : fmtRange(min, max, 'people')),
    hours: (min, max) => fmtRange(min, max, 'h'),
    perPerson: (price) => `${price} pp`, from: 'from ', onRequest: 'price on request',
    ask: 'Ask for this one', moreHosts: 'See all hosts for groups',
    howTitle: 'How it works',
    steps: [
      { title: 'Tell us date & group size', copy: 'Two minutes, no commitment. A rough budget helps.' },
      { title: 'Get 2–3 options within 24 h', copy: 'Hand-picked workshops that fit your team, with a fixed price per person.' },
      { title: 'We handle the rest', copy: 'Booking, host and materials, and one invoice for your company.' },
    ],
    formTitle: 'Plan your Christmas party',
    formLede: 'December Fridays fill up first. Send us your request and we’ll come back within 24 hours.',
    bullets: ['Teams from 6 to 1,000, with several hosts for big groups', 'At the studio, your office or a venue', 'Drinks and snacks can be added', 'One invoice for your company'],
    company: 'Company', name: 'Your name', email: 'Work email', emailPh: 'you@company.com', phone: 'Phone', optional: 'optional',
    date: 'Preferred date', size: 'Group size', sizePh: 'e.g. 18', where: 'Where',
    whereOptions: ['At a studio', 'Our office', 'Not sure yet'],
    workshop: 'Workshop', notSure: 'Not sure yet, suggest something',
    budget: 'Budget per person', budgetPh: 'e.g. €60–80', message: 'Anything else', messagePh: 'Times, dietary needs, a theme…',
    send: 'Get my quote', sending: 'Sending…',
    sentTitle: 'Thank you!', sentBody: 'We have your request and will send you options and a quote within 24 hours.',
    error: 'That didn’t go through. Please try again, or write to us at {email}.',
    banner: 'Planning the team Christmas party? Private workshops for 6 to 1,000 people.', bannerCta: 'See Christmas ideas',
  },
  de: {
    title: 'Weihnachtsfeier mit Workshop für Teams in Berlin | Twiggli',
    description: 'Private Workshops für eure Weihnachtsfeier in Berlin: Kerzen, Töpfern, Sushi, Sticken und mehr, für 6 bis 1.000 Personen. Vorschläge und Angebot innerhalb von 24 Stunden.',
    kicker: 'Weihnachtsfeier 2026',
    h1: 'Eure Weihnachtsfeier,', h1Hand: 'selbst gemacht',
    lede: 'Private Workshops für Teams von 6 bis 1.000 Personen in Berlin: Kerzen, Töpfern, Sushi, Sticken, Kaffee. Im Studio, bei euch im Büro oder in einer Location. Nennt uns Datum und Gruppengröße, und wir melden uns innerhalb von 24 Stunden mit Vorschlägen und einem Angebot.',
    facts: ['6–1.000 Personen', '2–4 Stunden', 'ab 45 € pro Person', 'eine Rechnung', 'Deutsch & Englisch'],
    cta: 'Angebot anfragen', seeWorkshops: 'Workshops ansehen', free: 'Unverbindlich', freeNote: 'Erst wenn ihr einen Termin bestätigt, ist es fest.',
    pickedTitle: 'Workshops, die Teams lieben',
    pickedSub: 'Alle privat für eure Gruppe. Gruppenpreise pro Person, direkt von den Gastgebern.',
    picks: [
      { title: 'Kerzen färben (Dip-Dye)', tag: 'Weihnachtsliebling' },
      { title: 'Tee & Töpfern', tag: 'Ruhig & gemütlich' },
      { title: 'Sushi- & Kimchi-Abend', tag: 'Große Gruppen' },
      { title: 'Sticken & Textildruck', tag: 'Für große Teams' },
      { title: 'Naturseife & Kosmetik', tag: 'Geschenke zum Mitnehmen' },
      { title: 'Kaffee selbst rösten', tag: 'Für Kaffeefans' },
    ],
    people: (min, max) => (min <= 1 ? `bis ${max} Pers.` : fmtRange(min, max, 'Pers.')),
    hours: (min, max) => fmtRange(min, max, 'Std.', 'de-DE'),
    perPerson: (price) => `${price} p. P.`, from: 'ab ', onRequest: 'Preis auf Anfrage',
    ask: 'Diesen anfragen', moreHosts: 'Alle Gastgeber für Gruppen ansehen',
    howTitle: 'So funktioniert’s',
    steps: [
      { title: 'Datum & Gruppengröße nennen', copy: 'Zwei Minuten, unverbindlich. Ein grobes Budget hilft uns.' },
      { title: '2–3 Vorschläge in 24 Std.', copy: 'Passende Workshops für euer Team, mit Festpreis pro Person.' },
      { title: 'Wir kümmern uns um den Rest', copy: 'Buchung, Gastgeber und Material, und eine Rechnung für eure Firma.' },
    ],
    formTitle: 'Plant eure Weihnachtsfeier',
    formLede: 'Die Freitage im Dezember sind zuerst weg. Schickt uns eure Anfrage, wir melden uns innerhalb von 24 Stunden.',
    bullets: ['Teams von 6 bis 1.000 Personen, bei großen Gruppen mit mehreren Hosts', 'Im Studio, bei euch im Büro oder in einer Location', 'Getränke und Snacks auf Wunsch', 'Eine Rechnung für eure Firma'],
    company: 'Firma', name: 'Dein Name', email: 'Geschäftliche E-Mail', emailPh: 'du@firma.de', phone: 'Telefon', optional: 'optional',
    date: 'Wunschtermin', size: 'Gruppengröße', sizePh: 'z. B. 18', where: 'Wo',
    whereOptions: ['In einem Studio', 'Bei uns im Büro', 'Noch offen'],
    workshop: 'Workshop', notSure: 'Noch offen, macht uns Vorschläge',
    budget: 'Budget pro Person', budgetPh: 'z. B. 60–80 €', message: 'Sonst noch etwas', messagePh: 'Uhrzeit, Essenswünsche, ein Motto…',
    send: 'Angebot anfragen', sending: 'Wird gesendet…',
    sentTitle: 'Danke!', sentBody: 'Eure Anfrage ist bei uns. Ihr bekommt innerhalb von 24 Stunden Vorschläge und ein Angebot.',
    error: 'Das hat nicht geklappt. Versucht es bitte noch einmal oder schreibt uns an {email}.',
    banner: 'Weihnachtsfeier in Planung? Private Workshops für 6 bis 1.000 Personen.', bannerCta: 'Ideen ansehen',
  },
};
