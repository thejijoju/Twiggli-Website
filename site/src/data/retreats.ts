/** Retreats — a weekend or longer away with a teacher, outside the city.
 *
 *  Like the studio rentals, a retreat carries no contact details for the
 *  people who run it: every "request a place" lands on our own contact
 *  form, and the exact address goes out with the confirmation. The card
 *  names the town, not the street.
 *
 *  Pictures live under /public/img/retreats. `hero` leads the page,
 *  `gallery` follows the programme.
 */

import type { Lang } from '../lib/url.ts';

type T = Record<Lang, string>;

export type RetreatDay = {
  /** "Saturday" and so on. */
  day: T;
  /** "9:00 – about 17:00". Times are the same in every language, but the
   *  word "about" is not. */
  hours: T;
  what: T;
};

export type Retreat = {
  slug: string;
  /** ISO dates, first and last day. */
  start: string;
  end: string;
  /** The town the retreat is in, and the area around it for the reader who
   *  does not know the town. */
  town: string;
  region: T;
  teacher: string;
  /** Language the teaching is in, as codes: "DE", "EN". */
  language: string;
  /** What the contribution is: a price or, as here, a recommended dana. */
  contribution: T;
  /** One line for the card under the title. */
  kicker: T;
  title: T;
  /** The retreat as the contact form names it — "a place on …". */
  enquiry: T;
  lede: T;
  about: Record<Lang, string[]>;
  days: RetreatDay[];
  practice: Record<Lang, string[]>;
  bring: T;
  provided: T;
  house: T;
  hero: string;
  /** A wide view of the room, set between the introduction and the
   *  programme. */
  wide?: string;
  gallery: { src: string; alt: T }[];
};

export const retreats: Retreat[] = [
  {
    // Bhante Dr. Seelawansa Thero comes from Vienna once a year to the
    // meditation house in Kreuzau-Winden. Programme, times and dana as the
    // house published them; photos are theirs.
    slug: 'bhante-seelawansa-kreuzau',
    start: '2026-10-03',
    end: '2026-10-04',
    town: 'Kreuzau-Winden',
    region: {
      en: 'Eifel, near Düren · between Cologne and Aachen',
      de: 'Eifel, bei Düren · zwischen Köln und Aachen',
      fr: 'Eifel, près de Düren · entre Cologne et Aix-la-Chapelle',
      es: 'Eifel, cerca de Düren · entre Colonia y Aquisgrán',
      it: 'Eifel, vicino a Düren · tra Colonia e Aquisgrana',
      nl: 'Eifel, bij Düren · tussen Keulen en Aken',
      pl: 'Eifel, koło Düren · między Kolonią a Akwizgranem',
      tr: 'Eifel, Düren yakını · Köln ile Aachen arasında',
    },
    teacher: 'Bhante Dr. Seelawansa Thero',
    language: 'DE',
    contribution: {
      en: 'Dana — €100 recommended for the weekend',
      de: 'Dana — 100 € für das Wochenende empfohlen',
      fr: 'Dana — 100 € recommandés pour le week-end',
      es: 'Dana — 100 € recomendados por el fin de semana',
      it: 'Dana — 100 € consigliati per il fine settimana',
      nl: 'Dana — € 100 aanbevolen voor het weekend',
      pl: 'Dana — zalecane 100 € za weekend',
      tr: 'Dana — hafta sonu için önerilen 100 €',
    },
    kicker: {
      en: 'Weekend retreat · Theravada meditation',
      de: 'Wochenendretreat · Theravada-Meditation',
      fr: 'Retraite de week-end · méditation theravada',
      es: 'Retiro de fin de semana · meditación theravada',
      it: 'Ritiro del fine settimana · meditazione theravada',
      nl: 'Weekendretraite · theravada-meditatie',
      pl: 'Weekendowy retreat · medytacja therawada',
      tr: 'Hafta sonu inzivası · Theravada meditasyonu',
    },
    title: {
      en: 'A weekend of silence with Bhante Seelawansa',
      de: 'Ein Wochenende in Stille mit Bhante Seelawansa',
      fr: 'Un week-end de silence avec Bhante Seelawansa',
      es: 'Un fin de semana de silencio con Bhante Seelawansa',
      it: 'Un fine settimana di silenzio con Bhante Seelawansa',
      nl: 'Een weekend van stilte met Bhante Seelawansa',
      pl: 'Weekend ciszy z Bhante Seelawansą',
      tr: 'Bhante Seelawansa ile bir sessizlik hafta sonu',
    },
    enquiry: {
      en: 'the weekend retreat with Bhante Seelawansa, 3–4 October 2026',
      de: 'Wochenendretreat mit Bhante Seelawansa, 3.–4. Oktober 2026',
      fr: 'la retraite de week-end avec Bhante Seelawansa, 3–4 octobre 2026',
      es: 'el retiro de fin de semana con Bhante Seelawansa, 3–4 de octubre de 2026',
      it: 'il ritiro del fine settimana con Bhante Seelawansa, 3–4 ottobre 2026',
      nl: 'de weekendretraite met Bhante Seelawansa, 3–4 oktober 2026',
      pl: 'weekendowy retreat z Bhante Seelawansą, 3–4 października 2026',
      tr: 'Bhante Seelawansa ile hafta sonu inzivası, 3–4 Ekim 2026',
    },
    lede: {
      en: 'A Theravada monk from Sri Lanka, now living in Vienna, returns for his yearly weekend in a quiet meditation house on the edge of the Eifel — teaching, meditation and much of it held in mindful silence.',
      de: 'Ein Theravada-Mönch aus Sri Lanka, heute in Wien zu Hause, kommt zu seinem jährlichen Wochenende in ein stilles Meditationshaus am Rand der Eifel — Unterweisung, Meditation und vieles davon in achtsamem Schweigen.',
      fr: 'Un moine theravada originaire du Sri Lanka, qui vit aujourd’hui à Vienne, revient pour son week-end annuel dans une maison de méditation paisible en bordure de l’Eifel — enseignement, méditation, et une grande part en silence attentif.',
      es: 'Un monje theravada de Sri Lanka, hoy afincado en Viena, vuelve para su fin de semana anual a una tranquila casa de meditación al borde del Eifel: enseñanza, meditación y buena parte en silencio atento.',
      it: 'Un monaco theravada dello Sri Lanka, oggi a Vienna, torna per il suo fine settimana annuale in una quieta casa di meditazione ai margini dell’Eifel — insegnamento, meditazione e gran parte in silenzio consapevole.',
      nl: 'Een theravada-monnik uit Sri Lanka, tegenwoordig in Wenen, keert terug voor zijn jaarlijkse weekend in een stil meditatiehuis aan de rand van de Eifel — onderricht, meditatie en veel ervan in aandachtige stilte.',
      pl: 'Mnich therawady ze Sri Lanki, dziś mieszkający w Wiedniu, wraca na swój coroczny weekend do cichego domu medytacji na skraju Eifel — nauki, medytacja i duża część w uważnym milczeniu.',
      tr: 'Sri Lankalı, bugün Viyana’da yaşayan bir Theravada keşişi, Eifel’in kıyısındaki sakin bir meditasyon evine yıllık hafta sonu için geri dönüyor — öğreti, meditasyon ve büyük bölümü farkındalıklı sessizlik içinde.',
    },
    about: {
      en: [
        'Bhante — as everyone who knows him calls him — has been a friend of the house for years, and his weekend is the one date its regulars do not miss. It is a rare chance to hear the Buddha’s teaching explained by a monk, and to bring him your own questions about it.',
        'The weekend covers Theravada teaching, meditation and contemplation, and what the teaching means for ordinary days. Between the sessions of instruction there is sitting and walking meditation in silence, and time for personal guidance on questions of life. Much of the retreat is held in mindful silence — meals included.',
        'Nobody needs any experience. Newcomers are warmly welcome, and the seminar is open to anyone who is curious.',
      ],
      de: [
        'Bhante — so nennen ihn alle, die ihn kennen — ist dem Haus seit vielen Jahren verbunden, und sein Wochenende ist der Termin, den die Stammgäste nicht verpassen. Eine seltene Gelegenheit, sich die Lehre des Buddha von einem Mönch erläutern zu lassen und ihm die eigenen, ganz persönlichen Fragen dazu zu stellen.',
        'Inhaltlich geht es um die buddhistische Lehre (Theravada), um Meditation, Kontemplation und darum, was die Lehre für den Alltag bedeutet. Neben den Zeiten der Unterweisung gibt es Sitz- und Gehmeditation in Stille und Raum für persönliche Beratung in Lebensfragen. Großenteils findet das Retreat in achtsamem Schweigen statt — auch bei den Mahlzeiten.',
        'Vorkenntnisse braucht es keine. „Neulinge“ sind ausdrücklich willkommen, das Seminar ist für alle Interessierten offen.',
      ],
      fr: [
        'Bhante — c’est ainsi que l’appellent tous ceux qui le connaissent — est un ami de la maison depuis des années, et son week-end est le rendez-vous que les habitués ne manquent pas. Une occasion rare d’entendre l’enseignement du Bouddha expliqué par un moine, et de lui poser vos propres questions.',
        'Le week-end porte sur l’enseignement theravada, la méditation, la contemplation et ce que l’enseignement signifie au quotidien. Entre les temps d’instruction viennent la méditation assise et marchée en silence, et un temps d’accompagnement personnel sur les questions de la vie. Une grande partie de la retraite se déroule en silence attentif — repas compris.',
        'Aucune expérience n’est nécessaire. Les débutants sont les bienvenus, et le séminaire est ouvert à toute personne curieuse.',
      ],
      es: [
        'Bhante — así lo llaman todos los que lo conocen — es amigo de la casa desde hace años, y su fin de semana es la cita que los habituales no se pierden. Una ocasión poco común de escuchar la enseñanza del Buda explicada por un monje y de plantearle tus propias preguntas.',
        'El fin de semana trata la enseñanza theravada, la meditación, la contemplación y lo que la enseñanza significa en el día a día. Entre las sesiones de instrucción hay meditación sentada y caminando en silencio, y tiempo para orientación personal sobre cuestiones de la vida. Gran parte del retiro transcurre en silencio atento, también durante las comidas.',
        'No hace falta experiencia. Los principiantes son muy bienvenidos y el seminario está abierto a cualquier persona con curiosidad.',
      ],
      it: [
        'Bhante — così lo chiamano tutti quelli che lo conoscono — è amico della casa da anni, e il suo fine settimana è l’appuntamento che gli habitué non perdono. Un’occasione rara per sentire l’insegnamento del Buddha spiegato da un monaco e porgli le proprie domande.',
        'Il fine settimana tratta l’insegnamento theravada, la meditazione, la contemplazione e ciò che l’insegnamento significa nella vita di tutti i giorni. Tra i momenti di istruzione ci sono meditazione seduta e camminata in silenzio, e spazio per un accompagnamento personale sulle domande della vita. Gran parte del ritiro si svolge in silenzio consapevole, pasti compresi.',
        'Non serve alcuna esperienza. I principianti sono i benvenuti e il seminario è aperto a chiunque sia curioso.',
      ],
      nl: [
        'Bhante — zo noemt iedereen die hem kent hem — is al jaren een vriend van het huis, en zijn weekend is de datum die de vaste bezoekers niet missen. Een zeldzame kans om de leer van de Boeddha uitgelegd te krijgen door een monnik, en hem je eigen vragen te stellen.',
        'Het weekend gaat over de theravada-leer, meditatie, contemplatie en wat de leer betekent voor gewone dagen. Tussen het onderricht door is er zit- en loopmeditatie in stilte, en ruimte voor persoonlijke begeleiding bij levensvragen. Een groot deel van de retraite verloopt in aandachtige stilte — ook tijdens de maaltijden.',
        'Ervaring is niet nodig. Beginners zijn van harte welkom en het seminar staat open voor iedereen die nieuwsgierig is.',
      ],
      pl: [
        'Bhante — tak nazywają go wszyscy, którzy go znają — od lat jest przyjacielem tego domu, a jego weekend to termin, którego stali bywalcy nie opuszczają. Rzadka okazja, by usłyszeć nauki Buddy objaśniane przez mnicha i zadać mu własne pytania.',
        'Weekend obejmuje nauki therawady, medytację, kontemplację i to, co nauki znaczą w codziennym życiu. Między naukami jest medytacja w siedzeniu i w chodzeniu w ciszy oraz czas na osobiste rozmowy o sprawach życia. Duża część retreatu upływa w uważnym milczeniu — również podczas posiłków.',
        'Doświadczenie nie jest potrzebne. Początkujący są mile widziani, a seminarium jest otwarte dla wszystkich zainteresowanych.',
      ],
      tr: [
        'Onu tanıyan herkesin dediği gibi Bhante, yıllardır bu evin dostu; onun hafta sonu, müdavimlerin kaçırmadığı tarih. Buda’nın öğretisini bir keşişten dinlemek ve ona kendi sorularınızı sormak için nadir bir fırsat.',
        'Hafta sonu Theravada öğretisini, meditasyonu, tefekkürü ve öğretinin gündelik hayatta ne anlama geldiğini ele alıyor. Öğreti saatlerinin arasında sessizlik içinde oturma ve yürüme meditasyonu ile hayata dair sorular için kişisel rehberliğe de yer var. İnzivanın büyük bölümü farkındalıklı sessizlik içinde geçiyor — yemekler dahil.',
        'Deneyim gerekmiyor. Yeni başlayanlar içtenlikle davetli; seminer merak eden herkese açık.',
      ],
    },
    days: [
      {
        day: { en: 'Saturday 3 October', de: 'Samstag, 3. Oktober', fr: 'Samedi 3 octobre', es: 'Sábado 3 de octubre', it: 'Sabato 3 ottobre', nl: 'Zaterdag 3 oktober', pl: 'Sobota, 3 października', tr: '3 Ekim Cumartesi' },
        hours: { en: '9:00 – about 17:00', de: '9 – ca. 17 Uhr', fr: '9 h – vers 17 h', es: '9:00 – hacia las 17:00', it: '9:00 – verso le 17:00', nl: '9.00 – ca. 17.00 uur', pl: '9:00 – ok. 17:00', tr: '09.00 – yaklaşık 17.00' },
        what: {
          en: 'The full day: teaching, sitting and walking meditation, contemplation — with a shared vegetarian lunch.',
          de: 'Der ganze Tag: Unterweisung, Sitz- und Gehmeditation, Kontemplation — mit einem gemeinsamen vegetarischen Mittagessen.',
          fr: 'La journée entière : enseignement, méditation assise et marchée, contemplation — avec un déjeuner végétarien partagé.',
          es: 'El día completo: enseñanza, meditación sentada y caminando, contemplación, con un almuerzo vegetariano compartido.',
          it: 'La giornata intera: insegnamento, meditazione seduta e camminata, contemplazione — con un pranzo vegetariano condiviso.',
          nl: 'De hele dag: onderricht, zit- en loopmeditatie, contemplatie — met een gezamenlijke vegetarische lunch.',
          pl: 'Cały dzień: nauki, medytacja w siedzeniu i w chodzeniu, kontemplacja — ze wspólnym wegetariańskim obiadem.',
          tr: 'Tam gün: öğreti, oturma ve yürüme meditasyonu, tefekkür — ortak vejetaryen öğle yemeğiyle.',
        },
      },
      {
        day: { en: 'Sunday 4 October', de: 'Sonntag, 4. Oktober', fr: 'Dimanche 4 octobre', es: 'Domingo 4 de octubre', it: 'Domenica 4 ottobre', nl: 'Zondag 4 oktober', pl: 'Niedziela, 4 października', tr: '4 Ekim Pazar' },
        hours: { en: '9:00 – 13:00', de: '9 – 13 Uhr', fr: '9 h – 13 h', es: '9:00 – 13:00', it: '9:00 – 13:00', nl: '9.00 – 13.00 uur', pl: '9:00 – 13:00', tr: '09.00 – 13.00' },
        what: {
          en: 'A morning of practice, closing with lunch together.',
          de: 'Ein Vormittag der Praxis, zum Abschluss ein gemeinsames Mittagessen.',
          fr: 'Une matinée de pratique, clôturée par un déjeuner ensemble.',
          es: 'Una mañana de práctica que termina con un almuerzo juntos.',
          it: 'Una mattina di pratica, che si chiude con un pranzo insieme.',
          nl: 'Een ochtend van beoefening, afgesloten met een gezamenlijke lunch.',
          pl: 'Poranek praktyki zakończony wspólnym obiadem.',
          tr: 'Bir sabah pratiği, ardından birlikte kapanış yemeği.',
        },
      },
    ],
    practice: {
      en: ['Theravada teaching, explained by a monk', 'Sitting and walking meditation in silence', 'Contemplation', 'The teaching in everyday life', 'Personal guidance on questions of life'],
      de: ['Buddhistische Lehre (Theravada), von einem Mönch erläutert', 'Sitz- und Gehmeditation in Stille', 'Kontemplation', 'Die Lehre im Alltag', 'Persönliche Beratung in Lebensfragen'],
      fr: ['L’enseignement theravada, expliqué par un moine', 'Méditation assise et marchée en silence', 'Contemplation', 'L’enseignement au quotidien', 'Accompagnement personnel sur les questions de la vie'],
      es: ['La enseñanza theravada, explicada por un monje', 'Meditación sentada y caminando en silencio', 'Contemplación', 'La enseñanza en el día a día', 'Orientación personal sobre cuestiones de la vida'],
      it: ['L’insegnamento theravada, spiegato da un monaco', 'Meditazione seduta e camminata in silenzio', 'Contemplazione', 'L’insegnamento nella vita quotidiana', 'Accompagnamento personale sulle domande della vita'],
      nl: ['De theravada-leer, uitgelegd door een monnik', 'Zit- en loopmeditatie in stilte', 'Contemplatie', 'De leer in het dagelijks leven', 'Persoonlijke begeleiding bij levensvragen'],
      pl: ['Nauki therawady objaśniane przez mnicha', 'Medytacja w siedzeniu i w chodzeniu w ciszy', 'Kontemplacja', 'Nauki w codziennym życiu', 'Osobiste rozmowy o sprawach życia'],
      tr: ['Bir keşişin anlatımıyla Theravada öğretisi', 'Sessizlik içinde oturma ve yürüme meditasyonu', 'Tefekkür', 'Gündelik hayatta öğreti', 'Hayata dair sorularda kişisel rehberlik'],
    },
    bring: {
      en: 'Something to eat or drink for the shared table, and a large cloth to lay over your yoga mat.',
      de: 'Einen Beitrag zum Essen oder Trinken für den gemeinsamen Tisch und ein größeres Tuch für die Yogamatte.',
      fr: 'Quelque chose à manger ou à boire pour la table commune, et un grand tissu à poser sur votre tapis de yoga.',
      es: 'Algo de comer o beber para la mesa compartida y una tela grande para poner sobre tu esterilla de yoga.',
      it: 'Qualcosa da mangiare o da bere per la tavola comune e un telo grande da stendere sul tappetino da yoga.',
      nl: 'Iets te eten of te drinken voor de gedeelde tafel, en een grote doek voor over je yogamat.',
      pl: 'Coś do jedzenia lub picia na wspólny stół i dużą chustę na matę do jogi.',
      tr: 'Ortak sofra için yiyecek ya da içecek bir şey ve yoga matınızın üzerine serecek büyük bir örtü.',
    },
    provided: {
      en: 'Mats, meditation cushions and blankets are mostly there already. Drinks and snacks are taken care of.',
      de: 'Matten, Sitzkissen und Decken sind großenteils vorhanden. Für Getränke und Knabbereien ist gesorgt.',
      fr: 'Tapis, coussins de méditation et couvertures sont pour la plupart sur place. Boissons et en-cas sont prévus.',
      es: 'Esterillas, cojines de meditación y mantas están casi todos en la casa. Las bebidas y algo para picar están cubiertos.',
      it: 'Tappetini, cuscini da meditazione e coperte sono quasi tutti già lì. Bevande e snack sono previsti.',
      nl: 'Matten, meditatiekussens en dekens zijn grotendeels aanwezig. Voor drinken en iets lekkers wordt gezorgd.',
      pl: 'Maty, poduszki do medytacji i koce są w większości na miejscu. Napoje i przekąski zapewnione.',
      tr: 'Mat, meditasyon minderi ve battaniyelerin çoğu hazır. İçecek ve atıştırmalıklar düşünüldü.',
    },
    house: {
      en: 'A house of light and air in green surroundings, right by the Eifel nature reserve. The meditation room is upstairs, full of daylight; downstairs a tea kitchen, a dining room and a garden terrace for the breaks.',
      de: 'Ein Haus voller Licht und Luft im Grünen, ganz nah am Naturschutzgebiet Eifel. Der lichte Meditationsraum liegt im ersten Stock; unten eine Teeküche, ein Esszimmer und eine Gartenterrasse für die Pausen.',
      fr: 'Une maison de lumière et d’air dans la verdure, tout près de la réserve naturelle de l’Eifel. La salle de méditation, baignée de jour, est à l’étage ; en bas, une cuisine à thé, une salle à manger et une terrasse sur le jardin pour les pauses.',
      es: 'Una casa de luz y aire rodeada de verde, junto a la reserva natural del Eifel. La sala de meditación, llena de luz, está arriba; abajo, una cocina de té, un comedor y una terraza al jardín para las pausas.',
      it: 'Una casa di luce e aria nel verde, accanto alla riserva naturale dell’Eifel. La sala di meditazione, piena di luce, è al primo piano; sotto, una cucina per il tè, una sala da pranzo e una terrazza sul giardino per le pause.',
      nl: 'Een huis vol licht en lucht in het groen, vlak bij het natuurgebied van de Eifel. De lichte meditatieruimte is boven; beneden een theekeuken, een eetkamer en een tuinterras voor de pauzes.',
      pl: 'Dom pełen światła i powietrza wśród zieleni, tuż przy rezerwacie przyrody Eifel. Jasna sala medytacji jest na piętrze; na dole kuchnia do herbaty, jadalnia i taras w ogrodzie na przerwy.',
      tr: 'Yeşillikler içinde, Eifel doğa koruma alanının hemen yanında ışık ve hava dolu bir ev. Gün ışığıyla dolu meditasyon odası üst katta; aşağıda molalar için bir çay mutfağı, yemek odası ve bahçe terası.',
    },
    hero: '/img/retreats/kreuzau-bhante.jpg',
    wide: '/img/retreats/kreuzau-room-wide.jpg',
    gallery: [
      { src: '/img/retreats/kreuzau-room.jpg', alt: { en: 'The meditation room upstairs, in daylight', de: 'Der Meditationsraum im ersten Stock, im Tageslicht', fr: 'La salle de méditation à l’étage, en plein jour', es: 'La sala de meditación del piso de arriba, con luz de día', it: 'La sala di meditazione al primo piano, alla luce del giorno', nl: 'De meditatieruimte boven, bij daglicht', pl: 'Sala medytacji na piętrze, w świetle dnia', tr: 'Üst kattaki meditasyon odası, gün ışığında' } },
      { src: '/img/retreats/kreuzau-garden.jpg', alt: { en: 'Prayer flags in the garden', de: 'Gebetsfahnen im Garten', fr: 'Drapeaux de prière dans le jardin', es: 'Banderas de oración en el jardín', it: 'Bandiere di preghiera in giardino', nl: 'Gebedsvlaggen in de tuin', pl: 'Flagi modlitewne w ogrodzie', tr: 'Bahçede dua bayrakları' } },
      { src: '/img/retreats/kreuzau-lotus.jpg', alt: { en: 'A lotus laid in stone in the courtyard', de: 'Eine Lotusblüte aus Pflastersteinen im Hof', fr: 'Un lotus pavé dans la cour', es: 'Una flor de loto de piedra en el patio', it: 'Un fiore di loto in pietra nel cortile', nl: 'Een lotus van straatstenen op de binnenplaats', pl: 'Kwiat lotosu ułożony z kamieni na dziedzińcu', tr: 'Avluda taşla döşenmiş bir lotus' } },
      { src: '/img/retreats/kreuzau-dahlia.jpg', alt: { en: 'A dahlia from the garden against the sky', de: 'Eine Dahlie aus dem Garten vor dem Himmel', fr: 'Un dahlia du jardin sur fond de ciel', es: 'Una dalia del jardín contra el cielo', it: 'Una dalia del giardino contro il cielo', nl: 'Een dahlia uit de tuin tegen de lucht', pl: 'Dalia z ogrodu na tle nieba', tr: 'Bahçeden bir yıldız çiçeği, gökyüzüne karşı' } },
    ],
  },
];

/** The pages' own words — headings, labels, the call to action. */
export type RetreatsCopy = {
  nav: string;
  title: string;
  description: string;
  kicker: string;
  h1: string;
  lede: string;
  view: string;
  all: string;
  labels: { dates: string; where: string; teacher: string; language: string; contribution: string };
  /** Language names for the "Language" row, by code. */
  languages: Record<string, string>;
  weekend: string;
  practice: string;
  place: string;
  goodToKnow: string;
  bring: string;
  provided: string;
  cta: string;
  ctaTitle: string;
  ctaNote: string;
  soon: string;
};

export const retreatsCopy: Record<Lang, RetreatsCopy> = {
  en: {
    nav: 'Retreats',
    title: 'Retreats — meditation and yoga weekends with our teachers | Twiggli',
    description: 'Small retreats with teachers we know: meditation, yoga and silence in quiet houses outside the city. Request a place and we arrange the rest.',
    kicker: 'Retreats', h1: 'Time away, with a teacher',
    lede: 'Small retreats in quiet houses outside the city — meditation, yoga and silence with teachers we know. Request a place and we look after the rest.',
    view: 'Discover the retreat', all: 'All retreats',
    labels: { dates: 'Dates', where: 'Where', teacher: 'Teacher', language: 'Language', contribution: 'Contribution' },
    languages: { DE: 'German', EN: 'English' },
    weekend: 'The weekend', practice: 'What you practise', place: 'The house',
    goodToKnow: 'Good to know', bring: 'Please bring', provided: 'Already there',
    cta: 'Request a place', ctaTitle: 'Join the retreat',
    ctaNote: 'Tell us which days you would like to come. We confirm your place and send you the address and everything you need.',
    soon: 'More retreats are on their way.',
  },
  de: {
    nav: 'Retreats',
    title: 'Retreats — Meditations- und Yoga-Wochenenden mit unseren Lehrenden | Twiggli',
    description: 'Kleine Retreats mit Lehrenden, die wir kennen: Meditation, Yoga und Stille in ruhigen Häusern außerhalb der Stadt. Platz anfragen, den Rest organisieren wir.',
    kicker: 'Retreats', h1: 'Zeit für dich, mit einem Lehrer',
    lede: 'Kleine Retreats in stillen Häusern außerhalb der Stadt — Meditation, Yoga und Schweigen mit Lehrenden, die wir kennen. Frag einen Platz an, um den Rest kümmern wir uns.',
    view: 'Retreat entdecken', all: 'Alle Retreats',
    labels: { dates: 'Termin', where: 'Ort', teacher: 'Lehrer', language: 'Sprache', contribution: 'Beitrag' },
    languages: { DE: 'Deutsch', EN: 'Englisch' },
    weekend: 'Das Wochenende', practice: 'Was du übst', place: 'Das Haus',
    goodToKnow: 'Gut zu wissen', bring: 'Bitte mitbringen', provided: 'Schon da',
    cta: 'Platz anfragen', ctaTitle: 'Beim Retreat dabei sein',
    ctaNote: 'Schreib uns, an welchen Tagen du kommen möchtest. Wir bestätigen deinen Platz und schicken dir die Adresse und alles Weitere.',
    soon: 'Weitere Retreats sind in Vorbereitung.',
  },
  fr: {
    nav: 'Retraites',
    title: 'Retraites — week-ends de méditation et de yoga avec nos enseignants | Twiggli',
    description: 'De petites retraites avec des enseignants que nous connaissons : méditation, yoga et silence dans des maisons calmes hors de la ville. Demandez une place, nous nous occupons du reste.',
    kicker: 'Retraites', h1: 'Du temps à soi, avec un enseignant',
    lede: 'De petites retraites dans des maisons paisibles hors de la ville — méditation, yoga et silence avec des enseignants que nous connaissons. Demandez une place, nous nous occupons du reste.',
    view: 'Découvrir la retraite', all: 'Toutes les retraites',
    labels: { dates: 'Dates', where: 'Lieu', teacher: 'Enseignant', language: 'Langue', contribution: 'Participation' },
    languages: { DE: 'Allemand', EN: 'Anglais' },
    weekend: 'Le week-end', practice: 'Ce que vous pratiquez', place: 'La maison',
    goodToKnow: 'Bon à savoir', bring: 'À apporter', provided: 'Déjà sur place',
    cta: 'Demander une place', ctaTitle: 'Rejoindre la retraite',
    ctaNote: 'Dites-nous quels jours vous souhaitez venir. Nous confirmons votre place et vous envoyons l’adresse et tout le nécessaire.',
    soon: 'D’autres retraites arrivent bientôt.',
  },
  es: {
    nav: 'Retiros',
    title: 'Retiros — fines de semana de meditación y yoga con nuestros maestros | Twiggli',
    description: 'Retiros pequeños con maestros que conocemos: meditación, yoga y silencio en casas tranquilas fuera de la ciudad. Solicita una plaza y nosotros nos ocupamos del resto.',
    kicker: 'Retiros', h1: 'Tiempo para ti, con un maestro',
    lede: 'Retiros pequeños en casas tranquilas fuera de la ciudad: meditación, yoga y silencio con maestros que conocemos. Solicita una plaza y nos ocupamos del resto.',
    view: 'Descubrir el retiro', all: 'Todos los retiros',
    labels: { dates: 'Fechas', where: 'Lugar', teacher: 'Maestro', language: 'Idioma', contribution: 'Aportación' },
    languages: { DE: 'Alemán', EN: 'Inglés' },
    weekend: 'El fin de semana', practice: 'Qué practicas', place: 'La casa',
    goodToKnow: 'Conviene saber', bring: 'Trae, por favor', provided: 'Ya disponible',
    cta: 'Solicitar plaza', ctaTitle: 'Únete al retiro',
    ctaNote: 'Dinos qué días quieres venir. Confirmamos tu plaza y te enviamos la dirección y todo lo necesario.',
    soon: 'Pronto llegarán más retiros.',
  },
  it: {
    nav: 'Ritiri',
    title: 'Ritiri — fine settimana di meditazione e yoga con i nostri insegnanti | Twiggli',
    description: 'Piccoli ritiri con insegnanti che conosciamo: meditazione, yoga e silenzio in case tranquille fuori città. Richiedi un posto, al resto pensiamo noi.',
    kicker: 'Ritiri', h1: 'Tempo per te, con un insegnante',
    lede: 'Piccoli ritiri in case silenziose fuori città — meditazione, yoga e silenzio con insegnanti che conosciamo. Richiedi un posto, al resto pensiamo noi.',
    view: 'Scopri il ritiro', all: 'Tutti i ritiri',
    labels: { dates: 'Date', where: 'Luogo', teacher: 'Insegnante', language: 'Lingua', contribution: 'Contributo' },
    languages: { DE: 'Tedesco', EN: 'Inglese' },
    weekend: 'Il fine settimana', practice: 'Cosa pratichi', place: 'La casa',
    goodToKnow: 'Da sapere', bring: 'Da portare', provided: 'Già presente',
    cta: 'Richiedi un posto', ctaTitle: 'Partecipa al ritiro',
    ctaNote: 'Dicci in quali giorni vorresti venire. Confermiamo il tuo posto e ti mandiamo l’indirizzo e tutto il resto.',
    soon: 'Altri ritiri sono in arrivo.',
  },
  nl: {
    nav: 'Retraites',
    title: 'Retraites — meditatie- en yogaweekenden met onze leraren | Twiggli',
    description: 'Kleine retraites met leraren die we kennen: meditatie, yoga en stilte in rustige huizen buiten de stad. Vraag een plek aan, wij regelen de rest.',
    kicker: 'Retraites', h1: 'Tijd voor jezelf, met een leraar',
    lede: 'Kleine retraites in stille huizen buiten de stad — meditatie, yoga en stilte met leraren die we kennen. Vraag een plek aan, wij zorgen voor de rest.',
    view: 'Ontdek de retraite', all: 'Alle retraites',
    labels: { dates: 'Data', where: 'Waar', teacher: 'Leraar', language: 'Taal', contribution: 'Bijdrage' },
    languages: { DE: 'Duits', EN: 'Engels' },
    weekend: 'Het weekend', practice: 'Wat je beoefent', place: 'Het huis',
    goodToKnow: 'Goed om te weten', bring: 'Graag meenemen', provided: 'Al aanwezig',
    cta: 'Plek aanvragen', ctaTitle: 'Doe mee aan de retraite',
    ctaNote: 'Laat ons weten op welke dagen je wilt komen. We bevestigen je plek en sturen je het adres en alles wat je nodig hebt.',
    soon: 'Er komen meer retraites aan.',
  },
  pl: {
    nav: 'Retreaty',
    title: 'Retreaty — weekendy medytacji i jogi z naszymi nauczycielami | Twiggli',
    description: 'Kameralne retreaty z nauczycielami, których znamy: medytacja, joga i cisza w spokojnych domach poza miastem. Zapytaj o miejsce, resztą zajmiemy się my.',
    kicker: 'Retreaty', h1: 'Czas dla siebie, z nauczycielem',
    lede: 'Kameralne retreaty w cichych domach poza miastem — medytacja, joga i cisza z nauczycielami, których znamy. Zapytaj o miejsce, a resztą zajmiemy się my.',
    view: 'Poznaj retreat', all: 'Wszystkie retreaty',
    labels: { dates: 'Termin', where: 'Miejsce', teacher: 'Nauczyciel', language: 'Język', contribution: 'Wkład' },
    languages: { DE: 'Niemiecki', EN: 'Angielski' },
    weekend: 'Weekend', practice: 'Co praktykujesz', place: 'Dom',
    goodToKnow: 'Warto wiedzieć', bring: 'Prosimy zabrać', provided: 'Na miejscu',
    cta: 'Zapytaj o miejsce', ctaTitle: 'Dołącz do retreatu',
    ctaNote: 'Napisz, w które dni chcesz przyjechać. Potwierdzimy miejsce i wyślemy adres oraz wszystkie informacje.',
    soon: 'Kolejne retreaty są w przygotowaniu.',
  },
  tr: {
    nav: 'İnzivalar',
    title: 'İnzivalar — öğretmenlerimizle meditasyon ve yoga hafta sonları | Twiggli',
    description: 'Tanıdığımız öğretmenlerle küçük inzivalar: şehir dışındaki sakin evlerde meditasyon, yoga ve sessizlik. Yer isteyin, gerisini biz ayarlayalım.',
    kicker: 'İnzivalar', h1: 'Bir öğretmenle, kendine ayrılan zaman',
    lede: 'Şehir dışındaki sessiz evlerde küçük inzivalar — tanıdığımız öğretmenlerle meditasyon, yoga ve sessizlik. Yer isteyin, gerisini biz halledelim.',
    view: 'İnzivayı keşfet', all: 'Tüm inzivalar',
    labels: { dates: 'Tarih', where: 'Yer', teacher: 'Öğretmen', language: 'Dil', contribution: 'Katkı' },
    languages: { DE: 'Almanca', EN: 'İngilizce' },
    weekend: 'Hafta sonu', practice: 'Neler pratik edeceksin', place: 'Ev',
    goodToKnow: 'Bilmekte fayda var', bring: 'Lütfen getirin', provided: 'Zaten mevcut',
    cta: 'Yer iste', ctaTitle: 'İnzivaya katıl',
    ctaNote: 'Hangi günler gelmek istediğini yaz. Yerini onaylar, adresi ve gereken her şeyi göndeririz.',
    soon: 'Yeni inzivalar yolda.',
  },
};
