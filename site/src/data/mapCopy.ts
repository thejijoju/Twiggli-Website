import type { Lang } from '../lib/url.ts';

/** The calendar map's words: its controls (DayMap.astro) and the button
 *  that opens it beside grid and list (DayPicker.astro). */
export const mapCopy: Record<Lang, {
  map: string; expand: string; collapse: string; close: string; online: string;
  showOne: string; showMany: string; label: string;
}> = {
  en: { map: 'Map', expand: 'Expand map', collapse: 'Collapse map', close: 'Close map', online: 'Online', showOne: 'Show 1 workshop', showMany: 'Show {n} workshops', label: 'Map of the day’s workshops by neighbourhood' },
  de: { map: 'Karte', expand: 'Karte vergrößern', collapse: 'Karte verkleinern', close: 'Karte schließen', online: 'Online', showOne: '1 Workshop anzeigen', showMany: '{n} Workshops anzeigen', label: 'Karte der Workshops des Tages nach Kiez' },
  fr: { map: 'Carte', expand: 'Agrandir la carte', collapse: 'Réduire la carte', close: 'Fermer la carte', online: 'En ligne', showOne: 'Voir 1 atelier', showMany: 'Voir {n} ateliers', label: 'Carte des ateliers du jour par quartier' },
  es: { map: 'Mapa', expand: 'Ampliar mapa', collapse: 'Reducir mapa', close: 'Cerrar mapa', online: 'Online', showOne: 'Ver 1 taller', showMany: 'Ver {n} talleres', label: 'Mapa de los talleres del día por barrio' },
  it: { map: 'Mappa', expand: 'Espandi mappa', collapse: 'Riduci mappa', close: 'Chiudi mappa', online: 'Online', showOne: 'Mostra 1 workshop', showMany: 'Mostra {n} workshop', label: 'Mappa dei workshop del giorno per quartiere' },
  nl: { map: 'Kaart', expand: 'Kaart vergroten', collapse: 'Kaart verkleinen', close: 'Kaart sluiten', online: 'Online', showOne: 'Toon 1 workshop', showMany: 'Toon {n} workshops', label: 'Kaart van de workshops van de dag per wijk' },
  pl: { map: 'Mapa', expand: 'Powiększ mapę', collapse: 'Zmniejsz mapę', close: 'Zamknij mapę', online: 'Online', showOne: 'Pokaż 1 warsztat', showMany: 'Pokaż warsztaty ({n})', label: 'Mapa dzisiejszych warsztatów według dzielnic' },
  tr: { map: 'Harita', expand: 'Haritayı büyüt', collapse: 'Haritayı küçült', close: 'Haritayı kapat', online: 'Online', showOne: '1 atölyeyi göster', showMany: '{n} atölyeyi göster', label: 'Günün atölyelerinin semtlere göre haritası' },
};
