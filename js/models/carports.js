// Hand-built models of the covered car parks (OSM ลานจอดรถ, building=roof): ways 190886415, 190886419,
// 190886414, 190870221 and 190870222. Surveyed 2026-10-17 from Google Maps satellite imagery (the roof strips and
// their colours) and Google Street View from the roads beside them (steel roofs cantilevered from one row of posts
// down the middle). Photos were only looked at.
//
// x = east, z = south, y = up.
//   a row of steel posts down the long axis carrying beams that tilt up a little to both edges, under a
//   corrugated metal roof: dark grey by the integration building, blue by canteen C, blue-green by the measurement
//   and control department
import { Acc, mats, meshes, BASE_MATS } from './kit.js';

const SPEC = { ...BASE_MATS, steel: { color: '#5f666c', metalness: 0.5, roughness: 0.5 }, grey: { color: '#7c8287', metalness: 0.4, roughness: 0.6 },
  blue: { color: '#2f6fa8', metalness: 0.3, roughness: 0.6 }, teal: { color: '#4f8f95', metalness: 0.3, roughness: 0.6 } };

function carport(owner, x0, x1, z0, z1, roof) {
  const A = new Acc();
  const alongX = x1 - x0 >= z1 - z0, H = 2.7, up = 0.35;
  const L0 = alongX ? x0 : z0, L1 = alongX ? x1 : z1, W0 = alongX ? z0 : x0, W1 = alongX ? z1 : x1, c = (W0 + W1) / 2;
  const P = (l, w, y) => (alongX ? [l, y, w] : [w, y, l]);
  for (let l = L0 + 1; l <= L1 - 0.9; l += 5) {
    const [x, , z] = P(l, c, 0);
    A.box('steel', x - 0.12, x + 0.12, 0, H, z - 0.12, z + 0.12);
  }
  // butterfly roof: two sheets rising from the spine to the edges (drawn on both sides)
  for (const [a, b] of [[W0, c], [c, W1]]) {
    const ya = a === c ? H : H + up, yb = b === c ? H : H + up;
    const q = [P(L0, a, ya), P(L1, a, ya), P(L1, b, yb), P(L0, b, yb)];
    A.quad(roof, q[0], q[1], q[2], q[3]); A.quad(roof, q[3], q[2], q[1], q[0]);
  }
  const s0 = P(L0, c - 0.1, H - 0.25), s1 = P(L1, c + 0.1, H);
  A.box('steel', Math.min(s0[0], s1[0]), Math.max(s0[0], s1[0]), H - 0.25, H, Math.min(s0[2], s1[2]), Math.max(s0[2], s1[2]));
  return { meshes: meshes(A, mats(SPEC), owner), top: H + up };
}

export const buildCarportInteg = (o) => carport(o, -438, -368, 164, 174, 'grey');
export const buildCarportCanC1 = (o) => carport(o, -596, -555, 107.5, 117, 'blue');
export const buildCarportCanC2 = (o) => carport(o, -597, -561, 120.5, 128.5, 'blue');
export const buildCarportCtrl1 = (o) => carport(o, -352, -342, 41, 71, 'teal');
export const buildCarportCtrl2 = (o) => carport(o, -346, -311, 75, 80, 'grey');

const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
export const CARPORTINTEG_OUTLINE = rect(-438, -368, 164, 174);
export const CARPORTCANC1_OUTLINE = rect(-596, -555, 107.5, 117);
export const CARPORTCANC2_OUTLINE = rect(-597, -561, 120.5, 128.5);
export const CARPORTCTRL1_OUTLINE = rect(-352, -342, 41, 71);
export const CARPORTCTRL2_OUTLINE = rect(-346, -311, 75, 80);
