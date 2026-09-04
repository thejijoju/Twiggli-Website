/** Page content. Copy here is verbatim from the Claude Design export;
 *  anything marked PLACEHOLDER is filler awaiting real content. */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { withBase, type Lang } from '../lib/url.ts';

/** The blank cream squares the design export dropped in for hosts whose
 *  photography had not been shot yet — byte-identical fillers, two sizes and
 *  two shades of them. They are pictures of nothing, so they are treated as
 *  absent rather than drawn as an empty tile. */
const BLANK_PLACEHOLDERS = new Set([
  '67cf8462e6f4d452c9523fb218e70eb8',
  '20a14a3096917f63a2963575ef794779',
  '8600a57f8063293a85c564f3ba37cfe3',
  '2db02a3a9a4fdd567e3fff8b368b5d7f',
]);

/** Host pictures live in public/ and are copied verbatim into the build, so
 *  a host onboarded before their photos arrive has no file behind the path
 *  the slug implies — and an <img> pointed at a missing file renders a
 *  broken tile on a live page. Checked once at build time; where the file
 *  is absent or blank the field is left off entirely and the components show
 *  a monogram instead. */
const publicDir = fileURLToPath(new URL('../../public', import.meta.url));
const realPicture = new Map<string, boolean>();
const shipped = (path: string): string | undefined => {
  let real = realPicture.get(path);
  if (real === undefined) {
    const file = `${publicDir}${path}`;
    real =
      existsSync(file) &&
      !BLANK_PLACEHOLDERS.has(createHash('md5').update(readFileSync(file)).digest('hex'));
    realPicture.set(path, real);
  }
  return real ? withBase(path) : undefined;
};

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
  tania:        { activity: 'ceramics',    groupRange: [1, 8],    hourRange: [3, 3] },
  drawingwalks: { activity: 'art',         groupRange: [1, 15],   hourRange: [2.75, 2.75] },
  // One on a private wheel session up to six in a group class; the glazing
  // class runs 2 h, the wheel and handbuilding ones 2.5.
  violaine:     { activity: 'ceramics',    groupRange: [1, 6],    hourRange: [2, 2.5] },
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
    { slug: 'drawingwalks', name: 'Ditte Østergaard', specialty: 'Urban sketching walks', studio: 'Drawing Walks',
      blurb: 'A city tour and a drawing workshop at once. Ditte walks a neighbourhood with you, tells its stories, and sets quick, playful sketching exercises along the way — drawing as a way of seeing, which makes you look closer and catch the details you would otherwise pass without noticing. A sketchbook and a handful of materials come with you; you dress for the weather and turn up at the meeting point. Whether you have not drawn since childhood or your sketchbook never leaves your bag, you are welcome.',
      group: 'Up to 15', duration: '2.75 h', place: 'Meeting points across Berlin', languages: 'EN' },
    { slug: 'violaine', name: 'Violaine Toth', specialty: 'Wheel throwing & handbuilding', studio: 'Violaine Toth Ceramic',
      blurb: 'A ceramic studio in Neukölln teaching since 2018, where a class is three to six people around the wheels with Violaine or Brew. The 2.5-hour beginner session takes you from wedging the clay to throwing bowls and cylinders, and the studio glazes and fires two of your pieces afterwards — ready to collect about six weeks later. Handbuilding and glazing sessions run at the same size, a private wheel class takes one or two, and a four-session course spreads throwing, trimming and glazing across ten hours in a month. Clay, tools and firing are in the price; classes are held in English.',
      group: '3–6', duration: '2–2.5 h', place: 'Treptower Str. 12, Neukölln', languages: 'EN' },
    { slug: 'tania', name: 'Tania Varela', specialty: 'Handbuilding ceramics', studio: 'Tanita Tarara Ceramics',
      blurb: 'Handbuilding without a wheel, at WOMADE inside Bikini Berlin — pinching and slab work you can repeat at home afterwards. Four formats of three hours: a breakfast set of cup and plate, a session broken by a proper brunch, black-and-white decoration with sgraffito and carving, and an open format where you bring your own idea. She glazes and fires everything afterwards and lets you know when it is ready. Eight seats, materials and both firings included.',
      group: 'Up to 8', duration: '3 h', place: 'WOMADE, Bikini Berlin 1. OG, Charlottenburg', languages: 'DE · EN · ES · FR' },
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
    // Copy from her own catalog (karen-rose.com); photos to follow. Her reel
    // has landed — see `reels` below.
    { slug: 'karen-rose', name: 'Karen-Rose', specialty: 'Natural cosmetics, soap & terrazzo',
      blurb: 'Make-it-yourself workshops in Berlin: organic natural cosmetics, vegan soap and shampoo, scented candles, and terrazzo ceramics and jewellery. Few but good ingredients — and everything you make goes home with you.',
      group: '4–12', duration: '2–3 h', place: 'Berlin', languages: 'DE' },
    // Copy from her own shop (gallerialucia.com); photos to follow. Her reel
    // has landed — see `reels` below.
    { slug: 'galleria-lucia', name: 'Galleria Lucia', specialty: 'Scented candle workshops', studio: 'Galleria Lucia Atelier',
      blurb: 'Design your own scented candle in a real working candle atelier inside a historic Berlin artist building — pick your jar colour, premium fragrance oils, wax colours and crystals, and finish with your own label. 100% soy wax, vegan and sustainable, drinks included.',
      group: 'Up to 10', duration: '1.5–2 h', place: 'Herzbergstr. 55, Berlin', languages: 'EN' },
    // Copy from imkerei-kohfink.de; photos and reel to follow.
    { slug: 'kohfink', name: 'Imkerei am Pflanzgarten', specialty: 'Beekeeping & honey baking', studio: 'Imkerei am Pflanzgarten',
      blurb: 'Learn beekeeping from a professional Bioland apiary in Berlin-Kaulsdorf: hands-on beginners’ courses with up to 20 real bee colonies, a theory lecture, and honey gingerbread baking workshops — bake traditional Lebkuchen with honey and take your creations home.',
      group: '≤ 17', duration: '3–4 h', place: 'Karlsburger Weg 38, Berlin', languages: 'DE' },
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
    { slug: 'drawingwalks', name: 'Ditte Østergaard', specialty: 'Zeichenspaziergänge', studio: 'Drawing Walks',
      blurb: 'Stadtspaziergang und Zeichenworkshop in einem. Ditte geht mit euch durch ein Viertel, erzählt seine Geschichten und gibt unterwegs kurze, verspielte Zeichenübungen — Zeichnen als Art des Sehens, die dich genauer hinschauen lässt und Details entdecken, an denen du sonst vorbeigehst. Skizzenbuch und Material sind dabei; du ziehst dich wettergerecht an und kommst zum Treffpunkt. Ob du seit der Kindheit nicht gezeichnet hast oder dein Skizzenbuch immer dabei ist — du bist willkommen.',
      group: 'Bis 15', duration: '2,75 Std.', place: 'Treffpunkte in ganz Berlin', languages: 'EN' },
    { slug: 'violaine', name: 'Violaine Toth', specialty: 'Drehscheibe & Handaufbau', studio: 'Violaine Toth Ceramic',
      blurb: 'Ein Keramikstudio in Neukölln, das seit 2018 unterrichtet — drei bis sechs Leute an den Scheiben, angeleitet von Violaine oder Brew. Die 2,5-stündige Einsteigersession führt vom Schlagen des Tons bis zum Drehen von Schalen und Zylindern; zwei deiner Stücke glasiert und brennt das Studio danach, abholbereit nach etwa sechs Wochen. Handaufbau und Glasieren laufen in gleicher Größe, eine private Drehstunde nimmt ein bis zwei Personen, und ein Vier-Termine-Kurs verteilt Drehen, Abdrehen und Glasieren über zehn Stunden in einem Monat. Ton, Werkzeug und Brand sind inklusive; unterrichtet wird auf Englisch.',
      group: '3–6', duration: '2–2,5 Std.', place: 'Treptower Str. 12, Neukölln', languages: 'EN' },
    { slug: 'tania', name: 'Tania Varela', specialty: 'Keramik-Handaufbau', studio: 'Tanita Tarara Ceramics',
      blurb: 'Handaufbau ohne Drehscheibe, bei WOMADE im Bikini Berlin — Pinch- und Plattentechnik, die du zu Hause wiederholen kannst. Vier Formate à drei Stunden: ein Frühstücksset aus Tasse und Teller, eine Session mit gemütlicher Brunchpause, Schwarz-Weiß-Dekor mit Sgraffito und Carving, und ein offenes Format für deine eigene Idee. Glasieren und beide Brände übernimmt sie danach und meldet sich, wenn alles fertig ist. Acht Plätze, Material und Brände inklusive.',
      group: 'Bis 8', duration: '3 Std.', place: 'WOMADE, Bikini Berlin 1. OG, Charlottenburg', languages: 'DE · EN · ES · FR' },
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
      group: '≤ 17', duration: '3–4 Std.', place: 'Karlsburger Weg 38, Berlin', languages: 'DE' },
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
  // No footage of the apiary, so this is cut from Kohfink's five photographs
  // the same way the sushi reel is: a second on each, dissolved over a third
  // of one, with a slight push in. A frame lifted out to the class, the group
  // at the hives, the roof apiary, capped honey up close, and the honey room
  // — then back to the first, so the loop has no seam. It sits on the host
  // rather than on a format: all four of their courses are the same bees.
  kohfink: { video: '/video/kohfink.mp4', poster: '/video/kohfink-poster.jpg' },
  // Rebeca's own linocut footage — pulling a print off the press. Supplied
  // by her, audio stripped (the reels play muted anyway).
  rebeca: { video: '/video/rebeca.mp4', poster: '/video/rebeca-poster.jpg' },
  // Nina Kranz's own reel, supplied by her.
  nina: { video: '/video/nina.mp4', poster: '/video/nina-poster.jpg' },
  // Michael's own footage of the Redrum bar — the absinthe fountain and the
  // bottles laid out for a tasting. Audio stripped, as above.
  redrum: { video: '/video/redrum.mp4', poster: '/video/redrum-poster.jpg' },
  // Sarah's writing table mid-session, supplied by her. Audio stripped.
  sarah: { video: '/video/sarah.mp4', poster: '/video/sarah-poster.jpg' },
  // Gestaltwandel's bookbinding film — sewing a signature, then the finished
  // books. Celina's own, audio stripped.
  celina: { video: '/video/celina.mp4', poster: '/video/celina-poster.jpg' },
  // Anne's session reel — props, and everyone photographing each other. Her
  // own, audio stripped; the top band is cropped off to lose the CapCut
  // watermark her export carried.
  anne: { video: '/video/anne.mp4', poster: '/video/anne-poster.jpg' },
  // Violaine's studio — a pot being shaped, then the class at work. Her own,
  // audio stripped.
  violaine: { video: '/video/violaine.mp4', poster: '/video/violaine-poster.jpg' },
  // Angelo's roast start to finish — green beans in the pot, roasted,
  // ground, brewed, tasted. His own, audio stripped.
  angelo: { video: '/video/angelo.mp4', poster: '/video/angelo-poster.jpg' },
  // Nicole's bench: whittling a spoon, the finished carvings, then the soap
  // side of the workshop. Hers, audio stripped.
  //
  // She is on the site twice — "Nicole" for the team events and "Anybody
  // Can Whittle" for the school, whose blurb calls it Nicole's — and only
  // the school carries a source, so the calendar files her eighteen
  // sessions under that slug. Both point at the one reel until the two
  // cards are merged into one host.
  nicole: { video: '/video/nicole.mp4', poster: '/video/nicole-poster.jpg' },
  whittle: { video: '/video/nicole.mp4', poster: '/video/nicole-poster.jpg' },
  // Two clips from the same session five minutes apart, joined in the order
  // they were shot: the goose drawn in pencil, then the same page painted.
  // Hers, and silent to begin with.
  maximiliana: { video: '/video/maximiliana.mp4', poster: '/video/maximiliana-poster.jpg' },
  // Dina's studio, canvases going up on easels. Audio stripped, and trimmed
  // to the session footage — the back half of her clip was a slideshow of
  // Airbnb review screenshots, which is another platform's furniture.
  techno: { video: '/video/techno.mp4', poster: '/video/techno-poster.jpg' },
  // Two finished canvases from her vulva-painting workshop, held up and set
  // on the table. Hers, audio stripped. It replaces reel-3, an unattributed
  // painting clip that was standing in for her — this is her own work, so
  // the carousel and the directory now draw her with it.
  //
  // Short at 4.4s: it is the whole clip, and it loops. Her workshop copy
  // still describes the collective-painting format rather than this one.
  pia: { video: '/video/pia-vulva.mp4', poster: '/video/pia-vulva-poster.jpg' },
  // Senlë Studio's incense bench: the ground blend mixed and weighed, the
  // labelled jars of botanicals, then the trail pressed into the wooden
  // frame. Hers, audio stripped. Her first reel — she had none, so she was
  // absent from the carousel entirely despite carrying fourteen sessions.
  //
  // Her cut names each botanical as it goes in ("Rosemary", "Chamomile",
  // "Nanmu powder") in small type over the picture, the last of them ending
  // about 40.5s in; the 45s–67s window that ships is past all of them.
  faye: { video: '/video/faye.mp4', poster: '/video/faye-poster.jpg' },
  // Her candle table: the long pink runner, the oil bottles, guests dipping
  // and pouring, and the finished jars held up at the end. Hers, audio
  // stripped. Her first reel — she had none, despite twelve dates.
  //
  // Her cut carries one caption ("pov: you spend your evening making scented
  // candles with international women in Berlin") burnt into every frame, in
  // the same place throughout, so there is no clean second to trim to. It
  // sits low, at y 850–985 of the 1280, and the table and the guests are
  // above it — so a 472×840 window off the top of the frame loses it and
  // nothing else. Her general reel rather than a per-workshop one: it is the
  // same table for all four of her formats.
  'galleria-lucia': {
    video: '/video/galleria-lucia.mp4',
    poster: '/video/galleria-lucia-poster.jpg',
  },
  // Fischtal Foodlab: the shelf of ferments, cabbages and citrus in a crate,
  // Jem cutting and talking, the garden the produce comes out of, kombucha
  // on the sideboard. Hers, audio stripped. Her first reel — she had none,
  // so all nine of her dates were falling back to a still.
  //
  // Sent for the fermenting-vegetables workshop, but filed as her general
  // reel: four of her six formats are fermentation (kimchi twice, kombucha,
  // this one), and the other two — sushi and sourdough — are the same
  // kitchen. Her cut opens on a "fermentation is complicated" caption that
  // ends with a cut at 1.4s; it ships from 1.5s.
  jem: { video: '/video/jem.mp4', poster: '/video/jem-poster.jpg' },
  // The school's benches, in the order their own montage runs them: a pot
  // rising on the wheel, a slab cut to a paper pattern, handbuilding, the
  // engobe-decorated pieces, glaze mixed, colour brushed on. Theirs, audio
  // stripped. Their first reel — they had none, despite carrying ninety-two
  // sessions across twenty-two formats, more than any other host.
  //
  // Their cut is a studio promo, branded on every single frame: the CK mark
  // bottom left, "art school & shared workspace in berlin neukölln since
  // 2016" bottom right, and the technique named top right. There is no clean
  // second in it, so this is cropped rather than trimmed around — a 450×800
  // window out of the middle of the frame clears all three — and the closing
  // card of services is trimmed off, its text sitting too far in for any
  // crop to reach.
  'ceramic-kingdom': {
    video: '/video/ceramic-kingdom.mp4',
    poster: '/video/ceramic-kingdom-poster.jpg',
  },
  // Karen-Rose's herb- and flower-salt table: the salt going into the jar,
  // the blossoms stirred through it, and the finished KRÄUTERSALZ. Hers,
  // audio stripped like the rest.
  //
  // Her cut opened and closed on story captions burnt into the picture
  // ("Kräuter- und Blütensalze herstellen als Team Event", and a mail-us
  // card at the end), both of them set over the middle of the frame where
  // no crop reaches. The clean stretch between them — 3.6s to 19.55s of the
  // original — is what ships; nothing is painted over or blurred.
  'karen-rose': { video: '/video/karen-rose.mp4', poster: '/video/karen-rose-poster.jpg' },
};

/** Reels for a single workshop rather than a whole host. A host running
 *  several formats can have footage of each, and the feed prefers the
 *  workshop's own over the host's general one on that workshop's cards.
 *  Keyed by host slug, then by the title exactly as the feed carries it —
 *  the German original, which is what both languages are built from. */
type Reel = { video: string; poster: string };

/** A workshop with more than one reel shows them in turn across its dates —
 *  see `pick` on getWorkshopReel below. */
const workshopReels: Record<string, Record<string, Reel | Reel[]>> = {
  nina: {
    'Klang & Farbe': {
      video: '/video/nina-klang-farbe.mp4',
      poster: '/video/nina-klang-farbe-poster.jpg',
    },
    // Her two sound-relaxation classes are not painting, so her general
    // reel — a painting table — was the wrong thing to show on them. This
    // is the sound-bath stretch of the same footage, cut on its own: the
    // bowls, and the room lying on mats. Nothing in the clip is specific to
    // the pregnancy class, but the practice on screen is the one taught.
    'Klangentspannung': {
      video: '/video/nina-klangentspannung.mp4',
      poster: '/video/nina-klangentspannung-poster.jpg',
    },
    'Klangentspannung für Schwangere': {
      video: '/video/nina-klangentspannung.mp4',
      poster: '/video/nina-klangentspannung-poster.jpg',
    },
  },
  // Karen-Rose teaches half a dozen formats, so hers are keyed by topic
  // rather than by one dated title: every future Duftkerzen date plays the
  // candle reel, every Terrazzo one the terrazzo reel, every Naturkosmetik
  // one the cosmetics reel, whatever wording her booking page carries that
  // month. Every format she runs is covered now; her general reel, the
  // herb-salt table, is what the hosts carousel still draws her with and
  // what any format she adds falls back to until it has footage of its own.
  'karen-rose': {
    // Terrazzo chips being crushed and spread with tweezers. Hers, audio
    // stripped. One 46-second take with a single "Satisfying" sticker near
    // the top between roughly 12.8s and 15.5s; the 20s–36s window that ships
    // is well clear of it on both sides.
    Terrazzo: {
      video: '/video/karen-rose-terrazzo.mp4',
      poster: '/video/karen-rose-terrazzo-poster.jpg',
    },
    // The candle bench: wax melting in the bain-marie, the studio wall, the
    // pour, and the finished jars dressed with petals. Hers, audio stripped
    // — kept whole at her request, so her own Instagram handle sticker and
    // the "Schön war's!" end card are still in the picture.
    Duftkerzen: {
      video: '/video/karen-rose-duftkerzen.mp4',
      poster: '/video/karen-rose-duftkerzen-poster.jpg',
    },
    // The cosmetics bench itself: melting over the bain-marie, powder on the
    // scale, essential oil from the dropper, kneading, the finished bar in
    // her hands. Hers, audio stripped, and clean — no captions anywhere in
    // it. Covers all three of her cosmetics formats (the 3h workshop, its
    // Essentials cut, and the shampoo one), which had been falling back to
    // the herb-salt table.
    Naturkosmetik: {
      video: '/video/karen-rose-naturkosmetik.mp4',
      poster: '/video/karen-rose-naturkosmetik-poster.jpg',
    },
    // The shampoo bar start to finish: the base melted over the bain-marie,
    // weighed, worked to a paste, kneaded and pressed into the mould. Hers,
    // audio stripped, no captions in it, so it ships whole.
    //
    // Keyed on both words rather than "Shampoo" alone. Her title carries
    // "Naturkosmetik" too, and the longest matching key wins — a bare
    // "Shampoo" would lose to it and the class would keep playing the
    // cosmetics reel.
    'Shampoo Naturkosmetik': {
      video: '/video/karen-rose-shampoo.mp4',
      poster: '/video/karen-rose-shampoo-poster.jpg',
    },
    // Soap, two of them, shown in turn across her dates: the first is the
    // cured loaves out of their wooden moulds and cut into bars, dried
    // flowers through every one; the second is the class that made them —
    // weighing, mixing, the swirled batter poured into the moulds. Both
    // hers, audio stripped.
    //
    // Her cut is captioned start to finish — a typewriter track that runs
    // the length of it — so this is the one reel where the text is cropped
    // out rather than trimmed around. Everything after the opening "POV"
    // block sits below y=880 of the 1280, and the work is in the top two
    // thirds, so a 490×870 window off the top of the frame loses the
    // captions and nothing else. The opening block reaches higher, to about
    // y=754, so the cut starts past it at 14s.
    Seife: [
      { video: '/video/karen-rose-seife.mp4', poster: '/video/karen-rose-seife-poster.jpg' },
      { video: '/video/karen-rose-seife-2.mp4', poster: '/video/karen-rose-seife-2-poster.jpg' },
    ],
  },
  // Live, not dormant: her Vulva Painting Workshop runs weekly out of
  // vulvas.berlin (a recurring entry rather than a dated one) and takes
  // private groups on request, and both titles carry the word. Same file as
  // her general reel for the moment; they part company as soon as she has
  // footage of the collective-painting format her copy describes.
  pia: {
    Vulva: { video: '/video/pia-vulva.mp4', poster: '/video/pia-vulva-poster.jpg' },
  },
  'galleria-lucia': {
    // The dye pots, a taper going in, and the racks of finished candles.
    // Hers, audio stripped. Her other two formats keep her general reel —
    // the candle table — which is what they actually look like.
    //
    // Her cut carries a caption across the middle of the frame rather than
    // low down, so no crop clears it cheaply: what ships is the 337×600
    // window below it, about half the picture, upscaled 1.6× to 540 wide
    // (encoded a notch finer than the rest to carry that). The candles are
    // what survives, which for this workshop is the right half to keep.
    'Dip-Dye': {
      video: '/video/galleria-lucia-dipdye.mp4',
      poster: '/video/galleria-lucia-dipdye-poster.jpg',
    },
  },
  // Keyed by topic: Jem runs the sourdough course on repeat, so every future
  // Sauerteig date of hers plays this. The word only appears in that one
  // format of hers — the other Sauerteig classes on the site are
  // Pasta Madre's, and this map is per host, so they are not touched.
  jem: {
    // Two of her own clips joined: the workshop table first — people
    // weighing, the starter jars, the finished loaves and the recipe sheets
    // — then a half-second fade into the dough itself, rye and wheat side by
    // side under their lids. Audio stripped. The first had a
    // "Can you tell which sourdough is which?" caption over the opening
    // 4.6 seconds, so it starts at 4.8s, past it.
    Sauerteig: {
      video: '/video/jem-sauerteig.mp4',
      poster: '/video/jem-sauerteig-poster.jpg',
    },
    // The vegetable class: cabbage shredded into the bowls, the tamper going
    // into the jars, and the table of them at the end. Hers, audio stripped,
    // no caption anywhere in it, so it ships whole. Covers both her dates —
    // one title, one topic key.
    Fermenting: {
      video: '/video/jem-fermenting.mp4',
      poster: '/video/jem-fermenting-poster.jpg',
    },
    // Hands turning cabbage through the gochugaru in the bowl, the jars from
    // an earlier batch lined up behind. Hers, audio stripped, no caption.
    // The key catches both wordings she books this under — "Let's make
    // Kimchi!" and "Kimchi selber machen!".
    Kimchi: {
      video: '/video/jem-kimchi.mp4',
      poster: '/video/jem-kimchi-poster.jpg',
    },
    // No footage of the sushi class, so this one is built from her nine
    // stills, cut in the order the evening runs: the plated result, the
    // room, the bench of tools, the ingredients, nori and rice laid on the
    // mat, hands rolling, the three finished rolls, the cut maki, and the
    // bowl at the end. Each is held two seconds and dissolved into the next
    // over half of one, with a slow 5% push in so it moves like a clip
    // rather than a gallery. Landscape shots sit on a blurred fill of
    // themselves so nothing is cropped away, and it opens and closes on the
    // same plate, so the loop has no seam.
    Sushi: {
      video: '/video/jem-sushi.mp4',
      poster: '/video/jem-sushi-poster.jpg',
    },
  },
};

/** What a workshop puts on its card beyond the price and the clock — the one
 *  thing that decides it for somebody. Bilingual, and keyed by host slug then
 *  by the title exactly as the feed carries it (the German original, as with
 *  the reels).
 *
 *  Exact titles only, deliberately: no topic matching here. A reel landing on
 *  a neighbouring class of the same craft is a cosmetic slip, but "take home
 *  4 products" landing on a class that gives you two is a promise the site
 *  cannot keep. Her 2-hour Essentials cut and her shampoo class both carry
 *  "Naturkosmetik" in the title and both would have been caught by a topic
 *  key. So a workshop whose wording drifts loses its label rather than
 *  lending it to the wrong course — list the new title here and it is back.
 *
 *  Keep them to two or three words: this sits under a card title, not in
 *  place of the copy. */
const workshopUsps: Record<string, Record<string, { en: string; de: string }>> = {
  'karen-rose': {
    // Her own catalogue for this one: four finished products go home with
    // you. The 3-hour class only — Essentials is the shorter cut and nobody
    // has told us it is the same four.
    'Bio Naturkosmetik Workshop': {
      en: 'Take home 4 products',
      de: '4 Produkte mitnehmen',
    },
    // Of the two labels offered for this one — a small group, or one to give
    // away — the gift reading is the one that does not turn into a claim we
    // would have to stand behind: her listed group size is 4–12, which is
    // not small enough to promise in print.
    'Keramikgießen | Terrazzo Workshop': {
      en: 'Great as a gift',
      de: 'Gut zum Verschenken',
    },
  },
  'galleria-lucia': {
    // Straight off her own listing: a glass of Prosecco is included, and it
    // is the one thing that separates this class from her other two.
    'Candles & Prosecco: Scented Candle Workshop in Berlin': {
      en: 'Prosecco included',
      de: 'Prosecco inklusive',
    },
    // The card already carries an EN pill beside the duration, so this is
    // the same fact said louder. It earns its place on the German page,
    // where a German reader is choosing a class taught in English; on the
    // English page it tells an English reader something they assumed.
    'Dip-Dye & Design - Taper Candle Workshop in Berlin': {
      en: 'Held in English',
      de: 'Auf Englisch',
    },
  },
  jem: {
    // Her own listing: two jars of sauerkraut and brined pickles go home
    // with you, and they carry on fermenting on your counter.
    'Fermenting Vegetables: A Hands-On Workshop in Berlin': {
      en: 'Take home 2 jars',
      de: '2 Gläser mitnehmen',
    },
    // Her listing sends three things home — the written method, a rye or
    // wheat starter, and the pre-dough you made. The starter is the one that
    // keeps working after the class, so it is the one on the card.
    'Sauerteigbrot leicht gemacht: Backkurs in Berlin': {
      en: 'Take home a starter',
      de: 'Starter zum Mitnehmen',
    },
    // Two jars again, this time kimchi — listed under both of her wordings,
    // since this map matches titles exactly and never by topic.
    "Let's make Kimchi!": {
      en: 'Take home 2 jars',
      de: '2 Gläser mitnehmen',
    },
    'Kimchi selber machen!': {
      en: 'Take home 2 jars',
      de: '2 Gläser mitnehmen',
    },
    // Three rolls, not one: hosomaki, chu-maki and uramaki. That is what
    // separates this from an evening of making cucumber rolls, and it is
    // the promise her own page leads with.
    'Sushi workshop: roll your own sushi in Berlin': {
      en: 'Roll 3 maki types',
      de: '3 Maki-Sorten rollen',
    },
  },
  kohfink: {
    // Straight off their page: the practice runs on up to 20 real colonies
    // across the five dates, which is what separates this from a course
    // taught on one demonstration hive.
    'Klassischer Einsteigerkurs (5 Termine, Apr–Jun)': {
      en: '20 real bee colonies',
      de: 'An 20 Bienenvölkern',
    },
    // The one label here that is not a selling point. Their own page calls
    // this a lecture that prepares you for a practical course at a Berlin
    // beekeeping club — a day in a room, no hive opened. At €18 beside their
    // €200 hands-on courses, and under a reel of people standing at the
    // hives, somebody would otherwise book it expecting bees.
    'Theoriekurs: Einführung in die Imkerei': {
      en: 'Theory only',
      de: 'Nur Theorie',
    },
  },
};

/** A workshop's label, in this language, if it has one. */
export const getWorkshopUsp = (slug: string, title: string, lang: Lang): string | undefined =>
  workshopUsps[slug]?.[title]?.[lang];

/** The reel for one workshop, if it has its own.
 *
 *  An exact title wins; failing that the title is matched against the keys
 *  as topics — the longest key it contains, case-insensitively. Footage of a
 *  format is footage of that format whenever it next runs, and a host's own
 *  wording drifts between dates ("Duftkerzen Workshop (vegan + nachhaltig)"
 *  one month, "Duftkerzen Workshop Berlin" the next), which an exact key
 *  would silently stop matching. Longest-first so a specific key still beats
 *  a general one that happens to be a substring of the same title. */
export const getWorkshopReel = (
  slug: string,
  title: string,
  /** Which reel to take where a workshop has several — its position among
   *  that workshop's dates, so consecutive dates alternate rather than every
   *  card of a workshop showing the same clip. Wraps, so any count works. */
  pick = 0,
): Reel | undefined => {
  const forHost = workshopReels[slug];
  if (!forHost) return undefined;
  const haystack = title.toLowerCase();
  const topicKey = Object.keys(forHost)
    .filter((key) => haystack.includes(key.toLowerCase()))
    .sort((a, b) => b.length - a.length)[0];
  const entry = forHost[title] ?? (topicKey ? forHost[topicKey] : undefined);
  if (!entry) return undefined;
  const reel = Array.isArray(entry)
    ? entry[((pick % entry.length) + entry.length) % entry.length]
    : entry;
  return { video: withBase(reel.video), poster: withBase(reel.poster) };
};

export const getHosts = (lang: Lang): Host[] =>
  hostsCopy[lang].map((h, i) => {
    const reel = reels[h.slug];
    const photo = shipped(`/img/hosts/${h.slug}.jpg`);
    const wide = shipped(`/img/hosts/${h.slug}-wide.jpg`);
    return {
      ...h,
      ...facets[h.slug],
      id: i + 1,
      ...(photo ? { photo } : {}),
      ...(wide ? { wide } : {}),
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
    empty: 'No host matches every filter. Try widening one.',
    activities: {
      ceramics: 'Ceramics', art: 'Art & print', craft: 'Craft & making',
      food: 'Food & drink', photography: 'Photography', wellbeing: 'Wellbeing',
      music: 'Music & rhythm',
    },
    groups: { small: 'Up to 10', medium: '10–30', large: '30+' },
    durations: { short: 'Up to 2 h', medium: '2–4 h', long: 'Half day or more' },
    priceLabel: 'Price per person',
    prices: { budget: 'Under €50', mid: '€50–100', high: '€100–200', premium: '€200+' },
    priceMeta: 'Per person',
    priceUnknown: 'On request',
  },
  de: {
    activityLabel: 'Aktivität',
    groupLabel: 'Gruppengröße',
    durationLabel: 'Dauer',
    all: 'Alle',
    clear: 'Filter zurücksetzen',
    count: (n: number) => (n === 1 ? '1 Gastgeber' : `${n} Gastgeber`),
    empty: 'Kein Gastgeber passt zu allen Filtern. Erweitere einen davon.',
    activities: {
      ceramics: 'Keramik', art: 'Kunst & Druck', craft: 'Handwerk',
      food: 'Essen & Trinken', photography: 'Fotografie', wellbeing: 'Wohlbefinden',
      music: 'Musik & Rhythmus',
    },
    groups: { small: 'Bis 10', medium: '10–30', large: '30+' },
    durations: { short: 'Bis 2 Std.', medium: '2–4 Std.', long: 'Ab einem halben Tag' },
    priceLabel: 'Preis pro Person',
    prices: { budget: 'Unter 50 €', mid: '50–100 €', high: '100–200 €', premium: 'Ab 200 €' },
    priceMeta: 'Pro Person',
    priceUnknown: 'Auf Anfrage',
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
  photo?: string;
  video?: string;
  poster?: string;
  /** Its place in the arrival sequence — 1 plays first, 2 second, three
   *  seconds each, and then the feed waits for a pointer. A card without a
   *  number never plays on its own. */
  intro?: number;
  /** Drawn with its heart filled, the way a saved event looks in the app. */
  liked?: boolean;
};

const phoneCardsCopy: Record<Lang, Omit<PhoneCard, 'video' | 'poster'>[]> = {
  // Card 1's copy names what its reel actually shows — Maximiliana's bird
  // sketching, since hers is the clip on the feed's headline card. Pairing
  // a "Bachata" title with that footage would have the mockup showing a
  // video of the wrong thing. Card 2 is info-only (its thumbnail sits
  // scrolled off the top of the feed, as in the app), so its copy is free
  // to stay the screenshot's.
  en: [
    { id: 'phone-front-1', title: 'Bird sketching & watercolour', date: 'Mon, Oct 16', time: '9AM–10.30AM',
      liked: true, photo: '/img/hero/bachata.jpg' },
    { id: 'phone-front-2', title: 'Wood & soap carving', date: 'Mon, Oct 16', time: '4PM–6PM',
      photo: '/img/hero/bouldering.jpg' },
    { id: 'phone-front-3', title: 'DIY coffee roasting', photo: '/img/hero/cooking.jpg' },
    { id: 'phone-front-4', title: 'Wheel throwing & handbuilding', photo: '/img/hero/hiking.jpg' },
  ],
  de: [
    { id: 'phone-front-1', title: 'Vogelskizzen & Aquarell', date: 'Mo., 16. Okt.', time: '9–10.30 Uhr',
      liked: true, photo: '/img/hero/bachata.jpg' },
    { id: 'phone-front-2', title: 'Holz- & Seifenschnitzen', date: 'Mo., 16. Okt.', time: '16–18 Uhr',
      photo: '/img/hero/bouldering.jpg' },
    { id: 'phone-front-3', title: 'DIY-Kaffeerösten', photo: '/img/hero/cooking.jpg' },
    { id: 'phone-front-4', title: 'Töpferscheibe & Handaufbau', photo: '/img/hero/hiking.jpg' },
  ],
};

/** Reels inside the phone mockup, by card id. A card with an entry here
 *  plays its clip in the thumbnail; one without stays a still. This is the
 *  swap point for real footage: drop `reel-N.mp4` + poster into
 *  `public/video/`, point the card's entry at it, and the mockup plays it —
 *  nothing else needs changing.
 *
 *  Card 1 is the headline card — tall, titled, with a host line — so it
 *  carries a real host's real footage: Maximiliana sketching a goose and
 *  then painting it, and the card's title and host name say so.
 *
 *  Card 2, the titled card opposite it, carries Nicole's carving and names
 *  her too. Both cards name a real host, so both must show that host's own
 *  footage — and card 2 waits for the pointer rather than playing with the
 *  rest, since two titled cards running at once fight for the eye.
 *
 *  Cards 3 and 4 show media alone, their info cropped by the app's bottom
 *  nav, so neither puts a name to what it is playing. */
/* On arrival the feed plays itself in twice: the top-left card for three
   seconds, then the one diagonally opposite at the bottom right for three,
   and then it holds still. After that every card answers the pointer — hover
   one and it plays, and whatever was playing stops, so only ever one clip
   moves at a time. Only the two numbered here ever start by themselves, and
   only once per visit. */
const phoneReels: Record<string, { video: string; poster: string; intro?: number }> = {
  'phone-front-1': { video: '/video/maximiliana.mp4', poster: '/video/maximiliana-poster.jpg', intro: 1 },
  'phone-front-2': { video: '/video/nicole.mp4', poster: '/video/nicole-poster.jpg' },
  // Angelo's is much the heaviest file, so it is the better one to leave off
  // the arrival pair — preload="none" means it costs nothing until a pointer
  // asks for it.
  'phone-front-3': { video: '/video/angelo.mp4', poster: '/video/angelo-poster.jpg' },
  'phone-front-4': { video: '/video/violaine.mp4', poster: '/video/violaine-poster.jpg', intro: 2 },
};

/** The sample cards inside the phone mockup. */
export const getPhoneCards = (lang: Lang): PhoneCard[] =>
  phoneCardsCopy[lang].map((card) => {
    const reel = phoneReels[card.id];
    return {
      ...card,
      photo: card.photo ? withBase(card.photo) : undefined,
      ...(reel
        ? {
            video: withBase(reel.video),
            poster: withBase(reel.poster),
            ...(reel.intro ? { intro: reel.intro } : {}),
          }
        : {}),
    };
  });

const phoneFiltersCopy: Record<Lang, string[]> = {
  en: ['All', 'Today', 'Tomorrow', 'Free', 'Paid'],
  de: ['Alle', 'Heute', 'Morgen', 'Kostenlos', 'Kostenpflichtig'],
};

export const getPhoneFilters = (lang: Lang): string[] => phoneFiltersCopy[lang];
