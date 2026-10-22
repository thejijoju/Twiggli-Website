/** The Twiggli Club waitlist (ClubPage.astro): /club/ in English and
 *  /de/club/ in German. The club is not open yet, so the page says only
 *  what is decided: €59 a month, one workshop a month with a Berlin maker,
 *  the printed Twiggli Letter by post, and members-only evenings. No date,
 *  no offers — the waitlist hears first. */

export interface ClubCopy {
  title: string; description: string;
  kicker: string; h1: string; h1Hand: string; lede: string[];
  cta: string; letterLabel: string; sealLabel: string;
  insideTitle: string; inside: { title: string; copy: string }[];
  price: string; priceNote: string;
  formTitle: string; formLede: string;
  firstName: string; optional: string; email: string; emailPh: string;
  send: string; sending: string; consent: string;
  sentTitle: string; sentBody: string; sentBodyNamed: string; error: string;
  faqTitle: string; faq: { q: string; a: string }[];
  /** The flat lay of a letter's contents (public/img/club/club-letter.jpg). */
  letterAlt: string; letterCaption: string;
  /** The small links elsewhere on the site. */
  teaser: string; teaserLink: string; footerSoon: string;
  /** The pop-up on the other pages (ClubPopup.astro). */
  popup: { kicker: string; line: string; bullets: string[]; price: string; send: string; more: string; close: string };
}

export const clubCopy: Record<'en' | 'de', ClubCopy> = {
  en: {
    title: 'Twiggli Club: a members’ club in Berlin, opening soon | Twiggli',
    description: 'The Twiggli Club opens soon: one workshop a month with a Berlin maker, The Twiggli Letter by post and members-only evenings. €59 a month. Leave your email and we’ll write to you first.',
    kicker: 'Soon · Members only',
    h1: 'Twiggli Club',
    h1Hand: 'Something is growing quietly.',
    lede: ['A members’ club for curious hands.', 'Small. Warm. A little secret.', 'Soon we open the doors.'],
    cta: 'Tell me when it opens',
    letterLabel: 'The Twiggli Letter',
    sealLabel: 'An envelope closed with a Twiggli wax seal',
    insideTitle: 'Behind the door',
    inside: [
      { title: '1 workshop a month', copy: 'Once a month, a workshop with a Berlin maker.' },
      { title: 'The Twiggli Letter, by post', copy: 'A printed letter, every month, in your letterbox.' },
      { title: 'Evenings for members only', copy: 'Exclusive events, just for the club.' },
    ],
    price: '€59 a month',
    priceNote: 'Workshop, letter and members’ evenings included.',
    formTitle: 'Your invitation',
    formLede: 'Leave your email. On the day the doors open, you hear it first.',
    firstName: 'First name', optional: 'optional', email: 'Email', emailPh: 'you@example.com',
    send: 'Tell me when it opens', sending: 'Sending…',
    consent: 'We only use your email to tell you about the club.',
    sentTitle: 'You’re on the list.',
    sentBody: 'Thank you. When the doors open, we’ll write to you first.',
    sentBodyNamed: 'Thank you, {name}. When the doors open, we’ll write to you first.',
    error: 'That didn’t go through, so we’ve opened it in your mail app. Or write to us at {email}.',
    faqTitle: 'Quietly asked',
    faq: [
      { q: 'What is the Twiggli Club?', a: 'A members’ club: one workshop a month with a Berlin maker, The Twiggli Letter printed and sent to you by post every month, and exclusive members-only events.' },
      { q: 'What does it cost?', a: '€59 a month. That covers the monthly workshop, The Twiggli Letter and the members’ evenings.' },
      { q: 'When does it start?', a: 'Soon. Leave your email and we’ll write to you first.' },
    ],
    letterAlt: 'The contents of a Twiggli Letter laid out on paper: a painted art card of Berlin at dusk, a matching postcard and bookmark, a sheet of art stickers and the letter itself, beside a purple envelope with a wax seal.',
    letterCaption: 'Every month: an art card, stickers and a letter from us.',
    teaser: 'Something is growing quietly.',
    teaserLink: 'Twiggli Club',
    footerSoon: 'soon',
    popup: {
      kicker: 'Twiggli Club · Soon',
      line: 'Something is growing quietly. Want to be the first to know?',
      bullets: ['1 workshop a month', 'The Twiggli Letter by post', 'Evenings for members only'],
      price: '€59 a month',
      send: 'Tell me when it opens',
      more: 'Find out more',
      close: 'Close',
    },
  },
  de: {
    title: 'Twiggli Club: ein Club für Mitglieder in Berlin, bald | Twiggli',
    description: 'Der Twiggli Club öffnet bald: ein Workshop im Monat mit einem Berliner Maker, der Twiggli-Brief per Post und Abende nur für Mitglieder. 59 € im Monat. Trag dich ein, wir schreiben dir zuerst.',
    kicker: 'Bald · Nur für Mitglieder',
    h1: 'Twiggli Club',
    h1Hand: 'Etwas wächst im Verborgenen.',
    lede: ['Ein Club für neugierige Hände.', 'Klein. Warm. Ein bisschen geheim.', 'Bald öffnen wir die Türen.'],
    cta: 'Sag mir Bescheid, wenn es losgeht',
    letterLabel: 'Der Twiggli-Brief',
    sealLabel: 'Ein Umschlag mit einem Twiggli-Wachssiegel',
    insideTitle: 'Hinter der Tür',
    inside: [
      { title: '1 Workshop im Monat', copy: 'Einmal im Monat ein Workshop mit einem Berliner Maker.' },
      { title: 'Der Twiggli-Brief per Post', copy: 'Jeden Monat ein gedruckter Brief in deinem Briefkasten.' },
      { title: 'Abende nur für Mitglieder', copy: 'Exklusive Events, nur für den Club.' },
    ],
    price: '59 € im Monat',
    priceNote: 'Workshop, Brief und Mitgliederabende inklusive.',
    formTitle: 'Deine Einladung',
    formLede: 'Lass uns deine E-Mail da. Wenn sich die Türen öffnen, erfährst du es zuerst.',
    firstName: 'Vorname', optional: 'optional', email: 'E-Mail', emailPh: 'du@beispiel.de',
    send: 'Sag mir Bescheid, wenn es losgeht', sending: 'Wird gesendet…',
    consent: 'Wir nutzen deine E-Mail nur, um dir vom Club zu erzählen.',
    sentTitle: 'Du stehst auf der Liste.',
    sentBody: 'Danke. Wenn sich die Türen öffnen, schreiben wir dir zuerst.',
    sentBodyNamed: 'Danke, {name}. Wenn sich die Türen öffnen, schreiben wir dir zuerst.',
    error: 'Das hat nicht geklappt, deshalb haben wir es in deinem Mailprogramm geöffnet. Oder schreib uns an {email}.',
    faqTitle: 'Leise gefragt',
    faq: [
      { q: 'Was ist der Twiggli Club?', a: 'Ein Club für Mitglieder: ein Workshop im Monat mit einem Berliner Maker, jeden Monat der Twiggli-Brief gedruckt per Post und exklusive Events nur für Mitglieder.' },
      { q: 'Was kostet er?', a: '59 € im Monat. Darin stecken der monatliche Workshop, der Twiggli-Brief und die Mitgliederabende.' },
      { q: 'Wann geht es los?', a: 'Bald. Trag dich ein, wir schreiben dir zuerst.' },
    ],
    letterAlt: 'Der Inhalt eines Twiggli-Briefs auf Papier ausgebreitet: eine gemalte Kunstkarte von Berlin in der Abenddämmerung, passende Postkarte und Lesezeichen, ein Bogen Kunst-Sticker und der Brief selbst, neben einem lila Umschlag mit Wachssiegel.',
    letterCaption: 'Jeden Monat: eine Kunstkarte, Sticker und ein Brief von uns.',
    teaser: 'Etwas wächst im Verborgenen.',
    teaserLink: 'Twiggli Club',
    footerSoon: 'bald',
    popup: {
      kicker: 'Twiggli Club · Bald',
      line: 'Etwas wächst im Verborgenen. Willst du es als Erste:r wissen?',
      bullets: ['1 Workshop im Monat', 'Der Twiggli-Brief per Post', 'Abende nur für Mitglieder'],
      price: '59 € im Monat',
      send: 'Sag mir Bescheid',
      more: 'Mehr erfahren',
      close: 'Schließen',
    },
  },
};
