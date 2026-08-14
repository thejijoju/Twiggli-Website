// @ts-check
import { defineConfig } from 'astro/config';

// Served from https://www.twiggli.com — the domain is live, pointed at GitHub
// Pages by public/CNAME plus the registrar's DNS. No `base`: the site sits at
// the domain root, not under a repository path. Do not reintroduce `base`
// while the domain is live; it makes every asset 404 at the root.
export default defineConfig({
  site: 'https://www.twiggli.com',
  build: { format: 'directory' },
});
