// Hand-built model of คณะเทคโนโลยีสารสนเทศ (Faculty of Information Technology, OSM way 314204881).
// Surveyed 2026-10-17 from Google Maps satellite imagery (the main block with solar rows, the east wing, the
// north hall, the curved entrance; tall roofs lean north in the imagery and were moved south) and Google Street
// View from the road along the south side (the south face over the trees, the west end from the gate) and the
// road along the east side (the curved glass entrance with its pool and steps, the east tower), plus the open
// ground-floor car park and the north road. Photos were only looked at.
//
// x = east, z = south, y = up.
//   main block x 302..368 / z -366..-320: seven storeys of white render with ribbon windows of blue glass; the
//   ground floor is an open car park behind square columns
//   east wing x 368..400 / z -368..-350: an eight-storey white tower, plain end walls with narrow slit windows,
//   glazed balconies stacked on its south face
//   curved blue-glass entrance hall at the south-east, three storeys behind tall round columns, under a deep flat
//   canopy; broad steps and a pool in front
//   north hall x 330..375 / z -392..-366: three storeys of white tile with few windows
import { Acc, F, onFace, facade, block, solar, mats, meshes, BASE_MATS } from './kit.js';

const G = 4.5, FL = 3.8;
const lv = (n) => G + (n - 1) * FL;

export function buildIt(owner) {
  const A = new Acc();
  const o = { G, FL, bay: 4.2, mats: { glass: 'glassBlue' } };
  // main block: open ground floor, seven storeys
  const X0 = 302, X1 = 368, Z0 = -366, Z1 = -320, T7 = lv(7);
  A.box('wall', X0, X1, G, T7, Z0, Z1);
  A.box('dark', X0 + 3, X1 - 3, 0, G, Z0 + 3, Z1 - 3);
  for (let x = X0 + 0.5; x < X1; x += 8.1) for (const z of [Z0 + 0.5, Z1 - 0.5]) A.box('wall', x - 0.4, x + 0.4, 0, G, z - 0.4, z + 0.4);
  for (const [f, a0, a1] of [[F('z', Z1, 1), X0, X1], [F('z', Z0, -1), X0, X1]]) facade(A, f, a0, a1, { ...o, y0: G, G: FL, n: 6 });
  for (const f of [F('x', X0, -1), F('x', X1, 1)]) {
    facade(A, f, Z0, Z1, { ...o, y0: G, G: FL, n: 6, style: 'blank' });
    for (let k = 0; k < 6; k++) onFace(A, 'glassBlue', f, Z0 + 8, Z1 - 8, G + k * FL + 1.2, G + k * FL + 3.1, 0, 0.04);
  }
  A.box('roof', X0 + 0.3, X1 - 0.3, T7, T7 + 0.12, Z0 + 0.3, Z1 - 0.3);
  solar(A, X0 + 2, X1 - 12, Z0 + 3, Z0 + 12, T7 + 0.1);
  solar(A, X0 + 2, X1 - 12, Z1 - 16, Z1 - 4, T7 + 0.1);
  // east tower
  const T8 = lv(8);
  block(A, 368, 400, -368, -350, { ...o, n: 8 }, {
    e: { style: 'blank' }, w: false,
    s: { style: 'band', bay: 4 },
  });
  for (const x of [372, 396]) onFace(A, 'glassBlue', F('x', 400, 1), -366 + (x - 372) * 0.6, -364 + (x - 372) * 0.6, 2, T8 - 2, 0, 0.04);
  for (let k = 1; k < 8; k++) onFace(A, 'glassBlue', F('z', -350, 1), 378, 392, lv(k) + 0.4, lv(k + 1) - 0.4, 0, 1.6);
  // curved glass entrance hall under a flat canopy
  const ring = Array.from({ length: 15 }, (_, i) => { const t = -0.87 + (i / 14) * 1.74; return [366 + 18 * Math.cos(t), -337 + 18 * Math.sin(t)]; });
  ring.push([366, -322], [366, -350]);
  A.prism('glassBlue', ring, 0.8, lv(3));
  A.prism('band', ring, lv(3), lv(3) + 1.0);
  A.box('band', 366, 392, lv(4) - 0.6, lv(4) + 0.4, -350, -322);
  for (const [x, z] of [[389, -342], [389, -334], [389, -326], [380, -323]]) A.cyl('band', x, z, 0.75, 0, lv(4) - 0.6, 12);
  for (let s = 0; s < 6; s++) A.box('paving', 368, 404 - s * 0.6, 0, 0.8 - s * 0.14, -322 + s * 0.5, -318 + s * 0.6);
  A.box('water', 392, 410, 0, 0.35, -326, -312);
  // north hall
  const tn = block(A, 330, 375, -392, -366, { G: 4.6, FL: 4.2, n: 3, style: 'punched', bay: 9 }, { s: false });
  A.box('roofLight', 330.3, 374.7, tn, tn + 0.15, -391.7, -366.3);

  const MAT = mats({ ...BASE_MATS, wall: '#eeeeeb', band: '#f6f6f3', glassBlue: { color: '#3d5d8f', roughness: 0.25, metalness: 0.3 },
    dark: '#3b3d40', water: { color: '#7a6a3e', roughness: 0.2 }, roofLight: '#d5d5d0' });
  return { meshes: meshes(A, MAT, owner), top: T8 + 1 };
}

export const IT_OUTLINE = [
  [302, -320], [392, -320], [392, -350], [400, -350], [400, -368], [375, -368], [375, -392], [330, -392], [330, -366],
  [302, -366], [302, -320],
];
