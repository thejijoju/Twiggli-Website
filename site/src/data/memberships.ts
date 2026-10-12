import type { Lang } from '../lib/url.ts';

/** Studios whose memberships we advertise: one tile in the calendar, just
 *  before the host's own card, on each day they teach (at most once a
 *  day), hidden with that card when the filters hide it. A tap opens our
 *  request form, so the enquiry reaches us like any booking. */
export interface MembershipPromo {
  /** The cheapest way in, shown as "from €15 / hour". */
  from: string;
  per: 'hour' | 'month';
  /** The tile's picture. */
  image: string;
  /** "Clay Garden", the name the studio goes by. */
  studio: string;
}

export const membershipPromos: Record<string, MembershipPromo> = {
  // Clay Garden: drop-in €15/hour, time card €150/month (4 visits), full
  // membership €250/month — claygarden.studio/membership, Oct 2026.
  qian: { from: '€15', per: 'hour', image: '/video/qian-poster.jpg', studio: 'Clay Garden' },
};

export const membershipCopy: Record<Lang, {
  kicker: string; title: string; blurb: string;
  from: (p: string) => string; hour: string; month: string; cta: string; formTitle: string;
}> = {
  en: { kicker: 'Membership', title: 'Your own place in a pottery studio', blurb: 'Wheels, clay and kiln, whenever you like.',
    from: (p) => `from ${p}`, hour: '/ hour', month: '/ month', cta: 'Enquire', formTitle: 'Studio membership' },
  de: { kicker: 'Mitgliedschaft', title: 'Dein eigener Platz im Töpferstudio', blurb: 'Drehscheiben, Ton und Brennofen, wann du willst.',
    from: (p) => `ab ${p}`, hour: '/ Std.', month: '/ Monat', cta: 'Anfragen', formTitle: 'Studio-Mitgliedschaft' },
  fr: { kicker: 'Abonnement', title: 'Votre place dans un atelier de poterie', blurb: 'Tours, argile et four, quand vous voulez.',
    from: (p) => `dès ${p}`, hour: '/ heure', month: '/ mois', cta: 'Se renseigner', formTitle: 'Abonnement à l’atelier' },
  es: { kicker: 'Membresía', title: 'Tu propio sitio en un taller de cerámica', blurb: 'Tornos, arcilla y horno, cuando quieras.',
    from: (p) => `desde ${p}`, hour: '/ hora', month: '/ mes', cta: 'Consultar', formTitle: 'Membresía del taller' },
  it: { kicker: 'Abbonamento', title: 'Il tuo posto in un laboratorio di ceramica', blurb: 'Torni, argilla e forno, quando vuoi.',
    from: (p) => `da ${p}`, hour: '/ ora', month: '/ mese', cta: 'Richiedi info', formTitle: 'Abbonamento allo studio' },
  nl: { kicker: 'Lidmaatschap', title: 'Je eigen plek in een keramiekstudio', blurb: 'Draaischijven, klei en oven, wanneer je wilt.',
    from: (p) => `vanaf ${p}`, hour: '/ uur', month: '/ maand', cta: 'Aanvragen', formTitle: 'Studiolidmaatschap' },
  pl: { kicker: 'Członkostwo', title: 'Twoje miejsce w pracowni ceramiki', blurb: 'Koła garncarskie, glina i piec, kiedy chcesz.',
    from: (p) => `od ${p}`, hour: '/ godz.', month: '/ mies.', cta: 'Zapytaj', formTitle: 'Członkostwo w pracowni' },
  tr: { kicker: 'Üyelik', title: 'Bir seramik atölyesinde kendi yerin', blurb: 'Çark, kil ve fırın, ne zaman istersen.',
    from: (p) => `${p}’den başlayan`, hour: '/ saat', month: '/ ay', cta: 'Bilgi al', formTitle: 'Atölye üyeliği' },
};
