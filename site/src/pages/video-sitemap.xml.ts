/** /video-sitemap.xml — every video page with its reel, in Google's video
 *  sitemap format, so the reels are found as videos (videoPages.ts). The
 *  sitemap index lists it (customSitemaps in astro.config.mjs). */
import { absolute } from '../data/seo.ts';
import { VIDEO_LANGS, videoCopy, videoHosts, videoHref } from '../data/videoPages.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET() {
  const urls: string[] = [];
  for (const lang of VIDEO_LANGS as ('en' | 'de')[]) {
    const t = videoCopy[lang];
    for (const { host, entry } of videoHosts(lang)) {
      urls.push(`  <url>
    <loc>${absolute(videoHref(lang, host.slug))}</loc>
    <video:video>
      <video:thumbnail_loc>${esc(absolute(host.poster ?? host.photo ?? '/img/logo.png'))}</video:thumbnail_loc>
      <video:title>${esc(`${host.specialty} — ${host.name}`)}</video:title>
      <video:description>${esc(t.description(host.name, host.specialty, host.studio))}</video:description>
      <video:content_loc>${esc(absolute(host.video!))}</video:content_loc>
      <video:duration>${entry.seconds}</video:duration>
      <video:publication_date>${entry.uploaded}T12:00:00+02:00</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
