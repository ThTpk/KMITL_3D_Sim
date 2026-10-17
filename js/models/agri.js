// Hand-built model of อาคารเจ้าคุณทหาร คณะเทคโนโลยีการเกษตร (OSM relation 2573865).
// Surveyed 2026-10-17 from Google Maps satellite imagery (four square courtyard wings turned 45°, the solar-panelled
// block on the west side, the links north and south of the central lawn) and Google Street View from the roads
// around it: the west road, the north car park, the south car park and road, the south-east corner.
// The east side faces a canal behind trees and is modelled like the rest. Photos were only looked at.
//
// x = east, z = south, y = up.
//   four diamond wings (square rings about 43 m a side, 12 m deep, around planted courtyards) at the corners of a
//   central lawn; the two on the west have four storeys, the two on the east five
//   cream render with deep white floor bands and ribbon windows between piers on the outer faces, open
//   walkways with solid parapets on the courtyard faces, red-brick stair towers crossed by the white bands at
//   the corners of each wing; a low plinth all round
//   a four-storey block with a solar roof on the west side, and solar-panelled links north and south of the lawn
import { Acc, F, place, facade, block, solar, mats, meshes, BASE_MATS } from './kit.js';

const Y0 = 0.6, G = 4.0, FL = 3.7;
const top = (n) => Y0 + G + (n - 1) * FL;
const WINGS = [
  // centre x, z, side, storeys
  [276, 108, 42, 4],
  [280, 193, 42, 4],
  [353, 99, 44, 5],
  [357, 196, 44, 5],
];
const W = 12;

function diamond(L, n) {
  const A = new Acc(), h = L / 2, i = h - W;
  const o = { y0: Y0, G, FL, n, bay: 4.2 };
  A.box('wall', -h, h, Y0, top(n), -h, -i); A.box('wall', -h, h, Y0, top(n), i, h);
  A.box('wall', -h, -i, Y0, top(n), -i, i); A.box('wall', i, h, Y0, top(n), -i, i);
  A.box('plinth', -h - 0.4, h + 0.4, 0, Y0, -h - 0.4, h + 0.4);
  // outer faces: ribbon windows, leaving the corners for the stair towers
  const sk = { skip: [[-h, -h + 6], [h - 6, h]] };
  facade(A, F('z', -h, -1), -h, h, { ...o, ...sk }); facade(A, F('z', h, 1), -h, h, { ...o, ...sk });
  facade(A, F('x', -h, -1), -h, h, { ...o, ...sk }); facade(A, F('x', h, 1), -h, h, { ...o, ...sk });
  // courtyard faces: open walkways
  const c = { ...o, style: 'corridor', bay: 3.6 };
  facade(A, F('z', -i, 1), -i, i, c); facade(A, F('z', i, -1), -i, i, c);
  facade(A, F('x', -i, 1), -i, i, c); facade(A, F('x', i, -1), -i, i, c);
  // brick stair towers at the four corners, a little proud of the walls and above the roof
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const cx = sx * (h - 2.7), cz = sz * (h - 2.7);
    block(A, cx - 3.3, cx + 3.3, cz - 3.3, cz + 3.3, { y0: Y0, G, FL, n: n + 1, style: 'brick', mats: { wall: 'brick' } });
  }
  // roof and a courtyard lawn
  A.box('roof', -h + 0.3, h - 0.3, top(n), top(n) + 0.15, -h + 0.3, -i - 0.3);
  A.box('roof', -h + 0.3, h - 0.3, top(n), top(n) + 0.15, i + 0.3, h - 0.3);
  A.box('lawn', -i, i, 0, 0.08, -i, i);
  solar(A, -h + 7, h - 7, -h + 1, -i - 1, top(n) + 0.15);
  solar(A, -h + 7, h - 7, i + 1, h - 1, top(n) + 0.15);
  return A;
}

export function buildAgri(owner) {
  const A = new Acc();
  for (const [x, z, L, n] of WINGS) place(A, diamond(L, n), x, z, Math.PI / 4);
  // west block with a solar roof
  const o4 = { y0: Y0, G, FL, n: 4, bay: 4.2 };
  A.box('plinth', 239.5, 268.5, 0, Y0, 133.5, 171.5);
  const t4 = block(A, 240, 268, 134, 171, o4, { e: { style: 'corridor' } });
  solar(A, 241, 267, 135, 170, t4 + 0.15);
  for (const z of [134, 165]) block(A, 236.5, 242, z, z + 6, { ...o4, n: 5, style: 'brick', mats: { wall: 'brick' } });
  // links north and south of the lawn, three storeys, solar roofs
  const o3 = { y0: Y0, G, FL, n: 3, bay: 4 };
  const tn = block(A, 296, 324, 97, 112, o3, { e: false, w: false });
  solar(A, 297, 323, 98, 111, tn + 0.15);
  const ts = block(A, 300, 327, 185, 200, o3, { e: false, w: false });
  solar(A, 301, 326, 186, 199, ts + 0.15);

  const MAT = mats({ ...BASE_MATS, wall: '#e8e1d0', band: '#f4f1ea', plinth: '#b9b4aa', lawn: { color: '#6f8f4a', roughness: 1 } });
  return { meshes: meshes(A, MAT, owner), top: top(6) };
}

export const AGRI_OUTLINE = [
  [358.57, 71.39], [360.89, 68.19], [384.97, 91.4], [382.35, 94.59], [382.35, 99.52], [385.26, 102.43], [358.28, 131.71],
  [360.31, 164.21], [388.73, 190.31], [385.83, 192.92], [385.83, 198.43], [389.02, 201.33], [366.4, 225.99],
  [363.5, 223.37], [357.99, 223.95], [355.67, 226.86], [325.21, 198.43], [301.43, 199.89], [281.7, 221.35],
  [250.67, 193.5], [268.65, 172.61], [268.68, 168.78], [261.41, 168.85], [261.41, 171.16], [241.06, 170.86],
  [239.94, 134.33], [260.05, 134.17], [260.17, 135.75], [265.75, 135.78], [265.73, 131.27], [247.19, 111.12],
  [276.2, 79.5], [298.24, 99.81], [320.86, 99.52], [349.86, 68.48], [352.48, 71.68], [358.57, 71.39],
];
