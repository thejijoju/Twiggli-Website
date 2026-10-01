/** What a group books us for — the tags above the group-bookings directory —
 *  and the seasonal headline that leads it.
 *
 *  A host suits an occasion by rule rather than by hand-picked list, so a new
 *  host lands under the right tags without anyone remembering to add them.
 *  The rules read only the language-neutral facets (activity and group
 *  size), and they are deliberately broad: a tag narrows the directory to
 *  hosts who can plausibly take that group, and the search and the other
 *  filters do the rest.
 */

import type { Lang } from '../lib/url.ts';
import type { ActivityKey } from './content.ts';

export type OccasionKey = 'teamevent' | 'christmas' | 'hen' | 'birthday' | 'outing';

type Facets = { activity: ActivityKey; groupRange: [number, number] };

export const occasionRules: Record<OccasionKey, (h: Facets) => boolean> = {
  // A team is ten people or more.
  teamevent: (h) => h.groupRange[1] >= 10,
  // Something to make together and take home, for a team-sized group.
  christmas: (h) => h.groupRange[1] >= 8 && ['food', 'craft', 'ceramics', 'art'].includes(h.activity),
  // A hen or stag party: a group of friends doing something hands-on.
  hen: (h) => h.groupRange[1] >= 6 && h.activity !== 'wellbeing',
  birthday: (h) => h.groupRange[1] >= 6,
  // A whole department out for the day.
  outing: (h) => h.groupRange[1] >= 15,
};

export const occasionsFor = (h: Facets): OccasionKey[] =>
  (Object.keys(occasionRules) as OccasionKey[]).filter((k) => occasionRules[k](h));

/** The season the build falls in. The site rebuilds daily, so the headline
 *  turns over with the calendar: Christmas parties from October, team
 *  kick-offs after New Year, hen and stag parties in spring, outings in
 *  summer. */
export type Season = 'christmas' | 'kickoff' | 'spring' | 'summer';
export const seasonOf = (date = new Date()): Season => {
  const m = date.getUTCMonth();
  return m >= 9 ? 'christmas' : m <= 2 ? 'kickoff' : m <= 5 ? 'spring' : 'summer';
};
/** Which tag a season puts first. */
export const seasonOccasion: Record<Season, OccasionKey> = {
  christmas: 'christmas', kickoff: 'teamevent', spring: 'hen', summer: 'outing',
};

type DirectoryCopy = {
  search: string;
  placeholder: string;
  occasionsLabel: string;
  occasions: Record<OccasionKey, string>;
  seasons: Record<Season, { title: string; sub: string }>;
  close: string;
};

export const directoryCopy: Record<Lang, DirectoryCopy> = {
  en: {
    search: 'Search', placeholder: 'Search for a workshop, a craft or a district',
    occasionsLabel: 'Occasion',
    occasions: { teamevent: 'Team event', christmas: 'Christmas party', hen: 'Hen & stag party', birthday: 'Birthday', outing: 'Company outing' },
    seasons: {
      christmas: { title: 'Christmas party season', sub: 'Hands-on workshops for the team’s Christmas party — book before the December dates go.' },
      kickoff: { title: 'Team kick-offs for the new year', sub: 'Start the year making something together — private workshops for teams of every size.' },
      spring: { title: 'Hen & stag party season', sub: 'Something to make together before the big day — private workshops for the whole group.' },
      summer: { title: 'Summer outings for the team', sub: 'Swap the office for a studio for an afternoon — private workshops across Berlin.' },
    },
    close: 'Close',
  },
  de: {
    search: 'Suchen', placeholder: 'Workshop, Handwerk oder Bezirk suchen',
    occasionsLabel: 'Anlass',
    occasions: { teamevent: 'Teamevent', christmas: 'Weihnachtsfeier', hen: 'JGA', birthday: 'Geburtstag', outing: 'Betriebsausflug' },
    seasons: {
      christmas: { title: 'Weihnachtsfeier-Saison', sub: 'Workshops zum Selbermachen für die Weihnachtsfeier eures Teams — jetzt buchen, bevor die Dezember-Termine weg sind.' },
      kickoff: { title: 'Teamevents zum Jahresstart', sub: 'Das Jahr mit etwas Selbstgemachtem beginnen — private Workshops für Teams jeder Größe.' },
      spring: { title: 'JGA-Saison', sub: 'Etwas gemeinsam machen vor dem großen Tag — private Workshops für die ganze Gruppe.' },
      summer: { title: 'Betriebsausflug & Sommerfest', sub: 'Einen Nachmittag lang Atelier statt Büro — private Workshops in ganz Berlin.' },
    },
    close: 'Schließen',
  },
  fr: {
    search: 'Rechercher', placeholder: 'Rechercher un atelier, un savoir-faire ou un quartier',
    occasionsLabel: 'Occasion',
    occasions: { teamevent: 'Team building', christmas: 'Fête de Noël', hen: 'EVJF & EVG', birthday: 'Anniversaire', outing: 'Sortie d’entreprise' },
    seasons: {
      christmas: { title: 'La saison des fêtes de Noël', sub: 'Des ateliers à faire soi-même pour la fête de Noël de l’équipe — réservez avant que les dates de décembre partent.' },
      kickoff: { title: 'Lancer l’année en équipe', sub: 'Commencez l’année en créant ensemble — des ateliers privés pour les équipes de toutes tailles.' },
      spring: { title: 'La saison des EVJF et EVG', sub: 'Créer quelque chose ensemble avant le grand jour — des ateliers privés pour tout le groupe.' },
      summer: { title: 'Sorties d’été en équipe', sub: 'Troquez le bureau contre un atelier le temps d’un après-midi — des ateliers privés dans tout Berlin.' },
    },
    close: 'Fermer',
  },
  es: {
    search: 'Buscar', placeholder: 'Busca un taller, un oficio o un barrio',
    occasionsLabel: 'Ocasión',
    occasions: { teamevent: 'Team building', christmas: 'Fiesta de Navidad', hen: 'Despedida de soltero/a', birthday: 'Cumpleaños', outing: 'Salida de empresa' },
    seasons: {
      christmas: { title: 'Temporada de fiestas de Navidad', sub: 'Talleres prácticos para la fiesta de Navidad del equipo: reserva antes de que se agoten las fechas de diciembre.' },
      kickoff: { title: 'Eventos de equipo para empezar el año', sub: 'Empieza el año creando algo juntos: talleres privados para equipos de cualquier tamaño.' },
      spring: { title: 'Temporada de despedidas', sub: 'Algo que crear juntos antes del gran día: talleres privados para todo el grupo.' },
      summer: { title: 'Salidas de verano en equipo', sub: 'Cambia la oficina por un taller durante una tarde: talleres privados en todo Berlín.' },
    },
    close: 'Cerrar',
  },
  it: {
    search: 'Cerca', placeholder: 'Cerca un workshop, un mestiere o un quartiere',
    occasionsLabel: 'Occasione',
    occasions: { teamevent: 'Team building', christmas: 'Festa di Natale', hen: 'Addio al nubilato/celibato', birthday: 'Compleanno', outing: 'Gita aziendale' },
    seasons: {
      christmas: { title: 'Stagione delle feste di Natale', sub: 'Workshop pratici per la festa di Natale del team — prenota prima che finiscano le date di dicembre.' },
      kickoff: { title: 'Team event per iniziare l’anno', sub: 'Inizia l’anno creando qualcosa insieme — workshop privati per team di ogni dimensione.' },
      spring: { title: 'Stagione degli addii al nubilato', sub: 'Qualcosa da creare insieme prima del grande giorno — workshop privati per tutto il gruppo.' },
      summer: { title: 'Gite estive del team', sub: 'Un pomeriggio in studio invece che in ufficio — workshop privati in tutta Berlino.' },
    },
    close: 'Chiudi',
  },
  nl: {
    search: 'Zoeken', placeholder: 'Zoek een workshop, ambacht of wijk',
    occasionsLabel: 'Gelegenheid',
    occasions: { teamevent: 'Teamuitje', christmas: 'Kerstborrel', hen: 'Vrijgezellenfeest', birthday: 'Verjaardag', outing: 'Bedrijfsuitje' },
    seasons: {
      christmas: { title: 'Kerstborrelseizoen', sub: 'Workshops om zelf te maken voor de kerstborrel van het team — boek voordat de decemberdata vol zijn.' },
      kickoff: { title: 'Teamuitjes voor de start van het jaar', sub: 'Begin het jaar met samen iets maken — privéworkshops voor teams van elke grootte.' },
      spring: { title: 'Vrijgezellenseizoen', sub: 'Samen iets maken voor de grote dag — privéworkshops voor de hele groep.' },
      summer: { title: 'Zomeruitjes voor het team', sub: 'Een middag het atelier in in plaats van het kantoor — privéworkshops in heel Berlijn.' },
    },
    close: 'Sluiten',
  },
  pl: {
    search: 'Szukaj', placeholder: 'Szukaj warsztatu, rzemiosła lub dzielnicy',
    occasionsLabel: 'Okazja',
    occasions: { teamevent: 'Integracja', christmas: 'Wigilia firmowa', hen: 'Wieczór panieński/kawalerski', birthday: 'Urodziny', outing: 'Wyjazd firmowy' },
    seasons: {
      christmas: { title: 'Sezon wigilii firmowych', sub: 'Warsztaty dla zespołu na firmową wigilię — zarezerwuj, zanim znikną grudniowe terminy.' },
      kickoff: { title: 'Integracje na początek roku', sub: 'Zacznij rok, tworząc coś razem — prywatne warsztaty dla zespołów każdej wielkości.' },
      spring: { title: 'Sezon wieczorów panieńskich i kawalerskich', sub: 'Coś do zrobienia razem przed wielkim dniem — prywatne warsztaty dla całej grupy.' },
      summer: { title: 'Letnie wyjazdy firmowe', sub: 'Na jedno popołudnie zamień biuro na pracownię — prywatne warsztaty w całym Berlinie.' },
    },
    close: 'Zamknij',
  },
  tr: {
    search: 'Ara', placeholder: 'Atölye, zanaat ya da semt ara',
    occasionsLabel: 'Etkinlik',
    occasions: { teamevent: 'Takım etkinliği', christmas: 'Yılbaşı partisi', hen: 'Bekarlığa veda', birthday: 'Doğum günü', outing: 'Şirket gezisi' },
    seasons: {
      christmas: { title: 'Yılbaşı partisi sezonu', sub: 'Ekibin yılbaşı partisi için uygulamalı atölyeler — aralık tarihleri dolmadan rezervasyon yap.' },
      kickoff: { title: 'Yeni yıla takım etkinliğiyle başla', sub: 'Yıla birlikte bir şey üreterek başlayın — her büyüklükte ekip için özel atölyeler.' },
      spring: { title: 'Bekarlığa veda sezonu', sub: 'Büyük günden önce birlikte bir şey yapın — tüm grup için özel atölyeler.' },
      summer: { title: 'Ekip için yaz gezileri', sub: 'Bir öğleden sonra ofis yerine atölye — Berlin’in her yerinde özel atölyeler.' },
    },
    close: 'Kapat',
  },
};
