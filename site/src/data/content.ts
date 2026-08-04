/** Page content. Copy here is verbatim from the Claude Design export;
 *  anything marked PLACEHOLDER is filler awaiting real content. */

export type Step = { num: string; title: string; copy: string };

export const steps: Step[] = [
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
];

export type Host = {
  id: number;
  name: string;
  specialty: string;
  /** Path under /public, e.g. '/img/hosts/anna.jpg'. Empty renders the
   *  placeholder slot from the design. */
  photo?: string;
};

/** PLACEHOLDER — the design shipped 17 unnamed slots. Replace name,
 *  specialty and photo per host; the grid sizes itself to the list length. */
export const hosts: Host[] = Array.from({ length: 17 }, (_, i) => ({
  id: i + 1,
  name: 'Host name',
  specialty: 'Workshop type',
}));

/** The two sample cards inside the phone mockup. */
export const phoneCards = [
  { id: 'phone-front-1', title: 'Bachata lessons', meta: 'Mon, Oct 16 · 5 km away' },
  { id: 'phone-front-2', title: 'Bouldering course', meta: 'Mon, Oct 16 · 2 km away' },
];

export const phoneFilters = ['All', 'Today', 'Tomorrow', 'Free', 'Paid'];
