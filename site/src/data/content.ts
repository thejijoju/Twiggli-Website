/** Page content. Copy here is verbatim from the Claude Design export;
 *  anything marked PLACEHOLDER is filler awaiting real content. */

import { withBase, type Lang } from '../lib/url.ts';

export type Step = { num: string; title: string; copy: string };

const stepsCopy: Record<Lang, Step[]> = {
  en: [
    {
      num: '01',
      title: 'Browse videos',
      copy: 'Scroll real videos of workshops and activities happening near you, not staged photos.',
    },
    {
      num: '02',
      title: 'Book your spot',
      copy: 'Reserve a free or paid activity in a couple of taps, right from the app.',
    },
    {
      num: '03',
      title: 'Show up and enjoy',
      copy: 'Meet your host, learn something new, and meet people around Berlin.',
    },
  ],
  de: [
    {
      num: '01',
      title: 'Videos entdecken',
      copy: 'Scrolle durch echte Videos von Workshops und Aktivitäten in deiner Nähe — keine gestellten Fotos.',
    },
    {
      num: '02',
      title: 'Platz reservieren',
      copy: 'Reserviere eine kostenlose oder kostenpflichtige Aktivität in wenigen Taps, direkt in der App.',
    },
    {
      num: '03',
      title: 'Hingehen und genießen',
      copy: 'Triff deinen Gastgeber, lerne etwas Neues und lerne Leute in Berlin kennen.',
    },
  ],
};

export const getSteps = (lang: Lang): Step[] => stepsCopy[lang];

export type Host = {
  id: number;
  name: string;
  specialty: string;
  /** Path under /public, e.g. '/img/hosts/anna.jpg'. Empty renders the
   *  placeholder slot from the design. */
  photo?: string;
};

const hostPlaceholder: Record<Lang, { name: string; specialty: string }> = {
  en: { name: 'Host name', specialty: 'Workshop type' },
  de: { name: 'Name des Gastgebers', specialty: 'Workshop-Art' },
};

/** PLACEHOLDER — the design shipped 17 unnamed slots. Replace name,
 *  specialty and photo per host; the grid sizes itself to the list length. */
export const getHosts = (lang: Lang): Host[] =>
  Array.from({ length: 17 }, (_, i) => ({ id: i + 1, ...hostPlaceholder[lang] }));

const phoneCardsCopy = {
  en: [
    { id: 'phone-front-1', title: 'Bachata lessons', meta: 'Mon, Oct 16 · 5 km away', photo: '/img/hero/bachata.jpg' },
    { id: 'phone-front-2', title: 'Bouldering course', meta: 'Mon, Oct 16 · 2 km away', photo: '/img/hero/bouldering.jpg' },
    { id: 'phone-front-3', title: 'Cooking workshop', meta: 'Wed, Oct 18 · 3 km away', photo: '/img/hero/cooking.jpg' },
    { id: 'phone-front-4', title: 'Hiking meetup', meta: 'Sat, Oct 21 · 8 km away', photo: '/img/hero/hiking.jpg' },
  ],
  de: [
    { id: 'phone-front-1', title: 'Bachata-Kurs', meta: 'Mo., 16. Okt. · 5 km entfernt', photo: '/img/hero/bachata.jpg' },
    { id: 'phone-front-2', title: 'Boulderkurs', meta: 'Mo., 16. Okt. · 2 km entfernt', photo: '/img/hero/bouldering.jpg' },
    { id: 'phone-front-3', title: 'Kochworkshop', meta: 'Mi., 18. Okt. · 3 km entfernt', photo: '/img/hero/cooking.jpg' },
    { id: 'phone-front-4', title: 'Wander-Treffen', meta: 'Sa., 21. Okt. · 8 km entfernt', photo: '/img/hero/hiking.jpg' },
  ],
};

/** The sample cards inside the phone mockup. */
export const getPhoneCards = (lang: Lang) =>
  phoneCardsCopy[lang].map((card) => ({ ...card, photo: withBase(card.photo) }));

const phoneFiltersCopy: Record<Lang, string[]> = {
  en: ['All', 'Today', 'Tomorrow', 'Free', 'Paid'],
  de: ['Alle', 'Heute', 'Morgen', 'Kostenlos', 'Kostenpflichtig'],
};

export const getPhoneFilters = (lang: Lang): string[] => phoneFiltersCopy[lang];
