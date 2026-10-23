/** Dates a host has sent us themselves — by email, say — that the weekly
 *  feed does not pick up from their site. Laid over the feed when the site
 *  is built (sessions.ts); where the feed later finds the same date and
 *  start time, the feed's own entry wins and this one is dropped.
 *
 *  `onHostSite`: the date can be booked on the host's own website, so a
 *  partner host's discount link applies (partners.ts). Without it the card
 *  keeps the usual booking request form. */
export interface HostDate {
  slug: string;
  title: string;
  titleEn?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  duration?: string;
  price?: string;
  spots?: number;
  district?: string;
  /** The host's booking page for it. */
  url: string;
  onHostSite?: boolean;
}

export const hostDates: HostDate[] = [
  // Qian's dates now come straight from her Acuity account in the feed.
  // Anna Malerlebnisse (Antje) sends her dates by email (call of 22.10.26):
  // a public session every 4–6 weeks at the Begegnungsstätte Mehr Mitte,
  // Torstraße 190, €35 per person, booked on her own site.
  { slug: 'anna-malerlebnisse', title: 'Malerlebnis: Malen mit persönlicher Anleitung',
    titleEn: 'Malerlebnis: painting with personal guidance',
    date: '2026-11-14', time: '14:00', duration: '2 h', price: '€35', district: 'Mitte',
    url: 'https://malerlebnisse-anna.de/termine/anna-malerlebnis/?date=2026-11-14', onHostSite: true },

  // ── Preview hosts (hosts/preview.ts) ──────────────────────────────────
  // Read from each host's own site or booking calendar. getSessions leaves
  // preview hosts out, so these show only on the host's hidden page until
  // the host goes live.
  // RtmiS (preview): rtmis.net/workshops, read 23.10.26. Each date can be
  // booked for the terrazzo object or the marble-effect tray, €79 each.
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-10-30', time: '18:00', duration: '2.5 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-11-13', time: '18:00', duration: '2.5 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-11-20', time: '18:00', duration: '2.5 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-11-27', time: '18:00', duration: '2.5 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-12-04', time: '18:00', duration: '2.5 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-12-11', time: '18:00', duration: '2.5 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-12-18', time: '18:00', duration: '2.5 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-11-01', time: '12:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-11-14', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-11-15', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-11-21', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-11-22', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-11-28', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-11-29', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-12-05', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-12-06', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-12-12', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-12-13', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-12-19', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },
  { slug: 'rtmis', title: 'Terrazzo-Objekt oder Marmoreffekt-Tablett', titleEn: 'Terrazzo object or marble-effect tray', date: '2026-12-20', time: '11:00', duration: '3 h', price: '€79', district: 'Wedding', url: 'https://www.rtmis.net/workshops', onHostSite: true },

  // Beavis Bar (preview): their Konfetti calendar, read 23.10.26.
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-10-29', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-10-30', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-10-31', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-11-05', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-11-06', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-11-07', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-11-12', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-11-13', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-11-14', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-11-20', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-11-21', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-11-26', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-11-27', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-11-28', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-12-03', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-12-04', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-12-05', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-12-10', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-12-11', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-12-12', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-12-17', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-12-18', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },
  { slug: 'beavis-bar', title: 'Whisky-Tasting: 5–6 Craft-Raritäten', titleEn: 'Whisky tasting: 5–6 craft rarities', date: '2026-12-19', time: '19:00', duration: '1.5 h', price: '€99', district: 'Mitte', url: 'https://beavis.bar/' },

  // Waldsamkeit (preview): waldsamkeit.de, read 23.10.26 — start times
  // are given when booking.
  { slug: 'waldsamkeit', title: 'Wildkräuter-Spaziergang (Park Jungfernheide)', titleEn: 'Wild herb walk (Park Jungfernheide)', date: '2026-10-24', duration: '3 h', price: '€49', district: 'Charlottenburg-Nord', url: 'https://waldsamkeit.de/produkt/wildkraeuterwanderung-berlin/', onHostSite: true },
  { slug: 'waldsamkeit', title: 'Wildkräuter-Spaziergang (Treptower Park)', titleEn: 'Wild herb walk (Treptower Park)', date: '2026-11-07', duration: '3 h', price: '€49', district: 'Treptow', url: 'https://waldsamkeit.de/produkt/wildkraeuterwanderung-berlin/', onHostSite: true },

  // ZÖNOTÉKA (preview): their Konfetti calendar, read 23.10.26.
  { slug: 'zoenoteka', title: 'Amezaiku: Lollis aus japanischer Zuckerkunst', titleEn: 'Amezaiku: Japanese sugar-art lollipops', date: '2026-11-07', time: '09:00', duration: '3.5 h', price: '€60', district: 'Neukölln', url: 'https://zoenoteka.gokonfetti.com/de-de/p/zonoteka-w298kx/' },
  { slug: 'zoenoteka', title: 'MIG/MAG-Schweißen: Metall-Lampenschirm bauen', titleEn: 'MIG/MAG welding: build a metal lampshade', date: '2026-11-21', time: '10:00', duration: '5 h', price: '€150', district: 'Neukölln', url: 'https://zoenoteka.gokonfetti.com/de-de/p/zonoteka-w298kx/' },

  // Hobbytischlerei (preview): their Konfetti calendar, read 23.10.26.
  { slug: 'hobbytischlerei', title: 'Hirnholz-Schneidebrett aus edlen Hölzern', titleEn: 'End-grain cutting board from fine woods', date: '2026-10-31', time: '09:00', duration: '5 h', price: '€199', district: 'Kaulsdorf', url: 'https://www.hobbytischlerei.de/kurse' },
  { slug: 'hobbytischlerei', title: 'Hirnholz-Schneidebrett aus edlen Hölzern', titleEn: 'End-grain cutting board from fine woods', date: '2026-11-13', time: '09:00', duration: '5 h', price: '€199', district: 'Kaulsdorf', url: 'https://www.hobbytischlerei.de/kurse' },
  { slug: 'hobbytischlerei', title: 'Hirnholz-Schneidebrett aus edlen Hölzern', titleEn: 'End-grain cutting board from fine woods', date: '2026-11-14', time: '09:00', duration: '5 h', price: '€199', district: 'Kaulsdorf', url: 'https://www.hobbytischlerei.de/kurse' },
  { slug: 'hobbytischlerei', title: 'Hirnholz-Schneidebrett aus edlen Hölzern', titleEn: 'End-grain cutting board from fine woods', date: '2026-12-04', time: '09:00', duration: '5 h', price: '€199', district: 'Kaulsdorf', url: 'https://www.hobbytischlerei.de/kurse' },
  { slug: 'hobbytischlerei', title: 'Hirnholz-Schneidebrett aus edlen Hölzern', titleEn: 'End-grain cutting board from fine woods', date: '2026-12-05', time: '09:00', duration: '5 h', price: '€199', district: 'Kaulsdorf', url: 'https://www.hobbytischlerei.de/kurse' },
  { slug: 'hobbytischlerei', title: 'Zinkungen von Hand', titleEn: 'Dovetail joints by hand', date: '2026-11-06', time: '09:00', duration: '6 h', price: '€149', district: 'Kaulsdorf', url: 'https://www.hobbytischlerei.de/kurse' },

  // Yahelis (preview): her Konfetti calendar, read 23.10.26.
  { slug: 'yahelis', title: 'Schokolade temperieren: Pralinen & Trüffel', titleEn: 'Chocolate tempering: pralines & truffles', date: '2026-11-03', time: '17:00', duration: '4 h', price: '€85', district: 'Friedrichshain', url: 'https://www.yahelis.com/' },
  { slug: 'yahelis', title: 'Schokolade temperieren: Pralinen & Trüffel', titleEn: 'Chocolate tempering: pralines & truffles', date: '2026-11-18', time: '17:00', duration: '4 h', price: '€85', district: 'Friedrichshain', url: 'https://www.yahelis.com/' },
  { slug: 'yahelis', title: 'Macaron- und Schokoladen-Workshop', titleEn: 'Macaron & chocolate workshop', date: '2026-11-04', time: '17:00', duration: '4 h', price: '€85', district: 'Friedrichshain', url: 'https://www.yahelis.com/' },
  { slug: 'yahelis', title: 'Macaron-Workshop', titleEn: 'Macaron workshop', date: '2026-11-10', time: '13:00', duration: '4 h', price: '€75', district: 'Friedrichshain', url: 'https://www.yahelis.com/' },

  // Groove in Focus (preview): their Konfetti calendar, read 23.10.26.
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2026-10-26', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2026-11-02', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2026-11-09', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2026-11-16', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2026-11-23', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2026-11-30', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2026-12-07', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2026-12-14', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2026-12-21', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2026-12-28', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2027-01-04', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2027-01-11', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2027-01-18', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },
  { slug: 'groove-in-focus', title: 'Hip-Hop für Erwachsene: Tanz dich frei', titleEn: 'Hip-hop for adults: dance yourself free', date: '2027-01-25', time: '20:00', duration: '1 h', price: '€20', district: 'Neukölln', url: 'https://grooveinfocus.com/stundenplan' },

  // Concreare (preview): her Konfetti calendar, read 23.10.26.
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-10-28', time: '17:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-04', time: '17:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-07', time: '12:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-07', time: '15:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-11', time: '17:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-14', time: '12:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-14', time: '15:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-18', time: '17:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-21', time: '12:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-21', time: '15:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-25', time: '17:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-28', time: '12:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-11-28', time: '15:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-02', time: '17:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-05', time: '12:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-05', time: '15:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-09', time: '17:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-12', time: '12:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-12', time: '15:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-16', time: '17:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-19', time: '12:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-19', time: '15:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-23', time: '17:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-26', time: '12:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-26', time: '15:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Töpferkurs ohne Drehscheibe', titleEn: 'Handbuilding pottery class (no wheel)', date: '2026-12-30', time: '17:00', duration: '2 h', price: '€55', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-03', time: '18:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-07', time: '12:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-07', time: '15:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-10', time: '18:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-14', time: '12:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-14', time: '15:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-17', time: '18:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-21', time: '12:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-21', time: '15:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-24', time: '18:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-28', time: '12:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-11-28', time: '15:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-01', time: '18:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-05', time: '12:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-05', time: '15:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-08', time: '18:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-12', time: '12:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-12', time: '15:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-15', time: '18:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-19', time: '12:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-19', time: '15:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-22', time: '18:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-26', time: '12:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-26', time: '15:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },
  { slug: 'concreare', title: 'Keramik bemalen', titleEn: 'Ceramic painting', date: '2026-12-29', time: '18:00', duration: '2 h', price: '€42', district: 'Charlottenburg', url: 'https://www.concreare.de/' },

  // Atelier Sinn (preview): atelier.korasinn.de, read 23.10.26.
  { slug: 'atelier-sinn', title: 'Naturkosmetik: Your Divine Glow', titleEn: 'Natural cosmetics: Your Divine Glow', date: '2026-11-13', time: '18:30', duration: '3 h', price: '€59', district: 'Prenzlauer Berg', url: 'https://www.atelier.korasinn.de/experiences', onHostSite: true },
  { slug: 'atelier-sinn', title: 'Naturkosmetik: Your Divine Glow', titleEn: 'Natural cosmetics: Your Divine Glow', date: '2026-11-28', time: '15:00', duration: '3 h', price: '€59', district: 'Prenzlauer Berg', url: 'https://www.atelier.korasinn.de/experiences', onHostSite: true },
  { slug: 'atelier-sinn', title: 'Naturkosmetik: Your Divine Glow', titleEn: 'Natural cosmetics: Your Divine Glow', date: '2026-12-19', time: '15:00', duration: '3 h', price: '€59', district: 'Prenzlauer Berg', url: 'https://www.atelier.korasinn.de/experiences', onHostSite: true },
  { slug: 'atelier-sinn', title: 'Weihnachtsworkshop: Festliches Tablescaping', titleEn: 'Christmas workshop: festive tablescaping', date: '2026-11-20', time: '18:00', duration: '3 h', price: '€59', district: 'Prenzlauer Berg', url: 'https://www.atelier.korasinn.de/experiences', onHostSite: true },
  { slug: 'atelier-sinn', title: 'Weihnachtsworkshop: Festliches Tablescaping', titleEn: 'Christmas workshop: festive tablescaping', date: '2026-11-29', time: '15:00', duration: '3 h', price: '€59', district: 'Prenzlauer Berg', url: 'https://www.atelier.korasinn.de/experiences', onHostSite: true },
  { slug: 'atelier-sinn', title: 'Weihnachtsworkshop: Festliches Tablescaping', titleEn: 'Christmas workshop: festive tablescaping', date: '2026-12-05', time: '15:00', duration: '3 h', price: '€59', district: 'Prenzlauer Berg', url: 'https://www.atelier.korasinn.de/experiences', onHostSite: true },
  { slug: 'atelier-sinn', title: 'Weihnachtsworkshop: Festliches Tablescaping', titleEn: 'Christmas workshop: festive tablescaping', date: '2026-12-17', time: '18:00', duration: '3 h', price: '€59', district: 'Prenzlauer Berg', url: 'https://www.atelier.korasinn.de/experiences', onHostSite: true },
];
