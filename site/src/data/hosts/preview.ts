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
  // Jirel's own test page (29.10.26): hidden for good, never goes live. She
  // signs in to the host account with it to try everything as a host would.
  { slug: 'test-jirel', name: 'Jirels Testworkshop', specialty: 'Test page (not public)', studio: 'Twiggli test studio',
    blurb: 'This is a test page for trying out the Twiggli host account. It is hidden from search engines, listings and the calendar.',
    group: '1–10', duration: '2 h', place: 'Berlin', languages: 'DE · EN', priceNote: '€45 per person' },
  // Diana, emails of 23.10.26: groups from 5 at €65 pp, up to 15 in her
  // studio, or at the company's (travel and set-up extra); terrazzo ~2.5 h,
  // marble effect ~2 h; tea, coffee and snacks included, wine on request.
  { slug: 'rtmis', name: 'RtmiS', specialty: 'Terrazzo & marble-effect workshops', studio: 'RtmiS [ár.te.mis]',
    blurb: 'Diana came to terrazzo by way of music and design: she grew up in Greece as a classical musician, studied experimental design, then did a master’s in textile and surface design in Berlin and later studied interior design. She has taught for many years, at the University of Kassel among others. Her studio sits in a 150-year-old former fire station in Wedding, and her workshops are about showing how much work goes into a small handmade object, and getting people away from their desks for a few hours. In the terrazzo workshop you mix your own pigments, build a colour palette and pour it into eco-friendly gypsum resin, then take home an object nobody else has, a coaster for example. Once you have made a small piece, you can come back for a larger terrazzo plate or even a side table. In the marble-effect workshop you pour, swirl and blend colours into a marbled tray and seal it. She mixes the formats in one session, so strangers often leave as friends. No experience needed, all materials included, with tea, coffee and snacks (wine on request). For teams she runs both formats privately, in her studio or at your office.',
    group: 'Open sessions: up to 8 for small objects, 2 for the large plate · groups 5–15 in the studio, larger at your office', duration: '2–2.5 h', place: 'Stockholmer Str. 4, Wedding / your office', languages: 'DE · EN',
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
    blurb: 'A small bar in Mitte with more than 1,400 craft spirits from small distilleries around the world, many of which you will not find anywhere else in Berlin. In their whisky tasting you nose and taste five or six craft whiskies, rarities among them, while the bartender tells the story behind each bottle — for newcomers and connoisseurs alike. Ninety minutes, up to twelve people, in German, English, French or Italian. For teams and Christmas parties the tasting runs privately, a far more memorable evening than the usual open bar. Private tastings from four people, Wednesday to Saturday (the bar is closed Sunday to Tuesday).',
    group: '4–12 · Wed–Thu evenings, Fri–Sat at 19:00 · one week\'s notice', duration: '1.5 h', place: 'Veteranenstraße 11, Mitte', languages: 'DE · EN · FR · IT' },
  // Thorsten, call 28.10.26: Brew Monday tasting every Monday at the
  // taproom (BKK, Kreuzberg), tastings and tours at the brewery
  // (Pfefferberg, Prenzlauer Berg), several times a week. Usually 8–10
  // guests. Cancellation free up to 24 h before. Address and "8 beers in
  // 90 minutes" from his emails and listing (March 2026). Price to confirm.
  { slug: 'schoppe-braeu', name: 'Schoppe Bräu', specialty: 'Beer tastings & brewery tours', studio: 'Schoppe Bräu',
    blurb: 'Thorsten Schoppe is a trained brewer (Dipl.-Ing. Brauwesen) and has been part of Berlin’s craft beer scene since its early days in 2001, with his own small brewery. Every Monday he hosts Brew Monday at his taproom in Kreuzberg: eight beers in 90 minutes, how the styles differ, how to taste them like a brewer, and stories from decades behind the kettle. At the brewery at the Pfefferberg in Prenzlauer Berg he also runs tastings and brewery tours. For teams and private groups he sets up tastings on other days too.',
    group: 'Small groups, usually 8–10 · free cancellation up to 24 h before', duration: '1.5 h', place: 'Taproom BKK, Manteuffelstr. 53, Kreuzberg · Brauerei am Pfefferberg, Schönhauser Allee 176, Prenzlauer Berg', languages: 'DE' },
  // Manuel, 23.10.26 ("ruf gerne durch"). From waldsamkeit.de (23.10.26).
  { slug: 'waldsamkeit', name: 'Waldsamkeit', specialty: 'Wild herb walks', studio: 'Waldsamkeit',
    blurb: 'Waldsamkeit runs nature walks with a scientific background: biologist Manuel Larbig and his team of young naturalists check old plant lore against the studies rather than repeating it. On the classic three-hour wild herb walk you get to know at least twenty wild plants in a Berlin park or forest: which are edible, which have a healing effect, which poisonous look-alikes to avoid, and where their names come from. Groups stay small, twelve at most. The longer walk ends with a picnic and wild-herb butter, and for companies they design team days in nature around your group.',
    group: 'Up to 12 on public walks · teams on request', duration: '3–6 h', place: 'Parks and forests across Berlin', languages: 'DE · EN' },
  // Máté, 23.10.26, and our call on 26.10.26. Formats, prices and dates
  // from their Konfetti store (23.10.26); the metal workshop runs at
  // Weichselplatz 3–4. New name, website and Instagram coming; he sends
  // costs, December dates, photos and videos at the end of next week.
  // Groups: printing 10–12, up to 20 in the space; one person only for a
  // ticket from €100. Mostly 4 h.
  { slug: 'zoenoteka', name: 'ZÖNOTÉKA', specialty: 'Welding, tufting, sugar art & more', studio: 'ZÖNOTÉKA',
    blurb: 'A non-profit project space in Neukölln, founded in 2014, that is part workshop, part gallery: a well-equipped workshop for wood and foam, a self-built CNC machine, and a changing cast of artists and instructors. That makes for workshops you will not find elsewhere: weld your own metal lampshade with MIG/MAG, make a silver ring, tuft a small rug over a weekend, shape lollipops in the Japanese sugar art of amezaiku, screen print, cyanotype, zines, or build and play your own MIDI instrument. About ten members run it together, and they work a lot with schools and institutions, at their space or on site. Their idea for each workshop: you learn about a theme, often from Berlin history, and make a small piece together that you take home as your own souvenir. No experience needed.',
    group: 'Up to 20 · printing 10–12', duration: 'Mostly 4 h', place: 'Hobrechtstraße 54, Neukölln', languages: 'DE · EN' },
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
  // Luc, from our call on 26.10.26: he lost his studio in the summer, so he
  // teaches only at the client's place (office, home, a venue), bringing
  // everything. 5–15 people, 3–5 h, €15 per person per hour with materials,
  // at least €45 per person. German and French. Saturdays; weekdays for
  // companies. 28.10.26: charcoal instead of egg tempera at the client's
  // (too much to carry); egg tempera only in his 5-day summer course in
  // France (Grand Est, 6–8 people). Photos from luc-demissy.de.
  { slug: 'luc-demissy', name: 'Luc Demissy', specialty: 'Drawing, charcoal, watercolour & pastel',
    blurb: 'Born in Nancy, Luc Demissy is a painter who lives and works between Berlin and Strasbourg, and has been teaching for many years. He comes to you, to your office, your home or any room you choose, and brings everything along: paper, paints, brushes and his calm, patient eye. A course starts with drawing from a still life and moves on to free drawing in charcoal and painting in watercolour or pastel, for complete beginners and the more experienced alike. For teams it is a quiet, focused afternoon away from the screen, where everyone goes home with a picture of their own. In summer he also runs a five-day egg tempera course in France (Grand Est) for six to eight people.',
    group: '5–15 · Saturdays, weekdays for companies', duration: '3–5 h', place: 'At your place: office, home or a venue in Berlin', languages: 'DE · FR',
    priceNote: '€15 per person per hour, materials included' },
  // Constanze, 23.10.26. From concreare.de and her Konfetti listings
  // (23.10.26).
  { slug: 'concreare', name: 'Concreare', specialty: 'Pottery & ceramic painting', studio: 'Concreare',
    blurb: 'Constanze’s calm studio on Knobelsdorffstraße in Charlottenburg is made for small groups. In the handbuilding class, without a wheel, you shape bowls and objects from clay using different building techniques; in the ceramic painting class you decorate a ready-made piece. Both take two hours, need no experience, and your piece is fired and glazed for you. For birthdays, hen parties and team events you can book the studio exclusively, for up to twelve people.',
    group: '4–12', duration: '2 h', place: 'Knobelsdorffstraße 43, Charlottenburg', languages: 'DE' },
  // Jeannette, 23.10.26 and our call on 26.10.26: art teacher at a primary
  // school, courses every three weeks (every two from now on, she hopes) in
  // the north of Berlin, children and parent-child courses above all. She
  // wants €25 per person; our 15% goes on top, so €29 here. Her flyer
  // (27.10.26): Saturdays 10-12 at "Im Turm", Busonistr. 136, 13125 Berlin,
  // for children and adults, jtart.de; the dates are in hostDates.ts.
  { slug: 'jeannette-tolksdorff', name: 'Jeannette', specialty: 'Watercolour for parents & children', studio: 'JT & ArtDesign',
    blurb: 'Jeannette has always painted, and she teaches art at a primary school. When more and more people asked her privately for watercolour lessons, she started her own courses, for children above all, and for parents and children painting side by side. She brings everything along in one big box: she shows you how to draw your motif, a plant, an animal or a face, and then how to bring it to life in watercolour. With her light pad you can trace a picture or work it out step by step with her, and those who want to paint freely do. She paints natural motifs herself, plants, animals and portraits, with good colours on handmade paper, and leads you step by step to a finished picture, beginners and the more experienced alike. Patient, warm and made for little ones and grown-ups alike.',
    group: 'Children & adults · parent-child welcome', duration: '2 h', place: 'Im Turm, Busonistr. 136, Karow (Pankow)', languages: 'DE',
    priceNote: '€29 per person, materials included' },
  // Ilinca, 21.–23.10.26, and our call on 26.10.26: €59 pp, minimum 10
  // (fewer pay for 10), 2 h plus an optional hour at €15 pp, studio €100 for
  // 3 h, typical groups of 20–30. Wants 1–2 days to confirm, ideally 5 days
  // ahead; paid on booking, rescheduling but no refunds. 15% from the first
  // booking (she waived the free one). VAT from next year.
  { slug: 'paintnow', name: 'PaintNow', specialty: 'Painting workshops for teams', studio: 'PaintNow',
    blurb: 'PaintNow brings guided painting to companies, in Berlin and across Germany, for groups from ten to several hundred. The formats are made for people who swear they cannot draw: Sip & Paint, painting together on one large canvas, speed-painting portraits of your colleagues, giant paper letters painted with your team values, puzzle painting on wood, T-shirts with your company logo, and calmer formats with a sound bath, mandalas or clay. Ilinca started out combining sound healing and painting in yoga studios, and now runs PaintNow full time. She comes with everything needed to your office, a restaurant, a bar or a meeting room, anywhere in Berlin; a studio can be added for €100 for three hours. Two hours, with an extra hour if you like, and a motif designed for your team on request. For one or two people there is also abstract painting. Book at least five days ahead if you can; Ilinca confirms within a day or two. Paid when booked, and a date can be moved, not refunded.',
    group: '10–200', duration: '2–3 h', place: 'Your office or venue, all over Berlin', languages: 'EN · DE',
    priceNote: 'from €59 per person · minimum 10 (a smaller group pays for 10) · extra hour €15 pp · studio +€100 for 3 h' },
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
    blurb: 'Lucille Guder is a self-taught French artist living in Berlin, who makes flower women out of acrylics, paper and dried flowers, their faces left blank so that any woman can relate to them. Together with Ātma Portrait she runs a workshop that helps women reconcile with their bodies and gain self-awareness through photography. After an introduction and a conversation about our relationship with our bodies, you photograph yourself for an hour, completely alone in the studio behind privacy curtains: you are the only one who sees your pictures. After a break with drinks and snacks, you turn your own body lines into a handmade flower collage, with an easy technique that needs no drawing experience. You take home about fifty high-quality black-and-white photos, your A4 collage and the technique. Bring a USB stick for your photos, as they are not stored, and a folder for the collage. She also teaches her signature dots painting technique at her home in Prenzlauer Berg, and for hen parties and birthdays she brings her flower-crown workshop to your restaurant, hotel or venue, larger groups included.',
    group: 'Self-photography: 2–4, women only · flower crowns: larger groups', duration: '3.5 h', place: 'Ātma Self-Portrait Photo Studio, Reichenberger Str. 109, Kreuzberg', languages: 'EN · FR',
    priceNote: 'dots painting class €49 · flower crowns €50 per person' },
  // Marija, from our call on 26.10.26. No website on purpose and not to be
  // found on Google for now: she stays a preview host (noindex, in no
  // listing) and her page goes out by link only. Exact address left out.
  { slug: 'marija', name: 'Marija', specialty: 'Upcycling: paper making, fabric & wax seals',
    blurb: 'Marija studied art history and comes from education, and she upcycles: fabric and materials left behind on the street are washed and turned into cushion covers and other one-of-a-kind pieces. In her workshops you make paper from waste paper, scraps of coloured card and old bags, blended and poured with flowers or a little glitter; you seal it with wax, or fold paper Christmas stars. Calm, hands-on and good-looking, and she has run it with kindergarten children and older people alike. One-off workshops for companies and groups, in her large studio in Lichtenberg near Ostkreuz, or she brings everything to you.',
    group: 'Groups and teams', duration: 'On request', place: 'Her studio in Lichtenberg near Ostkreuz, or at your place', languages: 'DE' },
];

const de: HostCopy[] = [
  { slug: 'test-jirel', name: 'Jirels Testworkshop', specialty: 'Testseite (nicht öffentlich)', studio: 'Twiggli Teststudio',
    blurb: 'Das ist eine Testseite zum Ausprobieren des Twiggli-Gastgeberkontos. Sie ist für Suchmaschinen, Listen und den Kalender unsichtbar.',
    group: '1–10', duration: '2 Std.', place: 'Berlin', languages: 'DE · EN', priceNote: '45 € pro Person' },
  { slug: 'rtmis', name: 'RtmiS', specialty: 'Terrazzo- & Marmoreffekt-Workshops', studio: 'RtmiS [ár.te.mis]',
    blurb: 'Diana kam über Musik und Design zum Terrazzo: Sie ist in Griechenland als klassische Musikerin aufgewachsen, hat experimentelles Design studiert, danach in Berlin einen Master in Textil- und Flächendesign gemacht und später Innenarchitektur studiert. Sie unterrichtet seit vielen Jahren, unter anderem an der Universität Kassel. Ihr Atelier liegt in einer 150 Jahre alten ehemaligen Feuerwache im Wedding, und in ihren Workshops geht es darum zu zeigen, wie viel Arbeit in einem kleinen handgemachten Objekt steckt, und für ein paar Stunden vom Schreibtisch wegzukommen. Im Terrazzo-Workshop mischst du deine eigenen Pigmente, stellst deine Farbpalette zusammen und gießt sie in umweltfreundliches Gipsharz – heraus kommt ein Objekt, zum Beispiel ein Untersetzer, das es kein zweites Mal gibt. Wer schon ein kleines Stück gemacht hat, kann danach einen größeren Terrazzo-Teller oder sogar einen Beistelltisch machen. Im Marmoreffekt-Workshop gießt, schwenkst und mischst du Farben zu einem marmorierten Tablett und versiegelst es. Diana mischt die Formate in einer Session, und so gehen Fremde oft als Freunde nach Hause. Keine Vorkenntnisse nötig, alle Materialien inklusive, dazu Tee, Kaffee und Snacks (Wein auf Wunsch). Für Teams bietet sie beide Formate privat an, im Atelier oder bei euch im Büro.',
    group: 'Offene Termine: bis 8 für kleine Objekte, 2 für den großen Teller · Gruppen 5–15 im Atelier, größer bei euch vor Ort', duration: '2–2,5 Std.', place: 'Stockholmer Str. 4, Wedding / bei euch', languages: 'DE · EN',
    priceNote: '65 € pro Person für Gruppen ab 5 · offene Kurse 79 €' },
  { slug: 'strassenbraeu', name: 'Straßenbräu', specialty: 'Biertastings & Braukurse', studio: 'Straßenbräu',
    blurb: 'Berliner Craft-Brauerei, die seit 2015 am Ostkreuz braut und seit 2021 in der eigenen Brauerei in Marzahn. Ihre neue Bar, der Ausschank 2, hat direkt am Görlitzer Park in Kreuzberg eröffnet: 14 Zapfhähne, hohe Decken, Altbau-Charme und eine eigene Küche. Beim Biertasting (2 Stunden, ab fünf Personen) verkostet ihr sieben Biere frisch vom Hahn und erfahrt, wie Bier gebraut wird, woher die Farben kommen und wie Malz und Hopfen schmecken. Der Braukurs dauert fünf Stunden mit einem der Brauer, mit Verkostung aller Biere, Mittagessen und einem Liter selbst gebrautem Bier zum Mitnehmen. Für Weihnachtsfeiern und Teamevents stellen sie komplette Pakete mit Essen und Getränken zusammen.',
    group: 'Ab 5', duration: '2–5 Std.', place: 'Ausschank 2, Görlitzer Str. 52, Kreuzberg', languages: 'DE · EN',
    priceNote: 'Biertasting · Braukurs 114 €' },
  { slug: 'beavis-bar', name: 'Beavis Bar', specialty: 'Craft-Spirituosen- & Whisky-Tastings', studio: 'Beavis Bar',
    blurb: 'Eine kleine Bar in Mitte mit über 1.400 Craft-Spirituosen von kleinen Destillerien aus aller Welt, viele davon gibt es sonst nirgends in Berlin. Beim Whisky-Tasting probiert ihr fünf bis sechs Craft-Whiskys, darunter Raritäten, und hört die Geschichte hinter jeder Flasche – für Neulinge wie Kenner. Neunzig Minuten, bis zu zwölf Personen, auf Deutsch, Englisch, Französisch oder Italienisch. Für Teams und Weihnachtsfeiern läuft das Tasting auch privat – ein Abend, an den man sich länger erinnert als an die übliche Open Bar. Private Tastings ab vier Personen, Mittwoch bis Samstag (sonntags bis dienstags ist die Bar geschlossen).',
    group: '4–12 · Mi–Do abends, Fr–Sa um 19:00 · eine Woche Vorlauf', duration: '1,5 Std.', place: 'Veteranenstraße 11, Mitte', languages: 'DE · EN · FR · IT' },
  { slug: 'schoppe-braeu', name: 'Schoppe Bräu', specialty: 'Biertastings & Brauereiführungen', studio: 'Schoppe Bräu',
    blurb: 'Thorsten Schoppe ist Diplom-Braumeister (Dipl.-Ing. Brauwesen) und gehört seit 2001 zu den Pionieren der Berliner Craft-Beer-Szene, mit seiner eigenen kleinen Brauerei. Jeden Montag lädt er zum Brew Monday in seinen Taproom in Kreuzberg: acht Biere in 90 Minuten, wie sich die Bierstile unterscheiden, wie man Bier wie ein Brauer verkostet, und Geschichten aus Jahrzehnten am Sudkessel. In der Brauerei am Pfefferberg in Prenzlauer Berg macht er außerdem Verkostungen und Brauereiführungen. Für Teams und private Gruppen organisiert er Tastings auch an anderen Tagen.',
    group: 'Kleine Gruppen, meist 8–10 · kostenlose Stornierung bis 24 Std. vorher', duration: '1,5 Std.', place: 'Taproom BKK, Manteuffelstr. 53, Kreuzberg · Brauerei am Pfefferberg, Schönhauser Allee 176, Prenzlauer Berg', languages: 'DE' },
  { slug: 'waldsamkeit', name: 'Waldsamkeit', specialty: 'Wildkräuterwanderungen', studio: 'Waldsamkeit',
    blurb: 'Waldsamkeit macht Naturführungen mit naturwissenschaftlichem Hintergrund: Biologe Manuel Larbig und sein Team junger Naturexpert:innen prüfen altes Pflanzenwissen, statt es einfach zu übernehmen. Auf der klassischen dreistündigen Wildkräuterwanderung lernt ihr in einem Berliner Park oder Wald mindestens zwanzig Wildpflanzen kennen: was essbar ist, was heilend wirkt, welche giftigen Doppelgänger ihr meiden solltet und woher die Namen kommen. Die Gruppen bleiben klein, höchstens zwölf. Die lange Tour endet mit Picknick und Wildkräuterbutter, und für Firmen gestalten sie Teamtage in der Natur rund um eure Gruppe.',
    group: 'Bis 12 bei offenen Touren · Teams auf Anfrage', duration: '3–6 Std.', place: 'Parks und Wälder in ganz Berlin', languages: 'DE · EN' },
  { slug: 'zoenoteka', name: 'ZÖNOTÉKA', specialty: 'Schweißen, Tufting, Zuckerkunst & mehr', studio: 'ZÖNOTÉKA',
    blurb: 'Ein gemeinnütziger Projektraum in Neukölln, 2014 gegründet, halb Werkstatt, halb Galerie: eine gut ausgestattete Werkstatt für Holz und Styropor, eine selbstgebaute CNC-Fräse und wechselnde Künstler:innen und Kursleiter:innen. Daraus entstehen Workshops, die es sonst kaum gibt: einen Metall-Lampenschirm per MIG/MAG selbst schweißen, einen Silberring fertigen, am Wochenende einen kleinen Teppich tuften, Lollis in der japanischen Zuckerkunst Amezaiku formen, Siebdruck, Cyanotypie, Zines oder ein eigenes MIDI-Instrument bauen und spielen. Rund zehn Mitglieder machen das gemeinsam, und sie arbeiten viel mit Schulen und Institutionen, bei sich oder vor Ort. Ihre Idee für jeden Workshop: Man lernt etwas über ein Thema, oft aus der Berliner Geschichte, und macht zusammen ein kleines Stück, das man als eigenes Souvenir mit nach Hause nimmt. Keine Vorkenntnisse nötig.',
    group: 'Bis 20 · Druck 10–12', duration: 'Meist 4 Std.', place: 'Hobrechtstraße 54, Neukölln', languages: 'DE · EN' },
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
  { slug: 'luc-demissy', name: 'Luc Demissy', specialty: 'Zeichnen, Kohle, Aquarell & Pastell',
    blurb: 'Luc Demissy, geboren in Nancy, ist Maler, lebt und arbeitet zwischen Berlin und Strasbourg und unterrichtet seit vielen Jahren. Er kommt zu euch, ins Büro, nach Hause oder in einen Raum eurer Wahl, und bringt alles mit: Papier, Farben, Pinsel und seinen ruhigen, geduldigen Blick. Ein Kurs beginnt mit dem Zeichnen nach einem Stillleben und geht dann ins freie Zeichnen mit Kohle und Malen mit Aquarell oder Pastell über, für komplette Anfänger wie für Fortgeschrittene. Für Teams ist es ein ruhiger, konzentrierter Nachmittag ohne Bildschirm, nach dem alle mit einem eigenen Bild nach Hause gehen. Im Sommer gibt er außerdem einen fünftägigen Eitempera-Kurs in Frankreich (Grand Est) für sechs bis acht Personen.',
    group: '5–15 · samstags, für Firmen auch unter der Woche', duration: '3–5 Std.', place: 'Bei euch: Büro, Zuhause oder eine Location in Berlin', languages: 'DE · FR',
    priceNote: '15 € pro Person und Stunde, Material inklusive' },
  { slug: 'concreare', name: 'Concreare', specialty: 'Töpfern & Keramik bemalen', studio: 'Concreare',
    blurb: 'Constanzes ruhiges Atelier in der Knobelsdorffstraße in Charlottenburg ist wie gemacht für kleine Gruppen. Im Töpferkurs ohne Drehscheibe formst du mit verschiedenen Aufbautechniken Schalen und Objekte aus Ton, im Keramik-Malkurs gestaltest du ein fertiges Stück. Beide dauern zwei Stunden, brauchen keine Vorkenntnisse, und dein Stück wird für dich gebrannt und glasiert. Für Geburtstage, JGAs und Teamevents kannst du das Atelier auch exklusiv buchen, für bis zu zwölf Personen.',
    group: '4–12', duration: '2 Std.', place: 'Knobelsdorffstraße 43, Charlottenburg', languages: 'DE' },
  { slug: 'jeannette-tolksdorff', name: 'Jeannette', specialty: 'Aquarell für Eltern & Kinder', studio: 'JT & ArtDesign',
    blurb: 'Jeannette malt schon immer und ist Kunstlehrerin an einer Grundschule. Als sie immer öfter privat nach Aquarellkursen gefragt wurde, hat sie ihre eigenen Kurse gestartet, vor allem für Kinder und für Eltern und Kinder, die nebeneinander malen. Sie bringt alles in einer großen Kiste mit: Sie zeigt, wie man sein Motiv zeichnet, eine Pflanze, ein Tier oder ein Gesicht, und wie man es dann in Aquarell umsetzt. Mit ihrem Leuchttisch kann man ein Bild abpausen oder es Schritt für Schritt mit ihr erarbeiten, und wer frei malen möchte, malt frei. Sie malt selbst natürliche Motive, Pflanzen, Tiere und Porträts, mit hochwertigen Farben auf Büttenpapier, und begleitet dich Schritt für Schritt bis zum fertigen Bild, ob Anfänger oder Fortgeschrittene. Geduldig, herzlich und für Kleine wie Große gemacht.',
    group: 'Kinder & Erwachsene · gern Eltern-Kind', duration: '2 Std.', place: 'Im Turm, Busonistr. 136, Karow (Pankow)', languages: 'DE',
    priceNote: '29 € pro Person, Material inklusive' },
  { slug: 'paintnow', name: 'PaintNow', specialty: 'Mal-Workshops für Teams', studio: 'PaintNow',
    blurb: 'PaintNow bringt angeleitetes Malen in Unternehmen, in Berlin und ganz Deutschland, für Gruppen von zehn bis mehreren hundert Personen. Die Formate sind für alle gemacht, die schwören, nicht malen zu können: Sip & Paint, gemeinsam auf einer großen Leinwand malen, Speed-Painting-Porträts der Kolleg:innen, riesige Papierbuchstaben mit euren Teamwerten, Puzzle-Malerei auf Holz, T-Shirts mit Firmenlogo und ruhigere Formate mit Klangbad, Mandalas oder Ton. Ilinca hat damit angefangen, Klangheilung und Malen in Yogastudios zu verbinden, und macht PaintNow heute in Vollzeit. Sie kommt mit allem Nötigen zu euch ins Büro, in ein Restaurant, eine Bar oder einen Meetingraum, überall in Berlin; ein Studio kann für 100 € für drei Stunden dazugebucht werden. Zwei Stunden, auf Wunsch mit einer Extrastunde, und auf Anfrage ein Motiv, das sie für euer Team entwirft. Für ein oder zwei Personen gibt es außerdem abstraktes Malen. Bucht wenn möglich mindestens fünf Tage vorher; Ilinca bestätigt innerhalb von ein bis zwei Tagen. Bezahlt wird bei der Buchung, ein Termin kann verschoben, aber nicht erstattet werden.',
    group: '10–200', duration: '2–3 Std.', place: 'Bei euch im Büro oder in der Location, überall in Berlin', languages: 'EN · DE',
    priceNote: 'ab 59 € pro Person · mindestens 10 (kleinere Gruppen zahlen für 10) · Extrastunde 15 € p. P. · Studio +100 € für 3 Std.' },
  { slug: 'atelier-sinn', name: 'Atelier Sinn', specialty: 'Naturkosmetik, Textile Art, Collage & mehr', studio: 'Atelier Kora Sinn',
    blurb: 'Ein kreativer Ort nahe Senefelderplatz, gegründet von Interior Designerin und Creative Director Kornelia Sinn: hohe Decken, ein sorgfältig gestaltetes Interior und zwei großzügige Räume. Für Teams gibt es acht dreistündige Formate – Collage & Mixed Media, Naturkosmetik mit eigener Verpackung, Textile Art, Duftkerzen, Duftsprays, Ton, Schmuck & Charms und Porzellandesign –, und auf Wunsch wird eines auf eure Markenfarben, euer Logo oder ein gemeinsames Thema zugeschnitten. Material, Anleitung, Snacks und Getränke sind inklusive, Catering auf Anfrage. Offene Workshops gibt es etwa zum Glow-Serum oder zum festlichen Weihnachts-Tablescaping.',
    group: '5–20', duration: '3 Std.', place: 'Saarbrücker Str. 15, Prenzlauer Berg', languages: 'DE · EN' },
  { slug: 'lucille-guder', name: 'Lucille Guder', specialty: 'Selbstfotografie- & Blumencollage-Workshop für Frauen',
    blurb: 'Lucille Guder ist eine französische Autodidaktin, die in Berlin lebt und Blumenfrauen aus Acryl, Papier und getrockneten Blumen macht – mit leeren Gesichtern, damit sich jede Frau in ihnen wiederfinden kann. Zusammen mit Ātma Portrait bietet sie einen Workshop an, der Frauen hilft, sich mit ihrem Körper zu versöhnen und sich durch Fotografie selbst besser wahrzunehmen. Nach einer Einführung und einem Gespräch über unsere Beziehung zu unserem Körper fotografierst du dich eine Stunde lang selbst, ganz allein im Studio hinter Sichtschutzvorhängen: Nur du siehst deine Bilder. Nach einer Pause mit Getränken und Snacks verwandelst du deine eigenen Körperlinien in eine handgemachte Blumencollage, mit einer einfachen Technik, für die du keine Zeichenerfahrung brauchst. Du nimmst rund fünfzig hochwertige Schwarz-Weiß-Fotos, deine A4-Collage und die Technik mit nach Hause. Bring einen USB-Stick für deine Fotos mit, denn sie werden nicht gespeichert, und eine Mappe für die Collage. Außerdem unterrichtet sie ihre typische Punkt-Maltechnik bei sich zu Hause in Prenzlauer Berg, und für JGAs und Geburtstage kommt sie mit ihrem Blumenkranz-Workshop in euer Restaurant, Hotel oder eure Location, auch für größere Gruppen.',
    group: 'Selbstfotografie: 2–4, nur für Frauen · Blumenkränze: auch größere Gruppen', duration: '3,5 Std.', place: 'Ātma Self-Portrait Photo Studio, Reichenberger Str. 109, Kreuzberg', languages: 'EN · FR',
    priceNote: 'Punkt-Malkurs 49 € · Blumenkränze 50 € pro Person' },
  { slug: 'marija', name: 'Marija', specialty: 'Upcycling: Papierschöpfen, Stoff & Wachssiegel',
    blurb: 'Marija hat Kunstgeschichte studiert, kommt aus dem Erziehungsbereich und macht Upcycling: Stoffe und Material, die auf der Straße liegen gelassen wurden, werden gewaschen und zu Kissenbezügen und anderen Unikaten. In ihren Workshops schöpft ihr Papier aus Altpapier, Resten von farbigem Karton und alten Tüten, gemixt und gegossen, mit Blüten oder etwas Glitzer; dazu Siegel aus Wachs oder Weihnachtssterne aus Papier. Ruhig, handfest und schick, und sie hat es schon mit Kindergartenkindern wie mit älteren Menschen gemacht. Einmalige Workshops für Firmen und Gruppen, in ihrem großen Studio in Lichtenberg nahe Ostkreuz, oder sie bringt alles zu euch mit.',
    group: 'Gruppen und Teams', duration: 'Auf Anfrage', place: 'Ihr Studio in Lichtenberg nahe Ostkreuz, oder bei euch', languages: 'DE' },
];

/** French copy, for a host who writes in French (Lucille). Every other
 *  preview host falls back to English in French. */
const fr: HostCopy[] = [
  { slug: 'luc-demissy', name: 'Luc Demissy', specialty: 'Dessin, fusain, aquarelle & pastel',
    blurb: 'Né à Nancy, Luc Demissy est peintre ; il vit et travaille entre Berlin et Strasbourg et enseigne depuis de nombreuses années. Il vient chez vous, au bureau, à la maison ou dans le lieu de votre choix, et apporte tout le matériel : papier, couleurs, pinceaux. Un cours commence par le dessin d’après une nature morte, puis passe au dessin libre au fusain et à la peinture à l’aquarelle ou au pastel, pour les débutants comme pour les plus avancés. Pour une équipe, c’est un après-midi calme et concentré loin des écrans, et chacun repart avec son propre tableau. L’été, il propose aussi un stage de tempera à l’œuf de cinq jours en France (Grand Est), pour six à huit personnes.',
    group: '5–15 · le samedi, en semaine pour les entreprises', duration: '3–5 h', place: 'Chez vous : bureau, domicile ou un lieu à Berlin', languages: 'DE · FR',
    priceNote: '15 € par personne et par heure, matériel compris' },
  { slug: 'lucille-guder', name: 'Lucille Guder', specialty: 'Atelier d’autoportrait photo et de collage floral pour femmes',
    blurb: 'Lucille Guder est une artiste française autodidacte installée à Berlin, qui crée des femmes-fleurs en acrylique, papier et fleurs séchées, le visage laissé vide pour que chaque femme puisse s’y reconnaître. Avec Ātma Portrait, elle propose un atelier qui aide les femmes à se réconcilier avec leur corps et à mieux se connaître grâce à la photographie. Après une introduction et un échange sur notre rapport à notre corps, tu te photographies pendant une heure, seule dans le studio derrière des rideaux d’intimité : tu es la seule à voir tes photos. Après une pause avec boissons et en-cas, tu transformes les lignes de ton corps en un collage floral fait main, avec une technique simple qui ne demande aucune expérience en dessin. Tu repars avec une cinquantaine de photos numériques en noir et blanc de haute qualité, ton collage A4 et la technique. Apporte une clé USB pour tes photos, qui ne sont pas conservées, et une pochette pour le collage. Elle enseigne aussi sa technique de peinture à points chez elle, à Prenzlauer Berg, et pour les EVJF et les anniversaires, elle vient avec son atelier de couronnes de fleurs dans votre restaurant, votre hôtel ou le lieu de votre choix, y compris pour les grands groupes.',
    group: 'Autoportrait photo : 2 à 4, uniquement pour les femmes · couronnes de fleurs : grands groupes', duration: '3,5 h', place: 'Ātma Self-Portrait Photo Studio, Reichenberger Str. 109, Kreuzberg', languages: 'EN · FR',
    priceNote: 'cours de peinture à points 49 € · couronnes de fleurs 50 € par personne' },
];

const facets: Record<string, Facets> = {
  'test-jirel':          { activity: 'craft',       groupRange: [1, 10],   hourRange: [2, 2],   groupPrice: 45 },
  // Corporate price from Diana's email; public classes are €79.
  rtmis:                 { activity: 'craft',       groupRange: [5, 15],   hourRange: [2, 2.5], groupPrice: 65 },
  // PLACEHOLDER maximum — the bar names no cap. Tasting €34 in their shop
  // (the product text still says €29).
  strassenbraeu:         { activity: 'food',        groupRange: [5, 30],   hourRange: [2, 5],   groupPrice: 34 },
  'beavis-bar':          { activity: 'food',        groupRange: [4, 12],   hourRange: [1.5, 1.5] },
  // PLACEHOLDER maximum: Thorsten said usually 8–10 guests (call 28.10.26).
  'schoppe-braeu':       { activity: 'food',        groupRange: [1, 12],   hourRange: [1.5, 1.5] },
  // PLACEHOLDER team maximum — public walks take 12.
  waldsamkeit:           { activity: 'food', alsoIn: ['wellbeing'], groupRange: [1, 12], hourRange: [3, 6] },
  zoenoteka:             { activity: 'craft',       groupRange: [1, 20],   hourRange: [2.5, 8] },
  hobbytischlerei:       { activity: 'craft',       groupRange: [1, 4],    hourRange: [5, 8] },
  // Team formats on Konfetti: chocolate €75 (10–15 people), macarons €85
  // (6–10); public classes €75–85.
  yahelis:               { activity: 'food',        groupRange: [6, 15],   hourRange: [3.5, 4], groupPrice: 75 },
  // Team workshop 14–40; the weekly class is 1 h (2 with afro).
  'groove-in-focus':     { activity: 'music', alsoIn: ['wellbeing'], groupRange: [14, 40], hourRange: [1, 2] },
  'luc-demissy':         { activity: 'art',         groupRange: [5, 15],   hourRange: [3, 5],   groupPrice: [45, 75] },
  concreare:             { activity: 'ceramics',    groupRange: [4, 12],   hourRange: [2, 2] },
  // PLACEHOLDER ranges — nothing published.
  'jeannette-tolksdorff': { activity: 'art',        groupRange: [1, 10],   hourRange: [2, 2],   groupPrice: 29 },
  // Ilinca, call 26.10.26: from €59 per person, minimum 10 (fewer pay for
  // 10), 2 h + optional hour at €15 pp; usually 20–30 people. Up to
  // 200 on their Konfetti listings.
  paintnow:              { activity: 'art',         groupRange: [10, 200], hourRange: [2, 3],   groupPrice: 59 },
  'atelier-sinn':        { activity: 'craft',       groupRange: [5, 20],   hourRange: [3, 3],   groupPrice: 59 },
  // From our call on 26.10.26: 2 to 4 for the self-photography workshop
  // (Kreuzberg), dots painting at her flat in Prenzlauer Berg, flower crowns
  // at the client's venue for larger groups at €50 per person. PLACEHOLDER
  // maximum of 20 for the crowns (she said "grands groupes", no number).
  'lucille-guder':       { activity: 'photography', alsoIn: ['art'], groupRange: [2, 20], hourRange: [2, 3.5], groupPrice: [50, 119] },
  // PLACEHOLDER group size and length: Marija gave no numbers yet (asked
  // in the confirmation email of 27.10.26). No price yet either.
  marija:                { activity: 'craft',       alsoIn: ['art'], groupRange: [2, 15], hourRange: [2, 3] },
};

const firstNames: Record<string, string> = {
  'test-jirel': 'Jirel',
  rtmis: 'Diana', 'beavis-bar': 'Jon', 'schoppe-braeu': 'Thorsten', waldsamkeit: 'Manuel', zoenoteka: 'Máté', hobbytischlerei: 'Micha',
  yahelis: 'Yahel', 'groove-in-focus': 'Eric', 'luc-demissy': 'Luc', concreare: 'Constanze',
  'jeannette-tolksdorff': 'Jeannette', paintnow: 'Ilinca', 'atelier-sinn': 'Kora', 'lucille-guder': 'Lucille', marija: 'Marija',
};

const areas: Record<string, { area: string; onSite?: boolean }> = {
  'test-jirel': { area: 'Berlin' },
  rtmis: { area: 'Wedding', onSite: true }, strassenbraeu: { area: 'Kreuzberg' }, 'beavis-bar': { area: 'Mitte' }, 'schoppe-braeu': { area: 'Kreuzberg' },
  waldsamkeit: { area: 'Berlin' }, zoenoteka: { area: 'Neukölln' }, hobbytischlerei: { area: 'Kaulsdorf' },
  yahelis: { area: 'Friedrichshain' }, 'groove-in-focus': { area: 'Neukölln', onSite: true },
  'luc-demissy': { area: 'Prenzlauer Berg', onSite: true }, concreare: { area: 'Charlottenburg' }, 'jeannette-tolksdorff': { area: 'Pankow' },
  paintnow: { area: 'Berlin', onSite: true }, 'atelier-sinn': { area: 'Prenzlauer Berg' }, 'lucille-guder': { area: 'Kreuzberg', onSite: true }, marija: { area: 'Lichtenberg', onSite: true },
};

/** Formats each preview host runs on request, with no public date. */
const onRequest: Record<string, PreviewOffer[]> = {
  rtmis: [
    { title: 'Terrazzo oder Marmoreffekt für eure Gruppe (ab 5 Personen)', titleEn: 'Terrazzo or marble effect for your group (from 5 people)', duration: '2–2.5 h', price: '€65', url: 'https://www.rtmis.net/workshops' },
    { title: 'Großer Terrazzo-Teller (2 Plätze pro Termin, nach einem kleinen Objekt)', titleEn: 'Large terrazzo plate (2 spots per session, after a small object)', url: 'https://www.rtmis.net/workshops' },
    { title: 'Terrazzo-Beistelltisch (max. 2 Personen)', titleEn: 'Terrazzo side table (2 people at most)', url: 'https://www.rtmis.net/workshops' },
  ],
  strassenbraeu: [
    { title: 'Biertasting im Ausschank 2 (ab 5 Personen)', titleEn: 'Beer tasting at Ausschank 2 (from 5 people)', duration: '2 h', price: '€34', url: 'https://www.strassenbraeu.de/products/biertasting' },
    { title: 'Braukurs mit Mittagessen und 1 Liter Bier', titleEn: 'Brewing class with lunch and a litre of beer', duration: '5 h', price: '€114', url: 'https://www.strassenbraeu.de/products/strassenbrau-braukurs' },
    { title: 'Weihnachtsfeier oder Firmenevent mit Essen & Getränken', titleEn: 'Christmas party or company event with food & drinks', url: 'https://www.strassenbraeu.de/pages/ausschank-2' },
  ],
  'beavis-bar': [
    { title: 'Privates Whisky-Tasting für eure Gruppe', titleEn: 'Private whisky tasting for your group', duration: '1.5 h', price: '€99', url: 'https://beavis.bar/' },
  ],
  'schoppe-braeu': [
    { title: 'Brew Monday: 8 Biere in 90 Minuten (jeden Montag)', titleEn: 'Brew Monday: 8 beers in 90 minutes (every Monday)', duration: '1.5 h', district: 'Kreuzberg', url: 'https://www.schoppebraeutaproom.de/' },
    { title: 'Verkostung & Brauereiführung am Pfefferberg', titleEn: 'Tasting & brewery tour at the Pfefferberg', district: 'Prenzlauer Berg', url: 'https://www.schoppebraeu.de/' },
    { title: 'Privates Biertasting für Teams und Gruppen', titleEn: 'Private beer tasting for teams and groups', duration: '1.5 h', url: 'https://www.schoppebraeu.de/' },
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
    { title: 'Zeichnen & Aquarell bei euch (5–15 Personen)', titleEn: 'Drawing & watercolour at your place (5–15 people)', duration: '3–5 h', price: '€45–75', url: 'https://www.luc-demissy.de/' },
    { title: 'Kohle oder Pastell bei euch (5–15 Personen)', titleEn: 'Charcoal or pastel at your place (5–15 people)', duration: '3–5 h', price: '€45–75', url: 'https://www.luc-demissy.de/' },
    { title: 'Sommerkurs: 5 Tage Eitempera in Frankreich (Grand Est, 6–8 Personen)', titleEn: 'Summer course: 5 days of egg tempera in France (Grand Est, 6–8 people)', duration: '5 days', url: 'https://www.luc-demissy.de/' },
  ],
  concreare: [
    { title: 'Atelier exklusiv: Töpfern oder Keramik bemalen für eure Gruppe', titleEn: 'Studio to yourselves: pottery or ceramic painting for your group', duration: '2 h', url: 'https://www.concreare.de/' },
  ],
  'jeannette-tolksdorff': [
    { title: 'Aquarell-Kurs für Kinder und für Eltern & Kinder', titleEn: 'Watercolour course for children, and for parents & children', duration: '2 h', price: '€29', district: 'Karow', url: 'https://www.jtart.de/' },
  ],
  paintnow: [
    { title: 'Sip & Paint fürs Team', titleEn: 'Sip & Paint for your team', duration: '2 h', price: '€59', url: 'https://www.paintnow.de/team-building' },
    { title: 'Gemeinsam auf Großleinwand malen', titleEn: 'Painting together on a large canvas', duration: '2 h', price: '€59', url: 'https://www.paintnow.de/team-building' },
    { title: 'Speed-Painting: Kolleg:innen porträtieren', titleEn: 'Speed painting: portraits of your colleagues', duration: '2 h', price: '€59', url: 'https://www.paintnow.de/team-building' },
    { title: 'T-Shirts mit Firmenlogo bemalen', titleEn: 'Paint T-shirts with your company logo', duration: '2 h', price: '€59', url: 'https://www.paintnow.de/team-building' },
    { title: 'Abstraktes Malen für dich oder zu zweit', titleEn: 'Abstract painting for one or two', url: 'https://www.paintnow.de/' },
  ],
  'atelier-sinn': [
    { title: 'Teamevent: eines von acht Formaten, auf Wunsch in euren Markenfarben', titleEn: 'Team event: one of eight formats, in your brand colours if you like', duration: '3 h', price: '€59', url: 'https://www.atelier.korasinn.de/teams' },
  ],
  'lucille-guder': [
    { title: 'Selbstfotografie & Blumencollage (nur für Frauen, 2–4 Teilnehmerinnen)', titleEn: 'Self-photography & flower collage (women only, 2–4 participants)', duration: '3.5 h', price: '€119', url: 'https://www.lucilleguder.com/product/self-photography-and-flower-collage-workshop' },
    { title: 'Malkurs: Lucilles Punkt-Technik (nur für Frauen, max. 4)', titleEn: 'Painting class: Lucille’s dots technique (women only, max. 4)', duration: '2.5 h', price: '€49', district: 'Prenzlauer Berg', url: 'https://www.lucilleguder.com/product/painting-class-learn-the-dots-technique-with-me' },
    { title: 'Blumenkranz-Workshop bei euch (JGA, Geburtstag, auch größere Gruppen)', titleEn: 'Flower-crown workshop at your venue (hen party, birthday, larger groups too)', duration: '2 h', price: '€50', district: 'bei euch', url: 'https://www.lucilleguder.com/self-photography-and-flower-collage-workshop' },
  ],
  marija: [
    { title: 'Papierschöpfen aus Altpapier, mit Wachssiegel', titleEn: 'Paper making from waste paper, with wax seals', district: 'Lichtenberg', url: '' },
    { title: 'Weihnachtssterne aus Papier', titleEn: 'Paper Christmas stars', district: 'Lichtenberg', url: '' },
  ],
};

export const preview = { copy: { en, de, fr }, facets, firstNames, areas, onRequest } satisfies {
  copy: { en: HostCopy[]; de: HostCopy[]; fr: HostCopy[] };
  facets: Record<string, Facets>;
  firstNames: Record<string, string>;
  areas: Record<string, { area: string; onSite?: boolean }>;
  onRequest: Record<string, PreviewOffer[]>;
};

