// Hand-built model of the KMITL Sky Walk: the covered footbridges that join up across the railway and Chalong Krung
// Road. It is not in OpenStreetMap; its route is traced on satellite imagery (Esri World Imagery zoom 19 and the
// user's Google Maps screenshots, 2026-10-20) and the overrides.json entries (ids -6 and -7) only carry the names.
// Surveyed 2026-10-19 from the user's photo of the north stair and the bridge's west side, and from the KMITL Virtual
// Tour (สำนักบริหารข้อมูลดิจิทัล 1-8, on the deck: the "SKY WALK" boards, the orange frames, the lift tower). Photos
// were only looked at; everything here is procedural.
//
// x = east, z = south, y = up.
//   one cross-section for the whole network: deck 6.8 m up and 4 m wide, roof 5.2 m wide (the white band on the
//   satellite photo is 4.5-5.5 m, a little more than one lane pair of Chalong Krung Road)
//   west walk: a grey steel truss under the deck, a stainless rail each side, a row of white round columns along each
//   side, alternately upright and leaning, carrying a shallow metal roof on red-orange beams
//   big orange "KMITL" letters on the west side over the railway fence by the north end
//   north end (corrected 2026-10-19 from the user's photos taken from the bank across the road): the bridge stops at the
//   railway fence and does not cross the road; a landing on one square grey column under an arched roof on white posts,
//   an open steel stair down westward and a covered stair (pitched roof, solid white side) down eastward, both running
//   along the fence
//   route: north-south from z -66 to z 11.5 (x -123), east to x -91, south-east to x -66, then straight east over
//   Chalong Krung Road into the west face of the library (x 20, z 34.6)
import * as THREE from 'three';
import { Acc, tube, mats, meshes, BASE_MATS } from './kit.js';
import { canvasTex } from './ecc.js';

const YD = 6.8, W = 2.0, HR = 3.2;                                              // deck height, half width, roof height over the deck
const ROUTE = [[-123, -66], [-123, 11.5], [-91, 11.5], [-66, 34.6], [20, 34.6]];
// stretches (metres from the start of each segment) with no piers: the railway and the roads
const NO_PIERS = [[[0, 58]], [], [], [[66, 82]]];

const MAT_SPEC = { ...BASE_MATS, deck: '#9a9ea2', steel: { color: '#6d7378', metalness: 0.5, roughness: 0.5 }, rail: { color: '#d7dadc', metalness: 0.7, roughness: 0.3 },
  column: '#f2f2f0', red: '#d8462a', roof: { color: '#7b7f82', metalness: 0.4, roughness: 0.5 }, pier: '#cfcbc2', stairs: { color: '#7d8287', metalness: 0.4, roughness: 0.6 },
  white: { color: '#f1f2f0', roughness: 0.5, side: 2 }, soffit: { color: '#c9ccce', side: 2 }, greyPier: '#a7abae' };

// One straight span of covered walk from a to b. e0/e1 run the deck and roof on past the ends so the corners close;
// skip lists the stretches with no piers. style 'orange': white columns and red beams under a flat metal roof;
// 'white': white steel trusses for sides and an arched white roof whose crown rises and falls along the length.
function span(A, a, b, style, e0, e1, skip) {
  const [ax, az] = a, [bx, bz] = b;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
  const P = (t, o, y) => [ax + ux * t + nx * o, y, az + uz * t + nz * o];
  const q = (m, t0, t1, o0, o1, y0, y1) => {                                    // a slab between two offsets, t0..t1 along
    A.quad(m, P(t0, o0, y1), P(t0, o1, y1), P(t1, o1, y1), P(t1, o0, y1));
    A.quad(m, P(t1, o0, y0), P(t1, o1, y0), P(t0, o1, y0), P(t0, o0, y0));
    for (const o of [o0, o1]) { A.quad(m, P(t0, o, y0), P(t1, o, y0), P(t1, o, y1), P(t0, o, y1)); A.quad(m, P(t1, o, y1), P(t1, o, y0), P(t0, o, y0), P(t0, o, y1)); }
  };
  q('deck', -e0, L + e1, -W, W, YD - 0.25, YD);
  q('steel', -e0, L + e1, -W + 0.2, W - 0.2, YD - 1.1, YD - 0.9);                // bottom chord of the truss
  const piers = [];
  for (let t = 6; t <= L - 2; t += 13) if (!skip.some(([s0, s1]) => t > s0 && t < s1)) piers.push(t);
  if (style === 'orange') {
    for (let t = 0; t < L; t += 2.4) {                                          // truss diagonals under the deck
      for (const o of [-W + 0.2, W - 0.2]) tube(A, 'steel', P(t, o, YD - 1.0), P(Math.min(L, t + 2.4), o, YD - 0.25), 0.05, 0.05, 5);
    }
    for (const o of [-W + 0.05, W - 0.05]) {
      q('rail', 0, L, o - 0.03, o + 0.03, YD + 1.05, YD + 1.12);
      for (let t = 0.5; t < L; t += 1.2) q('rail', t, t + 0.05, o - 0.03, o + 0.03, YD, YD + 1.1);
    }
    // white columns along both sides, upright and leaning in turn; red-orange beams and a shallow roof
    let i = 0;
    for (let t = 1.0; t < L - 0.5; t += 2.6, i++) {
      for (const o of [-W - 0.15, W + 0.15]) {
        if (i % 2) tube(A, 'column', P(t - 1.0, o, YD), P(t + 1.0, o, YD + HR), 0.17, 0.17, 8);
        else tube(A, 'column', P(t, o, YD), P(t, o, YD + HR), 0.17, 0.17, 8);
      }
      if (i % 2 === 0) q('red', t - 0.12, t + 0.12, -W - 0.4, W + 0.4, YD + HR - 0.35, YD + HR);
    }
    for (const o of [-W - 0.3, W + 0.3]) q('red', -e0, L + e1, o - 0.1, o + 0.1, YD + HR - 0.45, YD + HR);
    q('roof', -e0 - 0.3, L + e1 + 0.3, -W - 0.6, W + 0.6, YD + HR, YD + HR + 0.12);
    for (const t of piers) { const p = P(t, 0, 0); A.box('pier', p[0] - 0.4, p[0] + 0.4, 0, YD - 1.1, p[2] - 0.4, p[2] + 0.4); }
    return;
  }
  for (const o of [-W + 0.05, W - 0.05]) {
    q('white', -e0, L + e1, o - 0.08, o + 0.08, YD - 1.2, YD - 1.0);              // bottom and top chords
    q('white', -e0, L + e1, o - 0.08, o + 0.08, YD + 2.0, YD + 2.2);
    for (let t = 0; t < L; t += 2.5) {
      q('white', t - 0.07, t + 0.07, o - 0.07, o + 0.07, YD - 1.2, YD + 2.2);
      tube(A, 'white', P(t, o, YD - 1.0), P(Math.min(L, t + 2.5), o, YD + 2.0), 0.06, 0.06, 5);
    }
    q('rail', 0, L, o - 0.03, o + 0.03, YD + 1.0, YD + 1.08);
  }
  const amp = 1.4 * Math.min(1, L / 80);
  const crown = (t) => YD + 3.4 + amp * Math.sin((t / L) * Math.PI * 2.0);
  const seg = 8, w = W + 0.6;
  for (let t = -e0; t < L + e1; t += 2) {
    const t1 = Math.min(L + e1, t + 2);
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI, a1 = ((i + 1) / seg) * Math.PI;
      const R = (ang, tt) => P(tt, -w * Math.cos(ang), YD + 2.2 + (crown(tt) - YD - 2.2) * Math.sin(ang));
      A.quad('white', R(a0, t), R(a1, t), R(a1, t1), R(a0, t1));
      A.quad('soffit', R(a0, t1), R(a1, t1), R(a1, t), R(a0, t));
    }
  }
  for (const t of piers) for (const o of [-W + 0.4, W - 0.4]) { const p = P(t, o, 0); A.box('greyPier', p[0] - 0.35, p[0] + 0.35, 0, YD - 1.2, p[2] - 0.35, p[2] + 0.35); }
}

function route(A, pts, style, noPiers) {
  for (let s = 0; s < pts.length - 1; s++) span(A, pts[s], pts[s + 1], style, s ? W : 0, s < pts.length - 2 ? W : 0, noPiers[s] || []);
}

// a straight stair from (x, z) at deck height down to the ground, dir the unit step along the ground, width w
function stair(A, x, z, dx, dz, len, w, m = 'stairs') {
  const n = Math.round(len / 0.55), nx = -dz, nz = dx;
  for (let k = 0; k < n; k++) {
    const t0 = (len * k) / n, t1 = (len * (k + 1)) / n, y = YD - (YD * (k + 1)) / n;
    const c = (t, o) => [x + dx * t + nx * o, z + dz * t + nz * o];
    const pts = [c(t0, -w / 2), c(t1, -w / 2), c(t1, w / 2), c(t0, w / 2)];
    A.box(m, Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), y - YD / n - 0.05, y, Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
  }
  for (const o of [-w / 2, w / 2]) tube(A, 'rail', [x + nx * o, YD + 1.0, z + nz * o], [x + dx * len + nx * o, 1.0, z + dz * len + nz * o], 0.04, 0.04, 5);
}

// the outline of a walk of half width h along pts (mitred corners), as a closed ring
function band(pts, h) {
  const off = (sign) => pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const d0 = i ? norm(p[0] - a[0], p[1] - a[1]) : norm(b[0] - p[0], b[1] - p[1]);
    const d1 = i < pts.length - 1 ? norm(b[0] - p[0], b[1] - p[1]) : d0;
    const mx = -(d0[1] + d1[1]), mz = d0[0] + d1[0], ml = Math.hypot(mx, mz);
    const cos = (mx * -d1[1] + mz * d1[0]) / ml;                               // miter: offset h / cos(half angle)
    return [+(p[0] + (sign * mx / ml) * (h / cos)).toFixed(1), +(p[1] + (sign * mz / ml) * (h / cos)).toFixed(1)];
  });
  const ring = [...off(1), ...off(-1).reverse()];
  return [...ring, ring[0]];
}
function norm(x, z) { const l = Math.hypot(x, z); return [x / l, z / l]; }

export function buildSkywalk(owner) {
  const A = new Acc();
  const extra = [];
  route(A, ROUTE, 'orange', NO_PIERS);
  // north landing by the fence: one square grey column, an arched roof on white posts
  const LX0 = -126.5, LX1 = -119.5, LZ0 = -71.2, LZ1 = -64.8;
  A.box('pier', -124.2, -121.8, 0, YD - 1.0, -69.2, -66.8);
  A.box('steel', LX0, LX1, YD - 1.0, YD - 0.25, LZ0, LZ1);
  A.box('deck', LX0, LX1, YD - 0.25, YD, LZ0, LZ1);
  for (const x of [LX0 + 0.3, LX1 - 0.3]) for (const z of [LZ0 + 0.3, LZ1 - 0.3]) tube(A, 'column', [x, YD, z], [x, YD + HR, z], 0.2, 0.2, 8);
  A.box('red', LX0, LX1, YD + HR - 0.4, YD + HR, LZ0 + 0.1, LZ0 + 0.4);
  A.barrelX('roof', LX0 - 0.3, LX1 + 0.3, (LZ0 + LZ1) / 2, (LZ1 - LZ0) / 2 + 0.4, YD + HR, 0.35, 10);
  const ZS0 = -71.6, ZS1 = -69.8;                                               // both stairs run along the fence on the road side
  const n = 22, x0 = LX0, x1 = LX0 - 17;
  for (let k = 0; k < n; k++) {
    const xa = x0 + ((x1 - x0) * k) / n, xb = x0 + ((x1 - x0) * (k + 1)) / n, y = YD - (YD * (k + 1)) / n;
    A.box('stairs', Math.min(xa, xb), Math.max(xa, xb), y - YD / n - 0.05, y, ZS0, ZS1);
  }
  A.box('steel', x1, x0, 0, 0.4, ZS0 + 0.2, ZS1 - 0.2);
  for (const z of [ZS0 - 0.1, ZS1 + 0.1]) tube(A, 'rail', [x1, 1.0, z], [x0, YD + 1.0, z], 0.04, 0.04, 5);
  for (const x of [x0 - 3, x0 - 8, x0 - 13]) A.box('steel', x - 0.1, x + 0.1, 0, (YD * (x - x1)) / (x0 - x1), ZS0 + 0.9, ZS0 + 1.1);     // posts under the stair
  // covered stair down eastward: solid white side, pitched roof on posts
  {
    const e0 = LX1, e1 = LX1 + 19, m = 26;
    for (let k = 0; k < m; k++) {
      const xa = e0 + ((e1 - e0) * k) / m, xb = e0 + ((e1 - e0) * (k + 1)) / m, y = YD - (YD * (k + 1)) / m;
      A.box('stairs', xa, xb, y - YD / m - 0.05, y, ZS0, ZS1);
    }
    const yAt = (x) => YD - (YD * (x - e0)) / (e1 - e0);
    for (const [z, m2] of [[ZS0 - 0.1, 'column'], [ZS1 + 0.1, 'column']]) {        // white side panels following the slope
      A.quad(m2, [e0, yAt(e0) - 0.6, z], [e1, -0.6, z], [e1, 1.0, z], [e0, yAt(e0) + 1.0, z]);
      A.quad(m2, [e0, yAt(e0) + 1.0, z], [e1, 1.0, z], [e1, -0.6, z], [e0, yAt(e0) - 0.6, z]);
    }
    for (let x = e0 + 1; x <= e1; x += 3.6) for (const z of [ZS0 - 0.15, ZS1 + 0.15]) tube(A, 'steel', [x, yAt(x), z], [x, yAt(x) + 2.6, z], 0.06, 0.06, 5);
    const zc = (ZS0 + ZS1) / 2, w = (ZS1 - ZS0) / 2 + 0.5;
    for (const sd of [-1, 1]) {
      A.quad('roof', [e0, yAt(e0) + 2.6, zc + sd * w], [e1, 2.6, zc + sd * w], [e1, 3.2, zc], [e0, yAt(e0) + 3.2, zc]);
      A.quad('roof', [e0, yAt(e0) + 3.2, zc], [e1, 3.2, zc], [e1, 2.6, zc + sd * w], [e0, yAt(e0) + 2.6, zc + sd * w]);
    }
  }

  // orange KMITL letters on the west side, just south of the north landing
  const g = new THREE.BufferGeometry(), x = -123 - W - 0.5, y0 = YD - 1.0, y1 = YD + 2.6, zA = -64, zB = -52;   // faces west: the viewer looks east, so north is on the left
  g.setAttribute('position', new THREE.Float32BufferAttribute([x, y0, zA, x, y0, zB, x, y1, zB, x, y0, zA, x, y1, zB, x, y1, zA], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
  g.computeVertexNormals();
  g.userData.owner = new Int32Array(2).fill(owner);
  const tex = canvasTex(1024, 300, (c, w, h) => {
    c.fillStyle = '#f2601f'; c.font = '800 280px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('KMITL', w / 2, h * 0.55);
  }, 1, 1);
  const sign = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.6, side: THREE.DoubleSide }));
  sign.userData.kind = 'building'; extra.push(sign);

  return { meshes: [...meshes(A, mats(MAT_SPEC), owner), ...extra], top: YD + HR + 0.2 };
}

// KMITL Sky Walk at CMKL (overrides.json id -7), traced on the satellite imagery 2026-10-20: it leaves the south side
// of the clinic (คลินิกเวชกรรม) on a landing with a stair down southward, runs east along the north side of the
// courtyard, bends south-east across Chalong Krung Road where the road curves, lands on the east side of the road
// (a stair down northward at the corner) and runs straight south beside the road, over the frontage road, the railway
// and the road south of the tracks, into the north face of the CMKL tower at deck level. From the drone shots in
// KMITL Channel+ "KMITL Share Lo" EP.4 (youtu.be/HfCKpGCRyCo, 0:02-0:40): a white steel truss on both sides, a white
// roof whose curved section rises and falls along the length in a long wave, grey columns in pairs.
const CM_ROUTE = [[-73, -157], [-10, -162.5], [26.5, -143], [31.2, -14]];
const CM_NO_PIERS = [[], [[16, 40]], [[57, 68], [78, 119]]];

export function buildSkywalkCmkl(owner) {
  const A = new Acc();
  route(A, CM_ROUTE, 'white', CM_NO_PIERS);
  // landing at the clinic: from the walk's west end north to the clinic's south wall, a stair down southward
  const X0 = -73 - W - 0.4, X1 = -73 + W + 0.4, ZN = -165, ZS = -155;
  A.box('steel', X0, X1, YD - 1.1, YD - 0.25, ZN, ZS);
  A.box('deck', X0, X1, YD - 0.25, YD, ZN, ZS);
  A.box('white', X0 - 0.4, X1 + 0.4, YD + 2.6, YD + 2.8, ZN, ZS);
  for (const x of [X0, X1]) {
    A.box('white', x - 0.08, x + 0.08, YD + 1.0, YD + 1.1, ZN, ZS);
    for (const z of [ZN + 0.4, ZS - 0.4]) A.box('white', x - 0.1, x + 0.1, YD, YD + 2.6, z - 0.1, z + 0.1);
  }
  for (const x of [X0 + 0.5, X1 - 0.5]) A.box('greyPier', x - 0.35, x + 0.35, 0, YD - 1.1, ZN + 1.0, ZN + 1.7);
  stair(A, -73, -155, 0, 1, 12, 2.6);
  A.box('white', -73 - 1.8, -73 + 1.8, 3.2, 3.35, -155, -138);                   // canopy over the stair foot
  for (const z of [-150, -144, -138.3]) for (const x of [-73 - 1.6, -73 + 1.6]) A.box('white', x - 0.07, x + 0.07, 0, 3.2, z - 0.07, z + 0.07);
  // stair down northward at the corner east of the road
  stair(A, 31.2, -145.4, 0.27, -0.963, 12, 2.4);
  return { meshes: meshes(A, mats(MAT_SPEC), owner), top: YD + 4.8 };
}

export const SKYWALK_ROUTES = [ROUTE, CM_ROUTE];
export const SKYWALK_CMKL_OUTLINE = band([[-73, -165], ...CM_ROUTE], W + 0.6);
export const SKYWALK_OUTLINE = band([[-123, -71.2], ...ROUTE.slice(1)], W + 0.6);
