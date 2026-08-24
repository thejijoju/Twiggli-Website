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
  slug: string;
  name: string;
  /** What the workshop actually is — shown under the host's name, since a
   *  studio name alone does not tell a visitor what they would be doing. */
  specialty: string;
  /** The maker's studio or brand, where they trade under one. */
  studio?: string;
  /** One paragraph, for the hosts directory. */
  blurb: string;
  /** Group size, session length, where it runs, and languages — the
   *  practical details a team lead needs before enquiring. */
  group: string;
  duration: string;
  place: string;
  languages: string;
  /** Square crop, for cards. `wide` is the brochure strip, for directory rows. */
  photo?: string;
  wide?: string;
  /** A reel under /public/video. When set, the carousel card plays this
   *  instead of showing a still — `poster` is the frame shown until it does. */
  video?: string;
  poster?: string;
  /** Machine-readable versions of `specialty`, `group` and `duration`, for
   *  the directory filters. See `facets` below for why they are separate. */
  activity: ActivityKey;
  /** Smallest and largest group the host will take, across all their
   *  formats. `[1, 100]` for someone doing intimate studio sessions and
   *  large mobile ones alike. */
  groupRange: [number, number];
  /** Session length in hours, shortest to longest format. */
  hourRange: [number, number];
};

export type ActivityKey =
  | 'ceramics' | 'art' | 'craft' | 'food' | 'photography' | 'wellbeing' | 'music';

/** The filterable facts about each host, keyed by slug.
 *
 *  These live apart from `hostsCopy` because they are language-neutral: the
 *  prose in `group` ('Up to 8 · 4–30', 'Bis 8 · 4–30') is written for a human
 *  reading a card, and parsing a range back out of it would mean parsing two
 *  languages' worth of prose. The numbers below are the same in both, and the
 *  prose stays free to say whatever reads best.
 *
 *  Ranges are the union across a host's formats — Celina runs up to 20 in the
 *  studio and 50–100 mobile, so she is [1, 100] and shows up whether a team
 *  is looking for something small or something company-wide. */
const facets: Record<string, Pick<Host, 'activity' | 'groupRange' | 'hourRange'>> = {
  qian:         { activity: 'ceramics',    groupRange: [1, 8],    hourRange: [2, 2] },
  rebeca:       { activity: 'art',         groupRange: [3, 24],   hourRange: [1, 3] },
  nicole:       { activity: 'craft',       groupRange: [2, 12],   hourRange: [2.5, 5] },
  celina:       { activity: 'craft',       groupRange: [1, 100],  hourRange: [2, 4] },
  evelyn:       { activity: 'craft',       groupRange: [1, 50],   hourRange: [3, 3] },
  nina:         { activity: 'art',         groupRange: [10, 150], hourRange: [4, 16] },
  helka:        { activity: 'ceramics',    groupRange: [1, 30],   hourRange: [1.5, 3] },
  haki:         { activity: 'ceramics',    groupRange: [1, 7],    hourRange: [2, 2] },
  alessia:      { activity: 'art',         groupRange: [1, 8],    hourRange: [4, 4] },
  // PLACEHOLDER group range — Acuity carries no class size for these.
  tufttuft:     { activity: 'craft',       groupRange: [1, 10],   hourRange: [3, 5] },
  simone:       { activity: 'craft',       groupRange: [3, 6],    hourRange: [4, 6] },
  // PLACEHOLDER group ranges — Ohma Studio's makers publish no cap; the
  // room seats a dozen or so. Sina's hours are the real spread of her
  // listed sessions (a weeknight mend to most of a Saturday).
  sina:         { activity: 'craft',       groupRange: [1, 12],   hourRange: [2, 6] },
  celia:        { activity: 'craft',       groupRange: [1, 12],   hourRange: [2, 4] },
  olivia:       { activity: 'craft',       groupRange: [1, 12],   hourRange: [2, 4] },
  jem:          { activity: 'food',        groupRange: [1, 40],   hourRange: [3, 4] },
  'loom-lab':   { activity: 'ceramics',    groupRange: [4, 6],    hourRange: [4, 4] },
  maximiliana:  { activity: 'art',         groupRange: [3, 12],   hourRange: [3, 3] },
  // Her public Vulvas.berlin sessions take solo visitors and run 2.5 h,
  // so the range starts at one and reaches past the corporate two hours.
  pia:          { activity: 'art',         groupRange: [1, 20],   hourRange: [2, 2.5] },
  sarah:        { activity: 'wellbeing',   groupRange: [3, 12],   hourRange: [1, 7] },
  anne:         { activity: 'photography', groupRange: [5, 20],   hourRange: [1.5, 2] },
  sabine:       { activity: 'photography', groupRange: [1, 12],   hourRange: [4, 5] },
  angelo:       { activity: 'food',        groupRange: [6, 14],   hourRange: [3, 3] },
  faye:         { activity: 'craft',       groupRange: [8, 18],   hourRange: [2.5, 4] },
  dominik:      { activity: 'art',         groupRange: [6, 100],  hourRange: [2, 4] },
  ana:          { activity: 'wellbeing',   groupRange: [8, 20],   hourRange: [1.5, 6] },
  // PLACEHOLDER ranges — Karen-Rose's group sizes and formats are unconfirmed.
  'karen-rose': { activity: 'craft',       groupRange: [4, 12],   hourRange: [2, 3] },
  'galleria-lucia': { activity: 'craft',   groupRange: [1, 10],   hourRange: [1.5, 2] },
  // PLACEHOLDER group range — the courses book per person or pair; no
  // published cap. Baking runs 4 h, the beekeeping course days shorter.
  kohfink:      { activity: 'food',        groupRange: [1, 20],   hourRange: [3, 4] },
  'beat-etage': { activity: 'music',       groupRange: [1, 12],   hourRange: [2, 3] },
  pastamadre:   { activity: 'food',        groupRange: [1, 12],   hourRange: [3, 5] },
  munio:        { activity: 'craft',       groupRange: [1, 10],   hourRange: [1, 2] },
  // Walks run from 10 people; no published cap ("kleine Gruppen").
  'monk-garden': { activity: 'food',       groupRange: [10, 20],  hourRange: [2.5, 3] },
  // PLACEHOLDER group range — "begrenzte Platzzahl", no published cap.
  bumerang:      { activity: 'craft',      groupRange: [1, 10],   hourRange: [7, 7] },
  'ceramic-kingdom': { activity: 'ceramics', groupRange: [1, 7],  hourRange: [2, 4] },
  // PLACEHOLDER ranges — the gallery's program calendar is empty today;
  // events define their own size and length once published.
  sov:              { activity: 'art',       groupRange: [1, 50], hourRange: [1, 4] },
  // PLACEHOLDER group range — no published cap on the course pages.
  druckrausch:      { activity: 'art',       groupRange: [1, 10], hourRange: [1.5, 4] },
  schmiede:         { activity: 'craft',     groupRange: [1, 6],  hourRange: [3, 7] },
  daisuki:          { activity: 'food',      groupRange: [5, 20], hourRange: [3, 5] },
  whittle:          { activity: 'craft',     groupRange: [1, 12], hourRange: [2.5, 5] },
  // PLACEHOLDER group range — the shop publishes no cap per class.
  dirt:             { activity: 'ceramics',  groupRange: [1, 8],  hourRange: [1.25, 4] },
  rose:             { activity: 'craft',     groupRange: [3, 4],  hourRange: [4, 4] },
  techno:           { activity: 'art',       groupRange: [1, 6],  hourRange: [3, 3] },
  // PLACEHOLDER group range — the event page publishes no cap.
  arcoiris:         { activity: 'craft',     groupRange: [1, 10], hourRange: [2.5, 2.5] },
  redrum:           { activity: 'food',      groupRange: [2, 8],  hourRange: [2, 2] },
  // PLACEHOLDER group range — the shop publishes no cap per tour.
  mampe:            { activity: 'food',      groupRange: [1, 20], hourRange: [0.75, 2.5] },
  // PLACEHOLDER group ranges — the Heartspace artists publish no caps; the
  // room is small, so these are deliberately modest.
  ronnadel:         { activity: 'art',       groupRange: [1, 10], hourRange: [2.5, 2.5] },
  cateduckwall:     { activity: 'craft',     groupRange: [1, 10], hourRange: [2, 2] },
  elinorsahm:       { activity: 'art',       groupRange: [1, 10], hourRange: [2, 2] },
};

/** The seventeen-plus Berlin makers, from the team-events brochure. Reels
 *  attach by slug as footage lands — see `reels` below. */
type HostCopy = Omit<
  Host,
  'id' | 'photo' | 'wide' | 'video' | 'poster' | 'activity' | 'groupRange' | 'hourRange'
>;

const hostsCopy: Record<Lang, HostCopy[]> = {
  en: [
    { slug: 'qian', name: 'Qian', specialty: 'Pottery & hand-building', studio: 'Clay Garden Pottery Studio',
      blurb: 'Hands-on hand-building and pottery — calming, creative and beginner-friendly. Teams learn the basics while shaping their own ceramic pieces to take home.',
      group: 'Up to 8', duration: '2 h', place: 'Clay Garden Studio / your office', languages: 'EN' },
    { slug: 'rebeca', name: 'Rebeca', specialty: 'Linocut & portrait painting', studio: 'Arte Gorda',
      blurb: 'Two hands-on formats: bold linocut printmaking, or a portrait-painting session where teammates paint each other and take the canvas home. Playful and made to bring the team closer. She also teaches anatomy for artists at Kunstraum Heartspace — a twelve-part head-to-toe course co-taught with Alice Bischof, plus her own specials on the bodies standard anatomy classes leave out: where fat gathers and folds, and how skin ages.',
      group: '3–24', duration: '2–3 h', place: 'Prenzlauer Berg / mobile', languages: 'EN · DE · PT · ES' },
    { slug: 'nicole', name: 'Nicole', specialty: 'Wood & soap carving', studio: 'Anybody Can Whittle',
      blurb: 'Mindful carving workshops that pull teams out of screen-time and into a calm, hands-on craft. Learn freehand technique with simple hand tools and turn wood or soap into your own handmade object.',
      group: '2–4 studio · 5–12 on-site', duration: '2.5–5 h', place: 'Charlottenburg / on-site', languages: 'DE · EN' },
    { slug: 'celina', name: 'Celina', specialty: 'Bookbinding, mosaic & stamps', studio: 'Gestaltwandel',
      blurb: 'Switch off and get making — expert-guided craft in a calm studio, with nine formats to pick from: bookbinding, silk painting, envelope folding, stained glass soldering (Tiffany technique), mosaic making, tin ornaments, concrete tile making, straw stars and stamp carving. No experience needed; every format also runs as a private group session on a date of your choice.',
      group: 'Up to 20 studio · 50–100 mobile', duration: '2–4 h', place: 'Koloniestrasse 111, Berlin', languages: 'DE · EN' },
    { slug: 'evelyn', name: 'Evelyn Cseh', specialty: 'Textile printing & mixed craft', studio: 'Tuka Creative Club',
      blurb: 'A safe space where adults can be kids again — mindful, beginner-friendly craft: tote printing and painting, cross-stitch, kumihimo charms, watercolour, vision boarding and glass painting.',
      group: '≤12 studio · 40–50 on-site', duration: '3 h', place: 'Ohma Studio / on-site', languages: 'EN · DE' },
    { slug: 'simone', name: 'Simone Klag', specialty: 'Stone sculpture in alabaster', studio: 'B.L.O.-Ateliers',
      blurb: 'A stone sculptor working out of the B.L.O.-Ateliers on the old railway depot in Lichtenberg. Alabaster is soft enough to shape with rasps and files and turns translucent once it is polished — a trick she saves for the end. You can chase a specific idea, an animal or a heart or a figure, or simply start rasping and follow where the stone goes; she says both ways are right. Groups of three to six, no experience needed, and tool use is included in the fee.',
      group: '3–6', duration: '6 h · 2 × 4 h', place: 'B.L.O.-Ateliers, Kaskelstr. 55, Lichtenberg', languages: 'DE' },
    { slug: 'tufttuft', name: 'Tuft Tuft', specialty: 'Rug tufting', studio: 'Tuft Tuft',
      blurb: 'Punch your own design into a handmade rug with a tufting gun \u2014 no experience needed. You send the idea ahead so they can make it tuft-ready, then pick from a wall of yarn colours and work the frame with hands-on guidance. They shear, finish and trim it for you afterwards; collect in about two weeks or have it shipped. Three sizes, from a three-hour mini that suits a midweek evening or an office offsite, through the 30 \u00d7 40 cm original, to a five-hour 50 \u00d7 50. Snacks included.',
      group: 'Small group', duration: '3\u20135 h', place: 'Marienburger Str. 21, Prenzlauer Berg', languages: 'EN' },
    { slug: 'alessia', name: 'Alessia Sinopoli', specialty: 'Realistic pencil portraits',
      blurb: 'An Italian artist based in Berlin teaching realistic portrait drawing from photographic references — a structured method rather than a knack. You work the grid for proportion, learn what pencils of different hardness actually do, and spend most of the afternoon on shading and hatching, which is where a portrait turns from flat to solid. Eight people at most, so the guidance follows your own way of drawing; beginners and improvers both. Professional materials, printed references, tea and a sweet treat at the break are all provided.',
      group: 'Up to 8', duration: '4 h', place: 'Kunstraum Heartspace, Danziger Str. 172, Prenzlauer Berg', languages: 'EN' },
    { slug: 'haki', name: 'Haki', specialty: 'Handbuilding & wheel throwing', studio: 'Haki Ceramics',
      blurb: 'Clay in an artist studio building on the RAW-Gelände. The Tuesday evening group has no fixed start or end — beginners and improvers work side by side, picking up techniques as their own pieces call for them, up to seven at a time. Clay, tools, glazes and both firings are included: once your work has dried you come back to glaze it, so you leave with finished stoneware you shaped yourself. Wheel throwing runs one-to-one by appointment, and confident throwers can take the studio\u2019s single wheel spot during the group session.',
      group: 'Up to 7 \u00b7 1-to-1 \u00b7 teams to 6', duration: '2 h', place: 'RAW-Gel\u00e4nde, Revaler Str. 99, Friedrichshain', languages: 'EN' },
    { slug: 'sina', name: 'Sina Becker', specialty: 'Quilting, mending & embroidery', studio: 'Ohma Studio',
      blurb: 'A quilt maker and fibre artist working with recycled materials and reimagining what we already have. Beginner-friendly sessions in patchwork and improv quilting, visible mending by weave darning, and embroidery — all materials provided, tea and cookies included.',
      group: 'Small group', duration: '2–6 h', place: 'Ohma Studio, Friedrichshain', languages: 'EN · DE' },
    { slug: 'celia', name: 'Cèlia Hoste', specialty: 'Hand knitting', studio: 'La HoCo',
      blurb: 'A designer and crafter whose project HOCO is dedicated to hand knitting and to valuing the slow, mindful creative process. Intro sessions and a longer beginners course, guiding people into the world of yarn and into making with their hands.',
      group: 'Small group', duration: '2–4 h', place: 'Ohma Studio, Friedrichshain', languages: 'EN' },
    { slug: 'olivia', name: 'Olivia Barney', specialty: 'Alcohol ink & beaded jewellery', studio: 'Ohma Studio',
      blurb: 'The maker behind Ohma Beads, and the host of Ohma Studio itself. Playful sessions in alcohol ink — on paper, on ceramics and on oyster shells — alongside beaded necklaces and circle earrings.',
      group: 'Small group', duration: '2–4 h', place: 'Ohma Studio, Friedrichshain', languages: 'EN' },
    { slug: 'nina', name: 'Nina Kranz', specialty: 'Collective acrylic painting',
      blurb: 'Create together on one big collective canvas — or your own piece — with acrylics, palette knives, markers and textures. Guided step by step; it is about expression and flow rather than perfection.',
      group: '10–150', duration: 'Half day – multi-day', place: 'Your office / a venue, Germany-wide', languages: 'DE' },
    { slug: 'helka', name: 'Helka', specialty: 'Wheel throwing & handbuilding',
      blurb: 'Two ceramic formats: wheel throwing, learning the basics of the potter\u2019s wheel; or handbuilding for bigger groups, from pinching to slab building. Everyone keeps one or two pieces.',
      group: 'Up to 8 · 4–30', duration: '1.5–3 h', place: 'Our studio in Kreuzberg / your space', languages: 'EN' },
    { slug: 'jem', name: 'Jem', specialty: 'Sushi & kimchi making', studio: 'Fischtal Foodlab',
      blurb: 'Hands-on food workshops that are fun, interactive and delicious. Beginner-friendly sushi and kimchi sessions: chop, salt and ferment your own kimchi, or roll three types of maki and finish with a shared meal.',
      group: '≤40 kimchi · ≤20 sushi', duration: '3–4 h', place: 'Fischtal Foodlab / your office', languages: 'EN · DE' },
    { slug: 'loom-lab', name: 'The Loom Lab', specialty: '3D clay printing', studio: 'The Loom Lab',
      blurb: 'A hands-on intro to 3D clay printing, where digital fabrication meets ceramics. Beginners prep and operate a ceramic 3D printer and create their own printed piece — playful and experimental.',
      group: '4–6', duration: '4 h', place: 'The Loom Lab, Berlin', languages: 'EN · DE' },
    { slug: 'maximiliana', name: 'Maximiliana', specialty: 'Bird sketching & watercolour', studio: 'Kunstraum Heartspace',
      blurb: 'Two mindful, screen-free formats. Nature observation and bird sketching to sharpen focus and curiosity; or a calming watercolour evening exploring colour, texture and simple techniques.',
      group: '3–12', duration: '3 h', place: 'Kunstraum Heartspace, Berlin', languages: 'EN' },
    { slug: 'pia', name: 'Pia', specialty: 'Collective painting', studio: 'Rethink',
      blurb: 'A collective painting experience — each person paints a small canvas that together form one big artwork. A guided process plus conversation starters make a relaxed space to talk and listen.',
      group: '4–20', duration: '2 h', place: 'Your location / Friedrichshain (≤6)', languages: 'EN' },
    { slug: 'sarah', name: 'Sarah', specialty: 'Mindfulness & creative writing',
      blurb: 'Out of function mode and into the here and now. A mix of mindfulness, meditation, journaling, creative writing and gentle movement — simple tools for more calm, clarity and focus at work.',
      group: '3–12', duration: '1–7 h', place: 'On-site / Warschauer Str. / online', languages: 'DE · EN' },
    { slug: 'anne', name: 'Anne', specialty: 'Creative photography',
      blurb: 'A playful photography workshop where teammates photograph each other, swapping between model and photographer. Creative prompts and simple props spark fresh ways of seeing. Any phone works.',
      group: '5–20', duration: '1.5–2 h', place: 'Your office / a venue in Berlin', languages: 'EN · UA' },
    { slug: 'sabine', name: 'Sabine Alex', specialty: 'Analog photography & cyanotypes', studio: 'Mobile Dunkelkammer',
      blurb: 'Step out of the daily routine and into analog photography, using historical techniques with no prior knowledge needed. Build a pinhole camera from a coffee can, or create sunlit cyanotype prints.',
      group: 'Up to 12', duration: '4–5 h', place: 'On-site / BLO-Ateliers, Berlin', languages: 'DE · EN' },
    { slug: 'angelo', name: 'Angelo', specialty: 'DIY coffee roasting',
      blurb: 'Experience the art of coffee roasting first-hand, East-African style in a pot. Roast two different beans over an open flame, grind them fresh and enjoy your own cup — with plenty of stories along the way.',
      group: '6–14', duration: '3 h', place: 'Your location / Berlin', languages: 'DE · EN' },
    { slug: 'faye', name: 'Faye', specialty: 'Plant-based incense making', studio: 'Senlë Studio',
      blurb: 'Craft your own plant-based incense in a calming sensory ritual — from signature blends as sticks or petal pieces, to custom blends from more than thirty natural ingredients.',
      group: '8–18', duration: '2.5–4 h', place: 'Gärtnerstrasse 10, Berlin', languages: 'EN · DE' },
    { slug: 'dominik', name: 'Dominik', specialty: 'Graffiti workshops',
      blurb: 'Led by experienced local Berlin sprayers, these graffiti workshops take place at the wall in Mauerpark. The group designs one original motif together and paints it. A graffiti tour can be added.',
      group: '6–100', duration: '2–4 h', place: 'Mauerpark / your site', languages: 'DE · EN · ES · RU' },
    { slug: 'ana', name: 'Ana', specialty: 'Breathwork, movement & voice', studio: 'Resonant Body',
      blurb: 'An embodied wellbeing practice combining breathwork, movement, voice, somatic awareness and creative exploration. Playful, accessible exercises help teams reconnect and reduce stress.',
      group: '8–20', duration: '1.5–6 h', place: 'Your office / a Berlin studio', languages: 'EN · DE · ES · FR · PT' },
    // Copy from her own catalog (karen-rose.com); photos and reel to follow.
    { slug: 'karen-rose', name: 'Karen-Rose', specialty: 'Natural cosmetics, soap & terrazzo',
      blurb: 'Make-it-yourself workshops in Berlin: organic natural cosmetics, vegan soap and shampoo, scented candles, and terrazzo ceramics and jewellery. Few but good ingredients — and everything you make goes home with you.',
      group: '4–12', duration: '2–3 h', place: 'Berlin', languages: 'DE' },
    // Copy from her own shop (gallerialucia.com); photos and reel to follow.
    { slug: 'galleria-lucia', name: 'Galleria Lucia', specialty: 'Scented candle workshops', studio: 'Galleria Lucia Atelier',
      blurb: 'Design your own scented candle in a real working candle atelier inside a historic Berlin artist building — pick your jar colour, premium fragrance oils, wax colours and crystals, and finish with your own label. 100% soy wax, vegan and sustainable, drinks included.',
      group: 'Up to 10', duration: '1.5–2 h', place: 'Herzbergstr. 55, Berlin', languages: 'EN' },
    // Copy from imkerei-kohfink.de; photos and reel to follow.
    { slug: 'kohfink', name: 'Imkerei am Pflanzgarten', specialty: 'Beekeeping & honey baking', studio: 'Imkerei am Pflanzgarten',
      blurb: 'Learn beekeeping from a professional Bioland apiary in Berlin-Kaulsdorf: hands-on beginners’ courses with up to 20 real bee colonies, a theory lecture, and honey gingerbread baking workshops — bake traditional Lebkuchen with honey and take your creations home.',
      group: 'Solo or pair', duration: '3–4 h', place: 'Karlsburger Weg 38, Berlin', languages: 'DE' },
    // Copy from pastamadre.de; photos and reel to follow.
    { slug: 'pastamadre', name: 'Pasta Madre', specialty: 'Pasta, sourdough & fermentation', studio: 'Pastamadre',
      blurb: 'Homemade Italian pasta, sourdough bread and pizza, and vegetable fermentation with Maria-Lucrezia and Frank in their Wedding kitchen — most workshops end around the dinner table. Solidarity pricing: pay the full Rose price, or the reduced Tulpe price when money is tight. Ingredients are organic, regional and largely from the SUPERCOOP co-op.',
      group: 'Small groups', duration: '3–5 h', place: 'Groninger Str. 48, Berlin', languages: 'DE · EN' },
    // Copy from themunio.de; photos and reel to follow.
    { slug: 'munio', name: 'The Munio', specialty: 'Candle & fragrance making', studio: 'The Munio Studio',
      blurb: 'A Latvian candle-maker’s Berlin studio on Akazienstraße. Pour your own natural soy-wax candle with dried flowers, blend fragrance-oil roll-ons from their scent library, or make scented wax melts — short, relaxed sessions in the store, most days of the week.',
      group: 'Up to 10', duration: '1–2 h', place: 'Akazienstr. 30, Berlin', languages: 'DE · EN' },
    // Copy from beat-etage.de; photos and reel to follow.
    { slug: 'beat-etage', name: 'Beat-Etage', specialty: 'Percussion & drumming', studio: 'Percussionstudio Beat-Etage',
      blurb: 'A percussion studio in an old Treptow factory hall. Dive into West African rhythms on djembes and dunduns at the monthly weekend workshops, or try cajon and handpan — two hours of hands-on drumming, instruments provided, no experience needed.',
      group: 'Small groups', duration: '2 h', place: 'Bouchéstr. 12, Berlin', languages: 'DE' },
    // Copy from the-monk-garden.de; photos and reel to follow.
    { slug: 'monk-garden', name: 'The Monk Garden', specialty: 'Foraging walks & wild herbs', studio: 'The Monk Garden',
      blurb: 'Martin Rötzel’s modern monastery garden on the old Mariendorf gasworks. Join a guided wild-herb walk across Tempelhofer Feld — yarrow, ribwort, sorrel and what to do with them in the kitchen — or head into the forest hunting porcini and medicinal mushrooms, basket in hand.',
      group: 'Small groups (from 10)', duration: '2.5–3 h', place: 'Tempelhofer Feld & Berlin’s forests', languages: 'DE' },
    // Copy from berliner-bumerang.de; photos and reel to follow.
    { slug: 'bumerang', name: 'Berliner Bumerang', specialty: 'Boomerang building', studio: 'Berliner Bumerang Werkstatt',
      blurb: 'Christian Kliem’s boomerang workshop in the Kaskelkiez. Build two boomerangs of your own — one indoor, one outdoor — with rasps, files and sandpaper only, no power tools, then learn the throwing theory so it actually comes back. A full day of handcraft for ages 8 to 99.',
      group: 'Small groups', duration: '7 h', place: 'Kaskelstr. 46, Berlin', languages: 'DE' },
    // Copy from ceramickingdomberlin.com; photos and reel to follow.
    { slug: 'ceramic-kingdom', name: 'Ceramic Kingdom', specialty: 'Pottery school & open studio', studio: 'Ceramic Kingdom',
      blurb: 'Madeline Stillwell’s ceramics school in the Reuterkiez. Wheel-throwing from taster to intermediate, handbuilding, mold making and slip casting, glaze chemistry, sgraffito — even 3D printing in clay. Small classes of about seven, taught in English and German, with open studio time and kiln firing for those who keep going.',
      group: 'Up to 7', duration: '2–4 h', place: 'Reuterstr. 20, Berlin', languages: 'EN · DE' },
    // Copy from sov.gallery (manifesto + footer); program calendar watched —
    // events appear as the gallery publishes them. Photos and reel to follow.
    { slug: 'sov', name: 'SOV Gallery', specialty: 'Art events & gatherings', studio: 'SEE OUR VISION',
      blurb: 'A gallery and community space in Prenzlauer Berg — "for us, art is a dialogue, a space of interaction." Exhibitions, a media lab and a collective, with a program calendar of events and gatherings around the shows. Open Tuesday to Saturday, 2–7 pm.',
      group: 'Open to all', duration: 'Varies', place: 'Erich-Weinert-Str. 135, Berlin', languages: 'EN · DE' },
    // Copy from druckrausch.com; photos and reel to follow.
    { slug: 'druckrausch', name: 'Druckrausch', specialty: 'Screen printing', studio: 'Druckrausch — mobile Druckwerkstatt',
      blurb: 'A screen-printing workshop in Friedenau — and a mobile print studio for events. Learn the basics on shirts, totes and paper, squeeze in an after-work express session, print from your own photo stencil, or go big with "Print like Warhol". Also runs live printing at parties, team events and kids’ birthdays.',
      group: 'Small groups', duration: '1.5–4 h', place: 'Hackerstr. 6, Berlin', languages: 'DE' },
    // Copy from schmiedekurse-berlin.de; photos and reel to follow.
    { slug: 'schmiede', name: 'Schmiedekurse Berlin', specialty: 'Blacksmithing & knife forging', studio: 'Schmiede im Hof',
      blurb: 'A working forge in an old leather-factory yard in Blankenburg. Learn the classic techniques over a weekend, forge your own kitchen or outdoor knife — up to Japanese Damascus steel with a hand-fitted wooden handle — and take everything you make home. Small groups of five or six around the fire, plus three-day forging introductions for kids aged 10–14 in the school holidays.',
      group: 'Up to 6', duration: '1–2 days', place: 'Pankstraße 13, Berlin', languages: 'DE' },
    // Copy from berlindaisuki.de; photos and reel to follow.
    { slug: 'daisuki', name: 'Berlin Daisuki', specialty: 'Japanese cooking classes', studio: 'BERLINDAISUKI Kochstudio',
      blurb: 'Naoko Yasuda’s Japanese cooking school in Charlottenburg — sushi, vegan sushi, and ramen & gyoza in the Kochstudio on Otto-Suhr-Allee, plus live online courses in sushi, ramen, bento box and homemade miso. Also runs team events, Agile Cooking, five-hour offline “digital detox” dinners and Japanese language courses. 5/5 on Google.',
      group: '5–20', duration: '~3 h', place: 'Otto-Suhr-Allee 94, Berlin', languages: 'DE' },
    // Copy from anybodycanwhittle.com; photos and reel to follow.
    { slug: 'whittle', name: 'Anybody Can Whittle', specialty: 'Whittling & spoon carving', studio: 'Anybody Can Whittle',
      blurb: 'Nicole’s whittling school in Charlottenburg. Step-by-step courses from the first knife strokes to your own carved spoon — safety, wood, sharpening and finishing included, with a tea break to rest your hands. Material for one piece is in the course price, and wood- and soap-carving team events run for companies of 6–12.',
      group: 'Up to 12', duration: '2.5–5 h', place: 'Spielhagenstraße 13, Berlin', languages: 'DE · EN' },
    // Copy from empireofdirt.studio; photos and reel to follow.
    { slug: 'dirt', name: 'Empire of Dirt', specialty: 'Wheel throwing & ceramics classes', studio: 'Empire of Dirt',
      blurb: 'Kerstin El-Khawad and Julia Koxholt’s ceramics studio in Kreuzberg. Wheel-throwing classes from express weekends to multi-week intensives, masterclasses with guest artists (Nerikomi and more), Wednesday drop-in pottery for kids (“Matsch Love”), and an open-studio membership for independent work. Courses meeting on two or three dates are marked right on the calendar.',
      group: 'Small groups', duration: '1.25–4 h', place: 'Großbeerenstraße 28C, Berlin', languages: 'EN · DE' },
    // Copy from rose-williams.com; photos and reel to follow.
    { slug: 'rose', name: 'Rose Williams', specialty: 'Silversmithing & jewelry workshops', studio: 'Rose Williams Jewelry',
      blurb: 'Rosemary Nan Williams’s jewelry studio in Wedding. Four-hour short courses for complete beginners, taught in German or English in groups of 3–4: texture a silver ring at the rolling mill, cast a pendant by pouring molten silver over organic matter, or try cuttlefish casting. Tools, materials and silver are included — and you wear your piece home the same day.',
      group: '3–4', duration: '4 h', place: 'Tegeler Straße 35, Berlin', languages: 'DE · EN' },
    // Copy from technopainting.com and her Makery listing; photos to follow.
    { slug: 'techno', name: 'Techno Painting', specialty: 'Techno painting sessions', studio: 'Techno Painting Studio',
      blurb: 'Berlin artist Dina Shneider’s original Techno Painting workshop, running since 2018 and rated one of the top five Airbnb experiences in Berlin. Techno music meets intuitive, therapeutic acrylic painting in her Mitte studio: you pick a palette, work in layers, slip into flow state — one break with drinks — and leave with your own 70 × 50 cm canvas. All materials provided, no experience needed, sessions every day of the week.',
      group: 'Up to 6', duration: '3 h', place: 'Studio in Berlin-Mitte', languages: 'EN' },
    // Copy from her event page; photos and reel to follow.
    { slug: 'arcoiris', name: 'Barbara', specialty: 'Upcycled embroidery workshops', studio: 'ArcoIris Embroidery',
      blurb: 'Barbara Amaral’s embroidery sessions at That Pink Café in Neukölln. Stitch a bold vulva flower while learning versatile stitches, clean thread work and secure knots — on fabrics that are entirely upcycled: scraps, secondhand finds and rescued textiles from Berlin’s Zu-Verschenken boxes. Beginner-friendly and open to everyone; you head home with a finished hoop and a stitch guide to keep going.',
      group: 'Small groups', duration: '2.5 h', place: 'That Pink Café, Schwarzastraße 9, Berlin', languages: 'EN' },
    // Copy from their tasting-experience page; photos to follow.
    { slug: 'redrum', name: 'Michael', specialty: 'Guided drink tastings', studio: 'Redrum Art Bar',
      blurb: 'Guided tastings at Redrum Art Bar in Kreuzberg, hosted by Michael for groups of two to eight. The bar closes to outside guests for the two hours, so the session is yours: a flight through one spirit or cocktail family — rum, mezcal, whisky, absinthe, negronis and a dozen more — with sparkling water to clean the palate and snacks matched to what is in the glass. Dates are arranged around you rather than published.',
      group: '2–8', duration: '2 h', place: 'Grimmstr. 24, Berlin', languages: 'EN · DE' },
    // Copy from their events collection; photos to follow.
    { slug: 'mampe', name: 'Mampe', specialty: 'Manufactory tours & spirit tastings', studio: 'MAMPE Manufaktur',
      blurb: 'Berlin’s oldest liquor manufacturer, pouring since 1831. A guided tour walks you through 195 years of the city’s drinking history and the workings of the manufactory, then sits you down to taste the schnapps — several still made to the original recipes. Short tours run 45–60 minutes in German or English, the long one 90; the gin seminar goes further, and you distil and bottle your own to take home.',
      group: 'Groups welcome', duration: '45 min – 2.5 h', place: 'Am Tempelhofer Berg 6, Berlin', languages: 'DE · EN' },
    // The three Heartspace artists. Copy from their own box offices and the
    // venue's course pages; photos to follow.
    { slug: 'ronnadel', name: 'Ron Nadel', specialty: 'Cyanotype printmaking', studio: 'Kunstraum Heartspace',
      blurb: 'Cyanotype past the sun-print cliché. Most people know it as a leaf left on paper; Ron teaches the control that turns it into a real printmaking medium — up to seven distinct tones in a single print, from a hand-drawn negative on tracing paper or a grayscale file printed on the spot. You coat your own paper, expose it under UV lamps, rinse, and take your prints home. All levels, no digital skills needed, every material provided.',
      group: 'Small groups', duration: '2.5 h', place: 'Kunstraum Heartspace, Danziger Str. 172, Berlin', languages: 'EN' },
    { slug: 'cateduckwall', name: 'Cate Duckwall', specialty: 'Cyanotype on fabric', studio: 'Kunstraum Heartspace',
      blurb: 'A Berlin artist working across moving image, photography, writing and sound design, who teaches to help people reconnect with their curiosity. Her Saturday cyanotype session is a hands-on introduction to the process on fabric: botanicals, found objects and prepared imagery printed onto a cotton tote you take home, plus a care guide for it. No experience needed, all materials included — good for anyone drawn to analogue photography, printmaking or textiles, or just wanting to slow down and make something by hand.',
      group: 'Small groups', duration: '2 h', place: 'Kunstraum Heartspace, Danziger Str. 172, Berlin', languages: 'EN' },
    { slug: 'elinorsahm', name: 'Elinor Sahm', specialty: 'Alcohol ink painting', studio: 'Kunstraum Heartspace',
      blurb: 'Alcohol ink is fluid, vivid and startlingly fast — it gives striking results almost immediately, even if you have never painted. Elinor Sahm has spent years exploring, exhibiting and teaching with it, and brings that to Berlin: the techniques she developed for steering and controlling the ink on Yupo paper, while leaving room for flow, chance and surprise. Complete beginners and working artists both welcome; everyone leaves with original pieces.',
      group: 'Small groups', duration: '2 h', place: 'Kunstraum Heartspace, Danziger Str. 172, Berlin', languages: 'EN' },
  ],
  de: [
    { slug: 'qian', name: 'Qian', specialty: 'Töpfern & Aufbaukeramik', studio: 'Clay Garden Pottery Studio',
      blurb: 'Töpfern zum Anfassen — ruhig, kreativ und ideal für Anfänger. Teams lernen die Grundlagen und formen ihre eigenen Keramikstücke zum Mitnehmen.',
      group: 'Bis 8', duration: '2 Std.', place: 'Clay Garden Studio / euer Büro', languages: 'EN' },
    { slug: 'rebeca', name: 'Rebeca', specialty: 'Linoldruck & Porträtmalerei', studio: 'Arte Gorda',
      blurb: 'Zwei Formate zum Mitmachen: ausdrucksstarker Linoldruck oder eine Porträtmalerei-Session, in der sich das Team gegenseitig malt und die Leinwand mitnimmt. Außerdem unterrichtet sie Anatomie für Zeichnende im Kunstraum Heartspace — einen zwölfteiligen Kurs von Kopf bis Fuß zusammen mit Alice Bischof, dazu ihre eigenen Specials über die Körper, die in üblichen Anatomiekursen fehlen: wo sich Fett sammelt und faltet, und wie Haut altert.',
      group: '3–24', duration: '2–3 Std.', place: 'Prenzlauer Berg / mobil', languages: 'EN · DE · PT · ES' },
    { slug: 'nicole', name: 'Nicole', specialty: 'Holz- & Seifenschnitzen', studio: 'Anybody Can Whittle',
      blurb: 'Achtsames Schnitzen, das Teams aus der Bildschirmzeit holt. Freihandtechnik mit einfachem Handwerkzeug — aus Holz oder Seife entsteht ein eigenes Objekt.',
      group: '2–4 Studio · 5–12 vor Ort', duration: '2,5–5 Std.', place: 'Charlottenburg / vor Ort', languages: 'DE · EN' },
    { slug: 'celina', name: 'Celina', specialty: 'Buchbinden, Mosaik & Stempel', studio: 'Gestaltwandel',
      blurb: 'Abschalten und gestalten — angeleitetes Handwerk im ruhigen Studio, mit neun Formaten zur Wahl: Buchbinden, Seidenmalerei, Briefumschläge falten, Tiffany-Glaslöten, Mosaik, Blechornamente, Betonfliesen, Strohsterne und Stempelschnitzen. Ohne Vorkenntnisse; jedes Format auch als private Gruppensession an einem Wunschtermin.',
      group: 'Bis 20 Studio · 50–100 mobil', duration: '2–4 Std.', place: 'Koloniestraße 111, Berlin', languages: 'DE · EN' },
    { slug: 'evelyn', name: 'Evelyn Cseh', specialty: 'Textildruck & Mixed Craft', studio: 'Tuka Creative Club',
      blurb: 'Ein Raum, in dem Erwachsene wieder Kind sein dürfen: Taschendruck, Kreuzstich, Kumihimo-Anhänger, Aquarell, Vision Boarding und Glasmalerei.',
      group: '≤12 Studio · 40–50 vor Ort', duration: '3 Std.', place: 'Ohma Studio / vor Ort', languages: 'EN · DE' },
    { slug: 'simone', name: 'Simone Klag', specialty: 'Steinbildhauerei in Alabaster', studio: 'B.L.O.-Ateliers',
      blurb: 'Steinbildhauerin in den B.L.O.-Ateliers auf dem alten Bahndepot in Lichtenberg. Alabaster lässt sich mit Raspeln und Feilen gut bearbeiten und zeigt seine Transparenz erst, wenn er ganz glatt geschliffen ist — den Trick dafür hebt sie sich fürs Ende auf. Du kannst einer konkreten Idee folgen, einem Tier, einem Herz, einer Figur, oder einfach drauflosraspeln und schauen, wohin der Stein dich führt; beide Wege sind richtig. Kleine Gruppen von drei bis sechs, ohne Vorkenntnisse, Werkzeugnutzung inklusive.',
      group: '3–6', duration: '6 Std. · 2 × 4 Std.', place: 'B.L.O.-Ateliers, Kaskelstr. 55, Lichtenberg', languages: 'DE' },
    { slug: 'tufttuft', name: 'Tuft Tuft', specialty: 'Teppiche tuften', studio: 'Tuft Tuft',
      blurb: 'Mit der Tufting-Pistole euer eigenes Motiv in einen handgemachten Teppich schie\u00dfen \u2014 ganz ohne Vorkenntnisse. Ihr schickt die Idee vorab, damit sie tuftfertig gemacht wird, w\u00e4hlt dann aus einer Wand voller Garnfarben und arbeitet am Rahmen mit Anleitung. Scheren, Finish und Zuschnitt \u00fcbernehmen sie; abholen in etwa zwei Wochen oder Versand gegen eine kleine Geb\u00fchr. Drei Gr\u00f6\u00dfen \u2014 vom dreist\u00fcndigen Mini f\u00fcr einen Abend unter der Woche oder ein Team-Offsite \u00fcber das 30 \u00d7 40 cm Original bis zum f\u00fcnfst\u00fcndigen 50 \u00d7 50. Snacks inklusive.',
      group: 'Kleine Gruppe', duration: '3\u20135 Std.', place: 'Marienburger Str. 21, Prenzlauer Berg', languages: 'EN' },
    { slug: 'alessia', name: 'Alessia Sinopoli', specialty: 'Realistische Bleistiftporträts',
      blurb: 'Italienische Künstlerin in Berlin, die realistisches Porträtzeichnen nach Fotovorlage unterrichtet — als klare Methode, nicht als Talentfrage. Ihr arbeitet mit dem Raster für die Proportionen, lernt, was Bleistifte unterschiedlicher Härte wirklich können, und verbringt den größten Teil des Nachmittags mit Schraffur und Schattierung, wo ein Porträt von flach zu plastisch wird. Höchstens acht Personen, die Anleitung folgt eurer eigenen Handschrift; Anfängerinnen wie Geübte. Profimaterial, gedruckte Vorlagen, Tee und etwas Süßes in der Pause sind inklusive.',
      group: 'Bis 8', duration: '4 Std.', place: 'Kunstraum Heartspace, Danziger Str. 172, Prenzlauer Berg', languages: 'EN' },
    { slug: 'haki', name: 'Haki', specialty: 'Aufbaukeramik & Drehscheibe', studio: 'Haki Ceramics',
      blurb: 'Ton im K\u00fcnstlerhaus auf dem RAW-Gel\u00e4nde. Die Dienstagabend-Gruppe hat keinen festen Anfang und kein Ende \u2014 Einsteigerinnen und Ge\u00fcbte arbeiten nebeneinander und lernen die Techniken, die ihr St\u00fcck gerade braucht, zu siebt h\u00f6chstens. Ton, Werkzeug, Glasuren und beide Brände sind dabei: Ist deine Arbeit getrocknet, kommst du zum Glasieren wieder und nimmst fertiges Steinzeug mit, das du selbst geformt hast. Die Drehscheibe l\u00e4uft einzeln nach Absprache, und wer sicher dreht, kann w\u00e4hrend der Gruppe den einen Scheibenplatz belegen.',
      group: 'Bis 7 \u00b7 Einzel \u00b7 Teams bis 6', duration: '2 Std.', place: 'RAW-Gel\u00e4nde, Revaler Str. 99, Friedrichshain', languages: 'EN' },
    { slug: 'sina', name: 'Sina Becker', specialty: 'Quilten, Reparieren & Sticken', studio: 'Ohma Studio',
      blurb: 'Quiltmacherin und Textilkünstlerin, die mit recycelten Materialien arbeitet. Patchwork und Improv-Quilting für Einsteiger, sichtbares Reparieren per Webstopfen und Sticken — Material ist gestellt, Tee und Kekse inklusive.',
      group: 'Kleine Gruppe', duration: '2–6 Std.', place: 'Ohma Studio, Friedrichshain', languages: 'EN · DE' },
    { slug: 'celia', name: 'Cèlia Hoste', specialty: 'Handstricken', studio: 'La HoCo',
      blurb: 'Designerin und Handwerkerin; ihr Projekt HOCO widmet sich dem Handstricken und dem langsamen, achtsamen Gestalten. Einführungen und ein längerer Einsteigerkurs rund um Wolle und das Machen mit den Händen.',
      group: 'Kleine Gruppe', duration: '2–4 Std.', place: 'Ohma Studio, Friedrichshain', languages: 'EN' },
    { slug: 'olivia', name: 'Olivia Barney', specialty: 'Alkoholtinte & Perlenschmuck', studio: 'Ohma Studio',
      blurb: 'Die Macherin hinter Ohma Beads — und Gastgeberin des Ohma Studios. Verspielte Sessions mit Alkoholtinte auf Papier, Keramik und Austernschalen, dazu Perlenketten und Creolen.',
      group: 'Kleine Gruppe', duration: '2–4 Std.', place: 'Ohma Studio, Friedrichshain', languages: 'EN' },
    { slug: 'nina', name: 'Nina Kranz', specialty: 'Kollektive Acrylmalerei',
      blurb: 'Gemeinsam an einer großen Leinwand malen — oder am eigenen Bild — mit Acryl, Spachteln, Markern und Texturen. Schritt für Schritt angeleitet.',
      group: '10–150', duration: 'Halbtags – mehrtägig', place: 'Euer Büro / eine Location, deutschlandweit', languages: 'DE' },
    { slug: 'helka', name: 'Helka', specialty: 'Drehscheibe & Aufbaukeramik',
      blurb: 'Zwei Keramik-Formate: Arbeiten an der Töpferscheibe oder Aufbaukeramik für größere Gruppen. Jede und jeder behält ein bis zwei Stücke.',
      group: 'Bis 8 · 4–30', duration: '1,5–3 Std.', place: 'Unser Studio in Kreuzberg / euer Raum', languages: 'EN' },
    { slug: 'jem', name: 'Jem', specialty: 'Sushi & Kimchi', studio: 'Fischtal Foodlab',
      blurb: 'Koch-Workshops zum Mitmachen: Sushi und Kimchi für Einsteiger. Eigenes Kimchi einlegen oder drei Maki-Sorten rollen — zum Abschluss wird gemeinsam gegessen.',
      group: '≤40 Kimchi · ≤20 Sushi', duration: '3–4 Std.', place: 'Fischtal Foodlab / euer Büro', languages: 'EN · DE' },
    { slug: 'loom-lab', name: 'The Loom Lab', specialty: '3D-Keramikdruck', studio: 'The Loom Lab',
      blurb: 'Einstieg in den 3D-Keramikdruck, wo digitale Fertigung auf Keramik trifft. Einsteiger bedienen den Drucker selbst und nehmen ihr eigenes Stück mit.',
      group: '4–6', duration: '4 Std.', place: 'The Loom Lab, Berlin', languages: 'EN · DE' },
    { slug: 'maximiliana', name: 'Maximiliana', specialty: 'Vogelskizzen & Aquarell', studio: 'Kunstraum Heartspace',
      blurb: 'Zwei achtsame Formate ohne Bildschirm: Naturbeobachtung und Vogelskizzieren, oder ein ruhiger Aquarellabend rund um Farbe, Textur und einfache Techniken.',
      group: '3–12', duration: '3 Std.', place: 'Kunstraum Heartspace, Berlin', languages: 'EN' },
    { slug: 'pia', name: 'Pia', specialty: 'Kollektive Malerei', studio: 'Rethink',
      blurb: 'Eine gemeinsame Mal-Erfahrung — jede Person gestaltet eine kleine Leinwand, zusammen ergeben sie ein großes Werk. Gesprächsimpulse schaffen Raum zum Zuhören.',
      group: '4–20', duration: '2 Std.', place: 'Euer Standort / Friedrichshain (≤6)', languages: 'EN' },
    { slug: 'sarah', name: 'Sarah', specialty: 'Achtsamkeit & kreatives Schreiben',
      blurb: 'Raus aus dem Funktionsmodus, rein ins Hier und Jetzt. Achtsamkeit, Meditation, Journaling, kreatives Schreiben und sanfte Bewegung — für Ruhe, Klarheit und Fokus.',
      group: '3–12', duration: '1–7 Std.', place: 'Vor Ort / Warschauer Str. / online', languages: 'DE · EN' },
    { slug: 'anne', name: 'Anne', specialty: 'Kreative Fotografie',
      blurb: 'Ein verspielter Foto-Workshop, in dem sich das Team gegenseitig fotografiert und zwischen Modell und Fotograf wechselt. Jedes Handy reicht aus.',
      group: '5–20', duration: '1,5–2 Std.', place: 'Euer Büro / eine Location in Berlin', languages: 'EN · UA' },
    { slug: 'sabine', name: 'Sabine Alex', specialty: 'Analoge Fotografie & Cyanotypie', studio: 'Mobile Dunkelkammer',
      blurb: 'Raus aus dem Alltag, rein in die analoge Fotografie — ganz ohne Vorkenntnisse. Lochkamera aus der Kaffeedose bauen oder Cyanotypien im Sonnenlicht belichten.',
      group: 'Bis 12', duration: '4–5 Std.', place: 'Vor Ort / BLO-Ateliers, Berlin', languages: 'DE · EN' },
    { slug: 'angelo', name: 'Angelo', specialty: 'Kaffeerösten',
      blurb: 'Kaffeerösten hautnah, ostafrikanisch im Topf. Zwei Bohnensorten über offener Flamme rösten, frisch mahlen und den eigenen Kaffee genießen — mit vielen Geschichten.',
      group: '6–14', duration: '3 Std.', place: 'Euer Standort / Berlin', languages: 'DE · EN' },
    { slug: 'faye', name: 'Faye', specialty: 'Pflanzliche Räucherwaren', studio: 'Senlë Studio',
      blurb: 'Eigene pflanzliche Räucherwaren herstellen — ein ruhiges Sinnesritual, von Signature-Mischungen als Stäbchen bis zu eigenen Blends aus über dreißig Zutaten.',
      group: '8–18', duration: '2,5–4 Std.', place: 'Gärtnerstraße 10, Berlin', languages: 'EN · DE' },
    { slug: 'dominik', name: 'Dominik', specialty: 'Graffiti-Workshops',
      blurb: 'Angeleitet von erfahrenen Berliner Sprayern, direkt an der Wand im Mauerpark. Die Gruppe entwirft ein gemeinsames Motiv und sprüht es. Eine Graffiti-Tour ist zubuchbar.',
      group: '6–100', duration: '2–4 Std.', place: 'Mauerpark / euer Standort', languages: 'DE · EN · ES · RU' },
    { slug: 'ana', name: 'Ana', specialty: 'Atemarbeit, Bewegung & Stimme', studio: 'Resonant Body',
      blurb: 'Eine verkörperte Wellbeing-Praxis aus Atemarbeit, Bewegung, Stimme und somatischer Wahrnehmung. Zugängliche Übungen bauen Stress ab und stärken den Zusammenhalt.',
      group: '8–20', duration: '1,5–6 Std.', place: 'Euer Büro / ein Berliner Studio', languages: 'EN · DE · ES · FR · PT' },
    { slug: 'karen-rose', name: 'Karen-Rose', specialty: 'Naturkosmetik, Seife & Terrazzo',
      blurb: 'Selbermach-Workshops in Berlin: Bio-Naturkosmetik, vegane Seife und Shampoo, Duftkerzen sowie Terrazzo-Keramik und -Schmuck. Wenige, aber gute Zutaten — und alles, was du machst, nimmst du mit nach Hause.',
      group: '4–12', duration: '2–3 Std.', place: 'Berlin', languages: 'DE' },
    { slug: 'galleria-lucia', name: 'Galleria Lucia', specialty: 'Duftkerzen-Workshops', studio: 'Galleria Lucia Atelier',
      blurb: 'Gestalte deine eigene Duftkerze in einem echten Kerzen-Atelier in einem historischen Berliner Künstlerhaus — Glasfarbe, Premium-Duftöle, Wachsfarben und Kristalle, dazu dein eigenes Etikett. 100 % Sojawachs, vegan und nachhaltig, Getränke inklusive. Workshops auf Englisch.',
      group: 'Bis 10', duration: '1,5–2 Std.', place: 'Herzbergstr. 55, Berlin', languages: 'EN' },
    { slug: 'kohfink', name: 'Imkerei am Pflanzgarten', specialty: 'Imkerkurse & Honig-Backkurse', studio: 'Imkerei am Pflanzgarten',
      blurb: 'Imkern lernen in der Bioland-Berufsimkerei in Berlin-Kaulsdorf: praktische Einsteigerkurse an bis zu 20 echten Bienenvölkern, Theorie-Vorlesung und Honiglebkuchen-Backkurse — traditionelle Lebkuchen mit Honig backen und die eigenen Kreationen mitnehmen.',
      group: 'Einzeln oder zu zweit', duration: '3–4 Std.', place: 'Karlsburger Weg 38, Berlin', languages: 'DE' },
    { slug: 'munio', name: 'The Munio', specialty: 'Kerzen & Duft-Workshops', studio: 'The Munio Studio',
      blurb: 'Das Berliner Studio einer lettischen Kerzenmanufaktur in der Akazienstraße. Gieße deine eigene Sojawachskerze mit Trockenblumen, mische Duftöl-Roll-ons aus ihrer Duftbibliothek oder stelle Duftwachs her — kurze, entspannte Sessions im Store, fast jeden Tag.',
      group: 'Bis 10', duration: '1–2 Std.', place: 'Akazienstr. 30, Berlin', languages: 'DE · EN' },
    { slug: 'pastamadre', name: 'Pasta Madre', specialty: 'Pasta, Sauerteig & Fermentation', studio: 'Pastamadre',
      blurb: 'Hausgemachte italienische Pasta, Sauerteigbrot und -pizza und Gemüsefermentation mit Maria-Lucrezia und Frank in ihrer Küche im Wedding — die meisten Workshops enden am Esstisch. Solidarisches Preismodell: voller Rose-Preis oder reduzierter Tulpe-Preis, wenn das Budget knapp ist. Zutaten bio, regional und größtenteils von der SUPERCOOP-Genossenschaft.',
      group: 'Kleine Gruppen', duration: '3–5 Std.', place: 'Groninger Str. 48, Berlin', languages: 'DE · EN' },
    { slug: 'beat-etage', name: 'Beat-Etage', specialty: 'Percussion & Trommeln', studio: 'Percussionstudio Beat-Etage',
      blurb: 'Ein Percussionstudio in einer alten Treptower Fabrikhalle. Bei den monatlichen Wochenend-Workshops in westafrikanische Rhythmen auf Djembes und Dunduns eintauchen — oder Cajon und Handpan ausprobieren. Zwei Stunden Trommeln zum Anfassen, Instrumente inklusive, ganz ohne Vorkenntnisse.',
      group: 'Kleine Gruppen', duration: '2 Std.', place: 'Bouchéstr. 12, Berlin', languages: 'DE' },
    { slug: 'monk-garden', name: 'The Monk Garden', specialty: 'Wildkräuter- & Pilzwanderungen', studio: 'The Monk Garden',
      blurb: 'Martin Rötzels moderner Klostergarten auf dem alten Gaswerk Mariendorf. Bei der geführten Wildkräuter-Wanderung über das Tempelhofer Feld Schafgarbe, Spitzwegerich und Sauerampfer entdecken — samt Küchen-Inspiration — oder im Wald mit Korb in der Hand Steinpilze und Vitalpilze suchen.',
      group: 'Kleine Gruppen (ab 10)', duration: '2,5–3 Std.', place: 'Tempelhofer Feld & Berliner Wälder', languages: 'DE' },
    { slug: 'bumerang', name: 'Berliner Bumerang', specialty: 'Bumerangbau', studio: 'Berliner Bumerang Werkstatt',
      blurb: 'Christian Kliems Bumerang-Werkstatt im Kaskelkiez. Zwei eigene Bumerangs bauen — einen für drinnen, einen für draußen — nur mit Raspeln, Feilen und Schleifpapier, ganz ohne Strom, dazu die Wurftheorie, damit er auch wirklich zurückkommt. Ein ganzer Tag Handwerk für Menschen von 8 bis 99.',
      group: 'Kleine Gruppen', duration: '7 Std.', place: 'Kaskelstr. 46, Berlin', languages: 'DE' },
    { slug: 'ceramic-kingdom', name: 'Ceramic Kingdom', specialty: 'Töpferschule & offene Werkstatt', studio: 'Ceramic Kingdom',
      blurb: 'Madeline Stillwells Keramikschule im Reuterkiez. Drehscheibe vom Schnupperkurs bis zur Mittelstufe, Aufbautechnik, Formenbau und Schlickerguss, Glasurchemie, Sgraffito — sogar 3D-Druck mit Ton. Kleine Kurse mit etwa sieben Plätzen auf Englisch und Deutsch, dazu offene Werkstatt und Brennservice für alle, die dranbleiben.',
      group: 'Bis 7', duration: '2–4 Std.', place: 'Reuterstr. 20, Berlin', languages: 'EN · DE' },
    { slug: 'sov', name: 'SOV Gallery', specialty: 'Kunst-Events & Begegnungen', studio: 'SEE OUR VISION',
      blurb: 'Galerie und Community-Raum in Prenzlauer Berg — "Kunst ist für uns ein Dialog, ein Raum der Begegnung." Ausstellungen, ein Media Lab und ein Kollektiv, dazu ein Programmkalender mit Events und Treffen rund um die Shows. Geöffnet Dienstag bis Samstag, 14–19 Uhr.',
      group: 'Offen für alle', duration: 'Variiert', place: 'Erich-Weinert-Str. 135, Berlin', languages: 'EN · DE' },
    { slug: 'druckrausch', name: 'Druckrausch', specialty: 'Siebdruck', studio: 'Druckrausch — mobile Druckwerkstatt',
      blurb: 'Siebdruck-Werkstatt in Friedenau — und mobiles Druckstudio für Events. Grundlagen auf Shirts, Beuteln und Papier lernen, ein Express-Kurs nach Feierabend, Drucken von der eigenen Fotoschablone oder groß rauskommen mit "Drucken wie Warhol". Dazu Live-Siebdruck auf Partys, Team-Events und Kindergeburtstagen.',
      group: 'Kleine Gruppen', duration: '1,5–4 Std.', place: 'Hackerstr. 6, Berlin', languages: 'DE' },
    { slug: 'schmiede', name: 'Schmiedekurse Berlin', specialty: 'Schmieden & Messerschmieden', studio: 'Schmiede im Hof',
      blurb: 'Eine Schmiede im Hof einer alten Lederfabrik in Blankenburg. Am Wochenende die Grundtechniken lernen, das eigene Küchen- oder Outdoormesser schmieden — bis hin zum japanischen Damaszenerstahl mit selbst angepasstem Holzgriff — und alles Geschmiedete mit nach Hause nehmen. Kleine Gruppen mit fünf bis sechs Plätzen am Feuer, dazu dreitägige Schmiede-Einführungen für Kinder von 10–14 in den Ferien.',
      group: 'Bis 6', duration: '1–2 Tage', place: 'Pankstraße 13, Berlin', languages: 'DE' },
    { slug: 'daisuki', name: 'Berlin Daisuki', specialty: 'Japanische Kochkurse', studio: 'BERLINDAISUKI Kochstudio',
      blurb: 'Naoko Yasudas japanische Kochschule in Charlottenburg — Sushi, veganes Sushi und Ramen & Gyoza im Kochstudio in der Otto-Suhr-Allee, dazu Live-Online-Kurse für Sushi, Ramen, Bento-Box und selbstgemachtes Miso. Außerdem Team-Events, Agile Cooking, fünfstündige Offline-„Digital-Detox“-Dinner und Japanisch-Sprachkurse. 5/5 bei Google.',
      group: '5–20', duration: 'ca. 3 Std.', place: 'Otto-Suhr-Allee 94, Berlin', languages: 'DE' },
    { slug: 'whittle', name: 'Anybody Can Whittle', specialty: 'Schnitzen & Löffelschnitzen', studio: 'Anybody Can Whittle',
      blurb: 'Nicoles Schnitzschule in Charlottenburg. Kurse, die Schritt für Schritt vom ersten Messerschnitt zum eigenen Löffel führen — Sicherheit, Holz, Schärfen und Finish inklusive, mit Teepause für die Hände. Das Material für ein Werkstück steckt im Kurspreis, und Holz- und Seifenschnitz-Teamevents laufen für Firmen mit 6–12 Personen.',
      group: 'Bis 12', duration: '2,5–5 Std.', place: 'Spielhagenstraße 13, Berlin', languages: 'DE · EN' },
    { slug: 'dirt', name: 'Empire of Dirt', specialty: 'Drehscheibe & Keramikkurse', studio: 'Empire of Dirt',
      blurb: 'Das Keramikstudio von Kerstin El-Khawad und Julia Koxholt in Kreuzberg. Drehscheibenkurse vom Express-Wochenende bis zum mehrwöchigen Intensiv, Masterclasses mit Gastkünstlerinnen (Nerikomi u. a.), mittwochs Kinder-Töpfern zum Reinschnuppern („Matsch Love“) und eine Open-Studio-Mitgliedschaft fürs freie Arbeiten. Kurse mit zwei oder drei Terminen sind direkt im Kalender markiert.',
      group: 'Kleine Gruppen', duration: '1,25–4 Std.', place: 'Großbeerenstraße 28C, Berlin', languages: 'EN · DE' },
    { slug: 'rose', name: 'Rose Williams', specialty: 'Silberschmieden & Schmuckworkshops', studio: 'Rose Williams Jewelry',
      blurb: 'Das Schmuckstudio von Rosemary Nan Williams im Wedding. Vierstündige Schnupperkurse für absolute Anfänger, auf Deutsch oder Englisch in Gruppen von 3–4: an der Walze einen strukturierten Silberring prägen, geschmolzenes Silber über organische Materialien zu einem Anhänger gießen oder den Sepiaguß ausprobieren. Werkzeuge, Material und Silber inklusive — das fertige Stück trägst du noch am selben Tag.',
      group: '3–4', duration: '4 Std.', place: 'Tegeler Straße 35, Berlin', languages: 'DE · EN' },
    { slug: 'techno', name: 'Techno Painting', specialty: 'Techno-Painting-Sessions', studio: 'Techno Painting Studio',
      blurb: 'Der originale Techno-Painting-Workshop der Berliner Künstlerin Dina Shneider — seit 2018 eine der fünf bestbewerteten Airbnb-Experiences Berlins. Technomusik trifft intuitives, therapeutisches Acrylmalen in ihrem Studio in Mitte: Palette wählen, in Schichten arbeiten, in den Flow kommen — eine Pause mit Getränken — und am Ende nimmst du deine eigene 70 × 50 cm Leinwand mit. Material inklusive, keine Vorkenntnisse nötig, Sessions an jedem Tag der Woche.',
      group: 'Bis 6', duration: '3 Std.', place: 'Studio in Berlin-Mitte', languages: 'EN' },
    { slug: 'arcoiris', name: 'Barbara', specialty: 'Upcycling-Stickworkshops', studio: 'ArcoIris Embroidery',
      blurb: 'Barbara Amarals Stick-Sessions im That Pink Café in Neukölln. Stick eine kraftvolle Vulva-Blume und lerne dabei vielseitige Stiche, sauberes Fädentrennen und sichere Knoten — auf Stoffen, die komplett upgecycelt sind: Reste, Secondhand-Funde und gerettete Textilien aus Berliner Zu-Verschenken-Kisten. Anfängerfreundlich und offen für alle; am Ende nimmst du deinen fertigen Stickrahmen und eine Stichanleitung mit nach Hause.',
      group: 'Kleine Gruppen', duration: '2,5 Std.', place: 'That Pink Café, Schwarzastraße 9, Berlin', languages: 'EN' },
    { slug: 'redrum', name: 'Michael', specialty: 'Geführte Drink-Tastings', studio: 'Redrum Art Bar',
      blurb: 'Geführte Tastings in der Redrum Art Bar in Kreuzberg — Michael führt Gruppen von zwei bis acht Personen durch den Abend. Die Bar bleibt für die zwei Stunden für andere Gäste geschlossen, die Session gehört also euch: eine Reise durch eine Spirituosen- oder Cocktail-Familie — Rum, Mezcal, Whisky, Absinth, Negronis und ein Dutzend mehr — mit Sprudelwasser zum Neutralisieren und Snacks, die zum Glas passen. Termine werden mit euch abgestimmt statt veröffentlicht.',
      group: '2–8', duration: '2 Std.', place: 'Grimmstr. 24, Berlin', languages: 'EN · DE' },
    { slug: 'mampe', name: 'Mampe', specialty: 'Manufaktur-Führungen & Spirituosen-Verkostung', studio: 'MAMPE Manufaktur',
      blurb: 'Berlins älteste Spirituosenmanufaktur, seit 1831 im Ausschank. Die Führung nimmt euch mit durch 195 Jahre Berliner Trinkgeschichte und durch die Manufaktur — und danach wird verkostet, einiges davon noch nach den Originalrezepturen gebrannt. Die kurzen Führungen dauern 45–60 Minuten auf Deutsch oder Englisch, die große 90; im Gin-Seminar geht ihr weiter und brennt und abfüllt euren eigenen Gin zum Mitnehmen.',
      group: 'Gruppen willkommen', duration: '45 Min. – 2,5 Std.', place: 'Am Tempelhofer Berg 6, Berlin', languages: 'DE · EN' },
    { slug: 'ronnadel', name: 'Ron Nadel', specialty: 'Cyanotypie-Druck', studio: 'Kunstraum Heartspace',
      blurb: 'Cyanotypie jenseits des Sonnendruck-Klischees. Die meisten kennen sie als Blatt auf Papier; Ron bringt dir die Kontrolle bei, die daraus ein echtes Druckverfahren macht — bis zu sieben Tonwerte in einem einzigen Druck, von einem handgezeichneten Negativ auf Transparentpapier oder einer Graustufendatei, die vor Ort gedruckt wird. Du beschichtest dein Papier selbst, belichtest unter UV-Lampen, wässerst und nimmst deine Drucke mit. Alle Level, keine Digitalkenntnisse nötig, Material komplett gestellt.',
      group: 'Kleine Gruppen', duration: '2,5 Std.', place: 'Kunstraum Heartspace, Danziger Str. 172, Berlin', languages: 'EN' },
    { slug: 'cateduckwall', name: 'Cate Duckwall', specialty: 'Cyanotypie auf Stoff', studio: 'Kunstraum Heartspace',
      blurb: 'Eine Berliner Künstlerin, die zwischen bewegtem Bild, Fotografie, Text und Sounddesign arbeitet — und unterrichtet, um Menschen wieder mit ihrer Neugier zu verbinden. Ihre Samstags-Session ist ein praktischer Einstieg in die Cyanotypie auf Stoff: Pflanzen, gefundene Objekte und vorbereitete Motive werden auf einen Baumwollbeutel gedruckt, den du mitnimmst, samt Pflegeanleitung. Keine Vorkenntnisse nötig, Material inklusive — für alle, die analoge Fotografie, Druck oder Textiles mögen oder einfach mal wieder etwas mit den Händen machen wollen.',
      group: 'Kleine Gruppen', duration: '2 Std.', place: 'Kunstraum Heartspace, Danziger Str. 172, Berlin', languages: 'EN' },
    { slug: 'elinorsahm', name: 'Elinor Sahm', specialty: 'Malen mit Alkoholtinte', studio: 'Kunstraum Heartspace',
      blurb: 'Alkoholtinte ist flüssig, leuchtend und verblüffend schnell — sie liefert fast sofort eindrucksvolle Ergebnisse, auch wenn du noch nie gemalt hast. Elinor Sahm hat jahrelang mit ihr gearbeitet, ausgestellt und unterrichtet und bringt das nun nach Berlin: die Techniken, die sie entwickelt hat, um die Tinte auf Yupo-Papier zu lenken und zu kontrollieren — und ihr trotzdem Raum für Fluss, Zufall und Überraschung zu lassen. Für komplette Anfänger wie für arbeitende Künstlerinnen; alle nehmen eigene Arbeiten mit.',
      group: 'Kleine Gruppen', duration: '2 Std.', place: 'Kunstraum Heartspace, Danziger Str. 172, Berlin', languages: 'EN' },
  ],
};

/** Reels, keyed by host slug. Add an entry as each host's footage lands and
 *  the carousel picks it up — no other change needed. */
const reels: Record<string, { video: string; poster: string }> = {
  // reel-1/reel-3 are unattributed painting-session clips sitting with the
  // painting hosts. UNCONFIRMED — if these were shot with specific makers,
  // move the slug here and the carousel and directory both follow.
  rebeca: { video: '/video/reel-1.mp4', poster: '/video/reel-1-poster.jpg' },
  // Nina Kranz's own reel, supplied by her.
  nina: { video: '/video/nina.mp4', poster: '/video/nina-poster.jpg' },
  pia: { video: '/video/reel-3.mp4', poster: '/video/reel-3-poster.jpg' },
};

export const getHosts = (lang: Lang): Host[] =>
  hostsCopy[lang].map((h, i) => {
    const reel = reels[h.slug];
    return {
      ...h,
      ...facets[h.slug],
      id: i + 1,
      photo: withBase(`/img/hosts/${h.slug}.jpg`),
      wide: withBase(`/img/hosts/${h.slug}-wide.jpg`),
      ...(reel
        ? { video: withBase(reel.video), poster: withBase(reel.poster) }
        : {}),
    };
  });

/** The filter vocabulary, in both languages. Bucket ids are matched against
 *  a host's ranges in HostFilters — the labels are only ever shown, never
 *  compared, so they can be reworded freely. */
export const filterCopy = {
  en: {
    activityLabel: 'Activity',
    groupLabel: 'Group size',
    durationLabel: 'Length',
    all: 'All',
    clear: 'Clear filters',
    count: (n: number) => (n === 1 ? '1 host' : `${n} hosts`),
    empty: 'No host matches all three filters. Try widening one.',
    activities: {
      ceramics: 'Ceramics', art: 'Art & print', craft: 'Craft & making',
      food: 'Food & drink', photography: 'Photography', wellbeing: 'Wellbeing',
      music: 'Music & rhythm',
    },
    groups: { small: 'Up to 10', medium: '10–30', large: '30+' },
    durations: { short: 'Up to 2 h', medium: '2–4 h', long: 'Half day or more' },
  },
  de: {
    activityLabel: 'Aktivität',
    groupLabel: 'Gruppengröße',
    durationLabel: 'Dauer',
    all: 'Alle',
    clear: 'Filter zurücksetzen',
    count: (n: number) => (n === 1 ? '1 Gastgeber' : `${n} Gastgeber`),
    empty: 'Kein Gastgeber passt zu allen drei Filtern. Erweitere einen davon.',
    activities: {
      ceramics: 'Keramik', art: 'Kunst & Druck', craft: 'Handwerk',
      food: 'Essen & Trinken', photography: 'Fotografie', wellbeing: 'Wohlbefinden',
      music: 'Musik & Rhythmus',
    },
    groups: { small: 'Bis 10', medium: '10–30', large: '30+' },
    durations: { short: 'Bis 2 Std.', medium: '2–4 Std.', long: 'Ab einem halben Tag' },
  },
} as const;

/** A listing card inside the phone mockup, mirroring the app's real feed:
 *  a media thumbnail plus the booking facts a card shows under it. The two
 *  cropped cards at the bottom of the screen carry no info block (the app's
 *  bottom nav cuts them off), so everything past `title` is optional. */
export type PhoneCard = {
  id: string;
  title: string;
  date?: string;
  time?: string;
  distance?: string;
  host?: string;
  rating?: string;
  ratingCount?: string;
  photo?: string;
  video?: string;
  poster?: string;
};

const phoneCardsCopy: Record<Lang, Omit<PhoneCard, 'video' | 'poster'>[]> = {
  // Card 1's copy names what its reel actually shows (a painting session) —
  // pairing a "Bachata" title with painting footage would have the mockup
  // showing a video of the wrong thing. Card 2 is info-only (its thumbnail
  // sits scrolled off the top of the feed, as in the app), so its copy is
  // free to stay the screenshot's.
  en: [
    { id: 'phone-front-1', title: 'Collective painting', date: 'Mon, Oct 16', time: '9AM–10.30AM',
      distance: '5 km away', host: 'Rebeca', rating: '5', ratingCount: '1', photo: '/img/hero/bachata.jpg' },
    { id: 'phone-front-2', title: 'Bouldering course', date: 'Mon, Oct 16', time: '4PM–6PM',
      distance: '2 km away', host: 'Pauline D.', rating: '4.8', ratingCount: '4', photo: '/img/hero/bouldering.jpg' },
    { id: 'phone-front-3', title: 'Cooking workshop', photo: '/img/hero/cooking.jpg' },
    { id: 'phone-front-4', title: 'Hiking meetup', photo: '/img/hero/hiking.jpg' },
  ],
  de: [
    { id: 'phone-front-1', title: 'Kollektive Malerei', date: 'Mo., 16. Okt.', time: '9–10.30 Uhr',
      distance: '5 km entfernt', host: 'Rebeca', rating: '5', ratingCount: '1', photo: '/img/hero/bachata.jpg' },
    { id: 'phone-front-2', title: 'Boulderkurs', date: 'Mo., 16. Okt.', time: '16–18 Uhr',
      distance: '2 km entfernt', host: 'Pauline D.', rating: '4,8', ratingCount: '4', photo: '/img/hero/bouldering.jpg' },
    { id: 'phone-front-3', title: 'Kochworkshop', photo: '/img/hero/cooking.jpg' },
    { id: 'phone-front-4', title: 'Wander-Treffen', photo: '/img/hero/hiking.jpg' },
  ],
};

/** Reels inside the phone mockup, by card id. A card with an entry here
 *  plays its clip in the thumbnail; one without stays a still. This is the
 *  swap point for real footage: drop `reel-N.mp4` + poster into
 *  `public/video/`, point the card's entry at it, and the mockup plays it —
 *  nothing else needs changing.
 *
 *  All four feed cards show video, per request, but we only hold three
 *  reels — so reel-1 also fills card 4, placed diagonal to card 1 (and
 *  card 3 diagonal to the back phone's reel-2) to keep the repeats as far
 *  apart as the grid allows. All three clips are painting sessions, so
 *  until per-activity footage lands only card 1's title matches its clip;
 *  cards 3 and 4 show media alone (their info is cropped by the app's
 *  bottom nav), which keeps the mismatch invisible. */
const phoneReels: Record<string, { video: string; poster: string }> = {
  'phone-front-1': { video: '/video/reel-1.mp4', poster: '/video/reel-1-poster.jpg' },
  'phone-front-2': { video: '/video/reel-3.mp4', poster: '/video/reel-3-poster.jpg' },
  'phone-front-3': { video: '/video/reel-2.mp4', poster: '/video/reel-2-poster.jpg' },
  'phone-front-4': { video: '/video/reel-1.mp4', poster: '/video/reel-1-poster.jpg' },
};

/** The sample cards inside the phone mockup. */
export const getPhoneCards = (lang: Lang): PhoneCard[] =>
  phoneCardsCopy[lang].map((card) => {
    const reel = phoneReels[card.id];
    return {
      ...card,
      photo: card.photo ? withBase(card.photo) : undefined,
      ...(reel
        ? { video: withBase(reel.video), poster: withBase(reel.poster) }
        : {}),
    };
  });

const phoneFiltersCopy: Record<Lang, string[]> = {
  en: ['All', 'Today', 'Tomorrow', 'Free', 'Paid'],
  de: ['Alle', 'Heute', 'Morgen', 'Kostenlos', 'Kostenpflichtig'],
};

export const getPhoneFilters = (lang: Lang): string[] => phoneFiltersCopy[lang];
