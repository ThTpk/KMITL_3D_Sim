// Hand-built model of อาคารนวัตกรรมการเรียนรู้ (OSM way 1561993799) on ถนนฉลองกรุง, with its forecourt and fountain,
// the faculty sign walls on the road and the footbridge over the road in front of it.
// Rebuilt 2026-10-18 from Google Street View on ถนนฉลองกรุง (the north face and the canopy from in front, the west
// face and the footbridge from the west, looking up at the tower from below) and Google Maps satellite imagery
// (the plan: the tower roof, the stepped terraces, the lattice canopy, the forecourt with its fountain; tall roofs
// lean north in the imagery by about 0.155 m per metre of height, so the tower roof was moved south about 7 m to
// its base). The campus trekker panoramas are older than the tower and only show the car park it replaced.
// The road in front was moved north in overrides.json "_roadfix" (OSM drew it about 5 m too far south, so the
// old model's portico ended up on it). Photos were only looked at.
//
// x = east, z = south, y = up.
//   tower       x 255..273, z -271..-255: eleven storeys (a tall glazed ground floor, then ten of 3.8 m), each
//               floor a projecting white slab; deep white vertical fins in front of dark glass on all faces
//   terraces    lower wings stepping down to the east (x 273..291) and the south (z -255..-238), white slab edges
//               and glass railings on every step
//   steps       a broad white stepped plaza south of the building, x 261..297, z -238..-221, rising north
//   canopy      a steel lattice sweeping from the top of the tower's east face down to a flat wedge-shaped tip
//               about 7.5 m up at x 310, on a raking strut: chords along it, diagonal braces, cross ribs
//   forecourt   paving with a triangle pattern and a round fountain east of the canopy, a hedge along the road
//   signs       two dark sign walls with the faculty name on the road fence
//   footbridge  a covered steel footbridge over ถนนฉลองกรุง at x 262..265, stairs down both footpaths
import { Acc, F, onFace, mats, meshes, BASE_MATS, tube, lathe } from './kit.js';

const G = 4.5, FL = 3.8, N = 11;
const lvY = (k) => (k === 0 ? 0 : G + (k - 1) * FL);         // floor level of storey k (0 = ground)
const TOP = lvY(N);                                          // 42.5

// a stack of floors over x0..x1 / z0..z1: dark glass, projecting white slabs, fins on the faces listed
function stack(A, x0, x1, z0, z1, n, { fins = 'nsew', slab = 1.0, rail = false } = {}) {
  const top = lvY(n);
  A.box('glassDark', x0 + 0.4, x1 - 0.4, 0, top, z0 + 0.4, z1 - 0.4);
  for (let k = 1; k <= n; k++) {
    const y = lvY(k);
    A.box('white', x0 - slab, x1 + slab, y - 0.35, y, z0 - slab, z1 + slab);
    A.box('white', x0 - slab + 0.25, x1 + slab - 0.25, y - 0.55, y - 0.35, z0 - slab + 0.25, z1 + slab - 0.25);   // chamfer
  }
  // fins between the slabs
  const fin = (f, a0, a1) => {
    for (let a = a0 + 0.6; a < a1 - 0.4; a += 1.2)
      for (let k = 1; k < n; k++) onFace(A, 'white', f, a, a + 0.3, lvY(k), lvY(k + 1) - 0.55, 0, slab - 0.1);
  };
  if (fins.includes('n')) fin(F('z', z0 + 0.4, -1), x0, x1);
  if (fins.includes('s')) fin(F('z', z1 - 0.4, 1), x0, x1);
  if (fins.includes('w')) fin(F('x', x0 + 0.4, -1), z0, z1);
  if (fins.includes('e')) fin(F('x', x1 - 0.4, 1), z0, z1);
  if (rail) {                                                   // glass balustrade round the roof terrace
    for (const [a, b, c, d] of [[x0 - slab, x1 + slab, z0 - slab, z0 - slab + 0.06], [x0 - slab, x1 + slab, z1 + slab - 0.06, z1 + slab],
      [x0 - slab, x0 - slab + 0.06, z0 - slab, z1 + slab], [x1 + slab - 0.06, x1 + slab, z0 - slab, z1 + slab]])
      A.box('railGlass', a, b, top, top + 1.1, c, d);
  }
  return top;
}

export function buildInnov(owner) {
  const A = new Acc();

  // ---- tower ----
  const TX0 = 255, TX1 = 273, TZ0 = -271, TZ1 = -255;
  A.box('glassDark', TX0 + 1.2, TX1 - 1.2, 0, G, TZ0 + 1.2, TZ1 - 1.2);                  // recessed lobby
  for (let x = TX0 + 0.6; x <= TX1 - 0.6; x += (TX1 - TX0 - 1.2) / 4)
    for (const z of [TZ0 + 0.6, TZ1 - 0.6]) A.box('white', x - 0.35, x + 0.35, 0, G, z - 0.35, z + 0.35);
  for (let k = 1; k <= N; k++) {
    const y = lvY(k);
    A.box('white', TX0 - 1.0, TX1 + 1.0, y - 0.35, y, TZ0 - 1.0, TZ1 + 1.0);
    A.box('white', TX0 - 0.75, TX1 + 0.75, y - 0.55, y - 0.35, TZ0 - 0.75, TZ1 + 0.75);
  }
  A.box('glassDark', TX0 + 0.4, TX1 - 0.4, G, TOP, TZ0 + 0.4, TZ1 - 0.4);
  for (const [f, a0, a1] of [[F('z', TZ0 + 0.4, -1), TX0, TX1], [F('z', TZ1 - 0.4, 1), TX0, TX1], [F('x', TX0 + 0.4, -1), TZ0, TZ1]])
    for (let a = a0 + 0.6; a < a1 - 0.4; a += 1.2)
      for (let k = 1; k < N; k++) onFace(A, 'white', f, a, a + 0.3, lvY(k), lvY(k + 1) - 0.55, 0, 1.0);
  // solid white north-west corner, roof parapet, plant
  A.box('white', TX0 - 0.2, TX0 + 2.2, G, TOP + 1.2, TZ0 - 0.2, TZ0 + 2.2);
  A.box('white', TX0 - 1.0, TX1 + 1.0, TOP, TOP + 1.2, TZ0 - 1.0, TZ0 - 0.75);
  A.box('white', TX0 - 1.0, TX1 + 1.0, TOP, TOP + 1.2, TZ1 + 0.75, TZ1 + 1.0);
  A.box('white', TX0 - 1.0, TX0 - 0.75, TOP, TOP + 1.2, TZ0 - 1.0, TZ1 + 1.0);
  A.box('white', TX1 + 0.75, TX1 + 1.0, TOP, TOP + 1.2, TZ0 - 1.0, TZ1 + 1.0);
  for (let x = TX0 + 2; x < TX1 - 2; x += 2.6) for (let z = TZ0 + 2; z < TZ1 - 6; z += 2.6) A.box('plant', x, x + 1.6, TOP, TOP + 0.9, z, z + 1.6);
  A.box('plant', TX0 + 3, TX0 + 9, TOP, TOP + 3.2, TZ1 - 5, TZ1 - 1);                       // lift motor room

  // ---- stepped terraces: east and south ----
  [[273, 277.5, 6], [277.5, 282, 5], [282, 286.5, 4], [286.5, 291, 3]].forEach(([x0, x1, n]) => stack(A, x0, x1, -268, -246, n, { fins: 'n', slab: 0.9, rail: true }));
  [[-255, -250.5, 8], [-250.5, -246, 6], [-246, -242, 4], [-242, -238, 2]].forEach(([z0, z1, n]) => stack(A, 255, 273, z0, z1, n, { fins: 'w', slab: 0.9, rail: true }));
  A.box('glassDark', 273, 291, 0, G, -246, -238);
  A.box('white', 272.5, 291.5, G - 0.4, G, -246.5, -237.5);

  // ---- broad white steps south of the building, rising north ----
  for (let s = 0; s < 10; s++) A.box('steps', 261, 297, 0, 0.45 * (s + 1), -238, -221 - s * 1.7);
  for (let s = 0; s < 10; s++) A.box('stepEdge', 261, 297, 0.45 * (s + 1) - 0.06, 0.45 * (s + 1) + 0.01, -221 - s * 1.7 - 0.06, -221 - s * 1.7);

  // ---- lattice canopy: from the top of the tower's east face to a low tip at x 310 ----
  {
    const NU = 14;
    const X = (u) => 273 + 37 * u;
    const Y = (u) => 7.5 + (TOP + 1 - 7.5) * (1 - u) ** 2;
    const ZN = (u) => -272 + 6 * u, ZS = (u) => -247 - 1 * u;
    const P = (u, v) => [X(u), Y(u) + 0.8 * Math.sin(Math.PI * v), ZN(u) + (ZS(u) - ZN(u)) * v];
    for (let i = 0; i < NU; i++) {
      const u0 = i / NU, u1 = (i + 1) / NU;
      for (const v of [0, 0.5, 1]) tube(A, 'steel', P(u0, v), P(u1, v), 0.2, 0.2, 6);           // chords
      for (const [va, vb] of [[0, 0.5], [0.5, 1]]) {                                               // diagonal braces
        tube(A, 'steel', P(u0, va), P(u1, vb), 0.1, 0.1, 5);
        tube(A, 'steel', P(u0, vb), P(u1, va), 0.1, 0.1, 5);
      }
      for (let j = 0; j < 4; j++) tube(A, 'steel', P(u0, j / 4), P(u0, (j + 1) / 4), 0.13, 0.13, 5);   // cross ribs
    }
    for (let j = 0; j < 4; j++) tube(A, 'steel', P(1, j / 4), P(1, (j + 1) / 4), 0.13, 0.13, 5);
    // flat wedge-shaped plate at the tip, dark underneath
    const yT = Y(1) + 0.4;
    A.prism('tipTop', [[302, ZN(0.8)], [314, -263.5], [314, -249], [302, ZS(0.8)]], yT, yT + 0.35);
    A.prism('tipUnder', [[302.2, ZN(0.8) + 0.3], [313.6, -263.2], [313.6, -249.3], [302.2, ZS(0.8) - 0.3]], yT - 0.5, yT);
    // raking strut under the tip, two columns under the middle
    tube(A, 'steel', [299, 0, -256], [307, yT - 0.5, -256], 0.45, 0.35, 8);
    for (const z of [-266, -250]) tube(A, 'steel', [292, lvY(3), z], [292, Y(0.5), z], 0.35, 0.35, 8);
  }

  // ---- forecourt: paving with a triangle pattern, a round fountain, a hedge along the road ----
  A.box('paving', 291, 362, 0, 0.1, -273, -244);
  {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let x = 312; x < 345; x += 2.4) for (let z = -270; z < -247; z += 2.4) {
      if (rnd() < 0.5) continue;
      const up = rnd() < 0.5;
      A.prism('pavingDark', up ? [[x, z + 2.2], [x + 2.2, z + 2.2], [x + 1.1, z]] : [[x, z], [x + 2.2, z], [x + 1.1, z + 2.2]], 0.1, 0.12);
    }
  }
  lathe(A, 'paving', 348.3, -252.3, [[4.3, 0.1], [4.3, 0.55], [3.9, 0.55], [3.9, 0.3], [0, 0.3]], 32);
  lathe(A, 'fountainWater', 348.3, -252.3, [[3.85, 0.3], [3.85, 0.42], [0, 0.42]], 32);
  lathe(A, 'paving', 348.3, -252.3, [[1.6, 0.42], [1.6, 0.8], [0, 0.8]], 24);
  lathe(A, 'fountainWater', 348.3, -252.3, [[1.4, 0.8], [1.4, 0.84], [0, 0.84]], 24);
  lathe(A, 'paving', 348.3, -252.3, [[0.25, 0.84], [0.18, 1.6], [0.35, 1.7], [0, 1.75]], 10);
  A.box('hedge', 286, 352, 0, 1.1, -276.5, -273.5);

  // ---- faculty sign walls on the road fence ----
  for (const [x0, x1] of [[286, 300], [316, 330]]) {
    A.box('sign', x0, x1, 0, 1.9, -277.2, -276.6);
    onFace(A, 'gold', F('z', -277.2, -1), x0 + 1.8, x1 - 1.0, 0.75, 1.15, 0, 0.03);
    lathe(A, 'gold', x0 + 0.9, -277.25, [[0.45, 0.5], [0.45, 1.4]], 16, 1, 0.05);           // emblem
  }

  const MAT = mats({ ...BASE_MATS, white: '#f4f4f1', glassDark: { color: '#6f7d86', roughness: 0.25 },
    railGlass: { color: '#9fb4bd', roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.45 },
    plant: '#c9cbcb', steps: '#e9e7e1', stepEdge: '#cfcac0', steel: { color: '#c3c8cc', roughness: 0.45, metalness: 0.5 },
    tipTop: '#d8dadb', tipUnder: '#4a4d50', paving: { color: '#c9c4ba', roughness: 0.95 }, pavingDark: { color: '#8f8b84', roughness: 0.95 },
    fountainWater: { color: '#5f9fb3', roughness: 0.1, metalness: 0.1 }, hedge: { color: '#4f7a3a', roughness: 1 },
    sign: { color: '#2d2a27', roughness: 0.6 }, gold: { color: '#c9a24a', roughness: 0.35, metalness: 0.6 } });
  return { meshes: meshes(A, MAT, owner), top: TOP + 3.2 };
}

export const INNOV_OUTLINE = [[255, -272], [300, -272], [314, -264], [314, -248], [297, -246], [297, -221], [261, -221], [261, -237], [255, -237], [255, -272]];

// ---- footbridge over ถนนฉลองกรุง in front of the building (overrides.json id -4) ----
// a steel deck about 5.8 m up from the north footpath to the south one, with white side panels and a light roof on
// square posts; stairs run down along each footpath, westwards on both sides
export function buildFootbridge(owner) {
  const A = new Acc();
  const X0 = 262.5, X1 = 265, ZN = -303, ZS = -275, D = 5.8;
  A.box('deck', X0, X1, D - 0.5, D, ZN, ZS);
  for (const x of [X0, X1 - 0.08]) A.box('panel', x, x + 0.08, D, D + 1.2, ZN, ZS);
  for (const z of [ZN, (ZN + ZS) / 2, ZS]) for (const x of [X0 + 0.2, X1 - 0.2]) A.box('post', x - 0.18, x + 0.18, 0, D, z - 0.18, z + 0.18);
  for (let z = ZN; z <= ZS; z += 3.5) for (const x of [X0, X1]) A.box('post', x - 0.05, x + 0.05, D, D + 2.6, z - 0.05, z + 0.05);
  A.box('roof', X0 - 0.3, X1 + 0.3, D + 2.6, D + 2.75, ZN - 0.3, ZS + 0.3);
  // stairs: from each end of the deck down westwards along the footpath
  for (const [z0, z1] of [[ZN - 2.2, ZN], [ZS, ZS + 2.2]]) {
    A.box('deck', X0 - 1.5, X1, D - 0.5, D, z0, z1);                                     // landing
    const n = 20, run = 0.28;
    for (let s = 0; s < n; s++) {
      const y = D - ((s + 1) * D) / n, xa = X0 - 1.5 - (s + 1) * run;
      A.box('deck', xa, xa + run, y, y + 0.18, z0, z1);
    }
    const xe = X0 - 1.5 - n * run;
    A.box('post', xe - 0.15, xe + 0.15, 0, 0.9, (z0 + z1) / 2 - 0.15, (z0 + z1) / 2 + 0.15);
    for (const z of [z0, z1]) tube(A, 'rail', [X0 - 1.5, D + 1.0, z], [xe, 1.0, z], 0.04, 0.04, 5);
  }
  const MAT = mats({ ...BASE_MATS, deck: { color: '#b8b6b0', roughness: 0.9 }, panel: '#eeeeea', post: { color: '#9ea2a5', roughness: 0.6, metalness: 0.3 },
    roof: '#d4d6d6', rail: { color: '#8d9194', roughness: 0.5, metalness: 0.4 } });
  return { meshes: meshes(A, MAT, owner), top: D + 2.75 };
}

export const FOOTBRIDGE_OUTLINE = [[251.5, -305.2], [265.3, -305.2], [265.3, -272.8], [251.5, -272.8], [251.5, -305.2]];
