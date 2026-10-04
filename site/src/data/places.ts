/** Where the neighbourhoods the calendar names are, as [longitude, latitude]
 *  — for the calendar map. Each is the neighbourhood's centre, never a
 *  venue: the map says which Kiez a workshop is in, and the address comes
 *  with the booking, so it is booked through us. A district missing here
 *  simply has no marker; "Online" never has one. */
export const places: Record<string, [number, number]> = {
  Mitte: [13.405, 52.521],
  Kreuzberg: [13.412, 52.497],
  Lichtenberg: [13.497, 52.514],
  Neukölln: [13.436, 52.479],
  Friedrichshain: [13.455, 52.515],
  'Prenzlauer Berg': [13.424, 52.540],
  Schöneberg: [13.354, 52.484],
  Spandau: [13.200, 52.536],
  Wedding: [13.356, 52.550],
  Moabit: [13.340, 52.527],
  Gesundbrunnen: [13.386, 52.555],
  Blankenburg: [13.444, 52.592],
  Charlottenburg: [13.304, 52.516],
  Friedenau: [13.329, 52.470],
  Treptow: [13.465, 52.488],
  Potsdam: [13.062, 52.398],
  Kaulsdorf: [13.588, 52.510],
  Zehlendorf: [13.259, 52.434],
  'Berliner Wald': [13.225, 52.470],
  'Marzahn-Hellersdorf': [13.565, 52.545],
  Köpenick: [13.577, 52.445],
  Friedrichshagen: [13.624, 52.449],
  Pankow: [13.404, 52.569],
  Weißensee: [13.466, 52.553],
  Steglitz: [13.320, 52.457],
  Tempelhof: [13.385, 52.466],
  Reinickendorf: [13.336, 52.589],
  Wilmersdorf: [13.310, 52.487],
};
