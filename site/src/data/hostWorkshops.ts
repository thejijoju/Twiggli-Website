/** One block per workshop, for hosts who run several distinct workshops with
 *  their own theme and price: each gets its own video or photo, its own
 *  text, its own price and its own request and gift buttons, so nobody
 *  mistakes one workshop's price for another's (Lucille, 09.11.26: "on ne
 *  comprend pas bien que ce sont 3 workshops distincts"). The blocks follow
 *  the order of the host's on-request list (hosts/preview.ts), which they
 *  also give their titles to. Languages without their own copy use English. */
import type { Lang } from '../lib/url.ts';

export type HostWorkshop = {
  title: string;
  text: string;
  facts: string;
  /** Per person, in euros. */
  price: number;
  video?: string;
  poster?: string;
  photo?: string;
};

type Copy = Partial<Record<Lang, HostWorkshop[]>> & { en: HostWorkshop[] };

const LUCILLE_MEDIA = [
  { video: '/video/lucille-guder.mp4', poster: '/video/lucille-guder-poster.jpg' },
  { video: '/video/lucille-guder-dots.mp4', poster: '/video/lucille-guder-dots-poster.jpg' },
  // No video of the flower crowns yet (asked 11.11.26): the crown-making
  // table, hands only (no faces, Jirel 11.11.26).
  { photo: '/img/hosts/lucille-guder-5.jpg' },
];

// Texts from lucilleguder.com (workshop pages, 11.11.26).
const lucille: Copy = {
  en: [
    { title: 'Self-photography & flower collage', price: 119,
      facts: '3.5 h · max. 4, women only · Ātma Self-Portrait Photo Studio, Reichenberger Str. 109, Kreuzberg',
      text: 'With Ātma Portrait: a workshop to make peace with your body. After a conversation about how we relate to our bodies, you photograph yourself, alone in the studio behind privacy curtains (you are the only one who sees your pictures). Then Lucille shows you an easy way to draw your body lines and turn them into a collage of dried flowers. You take home about 50 black-and-white photos and your own flower collage. No drawing experience needed, drinks and snacks included.' },
    { title: 'Painting class: the dots technique', price: 49,
      facts: '2.5 h · max. 4, women only · in her studio in Prenzlauer Berg',
      text: 'Lucille teaches her signature technique: thousands of small dots that together become a painting, inspired by the shapes of women’s bodies, or by a photo of your own. No experience needed, she guides you step by step. All materials are provided and you take your own painting home.' },
    { title: 'Flower crowns & group photo session', price: 50,
      facts: '2 h · at your venue (restaurant, hotel…) · for birthdays and hen parties',
      text: 'First an hour making your own crown from real flowers with Lucille, then an hour of self-portraits as a group, alone with the camera like in a photo booth, wearing your new crowns. All materials provided, no skills needed. Made for birthdays and hen parties.' },
  ],
  de: [
    { title: 'Selbstfotografie & Blumencollage', price: 119,
      facts: '3,5 Std. · max. 4, nur für Frauen · Ātma Self-Portrait Photo Studio, Reichenberger Str. 109, Kreuzberg',
      text: 'Mit Ātma Portrait: ein Workshop, um Frieden mit dem eigenen Körper zu schließen. Nach einem Gespräch darüber, wie wir zu unserem Körper stehen, fotografierst du dich selbst, allein im Studio hinter Vorhängen (nur du siehst deine Bilder). Danach zeigt dir Lucille eine einfache Technik, deine Körperlinien zu zeichnen und daraus eine Collage aus getrockneten Blumen zu machen. Du nimmst rund 50 Schwarz-Weiß-Fotos und deine eigene Blumencollage mit nach Hause. Keine Zeichenerfahrung nötig, Getränke und Snacks inklusive.' },
    { title: 'Malkurs: die Punkt-Technik', price: 49,
      facts: '2,5 Std. · max. 4, nur für Frauen · in ihrem Atelier in Prenzlauer Berg',
      text: 'Lucille zeigt dir ihre eigene Technik: Tausende kleine Punkte, die zusammen ein Bild ergeben, inspiriert von den Formen weiblicher Körper oder von einem Foto deines eigenen. Keine Vorkenntnisse nötig, sie begleitet dich Schritt für Schritt. Alle Materialien sind dabei, und dein Bild nimmst du mit nach Hause.' },
    { title: 'Blumenkränze & Gruppen-Fotosession', price: 50,
      facts: '2 Std. · bei euch (Restaurant, Hotel …) · für Geburtstage und JGAs',
      text: 'Erst eine Stunde mit Lucille deinen eigenen Kranz aus echten Blumen binden, dann eine Stunde Selbstporträts als Gruppe, allein mit der Kamera wie in einer Fotobox, mit den neuen Kränzen auf dem Kopf. Alle Materialien sind dabei, keine Vorkenntnisse nötig. Gemacht für Geburtstage und Junggesellinnenabschiede.' },
  ],
  fr: [
    { title: 'Autoportrait photo & collage floral', price: 119,
      facts: '3 h 30 · 4 max., uniquement pour les femmes · Ātma Self-Portrait Photo Studio, Reichenberger Str. 109, Kreuzberg',
      text: 'Avec Ātma Portrait : un atelier pour se réconcilier avec son corps. Après un échange sur notre rapport au corps, tu te photographies toi-même, seule dans le studio derrière des rideaux (tu es la seule à voir tes photos). Ensuite, Lucille te montre une technique simple pour dessiner les lignes de ton corps et en faire un collage de fleurs séchées. Tu repars avec une cinquantaine de photos en noir et blanc et ton propre collage. Aucune expérience en dessin nécessaire, boissons et snacks offerts.' },
    { title: 'Cours de peinture : la technique des points', price: 49,
      facts: '2 h 30 · 4 max., uniquement pour les femmes · dans son atelier à Prenzlauer Berg',
      text: 'Lucille te transmet sa technique signature : des milliers de petits points qui forment ensemble un tableau, inspiré des formes du corps féminin, ou d’une photo de ton propre corps. Aucune expérience nécessaire, elle t’accompagne pas à pas. Tout le matériel est fourni et tu repars avec ta propre peinture.' },
    { title: 'Couronnes de fleurs & séance photo de groupe', price: 50,
      facts: '2 h · dans votre lieu (restaurant, hôtel…) · pour les anniversaires et les EVJF',
      text: 'D’abord une heure pour créer ta couronne de vraies fleurs avec Lucille, puis une heure d’autoportraits en groupe, seules face à l’appareil comme dans un photomaton, avec vos nouvelles couronnes. Tout le matériel est fourni, aucune compétence requise. Idéal pour les anniversaires et les EVJF.' },
  ],
};

const all: Record<string, { copy: Copy; media: { video?: string; poster?: string; photo?: string }[] }> = {
  'lucille-guder': { copy: lucille, media: LUCILLE_MEDIA },
};

export const hostWorkshops = (slug: string, lang: Lang): HostWorkshop[] | undefined => {
  const h = all[slug];
  if (!h) return undefined;
  return (h.copy[lang] ?? h.copy.en).map((w, i) => ({ ...h.media[i], ...w }));
};

export const hostWorkshopsCopy: Partial<Record<Lang, { heading: string; perPerson: string; ask: string; gift: string }>> & { en: { heading: string; perPerson: string; ask: string; gift: string } } = {
  en: { heading: 'The workshops', perPerson: 'per person', ask: 'Request a date', gift: 'Give as a gift' },
  de: { heading: 'Die Workshops', perPerson: 'pro Person', ask: 'Termin anfragen', gift: 'Verschenken' },
  fr: { heading: 'Les ateliers', perPerson: 'par personne', ask: 'Demander une date', gift: 'Offrir en bon cadeau' },
};
