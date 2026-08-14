// @ts-check
import { defineConfig } from 'astro/config';

// TEMPORARY — parked back on the GitHub Pages URL so the site can be previewed
// before the domain is cut over. To go live on www.twiggli.com, restore:
//   site: 'https://www.twiggli.com',  (drop `base`)
// and put public/CNAME back with `www.twiggli.com`. See git history.
export default defineConfig({
  site: 'https://thejijoju.github.io',
  base: '/Twiggli-Website/',
  build: { format: 'directory' },
});
