// Hand-built model of สำนักหอสมุดกลาง อาคารเฉลิมพระเกียรติ (central library, OSM way 190697423), with the cream
// tower at its south-west corner that carries the KLLC (Lifelong Learning Center) sign and is part of the same
// OSM outline. Surveyed 2026-10-17 from Google Maps satellite imagery (the roofs, the skylight, the solar
// roof of the low west part; the OSM outline sits about 10 m east of the imagery) and Google Street View from
// the road along the north side (the brick north face, the name on the brick) and the road along the west side
// (the KLLC tower and its entrance). Photos were only looked at.
//
// x = east, z = south, y = up.
//   library x 66..110 / z -10..44: four tall storeys (KMITL building register LI-01) of red brick with recessed strip windows of grey glass, a white
//   roof edge, a long raised skylight on the roof
//   KLLC tower x 32..60 / z 30..62: seven storeys of cream render with full-height vertical fins and horizontal
//   louvre screens over the windows, a glazed ground-floor entrance on the west
//   a two-storey wing x 20..32 with solar panels on its roof
import { Acc, F, onFace, facade, block, solar, mats, meshes, BASE_MATS } from './kit.js';

export function buildLib(owner) {
  const A = new Acc();
  // library: brick with strip windows
  const ob = { G: 5.0, FL: 5.0, n: 4, bay: 5, style: 'band', mats: { wall: 'brick', band: 'white', pier: 'brick', glass: 'glass' } };
  const tl = block(A, 66, 110, -10, 44, ob, { w: { style: 'brick' } });
  A.box('glassRoof', 85, 97, tl, tl + 1.8, -2, 29);
  A.box('white', 84.6, 97.4, tl + 1.8, tl + 2.0, -2.4, 29.4);
  // KLLC tower: cream with fins and louvres
  const oc = { G: 4.6, FL: 3.7, n: 7, bay: 2.6, style: 'band', mats: { glass: 'louvre', pier: 'cream', band: 'white' } };
  const tc = block(A, 32, 60, 30, 62, { ...oc, mats: { ...oc.mats, wall: 'cream' } }, { e: false });
  onFace(A, 'glass', F('x', 32, -1), 36, 56, 0.3, 4.2, 0, 0.05);
  A.box('roof', 32.3, 59.7, tc, tc + 0.12, 30.3, 61.7);
  // low west wing with solar panels
  const tw = block(A, 20, 32, 33, 62, { G: 4.2, FL: 3.6, n: 2, bay: 4, mats: { wall: 'cream' } }, { e: false });
  solar(A, 20.5, 31.5, 34, 61, tw + 0.1);
  // link between the tower and the library
  block(A, 60, 66, 30, 44, { G: 4.4, FL: 3.9, n: 4, bay: 3, mats: { wall: 'cream' } }, { e: false, w: false });

  const MAT = mats({ ...BASE_MATS, brick: { color: '#a8513e' }, white: '#f1efea', cream: '#ece3cf', glass: { color: '#6c7780' },
    louvre: { color: '#c9c7c0', roughness: 0.6, metalness: 0.2 }, glassRoof: { color: '#9fb2bd', roughness: 0.25, metalness: 0.3 } });
  return { meshes: meshes(A, MAT, owner), top: tc + 1 };
}

export const LIB_OUTLINE = [[66, -10], [110, -10], [110, 44], [66, 44], [60, 44], [60, 62], [20, 62], [20, 33], [32, 33], [32, 30], [66, 30], [66, -10]];
