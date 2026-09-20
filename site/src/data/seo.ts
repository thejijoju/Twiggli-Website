/** The search-facing pages: /workshops/, one page per activity, one page
 *  per host — in both languages.
 *
 *  Why these exist: the site had 25 URLs, and every workshop lived on one
 *  of them, the happening-today calendar, behind #anchors. Nobody searching
 *  "Töpferkurs Berlin" or "rug tufting workshop Berlin" could be sent to a
 *  page about that, because there was none. These pages give each activity
 *  and each host a URL of its own with the query in the title, the heading
 *  and the first paragraph, and the host's real upcoming dates and times
 *  underneath — built from the same feed the calendar reads, so a date on a
 *  search result is a date the host is actually running.
 *
 *  Copy lives here so the three page components stay thin. The German
 *  headings are written for what people type, not translated from the
 *  English: "Töpferkurs Berlin" is the search, "Keramik-Workshops" is the
 *  category, and the title carries both. */

import { filterCopy, getHosts, type ActivityKey, type Host } from './content.ts';
import { berlinTodayMs, getOnRequestAll, getSessions, slugify, type OnRequestWorkshop, type Session } from './sessions.ts';
import { href, LANG_META, type Lang } from '../lib/url.ts';

/** The canonical origin, for structured data and social tags, which need
 *  absolute URLs. astro.config.mjs carries the same value as `site`. */
export const SITE = 'https://www.twiggli.com';
export const absolute = (path: string): string => new URL(path, SITE).href;

/** The order the activities are listed in, everywhere. Same as the
 *  calendar's pills. */
export const ACTIVITY_ORDER: ActivityKey[] = [
  'ceramics', 'art', 'craft', 'food', 'photography', 'wellbeing', 'music',
];

export type ActivityCopy = {
  /** Short label — nav, crumbs, cards. */
  short: string;
  /** The page's <title>. Search phrase first, brand last. */
  title: string;
  h1: string;
  lede: string;
  /** Meta description, ≤160 characters. */
  description: string;
};

export const activityCopy: Record<Lang, Record<ActivityKey, ActivityCopy>> = {
  en: {
    ceramics: {
      short: 'Pottery & ceramics',
      title: 'Pottery classes & ceramics workshops in Berlin — dates & booking | Twiggli',
      h1: 'Pottery classes & ceramics workshops in Berlin',
      lede: 'Wheel throwing, handbuilding, glazing and open studio time with independent Berlin ceramicists — real upcoming dates, prices and booking links, from Neukölln to Kreuzberg.',
      description: 'Pottery classes in Berlin: wheel throwing, handbuilding and glazing with independent ceramicists. Upcoming dates, times, prices and direct booking.',
    },
    art: {
      short: 'Art & printmaking',
      title: 'Painting, drawing & printmaking workshops in Berlin — dates & booking | Twiggli',
      h1: 'Painting, drawing & printmaking workshops in Berlin',
      lede: 'Linocut, screen printing, cyanotype, portrait drawing, urban sketching walks, acrylic and alcohol ink — art classes in Berlin with real dates and prices.',
      description: 'Art classes in Berlin: linocut, screen printing, cyanotype, portrait drawing, sketching walks and painting. Upcoming dates, prices and booking.',
    },
    craft: {
      short: 'Craft & making',
      title: 'Craft & DIY workshops in Berlin — candles, tufting, soap, forging & more | Twiggli',
      h1: 'Craft & DIY workshops in Berlin',
      lede: 'Candle making, rug tufting, soap and natural cosmetics, quilting, knitting, blacksmithing, whittling and silversmithing — hands-on craft workshops in Berlin with upcoming dates.',
      description: 'Craft workshops in Berlin: candle making, rug tufting, soap, quilting, knitting, blacksmithing, whittling, silversmithing. Real dates, prices and booking.',
    },
    food: {
      short: 'Food & drink',
      title: 'Cooking classes & food workshops in Berlin — sushi, pasta, tastings & more | Twiggli',
      h1: 'Cooking classes & food workshops in Berlin',
      lede: 'Sushi and kimchi, pasta and sourdough, coffee roasting, foraging walks, gin and spirit tastings — food and drink workshops in Berlin with real dates.',
      description: 'Cooking classes in Berlin: sushi, kimchi, pasta, sourdough, coffee roasting, foraging and spirit tastings. Upcoming dates, prices and booking.',
    },
    photography: {
      short: 'Photography',
      title: 'Photography workshops in Berlin — analog, darkroom & cyanotype | Twiggli',
      h1: 'Photography workshops in Berlin',
      lede: 'Analog film, darkroom and cyanotype, creative phone photography for teams — photography classes in Berlin with upcoming dates.',
      description: 'Photography workshops in Berlin: analog film, darkroom, cyanotype and creative photography sessions. Upcoming dates, prices and booking.',
    },
    wellbeing: {
      short: 'Wellbeing',
      title: 'Wellbeing & mindfulness workshops in Berlin — breathwork, writing & more | Twiggli',
      h1: 'Wellbeing & mindfulness workshops in Berlin',
      lede: 'Breathwork, movement, voice, meditation and creative writing — wellbeing sessions in Berlin for individuals and teams.',
      description: 'Wellbeing workshops in Berlin: breathwork, movement, voice, mindfulness and creative writing, for individuals and teams. Dates and booking.',
    },
    music: {
      short: 'Music & rhythm',
      title: 'Music & rhythm workshops in Berlin — handpan, cajon, percussion | Twiggli',
      h1: 'Music & rhythm workshops in Berlin',
      lede: 'Handpan, cajon, percussion and drumming workshops in Berlin — upcoming dates and booking.',
      description: 'Music workshops in Berlin: handpan, cajon, percussion and drumming classes with upcoming dates, prices and booking.',
    },
  },
  de: {
    ceramics: {
      short: 'Töpfern & Keramik',
      title: 'Töpferkurs Berlin — Keramik-Workshops mit Terminen & Buchung | Twiggli',
      h1: 'Töpferkurse & Keramik-Workshops in Berlin',
      lede: 'Drehscheibe, Aufbaukeramik, Glasieren und offene Werkstatt bei unabhängigen Berliner Keramikerinnen und Keramikern — echte Termine, Preise und Buchungslinks, von Neukölln bis Kreuzberg.',
      description: 'Töpferkurse in Berlin: Drehscheibe, Aufbaukeramik und Glasieren bei unabhängigen Keramik-Studios. Kommende Termine, Uhrzeiten, Preise und direkte Buchung.',
    },
    art: {
      short: 'Kunst & Druck',
      title: 'Malkurs & Zeichenkurs Berlin — Kunst- und Druck-Workshops mit Terminen | Twiggli',
      h1: 'Malkurse, Zeichenkurse & Druck-Workshops in Berlin',
      lede: 'Linoldruck, Siebdruck, Cyanotypie, Porträtzeichnen, Zeichenspaziergänge, Acryl und Alkoholtinte — Kunstkurse in Berlin mit echten Terminen und Preisen.',
      description: 'Kunstkurse in Berlin: Linoldruck, Siebdruck, Cyanotypie, Porträtzeichnen, Zeichenspaziergänge und Malen. Kommende Termine, Preise und Buchung.',
    },
    craft: {
      short: 'Handwerk & Kreatives',
      title: 'Kreativ-Workshop Berlin — Kerzen, Tufting, Seife, Schmieden & mehr | Twiggli',
      h1: 'Kreativ-Workshops & DIY-Kurse in Berlin',
      lede: 'Kerzen gießen, Teppiche tuften, Seife und Naturkosmetik, Quilten, Stricken, Schmieden, Schnitzen und Silberschmieden — Handwerks-Workshops in Berlin mit kommenden Terminen.',
      description: 'Kreativ-Workshops in Berlin: Kerzen gießen, Tufting, Seife, Quilten, Stricken, Schmieden, Schnitzen, Silberschmieden. Echte Termine, Preise und Buchung.',
    },
    food: {
      short: 'Kochen & Genuss',
      title: 'Kochkurs Berlin — Sushi, Pasta, Sauerteig, Tastings & mehr | Twiggli',
      h1: 'Kochkurse & Genuss-Workshops in Berlin',
      lede: 'Sushi und Kimchi, Pasta und Sauerteig, Kaffee rösten, Wildkräuterwanderungen, Gin- und Spirituosen-Tastings — Food-Workshops in Berlin mit echten Terminen.',
      description: 'Kochkurse in Berlin: Sushi, Kimchi, Pasta, Sauerteig, Kaffee rösten, Wildkräuter und Spirituosen-Tastings. Kommende Termine, Preise und Buchung.',
    },
    photography: {
      short: 'Fotografie',
      title: 'Fotokurs Berlin — Analogfotografie, Dunkelkammer & Cyanotypie | Twiggli',
      h1: 'Fotokurse & Fotografie-Workshops in Berlin',
      lede: 'Analogfilm, Dunkelkammer und Cyanotypie, kreative Handyfotografie für Teams — Fotografie-Workshops in Berlin mit kommenden Terminen.',
      description: 'Fotokurse in Berlin: Analogfilm, Dunkelkammer, Cyanotypie und kreative Fotografie-Sessions. Kommende Termine, Preise und Buchung.',
    },
    wellbeing: {
      short: 'Achtsamkeit',
      title: 'Achtsamkeit Berlin — Atemarbeit, Meditation & kreatives Schreiben | Twiggli',
      h1: 'Achtsamkeits- & Wellbeing-Workshops in Berlin',
      lede: 'Atemarbeit, Bewegung, Stimme, Meditation und kreatives Schreiben — Wellbeing-Sessions in Berlin für Einzelne und Teams.',
      description: 'Wellbeing-Workshops in Berlin: Atemarbeit, Bewegung, Stimme, Achtsamkeit und kreatives Schreiben, für Einzelne und Teams. Termine und Buchung.',
    },
    music: {
      short: 'Musik & Rhythmus',
      title: 'Handpan & Cajon Workshop Berlin — Percussion-Kurse mit Terminen | Twiggli',
      h1: 'Musik- & Rhythmus-Workshops in Berlin',
      lede: 'Handpan, Cajon, Percussion und Trommeln — Musik-Workshops in Berlin mit kommenden Terminen und Buchung.',
      description: 'Musik-Workshops in Berlin: Handpan, Cajon, Percussion und Trommelkurse mit kommenden Terminen, Preisen und Buchung.',
    },
  },
  fr: {
    ceramics: {
      short: 'Poterie & céramique',
      title: 'Cours de poterie & ateliers céramique à Berlin — dates & réservation | Twiggli',
      h1: 'Cours de poterie & ateliers céramique à Berlin',
      lede: 'Tournage, modelage, émaillage et atelier libre chez des céramistes indépendants de Berlin — vraies dates à venir, prix et liens de réservation, de Neukölln à Kreuzberg.',
      description: 'Cours de poterie à Berlin : tournage, modelage et émaillage chez des céramistes indépendants. Dates, horaires, prix et réservation directe.',
    },
    art: {
      short: 'Art & gravure',
      title: 'Ateliers de peinture, dessin & gravure à Berlin — dates & réservation | Twiggli',
      h1: 'Ateliers de peinture, dessin & gravure à Berlin',
      lede: 'Linogravure, sérigraphie, cyanotype, portrait, balades croquis, acrylique et encre à alcool — des cours d’art à Berlin avec de vraies dates et de vrais prix.',
      description: 'Cours d’art à Berlin : linogravure, sérigraphie, cyanotype, portrait, balades croquis et peinture. Dates à venir, prix et réservation.',
    },
    craft: {
      short: 'Artisanat & DIY',
      title: 'Ateliers créatifs & DIY à Berlin — bougies, tufting, savon, forge & plus | Twiggli',
      h1: 'Ateliers créatifs & DIY à Berlin',
      lede: 'Bougies, tufting de tapis, savon et cosmétiques naturels, quilting, tricot, forge, sculpture sur bois et orfèvrerie — des ateliers manuels à Berlin avec des dates à venir.',
      description: 'Ateliers créatifs à Berlin : bougies, tufting, savon, quilting, tricot, forge, sculpture sur bois, orfèvrerie. Vraies dates, prix et réservation.',
    },
    food: {
      short: 'Cuisine & boissons',
      title: 'Cours de cuisine & ateliers gourmands à Berlin — sushi, pâtes, dégustations & plus | Twiggli',
      h1: 'Cours de cuisine & ateliers gourmands à Berlin',
      lede: 'Sushi et kimchi, pâtes et levain, torréfaction de café, cueillette sauvage, dégustations de gin et de spiritueux — des ateliers cuisine et boissons à Berlin avec de vraies dates.',
      description: 'Cours de cuisine à Berlin : sushi, kimchi, pâtes, levain, torréfaction, cueillette et dégustations. Dates à venir, prix et réservation.',
    },
    photography: {
      short: 'Photographie',
      title: 'Ateliers photo à Berlin — argentique, chambre noire & cyanotype | Twiggli',
      h1: 'Ateliers photo à Berlin',
      lede: 'Argentique, chambre noire et cyanotype, photo créative au téléphone pour les équipes — des cours de photographie à Berlin avec des dates à venir.',
      description: 'Ateliers photo à Berlin : argentique, chambre noire, cyanotype et sessions de photo créative. Dates à venir, prix et réservation.',
    },
    wellbeing: {
      short: 'Bien-être',
      title: 'Ateliers bien-être & pleine conscience à Berlin — respiration, écriture & plus | Twiggli',
      h1: 'Ateliers bien-être & pleine conscience à Berlin',
      lede: 'Respiration, mouvement, voix, méditation et écriture créative — des sessions bien-être à Berlin pour particuliers et équipes.',
      description: 'Ateliers bien-être à Berlin : respiration, mouvement, voix, pleine conscience et écriture créative, pour particuliers et équipes. Dates et réservation.',
    },
    music: {
      short: 'Musique & rythme',
      title: 'Ateliers musique & rythme à Berlin — handpan, cajón, percussions | Twiggli',
      h1: 'Ateliers musique & rythme à Berlin',
      lede: 'Handpan, cajón, percussions et tambours — des ateliers musique à Berlin avec dates à venir et réservation.',
      description: 'Ateliers musique à Berlin : handpan, cajón, percussions et tambours, avec dates à venir, prix et réservation.',
    },
  },
  es: {
    ceramics: {
      short: 'Cerámica & alfarería',
      title: 'Clases de cerámica & talleres de alfarería en Berlín — fechas & reserva | Twiggli',
      h1: 'Clases de cerámica & talleres de alfarería en Berlín',
      lede: 'Torno, modelado a mano, esmaltado y taller abierto con ceramistas independientes de Berlín — fechas reales, precios y enlaces de reserva, de Neukölln a Kreuzberg.',
      description: 'Clases de cerámica en Berlín: torno, modelado y esmaltado con ceramistas independientes. Próximas fechas, horarios, precios y reserva directa.',
    },
    art: {
      short: 'Arte & grabado',
      title: 'Talleres de pintura, dibujo & grabado en Berlín — fechas & reserva | Twiggli',
      h1: 'Talleres de pintura, dibujo & grabado en Berlín',
      lede: 'Linograbado, serigrafía, cianotipia, retrato, paseos de dibujo urbano, acrílico y tinta de alcohol — clases de arte en Berlín con fechas y precios reales.',
      description: 'Clases de arte en Berlín: linograbado, serigrafía, cianotipia, retrato, paseos de dibujo y pintura. Próximas fechas, precios y reserva.',
    },
    craft: {
      short: 'Artesanía & DIY',
      title: 'Talleres creativos & DIY en Berlín — velas, tufting, jabón, forja & más | Twiggli',
      h1: 'Talleres creativos & DIY en Berlín',
      lede: 'Velas, tufting de alfombras, jabón y cosmética natural, quilting, punto, forja, talla de madera y orfebrería — talleres manuales en Berlín con próximas fechas.',
      description: 'Talleres creativos en Berlín: velas, tufting, jabón, quilting, punto, forja, talla, orfebrería. Fechas reales, precios y reserva.',
    },
    food: {
      short: 'Comida & bebida',
      title: 'Clases de cocina & talleres gastronómicos en Berlín — sushi, pasta, catas & más | Twiggli',
      h1: 'Clases de cocina & talleres gastronómicos en Berlín',
      lede: 'Sushi y kimchi, pasta y masa madre, tueste de café, paseos de recolección, catas de ginebra y destilados — talleres de comida y bebida en Berlín con fechas reales.',
      description: 'Clases de cocina en Berlín: sushi, kimchi, pasta, masa madre, tueste de café, recolección y catas. Próximas fechas, precios y reserva.',
    },
    photography: {
      short: 'Fotografía',
      title: 'Talleres de fotografía en Berlín — analógica, cuarto oscuro & cianotipia | Twiggli',
      h1: 'Talleres de fotografía en Berlín',
      lede: 'Película analógica, cuarto oscuro y cianotipia, fotografía creativa con el móvil para equipos — clases de fotografía en Berlín con próximas fechas.',
      description: 'Talleres de fotografía en Berlín: analógica, cuarto oscuro, cianotipia y sesiones de fotografía creativa. Próximas fechas, precios y reserva.',
    },
    wellbeing: {
      short: 'Bienestar',
      title: 'Talleres de bienestar & mindfulness en Berlín — respiración, escritura & más | Twiggli',
      h1: 'Talleres de bienestar & mindfulness en Berlín',
      lede: 'Respiración, movimiento, voz, meditación y escritura creativa — sesiones de bienestar en Berlín para particulares y equipos.',
      description: 'Talleres de bienestar en Berlín: respiración, movimiento, voz, mindfulness y escritura creativa, para particulares y equipos. Fechas y reserva.',
    },
    music: {
      short: 'Música & ritmo',
      title: 'Talleres de música & ritmo en Berlín — handpan, cajón, percusión | Twiggli',
      h1: 'Talleres de música & ritmo en Berlín',
      lede: 'Handpan, cajón, percusión y tambores — talleres de música en Berlín con próximas fechas y reserva.',
      description: 'Talleres de música en Berlín: handpan, cajón, percusión y tambores, con próximas fechas, precios y reserva.',
    },
  },
  it: {
    ceramics: {
      short: 'Ceramica & tornio',
      title: 'Corsi di ceramica & workshop di tornio a Berlino — date & prenotazione | Twiggli',
      h1: 'Corsi di ceramica & workshop di tornio a Berlino',
      lede: 'Tornio, modellazione a mano, smaltatura e studio aperto con ceramisti indipendenti di Berlino — date reali, prezzi e link di prenotazione, da Neukölln a Kreuzberg.',
      description: 'Corsi di ceramica a Berlino: tornio, modellazione e smaltatura con ceramisti indipendenti. Prossime date, orari, prezzi e prenotazione diretta.',
    },
    art: {
      short: 'Arte & stampa',
      title: 'Workshop di pittura, disegno & stampa a Berlino — date & prenotazione | Twiggli',
      h1: 'Workshop di pittura, disegno & stampa a Berlino',
      lede: 'Linoleografia, serigrafia, cianotipia, ritratto, passeggiate di urban sketching, acrilico e inchiostro ad alcol — corsi d’arte a Berlino con date e prezzi reali.',
      description: 'Corsi d’arte a Berlino: linoleografia, serigrafia, cianotipia, ritratto, passeggiate di disegno e pittura. Prossime date, prezzi e prenotazione.',
    },
    craft: {
      short: 'Artigianato & fai da te',
      title: 'Workshop creativi & fai da te a Berlino — candele, tufting, sapone, forgia & altro | Twiggli',
      h1: 'Workshop creativi & fai da te a Berlino',
      lede: 'Candele, tufting di tappeti, sapone e cosmetici naturali, quilting, maglia, forgia, intaglio del legno e oreficeria — workshop manuali a Berlino con prossime date.',
      description: 'Workshop creativi a Berlino: candele, tufting, sapone, quilting, maglia, forgia, intaglio, oreficeria. Date reali, prezzi e prenotazione.',
    },
    food: {
      short: 'Cibo & bevande',
      title: 'Corsi di cucina & workshop gastronomici a Berlino — sushi, pasta, degustazioni & altro | Twiggli',
      h1: 'Corsi di cucina & workshop gastronomici a Berlino',
      lede: 'Sushi e kimchi, pasta e lievito madre, tostatura del caffè, passeggiate di raccolta, degustazioni di gin e distillati — workshop di cibo e bevande a Berlino con date reali.',
      description: 'Corsi di cucina a Berlino: sushi, kimchi, pasta, lievito madre, tostatura del caffè, raccolta e degustazioni. Prossime date, prezzi e prenotazione.',
    },
    photography: {
      short: 'Fotografia',
      title: 'Workshop di fotografia a Berlino — analogica, camera oscura & cianotipia | Twiggli',
      h1: 'Workshop di fotografia a Berlino',
      lede: 'Pellicola, camera oscura e cianotipia, fotografia creativa con lo smartphone per team — corsi di fotografia a Berlino con prossime date.',
      description: 'Workshop di fotografia a Berlino: pellicola, camera oscura, cianotipia e sessioni di fotografia creativa. Prossime date, prezzi e prenotazione.',
    },
    wellbeing: {
      short: 'Benessere',
      title: 'Workshop di benessere & mindfulness a Berlino — respiro, scrittura & altro | Twiggli',
      h1: 'Workshop di benessere & mindfulness a Berlino',
      lede: 'Respiro, movimento, voce, meditazione e scrittura creativa — sessioni di benessere a Berlino per singoli e team.',
      description: 'Workshop di benessere a Berlino: respiro, movimento, voce, mindfulness e scrittura creativa, per singoli e team. Date e prenotazione.',
    },
    music: {
      short: 'Musica & ritmo',
      title: 'Workshop di musica & ritmo a Berlino — handpan, cajón, percussioni | Twiggli',
      h1: 'Workshop di musica & ritmo a Berlino',
      lede: 'Handpan, cajón, percussioni e tamburi — workshop di musica a Berlino con prossime date e prenotazione.',
      description: 'Workshop di musica a Berlino: handpan, cajón, percussioni e tamburi, con prossime date, prezzi e prenotazione.',
    },
  },
  nl: {
    ceramics: {
      short: 'Keramiek & pottenbakken',
      title: 'Pottenbakcursus & keramiekworkshops in Berlijn — data & boeking | Twiggli',
      h1: 'Pottenbakcursussen & keramiekworkshops in Berlijn',
      lede: 'Draaien, handvormen, glazuren en open atelier bij onafhankelijke keramisten in Berlijn — echte data, prijzen en boekingslinks, van Neukölln tot Kreuzberg.',
      description: 'Pottenbakcursussen in Berlijn: draaien, handvormen en glazuren bij onafhankelijke keramisten. Komende data, tijden, prijzen en direct boeken.',
    },
    art: {
      short: 'Kunst & druk',
      title: 'Schilder-, teken- & drukworkshops in Berlijn — data & boeking | Twiggli',
      h1: 'Schilder-, teken- & drukworkshops in Berlijn',
      lede: 'Linosnede, zeefdruk, cyanotypie, portrettekenen, schetswandelingen, acryl en alcoholinkt — kunstcursussen in Berlijn met echte data en prijzen.',
      description: 'Kunstcursussen in Berlijn: linosnede, zeefdruk, cyanotypie, portret, schetswandelingen en schilderen. Komende data, prijzen en boeking.',
    },
    craft: {
      short: 'Ambacht & DIY',
      title: 'Creatieve & DIY-workshops in Berlijn — kaarsen, tuften, zeep, smeden & meer | Twiggli',
      h1: 'Creatieve & DIY-workshops in Berlijn',
      lede: 'Kaarsen gieten, tapijt tuften, zeep en natuurlijke cosmetica, quilten, breien, smeden, houtsnijden en zilversmeden — praktische ambachtsworkshops in Berlijn met komende data.',
      description: 'Creatieve workshops in Berlijn: kaarsen, tuften, zeep, quilten, breien, smeden, houtsnijden, zilversmeden. Echte data, prijzen en boeking.',
    },
    food: {
      short: 'Eten & drinken',
      title: 'Kookworkshops & foodworkshops in Berlijn — sushi, pasta, proeverijen & meer | Twiggli',
      h1: 'Kookworkshops & foodworkshops in Berlijn',
      lede: 'Sushi en kimchi, pasta en zuurdesem, koffie branden, wildplukwandelingen, gin- en spiritsproeverijen — eet- en drinkworkshops in Berlijn met echte data.',
      description: 'Kookworkshops in Berlijn: sushi, kimchi, pasta, zuurdesem, koffie branden, wildplukken en proeverijen. Komende data, prijzen en boeking.',
    },
    photography: {
      short: 'Fotografie',
      title: 'Fotografieworkshops in Berlijn — analoog, doka & cyanotypie | Twiggli',
      h1: 'Fotografieworkshops in Berlijn',
      lede: 'Analoge film, doka en cyanotypie, creatieve smartphonefotografie voor teams — fotografiecursussen in Berlijn met komende data.',
      description: 'Fotografieworkshops in Berlijn: analoge film, doka, cyanotypie en creatieve fotosessies. Komende data, prijzen en boeking.',
    },
    wellbeing: {
      short: 'Welzijn',
      title: 'Welzijns- & mindfulnessworkshops in Berlijn — ademwerk, schrijven & meer | Twiggli',
      h1: 'Welzijns- & mindfulnessworkshops in Berlijn',
      lede: 'Ademwerk, beweging, stem, meditatie en creatief schrijven — welzijnssessies in Berlijn voor individuen en teams.',
      description: 'Welzijnsworkshops in Berlijn: ademwerk, beweging, stem, mindfulness en creatief schrijven, voor individuen en teams. Data en boeking.',
    },
    music: {
      short: 'Muziek & ritme',
      title: 'Muziek- & ritmeworkshops in Berlijn — handpan, cajon, percussie | Twiggli',
      h1: 'Muziek- & ritmeworkshops in Berlijn',
      lede: 'Handpan, cajon, percussie en drumworkshops in Berlijn — komende data en boeking.',
      description: 'Muziekworkshops in Berlijn: handpan, cajon, percussie en drumlessen met komende data, prijzen en boeking.',
    },
  },
  pl: {
    ceramics: {
      short: 'Ceramika & garncarstwo',
      title: 'Kurs garncarstwa Berlin — warsztaty ceramiczne z terminami & rezerwacją | Twiggli',
      h1: 'Kursy garncarstwa & warsztaty ceramiczne w Berlinie',
      lede: 'Koło garncarskie, lepienie ręczne, szkliwienie i otwarta pracownia u niezależnych ceramików z Berlina — prawdziwe terminy, ceny i linki do rezerwacji, od Neukölln po Kreuzberg.',
      description: 'Kursy garncarstwa w Berlinie: koło, lepienie ręczne i szkliwienie u niezależnych ceramików. Nadchodzące terminy, godziny, ceny i bezpośrednia rezerwacja.',
    },
    art: {
      short: 'Sztuka & grafika',
      title: 'Warsztaty malarstwa, rysunku & grafiki w Berlinie — terminy & rezerwacja | Twiggli',
      h1: 'Warsztaty malarstwa, rysunku & grafiki w Berlinie',
      lede: 'Linoryt, sitodruk, cyjanotypia, portret, spacery szkicownikowe, akryl i tusz alkoholowy — zajęcia plastyczne w Berlinie z prawdziwymi terminami i cenami.',
      description: 'Zajęcia plastyczne w Berlinie: linoryt, sitodruk, cyjanotypia, portret, spacery szkicownikowe i malarstwo. Nadchodzące terminy, ceny i rezerwacja.',
    },
    craft: {
      short: 'Rękodzieło & DIY',
      title: 'Warsztaty kreatywne & DIY w Berlinie — świece, tufting, mydło, kowalstwo & więcej | Twiggli',
      h1: 'Warsztaty kreatywne & DIY w Berlinie',
      lede: 'Świece, tufting dywanów, mydło i kosmetyki naturalne, quilting, dzierganie, kowalstwo, rzeźbienie w drewnie i złotnictwo — praktyczne warsztaty rękodzieła w Berlinie z nadchodzącymi terminami.',
      description: 'Warsztaty kreatywne w Berlinie: świece, tufting, mydło, quilting, dzierganie, kowalstwo, rzeźbienie, złotnictwo. Prawdziwe terminy, ceny i rezerwacja.',
    },
    food: {
      short: 'Jedzenie & napoje',
      title: 'Kurs gotowania Berlin — sushi, makaron, zakwas, degustacje & więcej | Twiggli',
      h1: 'Kursy gotowania & warsztaty kulinarne w Berlinie',
      lede: 'Sushi i kimchi, makaron i zakwas, palenie kawy, spacery zielarskie, degustacje ginu i alkoholi — warsztaty kulinarne w Berlinie z prawdziwymi terminami.',
      description: 'Kursy gotowania w Berlinie: sushi, kimchi, makaron, zakwas, palenie kawy, zbieractwo i degustacje. Nadchodzące terminy, ceny i rezerwacja.',
    },
    photography: {
      short: 'Fotografia',
      title: 'Warsztaty fotograficzne w Berlinie — analog, ciemnia & cyjanotypia | Twiggli',
      h1: 'Warsztaty fotograficzne w Berlinie',
      lede: 'Film analogowy, ciemnia i cyjanotypia, kreatywna fotografia telefonem dla zespołów — kursy fotografii w Berlinie z nadchodzącymi terminami.',
      description: 'Warsztaty fotograficzne w Berlinie: film analogowy, ciemnia, cyjanotypia i sesje fotografii kreatywnej. Nadchodzące terminy, ceny i rezerwacja.',
    },
    wellbeing: {
      short: 'Dobrostan',
      title: 'Warsztaty dobrostanu & uważności w Berlinie — oddech, pisanie & więcej | Twiggli',
      h1: 'Warsztaty dobrostanu & uważności w Berlinie',
      lede: 'Praca z oddechem, ruch, głos, medytacja i pisanie kreatywne — sesje dobrostanu w Berlinie dla osób indywidualnych i zespołów.',
      description: 'Warsztaty dobrostanu w Berlinie: oddech, ruch, głos, uważność i pisanie kreatywne, dla osób indywidualnych i zespołów. Terminy i rezerwacja.',
    },
    music: {
      short: 'Muzyka & rytm',
      title: 'Warsztaty muzyczne & rytmiczne w Berlinie — handpan, cajon, perkusja | Twiggli',
      h1: 'Warsztaty muzyczne & rytmiczne w Berlinie',
      lede: 'Handpan, cajon, perkusja i bębny — warsztaty muzyczne w Berlinie z nadchodzącymi terminami i rezerwacją.',
      description: 'Warsztaty muzyczne w Berlinie: handpan, cajon, perkusja i bębny, z nadchodzącymi terminami, cenami i rezerwacją.',
    },
  },
  tr: {
    ceramics: {
      short: 'Çömlek & seramik',
      title: 'Berlin’de çömlek kursları & seramik atölyeleri — tarihler & rezervasyon | Twiggli',
      h1: 'Berlin’de çömlek kursları & seramik atölyeleri',
      lede: 'Çark, elle şekillendirme, sırlama ve açık stüdyo — Neukölln’den Kreuzberg’e, Berlin’in bağımsız seramikçileriyle gerçek tarihler, fiyatlar ve rezervasyon bağlantıları.',
      description: 'Berlin’de çömlek kursları: bağımsız seramikçilerle çark, elle şekillendirme ve sırlama. Yaklaşan tarihler, saatler, fiyatlar ve doğrudan rezervasyon.',
    },
    art: {
      short: 'Sanat & baskı',
      title: 'Berlin’de resim, çizim & baskı atölyeleri — tarihler & rezervasyon | Twiggli',
      h1: 'Berlin’de resim, çizim & baskı atölyeleri',
      lede: 'Linol baskı, serigrafi, siyanotipi, portre çizimi, şehir eskiz yürüyüşleri, akrilik ve alkol mürekkebi — gerçek tarih ve fiyatlarla Berlin’de sanat dersleri.',
      description: 'Berlin’de sanat dersleri: linol baskı, serigrafi, siyanotipi, portre, eskiz yürüyüşleri ve resim. Yaklaşan tarihler, fiyatlar ve rezervasyon.',
    },
    craft: {
      short: 'El sanatları & DIY',
      title: 'Berlin’de el sanatları & DIY atölyeleri — mum, tufting, sabun, demircilik & daha fazlası | Twiggli',
      h1: 'Berlin’de el sanatları & DIY atölyeleri',
      lede: 'Mum yapımı, halı tufting, sabun ve doğal kozmetik, kırkyama, örgü, demircilik, ahşap oyma ve gümüş işçiliği — yaklaşan tarihlerle Berlin’de uygulamalı el sanatları atölyeleri.',
      description: 'Berlin’de el sanatları atölyeleri: mum, tufting, sabun, kırkyama, örgü, demircilik, oyma, gümüş işçiliği. Gerçek tarihler, fiyatlar ve rezervasyon.',
    },
    food: {
      short: 'Yemek & içecek',
      title: 'Berlin’de yemek kursları & mutfak atölyeleri — suşi, makarna, tadımlar & daha fazlası | Twiggli',
      h1: 'Berlin’de yemek kursları & mutfak atölyeleri',
      lede: 'Suşi ve kimchi, makarna ve ekşi maya, kahve kavurma, doğada toplama yürüyüşleri, cin ve içki tadımları — gerçek tarihlerle Berlin’de yemek ve içecek atölyeleri.',
      description: 'Berlin’de yemek kursları: suşi, kimchi, makarna, ekşi maya, kahve kavurma, doğada toplama ve tadımlar. Yaklaşan tarihler, fiyatlar ve rezervasyon.',
    },
    photography: {
      short: 'Fotoğraf',
      title: 'Berlin’de fotoğraf atölyeleri — analog, karanlık oda & siyanotipi | Twiggli',
      h1: 'Berlin’de fotoğraf atölyeleri',
      lede: 'Analog film, karanlık oda ve siyanotipi, ekipler için yaratıcı telefon fotoğrafçılığı — yaklaşan tarihlerle Berlin’de fotoğraf dersleri.',
      description: 'Berlin’de fotoğraf atölyeleri: analog film, karanlık oda, siyanotipi ve yaratıcı fotoğraf seansları. Yaklaşan tarihler, fiyatlar ve rezervasyon.',
    },
    wellbeing: {
      short: 'İyi yaşam',
      title: 'Berlin’de iyi yaşam & farkındalık atölyeleri — nefes, yazı & daha fazlası | Twiggli',
      h1: 'Berlin’de iyi yaşam & farkındalık atölyeleri',
      lede: 'Nefes çalışması, hareket, ses, meditasyon ve yaratıcı yazarlık — bireyler ve ekipler için Berlin’de iyi yaşam seansları.',
      description: 'Berlin’de iyi yaşam atölyeleri: bireyler ve ekipler için nefes, hareket, ses, farkındalık ve yaratıcı yazarlık. Tarihler ve rezervasyon.',
    },
    music: {
      short: 'Müzik & ritim',
      title: 'Berlin’de müzik & ritim atölyeleri — handpan, cajon, perküsyon | Twiggli',
      h1: 'Berlin’de müzik & ritim atölyeleri',
      lede: 'Handpan, cajon, perküsyon ve davul atölyeleri — yaklaşan tarihler ve rezervasyonla Berlin’de.',
      description: 'Berlin’de müzik atölyeleri: yaklaşan tarihler, fiyatlar ve rezervasyonla handpan, cajon, perküsyon ve davul dersleri.',
    },
  },
};

export const hubCopy: Record<Lang, { title: string; h1: string; lede: string; description: string; kicker: string }> = {
  en: {
    kicker: 'Find a workshop',
    title: 'Workshops in Berlin — pottery, cooking, crafts, art & more | Twiggli',
    h1: 'Workshops in Berlin',
    lede: 'Every class our hosts run in Berlin, by activity: ceramics, art and printmaking, crafts, cooking and tastings, photography, wellbeing and music. Real dates, real prices, booked straight with the host.',
    description: 'Workshops in Berlin by activity: pottery, art and printmaking, crafts, cooking, photography, wellbeing and music. Upcoming dates, prices and direct booking with independent hosts.',
  },
  de: {
    kicker: 'Workshop finden',
    title: 'Workshops in Berlin — Töpfern, Kochen, Kreativkurse, Kunst & mehr | Twiggli',
    h1: 'Workshops in Berlin',
    lede: 'Alle Kurse unserer Gastgeber in Berlin, nach Aktivität: Keramik, Kunst und Druck, Handwerk, Kochen und Tastings, Fotografie, Achtsamkeit und Musik. Echte Termine, echte Preise, direkt beim Host gebucht.',
    description: 'Workshops in Berlin nach Aktivität: Töpfern, Kunst und Druck, Kreativkurse, Kochkurse, Fotografie, Achtsamkeit und Musik. Kommende Termine, Preise und direkte Buchung bei unabhängigen Hosts.',
  },
  fr: {
    kicker: 'Trouver un atelier',
    title: 'Ateliers à Berlin — poterie, cuisine, artisanat, art & plus | Twiggli',
    h1: 'Ateliers à Berlin',
    lede: 'Tous les cours que nos hôtes donnent à Berlin, par activité : céramique, art et gravure, artisanat, cuisine et dégustations, photographie, bien-être et musique. Vraies dates, vrais prix, réservés directement auprès de l’hôte.',
    description: 'Ateliers à Berlin par activité : poterie, art et gravure, artisanat, cuisine, photographie, bien-être et musique. Dates à venir, prix et réservation directe auprès d’hôtes indépendants.',
  },
  es: {
    kicker: 'Encuentra un taller',
    title: 'Talleres en Berlín — cerámica, cocina, artesanía, arte & más | Twiggli',
    h1: 'Talleres en Berlín',
    lede: 'Todas las clases que dan nuestros anfitriones en Berlín, por actividad: cerámica, arte y grabado, artesanía, cocina y catas, fotografía, bienestar y música. Fechas reales, precios reales, reserva directa con el anfitrión.',
    description: 'Talleres en Berlín por actividad: cerámica, arte y grabado, artesanía, cocina, fotografía, bienestar y música. Próximas fechas, precios y reserva directa con anfitriones independientes.',
  },
  it: {
    kicker: 'Trova un workshop',
    title: 'Workshop a Berlino — ceramica, cucina, artigianato, arte & altro | Twiggli',
    h1: 'Workshop a Berlino',
    lede: 'Tutti i corsi che i nostri host tengono a Berlino, per attività: ceramica, arte e stampa, artigianato, cucina e degustazioni, fotografia, benessere e musica. Date reali, prezzi reali, prenotazione diretta con l’host.',
    description: 'Workshop a Berlino per attività: ceramica, arte e stampa, artigianato, cucina, fotografia, benessere e musica. Prossime date, prezzi e prenotazione diretta con host indipendenti.',
  },
  nl: {
    kicker: 'Vind een workshop',
    title: 'Workshops in Berlijn — pottenbakken, koken, ambacht, kunst & meer | Twiggli',
    h1: 'Workshops in Berlijn',
    lede: 'Elke les die onze hosts in Berlijn geven, per activiteit: keramiek, kunst en druk, ambacht, koken en proeverijen, fotografie, welzijn en muziek. Echte data, echte prijzen, rechtstreeks bij de host geboekt.',
    description: 'Workshops in Berlijn per activiteit: pottenbakken, kunst en druk, ambacht, koken, fotografie, welzijn en muziek. Komende data, prijzen en direct boeken bij onafhankelijke hosts.',
  },
  pl: {
    kicker: 'Znajdź warsztaty',
    title: 'Warsztaty w Berlinie — ceramika, gotowanie, rękodzieło, sztuka & więcej | Twiggli',
    h1: 'Warsztaty w Berlinie',
    lede: 'Wszystkie zajęcia, które nasi prowadzący organizują w Berlinie, według aktywności: ceramika, sztuka i grafika, rękodzieło, gotowanie i degustacje, fotografia, dobrostan i muzyka. Prawdziwe terminy, prawdziwe ceny, rezerwacja bezpośrednio u prowadzącego.',
    description: 'Warsztaty w Berlinie według aktywności: ceramika, sztuka i grafika, rękodzieło, gotowanie, fotografia, dobrostan i muzyka. Nadchodzące terminy, ceny i bezpośrednia rezerwacja u niezależnych prowadzących.',
  },
  tr: {
    kicker: 'Atölye bul',
    title: 'Berlin’de atölyeler — çömlek, yemek, el sanatları, sanat & daha fazlası | Twiggli',
    h1: 'Berlin’de atölyeler',
    lede: 'Eğitmenlerimizin Berlin’de verdiği tüm dersler, etkinliğe göre: seramik, sanat ve baskı, el sanatları, yemek ve tadımlar, fotoğraf, iyi yaşam ve müzik. Gerçek tarihler, gerçek fiyatlar, doğrudan eğitmenden rezervasyon.',
    description: 'Etkinliğe göre Berlin’de atölyeler: çömlek, sanat ve baskı, el sanatları, yemek, fotoğraf, iyi yaşam ve müzik. Bağımsız eğitmenlerle yaklaşan tarihler, fiyatlar ve doğrudan rezervasyon.',
  },
};

/** Labels the three page components share. */
export const pageCopy = {
  en: {
    crumbsRoot: 'Workshops',
    inBerlin: 'Workshop in Berlin',
    upcoming: 'Upcoming dates & times',
    nextDates: 'Next dates',
    onRequest: 'On request',
    onRequestNote: 'Runs whenever you ask — the host sets a date around you.',
    noDates: 'No public dates published right now. Private sessions for groups run on request.',
    request: 'Request a private session',
    inquire: 'Inquire',
    book: 'Book',
    requestBooking: 'Request to book',
    soldOut: 'Sold out',
    waitingList: 'Waiting list',
    spots: 'spots left',
    timeTba: 'time when booking',
    today: 'Today',
    tomorrow: 'Tomorrow',
    calendar: 'See every workshop in Berlin on the calendar',
    moreIn: (short: string) => `More ${short.toLowerCase()} workshops in Berlin`,
    hosts: (n: number) => (n === 1 ? '1 host' : `${n} hosts`),
    dates: (n: number) => (n === 1 ? '1 upcoming date' : `${n} upcoming dates`),
    next: 'Next',
    allHosts: 'All hosts, A–Z',
    otherActivities: 'Other activities',
    studio: 'Studio', group: 'Group', duration: 'Length', place: 'Where', languages: 'Languages', price: 'Price',
    perPerson: 'per person',
    priceUnknown: 'On request',
    free: 'Free',
  },
  de: {
    crumbsRoot: 'Workshops',
    inBerlin: 'Workshop in Berlin',
    upcoming: 'Kommende Termine & Uhrzeiten',
    nextDates: 'Nächste Termine',
    onRequest: 'Auf Anfrage',
    onRequestNote: 'Läuft, wann du willst — der Host legt den Termin mit dir fest.',
    noDates: 'Gerade keine öffentlichen Termine. Private Sessions für Gruppen laufen auf Anfrage.',
    request: 'Private Session anfragen',
    inquire: 'Termin anfragen',
    book: 'Buchen',
    requestBooking: 'Buchung anfragen',
    soldOut: 'Ausgebucht',
    waitingList: 'Warteliste',
    spots: 'Plätze frei',
    timeTba: 'Uhrzeit bei Buchung',
    today: 'Heute',
    tomorrow: 'Morgen',
    calendar: 'Alle Workshops in Berlin im Kalender',
    moreIn: (short: string) => `Mehr ${short} in Berlin`,
    hosts: (n: number) => (n === 1 ? '1 Gastgeber' : `${n} Gastgeber`),
    dates: (n: number) => (n === 1 ? '1 kommender Termin' : `${n} kommende Termine`),
    next: 'Nächster',
    allHosts: 'Alle Gastgeber, A–Z',
    otherActivities: 'Andere Aktivitäten',
    studio: 'Studio', group: 'Gruppe', duration: 'Dauer', place: 'Wo', languages: 'Sprachen', price: 'Preis',
    perPerson: 'pro Person',
    priceUnknown: 'Auf Anfrage',
    free: 'Kostenlos',
  },
  fr: {
    crumbsRoot: 'Ateliers', inBerlin: 'Atelier à Berlin',
    upcoming: 'Prochaines dates & horaires', nextDates: 'Prochaines dates',
    onRequest: 'Sur demande',
    onRequestNote: 'A lieu quand vous le souhaitez — l’hôte fixe la date avec vous.',
    noDates: 'Aucune date publique pour le moment. Les sessions privées pour groupes ont lieu sur demande.',
    request: 'Demander une session privée', inquire: 'Demander',
    book: 'Réserver', requestBooking: 'Demander à réserver',
    soldOut: 'Complet', waitingList: 'Liste d’attente', spots: 'places restantes',
    timeTba: 'horaire à la réservation', today: 'Aujourd’hui', tomorrow: 'Demain',
    calendar: 'Voir tous les ateliers de Berlin sur le calendrier',
    moreIn: (short: string) => `Plus d’ateliers ${short.toLowerCase()} à Berlin`,
    hosts: (n: number) => (n === 1 ? '1 hôte' : `${n} hôtes`),
    dates: (n: number) => (n === 1 ? '1 date à venir' : `${n} dates à venir`),
    next: 'Prochain', allHosts: 'Tous les hôtes, de A à Z', otherActivities: 'Autres activités',
    studio: 'Atelier', group: 'Groupe', duration: 'Durée', place: 'Où', languages: 'Langues', price: 'Prix',
    perPerson: 'par personne', priceUnknown: 'Sur demande', free: 'Gratuit',
  },
  es: {
    crumbsRoot: 'Talleres', inBerlin: 'Taller en Berlín',
    upcoming: 'Próximas fechas & horarios', nextDates: 'Próximas fechas',
    onRequest: 'A petición',
    onRequestNote: 'Se hace cuando tú quieras — el anfitrión fija la fecha contigo.',
    noDates: 'Ahora mismo no hay fechas públicas. Las sesiones privadas para grupos se organizan a petición.',
    request: 'Solicitar una sesión privada', inquire: 'Consultar',
    book: 'Reservar', requestBooking: 'Solicitar reserva',
    soldOut: 'Agotado', waitingList: 'Lista de espera', spots: 'plazas libres',
    timeTba: 'hora al reservar', today: 'Hoy', tomorrow: 'Mañana',
    calendar: 'Ver todos los talleres de Berlín en el calendario',
    moreIn: (short: string) => `Más talleres de ${short.toLowerCase()} en Berlín`,
    hosts: (n: number) => (n === 1 ? '1 anfitrión' : `${n} anfitriones`),
    dates: (n: number) => (n === 1 ? '1 próxima fecha' : `${n} próximas fechas`),
    next: 'Próximo', allHosts: 'Todos los anfitriones, de la A a la Z', otherActivities: 'Otras actividades',
    studio: 'Estudio', group: 'Grupo', duration: 'Duración', place: 'Dónde', languages: 'Idiomas', price: 'Precio',
    perPerson: 'por persona', priceUnknown: 'A consultar', free: 'Gratis',
  },
  it: {
    crumbsRoot: 'Workshop', inBerlin: 'Workshop a Berlino',
    upcoming: 'Prossime date & orari', nextDates: 'Prossime date',
    onRequest: 'Su richiesta',
    onRequestNote: 'Si tiene quando vuoi tu — l’host fissa la data insieme a te.',
    noDates: 'Al momento nessuna data pubblica. Le sessioni private per gruppi si organizzano su richiesta.',
    request: 'Richiedi una sessione privata', inquire: 'Chiedi informazioni',
    book: 'Prenota', requestBooking: 'Richiedi prenotazione',
    soldOut: 'Esaurito', waitingList: 'Lista d’attesa', spots: 'posti liberi',
    timeTba: 'orario alla prenotazione', today: 'Oggi', tomorrow: 'Domani',
    calendar: 'Vedi tutti i workshop di Berlino nel calendario',
    moreIn: (short: string) => `Altri workshop di ${short.toLowerCase()} a Berlino`,
    hosts: (n: number) => (n === 1 ? '1 host' : `${n} host`),
    dates: (n: number) => (n === 1 ? '1 data in arrivo' : `${n} date in arrivo`),
    next: 'Prossimo', allHosts: 'Tutti gli host, dalla A alla Z', otherActivities: 'Altre attività',
    studio: 'Studio', group: 'Gruppo', duration: 'Durata', place: 'Dove', languages: 'Lingue', price: 'Prezzo',
    perPerson: 'a persona', priceUnknown: 'Su richiesta', free: 'Gratis',
  },
  nl: {
    crumbsRoot: 'Workshops', inBerlin: 'Workshop in Berlijn',
    upcoming: 'Komende data & tijden', nextDates: 'Volgende data',
    onRequest: 'Op aanvraag',
    onRequestNote: 'Vindt plaats wanneer jij wilt — de host prikt een datum met jou.',
    noDates: 'Nu geen openbare data gepubliceerd. Privésessies voor groepen zijn op aanvraag.',
    request: 'Privésessie aanvragen', inquire: 'Informeren',
    book: 'Boeken', requestBooking: 'Boeking aanvragen',
    soldOut: 'Uitverkocht', waitingList: 'Wachtlijst', spots: 'plekken vrij',
    timeTba: 'tijd bij boeking', today: 'Vandaag', tomorrow: 'Morgen',
    calendar: 'Bekijk elke workshop in Berlijn op de kalender',
    moreIn: (short: string) => `Meer ${short.toLowerCase()}-workshops in Berlijn`,
    hosts: (n: number) => (n === 1 ? '1 host' : `${n} hosts`),
    dates: (n: number) => (n === 1 ? '1 komende datum' : `${n} komende data`),
    next: 'Volgende', allHosts: 'Alle hosts, A–Z', otherActivities: 'Andere activiteiten',
    studio: 'Studio', group: 'Groep', duration: 'Duur', place: 'Waar', languages: 'Talen', price: 'Prijs',
    perPerson: 'per persoon', priceUnknown: 'Op aanvraag', free: 'Gratis',
  },
  pl: {
    crumbsRoot: 'Warsztaty', inBerlin: 'Warsztaty w Berlinie',
    upcoming: 'Nadchodzące terminy & godziny', nextDates: 'Najbliższe terminy',
    onRequest: 'Na zapytanie',
    onRequestNote: 'Odbywa się, kiedy chcesz — prowadzący ustala termin z Tobą.',
    noDates: 'Obecnie brak publicznych terminów. Prywatne sesje dla grup odbywają się na zapytanie.',
    request: 'Zapytaj o prywatną sesję', inquire: 'Zapytaj',
    book: 'Rezerwuj', requestBooking: 'Poproś o rezerwację',
    soldOut: 'Wyprzedane', waitingList: 'Lista oczekujących', spots: 'wolnych miejsc',
    timeTba: 'godzina przy rezerwacji', today: 'Dziś', tomorrow: 'Jutro',
    calendar: 'Zobacz wszystkie warsztaty w Berlinie w kalendarzu',
    moreIn: (short: string) => `Więcej warsztatów: ${short.toLowerCase()} w Berlinie`,
    hosts: (n: number) => (n === 1 ? '1 prowadzący' : `${n} prowadzących`),
    dates: (n: number) => (n === 1 ? '1 nadchodzący termin' : n >= 2 && n <= 4 ? `${n} nadchodzące terminy` : `${n} nadchodzących terminów`),
    next: 'Następny', allHosts: 'Wszyscy prowadzący, A–Z', otherActivities: 'Inne aktywności',
    studio: 'Pracownia', group: 'Grupa', duration: 'Czas', place: 'Gdzie', languages: 'Języki', price: 'Cena',
    perPerson: 'za osobę', priceUnknown: 'Na zapytanie', free: 'Bezpłatnie',
  },
  tr: {
    crumbsRoot: 'Atölyeler', inBerlin: 'Berlin’de atölye',
    upcoming: 'Yaklaşan tarihler & saatler', nextDates: 'Sonraki tarihler',
    onRequest: 'Talep üzerine',
    onRequestNote: 'Sen istediğinde yapılır — eğitmen tarihi seninle belirler.',
    noDates: 'Şu anda yayınlanmış açık tarih yok. Gruplar için özel seanslar talep üzerine düzenlenir.',
    request: 'Özel seans talep et', inquire: 'Bilgi al',
    book: 'Rezervasyon', requestBooking: 'Rezervasyon talep et',
    soldOut: 'Tükendi', waitingList: 'Bekleme listesi', spots: 'yer kaldı',
    timeTba: 'saat rezervasyonda', today: 'Bugün', tomorrow: 'Yarın',
    calendar: 'Berlin’deki tüm atölyeleri takvimde gör',
    moreIn: (short: string) => `Berlin’de daha fazla ${short.toLowerCase()} atölyesi`,
    hosts: (n: number) => (n === 1 ? '1 eğitmen' : `${n} eğitmen`),
    dates: (n: number) => (n === 1 ? '1 yaklaşan tarih' : `${n} yaklaşan tarih`),
    next: 'Sonraki', allHosts: 'Tüm eğitmenler, A–Z', otherActivities: 'Diğer etkinlikler',
    studio: 'Stüdyo', group: 'Grup', duration: 'Süre', place: 'Nerede', languages: 'Diller', price: 'Fiyat',
    perPerson: 'kişi başı', priceUnknown: 'Talep üzerine', free: 'Ücretsiz',
  },
} satisfies Record<Lang, unknown>;

/* ── URLs ─────────────────────────────────────────────────────────────── */

export const hubHref = (lang: Lang): string => href(lang, '/workshops/');
export const activityHref = (lang: Lang, activity: ActivityKey): string =>
  href(lang, `/workshops/${activity}/`);
export const hostHref = (lang: Lang, host: Pick<Host, 'slug' | 'activity'>): string =>
  href(lang, `/workshops/${host.activity}/${host.slug}/`);

/* ── Dates ────────────────────────────────────────────────────────────── */

const isoDay = (dayOffset: number): string =>
  new Date(berlinTodayMs() + dayOffset * 86400000).toISOString().slice(0, 10);

/** Berlin's UTC offset on a given day, as "+02:00" — the feed stores wall
 *  clock times, and schema.org wants to know which wall. */
const berlinOffset = (date: string): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Berlin',
    timeZoneName: 'longOffset',
  }).formatToParts(new Date(`${date}T12:00:00Z`));
  const name = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+01:00';
  const offset = name.replace('GMT', '');
  return offset === '' ? '+00:00' : offset;
};

/** An ISO 8601 start for schema.org: the date alone when the host only
 *  reveals the hour at checkout, else date, time and the Berlin offset. */
export const sessionIso = (s: Pick<Session, 'dayOffset' | 'time'>): string => {
  const date = isoDay(s.dayOffset);
  return s.time ? `${date}T${s.time}:00${berlinOffset(date)}` : date;
};

/** "Sat 13 Sep" / "Sa., 13. Sep." — with Today / Tomorrow for the first two
 *  days, as the calendar does. */
export const formatDay = (dayOffset: number, lang: Lang): string => {
  const t = pageCopy[lang];
  if (dayOffset === 0) return t.today;
  if (dayOffset === 1) return t.tomorrow;
  return new Date(berlinTodayMs() + dayOffset * 86400000).toLocaleDateString(
    LANG_META[lang].locale,
    { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' },
  );
};

export const formatWhen = (s: Pick<Session, 'dayOffset' | 'time'>, lang: Lang): string =>
  s.time ? `${formatDay(s.dayOffset, lang)} · ${s.time}` : formatDay(s.dayOffset, lang);

/* ── Per-host and per-activity data ───────────────────────────────────── */

export const sessionsFor = (slug: string, lang: Lang): Session[] =>
  getSessions(lang).filter((s) => s.host.slug === slug);

/** Every on-request workshop a host lists — not the calendar's rotating
 *  window of five, which is a teaser; on the host's own page they all
 *  belong. */
export const onRequestFor = (slug: string, lang: Lang): OnRequestWorkshop[] =>
  getOnRequestAll(lang).filter((o) => o.host.slug === slug);

export const hostsIn = (activity: ActivityKey, lang: Lang): Host[] =>
  getHosts(lang).filter((h) => h.activity === activity);

/** The next session per host, in calendar order — what a card leads with. */
export const nextSessionByHost = (lang: Lang): Map<string, Session> => {
  const next = new Map<string, Session>();
  for (const s of getSessions(lang)) if (!next.has(s.host.slug)) next.set(s.host.slug, s);
  return next;
};

/* ── Host page copy ───────────────────────────────────────────────────── */

/** A specialty that already names its format — "Graffiti workshops",
 *  "Urban sketching walks", "Guided drink tastings" — should not have
 *  "workshop" bolted on after it. Every language's words for a format are
 *  in here, because the specialty arrives in the page's language. */
const namesFormat = (specialty: string): boolean =>
  /workshop|classes|class\b|sessions?\b|walks|tours|tastings|courses|events|school|studio|kurs|führung|wanderung|schule|werkstatt|atelier|cours|balade|dégustation|taller|clase|paseo|cata|corso|laboratorio|passeggiat|degustazion|cursus|les\b|wandeling|proeverij|warsztat|zajęcia|spacer|degustacj|atölye|ders|yürüyüş|tadım/i.test(specialty);

const lowerFirst = (s: string): string => `${s.charAt(0).toLowerCase()}${s.slice(1)}`;

/** The sentences the host, workshop and district pages are built from, per
 *  language — word order and articles differ too much for one template
 *  with the nouns swapped. `named` says whether the specialty already
 *  names its format (see namesFormat). */
type SeoPhrases = {
  /** <title> of a host page. */
  hostTitle: (spec: string, name: string, named: boolean) => string;
  /** H1 of a host page: the specialty and who teaches it. */
  hostH1: (spec: string, name: string) => string;
  /** How the host lede opens — up to, not including, the place. */
  hostOpen: (spec: string, name: string, named: boolean) => string;
  /** "3 upcoming dates, the next: Sat 4 Oct · 18:00, €45." / "Next date: …" */
  hostWhen: (n: number, when: string, price: string) => string;
  onRequest: string;
  workshopTitle: (title: string, spec: string, name: string) => string;
  /** The workshop lede's first sentence, up to the full stop. */
  workshopOpen: (title: string, spec: string, name: string, district: string, named: boolean) => string;
  /** "Date: …" / "n upcoming dates — next …" */
  workshopWhen: (n: number, when: string, price: string) => string;
  and: string;
  /** "in Berlin" as it appears in this language's activity headings, and
   *  the same phrase for a district — used to turn "Pottery classes in
   *  Berlin" into "Pottery classes in Neukölln" on a district page. */
  inBerlin: string;
  inPlace: (place: string) => string;
  districtLede: (name: string, list: string, hosts: string, dates: string) => string;
  districtDescription: (name: string, list: string, hosts: string, dates: string) => string;
};

/** Turkish locative suffix: -de/-da by vowel harmony, -te/-ta after a
 *  voiceless consonant. Enough for Berlin's district names. */
const trLocative = (place: string): string => {
  const lower = place.toLowerCase();
  const lastVowel = [...lower].reverse().find((c) => 'aeıioöuü'.includes(c)) ?? 'e';
  const back = 'aıou'.includes(lastVowel);
  const hard = 'pçtkfsşh'.includes(lower.slice(-1));
  return `${place}’${hard ? 't' : 'd'}${back ? 'a' : 'e'}`;
};

const seoPhrases: Record<Lang, SeoPhrases> = {
  en: {
    hostTitle: (spec, name, named) => (named ? `${spec} in Berlin — ${name} | Twiggli` : `${spec} workshop in Berlin — ${name} | Twiggli`),
    hostH1: (spec, name) => `${spec} with ${name}`,
    hostOpen: (spec, name, named) => (named ? `${spec} in Berlin with ${name}` : `Book a ${lowerFirst(spec)} workshop in Berlin with ${name}`),
    hostWhen: (n, when, price) => `${n === 1 ? 'Next date' : `${n} upcoming dates, the next`}: ${when}${price}.`,
    onRequest: 'Dates on request.',
    workshopTitle: (title, spec, name) => `${title} — ${spec} with ${name}, Berlin | Twiggli`,
    workshopOpen: (title, spec, name, district, named) => `${title}: ${named ? spec : `a ${lowerFirst(spec)} workshop`} with ${name} in ${district}, Berlin`,
    workshopWhen: (n, when, price) => (n === 1 ? `Date: ${when}${price}.` : `${n} upcoming dates — next ${when}${price}.`),
    and: 'and',
    inBerlin: ' in Berlin', inPlace: (p) => ` in ${p}`,
    districtLede: (name, list, hosts, dates) => `Workshops in ${name}: ${list} — ${hosts}, ${dates}, with times, prices and direct booking with the host.`,
    districtDescription: (name, list, hosts, dates) => `Workshops in ${name}, Berlin: ${list}. ${hosts}, ${dates} with times, prices and booking.`,
  },
  de: {
    hostTitle: (spec, name, named) => (named ? `${spec} in Berlin — ${name} | Twiggli` : `${spec} Workshop in Berlin — ${name} | Twiggli`),
    hostH1: (spec, name) => `${spec} mit ${name}`,
    hostOpen: (spec, name, named) => (named ? `${spec} in Berlin mit ${name}` : `${spec} — Workshop in Berlin mit ${name}`),
    hostWhen: (n, when, price) => `${n === 1 ? 'Nächster Termin' : `${n} kommende Termine, der nächste`}: ${when}${price}.`,
    onRequest: 'Termine auf Anfrage.',
    workshopTitle: (title, spec, name) => `${title} — ${spec} mit ${name}, Berlin | Twiggli`,
    workshopOpen: (title, spec, name, district) => `${title}: ${spec} mit ${name} in ${district}, Berlin`,
    workshopWhen: (n, when, price) => (n === 1 ? `Termin: ${when}${price}.` : `${n} kommende Termine — der nächste ${when}${price}.`),
    and: 'und',
    inBerlin: ' in Berlin', inPlace: (p) => ` in ${p}`,
    districtLede: (name, list, hosts, dates) => `Workshops in ${name}: ${list} — ${hosts}, ${dates}, mit Uhrzeiten, Preisen und direkter Buchung beim Host.`,
    districtDescription: (name, list, hosts, dates) => `Workshops in ${name}, Berlin: ${list}. ${hosts}, ${dates} mit Uhrzeiten, Preisen und Buchung.`,
  },
  fr: {
    hostTitle: (spec, name, named) => (named ? `${spec} à Berlin — ${name} | Twiggli` : `${spec} — atelier à Berlin avec ${name} | Twiggli`),
    hostH1: (spec, name) => `${spec} avec ${name}`,
    hostOpen: (spec, name, named) => (named ? `${spec} à Berlin avec ${name}` : `${spec} — un atelier à Berlin avec ${name}`),
    hostWhen: (n, when, price) => `${n === 1 ? 'Prochaine date' : `${n} dates à venir, la prochaine`} : ${when}${price}.`,
    onRequest: 'Dates sur demande.',
    workshopTitle: (title, spec, name) => `${title} — ${spec} avec ${name}, Berlin | Twiggli`,
    workshopOpen: (title, spec, name, district, named) => `${title} : ${named ? spec : `atelier ${lowerFirst(spec)}`} avec ${name} à ${district}, Berlin`,
    workshopWhen: (n, when, price) => (n === 1 ? `Date : ${when}${price}.` : `${n} dates à venir — la prochaine ${when}${price}.`),
    and: 'et',
    inBerlin: ' à Berlin', inPlace: (p) => ` à ${p}`,
    districtLede: (name, list, hosts, dates) => `Ateliers à ${name} : ${list} — ${hosts}, ${dates}, avec horaires, prix et réservation directe auprès de l’hôte.`,
    districtDescription: (name, list, hosts, dates) => `Ateliers à ${name}, Berlin : ${list}. ${hosts}, ${dates} avec horaires, prix et réservation.`,
  },
  es: {
    hostTitle: (spec, name, named) => (named ? `${spec} en Berlín — ${name} | Twiggli` : `${spec} — taller en Berlín con ${name} | Twiggli`),
    hostH1: (spec, name) => `${spec} con ${name}`,
    hostOpen: (spec, name, named) => (named ? `${spec} en Berlín con ${name}` : `${spec} — un taller en Berlín con ${name}`),
    hostWhen: (n, when, price) => `${n === 1 ? 'Próxima fecha' : `${n} próximas fechas, la siguiente`}: ${when}${price}.`,
    onRequest: 'Fechas a petición.',
    workshopTitle: (title, spec, name) => `${title} — ${spec} con ${name}, Berlín | Twiggli`,
    workshopOpen: (title, spec, name, district, named) => `${title}: ${named ? spec : `taller de ${lowerFirst(spec)}`} con ${name} en ${district}, Berlín`,
    workshopWhen: (n, when, price) => (n === 1 ? `Fecha: ${when}${price}.` : `${n} próximas fechas — la siguiente ${when}${price}.`),
    and: 'y',
    inBerlin: ' en Berlín', inPlace: (p) => ` en ${p}`,
    districtLede: (name, list, hosts, dates) => `Talleres en ${name}: ${list} — ${hosts}, ${dates}, con horarios, precios y reserva directa con el anfitrión.`,
    districtDescription: (name, list, hosts, dates) => `Talleres en ${name}, Berlín: ${list}. ${hosts}, ${dates} con horarios, precios y reserva.`,
  },
  it: {
    hostTitle: (spec, name, named) => (named ? `${spec} a Berlino — ${name} | Twiggli` : `${spec} — workshop a Berlino con ${name} | Twiggli`),
    hostH1: (spec, name) => `${spec} con ${name}`,
    hostOpen: (spec, name, named) => (named ? `${spec} a Berlino con ${name}` : `${spec} — un workshop a Berlino con ${name}`),
    hostWhen: (n, when, price) => `${n === 1 ? 'Prossima data' : `${n} date in arrivo, la prossima`}: ${when}${price}.`,
    onRequest: 'Date su richiesta.',
    workshopTitle: (title, spec, name) => `${title} — ${spec} con ${name}, Berlino | Twiggli`,
    workshopOpen: (title, spec, name, district, named) => `${title}: ${named ? spec : `workshop di ${lowerFirst(spec)}`} con ${name} a ${district}, Berlino`,
    workshopWhen: (n, when, price) => (n === 1 ? `Data: ${when}${price}.` : `${n} date in arrivo — la prossima ${when}${price}.`),
    and: 'e',
    inBerlin: ' a Berlino', inPlace: (p) => ` a ${p}`,
    districtLede: (name, list, hosts, dates) => `Workshop a ${name}: ${list} — ${hosts}, ${dates}, con orari, prezzi e prenotazione diretta con l’host.`,
    districtDescription: (name, list, hosts, dates) => `Workshop a ${name}, Berlino: ${list}. ${hosts}, ${dates} con orari, prezzi e prenotazione.`,
  },
  nl: {
    hostTitle: (spec, name, named) => (named ? `${spec} in Berlijn — ${name} | Twiggli` : `${spec} — workshop in Berlijn met ${name} | Twiggli`),
    hostH1: (spec, name) => `${spec} met ${name}`,
    hostOpen: (spec, name, named) => (named ? `${spec} in Berlijn met ${name}` : `${spec} — een workshop in Berlijn met ${name}`),
    hostWhen: (n, when, price) => `${n === 1 ? 'Volgende datum' : `${n} komende data, de eerstvolgende`}: ${when}${price}.`,
    onRequest: 'Data op aanvraag.',
    workshopTitle: (title, spec, name) => `${title} — ${spec} met ${name}, Berlijn | Twiggli`,
    workshopOpen: (title, spec, name, district, named) => `${title}: ${named ? spec : `een workshop ${lowerFirst(spec)}`} met ${name} in ${district}, Berlijn`,
    workshopWhen: (n, when, price) => (n === 1 ? `Datum: ${when}${price}.` : `${n} komende data — de eerstvolgende ${when}${price}.`),
    and: 'en',
    inBerlin: ' in Berlijn', inPlace: (p) => ` in ${p}`,
    districtLede: (name, list, hosts, dates) => `Workshops in ${name}: ${list} — ${hosts}, ${dates}, met tijden, prijzen en direct boeken bij de host.`,
    districtDescription: (name, list, hosts, dates) => `Workshops in ${name}, Berlijn: ${list}. ${hosts}, ${dates} met tijden, prijzen en boeking.`,
  },
  pl: {
    hostTitle: (spec, name, named) => (named ? `${spec} w Berlinie — ${name} | Twiggli` : `${spec} — warsztaty w Berlinie, prowadzi ${name} | Twiggli`),
    hostH1: (spec, name) => `${spec} — prowadzi ${name}`,
    hostOpen: (spec, name, named) => (named ? `${spec} w Berlinie, prowadzi ${name}` : `${spec} — warsztaty w Berlinie, prowadzi ${name}`),
    hostWhen: (n, when, price) => `${n === 1 ? 'Najbliższy termin' : `${n === 2 || n === 3 || n === 4 ? `${n} nadchodzące terminy` : `${n} nadchodzących terminów`}, najbliższy`}: ${when}${price}.`,
    onRequest: 'Terminy na zapytanie.',
    workshopTitle: (title, spec, name) => `${title} — ${spec}, prowadzi ${name}, Berlin | Twiggli`,
    workshopOpen: (title, spec, name, district, named) => `${title}: ${named ? spec : `warsztaty — ${lowerFirst(spec)}`}, prowadzi ${name}, ${district}, Berlin`,
    workshopWhen: (n, when, price) => (n === 1 ? `Termin: ${when}${price}.` : `${n === 2 || n === 3 || n === 4 ? `${n} nadchodzące terminy` : `${n} nadchodzących terminów`} — najbliższy ${when}${price}.`),
    and: 'i',
    inBerlin: ' w Berlinie', inPlace: (p) => ` — ${p}`,
    districtLede: (name, list, hosts, dates) => `Warsztaty — ${name}: ${list} — ${hosts}, ${dates}, z godzinami, cenami i bezpośrednią rezerwacją u prowadzącego.`,
    districtDescription: (name, list, hosts, dates) => `Warsztaty — ${name}, Berlin: ${list}. ${hosts}, ${dates} z godzinami, cenami i rezerwacją.`,
  },
  tr: {
    hostTitle: (spec, name, named) => (named ? `Berlin’de ${spec} — ${name} | Twiggli` : `Berlin’de ${spec} atölyesi — ${name} | Twiggli`),
    hostH1: (spec, name) => `${name} ile ${spec}`,
    hostOpen: (spec, name, named) => (named ? `Berlin’de ${name} ile ${spec}` : `Berlin’de ${name} ile ${lowerFirst(spec)} atölyesi`),
    hostWhen: (n, when, price) => `${n === 1 ? 'Sonraki tarih' : `${n} yaklaşan tarih, en yakını`}: ${when}${price}.`,
    onRequest: 'Tarihler talep üzerine.',
    workshopTitle: (title, spec, name) => `${title} — ${name} ile ${spec}, Berlin | Twiggli`,
    workshopOpen: (title, spec, name, district, named) => `${title}: ${trLocative(district)}, Berlin, ${name} ile ${named ? spec : `${lowerFirst(spec)} atölyesi`}`,
    workshopWhen: (n, when, price) => (n === 1 ? `Tarih: ${when}${price}.` : `${n} yaklaşan tarih — en yakını ${when}${price}.`),
    and: 've',
    inBerlin: 'Berlin’de', inPlace: (p) => trLocative(p),
    districtLede: (name, list, hosts, dates) => `${trLocative(name)} atölyeler: ${list} — ${hosts}, ${dates}; saatler, fiyatlar ve doğrudan eğitmenden rezervasyonla.`,
    districtDescription: (name, list, hosts, dates) => `${trLocative(name)}, Berlin, atölyeler: ${list}. ${hosts}, ${dates}; saatler, fiyatlar ve rezervasyon.`,
  },
};

export const hostTitle = (host: Host, lang: Lang): string =>
  seoPhrases[lang].hostTitle(host.specialty, host.name, namesFormat(host.specialty));

export const hostH1 = (host: Host, lang: Lang): string =>
  seoPhrases[lang].hostH1(host.specialty, host.name);

/** The first paragraph under the heading: the query in a sentence, then
 *  the facts a searcher scans for — next date, group, length, languages. */
export const hostLede = (host: Host, sessions: Session[], lang: Lang): string => {
  const p = seoPhrases[lang];
  const next = sessions[0];
  const where = host.studio && host.studio !== host.name ? `${host.studio}, ${host.place}` : host.place;
  const open = p.hostOpen(host.specialty, host.name, namesFormat(host.specialty));
  const when = next
    ? p.hostWhen(sessions.length, formatWhen(next, lang), next.price ? `, ${next.price}` : '')
    : p.onRequest;
  return `${open}, ${where}. ${when} ${host.group} · ${host.duration} · ${host.languages}.`;
};

/** Meta description: the lede's opening, cut to fit a result snippet. */
export const hostDescription = (host: Host, sessions: Session[], lang: Lang): string => {
  const lede = hostLede(host, sessions, lang);
  if (lede.length <= 158) return lede;
  const cut = lede.slice(0, 155);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 120))}…`;
};

/** The picture a host page shares as — the reel's poster where there is
 *  one, else the photo — as an absolute URL, or nothing. */
export const hostImage = (host: Host): string | undefined =>
  host.poster ? absolute(host.poster) : host.photo ? absolute(host.photo) : undefined;

/** What the calendar labels the activity — the filter vocabulary, so the
 *  two never disagree. */
export const activityLabel = (activity: ActivityKey, lang: Lang): string =>
  filterCopy[lang].activities[activity];

/* ── Workshop pages: one per class a host runs ────────────────────────── */

export type Workshop = {
  key: string;
  title: string;
  host: Host;
  sessions: Session[];
};

export const workshopHref = (lang: Lang, host: Pick<Host, 'slug' | 'activity'>, key: string): string =>
  href(lang, `/workshops/${host.activity}/${host.slug}/${key}/`);

/** A host's classes, each with all of its upcoming dates, soonest first.
 *  A class with no date in the window has no page — nothing is invented. */
export const workshopsFor = (slug: string, lang: Lang): Workshop[] => {
  const byKey = new Map<string, Workshop>();
  for (const s of sessionsFor(slug, lang)) {
    const w = byKey.get(s.workshopKey);
    if (w) w.sessions.push(s);
    else byKey.set(s.workshopKey, { key: s.workshopKey, title: s.title, host: s.host, sessions: [s] });
  }
  return [...byKey.values()].sort((a, b) => a.sessions[0].dayOffset - b.sessions[0].dayOffset);
};

export const allWorkshops = (lang: Lang): Workshop[] =>
  getHosts(lang).flatMap((h) => workshopsFor(h.slug, lang));

export const workshopTitle = (w: Workshop, lang: Lang): string =>
  seoPhrases[lang].workshopTitle(w.title, w.host.specialty, w.host.name);

export const workshopLede = (w: Workshop, lang: Lang): string => {
  const p = seoPhrases[lang];
  const next = w.sessions[0];
  const price = next.price ? `, ${next.price}` : '';
  const facts = `${next.duration ?? w.host.duration} · ${next.languages ?? w.host.languages}`;
  const open = p.workshopOpen(w.title, w.host.specialty, w.host.name, next.district, namesFormat(w.host.specialty));
  return `${open}. ${p.workshopWhen(w.sessions.length, formatWhen(next, lang), price)} ${facts}.`;
};

export const clip = (text: string, max = 158): string => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 3);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 40))}…`;
};

/* ── District pages ───────────────────────────────────────────────────── */

export type District = {
  slug: string;
  name: string;
  hosts: Host[];
  sessions: Session[];
};

/** A venue qualifier after the district folds into its district, as the
 *  calendar's filter does; "Online" is not a place in Berlin. */
const districtName = (s: Session): string => s.district.replace(/\s+St\.\s.*$/, '');
const NOT_A_DISTRICT = new Set(['Online']);

export const districtsFor = (lang: Lang): District[] => {
  const byName = new Map<string, District>();
  for (const s of getSessions(lang)) {
    const name = districtName(s);
    if (NOT_A_DISTRICT.has(name)) continue;
    let d = byName.get(name);
    if (!d) {
      d = { slug: slugify(name), name, hosts: [], sessions: [] };
      byName.set(name, d);
    }
    d.sessions.push(s);
    if (!d.hosts.some((h) => h.slug === s.host.slug)) d.hosts.push(s.host);
  }
  // A host whose address names the district belongs on its page even
  // between programmes.
  for (const h of getHosts(lang)) {
    for (const d of byName.values()) {
      if (h.place.includes(d.name) && !d.hosts.some((x) => x.slug === h.slug)) d.hosts.push(h);
    }
  }
  return [...byName.values()].sort((a, b) => b.sessions.length - a.sessions.length || a.name.localeCompare(b.name));
};

export const districtHref = (lang: Lang, slug: string): string => href(lang, `/workshops/berlin/${slug}/`);

export const districtCopy = (d: District, lang: Lang) => {
  const p = seoPhrases[lang];
  const acts = ACTIVITY_ORDER.filter((a) => d.hosts.some((h) => h.activity === a));
  const shorts = acts.map((a) => activityCopy[lang][a].short);
  const list = shorts.length > 1 ? `${shorts.slice(0, -1).join(', ')} ${p.and} ${shorts[shorts.length - 1]}` : shorts[0] ?? '';
  const t = pageCopy[lang];
  const hosts = t.hosts(d.hosts.length);
  const dates = t.dates(d.sessions.length);
  const h1 = lang === 'tr' ? `${trLocative(d.name)} atölyeler` : `${hubCopy[lang].h1.replace(p.inBerlin, '')}${p.inPlace(d.name)}`;
  return {
    title: `${h1}, Berlin — ${shorts.slice(0, 3).join(', ')} | Twiggli`,
    h1,
    lede: p.districtLede(d.name, list, hosts, dates),
    description: clip(p.districtDescription(d.name, list, hosts, dates)),
    /* "Pottery classes in Berlin" → "Pottery classes in Neukölln": the
       activity heading with the city swapped for the district. */
    sectionTitle: (a: ActivityKey) => activityCopy[lang][a].h1.replace(p.inBerlin, p.inPlace(d.name)),
  };
};

/* ── Occasion pages: weekend, evenings, kids ──────────────────────────── */

export type Occasion = 'weekend' | 'evenings' | 'kids';
export const OCCASIONS: Occasion[] = ['weekend', 'evenings', 'kids'];

const weekday = (s: Session): number =>
  new Date(berlinTodayMs() + s.dayOffset * 86400000).getUTCDay();

export const occasionSessions = (occasion: Occasion, lang: Lang): Session[] => {
  const all = getSessions(lang);
  if (occasion === 'weekend') return all.filter((s) => weekday(s) === 0 || weekday(s) === 6);
  if (occasion === 'evenings') return all.filter((s) => s.time !== undefined && s.time >= '18:00' && weekday(s) >= 1 && weekday(s) <= 5);
  return all.filter((s) => s.kids);
};

export const occasionHref = (lang: Lang, occasion: Occasion): string => href(lang, `/workshops/${occasion}/`);

export const occasionCopy: Record<Lang, Record<Occasion, { short: string; title: string; h1: string; lede: string; description: string; empty: string }>> = {
  en: {
    weekend: {
      short: 'At the weekend',
      title: 'Workshops in Berlin at the weekend — Saturday & Sunday dates, prices, booking | Twiggli',
      h1: 'Workshops in Berlin at the weekend',
      lede: 'Every Saturday and Sunday workshop our hosts run in Berlin over the coming weeks — pottery, cooking, crafts, art and more — with times, prices and direct booking.',
      description: 'Weekend workshops in Berlin: every Saturday and Sunday class from independent hosts — pottery, cooking, crafts, art. Times, prices and booking.',
      empty: 'No weekend dates published right now.',
    },
    evenings: {
      short: 'Evenings, after work',
      title: 'Evening workshops in Berlin — after-work classes from 6 pm | Twiggli',
      h1: 'Evening workshops in Berlin — after work',
      lede: 'Weekday workshops starting at 18:00 or later: pottery, printmaking, cooking, candle making and more, an evening at a time, with times, prices and direct booking.',
      description: 'Evening workshops in Berlin: weekday classes from 6 pm — pottery, printmaking, cooking, candles and more. Times, prices and booking.',
      empty: 'No evening dates published right now.',
    },
    kids: {
      short: 'For kids',
      title: 'Workshops for kids in Berlin — classes for children, dates & booking | Twiggli',
      h1: 'Workshops for kids in Berlin',
      lede: 'Classes designed for children, run by our hosts in Berlin, with dates, prices and booking. Family sessions for groups run on request through any host.',
      description: 'Workshops for kids in Berlin: classes designed for children from independent hosts, with upcoming dates, prices and booking.',
      empty: 'No dates for children published right now — family sessions run on request.',
    },
  },
  de: {
    weekend: {
      short: 'Am Wochenende',
      title: 'Workshops in Berlin am Wochenende — Samstag & Sonntag, Termine & Buchung | Twiggli',
      h1: 'Workshops in Berlin am Wochenende',
      lede: 'Alle Samstags- und Sonntags-Workshops unserer Gastgeber in Berlin in den kommenden Wochen — Töpfern, Kochen, Kreatives, Kunst und mehr — mit Uhrzeiten, Preisen und direkter Buchung.',
      description: 'Wochenend-Workshops in Berlin: alle Samstags- und Sonntagskurse unabhängiger Hosts — Töpfern, Kochen, Kreatives, Kunst. Uhrzeiten, Preise und Buchung.',
      empty: 'Gerade keine Wochenend-Termine veröffentlicht.',
    },
    evenings: {
      short: 'Abends, nach Feierabend',
      title: 'Feierabend-Workshops in Berlin — Kurse ab 18 Uhr | Twiggli',
      h1: 'Feierabend-Workshops in Berlin — abends ab 18 Uhr',
      lede: 'Workshops unter der Woche, die um 18 Uhr oder später beginnen: Töpfern, Druck, Kochen, Kerzen gießen und mehr, ein Abend pro Kurs, mit Uhrzeiten, Preisen und direkter Buchung.',
      description: 'Feierabend-Workshops in Berlin: Kurse unter der Woche ab 18 Uhr — Töpfern, Druck, Kochen, Kerzen und mehr. Uhrzeiten, Preise und Buchung.',
      empty: 'Gerade keine Abend-Termine veröffentlicht.',
    },
    kids: {
      short: 'Für Kinder',
      title: 'Kinder-Workshops in Berlin — Kurse für Kinder, Termine & Buchung | Twiggli',
      h1: 'Kinder-Workshops in Berlin',
      lede: 'Kurse für Kinder bei unseren Gastgebern in Berlin, mit Terminen, Preisen und Buchung. Familien-Sessions für Gruppen laufen bei jedem Host auf Anfrage.',
      description: 'Kinder-Workshops in Berlin: Kurse für Kinder bei unabhängigen Hosts, mit kommenden Terminen, Preisen und Buchung.',
      empty: 'Gerade keine Kinder-Termine veröffentlicht — Familien-Sessions laufen auf Anfrage.',
    },
  },
  fr: {
    weekend: {
      short: 'Le week-end',
      title: 'Ateliers à Berlin le week-end — dates du samedi & dimanche, prix, réservation | Twiggli',
      h1: 'Ateliers à Berlin le week-end',
      lede: 'Tous les ateliers du samedi et du dimanche que nos hôtes donnent à Berlin dans les semaines à venir — poterie, cuisine, artisanat, art et plus — avec horaires, prix et réservation directe.',
      description: 'Ateliers du week-end à Berlin : tous les cours du samedi et du dimanche d’hôtes indépendants — poterie, cuisine, artisanat, art. Horaires, prix et réservation.',
      empty: 'Aucune date de week-end publiée pour le moment.',
    },
    evenings: {
      short: 'Le soir, après le travail',
      title: 'Ateliers du soir à Berlin — cours après le travail dès 18 h | Twiggli',
      h1: 'Ateliers du soir à Berlin — après le travail',
      lede: 'Des ateliers en semaine qui commencent à 18 h ou plus tard : poterie, gravure, cuisine, bougies et plus, une soirée à la fois, avec horaires, prix et réservation directe.',
      description: 'Ateliers du soir à Berlin : cours en semaine dès 18 h — poterie, gravure, cuisine, bougies et plus. Horaires, prix et réservation.',
      empty: 'Aucune date en soirée publiée pour le moment.',
    },
    kids: {
      short: 'Pour les enfants',
      title: 'Ateliers pour enfants à Berlin — cours pour les enfants, dates & réservation | Twiggli',
      h1: 'Ateliers pour enfants à Berlin',
      lede: 'Des cours conçus pour les enfants, donnés par nos hôtes à Berlin, avec dates, prix et réservation. Les sessions en famille pour groupes ont lieu sur demande chez n’importe quel hôte.',
      description: 'Ateliers pour enfants à Berlin : des cours conçus pour les enfants par des hôtes indépendants, avec dates à venir, prix et réservation.',
      empty: 'Aucune date pour enfants publiée pour le moment — les sessions en famille ont lieu sur demande.',
    },
  },
  es: {
    weekend: {
      short: 'El fin de semana',
      title: 'Talleres en Berlín el fin de semana — fechas de sábado & domingo, precios, reserva | Twiggli',
      h1: 'Talleres en Berlín el fin de semana',
      lede: 'Todos los talleres de sábado y domingo que dan nuestros anfitriones en Berlín en las próximas semanas — cerámica, cocina, artesanía, arte y más — con horarios, precios y reserva directa.',
      description: 'Talleres de fin de semana en Berlín: todas las clases de sábado y domingo de anfitriones independientes — cerámica, cocina, artesanía, arte. Horarios, precios y reserva.',
      empty: 'Ahora mismo no hay fechas de fin de semana publicadas.',
    },
    evenings: {
      short: 'Por la tarde, al salir del trabajo',
      title: 'Talleres de tarde en Berlín — clases al salir del trabajo desde las 18:00 | Twiggli',
      h1: 'Talleres de tarde en Berlín — al salir del trabajo',
      lede: 'Talleres entre semana que empiezan a las 18:00 o más tarde: cerámica, grabado, cocina, velas y más, una tarde cada vez, con horarios, precios y reserva directa.',
      description: 'Talleres de tarde en Berlín: clases entre semana desde las 18:00 — cerámica, grabado, cocina, velas y más. Horarios, precios y reserva.',
      empty: 'Ahora mismo no hay fechas de tarde publicadas.',
    },
    kids: {
      short: 'Para niños',
      title: 'Talleres para niños en Berlín — clases infantiles, fechas & reserva | Twiggli',
      h1: 'Talleres para niños en Berlín',
      lede: 'Clases pensadas para niños, impartidas por nuestros anfitriones en Berlín, con fechas, precios y reserva. Las sesiones familiares para grupos se organizan a petición con cualquier anfitrión.',
      description: 'Talleres para niños en Berlín: clases pensadas para niños de anfitriones independientes, con próximas fechas, precios y reserva.',
      empty: 'Ahora mismo no hay fechas para niños publicadas — las sesiones familiares se organizan a petición.',
    },
  },
  it: {
    weekend: {
      short: 'Nel weekend',
      title: 'Workshop a Berlino nel weekend — date di sabato & domenica, prezzi, prenotazione | Twiggli',
      h1: 'Workshop a Berlino nel weekend',
      lede: 'Tutti i workshop del sabato e della domenica che i nostri host tengono a Berlino nelle prossime settimane — ceramica, cucina, artigianato, arte e altro — con orari, prezzi e prenotazione diretta.',
      description: 'Workshop del weekend a Berlino: tutti i corsi di sabato e domenica di host indipendenti — ceramica, cucina, artigianato, arte. Orari, prezzi e prenotazione.',
      empty: 'Al momento nessuna data nel weekend pubblicata.',
    },
    evenings: {
      short: 'La sera, dopo il lavoro',
      title: 'Workshop serali a Berlino — corsi dopo il lavoro dalle 18 | Twiggli',
      h1: 'Workshop serali a Berlino — dopo il lavoro',
      lede: 'Workshop infrasettimanali che iniziano alle 18 o più tardi: ceramica, stampa, cucina, candele e altro, una sera alla volta, con orari, prezzi e prenotazione diretta.',
      description: 'Workshop serali a Berlino: corsi infrasettimanali dalle 18 — ceramica, stampa, cucina, candele e altro. Orari, prezzi e prenotazione.',
      empty: 'Al momento nessuna data serale pubblicata.',
    },
    kids: {
      short: 'Per bambini',
      title: 'Workshop per bambini a Berlino — corsi per bambini, date & prenotazione | Twiggli',
      h1: 'Workshop per bambini a Berlino',
      lede: 'Corsi pensati per i bambini, tenuti dai nostri host a Berlino, con date, prezzi e prenotazione. Le sessioni per famiglie e gruppi si organizzano su richiesta con qualsiasi host.',
      description: 'Workshop per bambini a Berlino: corsi pensati per i bambini di host indipendenti, con prossime date, prezzi e prenotazione.',
      empty: 'Al momento nessuna data per bambini pubblicata — le sessioni per famiglie si organizzano su richiesta.',
    },
  },
  nl: {
    weekend: {
      short: 'In het weekend',
      title: 'Workshops in Berlijn in het weekend — zaterdag & zondag, prijzen, boeking | Twiggli',
      h1: 'Workshops in Berlijn in het weekend',
      lede: 'Elke zaterdag- en zondagworkshop die onze hosts de komende weken in Berlijn geven — pottenbakken, koken, ambacht, kunst en meer — met tijden, prijzen en direct boeken.',
      description: 'Weekendworkshops in Berlijn: elke zaterdag- en zondagles van onafhankelijke hosts — pottenbakken, koken, ambacht, kunst. Tijden, prijzen en boeking.',
      empty: 'Nu geen weekenddata gepubliceerd.',
    },
    evenings: {
      short: '’s Avonds, na het werk',
      title: 'Avondworkshops in Berlijn — lessen na het werk vanaf 18:00 | Twiggli',
      h1: 'Avondworkshops in Berlijn — na het werk',
      lede: 'Doordeweekse workshops die om 18:00 of later beginnen: pottenbakken, druk, koken, kaarsen en meer, één avond per keer, met tijden, prijzen en direct boeken.',
      description: 'Avondworkshops in Berlijn: doordeweekse lessen vanaf 18:00 — pottenbakken, druk, koken, kaarsen en meer. Tijden, prijzen en boeking.',
      empty: 'Nu geen avonddata gepubliceerd.',
    },
    kids: {
      short: 'Voor kinderen',
      title: 'Workshops voor kinderen in Berlijn — kinderlessen, data & boeking | Twiggli',
      h1: 'Workshops voor kinderen in Berlijn',
      lede: 'Lessen ontworpen voor kinderen, gegeven door onze hosts in Berlijn, met data, prijzen en boeking. Gezinssessies voor groepen zijn op aanvraag bij elke host.',
      description: 'Workshops voor kinderen in Berlijn: lessen voor kinderen van onafhankelijke hosts, met komende data, prijzen en boeking.',
      empty: 'Nu geen data voor kinderen gepubliceerd — gezinssessies zijn op aanvraag.',
    },
  },
  pl: {
    weekend: {
      short: 'W weekend',
      title: 'Warsztaty w Berlinie w weekend — terminy w sobotę & niedzielę, ceny, rezerwacja | Twiggli',
      h1: 'Warsztaty w Berlinie w weekend',
      lede: 'Wszystkie sobotnie i niedzielne warsztaty, które nasi prowadzący organizują w Berlinie w najbliższych tygodniach — ceramika, gotowanie, rękodzieło, sztuka i więcej — z godzinami, cenami i bezpośrednią rezerwacją.',
      description: 'Warsztaty weekendowe w Berlinie: wszystkie sobotnie i niedzielne zajęcia niezależnych prowadzących — ceramika, gotowanie, rękodzieło, sztuka. Godziny, ceny i rezerwacja.',
      empty: 'Obecnie brak opublikowanych terminów weekendowych.',
    },
    evenings: {
      short: 'Wieczorem, po pracy',
      title: 'Warsztaty wieczorne w Berlinie — zajęcia po pracy od 18:00 | Twiggli',
      h1: 'Warsztaty wieczorne w Berlinie — po pracy',
      lede: 'Warsztaty w dni powszednie zaczynające się o 18:00 lub później: ceramika, grafika, gotowanie, świece i więcej, jeden wieczór na raz, z godzinami, cenami i bezpośrednią rezerwacją.',
      description: 'Warsztaty wieczorne w Berlinie: zajęcia w dni powszednie od 18:00 — ceramika, grafika, gotowanie, świece i więcej. Godziny, ceny i rezerwacja.',
      empty: 'Obecnie brak opublikowanych terminów wieczornych.',
    },
    kids: {
      short: 'Dla dzieci',
      title: 'Warsztaty dla dzieci w Berlinie — zajęcia dla dzieci, terminy & rezerwacja | Twiggli',
      h1: 'Warsztaty dla dzieci w Berlinie',
      lede: 'Zajęcia zaprojektowane dla dzieci, prowadzone przez naszych prowadzących w Berlinie, z terminami, cenami i rezerwacją. Sesje rodzinne dla grup odbywają się na zapytanie u każdego prowadzącego.',
      description: 'Warsztaty dla dzieci w Berlinie: zajęcia zaprojektowane dla dzieci u niezależnych prowadzących, z nadchodzącymi terminami, cenami i rezerwacją.',
      empty: 'Obecnie brak opublikowanych terminów dla dzieci — sesje rodzinne odbywają się na zapytanie.',
    },
  },
  tr: {
    weekend: {
      short: 'Hafta sonu',
      title: 'Hafta sonu Berlin’de atölyeler — cumartesi & pazar tarihleri, fiyatlar, rezervasyon | Twiggli',
      h1: 'Hafta sonu Berlin’de atölyeler',
      lede: 'Eğitmenlerimizin önümüzdeki haftalarda Berlin’de verdiği tüm cumartesi ve pazar atölyeleri — çömlek, yemek, el sanatları, sanat ve daha fazlası — saatler, fiyatlar ve doğrudan rezervasyonla.',
      description: 'Berlin’de hafta sonu atölyeleri: bağımsız eğitmenlerin tüm cumartesi ve pazar dersleri — çömlek, yemek, el sanatları, sanat. Saatler, fiyatlar ve rezervasyon.',
      empty: 'Şu anda yayınlanmış hafta sonu tarihi yok.',
    },
    evenings: {
      short: 'Akşamları, iş çıkışı',
      title: 'Berlin’de akşam atölyeleri — 18:00’den itibaren iş çıkışı dersler | Twiggli',
      h1: 'Berlin’de akşam atölyeleri — iş çıkışı',
      lede: 'Hafta içi 18:00 veya sonrasında başlayan atölyeler: çömlek, baskı, yemek, mum yapımı ve daha fazlası, her seferinde bir akşam, saatler, fiyatlar ve doğrudan rezervasyonla.',
      description: 'Berlin’de akşam atölyeleri: hafta içi 18:00’den itibaren dersler — çömlek, baskı, yemek, mum ve daha fazlası. Saatler, fiyatlar ve rezervasyon.',
      empty: 'Şu anda yayınlanmış akşam tarihi yok.',
    },
    kids: {
      short: 'Çocuklar için',
      title: 'Berlin’de çocuk atölyeleri — çocuklar için dersler, tarihler & rezervasyon | Twiggli',
      h1: 'Berlin’de çocuk atölyeleri',
      lede: 'Eğitmenlerimizin Berlin’de çocuklar için tasarladığı dersler; tarihler, fiyatlar ve rezervasyonla. Gruplar için aile seansları her eğitmende talep üzerine düzenlenir.',
      description: 'Berlin’de çocuk atölyeleri: bağımsız eğitmenlerden çocuklar için tasarlanmış dersler; yaklaşan tarihler, fiyatlar ve rezervasyonla.',
      empty: 'Şu anda yayınlanmış çocuk tarihi yok — aile seansları talep üzerine düzenlenir.',
    },
  },
};

export const hubExtraCopy = {
  en: { byDistrict: 'Workshops by district', byOccasion: 'By occasion', theirWorkshops: 'Their workshops', allDates: 'all dates', backToHost: 'All workshops by', bookingNote: 'Booking opens on the host’s own page.' },
  de: { byDistrict: 'Workshops nach Bezirk', byOccasion: 'Nach Anlass', theirWorkshops: 'Ihre Workshops', allDates: 'alle Termine', backToHost: 'Alle Workshops von', bookingNote: 'Die Buchung läuft über die Seite des Hosts.' },
  fr: { byDistrict: 'Ateliers par quartier', byOccasion: 'Par occasion', theirWorkshops: 'Ses ateliers', allDates: 'toutes les dates', backToHost: 'Tous les ateliers de', bookingNote: 'La réservation se fait sur la page de l’hôte.' },
  es: { byDistrict: 'Talleres por barrio', byOccasion: 'Por ocasión', theirWorkshops: 'Sus talleres', allDates: 'todas las fechas', backToHost: 'Todos los talleres de', bookingNote: 'La reserva se hace en la página del anfitrión.' },
  it: { byDistrict: 'Workshop per quartiere', byOccasion: 'Per occasione', theirWorkshops: 'I suoi workshop', allDates: 'tutte le date', backToHost: 'Tutti i workshop di', bookingNote: 'La prenotazione avviene sulla pagina dell’host.' },
  nl: { byDistrict: 'Workshops per wijk', byOccasion: 'Per gelegenheid', theirWorkshops: 'Hun workshops', allDates: 'alle data', backToHost: 'Alle workshops van', bookingNote: 'Boeken gaat via de pagina van de host.' },
  pl: { byDistrict: 'Warsztaty według dzielnicy', byOccasion: 'Według okazji', theirWorkshops: 'Warsztaty prowadzącego', allDates: 'wszystkie terminy', backToHost: 'Wszystkie warsztaty:', bookingNote: 'Rezerwacja odbywa się na stronie prowadzącego.' },
  tr: { byDistrict: 'Semte göre atölyeler', byOccasion: 'Duruma göre', theirWorkshops: 'Atölyeleri', allDates: 'tüm tarihler', backToHost: 'Tüm atölyeler:', bookingNote: 'Rezervasyon eğitmenin kendi sayfasından yapılır.' },
} satisfies Record<Lang, unknown>;

/** Sessions grouped by day, in order, for the occasion pages. */
export const byDay = (sessions: Session[]): [number, Session[]][] => {
  const groups = new Map<number, Session[]>();
  for (const s of sessions) {
    const g = groups.get(s.dayOffset);
    if (g) g.push(s);
    else groups.set(s.dayOffset, [s]);
  }
  return [...groups.entries()].sort((a, b) => a[0] - b[0]);
};
