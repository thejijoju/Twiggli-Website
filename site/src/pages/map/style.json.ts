import type { APIRoute } from 'astro';
import { layers, namedFlavor } from '@protomaps/basemaps';

/* The calendar map's look, built once at build time from Protomaps' light
   basemap and served beside the tiles (public/map/), so the page never
   ships the style generator. Warmed towards paper, with soft greens and a
   pale blue, so the workshop markers carry the colour. Street names and
   places in German everywhere — they are Berlin's names. The tile source
   and font URLs are filled in by the page, which knows its own origin. */
const flavor = {
  ...namedFlavor('light'),
  background: '#f4f2ee',
  earth: '#f4f2ee',
  park_a: '#d9ead1',
  park_b: '#d3e6c9',
  wood_a: '#d3e6c9',
  wood_b: '#cde2c2',
  scrub_a: '#dde9d4',
  scrub_b: '#d8e6cf',
  water: '#bed8ee',
  buildings: '#e9e5de',
};

// Icon layers need a sprite sheet, which this map does without.
const withoutIcons = layers('protomaps', flavor, { lang: 'de' })
  .filter((layer) => !['pois', 'roads_shields', 'roads_oneway', 'address_label'].includes(layer.id))
  .map((layer) => {
    if (layer.type !== 'symbol' || !layer.layout?.['icon-image']) return layer;
    const { ['icon-image']: _icon, ...layout } = layer.layout;
    return { ...layer, layout };
  });

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      version: 8,
      glyphs: '/map/fonts/{fontstack}/{range}.pbf',
      sources: {
        protomaps: {
          type: 'vector',
          url: 'pmtiles:///map/berlin.pmtiles',
          attribution:
            '<a href="https://protomaps.com" target="_blank" rel="noopener">Protomaps</a> © <a href="https://openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        },
      },
      layers: withoutIcons,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
