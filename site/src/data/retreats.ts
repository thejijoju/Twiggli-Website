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
  {
    // Nina Kranz (Kranz Art, Berlin & Kassel) lists three multi-day retreats
    // on ninakranzart.com/retreatsuebersicht. Dates, places, programme,
    // prices and inclusions as her pages gave them on 22.10.2026 (read via
    // the probe-page workflow). Her early-bird prices ran until 10.10.2026,
    // so the regular ones are given. The photos are from her retreat pages.
    slug: 'nina-segelboot-tuerkei',
    start: '2027-05-15',
    end: '2027-05-22',
    country: 'TR',
    town: 'Fethiye',
    region: {
      en: 'Turkey · aboard the gulet Larin Su, along the Lycian coast',
      de: 'Türkei · an Bord der Gulet Larin Su, entlang der lykischen Küste',
      fr: 'Turquie · à bord de la goélette Larin Su, le long de la côte lycienne',
      es: 'Turquía · a bordo de la goleta Larin Su, por la costa licia',
      it: 'Turchia · a bordo del caicco Larin Su, lungo la costa licia',
      nl: 'Turkije · aan boord van de gulet Larin Su, langs de Lycische kust',
      pl: 'Turcja · na pokładzie guleta Larin Su, wzdłuż wybrzeża Licji',
      tr: 'Türkiye · Larin Su guletinde, Likya kıyısı boyunca',
    },
    teacher: 'Nina Kranz',
    language: 'DE',
    contribution: {
      en: '€2,199 in a shared cabin · €2,650 in a single cabin',
      de: '2.199 € im Doppelzimmer · 2.650 € im Einzelzimmer',
      fr: '2 199 € en cabine double · 2 650 € en cabine individuelle',
      es: '2.199 € en camarote doble · 2.650 € en camarote individual',
      it: '2.199 € in cabina doppia · 2.650 € in cabina singola',
      nl: '€ 2.199 in een tweepersoonshut · € 2.650 in een eenpersoonshut',
      pl: '2199 € w kajucie dwuosobowej · 2650 € w kajucie jednoosobowej',
      tr: 'Çift kişilik kamarada 2.199 € · tek kişilik kamarada 2.650 €',
    },
    kicker: {
      en: 'Eight days for women · sound & mindset on a sailing boat',
      de: 'Acht Tage für Frauen · Klang & Mindset auf dem Segelboot',
      fr: 'Huit jours entre femmes · son et état d’esprit sur un voilier',
      es: 'Ocho días para mujeres · sonido y mindset en un velero',
      it: 'Otto giorni per donne · suono e mindset in barca a vela',
      nl: 'Acht dagen voor vrouwen · klank & mindset op een zeilboot',
      pl: 'Osiem dni dla kobiet · dźwięk i mindset na żaglówce',
      tr: 'Kadınlar için sekiz gün · yelkenlide ses ve zihin çalışması',
    },
    title: {
      en: 'A sailing-boat retreat in Turkey',
      de: 'Segelbootretreat in der Türkei',
      fr: 'Une retraite en voilier en Turquie',
      es: 'Un retiro en velero en Turquía',
      it: 'Un ritiro in barca a vela in Turchia',
      nl: 'Een zeilbootretraite in Turkije',
      pl: 'Retreat na żaglówce w Turcji',
      tr: 'Türkiye’de bir yelkenli inzivası',
    },
    enquiry: {
      en: 'the sailing-boat retreat in Turkey with Nina Kranz, 15–22 May 2027',
      de: 'Segelbootretreat in der Türkei mit Nina Kranz, 15.–22. Mai 2027',
      fr: 'la retraite en voilier en Turquie avec Nina Kranz, du 15 au 22 mai 2027',
      es: 'el retiro en velero en Turquía con Nina Kranz, del 15 al 22 de mayo de 2027',
      it: 'il ritiro in barca a vela in Turchia con Nina Kranz, dal 15 al 22 maggio 2027',
      nl: 'de zeilbootretraite in Turkije met Nina Kranz, 15–22 mei 2027',
      pl: 'retreat na żaglówce w Turcji z Niną Kranz, 15–22 maja 2027',
      tr: 'Nina Kranz ile Türkiye’de yelkenli inzivası, 15–22 Mayıs 2027',
    },
    lede: {
      en: 'Twelve women, one boat all to ourselves: a week sailing out of Fethiye and back with Nina Kranz, art therapist and sound facilitator, and the coach Saskia — sound journeys on deck, mindset work, and time to do nothing at all.',
      de: 'Zwölf Frauen, ein Schiff ganz für uns: eine Woche von Fethiye aus und zurück mit Nina Kranz, Kunsttherapeutin und Soundbath Facilitator, und dem Coach Saskia — Klangreisen an Deck, Mindsetarbeit und Zeit, einfach nichts zu tun.',
      fr: 'Douze femmes, un bateau rien que pour nous : une semaine de navigation au départ de Fethiye avec Nina Kranz, art-thérapeute et praticienne du son, et la coach Saskia — voyages sonores sur le pont, travail sur l’état d’esprit et du temps pour ne rien faire.',
      es: 'Doce mujeres y un barco solo para nosotras: una semana navegando desde Fethiye y de vuelta con Nina Kranz, arteterapeuta y facilitadora de baños de sonido, y la coach Saskia — viajes sonoros en cubierta, trabajo de mindset y tiempo para no hacer nada.',
      it: 'Dodici donne, una barca tutta per noi: una settimana in navigazione da Fethiye e ritorno con Nina Kranz, arteterapeuta e facilitatrice di bagni sonori, e la coach Saskia — viaggi sonori in coperta, lavoro sul mindset e tempo per non fare niente.',
      nl: 'Twaalf vrouwen, één boot helemaal voor ons: een week zeilen vanuit Fethiye en terug met Nina Kranz, kunsttherapeut en soundbath-begeleider, en coach Saskia — klankreizen aan dek, mindsetwerk en tijd om niets te doen.',
      pl: 'Dwanaście kobiet i łódź tylko dla nas: tydzień żeglugi z Fethiye i z powrotem z Niną Kranz, arteterapeutką i prowadzącą kąpiele dźwiękowe, oraz coachką Saskią — podróże dźwiękowe na pokładzie, praca z mindsetem i czas na nicnierobienie.',
      tr: 'On iki kadın, tamamen bize ait bir tekne: sanat terapisti ve ses banyosu kolaylaştırıcısı Nina Kranz ile koç Saskia eşliğinde Fethiye’den çıkıp yine oraya dönen bir hafta — güvertede ses yolculukları, zihin çalışması ve hiçbir şey yapmamaya zaman.',
    },
    about: {
      en: [
        'No programme rushing you through the day: this week is for taking real time for yourself. It rests on three parts. Sound relaxation, again and again on deck — you lie down, close your eyes and let the sound move through you. Mindset work in small, clear sessions on three themes: the wheel of life, your values, and manifesting what you want for the time ahead, without pressure. And stillness: hours in which nothing is asked of you.',
        'Nina is an art and creativity therapist, NLP coach and sound facilitator; Saskia is a soul and mindset coach and human design guide. The boat, the Larin Su, is ours for the whole week, with room for circles on deck and room to withdraw. A crew looks after the boat and a cook makes Turkish food fresh every day. There is wifi on board.',
        'At most twelve women take part, so there is room for each one. No experience is needed — only openness. Women travelling alone are welcome; your cabin mate is matched with care and you meet her on a first call.',
      ],
      de: [
        'Kein Programm, das dich durch den Tag hetzt: Diese Woche ist dafür da, dir wirklich Zeit für dich zu nehmen. Sie ruht auf drei Bausteinen. Klangentspannung, immer wieder an Deck — du liegst da, schließt die Augen und lässt den Klang durch dich hindurchgehen. Mindsetarbeit in kleinen, klaren Einheiten zu drei Themen: Lebensrad, Werte und Manifestieren dessen, was du dir für die kommende Zeit wünschst, ohne Druck. Und Stille: Stunden, in denen nichts von dir verlangt wird.',
        'Nina ist Kunst- und Kreativitätstherapeutin, NLP Coach und Soundbath Facilitator; Saskia ist Soul- und Mindset-Coach und Human Design Guide. Das Schiff, die Larin Su, gehört die ganze Woche uns, mit Platz für Circles an Deck und Rückzugsorten. Eine Crew kümmert sich um das Schiff, ein eigener Koch kocht jeden Tag frisch auf türkische Art. WLAN gibt es an Bord.',
        'Es sind höchstens zwölf Frauen an Bord, so bleibt Raum für jede Einzelne. Vorerfahrung brauchst du nicht, nur Offenheit. Wer allein anreist, ist genau richtig; deine Kabinenpartnerin wird mit Bedacht ausgewählt, und ihr lernt euch beim ersten gemeinsamen Call kennen.',
      ],
      fr: [
        'Pas de programme qui vous presse : cette semaine sert à prendre vraiment du temps pour soi. Elle repose sur trois piliers. La relaxation sonore, régulièrement sur le pont — allongée, les yeux fermés, vous laissez le son vous traverser. Le travail sur l’état d’esprit, en petites séances claires autour de trois thèmes : la roue de la vie, vos valeurs, et la manifestation de ce que vous souhaitez pour la suite, sans pression. Et le calme : des heures où l’on ne vous demande rien.',
        'Nina est art-thérapeute, coach PNL et praticienne du bain sonore ; Saskia est coach « soul & mindset » et guide en Human Design. Le bateau, le Larin Su, est à nous toute la semaine, avec de la place pour les cercles sur le pont et pour se retirer. Un équipage s’occupe du bateau et un cuisinier prépare chaque jour une cuisine turque fraîche. Il y a le wifi à bord.',
        'Douze femmes au plus participent, pour laisser de la place à chacune. Aucune expérience n’est nécessaire, seulement de l’ouverture. Les femmes qui voyagent seules sont les bienvenues ; votre partenaire de cabine est choisie avec soin et vous la rencontrez lors d’un premier appel.',
      ],
      es: [
        'Ningún programa que te lleve con prisa: esta semana es para tomarte de verdad tiempo para ti. Se apoya en tres pilares. Relajación con sonido, una y otra vez en cubierta: te tumbas, cierras los ojos y dejas que el sonido te atraviese. Trabajo de mindset en sesiones breves y claras sobre tres temas: la rueda de la vida, tus valores y manifestar lo que deseas para la etapa que viene, sin presión. Y quietud: horas en las que no se te pide nada.',
        'Nina es terapeuta de arte y creatividad, coach de PNL y facilitadora de baños de sonido; Saskia es coach de alma y mindset y guía de diseño humano. El barco, la Larin Su, es nuestro toda la semana, con espacio para círculos en cubierta y para retirarse. Una tripulación se ocupa del barco y un cocinero prepara cada día comida turca fresca. Hay wifi a bordo.',
        'Participan como máximo doce mujeres, para que haya espacio para cada una. No hace falta experiencia, solo apertura. Si viajas sola, estás en el lugar adecuado: tu compañera de camarote se elige con cuidado y la conoces en una primera videollamada.',
      ],
      it: [
        'Nessun programma che ti fa correre: questa settimana serve a prenderti davvero tempo per te. Si regge su tre pilastri. Il rilassamento sonoro, più volte in coperta: ti sdrai, chiudi gli occhi e lasci che il suono ti attraversi. Il lavoro sul mindset, in sessioni brevi e chiare su tre temi: la ruota della vita, i tuoi valori e il manifestare ciò che desideri per il periodo che viene, senza pressione. E il silenzio: ore in cui non ti si chiede nulla.',
        'Nina è arteterapeuta, coach PNL e facilitatrice di bagni sonori; Saskia è coach di anima e mindset e guida di Human Design. La barca, la Larin Su, è nostra per tutta la settimana, con spazio per i cerchi in coperta e per ritirarsi. Un equipaggio si occupa della barca e un cuoco prepara ogni giorno cucina turca fresca. A bordo c’è il wifi.',
        'Partecipano al massimo dodici donne, così c’è spazio per ciascuna. Non serve esperienza, solo apertura. Chi viaggia da sola è benvenuta: la compagna di cabina viene scelta con cura e la conosci in una prima videochiamata.',
      ],
      nl: [
        'Geen programma dat je door de dag jaagt: deze week is om echt tijd voor jezelf te nemen. Ze rust op drie pijlers. Klankontspanning, steeds weer aan dek — je ligt, sluit je ogen en laat de klank door je heen gaan. Mindsetwerk in korte, heldere sessies over drie thema’s: het levenswiel, je waarden en manifesteren wat je wilt voor de komende tijd, zonder druk. En stilte: uren waarin niets van je gevraagd wordt.',
        'Nina is kunst- en creativiteitstherapeut, NLP-coach en soundbath-begeleider; Saskia is soul- en mindsetcoach en Human Design-gids. De boot, de Larin Su, is de hele week van ons, met ruimte voor kringen aan dek en om je terug te trekken. Een bemanning zorgt voor de boot en een eigen kok kookt elke dag vers op Turkse wijze. Er is wifi aan boord.',
        'Er doen hoogstens twaalf vrouwen mee, zodat er ruimte is voor ieder. Ervaring is niet nodig, alleen openheid. Kom je alleen, dan zit je hier goed; je hutgenote wordt met zorg gekozen en je leert haar kennen in een eerste gezamenlijke call.',
      ],
      pl: [
        'Żadnego programu, który goni cię przez dzień: ten tydzień jest po to, by naprawdę dać sobie czas. Opiera się na trzech filarach. Relaksacja dźwiękiem, wielokrotnie na pokładzie — leżysz, zamykasz oczy i pozwalasz, by dźwięk przez ciebie przepływał. Praca z mindsetem w krótkich, jasnych sesjach na trzy tematy: koło życia, twoje wartości i manifestowanie tego, czego chcesz na nadchodzący czas, bez presji. I cisza: godziny, w których nikt niczego od ciebie nie oczekuje.',
        'Nina jest terapeutką sztuką i kreatywnością, coachką NLP i prowadzącą kąpiele dźwiękowe; Saskia jest coachką soul & mindset i przewodniczką Human Design. Łódź Larin Su należy do nas przez cały tydzień, z miejscem na kręgi na pokładzie i na wyciszenie. Załoga dba o łódź, a kucharz codziennie gotuje świeżo po turecku. Na pokładzie jest wifi.',
        'Bierze udział najwyżej dwanaście kobiet, by każda miała swoją przestrzeń. Doświadczenie nie jest potrzebne, wystarczy otwartość. Jeśli jedziesz sama, to miejsce dla ciebie; współlokatorkę kajuty dobieramy starannie i poznajesz ją na pierwszej wspólnej rozmowie online.',
      ],
      tr: [
        'Seni gün boyu koşturan bir program yok: bu hafta gerçekten kendine zaman ayırmak için. Üç temele dayanır. Güvertede tekrar tekrar ses rahatlaması — uzanır, gözlerini kapatır ve sesin içinden geçmesine izin verirsin. Üç konu üzerine kısa ve net oturumlarla zihin çalışması: yaşam çarkı, değerlerin ve önümüzdeki dönem için istediklerini baskı olmadan somutlaştırmak. Ve sessizlik: senden hiçbir şey beklenmeyen saatler.',
        'Nina sanat ve yaratıcılık terapisti, NLP koçu ve ses banyosu kolaylaştırıcısıdır; Saskia ruh ve zihin koçu ve Human Design rehberidir. Larin Su teknesi bütün hafta bizimdir; güvertede çemberler ve kendi başına kalmak için yer vardır. Mürettebat tekneyle ilgilenir, bir aşçı her gün taze Türk yemekleri pişirir. Teknede wifi vardır.',
        'En fazla on iki kadın katılır, böylece herkese yer kalır. Deneyim gerekmez, yalnızca açıklık. Yalnız geliyorsan tam yerindesin; kamara arkadaşın özenle seçilir ve onunla ilk ortak görüntülü görüşmede tanışırsın.',
      ],
    },
    days: [
      {
        day: { en: 'Day 1 · Fethiye', de: 'Tag 1 · Fethiye', fr: 'Jour 1 · Fethiye', es: 'Día 1 · Fethiye', it: 'Giorno 1 · Fethiye', nl: 'Dag 1 · Fethiye', pl: 'Dzień 1 · Fethiye', tr: '1. gün · Fethiye' },
        hours: { en: 'Saturday 15 May', de: 'Samstag, 15. Mai', fr: 'Samedi 15 mai', es: 'Sábado 15 de mayo', it: 'Sabato 15 maggio', nl: 'Zaterdag 15 mei', pl: 'Sobota, 15 maja', tr: '15 Mayıs Cumartesi' },
        what: {
          en: 'Boarding and settling in, a short briefing at sunset, the first dinner together and a first short sound relaxation on deck. The night in Fethiye harbour.',
          de: 'An Bord gehen und einrichten, ein kurzes Briefing bei Sonnenuntergang, das erste gemeinsame Abendessen und eine erste kurze Klangentspannung an Deck. Die Nacht im Hafen von Fethiye.',
          fr: 'Embarquement et installation, un court briefing au coucher du soleil, le premier dîner ensemble et une première courte relaxation sonore sur le pont. Nuit au port de Fethiye.',
          es: 'Embarque e instalación, una breve reunión al atardecer, la primera cena juntas y una primera relajación con sonido en cubierta. Noche en el puerto de Fethiye.',
          it: 'Imbarco e sistemazione, un breve briefing al tramonto, la prima cena insieme e un primo breve rilassamento sonoro in coperta. Notte nel porto di Fethiye.',
          nl: 'Aan boord gaan en installeren, een korte briefing bij zonsondergang, het eerste diner samen en een eerste korte klankontspanning aan dek. De nacht in de haven van Fethiye.',
          pl: 'Zaokrętowanie i rozgoszczenie się, krótka odprawa o zachodzie słońca, pierwsza wspólna kolacja i pierwsza krótka relaksacja dźwiękiem na pokładzie. Noc w porcie w Fethiye.',
          tr: 'Tekneye biniş ve yerleşme, gün batımında kısa bir bilgilendirme, ilk ortak akşam yemeği ve güvertede ilk kısa ses rahatlaması. Gece Fethiye limanında.',
        },
      },
      {
        day: { en: 'Day 2 · Butterfly Valley', de: 'Tag 2 · Butterfly Valley', fr: 'Jour 2 · Butterfly Valley', es: 'Día 2 · Butterfly Valley', it: 'Giorno 2 · Butterfly Valley', nl: 'Dag 2 · Butterfly Valley', pl: 'Dzień 2 · Butterfly Valley', tr: '2. gün · Kelebekler Vadisi' },
        hours: { en: 'Sunday 16 May', de: 'Sonntag, 16. Mai', fr: 'Dimanche 16 mai', es: 'Domingo 16 de mayo', it: 'Domenica 16 maggio', nl: 'Zondag 16 mei', pl: 'Niedziela, 16 maja', tr: '16 Mayıs Pazar' },
        what: {
          en: 'Gentle movement and sound in the morning, lunch in a lonely bay, a walk to a small waterfall in the Butterfly Valley, and the night at St. Nicholas Island with its Byzantine ruins. A Turkish evening on board.',
          de: 'Morgens sanfte Bewegung und Klang, Mittagessen in einer einsamen Bucht, eine Wanderung zu einem kleinen Wasserfall im Butterfly Valley und die Nacht bei St. Nicholas Island mit ihren byzantinischen Ruinen. Ein türkischer Abend an Bord.',
          fr: 'Mouvement doux et son le matin, déjeuner dans une baie isolée, une marche jusqu’à une petite cascade dans la vallée des Papillons, et la nuit près de l’île Saint-Nicolas et ses ruines byzantines. Une soirée turque à bord.',
          es: 'Movimiento suave y sonido por la mañana, almuerzo en una cala solitaria, un paseo hasta una pequeña cascada en el Valle de las Mariposas y la noche junto a la isla de San Nicolás y sus ruinas bizantinas. Una velada turca a bordo.',
          it: 'Movimento dolce e suono al mattino, pranzo in una baia solitaria, una camminata fino a una piccola cascata nella Valle delle Farfalle e la notte presso l’isola di San Nicola con le sue rovine bizantine. Una serata turca a bordo.',
          nl: 'Zachte beweging en klank in de ochtend, lunch in een verlaten baai, een wandeling naar een kleine waterval in de Butterfly Valley en de nacht bij St. Nicholas Island met zijn Byzantijnse ruïnes. Een Turkse avond aan boord.',
          pl: 'Rano łagodny ruch i dźwięk, obiad w odludnej zatoce, spacer do małego wodospadu w Dolinie Motyli i noc przy Wyspie Świętego Mikołaja z jej bizantyjskimi ruinami. Turecki wieczór na pokładzie.',
          tr: 'Sabah hafif hareket ve ses, ıssız bir koyda öğle yemeği, Kelebekler Vadisi’nde küçük bir şelaleye yürüyüş ve gece Bizans kalıntılarıyla Gemiler Adası’nda. Teknede bir Türk gecesi.',
        },
      },
      {
        day: { en: 'Day 3 · Kaş', de: 'Tag 3 · Kaş', fr: 'Jour 3 · Kaş', es: 'Día 3 · Kaş', it: 'Giorno 3 · Kaş', nl: 'Dag 3 · Kaş', pl: 'Dzień 3 · Kaş', tr: '3. gün · Kaş' },
        hours: { en: 'Monday 17 May', de: 'Montag, 17. Mai', fr: 'Lundi 17 mai', es: 'Lunes 17 de mayo', it: 'Lunedì 17 maggio', nl: 'Maandag 17 mei', pl: 'Poniedziałek, 17 maja', tr: '17 Mayıs Pazartesi' },
        what: {
          en: 'A swim in a quiet bay by Yeşilköy, then the harbour town of Kaş: its lanes and shops, and the ancient amphitheatre together. Stargazing on deck if the weather allows.',
          de: 'Baden in einer ruhigen Bucht bei Yeşilköy, dann die Hafenstadt Kaş: Gassen und Läden, gemeinsam das antike Amphitheater. Bei gutem Wetter abends der Sternenhimmel an Deck.',
          fr: 'Une baignade dans une baie tranquille près de Yeşilköy, puis la ville portuaire de Kaş : ses ruelles, ses boutiques, et l’amphithéâtre antique ensemble. Les étoiles sur le pont si le temps le permet.',
          es: 'Un baño en una cala tranquila junto a Yeşilköy y después la ciudad portuaria de Kaş: sus callejuelas y tiendas, y el anfiteatro antiguo juntas. Si el tiempo lo permite, estrellas en cubierta.',
          it: 'Un bagno in una baia tranquilla presso Yeşilköy, poi la cittadina portuale di Kaş: i vicoli, le botteghe e, insieme, l’anfiteatro antico. Se il tempo lo permette, le stelle in coperta.',
          nl: 'Zwemmen in een rustige baai bij Yeşilköy, dan het havenstadje Kaş: de straatjes en winkeltjes, en samen het antieke amfitheater. Bij goed weer ’s avonds sterren kijken aan dek.',
          pl: 'Kąpiel w cichej zatoce koło Yeşilköy, potem portowe miasteczko Kaş: uliczki, sklepiki i wspólnie antyczny amfiteatr. Jeśli pogoda pozwoli, wieczorem gwiazdy na pokładzie.',
          tr: 'Yeşilköy yakınında sakin bir koyda yüzme, ardından liman kasabası Kaş: sokakları, dükkânları ve birlikte antik tiyatro. Hava izin verirse akşam güvertede yıldızlar.',
        },
      },
      {
        day: { en: 'Day 4 · Simena & Üçağız', de: 'Tag 4 · Simena & Üçağız', fr: 'Jour 4 · Simena et Üçağız', es: 'Día 4 · Simena y Üçağız', it: 'Giorno 4 · Simena e Üçağız', nl: 'Dag 4 · Simena & Üçağız', pl: 'Dzień 4 · Simena i Üçağız', tr: '4. gün · Simena ve Üçağız' },
        hours: { en: 'Tuesday 18 May', de: 'Dienstag, 18. Mai', fr: 'Mardi 18 mai', es: 'Martes 18 de mayo', it: 'Martedì 18 maggio', nl: 'Dinsdag 18 mei', pl: 'Wtorek, 18 maja', tr: '18 Mayıs Salı' },
        what: {
          en: 'A day for your inner world: breakfast without phones, the walk up to the castle of Simena, ice cream in Kaleköy, and an afternoon on your personal values. The night at anchor in the bay of Üçağız.',
          de: 'Ein Tag für deine innere Welt: Frühstück ohne Handys, die Wanderung hinauf zur Burg von Simena, Eis in Kaleköy und am Nachmittag deine persönlichen Werte. Die Nacht vor Anker in der Bucht von Üçağız.',
          fr: 'Une journée pour votre monde intérieur : petit-déjeuner sans téléphones, la montée au château de Simena, une glace à Kaleköy et l’après-midi consacré à vos valeurs. La nuit au mouillage dans la baie d’Üçağız.',
          es: 'Un día para tu mundo interior: desayuno sin móviles, la subida al castillo de Simena, helado en Kaleköy y, por la tarde, tus valores personales. La noche fondeadas en la bahía de Üçağız.',
          it: 'Una giornata per il tuo mondo interiore: colazione senza telefoni, la salita al castello di Simena, il gelato a Kaleköy e nel pomeriggio i tuoi valori personali. La notte all’ancora nella baia di Üçağız.',
          nl: 'Een dag voor je innerlijke wereld: ontbijt zonder telefoons, de klim naar de burcht van Simena, ijs in Kaleköy en ’s middags je persoonlijke waarden. De nacht voor anker in de baai van Üçağız.',
          pl: 'Dzień dla twojego wnętrza: śniadanie bez telefonów, wejście do zamku w Simenie, lody w Kaleköy i po południu twoje osobiste wartości. Noc na kotwicy w zatoce Üçağız.',
          tr: 'İç dünyana ayrılmış bir gün: telefonsuz kahvaltı, Simena Kalesi’ne yürüyüş, Kaleköy’de dondurma ve öğleden sonra kişisel değerlerin. Gece Üçağız koyunda demirli.',
        },
      },
      {
        day: { en: 'Day 5 · Kekova', de: 'Tag 5 · Kekova', fr: 'Jour 5 · Kekova', es: 'Día 5 · Kekova', it: 'Giorno 5 · Kekova', nl: 'Dag 5 · Kekova', pl: 'Dzień 5 · Kekova', tr: '5. gün · Kekova' },
        hours: { en: 'Wednesday 19 May', de: 'Mittwoch, 19. Mai', fr: 'Mercredi 19 mai', es: 'Miércoles 19 de mayo', it: 'Mercoledì 19 maggio', nl: 'Woensdag 19 mei', pl: 'Środa, 19 maja', tr: '19 Mayıs Çarşamba' },
        what: {
          en: 'The sunken city of Kekova (kayaking for whoever likes), swimming and lunch in Tersane Bay, then Gökkaya, where hardly a light disturbs the night: a sound journey on deck under the open sky.',
          de: 'Die versunkene Stadt Kekova (wer mag, fährt Kajak), Schwimmen und Mittagessen in der Tersane Bay, dann Gökkaya, wo kaum Lichter die Nacht stören: eine Klangreise an Deck unter freiem Sternenhimmel.',
          fr: 'La cité engloutie de Kekova (kayak pour qui le souhaite), baignade et déjeuner dans la baie de Tersane, puis Gökkaya, où presque aucune lumière ne trouble la nuit : un voyage sonore sur le pont à la belle étoile.',
          es: 'La ciudad sumergida de Kekova (kayak para quien quiera), baño y almuerzo en la bahía de Tersane, y luego Gökkaya, donde apenas una luz interrumpe la noche: un viaje sonoro en cubierta bajo las estrellas.',
          it: 'La città sommersa di Kekova (in kayak per chi vuole), bagno e pranzo nella baia di Tersane, poi Gökkaya, dove quasi nessuna luce disturba la notte: un viaggio sonoro in coperta sotto il cielo stellato.',
          nl: 'De verzonken stad Kekova (kajakken voor wie wil), zwemmen en lunch in de Tersane-baai, dan Gökkaya, waar nauwelijks een lichtje de nacht stoort: een klankreis aan dek onder de open sterrenhemel.',
          pl: 'Zatopione miasto Kekova (kajaki dla chętnych), kąpiel i obiad w zatoce Tersane, potem Gökkaya, gdzie prawie żadne światło nie zakłóca nocy: podróż dźwiękowa na pokładzie pod gołym niebem.',
          tr: 'Batık şehir Kekova (isteyene kano), Tersane koyunda yüzme ve öğle yemeği, ardından gecenin neredeyse hiç ışıkla bölünmediği Gökkaya: açık gökyüzü altında güvertede bir ses yolculuğu.',
        },
      },
      {
        day: { en: 'Days 6–7 · Çamlı Burun', de: 'Tag 6–7 · Çamlı Burun', fr: 'Jours 6–7 · Çamlı Burun', es: 'Días 6–7 · Çamlı Burun', it: 'Giorni 6–7 · Çamlı Burun', nl: 'Dag 6–7 · Çamlı Burun', pl: 'Dni 6–7 · Çamlı Burun', tr: '6–7. gün · Çamlı Burun' },
        hours: { en: '20–21 May', de: '20.–21. Mai', fr: '20–21 mai', es: '20–21 de mayo', it: '20–21 maggio', nl: '20–21 mei', pl: '20–21 maja', tr: '20–21 Mayıs' },
        what: {
          en: 'Pine-covered bays around Çamlı Burun and Batıkkaya for swimming and sun; the White Night with a special dinner, music and the sunset; and a small manifesting exercise for what you take home. The last dinner under the stars.',
          de: 'Pinienbuchten um Çamlı Burun und Batıkkaya zum Schwimmen und Sonnen; die White Night mit besonderem Dinner, Musik und Sonnenuntergang; und eine kleine Manifestationsübung für das, was du mit nach Hause nimmst. Das letzte Abendessen unter dem Sternenhimmel.',
          fr: 'Des baies bordées de pins autour de Çamlı Burun et de Batıkkaya pour nager et profiter du soleil ; la White Night avec un dîner spécial, de la musique et le coucher du soleil ; et un petit exercice de manifestation pour ce que vous rapportez chez vous. Le dernier dîner sous les étoiles.',
          es: 'Calas entre pinos en Çamlı Burun y Batıkkaya para nadar y tomar el sol; la White Night con una cena especial, música y la puesta de sol; y un pequeño ejercicio de manifestación para lo que te llevas a casa. La última cena bajo las estrellas.',
          it: 'Baie tra i pini attorno a Çamlı Burun e Batıkkaya per nuotare e prendere il sole; la White Night con una cena speciale, musica e il tramonto; e un piccolo esercizio di manifestazione per ciò che porti a casa. L’ultima cena sotto le stelle.',
          nl: 'Baaien met pijnbomen rond Çamlı Burun en Batıkkaya om te zwemmen en te zonnen; de White Night met een bijzonder diner, muziek en zonsondergang; en een kleine manifestatie-oefening voor wat je mee naar huis neemt. Het laatste diner onder de sterren.',
          pl: 'Sosnowe zatoki wokół Çamlı Burun i Batıkkaya do pływania i opalania; White Night z wyjątkową kolacją, muzyką i zachodem słońca; i małe ćwiczenie manifestacji tego, co zabierasz do domu. Ostatnia kolacja pod gwiazdami.',
          tr: 'Yüzmek ve güneşlenmek için Çamlı Burun ve Batıkkaya’nın çam kaplı koyları; özel bir akşam yemeği, müzik ve gün batımıyla White Night; ve eve götüreceklerin için küçük bir niyet çalışması. Yıldızların altında son akşam yemeği.',
        },
      },
      {
        day: { en: 'Day 8 · Fethiye', de: 'Tag 8 · Fethiye', fr: 'Jour 8 · Fethiye', es: 'Día 8 · Fethiye', it: 'Giorno 8 · Fethiye', nl: 'Dag 8 · Fethiye', pl: 'Dzień 8 · Fethiye', tr: '8. gün · Fethiye' },
        hours: { en: 'Saturday 22 May', de: 'Samstag, 22. Mai', fr: 'Samedi 22 mai', es: 'Sábado 22 de mayo', it: 'Sabato 22 maggio', nl: 'Zaterdag 22 mei', pl: 'Sobota, 22 maja', tr: '22 Mayıs Cumartesi' },
        what: {
          en: 'After breakfast, sailing back into Fethiye harbour, a farewell ceremony and a big hug before going ashore. The route may change with wind and weather.',
          de: 'Nach dem Frühstück zurück in den Hafen von Fethiye, eine Abschiedszeremonie und eine große Umarmung, bevor es an Land geht. Die Route kann sich je nach Wind und Wetter ändern.',
          fr: 'Après le petit-déjeuner, retour au port de Fethiye, une cérémonie d’adieu et une grande accolade avant de descendre à terre. L’itinéraire peut changer selon le vent et la météo.',
          es: 'Después del desayuno, regreso al puerto de Fethiye, una ceremonia de despedida y un gran abrazo antes de bajar a tierra. La ruta puede cambiar según el viento y el tiempo.',
          it: 'Dopo colazione, rientro nel porto di Fethiye, una cerimonia di saluto e un grande abbraccio prima di scendere a terra. La rotta può cambiare con il vento e il tempo.',
          nl: 'Na het ontbijt terug naar de haven van Fethiye, een afscheidsceremonie en een grote knuffel voordat je aan land gaat. De route kan veranderen door wind en weer.',
          pl: 'Po śniadaniu powrót do portu w Fethiye, ceremonia pożegnania i wielki uścisk przed zejściem na ląd. Trasa może się zmienić w zależności od wiatru i pogody.',
          tr: 'Kahvaltının ardından Fethiye limanına dönüş, karaya çıkmadan önce bir veda töreni ve kocaman bir sarılma. Rota rüzgâra ve havaya göre değişebilir.',
        },
      },
    ],
    practice: {
      en: ['Sound relaxation and sound journeys on deck', 'Mindset work: wheel of life, values, manifesting', 'Time for stillness, reading, swimming', 'Bays, ruins and harbour towns of the Lycian coast', 'At most twelve women, no experience needed'],
      de: ['Klangentspannung und Klangreisen an Deck', 'Mindsetarbeit: Lebensrad, Werte, Manifestieren', 'Zeit für Stille, Lesen, Schwimmen', 'Buchten, Ruinen und Hafenstädte der lykischen Küste', 'Höchstens zwölf Frauen, keine Vorerfahrung nötig'],
      fr: ['Relaxation et voyages sonores sur le pont', 'Travail sur l’état d’esprit : roue de la vie, valeurs, manifestation', 'Du temps pour le calme, la lecture, la baignade', 'Baies, ruines et ports de la côte lycienne', 'Douze femmes au plus, aucune expérience requise'],
      es: ['Relajación y viajes sonoros en cubierta', 'Trabajo de mindset: rueda de la vida, valores, manifestar', 'Tiempo para la calma, leer, nadar', 'Calas, ruinas y puertos de la costa licia', 'Como máximo doce mujeres, sin experiencia previa'],
      it: ['Rilassamento e viaggi sonori in coperta', 'Lavoro sul mindset: ruota della vita, valori, manifestare', 'Tempo per il silenzio, la lettura, il nuoto', 'Baie, rovine e porti della costa licia', 'Al massimo dodici donne, nessuna esperienza richiesta'],
      nl: ['Klankontspanning en klankreizen aan dek', 'Mindsetwerk: levenswiel, waarden, manifesteren', 'Tijd voor stilte, lezen, zwemmen', 'Baaien, ruïnes en havenstadjes van de Lycische kust', 'Hoogstens twaalf vrouwen, geen ervaring nodig'],
      pl: ['Relaksacja i podróże dźwiękowe na pokładzie', 'Praca z mindsetem: koło życia, wartości, manifestowanie', 'Czas na ciszę, czytanie, pływanie', 'Zatoki, ruiny i porty wybrzeża Licji', 'Najwyżej dwanaście kobiet, bez doświadczenia'],
      tr: ['Güvertede ses rahatlaması ve ses yolculukları', 'Zihin çalışması: yaşam çarkı, değerler, niyet', 'Sessizlik, okuma ve yüzme için zaman', 'Likya kıyısının koyları, kalıntıları ve liman kasabaları', 'En fazla on iki kadın, deneyim gerekmez'],
    },
    bring: {
      en: 'Not in the price: flights to and from Dalaman and the transfer to Fethiye (help with the transfer is offered), soft drinks and alcohol, travel and cancellation insurance, personal spending and a tip for the crew (about €10 a day suggested). Special diets such as gluten- or lactose-free are possible for a surcharge. A deposit of 20% secures the place; booking together with a friend saves you €25 each.',
      de: 'Nicht im Preis: Flug nach Dalaman und zurück und der Transfer nach Fethiye (beim Transfer wird geholfen), Softdrinks und Alkohol, Reise- und Reiserücktrittsversicherung, persönliche Ausgaben und Trinkgeld für die Crew (empfohlen rund 10 € pro Tag). Besondere Kost wie gluten- oder laktosefrei ist gegen Aufpreis möglich. 20 % Anzahlung sichern den Platz; meldest du dich mit einer Freundin an, spart ihr jeweils 25 €.',
      fr: 'Non compris : les vols vers et depuis Dalaman et le transfert jusqu’à Fethiye (une aide est proposée pour le transfert), les sodas et l’alcool, l’assurance voyage et annulation, les dépenses personnelles et un pourboire pour l’équipage (environ 10 € par jour conseillés). Les régimes particuliers, sans gluten ou sans lactose, sont possibles avec supplément. Un acompte de 20 % réserve la place ; à deux amies, chacune économise 25 €.',
      es: 'No incluido: vuelos a y desde Dalaman y el traslado a Fethiye (se ofrece ayuda con el traslado), refrescos y alcohol, seguro de viaje y de cancelación, gastos personales y propina para la tripulación (se sugieren unos 10 € al día). Las dietas especiales, sin gluten o sin lactosa, son posibles con suplemento. Un depósito del 20 % asegura la plaza; si te apuntas con una amiga, cada una ahorra 25 €.',
      it: 'Non compresi: voli da e per Dalaman e il transfer a Fethiye (viene offerto aiuto per il transfer), bibite e alcolici, assicurazione di viaggio e di annullamento, spese personali e una mancia per l’equipaggio (consigliati circa 10 € al giorno). Diete particolari, senza glutine o senza lattosio, sono possibili con supplemento. Un acconto del 20 % assicura il posto; prenotando con un’amica risparmiate 25 € ciascuna.',
      nl: 'Niet inbegrepen: vluchten van en naar Dalaman en de transfer naar Fethiye (er wordt geholpen met de transfer), frisdrank en alcohol, reis- en annuleringsverzekering, persoonlijke uitgaven en een fooi voor de bemanning (ca. € 10 per dag aanbevolen). Speciale voeding zoals gluten- of lactosevrij kan tegen meerprijs. Een aanbetaling van 20% reserveert je plek; boek je samen met een vriendin, dan bespaar je elk € 25.',
      pl: 'Nie w cenie: loty do i z Dalaman oraz transfer do Fethiye (pomoc przy transferze jest oferowana), napoje i alkohol, ubezpieczenie podróżne i od rezygnacji, wydatki własne i napiwek dla załogi (sugerowane ok. 10 € dziennie). Dieta specjalna, bezglutenowa czy bezlaktozowa, jest możliwa za dopłatą. Zaliczka 20% rezerwuje miejsce; zapisując się z przyjaciółką, każda oszczędza 25 €.',
      tr: 'Fiyata dahil değil: Dalaman’a gidiş-dönüş uçuş ve Fethiye’ye transfer (transfer için yardım sunulur), meşrubat ve alkol, seyahat ve iptal sigortası, kişisel harcamalar ve mürettebat için bahşiş (günde yaklaşık 10 € önerilir). Glütensiz veya laktozsuz gibi özel beslenme ek ücretle mümkündür. Yeri %20 kapora ayırır; bir arkadaşınla birlikte kaydolursan ikiniz de 25 € tasarruf edersiniz.',
    },
    provided: {
      en: 'Seven nights aboard in a cabin with its own bathroom (standard and luxury cabins; the first bookings get the luxury ones), all sound relaxations and mindset sessions, full board from the boat’s own cook — breakfast, lunch, an afternoon snack and dinner — with water and tea, and a private WhatsApp group before and after the retreat.',
      de: 'Sieben Nächte an Bord in einer Kabine mit eigenem Bad (Standard- und Luxuskabinen; die ersten Buchungen bekommen die Luxusvariante), alle Klangentspannungen und Mindset-Sessions, Vollpension vom eigenen Koch — Frühstück, Mittagessen, Nachmittagssnack und Abendessen — mit Wasser und Tee, und eine private WhatsApp-Gruppe vor und nach dem Retreat.',
      fr: 'Sept nuits à bord dans une cabine avec salle de bain privée (cabines standard et de luxe ; les premières réservations obtiennent le luxe), toutes les relaxations sonores et séances sur l’état d’esprit, la pension complète par le cuisinier du bord — petit-déjeuner, déjeuner, collation et dîner — avec eau et thé, et un groupe WhatsApp privé avant et après la retraite.',
      es: 'Siete noches a bordo en un camarote con baño propio (camarotes estándar y de lujo; las primeras reservas obtienen los de lujo), todas las relajaciones con sonido y sesiones de mindset, pensión completa del cocinero de a bordo —desayuno, almuerzo, merienda y cena— con agua y té, y un grupo privado de WhatsApp antes y después del retiro.',
      it: 'Sette notti a bordo in una cabina con bagno privato (cabine standard e di lusso; le prime prenotazioni hanno quelle di lusso), tutti i rilassamenti sonori e le sessioni sul mindset, pensione completa dal cuoco di bordo — colazione, pranzo, merenda e cena — con acqua e tè, e un gruppo WhatsApp privato prima e dopo il ritiro.',
      nl: 'Zeven nachten aan boord in een hut met eigen badkamer (standaard- en luxehutten; de eerste boekingen krijgen de luxe), alle klankontspanningen en mindsetsessies, volpension van de eigen kok — ontbijt, lunch, middagsnack en diner — met water en thee, en een privé-WhatsAppgroep voor en na de retraite.',
      pl: 'Siedem nocy na pokładzie w kajucie z własną łazienką (kajuty standardowe i luksusowe; pierwsze rezerwacje dostają luksusowe), wszystkie relaksacje dźwiękiem i sesje mindset, pełne wyżywienie od pokładowego kucharza — śniadanie, obiad, podwieczorek i kolacja — z wodą i herbatą, oraz prywatna grupa na WhatsAppie przed i po retreacie.',
      tr: 'Kendi banyosu olan bir kamarada teknede yedi gece (standart ve lüks kamaralar; ilk rezervasyonlar lüks olanları alır), tüm ses rahatlamaları ve zihin oturumları, teknenin aşçısından tam pansiyon — kahvaltı, öğle yemeği, ikindi atıştırmalığı ve akşam yemeği — su ve çayla birlikte, ve inziva öncesi ve sonrası için özel bir WhatsApp grubu.',
    },
    house: {
      en: 'The Larin Su, one of the most luxurious boats for a retreat like this, is ours alone for the week, with a crew and its own cook. The cabins below deck each have their own bathroom; whoever likes can sleep on deck under the stars — there is always a place free. The route runs from Fethiye along the coast to Kekova and back.',
      de: 'Die Larin Su, eines der luxuriösesten Schiffe für eine solche Auszeit, gehört die ganze Woche nur uns, mit Crew und eigenem Koch. Die Kabinen unter Deck haben jeweils ein eigenes Bad; wer mag, schläft an Deck unter dem Sternenhimmel — ein Platz ist immer frei. Die Route führt von Fethiye die Küste entlang bis Kekova und zurück.',
      fr: 'Le Larin Su, l’un des bateaux les plus luxueux pour une telle retraite, est à nous seules toute la semaine, avec équipage et cuisinier. Les cabines sous le pont ont chacune leur salle de bain ; qui le souhaite dort sur le pont à la belle étoile — il y a toujours une place libre. L’itinéraire va de Fethiye à Kekova le long de la côte, et retour.',
      es: 'La Larin Su, uno de los barcos más lujosos para un retiro así, es solo nuestra toda la semana, con tripulación y cocinero propio. Los camarotes bajo cubierta tienen cada uno su baño; quien quiera duerme en cubierta bajo las estrellas: siempre hay un sitio libre. La ruta va de Fethiye por la costa hasta Kekova y vuelta.',
      it: 'La Larin Su, una delle barche più lussuose per un ritiro così, è solo nostra per tutta la settimana, con equipaggio e cuoco. Le cabine sottocoperta hanno ognuna il proprio bagno; chi vuole dorme in coperta sotto le stelle: un posto libero c’è sempre. La rotta va da Fethiye lungo la costa fino a Kekova e ritorno.',
      nl: 'De Larin Su, een van de luxueuste boten voor zo’n retraite, is de hele week alleen van ons, met bemanning en eigen kok. De hutten benedendeks hebben elk een eigen badkamer; wie wil, slaapt aan dek onder de sterren — er is altijd een plekje vrij. De route loopt vanaf Fethiye langs de kust tot Kekova en terug.',
      pl: 'Larin Su, jedna z najbardziej luksusowych łodzi na taki wyjazd, należy przez cały tydzień tylko do nas, z załogą i własnym kucharzem. Kajuty pod pokładem mają własne łazienki; kto chce, śpi na pokładzie pod gwiazdami — zawsze jest wolne miejsce. Trasa prowadzi z Fethiye wzdłuż wybrzeża do Kekovy i z powrotem.',
      tr: 'Böyle bir inziva için en lüks teknelerden biri olan Larin Su, mürettebatı ve aşçısıyla bütün hafta yalnızca bizimdir. Güverte altındaki kamaraların her birinin kendi banyosu vardır; isteyen güvertede yıldızların altında uyur — her zaman boş bir yer bulunur. Rota Fethiye’den kıyı boyunca Kekova’ya ve geri uzanır.',
    },
    titles: {
      weekend: { en: 'The route, day by day', de: 'Die Route, Tag für Tag', fr: 'L’itinéraire, jour après jour', es: 'La ruta, día a día', it: 'La rotta, giorno per giorno', nl: 'De route, dag voor dag', pl: 'Trasa dzień po dniu', tr: 'Gün gün rota' },
      practice: { en: 'What you do', de: 'Was dich erwartet', fr: 'Ce que vous faites', es: 'Qué harás', it: 'Cosa farai', nl: 'Wat je doet', pl: 'Co będziesz robić', tr: 'Neler yapacaksın' },
      place: { en: 'The boat', de: 'Das Boot', fr: 'Le bateau', es: 'El barco', it: 'La barca', nl: 'De boot', pl: 'Łódź', tr: 'Tekne' },
      bring: { en: 'Not included', de: 'Nicht inbegriffen', fr: 'Non compris', es: 'No incluido', it: 'Non compreso', nl: 'Niet inbegrepen', pl: 'Nie w cenie', tr: 'Dahil olmayanlar' },
      provided: { en: 'What’s included', de: 'Was inbegriffen ist', fr: 'Ce qui est compris', es: 'Qué incluye', it: 'Cosa è incluso', nl: 'Wat is inbegrepen', pl: 'Co jest w cenie', tr: 'Neler dahil' },
    },
    hero: '/img/retreats/nina-segel-deck.jpg',
    gallery: [
      { src: '/img/retreats/nina-segel-sound.jpg', alt: { en: 'A sound session on deck', de: 'Eine Klangsession an Deck', fr: 'Une séance sonore sur le pont', es: 'Una sesión de sonido en cubierta', it: 'Una sessione sonora in coperta', nl: 'Een klanksessie aan dek', pl: 'Sesja dźwiękowa na pokładzie', tr: 'Güvertede bir ses seansı' } },
      { src: '/img/retreats/nina-segel-bay.jpg', alt: { en: 'Turquoise water in a bay on the route', de: 'Türkisfarbenes Wasser in einer Bucht auf der Route', fr: 'Une eau turquoise dans une baie de l’itinéraire', es: 'Agua turquesa en una cala de la ruta', it: 'Acqua turchese in una baia lungo la rotta', nl: 'Turquoise water in een baai op de route', pl: 'Turkusowa woda w zatoce na trasie', tr: 'Rota üzerindeki bir koyda turkuaz su' } },
      { src: '/img/retreats/nina-segel-evening.jpg', alt: { en: 'A Turkish evening together on board', de: 'Ein türkischer Abend an Bord', fr: 'Une soirée turque à bord', es: 'Una velada turca a bordo', it: 'Una serata turca a bordo', nl: 'Een Turkse avond aan boord', pl: 'Turecki wieczór na pokładzie', tr: 'Teknede bir Türk gecesi' } },
      { src: '/img/retreats/nina-segel-boat.jpg', alt: { en: 'On deck at sunset, the gulets at anchor', de: 'An Deck bei Sonnenuntergang, die Gulets vor Anker', fr: 'Sur le pont au coucher du soleil, les goélettes au mouillage', es: 'En cubierta al atardecer, las goletas fondeadas', it: 'In coperta al tramonto, i caicchi all’ancora', nl: 'Aan dek bij zonsondergang, de gulets voor anker', pl: 'Na pokładzie o zachodzie słońca, gulety na kotwicy', tr: 'Gün batımında güvertede, demirli guletler' } },
    ],
  },
  {
    // Nina's Art & Yoga retreat on Mallorca, from her page (22.10.2026). The
    // programme price and the three room prices are as she lists them; which
    // room costs which was not readable as text, so the span is given.
    slug: 'nina-art-yoga-mallorca',
    start: '2027-05-02',
    end: '2027-05-08',
    country: 'ES',
    town: 'Mallorca',
    region: {
      en: 'Finca Limoncello, between Petra and Sineu',
      de: 'Finca Limoncello, zwischen Petra und Sineu',
      fr: 'Finca Limoncello, entre Petra et Sineu',
      es: 'Finca Limoncello, entre Petra y Sineu',
      it: 'Finca Limoncello, tra Petra e Sineu',
      nl: 'Finca Limoncello, tussen Petra en Sineu',
      pl: 'Finca Limoncello, między Petrą a Sineu',
      tr: 'Finca Limoncello, Petra ile Sineu arasında',
    },
    teacher: 'Nina Kranz',
    language: 'DE',
    contribution: {
      en: '€1,099 for the programme · plus €525–585 for the room',
      de: '1.099 € für das Programm · zzgl. 525–585 € für das Zimmer',
      fr: '1 099 € pour le programme · plus 525–585 € pour la chambre',
      es: '1.099 € el programa · más 525–585 € la habitación',
      it: '1.099 € per il programma · più 525–585 € per la camera',
      nl: '€ 1.099 voor het programma · plus € 525–585 voor de kamer',
      pl: '1099 € za program · plus 525–585 € za pokój',
      tr: 'Program 1.099 € · oda için ayrıca 525–585 €',
    },
    kicker: {
      en: 'Seven days for women · art & yoga · Mallorca',
      de: 'Sieben Tage für Frauen · Kunst & Yoga · Mallorca',
      fr: 'Sept jours entre femmes · art & yoga · Majorque',
      es: 'Siete días para mujeres · arte y yoga · Mallorca',
      it: 'Sette giorni per donne · arte e yoga · Maiorca',
      nl: 'Zeven dagen voor vrouwen · kunst & yoga · Mallorca',
      pl: 'Siedem dni dla kobiet · sztuka i joga · Majorka',
      tr: 'Kadınlar için yedi gün · sanat ve yoga · Mallorca',
    },
    title: {
      en: 'An art & yoga retreat on Mallorca',
      de: 'Art & Yoga Retreat auf Mallorca',
      fr: 'Une retraite art & yoga à Majorque',
      es: 'Un retiro de arte y yoga en Mallorca',
      it: 'Un ritiro di arte e yoga a Maiorca',
      nl: 'Een kunst- & yogaretraite op Mallorca',
      pl: 'Retreat sztuki i jogi na Majorce',
      tr: 'Mallorca’da bir sanat ve yoga inzivası',
    },
    enquiry: {
      en: 'the art & yoga retreat on Mallorca with Nina Kranz, 2–8 May 2027',
      de: 'Art & Yoga Retreat auf Mallorca mit Nina Kranz, 2.–8. Mai 2027',
      fr: 'la retraite art & yoga à Majorque avec Nina Kranz, du 2 au 8 mai 2027',
      es: 'el retiro de arte y yoga en Mallorca con Nina Kranz, del 2 al 8 de mayo de 2027',
      it: 'il ritiro di arte e yoga a Maiorca con Nina Kranz, dal 2 all’8 maggio 2027',
      nl: 'de kunst- & yogaretraite op Mallorca met Nina Kranz, 2–8 mei 2027',
      pl: 'retreat sztuki i jogi na Majorce z Niną Kranz, 2–8 maja 2027',
      tr: 'Nina Kranz ile Mallorca’da sanat ve yoga inzivası, 2–8 Mayıs 2027',
    },
    lede: {
      en: 'Seven days of yoga, colour and sound at the Finca Limoncello, among lemon, orange and fig trees in the middle of Mallorca — with Nina Kranz, art and creativity therapist and sound facilitator, and the yoga teacher Caro. For at most nine women.',
      de: 'Sieben Tage Yoga, Farbe und Klang auf der Finca Limoncello, zwischen Zitronen-, Orangen- und Feigenbäumen mitten auf Mallorca — mit Nina Kranz, Kunst- und Kreativitätstherapeutin und Soundbath Facilitator, und der Yogalehrerin Caro. Für höchstens neun Frauen.',
      fr: 'Sept jours de yoga, de couleur et de son à la Finca Limoncello, parmi les citronniers, orangers et figuiers au cœur de Majorque — avec Nina Kranz, art-thérapeute et praticienne du son, et la professeure de yoga Caro. Pour neuf femmes au plus.',
      es: 'Siete días de yoga, color y sonido en la Finca Limoncello, entre limoneros, naranjos e higueras en el corazón de Mallorca, con Nina Kranz, terapeuta de arte y creatividad y facilitadora de baños de sonido, y la profesora de yoga Caro. Para un máximo de nueve mujeres.',
      it: 'Sette giorni di yoga, colore e suono alla Finca Limoncello, tra limoni, aranci e fichi nel cuore di Maiorca — con Nina Kranz, arteterapeuta e facilitatrice di bagni sonori, e l’insegnante di yoga Caro. Per al massimo nove donne.',
      nl: 'Zeven dagen yoga, kleur en klank op de Finca Limoncello, tussen citroen-, sinaasappel- en vijgenbomen midden op Mallorca — met Nina Kranz, kunst- en creativiteitstherapeut en soundbath-begeleider, en yogadocent Caro. Voor hoogstens negen vrouwen.',
      pl: 'Siedem dni jogi, koloru i dźwięku w Finca Limoncello, wśród drzew cytrynowych, pomarańczowych i figowych w sercu Majorki — z Niną Kranz, terapeutką sztuką i kreatywnością oraz prowadzącą kąpiele dźwiękowe, i nauczycielką jogi Caro. Dla najwyżej dziewięciu kobiet.',
      tr: 'Mallorca’nın ortasında limon, portakal ve incir ağaçları arasındaki Finca Limoncello’da yoga, renk ve sesle yedi gün — sanat ve yaratıcılık terapisti ve ses banyosu kolaylaştırıcısı Nina Kranz ile yoga öğretmeni Caro eşliğinde. En fazla dokuz kadın için.',
    },
    about: {
      en: [
        'This retreat is for women who want time for themselves — to breathe, recharge and get moving — whether they love yoga or are new to it, and who want to be creative without pressure. It is not about a perfect result, on the canvas or on the mat: you need neither to paint nor to have done yoga before.',
        'The yoga is a flowing mix of hatha, vinyasa and yin, sometimes dynamic, sometimes quiet, led by Caro, who has taught yoga for more than nine years. In Nina’s art sessions you work with colour, form and expression — intuitively, playfully. Guided meditations, singing bowls and small rituals frame the mornings or evenings.',
        'It is not a painting school with technique lessons, nor a tightly timed activity programme. On some afternoons, whoever likes can explore the island beyond the finca; that is optional and not part of the programme.',
      ],
      de: [
        'Dieses Retreat ist für Frauen, die sich Zeit für sich wünschen — zum Atmen, Auftanken und In-Bewegung-Kommen —, die Yoga lieben oder neu entdecken möchten und ohne Leistungsdruck kreativ werden wollen. Es geht nicht um ein perfektes Ergebnis, weder auf der Leinwand noch auf der Yogamatte: Du musst weder malen können noch Yogaerfahrung haben.',
        'Das Yoga ist eine fließende Verbindung aus Hatha, Vinyasa und Yin, mal dynamisch, mal ruhig, geleitet von Caro, die seit über neun Jahren Yoga unterrichtet. In Ninas Kunstsessions tauchst du in Farbe, Form und Ausdruck ein — intuitiv und verspielt. Geführte Meditationen, Klangschalen und achtsame Rituale rahmen den Morgen oder Abend.',
        'Es ist keine Malschule, die Technik beibringt, und kein straff getaktetes Aktivprogramm. Wer mag, erkundet an einzelnen Nachmittagen die Insel jenseits der Finca; das ist freiwillig und nicht Teil des Programms.',
      ],
      fr: [
        'Cette retraite s’adresse aux femmes qui veulent du temps pour elles — respirer, se ressourcer, se remettre en mouvement —, qu’elles aiment le yoga ou le découvrent, et qui veulent être créatives sans pression. Il ne s’agit pas d’un résultat parfait, ni sur la toile ni sur le tapis : nul besoin de savoir peindre ni d’avoir pratiqué le yoga.',
        'Le yoga mêle avec fluidité hatha, vinyasa et yin, tantôt dynamique, tantôt calme, guidé par Caro, qui enseigne le yoga depuis plus de neuf ans. Dans les séances artistiques de Nina, vous plongez dans la couleur, la forme et l’expression, de façon intuitive et ludique. Méditations guidées, bols chantants et petits rituels encadrent les matins ou les soirs.',
        'Ce n’est ni une école de peinture qui enseigne la technique, ni un programme d’activités minuté. Certains après-midi, celles qui le souhaitent peuvent explorer l’île au-delà de la finca ; c’est facultatif et hors programme.',
      ],
      es: [
        'Este retiro es para mujeres que desean tiempo para sí mismas —respirar, recargar energía y ponerse en movimiento—, que aman el yoga o quieren descubrirlo, y que quieren crear sin presión. No se trata de un resultado perfecto, ni en el lienzo ni en la esterilla: no necesitas saber pintar ni haber hecho yoga.',
        'El yoga es una mezcla fluida de hatha, vinyasa y yin, a veces dinámico, a veces tranquilo, guiado por Caro, que enseña yoga desde hace más de nueve años. En las sesiones de arte de Nina te sumerges en el color, la forma y la expresión, de manera intuitiva y lúdica. Meditaciones guiadas, cuencos tibetanos y pequeños rituales enmarcan las mañanas o las tardes.',
        'No es una escuela de pintura con técnica ni un programa de actividades con horario apretado. Algunas tardes, quien quiera puede explorar la isla más allá de la finca; es opcional y no forma parte del programa.',
      ],
      it: [
        'Questo ritiro è per donne che desiderano tempo per sé — per respirare, ricaricarsi e rimettersi in movimento —, che amano lo yoga o vogliono scoprirlo, e che vogliono essere creative senza pressione. Non si tratta di un risultato perfetto, né sulla tela né sul tappetino: non serve saper dipingere né aver mai fatto yoga.',
        'Lo yoga è un intreccio fluido di hatha, vinyasa e yin, ora dinamico ora calmo, guidato da Caro, che insegna yoga da oltre nove anni. Nelle sessioni artistiche di Nina ti immergi nel colore, nella forma e nell’espressione, in modo intuitivo e giocoso. Meditazioni guidate, campane tibetane e piccoli rituali incorniciano le mattine o le sere.',
        'Non è una scuola di pittura che insegna la tecnica né un programma di attività a ritmo serrato. In alcuni pomeriggi, chi vuole può esplorare l’isola oltre la finca; è facoltativo e non fa parte del programma.',
      ],
      nl: [
        'Deze retraite is voor vrouwen die tijd voor zichzelf willen — om te ademen, op te laden en in beweging te komen —, die van yoga houden of het willen ontdekken, en die zonder prestatiedruk creatief willen zijn. Het gaat niet om een perfect resultaat, niet op het doek en niet op de mat: je hoeft niet te kunnen schilderen of yoga-ervaring te hebben.',
        'De yoga is een vloeiende mix van hatha, vinyasa en yin, soms dynamisch, soms rustig, geleid door Caro, die al meer dan negen jaar yoga geeft. In Nina’s kunstsessies duik je in kleur, vorm en expressie — intuïtief en speels. Geleide meditaties, klankschalen en kleine rituelen omlijsten de ochtenden of avonden.',
        'Het is geen schilderschool die techniek leert en geen strak getimed activiteitenprogramma. Op sommige middagen kan wie wil het eiland buiten de finca verkennen; dat is vrijwillig en geen deel van het programma.',
      ],
      pl: [
        'Ten retreat jest dla kobiet, które chcą mieć czas dla siebie — by oddychać, nabrać sił i wprawić się w ruch — które kochają jogę albo chcą ją odkryć i chcą tworzyć bez presji. Nie chodzi o idealny efekt, ani na płótnie, ani na macie: nie musisz umieć malować ani mieć doświadczenia w jodze.',
        'Joga to płynne połączenie hatha, vinyasy i yin, raz dynamiczna, raz spokojna, prowadzona przez Caro, która uczy jogi od ponad dziewięciu lat. Na sesjach artystycznych Niny zanurzasz się w kolorze, formie i ekspresji — intuicyjnie i z lekkością. Medytacje prowadzone, misy dźwiękowe i małe rytuały otulają poranki lub wieczory.',
        'To nie szkoła malarstwa ucząca techniki ani napięty program zajęć. W niektóre popołudnia chętne mogą zwiedzać wyspę poza fincą; to dobrowolne i nie należy do programu.',
      ],
      tr: [
        'Bu inziva kendine zaman ayırmak — nefes almak, enerji toplamak ve harekete geçmek — isteyen, yogayı seven ya da yeni keşfetmek isteyen ve baskı olmadan yaratıcı olmak isteyen kadınlar için. Mesele ne tuvalde ne de matta mükemmel bir sonuç: resim yapabilmen ya da daha önce yoga yapmış olman gerekmez.',
        'Yoga; hatha, vinyasa ve yin’in akıcı bir karışımıdır, bazen dinamik bazen sakin; dokuz yılı aşkın süredir yoga öğreten Caro yönetir. Nina’nın sanat oturumlarında renge, biçime ve ifadeye sezgisel ve oyunbaz bir şekilde dalarsın. Rehberli meditasyonlar, şarkı söyleyen kâseler ve küçük ritüeller sabahları ya da akşamları çevreler.',
        'Teknik öğreten bir resim okulu ya da sıkı zamanlanmış bir aktivite programı değildir. Bazı öğleden sonraları isteyen adayı finca’nın ötesinde keşfedebilir; bu isteğe bağlıdır ve programın parçası değildir.',
      ],
    },
    days: [
      {
        day: { en: 'An example day', de: 'Ein Beispieltag', fr: 'Une journée type', es: 'Un día de ejemplo', it: 'Una giornata tipo', nl: 'Een voorbeelddag', pl: 'Przykładowy dzień', tr: 'Örnek bir gün' },
        hours: { en: 'Morning to evening', de: 'Morgens bis abends', fr: 'Du matin au soir', es: 'De la mañana a la noche', it: 'Dal mattino alla sera', nl: 'Van ochtend tot avond', pl: 'Od rana do wieczora', tr: 'Sabahtan akşama' },
        what: {
          en: 'Yoga to arrive gently in the day; breakfast, then a creative workshop; a light lunch; the afternoon is yours; in the evening dinner together, then a relaxation session.',
          de: 'Yoga zum sanften Ankommen im Tag; Frühstück, dann ein Kreativworkshop; ein Light Lunch; der Nachmittag gehört dir; abends gemeinsames Abendessen, dann eine Entspannungseinheit.',
          fr: 'Du yoga pour entrer doucement dans la journée ; le petit-déjeuner, puis un atelier créatif ; un déjeuner léger ; l’après-midi est à vous ; le soir, dîner ensemble puis un moment de relaxation.',
          es: 'Yoga para empezar el día con suavidad; desayuno y después un taller creativo; un almuerzo ligero; la tarde es tuya; por la noche, cena juntas y luego una sesión de relajación.',
          it: 'Yoga per entrare dolcemente nella giornata; colazione, poi un laboratorio creativo; un pranzo leggero; il pomeriggio è tuo; la sera cena insieme e poi un momento di rilassamento.',
          nl: 'Yoga om zacht de dag in te komen; ontbijt, dan een creatieve workshop; een lichte lunch; de middag is van jou; ’s avonds samen eten, dan een ontspanningssessie.',
          pl: 'Joga na łagodny początek dnia; śniadanie, potem warsztat twórczy; lekki lunch; popołudnie należy do ciebie; wieczorem wspólna kolacja, a potem relaksacja.',
          tr: 'Güne yumuşakça başlamak için yoga; kahvaltı, ardından yaratıcı bir atölye; hafif bir öğle yemeği; öğleden sonra senin; akşam birlikte yemek, sonra bir rahatlama seansı.',
        },
      },
      {
        day: { en: 'All week', de: 'Die ganze Woche', fr: 'Toute la semaine', es: 'Toda la semana', it: 'Tutta la settimana', nl: 'De hele week', pl: 'Cały tydzień', tr: 'Bütün hafta' },
        hours: { en: '2–8 May 2027', de: '2.–8. Mai 2027', fr: '2–8 mai 2027', es: '2–8 de mayo de 2027', it: '2–8 maggio 2027', nl: '2–8 mei 2027', pl: '2–8 maja 2027', tr: '2–8 Mayıs 2027' },
        what: {
          en: 'Yoga for balance and lightness; art sessions without pressure; meditation, sound and mindful rituals. Optional afternoons exploring Mallorca — the retreat itself stays deliberately unhurried.',
          de: 'Yoga für Balance und innere Leichtigkeit; Kunstsessions ohne Leistungsdruck; Meditation, Klang und achtsame Rituale. Freiwillige Nachmittage, um Mallorca zu entdecken — das Retreat selbst bleibt bewusst ruhig getaktet.',
          fr: 'Du yoga pour l’équilibre et la légèreté ; des séances d’art sans pression ; méditation, son et rituels attentifs. Des après-midi facultatifs pour découvrir Majorque — la retraite elle-même garde volontairement un rythme calme.',
          es: 'Yoga para el equilibrio y la ligereza; sesiones de arte sin presión; meditación, sonido y rituales conscientes. Tardes opcionales para descubrir Mallorca: el retiro mantiene a propósito un ritmo tranquilo.',
          it: 'Yoga per equilibrio e leggerezza; sessioni d’arte senza pressione; meditazione, suono e rituali consapevoli. Pomeriggi facoltativi per scoprire Maiorca: il ritiro mantiene di proposito un ritmo calmo.',
          nl: 'Yoga voor balans en lichtheid; kunstsessies zonder druk; meditatie, klank en aandachtige rituelen. Vrijwillige middagen om Mallorca te ontdekken — de retraite zelf blijft bewust rustig.',
          pl: 'Joga dla równowagi i lekkości; sesje artystyczne bez presji; medytacja, dźwięk i uważne rytuały. Dobrowolne popołudnia na odkrywanie Majorki — sam retreat celowo ma spokojny rytm.',
          tr: 'Denge ve hafiflik için yoga; baskısız sanat oturumları; meditasyon, ses ve bilinçli ritüeller. Mallorca’yı keşfetmek için isteğe bağlı öğleden sonralar — inzivanın kendisi bilerek sakin bir tempoda kalır.',
        },
      },
    ],
    practice: {
      en: ['Hatha, vinyasa and yin yoga with Caro', 'Intuitive art sessions with Nina, all materials included', 'Guided meditation and singing bowls', 'Time for yourself at the finca and its pool', 'At most nine women, no experience needed'],
      de: ['Hatha, Vinyasa und Yin Yoga mit Caro', 'Intuitive Kunstsessions mit Nina, alle Materialien inklusive', 'Geführte Meditation und Klangschalen', 'Zeit für dich auf der Finca und am Pool', 'Höchstens neun Frauen, keine Vorkenntnisse nötig'],
      fr: ['Yoga hatha, vinyasa et yin avec Caro', 'Séances d’art intuitives avec Nina, tout le matériel compris', 'Méditation guidée et bols chantants', 'Du temps pour soi à la finca et à la piscine', 'Neuf femmes au plus, aucune expérience requise'],
      es: ['Yoga hatha, vinyasa y yin con Caro', 'Sesiones de arte intuitivo con Nina, todos los materiales incluidos', 'Meditación guiada y cuencos tibetanos', 'Tiempo para ti en la finca y su piscina', 'Como máximo nueve mujeres, sin experiencia previa'],
      it: ['Yoga hatha, vinyasa e yin con Caro', 'Sessioni d’arte intuitiva con Nina, materiali inclusi', 'Meditazione guidata e campane tibetane', 'Tempo per te alla finca e in piscina', 'Al massimo nove donne, nessuna esperienza richiesta'],
      nl: ['Hatha-, vinyasa- en yinyoga met Caro', 'Intuïtieve kunstsessies met Nina, alle materialen inbegrepen', 'Geleide meditatie en klankschalen', 'Tijd voor jezelf op de finca en bij het zwembad', 'Hoogstens negen vrouwen, geen ervaring nodig'],
      pl: ['Hatha, vinyasa i yin joga z Caro', 'Intuicyjne sesje artystyczne z Niną, materiały w cenie', 'Medytacja prowadzona i misy dźwiękowe', 'Czas dla siebie w fince i przy basenie', 'Najwyżej dziewięć kobiet, bez doświadczenia'],
      tr: ['Caro ile hatha, vinyasa ve yin yoga', 'Nina ile sezgisel sanat oturumları, tüm malzemeler dahil', 'Rehberli meditasyon ve şarkı söyleyen kâseler', 'Finca’da ve havuz başında kendine zaman', 'En fazla dokuz kadın, deneyim gerekmez'],
    },
    bring: {
      en: 'Not in the price: the flight and the transfer to the finca — a bus runs from the airport directly to the finca, or you can hire a car. A deposit of 50% secures the place; the rest is due before the trip. Booking together with a friend saves you €25 each.',
      de: 'Nicht im Preis: Flug und Transfer zur Finca — vom Flughafen fährt ein Linienbus direkt zur Finca, oder du mietest dir ein Auto. 50 % Anzahlung sichern den Platz, der Rest ist vor Reisebeginn fällig. Meldest du dich mit einer Freundin an, spart ihr jeweils 25 €.',
      fr: 'Non compris : le vol et le transfert jusqu’à la finca — un bus relie directement l’aéroport à la finca, ou vous louez une voiture. Un acompte de 50 % réserve la place ; le solde est dû avant le départ. À deux amies, chacune économise 25 €.',
      es: 'No incluido: el vuelo y el traslado a la finca; un autobús va directamente del aeropuerto a la finca, o puedes alquilar un coche. Un depósito del 50 % asegura la plaza; el resto se paga antes del viaje. Si te apuntas con una amiga, cada una ahorra 25 €.',
      it: 'Non compresi: il volo e il transfer alla finca — un autobus va direttamente dall’aeroporto alla finca, oppure puoi noleggiare un’auto. Un acconto del 50 % assicura il posto; il saldo è dovuto prima della partenza. Prenotando con un’amica risparmiate 25 € ciascuna.',
      nl: 'Niet inbegrepen: de vlucht en de transfer naar de finca — vanaf het vliegveld rijdt een bus rechtstreeks naar de finca, of je huurt een auto. Een aanbetaling van 50% reserveert je plek; de rest betaal je voor vertrek. Boek je samen met een vriendin, dan bespaar je elk € 25.',
      pl: 'Nie w cenie: lot i transfer do finki — z lotniska kursuje autobus bezpośrednio do finki, można też wynająć samochód. Zaliczka 50% rezerwuje miejsce, resztę płaci się przed wyjazdem. Zapisując się z przyjaciółką, każda oszczędza 25 €.',
      tr: 'Fiyata dahil değil: uçuş ve finca’ya transfer — havalimanından finca’ya doğrudan bir otobüs gider ya da araba kiralayabilirsin. Yeri %50 kapora ayırır, kalanı yolculuktan önce ödenir. Bir arkadaşınla birlikte kaydolursan ikiniz de 25 € tasarruf edersiniz.',
    },
    provided: {
      en: 'Six nights at the finca, breakfast every day, three dinners and three lunch snacks, tea and water throughout, and all yoga, sound and art sessions with all materials. The programme is €1,099; the room is priced separately at €525, €555 or €585.',
      de: 'Sechs Nächte auf der Finca, täglich Frühstück, drei Abendessen und drei Mittagssnacks, jederzeit Tee und Wasser, und alle Yoga-, Klang- und Kunsteinheiten mit allen Materialien. Das Programm kostet 1.099 €; das Zimmer kommt mit 525, 555 oder 585 € dazu.',
      fr: 'Six nuits à la finca, le petit-déjeuner chaque jour, trois dîners et trois collations de midi, thé et eau à volonté, et toutes les séances de yoga, de son et d’art avec tout le matériel. Le programme coûte 1 099 € ; la chambre s’ajoute à 525, 555 ou 585 €.',
      es: 'Seis noches en la finca, desayuno diario, tres cenas y tres tentempiés de mediodía, té y agua en todo momento, y todas las sesiones de yoga, sonido y arte con todos los materiales. El programa cuesta 1.099 €; la habitación se suma con 525, 555 o 585 €.',
      it: 'Sei notti alla finca, colazione ogni giorno, tre cene e tre spuntini a pranzo, tè e acqua sempre a disposizione, e tutte le sessioni di yoga, suono e arte con tutti i materiali. Il programma costa 1.099 €; la camera si aggiunge a 525, 555 o 585 €.',
      nl: 'Zes nachten op de finca, elke dag ontbijt, drie diners en drie lunchsnacks, altijd thee en water, en alle yoga-, klank- en kunstsessies met alle materialen. Het programma kost € 1.099; de kamer komt erbij voor € 525, € 555 of € 585.',
      pl: 'Sześć nocy w fince, codzienne śniadanie, trzy kolacje i trzy przekąski w porze lunchu, herbata i woda przez cały czas oraz wszystkie zajęcia jogi, dźwięku i sztuki ze wszystkimi materiałami. Program kosztuje 1099 €; pokój dochodzi za 525, 555 lub 585 €.',
      tr: 'Finca’da altı gece, her gün kahvaltı, üç akşam yemeği ve üç öğle atıştırmalığı, her zaman çay ve su, ve tüm malzemeleriyle bütün yoga, ses ve sanat oturumları. Program 1.099 €; oda ayrıca 525, 555 veya 585 €.',
    },
    house: {
      en: 'The Finca Limoncello lies between Petra and Sineu, surrounded by lemon, orange and fig trees: the garden, the afternoon light, the pool as a quiet retreat. No hotel bustle — just the group of women and nature.',
      de: 'Die Finca Limoncello liegt zwischen Petra und Sineu, umgeben von Zitronen-, Orangen- und Feigenbäumen: der Garten, das Licht am Nachmittag, der Pool als stiller Rückzugsort. Kein Hotelbetrieb, kein Trubel — nur die Gruppe Frauen und die Natur.',
      fr: 'La Finca Limoncello se trouve entre Petra et Sineu, entourée de citronniers, d’orangers et de figuiers : le jardin, la lumière de l’après-midi, la piscine comme refuge tranquille. Pas d’hôtel, pas d’agitation — seulement le groupe de femmes et la nature.',
      es: 'La Finca Limoncello está entre Petra y Sineu, rodeada de limoneros, naranjos e higueras: el jardín, la luz de la tarde, la piscina como rincón tranquilo. Nada de hotel ni de bullicio, solo el grupo de mujeres y la naturaleza.',
      it: 'La Finca Limoncello si trova tra Petra e Sineu, circondata da limoni, aranci e fichi: il giardino, la luce del pomeriggio, la piscina come rifugio tranquillo. Niente albergo, niente confusione — solo il gruppo di donne e la natura.',
      nl: 'De Finca Limoncello ligt tussen Petra en Sineu, omringd door citroen-, sinaasappel- en vijgenbomen: de tuin, het middaglicht, het zwembad als stille plek. Geen hotelbedrijf, geen drukte — alleen de groep vrouwen en de natuur.',
      pl: 'Finca Limoncello leży między Petrą a Sineu, otoczona drzewami cytrynowymi, pomarańczowymi i figowymi: ogród, popołudniowe światło, basen jako ciche schronienie. Żadnego hotelowego gwaru — tylko grupa kobiet i natura.',
      tr: 'Finca Limoncello, Petra ile Sineu arasında limon, portakal ve incir ağaçlarıyla çevrili: bahçe, öğleden sonra ışığı ve sessiz bir sığınak olarak havuz. Otel kalabalığı yok — yalnızca kadınlardan oluşan grup ve doğa.',
    },
    titles: {
      weekend: { en: 'The days', de: 'Die Tage', fr: 'Les jours', es: 'Los días', it: 'I giorni', nl: 'De dagen', pl: 'Dni', tr: 'Günler' },
      practice: { en: 'What you do', de: 'Was dich erwartet', fr: 'Ce que vous faites', es: 'Qué harás', it: 'Cosa farai', nl: 'Wat je doet', pl: 'Co będziesz robić', tr: 'Neler yapacaksın' },
      place: { en: 'The finca', de: 'Die Finca', fr: 'La finca', es: 'La finca', it: 'La finca', nl: 'De finca', pl: 'Finca', tr: 'Finca' },
      bring: { en: 'Not included', de: 'Nicht inbegriffen', fr: 'Non compris', es: 'No incluido', it: 'Non compreso', nl: 'Niet inbegrepen', pl: 'Nie w cenie', tr: 'Dahil olmayanlar' },
      provided: { en: 'What’s included', de: 'Was inbegriffen ist', fr: 'Ce qui est compris', es: 'Qué incluye', it: 'Cosa è incluso', nl: 'Wat is inbegrepen', pl: 'Co jest w cenie', tr: 'Neler dahil' },
    },
    hero: '/img/retreats/nina-mallorca-house.jpg',
    gallery: [
      { src: '/img/retreats/nina-mallorca-pool.jpg', alt: { en: 'The pool and terrace of the Finca Limoncello', de: 'Pool und Terrasse der Finca Limoncello', fr: 'La piscine et la terrasse de la Finca Limoncello', es: 'La piscina y la terraza de la Finca Limoncello', it: 'La piscina e la terrazza della Finca Limoncello', nl: 'Het zwembad en terras van de Finca Limoncello', pl: 'Basen i taras Finca Limoncello', tr: 'Finca Limoncello’nun havuzu ve terası' } },
      { src: '/img/retreats/nina-mallorca-yoga.jpg', alt: { en: 'A yoga pose on the mat', de: 'Eine Yogahaltung auf der Matte', fr: 'Une posture de yoga sur le tapis', es: 'Una postura de yoga en la esterilla', it: 'Una posizione yoga sul tappetino', nl: 'Een yogahouding op de mat', pl: 'Pozycja jogi na macie', tr: 'Matta bir yoga duruşu' } },
      { src: '/img/retreats/nina-mallorca-beach.jpg', alt: { en: 'Painting on the beach at sunset', de: 'Malen am Strand bei Sonnenuntergang', fr: 'Peindre sur la plage au coucher du soleil', es: 'Pintar en la playa al atardecer', it: 'Dipingere in spiaggia al tramonto', nl: 'Schilderen op het strand bij zonsondergang', pl: 'Malowanie na plaży o zachodzie słońca', tr: 'Gün batımında sahilde resim' } },
      { src: '/img/retreats/nina-mallorca-lounge.jpg', alt: { en: 'The shaded lounge at the finca', de: 'Die schattige Lounge der Finca', fr: 'Le salon ombragé de la finca', es: 'El salón a la sombra de la finca', it: 'Il salotto all’ombra della finca', nl: 'De schaduwrijke lounge van de finca', pl: 'Zacieniony salon w fince', tr: 'Finca’nın gölgeli oturma alanı' } },
    ],
  },
  {
    // Nina's Klang & Farbe retreat in Şirince, organised with Selin
    // (Worldculture Travels), from her page (22.10.2026): programme, price
    // and inclusions as listed there.
    slug: 'nina-klang-farbe-tuerkei',
    start: '2027-06-16',
    end: '2027-06-22',
    country: 'TR',
    town: 'Şirince',
    region: {
      en: 'Turkey · a village in the hills near Ephesus',
      de: 'Türkei · ein Dorf in den Hügeln bei Ephesus',
      fr: 'Turquie · un village dans les collines près d’Éphèse',
      es: 'Turquía · un pueblo en las colinas cerca de Éfeso',
      it: 'Turchia · un villaggio sulle colline vicino a Efeso',
      nl: 'Turkije · een dorp in de heuvels bij Efeze',
      pl: 'Turcja · wioska na wzgórzach koło Efezu',
      tr: 'Türkiye · Efes yakınında tepelerde bir köy',
    },
    teacher: 'Nina Kranz',
    language: 'DE',
    contribution: {
      en: '€2,100 in a double room',
      de: '2.100 € im Doppelzimmer',
      fr: '2 100 € en chambre double',
      es: '2.100 € en habitación doble',
      it: '2.100 € in camera doppia',
      nl: '€ 2.100 in een tweepersoonskamer',
      pl: '2100 € w pokoju dwuosobowym',
      tr: 'Çift kişilik odada 2.100 €',
    },
    kicker: {
      en: 'Seven days for women · sound, colour & culture',
      de: 'Sieben Tage für Frauen · Klang, Farbe & Kultur',
      fr: 'Sept jours entre femmes · son, couleur et culture',
      es: 'Siete días para mujeres · sonido, color y cultura',
      it: 'Sette giorni per donne · suono, colore e cultura',
      nl: 'Zeven dagen voor vrouwen · klank, kleur & cultuur',
      pl: 'Siedem dni dla kobiet · dźwięk, kolor i kultura',
      tr: 'Kadınlar için yedi gün · ses, renk ve kültür',
    },
    title: {
      en: 'Sound & colour retreat in Turkey',
      de: 'Klang & Farbe Retreat in der Türkei',
      fr: 'Retraite son et couleur en Turquie',
      es: 'Retiro de sonido y color en Turquía',
      it: 'Ritiro di suono e colore in Turchia',
      nl: 'Klank- & kleurretraite in Turkije',
      pl: 'Retreat dźwięku i koloru w Turcji',
      tr: 'Türkiye’de ses ve renk inzivası',
    },
    enquiry: {
      en: 'the sound & colour retreat in Şirince with Nina Kranz, 16–22 June 2027',
      de: 'Klang & Farbe Retreat in Şirince mit Nina Kranz, 16.–22. Juni 2027',
      fr: 'la retraite son et couleur à Şirince avec Nina Kranz, du 16 au 22 juin 2027',
      es: 'el retiro de sonido y color en Şirince con Nina Kranz, del 16 al 22 de junio de 2027',
      it: 'il ritiro di suono e colore a Şirince con Nina Kranz, dal 16 al 22 giugno 2027',
      nl: 'de klank- & kleurretraite in Şirince met Nina Kranz, 16–22 juni 2027',
      pl: 'retreat dźwięku i koloru w Şirince z Niną Kranz, 16–22 czerwca 2027',
      tr: 'Nina Kranz ile Şirince’de ses ve renk inzivası, 16–22 Haziran 2027',
    },
    lede: {
      en: 'A week in Şirince, a former Greek village in the hills near Ephesus, for at most six women: singing bowls and intuitive painting with Nina Kranz, and the village, its people, its wine and its kitchen with Selin, who spent part of her childhood here.',
      de: 'Eine Woche in Şirince, einem ehemals griechischen Dorf in den Hügeln bei Ephesus, für höchstens sechs Frauen: Klangschalen und intuitives Malen mit Nina Kranz, und das Dorf, seine Menschen, sein Wein und seine Küche mit Selin, die einen Teil ihrer Kindheit hier verbracht hat.',
      fr: 'Une semaine à Şirince, ancien village grec dans les collines près d’Éphèse, pour six femmes au plus : bols chantants et peinture intuitive avec Nina Kranz, et le village, ses habitants, son vin et sa cuisine avec Selin, qui y a passé une partie de son enfance.',
      es: 'Una semana en Şirince, antiguo pueblo griego en las colinas cerca de Éfeso, para un máximo de seis mujeres: cuencos tibetanos y pintura intuitiva con Nina Kranz, y el pueblo, su gente, su vino y su cocina con Selin, que pasó aquí parte de su infancia.',
      it: 'Una settimana a Şirince, antico villaggio greco sulle colline vicino a Efeso, per al massimo sei donne: campane tibetane e pittura intuitiva con Nina Kranz, e il villaggio, la sua gente, il suo vino e la sua cucina con Selin, che vi ha trascorso parte dell’infanzia.',
      nl: 'Een week in Şirince, een voormalig Grieks dorp in de heuvels bij Efeze, voor hoogstens zes vrouwen: klankschalen en intuïtief schilderen met Nina Kranz, en het dorp, zijn mensen, zijn wijn en zijn keuken met Selin, die hier een deel van haar jeugd doorbracht.',
      pl: 'Tydzień w Şirince, dawnej greckiej wiosce na wzgórzach koło Efezu, dla najwyżej sześciu kobiet: misy dźwiękowe i intuicyjne malowanie z Niną Kranz oraz wioska, jej ludzie, wino i kuchnia z Selin, która spędziła tu część dzieciństwa.',
      tr: 'Efes yakınındaki tepelerde eski bir Rum köyü olan Şirince’de en fazla altı kadın için bir hafta: Nina Kranz ile şarkı söyleyen kâseler ve sezgisel resim; çocukluğunun bir kısmını burada geçiren Selin ile köy, insanları, şarabı ve mutfağı.',
    },
    about: {
      en: [
        'Nina and Selin met on a sailing-boat retreat Selin organised in September 2025, and decided to make retreats for women where calm, culture and creativity can be lived together. Selin, founder of Worldculture Travels, organises everything and shows you Şirince as travellers rarely see it; Nina, art and creativity therapist and sound facilitator, guides the painting and sound sessions — no technique, no perfectionism.',
        'The week follows a natural rhythm rather than a strict plan: sound baths and painting, walks through the village, a day at Ephesus and the beach, a cacao ceremony, and enough time for yourself by the pool. No experience with painting or sound baths is needed, and women travelling alone are welcome — the group shares meals, outings and moments.',
        'It is not for you if you are after a classic package holiday with a tight sightseeing schedule, or would rather travel entirely on your own.',
      ],
      de: [
        'Nina und Selin haben sich im September 2025 auf einem Segelbootretreat kennengelernt, das Selin organisiert hat, und beschlossen, Retreats für Frauen zu schaffen, in denen Ruhe, Kultur und Kreativität zusammen erlebbar werden. Selin, Gründerin von Worldculture Travels, organisiert alles und zeigt dir Şirince, wie man es als Reisende sonst kaum sieht; Nina, Kunst- und Kreativitätstherapeutin und Soundbath Facilitator, begleitet die Mal- und Klangmomente — keine Technik, kein Perfektionismus.',
        'Die Woche folgt keinem strikten Plan, sondern einem natürlichen Rhythmus: Klangbäder und Malen, Spaziergänge durchs Dorf, ein Tag in Ephesus und am Strand, eine Kakao-Zeremonie und genug Zeit für dich am Pool. Vorerfahrung im Malen oder mit Soundbaths brauchst du nicht, und wer allein anreist, ist genau richtig — die Gruppe teilt Mahlzeiten, Ausflüge und Momente.',
        'Nichts für dich ist es, wenn du einen klassischen Pauschalurlaub mit straffem Sightseeing-Programm suchst oder lieber ganz allein unterwegs bist.',
      ],
      fr: [
        'Nina et Selin se sont rencontrées en septembre 2025 lors d’une retraite en voilier organisée par Selin, et ont décidé de créer des retraites pour femmes où le calme, la culture et la créativité se vivent ensemble. Selin, fondatrice de Worldculture Travels, organise tout et vous montre Şirince comme les voyageurs la voient rarement ; Nina, art-thérapeute et praticienne du bain sonore, guide les moments de peinture et de son — sans technique ni perfectionnisme.',
        'La semaine suit un rythme naturel plutôt qu’un plan strict : bains sonores et peinture, promenades dans le village, une journée à Éphèse et à la plage, une cérémonie du cacao, et assez de temps pour soi au bord de la piscine. Aucune expérience de la peinture ni des bains sonores n’est nécessaire, et les femmes qui voyagent seules sont les bienvenues — le groupe partage repas, sorties et moments.',
        'Ce n’est pas pour vous si vous cherchez un voyage organisé classique au programme de visites serré, ou si vous préférez voyager entièrement seule.',
      ],
      es: [
        'Nina y Selin se conocieron en septiembre de 2025 en un retiro en velero que organizó Selin, y decidieron crear retiros para mujeres en los que la calma, la cultura y la creatividad se vivan juntas. Selin, fundadora de Worldculture Travels, lo organiza todo y te muestra Şirince como pocas viajeras la ven; Nina, terapeuta de arte y creatividad y facilitadora de baños de sonido, guía los momentos de pintura y sonido, sin técnica ni perfeccionismo.',
        'La semana sigue un ritmo natural más que un plan estricto: baños de sonido y pintura, paseos por el pueblo, un día en Éfeso y en la playa, una ceremonia de cacao y tiempo suficiente para ti junto a la piscina. No necesitas experiencia en pintura ni en baños de sonido, y si viajas sola estás en el lugar adecuado: el grupo comparte comidas, excursiones y momentos.',
        'No es para ti si buscas unas vacaciones organizadas clásicas con un programa de visitas apretado, o si prefieres viajar completamente sola.',
      ],
      it: [
        'Nina e Selin si sono conosciute nel settembre 2025 durante un ritiro in barca a vela organizzato da Selin, e hanno deciso di creare ritiri per donne in cui calma, cultura e creatività si vivono insieme. Selin, fondatrice di Worldculture Travels, organizza tutto e ti mostra Şirince come i viaggiatori la vedono di rado; Nina, arteterapeuta e facilitatrice di bagni sonori, accompagna i momenti di pittura e di suono — niente tecnica, niente perfezionismo.',
        'La settimana segue un ritmo naturale più che un programma rigido: bagni sonori e pittura, passeggiate nel villaggio, una giornata a Efeso e al mare, una cerimonia del cacao e tempo a sufficienza per te in piscina. Non serve esperienza di pittura né di bagni sonori, e chi viaggia da sola è benvenuta — il gruppo condivide pasti, gite e momenti.',
        'Non fa per te se cerchi una classica vacanza organizzata con un fitto programma di visite, o preferisci viaggiare del tutto da sola.',
      ],
      nl: [
        'Nina en Selin leerden elkaar in september 2025 kennen op een zeilbootretraite die Selin organiseerde, en besloten retraites voor vrouwen te maken waarin rust, cultuur en creativiteit samenkomen. Selin, oprichter van Worldculture Travels, regelt alles en laat je Şirince zien zoals reizigers het zelden zien; Nina, kunst- en creativiteitstherapeut en soundbath-begeleider, begeleidt de schilder- en klankmomenten — geen techniek, geen perfectionisme.',
        'De week volgt geen strak plan maar een natuurlijk ritme: klankbaden en schilderen, wandelingen door het dorp, een dag in Efeze en aan het strand, een cacaoceremonie en genoeg tijd voor jezelf bij het zwembad. Ervaring met schilderen of klankbaden is niet nodig, en wie alleen komt zit hier goed — de groep deelt maaltijden, uitstapjes en momenten.',
        'Het is niets voor jou als je een klassieke pakketreis met een strak bezichtigingsprogramma zoekt, of liever helemaal alleen reist.',
      ],
      pl: [
        'Nina i Selin poznały się we wrześniu 2025 roku na retreacie na żaglówce, który organizowała Selin, i postanowiły tworzyć retreaty dla kobiet, w których spokój, kultura i kreatywność przeżywa się razem. Selin, założycielka Worldculture Travels, wszystko organizuje i pokazuje Şirince tak, jak podróżne rzadko je widzą; Nina, terapeutka sztuką i kreatywnością oraz prowadząca kąpiele dźwiękowe, prowadzi chwile malowania i dźwięku — bez techniki, bez perfekcjonizmu.',
        'Tydzień płynie naturalnym rytmem, a nie według sztywnego planu: kąpiele dźwiękowe i malowanie, spacery po wiosce, dzień w Efezie i na plaży, ceremonia kakao i dość czasu dla siebie przy basenie. Nie potrzebujesz doświadczenia w malowaniu ani w kąpielach dźwiękowych, a jeśli jedziesz sama, to miejsce dla ciebie — grupa dzieli posiłki, wycieczki i chwile.',
        'To nie dla ciebie, jeśli szukasz klasycznych wczasów zorganizowanych z napiętym programem zwiedzania albo wolisz podróżować zupełnie sama.',
      ],
      tr: [
        'Nina ve Selin, Eylül 2025’te Selin’in düzenlediği bir yelkenli inzivasında tanıştılar ve huzurun, kültürün ve yaratıcılığın birlikte yaşanabildiği kadın inzivaları yapmaya karar verdiler. Worldculture Travels’ın kurucusu Selin her şeyi organize eder ve sana Şirince’yi gezginlerin pek göremediği gibi gösterir; sanat ve yaratıcılık terapisti ve ses banyosu kolaylaştırıcısı Nina ise resim ve ses anlarına eşlik eder — teknik yok, mükemmeliyetçilik yok.',
        'Hafta katı bir plana değil doğal bir ritme uyar: ses banyoları ve resim, köyde yürüyüşler, Efes’te ve sahilde bir gün, bir kakao seremonisi ve havuz başında kendine yetecek kadar zaman. Resim ya da ses banyosu deneyimi gerekmez; yalnız geliyorsan tam yerindesin — grup yemekleri, gezileri ve anları paylaşır.',
        'Sıkı bir gezi programı olan klasik bir paket tatil arıyorsan ya da tamamen tek başına seyahat etmeyi tercih ediyorsan sana göre değil.',
      ],
    },
    days: [
      {
        day: { en: 'Day 1 · Arrival', de: 'Tag 1 · Ankommen', fr: 'Jour 1 · Arrivée', es: 'Día 1 · Llegada', it: 'Giorno 1 · Arrivo', nl: 'Dag 1 · Aankomst', pl: 'Dzień 1 · Przyjazd', tr: '1. gün · Varış' },
        hours: { en: 'Wednesday 16 June', de: 'Mittwoch, 16. Juni', fr: 'Mercredi 16 juin', es: 'Miércoles 16 de junio', it: 'Mercoledì 16 giugno', nl: 'Woensdag 16 juni', pl: 'Środa, 16 czerwca', tr: '16 Haziran Çarşamba' },
        what: { en: 'Transfer, check-in, and getting to know each other over the first meal together.', de: 'Transfer, Check-in, und beim ersten gemeinsamen Essen lernt ihr euch kennen.', fr: 'Transfert, installation, et l’on fait connaissance au premier repas ensemble.', es: 'Traslado, check-in y el primer encuentro durante la primera comida juntas.', it: 'Transfer, check-in e la prima conoscenza durante il primo pasto insieme.', nl: 'Transfer, inchecken en kennismaken bij de eerste gezamenlijke maaltijd.', pl: 'Transfer, zameldowanie i poznawanie się przy pierwszym wspólnym posiłku.', tr: 'Transfer, giriş ve ilk ortak yemekte tanışma.' },
      },
      {
        day: { en: 'Day 2 · Painting, letting go', de: 'Tag 2 · Malen, Loslassen', fr: 'Jour 2 · Peindre, lâcher prise', es: 'Día 2 · Pintar, soltar', it: 'Giorno 2 · Dipingere, lasciar andare', nl: 'Dag 2 · Schilderen, loslaten', pl: 'Dzień 2 · Malowanie, odpuszczanie', tr: '2. gün · Resim, bırakmak' },
        hours: { en: 'Thursday 17 June', de: 'Donnerstag, 17. Juni', fr: 'Jeudi 17 juin', es: 'Jueves 17 de junio', it: 'Giovedì 17 giugno', nl: 'Donderdag 17 juni', pl: 'Czwartek, 17 czerwca', tr: '17 Haziran Perşembe' },
        what: { en: 'A sound bath and painting in the morning; in the afternoon the first walk into the village, past the houses where its people live, spice shops and old cobblestones. A wine tasting in the village in the evening.', de: 'Vormittags Klangbad und Malen; nachmittags der erste Gang ins Dorf, vorbei an den Häusern, in denen die Menschen wirklich leben, an Gewürzläden und altem Kopfsteinpflaster. Abends eine Weinverkostung im Dorf.', fr: 'Bain sonore et peinture le matin ; l’après-midi, première promenade dans le village, devant les maisons de ses habitants, les échoppes d’épices et les vieux pavés. Dégustation de vin au village le soir.', es: 'Baño de sonido y pintura por la mañana; por la tarde, el primer paseo por el pueblo, junto a las casas de su gente, tiendas de especias y viejos adoquines. Cata de vino en el pueblo por la noche.', it: 'Bagno sonoro e pittura al mattino; nel pomeriggio la prima passeggiata nel villaggio, tra le case dove vive la gente, botteghe di spezie e vecchi acciottolati. La sera una degustazione di vino in paese.', nl: 'Klankbad en schilderen in de ochtend; ’s middags de eerste wandeling het dorp in, langs de huizen waar de mensen wonen, kruidenwinkeltjes en oude keien. ’s Avonds een wijnproeverij in het dorp.', pl: 'Rano kąpiel dźwiękowa i malowanie; po południu pierwszy spacer po wiosce, obok domów jej mieszkańców, sklepików z przyprawami i starego bruku. Wieczorem degustacja wina w wiosce.', tr: 'Sabah ses banyosu ve resim; öğleden sonra köye ilk yürüyüş: insanların yaşadığı evler, baharatçılar ve eski arnavut kaldırımları. Akşam köyde şarap tadımı.' },
      },
      {
        day: { en: 'Day 3 · Ephesus & the sea', de: 'Tag 3 · Ephesus & Meer', fr: 'Jour 3 · Éphèse et la mer', es: 'Día 3 · Éfeso y el mar', it: 'Giorno 3 · Efeso e il mare', nl: 'Dag 3 · Efeze & de zee', pl: 'Dzień 3 · Efez i morze', tr: '3. gün · Efes ve deniz' },
        hours: { en: 'Friday 18 June', de: 'Freitag, 18. Juni', fr: 'Vendredi 18 juin', es: 'Viernes 18 de junio', it: 'Venerdì 18 giugno', nl: 'Vrijdag 18 juni', pl: 'Piątek, 18 czerwca', tr: '18 Haziran Cuma' },
        what: { en: 'A day trip to Ephesus, lunch together on the beach, painting there in the afternoon with your feet in the sand, and a sound bath in the evening.', de: 'Tagesausflug nach Ephesus, mittags gemeinsames Essen am Strand, nachmittags malen dort mit den Füßen im Sand, abends ein Klangbad.', fr: 'Une excursion à Éphèse, déjeuner ensemble sur la plage, peinture l’après-midi les pieds dans le sable, et un bain sonore le soir.', es: 'Excursión a Éfeso, almuerzo juntas en la playa, por la tarde pintar allí con los pies en la arena y un baño de sonido por la noche.', it: 'Gita a Efeso, pranzo insieme in spiaggia, nel pomeriggio si dipinge lì con i piedi nella sabbia, e la sera un bagno sonoro.', nl: 'Een dagtrip naar Efeze, samen lunchen op het strand, ’s middags daar schilderen met je voeten in het zand, en ’s avonds een klankbad.', pl: 'Wycieczka do Efezu, wspólny obiad na plaży, po południu malowanie ze stopami w piasku i wieczorem kąpiel dźwiękowa.', tr: 'Efes’e günübirlik gezi, sahilde birlikte öğle yemeği, öğleden sonra ayaklar kumda resim ve akşam ses banyosu.' },
      },
      {
        day: { en: 'Day 4 · Feeling', de: 'Tag 4 · Gefühlsarbeit', fr: 'Jour 4 · Ressentir', es: 'Día 4 · Sentir', it: 'Giorno 4 · Sentire', nl: 'Dag 4 · Voelen', pl: 'Dzień 4 · Czucie', tr: '4. gün · Hissetmek' },
        hours: { en: 'Saturday 19 June', de: 'Samstag, 19. Juni', fr: 'Samedi 19 juin', es: 'Sábado 19 de junio', it: 'Sabato 19 giugno', nl: 'Zaterdag 19 juni', pl: 'Sobota, 19 czerwca', tr: '19 Haziran Cumartesi' },
        what: { en: 'Going deeper: a heart-opening cacao ceremony makes room for what you rarely have time to feel.', de: 'Heute geht es tiefer: Eine Kakao-Zeremonie zur Herzöffnung schafft Raum für das, was du sonst selten Zeit hast zu fühlen.', fr: 'On va plus loin : une cérémonie du cacao pour ouvrir le cœur fait de la place à ce que l’on prend rarement le temps de ressentir.', es: 'Hoy se va más hondo: una ceremonia de cacao para abrir el corazón deja espacio a lo que rara vez tienes tiempo de sentir.', it: 'Oggi si va più a fondo: una cerimonia del cacao per aprire il cuore fa spazio a ciò che raramente hai tempo di sentire.', nl: 'Vandaag gaat het dieper: een cacaoceremonie om het hart te openen maakt ruimte voor wat je zelden tijd hebt om te voelen.', pl: 'Dziś głębiej: ceremonia kakao otwierająca serce robi miejsce na to, na co rzadko masz czas, by poczuć.', tr: 'Bugün daha derine: kalbi açan bir kakao seremonisi, nadiren hissetmeye vakit bulduğun şeylere alan açar.' },
      },
      {
        day: { en: 'Day 5 · Creativity & retreat', de: 'Tag 5 · Kreativität & Rückzug', fr: 'Jour 5 · Créativité et repos', es: 'Día 5 · Creatividad y descanso', it: 'Giorno 5 · Creatività e riposo', nl: 'Dag 5 · Creativiteit & rust', pl: 'Dzień 5 · Kreatywność i odpoczynek', tr: '5. gün · Yaratıcılık ve dinlenme' },
        hours: { en: 'Sunday 20 June', de: 'Sonntag, 20. Juni', fr: 'Dimanche 20 juin', es: 'Domingo 20 de junio', it: 'Domenica 20 giugno', nl: 'Zondag 20 juni', pl: 'Niedziela, 20 czerwca', tr: '20 Haziran Pazar' },
        what: { en: 'No fixed programme: a sound bath and painting for whoever wants, the village again, the pool, or nothing at all.', de: 'Kein festes Programm: Klangbad und Malen für wer möchte, noch einmal ins Dorf, an den Pool, oder einfach nichts tun.', fr: 'Pas de programme fixe : bain sonore et peinture pour qui le souhaite, le village à nouveau, la piscine, ou rien du tout.', es: 'Sin programa fijo: baño de sonido y pintura para quien quiera, otra vuelta por el pueblo, la piscina o no hacer nada.', it: 'Nessun programma fisso: bagno sonoro e pittura per chi vuole, di nuovo il villaggio, la piscina o niente del tutto.', nl: 'Geen vast programma: klankbad en schilderen voor wie wil, nog eens het dorp in, het zwembad, of helemaal niets.', pl: 'Bez stałego programu: kąpiel dźwiękowa i malowanie dla chętnych, znów wioska, basen albo nic.', tr: 'Sabit program yok: isteyene ses banyosu ve resim, yeniden köy, havuz ya da hiçbir şey.' },
      },
      {
        day: { en: 'Day 6 · Closing', de: 'Tag 6 · Abschluss', fr: 'Jour 6 · Clôture', es: 'Día 6 · Cierre', it: 'Giorno 6 · Chiusura', nl: 'Dag 6 · Afsluiting', pl: 'Dzień 6 · Zamknięcie', tr: '6. gün · Kapanış' },
        hours: { en: 'Monday 21 June', de: 'Montag, 21. Juni', fr: 'Lundi 21 juin', es: 'Lunes 21 de junio', it: 'Lunedì 21 giugno', nl: 'Maandag 21 juni', pl: 'Poniedziałek, 21 czerwca', tr: '21 Haziran Pazartesi' },
        what: { en: 'The last session: painting one large picture together that holds the whole week. Then free time and the farewell dinner.', de: 'Die letzte gemeinsame Session: ihr malt zusammen an einem großen Bild, das die ganze Woche in sich trägt. Danach freie Zeit und das Abschlussdinner.', fr: 'La dernière séance : peindre ensemble un grand tableau qui porte toute la semaine. Puis du temps libre et le dîner d’adieu.', es: 'La última sesión: pintar juntas un gran cuadro que guarda toda la semana. Después, tiempo libre y la cena de despedida.', it: 'L’ultima sessione: dipingere insieme un grande quadro che racchiude tutta la settimana. Poi tempo libero e la cena d’addio.', nl: 'De laatste sessie: samen één groot schilderij maken dat de hele week in zich draagt. Daarna vrije tijd en het afscheidsdiner.', pl: 'Ostatnia sesja: wspólne malowanie dużego obrazu, który zawiera cały tydzień. Potem czas wolny i kolacja pożegnalna.', tr: 'Son oturum: bütün haftayı taşıyan büyük bir resmi birlikte boyamak. Ardından serbest zaman ve veda yemeği.' },
      },
      {
        day: { en: 'Day 7 · Goodbye', de: 'Tag 7 · Abschied', fr: 'Jour 7 · Au revoir', es: 'Día 7 · Despedida', it: 'Giorno 7 · Arrivederci', nl: 'Dag 7 · Afscheid', pl: 'Dzień 7 · Pożegnanie', tr: '7. gün · Veda' },
        hours: { en: 'Tuesday 22 June', de: 'Dienstag, 22. Juni', fr: 'Mardi 22 juin', es: 'Martes 22 de junio', it: 'Martedì 22 giugno', nl: 'Dinsdag 22 juni', pl: 'Wtorek, 22 czerwca', tr: '22 Haziran Salı' },
        what: { en: 'Breakfast, check-out and the transfer to the airport.', de: 'Frühstück, Check-out, Transfer zum Flughafen.', fr: 'Petit-déjeuner, départ et transfert à l’aéroport.', es: 'Desayuno, check-out y traslado al aeropuerto.', it: 'Colazione, check-out e transfer in aeroporto.', nl: 'Ontbijt, uitchecken en transfer naar het vliegveld.', pl: 'Śniadanie, wymeldowanie i transfer na lotnisko.', tr: 'Kahvaltı, çıkış ve havalimanına transfer.' },
      },
    ],
    practice: {
      en: ['Sound baths with singing bowls', 'Intuitive painting, alone and on one big shared canvas', 'The village of Şirince, its wine and its kitchen', 'Ephesus, the beach and a cacao ceremony', 'At most six women, no experience needed'],
      de: ['Klangbäder mit Klangschalen', 'Intuitives Malen, allein und an einem großen gemeinsamen Bild', 'Das Dorf Şirince, sein Wein und seine Küche', 'Ephesus, der Strand und eine Kakao-Zeremonie', 'Höchstens sechs Frauen, keine Vorerfahrung nötig'],
      fr: ['Bains sonores aux bols chantants', 'Peinture intuitive, seule et sur une grande toile commune', 'Le village de Şirince, son vin et sa cuisine', 'Éphèse, la plage et une cérémonie du cacao', 'Six femmes au plus, aucune expérience requise'],
      es: ['Baños de sonido con cuencos tibetanos', 'Pintura intuitiva, sola y en un gran lienzo común', 'El pueblo de Şirince, su vino y su cocina', 'Éfeso, la playa y una ceremonia de cacao', 'Como máximo seis mujeres, sin experiencia previa'],
      it: ['Bagni sonori con campane tibetane', 'Pittura intuitiva, da sola e su una grande tela comune', 'Il villaggio di Şirince, il suo vino e la sua cucina', 'Efeso, la spiaggia e una cerimonia del cacao', 'Al massimo sei donne, nessuna esperienza richiesta'],
      nl: ['Klankbaden met klankschalen', 'Intuïtief schilderen, alleen en aan één groot gezamenlijk doek', 'Het dorp Şirince, zijn wijn en zijn keuken', 'Efeze, het strand en een cacaoceremonie', 'Hoogstens zes vrouwen, geen ervaring nodig'],
      pl: ['Kąpiele dźwiękowe z misami', 'Intuicyjne malowanie, samodzielnie i na jednym dużym wspólnym płótnie', 'Wioska Şirince, jej wino i kuchnia', 'Efez, plaża i ceremonia kakao', 'Najwyżej sześć kobiet, bez doświadczenia'],
      tr: ['Şarkı söyleyen kâselerle ses banyoları', 'Tek başına ve büyük ortak bir tuvalde sezgisel resim', 'Şirince köyü, şarabı ve mutfağı', 'Efes, sahil ve bir kakao seremonisi', 'En fazla altı kadın, deneyim gerekmez'],
    },
    bring: {
      en: 'Not in the price: flights to and from Izmir, soft drinks and alcohol, travel and cancellation insurance, personal spending and tips for the hotel and guide. Meals tailored to you (gluten- or lactose-free, for example) are possible for a surcharge. A deposit of 20% is due on booking, which goes through Worldculture Travels; booking together with a friend saves you €25 each.',
      de: 'Nicht im Preis: Flug nach und von Izmir, Softdrinks und Alkohol, Reise- und Reiserücktrittsversicherung, persönliche Ausgaben und Trinkgeld für Hotel und Guide. Auf dich zugeschnittene Mahlzeiten (etwa gluten- oder laktosefrei) sind gegen Aufpreis möglich. 20 % Anzahlung bei der Buchung, die über Worldculture Travels läuft; meldest du dich mit einer Freundin an, spart ihr jeweils 25 €.',
      fr: 'Non compris : les vols vers et depuis Izmir, les sodas et l’alcool, l’assurance voyage et annulation, les dépenses personnelles et les pourboires pour l’hôtel et le guide. Des repas adaptés (sans gluten ou sans lactose, par exemple) sont possibles avec supplément. Un acompte de 20 % est dû à la réservation, qui passe par Worldculture Travels ; à deux amies, chacune économise 25 €.',
      es: 'No incluido: vuelos a y desde Esmirna, refrescos y alcohol, seguro de viaje y de cancelación, gastos personales y propinas para el hotel y la guía. Las comidas adaptadas (sin gluten o sin lactosa, por ejemplo) son posibles con suplemento. Un depósito del 20 % al reservar, a través de Worldculture Travels; si te apuntas con una amiga, cada una ahorra 25 €.',
      it: 'Non compresi: voli da e per Smirne, bibite e alcolici, assicurazione di viaggio e di annullamento, spese personali e mance per hotel e guida. Pasti su misura (per esempio senza glutine o senza lattosio) sono possibili con supplemento. Un acconto del 20 % alla prenotazione, che passa da Worldculture Travels; prenotando con un’amica risparmiate 25 € ciascuna.',
      nl: 'Niet inbegrepen: vluchten van en naar Izmir, frisdrank en alcohol, reis- en annuleringsverzekering, persoonlijke uitgaven en fooien voor hotel en gids. Maaltijden op maat (bijvoorbeeld gluten- of lactosevrij) kunnen tegen meerprijs. Een aanbetaling van 20% bij het boeken, dat via Worldculture Travels loopt; boek je samen met een vriendin, dan bespaar je elk € 25.',
      pl: 'Nie w cenie: loty do i z Izmiru, napoje i alkohol, ubezpieczenie podróżne i od rezygnacji, wydatki własne i napiwki dla hotelu i przewodniczki. Posiłki dopasowane do ciebie (np. bezglutenowe lub bezlaktozowe) są możliwe za dopłatą. Zaliczka 20% przy rezerwacji, którą prowadzi Worldculture Travels; zapisując się z przyjaciółką, każda oszczędza 25 €.',
      tr: 'Fiyata dahil değil: İzmir’e gidiş-dönüş uçuş, meşrubat ve alkol, seyahat ve iptal sigortası, kişisel harcamalar ve otel ile rehber için bahşiş. Sana göre hazırlanan yemekler (örneğin glütensiz ya da laktozsuz) ek ücretle mümkündür. Rezervasyonda %20 kapora alınır; rezervasyon Worldculture Travels üzerinden yapılır. Bir arkadaşınla birlikte kaydolursan ikiniz de 25 € tasarruf edersiniz.',
    },
    provided: {
      en: 'Six nights in the houses of the estate, all workshops and singing-bowl sessions, breakfast, lunch and dinner every day with water and tea, meals out on the excursions, the wine tasting in the village, the entrance to Ephesus, the airport transfer and all excursions and transfers in the programme, and a private WhatsApp group.',
      de: 'Sechs Übernachtungen in den Häusern des Anwesens, alle Workshops und Klangschalen-Sessions, täglich Frühstück, Mittag- und Abendessen mit Wasser und Tee, externe Mahlzeiten bei den Ausflügen, die Weinverkostung im Dorf, der Eintritt für Ephesus, der Flughafentransfer und alle Ausflüge und Transfers im Programm, dazu eine private WhatsApp-Gruppe.',
      fr: 'Six nuits dans les maisons du domaine, tous les ateliers et séances de bols chantants, petit-déjeuner, déjeuner et dîner chaque jour avec eau et thé, les repas pris lors des excursions, la dégustation de vin au village, l’entrée à Éphèse, le transfert aéroport et toutes les excursions et transferts du programme, ainsi qu’un groupe WhatsApp privé.',
      es: 'Seis noches en las casas de la finca, todos los talleres y sesiones de cuencos, desayuno, almuerzo y cena cada día con agua y té, las comidas fuera durante las excursiones, la cata de vino en el pueblo, la entrada a Éfeso, el traslado al aeropuerto y todas las excursiones y traslados del programa, además de un grupo privado de WhatsApp.',
      it: 'Sei notti nelle case della tenuta, tutti i laboratori e le sessioni con le campane tibetane, colazione, pranzo e cena ogni giorno con acqua e tè, i pasti fuori durante le gite, la degustazione di vino in paese, l’ingresso a Efeso, il transfer aeroportuale e tutte le gite e i transfer del programma, più un gruppo WhatsApp privato.',
      nl: 'Zes nachten in de huizen van het landgoed, alle workshops en klankschaalsessies, elke dag ontbijt, lunch en diner met water en thee, maaltijden buiten de deur tijdens de uitstapjes, de wijnproeverij in het dorp, de toegang tot Efeze, de luchthaventransfer en alle uitstapjes en transfers in het programma, plus een privé-WhatsAppgroep.',
      pl: 'Sześć nocy w domach posiadłości, wszystkie warsztaty i sesje z misami, codziennie śniadanie, obiad i kolacja z wodą i herbatą, posiłki na wycieczkach, degustacja wina w wiosce, wstęp do Efezu, transfer z lotniska oraz wszystkie wycieczki i przejazdy z programu, a także prywatna grupa na WhatsAppie.',
      tr: 'Arazideki evlerde altı gece, tüm atölyeler ve kâse seansları, her gün su ve çayla kahvaltı, öğle ve akşam yemeği, gezilerdeki dışarıda yemekler, köyde şarap tadımı, Efes giriş ücreti, havalimanı transferi ve programdaki tüm gezi ve transferler, ayrıca özel bir WhatsApp grubu.',
    },
    house: {
      en: 'Lovingly furnished houses on a large estate reserved for the group alone, among fragrant olive groves, with a pool. Şirince itself is a former Greek village of winding lanes, white stone houses and red-tiled roofs in the hills near Ephesus.',
      de: 'Liebevoll gestaltete Häuser auf einem weitläufigen Anwesen, das nur der Gruppe vorbehalten ist, zwischen duftenden Olivenhainen, mit Pool. Şirince selbst ist ein ehemals altgriechisches Dorf mit verwinkelten Gassen, weißen Steinhäusern und roten Ziegeldächern in den Hügeln bei Ephesus.',
      fr: 'Des maisons aménagées avec soin sur un vaste domaine réservé au seul groupe, parmi des oliveraies parfumées, avec piscine. Şirince est un ancien village grec aux ruelles sinueuses, maisons de pierre blanche et toits de tuiles rouges, dans les collines près d’Éphèse.',
      es: 'Casas decoradas con cariño en una amplia finca reservada solo para el grupo, entre olivares fragantes, con piscina. Şirince es un antiguo pueblo griego de callejuelas sinuosas, casas de piedra blanca y tejados rojos en las colinas cerca de Éfeso.',
      it: 'Case arredate con cura in una vasta tenuta riservata al solo gruppo, tra uliveti profumati, con piscina. Şirince è un antico villaggio greco di vicoli tortuosi, case di pietra bianca e tetti di tegole rosse sulle colline vicino a Efeso.',
      nl: 'Liefdevol ingerichte huizen op een ruim landgoed dat alleen voor de groep is, tussen geurende olijfgaarden, met zwembad. Şirince zelf is een voormalig Grieks dorp met kronkelende straatjes, witte stenen huizen en rode pannendaken in de heuvels bij Efeze.',
      pl: 'Starannie urządzone domy w rozległej posiadłości zarezerwowanej tylko dla grupy, wśród pachnących gajów oliwnych, z basenem. Samo Şirince to dawna grecka wioska krętych uliczek, białych kamiennych domów i czerwonych dachów na wzgórzach koło Efezu.',
      tr: 'Yalnızca gruba ayrılmış geniş bir arazide, kokulu zeytinlikler arasında, havuzlu ve özenle döşenmiş evler. Şirince ise Efes yakınındaki tepelerde dolambaçlı sokakları, beyaz taş evleri ve kırmızı kiremitli çatılarıyla eski bir Rum köyüdür.',
    },
    titles: {
      weekend: { en: 'The days', de: 'Die Tage', fr: 'Les jours', es: 'Los días', it: 'I giorni', nl: 'De dagen', pl: 'Dni', tr: 'Günler' },
      practice: { en: 'What you do', de: 'Was dich erwartet', fr: 'Ce que vous faites', es: 'Qué harás', it: 'Cosa farai', nl: 'Wat je doet', pl: 'Co będziesz robić', tr: 'Neler yapacaksın' },
      place: { en: 'The place', de: 'Der Ort', fr: 'Le lieu', es: 'El lugar', it: 'Il luogo', nl: 'De plek', pl: 'Miejsce', tr: 'Yer' },
      bring: { en: 'Not included', de: 'Nicht inbegriffen', fr: 'Non compris', es: 'No incluido', it: 'Non compreso', nl: 'Niet inbegrepen', pl: 'Nie w cenie', tr: 'Dahil olmayanlar' },
      provided: { en: 'What’s included', de: 'Was inbegriffen ist', fr: 'Ce qui est compris', es: 'Qué incluye', it: 'Cosa è incluso', nl: 'Wat is inbegrepen', pl: 'Co jest w cenie', tr: 'Neler dahil' },
    },
    hero: '/img/retreats/nina-klang-group.jpg',
    gallery: [
      { src: '/img/retreats/nina-klang-sound.jpg', alt: { en: 'A sound bath on the lawn by the pool', de: 'Ein Klangbad auf der Wiese am Pool', fr: 'Un bain sonore sur la pelouse près de la piscine', es: 'Un baño de sonido en el césped junto a la piscina', it: 'Un bagno sonoro sul prato accanto alla piscina', nl: 'Een klankbad op het gras bij het zwembad', pl: 'Kąpiel dźwiękowa na trawniku przy basenie', tr: 'Havuz kenarındaki çimlerde bir ses banyosu' } },
      { src: '/img/retreats/nina-klang-pool.jpg', alt: { en: 'Painting together by the pool', de: 'Gemeinsames Malen am Pool', fr: 'Peindre ensemble au bord de la piscine', es: 'Pintar juntas junto a la piscina', it: 'Dipingere insieme accanto alla piscina', nl: 'Samen schilderen bij het zwembad', pl: 'Wspólne malowanie przy basenie', tr: 'Havuz başında birlikte resim' } },
      { src: '/img/retreats/nina-klang-sirince.jpg', alt: { en: 'The hills around Şirince', de: 'Die Hügel um Şirince', fr: 'Les collines autour de Şirince', es: 'Las colinas alrededor de Şirince', it: 'Le colline intorno a Şirince', nl: 'De heuvels rond Şirince', pl: 'Wzgórza wokół Şirince', tr: 'Şirince’yi çevreleyen tepeler' } },
      { src: '/img/retreats/nina-klang-estate.jpg', alt: { en: 'The estate among olive groves, from above', de: 'Das Anwesen zwischen Olivenhainen, von oben', fr: 'Le domaine parmi les oliviers, vu d’en haut', es: 'La finca entre olivares, desde arriba', it: 'La tenuta tra gli uliveti, dall’alto', nl: 'Het landgoed tussen olijfgaarden, van bovenaf', pl: 'Posiadłość wśród gajów oliwnych, z góry', tr: 'Zeytinlikler arasındaki arazi, yukarıdan' } },
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
