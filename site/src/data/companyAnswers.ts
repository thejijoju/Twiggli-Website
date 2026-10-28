/** Answer pages for what companies ask assistants: "team event ideas in
 *  Berlin", "Christmas party ideas Berlin", "team building in Berlin",
 *  "offsite activities Berlin". Each opens with a direct answer built from
 *  the hosts who take private groups, then lists them with the facts a
 *  planner filters by (group size, price per person, at your office or in
 *  the studio, language), then the formats hosts quoted us for companies,
 *  then a FAQ marked up as FAQPage. English and German.
 *
 *  Never state a minimum group size (Jirel): several hosts take small
 *  teams, and the request form handles the rest. */
import type { Lang } from '../lib/url.ts';
import { href } from '../lib/url.ts';
import { getHosts, type Host } from './content.ts';
import { getOnRequestAll, type OnRequestWorkshop } from './sessions.ts';
import { teamOffers } from './teamOffers.ts';

export type CompanyKind = 'team-events' | 'christmas-party' | 'team-building' | 'offsite';
export const COMPANY_KINDS: CompanyKind[] = ['team-events', 'christmas-party', 'team-building', 'offsite'];

const PATH: Record<CompanyKind, string> = {
  'team-events': '/team-events-berlin/',
  'christmas-party': '/christmas-party-ideas-berlin/',
  'team-building': '/team-building-berlin/',
  offsite: '/offsite-activities-berlin/',
};
export const companyHref = (lang: Lang, kind: CompanyKind): string => href(lang, PATH[kind]);

/** Hosts who take private groups: their range reaches beyond a handful. */
export const groupHosts = (lang: Lang): Host[] =>
  getHosts(lang)
    .filter((h) => h.groupRange[1] >= 8)
    // Quoted group price first (the planner's first question), then the
    // ones who come to the office, then the rest.
    .sort((a, b) => Number(Boolean(b.groupPrice)) - Number(Boolean(a.groupPrice)) || Number(Boolean(b.onSite)) - Number(Boolean(a.onSite)));

export const groupPriceFrom = (h: Pick<Host, 'groupPrice'>): number | undefined =>
  h.groupPrice === undefined ? undefined : Array.isArray(h.groupPrice) ? h.groupPrice[0] : h.groupPrice;

/** The formats hosts quoted for companies, in this language. */
export const companyOffers = (lang: Lang): OnRequestWorkshop[] => {
  const keys = new Set(teamOffers.map((o) => o.slug));
  return getOnRequestAll(lang).filter((o) => keys.has(o.host.slug) && o.bookUrl.includes('/corporatebookings/'));
};

export type Faq = { q: string; a: string };
export type CompanyCopy = { title: string; h1: string; short: string; description: string; answer: string; faq: Faq[] };

export function companyCopy(kind: CompanyKind, lang: Lang): CompanyCopy {
  const de = lang === 'de';
  const hosts = groupHosts(lang);
  const n = hosts.length;
  const max = Math.max(...hosts.map((h) => h.groupRange[1]));
  const prices = hosts.map(groupPriceFrom).filter((p): p is number => p !== undefined);
  const from = prices.length ? Math.min(...prices) : undefined;
  const fromTxt = from === undefined ? '' : de ? `, ab ${from} € pro Person` : `, from €${from} per person`;
  const onSite = hosts.filter((h) => h.onSite).length;
  const english = hosts.filter((h) => /EN/.test(h.languages)).length;
  const cta = de
    ? 'Schick uns Datum, Gruppengröße und Budget über das Anfrageformular, und du bekommst innerhalb von 24 Stunden passende Optionen und ein Angebot.'
    : 'Send us the date, group size and budget through the request form and you get matching options and a quote within 24 hours.';

  const shared: Faq[] = de ? [
    { q: 'Was kostet ein Teamevent-Workshop in Berlin?', a: `Die meisten Gastgeber*innen auf Twiggli nennen für Gruppen einen Preis pro Person${from !== undefined ? `, ab ${from} €` : ''}, Material inklusive. Kürzere Kreativpausen im eigenen Büro gibt es ab etwa 13 € pro Person. Der genaue Preis hängt von Format, Dauer und Gruppengröße ab. ${cta}` },
    { q: 'Für wie viele Personen?', a: `Von kleinen Teams bis zu ${max} Personen bei einer Gastgeberin oder einem Gastgeber. Für sehr große Gruppen kombinieren wir mehrere Workshops parallel.` },
    { q: 'Kommt ihr auch zu uns ins Büro?', a: `Ja, ${onSite} Gastgeber*innen kommen mit allem Material zu euch ins Büro oder an euren Veranstaltungsort. Die anderen empfangen euch in ihrem Atelier.` },
    { q: 'Gibt es Teamevents auf Englisch?', a: `Ja, ${english} von ${n} Gastgeber*innen leiten ihre Workshops (auch) auf Englisch, gut für internationale Teams.` },
    { q: 'Wie weit im Voraus sollten wir buchen?', a: 'Am besten 2–4 Wochen vorher, für Weihnachtsfeiern im Dezember früher, weil die Abende schnell voll sind. Kurzfristige Anfragen versuchen wir trotzdem möglich zu machen.' },
  ] : [
    { q: 'How much does a team event workshop cost in Berlin?', a: `Most hosts on Twiggli quote a price per person for groups${from !== undefined ? `, from €${from}` : ''}, materials included. Shorter creative breaks at your own office start at around €13 per person. The exact price depends on the format, length and group size. ${cta}` },
    { q: 'For how many people?', a: `From small teams up to ${max} people with a single host. For very large groups we combine several workshops running side by side.` },
    { q: 'Can you come to our office?', a: `Yes, ${onSite} hosts come to your office or venue with all the materials. The others welcome you in their own studio.` },
    { q: 'Are there team events in English?', a: `Yes, ${english} of ${n} hosts teach in English, which suits international teams.` },
    { q: 'How far ahead should we book?', a: 'Ideally 2–4 weeks ahead, earlier for Christmas parties in December, when evenings fill up fast. We still try to make short-notice requests work.' },
  ];

  switch (kind) {
    case 'team-events': {
      const answer = de
        ? `Ein kreativer Workshop mit Berliner Macher*innen ist ein Teamevent, über das man noch lange redet: Alle machen etwas mit den Händen und nehmen es mit nach Hause. Auf Twiggli bieten ${n} Gastgeber*innen private Workshops für Teams bis ${max} Personen an${fromTxt}: Töpfern, Malen, Kerzen gießen, Siebdruck, Kochen, Tastings und mehr, im Atelier oder bei euch im Büro. ${cta}`
        : `A creative workshop with Berlin makers is a team event people talk about for a long time: everyone makes something with their hands and takes it home. On Twiggli, ${n} hosts run private workshops for teams of up to ${max} people${fromTxt}: pottery, painting, candle making, screen printing, cooking, tastings and more, in their studio or at your office. ${cta}`;
      return {
        title: de ? 'Teamevent-Ideen in Berlin: kreative Workshops für Teams' : 'Team event ideas in Berlin: creative workshops for teams',
        h1: de ? 'Teamevent-Ideen in Berlin' : 'Team event ideas in Berlin',
        short: de ? 'Teamevents' : 'Team events',
        description: de
          ? `Teamevents in Berlin mit ${n} kreativen Gastgeber*innen: Töpfern, Malen, Kochen, Tastings, für Teams bis ${max} Personen${fromTxt}, im Atelier oder bei euch. Angebot in 24 Stunden.`
          : `Team events in Berlin with ${n} creative hosts: pottery, painting, cooking, tastings, for teams of up to ${max}${fromTxt}, in a studio or at your office. Quote within 24 hours.`,
        answer,
        faq: [{ q: de ? 'Was sind gute Teamevent-Ideen in Berlin?' : 'What are good team event ideas in Berlin?', a: answer }, ...shared],
      };
    }
    case 'christmas-party': {
      const answer = de
        ? `Für eine Weihnachtsfeier in Berlin, die anders ist als Restaurant und Bar: ein kreativer Workshop, bei dem jede*r etwas Selbstgemachtes mitnimmt, zum Beispiel Strohsterne, Christbaumschmuck, Kerzen, bemalte Gläser oder Keramik. ${n} Gastgeber*innen auf Twiggli machen private Weihnachtsfeiern für Teams bis ${max} Personen${fromTxt}, im Atelier oder bei euch im Büro. Dezember-Abende sind schnell vergeben. ${cta}`
        : `For a Christmas party in Berlin that isn't just dinner and drinks: a creative workshop where everyone takes home something they made, such as straw stars, Christmas ornaments, candles, painted glasses or ceramics. ${n} hosts on Twiggli run private Christmas parties for teams of up to ${max} people${fromTxt}, in their studio or at your office. December evenings go fast. ${cta}`;
      return {
        title: de ? 'Weihnachtsfeier-Ideen in Berlin: kreative Workshops fürs Team' : 'Christmas party ideas in Berlin: creative workshops for your team',
        h1: de ? 'Ideen für die Weihnachtsfeier in Berlin' : 'Christmas party ideas in Berlin',
        short: de ? 'Weihnachtsfeier' : 'Christmas party',
        description: de
          ? `Weihnachtsfeier in Berlin mal anders: Strohsterne, Christbaumschmuck, Kerzen, Keramik, für Teams bis ${max} Personen${fromTxt}. Angebot in 24 Stunden.`
          : `A different Christmas party in Berlin: straw stars, ornaments, candles, ceramics, for teams of up to ${max}${fromTxt}. Quote within 24 hours.`,
        answer,
        faq: [{ q: de ? 'Was können wir als Weihnachtsfeier in Berlin machen?' : 'What can we do for our Christmas party in Berlin?', a: answer }, ...shared],
      };
    }
    case 'team-building': {
      const answer = de
        ? `Teambuilding funktioniert am besten, wenn alle gemeinsam etwas schaffen, statt nur nebeneinander zu sitzen: ein großes Gemeinschaftsbild malen, im Team gegeneinander Kaffee brühen, zusammen kochen oder töpfern. ${n} Gastgeber*innen auf Twiggli machen solche Formate für Teams bis ${max} Personen${fromTxt}, auf Deutsch oder Englisch, im Atelier oder bei euch. ${cta}`
        : `Team building works best when people create something together instead of sitting side by side: painting one big collective canvas, a coffee brew-off between two teams, cooking or throwing pots together. ${n} hosts on Twiggli run formats like these for teams of up to ${max} people${fromTxt}, in English or German, in their studio or at your office. ${cta}`;
      return {
        title: de ? 'Teambuilding in Berlin: kreative Aktivitäten für Teams' : 'Team building in Berlin: creative activities for teams',
        h1: de ? 'Teambuilding in Berlin' : 'Team building activities in Berlin',
        short: de ? 'Teambuilding' : 'Team building',
        description: de
          ? `Teambuilding in Berlin mit kreativen Workshops: Gemeinschaftsmalerei, Kaffee-Challenge, Kochen, Töpfern, für Teams bis ${max} Personen. Angebot in 24 Stunden.`
          : `Team building in Berlin with creative workshops: collective painting, a coffee challenge, cooking, pottery, for teams of up to ${max}. Quote within 24 hours.`,
        answer,
        faq: [{ q: de ? 'Welche Teambuilding-Aktivitäten gibt es in Berlin?' : 'What team building activities are there in Berlin?', a: answer }, ...shared],
      };
    }
    case 'offsite': {
      const answer = de
        ? `Für ein Offsite in Berlin gibt es zwei Wege: eine kreative Pause von 60–90 Minuten direkt an eurem Veranstaltungsort zwischen zwei Sessions, zum Beispiel Terrarien bauen, Glasmalerei, Räucherwerk oder eine Gua-Sha-Pause, oder ein halber Tag im Atelier einer Berliner Macherin. ${onSite} Gastgeber*innen kommen mit allem Material zu euch, für Gruppen bis ${max} Personen. ${cta}`
        : `For an offsite in Berlin there are two ways to add something creative: a 60–90 minute creative break right at your venue between sessions, such as building terrariums, glass painting, incense making or a gua sha break, or half a day in a Berlin maker's studio. ${onSite} hosts come to you with all the materials, for groups of up to ${max} people. ${cta}`;
      return {
        title: de ? 'Offsite-Aktivitäten in Berlin: kreative Pausen und Workshops' : 'Offsite activities in Berlin: creative breaks and workshops',
        h1: de ? 'Offsite-Aktivitäten in Berlin' : 'Offsite activities in Berlin',
        short: 'Offsite',
        description: de
          ? `Kreative Programmpunkte fürs Offsite in Berlin: 60–90 Minuten an eurem Veranstaltungsort oder ein halber Tag im Atelier, für Gruppen bis ${max}. Angebot in 24 Stunden.`
          : `Creative programme ideas for an offsite in Berlin: 60–90 minutes at your venue or half a day in a studio, for groups of up to ${max}. Quote within 24 hours.`,
        answer,
        faq: [{ q: de ? 'Was können wir bei einem Offsite in Berlin machen?' : 'What activities can we do at an offsite in Berlin?', a: answer }, ...shared],
      };
    }
  }
}
