// Copies MapLibre's own browser files into public/map/lib/ before a build or
// a dev server, so the calendar map can load them as they ship. MapLibre
// starts its worker from a file beside its main one; bundled, that file is
// lost, so the map loads these copies at run time instead (lib/daymap.ts).
// The version is whatever package.json installs; the copies are not
// committed (.gitignore).
import { cpSync, mkdirSync } from 'node:fs';

const from = new URL('../node_modules/maplibre-gl/dist/', import.meta.url);
const to = new URL('../public/map/lib/', import.meta.url);
mkdirSync(to, { recursive: true });
for (const file of ['maplibre-gl.mjs', 'maplibre-gl-shared.mjs', 'maplibre-gl-worker.mjs', 'maplibre-gl.css']) {
  cpSync(new URL(file, from), new URL(file, to));
}
console.log('maplibre-gl copied to public/map/lib/');
