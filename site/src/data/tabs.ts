import type { Lang } from '../lib/url.ts';

/** The phone's bottom tab bar (MobileTabs.astro): short labels, since five
 *  tabs share 390px. The longer page names live on in the More sheet. */
export interface TabsCopy {
  home: string;
  workshops: string;
  calendar: string;
  teams: string;
  more: string;
  close: string;
}

export const tabsCopy: Record<Lang, TabsCopy> = {
  en: { home: 'Home', workshops: 'Workshops', calendar: 'Calendar', teams: 'Teams', more: 'More', close: 'Close' },
  de: { home: 'Start', workshops: 'Workshops', calendar: 'Kalender', teams: 'Teams', more: 'Mehr', close: 'Schließen' },
  fr: { home: 'Accueil', workshops: 'Ateliers', calendar: 'Agenda', teams: 'Équipes', more: 'Plus', close: 'Fermer' },
  es: { home: 'Inicio', workshops: 'Talleres', calendar: 'Agenda', teams: 'Equipos', more: 'Más', close: 'Cerrar' },
  it: { home: 'Home', workshops: 'Workshop', calendar: 'Calendario', teams: 'Team', more: 'Altro', close: 'Chiudi' },
  nl: { home: 'Home', workshops: 'Workshops', calendar: 'Agenda', teams: 'Teams', more: 'Meer', close: 'Sluiten' },
  pl: { home: 'Start', workshops: 'Warsztaty', calendar: 'Kalendarz', teams: 'Zespoły', more: 'Więcej', close: 'Zamknij' },
  tr: { home: 'Ana sayfa', workshops: 'Atölyeler', calendar: 'Takvim', teams: 'Ekipler', more: 'Daha fazla', close: 'Kapat' },
};
