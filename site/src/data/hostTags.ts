import type { Lang } from '../lib/url.ts';

/** Small, quiet facts about a host that a group may be looking for, shown
 *  as a pill on their host page and their group-bookings card. */
export const hostTags: Record<string, Record<Lang, string>[]> = {
  // Celina, added 14 Oct 2026 (she is planning a mosaic workshop for a
  // deaf group signing in DGS, with interpreters).
  celina: [{
    en: 'Accessibility experience',
    de: 'Erfahrung mit Barrierefreiheit',
    fr: 'Expérience en accessibilité',
    es: 'Experiencia en accesibilidad',
    it: 'Esperienza con l’accessibilità',
    nl: 'Ervaring met toegankelijkheid',
    pl: 'Doświadczenie w dostępności',
    tr: 'Erişilebilirlik deneyimi',
  }],
};

export const tagsFor = (slug: string, lang: Lang): string[] => (hostTags[slug] ?? []).map((t) => t[lang]);
