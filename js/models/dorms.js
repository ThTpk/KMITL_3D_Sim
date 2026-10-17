// Hand-built models of the student dormitories west of the engineering faculty.
// Surveyed 2026-10-17 from Google Maps satellite imagery (plans, solar panels on the tall blocks, red tiled hipped
// roofs on the low ones; the tall roofs lean about 6 m north in the imagery and were moved south), photos on
// Google Maps (the tall blocks), and Google Street View from the road along the east side and the road to the
// south. Street View here predates the four tall blocks, which follow the photos and the imagery.
// Photos were only looked at.
//
// x = east, z = south, y = up.
//   หอพักนักศึกษา อาคาร 9-12: long ten-storey slabs of white render, the open corridors on one long side drawn
//   as continuous white parapet bands, rooms with windows and AC units on the other; orange-brick end walls and
//   stair towers rising above the roof; solar panels over the roof
//   KMITL Dormitory and KMITL Kosen Dormitory: five storeys, white walls with a balcony per room screened in
//   orange pierced brick, brick end walls, red tiled hipped roofs
import { Acc, F, onFace, facade, block, solar, hip, mats, meshes, BASE_MATS } from './kit.js';

const MAT_SPEC = { ...BASE_MATS, wall: '#f0efea', band: '#f7f6f2', brick: { color: '#c2643e' }, screen: { color: '#c46a42', roughness: 0.95 },
  tile: { color: '#b4523a', roughness: 0.9 }, glass: { color: '#71828a' } };

// ten-storey slab; long axis along z when alongZ. corridor side faces `corr` ('e', 'w', 'n' or 's')
function tall(owner, x0, x1, z0, z1, corr) {
  const A = new Acc();
  const G = 4.2, FL = 3.2, N = 10, T = G + (N - 1) * FL;
  const along = z1 - z0 > x1 - x0;
  const o = { G, FL, n: N, bay: 3.6, style: 'punched' };
  const ends = { style: 'brick', mats: { brick: 'brick' } };
  const faces = along ? { n: ends, s: ends, [corr]: { style: 'corridor', bay: 3.6 } } : { e: ends, w: ends, [corr]: { style: 'corridor', bay: 3.6 } };
  block(A, x0, x1, z0, z1, o, faces);
  // brick stair towers at both ends, above the roof
  if (along) for (const z of [z0 - 1, z1 - 5]) block(A, x0 + 4, x1 - 4, z, z + 6, { G, FL, n: N + 1, style: 'brick', mats: { wall: 'brick' } });
  else for (const x of [x0 - 1, x1 - 5]) block(A, x, x + 6, z0 + 4, z1 - 4, { G, FL, n: N + 1, style: 'brick', mats: { wall: 'brick' } });
  solar(A, x0 + 1, x1 - 1, z0 + (along ? 6 : 1), z1 - (along ? 6 : 1), T + 0.1);
  return { meshes: meshes(A, mats(MAT_SPEC), owner), top: T + FL + 1 };
}

// five-storey block with brick balcony screens and a hipped roof (long axis along x)
function low(owner, x0, x1, z0, z1) {
  const A = new Acc();
  const G = 3.6, FL = 3.0, N = 5, T = G + (N - 1) * FL;
  block(A, x0, x1, z0, z1, { G, FL, n: N, bay: 3.8, style: 'punched' }, { e: { style: 'brick' }, w: { style: 'brick' } });
  for (const f of [F('z', z0, -1), F('z', z1, 1)])
    for (let x = x0 + 2; x < x1 - 3; x += 3.8)
      for (let k = 1; k < N; k++) onFace(A, 'screen', f, x, x + 1.6, G + (k - 1) * FL + 0.4, G + (k - 1) * FL + 1.6, 0, 1.2);
  hip(A, 'tile', x0, x1, z0, z1, T + 0.9, 3.4, 1.0);
  return { meshes: meshes(A, mats(MAT_SPEC), owner), top: T + 4.3 };
}

export const buildDorm9 = (owner) => tall(owner, -344, -327, -160, -103, 'e');
export const buildDorm10 = (owner) => tall(owner, -366, -349, -160, -103, 'e');
export const buildDorm11 = (owner) => tall(owner, -389, -372, -160, -103, 'e');
export const buildDorm12 = (owner) => tall(owner, -388, -337, -97, -80, 'n');
export const buildDormK = (owner) => low(owner, -383, -328, -184, -168);
export const buildDormKs = (owner) => low(owner, -383, -328, -214, -198);

const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
export const DORM9_OUTLINE = rect(-344, -327, -161, -102);
export const DORM10_OUTLINE = rect(-366, -349, -161, -102);
export const DORM11_OUTLINE = rect(-389, -372, -161, -102);
export const DORM12_OUTLINE = rect(-389, -336, -97, -80);
export const DORMK_OUTLINE = rect(-383, -328, -184, -168);
export const DORMKS_OUTLINE = rect(-383, -328, -214, -198);
