/** Which hosts the home page may introduce with a picture (the maker wall
 *  and the faces in the activity circles), and which picture.
 *
 *  Only pictures we know the host gave us or agreed to are used, going by
 *  the notes in content.ts:
 *
 *  - `photo`: the square photo, where content.ts records the host's consent.
 *  - `reel`:  the poster of the host's own reel — footage the host made and
 *             sent us ("X's own", "hers", "supplied by her" in the reel
 *             notes in content.ts). A frame of their own work, not a
 *             portrait, but theirs.
 *
 *  Hosts whose square photo came from elsewhere (the design export, their
 *  website without a recorded OK) and hosts whose reel we cut from stills
 *  of unrecorded origin are left out until they send a portrait. */
export const makerPictures: Record<string, 'photo' | 'reel'> = {
  'norbert-bildhauerei': 'photo', // "Photos from his site cyclop-art.de, with his consent"
  // Reels noted as the host's own footage.
  alessia: 'reel', olivia: 'reel', helka: 'reel', lama: 'reel', blauhaus: 'reel',
  loam: 'reel', pausify: 'reel', lomu: 'reel', pastamadre: 'reel', munio: 'reel',
  petitejungle: 'reel', 'anna-malerlebnisse': 'reel', chelti: 'reel', 'beat-etage': 'reel',
  'monk-garden': 'reel', bumerang: 'reel', druckrausch: 'reel', daisuki: 'reel', dirt: 'reel',
  arcoiris: 'reel', mampe: 'reel', 'smell-lab': 'reel', yurika: 'reel', sabine: 'reel',
  dominik: 'reel', ana: 'reel', 'loom-lab': 'reel', tufttuft: 'reel', simone: 'reel',
  tania: 'reel', drawingwalks: 'reel', evelyn: 'reel', qian: 'reel', kohfink: 'reel',
  rebeca: 'reel', nina: 'reel', redrum: 'reel', sarah: 'reel', celina: 'reel', anne: 'reel',
  violaine: 'reel', angelo: 'reel', nicole: 'reel', pia: 'reel', 'galleria-lucia': 'reel',
  'ceramic-kingdom': 'reel', 'karen-rose': 'reel', sina: 'reel',
};
