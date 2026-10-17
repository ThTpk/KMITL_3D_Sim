// Hand-built model of อาคารปฏิบัติการรวมวิศวกรรม 1 (OSM way 190886412).
// Surveyed 2026-10-17 from Google Maps satellite imagery (a long flat roof between the small gym and the car park)
// and Google Street View from the walks and roads all round it: the south face from the gym side, the north face
// from the car park, both ends. Photos were only looked at.
//
// x = east, z = south, y = up.
//   six storeys, 115 m long; white render
//   south face: deep balconies on every floor with thin sunshade louvres, strip windows behind, a row of white
//   fins standing up along the roof edge like a comb
//   north face: large dark-framed windows in pairs between panels of grey glass block, white floor bands
//   plain white end walls; an orange-trimmed stair block at the west end
import { Acc, F, onFace, facade, block, mats, meshes, BASE_MATS } from './kit.js';

export function buildEnglab1(owner) {
  const A = new Acc();
  const X0 = -565, X1 = -450, Z0 = 143, Z1 = 165, G = 4.4, FL = 3.8, N = 6, T = G + (N - 1) * FL;
  block(A, X0, X1, Z0, Z1, { G, FL, n: N, bay: 4.2 }, {
    s: { style: 'corridor', bandDepth: 1.3, bay: 4.2 },
    n: { style: 'band', bay: 6, mats: { glass: 'glassDark' } },
    e: { style: 'blank' }, w: { style: 'blank' },
  });
  // glass-block panels between the window pairs on the north face
  for (let x = X0 + 4; x < X1 - 3; x += 12) for (let k = 1; k < N; k++) onFace(A, 'glassBlock', F('z', Z0, -1), x, x + 3.4, G + (k - 1) * FL + 0.6, G + k * FL - 0.6, 0, 0.08);
  // sunshade louvres on the south balconies
  for (let k = 1; k < N; k++) for (let i = 0; i < 3; i++) onFace(A, 'band', F('z', Z1, 1), X0, X1, G + (k - 1) * FL + 2.2 + i * 0.35, G + (k - 1) * FL + 2.32 + i * 0.35, 1.15, 1.3);
  // comb of fins along the south roof edge
  for (let x = X0 + 1; x < X1; x += 1.6) A.box('band', x, x + 0.25, T, T + 2.4, Z1 - 1.6, Z1);
  // stair block at the west end with an orange edge
  block(A, X0 - 6, X0, 147, 160, { G, FL, n: N + 1, style: 'blank' }, { e: false });
  A.box('orange', X0 - 6.1, X0 - 5.6, 0, T + FL, 146.9, 160.1);

  const MAT = mats({ ...BASE_MATS, wall: '#f1f1ee', band: '#f8f8f6', glassDark: { color: '#3f4a52' }, glassBlock: { color: '#b9c1c3', roughness: 0.5 }, orange: '#e07a33' });
  return { meshes: meshes(A, MAT, owner), top: T + 2.4 };
}

export const ENGLAB1_OUTLINE = [[-571, 143], [-450, 143], [-450, 165], [-565, 165], [-565, 160], [-571, 160], [-571, 143]];
