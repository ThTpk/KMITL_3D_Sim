// Hand-built model of the covered walkway along the railway (ทางเดินมีหลังคาริมทางรถไฟ): it runs along the south
// edge of the road beside the tracks, against the railway fence, from the main road at the level crossing (x -15)
// west to the crossing opposite the dormitories (x -440), about 425 m. Not in OpenStreetMap; the user pointed it
// out with a Street View link and it is stored in overrides.json (id -3, "ll").
// Surveyed 2026-10-18 from Google Street View on the road beside it (looking east and west along it, and at the
// station gate) and Google Maps satellite imagery (its line, both ends; it follows the slight skew of the tracks).
// Photos were only looked at.
//
// x = east, z = south, y = up.
//   a paved walk about 3 m wide; dark steel posts on small concrete bases along the road edge every 3 m, an edge
//   beam on them; a green corrugated barrel roof (a shallow arc) spanning from the posts to the fence
//   the railway fence along the south side: a cream wall about 1.1 m high with orange vertical bars above it
import { Acc, mats, meshes, BASE_MATS } from './kit.js';

const START = [-440, -64.1], END = [-15, -74.7];   // walkway line at its road (north) edge
const W = 3.0;                                       // road edge to the fence

const L = Math.hypot(END[0] - START[0], END[1] - START[1]);
const UX = (END[0] - START[0]) / L, UZ = (END[1] - START[1]) / L, NX = -UZ, NZ = UX;   // N points south, to the fence
const P = (s, t) => [START[0] + UX * s + NX * t, START[1] + UZ * s + NZ * t];
const ring = (s0, s1, t0, t1) => [P(s0, t0), P(s1, t0), P(s1, t1), P(s0, t1)];

// a quad facing up (or down), whatever order its corners come in
function face(A, m, a, b, c, d, up = true) {
  const ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
  if ((ny > 0) === up) A.quad(m, a, b, c, d); else A.quad(m, a, d, c, b);
}

export function buildRailWalk(owner) {
  const A = new Acc();
  A.prism('paving', ring(0, L, 0, W), 0, 0.12);

  // posts along the road edge, an edge beam, a beam along the fence
  const yB = 2.45, rise = 0.55;
  for (let s = 0.5; s <= L - 0.4; s += 3) {
    A.prism('concrete', ring(s - 0.18, s + 0.18, 0.05, 0.45), 0, 0.4);
    A.prism('post', ring(s - 0.06, s + 0.06, 0.19, 0.31), 0.4, yB);
    A.prism('post', ring(s - 0.04, s + 0.04, 0.25, W), yB - 0.12, yB - 0.04);       // rafter to the fence
  }
  A.prism('post', ring(0, L, 0.17, 0.33), yB - 0.18, yB);
  A.prism('post', ring(0, L, W - 0.12, W), yB - 0.18, yB);

  // barrel roof: a shallow arc across the walk, overhanging the road edge
  const t0 = -0.35, t1 = W + 0.15, n = 8;
  const ty = (t) => yB + rise * Math.sin((Math.PI * (t - t0)) / (t1 - t0));
  for (let i = 0; i < n; i++) {
    const ta = t0 + ((t1 - t0) * i) / n, tb = t0 + ((t1 - t0) * (i + 1)) / n;
    const v = (s, t) => { const [x, z] = P(s, t); return [x, ty(t), z]; };
    face(A, 'roofGreen', v(0, ta), v(L, ta), v(L, tb), v(0, tb), true);
    const w = (s, t) => { const [x, z] = P(s, t); return [x, ty(t) - 0.03, z]; };
    face(A, 'roofUnder', w(0, ta), w(L, ta), w(L, tb), w(0, tb), false);
  }
  // corrugation ribs across the roof
  for (let s = 0.25; s < L; s += 0.9) for (let i = 0; i < n; i++) {
    const ta = t0 + ((t1 - t0) * i) / n, tb = t0 + ((t1 - t0) * (i + 1)) / n;
    const v = (ss, t) => { const [x, z] = P(ss, t); return [x, ty(t) + 0.025, z]; };
    face(A, 'rib', v(s - 0.06, ta), v(s + 0.06, ta), v(s + 0.06, tb), v(s - 0.06, tb), true);
  }

  // railway fence: cream wall, orange bars above
  A.prism('fenceWall', ring(0, L, W, W + 0.2), 0, 1.1);
  A.prism('fenceWall', ring(0, L, W - 0.02, W + 0.22), 1.1, 1.18);
  A.prism('orange', ring(0, L, W + 0.06, W + 0.14), 2.2, 2.28);
  for (let s = 0.1; s < L; s += 0.3) A.prism('orange', ring(s, s + 0.05, W + 0.08, W + 0.12), 1.18, 2.2);
  for (let s = 0; s < L; s += 6) A.prism('fenceWall', ring(s - 0.2, s + 0.2, W - 0.05, W + 0.25), 0, 2.3);   // piers

  const MAT = mats({ ...BASE_MATS,
    paving: { color: '#b98d78', roughness: 1 }, concrete: { color: '#c9c5bc', roughness: 1 },
    post: { color: '#3b3a38', roughness: 0.6, metalness: 0.3 },
    roofGreen: { color: '#8fb59b', roughness: 0.55 }, rib: { color: '#7aa486', roughness: 0.6 },
    roofUnder: { color: '#c9cfc6', roughness: 0.8 },
    fenceWall: { color: '#ebe3cf', roughness: 0.95 }, orange: { color: '#d9622b', roughness: 0.6 } });
  return { meshes: meshes(A, MAT, owner), top: yB + rise };
}

export const RAILWALK_OUTLINE = [P(0, -0.35), P(L, -0.35), P(L, W + 0.25), P(0, W + 0.25), P(0, -0.35)];
