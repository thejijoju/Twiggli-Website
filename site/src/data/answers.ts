/** Pages that answer the questions people put to ChatGPT and other
 *  assistants word for word: "what can I do in Berlin today / tonight /
 *  tomorrow / this weekend", "how do I make friends in Berlin", "date night
 *  ideas in Berlin". Each page opens with a direct answer built from the
 *  real dates, then lists them, then a short FAQ (marked up as FAQPage).
 *  The site rebuilds every morning, so "today" is always today.
 *  English and German only, like the blog. */
import type { Lang } from '../lib/url.ts';
import { LANG_META, href } from '../lib/url.ts';
import { berlinTodayMs, getSessions, type Session } from './sessions.ts';

export type AnswerKind = 'today' | 'tonight' | 'tomorrow' | 'weekend' | 'friends' | 'date-night';
export const ANSWERS: AnswerKind[] = ['today', 'tonight', 'tomorrow', 'weekend', 'friends', 'date-night'];
export const ANSWER_LANGS: Lang[] = ['en', 'de'];

const PATH: Record<AnswerKind, string> = {
  today: '/today/',
  tonight: '/tonight/',
  tomorrow: '/tomorrow/',
  weekend: '/this-weekend/',
  friends: '/make-friends-in-berlin/',
  'date-night': '/date-night-berlin/',
};
export const answerHref = (lang: Lang, kind: AnswerKind): string => href(lang, PATH[kind]);

const EVENING = '17:00';
const dayMs = 86400000;
const weekdayOf = (offset: number): number => new Date(berlinTodayMs() + offset * dayMs).getUTCDay();

/** The offsets of this weekend: Friday from 17:00, Saturday and Sunday —
 *  or, on a Sunday, just today. */
export const weekendOffsets = (): { friday?: number; days: number[] } => {
  const dow = weekdayOf(0);
  if (dow === 0) return { days: [0] };
  if (dow === 6) return { days: [0, 1] };
  const sat = 6 - dow;
  return { friday: sat - 1, days: [sat, sat + 1] };
};

const evening = (s: Session) => s.time !== undefined && s.time >= EVENING;

/** One date per host, soonest first: a list of ideas, not a timetable. */
const onePerHost = (list: Session[], max: number): Session[] => {
  const seen = new Set<string>();
  const out: Session[] = [];
  for (const s of list) {
    if (seen.has(s.host.slug)) continue;
    seen.add(s.host.slug);
    out.push(s);
    if (out.length === max) break;
  }
  return out;
};

export function answerSessions(kind: AnswerKind, lang: Lang): Session[] {
  const all = getSessions(lang);
  const adults = all.filter((s) => !s.kids);
  switch (kind) {
    case 'today':
      return all.filter((s) => s.dayOffset === 0);
    case 'tonight':
      return adults.filter((s) => s.dayOffset === 0 && evening(s));
    case 'tomorrow':
      return all.filter((s) => s.dayOffset === 1);
    case 'weekend': {
      const w = weekendOffsets();
      return all.filter((s) => w.days.includes(s.dayOffset) || (s.dayOffset === w.friday && evening(s)));
    }
    case 'friends':
      // Open classes where you sit at a shared table with strangers: hosts
      // who take more than a handful, in the next two weeks.
      return onePerHost(adults.filter((s) => s.dayOffset <= 14 && s.host.groupRange[1] >= 6), 12);
    case 'date-night':
      // Evenings and weekend afternoons, for two.
      return onePerHost(
        adults.filter((s) => s.dayOffset <= 21 && (evening(s) || [0, 6].includes(weekdayOf(s.dayOffset)))),
        12,
      );
  }
}

/** For "tonight" with nothing on: tomorrow evening instead. */
export const tomorrowEvening = (lang: Lang): Session[] =>
  getSessions(lang).filter((s) => !s.kids && s.dayOffset === 1 && evening(s));

const longDate = (offset: number, lang: Lang): string =>
  new Date(berlinTodayMs() + offset * dayMs).toLocaleDateString(LANG_META[lang].locale, {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
  });

const priceNumbers = (list: Session[]): number[] =>
  list.flatMap((s) => [...(s.price ?? '').matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => Number(m[0].replace(',', '.'))))
    .filter((n) => n > 0);

/** The cheapest price, as "€12" / "12 €": "from €12 per person" reads
 *  better than a span stretched by one private session. */
const fromPrice = (list: Session[], lang: Lang): string | undefined => {
  const p = priceNumbers(list);
  if (!p.length) return undefined;
  const lo = Math.round(Math.min(...p));
  return lang === 'de' ? `${lo} €` : `€${lo}`;
};

/** "Linocut with Rebeca (18:30, €45)" — the first few, as examples. */
const examples = (list: Session[], lang: Lang, n = 3): string => {
  const with_ = lang === 'de' ? 'mit' : 'with';
  const items = onePerHost(list, n).map((s) => {
    const bits = [s.time, s.price].filter(Boolean).join(', ');
    return `${s.title} ${with_} ${s.host.firstName ?? s.host.name}${bits ? ` (${bits})` : ''}`;
  });
  if (items.length < 2) return items.join('');
  const and = lang === 'de' ? ' und ' : ' and ';
  return `${items.slice(0, -1).join(', ')}${and}${items[items.length - 1]}`;
};

const hostCount = (list: Session[]) => new Set(list.map((s) => s.host.slug)).size;

export type Faq = { q: string; a: string };
export type AnswerCopy = {
  title: string;
  h1: string;
  short: string;
  description: string;
  /** The direct answer, first thing on the page. */
  answer: string;
  faq: Faq[];
  empty: string;
};

const requestNote: Record<'en' | 'de', string> = {
  en: 'Every date has a Request button: a short form, nothing to pay until the host confirms your place by email.',
  de: 'Jeder Termin hat einen Anfragen-Button: ein kurzes Formular, bezahlt wird erst, wenn die Gastgeberin oder der Gastgeber deinen Platz per E-Mail bestätigt.',
};

export function answerCopy(kind: AnswerKind, lang: Lang, list: Session[]): AnswerCopy {
  const de = lang === 'de';
  const n = list.length;
  const h = hostCount(list);
  const r = fromPrice(list, lang);
  // Examples for grown-ups first; a kids' drop-in is not what most askers mean.
  const ex = examples([...list.filter((s) => !s.kids), ...list.filter((s) => s.kids)], lang);
  const req = requestNote[de ? 'de' : 'en'];
  const groups = de
    ? 'Für eine private Gruppe (Freunde, Team, JGA, Geburtstag) gibt es auch Termine auf Anfrage, an fast jedem Tag.'
    : 'For a private group (friends, a team, a hen party, a birthday) hosts also run workshops on request, on almost any day.';
  const today = longDate(0, lang);
  const tomorrow = longDate(1, lang);

  switch (kind) {
    case 'today': {
      const answer = n
        ? de
          ? `Heute, ${today}, gibt es ${n} Workshops in Berlin, die du noch anfragen kannst, bei ${h} Gastgeber*innen${r ? `, ab ${r} pro Person` : ''}. Zum Beispiel: ${ex}.`
          : `Today, ${today}, there are ${n} workshops in Berlin you can still request, with ${h} hosts${r ? `, from ${r} per person` : ''}. For example: ${ex}.`
        : de
          ? `Heute, ${today}, stehen keine offenen Workshop-Termine mehr im Kalender. Morgen und am Wochenende gibt es wieder welche.`
          : `Today, ${today}, there are no open workshop dates left on the calendar. There are more tomorrow and at the weekend.`;
      return {
        title: de ? `Was kann ich heute in Berlin machen? Workshops am ${today}` : `What to do in Berlin today: workshops on ${today}`,
        h1: de ? `Was kann ich heute in Berlin machen?` : `What can I do in Berlin today?`,
        short: de ? 'Heute' : 'Today',
        description: de
          ? `Kreative Workshops in Berlin heute, ${today}: Töpfern, Malen, Kerzen, Kochen und mehr, mit Uhrzeit, Preis und Ort. Täglich aktualisiert.`
          : `Creative workshops in Berlin today, ${today}: pottery, painting, candle making, cooking and more, with times, prices and places. Updated every day.`,
        answer,
        empty: de ? 'Heute sind keine offenen Termine mehr frei.' : 'No open dates left for today.',
        faq: [
          { q: de ? 'Was kann ich heute in Berlin machen?' : 'What can I do in Berlin today?', a: `${answer} ${req}` },
          { q: de ? 'Kann ich noch für heute buchen?' : 'Can I still book for today?',
            a: de ? `Ja, solange der Termin hier steht. ${req} Manche Gastgeber*innen schließen die Buchung ein paar Stunden vor Beginn.` : `Yes, as long as the date is listed here. ${req} Some hosts close bookings a few hours before the start.` },
          { q: de ? 'Gibt es heute etwas für eine Gruppe?' : 'Is there something for a group today?', a: groups },
        ],
      };
    }
    case 'tonight': {
      const answer = n
        ? de
          ? `Heute Abend, ${today}, gibt es ${n} Workshops ab 17 Uhr in Berlin${r ? `, ab ${r} pro Person` : ''}: ${ex}.`
          : `Tonight, ${today}, there are ${n} workshops in Berlin from 5 pm${r ? `, from ${r} per person` : ''}: ${ex}.`
        : de
          ? `Heute Abend stehen keine offenen Workshops mehr im Kalender. Morgen Abend gibt es wieder welche, siehe unten.`
          : `There are no open workshops left on the calendar tonight. There are more tomorrow evening, see below.`;
      return {
        title: de ? 'Was kann ich heute Abend in Berlin machen? Workshops heute Abend' : 'What to do in Berlin tonight: evening workshops today',
        h1: de ? 'Was kann ich heute Abend in Berlin machen?' : 'What can I do in Berlin tonight?',
        short: de ? 'Heute Abend' : 'Tonight',
        description: de
          ? `Workshops heute Abend in Berlin (${today}): Malen, Töpfern, Tastings und mehr ab 17 Uhr, mit Preis und Ort.`
          : `Workshops in Berlin tonight (${today}): painting, pottery, tastings and more from 5 pm, with prices and places.`,
        answer,
        empty: de ? 'Heute Abend sind keine offenen Termine mehr frei.' : 'No open dates left tonight.',
        faq: [
          { q: de ? 'Was kann ich heute Abend in Berlin machen?' : 'What can I do in Berlin tonight?', a: `${answer} ${req}` },
          { q: de ? 'Ist das auch etwas für ein Date?' : 'Is it a good idea for a date?',
            a: de ? 'Ja: Ihr macht zusammen etwas mit den Händen und nehmt etwas mit nach Hause. Mehr Ideen findest du bei den Date-Ideen für Berlin.' : 'Yes: you make something together with your hands and take it home. There are more ideas on the date night page.' },
          { q: de ? 'Gibt es heute Abend etwas für eine Gruppe?' : 'Is there something for a group tonight?', a: groups },
        ],
      };
    }
    case 'tomorrow': {
      const answer = n
        ? de
          ? `Morgen, ${tomorrow}, gibt es ${n} Workshops in Berlin bei ${h} Gastgeber*innen${r ? `, ab ${r} pro Person` : ''}. Zum Beispiel: ${ex}.`
          : `Tomorrow, ${tomorrow}, there are ${n} workshops in Berlin with ${h} hosts${r ? `, from ${r} per person` : ''}. For example: ${ex}.`
        : de
          ? `Für morgen, ${tomorrow}, stehen noch keine offenen Termine im Kalender.`
          : `There are no open dates on the calendar for tomorrow, ${tomorrow}, yet.`;
      return {
        title: de ? `Was kann ich morgen in Berlin machen? Workshops am ${tomorrow}` : `What to do in Berlin tomorrow: workshops on ${tomorrow}`,
        h1: de ? 'Was kann ich morgen in Berlin machen?' : 'What can I do in Berlin tomorrow?',
        short: de ? 'Morgen' : 'Tomorrow',
        description: de
          ? `Kreative Workshops in Berlin morgen, ${tomorrow}: mit Uhrzeit, Preis und Ort. Täglich aktualisiert.`
          : `Creative workshops in Berlin tomorrow, ${tomorrow}: with times, prices and places. Updated every day.`,
        answer,
        empty: de ? 'Für morgen sind noch keine Termine eingetragen.' : 'No dates for tomorrow yet.',
        faq: [
          { q: de ? 'Was kann ich morgen in Berlin machen?' : 'What can I do in Berlin tomorrow?', a: `${answer} ${req}` },
          { q: de ? 'Gibt es morgen etwas für eine Gruppe?' : 'Is there something for a group tomorrow?', a: groups },
        ],
      };
    }
    case 'weekend': {
      const w = weekendOffsets();
      const span = `${longDate(w.friday ?? w.days[0], lang)} – ${longDate(w.days[w.days.length - 1], lang)}`;
      const answer = n
        ? de
          ? `Dieses Wochenende (${span}) gibt es ${n} Workshops in Berlin bei ${h} Gastgeber*innen${r ? `, ab ${r} pro Person` : ''}, inklusive Freitagabend. Zum Beispiel: ${ex}.`
          : `This weekend (${span}) there are ${n} workshops in Berlin with ${h} hosts${r ? `, from ${r} per person` : ''}, Friday evening included. For example: ${ex}.`
        : de
          ? `Für dieses Wochenende stehen noch keine offenen Termine im Kalender.`
          : `There are no open dates on the calendar for this weekend yet.`;
      return {
        title: de ? 'Was kann ich dieses Wochenende in Berlin machen? Workshops am Wochenende' : 'What to do in Berlin this weekend: workshops Friday to Sunday',
        h1: de ? 'Was kann ich dieses Wochenende in Berlin machen?' : 'What can I do in Berlin this weekend?',
        short: de ? 'Dieses Wochenende' : 'This weekend',
        description: de
          ? `Workshops in Berlin dieses Wochenende (${span}): Töpfern, Malen, Kerzen, Kochen und mehr, mit Uhrzeit, Preis und Ort.`
          : `Workshops in Berlin this weekend (${span}): pottery, painting, candle making, cooking and more, with times, prices and places.`,
        answer,
        empty: de ? 'Für dieses Wochenende sind noch keine Termine eingetragen.' : 'No dates for this weekend yet.',
        faq: [
          { q: de ? 'Was kann ich dieses Wochenende in Berlin machen?' : 'What can I do in Berlin this weekend?', a: `${answer} ${req}` },
          { q: de ? 'Was kann ich am Wochenende drinnen machen, wenn es regnet?' : 'What can I do indoors at the weekend if it rains?',
            a: de ? 'Fast alle Workshops finden drinnen in den Ateliers und Studios der Gastgeber*innen statt. Nur Spaziergänge wie Zeichentouren oder Kräuterwanderungen sind draußen, das steht dann beim Workshop.' : 'Nearly all workshops take place indoors, in the hosts’ own studios. Only walks, like sketching walks or foraging, are outdoors, and the workshop says so.' },
          { q: de ? 'Gibt es am Wochenende etwas für eine Gruppe?' : 'Is there something for a group at the weekend?', a: groups },
        ],
      };
    }
    case 'friends': {
      const answer = de
        ? `Am leichtesten lernt man in Berlin Leute kennen, wenn man zusammen etwas macht. In einem Workshop sitzt du mit anderen am selben Tisch, die Hände sind beschäftigt, und das Gespräch kommt von allein. Hier sind ${n} offene Workshops der nächsten zwei Wochen, bei denen du allein hingehen kannst${r ? ` (ab ${r} pro Person)` : ''}.`
        : `The easiest way to make friends in Berlin is to do something together. In a workshop you sit at the same table as other people, your hands are busy, and the conversation comes by itself. Here are ${n} open workshops in the next two weeks that you can go to on your own${r ? ` (from ${r} per person)` : ''}.`;
      return {
        title: de ? 'Leute kennenlernen in Berlin: Workshops, zu denen du allein gehen kannst' : 'How to make friends in Berlin: workshops you can go to alone',
        h1: de ? 'Wie lerne ich in Berlin neue Leute kennen?' : 'How do I make friends in Berlin?',
        short: de ? 'Leute kennenlernen' : 'Make friends',
        description: de
          ? 'Neu in Berlin oder einfach Lust auf neue Leute? Offene kreative Workshops, zu denen du allein gehen kannst: Töpfern, Malen, Kochen, mit echten Terminen und Preisen.'
          : 'New in Berlin, or just want to meet people? Open creative workshops you can go to on your own: pottery, painting, cooking, with real dates and prices.',
        answer,
        empty: de ? 'Gerade sind keine offenen Termine im Kalender.' : 'No open dates on the calendar right now.',
        faq: [
          { q: de ? 'Wie lerne ich in Berlin neue Leute kennen?' : 'How do I make friends in Berlin?', a: answer },
          { q: de ? 'Kann ich allein zu einem Workshop gehen?' : 'Can I go to a workshop on my own?',
            a: de ? 'Ja, bei offenen Workshops kommen viele allein. Du buchst einen einzelnen Platz und sitzt mit den anderen Teilnehmenden zusammen.' : 'Yes, many people come alone to open workshops. You book a single place and sit together with the other guests.' },
          { q: de ? 'Gibt es Workshops auf Englisch?' : 'Are there workshops in English?',
            a: de ? 'Ja, viele Gastgeber*innen unterrichten auf Englisch und Deutsch. Die Sprache steht bei jedem Workshop.' : 'Yes, many hosts teach in English as well as German. The language is listed on every workshop.' },
        ],
      };
    }
    case 'date-night': {
      const answer = de
        ? `Ein Workshop ist ein Date mit Gesprächsstoff: Ihr macht zusammen etwas mit den Händen und nehmt es mit nach Hause. Hier sind ${n} Ideen für Abende und Wochenenden in Berlin${r ? `, ab ${r} pro Person` : ''}, zum Beispiel ${ex}.`
        : `A workshop is a date with something to talk about: you make something together with your hands and take it home. Here are ${n} ideas for evenings and weekends in Berlin${r ? `, from ${r} per person` : ''}, for example ${ex}.`;
      return {
        title: de ? 'Date-Ideen in Berlin: kreative Workshops zu zweit' : 'Date night ideas in Berlin: creative workshops for two',
        h1: de ? 'Date-Ideen in Berlin: Was können wir zu zweit machen?' : 'Date night ideas in Berlin: what can we do together?',
        short: de ? 'Date-Ideen' : 'Date night',
        description: de
          ? 'Kreative Date-Ideen in Berlin: Töpfern, Malen, Kerzen gießen, Tastings zu zweit, abends und am Wochenende, mit Terminen und Preisen.'
          : 'Creative date ideas in Berlin: pottery, painting, candle making and tastings for two, in the evening and at weekends, with dates and prices.',
        answer,
        empty: de ? 'Gerade sind keine passenden Termine im Kalender.' : 'No matching dates on the calendar right now.',
        faq: [
          { q: de ? 'Was können wir in Berlin zu zweit machen?' : 'What can we do together in Berlin?', a: answer },
          { q: de ? 'Kann ich einen Workshop verschenken?' : 'Can I give a workshop as a gift?',
            a: de ? 'Ja, mit einem Twiggli-Gutschein für einen bestimmten Workshop oder über einen freien Betrag, 3 Jahre gültig.' : 'Yes, with a Twiggli voucher for a specific workshop or for any amount, valid for 3 years.' },
          { q: de ? 'Können wir einen Workshop nur für uns zwei buchen?' : 'Can we book a private workshop just for the two of us?',
            a: de ? 'Manche Gastgeber*innen machen private Termine für zwei, oft zu einem höheren Preis. Schick einfach eine Anfrage.' : 'Some hosts run private sessions for two, usually at a higher price. Just send a request.' },
        ],
      };
    }
  }
}

export const answerShort = (kind: AnswerKind, lang: Lang): string => answerCopy(kind, lang, []).short;
