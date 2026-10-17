// Hand-built model of KOSEN-KMITL (OSM way 1322811831).
// Surveyed 2026-10-17 from Google Maps satellite imagery (two flat-roofed halls with a skylight strip, a dark
// glazed spine between them and the east wing, a row of slanted fins along the east face, a small annex on the
// west) and Google Street View from the main road to the south. The north and east sides face an open site with
// no Street View. Photos were only looked at.
//
// x = east, z = south, y = up.
//   four storeys of white render with deep dark-grey canopy slabs at each floor and a dark-grey base; strip
//   windows; thin raised lines on the walls in a circuit-board pattern
//   a taller glazed spine of dark navy glass x 545..555 running north-south, and along the east face a screen of
//   slanted dark vertical fins
import { Acc, F, onFace, block, mats, meshes, BASE_MATS } from './kit.js';

export function buildKosen(owner) {
  const A = new Acc();
  const o = { G: 4.6, FL: 4.2, n: 4, bay: 5, bandDepth: 1.4, mats: { band: 'grey', glass: 'glassDark' } };
  const t = block(A, 512, 545, -382, -343, o, { e: false });
  block(A, 518, 545, -343, -310, o, { e: false, n: false });
  A.box('glassRoof', 520, 538, t, t + 1.2, -378, -347);
  // dark glazed spine
  A.box('navy', 545, 555, 0, t + 3, -382, -310);
  for (let y = 4.6; y < t + 3; y += 4.2) A.box('grey', 544.8, 555.2, y - 0.2, y, -382.2, -309.8);
  // east wing with slanted fins
  block(A, 555, 566, -382, -310, { ...o, n: 4 }, { w: false, e: { style: 'blank' } });
  for (let z = -381; z < -311; z += 1.6) {
    A.quad('navy', [567.6, 0.5, z + 0.6], [567.6, 0.5, z], [567.6, t, z + 1.1], [567.6, t, z + 1.7]);
    A.quad('navy', [567.6, 0.5, z], [567.6, 0.5, z + 0.6], [567.6, t, z + 1.7], [567.6, t, z + 1.1]);
    A.box('navy', 566, 567.6, t - 0.3, t, z, z + 0.3);
  }
  // dark base and circuit lines on the south face
  A.box('grey', 511.8, 566.2, 0, 1.2, -382.2, -309.8);
  for (let i = 0; i < 6; i++) {
    const x = 522 + i * 4, y0 = 6 + (i % 3) * 1.4;
    onFace(A, 'line', F('z', -310, 1), x, x + 0.12, y0, y0 + 5, 0, 0.08);
    onFace(A, 'line', F('z', -310, 1), x, x + 3, y0 + 5, y0 + 5.12, 0, 0.08);
  }
  // west annex
  block(A, 506, 512, -352, -340, { G: 4, n: 1, bay: 3 }, { e: false });

  const MAT = mats({ ...BASE_MATS, wall: '#f1f1ee', grey: '#5d6166', navy: { color: '#26304a', roughness: 0.3, metalness: 0.3 },
    glassDark: { color: '#38434e' }, line: '#d8d8d4', glassRoof: { color: '#a8bcc6', roughness: 0.2, metalness: 0.3 } });
  return { meshes: meshes(A, MAT, owner), top: t + 3 };
}

export const KOSEN_OUTLINE = [[512, -382], [567.6, -382], [567.6, -310], [518, -310], [518, -340], [506, -340], [506, -352], [512, -352], [512, -382]];
