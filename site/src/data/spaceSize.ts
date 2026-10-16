import type { Lang } from '../lib/url.ts';

/** How many people a studio holds, on the studio-rental page: the line on
 *  each card and the filter above them. The first thing anyone renting a
 *  room needs to know is whether their group fits, so it sits on the
 *  picture and under the name rather than in the copy.
 *
 *  '{n}' stands for the number. */
export const spaceSizeCopy: Record<Lang, {
  filterLabel: string;
  any: string;
  from: string;
  upTo: string;
  onRequest: string;
  label: string;
  unknownNote: string;
  none: string;
}> = {
  en: {
    filterLabel: 'How many people?',
    any: 'Any size',
    from: '{n}+',
    upTo: 'Up to {n} people',
    onRequest: 'Group size on request',
    label: 'People',
    unknownNote: 'Rooms without a stated size stay in the list: ask us and we check with the host.',
    none: 'No room fits that group yet. Send us a request and we look for one.',
  },
  de: {
    filterLabel: 'Wie viele Personen?',
    any: 'Alle Größen',
    from: 'ab {n}',
    upTo: 'Bis {n} Personen',
    onRequest: 'Gruppengröße auf Anfrage',
    label: 'Personen',
    unknownNote: 'Räume ohne Angabe bleiben in der Liste: Frag uns, wir klären es mit dem Host.',
    none: 'Noch kein Raum passt für diese Gruppe. Schick uns eine Anfrage, wir suchen einen.',
  },
  fr: {
    filterLabel: 'Combien de personnes ?',
    any: 'Toutes tailles',
    from: '{n}+',
    upTo: 'Jusqu’à {n} personnes',
    onRequest: 'Capacité sur demande',
    label: 'Personnes',
    unknownNote: 'Les lieux sans capacité indiquée restent dans la liste : demandez-nous, nous vérifions avec l’hôte.',
    none: 'Aucun lieu ne convient encore à ce groupe. Envoyez-nous une demande, nous en cherchons un.',
  },
  es: {
    filterLabel: '¿Cuántas personas?',
    any: 'Cualquier tamaño',
    from: '{n}+',
    upTo: 'Hasta {n} personas',
    onRequest: 'Capacidad a consultar',
    label: 'Personas',
    unknownNote: 'Los espacios sin capacidad indicada siguen en la lista: pregúntanos y lo consultamos con el anfitrión.',
    none: 'Aún no hay ningún espacio para ese grupo. Envíanos una solicitud y buscamos uno.',
  },
  it: {
    filterLabel: 'Quante persone?',
    any: 'Qualsiasi dimensione',
    from: '{n}+',
    upTo: 'Fino a {n} persone',
    onRequest: 'Capienza su richiesta',
    label: 'Persone',
    unknownNote: 'Gli spazi senza capienza indicata restano in elenco: chiedici e verifichiamo con l’host.',
    none: 'Ancora nessuno spazio per questo gruppo. Mandaci una richiesta e ne cerchiamo uno.',
  },
  nl: {
    filterLabel: 'Met hoeveel mensen?',
    any: 'Elke grootte',
    from: '{n}+',
    upTo: 'Tot {n} personen',
    onRequest: 'Groepsgrootte op aanvraag',
    label: 'Personen',
    unknownNote: 'Ruimtes zonder opgegeven grootte blijven in de lijst: vraag het ons, wij checken het bij de host.',
    none: 'Nog geen ruimte past bij die groep. Stuur ons een aanvraag, dan zoeken wij er een.',
  },
  pl: {
    filterLabel: 'Ile osób?',
    any: 'Dowolna wielkość',
    from: '{n}+',
    upTo: 'Do {n} osób',
    onRequest: 'Liczba osób na zapytanie',
    label: 'Osoby',
    unknownNote: 'Miejsca bez podanej pojemności zostają na liście: zapytaj nas, sprawdzimy u gospodarza.',
    none: 'Żadne miejsce nie pasuje jeszcze do tej grupy. Wyślij nam zapytanie, poszukamy.',
  },
  tr: {
    filterLabel: 'Kaç kişi?',
    any: 'Her boyut',
    from: '{n}+',
    upTo: '{n} kişiye kadar',
    onRequest: 'Kapasite talep üzerine',
    label: 'Kişi',
    unknownNote: 'Kapasitesi belirtilmeyen mekânlar listede kalır: bize sorun, ev sahibiyle kontrol edelim.',
    none: 'Bu grup için henüz uygun mekân yok. Bize bir talep gönderin, biz arayalım.',
  },
};

/** The sizes the filter offers, as minimum head counts. */
export const spaceSizeSteps = [5, 10, 15, 20, 30] as const;
