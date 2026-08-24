/**
 * Weekly workshop-feed updater.
 *
 * Fetches each configured host's public schedule page, extracts upcoming
 * classes/workshops, and writes them to site/src/data/live-workshops.json.
 * The site build (site/src/data/sessions.ts) shows these real sessions in
 * the /happening-today/ feed, with the Book button leading to the host's
 * own booking page instead of the app.
 *
 * Run by .github/workflows/update-workshops.yml on a weekly cron (and by
 * hand via workflow_dispatch). Designed to degrade safely: a source that
 * fails to fetch or parse keeps its previous entries (minus past dates)
 * and the feed falls back to the generated placeholder schedule for that
 * host, so a broken remote page can never blank the site.
 *
 * Extraction strategies, in order:
 *   1. schema.org JSON-LD Event objects (many booking widgets emit these).
 *   2. Wix Bookings visitor API — Wix pages render their schedule
 *      client-side, so the HTML carries no dates at all; the same-domain
 *      /_api/ endpoints serve them with a visitor token the site hands out.
 *   3. <time datetime="..."> elements, paired with the nearest heading.
 * Every run logs what each strategy found so a failing source can be
 * diagnosed from the Actions log alone.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../site/src/data/live-workshops.json');

/** Hosts whose public schedules we check. `slug` must match a host slug in
 *  site/src/data/content.ts; `url` is both the page scraped and where the
 *  feed's Book button sends people. Add a line per host as pages are found. */
const SOURCES = [
  // Each page carries one Acuity class widget, so title and fallback price
  // come from config; dates arrive via the headless render of the widget.
  { slug: 'qian', name: 'Qian — Clay Garden pottery classes', mode: 'dates-de',
    url: 'https://www.claygarden.studio/pottery-classes',
    title: 'Handbuilding Class with Clay Garden Studio', price: '€65',
    district: 'Prenzlauer Berg' },
  { slug: 'qian', name: 'Qian — Clay Garden special workshops', mode: 'dates-de',
    url: 'https://www.claygarden.studio/special-workshops',
    title: 'Tea & Pottery Workshop', district: 'Prenzlauer Berg' },
  // Weekly-recurring German schedule ("Dienstags I 18 - 20 Uhr I …"); the
  // parser emits `recurring` entries the site expands into dated sessions.
  { slug: 'nina', name: 'Nina Kranz — Kurse', url: 'https://www.ninakranzart.com/privat-freizeit', mode: 'recurring-de' },
  // German dated list ("Samstag, 29. August 2026"). One product per page,
  // so title and price come from this config when the page yields none.
  { slug: 'karen-rose', name: 'Karen-Rose — Bio Naturkosmetik', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=227019',
    title: 'Bio Naturkosmetik Workshop', price: '€65', duration: '3 h', district: 'Treptow', imagePage: 'https://karen-rose.com/' },
  { slug: 'karen-rose', name: 'Karen-Rose — Keramikgießen | Terrazzo', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=263590&rwstep=product',
    title: 'Keramikgießen | Terrazzo Workshop', titleEn: 'Ceramic Casting | Terrazzo Workshop',
    price: '€59', duration: '3 h', district: 'Treptow', imagePage: 'https://karen-rose.com/' },
  { slug: 'karen-rose', name: 'Karen-Rose — Duftkerzen', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=229230',
    title: 'Duftkerzen Workshop (vegan + nachhaltig)',
    titleEn: 'Scented Candle Workshop (vegan + sustainable)', price: '€55', duration: '2 h', district: 'Treptow', imagePage: 'https://karen-rose.com/' },
  { slug: 'karen-rose', name: 'Karen-Rose — Naturkosmetik Essentials', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=264518',
    title: 'Bio Naturkosmetik Workshop - Essentials',
    titleEn: 'Organic Natural Cosmetics Workshop - Essentials', price: '€49', duration: '2 h', district: 'Treptow', imagePage: 'https://karen-rose.com/' },
  { slug: 'karen-rose', name: 'Karen-Rose — Terrazzo Schmuck', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=320775',
    title: 'Terrazzo Schmuck', titleEn: 'Terrazzo Jewelry', price: '€59', duration: '3 h', district: 'Treptow', imagePage: 'https://karen-rose.com/' },
  { slug: 'karen-rose', name: 'Karen-Rose — Shampoo Naturkosmetik', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/?re-product-id=229220',
    title: 'Shampoo Naturkosmetik Workshop', titleEn: 'Shampoo Natural Cosmetics Workshop',
    price: '€55', duration: '3 h', district: 'Treptow', imagePage: 'https://karen-rose.com/' },
  // Shopify shop: the collection's products.json carries every workshop,
  // its dated sessions (variants titled "DD.MM.YYYY - HH:MM"), per-date
  // price and availability — fully automatic, nothing configured per
  // workshop. New products in the collection appear on their own.
  { slug: 'galleria-lucia', name: 'Galleria Lucia — workshops', mode: 'shopify',
    url: 'https://www.gallerialucia.com/collections/workshops/products.json?limit=250',
    district: 'Lichtenberg' },
  // Each baking date on the page carries its own eventfrog.de ticket link,
  // and Eventfrog serves a .ics per event with the exact start/end — fully
  // automatic, new dates appear on their own. €55 is the organizer-set
  // ticket price shown on Eventfrog.
  { slug: 'kohfink', name: 'Imkerei Kohfink — Back-Kurse', mode: 'eventfrog',
    url: 'https://imkerei-kohfink.de/BACK-KURSE/',
    price: '€55', district: 'Kaulsdorf' },
  // Shopify catalog + Cowlendar booking modal ("you only see the dates
  // after clicking Book") — but Cowlendar's availability API answers plain
  // GETs, so every slot reads without a browser. Sessions run near-daily;
  // maxDays keeps the volume sane.
  { slug: 'munio', name: 'The Munio — workshops', mode: 'shopify-cowlendar',
    base: 'https://themunio.de', collection: 'workshops',
    url: 'https://themunio.de/collections/workshops',
    district: 'Schöneberg', maxDays: 45 },
  // Pasta Madre's Wix calendar renders every course server-side as
  // h2-titled blocks; the three solidarity prices (Tulpe/Lilie/Rose)
  // surface as a €76–100 range.
  { slug: 'pastamadre', name: 'Pasta Madre — Kurstermine', mode: 'titled-date-blocks',
    url: 'https://www.pastamadre.de/calendar-kurstermine', district: 'Wedding' },
  // Coffee and Bananas (Angelo & Linda's café) lists the roasting
  // workshop's upcoming dates as bare text on the homepage; booking and
  // price live on their tenfarmersandbananas.com shop.
  { slug: 'angelo', name: 'Coffee and Bananas — roasting workshops', mode: 'dated-time-list',
    url: 'https://www.coffeeandbananas.com/',
    startMarker: 'UPCOMING WORKSHOPS', endMarker: 'JETZT TEILNEHMEN',
    title: 'DIY Kaffeerösten', titleEn: 'DIY Coffee Roasting', price: '€59',
    district: 'Prenzlauer Berg',
    bookUrl: 'https://tenfarmersandbananas.com/produkt/diy-kaffeeroesten-in-berlin/' },
  // Squarespace site booking through Konfetti — the sitemap finds every
  // course page, each page's embedded widget names its Konfetti event, and
  // the calendar API serves the dates with live tickets left.
  { slug: 'ceramic-kingdom', name: 'Ceramic Kingdom — taster widgets (Konfetti)', mode: 'konfetti',
    url: 'https://www.ceramickingdomberlin.com/sitemap.xml',
    pagePattern: '/en/(class|wheelthrowing|handbuilding|moldmaking|glazing|sgraffito|mini)|/try-',
    district: 'Neukölln' },
  // Their regular courses book through per-category Acuity embeds on the
  // class pages (the account's plain scheduler holds only 1-on-1 slots),
  // so this source follows the embed links the site itself publishes.
  { slug: 'ceramic-kingdom', name: 'Ceramic Kingdom — course catalog (Acuity)', mode: 'acuity-embeds',
    url: 'https://www.ceramickingdomberlin.com/sitemap.xml#acuity',
    pagePattern: '/en/(class|wheelthrowing|handbuilding|moldmaking|glazing|sgraffito|mini)|/try-',
    district: 'Neukölln' },
  // Sabine's dates live only in her Konfetti storefront — her own Termine
  // page draws its calendar client-side. The store is read for data only:
  // no Konfetti links on the site — cards point at her Termine page and
  // take booking requests by mail (requestBooking).
  { slug: 'sabine', name: 'Mobile Dunkelkammer — Kurse', mode: 'konfetti',
    url: 'https://mobile-dunkelkammer.gokonfetti.com/de-de/',
    pagePattern: '/de-de/e/', idFromUrl: true,
    excludeTitle: 'Profi-Dunkelkammer|Gutschein|Vermietung|Geschenk',
    requestBooking: true, infoUrl: 'https://www.mobile-dunkelkammer.com/workshops/termine/',
    // The Termine page publishes no share image — her workshops overview
    // does, and it serves every card that would otherwise go without.
    imagePage: 'https://www.mobile-dunkelkammer.com/workshops/',
    district: 'Lichtenberg' },
  // Her Termine page's Google Calendar additionally lists the open
  // darkroom evenings (Offener Werkstattabend) that the Konfetti store
  // doesn't sell. excludeTitle drops the course dates the store already
  // delivers, so the two sabine sources never double-list a session.
  { slug: 'sabine', name: 'Mobile Dunkelkammer — Termine-Kalender', mode: 'gcal-embed',
    url: 'https://www.mobile-dunkelkammer.com/workshops/termine/',
    // The Konfetti store source already sells the courses; '*'-prefixed
    // entries are her announcements of off-site fairs, not sessions here.
    excludeTitle: 'Farbfilm|Film[- ]und[- ]Foto|Mach mal blau|Schwarz|Cyanotypie|^\\*',
    requestBooking: true, infoUrl: 'https://www.mobile-dunkelkammer.com/workshops/termine/',
    imagePage: 'https://www.mobile-dunkelkammer.com/workshops/',
    district: 'Lichtenberg' },
  // Schmiede im Hof (Schmiedekurse Berlin): the Jimdo site prints the
  // whole schedule as German prose blocks with live seat counts; booking
  // runs by mail, so cards take requests and link the Kurstermine page.
  // The Mecklenburg summer workshop isn't a Berlin session.
  { slug: 'schmiede', name: 'Schmiedekurse Berlin — Kurstermine', mode: 'kurs-blocks-de',
    url: 'https://www.schmiedekurse-berlin.de/schmiedekurse-kurstermine/',
    excludeTitle: 'Mecklenburg|Sehlsdorf',
    defaultTime: '10:00', requestBooking: true, district: 'Blankenburg' },
  // Their children's forging introductions (ages 10-14, school-holiday
  // mornings and afternoons) live on their own page in the same format —
  // the titles name Kinder, so the feed's kids filter picks them up.
  { slug: 'schmiede', name: 'Schmiedekurse Berlin — Kinderschmiedekurse', mode: 'kurs-blocks-de',
    url: 'https://www.schmiedekurse-berlin.de/kinderschmiedekurse/',
    requestBooking: true, district: 'Blankenburg' },
  // Their welding page mixes prose and voucher products around the dated
  // courses ("WIG Schweißen: Mittwoch 26. August 16 - 19.00 Uhr").
  { slug: 'schmiede', name: 'Schmiedekurse Berlin — Schweißkurse', mode: 'kurs-blocks-de',
    url: 'https://www.schmiedekurse-berlin.de/schwei%C3%9Fkurse-kurstermine/',
    courseTitle: 'Schweißkurs', requestBooking: true, district: 'Blankenburg' },
  // The sharpening evening course names itself before its date, so the
  // source supplies the title; watched for the next published date.
  { slug: 'schmiede', name: 'Schmiedekurse Berlin — Messerschärfkurse', mode: 'kurs-blocks-de',
    url: 'https://www.schmiedekurse-berlin.de/sch%C3%A4rfkurse-messersch%C3%A4rfkurse/',
    courseTitle: 'Messerschärfkurs – Abendkurs', requestBooking: true, district: 'Blankenburg' },
  // Berlin Daisuki's Japanese cooking school: the Kochkurs page renders
  // every course with dated headings and WooCommerce product links —
  // in-studio courses in Charlottenburg plus the live online courses.
  { slug: 'daisuki', name: 'Berlin Daisuki — Japanisch-Kochkurse', mode: 'wp-course-dates',
    url: 'https://berlindaisuki.de/japanischkochkurs/', district: 'Charlottenburg' },
  // Wix Bookings service list: /termine renders every dated workshop
  // server-side with its own booking-calendar link, time range and price.
  { slug: 'druckrausch', name: 'Druckrausch — Siebdruck-Termine', mode: 'wix-service-list',
    url: 'https://www.druckrausch.com/termine', district: 'Friedenau' },
  // Readymag site whose PROG_CAL page embeds a Luma calendar — empty today
  // ("No Upcoming Events"), so this watches the calendar's public API and
  // events flow in the week the gallery publishes them.
  { slug: 'sov', name: 'SOV Gallery — program calendar (Luma)', mode: 'luma',
    calendarId: 'cal-qJfZ6kCnFfwad4g', url: 'https://www.sov.gallery/prog_calendar/',
    district: 'Prenzlauer Berg' },
  // One Shopify product per workshop date; the date lives in the product
  // description ("Sonntag, 11. Oktober 2026 von 10 bis 17 Uhr"), which the
  // shopify mode's body-date fallback reads.
  { slug: 'bumerang', name: 'Berliner Bumerang — Workshops', mode: 'shopify',
    url: 'https://berliner-bumerang.de/products.json?limit=250',
    district: 'Lichtenberg' },
  // Sarah's workshop pages list dates as table rows ("23.08.2026 …
  // 11 - 13 Uhr … Hier buchen"), each row linking its own PayPal checkout.
  { slug: 'sarah', name: 'Sarah Niklowitz — Sunday Morning Pages & Brunch', mode: 'dated-time-list',
    url: 'https://sarahniklowitz.de/sunday-morning-pages-brunch/',
    startMarker: 'Next Dates',
    title: 'Sunday Morning Pages & Brunch', price: '€39',
    district: 'Prenzlauer Berg' },
  // Currently lists only past dates ("neue Termine folgen in Kürze") —
  // watched weekly so her next round appears by itself. Runs online.
  { slug: 'sarah', name: 'Sarah Niklowitz — Journaling für Beginner', mode: 'dated-time-list',
    url: 'https://sarahniklowitz.de/journaling-fuer-beginner/',
    startMarker: 'Nächste Termine',
    title: 'Journaling für Beginner', titleEn: 'Journaling for Beginners',
    duration: '2.5–3 h', district: 'Online' },
  // Each listing page links every date to its own checkout.<domain> ticket
  // page, which carries the authoritative date, time, title and price.
  { slug: 'monk-garden', name: 'The Monk Garden — Pilzwanderungen', mode: 'checkout-links-de',
    url: 'https://the-monk-garden.de/pilzwanderung-durch-den-wald/',
    titleEn: 'Mushroom Foraging Walk', duration: '3 h', district: 'Berliner Wald' },
  { slug: 'monk-garden', name: 'The Monk Garden — Wildkräuter-Wanderungen', mode: 'checkout-links-de',
    url: 'https://the-monk-garden.de/wildkrauter-wanderungen/',
    titleEn: 'Wild Herb Walk — Tempelhofer Feld', duration: '2.5–3 h', district: 'Tempelhof' },
  // WordPress page listing the whole schedule as pipe-separated German
  // lines under "Kommende Workshops für <X>:" headers; each entry links its
  // own Eversports booking page.
  { slug: 'beat-etage', name: 'Beat-Etage — kommende Workshops', mode: 'pipe-list-de',
    url: 'https://beat-etage.de/workshops/', district: 'Treptow',
    sections: {
      'Djembes & Dunduns': { title: 'Djembe & Dundun Workshop' },
      'Cajons': { title: 'Cajon Workshop' },
      'Handpan': { title: 'Handpan Workshop' },
    } },
  // Acuity Scheduling ("involves clicking") — but the scheduler embeds its
  // appointment catalog in the page HTML and serves availability as public
  // JSON, so the classes, prices and dates read with plain fetches.
  // The Acuity account behind senle.studio is Faye's — the schedule feeds
  // her existing host card.
  { slug: 'faye', name: 'Senlë Studio (Faye) — Incense Labs', mode: 'acuity',
    owner: '37478855', url: 'https://www.senle.studio/scheduling',
    district: 'Friedrichshain' },
  // Gestaltwandel's Squarespace site books dated classes through Acuity
  // (the embed only exposes the schedule hash). Most of her nine formats
  // run on request — those live on the corporate & group bookings page —
  // so whatever classes she dates appear here automatically.
  { slug: 'celina', name: 'Gestaltwandel — dated workshops (Acuity)', mode: 'acuity',
    scheduleHash: 'eadb79a4', url: 'https://www.gestaltwandel.com/booking',
    district: 'Gesundbrunnen' },
  // Regiondo-hosted shop pages (unlike Karen-Rose's embedded widget) are
  // server-rendered with an Event JSON-LD block carrying the course's next
  // start date and price — the default strategy reads them. The 2027
  // courses enter the feed automatically once inside the keep window;
  // until then these report "no upcoming events", which is expected.
  { slug: 'kohfink', name: 'Imkerei Kohfink — Einsteigerkurse',
    url: 'https://imkerei-kohfink.regiondo.de/klassische-einsteigerkurse' },
  { slug: 'kohfink', name: 'Imkerei Kohfink — Theoriekurs',
    url: 'https://imkerei-kohfink.regiondo.de/theoriekurs-einfuhrung-in-die-imkerei' },
  // Wix Events: the events sitemap lists every event-detail page, and each
  // page carries a schema.org Event JSON-LD block (exact start/end, price,
  // status). Fully automatic — events Jem adds appear on their own;
  // cancelled or closed ones are skipped.
  { slug: 'jem', name: 'Jem — Fischtal Foodlab events', mode: 'wix-events-sitemap',
    url: 'https://www.fischtal-foodlab.com/event-pages-sitemap.xml',
    district: 'Zehlendorf' },
  // TEMP url: the general events page until this workshop's own
  // re-product-id link is known — it is both the seed's protection (a
  // failing source keeps its previous entries) and the Book target.
  { slug: 'karen-rose', name: 'Karen-Rose — Seife Sieden', mode: 'dates-de',
    url: 'https://karen-rose.com/events-2/',
    title: 'Seife Sieden Workshop', titleEn: 'Soap Making Workshop', price: '€99', duration: '3 h', district: 'Treptow', imagePage: 'https://karen-rose.com/' },

  // Anybody Can Whittle's Jimdo site sits behind Cloudflare rules that
  // block GitHub's runners, so this source always fails — by design: the
  // failure keeps the hand-seeded sessions (from Nicole's own booking
  // calendar) alive via fail-keep, and if the block ever loosens the
  // default parsers take over. Cards Book straight into her per-course
  // booking-checkout calendars — only robots are blocked, not visitors.
  { slug: 'whittle', name: 'Anybody Can Whittle — booking calendar (watched)',
    url: 'https://www.anybodycanwhittle.com/booking-checkout/?c_id=0627c12f-893a-4ee8-999e-1f225e507395&c_type=OCCURRING_SERVICES',
    infoUrl: 'https://www.anybodycanwhittle.com/workshops/',
    district: 'Charlottenburg' },

  // The Loom Lab sells its 3D-clay-printing experience as an undated
  // Shopify product today (€139, groups of 4-6, dates arranged around
  // bookings). This watches the shop's catalog: the moment they sell
  // dated variants — 'DD.MM.YYYY - HH:MM' like Galleria Lucia — the
  // sessions flow into the feed with no further change.
  { slug: 'loom-lab', name: 'The Loom Lab — shop catalog (watched)', mode: 'shopify',
    url: 'https://theloomlab.de/products.json?limit=250', district: 'Berlin',
    seedOnRequest: [
      { title: '3D-Clay-Printing Experience',
        titleEn: '3D Clay Printing Experience',
        duration: '4 h', price: '€139', district: 'Berlin', request: true,
        url: 'https://theloomlab.de/products/3d-clay-printing-experience' },
    ] },

  // Rose Williams's Jimdo site sits behind the same Cloudflare wall as
  // Anybody Can Whittle — GitHub runners get 403 — and her ticket sales
  // run on Konfetti, which the site never links. The watcher fails every
  // scrape by design so fail-keep preserves the hand-seeded dates from
  // her own course calendar (request-to-book by mail); if the block ever
  // loosens, the default parsers report what the page exposes.
  { slug: 'rose', name: 'Rose Williams — jewelry courses (watched)',
    url: 'https://www.rose-williams.com/jewelry-courses/',
    district: 'Wedding',
    // Cuttlefish casting publishes no dates — Rose schedules it on
    // inquiry. (The watcher fails against Cloudflare, so this seed also
    // lives in live-workshops.json and survives via fail-keep.)
    seedOnRequest: [
      { title: 'Sepiaguß Workshop',
        titleEn: 'Cuttlefish Casting Workshop',
        duration: '4 h', price: '€150', district: 'Wedding', request: true,
        url: 'https://www.rose-williams.com/jewelry-courses/' },
    ] },

  // Kunstraum Heartspace (Danziger Str. 172, Prenzlauer Berg) is a venue, not
  // a host: Alice Bischof runs the room and independent artists teach in it,
  // each selling through their own Ticket Tailor box office. Scraping the
  // venue's own course pages would double-list Rebeca's linocut classes
  // (already here via 'learnlino') and Sarah's Sunday Morning Pages, so each
  // artist is onboarded on their own box office instead. All of them sit at
  // the same address, hence the shared district.
  { slug: 'ronnadel', name: 'Ron Nadel — Ticket Tailor box office', mode: 'tickettailor',
    url: 'https://www.tickettailor.com/events/ronnadel', district: 'Prenzlauer Berg' },
  { slug: 'cateduckwall', name: 'Cate Duckwall — Ticket Tailor box office', mode: 'tickettailor',
    url: 'https://www.tickettailor.com/events/cateduckwall', district: 'Prenzlauer Berg' },
  // 'turnedartist' is Rebeca's second box office: the Fat Bodies and Older
  // Bodies specials are hers alone, and the twelve-part anatomy course she
  // co-teaches with Alice Bischof. It carries none of the linocut sessions
  // her 'learnlino' box office sells, so the two sources complement rather
  // than duplicate each other — both land on her one host card.
  { slug: 'rebeca', name: 'Arte Gorda — anatomy box office', mode: 'tickettailor',
    url: 'https://www.tickettailor.com/events/turnedartist', district: 'Prenzlauer Berg' },
  { slug: 'elinorsahm', name: 'Elinor Sahm — Ticket Tailor box office', mode: 'tickettailor',
    url: 'https://www.tickettailor.com/events/elinorsahm', district: 'Prenzlauer Berg' },

  // Mampe is Berlin's oldest liquor manufacturer (recipes back to 1831) and
  // runs guided manufactory tours with a tasting at the end, in German and
  // English, plus a gin seminar where you distil and bottle your own. Their
  // Shopify events collection sells one dated variant per run, in German
  // long form ("Mittwoch, 20. Mai 2026, 16:00 Uhr"), with the length in the
  // product title rather than the description — both now handled by the
  // shopify parser. The same collection also carries at-home tasting boxes,
  // whose variants are group sizes rather than dates, so they never reach
  // the feed. The shop is served under a /de-engl/ market path, hence
  // productBase.
  { slug: 'mampe', name: 'Mampe — manufactory tours & tastings', mode: 'shopify',
    url: 'https://mampe.berlin/de-engl/collections/events/products.json?limit=250',
    productBase: 'https://mampe.berlin/de-engl/products/',
    district: 'Kreuzberg' },

  // Helka Ceramics has taught at Twiggli from the start but had no feed of
  // her own: her classes sell from her Squarespace shop, which the scraper
  // could not read. Her studio is Böckhstr. 12 in Kreuzberg; the four-week
  // and six-week wheel-throwing courses run 19:00-22:00, the evening
  // workshop is a 2.5 hour taster, and the shop's gift card carries amounts
  // rather than dates so it stays out of the day feed on its own.
  { slug: 'helka', name: 'Helka Ceramics — pottery classes & workshops', mode: 'squarespace',
    url: 'https://www.helkaceramics.com/pottery-classes-workshops',
    district: 'Kreuzberg' },

  // Maximiliána Martišková — already a host here (bird sketching and
  // watercolour at Kunstraum Heartspace) — sells her public sessions
  // through her own Ticket Tailor box office, so the same relay route as
  // Rebeca's reads it: Ticket Tailor blocks CI runners outright. She
  // teaches "a few times a year", so an empty box office is the normal
  // resting state, a clean zero rather than a parse failure, and each
  // event carries its own venue rather than a fixed district. Her bespoke
  // sessions for schools, conservation groups, conferences and workplace
  // teams carry no dates and are quoted per enquiry, so they ride in as an
  // on-request card pointing at her get-in-touch page. Ticket Tailor hides
  // prices inside the checkout widget, so neither card invents one.
  { slug: 'maximiliana', name: 'Maximiliána Martišková — Ticket Tailor box office', mode: 'tickettailor',
    url: 'https://www.tickettailor.com/events/maxmartiskova',
    seedOnRequest: [
      { title: 'Workshop auf Anfrage: Naturtagebuch',
        titleEn: 'Personal Nature Journaling Workshop',
        district: 'Berlin', request: true,
        url: 'https://maxmartiskova.com/start-a-project' },
    ] },

  // Redrum Art Bar (Grimmstr. 24, Kreuzberg) runs guided drink tastings
  // for groups of 2-8, ~2 h, on the bar's own working days between
  // 17:00-19:00 in a private setting. No dates are ever published: you
  // mail them a preferred date, they confirm it, then you pre-pay through
  // their SumUp store — so the offering rides in as on-request cards
  // rather than dated sessions. Their page splits the nineteen tastings
  // into spirits (€40-100) and cocktails (€50-60), and applies a
  // different per-group choice limit to each, so the split is kept.
  // The watcher reads the tasting page every scrape; if they ever publish
  // dates, the default parsers report them.
  { slug: 'redrum', name: 'Redrum Art Bar — drink tastings (watched)',
    url: 'https://www.redrumberlin.de/tasting-experience/',
    district: 'Kreuzberg',
    seedOnRequest: [
      { title: 'Spirituosen-Tasting',
        titleEn: 'Spirits Tasting Experience',
        duration: '2 h', price: '€40–100', district: 'Kreuzberg', request: true,
        url: 'https://www.redrumberlin.de/tasting-experience/' },
      { title: 'Cocktail-Tasting',
        titleEn: 'Cocktail Tasting Experience',
        duration: '2 h', price: '€50–60', district: 'Kreuzberg', request: true,
        url: 'https://www.redrumberlin.de/tasting-experience/' },
    ] },

  // Barbara Amaral (ArcoIris Embroidery) lists her embroidery sessions
  // on a public event page that carries every upcoming date of the same
  // workshop in its "Weitere Termine" list — dates, times, prices and
  // per-date links, all server-rendered. All sessions run at That Pink
  // Café in Neukölln.
  { slug: 'arcoiris', name: 'ArcoIris Embroidery — event page', mode: 'rausgegangen',
    url: 'https://rausgegangen.de/en/events/vulva-flower-embroidery-workshop-9/',
    district: 'Neukölln' },

  // Ana (Resonant Body®) sells her multi-day labs through her booking
  // page. Each lab meets on two dates at its own venue — the page's
  // Schedule table gives the dates/times/addresses, the Ticket options
  // table the price per lab. No blanket district here: fromEversports
  // resolves it per session from the venue address below.
  { slug: 'ana', name: 'Ana — Fluxus Maximus booking page', mode: 'eversports',
    url: 'https://www.eversports.de/e/workshop/GZDF_GR',
    knownDistricts: { 'Mariannenplatz': 'Kreuzberg', 'Breite Straße 43': 'Pankow' } },

  // Rebeca Ventura (Arte Gorda) sells her linocut sessions through her own
  // Ticket Tailor box office, "learnlino" — one row per upcoming event,
  // each with date, time, venue and its own picture. She teaches at
  // Kunstraum Heartspace in Prenzlauer Berg; the venue's own Google
  // Calendar covers every artist showing there, so her box office is the
  // source that can only ever be hers.
  { slug: 'rebeca', name: 'Arte Gorda — Ticket Tailor box office', mode: 'tickettailor',
    url: 'https://www.tickettailor.com/events/learnlino', district: 'Prenzlauer Berg',
    // Confirmed by Jirel in the live checkout widget (Regular Entry €60).
    knownPrices: { 'Linocut & Spritz': '€60' } },

  // Techno Painting (Dina Shneider, Berlin-Mitte) publishes a fixed
  // weekly schedule as prose on her WordPress page; tickets sell through
  // Konfetti/Airbnb/Viator/Eventbrite, none of which the site links —
  // cards take booking requests by mail (Jirel's rule). The recurring-de
  // mode parses nothing from the English page by design; the schedule
  // rides in as seeds and fail-keep covers outages.
  { slug: 'techno', name: 'Techno Painting — weekly schedule', mode: 'recurring-de',
    url: 'https://technopainting.com/airbnb-experience/', district: 'Mitte',
    seedRecurring: [
      { title: 'Techno Painting Workshop', weekdays: ['mon', 'thu'], time: '18:00',
        duration: '3 h', price: '€75', district: 'Mitte', request: true,
        url: 'https://technopainting.com/airbnb-experience/' },
      { title: 'Techno Painting Workshop', weekdays: ['tue', 'wed'], time: '19:00',
        duration: '3 h', price: '€75', district: 'Mitte', request: true,
        url: 'https://technopainting.com/airbnb-experience/' },
      { title: 'Techno Painting Workshop', weekdays: ['fri'], time: '18:30',
        duration: '3 h', price: '€75', district: 'Mitte', request: true,
        url: 'https://technopainting.com/airbnb-experience/' },
      { title: 'Techno Painting Workshop', weekdays: ['sat', 'sun'], time: '14:00',
        duration: '3 h', price: '€75', district: 'Mitte', request: true,
        url: 'https://technopainting.com/airbnb-experience/' },
    ] },

  // Empire of Dirt (Großbeerenstraße 28C, Kreuzberg) sells ceramics
  // classes as Shopify products whose variants carry English prose dates
  // ("October 24 & 25 (Saturday 11-15 / Sunday 11-14)"); courses meeting
  // on several dates land on their first date, marked "N Termine"/"N
  // dates" in the title. Memberships, open studio and gift cards carry no
  // date and drop out on their own. The kids Wednesday drop-ins are sold
  // undated, so they ride along as seeded recurring classes.
  { slug: 'dirt', name: 'Empire of Dirt — Shopify classes', mode: 'shopify',
    url: 'https://empireofdirt.studio/products.json?limit=250', district: 'Kreuzberg',
    seedRecurring: [
      { title: 'Töpfern für Kinder „Matsch Love“ (Drop-in)',
        titleEn: 'Pottery for Kids “Matsch Love” (drop-in)',
        weekdays: ['wed'], time: '15:00', duration: '1.25 h', price: '€20',
        district: 'Kreuzberg', kids: true,
        url: 'https://empireofdirt.studio/products/pottery-for-kids-love-matsch' },
      { title: 'Töpfern für Kinder „Matsch Love“ (Drop-in)',
        titleEn: 'Pottery for Kids “Matsch Love” (drop-in)',
        weekdays: ['wed'], time: '16:30', duration: '1.25 h', price: '€20',
        district: 'Kreuzberg', kids: true,
        url: 'https://empireofdirt.studio/products/pottery-for-kids-love-matsch' },
    ] },
];

/** How far ahead a scraped session may be and still be kept. Slightly wider
 *  than the site's day strip so entries roll into view between runs. */
const KEEP_DAYS = 110;

const TZ = 'Europe/Berlin';

const berlinDate = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
const berlinTime = (d) =>
  new Date(d).toLocaleTimeString('de-DE', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const todayISO = berlinDate(Date.now());
const maxISO = berlinDate(Date.now() + KEEP_DAYS * 86400000);

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#8211;|&ndash;/gi, '–').replace(/&#8212;|&mdash;/gi, '—');

const stripTags = (s) =>
  decodeEntities(
    s.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

/** The page's own share image (og:image / twitter:image) as an absolute
 *  URL — the picture the host chose to represent this page. */
function pageImage(html, pageUrl) {
  const m =
    html.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ??
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  // WordPress sites without an SEO plugin publish no share image at all
  // (Karen-Rose's, Sarah's) — the first real content image stands in.
  const fallback =
    m?.[1] ??
    [...html.matchAll(/<img[^>]+src=["']([^"']+\/wp-content\/uploads\/[^"']+\.(?:jpe?g|png|webp)[^"']*)["']/gi)]
      .map((x) => x[1])
      .find((u) => !/logo|icon|favicon|cropped-|placeholder/i.test(u));
  if (!fallback) return undefined;
  try {
    // Cards live on an https page — an http image would be mixed content.
    return new URL(decodeEntities(fallback), pageUrl).toString().replace(/^http:\/\//, 'https://');
  } catch {
    return undefined;
  }
}

/** Strategy 1: walk every JSON-LD block for schema.org Event-ish objects. */
function fromJsonLd(html, sourceUrl) {
  const events = [];
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    const types = [].concat(node['@type'] ?? []);
    if (types.some((t) => typeof t === 'string' && /event/i.test(t)) && node.startDate) {
      events.push(node);
    }
    Object.values(node).forEach(walk);
  };
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walk(JSON.parse(decodeEntities(m[1].trim())));
    } catch {
      /* malformed block — skip */
    }
  }
  return events
    .map((e) => {
      const start = Date.parse(e.startDate);
      if (Number.isNaN(start)) return null;
      // Cancelled / closed events stay in the page's markup — skip them so
      // the Book button never leads to a dead registration.
      if (/cancelled|postponed/i.test(String(e.eventStatus ?? ''))) return null;
      const end = Date.parse(e.endDate ?? '');
      const hours = (end - start) / 3600000;
      const duration =
        !Number.isNaN(end) && hours > 0 && hours <= 12
          ? `${Math.round(hours * 2) / 2} h`
          : undefined;
      // Offers may be a flat Offer or an AggregateOffer whose price sits in
      // lowPrice or in a nested offers[] (Wix Events emits the latter).
      const offer = [].concat(e.offers ?? [])[0];
      // Skip events every ticket type of which is sold out (Wix Events
      // marks both the aggregate and its nested offers) — the Book button
      // must never lead to a dead ticket page.
      const availabilities = [offer?.availability, ...[].concat(offer?.offers ?? []).map((o) => o?.availability)]
        .filter(Boolean)
        .map(String);
      const soldOut = availabilities.length > 0 && availabilities.every((a) => /soldout/i.test(a));
      const rawPrice = [offer?.price, offer?.lowPrice, [].concat(offer?.offers ?? [])[0]?.price]
        .find((p) => p != null && p !== '');
      const price =
        rawPrice != null
          ? Number(rawPrice) === 0
            ? 'Free'
            : `€${Math.round(Number(rawPrice))}`
          : undefined;
      // Event.image comes as a bare URL, an array, or an ImageObject.
      const imgNode = [].concat(e.image ?? [])[0];
      const image = typeof imgNode === 'string' ? imgNode : imgNode?.url;
      return {
        title: stripTags(String(e.name ?? 'Workshop')),
        date: berlinDate(start),
        time: berlinTime(start),
        ...(duration ? { duration } : {}),
        ...(price ? { price } : {}),
        ...(soldOut ? { soldOut: true } : {}),
        ...(typeof image === 'string' && image.startsWith('http') ? { image } : {}),
        url: typeof e.url === 'string' && e.url.startsWith('http') ? e.url : sourceUrl,
      };
    })
    .filter(Boolean);
}

const UA = 'Mozilla/5.0 (compatible; TwiggliScheduleBot/1.0; +https://www.twiggli.com)';

/** Parser for pages listing workshops as German pipe-separated lines —
 *  "29.08.2026 | Samstag, 13-15 Uhr | ANFÄNGER:INNEN | … | 49 € | Buchung
 *  über Eversports" — grouped under "Kommende Workshops für <X>:" headers
 *  (Beat-Etage's format). Works on the raw markup so each entry keeps its
 *  own booking link; multi-day camps and past dates fall away. Times come
 *  from the "13-15 Uhr" range (start = session time, span = duration). */
function fromGermanPipeList(html, source) {
  const out = [];
  const marks = [...html.matchAll(/Kommende\s+Workshops\s+für\s+([^:<]+):/gi)].map((m) => ({
    name: stripTags(m[1]).replace(/\s+/g, ' ').trim(),
    headerStart: m.index,
    start: m.index + m[0].length,
  }));
  if (!marks.length) {
    console.log(`[${source.slug}] pipe-list: no "Kommende Workshops für …" sections found`);
    return [];
  }
  // Camps and the closing boilerplate end the schedule.
  let tailEnd = html.length;
  for (const re of [/SAFE\s+THE\s+DATE/i, /Anmeldungen\s+per\s+E?-?Mail/i]) {
    const m = re.exec(html);
    if (m && m.index > marks[0].start && m.index < tailEnd) tailEnd = m.index;
  }

  for (let i = 0; i < marks.length; i++) {
    const end = Math.min(i + 1 < marks.length ? marks[i + 1].headerStart : Infinity, tailEnd);
    const seg = html.slice(marks[i].start, end);
    const cfg = source.sections?.[marks[i].name] ?? {};
    const dates = [...seg.matchAll(/(\d{2})\.(\d{2})\.(\d{2,4})\b/g)];
    dates.forEach((m, idx) => {
      const entry = seg.slice(m.index, idx + 1 < dates.length ? dates[idx + 1].index : seg.length);
      const text = stripTags(entry);
      if (/\bCamp\b/i.test(text)) return;
      const year = m[3].length === 2 ? `20${m[3]}` : m[3];
      const month = Number(m[2]);
      if (month < 1 || month > 12 || Number(m[1]) > 31) return;
      const date = `${year}-${m[2]}-${m[1]}`;

      const range = text.match(/(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*Uhr/);
      let time;
      let duration;
      if (range) {
        time = `${String(range[1]).padStart(2, '0')}:${range[2] ?? '00'}`;
        const span =
          Number(range[3]) + Number(range[4] ?? 0) / 60 - (Number(range[1]) + Number(range[2] ?? 0) / 60);
        if (span > 0 && span <= 12) duration = `${Math.round(span * 2) / 2} h`;
      }
      const price = text.match(/(\d+(?:,\d+)?)\s*€/);
      const book = entry.match(/https:\/\/www\.eversports\.[a-z]+\/[^\s"'<>]+/);

      console.log(
        `[${source.slug}] pipe-list: "${marks[i].name}" ${date} ${time ?? '?'} ${price ? `€${price[1]}` : ''} ${book ? 'eversports' : 'page'}`,
      );
      out.push({
        title: cfg.title ?? `${marks[i].name} Workshop`,
        ...(cfg.titleEn ? { titleEn: cfg.titleEn } : {}),
        date,
        ...(time ? { time } : {}),
        ...(duration ? { duration } : {}),
        ...(price ? { price: `€${Math.round(Number(price[1].replace(',', '.')))}` } : {}),
        url: book ? decodeEntities(book[0]) : source.url,
      });
    });
  }
  return out;
}

/** Parser for pages that announce one workshop's upcoming dates as a bare
 *  text list — "Thu 20.08.2026 17.30-19.30 / Sat 22.08.2026 10.30-12.30…"
 *  (Coffee and Bananas' format). Title, price and booking link come from
 *  the source config; date, start time and duration from each line. The
 *  optional start/end markers fence the schedule off from other dates on
 *  the page, and duplicate date+time pairs collapse. */
function fromDatedTimeList(html, source) {
  let text = stripTags(html);
  if (source.startMarker) {
    const i = text.indexOf(source.startMarker);
    if (i >= 0) text = text.slice(i + source.startMarker.length);
  }
  if (source.endMarker) {
    const j = text.indexOf(source.endMarker);
    if (j > 0) text = text.slice(0, j);
  }
  const seen = new Set();
  const out = [];
  for (const m of text.matchAll(
    /(\d{2})\.(\d{2})\.(\d{2,4})\s+(\d{1,2})[.:](\d{2})\s*[-–]\s*(\d{1,2})[.:](\d{2})/g,
  )) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    const month = Number(m[2]);
    if (month < 1 || month > 12 || Number(m[1]) > 31) continue;
    const date = `${year}-${m[2]}-${m[1]}`;
    const time = `${String(m[4]).padStart(2, '0')}:${m[5]}`;
    if (seen.has(`${date} ${time}`)) continue;
    seen.add(`${date} ${time}`);
    const span = Number(m[6]) + Number(m[7]) / 60 - (Number(m[4]) + Number(m[5]) / 60);
    console.log(`[${source.slug}] dated-time-list: ${date} ${time} (${span} h)`);
    out.push({
      title: source.title,
      ...(source.titleEn ? { titleEn: source.titleEn } : {}),
      date,
      time,
      ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
      ...(source.price ? { price: source.price } : {}),
      url: source.bookUrl ?? source.url,
    });
  }
  if (out.length) return out;

  // Fallback for hour-only ranges laid out in table rows ("23.08.2026 …
  // 11 - 13 Uhr … Hier buchen", Sarah's format): parse per date slice in
  // the raw markup, so each entry keeps its own booking link (PayPal or
  // checkout host) instead of one shared page.
  let hay = html;
  if (source.startMarker) {
    const i = hay.indexOf(source.startMarker);
    if (i >= 0) hay = hay.slice(i);
  }
  if (source.endMarker) {
    const j = hay.indexOf(source.endMarker);
    if (j > 0) hay = hay.slice(0, j);
  }
  const dates = [...hay.matchAll(/(\d{2})\.(\d{2})\.(20\d{2})\b/g)];
  dates.forEach((m, idx) => {
    const month = Number(m[2]);
    if (month < 1 || month > 12 || Number(m[1]) > 31) return;
    const date = `${m[3]}-${m[2]}-${m[1]}`;
    const raw = hay.slice(m.index, idx + 1 < dates.length ? dates[idx + 1].index : hay.length);
    const row = stripTags(raw).slice(0, 200);
    const range = row.match(/(\d{1,2})(?:[.:](\d{2}))?\s*[-–]\s*(\d{1,2})(?:[.:](\d{2}))?\s*Uhr/);
    const single = range ? null : row.match(/(\d{1,2})(?:[.:](\d{2}))?\s*Uhr/);
    const t = range ?? single;
    if (!t) return;
    const time = `${String(t[1]).padStart(2, '0')}:${t[2] ?? '00'}`;
    if (seen.has(`${date} ${time}`)) return;
    seen.add(`${date} ${time}`);
    const span = range ? Number(range[3]) + Number(range[4] ?? 0) / 60 - (Number(range[1]) + Number(range[2] ?? 0) / 60) : 0;
    const rowPrice = row.match(/(\d+)\s*(?:€|Euro)\b/);
    const link = raw.match(/https?:\/\/(?:www\.)?(?:paypal\.com|checkout\.[a-z0-9.-]+)\/[^\s"'<>]+/);
    console.log(`[${source.slug}] dated-time-list (row): ${date} ${time} (${span || '?'} h) ${link ? 'own link' : 'page'}`);
    out.push({
      title: source.title,
      ...(source.titleEn ? { titleEn: source.titleEn } : {}),
      date,
      time,
      ...(span > 0 && span <= 12
        ? { duration: `${Math.round(span * 2) / 2} h` }
        : source.duration
          ? { duration: source.duration }
          : {}),
      ...(rowPrice ? { price: `€${rowPrice[1]}` } : source.price ? { price: source.price } : {}),
      url: link ? decodeEntities(link[0]) : (source.bookUrl ?? source.url),
    });
  });
  return out;
}

/** Parser for calendar pages built as h2-titled blocks — each workshop an
 *  <h2> heading followed by a written date (German "Samstag 22. August
 *  2026" or English "Sunday 30 August 2026"), a "15:00-19:30 Uhr" range,
 *  prices and a booking link (Pasta Madre's format). A block listing
 *  several prices (their solidarity model) becomes a €min–max range;
 *  sold-out blocks ("ausgebucht") are skipped. */
function fromTitledDateBlocks(html, source) {
  const MONTHS = {
    januar: '01', februar: '02', märz: '03', april: '04', mai: '05', juni: '06',
    juli: '07', august: '08', september: '09', oktober: '10', november: '11', dezember: '12',
    january: '01', february: '02', march: '03', may: '05', june: '06',
    july: '07', october: '10', december: '12',
  };
  const MONTH_NAMES = Object.keys(MONTHS).join('|');
  const heads = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  const out = [];
  // Their headings are styled lowercase; the card title-cases every word
  // ("Gemüse Fermentieren") so titles read as titles.
  const capitalize = (s) => s.replace(/\p{L}+/gu, (w) => w[0].toUpperCase() + w.slice(1));
  for (let i = 0; i < heads.length; i++) {
    const title = capitalize(stripTags(heads[i][1]).trim());
    if (!title) continue;
    const start = heads[i].index + heads[i][0].length;
    const block = html.slice(start, i + 1 < heads.length ? heads[i + 1].index : html.length);
    const text = stripTags(block);
    // Sold-out blocks stay in the feed — the card shows "Sold out" and a
    // Notify-me button instead of Book.
    const soldOut = /ausgebucht|sold\s*out/i.test(text);
    if (soldOut) console.log(`[${source.slug}] blocks: "${title}" sold out — kept as notify-me`);
    const dm = text.match(new RegExp(`(\\d{1,2})\\.?\\s+(${MONTH_NAMES})\\s+(20\\d{2})`, 'i'));
    if (!dm) continue;
    const date = `${dm[3]}-${MONTHS[dm[2].toLowerCase()]}-${dm[1].padStart(2, '0')}`;

    const range = text.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
    const time = range ? `${range[1].padStart(2, '0')}:${range[2]}` : undefined;
    const span = range
      ? Number(range[3]) + Number(range[4]) / 60 - (Number(range[1]) + Number(range[2]) / 60)
      : 0;

    const prices = [...text.matchAll(/(\d{2,3})[,.]\d{2}\s*€/g)].map((p) => Number(p[1]));
    const price = prices.length
      ? Math.min(...prices) === Math.max(...prices)
        ? `€${prices[0]}`
        : `€${Math.min(...prices)}–${Math.max(...prices)}`
      : undefined;

    // The block's own booking button, when it links anywhere.
    let book;
    for (const a of block.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      if (/reservieren|book\s*now|jetzt\s*buchen/i.test(stripTags(a[2]))) {
        book = decodeEntities(a[1]);
        break;
      }
    }

    console.log(
      `[${source.slug}] blocks: "${title}" ${date} ${time ?? '?'} ${price ?? ''} ${book ? 'link' : 'page'}`,
    );
    out.push({
      title,
      date,
      ...(time ? { time } : {}),
      ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
      ...(price ? { price } : {}),
      ...(soldOut ? { soldOut: true } : {}),
      url: book && /^https?:/i.test(book) ? book : source.url,
    });
  }
  return out;
}

/** Strategy: Shopify catalog + Cowlendar booking app. The collection's
 *  products.json lists the workshops (title, price, variant); each product
 *  page embeds its Cowlendar calendar id, and Cowlendar's availability
 *  endpoint answers plain unauthenticated GETs with every bookable slot
 *  (start, duration, spots left) — verified live against The Munio's
 *  booking modal. Sessions run near-daily, so source.maxDays keeps the
 *  horizon short enough not to drown the rest of the calendar. */
async function fromShopifyCowlendar(source) {
  const res = await fetch(`${source.base}/collections/${source.collection}/products.json?limit=250`, {
    headers: { 'user-agent': UA, accept: 'application/json' },
  });
  if (!res.ok) {
    console.log(`[${source.slug}] cowlendar: products.json HTTP ${res.status}`);
    return [];
  }
  const products = (await res.json()).products ?? [];
  console.log(`[${source.slug}] cowlendar: ${products.length} products`);

  const horizon = source.maxDays ?? 45;
  const lastISO = berlinDate(Date.parse(todayISO) + horizon * 86400000);
  const months = [];
  for (let d = new Date(`${todayISO.slice(0, 7)}-01T00:00:00Z`); d.toISOString().slice(0, 7) <= lastISO.slice(0, 7); d.setUTCMonth(d.getUTCMonth() + 1)) {
    months.push(d.toISOString().slice(0, 7));
  }
  const out = [];

  for (const p of products) {
    const variant = p.variants?.[0];
    if (!variant) continue;
    const productUrl = `${source.base}/products/${p.handle}`;
    const minutes = Number(/(\d{2,3})\s*min/i.exec(p.title)?.[1] ?? (/1[.,]5\s*h/i.test(p.title) ? 90 : 60));
    const price = Number(variant.price) > 0 ? `€${Math.round(Number(variant.price))}` : undefined;

    let html = '';
    try {
      html = await (await fetch(productUrl, { headers: { 'user-agent': UA } })).text();
    } catch (err) {
      console.log(`[${source.slug}] cowlendar: ${p.handle} page: ${err.message.split('\n')[0]}`);
      continue;
    }
    // The page embeds Cowlendar's own product_handle → service_id map (as
    // escaped JSON inside a script string) — the authoritative calendar id
    // for this product. Bare 24-hex candidates stay as a fallback.
    const cfg = html.replace(/\\/g, '');
    const idByHandle = new Map(
      [...cfg.matchAll(/"product_handle":"([^"]+)","service_id":"([0-9a-f]{24})"/g)].map((m) => [m[1], m[2]]),
    );
    const mapped = idByHandle.get(p.handle);
    const candidates = mapped
      ? [mapped]
      : [...new Set([...html.matchAll(/\b[0-9a-f]{24}\b/g)].map((m) => m[0]))].slice(0, 8);
    if (!mapped) console.log(`[${source.slug}] cowlendar: "${p.title}": no service_id mapping — falling back to ${candidates.length} candidates`);
    let best = null;
    for (const id of candidates) {
      let slots = [];
      let ok = true;
      for (const ym of months) {
        const [y, mo] = ym.split('-');
        try {
          const av = await fetch(
            `https://app.cowlendar.com/extapi/calendar/${id}/availability?year=${y}&month=${Number(mo)}&timezone=Europe%2FBerlin&quantity_details%5B0%5D%5Btype%5D=default&quantity_details%5B0%5D%5Bquantity%5D=1&quantity_details%5B0%5D%5Bname%5D=Default&teammate_id=all&duration=${minutes}&is_manual=false&is_pos=false&adjacent_days=true&variant_id=${variant.id}`,
            { headers: { 'user-agent': UA, accept: 'application/json' } },
          );
          if (!av.ok) { ok = false; break; }
          const data = await av.json();
          if (!Array.isArray(data?.long)) { ok = false; break; }
          slots.push(...data.long);
        } catch { ok = false; break; }
        await new Promise((r2) => setTimeout(r2, 200));
      }
      if (!ok) continue;
      const seen = new Set();
      const entries = [];
      for (const s of slots) {
        const m = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/.exec(s?.slot_start ?? '');
        if (!m) continue;
        // Fully-booked slots stay: the card shows Sold out + Notify me.
        const soldOut = s.qty_left === 0;
        if (s.is_bookable === false && !soldOut) continue;
        if (m[1] > lastISO || seen.has(s.slot_start)) continue;
        seen.add(s.slot_start);
        const hours = Number(s.slot_duration ?? minutes) / 60;
        entries.push({
          title: p.title.replace(/\s*\d+\s*min\b/i, '').replace(/\s*1[.,]5\s*h\b/i, '').trim(),
          date: m[1],
          time: m[2],
          duration: `${Math.round(hours * 2) / 2} h`,
          ...(price ? { price } : {}),
          ...(soldOut ? { soldOut: true } : Number.isFinite(s.qty_left) ? { spots: s.qty_left } : {}),
          ...(p.images?.[0]?.src ? { image: p.images[0].src } : {}),
          url: productUrl,
        });
      }
      if (!best || entries.length > best.entries.length) best = { id, entries };
      if (entries.length) break; // this calendar answers for this product
    }
    if (best) {
      out.push(...best.entries);
      console.log(`[${source.slug}] cowlendar: "${p.title}" calendar ${best.id}: ${best.entries.length} bookable slots ≤ ${lastISO}`);
    } else {
      console.log(`[${source.slug}] cowlendar: "${p.title}": no working calendar id among ${candidates.length} candidates`);
    }
  }
  return out;
}

/** Strategy for The Monk Garden's pattern: a listing page whose dated
 *  entries each link to their own checkout.<domain> ticket page, which
 *  states the full date and start time ("26.09.2026 um 10:00 Uhr"), the
 *  title and the per-person price. The checkout pages are the source of
 *  truth — no year-guessing from the listing's bare "26.09." tokens. */
async function fromCheckoutLinks(html, source) {
  const links = [
    ...new Set([...html.matchAll(/https?:\/\/checkout\.[a-z0-9.-]+\/[a-z0-9-]+/gi)].map((m) => m[0])),
  ];
  console.log(`[${source.slug}] checkout links found: ${links.length}`);
  const out = [];
  for (const link of links) {
    try {
      const r = await fetch(link, { headers: { 'user-agent': UA } });
      if (!r.ok) {
        console.log(`[${source.slug}] ${link}: HTTP ${r.status}`);
        continue;
      }
      const page = await r.text();
      const text = stripTags(page);
      const dm = text.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s*um\s*(\d{1,2}):(\d{2})\s*Uhr)?/);
      if (!dm) {
        console.log(`[${source.slug}] ${link}: no dated line found`);
        continue;
      }
      const title = stripTags(page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '').trim() || source.title || 'Workshop';
      const price = text.match(/(\d+)[.,](\d{2})\s*EUR/);
      const date = `${dm[3]}-${dm[2]}-${dm[1]}`;
      console.log(
        `[${source.slug}] checkout: "${title}" ${date} ${dm[4] ? `${dm[4]}:${dm[5]}` : 'no time'} ${price ? `€${price[1]}` : 'no price'}`,
      );
      out.push({
        title,
        ...(source.titleEn ? { titleEn: source.titleEn } : {}),
        date,
        ...(dm[4] ? { time: `${String(dm[4]).padStart(2, '0')}:${dm[5]}` } : {}),
        ...(source.duration ? { duration: source.duration } : {}),
        ...(price ? { price: `€${Math.round(Number(`${price[1]}.${price[2]}`))}` } : {}),
        ...(pageImage(page, link) ? { image: pageImage(page, link) } : {}),
        url: link,
      });
    } catch (err) {
      console.log(`[${source.slug}] ${link}: ${err.message.split('\n')[0]}`);
    }
    await new Promise((r2) => setTimeout(r2, 300));
  }
  return out;
}

/** Strategy for sites booking through Konfetti (gokonfetti.com): course
 *  pages embed a booking iframe carrying an eventDescriptionId, and the
 *  widget reads its dates from a public JSON API — verified live against
 *  Ceramic Kingdom's scheduler:
 *  GET api.gokonfetti.com/v1/store/events/<id>/calendar?month=YYYY-MM
 *  answers plain unauthenticated fetches with per-day dates (UTC start/end,
 *  tickets left, price in cents). The site's sitemap finds the course
 *  pages; pages without a widget just contribute nothing. */
async function fromKonfetti(source) {
  const res = await fetch(source.url, {
    headers: { 'user-agent': UA, accept: 'application/xml,text/xml,*/*' },
  });
  if (!res.ok) {
    console.log(`[${source.slug}] konfetti: sitemap HTTP ${res.status}`);
    return [];
  }
  const xml = await res.text();
  const pat = source.pagePattern ? new RegExp(source.pagePattern) : /./;
  let pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeEntities(m[1])))].filter(
    (u) => pat.test(u),
  );
  if (pages.length) {
    console.log(`[${source.slug}] konfetti: ${pages.length} candidate pages from sitemap`);
  } else {
    // Not a sitemap — a store/listing page (Konfetti's hosted storefronts
    // are server-rendered): pull matching same-host links instead.
    const origin = new URL(res.url).origin;
    pages = [
      ...new Set(
        [...xml.matchAll(/href="([^"]+)"/g)]
          .map((m) => {
            try {
              return new URL(decodeEntities(m[1]), res.url).toString();
            } catch {
              return null;
            }
          })
          .filter((u) => u && u.startsWith(origin) && pat.test(u)),
      ),
    ];
    console.log(`[${source.slug}] konfetti: ${pages.length} candidate pages from listing`);
    if (!pages.length) {
      const internal = [...new Set([...xml.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]))].filter(
        (u) => !u.startsWith('/_'),
      );
      console.log(`[${source.slug}] konfetti: internal links seen: ${internal.slice(0, 30).join(' ')}`);
    }
  }

  const horizon = source.maxDays ?? KEEP_DAYS;
  const lastISO = berlinDate(Date.parse(todayISO) + horizon * 86400000);
  const months = [];
  for (
    let d = new Date(`${todayISO.slice(0, 7)}-01T00:00:00Z`);
    d.toISOString().slice(0, 7) <= lastISO.slice(0, 7);
    d.setUTCMonth(d.getUTCMonth() + 1)
  ) {
    months.push(d.toISOString().slice(0, 7));
  }

  const out = [];
  const seenEvents = new Set();
  for (const page of pages) {
    let html = '';
    try {
      const r = await fetch(page, { headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.8' } });
      if (!r.ok) {
        console.log(`[${source.slug}] konfetti: page HTTP ${r.status} ${page}`);
        continue;
      }
      html = await r.text();
    } catch (e) {
      console.log(`[${source.slug}] konfetti: page fetch failed ${page}: ${e.message}`);
      continue;
    }
    // The widget id hides in whatever form Squarespace stored the embed —
    // a plain iframe URL, a data attribute, or JSON with escaped slashes and
    // unicode-escaped '=' — so match every spelling on an unescaped copy.
    const unescaped = decodeEntities(html.replace(/\\u003d/gi, '=').replace(/\\/g, ''));
    const ids = [
      ...new Set(
        [
          ...unescaped.matchAll(/eventDescriptionId=([a-z0-9]{4,})/gi),
          ...unescaped.matchAll(/event[-_]description[-_]id["'\s:=]+([a-z0-9]{4,})/gi),
          // The Squarespace snippet names the event on the wrapper div:
          // <div id='konfetti_iframe_wrapper' data-event-id='w2dr9z' …>
          ...unescaped.matchAll(/konfetti[\s\S]{0,300}?data-event-id=["']([a-z0-9]{4,})["']/gi),
        ].map((m) => m[1]),
      ),
    ];
    // Konfetti's own storefront pages carry the event id as the URL's tail
    // ("…-workshop-w2dr9z/") — used only where the source opts in.
    if (!ids.length && source.idFromUrl) {
      const tail = page.match(/-([a-z0-9]{5,8})\/?$/);
      if (tail) ids.push(tail[1]);
    }
    if (!ids.length) {
      const hits = [...unescaped.matchAll(/konfetti/gi)].slice(0, 3);
      for (const h of hits) {
        console.log(
          `[${source.slug}] konfetti: no id on ${page.split('/').pop()} — context: ${unescaped
            .slice(Math.max(0, h.index - 100), h.index + 140)
            .replace(/\s+/g, ' ')}`,
        );
      }
      if (!hits.length) console.log(`[${source.slug}] konfetti: no "konfetti" mention at all on ${page.split('/').pop()} (${html.length} bytes)`);
      continue;
    }
    const title =
      stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '').trim() ||
      decodeEntities((html.match(/<title>([^<]*)/i)?.[1] ?? '').replace(/&mdash;|&#8212;/gi, '—'))
        .split(/[—|]/)[0]
        .trim();
    // Rentals, vouchers and other non-workshop pages fall away by title.
    if (source.excludeTitle && new RegExp(source.excludeTitle, 'i').test(title)) {
      console.log(`[${source.slug}] konfetti: excluded "${title}"`);
      continue;
    }
    const image = pageImage(html, page);
    for (const id of ids) {
      if (seenEvents.has(id)) continue;
      seenEvents.add(id);
      let kept = 0;
      for (const ym of months) {
        let days;
        try {
          const av = await fetch(`https://api.gokonfetti.com/v1/store/events/${id}/calendar?month=${ym}`, {
            headers: { 'user-agent': UA, accept: 'application/json' },
          });
          if (!av.ok) continue;
          days = await av.json();
        } catch {
          continue;
        }
        for (const day of Object.values(days ?? {})) {
          for (const s of day?.dates ?? []) {
            if (s?.status !== 'OPEN' && s?.status !== 'SOLD_OUT') continue;
            const soldOut = s.status === 'SOLD_OUT' || s.available_tickets_quantity === 0;
            const startMs = Date.parse(s.start ?? '');
            if (Number.isNaN(startMs)) continue;
            const endMs = Date.parse(s.end ?? '');
            const span = Number.isNaN(endMs) ? 0 : (endMs - startMs) / 3600000;
            const cents = Number(s.product?.price?.amount);
            out.push({
              title,
              date: berlinDate(startMs),
              time: berlinTime(startMs),
              ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
              ...(Number.isFinite(cents) && cents > 0 ? { price: `€${Math.round(cents / 100)}` } : {}),
              ...(soldOut
                ? { soldOut: true }
                : Number.isFinite(s.available_tickets_quantity)
                  ? { spots: s.available_tickets_quantity }
                  : {}),
              ...(image ? { image } : {}),
              // Some hosts must not link out to the booking platform — their
              // cards point at the host's own site and take requests by mail.
              ...(source.requestBooking ? { request: true } : {}),
              url: source.infoUrl ?? page,
            });
            kept++;
          }
        }
        await new Promise((r2) => setTimeout(r2, 200));
      }
      console.log(`[${source.slug}] konfetti: "${title}" [${id}] → ${kept} open dates`);
    }
  }
  return out;
}

/** A Luma calendar embed (lu.ma / luma.com — SOV Gallery's PROG_CAL page).
 *  The embed's public API serves every upcoming event as JSON with UTC
 *  start/end, ticket price and spots — nothing to render or click. An empty
 *  calendar simply parses to zero events until the host publishes dates. */
async function fromLuma(source) {
  const res = await fetch(
    `https://api.lu.ma/calendar/get-items?calendar_api_id=${source.calendarId}&period=future&pagination_limit=100`,
    { headers: { 'user-agent': UA, accept: 'application/json' } },
  );
  if (!res.ok) {
    console.log(`[${source.slug}] luma: calendar API HTTP ${res.status}`);
    return [];
  }
  const data = await res.json();
  const entries = data?.entries ?? [];
  if (!entries.length) {
    console.log(`[${source.slug}] luma: calendar has no upcoming events`);
    return [];
  }
  const out = [];
  for (const entry of entries) {
    const ev = entry?.event ?? entry;
    const startMs = Date.parse(ev?.start_at ?? '');
    if (Number.isNaN(startMs)) continue;
    const endMs = Date.parse(ev?.end_at ?? '');
    const span = Number.isNaN(endMs) ? 0 : (endMs - startMs) / 3600000;
    const ticket = entry?.ticket_info ?? ev?.ticket_info ?? {};
    const soldOut = !!ticket.is_sold_out;
    const cents = Number(ticket?.price?.cents);
    const eur = String(ticket?.price?.currency ?? 'eur').toLowerCase() === 'eur';
    const spots = Number(ticket?.spots_remaining);
    const w = {
      title: String(ev?.name ?? '').trim(),
      date: berlinDate(startMs),
      time: berlinTime(startMs),
      ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
      ...(Number.isFinite(cents) && cents > 0 && eur ? { price: `€${Math.round(cents / 100)}` } : {}),
      ...(soldOut ? { soldOut: true } : Number.isFinite(spots) && spots >= 0 ? { spots } : {}),
      ...(typeof ev?.cover_url === 'string' && ev.cover_url.startsWith('http') ? { image: ev.cover_url } : {}),
      url: ev?.url ? `https://lu.ma/${String(ev.url).replace(/^\/+/, '')}` : source.url,
    };
    if (!w.title) continue;
    console.log(`[${source.slug}] luma: "${w.title}" ${w.date} ${w.time} ${w.price ?? 'no price'}`);
    out.push(w);
  }
  return out;
}

/** Find `"key":` in a blob of HTML/JS and bracket-match the JSON value
 *  that follows. Returns the parsed value or null. */
function extractJsonAfterKey(text, key) {
  const m = new RegExp(`"${key}"\\s*:\\s*`).exec(text);
  if (!m) return null;
  const start = m.index + m[0].length;
  const open = text[start];
  if (open !== '[' && open !== '{') return null;
  const close = open === '[' ? ']' : '}';
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (!depth) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/** Strategy: Acuity Scheduling's own client API. The booking widget looks
 *  click-only, but /schedule.php?owner=<id> redirects to the account's
 *  /schedule/<hash>/ page whose HTML embeds the appointment catalog (ids,
 *  names, prices, durations, calendars), and the widget reads dates from a
 *  public JSON endpoint — verified live against Senlë Studio's scheduler:
 *  GET /api/scheduling/v1/availability/times?owner=<hash>&appointmentTypeId=…
 *  answers plain unauthenticated fetches. */
async function fromAcuity(source) {
  const base = 'https://app.acuityscheduling.com';
  // Either a numeric owner (schedule.php redirects to the hashed page) or
  // the schedule hash itself, when the embed only ever showed the hash.
  const res = await fetch(
    source.scheduleHash ? `${base}/schedule/${source.scheduleHash}/` : `${base}/schedule.php?owner=${source.owner}`,
    { redirect: 'follow', headers: { 'user-agent': UA } },
  );
  console.log(`[${source.slug}] acuity scheduler: HTTP ${res.status} at ${res.url}`);
  if (!res.ok) return [];
  const hash = source.scheduleHash ?? res.url.match(/\/schedule\/([a-z0-9]+)/i)?.[1];
  if (!hash) {
    console.log(`[${source.slug}] acuity: no schedule hash in final url`);
    return [];
  }
  const html = await res.text();

  // Either a flat array or an object keyed by category name.
  const rawTypes = extractJsonAfterKey(html, 'appointmentTypes');
  const types = Array.isArray(rawTypes)
    ? rawTypes
    : rawTypes && typeof rawTypes === 'object'
      ? Object.values(rawTypes).flat()
      : null;
  if (!Array.isArray(types) || !types.length) {
    const i = html.search(/appointmentTypes/i);
    console.log(
      `[${source.slug}] acuity: appointmentTypes not parseable; context: ${i >= 0 ? `…${html.slice(Math.max(0, i - 100), i + 400).replace(/\s+/g, ' ')}…` : 'key absent'}`,
    );
    return [];
  }
  console.log(
    `[${source.slug}] acuity appointment types: ${types.map((t) => `${t?.name} [${t?.id}] €${t?.price} ${t?.duration}min`).join('; ')}`,
  );

  return acuityTimesForTypes(source, hash, types);
}

/** Query Acuity's public availability endpoint for each appointment type
 *  and map bookable slots to feed entries. Shared by the whole-account
 *  and per-embed modes. */
async function acuityTimesForTypes(source, hash, types) {
  const base = 'https://app.acuityscheduling.com';
  const out = [];
  for (const t of types) {
    if (!t?.id || !t?.name) continue;
    const cal = [].concat(t.calendarIDs ?? t.calendarIds ?? t.calendars ?? [])[0];
    const priceNum = Number(t.price);
    const minutes = Number(t.duration);
    try {
      const r = await fetch(
        `${base}/api/scheduling/v1/availability/times?owner=${hash}&appointmentTypeId=${t.id}${cal ? `&calendarId=${cal}` : ''}&startDate=${todayISO}&maxDays=${KEEP_DAYS}&timezone=Europe%2FBerlin`,
        { headers: { 'user-agent': UA, accept: 'application/json' } },
      );
      if (!r.ok) {
        console.log(`[${source.slug}] acuity times for "${t.name}": HTTP ${r.status}`);
        continue;
      }
      const days = await r.json();
      for (const slot of Object.values(days ?? {}).flat()) {
        const ms = Date.parse(slot?.time ?? '');
        if (Number.isNaN(ms)) continue;
        const soldOut = slot.slotsAvailable === 0; // fully booked → Notify me
        console.log(
          `[${source.slug}] acuity: "${t.name}" ${berlinDate(ms)} ${berlinTime(ms)} (${slot.slotsAvailable ?? '?'} spots)`,
        );
        out.push({
          title: stripTags(String(t.name)),
          date: berlinDate(ms),
          time: berlinTime(ms),
          ...(soldOut ? { soldOut: true } : Number.isFinite(slot.slotsAvailable) ? { spots: slot.slotsAvailable } : {}),
          ...(minutes > 0 && minutes <= 720 ? { duration: `${Math.round((minutes / 60) * 2) / 2} h` } : {}),
          ...(Number.isFinite(priceNum) && priceNum > 0 ? { price: `€${Math.round(priceNum)}` } : {}),
          ...(typeof t.image === 'string' && t.image.startsWith('http') ? { image: t.image } : {}),
          // Deep link straight into this class's date picker.
          url: `${base}/schedule/${hash}/appointment/${t.id}/calendar/${cal ?? 'any'}`,
        });
      }
    } catch (err) {
      console.log(`[${source.slug}] acuity times for "${t.name}": ${err.message.split('\n')[0]}`);
    }
    await new Promise((r2) => setTimeout(r2, 250));
  }
  return out;
}

/** Some sites (Ceramic Kingdom) put each class category behind its own
 *  Acuity embed (schedule.php?appointmentType=category:…&template=class)
 *  while the account's plain scheduler lists only 1-on-1 appointments and
 *  free pick-up time slots. This mode walks the site's own pages for those
 *  embed links, reads each scoped catalog, and keeps the real classes —
 *  new categories the site links later join automatically. */
async function fromAcuityEmbeds(source) {
  const res = await fetch(source.url, {
    headers: { 'user-agent': UA, accept: 'application/xml,text/xml,*/*' },
  });
  if (!res.ok) {
    console.log(`[${source.slug}] acuity-embeds: sitemap HTTP ${res.status}`);
    return [];
  }
  const xml = await res.text();
  const pat = source.pagePattern ? new RegExp(source.pagePattern) : /./;
  const pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeEntities(m[1])))].filter(
    (u) => pat.test(u),
  );

  // Remember which site page carried each embed — its share image becomes
  // the class's picture (the Acuity deep link itself has none).
  const embeds = new Map();
  for (const page of pages) {
    try {
      const r = await fetch(page, { headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.8' } });
      if (!r.ok) continue;
      const html = decodeEntities((await r.text()).replace(/\\/g, ''));
      const originImage = pageImage(html, page);
      for (const m of html.matchAll(/https:\/\/app\.acuityscheduling\.com\/schedule\.php\?[^"'\s<>]+/g)) {
        if (!embeds.has(m[0])) embeds.set(m[0], originImage);
      }
    } catch {
      /* page unreachable — the embed may still appear on another page */
    }
  }
  console.log(`[${source.slug}] acuity-embeds: ${embeds.size} embed links on ${pages.length} pages`);

  const out = [];
  const seenTypes = new Set();
  const junk = /\b[123]-on-1\b|one on one|two on one|follow-?up|trimming|time ?slot|pick-?up/i;
  for (const [embed, originImage] of embeds) {
    let hash;
    let types;
    try {
      const r = await fetch(embed, { redirect: 'follow', headers: { 'user-agent': UA } });
      if (!r.ok) {
        console.log(`[${source.slug}] acuity-embeds: HTTP ${r.status} for ${embed}`);
        continue;
      }
      hash = r.url.match(/\/schedule\/([a-z0-9]+)/i)?.[1];
      const rawTypes = extractJsonAfterKey(await r.text(), 'appointmentTypes');
      types = Array.isArray(rawTypes)
        ? rawTypes
        : rawTypes && typeof rawTypes === 'object'
          ? Object.values(rawTypes).flat()
          : [];
    } catch (err) {
      console.log(`[${source.slug}] acuity-embeds: ${embed}: ${err.message.split('\n')[0]}`);
      continue;
    }
    if (!hash) continue;
    // Keep only the embed's own category when the catalog states one, and
    // never the 1-on-1/pick-up appointment types the plain scheduler shows.
    const cat = decodeURIComponent(embed.match(/category(?:%3A|:)([^&]+)/i)?.[1] ?? '')
      .replace(/\+/g, ' ')
      .trim();
    let fresh = types.filter((t) => t?.id && t?.name && !seenTypes.has(t.id) && Number(t.price) > 0);
    const inCat = cat ? fresh.filter((t) => String(t.category ?? '').trim() === cat) : [];
    fresh = (inCat.length ? inCat : fresh).filter((t) => !junk.test(String(t.name)));
    fresh.forEach((t) => seenTypes.add(t.id));
    if (!fresh.length) continue;
    console.log(
      `[${source.slug}] acuity-embeds "${cat || 'uncategorized'}": ${fresh.map((t) => `${t.name} [${t.id}] €${t.price} ${t.duration}min`).join('; ')}`,
    );
    const sessions = await acuityTimesForTypes(source, hash, fresh);
    if (originImage) for (const s of sessions) s.image ??= originImage;
    out.push(...sessions);
  }
  return out;
}

/** A Wix Bookings service list (Druckrausch's /termine): the page renders
 *  every dated workshop server-side as an <h2> "26.08. - Basis-Siebdruck-
 *  workshop" followed by its time range, price and a /booking-calendar/
 *  <dd-mm-slug> link. Dates carry no year — one already behind today
 *  belongs to next year. Each session's picture comes from its own
 *  /service-page/'s share image. */
async function fromWixServiceList(html, source) {
  const base = new URL(source.url).origin;
  const year = Number(todayISO.slice(0, 4));
  const out = [];
  for (const part of html.split(/<h2[^>]*>/i).slice(1)) {
    const headEnd = part.indexOf('</h2>');
    if (headEnd < 0) continue;
    const heading = stripTags(part.slice(0, headEnd));
    const hm = heading.match(/^(\d{2})\.(\d{2})\.?\s*(?:[-–]\s*)?(.+)$/);
    if (!hm) continue;
    const [, dd, mm, rawTitle] = hm;
    // The split already ends each part right before the next heading.
    const seg = part;
    const text = stripTags(seg);
    const link = seg.match(/(?:https?:\/\/[^"'\s<>]+)?\/booking-calendar\/[a-z0-9-]+/i)?.[0];
    const range = text.match(/(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?(?:\s*Uhr)?/);
    const price = text.match(/€\s?(\d+)/);
    let date = `${year}-${mm}-${dd}`;
    if (date < todayISO) date = `${year + 1}-${mm}-${dd}`;
    const span = range
      ? Number(range[3]) + Number(range[4] ?? 0) / 60 - (Number(range[1]) + Number(range[2] ?? 0) / 60)
      : 0;
    const url = link ? new URL(link, base).toString() : source.url;
    const w = {
      title: rawTitle.trim(),
      date,
      ...(range ? { time: `${String(range[1]).padStart(2, '0')}:${range[2] ?? '00'}` } : {}),
      ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
      ...(price ? { price: `€${price[1]}` } : {}),
      url,
    };
    // The service detail page holds the workshop's own picture.
    if (link) {
      const img = await shareImageFor(new URL(link.replace('/booking-calendar/', '/service-page/'), base).toString());
      if (img) w.image = img;
    }
    console.log(
      `[${source.slug}] service: "${w.title}" ${w.date} ${w.time ?? 'no time'} ${w.price ?? 'no price'} ${w.image ? 'img' : 'no img'}`,
    );
    out.push(w);
  }
  return out;
}

const EN_MONTH_ABBR = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/** A Ticket Tailor box office (Rebeca's "learnlino"): the public events
 *  list carries every upcoming event with its date, time and venue, and
 *  each row links the event's own page. Ticket Tailor sits behind a
 *  Cloudflare JS challenge that blocks CI runners outright, so the page
 *  is read through the r.jina.ai text relay — the same route that reaches
 *  the other Cloudflare-walled hosts — which renders it as markdown:
 *
 *    ![Image 2: Linocut & Spritz](https://uploads.tickettailorassets.com/…jpg)
 *    ### [Linocut & Spritz](https://www.tickettailor.com/events/learnlino/2289577)
 *    Tue 25 Aug 2026 18:00 - 20:30 Kunstraum Heartspace, 10407
 *
 *  New events appear in the feed the day she publishes them; prices live
 *  inside the checkout widget only, so the card omits the price line and
 *  Book leads to her event page. */
async function fromTicketTailor(source) {
  const relay = `https://r.jina.ai/${source.url}`;
  const res = await fetch(relay, {
    redirect: 'follow',
    headers: { 'user-agent': UA, accept: 'text/plain,*/*;q=0.8' },
  });
  if (!res.ok) {
    console.log(`[${source.slug}] tickettailor: relay HTTP ${res.status}`);
    return [];
  }
  const md = await res.text();
  const out = [];
  // Each event is a "### [title](url)" heading; its details run up to the
  // next heading. The thumbnail sits in the image line just before it.
  const headings = [...md.matchAll(/###\s*\[([^\]]+)\]\((https:\/\/www\.tickettailor\.com\/events\/[^)\s]+)\)/g)];
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const block = md.slice(h.index + h[0].length, headings[i + 1]?.index ?? md.length);
    const when = block.match(
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(20\d{2})\s+(\d{1,2}):(\d{2})(?:\s*[-–]\s*(\d{1,2}):(\d{2}))?/i,
    );
    if (!when) {
      console.log(`[${source.slug}] tickettailor: no date on "${h[1]}"`);
      continue;
    }
    const month = EN_MONTH_ABBR[when[2].toLowerCase()];
    const date = `${when[3]}-${String(month).padStart(2, '0')}-${when[1].padStart(2, '0')}`;
    const time = `${when[4].padStart(2, '0')}:${when[5]}`;
    const span = when[6]
      ? Number(when[6]) + Number(when[7]) / 60 - (Number(when[4]) + Number(when[5]) / 60)
      : 0;
    // The venue follows the time range, up to the "[Event details]" link.
    const venue = block
      .slice(when.index + when[0].length)
      .split(/\[Event details\]|\[Book now\]|\n#/)[0]
      .replace(/[\s,]*\b\d{5}\b\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // The event's own thumbnail sits in the markdown image just above.
    const before = md.slice(headings[i - 1]?.index ?? 0, h.index);
    const img = [...before.matchAll(/!\[[^\]]*\]\((https:\/\/uploads\.tickettailorassets\.com\/[^)\s]+)\)/g)].pop();
    const title = decodeEntities(h[1]).trim();
    // Ticket Tailor reveals its price only inside the live checkout
    // widget (JS-rendered), invisible to a scrape — a source may supply
    // known prices by title, checked by the host, to fill that gap.
    const price = source.knownPrices?.[title];
    out.push({
      title,
      date,
      time,
      ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
      ...(price ? { price } : {}),
      ...(venue && venue.length < 60 ? { district: venue } : {}),
      ...(img ? { image: img[1] } : {}),
      url: h[2],
    });
    console.log(`[${source.slug}] tickettailor: "${title}" ${date} ${time}${venue ? ` @ ${venue}` : ''}`);
  }
  console.log(`[${source.slug}] tickettailor: ${out.length} events on the box office`);
  return out;
}

const MONTHS_DE_ANY = {
  jan: 1, feb: 2, mär: 3, mar: 3, apr: 4, mai: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dez: 12,
};
const deMonth = (name) => MONTHS_DE_ANY[name.toLowerCase().slice(0, 3)];

/** A Rausgegangen event page (Barbara's embroidery workshop): the page
 *  carries its own date line ("So, 30. Aug 2026 11:00 - 13:30") and a
 *  "Weitere Termine" list of every future run of the same workshop, one
 *  card per date with day / month / time / venue / price and a link to
 *  that date's own event page. Plain server-rendered HTML, no wall. */
async function fromRausgegangen(source) {
  const res = await fetch(source.url, {
    redirect: 'follow',
    headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.8' },
  });
  if (!res.ok) {
    console.log(`[${source.slug}] rausgegangen: HTTP ${res.status}`);
    return [];
  }
  const html = await res.text();
  const text = stripTags(html);
  const title =
    html.match(/<title>([^<]+?)\s+on\s+\d{2}\.\d{2}\.\d{4}/i)?.[1]?.trim() ??
    html.match(/<title>([^<|-]+)/i)?.[1]?.trim() ?? 'Workshop';
  const out = [];

  // The page's own date: "So, 30. Aug 2026 11:00 - 13:30".
  const main = text.match(
    /(?:Mo|Di|Mi|Do|Fr|Sa|So),?\s*(\d{1,2})\.\s*([A-Za-zäÄ]+)\.?\s*(\d{4})\s+(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/,
  );
  let duration;
  if (main && deMonth(main[2])) {
    const hours =
      Number(main[6]) + Number(main[7]) / 60 - (Number(main[4]) + Number(main[5]) / 60);
    if (hours > 0 && hours <= 12) duration = `${Math.round(hours * 2) / 2} h`;
    const price = text.slice(main.index).match(/(\d+(?:,\d{2})?)\s*€/);
    out.push({
      title,
      date: `${main[3]}-${String(deMonth(main[2])).padStart(2, '0')}-${main[1].padStart(2, '0')}`,
      time: `${main[4].padStart(2, '0')}:${main[5]}`,
      ...(duration ? { duration } : {}),
      ...(price ? { price: `€${Math.round(Number(price[1].replace(',', '.')))}` } : {}),
      url: source.url.split('#')[0],
    });
  }

  // "Weitere Termine": one linked card per future date. Sessions of the
  // same workshop share the main date's length.
  const listStart = html.indexOf('other-subevents-list');
  if (listStart > 0) {
    const section = html.slice(listStart, html.indexOf('</section>', listStart) + 1 || undefined).slice(0, 30000);
    for (const card of section.matchAll(/<a\s+[^>]*href="(\/[^"]*\/events\/[^"]+)"[\s\S]*?<\/a>/g)) {
      const ps = [...card[0].matchAll(/<p[^>]*>([^<]+)<\/p>/g)].map((p) => stripTags(p[1]));
      const day = ps.find((p) => /^\d{1,2}\.$/.test(p));
      const month = ps.find((p) => deMonth(p) !== undefined && /^[A-Za-zäÄ]+$/.test(p));
      const time = ps.find((p) => /^\d{1,2}:\d{2}$/.test(p));
      const price = ps.find((p) => /^\d+(?:,\d{2})?\s*€$/.test(p));
      if (!day || !month || !time) continue;
      const mm = String(deMonth(month)).padStart(2, '0');
      const dd = day.replace('.', '').padStart(2, '0');
      let date = `${todayISO.slice(0, 4)}-${mm}-${dd}`;
      if (date < todayISO) date = `${Number(todayISO.slice(0, 4)) + 1}-${mm}-${dd}`;
      out.push({
        title,
        date,
        time: time.length === 4 ? `0${time}` : time,
        ...(duration ? { duration } : {}),
        ...(price ? { price: `€${Math.round(Number(price.replace('€', '').trim().replace(',', '.')))}` } : {}),
        url: new URL(card[1], source.url).href,
      });
    }
  }
  for (const w of out) console.log(`[${source.slug}] rausgegangen: "${w.title}" ${w.date} ${w.time} ${w.price ?? ''}`);
  console.log(`[${source.slug}] rausgegangen: ${out.length} dates on the page`);
  return out;
}

/** 12-hour clock hour → 24-hour numeric hour. */
const h24 = (h, ap) => {
  let hour = Number(h) % 12;
  if (/pm/i.test(ap)) hour += 12;
  return hour;
};

/** A single Eversports event page (Ana's "Fluxus Maximus" workshop): the
 *  page's own Schedule table lists every date with its time and address,
 *  and the Ticket options table lists what each session costs — read
 *  through the r.jina.ai text relay since Eversports sits behind a
 *  Cloudflare JS challenge that blocks CI runners outright. Rendered as
 *  markdown tables:
 *
 *    | Date | Time | Location | Teacher |
 *    | 01/16/2027 | 09:00 AM - 03:00 PM | Mariannenplatz 2, 10997 Berlin | Ana |
 *
 *  The relay renders the table with no browser timezone context, so its
 *  times come out in UTC — one (winter) or two (summer) hours behind
 *  what a Berlin visitor actually sees on the live page (confirmed
 *  against Jirel's own browser: the relay's 09:00 was the page's 10:00).
 *  Every row is parsed as UTC and converted through the same
 *  Europe/Berlin helpers the rest of the scraper uses, so the card
 *  always matches the page regardless of season.
 *
 *  Consecutive schedule rows sharing one address are one multi-day
 *  session (a two-day lab) — matched in order to the ticket rows, both
 *  listed top to bottom in the same sequence on the page. */
async function fromEversports(source) {
  const relay = `https://r.jina.ai/${source.url}`;
  const res = await fetch(relay, {
    redirect: 'follow',
    headers: { 'user-agent': UA, accept: 'text/plain,*/*;q=0.8' },
  });
  if (!res.ok) {
    console.log(`[${source.slug}] eversports: relay HTTP ${res.status}`);
    return [];
  }
  const md = await res.text();
  const pageTitle = md.match(/\n#\s+([^\n]+)/)?.[1]?.trim();

  const tickets = [...md.matchAll(/\|\s*€\s*([\d.,]+)(?:\s*€\s*[\d.,]+)?\s*\|\s*([^|]+?)\s*\|/g)]
    .map((m) => ({ price: `€${Math.round(Number(m[1].replace(',', '.')))}`, name: decodeEntities(m[2]).trim() }))
    .filter((t) => t.name && !/^Price$/i.test(t.name));

  const rows = [...md.matchAll(
    /\|\s*(\d{2})\/(\d{2})\/(\d{4})\s*\|\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*\|\s*([^|]+?)\s*\|/gi,
  )].map((m) => {
    const [, mm, dd, yyyy, h1, min1, ap1, h2, min2, ap2, loc] = m;
    const startUtc = Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), h24(h1, ap1), Number(min1));
    const endUtc = Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), h24(h2, ap2), Number(min2));
    return {
      date: berlinDate(startUtc),
      time: berlinTime(startUtc),
      hours: (endUtc - startUtc) / 3600000,
      location: loc.trim(),
    };
  });
  if (!rows.length) {
    console.log(`[${source.slug}] eversports: no schedule rows found`);
    return [];
  }

  const groups = [];
  for (const r of rows) {
    const last = groups[groups.length - 1];
    if (last && last.location === r.location) last.rows.push(r);
    else groups.push({ location: r.location, rows: [r] });
  }

  const out = [];
  groups.forEach((g, i) => {
    const first = g.rows[0];
    const ticket = tickets[i];
    const days = g.rows.length;
    const district =
      Object.entries(source.knownDistricts ?? {}).find(([k]) => first.location.includes(k))?.[1] ??
      source.district;
    const title = ticket?.name || pageTitle || 'Workshop';
    out.push({
      title,
      date: first.date,
      time: first.time,
      ...(days > 1
        ? { duration: `${days} Tage` }
        : first.hours > 0 && first.hours <= 12 ? { duration: `${Math.round(first.hours * 2) / 2} h` } : {}),
      ...(ticket?.price ? { price: ticket.price } : {}),
      ...(district ? { district } : {}),
      url: source.infoUrl ?? source.url,
    });
    console.log(`[${source.slug}] eversports: "${title}" ${first.date} ${first.time} (${days}d) ${ticket?.price ?? 'no price'}`);
  });
  console.log(`[${source.slug}] eversports: ${out.length} sessions on the page`);
  return out;
}

/** A Google Calendar embedded on the host's page (Sabine's Termine page):
 *  the iframe's src names the calendar, and every public Google Calendar
 *  serves an ICS feed at /calendar/ical/<id>/public/basic.ics — so the
 *  dates the visitor sees in the widget arrive as plain data. Newer
 *  embeds base64-encode the id; both spellings are handled. */
async function fromGcalEmbed(source) {
  const res = await fetch(source.url, {
    redirect: 'follow',
    headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.8' },
  });
  if (!res.ok) {
    console.log(`[${source.slug}] gcal: page HTTP ${res.status}`);
    return [];
  }
  const html = await res.text();
  // The embed URL may sit in escaped JSON rather than a plain iframe tag —
  // and Jimdo's consent manager builds the iframe client-side, in which
  // case only a headless render's DOM shows it at all.
  const embedIn = (s) =>
    s?.replace(/\\\//g, '/').match(/https:\/\/calendar\.google\.com\/calendar\/embed\?[^"'\s<>\\]+/i)?.[0];
  let embed = embedIn(html);
  if (!embed) {
    embed = embedIn(await renderAllFrames(source.url, source.slug));
  }
  if (!embed) {
    console.log(`[${source.slug}] gcal: no Google Calendar embed on the page`);
    return [];
  }
  const ids = [...decodeEntities(embed).matchAll(/[?&](?:src|cid)=([^&]+)/g)].map((m) =>
    decodeURIComponent(m[1]),
  );
  console.log(`[${source.slug}] gcal: embed found with ${ids.length} calendar id(s)`);
  const out = [];
  for (let id of ids) {
    if (!id.includes('@')) {
      // cid-style embeds carry the id base64-encoded.
      try {
        const decoded = Buffer.from(id, 'base64').toString('utf8').replace(/[^\x20-\x7e]+.*$/s, '');
        if (decoded.includes('@')) id = decoded;
      } catch {
        /* not base64 — try the raw value */
      }
    }
    try {
      const r = await fetch(`https://calendar.google.com/calendar/ical/${encodeURIComponent(id)}/public/basic.ics`, {
        headers: { 'user-agent': UA },
      });
      console.log(`[${source.slug}] gcal: ics feed for ${id}: HTTP ${r.status}`);
      if (!r.ok) continue;
      out.push(...fromIcs(await r.text(), source.infoUrl ?? source.url, source));
    } catch (err) {
      console.log(`[${source.slug}] gcal: ics fetch failed: ${err.message.split('\n')[0]}`);
    }
  }
  let entries = out;
  if (source.excludeTitle) {
    const ex = new RegExp(source.excludeTitle, 'i');
    entries = entries.filter((w) => !ex.test(w.title));
  }
  for (const w of entries) {
    if (source.requestBooking) w.request = true;
    console.log(`[${source.slug}] gcal: "${w.title}" ${w.date} ${w.time ?? ''}`);
  }
  return entries;
}

/** Parse an iCalendar feed's VEVENTs into feed entries. Local (TZID)
 *  timestamps are taken as Berlin wall-clock; UTC ones are converted. */
function fromIcs(icsText, pageUrl, source) {
  // Unfold RFC 5545 continuation lines before matching.
  const text = icsText.replace(/\r?\n[ \t]/g, '');
  const out = [];
  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const get = (k) => block.match(new RegExp(`^${k}(?:;[^:\\r\\n]*)?:(.*)$`, 'mi'))?.[1]?.trim();
    if (/^STATUS:CANCELLED/im.test(block)) continue;
    const stamp = (raw) => raw?.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)/);
    const s = stamp(get('DTSTART'));
    let date, time, duration;
    if (s) {
      if (s[7] === 'Z') {
        const ms = Date.parse(`${s[1]}-${s[2]}-${s[3]}T${s[4]}:${s[5]}:${s[6]}Z`);
        date = berlinDate(ms);
        time = berlinTime(ms);
      } else {
        date = `${s[1]}-${s[2]}-${s[3]}`;
        time = `${s[4]}:${s[5]}`;
      }
      const e = stamp(get('DTEND'));
      if (e) {
        // Same-offset difference, so parsing both as UTC is safe.
        const hours =
          (Date.parse(`${e[1]}-${e[2]}-${e[3]}T${e[4]}:${e[5]}:${e[6]}Z`) -
            Date.parse(`${s[1]}-${s[2]}-${s[3]}T${s[4]}:${s[5]}:${s[6]}Z`)) /
          3600000;
        if (hours > 0 && hours <= 12) duration = `${Math.round(hours * 2) / 2} h`;
      }
    } else {
      // All-day events (DTSTART;VALUE=DATE) — Google publishes Sabine's
      // whole calendar this way, with the hours in the summary instead.
      const d = get('DTSTART')?.match(/^(\d{4})(\d{2})(\d{2})$/);
      if (!d) continue;
      date = `${d[1]}-${d[2]}-${d[3]}`;
    }
    // "Workshop \"Honiglebkuchen backen\"" → "Honiglebkuchen backen".
    let summary = get('SUMMARY')
      ?.replace(/\\([,;])/g, '$1')
      .replace(/["„“]/g, '')
      .replace(/^\s*Workshop:?\s*/i, '')
      .trim();
    // A trailing "18-22 Uhr" in the summary is the event's real time —
    // lift it off the title and into the card's own fields.
    const range = summary?.match(/\s*(\d{1,2})\s*[-–]\s*(\d{1,2})\s*Uhr\s*$/i);
    if (range) {
      time ??= `${range[1].padStart(2, '0')}:00`;
      if (!duration) {
        const hours = Number(range[2]) - Number(range[1]);
        if (hours > 0 && hours <= 12) duration = `${hours} h`;
      }
      summary = summary.slice(0, range.index).trim();
    }
    out.push({
      title: summary || source.title || 'Workshop',
      date,
      ...(time ? { time } : {}),
      ...(duration ? { duration } : {}),
      ...(source.price ? { price: source.price } : {}),
      url: pageUrl,
    });
  }
  return out;
}

/** Wix Bookings app id — constant across all Wix sites. */
const WIX_BOOKINGS_APP = '13d21c63-b5ec-5912-8397-c3a5ddb27a97';

/** Strategy 2: the Wix Bookings visitor API. A Wix page's schedule is
 *  rendered client-side, so the dates never appear in the HTML; the site's
 *  own /_api/ endpoints serve them to any visitor holding the instance
 *  token that GET /_api/v1/access-tokens hands out. Returns null when the
 *  page isn't Wix, [] when it is but nothing could be read. */
async function fromWixBookings(source, html) {
  if (!/wix\.com|wixstatic|parastorage|thunderbolt/i.test(html)) return null;
  const origin = new URL(source.url).origin;
  const jsonHeaders = { 'user-agent': UA, accept: 'application/json' };

  const tokRes = await fetch(`${origin}/_api/v1/access-tokens`, { headers: jsonHeaders });
  console.log(`[${source.slug}] wix access-tokens: HTTP ${tokRes.status}`);
  if (!tokRes.ok) return [];
  const tokens = await tokRes.json();
  const instance = tokens?.apps?.[WIX_BOOKINGS_APP]?.instance;
  if (!instance) {
    console.log(`[${source.slug}] wix: no bookings token; app ids present: ${Object.keys(tokens?.apps ?? {}).join(', ') || 'none'}`);
    return [];
  }

  const authHeaders = { ...jsonHeaders, authorization: instance, 'content-type': 'application/json' };

  const svcRes = await fetch(`${origin}/_api/bookings/v2/services/query`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ query: { paging: { limit: 100 } } }),
  });
  console.log(`[${source.slug}] wix services query: HTTP ${svcRes.status}`);
  if (!svcRes.ok) {
    console.log(`[${source.slug}] wix services body: ${(await svcRes.text()).slice(0, 300)}`);
    return [];
  }
  const svcJson = await svcRes.json();
  const services = svcJson.services ?? [];
  console.log(
    `[${source.slug}] wix services: ${services.map((s) => `${s.name} (${s.type ?? '?'}) [${s.id}]`).join('; ') || 'none'}`,
  );
  if (!services.length) return [];

  const from = new Date().toISOString();
  const to = new Date(Date.now() + KEEP_DAYS * 86400000).toISOString();
  const avRes = await fetch(`${origin}/_api/bookings/v2/availability/query`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      query: {
        filter: { serviceId: { $in: services.map((s) => s.id) }, startDate: from, endDate: to },
      },
    }),
  });
  console.log(`[${source.slug}] wix availability query: HTTP ${avRes.status}`);
  if (!avRes.ok) {
    console.log(`[${source.slug}] wix availability body: ${(await avRes.text()).slice(0, 300)}`);
    return [];
  }
  const avJson = await avRes.json();
  const entries = avJson.availabilityEntries ?? [];
  console.log(`[${source.slug}] wix availability entries: ${entries.length}`);

  const byId = new Map(services.map((s) => [s.id, s]));
  const events = [];
  for (const entry of entries) {
    const slot = entry.slot ?? entry;
    const start = Date.parse(slot.startDate ?? '');
    if (Number.isNaN(start)) continue;
    const end = Date.parse(slot.endDate ?? '');
    const span = Number.isNaN(end) ? 0 : (end - start) / 3600000;
    // Full sessions stay in the feed as Sold out + Notify me.
    const soldOut = entry.bookable === false || entry.openSpots === 0;
    const spots = Number(entry.openSpots ?? slot.openSpots);
    const service = byId.get(slot.serviceId);
    const priceValue = service?.payment?.fixed?.price?.value;
    const servicePage = service?.urls?.servicePage?.url;
    const media = service?.media?.mainMedia?.image?.url ?? service?.media?.items?.[0]?.image?.url;
    events.push({
      title: service?.name ?? 'Workshop',
      date: berlinDate(start),
      time: berlinTime(start),
      ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
      ...(priceValue != null ? { price: `€${Math.round(Number(priceValue))}` } : {}),
      ...(soldOut ? { soldOut: true } : Number.isFinite(spots) && spots >= 0 ? { spots } : {}),
      ...(typeof media === 'string' && media.startsWith('http') ? { image: media } : {}),
      url: typeof servicePage === 'string' && servicePage.startsWith('http') ? servicePage : source.url,
    });
  }
  return events;
}

/** Parser for German weekly-schedule pages: lines shaped like
 *  "<Title> Dienstags I 18 - 20 Uhr I Berlin Spandau  89€ pro Person".
 *  Emits recurring entries (weekday + time), not dated ones. */
function fromGermanRecurring(html, source) {
  const DE_DAYS = { mo: 'mon', di: 'tue', mi: 'wed', do: 'thu', fr: 'fri', sa: 'sat', so: 'sun' };
  const text = stripTags(html);
  const results = [];
  const re =
    /((?:Mo(?:ntag)?|Di(?:enstag)?|Mi(?:ttwoch)?|Do(?:nnerstag)?|Fr(?:eitag)?|Sa(?:mstag)?|So(?:nntag)?)s?\.?(?:\s*(?:&|und)\s*(?:Mo|Di|Mi|Do|Fr|Sa|So)[a-zäöü]*\.?s?)*)\s*[I|l]\s*(\d{1,2}(?:[:.]\d{2})?)\s*(?:-|–|bis)\s*(\d{1,2}(?:[:.]\d{2})?)\s*Uhr/gi;

  const toTime = (raw) => {
    const [h, m = '00'] = raw.replace('.', ':').split(':');
    return `${h.padStart(2, '0')}:${m.padEnd(2, '0')}`;
  };
  const toHours = (raw) => {
    const [h, m = '0'] = raw.replace('.', ':').split(':');
    return Number(h) + Number(m) / 60;
  };

  for (const m of text.matchAll(re)) {
    const weekdays = [
      ...new Set(
        m[1]
          .split(/&|und/i)
          .map((d) => DE_DAYS[d.trim().slice(0, 2).toLowerCase()])
          .filter(Boolean),
      ),
    ];
    if (!weekdays.length) continue;

    // The class name is the text right before the weekday, back to the end
    // of the previous sentence, the previous class's price tail, or page
    // furniture like "Mehr Infos" / "Termine & Infos" buttons.
    const before = text.slice(Math.max(0, m.index - 90), m.index);
    // ALL-CAPS words are section headers ("AKTUELLE ANGEBOTE"), not class
    // names — treat them as boundaries too, then shed leading dashes and a
    // stray leading "Berlin" from a header tail.
    const title = before
      .split(/[.!?—€{}();|]|Spendenbasis|Infos|buchen|\b[A-ZÄÖÜẞ]{4,}\b|\s{3,}/)
      .pop()
      ?.replace(/^[\s\-–—:·]+/, '')
      .replace(/^Berlin\s+/, '')
      .trim();
    if (!title || title.length < 3 || title.length > 70) continue;

    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 140);
    const district = after.match(/Berlin\s+([A-ZÄÖÜ][A-Za-zäöüß]+(?:\s+St\.\s*[A-ZÄÖÜ][A-Za-zäöüß]+)?)/)?.[1];
    const price = after.match(/(\d{1,4})\s*€|€\s*(\d{1,4})/);
    const hours = toHours(m[3]) - toHours(m[2]);
    const duration =
      hours > 0 ? `${Number.isInteger(hours) ? hours : hours.toFixed(1)} h` : undefined;

    results.push({
      slug: source.slug,
      sourceUrl: source.url,
      title,
      weekdays,
      time: toTime(m[2]),
      ...(duration ? { duration } : {}),
      ...(price ? { price: `€${price[1] ?? price[2]}` } : {}),
      ...(district ? { district } : {}),
      url: source.url,
    });
  }

  // Dedupe repeats of the same class line elsewhere on the page.
  const seenKeys = new Set();
  return results.filter((r) => {
    const key = `${r.title}|${r.time}|${r.weekdays.join()}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });
}

/** Parser for Shopify workshop shops: the collection's products.json lists
 *  every workshop as a product whose variants are the dated sessions
 *  ("DD.MM.YYYY - HH:MM"), each with its own price and availability flag.
 *  Sold-out variants are skipped. Duration comes from the description
 *  ("Duration: 1.5 - 2 hours"). */
const EN_MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

const MONTHS_DE = {
  januar: '01', februar: '02', märz: '03', april: '04', mai: '05', juni: '06',
  juli: '07', august: '08', september: '09', oktober: '10', november: '11', dezember: '12',
};
const MONTHS_DE_RE = 'Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember';

/** "45-60min" / "90min" / "120-150min" as a duration string. Mampe carries
 *  the length in the product title rather than the description. */
const hoursFromMinutes = (a, b) => {
  const h = (m) => String(Math.round((Number(m) / 60) * 100) / 100);
  return `${h(a)}${b ? `–${h(b)}` : ''} h`;
};

/** Reads an English list of course dates — "October 24 & 25", "August 31 +
 *  September 07, 14, 21", "September 15, 22, 29 + October 6, 13, 20,
 *  19-22.00" — into the first meeting's date, the start time, the length of
 *  one meeting and how many there are. A class meeting more than once sits
 *  on its FIRST date, and the caller marks the other meetings on the card so
 *  nobody mistakes a course for a single evening. Returns null when the text
 *  names no dates at all. */
function englishCourseDates(text) {
  // A day only continues the list if it is not the start of a clock time:
  // in "October 6, 13, 20, 19-22.00" the 19 opens the hours, not a fourth
  // meeting. A dash is allowed only on the day right after the month name,
  // where it means consecutive days ("September 11-12", a two-day
  // intensive) and cannot be the hours \u2014 those never sit there.
  const groups = [...text.matchAll(
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s*((?:\d{1,2}(?!\d)(?:\s*[-\u2013]\s*\d{1,2}(?!\d)(?!\s*(?:[:.]\d|h\b|Uhr|[ap]m\b)))?)(?:\s*[&,+/]\s*\d{1,2}(?!\d)(?![:.]\d)(?!\s*[-\u2013]\s*\d))*)/gi,
  )]
    .map((g) => ({
      name: g[1].slice(0, 3),
      month: EN_MONTHS[g[1].toLowerCase()],
      days: g[2].split(/[&,+/]/).flatMap((part) => {
        // "11-12" is two consecutive meetings, not one; a wider span is
        // more likely a typo or a misread than a fortnight-long course.
        const span = part.match(/^\s*(\d{1,2})\s*[-\u2013]\s*(\d{1,2})\s*$/);
        if (span && Number(span[2]) > Number(span[1]) && Number(span[2]) - Number(span[1]) <= 6) {
          return Array.from({ length: Number(span[2]) - Number(span[1]) + 1 }, (_, i) => Number(span[1]) + i);
        }
        return [parseInt(part, 10)];
      }).filter((n) => n >= 1 && n <= 31),
      index: g.index,
      end: g.index + g[0].length,
    }))
    .filter((g) => g.month && g.days.length);
  if (!groups.length) return null;
  const first = groups[0];
  const mmdd = `${String(first.month).padStart(2, '0')}-${String(first.days[0]).padStart(2, '0')}`;
  let date = `${todayISO.slice(0, 4)}-${mmdd}`;
  // These listings carry no year. A date a few weeks behind is a stale
  // listing and drops out on the feed's date filter; only one most of a
  // year behind is really next year's (a January course listed in December).
  if (date < todayISO && Date.parse(todayISO) - Date.parse(date) > 120 * 86400000) {
    date = `${Number(todayISO.slice(0, 4)) + 1}-${mmdd}`;
  }
  // The class time can sit before the dates ("Mondays @ 19-21:30 on …") or
  // after them; take the first plausible range that isn't part of a date list.
  let tm = null;
  for (const c of text.matchAll(/(\d{1,2})(?::(\d{2}))?\s*[-\u2013]\s*(\d{1,2})(?::(\d{2}))?/g)) {
    const insideDates = groups.some((g) => c.index >= g.index && c.index < g.end);
    if (!insideDates && Number(c[1]) <= 23 && Number(c[3]) <= 24) { tm = c; break; }
  }
  const hours = tm
    ? Number(tm[3]) + Number(tm[4] ?? 0) / 60 - (Number(tm[1]) + Number(tm[2] ?? 0) / 60)
    : 0;
  const total = groups.reduce((n, g) => n + g.days.length, 0);
  // Two or three meetings list their dates; longer courses just count them
  // (the booking page has the full schedule).
  const listDe = groups.map((g) => `${g.days.join('. & ')}.${String(g.month).padStart(2, '0')}.`).join(' & ');
  const listEn = groups.map((g) => `${g.name} ${g.days.join(' & ')}`).join(' & ');
  return {
    date,
    time: tm ? `${tm[1].padStart(2, '0')}:${tm[2] ?? '00'}` : undefined,
    hours,
    total,
    markDe: total > 1 ? (total <= 3 ? ` \u2013 ${total} Termine: ${listDe}` : ` \u2013 ${total} Termine`) : '',
    markEn: total > 1 ? (total <= 3 ? ` \u2013 ${total} dates: ${listEn}` : ` \u2013 ${total} dates`) : '',
  };
}

function fromShopify(jsonText, source) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    console.log(`[${source.slug}] shopify: response is not JSON`);
    return [];
  }
  const out = [];
  for (const product of data.products ?? []) {
    const body = stripTags(String(product.body_html ?? ''));
    const dur = body.match(/Duration:\s*([\d.,]+)(?:\s*(?:-|\u2013|to)\s*([\d.,]+))?\s*hours?/i);
    // Some shops (Mampe) put the length in the product title instead:
    // "GROSSE SCHNAPSGESCHICHTEN: 90min", "SMALL SCHNAPPS STORIES: 45-60min".
    const durMin = String(product.title ?? '').match(/(\d{2,3})\s*(?:[-\u2013]\s*(\d{2,3})\s*)?min/i);
    const duration = dur
      ? `${dur[1].replace(',', '.')}${dur[2] ? `\u2013${dur[2].replace(',', '.')}` : ''} h`
      : durMin
        ? hoursFromMinutes(durMin[1], durMin[2])
        : undefined;
    // A title that named its own length has said it twice once the duration
    // pill carries it; drop the token and tidy what it leaves behind.
    const productTitle = stripTags(String(product.title))
      .replace(/:?\s*\d{2,3}\s*(?:[-\u2013]\s*\d{2,3}\s*)?min\b/i, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/[\s:,-]+$/, '')
      .trim();
    // Shops served under a market/locale path (mampe.berlin/de-engl/\u2026) need
    // their product links built on that path, not the bare root.
    const productUrl = source.productBase
      ? new URL(product.handle, source.productBase).href
      : new URL(`/products/${product.handle}`, source.url).href;
    let kept = 0;
    for (const variant of product.variants ?? []) {
      const vt = String(variant.title);
      const m = vt.match(/(\d{2})\.(\d{2})\.(\d{4})\s*[-\u2013]\s*(\d{1,2}):(\d{2})/);
      if (m) {
        out.push({
          title: productTitle,
          date: `${m[3]}-${m[2]}-${m[1]}`,
          time: `${m[4].padStart(2, '0')}:${m[5]}`,
          ...(variant.available === false ? { soldOut: true } : {}),
          ...(duration ? { duration } : {}),
          ...(variant.price != null ? { price: `\u20ac${Math.round(Number(variant.price))}` } : {}),
          ...(source.district ? { district: source.district } : {}),
          ...(product.images?.[0]?.src ? { image: product.images[0].src } : {}),
          url: productUrl,
        });
        kept++;
        continue;
      }
      // German long-form variants, one per date (Mampe): "Mittwoch, 20. Mai
      // 2026, 16:00 Uhr / TICKET GROSSE SCHNAPSGESCHICHTEN". The weekday
      // and the ticket name after the slash carry nothing the card needs.
      const dm = vt.match(
        new RegExp(`(\\d{1,2})\\.\\s*(${MONTHS_DE_RE})\\s+(20\\d{2})\\s*,?\\s*(?:um\\s*)?(\\d{1,2})(?:[:.](\\d{2}))?\\s*Uhr`, 'i'),
      );
      if (dm) {
        out.push({
          title: productTitle,
          date: `${dm[3]}-${MONTHS_DE[dm[2].toLowerCase()]}-${dm[1].padStart(2, '0')}`,
          time: `${dm[4].padStart(2, '0')}:${dm[5] ?? '00'}`,
          ...(variant.available === false ? { soldOut: true } : {}),
          ...(duration ? { duration } : {}),
          ...(variant.price != null ? { price: `€${Math.round(Number(variant.price))}` } : {}),
          ...(source.district ? { district: source.district } : {}),
          ...(product.images?.[0]?.src ? { image: product.images[0].src } : {}),
          url: productUrl,
        });
        kept++;
        continue;
      }
      // English course variants (Empire of Dirt): "October 24 & 25
      // (Saturday 11-15 / Sunday 11-14)", "November 14&15&22 @ 11:30 -
      // 14:00", "Mondays @ 19-21:30 on August 31 & September 7/14/21/28".
      const course = englishCourseDates(vt);
      if (!course) continue;
      const baseTitle = stripTags(String(product.title));
      out.push({
        title: baseTitle + course.markDe,
        ...(course.markEn ? { titleEn: baseTitle + course.markEn } : {}),
        date: course.date,
        ...(course.time ? { time: course.time } : {}),
        ...(course.hours > 0 && course.hours <= 12
          ? {
              duration: course.total > 1
                ? `${course.total} \u00d7 ${Math.round(course.hours * 2) / 2} h`
                : `${Math.round(course.hours * 2) / 2} h`,
            }
          : {}),
        ...(variant.available === false ? { soldOut: true } : {}),
        ...(variant.price != null ? { price: `\u20ac${Math.round(Number(variant.price))}` } : {}),
        ...(source.district ? { district: source.district } : {}),
        ...(product.images?.[0]?.src ? { image: product.images[0].src } : {}),
        url: productUrl,
      });
      kept++;
    }
    // Shops that create one product per workshop date (Berliner Bumerang)
    // carry the date in the description instead of the variants:
    // "Sonntag, 11. Oktober 2026 von 10 bis 17 Uhr".
    if (!kept) {
      const wm = body.match(
        new RegExp(`(\\d{1,2})\\.\\s*(${MONTHS_DE_RE})\\s*(20\\d{2})(?:\\s*von\\s*(\\d{1,2})(?:[:.](\\d{2}))?\\s*bis\\s*(\\d{1,2})(?:[:.](\\d{2}))?\\s*Uhr)?`, 'i'),
      );
      const variant = (product.variants ?? []).find((v) => v.available !== false);
      if (wm && variant) {
        const date = `${wm[3]}-${MONTHS_DE[wm[2].toLowerCase()]}-${wm[1].padStart(2, '0')}`;
        const time = wm[4] ? `${wm[4].padStart(2, '0')}:${wm[5] ?? '00'}` : undefined;
        const span = wm[4] && wm[6]
          ? Number(wm[6]) + Number(wm[7] ?? 0) / 60 - (Number(wm[4]) + Number(wm[5] ?? 0) / 60)
          : 0;
        out.push({
          // A "OKTOBER - " style month prefix repeats what the date says.
          title: productTitle.replace(new RegExp(`^\\s*(?:${MONTHS_DE_RE})\\s*[-–]\\s*`, 'i'), ''),
          date,
          ...(time ? { time } : {}),
          ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
          ...(variant.price != null ? { price: `€${Math.round(Number(variant.price))}` } : {}),
          ...(source.district ? { district: source.district } : {}),
          ...(product.images?.[0]?.src ? { image: product.images[0].src } : {}),
          url: productUrl,
        });
        kept++;
        console.log(`[${source.slug}] shopify body-date: "${product.title}" ${date} ${time ?? ''}`);
      }
    }
    console.log(`[${source.slug}] shopify product "${product.title}": ${(product.variants ?? []).length} variants, ${kept} available dated sessions`);
  }
  return out;
}

/** Squarespace commerce pages answer ?format=json with the whole product
 *  collection \u2014 every class, its excerpt, its photo and its variants. A class
 *  that runs on fixed dates keeps them in a variant option named "Date":
 *  either one evening ("Wed. 12/08/26 19-21h30") or a course's whole series
 *  in a single option ("August 31 + September 07, 14, 21"). A class that
 *  sells one seat rather than a date (Helka's six-week courses) has no such
 *  option and names its dates in the excerpt instead, so that is read as a
 *  fallback. Anything with neither \u2014 a gift card, whose variants are amounts
 *  \u2014 names no date at all and so never reaches the feed. */
async function fromSquarespace(source) {
  const url = new URL(source.url);
  url.searchParams.set('format', 'json');
  const res = await fetch(url.href, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; TwiggliScheduleBot/1.0; +https://www.twiggli.com)',
      accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const items = data.items ?? [];
  console.log(`[${source.slug}] squarespace: ${items.length} products`);
  const out = [];
  for (const item of items) {
    const sc = item.structuredContent ?? {};
    const title = stripTags(String(item.title ?? '')).trim();
    const common = {
      ...(source.district ? { district: source.district } : {}),
      ...(item.assetUrl ? { image: item.assetUrl } : {}),
      url: item.fullUrl ? new URL(item.fullUrl, source.url).href : source.url,
    };
    const text = stripTags(`${item.excerpt ?? ''} ${item.body ?? ''}`).replace(/\s+/g, ' ').trim();
    // The clock a course keeps when its date option names only days
    // ("\u2026 21 September - 19:00 - 22:00"). Colon-bearing, so a range of dates
    // can never be mistaken for a range of hours.
    const clock = text.match(/(\d{1,2}):(\d{2})\s*[-\u2013]\s*(\d{1,2})(?::(\d{2}))?/);
    const clockHours = clock
      ? Number(clock[3]) + Number(clock[4] ?? 0) / 60 - (Number(clock[1]) + Number(clock[2] ?? 0) / 60)
      : 0;
    // A course sits on its first meeting; the card marks the rest so nobody
    // books a six-week course thinking it is one evening.
    const courseEntry = (course) => {
      const hours = course.hours > 0 ? course.hours : clockHours;
      const time = course.time ?? (clock ? `${clock[1].padStart(2, '0')}:${clock[2]}` : undefined);
      return {
        title: title + course.markDe,
        ...(course.markEn ? { titleEn: title + course.markEn } : {}),
        date: course.date,
        ...(time ? { time } : {}),
        ...(hours > 0 && hours <= 12
          ? {
              duration: course.total > 1
                ? `${course.total} \u00d7 ${Math.round(hours * 2) / 2} h`
                : `${Math.round(hours * 2) / 2} h`,
            }
          : {}),
      };
    };
    let kept = 0;
    for (const variant of sc.variants ?? []) {
      const dateText = (variant.optionValues ?? [])
        .find((o) => /date|termin/i.test(String(o.optionName)))?.value;
      if (!dateText) continue;
      const price = variant.priceMoney?.value != null
        ? { price: `\u20ac${Math.round(Number(variant.priceMoney.value))}` }
        : {};
      // Squarespace tracks seats as stock, so "3 left" and "sold out" are
      // both real rather than guessed.
      const seats = variant.unlimited ? null : Number(variant.qtyInStock);
      const avail = seats == null || !Number.isFinite(seats)
        ? {}
        : seats <= 0 ? { soldOut: true } : { spots: seats };
      // One evening, day first: "Wed. 12/08/26 19-21h30".
      const one = String(dateText).match(
        /(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\D{0,4}(\d{1,2})(?:[:.h](\d{2}))?\s*[-\u2013]\s*(\d{1,2})(?:[:.h](\d{2}))?)?/,
      );
      if (one) {
        const span = one[4]
          ? Number(one[6]) + Number(one[7] ?? 0) / 60 - (Number(one[4]) + Number(one[5] ?? 0) / 60)
          : 0;
        out.push({
          title,
          date: `${one[3].length === 2 ? `20${one[3]}` : one[3]}-${one[2].padStart(2, '0')}-${one[1].padStart(2, '0')}`,
          ...(one[4] ? { time: `${one[4].padStart(2, '0')}:${one[5] ?? '00'}` } : {}),
          ...(span > 0 && span <= 12 ? { duration: `${Math.round(span * 2) / 2} h` } : {}),
          ...avail,
          ...price,
          ...common,
        });
        kept++;
        continue;
      }
      const course = englishCourseDates(String(dateText));
      if (!course) continue;
      out.push({ ...courseEntry(course), ...avail, ...price, ...common });
      kept++;
    }
    // No dated option anywhere: a course sold as a single seat, whose dates
    // live in the title or the excerpt.
    if (!kept) {
      const course = englishCourseDates(`${title} ${text}`);
      const variant = (sc.variants ?? []).find((v) => v.unlimited || Number(v.qtyInStock) > 0);
      if (course && variant) {
        const seats = variant.unlimited ? null : Number(variant.qtyInStock);
        out.push({
          ...courseEntry(course),
          ...(seats == null || !Number.isFinite(seats) ? {} : { spots: seats }),
          ...(variant.priceMoney?.value != null
            ? { price: `\u20ac${Math.round(Number(variant.priceMoney.value))}` }
            : {}),
          ...common,
        });
        kept++;
        console.log(`[${source.slug}] squarespace prose dates: "${title}" ${course.date} \u00d7${course.total}`);
      }
    }
    console.log(`[${source.slug}] squarespace product "${title}": ${(sc.variants ?? []).length} variants, ${kept} dated sessions`);
  }
  return out;
}

/** Parser for dated-list pages: "Samstag, 29. August 2026" (German) or
 *  "Friday, September 25, 2026" (English), with the start time ("18 Uhr" /
 *  "18:00" / "6:00 PM") looked for around each date. A date with no time
 *  nearby is skipped and logged — better absent than wrong. */
function fromGermanDates(html, source) {
  const MONTHS = {
    januar: '01', februar: '02', märz: '03', april: '04', mai: '05', juni: '06',
    juli: '07', august: '08', september: '09', oktober: '10', november: '11', dezember: '12',
    january: '01', february: '02', march: '03', may: '05', june: '06',
    july: '07', october: '10', december: '12',
  };
  const MONTH_NAMES =
    'Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|January|February|March|May|June|July|October|December';
  // German "25. September 2026" and English "September 25, 2026".
  const re = new RegExp(
    `(?:(\\d{1,2})\\.\\s*(${MONTH_NAMES})|(${MONTH_NAMES})\\s+(\\d{1,2}),?)\\s*(20\\d{2})`,
    'gi',
  );

  // Try the visible text first; when a booking widget keeps its dates in
  // embedded JSON inside a script block, fall back to the raw markup — the
  // date strings still match there. \uXXXX escapes hide umlauts in JSON.
  const unescapeUmlauts = (s) =>
    s.replace(/\\u00e4/gi, 'ä').replace(/\\u00f6/gi, 'ö').replace(/\\u00fc/gi, 'ü').replace(/\\u00df/gi, 'ß');
  let text = stripTags(html);
  if (!re.test(text)) {
    text = unescapeUmlauts(decodeEntities(html));
    console.log(`[${source.slug}] no dates in visible text — scanning raw markup`);
  }
  re.lastIndex = 0;
  const out = [];

  for (const m of text.matchAll(re)) {
    const day = m[1] ?? m[4];
    const month = MONTHS[(m[2] ?? m[3]).toLowerCase()];
    const date = `${m[5]}-${month}-${day.padStart(2, '0')}`;
    const beforeCtx = text.slice(Math.max(0, m.index - 80), m.index);
    const afterCtx = text.slice(m.index + m[0].length, m.index + m[0].length + 160);
    const around = `${beforeCtx} § ${afterCtx}`;
    const TIME_RE = /(\d{1,2}):(\d{2})(?!\s*€)\s*(am|pm)?|(\d{1,2})\s*(?:Uhr|(am|pm))/i;
    // The time after the date belongs to it; one before may belong to the
    // previous entry in a list, so it is only a fallback.
    const timeMatch = afterCtx.match(TIME_RE) ?? beforeCtx.match(TIME_RE);
    let time = source.defaultTime;
    if (timeMatch) {
      let h = Number(timeMatch[4] ?? timeMatch[1]);
      const min = timeMatch[4] != null ? '00' : timeMatch[2];
      const ampm = (timeMatch[3] ?? timeMatch[5])?.toLowerCase();
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      time = `${String(h).padStart(2, '0')}:${min}`;
    }
    if (!time) {
      console.log(`[${source.slug}] date ${date} has no start time nearby — skipped. Context: …${around.replace(/\s+/g, ' ')}…`);
      continue;
    }
    const priceMatch = around.match(/(\d{1,3})(?:,\d{2})?\s*€/);
    out.push({
      title: source.title ?? 'Workshop',
      date,
      time,
      ...(source.titleEn ? { titleEn: source.titleEn } : {}),
      ...(source.duration ? { duration: source.duration } : {}),
      ...(priceMatch ? { price: `€${priceMatch[1]}` } : source.price ? { price: source.price } : {}),
      url: source.url,
    });
  }

  // Last resort, only when no written-out dates exist: numeric German
  // dates ("22.08.2026") — riskier, since any date on the page matches.
  if (!out.length) {
    for (const m of text.matchAll(/\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\b/g)) {
      const date = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
      const afterCtx = text.slice(m.index + m[0].length, m.index + m[0].length + 160);
      const beforeCtx = text.slice(Math.max(0, m.index - 80), m.index);
      const TIME_RE = /(\d{1,2}):(\d{2})(?!\s*€)\s*(am|pm)?|(\d{1,2})\s*(?:Uhr|(am|pm))/i;
      const tm = afterCtx.match(TIME_RE) ?? beforeCtx.match(TIME_RE);
      const time = tm
        ? `${String(Number(tm[4] ?? tm[1]) + ((tm[3] ?? tm[5])?.toLowerCase() === 'pm' && Number(tm[4] ?? tm[1]) < 12 ? 12 : 0)).padStart(2, '0')}:${tm[4] != null ? '00' : tm[2]}`
        : source.defaultTime;
      if (!time) {
        console.log(`[${source.slug}] numeric date ${date} has no time nearby — skipped`);
        continue;
      }
      out.push({
        title: source.title ?? 'Workshop',
        date,
        time,
        ...(source.titleEn ? { titleEn: source.titleEn } : {}),
        ...(source.duration ? { duration: source.duration } : {}),
        ...(source.price ? { price: source.price } : {}),
        url: source.url,
      });
    }
  }

  // The same date can appear more than once on a page — keep the first.
  const seenDates = new Set();
  return out.filter((w) => {
    const key = `${w.date}|${w.time}`;
    if (seenDates.has(key)) return false;
    seenDates.add(key);
    return true;
  });
}

/** Strategy 3: <time datetime> elements, titled by the nearest preceding heading. */
function fromTimeTags(html, sourceUrl) {
  const out = [];
  for (const m of html.matchAll(/<time[^>]*datetime=["']([^"']+)["'][^>]*>/gi)) {
    const start = Date.parse(m[1]);
    if (Number.isNaN(start)) continue;
    const before = html.slice(Math.max(0, m.index - 3000), m.index);
    const heading = [...before.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)].pop();
    out.push({
      title: heading ? stripTags(heading[1]) : 'Workshop',
      date: berlinDate(start),
      time: berlinTime(start),
      url: sourceUrl,
    });
  }
  return out;
}

/** Berlin Daisuki's WordPress Kochkurs page: each course is a heading
 *  ("Kochkurs in Küchenstudio : Sushi", "Online Sushi Kochkurs") followed
 *  by one dated heading per session ("11.10.2026 So. 129 €"), a Jetzt-
 *  buchen link to the course's WooCommerce product page, and a descriptor
 *  with the hours ("12 Uhr – 15 Uhr" / "12.30h bis 15.30h"). A leading
 *  "– sorry, ausgebucht." in a date heading closes the PREVIOUS date. */
function fromWpCourseDates(html, source) {
  const heads = [...html.matchAll(/<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    index: m.index,
    text: stripTags(m[2]),
  }));
  const courseRe = new RegExp(source.coursePattern ?? 'Kochkurs', 'i');
  const dateRe = /(\d{1,2})\.(\d{1,2})\.(\d{4})/;
  const out = [];
  for (let i = 0; i < heads.length; i++) {
    const h = heads[i];
    if (dateRe.test(h.text) || !courseRe.test(h.text)) continue;
    const sessions = [];
    let j = i + 1;
    while (j < heads.length && dateRe.test(heads[j].text)) {
      const t = heads[j].text;
      const d = t.match(dateRe);
      // "– sorry, ausgebucht. 20.09.2026" marks ITS date as full —
      // verified against the product page, whose date picker no longer
      // offers that day.
      sessions.push({
        date: `${d[3]}-${d[2].padStart(2, '0')}-${d[1].padStart(2, '0')}`,
        soldOut: /ausgebucht|ausverkauft/i.test(t),
        price: t.match(/(\d{2,3})(?:,\d\d)?\s*€/)?.[1],
      });
      j++;
    }
    if (!sessions.length) continue;
    // The course's descriptor ("Wie lange? 12 Uhr – 15 Uhr", the booking
    // link) often sits under its own sub-heading after the dates — the
    // block runs to the NEXT course heading, not just the next heading.
    let k = j;
    while (k < heads.length && !courseRe.test(heads[k].text)) k++;
    const block = html.slice(h.index, heads[k]?.index ?? html.length);
    const blockText = stripTags(block);
    const range = blockText.match(
      /(\d{1,2})(?:[.:](\d{2}))?\s*(?:Uhr|h)\s*(?:–|—|-|bis)\s*(\d{1,2})(?:[.:]\d{2})?\s*(?:Uhr|h)/i,
    );
    const hoursTxt = blockText.match(/ca\.?\s*(\d+)\s*Stunden/i);
    const link = block.match(/href="([^"]*\/produkt\/[^"]+)"/i)?.[1];
    const title = h.text.replace(/\s*:\s*/g, ': ').replace(/\s+/g, ' ').trim();
    for (const s of sessions) {
      const w = {
        title,
        date: s.date,
        ...(range ? { time: `${range[1].padStart(2, '0')}:${range[2] ?? '00'}` } : {}),
        ...(hoursTxt
          ? { duration: `${hoursTxt[1]} h` }
          : range
            ? { duration: `${Number(range[3]) - Number(range[1])} h` }
            : {}),
        ...(s.price ? { price: `€${s.price}` } : {}),
        ...(s.soldOut ? { soldOut: true } : {}),
        // Online courses aren't tied to a Bezirk — the card says so.
        ...(/\bonline\b/i.test(h.text) ? { district: 'Online' } : {}),
        url: link ? new URL(decodeEntities(link), source.url).href : source.url,
      };
      console.log(
        `[${source.slug}] course: "${w.title}" ${w.date} ${w.time ?? ''} ${w.soldOut ? 'SOLD OUT' : ''}`,
      );
      out.push(w);
    }
    i = j - 1;
  }
  return out;
}

/** Schmiedekurse Berlin's Jimdo pages: the whole schedule is server-
 *  rendered German prose — a date ("22./23. August", "12. September", or
 *  the kids pages' numeric ranges "20.-22.10"), the course title, then
 *  Kursleiter, price and "N Plätze frei" / "ausgebucht". Kids dates split
 *  into Vormittags- and Nachmittagskurs with their own times and seats.
 *  Booking is by mail only, so sources pair this mode with requestBooking. */
function fromKursBlocks(html, source) {
  const MONTHS = { januar: 1, februar: 2, märz: 3, april: 4, mai: 5, juni: 6,
    juli: 7, august: 8, september: 9, oktober: 10, november: 11, dezember: 12 };
  let text = stripTags(html);
  // The course list ends where the footer prose (booking terms, vouchers,
  // the undated evening course) begins — dates there aren't sessions.
  const cut = text.search(/Weitere Termine folgen|Info und Anmeldung|Buchung und Bezahlung/i);
  if (cut > 0) text = text.slice(0, cut);

  const dateRe = new RegExp(
    // "22./23 . August", "12. September", "8.-11. September", "28 . /29. November"
    String.raw`(\d{1,2})\s*\.\s*(?:[/–-]\s*(\d{1,2})\s*\.?\s*)?(${Object.keys(MONTHS).join('|')})` +
    // "20.-22.10" and "14.7-16.7" on the kids pages
    String.raw`|(\d{1,2})\.(\d{1,2})?\s*[-–]\s*(\d{1,2})\.(\d{1,2})\b`,
    'gi',
  );
  // "31.Oktober/1. November" yields a second match for its end date — a
  // match separated from the previous one by only range punctuation is the
  // same course, not a new block.
  const found = [];
  for (const m of text.matchAll(dateRe)) {
    const prev = found[found.length - 1];
    if (prev && /^\s*[/–-]\s*$/.test(text.slice(prev.endsAt, m.index))) {
      // The course spans into the next day/month — its block starts after
      // the whole range, and the extra day makes it a two-day course.
      prev.endsAt = m.index + m[0].length;
      prev.spansDays = true;
      continue;
    }
    m.endsAt = m.index + m[0].length;
    found.push(m);
  }

  const out = [];
  for (let i = 0; i < found.length; i++) {
    const m = found[i];
    const day = Number(m[1] ?? m[4]);
    const month = m[3] ? MONTHS[m[3].toLowerCase()] : Number(m[5] ?? m[7]);
    const lastDay = m[2] ?? m[6];
    const block = text.slice(m.endsAt, found[i + 1]?.index ?? text.length);
    if (!month || month > 12 || day > 31 || /Kurs wird verschoben/i.test(block)) continue;
    // A past date is next year's run — the page's own "2027" section rolls
    // forward exactly this way.
    const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let date = `${todayISO.slice(0, 4)}-${mmdd}`;
    if (date < todayISO) date = `${Number(todayISO.slice(0, 4)) + 1}-${mmdd}`;

    const price = block.match(/(\d{2,4})(?:,\d\d)?\s*€/);
    const explicitDays = block.match(/(\d)\s*Tage/i);
    const spanDays = lastDay ? Math.max(0, Number(lastDay) - day) + 1 : m.spansDays ? 2 : 1;
    const days = explicitDays ? Number(explicitDays[1]) : spanDays;

    const titleOf = (seg) =>
      seg
        // A time range straight after the date belongs to the session, not
        // the title ("26. August 16 - 19.00 Uhr Schweißkurs WIG …").
        .replace(/^\s*\d{1,2}(?:[.:]\d{2})?\s*[-–]\s*\d{1,2}(?:[.:]\d{2})?\s*Uhr/, '')
        .split(/Kurszeiten|Kursleiter|Kursgebühr|Kosten|Max\.|\d+\s*Pl(?:ätze|atz)\s*frei|ausgebucht|ausverkauft|Anmeldung|Vormittagskurs|Nachmittagskurs|Küchenmesser oder|Messer bis|\d\s*Tage a|\d\s*Stunden|Im Kurs|weitere Infos/i)[0]
        .replace(/\s*-\s*(\d) Tag/g, ' – $1 Tag')
        .replace(/[\s|•·–—-]+$/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    // A word-fragment "title" is the tail of a sentence that merely
    // mentions dates ("Ersatztermine 19./20. September und …"), not a
    // course block of its own. Pages that name the course before its date
    // ("Kurstermine: 4. Juni 17-19 Uhr") supply the title per source.
    const title = titleOf(block) || source.courseTitle || '';
    if (title.length < 6) continue;

    const entryFor = (seg, entryTitle, fallbackTime) => {
      const soldOut = /ausgebucht|ausverkauft/i.test(seg) && !/Pl(?:ätze|atz)\s*frei/i.test(seg);
      const spots = seg.match(/(\d+)\s*Pl(?:ätze|atz)\s*frei/i);
      const range = seg.match(/(\d{1,2})(?:[.:](\d{2}))?\s*[-–]\s*(\d{1,2})(?:[.:]\d{2})?\s*Uhr/);
      const start = range ? `${range[1].padStart(2, '0')}:${range[2] ?? '00'}` : fallbackTime;
      const hours = range ? Number(range[3]) - Number(range[1]) : null;
      return {
        title: entryTitle,
        date,
        ...(start ? { time: start } : {}),
        ...(days > 1 ? { duration: `${days} Tage` } : hours ? { duration: `${hours} h` } : {}),
        ...(price ? { price: `€${price[1]}` } : {}),
        ...(soldOut ? { soldOut: true } : spots ? { spots: Number(spots[1]) } : {}),
        url: source.infoUrl ?? source.url,
        ...(source.requestBooking ? { request: true } : {}),
      };
    };

    const subs = [...block.matchAll(/Vormittagskurs|Nachmittagskurs/gi)];
    if (subs.length) {
      for (let s = 0; s < subs.length; s++) {
        const seg = block.slice(subs[s].index, subs[s + 1]?.index ?? block.length);
        const w = entryFor(seg, `${title} – ${subs[s][0]}`, null);
        if (w) out.push(w);
      }
    } else {
      const w = entryFor(block, title, source.defaultTime ?? null);
      if (w) out.push(w);
    }
  }

  let entries = out;
  if (source.excludeTitle) {
    const ex = new RegExp(source.excludeTitle, 'i');
    entries = entries.filter((w) => !ex.test(w.title));
  }
  for (const w of entries) {
    console.log(`[${source.slug}] kurs-block: "${w.title}" ${w.date} ${w.time ?? ''} ${w.spots != null ? `${w.spots} frei` : ''}`);
  }
  return entries;
}

/** Render a page in headless Chromium and return the HTML of the page and
 *  every iframe — the only way to see schedules that booking widgets
 *  (Acuity, Regiondo, …) draw client-side. Playwright is installed by the
 *  workflow; when it's absent (local runs) this quietly returns null. */
async function renderAllFrames(url, slug) {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
      // Widgets fetch their schedule after load — give them a moment.
      await page.waitForTimeout(8000);
      // Consent managers (Complianz on WordPress, Squarespace's own) hold
      // embedded booking scripts until cookies are accepted, so the widget
      // stays empty for a browser that never clicks. Accept, then wait for
      // the unblocked script to draw the schedule.
      const consentSelectors = [
        '#cmplz-btn-accept', '.cmplz-accept', '.cc-allow', '#onetrust-accept-btn-handler',
        'button:has-text("Alle akzeptieren")', 'button:has-text("Akzeptieren")',
        'button:has-text("Accept all")', 'button:has-text("Accept")',
      ];
      for (const selector of consentSelectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 400 })) {
            await button.click();
            console.log(`[${slug}] accepted cookie consent via ${selector}`);
            await page.waitForTimeout(8000);
            break;
          }
        } catch {
          /* selector not on this page — try the next */
        }
      }
      const parts = [];
      for (const frame of page.frames()) {
        try {
          parts.push(await frame.content());
        } catch {
          /* cross-origin frame that never loaded — skip */
        }
      }
      const combined = parts.join('\n');
      console.log(`[${slug}] headless render: ${page.frames().length} frames, ${combined.length} bytes`);
      return combined;
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.log(`[${slug}] headless render unavailable: ${err.message.split('\n')[0]}`);
    return null;
  }
}

/** Cross-source cache: page URL → its share image (null when the page has
 *  none), so booking pages shared by many sessions are fetched once. */
const shareImageCache = new Map();

/** Booking-platform pages whose share image would show the platform's own
 *  branding (or none at all) rather than the workshop — for those the
 *  host's own page decides. */
const PLATFORM_IMAGE_HOSTS = /acuityscheduling\.com|paypal\.com|eversports\.|\/\/checkout\./i;

/** Titles that name children mark the session for the feed's kids filter,
 *  German and English spellings alike. A source can widen this with its
 *  own `kidsTitle` pattern, or mark every session with `kids: true`. */
const KIDS_TITLE_RE = /\bkinder|\bkids?\b|famili|child|jugend/i;

async function shareImageFor(url) {
  if (shareImageCache.has(url)) return shareImageCache.get(url);
  let img = null;
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.8' },
    });
    if (r.ok) img = pageImage(await r.text(), r.url) ?? null;
  } catch {
    /* unreachable — the card falls back to the host photo */
  }
  shareImageCache.set(url, img);
  return img;
}

async function scrape(source) {
  const result = await scrapeSource(source);
  // Standing weekly classes a host runs as drop-ins without dated variants
  // (Empire of Dirt's kids Wednesdays) ride along as hand-curated recurring
  // entries — emitted every run while the source answers, and kept by the
  // fail-keep path (they carry the source's url) when it doesn't.
  for (const seed of source.seedRecurring ?? []) {
    (result.recurring ??= []).push({ slug: source.slug, sourceUrl: source.url, ...seed });
  }
  // Workshops a host runs only on inquiry — no published dates at all —
  // sit in the calendar's "on request" section. Same lifecycle as the
  // recurring seeds: emitted while the source answers, fail-kept when
  // it doesn't.
  for (const seed of source.seedOnRequest ?? []) {
    (result.onRequest ??= []).push({ slug: source.slug, sourceUrl: source.url, ...seed });
  }
  // Hard rule (Jirel): nothing on the site references Konfetti — no card
  // link AND no image loaded from their CDN. This runs before the image
  // backfill below, so a stripped image is refetched from the host's own
  // page instead.
  for (const w of result.workshops ?? []) {
    if (/gokonfetti\.com/i.test(w.url ?? '')) {
      w.request = true;
      w.url = source.infoUrl ?? source.url;
      console.log(`[${source.slug}] konfetti link replaced with request-to-book: "${w.title}" ${w.date}`);
    }
    if (/gokonfetti\.com/i.test(w.image ?? '')) {
      delete w.image;
      console.log(`[${source.slug}] konfetti-hosted image dropped: "${w.title}" ${w.date}`);
    }
  }
  // A card showing the actual workshop reads far better than a host
  // placeholder tile — where a mode found no image of its own, borrow the
  // booking page's share image (og:image), one fetch per distinct page.
  const missing = (result.workshops ?? []).filter((w) => !w.image);
  if (missing.length) {
    const byPage = new Map();
    for (const w of missing) {
      const page = PLATFORM_IMAGE_HOSTS.test(w.url) ? source.url.split('#')[0] : w.url;
      if (/\.(json|xml)(\?|#|$)/i.test(page)) continue;
      if (!byPage.has(page)) byPage.set(page, []);
      byPage.get(page).push(w);
    }
    for (const [page, list] of [...byPage].slice(0, 40)) {
      const img = await shareImageFor(page);
      if (img && !/gokonfetti\.com/i.test(img)) for (const w of list) w.image = img;
    }
  }
  // Last resort: a picture-bearing page of the host's own site named by
  // the source (for hosts whose booking page publishes no share image).
  const still = (result.workshops ?? []).filter((w) => !w.image);
  if (still.length && source.imagePage) {
    const img = await shareImageFor(source.imagePage);
    if (img && !/gokonfetti\.com/i.test(img)) for (const w of still) w.image = img;
  }
  const all = result.workshops ?? [];
  // Sessions designed for children get flagged for the feed's kids
  // filter — by their own title, a source-specific pattern, or a source
  // that is kids through and through.
  const kidsRe = source.kidsTitle
    ? new RegExp(`${KIDS_TITLE_RE.source}|${source.kidsTitle}`, 'i')
    : KIDS_TITLE_RE;
  for (const w of [...all, ...(result.recurring ?? [])]) {
    if (source.kids || kidsRe.test(`${w.title} ${w.titleEn ?? ''}`)) w.kids = true;
  }
  if (all.length) {
    console.log(`[${source.slug}] images: ${all.filter((w) => w.image).length}/${all.length} sessions have one`);
  }
  return result;
}

async function scrapeSource(source) {
  // Konfetti fetches its sitemap itself (with an XML accept — Squarespace
  // 406s the HTML-only one used for regular pages below).
  if (
    source.mode === 'konfetti' || source.mode === 'acuity-embeds' ||
    source.mode === 'luma' || source.mode === 'gcal-embed' ||
    source.mode === 'tickettailor' || source.mode === 'eversports' ||
    source.mode === 'rausgegangen' || source.mode === 'squarespace'
  ) {
    const found =
      source.mode === 'konfetti' ? await fromKonfetti(source)
      : source.mode === 'acuity-embeds' ? await fromAcuityEmbeds(source)
      : source.mode === 'gcal-embed' ? await fromGcalEmbed(source)
      : source.mode === 'tickettailor' ? await fromTicketTailor(source)
      : source.mode === 'eversports' ? await fromEversports(source)
      : source.mode === 'rausgegangen' ? await fromRausgegangen(source)
      : source.mode === 'squarespace' ? await fromSquarespace(source)
      : await fromLuma(source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] ${source.mode} sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  const res = await fetch(source.url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; TwiggliScheduleBot/1.0; +https://www.twiggli.com)',
      accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  console.log(`[${source.slug}] fetched ${html.length} bytes`);

  if (source.mode === 'shopify') {
    const found = fromShopify(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({ slug: source.slug, sourceUrl: source.url, ...w }));
    console.log(`[${source.slug}] shopify sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'shopify-cowlendar') {
    const found = await fromShopifyCowlendar(source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] cowlendar sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'titled-date-blocks') {
    const found = fromTitledDateBlocks(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] titled-date-blocks sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'dated-time-list') {
    const found = fromDatedTimeList(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] dated-time-list sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'checkout-links-de') {
    const found = await fromCheckoutLinks(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] checkout sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'wp-course-dates') {
    const found = fromWpCourseDates(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        // The parser's own district (Online courses) wins over the host's.
        ...(source.district ? { district: source.district } : {}),
        ...w,
      }));
    console.log(`[${source.slug}] wp-course-dates sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'kurs-blocks-de') {
    const found = fromKursBlocks(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] kurs-blocks sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'wix-service-list') {
    const found = await fromWixServiceList(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] wix-service-list sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'pipe-list-de') {
    const found = fromGermanPipeList(html, source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] pipe-list sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'acuity') {
    const found = await fromAcuity(source);
    const inRange = found
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] acuity sessions kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  if (source.mode === 'eventfrog') {
    // The page links each date's tickets to eventfrog.de; every Eventfrog
    // event also serves a machine-readable .ics feed with the exact
    // start/end, so no HTML parsing is needed per event.
    const links = [
      ...new Set(
        [...html.matchAll(/https?:\/\/eventfrog\.[a-z]+\/[^\s"'<>]*?-(\d{10,25})\.html/gi)].map(
          (m) => `${m[0]} ${m[1]}`,
        ),
      ),
    ];
    console.log(`[${source.slug}] eventfrog ticket links: ${links.length}`);
    const workshops = [];
    for (const pair of links) {
      const [pageUrl, id] = pair.split(' ');
      try {
        const ics = await fetch(`https://eventfrog.de/stream/de/event/${id}.ics`, {
          headers: { 'user-agent': UA },
        });
        if (!ics.ok) {
          console.log(`[${source.slug}] ics ${id}: HTTP ${ics.status}`);
          continue;
        }
        for (const ev of fromIcs(await ics.text(), pageUrl, source)) {
          if (ev.date < todayISO || ev.date > maxISO) continue;
          console.log(
            `[${source.slug}] eventfrog event: "${ev.title}" ${ev.date} ${ev.time} ${ev.duration ?? ''} ${ev.price ?? 'no price'}`,
          );
          workshops.push({
            slug: source.slug,
            sourceUrl: source.url,
            ...ev,
            ...(source.district ? { district: source.district } : {}),
          });
        }
      } catch (err) {
        console.log(`[${source.slug}] ics ${id}: ${err.message.split('\n')[0]}`);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    console.log(`[${source.slug}] eventfrog events kept: ${workshops.length}`);
    return { workshops, recurring: [] };
  }

  if (source.mode === 'wix-events-sitemap') {
    // `html` is the site's Wix Events sitemap: every event-detail page ever
    // published, past ones included. Each live page carries a schema.org
    // Event JSON-LD block with exact start/end, price and status, so the
    // whole schedule — new events included — reads without configuration.
    const pages = [...new Set([...html.matchAll(/<loc>\s*([^<\s]+?)\s*<\/loc>/gi)].map((m) => m[1]))]
      .filter((u) => /\/event-details-registration\//.test(u) && !/\/form$/.test(u));
    console.log(`[${source.slug}] event pages in sitemap: ${pages.length}`);
    const workshops = [];
    const seen = new Set();
    for (const pageUrl of pages) {
      // Many URLs embed their event's date — skip clearly past ones without
      // fetching. Undated URLs are fetched; the date filter below decides.
      const embedded = pageUrl.match(/(20\d{2}-\d{2}-\d{2})-\d{2}-\d{2}$/);
      if (embedded && embedded[1] < todayISO) continue;
      try {
        const pres = await fetch(pageUrl, {
          redirect: 'follow',
          headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
        });
        if (!pres.ok) {
          console.log(`[${source.slug}] ${pageUrl}: HTTP ${pres.status}`);
          continue;
        }
        for (const ev of fromJsonLd(await pres.text(), pageUrl)) {
          if (ev.date < todayISO || ev.date > maxISO) continue;
          // The same event can sit at more than one sitemap URL.
          const key = `${ev.title}|${ev.date}|${ev.time}`;
          if (seen.has(key)) continue;
          seen.add(key);
          console.log(`[${source.slug}] event: "${ev.title}" ${ev.date} ${ev.time} ${ev.duration ?? ''} ${ev.price ?? 'no price'}`);
          workshops.push({
            slug: source.slug,
            sourceUrl: source.url,
            ...ev,
            ...(source.district ? { district: source.district } : {}),
            url: pageUrl,
          });
        }
      } catch (err) {
        console.log(`[${source.slug}] ${pageUrl}: ${err.message.split('\n')[0]}`);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    console.log(`[${source.slug}] wix events kept: ${workshops.length}`);
    return { workshops, recurring: [] };
  }

  if (source.mode === 'recurring-de') {
    const recurring = fromGermanRecurring(html, source);
    for (const r of recurring) {
      console.log(
        `[${source.slug}] recurring: "${r.title}" ${r.weekdays.join('+')} ${r.time} ${r.duration ?? ''} ${r.price ?? 'no price'} ${r.district ?? ''}`,
      );
    }
    console.log(`[${source.slug}] recurring classes parsed: ${recurring.length}`);
    return { workshops: [], recurring };
  }

  if (source.mode === 'dates-de') {
    let dated = fromGermanDates(html, source);
    let rendered = null;
    if (!dated.length) {
      // The schedule is drawn client-side — render the page for real.
      rendered = await renderAllFrames(source.url, source.slug);
      if (rendered) dated = fromGermanDates(rendered, source);
    }
    for (const w of dated) {
      console.log(`[${source.slug}] dated: "${w.title}" ${w.date} ${w.time} ${w.price ?? 'no price'}`);
    }
    if (!dated.length) {
      // Describe how the page mentions dates at all, for parser tuning —
      // against the rendered content when we have it.
      const hay = rendered ?? html;
      const numeric = [...new Set([...hay.matchAll(/\b\d{1,2}\.\d{1,2}\.20\d{2}\b/g)].map((m) => m[0]))];
      console.log(`[${source.slug}] numeric dates in ${rendered ? 'rendered' : 'raw'} content: ${numeric.slice(0, 15).join(', ') || 'none'}`);
      for (const marker of ['Samstag', 'Sonntag', '2026', 'Datum', 'regiondo-dates', 'select']) {
        const i = hay.indexOf(marker);
        console.log(
          i < 0
            ? `[${source.slug}] marker "${marker}": absent`
            : `[${source.slug}] marker "${marker}": …${hay.slice(Math.max(0, i - 150), i + 250).replace(/\s+/g, ' ')}…`,
        );
      }
    }
    const inRange = dated
      .filter((w) => w.date >= todayISO && w.date <= maxISO)
      .map((w) => ({
        slug: source.slug,
        sourceUrl: source.url,
        ...w,
        ...(source.district && !w.district ? { district: source.district } : {}),
      }));
    console.log(`[${source.slug}] dated entries kept: ${inRange.length}`);
    return { workshops: inRange, recurring: [] };
  }

  const ld = fromJsonLd(html, source.url);
  console.log(`[${source.slug}] json-ld events: ${ld.length}`);
  let found = ld;
  if (!found.length) {
    const wix = await fromWixBookings(source, html);
    if (wix !== null) {
      console.log(`[${source.slug}] wix bookings events: ${wix.length}`);
      found = wix;
    }
  }
  if (!found.length) {
    found = fromTimeTags(html, source.url);
    console.log(`[${source.slug}] <time> elements: ${found.length}`);
  }
  if (!found.length) {
    // Diagnostics for the Actions log, so the parser can be tuned without
    // re-fetching by hand: platform markers, embedded frames/scripts, and
    // any ISO-looking dates in the page.
    const isoDates = [...new Set([...html.matchAll(/20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}/g)].map((m) => m[0]))];
    console.log(`[${source.slug}] no structured events; raw ISO datetimes in page: ${isoDates.slice(0, 20).join(', ') || 'none'}`);
    const markers = ['wix', 'squarespace', 'acuity', 'shopify', 'webflow', 'jimdo', 'wordpress', 'eversports', 'bookwhen', 'calendly', 'momoyoga']
      .filter((m) => new RegExp(m, 'i').test(html));
    console.log(`[${source.slug}] platform markers: ${markers.join(', ') || 'none'}`);
    const frames = [...html.matchAll(/<iframe[^>]*src=["']([^"']+)["']/gi)].map((m) => m[1]);
    console.log(`[${source.slug}] iframes: ${frames.slice(0, 10).join(' | ') || 'none'}`);
    const embeds = [...html.matchAll(/https?:\/\/[^\s"'<>]*(?:acuity|scheduling|booking|widget|embed)[^\s"'<>]*/gi)]
      .map((m) => m[0]);
    console.log(`[${source.slug}] scheduler-ish urls: ${[...new Set(embeds)].slice(0, 10).join(' | ') || 'none'}`);

    // The site embeds Acuity Scheduling (Squarespace's acuity component).
    // The widget is built client-side from an owner id in the page config;
    // Acuity's own schedule.php page is server-rendered, so probe it and
    // log candidate class/date pairs for the parser.
    const ownerCandidates = [
      // Squarespace's acuity block carries the account in data-user-id.
      ...[...html.matchAll(/data-user-id="(\d{4,12})"/g)].map((m) => m[1]),
      ...[...html.matchAll(/owner=(\d{4,12})/g)].map((m) => m[1]),
      ...[...html.matchAll(/"ownerI[dD]"\s*:\s*"?(\d{4,12})/g)].map((m) => m[1]),
    ];
    const typeIds = [...new Set([...html.matchAll(/data-appointment-type-id="(\d{4,12})"/g)].map((m) => m[1]))];
    console.log(`[${source.slug}] acuity appointment types on page: ${typeIds.join(', ') || 'none'}`);
    console.log(`[${source.slug}] acuity owner candidates: ${[...new Set(ownerCandidates)].join(', ') || 'none'}`);
    if (!ownerCandidates.length) {
      // Show how the page references acuity, to find where the account id
      // actually lives.
      let shown = 0;
      for (const m of html.matchAll(/acuity/gi)) {
        if (shown >= 5) break;
        const ctx = html.slice(Math.max(0, m.index - 120), m.index + 180).replace(/\s+/g, ' ');
        if (/styles\.css|visitor\.js|embed\.js/.test(ctx) && shown > 0) continue;
        console.log(`[${source.slug}] acuity context ${++shown}: …${ctx}…`);
      }
    }
    const owner = ownerCandidates[0];
    if (owner) {
      for (const base of ['https://app.squarespacescheduling.com', 'https://app.acuityscheduling.com']) {
        try {
          const typePart = typeIds.length ? `&appointmentType=${typeIds[0]}` : '';
          const probeUrl = `${base}/schedule.php?owner=${owner}${typePart}`;
          const probe = await fetch(probeUrl, { headers: { 'user-agent': UA, accept: 'text/html' }, redirect: 'follow' });
          const body = await probe.text();
          console.log(`[${source.slug}] probe ${probeUrl}: HTTP ${probe.status}, ${body.length} bytes`);
          const monthDates = [...body.matchAll(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*20\d{2})?/g)]
            .map((m) => m[0]);
          console.log(`[${source.slug}] probe month-name dates: ${[...new Set(monthDates)].slice(0, 15).join(' | ') || 'none'}`);
          const times = [...new Set([...body.matchAll(/\b\d{1,2}:\d{2}\s*(?:am|pm)?\b/gi)].map((m) => m[0]))];
          console.log(`[${source.slug}] probe times: ${times.slice(0, 15).join(' | ') || 'none'}`);
          const classMarkers = [...new Set([...body.matchAll(/class[-_ ]?(?:name|signup|list|time)[^"']{0,40}/gi)].map((m) => m[0]))];
          console.log(`[${source.slug}] probe class markers: ${classMarkers.slice(0, 10).join(' | ') || 'none'}`);
          const first = monthDates.length ? body.indexOf(monthDates[0]) : -1;
          if (first >= 0) {
            console.log(`[${source.slug}] probe context: …${body.slice(Math.max(0, first - 600), first + 300).replace(/\s+/g, ' ')}…`);
            break;
          }
        } catch (probeErr) {
          console.log(`[${source.slug}] probe failed: ${probeErr.message}`);
        }
      }
    }
  }

  const inWindow = found
    .filter((w) => w.date >= todayISO && w.date <= maxISO)
    .map((w) => ({ slug: source.slug, sourceUrl: source.url, ...w }));
  console.log(`[${source.slug}] kept ${inWindow.length} within ${KEEP_DAYS} days`);
  return { workshops: inWindow, recurring: [] };
}

// Local test hook: PARSE_TEST=<html file> runs only the German-recurring
// parser against that file and prints the result, touching nothing.
if (process.env.PARSE_TEST) {
  const html = readFileSync(process.env.PARSE_TEST, 'utf8');
  const testSource = {
    slug: 'test', url: 'test', title: 'Test Workshop', price: '€65',
    startMarker: 'UPCOMING WORKSHOPS', endMarker: 'JETZT TEILNEHMEN',
  };
  const fn =
    process.env.PARSE_TEST_MODE === 'dates-de'
      ? fromGermanDates
      : process.env.PARSE_TEST_MODE === 'pipe-list-de'
        ? fromGermanPipeList
      : process.env.PARSE_TEST_MODE === 'dated-time-list'
        ? fromDatedTimeList
      : process.env.PARSE_TEST_MODE === 'titled-date-blocks'
        ? fromTitledDateBlocks
      : process.env.PARSE_TEST_MODE === 'shopify'
        ? (h, src) => fromShopify(h, { ...src, url: 'https://shop.example/products.json' })
      : process.env.PARSE_TEST_MODE === 'json-ld'
        ? (h) => fromJsonLd(h, 'test')
        : process.env.PARSE_TEST_MODE === 'ics'
          ? (h, src) => fromIcs(h, 'test-page', src)
          : fromGermanRecurring;
  console.log(JSON.stringify(fn(html, testSource), null, 2));
  process.exit(0);
}

const previous = (() => {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    return { workshops: [], recurring: [], sources: [] };
  }
})();

const workshops = [];
const recurringOut = [];
const onRequestOut = [];
const statuses = [];
for (const source of SOURCES) {
  try {
    const found = await scrape(source);
    const total = found.workshops.length + found.recurring.length + (found.onRequest?.length ?? 0);
    if (total) {
      workshops.push(...found.workshops);
      recurringOut.push(...found.recurring);
      onRequestOut.push(...(found.onRequest ?? []));
      statuses.push({ slug: source.slug, url: source.url, status: 'ok', count: total });
    } else {
      throw new Error('no upcoming events parsed');
    }
  } catch (err) {
    // Keep this source's previous entries rather than blanking them.
    // Matched by sourceUrl, so one failing page never clobbers or
    // duplicates a sibling page's fresh results for the same host.
    const keptDated = (previous.workshops ?? []).filter((w) => w.sourceUrl === source.url && w.date >= todayISO);
    const keptRecurring = (previous.recurring ?? []).filter((r) => r.sourceUrl === source.url);
    const keptOnRequest = (previous.onRequest ?? []).filter((o) => o.sourceUrl === source.url);
    // Kept entries deserve the workshop's own picture too — their booking
    // pages are usually reachable even when the schedule parse fails
    // (Karen-Rose's seeds sat imageless for exactly this reason).
    for (const w of keptDated) {
      if (w.image || !w.url || PLATFORM_IMAGE_HOSTS.test(w.url) || /\.(json|xml)(\?|#|$)/i.test(w.url)) continue;
      const img =
        (await shareImageFor(w.url)) ??
        (source.imagePage ? await shareImageFor(source.imagePage) : null);
      if (img && !/gokonfetti\.com/i.test(img)) w.image = img;
    }
    console.log(
      `[${source.slug}] kept images: ${keptDated.filter((w) => w.image).length}/${keptDated.length}`,
    );
    workshops.push(...keptDated);
    recurringOut.push(...keptRecurring);
    onRequestOut.push(...keptOnRequest);
    statuses.push({
      slug: source.slug,
      url: source.url,
      status: `failed: ${err.message}`,
      count: keptDated.length + keptRecurring.length + keptOnRequest.length,
    });
    console.error(
      `[${source.slug}] FAILED (${err.message}) — kept ${keptDated.length + keptRecurring.length + keptOnRequest.length} previous entries`,
    );
  }
}

// Two source pages on one domain can surface the same events (e.g. a
// site-wide booking API) — dedupe before writing.
const seen = new Set();
const unique = workshops.filter((w) => {
  const key = `${w.slug}|${w.date}|${w.time}|${w.title}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
// Timeless sessions (all-day calendar entries) sort after timed ones.
unique.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '~').localeCompare(b.time ?? '~'));

const seenRec = new Set();
const uniqueRecurring = recurringOut.filter((r) => {
  const key = `${r.slug}|${r.title}|${r.time}|${[...r.weekdays].sort().join()}`;
  if (seenRec.has(key)) return false;
  seenRec.add(key);
  return true;
});

const seenReq = new Set();
const uniqueOnRequest = onRequestOut.filter((o) => {
  const key = `${o.slug}|${o.title}`;
  if (seenReq.has(key)) return false;
  seenReq.add(key);
  return true;
});

// Sessions that were sold out on the last scrape and are bookable again —
// the workflow turns this file into a notification issue so everyone who
// asked to be notified ("🔔 Notify me: …" mails) can be told the event is
// open for bookings again.
const wasSoldOut = new Map(
  (previous.workshops ?? [])
    .filter((w) => w.soldOut)
    .map((w) => [`${w.slug}|${w.date}|${w.time}|${w.title}`, w]),
);
const reopened = unique.filter(
  (w) => !w.soldOut && wasSoldOut.has(`${w.slug}|${w.date}|${w.time}|${w.title}`),
);
for (const w of reopened) {
  console.log(`REOPENED: "${w.title}" ${w.date} ${w.time ?? ''} (${w.slug})`);
}
writeFileSync('reopened-events.json', JSON.stringify(reopened, null, 2) + '\n');

writeFileSync(
  OUT,
  JSON.stringify(
    { updated: new Date().toISOString(), sources: statuses, recurring: uniqueRecurring, onRequest: uniqueOnRequest, workshops: unique },
    null,
    2,
  ) + '\n',
);
console.log(`wrote ${unique.length} workshops + ${uniqueRecurring.length} recurring + ${uniqueOnRequest.length} on-request to ${OUT}`);
