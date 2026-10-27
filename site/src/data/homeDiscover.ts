import type { Lang } from '../lib/url.ts';

/** The home page (HomePage.astro): a centred headline with
 *  a handwritten second half, a search pill that hands what/when/where to
 *  the calendar's own filters, rows of real upcoming dates, the activities
 *  as round pictures, and the makers as polaroids.
 *
 *  `*Hand` is the half of a heading set apart — in handwriting on the hero,
 *  in the italic serif on the section heads. Everything else on the page
 *  (occasion names, the solo card, the team and maker blocks, the calendar
 *  link) reuses copy that already exists elsewhere. */
export interface HomeDiscoverCopy {
  eyebrow: string;
  h1a: string;
  h1b: string;
  lede: string;
  /** The search pill: three labelled fields and the button. */
  searchLabel: string;
  what: string; whatAny: string;
  when: string; whenAny: string;
  where: string; whereAny: string;
  search: string;
  weekTitle: string; weekHand: string; weekSub: string;
  catsTitle: string; catsHand: string;
  makersTitle: string; makersHand: string; makersSub: string;
  seeAll: string;
  /** Under a category circle: the maker in the photo and how many more
   *  teach it — "Qian & 7 more", or the name alone when there are none. */
  faceMore: (name: string, more: number) => string;
}

export const homeDiscoverCopy: Record<Lang, HomeDiscoverCopy> = {
  en: {
    eyebrow: 'Workshops & community in Berlin · by real makers',
    h1a: 'Make something with your hands.', h1b: 'This week in Berlin.',
    lede: 'Pottery, candles, printmaking, sushi and more, with independent Berlin makers. On your own, as a pair or with your whole team. For everyone looking for community.',
    searchLabel: 'Find a workshop',
    what: 'What?', whatAny: 'Any workshop',
    when: 'When?', whenAny: 'Any day',
    where: 'Where?', whereAny: 'All of Berlin',
    search: 'Search',
    weekTitle: 'What’s on', weekHand: 'this week', weekSub: 'Real dates from our hosts, one per maker.',
    catsTitle: 'What are you', catsHand: 'in the mood for?',
    makersTitle: 'The hands', makersHand: 'behind it', makersSub: 'Independent makers from all over Berlin, each with a craft of their own.',
    seeAll: 'See all', faceMore: (name, n) => (n > 0 ? `${name} & ${n} more` : name),
  },
  de: {
    eyebrow: 'Workshops & Community in Berlin · von echten Maker*innen',
    h1a: 'Mach was mit deinen Händen.', h1b: 'Diese Woche in Berlin.',
    lede: 'Töpfern, Kerzen, Siebdruck, Sushi und mehr, bei unabhängigen Berliner Maker*innen. Allein, zu zweit oder mit dem ganzen Team. Für alle, die Community suchen.',
    searchLabel: 'Workshop finden',
    what: 'Was?', whatAny: 'Alle Workshops',
    when: 'Wann?', whenAny: 'Jederzeit',
    where: 'Wo?', whereAny: 'Ganz Berlin',
    search: 'Suchen',
    weekTitle: 'Was diese Woche', weekHand: 'läuft', weekSub: 'Echte Termine unserer Gastgeber, einer pro Maker*in.',
    catsTitle: 'Worauf hast du', catsHand: 'Lust?',
    makersTitle: 'Die Hände', makersHand: 'dahinter', makersSub: 'Unabhängige Maker*innen aus ganz Berlin, jede*r mit einem eigenen Handwerk.',
    seeAll: 'Alle ansehen', faceMore: (name, n) => (n > 0 ? `${name} & ${n} weitere` : name),
  },
  fr: {
    eyebrow: 'Ateliers à Berlin · par de vrais artisans',
    h1a: 'Créez quelque chose de vos mains.', h1b: 'Cette semaine à Berlin.',
    lede: 'Poterie, bougies, sérigraphie, sushis et plus encore, avec des artisans indépendants de Berlin. Seul, à deux ou avec toute votre équipe. Pour tous ceux qui cherchent une communauté.',
    searchLabel: 'Trouver un atelier',
    what: 'Quoi ?', whatAny: 'Tous les ateliers',
    when: 'Quand ?', whenAny: 'N’importe quel jour',
    where: 'Où ?', whereAny: 'Tout Berlin',
    search: 'Rechercher',
    weekTitle: 'Au programme', weekHand: 'cette semaine', weekSub: 'De vraies dates de nos hôtes, une par artisan.',
    catsTitle: 'De quoi avez-vous', catsHand: 'envie ?',
    makersTitle: 'Les mains', makersHand: 'derrière', makersSub: 'Des artisans indépendants de tout Berlin, chacun avec son propre savoir-faire.',
    seeAll: 'Tout voir', faceMore: (name, n) => (n > 0 ? `${name} et ${n} autre${n > 1 ? 's' : ''}` : name),
  },
  es: {
    eyebrow: 'Talleres en Berlín · de creadores reales',
    h1a: 'Crea algo con tus manos.', h1b: 'Esta semana en Berlín.',
    lede: 'Cerámica, velas, serigrafía, sushi y mucho más, con creadores independientes de Berlín. Solo, en pareja o con todo tu equipo. Para quienes buscan comunidad.',
    searchLabel: 'Buscar un taller',
    what: '¿Qué?', whatAny: 'Todos los talleres',
    when: '¿Cuándo?', whenAny: 'Cualquier día',
    where: '¿Dónde?', whereAny: 'Todo Berlín',
    search: 'Buscar',
    weekTitle: 'Lo que hay', weekHand: 'esta semana', weekSub: 'Fechas reales de nuestros anfitriones, una por creador.',
    catsTitle: '¿Qué te', catsHand: 'apetece?',
    makersTitle: 'Las manos', makersHand: 'detrás', makersSub: 'Creadores independientes de todo Berlín, cada uno con su propio oficio.',
    seeAll: 'Ver todo', faceMore: (name, n) => (n > 0 ? `${name} y ${n} más` : name),
  },
  it: {
    eyebrow: 'Workshop a Berlino · da veri artigiani',
    h1a: 'Crea qualcosa con le tue mani.', h1b: 'Questa settimana a Berlino.',
    lede: 'Ceramica, candele, serigrafia, sushi e altro ancora, con artigiani indipendenti di Berlino. Da solo, in due o con tutto il team. Per chi cerca una community.',
    searchLabel: 'Trova un workshop',
    what: 'Cosa?', whatAny: 'Tutti i workshop',
    when: 'Quando?', whenAny: 'Qualsiasi giorno',
    where: 'Dove?', whereAny: 'Tutta Berlino',
    search: 'Cerca',
    weekTitle: 'In programma', weekHand: 'questa settimana', weekSub: 'Date vere dei nostri host, una per artigiano.',
    catsTitle: 'Cosa ti va', catsHand: 'di fare?',
    makersTitle: 'Le mani', makersHand: 'dietro', makersSub: 'Artigiani indipendenti da tutta Berlino, ognuno con il proprio mestiere.',
    seeAll: 'Vedi tutto', faceMore: (name, n) => (n > 0 ? `${name} e altri ${n}` : name),
  },
  nl: {
    eyebrow: 'Workshops in Berlijn · van echte makers',
    h1a: 'Maak iets met je handen.', h1b: 'Deze week in Berlijn.',
    lede: 'Keramiek, kaarsen, zeefdruk, sushi en meer, bij onafhankelijke Berlijnse makers. Alleen, met z’n tweeën of met je hele team. Voor iedereen die een community zoekt.',
    searchLabel: 'Workshop zoeken',
    what: 'Wat?', whatAny: 'Alle workshops',
    when: 'Wanneer?', whenAny: 'Elke dag',
    where: 'Waar?', whereAny: 'Heel Berlijn',
    search: 'Zoeken',
    weekTitle: 'Op het programma', weekHand: 'deze week', weekSub: 'Echte data van onze hosts, één per maker.',
    catsTitle: 'Waar heb je', catsHand: 'zin in?',
    makersTitle: 'De handen', makersHand: 'erachter', makersSub: 'Onafhankelijke makers uit heel Berlijn, ieder met een eigen ambacht.',
    seeAll: 'Alles bekijken', faceMore: (name, n) => (n > 0 ? `${name} & ${n} anderen` : name),
  },
  pl: {
    eyebrow: 'Warsztaty w Berlinie · od prawdziwych twórców',
    h1a: 'Zrób coś własnymi rękami.', h1b: 'W tym tygodniu w Berlinie.',
    lede: 'Ceramika, świece, sitodruk, sushi i nie tylko, z niezależnymi twórcami z Berlina. Samemu, we dwoje albo z całym zespołem. Dla wszystkich, którzy szukają społeczności.',
    searchLabel: 'Znajdź warsztat',
    what: 'Co?', whatAny: 'Wszystkie warsztaty',
    when: 'Kiedy?', whenAny: 'Dowolny dzień',
    where: 'Gdzie?', whereAny: 'Cały Berlin',
    search: 'Szukaj',
    weekTitle: 'Co się dzieje', weekHand: 'w tym tygodniu', weekSub: 'Prawdziwe terminy naszych prowadzących, jeden na twórcę.',
    catsTitle: 'Na co masz', catsHand: 'ochotę?',
    makersTitle: 'Ręce', makersHand: 'za tym', makersSub: 'Niezależni twórcy z całego Berlina, każdy z własnym rzemiosłem.',
    seeAll: 'Zobacz wszystko', faceMore: (name, n) => (n > 0 ? `${name} i ${n} innych` : name),
  },
  tr: {
    eyebrow: 'Berlin’de atölyeler · gerçek üreticilerden',
    h1a: 'Ellerinle bir şey yap.', h1b: 'Bu hafta Berlin’de.',
    lede: 'Seramik, mum, serigrafi, suşi ve daha fazlası, Berlin’in bağımsız üreticileriyle. Tek başına, iki kişi ya da tüm ekibinle. Topluluk arayan herkes için.',
    searchLabel: 'Atölye bul',
    what: 'Ne?', whatAny: 'Tüm atölyeler',
    when: 'Ne zaman?', whenAny: 'Herhangi bir gün',
    where: 'Nerede?', whereAny: 'Tüm Berlin',
    search: 'Ara',
    weekTitle: 'Bu hafta', weekHand: 'neler var', weekSub: 'Eğitmenlerimizden gerçek tarihler, her üreticiden bir tane.',
    catsTitle: 'Canın ne', catsHand: 'istiyor?',
    makersTitle: 'İşin arkasındaki', makersHand: 'eller', makersSub: 'Berlin’in her yerinden bağımsız üreticiler, her birinin kendi zanaatı var.',
    seeAll: 'Tümünü gör', faceMore: (name, n) => (n > 0 ? `${name} ve ${n} kişi daha` : name),
  },
};
