// Hand-built model of อาคารนวัตกรรมการเรียนรู้ (OSM way 1561993799).
// Surveyed 2026-10-17 from Google Maps satellite imagery (the flat-roofed block and the open steel lattice roof of
// the portico north-east of it) and Google Street View from the car parks on its west and east sides and the
// covered walks under the portico. Photos were only looked at.
//
// x = east, z = south, y = up.
//   a four-storey white block with strip windows of dark glass and a brick corner
//   a tall portico of square white columns, about 14 m high, carrying an open lattice of white steel beams with a
//   small glazed pyramid; broad steps up to the block
import { Acc, F, onFace, block, mats, meshes, BASE_MATS } from './kit.js';

export function buildInnov(owner) {
  const A = new Acc();
  const t = block(A, 261, 292, -262, -218, { G: 4.4, FL: 3.8, n: 4, bay: 4, mats: { glass: 'glassDark' } }, { e: { style: 'band', spandrel: null } });
  A.box('brick', 261, 266, 0, t + 0.8, -262, -257);
  A.box('roof', 261.3, 291.7, t, t + 0.12, -261.7, -218.3);
  // portico: columns on a 6 m grid and an open lattice of beams
  const PH = 14;
  const cols = [];
  for (let x = 270; x <= 306; x += 6) for (let z = -276; z <= -262; z += 7) cols.push([x, z]);
  for (let x = 294; x <= 306; x += 6) for (let z = -255; z <= -232; z += 7.6) cols.push([x, z]);
  for (const [x, z] of cols) A.box('white', x - 0.45, x + 0.45, 0, PH, z - 0.45, z + 0.45);
  for (let z = -276; z <= -262; z += 3.5) A.box('white', 269.5, 306.5, PH, PH + 0.6, z - 0.2, z + 0.2);
  for (let x = 270; x <= 306; x += 3) A.box('white', x - 0.2, x + 0.2, PH, PH + 0.6, -276.5, -261.5);
  for (let z = -262; z <= -232; z += 3.8) A.box('white', 293.5, 306.5, PH, PH + 0.6, z - 0.2, z + 0.2);
  for (const x of [294, 300, 306]) A.box('white', x - 0.2, x + 0.2, PH, PH + 0.6, -262, -231.5);
  A.prism('glassRoof', [[284, -272], [292, -272], [292, -266], [284, -266]], PH + 0.6, PH + 0.7);
  for (let s = 0; s < 5; s++) A.box('paving', 292, 296 + s * 0.8, 0, 0.75 - s * 0.15, -256, -232);
  A.box('paving', 268, 307, 0, 0.12, -277, -261);

  const MAT = mats({ ...BASE_MATS, wall: '#f1f0ec', white: '#f7f7f5', glassDark: { color: '#3f4a52' }, brick: { color: '#ad533e' },
    glassRoof: { color: '#a8bcc6', roughness: 0.2, metalness: 0.3 } });
  return { meshes: meshes(A, MAT, owner), top: PH + 0.7 };
}

export const INNOV_OUTLINE = [[261, -262], [270, -262], [270, -276.5], [306.5, -276.5], [306.5, -231.5], [292, -231.5], [292, -218], [261, -218], [261, -262]];
