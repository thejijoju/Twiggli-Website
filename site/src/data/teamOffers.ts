/** Group formats live hosts quoted us by email, for companies — the
 *  "creative breaks" they proposed for Lettretage's K26 (Jirel's email of
 *  22.10.26): every one runs at the client's own space, 60–90 minutes,
 *  materials brought along. Prices as the hosts gave them; "+ VAT" where
 *  they quoted net. Kept by hand here rather than in live-workshops.json,
 *  which the weekly scraper rewrites. getOnRequestAll merges these into
 *  each host's "on request" list. */
export type TeamOffer = {
  slug: string;
  title: string;
  titleEn: string;
  duration?: string;
  price?: string;
  group?: string;
  groupEn?: string;
};

export const teamOffers: TeamOffer[] = [
  { slug: 'evelyn', title: 'Bei euch: Lesezeichen sticken (Kreuzstich mit Folklore-Symbolen)', titleEn: 'At your office: embroidered bookmarks (cross-stitch with folklore symbols)', duration: '1.5 h', price: '€25', group: 'bis 30', groupEn: 'up to 30' },
  { slug: 'evelyn', title: 'Bei euch: Glasmalerei auf Teetasse oder Weinglas', titleEn: 'At your office: glass painting on a teacup or wine glass', duration: '1–1.5 h', price: '€30', group: 'bis 30', groupEn: 'up to 30' },
  { slug: 'evelyn', title: 'Bei euch: Stoffbeutel bedrucken mit 80 handgeschnitzten Stempeln', titleEn: 'At your office: tote bag printing with 80 hand-carved stamps', duration: '1.5 h', price: '€35', group: 'bis 20', groupEn: 'up to 20' },
  { slug: 'petitejungle', title: 'Bei euch: Mini-Terrarium (ab 15 Personen)', titleEn: 'At your office: mini terrarium (from 15 people)', duration: '1 h', price: '€35 + VAT' },
  { slug: 'petitejungle', title: 'Bei euch: Terrarium S, 1,5-Liter-Glas mit 2 Pflanzen (ab 10 Personen)', titleEn: 'At your office: Terrarium S, 1.5-litre glass with 2 plants (from 10 people)', duration: '1.5 h', price: '€55 + VAT' },
  { slug: 'pia', title: 'Bei euch: kleine abstrakte Bilder auf Leinwand', titleEn: 'At your office: mini abstract artworks on canvas', duration: '1 h', price: '€40', group: '2–15', groupEn: '2–15' },
  { slug: 'aria', title: 'Bei euch: intuitives abstraktes Malen (ohne Wasser, passt in jeden Raum)', titleEn: 'At your office: intuitive abstract painting (no water needed, fits any room)', duration: '1–1.5 h', price: '€39–49', group: 'bis 99, ab 8 Personen 39 €', groupEn: 'up to 99, €39 from 8 people' },
  { slug: 'anne', title: 'Bei euch: kreativer Foto-Workshop mit Requisiten und dem eigenen Smartphone', titleEn: 'At your office: creative photography with props and your own smartphone', duration: '1–1.5 h', price: '€50' },
  { slug: 'angelo', title: 'Bei euch: Coffee Brew-Off Challenge, Team Rot gegen Team Grün', titleEn: 'At your office: Coffee Brew-Off Challenge, Team Red vs Team Green', price: '€250 per session + VAT' },
  { slug: 'faye', title: 'Bei euch: chinesische Räucherwerk-Herstellung', titleEn: 'At your office: the art of Chinese incense making', duration: '1.5 h', price: '€43.56–48.40 + VAT', group: 'bis 25', groupEn: 'up to 25' },
  { slug: 'faye', title: 'Bei euch: Ritual-Pause mit Duft & TCM (Akupressur, Atmung)', titleEn: 'At your office: ritual break with scent & TCM (acupressure, breathwork)', duration: '1 h', price: '€14.79–18.49 + VAT', group: 'bis 40', groupEn: 'up to 40' },
  { slug: 'faye', title: 'Bei euch: Ritual-Pause mit Gua Sha & Gesichtspflege', titleEn: 'At your office: ritual break with gua sha & facial self-care', duration: '1 h', price: '€12.61 + VAT', group: 'bis 20', groupEn: 'up to 20' },
  { slug: 'celina', title: 'Bei euch: Strohsterne binden', titleEn: 'At your office: binding straw stars', duration: '1.5 h', price: '€45' },
  { slug: 'celina', title: 'Bei euch: Christbaumschmuck aus Aluminiumfolie prägen', titleEn: 'At your office: embossing Christmas ornaments from aluminium foil', duration: '1.5 h', price: '€29' },
];
