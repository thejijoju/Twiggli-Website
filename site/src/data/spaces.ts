/** Studios our hosts rent out when they are not teaching in them.
 *
 *  Only what the host publishes is written down here. Neither studio lists
 *  a rate, a floor area or a cap for hire — those come back from the host
 *  when a request reaches them — so the cards say "on request" rather than
 *  carrying a number nobody has confirmed. Add a `price`, `capacity` or
 *  `size` to an entry as soon as a host gives one.
 */

import type { Lang } from '../lib/url.ts';

export type Space = {
  /** The host who owns the room — their slug in content.ts, so the card can
   *  show their reel and link to their page. */
  slug: string;
  /** What the space is called, where the host names it separately. */
  name: string;
  address: string;
  district: string;
  /** What the room suits, per language. */
  suits: Record<Lang, string>;
  /** One paragraph, per language. */
  copy: Record<Lang, string>;
  /** Shown where the host has published a rate; absent means "on request". */
  price?: string;
};

export const spaces: Space[] = [
  {
    slug: 'celina',
    name: 'Gestaltwandel',
    address: 'Koloniestrasse 111',
    district: 'Gesundbrunnen',
    suits: {
      en: 'Craft workshops · courses · team days · private groups',
      de: 'Kreativ-Workshops · Kurse · Teamtage · private Gruppen',
      fr: 'Ateliers créatifs · cours · journées d’équipe · groupes privés',
      es: 'Talleres creativos · cursos · jornadas de equipo · grupos privados',
      it: 'Workshop creativi · corsi · giornate di team · gruppi privati',
      nl: 'Creatieve workshops · cursussen · teamdagen · privégroepen',
      pl: 'Warsztaty kreatywne · kursy · dni zespołowe · grupy prywatne',
      tr: 'El sanatları atölyeleri · kurslar · ekip günleri · özel gruplar',
    },
    copy: {
      en: 'The calm workshop room Celina teaches her nine crafts in — bookbinding, silk painting, glass soldering, mosaic, concrete, stamps. Long tables, tools within reach, and everything a messy afternoon needs, in a quiet street in Gesundbrunnen. It takes up to twenty people seated for a workshop.',
      de: 'Der ruhige Werkstattraum, in dem Celina ihre neun Handwerke unterrichtet — Buchbinden, Seidenmalerei, Glaslöten, Mosaik, Beton, Stempel. Lange Tische, Werkzeug in Reichweite und alles, was ein Nachmittag mit Farbe und Kleber braucht, in einer ruhigen Straße in Gesundbrunnen. Bis zu zwanzig Personen am Tisch.',
      fr: 'La salle d’atelier calme où Celina enseigne ses neuf métiers — reliure, peinture sur soie, vitrail, mosaïque, béton, tampons. De grandes tables, les outils à portée de main et tout ce qu’un après-midi salissant réclame, dans une rue tranquille de Gesundbrunnen. Jusqu’à vingt personnes assises.',
      es: 'La sala tranquila donde Celina enseña sus nueve oficios — encuadernación, pintura sobre seda, vidriera, mosaico, hormigón, sellos. Mesas largas, herramientas a mano y todo lo que pide una tarde de manchas, en una calle tranquila de Gesundbrunnen. Caben hasta veinte personas sentadas.',
      it: 'La sala tranquilla in cui Celina insegna i suoi nove mestieri — legatoria, pittura su seta, vetro Tiffany, mosaico, cemento, timbri. Tavoli lunghi, attrezzi a portata di mano e tutto quello che serve a un pomeriggio sporchevole, in una via silenziosa di Gesundbrunnen. Fino a venti persone sedute.',
      nl: 'De rustige werkruimte waar Celina haar negen ambachten geeft — boekbinden, zijde schilderen, glas solderen, mozaïek, beton, stempels. Lange tafels, gereedschap binnen handbereik en alles wat een rommelige middag nodig heeft, in een stille straat in Gesundbrunnen. Er kunnen twintig mensen aan tafel.',
      pl: 'Spokojna pracownia, w której Celina uczy swoich dziewięciu rzemiosł — oprawy książek, malowania na jedwabiu, lutowania szkła, mozaiki, betonu, stempli. Długie stoły, narzędzia pod ręką i wszystko, czego wymaga popołudnie z klejem i farbą, przy cichej ulicy w Gesundbrunnen. Przy stołach zmieści się dwadzieścia osób.',
      tr: 'Celina’nın dokuz zanaatını öğrettiği sakin atölye odası — ciltleme, ipek boyama, cam lehimleme, mozaik, beton, mühür. Uzun masalar, elinin altında aletler ve dağınık bir öğleden sonranın gerektirdiği her şey, Gesundbrunnen’de sessiz bir sokakta. Masada yirmi kişiye kadar yer var.',
    },
  },
  {
    slug: 'angelo',
    name: 'Coffee and Bananas',
    address: 'Greifenhagener Str. 19',
    district: 'Prenzlauer Berg',
    suits: {
      en: 'Seminars · tastings · private breakfasts · small celebrations',
      de: 'Seminare · Tastings · private Frühstücke · kleine Feiern',
      fr: 'Séminaires · dégustations · petits-déjeuners privés · petites fêtes',
      es: 'Seminarios · catas · desayunos privados · celebraciones pequeñas',
      it: 'Seminari · degustazioni · colazioni private · piccole feste',
      nl: 'Seminars · proeverijen · privéontbijten · kleine feesten',
      pl: 'Seminaria · degustacje · prywatne śniadania · małe uroczystości',
      tr: 'Seminerler · tadımlar · özel kahvaltılar · küçük kutlamalar',
    },
    copy: {
      en: 'Angelo and Linda’s café by the S-Bahn at Schönhauser Allee, where the coffee is roasted by hand in the room. It is theirs to hand over outside café hours: they already run seminars and private breakfasts in it, so a group can have the whole place, the roaster and the kitchen with it.',
      de: 'Das Café von Angelo und Linda an der S-Bahn Schönhauser Allee, in dem der Kaffee von Hand geröstet wird. Außerhalb der Café-Zeiten geben sie es ab: Seminare und private Frühstücke laufen dort ohnehin, eine Gruppe bekommt also den ganzen Raum, den Röster und die Küche dazu.',
      fr: 'Le café d’Angelo et Linda près du S-Bahn Schönhauser Allee, où le café est torréfié à la main sur place. Ils le cèdent en dehors des heures d’ouverture : séminaires et petits-déjeuners privés s’y tiennent déjà, un groupe a donc tout le lieu, le torréfacteur et la cuisine avec.',
      es: 'El café de Angelo y Linda junto al S-Bahn de Schönhauser Allee, donde el café se tuesta a mano en la sala. Lo ceden fuera del horario: ya hacen seminarios y desayunos privados allí, así que un grupo se queda con todo el local, el tostador y la cocina.',
      it: 'Il caffè di Angelo e Linda accanto alla S-Bahn di Schönhauser Allee, dove il caffè si tosta a mano nella sala. Fuori orario lo lasciano a voi: seminari e colazioni private ci si tengono già, così un gruppo ha tutto il locale, il tostatore e la cucina.',
      nl: 'Het café van Angelo en Linda bij de S-Bahn Schönhauser Allee, waar de koffie met de hand in de zaak wordt gebrand. Buiten openingstijden staan ze het af: seminars en privéontbijten vinden er al plaats, dus een groep krijgt de hele zaak, de brander en de keuken erbij.',
      pl: 'Kawiarnia Angela i Lindy przy stacji S-Bahn Schönhauser Allee, gdzie kawa palona jest ręcznie na miejscu. Poza godzinami otwarcia oddają ją do dyspozycji: seminaria i prywatne śniadania i tak się tu odbywają, więc grupa dostaje cały lokal, palarnię i kuchnię.',
      tr: 'Angelo ile Linda’nın Schönhauser Allee S-Bahn durağının yanındaki kafesi; kahve burada elle kavruluyor. Kafe saatleri dışında mekânı devrediyorlar: zaten seminerler ve özel kahvaltılar yapılıyor, yani bir grup tüm mekânı, kavurma makinesini ve mutfağı alıyor.',
    },
  },
];
