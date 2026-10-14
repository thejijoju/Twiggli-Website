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

/** The occasion pages' day cards (HostDayCards.astro): one card per host
 *  per day, saying how many classes they run that day. */
export const hostDayCopy: Record<Lang, { classes: (n: number) => string; more: (n: number) => string }> = {
  en: { classes: (n) => (n === 1 ? '1 class' : `${n} classes`), more: (n) => `+ ${n} more ${n === 1 ? 'workshop' : 'workshops'}` },
  de: { classes: (n) => (n === 1 ? '1 Kurs' : `${n} Kurse`), more: (n) => `+ ${n} ${n === 1 ? 'weiterer Workshop' : 'weitere Workshops'}` },
  fr: { classes: (n) => (n === 1 ? '1 atelier' : `${n} ateliers`), more: (n) => `+ ${n} ${n === 1 ? 'autre atelier' : 'autres ateliers'}` },
  es: { classes: (n) => (n === 1 ? '1 taller' : `${n} talleres`), more: (n) => `+ ${n} ${n === 1 ? 'taller más' : 'talleres más'}` },
  it: { classes: (n) => (n === 1 ? '1 corso' : `${n} corsi`), more: (n) => `+ ${n} ${n === 1 ? 'altro workshop' : 'altri workshop'}` },
  nl: { classes: (n) => (n === 1 ? '1 workshop' : `${n} workshops`), more: (n) => `+ ${n} ${n === 1 ? 'andere workshop' : 'andere workshops'}` },
  pl: { classes: (n) => `Zajęcia: ${n}`, more: (n) => `+ ${n} więcej` },
  tr: { classes: (n) => `${n} atölye`, more: (n) => `+ ${n} atölye daha` },
};

/** The date lists in the Luma style (DayList.astro): "By" before the host,
 *  and the line that folds a host's other classes that day into one card. */
export const dayListCopy: Record<Lang, { by: string; moreTimes: (n: number) => string; moreWorkshops: (n: number) => string }> = {
  en: { by: 'By', moreTimes: (n) => `+ ${n} more ${n === 1 ? 'time' : 'times'} today`, moreWorkshops: (n) => `+ ${n} more ${n === 1 ? 'workshop' : 'workshops'} today` },
  de: { by: 'Von', moreTimes: (n) => `+ ${n} ${n === 1 ? 'weiterer Termin' : 'weitere Termine'} heute`, moreWorkshops: (n) => `+ ${n} ${n === 1 ? 'weiterer Workshop' : 'weitere Workshops'} heute` },
  fr: { by: 'Par', moreTimes: (n) => `+ ${n} ${n === 1 ? 'autre horaire' : 'autres horaires'} ce jour`, moreWorkshops: (n) => `+ ${n} ${n === 1 ? 'autre atelier' : 'autres ateliers'} ce jour` },
  es: { by: 'Con', moreTimes: (n) => `+ ${n} ${n === 1 ? 'horario más' : 'horarios más'} ese día`, moreWorkshops: (n) => `+ ${n} ${n === 1 ? 'taller más' : 'talleres más'} ese día` },
  it: { by: 'Con', moreTimes: (n) => `+ ${n} ${n === 1 ? 'altro orario' : 'altri orari'} quel giorno`, moreWorkshops: (n) => `+ ${n} ${n === 1 ? 'altro workshop' : 'altri workshop'} quel giorno` },
  nl: { by: 'Door', moreTimes: (n) => `+ ${n} ${n === 1 ? 'ander tijdstip' : 'andere tijden'} die dag`, moreWorkshops: (n) => `+ ${n} ${n === 1 ? 'andere workshop' : 'andere workshops'} die dag` },
  pl: { by: 'Prowadzi', moreTimes: (n) => `+ ${n} więcej terminów tego dnia`, moreWorkshops: (n) => `+ ${n} więcej warsztatów tego dnia` },
  tr: { by: 'Eğitmen:', moreTimes: (n) => `+ o gün ${n} saat daha`, moreWorkshops: (n) => `+ o gün ${n} atölye daha` },
};
