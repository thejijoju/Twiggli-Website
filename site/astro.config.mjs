// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
    sitemap({
      filter: (page) =>
        !/paymentcanceled|stripe-connect|corporate\/$|hosts\/$/.test(page),
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
  },
});
