/** Berlin postcodes → the neighbourhood (Ortsteil) guests know, for the
 *  host's studio address (dashboard Settings and "Where?", Jirel 18.11.26).
 *  Postcodes and Ortsteile don't line up exactly: a postcode that spans
 *  several gets the one most of it lies in, or the Bezirk where that is
 *  unclear. The host can always pick another one from the list. Ranges are
 *  inclusive and checked in order. */
const RANGES: [number, number, string][] = [
  [10115, 10117, 'Mitte'], [10119, 10119, 'Prenzlauer Berg'], [10178, 10179, 'Mitte'],
  [10243, 10249, 'Friedrichshain'],
  [10315, 10315, 'Friedrichsfelde'], [10317, 10317, 'Rummelsburg'], [10318, 10318, 'Karlshorst'], [10319, 10319, 'Friedrichsfelde'],
  [10365, 10369, 'Lichtenberg'],
  [10405, 10439, 'Prenzlauer Berg'],
  [10551, 10559, 'Moabit'], [10585, 10589, 'Charlottenburg'],
  [10623, 10629, 'Charlottenburg'],
  [10707, 10719, 'Wilmersdorf'], [10777, 10789, 'Schöneberg'],
  [10823, 10829, 'Schöneberg'],
  [10961, 10999, 'Kreuzberg'],
  [12043, 12059, 'Neukölln'],
  [12099, 12101, 'Tempelhof'], [12103, 12105, 'Tempelhof'], [12107, 12109, 'Mariendorf'],
  [12157, 12157, 'Schöneberg'], [12159, 12161, 'Friedenau'], [12163, 12169, 'Steglitz'],
  [12203, 12209, 'Lichterfelde'], [12247, 12249, 'Lankwitz'], [12277, 12279, 'Marienfelde'],
  [12305, 12309, 'Lichtenrade'],
  [12347, 12347, 'Britz'], [12349, 12351, 'Buckow'], [12353, 12353, 'Gropiusstadt'], [12355, 12357, 'Rudow'], [12359, 12359, 'Britz'],
  [12435, 12435, 'Alt-Treptow'], [12437, 12437, 'Baumschulenweg'], [12439, 12439, 'Niederschöneweide'],
  [12459, 12459, 'Oberschöneweide'], [12487, 12487, 'Johannisthal'], [12489, 12489, 'Adlershof'],
  [12524, 12524, 'Altglienicke'], [12526, 12526, 'Bohnsdorf'], [12527, 12527, 'Grünau'],
  [12555, 12559, 'Köpenick'], [12587, 12587, 'Friedrichshagen'], [12589, 12589, 'Rahnsdorf'],
  [12619, 12619, 'Hellersdorf'], [12621, 12623, 'Kaulsdorf'], [12627, 12629, 'Hellersdorf'],
  [12679, 12689, 'Marzahn'],
  [13051, 13059, 'Hohenschönhausen'], [13086, 13089, 'Weißensee'],
  [13125, 13125, 'Buch'], [13127, 13127, 'Französisch Buchholz'], [13129, 13129, 'Blankenburg'],
  [13156, 13156, 'Niederschönhausen'], [13158, 13159, 'Rosenthal'], [13187, 13189, 'Pankow'],
  [13347, 13353, 'Wedding'], [13355, 13359, 'Gesundbrunnen'],
  [13403, 13409, 'Reinickendorf'], [13435, 13435, 'Märkisches Viertel'], [13437, 13439, 'Wittenau'],
  [13465, 13465, 'Frohnau'], [13467, 13467, 'Hermsdorf'], [13469, 13469, 'Waidmannslust'],
  [13503, 13507, 'Tegel'], [13509, 13509, 'Borsigwalde'],
  [13581, 13599, 'Spandau'], [13627, 13629, 'Siemensstadt'],
  [14050, 14059, 'Westend'], [14089, 14089, 'Kladow'], [14109, 14109, 'Wannsee'], [14129, 14129, 'Nikolassee'],
  [14163, 14169, 'Zehlendorf'], [14193, 14193, 'Grunewald'], [14195, 14195, 'Dahlem'], [14197, 14197, 'Wilmersdorf'], [14199, 14199, 'Schmargendorf'],
];

/** The neighbourhood for a Berlin postcode, or '' when it isn't one we know. */
export const postcodeDistrict = (zip: string): string => {
  const n = Number(String(zip).trim());
  if (!/^\d{5}$/.test(String(zip).trim())) return '';
  return RANGES.find(([a, b]) => n >= a && n <= b)?.[2] ?? '';
};

/** Every neighbourhood above, A–Z, for the dropdown. */
export const berlinDistricts: string[] = [...new Set(RANGES.map((r) => r[2]))].sort((a, b) => a.localeCompare(b, 'de'));
