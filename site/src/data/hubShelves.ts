import type { Lang } from '../lib/url.ts';

/** The workshops index (WorkshopsHub.astro): the handwritten half of its
 *  title, the featured host beside it, and the rows of reels under it. */
export interface HubShelvesCopy {
  hand: string;
  pick: string;
  seeDates: string;
  seeAll: (n: number) => string;
  onRequest: string;
  jump: string;
}

export const hubShelvesCopy: Record<Lang, HubShelvesCopy> = {
  en: { hand: 'made by hand', pick: 'This week’s pick', seeDates: 'See all dates', seeAll: (n) => `See all ${n}`, onRequest: 'On request', jump: 'Jump to an activity' },
  de: { hand: 'mit den Händen gemacht', pick: 'Tipp der Woche', seeDates: 'Alle Termine ansehen', seeAll: (n) => `Alle ${n} ansehen`, onRequest: 'Auf Anfrage', jump: 'Zu einer Aktivität springen' },
  fr: { hand: 'faits main', pick: 'Coup de cœur de la semaine', seeDates: 'Voir toutes les dates', seeAll: (n) => `Voir les ${n}`, onRequest: 'Sur demande', jump: 'Aller à une activité' },
  es: { hand: 'hechos a mano', pick: 'Recomendado de la semana', seeDates: 'Ver todas las fechas', seeAll: (n) => `Ver los ${n}`, onRequest: 'Bajo petición', jump: 'Ir a una actividad' },
  it: { hand: 'fatti a mano', pick: 'Scelta della settimana', seeDates: 'Vedi tutte le date', seeAll: (n) => `Vedi tutti i ${n}`, onRequest: 'Su richiesta', jump: 'Vai a un’attività' },
  nl: { hand: 'met de hand gemaakt', pick: 'Tip van de week', seeDates: 'Bekijk alle data', seeAll: (n) => `Bekijk alle ${n}`, onRequest: 'Op aanvraag', jump: 'Ga naar een activiteit' },
  pl: { hand: 'robione ręcznie', pick: 'Wybór tygodnia', seeDates: 'Zobacz wszystkie terminy', seeAll: (n) => `Zobacz wszystkie (${n})`, onRequest: 'Na zapytanie', jump: 'Przejdź do aktywności' },
  tr: { hand: 'el yapımı', pick: 'Haftanın seçimi', seeDates: 'Tüm tarihleri gör', seeAll: (n) => `${n} tanesini gör`, onRequest: 'Talep üzerine', jump: 'Bir etkinliğe git' },
};

/** The host featured at the top of the workshops page, by slug. Left
 *  unset, the page picks whoever with a reel has the most dates in the
 *  coming week, so the pick changes by itself with every build. */
export const HUB_PICK: string | undefined = undefined;
