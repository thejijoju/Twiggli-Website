/** Hosts in preview: interested makers whose Twiggli page is built for them
 *  to look at and approve before it goes live.
 *
 *  A preview host's page builds at its usual URL
 *  (/workshops/<activity>/<slug>/, in every language) but is noindex, left
 *  out of the sitemap (astro.config.mjs reads preview-slugs.json), and kept
 *  out of every listing: getHosts() leaves these slugs out unless asked
 *  with `withPreview`, which only the host pages do. So they reach no
 *  directory, calendar, activity page, search, count or the corporate page —
 *  only someone with the link sees them. Their dated sessions sit in
 *  hostDates.ts like anyone's and likewise reach only their own page.
 *
 *  To put a host live: move their copy into hostsCopyBase (content.ts),
 *  their facets/first name/area into the tables there, and delete their
 *  slug from preview-slugs.json. Copy is English and German; the other
 *  languages fall back to the English (content.ts `align`).
 *
 *  Everything below is from the host's own website, their listings on
 *  booking platforms, and their emails to Jirel (October 2026). Photos are
 *  from their websites and listings, used for these previews with Jirel's
 *  go-ahead; they still need the host's OK before the page goes live. */
import type { Host, HostCopy } from '../content.ts';
import slugs from './preview-slugs.json';

type Facets = Pick<Host, 'activity' | 'alsoIn' | 'groupRange' | 'hourRange' | 'groupPrice'>;

/** A format the host runs on request — no public date. Shown in the "on
 *  request" block of their page. */
export type PreviewOffer = {
  title: string;
  titleEn?: string;
  duration?: string;
  price?: string;
  district?: string;
  url: string;
};

export const previewSlugs = new Set<string>(slugs);

const en: HostCopy[] = [
  // Diana, emails of 23.10.26: groups from 5 at €65 pp, up to 15 in her
  // studio, or at the company's (travel and set-up extra); terrazzo ~2.5 h,
  // marble effect ~2 h; tea, coffee and snacks included, wine on request.
  { slug: 'rtmis', name: 'RtmiS', specialty: 'Terrazzo & marble-effect workshops', studio: 'RtmiS [ár.te.mis]',
    blurb: 'Diana’s studio sits in a 150-year-old former fire station in Wedding. In her terrazzo workshop you mix your own pigments, blend a colour palette and pour it into eco-friendly gypsum resin, and take home a terrazzo object, a coaster for example, that nobody else has. In the marble-effect workshop you pour, swirl and blend colours into a marbled tray, then seal it. No experience needed, all materials included, with tea, coffee and snacks (wine on request). For teams she runs both formats privately, in her studio or at your office.',
    group: '5–15 in the studio · larger at your office', duration: '2–2.5 h', place: 'Stockholmer Str. 4, Wedding / your office', languages: 'DE · EN',
    priceNote: '€65 per person for groups from 5 · public classes €79' },
  // William, 23.10.26: new bar Ausschank 2 by Görlitzer Park, with a
  // kitchen, for tastings, brewing classes, private parties and company
  // events. Prices and formats from strassenbraeu.de (shop, 23.10.26).
  { slug: 'strassenbraeu', name: 'Straßenbräu', specialty: 'Beer tastings & brewing classes', studio: 'Straßenbräu',
    blurb: 'Berlin craft brewery that has brewed at Ostkreuz since 2015 and in its own brewery in Marzahn since 2021. Its new bar, Ausschank 2, opened right by Görlitzer Park in Kreuzberg: 14 taps, high ceilings, old-Berlin charm and a kitchen. In the beer tasting (2 hours, from five people) you taste seven beers straight from the tap and learn how beer is brewed, where its colours come from and what malt and hops taste like. The brewing class runs five hours with one of their brewers, with a tasting of all their beers, lunch and a litre of your own beer to take home. For Christmas parties and team events they put together full packages with food and drinks.',
    group: 'From 5', duration: '2–5 h', place: 'Ausschank 2, Görlitzer Str. 52, Kreuzberg', languages: 'DE · EN',
    priceNote: 'beer tasting · brewing class €114' },
  // Jon, 23.10.26 ("Sounds interesting"). Dates and price from their
  // Konfetti listing (23.10.26); the bar is at Veteranenstraße 11.
  { slug: 'beavis-bar', name: 'Beavis Bar', specialty: 'Craft spirits & whisky tastings', studio: 'Beavis Bar',
    blurb: 'A small bar in Mitte with more than 1,400 craft spirits from small distilleries around the world, many of which you will not find anywhere else in Berlin. In their whisky tasting you nose and taste five or six craft whiskies, rarities among them, while the bartender tells the story behind each bottle — for newcomers and connoisseurs alike. Ninety minutes, up to twelve people, in German, English, French or Italian. For teams and Christmas parties the tasting runs privately, a far more memorable evening than the usual open bar.',
    group: '4–12 · groups best Wed–Thu, one week\'s notice', duration: '1.5 h', place: 'Veteranenstraße 11, Mitte', languages: 'DE · EN · FR · IT' },
  // Manuel, 23.10.26 ("ruf gerne durch"). From waldsamkeit.de (23.10.26).
  { slug: 'waldsamkeit', name: 'Waldsamkeit', specialty: 'Wild herb walks', studio: 'Waldsamkeit',
    blurb: 'Waldsamkeit runs nature walks with a scientific background: biologist Manuel Larbig and his team of young naturalists check old plant lore against the studies rather than repeating it. On the classic three-hour wild herb walk you get to know at least twenty wild plants in a Berlin park or forest: which are edible, which have a healing effect, which poisonous look-alikes to avoid, and where their names come from. Groups stay small, twelve at most. The longer walk ends with a picnic and wild-herb butter, and for companies they design team days in nature around your group.',
    group: 'Up to 12 on public walks · teams on request', duration: '3–6 h', place: 'Parks and forests across Berlin', languages: 'DE · EN' },
  // Máté, 23.10.26. Formats, prices and dates from their Konfetti store
  // (23.10.26); the metal workshop runs at Weichselplatz 3–4.
  { slug: 'zoenoteka', name: 'ZÖNOTÉKA', specialty: 'Welding, tufting, sugar art & more', studio: 'ZÖNOTÉKA',
    blurb: 'A non-profit project space in Neukölln, founded in 2014, that is part workshop, part gallery: a well-equipped workshop for wood and foam, a self-built CNC machine, and a changing cast of artists and instructors. That makes for workshops you will not find elsewhere: weld your own metal lampshade with MIG/MAG, make a silver ring, tuft a small rug over a weekend, shape lollipops in the Japanese sugar art of amezaiku, screen print, cyanotype, zines, or build and play your own MIDI instrument. Small groups, no experience needed.',
    group: '1–8 depending on the workshop', duration: '2.5–8 h', place: 'Hobrechtstraße 54, Neukölln', languages: 'DE · EN' },
  // Micha, 23.10.26 ("Klingt erstmal gut"). Courses from hobbytischlerei.de;
  // dates and prices from their Konfetti listings (23.10.26).
  { slug: 'hobbytischlerei', name: 'Hobbytischlerei', specialty: 'Woodworking courses', studio: 'Hobbytischlerei',
    blurb: 'A real joinery workshop in Kaulsdorf where you learn woodworking in theory and practice, from hand tools to professional machines. The most popular course is the end-grain cutting board: from fine woods such as olive or zebrano you glue, cut, sand and oil a board that you design yourself, with a handle groove, juice channel or soft edge. Other courses cover dovetails by hand, power tools, the professional machines and surface finishing, or building a rustic stool. Small groups of up to four, all materials included; you can also hire the workshop for your own project.',
    group: '1–4 per course', duration: '5–8 h', place: 'Alt-Kaulsdorf 52, Kaulsdorf', languages: 'DE' },
  // Yahel, 23.10.26: pass requests on, she replies with an offer. Formats,
  // dates and prices from her Konfetti listings (23.10.26).
  { slug: 'yahelis', name: 'Yahelis', specialty: 'Chocolate & patisserie workshops', studio: 'Yahelis',
    blurb: 'Pastry chef Yahel Michaeli teaches in her baking studio in Friedrichshain. In the chocolate workshop you learn to temper chocolate and make medallions, pralines and truffles; in the macaron workshop, the secrets of the most colourful dessert in patisserie; and there are classes in pâte à choux, tarts, puff pastry and yeast dough. Everything you make goes home with you. For teams she runs private macaron and chocolate events, and for Christmas a festive pastry workshop — branded aprons on request.',
    group: '6–15', duration: '3.5–4 h', place: 'Pettenkoferstraße 43, Friedrichshain', languages: 'EN' },
  // Eric, 23.10.26 ("sounds goode"). From grooveinfocus.com and their
  // Konfetti listings (23.10.26).
  { slug: 'groove-in-focus', name: 'Groove in Focus', specialty: 'Hip-hop & afro dance', studio: 'Groove in Focus',
    blurb: 'Eric Dodji’s dance school for adults in Neukölln teaches hip-hop and afro as freestyle: you learn the basics and how to find your own groove rather than memorise a routine, without pressure, whether you have danced before or not. The weekly classes run on Monday evenings in the big dance hall of the Musikfabrik. For teams there is a 90-minute dance workshop built around your own favourite songs, at your office or outdoors, where by the end the whole team dances together — or a weekly class as an employee benefit.',
    group: '14–40 for team workshops', duration: '1–2 h', place: 'Musikfabrik, Neuköllnische Allee 6–8 / your office', languages: 'DE · EN',
    priceNote: 'weekly class · team workshop from €690 for up to 14' },
  // Luc, 23.10.26 (call from Monday). All formats by request on his
  // Konfetti listings (23.10.26); studio at Seestraße 49.
  { slug: 'luc-demissy', name: 'Luc Demissy', specialty: 'Drawing, watercolour, pastel & egg tempera',
    blurb: 'Born in Nancy, Luc Demissy is a painter who lives and works between Berlin and Strasbourg. In his studio in Wedding he teaches drawing and watercolour, pastel and egg tempera in groups of at most four, so every participant gets his full attention. A course starts with drawing from a still life and moves on to free drawing and painting, for beginners and the more experienced alike. Paper, paints, studio and a few drinks are included.',
    group: '1–4', duration: '5–5.5 h', place: 'Seestraße 49, Wedding', languages: 'DE · FR' },
  // Constanze, 23.10.26. From concreare.de and her Konfetti listings
  // (23.10.26).
  { slug: 'concreare', name: 'Concreare', specialty: 'Pottery & ceramic painting', studio: 'Concreare',
    blurb: 'Constanze’s calm studio on Knobelsdorffstraße in Charlottenburg is made for small groups. In the handbuilding class, without a wheel, you shape bowls and objects from clay using different building techniques; in the ceramic painting class you decorate a ready-made piece. Both take two hours, need no experience, and your piece is fired and glazed for you. For birthdays, hen parties and team events you can book the studio exclusively, for up to twelve people.',
    group: '4–12', duration: '2 h', place: 'Knobelsdorffstraße 43, Charlottenburg', languages: 'DE' },
  // Jeannette, 23.10.26: fixed dates until February on a flyer (Termine.png,
  // not readable here); she prefers parent-child courses and has no time for
  // company courses (she teaches art at a school). Dates: on request until
  // her flyer is typed in.
  { slug: 'jeannette-tolksdorff', name: 'Jeannette', specialty: 'Watercolour for parents & children', studio: 'JT & ArtDesign',
    blurb: 'Jeannette is an art teacher who paints in watercolour, light and lively, with a soft spot for people, animals and yoga motifs. Her courses are made for parents and children painting side by side: an easy way in that takes away the fear of the blank sheet, for little ones and grown-ups alike.',
    group: 'Small groups', duration: 'On request', place: 'Berlin', languages: 'DE' },
  // Ilinca, 21.–23.10.26 (call on Monday 26.10). From paintnow.de and their
  // Konfetti store (23.10.26).
  { slug: 'paintnow', name: 'PaintNow', specialty: 'Painting workshops for teams', studio: 'PaintNow',
    blurb: 'PaintNow brings guided painting to companies, in Berlin and across Germany, for groups from ten to several hundred. The formats are made for people who swear they cannot draw: Sip & Paint, painting together on one large canvas, speed-painting portraits of your colleagues, giant paper letters painted with your team values, puzzle painting on wood, T-shirts with your company logo, and calmer formats with a sound bath, mandalas or clay. Ilinca started out combining sound healing and painting in yoga studios, and now runs PaintNow full time. She comes with everything needed to your office, a restaurant, a bar or a meeting room, anywhere in Berlin; a studio can be booked for a small extra. Two hours, with an extra hour if you like, and a motif designed for your team on request.',
    group: '10–200', duration: '2–3 h', place: 'Your office or venue, all over Berlin', languages: 'EN · DE',
    priceNote: 'from 10 people · extra hour €15 pp' },
  // Chris & Kora, 18.10.26: "können uns eine Zusammenarbeit gut
  // vorstellen". From atelier.korasinn.de (23.10.26).
  { slug: 'atelier-sinn', name: 'Atelier Sinn', specialty: 'Natural cosmetics, textile art, collage & more', studio: 'Atelier Kora Sinn',
    blurb: 'A creative space near Senefelderplatz founded by interior designer and creative director Kornelia Sinn: high ceilings, a carefully designed interior and two generous rooms. For teams there are eight three-hour formats — collage and mixed media, natural cosmetics with your own packaging, textile art, scented candles, room sprays, clay, jewellery and charms, and porcelain design — and they can tailor one to your brand colours, logo or a shared theme. Materials, guidance, snacks and drinks are included; catering on request. Public workshops include an autumn glow serum and festive Christmas tablescaping.',
    group: '5–20', duration: '3 h', place: 'Saarbrücker Str. 15, Prenzlauer Berg', languages: 'DE · EN' },
  // Lucille, 21.–22.10.26; on 24.10.26 she asked us to use her own product
  // page instead of her older listings, and said the workshop takes place
  // from 3 participants (she cancels with only 1 or 2). Everything below is
  // from lucilleguder.com (workshop, dots class, workshops & about pages,
  // 24.10.26); photos from her product pages, used with her OK.
  { slug: 'lucille-guder', name: 'Lucille Guder', specialty: 'Self-photography & flower collage workshop for women',
    blurb: 'Lucille Guder is a self-taught French artist living in Berlin, who makes flower women out of acrylics, paper and dried flowers, their faces left blank so that any woman can relate to them. Together with Ātma Portrait she runs a workshop that helps women reconcile with their bodies and gain self-awareness through photography. After an introduction and a conversation about our relationship with our bodies, you photograph yourself for an hour, completely alone in the studio behind privacy curtains: you are the only one who sees your pictures. After a break with drinks and snacks, you turn your own body lines into a handmade flower collage, with an easy technique that needs no drawing experience. You take home about fifty high-quality black-and-white photos, your A4 collage and the technique. Bring a USB stick for your photos, as they are not stored, and a folder for the collage. She also teaches her signature dots painting technique, and runs a flower-crown workshop with a group photo session for birthdays and hen parties.',
    group: 'Takes place from 3 participants · max. 4, women only', duration: '3.5 h', place: 'Ātma Self-Portrait Photo Studio, Reichenberger Str. 109, Kreuzberg', languages: 'EN · FR',
    priceNote: 'dots painting class €49' },
];

const de: HostCopy[] = [
  { slug: 'rtmis', name: 'RtmiS', specialty: 'Terrazzo- & Marmoreffekt-Workshops', studio: 'RtmiS [ár.te.mis]',
    blurb: 'Dianas Atelier liegt in einer 150 Jahre alten ehemaligen Feuerwache im Wedding. Im Terrazzo-Workshop mischst du deine eigenen Pigmente, stellst deine Farbpalette zusammen und gießt sie in umweltfreundliches Gipsharz – heraus kommt ein Terrazzo-Objekt, zum Beispiel ein Untersetzer, das es kein zweites Mal gibt. Im Marmoreffekt-Workshop gießt, schwenkst und mischst du Farben zu einem marmorierten Tablett und versiegelst es. Keine Vorkenntnisse nötig, alle Materialien inklusive, dazu Tee, Kaffee und Snacks (Wein auf Wunsch). Für Teams bietet sie beide Formate privat an, im Atelier oder bei euch im Büro.',
    group: '5–15 im Atelier · größer bei euch vor Ort', duration: '2–2,5 Std.', place: 'Stockholmer Str. 4, Wedding / bei euch', languages: 'DE · EN',
    priceNote: '65 € pro Person für Gruppen ab 5 · offene Kurse 79 €' },
  { slug: 'strassenbraeu', name: 'Straßenbräu', specialty: 'Biertastings & Braukurse', studio: 'Straßenbräu',
    blurb: 'Berliner Craft-Brauerei, die seit 2015 am Ostkreuz braut und seit 2021 in der eigenen Brauerei in Marzahn. Ihre neue Bar, der Ausschank 2, hat direkt am Görlitzer Park in Kreuzberg eröffnet: 14 Zapfhähne, hohe Decken, Altbau-Charme und eine eigene Küche. Beim Biertasting (2 Stunden, ab fünf Personen) verkostet ihr sieben Biere frisch vom Hahn und erfahrt, wie Bier gebraut wird, woher die Farben kommen und wie Malz und Hopfen schmecken. Der Braukurs dauert fünf Stunden mit einem der Brauer, mit Verkostung aller Biere, Mittagessen und einem Liter selbst gebrautem Bier zum Mitnehmen. Für Weihnachtsfeiern und Teamevents stellen sie komplette Pakete mit Essen und Getränken zusammen.',
    group: 'Ab 5', duration: '2–5 Std.', place: 'Ausschank 2, Görlitzer Str. 52, Kreuzberg', languages: 'DE · EN',
    priceNote: 'Biertasting · Braukurs 114 €' },
  { slug: 'beavis-bar', name: 'Beavis Bar', specialty: 'Craft-Spirituosen- & Whisky-Tastings', studio: 'Beavis Bar',
    blurb: 'Eine kleine Bar in Mitte mit über 1.400 Craft-Spirituosen von kleinen Destillerien aus aller Welt, viele davon gibt es sonst nirgends in Berlin. Beim Whisky-Tasting probiert ihr fünf bis sechs Craft-Whiskys, darunter Raritäten, und hört die Geschichte hinter jeder Flasche – für Neulinge wie Kenner. Neunzig Minuten, bis zu zwölf Personen, auf Deutsch, Englisch, Französisch oder Italienisch. Für Teams und Weihnachtsfeiern läuft das Tasting auch privat – ein Abend, an den man sich länger erinnert als an die übliche Open Bar.',
    group: '4–12 · Gruppen am liebsten Mi–Do, eine Woche Vorlauf', duration: '1,5 Std.', place: 'Veteranenstraße 11, Mitte', languages: 'DE · EN · FR · IT' },
  { slug: 'waldsamkeit', name: 'Waldsamkeit', specialty: 'Wildkräuterwanderungen', studio: 'Waldsamkeit',
    blurb: 'Waldsamkeit macht Naturführungen mit naturwissenschaftlichem Hintergrund: Biologe Manuel Larbig und sein Team junger Naturexpert:innen prüfen altes Pflanzenwissen, statt es einfach zu übernehmen. Auf der klassischen dreistündigen Wildkräuterwanderung lernt ihr in einem Berliner Park oder Wald mindestens zwanzig Wildpflanzen kennen: was essbar ist, was heilend wirkt, welche giftigen Doppelgänger ihr meiden solltet und woher die Namen kommen. Die Gruppen bleiben klein, höchstens zwölf. Die lange Tour endet mit Picknick und Wildkräuterbutter, und für Firmen gestalten sie Teamtage in der Natur rund um eure Gruppe.',
    group: 'Bis 12 bei offenen Touren · Teams auf Anfrage', duration: '3–6 Std.', place: 'Parks und Wälder in ganz Berlin', languages: 'DE · EN' },
  { slug: 'zoenoteka', name: 'ZÖNOTÉKA', specialty: 'Schweißen, Tufting, Zuckerkunst & mehr', studio: 'ZÖNOTÉKA',
    blurb: 'Ein gemeinnütziger Projektraum in Neukölln, 2014 gegründet, halb Werkstatt, halb Galerie: eine gut ausgestattete Werkstatt für Holz und Styropor, eine selbstgebaute CNC-Fräse und wechselnde Künstler:innen und Kursleiter:innen. Daraus entstehen Workshops, die es sonst kaum gibt: einen Metall-Lampenschirm per MIG/MAG selbst schweißen, einen Silberring fertigen, am Wochenende einen kleinen Teppich tuften, Lollis in der japanischen Zuckerkunst Amezaiku formen, Siebdruck, Cyanotypie, Zines oder ein eigenes MIDI-Instrument bauen und spielen. Kleine Gruppen, keine Vorkenntnisse nötig.',
    group: '1–8 je nach Workshop', duration: '2,5–8 Std.', place: 'Hobrechtstraße 54, Neukölln', languages: 'DE · EN' },
  { slug: 'hobbytischlerei', name: 'Hobbytischlerei', specialty: 'Holzkurse', studio: 'Hobbytischlerei',
    blurb: 'Eine echte Tischlerwerkstatt in Kaulsdorf, in der du Holzbearbeitung in Theorie und Praxis lernst, vom Handwerkzeug bis zur Profimaschine. Am beliebtesten ist das Hirnholz-Schneidebrett: Aus edlen Hölzern wie Oliven- oder Zebranoholz verleimst, sägst, schleifst und ölst du ein Brett nach deinem eigenen Entwurf, mit Grifffalz, Saftrille oder Softkante. Weitere Kurse: Zinkungen von Hand, elektrische Handwerkzeuge, Profimaschinen, Oberflächenveredelung oder der Bau eines rustikalen Hockers. Kleine Gruppen bis vier Personen, Material inklusive; für eigene Projekte kannst du die Werkstatt auch mieten.',
    group: '1–4 pro Kurs', duration: '5–8 Std.', place: 'Alt-Kaulsdorf 52, Kaulsdorf', languages: 'DE' },
  { slug: 'yahelis', name: 'Yahelis', specialty: 'Schokoladen- & Patisserie-Workshops', studio: 'Yahelis',
    blurb: 'Patissière Yahel Michaeli unterrichtet in ihrem Backstudio in Friedrichshain. Im Schokoladen-Workshop lernst du Schokolade zu temperieren und Medaillons, Pralinen und Trüffel herzustellen, im Macaron-Workshop die Geheimnisse des buntesten Desserts der Patisserie, und es gibt Kurse zu Brandteig, Tartes, Blätterteig und Hefeteig. Alles, was du machst, nimmst du mit nach Hause. Für Teams bietet sie private Macaron- und Schokoladen-Events an und zu Weihnachten einen festlichen Patisserie-Workshop – auf Wunsch mit gebrandeten Schürzen.',
    group: '6–15', duration: '3,5–4 Std.', place: 'Pettenkoferstraße 43, Friedrichshain', languages: 'EN' },
  { slug: 'groove-in-focus', name: 'Groove in Focus', specialty: 'Hip-Hop & Afro Dance', studio: 'Groove in Focus',
    blurb: 'Eric Dodjis Tanzschule für Erwachsene in Neukölln lehrt Hip-Hop und Afro als Freestyle: Du lernst die Basics und findest deinen eigenen Groove, statt eine Choreo auswendig zu lernen – ohne Leistungsdruck, ob du schon mal getanzt hast oder nicht. Die wöchentlichen Kurse laufen montagabends im großen Tanzsaal der Musikfabrik. Für Teams gibt es einen 90-minütigen Tanzworkshop zu euren eigenen Lieblingssongs, bei euch vor Ort oder draußen, an dessen Ende das ganze Team zusammen tanzt – oder einen wöchentlichen Kurs als Mitarbeiter-Benefit.',
    group: '14–40 bei Teamworkshops', duration: '1–2 Std.', place: 'Musikfabrik, Neuköllnische Allee 6–8 / bei euch', languages: 'DE · EN',
    priceNote: 'Wochenkurs · Teamworkshop ab 690 € für bis zu 14' },
  { slug: 'luc-demissy', name: 'Luc Demissy', specialty: 'Zeichnen, Aquarell, Pastell & Eitempera',
    blurb: 'Luc Demissy, geboren in Nancy, ist Maler und lebt und arbeitet zwischen Berlin und Strasbourg. In seinem Atelier im Wedding unterrichtet er Zeichnen und Aquarell, Pastell und Eitempera in Gruppen von höchstens vier Personen, damit jede und jeder seine volle Aufmerksamkeit bekommt. Ein Kurs beginnt mit dem Zeichnen nach einem Stillleben und geht dann ins freie Zeichnen und Malen über, für Einsteiger wie Fortgeschrittene. Papier, Farben, Atelier und ein paar Getränke sind inklusive.',
    group: '1–4', duration: '5–5,5 Std.', place: 'Seestraße 49, Wedding', languages: 'DE · FR' },
  { slug: 'concreare', name: 'Concreare', specialty: 'Töpfern & Keramik bemalen', studio: 'Concreare',
    blurb: 'Constanzes ruhiges Atelier in der Knobelsdorffstraße in Charlottenburg ist wie gemacht für kleine Gruppen. Im Töpferkurs ohne Drehscheibe formst du mit verschiedenen Aufbautechniken Schalen und Objekte aus Ton, im Keramik-Malkurs gestaltest du ein fertiges Stück. Beide dauern zwei Stunden, brauchen keine Vorkenntnisse, und dein Stück wird für dich gebrannt und glasiert. Für Geburtstage, JGAs und Teamevents kannst du das Atelier auch exklusiv buchen, für bis zu zwölf Personen.',
    group: '4–12', duration: '2 Std.', place: 'Knobelsdorffstraße 43, Charlottenburg', languages: 'DE' },
  { slug: 'jeannette-tolksdorff', name: 'Jeannette', specialty: 'Aquarell für Eltern & Kinder', studio: 'JT & ArtDesign',
    blurb: 'Jeannette ist Kunstlehrerin und malt in Aquarell, leicht und lebendig, mit einem besonderen Blick für Menschen, Tiere und Yoga-Motive. Ihre Kurse sind für Eltern und Kinder gemacht, die nebeneinander malen: ein leichter Einstieg, der Kleinen wie Großen die Angst vor dem weißen Blatt nimmt.',
    group: 'Kleine Gruppen', duration: 'Auf Anfrage', place: 'Berlin', languages: 'DE' },
  { slug: 'paintnow', name: 'PaintNow', specialty: 'Mal-Workshops für Teams', studio: 'PaintNow',
    blurb: 'PaintNow bringt angeleitetes Malen in Unternehmen, in Berlin und ganz Deutschland, für Gruppen von zehn bis mehreren hundert Personen. Die Formate sind für alle gemacht, die schwören, nicht malen zu können: Sip & Paint, gemeinsam auf einer großen Leinwand malen, Speed-Painting-Porträts der Kolleg:innen, riesige Papierbuchstaben mit euren Teamwerten, Puzzle-Malerei auf Holz, T-Shirts mit Firmenlogo und ruhigere Formate mit Klangbad, Mandalas oder Ton. Ilinca hat damit angefangen, Klangheilung und Malen in Yogastudios zu verbinden, und macht PaintNow heute in Vollzeit. Sie kommt mit allem Nötigen zu euch ins Büro, in ein Restaurant, eine Bar oder einen Meetingraum, überall in Berlin; ein Studio kann gegen einen kleinen Aufpreis dazugebucht werden. Zwei Stunden, auf Wunsch mit einer Extrastunde, und auf Anfrage ein Motiv, das sie für euer Team entwirft.',
    group: '10–200', duration: '2–3 Std.', place: 'Bei euch im Büro oder in der Location, überall in Berlin', languages: 'EN · DE',
    priceNote: 'ab 10 Personen · Extrastunde 15 € p. P.' },
  { slug: 'atelier-sinn', name: 'Atelier Sinn', specialty: 'Naturkosmetik, Textile Art, Collage & mehr', studio: 'Atelier Kora Sinn',
    blurb: 'Ein kreativer Ort nahe Senefelderplatz, gegründet von Interior Designerin und Creative Director Kornelia Sinn: hohe Decken, ein sorgfältig gestaltetes Interior und zwei großzügige Räume. Für Teams gibt es acht dreistündige Formate – Collage & Mixed Media, Naturkosmetik mit eigener Verpackung, Textile Art, Duftkerzen, Duftsprays, Ton, Schmuck & Charms und Porzellandesign –, und auf Wunsch wird eines auf eure Markenfarben, euer Logo oder ein gemeinsames Thema zugeschnitten. Material, Anleitung, Snacks und Getränke sind inklusive, Catering auf Anfrage. Offene Workshops gibt es etwa zum Glow-Serum oder zum festlichen Weihnachts-Tablescaping.',
    group: '5–20', duration: '3 Std.', place: 'Saarbrücker Str. 15, Prenzlauer Berg', languages: 'DE · EN' },
  { slug: 'lucille-guder', name: 'Lucille Guder', specialty: 'Selbstfotografie- & Blumencollage-Workshop für Frauen',
    blurb: 'Lucille Guder ist eine französische Autodidaktin, die in Berlin lebt und Blumenfrauen aus Acryl, Papier und getrockneten Blumen macht – mit leeren Gesichtern, damit sich jede Frau in ihnen wiederfinden kann. Zusammen mit Ātma Portrait bietet sie einen Workshop an, der Frauen hilft, sich mit ihrem Körper zu versöhnen und sich durch Fotografie selbst besser wahrzunehmen. Nach einer Einführung und einem Gespräch über unsere Beziehung zu unserem Körper fotografierst du dich eine Stunde lang selbst, ganz allein im Studio hinter Sichtschutzvorhängen: Nur du siehst deine Bilder. Nach einer Pause mit Getränken und Snacks verwandelst du deine eigenen Körperlinien in eine handgemachte Blumencollage, mit einer einfachen Technik, für die du keine Zeichenerfahrung brauchst. Du nimmst rund fünfzig hochwertige Schwarz-Weiß-Fotos, deine A4-Collage und die Technik mit nach Hause. Bring einen USB-Stick für deine Fotos mit, denn sie werden nicht gespeichert, und eine Mappe für die Collage. Außerdem unterrichtet sie ihre typische Punkt-Maltechnik und bietet für Geburtstage und JGAs einen Blumenkranz-Workshop mit Gruppen-Fotosession an.',
    group: 'Findet ab 3 Teilnehmerinnen statt · max. 4, nur für Frauen', duration: '3,5 Std.', place: 'Ātma Self-Portrait Photo Studio, Reichenberger Str. 109, Kreuzberg', languages: 'EN · FR',
    priceNote: 'Punkt-Malkurs 49 €' },
];

/** French copy, for a host who writes in French (Lucille). Every other
 *  preview host falls back to English in French. */
const fr: HostCopy[] = [
  { slug: 'lucille-guder', name: 'Lucille Guder', specialty: 'Atelier d’autoportrait photo et de collage floral pour femmes',
    blurb: 'Lucille Guder est une artiste française autodidacte installée à Berlin, qui crée des femmes-fleurs en acrylique, papier et fleurs séchées, le visage laissé vide pour que chaque femme puisse s’y reconnaître. Avec Ātma Portrait, elle propose un atelier qui aide les femmes à se réconcilier avec leur corps et à mieux se connaître grâce à la photographie. Après une introduction et un échange sur notre rapport à notre corps, tu te photographies pendant une heure, seule dans le studio derrière des rideaux d’intimité : tu es la seule à voir tes photos. Après une pause avec boissons et en-cas, tu transformes les lignes de ton corps en un collage floral fait main, avec une technique simple qui ne demande aucune expérience en dessin. Tu repars avec une cinquantaine de photos numériques en noir et blanc de haute qualité, ton collage A4 et la technique. Apporte une clé USB pour tes photos, qui ne sont pas conservées, et une pochette pour le collage. Elle enseigne aussi sa technique de peinture à points et propose un atelier de couronnes de fleurs avec séance photo de groupe pour les anniversaires et les EVJF.',
    group: 'A lieu à partir de 3 participantes · 4 max., uniquement pour les femmes', duration: '3,5 h', place: 'Ātma Self-Portrait Photo Studio, Reichenberger Str. 109, Kreuzberg', languages: 'EN · FR',
    priceNote: 'cours de peinture à points 49 €' },
];

const facets: Record<string, Facets> = {
  // Corporate price from Diana's email; public classes are €79.
  rtmis:                 { activity: 'craft',       groupRange: [5, 15],   hourRange: [2, 2.5], groupPrice: 65 },
  // PLACEHOLDER maximum — the bar names no cap. Tasting €34 in their shop
  // (the product text still says €29).
  strassenbraeu:         { activity: 'food',        groupRange: [5, 30],   hourRange: [2, 5],   groupPrice: 34 },
  'beavis-bar':          { activity: 'food',        groupRange: [4, 12],   hourRange: [1.5, 1.5] },
  // PLACEHOLDER team maximum — public walks take 12.
  waldsamkeit:           { activity: 'food', alsoIn: ['wellbeing'], groupRange: [1, 12], hourRange: [3, 6] },
  zoenoteka:             { activity: 'craft',       groupRange: [1, 8],    hourRange: [2.5, 8] },
  hobbytischlerei:       { activity: 'craft',       groupRange: [1, 4],    hourRange: [5, 8] },
  // Team formats on Konfetti: chocolate €75 (10–15 people), macarons €85
  // (6–10); public classes €75–85.
  yahelis:               { activity: 'food',        groupRange: [6, 15],   hourRange: [3.5, 4], groupPrice: 75 },
  // Team workshop 14–40; the weekly class is 1 h (2 with afro).
  'groove-in-focus':     { activity: 'music', alsoIn: ['wellbeing'], groupRange: [14, 40], hourRange: [1, 2] },
  'luc-demissy':         { activity: 'art',         groupRange: [1, 4],    hourRange: [5, 5.5], groupPrice: 75 },
  concreare:             { activity: 'ceramics',    groupRange: [4, 12],   hourRange: [2, 2] },
  // PLACEHOLDER ranges — nothing published.
  'jeannette-tolksdorff': { activity: 'art',        groupRange: [1, 10],   hourRange: [1.5, 2] },
  // Ilinca, call 26.10.26: from €59 per person, minimum 10 (fewer pay for
  // 10), 2 h + optional hour at €15 pp; usually 20–30 people. Up to
  // 200 on their Konfetti listings.
  paintnow:              { activity: 'art',         groupRange: [10, 200], hourRange: [2, 3],   groupPrice: 59 },
  'atelier-sinn':        { activity: 'craft',       groupRange: [5, 20],   hourRange: [3, 3],   groupPrice: 59 },
  // From 3 (she cancels with 1 or 2) to 4 for the collage workshop, 10 for
  // flower crowns; 2–3.5 h. €119 for the collage workshop (dots class €49,
  // in priceNote; flower crowns are booked through Ātma Portrait, no price
  // on her site).
  'lucille-guder':       { activity: 'photography', alsoIn: ['art'], groupRange: [3, 10], hourRange: [2, 3.5], groupPrice: 119 },
};

const firstNames: Record<string, string> = {
  rtmis: 'Diana', 'beavis-bar': 'Jon', waldsamkeit: 'Manuel', zoenoteka: 'Máté', hobbytischlerei: 'Micha',
  yahelis: 'Yahel', 'groove-in-focus': 'Eric', 'luc-demissy': 'Luc', concreare: 'Constanze',
  'jeannette-tolksdorff': 'Jeannette', paintnow: 'Ilinca', 'atelier-sinn': 'Kora', 'lucille-guder': 'Lucille',
};

const areas: Record<string, { area: string; onSite?: boolean }> = {
  rtmis: { area: 'Wedding', onSite: true }, strassenbraeu: { area: 'Kreuzberg' }, 'beavis-bar': { area: 'Mitte' },
  waldsamkeit: { area: 'Berlin' }, zoenoteka: { area: 'Neukölln' }, hobbytischlerei: { area: 'Kaulsdorf' },
  yahelis: { area: 'Friedrichshain' }, 'groove-in-focus': { area: 'Neukölln', onSite: true },
  'luc-demissy': { area: 'Wedding' }, concreare: { area: 'Charlottenburg' }, 'jeannette-tolksdorff': { area: 'Berlin' },
  paintnow: { area: 'Berlin', onSite: true }, 'atelier-sinn': { area: 'Prenzlauer Berg' }, 'lucille-guder': { area: 'Kreuzberg' },
};

/** Formats each preview host runs on request, with no public date. */
const onRequest: Record<string, PreviewOffer[]> = {
  rtmis: [
    { title: 'Terrazzo oder Marmoreffekt für eure Gruppe (ab 5 Personen)', titleEn: 'Terrazzo or marble effect for your group (from 5 people)', duration: '2–2.5 h', price: '€65', url: 'https://www.rtmis.net/workshops' },
  ],
  strassenbraeu: [
    { title: 'Biertasting im Ausschank 2 (ab 5 Personen)', titleEn: 'Beer tasting at Ausschank 2 (from 5 people)', duration: '2 h', price: '€34', url: 'https://www.strassenbraeu.de/products/biertasting' },
    { title: 'Braukurs mit Mittagessen und 1 Liter Bier', titleEn: 'Brewing class with lunch and a litre of beer', duration: '5 h', price: '€114', url: 'https://www.strassenbraeu.de/products/strassenbrau-braukurs' },
    { title: 'Weihnachtsfeier oder Firmenevent mit Essen & Getränken', titleEn: 'Christmas party or company event with food & drinks', url: 'https://www.strassenbraeu.de/pages/ausschank-2' },
  ],
  'beavis-bar': [
    { title: 'Privates Whisky-Tasting für eure Gruppe', titleEn: 'Private whisky tasting for your group', duration: '1.5 h', url: 'https://beavis.bar/' },
  ],
  waldsamkeit: [
    { title: 'Teamevent: Kräuterwanderung für eure Firma', titleEn: 'Team event: herb walk for your company', duration: '3 h', url: 'https://waldsamkeit.de/' },
    { title: 'Kräuterwanderung mit Picknick und Wildkräuterbutter', titleEn: 'Herb walk with a picnic and wild-herb butter', duration: '6 h', url: 'https://waldsamkeit.de/' },
  ],
  zoenoteka: [
    { title: 'Wochenend-Tufting-Kurs: 32×32 cm Teppich', titleEn: 'Weekend tufting course: a 32×32 cm rug', duration: '2 × 4 h', price: '€120', url: 'https://zoenoteka.gokonfetti.com/de-de/p/zonoteka-w298kx/' },
    { title: 'Silber-Workshop: dein eigener Ring', titleEn: 'Silver workshop: your own ring', duration: '3 h', price: '€140', url: 'https://zoenoteka.gokonfetti.com/de-de/p/zonoteka-w298kx/' },
    { title: 'Siebdruck-Workshop', titleEn: 'Screen-printing workshop', price: '€80', url: 'https://zoenoteka.gokonfetti.com/de-de/p/zonoteka-w298kx/' },
    { title: 'MIDI-Instrumente bauen und spielen', titleEn: 'Build and play your own MIDI instrument', price: '€160', url: 'https://zoenoteka.gokonfetti.com/de-de/p/zonoteka-w298kx/' },
  ],
  hobbytischlerei: [
    { title: 'Bau eines rustikalen Hockers', titleEn: 'Build a rustic stool', duration: '8 h', price: '€259', url: 'https://www.hobbytischlerei.de/kurse' },
    { title: 'Werkstatt mieten für dein eigenes Projekt', titleEn: 'Hire the workshop for your own project', url: 'https://www.hobbytischlerei.de/werkstatt-mieten' },
  ],
  yahelis: [
    { title: 'Teamevent: Schokolade temperieren (10–15 Personen)', titleEn: 'Team event: chocolate tempering (10–15 people)', duration: '3.5 h', price: '€75', url: 'https://www.yahelis.com/teamevents' },
    { title: 'Teamevent: Macarons & Patisserie (6–10 Personen)', titleEn: 'Team event: macarons & patisserie (6–10 people)', duration: '4 h', price: '€85', url: 'https://www.yahelis.com/teamevents' },
  ],
  'groove-in-focus': [
    { title: 'Tanzworkshop für Teams zu euren Lieblingssongs', titleEn: 'Team dance workshop to your favourite songs', duration: '1.5 h', price: '€690 / bis 14', url: 'https://grooveinfocus.com/firmen' },
  ],
  'luc-demissy': [
    { title: 'Zeichnen & Aquarell in kleiner Gruppe', titleEn: 'Drawing & watercolour in a small group', duration: '5 h', price: '€75', url: 'https://gokonfetti.com/de-de/p/luc-demissy-z7rn2x/' },
    { title: 'Pastell & Zeichnen in kleiner Gruppe', titleEn: 'Pastel & drawing in a small group', duration: '5.5 h', price: '€75', url: 'https://gokonfetti.com/de-de/p/luc-demissy-z7rn2x/' },
    { title: 'Eitempera für Einsteiger und Fortgeschrittene', titleEn: 'Egg tempera for beginners and the more experienced', duration: '5.5 h', price: '€75', url: 'https://gokonfetti.com/de-de/p/luc-demissy-z7rn2x/' },
  ],
  concreare: [
    { title: 'Atelier exklusiv: Töpfern oder Keramik bemalen für eure Gruppe', titleEn: 'Studio to yourselves: pottery or ceramic painting for your group', duration: '2 h', url: 'https://www.concreare.de/' },
  ],
  'jeannette-tolksdorff': [
    { title: 'Aquarell-Kurs für Eltern und Kinder', titleEn: 'Watercolour course for parents and children', url: 'https://www.twiggli.com/contact/' },
  ],
  paintnow: [
    { title: 'Sip & Paint fürs Team', titleEn: 'Sip & Paint for your team', url: 'https://www.paintnow.de/team-building' },
    { title: 'Gemeinsam auf Großleinwand malen', titleEn: 'Painting together on a large canvas', url: 'https://www.paintnow.de/team-building' },
    { title: 'Speed-Painting: Kolleg:innen porträtieren', titleEn: 'Speed painting: portraits of your colleagues', url: 'https://www.paintnow.de/team-building' },
    { title: 'T-Shirts mit Firmenlogo bemalen', titleEn: 'Paint T-shirts with your company logo', url: 'https://www.paintnow.de/team-building' },
    { title: 'Abstraktes Malen für dich oder zu zweit', titleEn: 'Abstract painting for one or two', url: 'https://www.paintnow.de/' },
  ],
  'atelier-sinn': [
    { title: 'Teamevent: eines von acht Formaten, auf Wunsch in euren Markenfarben', titleEn: 'Team event: one of eight formats, in your brand colours if you like', duration: '3 h', price: '€59', url: 'https://www.atelier.korasinn.de/teams' },
  ],
  'lucille-guder': [
    { title: 'Selbstfotografie & Blumencollage (nur für Frauen, max. 4 – findet ab 3 Teilnehmerinnen statt)', titleEn: 'Self-photography & flower collage (women only, max. 4 – takes place from 3 participants)', duration: '3.5 h', price: '€119', url: 'https://www.lucilleguder.com/product/self-photography-and-flower-collage-workshop' },
    { title: 'Malkurs: Lucilles Punkt-Technik (nur für Frauen, max. 4)', titleEn: 'Painting class: Lucille’s dots technique (women only, max. 4)', duration: '2.5 h', price: '€49', district: 'U Bernauer Straße', url: 'https://www.lucilleguder.com/product/painting-class-learn-the-dots-technique-with-me' },
    { title: 'Blumenkranz-Workshop & Gruppen-Fotosession (bis 10)', titleEn: 'Flower-crown workshop & group photo session (up to 10)', duration: '2 h', district: 'Ātma Portrait', url: 'https://www.lucilleguder.com/self-photography-and-flower-collage-workshop' },
  ],
};

export const preview = { copy: { en, de, fr }, facets, firstNames, areas, onRequest } satisfies {
  copy: { en: HostCopy[]; de: HostCopy[]; fr: HostCopy[] };
  facets: Record<string, Facets>;
  firstNames: Record<string, string>;
  areas: Record<string, { area: string; onSite?: boolean }>;
  onRequest: Record<string, PreviewOffer[]>;
};

