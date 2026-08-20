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
  | 'ceramics' | 'art' | 'craft' | 'food' | 'photography' | 'wellbeing';

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
  rebeca:       { activity: 'art',         groupRange: [3, 24],   hourRange: [2, 3] },
  nicole:       { activity: 'craft',       groupRange: [2, 12],   hourRange: [2.5, 5] },
  celina:       { activity: 'craft',       groupRange: [1, 100],  hourRange: [2, 4] },
  evelyn:       { activity: 'craft',       groupRange: [1, 50],   hourRange: [3, 3] },
  nina:         { activity: 'art',         groupRange: [10, 150], hourRange: [4, 16] },
  helka:        { activity: 'ceramics',    groupRange: [1, 30],   hourRange: [1.5, 3] },
  jem:          { activity: 'food',        groupRange: [1, 40],   hourRange: [3, 4] },
  'loom-lab':   { activity: 'ceramics',    groupRange: [4, 6],    hourRange: [4, 4] },
  maximiliana:  { activity: 'art',         groupRange: [3, 12],   hourRange: [3, 3] },
  pia:          { activity: 'art',         groupRange: [4, 20],   hourRange: [2, 2] },
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
      blurb: 'Two hands-on formats: bold linocut printmaking, or a portrait-painting session where teammates paint each other and take the canvas home. Playful and made to bring the team closer.',
      group: '3–24', duration: '2–3 h', place: 'Prenzlauer Berg / mobile', languages: 'EN · DE · PT · ES' },
    { slug: 'nicole', name: 'Nicole', specialty: 'Wood & soap carving', studio: 'Anybody Can Whittle',
      blurb: 'Mindful carving workshops that pull teams out of screen-time and into a calm, hands-on craft. Learn freehand technique with simple hand tools and turn wood or soap into your own handmade object.',
      group: '2–4 studio · 5–12 on-site', duration: '2.5–5 h', place: 'Charlottenburg / on-site', languages: 'DE · EN' },
    { slug: 'celina', name: 'Celina', specialty: 'Bookbinding, mosaic & stamps', studio: 'Gestaltwandel',
      blurb: 'Switch off and get making — expert-guided craft in a calm, light-filled studio: bookbinding, mosaic tiles, straw stars or carved stamps. No experience needed, and formats adapt to your team.',
      group: 'Up to 20 studio · 50–100 mobile', duration: '2–4 h', place: 'Koloniestrasse 111, Berlin', languages: 'DE · EN' },
    { slug: 'evelyn', name: 'Evelyn Cseh', specialty: 'Textile printing & mixed craft', studio: 'Tuka Creative Club',
      blurb: 'A safe space where adults can be kids again — mindful, beginner-friendly craft: tote printing and painting, cross-stitch, kumihimo charms, watercolour, vision boarding and glass painting.',
      group: '≤12 studio · 40–50 on-site', duration: '3 h', place: 'Ohma Studio / on-site', languages: 'EN · DE' },
    { slug: 'nina', name: 'Nina Kranz', specialty: 'Collective acrylic painting',
      blurb: 'Create together on one big collective canvas — or your own piece — with acrylics, palette knives, markers and textures. Guided step by step; it is about expression and flow rather than perfection.',
      group: '10–150', duration: 'Half day – multi-day', place: 'Your office / a venue, Germany-wide', languages: 'DE' },
    { slug: 'helka', name: 'Helka', specialty: 'Wheel throwing & handbuilding',
      blurb: 'Two ceramic formats: wheel throwing, learning the basics of the potter\u2019s wheel; or handbuilding for bigger groups, from pinching to slab building. Everyone keeps one or two pieces.',
      group: 'Up to 8 · 4–30', duration: '1.5–3 h', place: 'Our studio / your space', languages: 'EN' },
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
  ],
  de: [
    { slug: 'qian', name: 'Qian', specialty: 'Töpfern & Aufbaukeramik', studio: 'Clay Garden Pottery Studio',
      blurb: 'Töpfern zum Anfassen — ruhig, kreativ und ideal für Anfänger. Teams lernen die Grundlagen und formen ihre eigenen Keramikstücke zum Mitnehmen.',
      group: 'Bis 8', duration: '2 Std.', place: 'Clay Garden Studio / euer Büro', languages: 'EN' },
    { slug: 'rebeca', name: 'Rebeca', specialty: 'Linoldruck & Porträtmalerei', studio: 'Arte Gorda',
      blurb: 'Zwei Formate zum Mitmachen: ausdrucksstarker Linoldruck oder eine Porträtmalerei-Session, in der sich das Team gegenseitig malt und die Leinwand mitnimmt.',
      group: '3–24', duration: '2–3 Std.', place: 'Prenzlauer Berg / mobil', languages: 'EN · DE · PT · ES' },
    { slug: 'nicole', name: 'Nicole', specialty: 'Holz- & Seifenschnitzen', studio: 'Anybody Can Whittle',
      blurb: 'Achtsames Schnitzen, das Teams aus der Bildschirmzeit holt. Freihandtechnik mit einfachem Handwerkzeug — aus Holz oder Seife entsteht ein eigenes Objekt.',
      group: '2–4 Studio · 5–12 vor Ort', duration: '2,5–5 Std.', place: 'Charlottenburg / vor Ort', languages: 'DE · EN' },
    { slug: 'celina', name: 'Celina', specialty: 'Buchbinden, Mosaik & Stempel', studio: 'Gestaltwandel',
      blurb: 'Abschalten und gestalten — angeleitetes Handwerk im hellen Studio: Buchbinden, Mosaikfliesen, Strohsterne oder geschnitzte Stempel. Ohne Vorkenntnisse.',
      group: 'Bis 20 Studio · 50–100 mobil', duration: '2–4 Std.', place: 'Koloniestraße 111, Berlin', languages: 'DE · EN' },
    { slug: 'evelyn', name: 'Evelyn Cseh', specialty: 'Textildruck & Mixed Craft', studio: 'Tuka Creative Club',
      blurb: 'Ein Raum, in dem Erwachsene wieder Kind sein dürfen: Taschendruck, Kreuzstich, Kumihimo-Anhänger, Aquarell, Vision Boarding und Glasmalerei.',
      group: '≤12 Studio · 40–50 vor Ort', duration: '3 Std.', place: 'Ohma Studio / vor Ort', languages: 'EN · DE' },
    { slug: 'nina', name: 'Nina Kranz', specialty: 'Kollektive Acrylmalerei',
      blurb: 'Gemeinsam an einer großen Leinwand malen — oder am eigenen Bild — mit Acryl, Spachteln, Markern und Texturen. Schritt für Schritt angeleitet.',
      group: '10–150', duration: 'Halbtags – mehrtägig', place: 'Euer Büro / eine Location, deutschlandweit', languages: 'DE' },
    { slug: 'helka', name: 'Helka', specialty: 'Drehscheibe & Aufbaukeramik',
      blurb: 'Zwei Keramik-Formate: Arbeiten an der Töpferscheibe oder Aufbaukeramik für größere Gruppen. Jede und jeder behält ein bis zwei Stücke.',
      group: 'Bis 8 · 4–30', duration: '1,5–3 Std.', place: 'Unser Studio / euer Raum', languages: 'EN' },
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
