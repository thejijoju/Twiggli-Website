/** Small stand-ins for every reel's poster, so a tile never shows an empty
 *  grey box while its picture or video is still on the way:
 *
 *  - public/video/thumbs/<name>.jpg: a 240px square crop, for the round
 *    activity bubbles on the home page (a tenth of the poster's weight);
 *  - src/data/posterLqip.json: a 12px-wide blur of each poster as a data
 *    URI, painted behind the tile from the first byte of the page.
 *
 *  Run after adding or changing a poster: `node scripts/poster-thumbs.mjs`.
 *  Needs ffmpeg. Tiles without an entry fall back to the plain poster. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const root = new URL('..', import.meta.url).pathname;
const videoDir = join(root, 'public/video');
const thumbDir = join(videoDir, 'thumbs');
mkdirSync(thumbDir, { recursive: true });
const tmp = join(tmpdir(), `lqip-${process.pid}.jpg`);

const ff = (...args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args]);
const lqip = {};
for (const file of readdirSync(videoDir).filter((f) => f.endsWith('-poster.jpg')).sort()) {
  const name = file.replace(/-poster\.jpg$/, '');
  const src = join(videoDir, file);
  ff('-i', src, '-vf', 'crop=min(iw\\,ih):min(iw\\,ih),scale=240:240', '-q:v', '5', join(thumbDir, `${name}.jpg`));
  ff('-i', src, '-vf', 'scale=12:-2', '-q:v', '8', tmp);
  lqip[`/video/${file}`] = `data:image/jpeg;base64,${readFileSync(tmp).toString('base64')}`;
}
rmSync(tmp, { force: true });
writeFileSync(join(root, 'src/data/posterLqip.json'), JSON.stringify(lqip, null, 1) + '\n');
console.log(`${Object.keys(lqip).length} posters`);
