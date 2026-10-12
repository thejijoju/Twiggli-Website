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
  /** Days the host has not fixed yet: shown instead of the date range,
   *  e.g. "November 2026". start/end then bracket the month. */
  whenLabel?: T;
  /** Country, for the event listing search engines read; Germany if absent. */
  country?: string;
  /** Several photographs for the opening, cross-fading slowly. */
  slides?: string[];
  /** Section headings where the weekend wording does not fit. */
  titles?: Partial<Record<'weekend' | 'practice' | 'place' | 'bring' | 'provided', T>>;
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
  {
    // Qian (Clay Garden Studio, Prenzlauer Berg) takes a small group to a
    // studio outside Jingdezhen. Programme, prices and inclusions as her
    // retreat pages publish them (claygarden.studio/ceramic-retreat-in-detail,
    // Oct 2026); the exact days in November are not fixed yet. Photos hers.
    slug: 'qian-jingdezhen',
    start: '2026-11-01',
    end: '2026-11-30',
    whenLabel: {
      en: 'November 2026', de: 'November 2026', fr: 'Novembre 2026', es: 'Noviembre de 2026',
      it: 'Novembre 2026', nl: 'November 2026', pl: 'Listopad 2026', tr: 'Kasım 2026',
    },
    country: 'CN',
    town: 'Jingdezhen',
    region: {
      en: 'Jiangxi, China · the birthplace of porcelain',
      de: 'Jiangxi, China · die Wiege des Porzellans',
      fr: 'Jiangxi, Chine · berceau de la porcelaine',
      es: 'Jiangxi, China · la cuna de la porcelana',
      it: 'Jiangxi, Cina · la culla della porcellana',
      nl: 'Jiangxi, China · de bakermat van het porselein',
      pl: 'Jiangxi, Chiny · kolebka porcelany',
      tr: 'Jiangxi, Çin · porselenin doğduğu yer',
    },
    teacher: 'Qian · Clay Garden Studio',
    language: 'ZH-EN',
    contribution: {
      en: '€1,400 single room · €1,300 per person in a double · 7 nights, meals and materials included',
      de: '1.400 € im Einzelzimmer · 1.300 € p. P. im Doppelzimmer · 7 Nächte, Essen und Material inklusive',
      fr: '1 400 € en chambre individuelle · 1 300 € par personne en chambre double · 7 nuits, repas et matériel compris',
      es: '1.400 € en habitación individual · 1.300 € por persona en doble · 7 noches, comidas y materiales incluidos',
      it: '1.400 € in camera singola · 1.300 € a persona in doppia · 7 notti, pasti e materiali inclusi',
      nl: '€ 1.400 in een eenpersoonskamer · € 1.300 p.p. in een tweepersoonskamer · 7 nachten, maaltijden en materiaal inbegrepen',
      pl: '1400 € w pokoju jednoosobowym · 1300 € za osobę w dwuosobowym · 7 nocy, posiłki i materiały w cenie',
      tr: 'Tek kişilik odada 1.400 € · çift kişilik odada kişi başı 1.300 € · 7 gece, yemekler ve malzemeler dahil',
    },
    kicker: {
      en: 'Seven-day pottery retreat · China',
      de: 'Siebentägiges Keramik-Retreat · China',
      fr: 'Retraite céramique de sept jours · Chine',
      es: 'Retiro de cerámica de siete días · China',
      it: 'Ritiro di ceramica di sette giorni · Cina',
      nl: 'Zevendaagse keramiekretraite · China',
      pl: 'Siedmiodniowy retreat ceramiczny · Chiny',
      tr: 'Yedi günlük seramik inzivası · Çin',
    },
    title: {
      en: 'Wood firing in Jingdezhen, where porcelain began',
      de: 'Holzbrand in Jingdezhen, wo das Porzellan herkommt',
      fr: 'Cuisson au bois à Jingdezhen, berceau de la porcelaine',
      es: 'Cocción en leña en Jingdezhen, la cuna de la porcelana',
      it: 'Cottura a legna a Jingdezhen, la culla della porcellana',
      nl: 'Houtstook in Jingdezhen, de bakermat van het porselein',
      pl: 'Wypał drewnem w Jingdezhen, kolebce porcelany',
      tr: 'Porselenin doğduğu yer Jingdezhen’de odun fırını',
    },
    enquiry: {
      en: 'the wood-firing retreat in Jingdezhen with Qian, November 2026',
      de: 'Holzbrand-Retreat in Jingdezhen mit Qian, November 2026',
      fr: 'la retraite de cuisson au bois à Jingdezhen avec Qian, novembre 2026',
      es: 'el retiro de cocción en leña en Jingdezhen con Qian, noviembre de 2026',
      it: 'il ritiro di cottura a legna a Jingdezhen con Qian, novembre 2026',
      nl: 'de houtstookretraite in Jingdezhen met Qian, november 2026',
      pl: 'retreat z wypałem drewnem w Jingdezhen z Qian, listopad 2026',
      tr: 'Qian ile Jingdezhen odun fırını inzivası, Kasım 2026',
    },
    lede: {
      en: 'Seven days in the hills outside Jingdezhen, the city where porcelain began: throwing and hand-building with three clays, blue-and-white Qinghua painting, and a wood kiln you help to load and fire with pinewood.',
      de: 'Sieben Tage in den Hügeln vor Jingdezhen, der Stadt, in der das Porzellan seinen Anfang nahm: Drehen und Aufbauen mit drei Tonsorten, blau-weiße Qinghua-Malerei und ein Holzofen, den du mit befüllst und mit Kiefernholz befeuerst.',
      fr: 'Sept jours dans les collines autour de Jingdezhen, la ville où est née la porcelaine : tournage et modelage avec trois terres, peinture bleu et blanc Qinghua, et un four à bois que vous aidez à charger et à chauffer au pin.',
      es: 'Siete días en las colinas de Jingdezhen, la ciudad donde nació la porcelana: torno y modelado con tres arcillas, pintura azul y blanca Qinghua y un horno de leña que ayudas a cargar y a alimentar con pino.',
      it: 'Sette giorni sulle colline intorno a Jingdezhen, la città dove è nata la porcellana: tornio e modellazione con tre argille, pittura bianca e blu Qinghua e un forno a legna che aiuti a caricare e ad alimentare con legno di pino.',
      nl: 'Zeven dagen in de heuvels rond Jingdezhen, de stad waar het porselein begon: draaien en opbouwen met drie kleisoorten, blauw-witte Qinghua-schildering en een houtoven die je helpt vullen en stoken met dennenhout.',
      pl: 'Siedem dni na wzgórzach pod Jingdezhen, miastem, w którym narodziła się porcelana: toczenie i lepienie z trzech glin, niebiesko-białe malowanie Qinghua i piec opalany drewnem, który pomagasz załadować i palić sosną.',
      tr: 'Porselenin doğduğu şehir Jingdezhen’in tepelerinde yedi gün: üç farklı kille çark ve el şekillendirme, mavi-beyaz Qinghua boyama ve doldurup çam odunuyla yakmaya yardım ettiğin bir odun fırını.',
    },
    about: {
      en: [
        'Qian, who runs Clay Garden Studio in Prenzlauer Berg, takes a small group to a studio in the countryside around Jingdezhen. An experienced local potter teaches in Chinese; Qian translates into English, works alongside you and helps beginners find their footing.',
        'No experience is needed, and practised potters will find plenty to take further. The studio is open day and night for your own work, the meals are home-cooked with local and Western dishes, and the group stays small: eight to twelve people.',
      ],
      de: [
        'Qian, die in Prenzlauer Berg das Clay Garden Studio führt, reist mit einer kleinen Gruppe in ein Studio auf dem Land rund um Jingdezhen. Unterrichtet wird von einer erfahrenen Töpferin bzw. einem erfahrenen Töpfer vor Ort auf Chinesisch; Qian übersetzt ins Englische, arbeitet mit und hilft Anfängerinnen und Anfängern beim Einstieg.',
        'Vorkenntnisse braucht es keine, und wer schon töpfert, findet genug, um weiterzukommen. Das Studio ist rund um die Uhr für eigene Projekte offen, gekocht wird hausgemacht, lokal und westlich, und die Gruppe bleibt klein: acht bis zwölf Personen.',
      ],
      fr: [
        'Qian, qui dirige le Clay Garden Studio à Prenzlauer Berg, emmène un petit groupe dans un atelier à la campagne, autour de Jingdezhen. Un céramiste expérimenté de la région enseigne en chinois ; Qian traduit en anglais, travaille à vos côtés et aide les débutants à trouver leurs repères.',
        'Aucune expérience n’est nécessaire, et les céramistes confirmés auront de quoi aller plus loin. L’atelier est ouvert jour et nuit pour vos propres projets, les repas sont faits maison, locaux et occidentaux, et le groupe reste petit : huit à douze personnes.',
      ],
      es: [
        'Qian, que dirige Clay Garden Studio en Prenzlauer Berg, lleva a un grupo pequeño a un taller en el campo, en los alrededores de Jingdezhen. Enseña un ceramista local con experiencia, en chino; Qian traduce al inglés, trabaja contigo y ayuda a quien empieza.',
        'No hace falta experiencia, y quien ya trabaja la cerámica tendrá mucho con lo que avanzar. El taller está abierto día y noche para tus propios proyectos, la comida es casera, local y occidental, y el grupo es pequeño: de ocho a doce personas.',
      ],
      it: [
        'Qian, che guida il Clay Garden Studio a Prenzlauer Berg, porta un piccolo gruppo in uno studio in campagna nei dintorni di Jingdezhen. Insegna un ceramista del posto, esperto, in cinese; Qian traduce in inglese, lavora accanto a te e aiuta chi comincia.',
        'Non serve esperienza, e chi lavora già l’argilla troverà molto con cui andare avanti. Lo studio è aperto giorno e notte per i tuoi progetti, i pasti sono fatti in casa, locali e occidentali, e il gruppo resta piccolo: da otto a dodici persone.',
      ],
      nl: [
        'Qian, die in Prenzlauer Berg Clay Garden Studio runt, neemt een kleine groep mee naar een studio op het platteland rond Jingdezhen. Een ervaren pottenbakker uit de streek geeft les in het Chinees; Qian vertaalt naar het Engels, werkt met je mee en helpt beginners op weg.',
        'Ervaring is niet nodig, en wie al met klei werkt vindt genoeg om verder te komen. De studio is dag en nacht open voor je eigen werk, er wordt zelf gekookt, lokaal en westers, en de groep blijft klein: acht tot twaalf mensen.',
      ],
      pl: [
        'Qian, która prowadzi Clay Garden Studio w Prenzlauer Berg, zabiera małą grupę do pracowni na wsi pod Jingdezhen. Uczy doświadczony miejscowy ceramik, po chińsku; Qian tłumaczy na angielski, pracuje razem z wami i pomaga początkującym.',
        'Doświadczenie nie jest potrzebne, a osoby, które już pracują z gliną, znajdą tu wiele, by pójść dalej. Pracownia jest otwarta dzień i noc dla własnych projektów, posiłki są domowe, lokalne i zachodnie, a grupa pozostaje mała: od ośmiu do dwunastu osób.',
      ],
      tr: [
        'Prenzlauer Berg’de Clay Garden Studio’yu işleten Qian, küçük bir grubu Jingdezhen çevresindeki kırsal bir atölyeye götürüyor. Dersleri deneyimli yerel bir çömlekçi Çince veriyor; Qian İngilizceye çeviriyor, seninle birlikte çalışıyor ve yeni başlayanlara yardım ediyor.',
        'Deneyim gerekmiyor; zaten kil ile çalışanlar da ilerleyecek çok şey bulacak. Atölye kendi projelerin için gece gündüz açık, yemekler ev yapımı, yerel ve Batı mutfağından, grup küçük kalıyor: sekiz ila on iki kişi.',
      ],
    },
    days: [
      { day: { en: 'Day 1', de: 'Tag 1', fr: 'Jour 1', es: 'Día 1', it: 'Giorno 1', nl: 'Dag 1', pl: 'Dzień 1', tr: '1. gün' }, hours: { en: 'About 6 hours', de: 'Rund 6 Stunden', fr: 'Environ 6 heures', es: 'Unas 6 horas', it: 'Circa 6 ore', nl: 'Ongeveer 6 uur', pl: 'Około 6 godzin', tr: 'Yaklaşık 6 saat' }, what: { en: 'Arrival, an introduction to wood firing, first practice on the wheel.', de: 'Ankunft, Einführung in den Holzbrand, erste Übungen an der Drehscheibe.', fr: 'Arrivée, introduction à la cuisson au bois, premiers pas au tour.', es: 'Llegada, introducción a la cocción en leña, primeras prácticas en el torno.', it: 'Arrivo, introduzione alla cottura a legna, primi esercizi al tornio.', nl: 'Aankomst, een introductie in houtstook, eerste oefeningen aan de draaischijf.', pl: 'Przyjazd, wprowadzenie do wypału drewnem, pierwsze ćwiczenia na kole.', tr: 'Varış, odun fırınına giriş, çarkta ilk denemeler.' } },
      { day: { en: 'Day 2', de: 'Tag 2', fr: 'Jour 2', es: 'Día 2', it: 'Giorno 2', nl: 'Dag 2', pl: 'Dzień 2', tr: '2. gün' }, hours: { en: 'About 6 hours', de: 'Rund 6 Stunden', fr: 'Environ 6 heures', es: 'Unas 6 horas', it: 'Circa 6 ore', nl: 'Ongeveer 6 uur', pl: 'Około 6 godzin', tr: 'Yaklaşık 6 saat' }, what: { en: 'A visit to a large wood-fired kiln in town; throwing and hand-building.', de: 'Besuch eines großen Holzofens in der Stadt; Drehen und Aufbauen.', fr: 'Visite d’un grand four à bois en ville ; tournage et modelage.', es: 'Visita a un gran horno de leña en la ciudad; torno y modelado.', it: 'Visita a un grande forno a legna in città; tornio e modellazione.', nl: 'Bezoek aan een grote houtoven in de stad; draaien en opbouwen.', pl: 'Wizyta przy dużym piecu na drewno w mieście; toczenie i lepienie.', tr: 'Şehirde büyük bir odun fırınına ziyaret; çark ve el şekillendirme.' } },
      { day: { en: 'Day 3', de: 'Tag 3', fr: 'Jour 3', es: 'Día 3', it: 'Giorno 3', nl: 'Dag 3', pl: 'Dzień 3', tr: '3. gün' }, hours: { en: 'About 6 hours', de: 'Rund 6 Stunden', fr: 'Environ 6 heures', es: 'Unas 6 horas', it: 'Circa 6 ore', nl: 'Ongeveer 6 uur', pl: 'Około 6 godzin', tr: 'Yaklaşık 6 saat' }, what: { en: 'Trimming, and time for your own project.', de: 'Abdrehen und Zeit für das eigene Projekt.', fr: 'Tournassage, et du temps pour votre propre projet.', es: 'Repasado y tiempo para tu propio proyecto.', it: 'Rifinitura al tornio e tempo per il tuo progetto.', nl: 'Afdraaien, en tijd voor je eigen project.', pl: 'Toczenie wykończeniowe i czas na własny projekt.', tr: 'Tornalama ve kendi projen için zaman.' } },
      { day: { en: 'Day 4', de: 'Tag 4', fr: 'Jour 4', es: 'Día 4', it: 'Giorno 4', nl: 'Dag 4', pl: 'Dzień 4', tr: '4. gün' }, hours: { en: 'About 6 hours', de: 'Rund 6 Stunden', fr: 'Environ 6 heures', es: 'Unas 6 horas', it: 'Circa 6 ore', nl: 'Ongeveer 6 uur', pl: 'Około 6 godzin', tr: 'Yaklaşık 6 saat' }, what: { en: 'Qinghua blue-and-white painting; loading the bisque kiln.', de: 'Blau-weiße Qinghua-Malerei; den Schrühofen befüllen.', fr: 'Peinture bleu et blanc Qinghua ; chargement du four de dégourdi.', es: 'Pintura azul y blanca Qinghua; carga del horno de bizcocho.', it: 'Pittura bianca e blu Qinghua; caricare il forno per la biscottatura.', nl: 'Blauw-witte Qinghua-schildering; de biscuitoven vullen.', pl: 'Niebiesko-białe malowanie Qinghua; załadunek pieca do biskwitu.', tr: 'Mavi-beyaz Qinghua boyama; bisküvi fırınını doldurmak.' } },
      { day: { en: 'Day 5', de: 'Tag 5', fr: 'Jour 5', es: 'Día 5', it: 'Giorno 5', nl: 'Dag 5', pl: 'Dzień 5', tr: '5. gün' }, hours: { en: 'About 6 hours', de: 'Rund 6 Stunden', fr: 'Environ 6 heures', es: 'Unas 6 horas', it: 'Circa 6 ore', nl: 'Ongeveer 6 uur', pl: 'Około 6 godzin', tr: 'Yaklaşık 6 saat' }, what: { en: 'Opening the bisque kiln; loading the wood kiln.', de: 'Den Schrühofen öffnen; den Holzofen befüllen.', fr: 'Ouverture du four de dégourdi ; chargement du four à bois.', es: 'Apertura del horno de bizcocho; carga del horno de leña.', it: 'Apertura del forno di biscottatura; caricare il forno a legna.', nl: 'De biscuitoven openen; de houtoven vullen.', pl: 'Otwarcie pieca do biskwitu; załadunek pieca na drewno.', tr: 'Bisküvi fırınını açmak; odun fırınını doldurmak.' } },
      { day: { en: 'Day 6', de: 'Tag 6', fr: 'Jour 6', es: 'Día 6', it: 'Giorno 6', nl: 'Dag 6', pl: 'Dzień 6', tr: '6. gün' }, hours: { en: 'About 6 hours', de: 'Rund 6 Stunden', fr: 'Environ 6 heures', es: 'Unas 6 horas', it: 'Circa 6 ore', nl: 'Ongeveer 6 uur', pl: 'Około 6 godzin', tr: 'Yaklaşık 6 saat' }, what: { en: 'Firing day: stoking the kiln with pinewood.', de: 'Brenntag: den Ofen mit Kiefernholz befeuern.', fr: 'Jour de cuisson : alimenter le four au bois de pin.', es: 'Día de cocción: alimentar el horno con madera de pino.', it: 'Giorno di cottura: alimentare il forno con legno di pino.', nl: 'Stookdag: de oven stoken met dennenhout.', pl: 'Dzień wypału: podsycanie pieca drewnem sosnowym.', tr: 'Pişirme günü: fırını çam odunuyla beslemek.' } },
      { day: { en: 'Day 7', de: 'Tag 7', fr: 'Jour 7', es: 'Día 7', it: 'Giorno 7', nl: 'Dag 7', pl: 'Dzień 7', tr: '7. gün' }, hours: { en: 'About 6 hours', de: 'Rund 6 Stunden', fr: 'Environ 6 heures', es: 'Unas 6 horas', it: 'Circa 6 ore', nl: 'Ongeveer 6 uur', pl: 'Około 6 godzin', tr: 'Yaklaşık 6 saat' }, what: { en: 'Opening the kiln, finishing touches, check-out.', de: 'Den Ofen öffnen, letzter Schliff, Abreise.', fr: 'Ouverture du four, finitions, départ.', es: 'Apertura del horno, últimos retoques y salida.', it: 'Apertura del forno, ultimi ritocchi, partenza.', nl: 'De oven openen, laatste afwerking, vertrek.', pl: 'Otwarcie pieca, ostatnie poprawki, wyjazd.', tr: 'Fırını açmak, son dokunuşlar, ayrılış.' } },
    ],
    practice: {
      en: ['Seven days of pottery classes, about six hours a day', 'The studio open around the clock for your own work', 'Three clays, porcelain and stoneware among them, and all the tools', 'Building and firing a wood kiln, hands-on', 'Seven nights in a single or double room', 'Three home-cooked meals a day, local and Western', 'A spacious studio with a view of the mountains'],
      de: ['Sieben Tage Keramikunterricht, rund sechs Stunden am Tag', 'Das Studio rund um die Uhr offen für eigene Arbeiten', 'Drei Tonsorten, darunter Porzellan und Steinzeug, und alle Werkzeuge', 'Einen Holzofen aufbauen und befeuern, mit eigenen Händen', 'Sieben Nächte im Einzel- oder Doppelzimmer', 'Drei hausgemachte Mahlzeiten am Tag, lokal und westlich', 'Ein großzügiges Studio mit Blick auf die Berge'],
      fr: ['Sept jours de cours de céramique, environ six heures par jour', 'L’atelier ouvert jour et nuit pour vos propres pièces', 'Trois terres, dont la porcelaine et le grès, et tous les outils', 'Construire et chauffer un four à bois, de vos mains', 'Sept nuits en chambre individuelle ou double', 'Trois repas faits maison par jour, locaux et occidentaux', 'Un atelier spacieux avec vue sur les montagnes'],
      es: ['Siete días de clases de cerámica, unas seis horas al día', 'El taller abierto día y noche para tus propias piezas', 'Tres arcillas, entre ellas porcelana y gres, y todas las herramientas', 'Construir y encender un horno de leña, con tus manos', 'Siete noches en habitación individual o doble', 'Tres comidas caseras al día, locales y occidentales', 'Un taller amplio con vistas a las montañas'],
      it: ['Sette giorni di lezioni di ceramica, circa sei ore al giorno', 'Lo studio aperto giorno e notte per i tuoi lavori', 'Tre argille, tra cui porcellana e gres, e tutti gli attrezzi', 'Costruire e alimentare un forno a legna, con le tue mani', 'Sette notti in camera singola o doppia', 'Tre pasti fatti in casa al giorno, locali e occidentali', 'Uno studio spazioso con vista sulle montagne'],
      nl: ['Zeven dagen keramiekles, zo’n zes uur per dag', 'De studio dag en nacht open voor je eigen werk', 'Drie kleisoorten, waaronder porselein en steengoed, en al het gereedschap', 'Een houtoven bouwen en stoken, met je eigen handen', 'Zeven nachten in een een- of tweepersoonskamer', 'Drie zelfgekookte maaltijden per dag, lokaal en westers', 'Een ruime studio met uitzicht op de bergen'],
      pl: ['Siedem dni zajęć ceramicznych, około sześciu godzin dziennie', 'Pracownia otwarta przez całą dobę dla własnych prac', 'Trzy gliny, w tym porcelana i kamionka, oraz wszystkie narzędzia', 'Budowa i wypał pieca na drewno, własnymi rękami', 'Siedem nocy w pokoju jedno- lub dwuosobowym', 'Trzy domowe posiłki dziennie, lokalne i zachodnie', 'Przestronna pracownia z widokiem na góry'],
      tr: ['Günde yaklaşık altı saat, yedi gün seramik dersi', 'Kendi işlerin için gece gündüz açık atölye', 'Porselen ve taşçanak dahil üç kil ve tüm aletler', 'Kendi ellerinle bir odun fırını kurmak ve yakmak', 'Tek ya da çift kişilik odada yedi gece', 'Günde üç ev yemeği, yerel ve Batı mutfağı', 'Dağ manzaralı ferah bir atölye'],
    },
    bring: {
      en: 'Flights and travel insurance (strongly recommended), the transfer to the retreat (airport pickup €15 per trip), optional outings to museums, factories and the ceramics market, and your visa — many nationalities can enter China visa-free for 30 days.',
      de: 'Flüge und Reiseversicherung (sehr empfohlen), die Anreise zum Retreat (Abholung am Flughafen 15 € pro Fahrt), optionale Ausflüge zu Museen, Manufakturen und zum Keramikmarkt sowie das Visum — viele Nationalitäten können 30 Tage visumfrei nach China einreisen.',
      fr: 'Les vols et l’assurance voyage (vivement conseillée), le trajet jusqu’à la retraite (accueil à l’aéroport 15 € par trajet), les sorties facultatives aux musées, manufactures et au marché de la céramique, et le visa — beaucoup de nationalités peuvent entrer en Chine sans visa pour 30 jours.',
      es: 'Los vuelos y el seguro de viaje (muy recomendable), el traslado al retiro (recogida en el aeropuerto 15 € por trayecto), las salidas opcionales a museos, fábricas y al mercado de cerámica, y el visado: muchas nacionalidades pueden entrar en China sin visado durante 30 días.',
      it: 'I voli e l’assicurazione di viaggio (vivamente consigliata), il trasferimento al ritiro (prelievo in aeroporto 15 € a tratta), le uscite facoltative a musei, manifatture e al mercato della ceramica, e il visto — molte nazionalità possono entrare in Cina senza visto per 30 giorni.',
      nl: 'Vluchten en reisverzekering (sterk aangeraden), het vervoer naar de retraite (ophalen van het vliegveld € 15 per rit), optionele uitstapjes naar musea, fabrieken en de keramiekmarkt, en je visum — veel nationaliteiten mogen 30 dagen zonder visum China in.',
      pl: 'Loty i ubezpieczenie podróżne (bardzo zalecane), dojazd na retreat (odbiór z lotniska 15 € za kurs), dodatkowe wycieczki do muzeów, manufaktur i na targ ceramiki oraz wiza — wiele narodowości może wjechać do Chin bez wizy na 30 dni.',
      tr: 'Uçak bileti ve seyahat sigortası (kesinlikle önerilir), inzivaya ulaşım (havaalanı karşılama sefer başı 15 €), müze, fabrika ve seramik pazarına isteğe bağlı geziler ve vize — birçok ülke vatandaşı Çin’e 30 gün vizesiz girebiliyor.',
    },
    provided: {
      en: 'Classes, clay, tools and firing; seven nights’ accommodation and three meals a day. A month before you travel you receive a preparation guide with apps and travel tips, and a short survey on transport and diet.',
      de: 'Unterricht, Ton, Werkzeug und Brand; sieben Nächte Unterkunft und drei Mahlzeiten am Tag. Einen Monat vor der Reise bekommst du einen Leitfaden mit Apps und Reisetipps und eine kurze Umfrage zu Anreise und Ernährung.',
      fr: 'Cours, terre, outils et cuisson ; sept nuits d’hébergement et trois repas par jour. Un mois avant le départ, vous recevez un guide de préparation (applis, conseils de voyage) et un court questionnaire sur le transport et l’alimentation.',
      es: 'Clases, arcilla, herramientas y cocción; siete noches de alojamiento y tres comidas al día. Un mes antes del viaje recibes una guía de preparación con apps y consejos, y una breve encuesta sobre transporte y dieta.',
      it: 'Lezioni, argilla, attrezzi e cottura; sette notti di alloggio e tre pasti al giorno. Un mese prima della partenza ricevi una guida con app e consigli di viaggio e un breve questionario su trasporti e alimentazione.',
      nl: 'Lessen, klei, gereedschap en stook; zeven nachten verblijf en drie maaltijden per dag. Een maand voor vertrek krijg je een voorbereidingsgids met apps en reistips, en een korte vragenlijst over vervoer en eten.',
      pl: 'Zajęcia, glina, narzędzia i wypał; siedem nocy noclegu i trzy posiłki dziennie. Miesiąc przed wyjazdem dostajesz przewodnik z aplikacjami i wskazówkami oraz krótką ankietę o transporcie i diecie.',
      tr: 'Dersler, kil, aletler ve pişirme; yedi gece konaklama ve günde üç öğün. Yolculuktan bir ay önce uygulamalar ve seyahat ipuçlarıyla bir hazırlık rehberi ve ulaşım ile beslenme hakkında kısa bir anket alırsın.',
    },
    house: {
      en: 'A spacious studio in the countryside around Jingdezhen, wheels in a row under a wide window onto the trees, single and double rooms, and a wood kiln the group loads and fires together beneath the mountain.',
      de: 'Ein großzügiges Studio auf dem Land rund um Jingdezhen, Drehscheiben in einer Reihe unter einem breiten Fenster ins Grüne, Einzel- und Doppelzimmer und ein Holzofen am Fuß des Berges, den die Gruppe gemeinsam befüllt und befeuert.',
      fr: 'Un atelier spacieux à la campagne autour de Jingdezhen, des tours alignés sous une large fenêtre ouverte sur les arbres, des chambres individuelles et doubles, et un four à bois au pied de la montagne que le groupe charge et chauffe ensemble.',
      es: 'Un taller amplio en el campo de Jingdezhen, tornos en fila bajo un gran ventanal a los árboles, habitaciones individuales y dobles y un horno de leña al pie de la montaña que el grupo carga y enciende junto.',
      it: 'Uno studio spazioso nella campagna di Jingdezhen, torni in fila sotto un’ampia finestra sugli alberi, camere singole e doppie e un forno a legna ai piedi della montagna che il gruppo carica e alimenta insieme.',
      nl: 'Een ruime studio op het platteland rond Jingdezhen, draaischijven op een rij onder een breed raam op de bomen, een- en tweepersoonskamers en een houtoven aan de voet van de berg die de groep samen vult en stookt.',
      pl: 'Przestronna pracownia na wsi pod Jingdezhen, koła garncarskie w rzędzie pod szerokim oknem na drzewa, pokoje jedno- i dwuosobowe oraz piec na drewno u stóp góry, który grupa wspólnie ładuje i pali.',
      tr: 'Jingdezhen kırsalında ferah bir atölye; ağaçlara bakan geniş bir pencerenin altında sıralı çarklar, tek ve çift kişilik odalar ve dağın eteğinde grubun birlikte doldurup yaktığı bir odun fırını.',
    },
    titles: {
      weekend: { en: 'Seven days', de: 'Sieben Tage', fr: 'Sept jours', es: 'Siete días', it: 'Sette giorni', nl: 'Zeven dagen', pl: 'Siedem dni', tr: 'Yedi gün' },
      practice: { en: 'What’s included', de: 'Was inbegriffen ist', fr: 'Ce qui est compris', es: 'Qué incluye', it: 'Cosa è incluso', nl: 'Wat is inbegrepen', pl: 'Co jest w cenie', tr: 'Neler dahil' },
      place: { en: 'The studio', de: 'Das Studio', fr: 'L’atelier', es: 'El taller', it: 'Lo studio', nl: 'De studio', pl: 'Pracownia', tr: 'Atölye' },
      bring: { en: 'Not included', de: 'Nicht inbegriffen', fr: 'Non compris', es: 'No incluido', it: 'Non incluso', nl: 'Niet inbegrepen', pl: 'Nie w cenie', tr: 'Dahil olmayanlar' },
      provided: { en: 'Included, and sent ahead', de: 'Inklusive, und vorab', fr: 'Compris, et envoyé avant', es: 'Incluido, y enviado antes', it: 'Incluso, e inviato prima', nl: 'Inbegrepen, en vooraf', pl: 'W cenie i wysyłane wcześniej', tr: 'Dahil olanlar ve önceden gönderilenler' },
    },
    hero: '/img/retreats/jingdezhen-fire.jpg',
    slides: [
      '/img/retreats/jingdezhen-fire.jpg',
      '/img/retreats/jingdezhen-kiln.jpg',
      '/img/retreats/jingdezhen-studio.jpg',
      '/img/retreats/jingdezhen-window.jpg',
    ],
    gallery: [
      { src: '/img/retreats/jingdezhen-rooms.jpg', alt: { en: 'The rooms at the retreat', de: 'Die Zimmer im Retreat', fr: 'Les chambres de la retraite', es: 'Las habitaciones del retiro', it: 'Le camere del ritiro', nl: 'De kamers van de retraite', pl: 'Pokoje na retreacie', tr: 'İnzivadaki odalar' } },
      { src: '/img/retreats/jingdezhen-food.jpg', alt: { en: 'Home-cooked meals', de: 'Hausgemachtes Essen', fr: 'Repas faits maison', es: 'Comida casera', it: 'Pasti fatti in casa', nl: 'Zelfgekookte maaltijden', pl: 'Domowe posiłki', tr: 'Ev yemekleri' } },
      { src: '/img/retreats/jingdezhen-views.jpg', alt: { en: 'Evenings and mornings around the studio', de: 'Abende und Morgen rund ums Studio', fr: 'Soirs et matins autour de l’atelier', es: 'Tardes y mañanas alrededor del taller', it: 'Sere e mattine intorno allo studio', nl: 'Avonden en ochtenden rond de studio', pl: 'Wieczory i poranki wokół pracowni', tr: 'Atölye çevresinde akşamlar ve sabahlar' } },
      { src: '/img/retreats/jingdezhen-cup.jpg', alt: { en: 'A wood-fired cup', de: 'Eine holzgebrannte Schale', fr: 'Une coupe cuite au bois', es: 'Un cuenco cocido en leña', it: 'Una tazza cotta a legna', nl: 'Een houtgestookt kommetje', pl: 'Czarka wypalona w piecu na drewno', tr: 'Odun fırınında pişmiş bir fincan' } },
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
    lede: 'Small retreats with teachers we know — in quiet houses outside the city or further afield: meditation, yoga, pottery and silence. Ask us for the details and we look after the rest.',
    view: 'Discover the retreat', all: 'All retreats',
    labels: { dates: 'Dates', where: 'Where', teacher: 'Teacher', language: 'Language', contribution: 'Contribution' },
    languages: { DE: 'German', EN: 'English', 'ZH-EN': 'Chinese, translated into English' },
    weekend: 'The weekend', practice: 'What you practise', place: 'The house',
    goodToKnow: 'Good to know', bring: 'Please bring', provided: 'Already there',
    cta: 'Request information', ctaTitle: 'Join the retreat',
    ctaNote: 'Tell us how many of you would like to come and anything you would like to know. We come back to you with all the details, and confirm your place when you are ready.',
    soon: 'More retreats are on their way.',
  },
  de: {
    nav: 'Retreats',
    title: 'Retreats — Meditations- und Yoga-Wochenenden mit unseren Lehrenden | Twiggli',
    description: 'Kleine Retreats mit Lehrenden, die wir kennen: Meditation, Yoga und Stille in ruhigen Häusern außerhalb der Stadt. Platz anfragen, den Rest organisieren wir.',
    kicker: 'Retreats', h1: 'Zeit für dich, mit einem Lehrer',
    lede: 'Kleine Retreats mit Lehrenden, die wir kennen — in stillen Häusern außerhalb der Stadt oder weiter weg: Meditation, Yoga, Keramik und Stille. Frag uns nach den Details, um den Rest kümmern wir uns.',
    view: 'Retreat entdecken', all: 'Alle Retreats',
    labels: { dates: 'Termin', where: 'Ort', teacher: 'Lehrer', language: 'Sprache', contribution: 'Beitrag' },
    languages: { DE: 'Deutsch', EN: 'Englisch', 'ZH-EN': 'Chinesisch, mit Übersetzung ins Englische' },
    weekend: 'Das Wochenende', practice: 'Was du übst', place: 'Das Haus',
    goodToKnow: 'Gut zu wissen', bring: 'Bitte mitbringen', provided: 'Schon da',
    cta: 'Informationen anfragen', ctaTitle: 'Beim Retreat dabei sein',
    ctaNote: 'Schreib uns, mit wie vielen Personen du kommen möchtest und was du wissen willst. Wir melden uns mit allen Details und bestätigen deinen Platz, sobald du so weit bist.',
    soon: 'Weitere Retreats sind in Vorbereitung.',
  },
  fr: {
    nav: 'Retraites',
    title: 'Retraites — week-ends de méditation et de yoga avec nos enseignants | Twiggli',
    description: 'De petites retraites avec des enseignants que nous connaissons : méditation, yoga et silence dans des maisons calmes hors de la ville. Demandez une place, nous nous occupons du reste.',
    kicker: 'Retraites', h1: 'Du temps à soi, avec un enseignant',
    lede: 'De petites retraites avec des enseignants que nous connaissons — dans des maisons calmes hors de la ville ou plus loin : méditation, yoga, céramique et silence. Demandez-nous les détails, nous nous occupons du reste.',
    view: 'Découvrir la retraite', all: 'Toutes les retraites',
    labels: { dates: 'Dates', where: 'Lieu', teacher: 'Enseignant', language: 'Langue', contribution: 'Participation' },
    languages: { DE: 'Allemand', EN: 'Anglais', 'ZH-EN': 'Chinois, traduit en anglais' },
    weekend: 'Le week-end', practice: 'Ce que vous pratiquez', place: 'La maison',
    goodToKnow: 'Bon à savoir', bring: 'À apporter', provided: 'Déjà sur place',
    cta: 'Demander des informations', ctaTitle: 'Rejoindre la retraite',
    ctaNote: 'Dites-nous combien vous seriez et ce que vous aimeriez savoir. Nous revenons vers vous avec tous les détails et confirmons votre place quand vous êtes prêt·e.',
    soon: 'D’autres retraites arrivent bientôt.',
  },
  es: {
    nav: 'Retiros',
    title: 'Retiros — fines de semana de meditación y yoga con nuestros maestros | Twiggli',
    description: 'Retiros pequeños con maestros que conocemos: meditación, yoga y silencio en casas tranquilas fuera de la ciudad. Solicita una plaza y nosotros nos ocupamos del resto.',
    kicker: 'Retiros', h1: 'Tiempo para ti, con un maestro',
    lede: 'Pequeños retiros con profesores que conocemos, en casas tranquilas fuera de la ciudad o más lejos: meditación, yoga, cerámica y silencio. Pídenos los detalles y nos ocupamos del resto.',
    view: 'Descubrir el retiro', all: 'Todos los retiros',
    labels: { dates: 'Fechas', where: 'Lugar', teacher: 'Maestro', language: 'Idioma', contribution: 'Aportación' },
    languages: { DE: 'Alemán', EN: 'Inglés', 'ZH-EN': 'Chino, con traducción al inglés' },
    weekend: 'El fin de semana', practice: 'Qué practicas', place: 'La casa',
    goodToKnow: 'Conviene saber', bring: 'Trae, por favor', provided: 'Ya disponible',
    cta: 'Solicitar información', ctaTitle: 'Únete al retiro',
    ctaNote: 'Cuéntanos cuántas personas queréis venir y qué te gustaría saber. Te escribimos con todos los detalles y confirmamos tu plaza cuando lo decidas.',
    soon: 'Pronto llegarán más retiros.',
  },
  it: {
    nav: 'Ritiri',
    title: 'Ritiri — fine settimana di meditazione e yoga con i nostri insegnanti | Twiggli',
    description: 'Piccoli ritiri con insegnanti che conosciamo: meditazione, yoga e silenzio in case tranquille fuori città. Richiedi un posto, al resto pensiamo noi.',
    kicker: 'Ritiri', h1: 'Tempo per te, con un insegnante',
    lede: 'Piccoli ritiri con insegnanti che conosciamo, in case tranquille fuori città o più lontano: meditazione, yoga, ceramica e silenzio. Chiedici i dettagli e al resto pensiamo noi.',
    view: 'Scopri il ritiro', all: 'Tutti i ritiri',
    labels: { dates: 'Date', where: 'Luogo', teacher: 'Insegnante', language: 'Lingua', contribution: 'Contributo' },
    languages: { DE: 'Tedesco', EN: 'Inglese', 'ZH-EN': 'Cinese, tradotto in inglese' },
    weekend: 'Il fine settimana', practice: 'Cosa pratichi', place: 'La casa',
    goodToKnow: 'Da sapere', bring: 'Da portare', provided: 'Già presente',
    cta: 'Richiedi informazioni', ctaTitle: 'Partecipa al ritiro',
    ctaNote: 'Dicci in quanti vorreste venire e cosa ti piacerebbe sapere. Ti rispondiamo con tutti i dettagli e confermiamo il tuo posto quando sei pronto.',
    soon: 'Altri ritiri sono in arrivo.',
  },
  nl: {
    nav: 'Retraites',
    title: 'Retraites — meditatie- en yogaweekenden met onze leraren | Twiggli',
    description: 'Kleine retraites met leraren die we kennen: meditatie, yoga en stilte in rustige huizen buiten de stad. Vraag een plek aan, wij regelen de rest.',
    kicker: 'Retraites', h1: 'Tijd voor jezelf, met een leraar',
    lede: 'Kleine retraites met leraren die we kennen — in stille huizen buiten de stad of verder weg: meditatie, yoga, keramiek en stilte. Vraag ons naar de details, wij regelen de rest.',
    view: 'Ontdek de retraite', all: 'Alle retraites',
    labels: { dates: 'Data', where: 'Waar', teacher: 'Leraar', language: 'Taal', contribution: 'Bijdrage' },
    languages: { DE: 'Duits', EN: 'Engels', 'ZH-EN': 'Chinees, vertaald naar het Engels' },
    weekend: 'Het weekend', practice: 'Wat je beoefent', place: 'Het huis',
    goodToKnow: 'Goed om te weten', bring: 'Graag meenemen', provided: 'Al aanwezig',
    cta: 'Informatie aanvragen', ctaTitle: 'Doe mee aan de retraite',
    ctaNote: 'Laat ons weten met hoeveel je wilt komen en wat je wilt weten. We sturen je alle details en bevestigen je plek zodra je zover bent.',
    soon: 'Er komen meer retraites aan.',
  },
  pl: {
    nav: 'Retreaty',
    title: 'Retreaty — weekendy medytacji i jogi z naszymi nauczycielami | Twiggli',
    description: 'Kameralne retreaty z nauczycielami, których znamy: medytacja, joga i cisza w spokojnych domach poza miastem. Zapytaj o miejsce, resztą zajmiemy się my.',
    kicker: 'Retreaty', h1: 'Czas dla siebie, z nauczycielem',
    lede: 'Małe retreaty z nauczycielami, których znamy — w cichych domach za miastem albo dalej: medytacja, joga, ceramika i cisza. Zapytaj nas o szczegóły, a resztą zajmiemy się my.',
    view: 'Poznaj retreat', all: 'Wszystkie retreaty',
    labels: { dates: 'Termin', where: 'Miejsce', teacher: 'Nauczyciel', language: 'Język', contribution: 'Wkład' },
    languages: { DE: 'Niemiecki', EN: 'Angielski', 'ZH-EN': 'Chiński, z tłumaczeniem na angielski' },
    weekend: 'Weekend', practice: 'Co praktykujesz', place: 'Dom',
    goodToKnow: 'Warto wiedzieć', bring: 'Prosimy zabrać', provided: 'Na miejscu',
    cta: 'Poproś o informacje', ctaTitle: 'Dołącz do retreatu',
    ctaNote: 'Napisz, ile osób chce przyjechać i co chcesz wiedzieć. Odpiszemy ze wszystkimi szczegółami i potwierdzimy miejsce, gdy będziesz gotowy.',
    soon: 'Kolejne retreaty są w przygotowaniu.',
  },
  tr: {
    nav: 'İnzivalar',
    title: 'İnzivalar — öğretmenlerimizle meditasyon ve yoga hafta sonları | Twiggli',
    description: 'Tanıdığımız öğretmenlerle küçük inzivalar: şehir dışındaki sakin evlerde meditasyon, yoga ve sessizlik. Yer isteyin, gerisini biz ayarlayalım.',
    kicker: 'İnzivalar', h1: 'Bir öğretmenle, kendine ayrılan zaman',
    lede: 'Tanıdığımız öğretmenlerle küçük inzivalar; şehrin dışındaki sakin evlerde ya da daha uzakta: meditasyon, yoga, seramik ve sessizlik. Ayrıntıları bize sor, gerisini biz hallederiz.',
    view: 'İnzivayı keşfet', all: 'Tüm inzivalar',
    labels: { dates: 'Tarih', where: 'Yer', teacher: 'Öğretmen', language: 'Dil', contribution: 'Katkı' },
    languages: { DE: 'Almanca', EN: 'İngilizce', 'ZH-EN': 'Çince, İngilizceye çeviriyle' },
    weekend: 'Hafta sonu', practice: 'Neler pratik edeceksin', place: 'Ev',
    goodToKnow: 'Bilmekte fayda var', bring: 'Lütfen getirin', provided: 'Zaten mevcut',
    cta: 'Bilgi iste', ctaTitle: 'İnzivaya katıl',
    ctaNote: 'Kaç kişi gelmek istediğinizi ve neyi bilmek istediğini yaz. Tüm ayrıntılarla dönelim ve hazır olduğunda yerini onaylayalım.',
    soon: 'Yeni inzivalar yolda.',
  },
};
