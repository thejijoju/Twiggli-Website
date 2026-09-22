/** Studios our hosts rent out when they are not teaching in them.
 *
 *  Only what the host publishes is written down here. None of them lists
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
  /** A line under the card's details, for what the host wants said about
   *  the terms — a written agreement for a standing booking, say. */
  terms?: Record<Lang, string>;
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
    terms: {
      en: 'A written usage agreement can be drawn up for regular or longer-term use, setting out dates, access and terms.',
      de: 'Für regelmäßige oder längerfristige Nutzung kann eine schriftliche Nutzungsvereinbarung getroffen werden, die Termine, Zugang und Konditionen festhält.',
      fr: 'Pour une utilisation régulière ou de plus longue durée, une convention d’utilisation écrite peut être établie, fixant les dates, l’accès et les conditions.',
      es: 'Para un uso regular o de mayor duración se puede formalizar un acuerdo de uso por escrito, que fije fechas, acceso y condiciones.',
      it: 'Per un utilizzo regolare o di più lungo periodo è possibile stipulare un accordo d’uso scritto che definisca date, accesso e condizioni.',
      nl: 'Voor regelmatig of langduriger gebruik kan een schriftelijke gebruiksovereenkomst worden opgesteld, met data, toegang en voorwaarden.',
      pl: 'W przypadku regularnego lub dłuższego korzystania można zawrzeć pisemną umowę użytkowania, określającą terminy, dostęp i warunki.',
      tr: 'Düzenli ya da daha uzun süreli kullanım için tarihleri, erişimi ve koşulları belirleyen yazılı bir kullanım sözleşmesi düzenlenebilir.',
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
  {
    slug: 'olivia',
    name: 'Ohma Studio',
    address: 'Boxhagener Str. 110',
    district: 'Friedrichshain',
    suits: {
      en: 'Workshops · courses · co-working days · small groups',
      de: 'Workshops · Kurse · Co-Working-Tage · kleine Gruppen',
      fr: 'Ateliers · cours · journées de co-working · petits groupes',
      es: 'Talleres · cursos · jornadas de co-working · grupos pequeños',
      it: 'Workshop · corsi · giornate di co-working · piccoli gruppi',
      nl: 'Workshops · cursussen · co-workingdagen · kleine groepen',
      pl: 'Warsztaty · kursy · dni co-workingowe · małe grupy',
      tr: 'Atölyeler · kurslar · ortak çalışma günleri · küçük gruplar',
    },
    copy: {
      en: 'Olivia’s studio on Boxhagener Straße in Friedrichshain, where she makes Ohma Beads and teaches her alcohol-ink sessions. It is a working maker’s room rather than a bare hall — and it is already shared: several makers run their own courses here, from quilting to hand knitting. Take it for a workshop of your own, a course, a making day or a quiet desk among other people’s work.',
      de: 'Olivias Atelier in der Boxhagener Straße in Friedrichshain, in dem sie Ohma Beads fertigt und ihre Alkoholtinte-Sessions gibt. Ein echter Werkraum, kein leerer Saal — und er wird schon geteilt: mehrere Macherinnen geben hier ihre eigenen Kurse, vom Quilten bis zum Handstricken. Zu haben für einen eigenen Workshop, einen Kurs, einen Werktag oder einen ruhigen Platz zwischen den Arbeiten anderer.',
      fr: 'L’atelier d’Olivia, Boxhagener Straße à Friedrichshain, où elle fabrique les Ohma Beads et anime ses séances d’encre à alcool. Une vraie salle de travail plutôt qu’une salle nue — et déjà partagée : plusieurs créatrices y donnent leurs propres cours, du quilting au tricot à la main. À prendre pour votre atelier, un cours, une journée de fabrication ou une place au calme parmi le travail des autres.',
      es: 'El estudio de Olivia en la Boxhagener Straße, en Friedrichshain, donde hace las Ohma Beads y da sus sesiones de tinta de alcohol. Una sala de trabajo de verdad, no un local vacío — y ya compartida: varias creadoras imparten aquí sus propios cursos, del quilting al punto a mano. Para tu propio taller, un curso, un día de trabajo o un sitio tranquilo entre el trabajo de otras.',
      it: 'Lo studio di Olivia in Boxhagener Straße, a Friedrichshain, dove realizza le Ohma Beads e tiene le sue sessioni con l’inchiostro ad alcol. Una vera stanza di lavoro, non una sala vuota — e già condivisa: più artigiane ci tengono i propri corsi, dal quilting al lavoro a maglia. Da prendere per un workshop tuo, un corso, una giornata di lavoro o una scrivania tranquilla accanto al lavoro di altri.',
      nl: 'Olivia’s atelier aan de Boxhagener Straße in Friedrichshain, waar ze Ohma Beads maakt en haar alcoholinkt-sessies geeft. Een echte werkruimte in plaats van een kale zaal — en al gedeeld: meerdere makers geven hier hun eigen cursussen, van quilten tot handbreien. Te huur voor een eigen workshop, een cursus, een maakdag of een rustige plek tussen het werk van anderen.',
      pl: 'Pracownia Olivii przy Boxhagener Straße we Friedrichshain, w której powstają Ohma Beads i w której prowadzi zajęcia z tuszami alkoholowymi. To prawdziwa pracownia, nie pusta sala — i już dzielona: kilka twórczyń prowadzi tu własne kursy, od quiltingu po dziewiarstwo ręczne. Do wzięcia na własne warsztaty, kurs, dzień pracy albo spokojne miejsce przy stole obok innych.',
      tr: 'Olivia’nın Friedrichshain’da Boxhagener Straße üzerindeki atölyesi; Ohma Beads’i burada yapıyor, alkol mürekkebi seanslarını burada veriyor. Boş bir salon değil, işleyen bir üretim odası — ve zaten paylaşılıyor: birkaç üretici kendi kurslarını burada veriyor, kapitone dikişten el örgüsüne. Kendi atölyen, bir kurs, bir üretim günü ya da başkalarının işi arasında sakin bir masa için kiralanabilir.',
    },
    terms: {
      en: 'The room is let by the hour or by the day — an evening session, a full making day, or a slot that comes back every week.',
      de: 'Der Raum wird stundenweise oder tageweise vermietet — ein Abendtermin, ein ganzer Werktag oder ein Slot, der jede Woche wiederkommt.',
      fr: 'La salle se loue à l’heure ou à la journée — une séance en soirée, une journée entière, ou un créneau qui revient chaque semaine.',
      es: 'La sala se alquila por horas o por días: una sesión de tarde, un día entero de trabajo o una franja que se repite cada semana.',
      it: 'La sala si affitta a ore o a giornata — una sessione serale, un’intera giornata di lavoro o una fascia che torna ogni settimana.',
      nl: 'De ruimte wordt per uur of per dag verhuurd — een avondsessie, een hele maakdag of een vast moment elke week.',
      pl: 'Pracownię wynajmuje się na godziny lub na cały dzień — wieczór, pełny dzień pracy albo stały termin co tydzień.',
      tr: 'Mekân saatlik ya da günlük kiralanıyor — bir akşam seansı, tam bir üretim günü ya da her hafta tekrarlayan bir saat dilimi.',
    },
  },
];
