// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const previewSlugs = JSON.parse(readFileSync(new URL('./src/data/hosts/preview-slugs.json', import.meta.url), 'utf8'));
const removedHosts = JSON.parse(readFileSync(new URL('./src/data/removed-hosts.json', import.meta.url), 'utf8')).hosts;
const liveFeed = JSON.parse(readFileSync(new URL('./src/data/live-workshops.json', import.meta.url), 'utf8')).workshops ?? [];

const SITE = 'https://www.twiggli.com';
// Same list as LANGS in src/lib/url.ts; English has no prefix.
const LANG_PREFIXES = ['', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'tr'];

/* Hosts taken off the site (src/data/removed-hosts.json) leave URLs that
   are indexed and linked. GitHub Pages cannot send a 301, so after the
   build this writes a static stub at each old path, in every language:
   meta refresh, canonical, noindex and a JS location.replace, pointing at
   the same-language activity hub. The stubs are written after the sitemap
   integration has collected its pages, so they never reach the sitemap.
   A path that the build already produced (the host is back) is left alone. */
const removedHostRedirects = () => ({
  name: 'removed-host-redirects',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      let written = 0;
      for (const host of removedHosts) {
        for (const prefix of LANG_PREFIXES) {
          const lp = prefix ? `/${prefix}` : '';
          const target = `${lp}/workshops/${host.activity}/`;
          for (const sub of ['', ...host.workshops]) {
            const from = `${lp}/workshops/${host.activity}/${host.slug}/${sub ? `${sub}/` : ''}`;
            const file = new URL(`.${from}index.html`, dir);
            if (existsSync(file)) {
              logger.warn(`${from} is a real page again; no redirect written`);
              continue;
            }
            const abs = SITE + target;
            const html = `<!doctype html><html lang="${prefix || 'en'}"><head><meta charset="utf-8">`
              + `<title>Twiggli</title><meta name="robots" content="noindex">`
              + `<link rel="canonical" href="${abs}"><meta http-equiv="refresh" content="0; url=${abs}">`
              + `<script>location.replace(${JSON.stringify(target)})</script></head>`
              + `<body><a href="${target}">${abs}</a></body></html>\n`;
            mkdirSync(new URL('.', file), { recursive: true });
            writeFileSync(file, html);
            written++;
          }
        }
      }
      logger.info(`${written} redirect stubs for removed hosts`);
    },
  },
});

/* Class pages (/workshops/<activity>/<host>/<class>/) exist only while a
   class has upcoming dates, so once its last date passes the URL would 404
   — a steady trickle of dead pages that crawlers dislike. After the build,
   every class the workshop feed has ever listed whose page was not built
   this time gets a redirect stub to its host's page in the same language
   (noindex, canonical, meta refresh, JS). Hosts that are gone entirely are
   handled by removedHostRedirects. Same slug rule as slugify() in
   src/data/sessions.ts. */
const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '') || 'workshop';

const ACTIVITIES = ['ceramics', 'art', 'craft', 'food', 'photography', 'wellbeing', 'music', 'plants', 'dance', 'sport', 'textiles', 'wood', 'jewellery', 'printing', 'candles', 'writing', 'nature', 'drinks', 'kids', 'other'];

const expiredClassRedirects = () => ({
  name: 'expired-class-redirects',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const stub = (lang, target) => {
        const abs = SITE + target;
        return `<!doctype html><html lang="${lang || 'en'}"><head><meta charset="utf-8">`
          + `<title>Twiggli</title><meta name="robots" content="noindex">`
          + `<link rel="canonical" href="${abs}"><meta http-equiv="refresh" content="0; url=${abs}">`
          + `<script>location.replace(${JSON.stringify(target)})</script></head>`
          + `<body><a href="${target}">${abs}</a></body></html>\n`;
      };
      const classes = new Map();
      for (const w of liveFeed) {
        if (!w?.slug || !w?.title) continue;
        const key = slugify(w.title);
        classes.set(`${w.slug}|${key}`, { slug: w.slug, key });
      }
      let written = 0;
      for (const prefix of LANG_PREFIXES) {
        const lp = prefix ? `/${prefix}` : '';
        for (const { slug, key } of classes.values()) {
          // The host's page tells which activity folder it lives in.
          const activity = ACTIVITIES.find((a) => existsSync(new URL(`.${lp}/workshops/${a}/${slug}/index.html`, dir)));
          if (!activity) continue;
          const from = `${lp}/workshops/${activity}/${slug}/${key}/`;
          const file = new URL(`.${from}index.html`, dir);
          if (existsSync(file)) continue;
          mkdirSync(new URL('.', file), { recursive: true });
          writeFileSync(file, stub(prefix, `${lp}/workshops/${activity}/${slug}/`));
          written++;
        }
      }
      logger.info(`${written} redirect stubs for classes without upcoming dates`);
    },
  },
});

// Served from https://www.twiggli.com — the domain is live, pointed at GitHub
// Pages by public/CNAME plus the registrar's DNS. No `base`: the site sits at
// the domain root, not under a repository path. Do not reintroduce `base`
// while the domain is live; it makes every asset 404 at the root.
export default defineConfig({
  site: 'https://www.twiggli.com',
  build: { format: 'directory' },

  // Google finds the happening-today calendar (and its daily-refreshed
  // Event markup) through this sitemap; payment/redirect stubs stay out.
  integrations: [
    removedHostRedirects(),
    expiredClassRedirects(),
    sitemap({
      // Preview hosts' pages (src/data/hosts/preview.ts) are for the host
      // to look at by direct link before going live — never in the sitemap.
      filter: (page) =>
        !previewSlugs.some((slug) => page.includes(`/workshops/`) && page.endsWith(`/${slug}/`)) &&
        !/paymentcanceled|stripe-connect|\/checkout\/$|\/preview\/|newsletter\/|corporate\/$|hosts\/$|\/de\/about\/$|\.com\/ueber-uns\/$|\/de\/voucher\/$|\.com\/gutschein\/$/.test(page),
      // The pages built from the workshop feed change with every daily
      // rebuild — a date passes, a new one lands — so they say so; the
      // legal pages and the rest carry no lastmod rather than a false one.
      serialize: (item) => {
        if (/\/(workshops|happening-today)\/|twiggli\.com\/([a-z]{2}\/)?$/.test(item.url)) {
          item.lastmod = new Date().toISOString();
        }
        return item;
      },
    }),
  ],

  // The corporate pitch lived at /corporate/, then /hosts/, and now
  // /corporatebookings/. Both old URLs are live and may be linked or
  // indexed, so they forward rather than 404. GitHub Pages serves static
  // files only — Astro emits a meta-refresh stub with a canonical link for
  // these, not a 301.
  redirects: {
    '/corporate/': '/corporatebookings/',
    '/de/corporate/': '/de/corporatebookings/',
    '/hosts/': '/corporatebookings/',
    '/de/hosts/': '/de/corporatebookings/',
    // The about page's German slug is translated (lib/url.ts LOCAL_SLUGS);
    // the browser-language redirect only swaps the prefix, so these catch
    // the untranslated pairings.
    '/de/about/': '/de/ueber-uns/',
    '/ueber-uns/': '/about/',
    // The voucher page's German slug is translated too.
    '/de/voucher/': '/de/gutschein/',
    '/gutschein/': '/de/gutschein/',
  },
});
