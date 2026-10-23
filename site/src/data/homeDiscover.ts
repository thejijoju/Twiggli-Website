import type { Lang } from '../lib/url.ts';

/** The home page's discover layout (HomePage.astro): a centred headline with
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
  prev: string; next: string;
}

export const homeDiscoverCopy: Record<Lang, HomeDiscoverCopy> = {
  en: {
    eyebrow: 'Workshops in Berlin · by real makers',
    h1a: 'Make something with your hands.', h1b: 'This week.',
    lede: 'Pottery, candles, printmaking, sushi and more, with independent Berlin makers. On your own, as a pair or with your whole team.',
    searchLabel: 'Find a workshop',
    what: 'What?', whatAny: 'Any workshop',
    when: 'When?', whenAny: 'Any day',
    where: 'Where?', whereAny: 'All of Berlin',
    search: 'Search',
    weekTitle: 'This week', weekHand: 'in Berlin', weekSub: 'Real dates from our hosts, one per maker.',
    catsTitle: 'What are you', catsHand: 'in the mood for?',
    makersTitle: 'The hands', makersHand: 'behind it', makersSub: 'Independent makers from all over Berlin, each with a craft of their own.',
    seeAll: 'See all', prev: 'Back', next: 'More',
  },
  de: {
    eyebrow: 'Workshops in Berlin · von echten Maker*innen',
    h1a: 'Mach was mit deinen Händen.', h1b: 'Diese Woche.',
    lede: 'Töpfern, Kerzen, Siebdruck, Sushi und mehr, bei unabhängigen Berliner Maker*innen. Allein, zu zweit oder mit dem ganzen Team.',
    searchLabel: 'Workshop finden',
    what: 'Was?', whatAny: 'Alle Workshops',
    when: 'Wann?', whenAny: 'Jederzeit',
    where: 'Wo?', whereAny: 'Ganz Berlin',
    search: 'Suchen',
    weekTitle: 'Diese Woche', weekHand: 'in Berlin', weekSub: 'Echte Termine unserer Gastgeber, einer pro Maker*in.',
    catsTitle: 'Worauf hast du', catsHand: 'Lust?',
    makersTitle: 'Die Hände', makersHand: 'dahinter', makersSub: 'Unabhängige Maker*innen aus ganz Berlin, jede*r mit einem eigenen Handwerk.',
    seeAll: 'Alle ansehen', prev: 'Zurück', next: 'Mehr',
  },
  fr: {
    eyebrow: 'Ateliers à Berlin · par de vrais artisans',
    h1a: 'Créez quelque chose de vos mains.', h1b: 'Cette semaine.',
    lede: 'Poterie, bougies, sérigraphie, sushis et plus encore, avec des artisans indépendants de Berlin. Seul, à deux ou avec toute votre équipe.',
    searchLabel: 'Trouver un atelier',
    what: 'Quoi ?', whatAny: 'Tous les ateliers',
    when: 'Quand ?', whenAny: 'N’importe quel jour',
    where: 'Où ?', whereAny: 'Tout Berlin',
    search: 'Rechercher',
    weekTitle: 'Cette semaine', weekHand: 'à Berlin', weekSub: 'De vraies dates de nos hôtes, une par artisan.',
    catsTitle: 'De quoi avez-vous', catsHand: 'envie ?',
    makersTitle: 'Les mains', makersHand: 'derrière', makersSub: 'Des artisans indépendants de tout Berlin, chacun avec son propre savoir-faire.',
    seeAll: 'Tout voir', prev: 'Retour', next: 'Plus',
  },
  es: {
    eyebrow: 'Talleres en Berlín · de creadores reales',
    h1a: 'Crea algo con tus manos.', h1b: 'Esta semana.',
    lede: 'Cerámica, velas, serigrafía, sushi y mucho más, con creadores independientes de Berlín. Solo, en pareja o con todo tu equipo.',
    searchLabel: 'Buscar un taller',
    what: '¿Qué?', whatAny: 'Todos los talleres',
    when: '¿Cuándo?', whenAny: 'Cualquier día',
    where: '¿Dónde?', whereAny: 'Todo Berlín',
    search: 'Buscar',
    weekTitle: 'Esta semana', weekHand: 'en Berlín', weekSub: 'Fechas reales de nuestros anfitriones, una por creador.',
    catsTitle: '¿Qué te', catsHand: 'apetece?',
    makersTitle: 'Las manos', makersHand: 'detrás', makersSub: 'Creadores independientes de todo Berlín, cada uno con su propio oficio.',
    seeAll: 'Ver todo', prev: 'Atrás', next: 'Más',
  },
  it: {
    eyebrow: 'Workshop a Berlino · da veri artigiani',
    h1a: 'Crea qualcosa con le tue mani.', h1b: 'Questa settimana.',
    lede: 'Ceramica, candele, serigrafia, sushi e altro ancora, con artigiani indipendenti di Berlino. Da solo, in due o con tutto il team.',
    searchLabel: 'Trova un workshop',
    what: 'Cosa?', whatAny: 'Tutti i workshop',
    when: 'Quando?', whenAny: 'Qualsiasi giorno',
    where: 'Dove?', whereAny: 'Tutta Berlino',
    search: 'Cerca',
    weekTitle: 'Questa settimana', weekHand: 'a Berlino', weekSub: 'Date vere dei nostri host, una per artigiano.',
    catsTitle: 'Cosa ti va', catsHand: 'di fare?',
    makersTitle: 'Le mani', makersHand: 'dietro', makersSub: 'Artigiani indipendenti da tutta Berlino, ognuno con il proprio mestiere.',
    seeAll: 'Vedi tutto', prev: 'Indietro', next: 'Altro',
  },
  nl: {
    eyebrow: 'Workshops in Berlijn · van echte makers',
    h1a: 'Maak iets met je handen.', h1b: 'Deze week.',
    lede: 'Keramiek, kaarsen, zeefdruk, sushi en meer, bij onafhankelijke Berlijnse makers. Alleen, met z’n tweeën of met je hele team.',
    searchLabel: 'Workshop zoeken',
    what: 'Wat?', whatAny: 'Alle workshops',
    when: 'Wanneer?', whenAny: 'Elke dag',
    where: 'Waar?', whereAny: 'Heel Berlijn',
    search: 'Zoeken',
    weekTitle: 'Deze week', weekHand: 'in Berlijn', weekSub: 'Echte data van onze hosts, één per maker.',
    catsTitle: 'Waar heb je', catsHand: 'zin in?',
    makersTitle: 'De handen', makersHand: 'erachter', makersSub: 'Onafhankelijke makers uit heel Berlijn, ieder met een eigen ambacht.',
    seeAll: 'Alles bekijken', prev: 'Terug', next: 'Meer',
  },
  pl: {
    eyebrow: 'Warsztaty w Berlinie · od prawdziwych twórców',
    h1a: 'Zrób coś własnymi rękami.', h1b: 'W tym tygodniu.',
    lede: 'Ceramika, świece, sitodruk, sushi i nie tylko, z niezależnymi twórcami z Berlina. Samemu, we dwoje albo z całym zespołem.',
    searchLabel: 'Znajdź warsztat',
    what: 'Co?', whatAny: 'Wszystkie warsztaty',
    when: 'Kiedy?', whenAny: 'Dowolny dzień',
    where: 'Gdzie?', whereAny: 'Cały Berlin',
    search: 'Szukaj',
    weekTitle: 'W tym tygodniu', weekHand: 'w Berlinie', weekSub: 'Prawdziwe terminy naszych prowadzących, jeden na twórcę.',
    catsTitle: 'Na co masz', catsHand: 'ochotę?',
    makersTitle: 'Ręce', makersHand: 'za tym', makersSub: 'Niezależni twórcy z całego Berlina, każdy z własnym rzemiosłem.',
    seeAll: 'Zobacz wszystko', prev: 'Wstecz', next: 'Więcej',
  },
  tr: {
    eyebrow: 'Berlin’de atölyeler · gerçek üreticilerden',
    h1a: 'Ellerinle bir şey yap.', h1b: 'Bu hafta.',
    lede: 'Seramik, mum, serigrafi, suşi ve daha fazlası, Berlin’in bağımsız üreticileriyle. Tek başına, iki kişi ya da tüm ekibinle.',
    searchLabel: 'Atölye bul',
    what: 'Ne?', whatAny: 'Tüm atölyeler',
    when: 'Ne zaman?', whenAny: 'Herhangi bir gün',
    where: 'Nerede?', whereAny: 'Tüm Berlin',
    search: 'Ara',
    weekTitle: 'Bu hafta', weekHand: 'Berlin’de', weekSub: 'Eğitmenlerimizden gerçek tarihler, her üreticiden bir tane.',
    catsTitle: 'Canın ne', catsHand: 'istiyor?',
    makersTitle: 'İşin arkasındaki', makersHand: 'eller', makersSub: 'Berlin’in her yerinden bağımsız üreticiler, her birinin kendi zanaatı var.',
    seeAll: 'Tümünü gör', prev: 'Geri', next: 'Daha fazla',
  },
};
