// @ts-check
import { defineConfig } from 'astro/config';

// Deployed to GitHub Pages at https://thejijoju.github.io/Twiggli-Website/ for now.
// Once www.twiggli.com is pointed at a real host, switch `site` back and drop `base`.
export default defineConfig({
  site: 'https://thejijoju.github.io',
  base: '/Twiggli-Website/',
  build: { format: 'directory' },
});
