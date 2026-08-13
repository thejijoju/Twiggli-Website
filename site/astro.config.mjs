// @ts-check
import { defineConfig } from 'astro/config';

// Served from https://www.twiggli.com — the domain is pointed at GitHub Pages
// by public/CNAME plus the DNS records at the registrar. No `base`: the site
// sits at the domain root, not under a repository path.
export default defineConfig({
  site: 'https://www.twiggli.com',
  build: { format: 'directory' },
});
