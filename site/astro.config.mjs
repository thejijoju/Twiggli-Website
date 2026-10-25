// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const previewSlugs = JSON.parse(readFileSync(new URL('./src/data/hosts/preview-slugs.json', import.meta.url), 'utf8'));
const removedHosts = JSON.parse(readFileSync(new URL('./src/data/removed-hosts.json', import.meta.url), 'utf8')).hosts;

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
