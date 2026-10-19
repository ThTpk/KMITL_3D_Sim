// Hand-built model of the KMITL Sky Walk: the covered footbridge from the bank and post-office corner north of the
// railway, over the tracks and Chalong Krung Road, to the digital-data office and on to the library. It is not in
// OpenStreetMap; its route is traced on Google Maps satellite imagery and its outline is stored in overrides.json
// (id -6, "ll"). Surveyed 2026-10-19 from the user's photo of the north stair and the bridge's west side, and from
// the KMITL Virtual Tour (สำนักบริหารข้อมูลดิจิทัล 1-8, on the deck: the "SKY WALK" boards, the orange frames, the
// lift tower). Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up.
//   deck about 6.8 m up, 4 m wide, a grey steel truss under it, a stainless rail each side
//   a row of white round columns along each side, alternately upright and leaning, carrying a shallow metal roof
//   on red-orange beams
//   big orange "KMITL" letters on the west side over the railway fence by the north end
//   north end: the deck reaches over the road; a straight steel stair runs down westward between the covered walk and
//   the railway fence
//   route: north-south from z -84 to z 6 (x -125..-121), then east to x -90, then south-east to the library
import * as THREE from 'three';
import { Acc, tube, mats, meshes, BASE_MATS } from './kit.js';
import { canvasTex } from './ecc.js';

const YD = 6.8, W = 2.0, HR = 3.2;                                              // deck height, half width, roof height over the deck
const ROUTE = [[-123, -84], [-123, 9], [-90, 9], [-66, 36]];

export function buildSkywalk(owner) {
  const A = new Acc();
  const extra = [];
  for (let s = 0; s < ROUTE.length - 1; s++) {
    const [ax, az] = ROUTE[s], [bx, bz] = ROUTE[s + 1];
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    const P = (t, o, y) => [ax + ux * t + nx * o, y, az + uz * t + nz * o];
    const q = (m, t0, t1, o0, o1, y0, y1) => {                                  // a slab between two offsets, t0..t1 along
      A.quad(m, P(t0, o0, y1), P(t0, o1, y1), P(t1, o1, y1), P(t1, o0, y1));
      A.quad(m, P(t1, o0, y0), P(t1, o1, y0), P(t0, o1, y0), P(t0, o0, y0));
      for (const o of [o0, o1]) { A.quad(m, P(t0, o, y0), P(t1, o, y0), P(t1, o, y1), P(t0, o, y1)); A.quad(m, P(t1, o, y1), P(t1, o, y0), P(t0, o, y0), P(t0, o, y1)); }
    };
    q('deck', 0, L, -W, W, YD - 0.25, YD);
    q('steel', 0, L, -W + 0.2, W - 0.2, YD - 1.1, YD - 0.9);                    // bottom chord of the truss
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
    for (const o of [-W - 0.3, W + 0.3]) q('red', 0, L, o - 0.1, o + 0.1, YD + HR - 0.45, YD + HR);
    q('roof', -0.3, L + 0.3, -W - 0.6, W + 0.6, YD + HR, YD + HR + 0.12);
    // concrete piers every ~13 m (skipping the tracks and the road)
    for (let t = 0; t <= L; t += 13) {
      const p = P(t, 0, 0);
      if (s === 0 && p[2] > -72 && p[2] < -8) continue;
      A.box('pier', p[0] - 0.4, p[0] + 0.4, 0, YD - 1.1, p[2] - 0.4, p[2] + 0.4);
    }
  }
  // north end over the road; the stair down westward between the covered walk and the railway fence
  A.box('pier', -124.6, -121.4, 0, YD - 1.1, -84.6, -84.0);
  const ZS0 = -68.4, ZS1 = -66.4;
  const n = 22, x0 = -126, x1 = -143;
  for (let k = 0; k < n; k++) {
    const xa = x0 + ((x1 - x0) * k) / n, xb = x0 + ((x1 - x0) * (k + 1)) / n, y = YD - (YD * (k + 1)) / n;
    A.box('stairs', Math.min(xa, xb), Math.max(xa, xb), y - YD / n - 0.05, y, ZS0, ZS1);
  }
  A.box('steel', x1, x0, 0, 0.4, ZS0 + 0.2, ZS1 - 0.2);
  for (const z of [ZS0 - 0.1, ZS1 + 0.1]) tube(A, 'rail', [x1, 1.0, z], [x0, YD + 1.0, z], 0.04, 0.04, 5);
  for (const x of [-129, -134, -139]) A.box('steel', x - 0.1, x + 0.1, 0, (YD * (x - x1)) / (x0 - x1), ZS0 + 0.9, ZS0 + 1.1);     // posts under the stair

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

  const MAT = mats({ ...BASE_MATS, deck: '#9a9ea2', steel: { color: '#6d7378', metalness: 0.5, roughness: 0.5 }, rail: { color: '#d7dadc', metalness: 0.7, roughness: 0.3 },
    column: '#f2f2f0', red: '#d8462a', roof: { color: '#7b7f82', metalness: 0.4, roughness: 0.5 }, pier: '#cfcbc2', stairs: { color: '#7d8287', metalness: 0.4, roughness: 0.6 } });
  return { meshes: [...meshes(A, MAT, owner), ...extra], top: YD + HR + 0.2 };
}

export const SKYWALK_OUTLINE = [[-125, -86], [-121, -86], [-121, 7], [-90, 7], [-64, 35], [-68, 38], [-91, 11], [-125, 11], [-125, -66.4], [-143, -66.4], [-143, -68.4], [-125, -68.4], [-125, -86]];
