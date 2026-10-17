// Hand-built model of หอประชุมวิศวะ (Faculty of Engineering auditorium, OSM way 190868497).
// Surveyed 2026-10-17 from Google Maps satellite imagery (square plan, low hipped roof with a raised strip
// along the north-east diagonal, the round steps at the south-west corner) and Google Street View from the
// plaza at the south-west corner (looking north, north-east and east; wall height from the viewing angle,
// about 13 m). The other faces are behind the neighbouring wing and trees and follow the same pattern.
// Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up. Walls x -87.4..-49.2, z 43.8..81 (OSM outline agrees with the imagery).
//   a tall box of exposed red brick with a white coping; two deep slots near the top of each corner
//   ground floor glazed behind round white columns on the west and south, under a white canopy slab that
//   wraps the south-west corner; a row of Thai flags on outrigger poles along both faces above it
//   semicircular stepped platform at the south-west corner
//   roof: low concrete pyramid behind the parapet, a raised strip from the north-east corner past the apex
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex } from './ecc.js';

const X0 = -87.4, X1 = -49.2, Z0 = 43.8, Z1 = 81;
const H = 12.6, G = 4.6;                         // parapet top, canopy level
const CX = (X0 + X1) / 2, CZ = (Z0 + Z1) / 2, HALF = (X1 - X0) / 2;

export function buildEaud(owner) {
  const A = new Acc();
  const N = { ax: 'z', at: Z0, out: -1 }, S = { ax: 'z', at: Z1, out: 1 };
  const W = { ax: 'x', at: X0, out: -1 }, E = { ax: 'x', at: X1, out: 1 };
  const IN = 2.2;                                // glazed ground floor set back on the west and south

  // ---- brick box, ground floor set back under the canopy on the west and south ----
  A.box('brick', X0, X1, G, H, Z0, Z1);
  A.box('brick', X0 + IN, X1, 0, G, Z0, Z1 - IN);
  A.box('soffit', X0, X1, G - 0.05, G, Z0, Z1, false);
  for (const f of [{ ax: 'x', at: X0 + IN, out: -1 }, { ax: 'z', at: Z1 - IN, out: 1 }]) {
    const [a0, a1] = f.ax === 'x' ? [Z0 + 1, Z1 - IN] : [X0 + IN, X1 - 1];
    onFace(A, 'glass', f, a0, a1, 0.2, G - 0.3, 0, 0.04);
    for (let a = a0; a <= a1 + 0.01; a += 2.4) onFace(A, 'mull', f, a - 0.06, a + 0.06, 0.2, G - 0.3, 0, 0.1);
    onFace(A, 'mull', f, a0, a1, 2.5, 2.62, 0, 0.1);
  }
  // north and east ground floor: brick with a few doors
  for (const [f, a] of [[N, -75], [N, -58], [E, 55], [E, 70]]) onFace(A, 'door', f, a - 1.2, a + 1.2, 0, 2.6, 0, 0.05);

  // white coping, slots near each corner
  A.box('white', X0 - 0.15, X1 + 0.15, H, H + 0.4, Z0 - 0.15, Z1 + 0.15);
  A.box('roof', X0 + 0.4, X1 - 0.4, H - 0.1, H + 0.42, Z0 + 0.4, Z1 - 0.4);
  const slots = (f, a0, a1) => {
    for (const d of [1.6, 4.4]) for (const a of [a0 + d, a1 - d]) onFace(A, 'void', f, a - 0.5, a + 0.5, H - 2.6, H - 0.7, -0.6, 0.01);
  };
  slots(N, X0, X1); slots(S, X0, X1); slots(W, Z0, Z1); slots(E, Z0, Z1);

  // ---- canopy wrapping the south-west corner, round white columns ----
  const CO = 3.6;
  A.box('white', X0 - CO, X1 - 4, G, G + 0.9, Z1 - 0.01, Z1 + CO);              // south
  A.box('white', X0 - CO, X0 + 0.01, G, G + 0.9, Z0 + 4, Z1 + CO);              // west
  A.box('soffit', X0 - CO + 0.1, X1 - 4.1, G - 0.05, G, Z1, Z1 + CO - 0.1, false);
  A.box('soffit', X0 - CO + 0.1, X0, G - 0.05, G, Z0 + 4.1, Z1 + CO - 0.1, false);
  for (let x = X0 + 4; x < X1 - 4; x += 7.2) A.cyl('white', x, Z1 + CO - 0.9, 0.4, 0, G, 16);
  for (let z = Z1 - 4; z > Z0 + 4; z -= 7.2) A.cyl('white', X0 - CO + 0.9, z, 0.4, 0, G, 16);
  A.cyl('white', X0 - CO + 0.9, Z1 + CO - 0.9, 0.45, 0, G, 16);

  // ---- semicircular stepped platform at the south-west corner ----
  const STEP = 0.17;
  for (let s = 0; s < 4; s++) {
    const r = 9.5 - s * 0.55, ring = [];
    for (let i = 0; i <= 24; i++) {
      const t = Math.PI / 4 + (Math.PI * i) / 24;
      ring.push([X0 + 0.5 + r * Math.cos(t), Z1 - 0.5 + r * Math.sin(t)]);
    }
    A.prism('paving', ring, 0, (s + 1) * STEP);
  }

  // ---- roof: low concrete pyramid, raised strip along the north-east diagonal ----
  const R0 = H + 0.4, RISE = 3.0, APEX = [CX, R0 + RISE, CZ];
  const c = [[X0 + 0.4, Z0 + 0.4], [X1 - 0.4, Z0 + 0.4], [X1 - 0.4, Z1 - 0.4], [X0 + 0.4, Z1 - 0.4]];
  for (let i = 0; i < 4; i++) {
    const [a, b] = [c[i], c[(i + 1) % 4]];
    A.tri('roof', [b[0], R0, b[1]], [a[0], R0, a[1]], APEX);
  }
  const hip = (s) => R0 + RISE * (1 - Math.abs(s));                              // s = 1 NE corner, -1 SW corner
  const dir = [-Math.SQRT1_2, Math.SQRT1_2], nrm = [Math.SQRT1_2, Math.SQRT1_2], WS = 2.1;
  const D = HALF * Math.SQRT2;                                                   // centre to corner
  const P = (s, side, y) => [CX - dir[0] * s * D + nrm[0] * side * WS, y, CZ - dir[1] * s * D + nrm[1] * side * WS];
  const SS = [0.88, 0.6, 0.25, 0, -0.25];
  for (let i = 0; i < SS.length - 1; i++) {
    const [sa, sb] = [SS[i], SS[i + 1]];
    const ta = hip(sa) + 1.6, tb = hip(sb) + 1.6, ba = hip(sa) - 0.6, bb = hip(sb) - 0.6;
    A.quad('strip', P(sa, 1, ba), P(sb, 1, bb), P(sb, 1, tb), P(sa, 1, ta));
    A.quad('strip', P(sb, -1, bb), P(sa, -1, ba), P(sa, -1, ta), P(sb, -1, tb));
    A.quad('stripTop', P(sa, -1, ta), P(sa, 1, ta), P(sb, 1, tb), P(sb, -1, tb));
  }
  for (const [s, o] of [[SS[0], 1], [SS[SS.length - 1], -1]]) {
    const t = hip(s) + 1.6, b = hip(s) - 0.6;
    if (o > 0) A.quad('strip', P(s, -1, b), P(s, 1, b), P(s, 1, t), P(s, -1, t));
    else A.quad('strip', P(s, 1, b), P(s, -1, b), P(s, -1, t), P(s, 1, t));
  }

  // ---- Thai flags on outrigger poles along the west and south faces ----
  const flagPos = [];
  for (let i = 0; i < 7; i++) flagPos.push({ p: [X0 + 3 + i * 4.2, Z1], o: [0, 1], u: [1, 0] });
  for (let i = 0; i < 7; i++) flagPos.push({ p: [X0, Z1 - 3 - i * 4.2], o: [-1, 0], u: [0, -1] });
  const flagQuads = [];
  for (const { p, o, u } of flagPos) {
    const base = [p[0] + o[0] * 0.3, G + 0.9, p[1] + o[1] * 0.3], tip = [p[0] + o[0] * 0.9, G + 6.0, p[1] + o[1] * 0.9];
    // slanted pole as thin boxes stepped up
    for (let k = 0; k < 6; k++) {
      const t0 = k / 6, t1 = (k + 1) / 6, x = base[0] + (tip[0] - base[0]) * t0, z = base[2] + (tip[2] - base[2]) * t0;
      A.box('pole', x - 0.04, x + 0.04, base[1] + (tip[1] - base[1]) * t0, base[1] + (tip[1] - base[1]) * t1, z - 0.04, z + 0.04);
    }
    flagQuads.push({ tip, u });
  }

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    brick: std({ color: '#c46a49', map: brick, roughness: 0.95 }),
    white: std({ color: '#f4f4f1', roughness: 0.6 }),
    soffit: std({ color: '#ecebe6', side: THREE.DoubleSide }),
    glass: std({ color: '#3f4f58', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    mull: std({ color: '#eef0f1', roughness: 0.5 }),
    door: std({ color: '#6b5a4c', roughness: 0.7 }),
    void: std({ color: '#2b2522', roughness: 1 }),
    roof: std({ color: '#9b9d9b', roughness: 0.95, side: THREE.DoubleSide }),
    strip: std({ color: '#a9aba9', roughness: 0.9, side: THREE.DoubleSide }),
    stripTop: std({ color: '#8a8d8e', roughness: 0.6, metalness: 0.2, side: THREE.DoubleSide }),
    paving: std({ color: '#cfc8bb', roughness: 1 }),
    pole: std({ color: '#e6e6e6', roughness: 0.4, metalness: 0.5 }),
  };
  const meshes = [];
  const add = (g, mat) => {
    g.computeBoundingSphere();
    g.userData.owner = new Int32Array(g.attributes.position.count / 3).fill(owner);
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.kind = 'building';
    meshes.push(mesh);
  };
  for (const [k, B] of Object.entries(A.b)) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    add(g, MAT[k]);
  }
  // Thai flag: red, white, blue (double), white, red
  const thai = (() => {
    const cv = document.createElement('canvas'); cv.width = 96; cv.height = 64;
    const g = cv.getContext('2d');
    [['#c8102e', 0, 11], ['#ffffff', 11, 10], ['#2d2a6e', 21, 22], ['#ffffff', 43, 10], ['#c8102e', 53, 11]].forEach(([c, y, h]) => { g.fillStyle = c; g.fillRect(0, y, 96, h); });
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const pos = [], uv = [];
  for (const { tip, u } of flagQuads) {
    const a = [tip[0], tip[1] - 1.1, tip[2]], b = [tip[0] + u[0] * 1.6, tip[1] - 1.1, tip[2] + u[1] * 1.6];
    const cc = [b[0], tip[1], b[2]], d = [tip[0], tip[1], tip[2]];
    pos.push(...a, ...b, ...cc, ...a, ...cc, ...d);
    uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
  }
  const fg = new THREE.BufferGeometry();
  fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  fg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  fg.computeVertexNormals();
  add(fg, new THREE.MeshStandardMaterial({ map: thai, side: THREE.DoubleSide, roughness: 0.8 }));
  return { meshes, top: R0 + RISE + 1.6 };
}

export const EAUD_OUTLINE = [[X0, Z0], [X1, Z0], [X1, Z1], [X0, Z1], [X0, Z0]];
