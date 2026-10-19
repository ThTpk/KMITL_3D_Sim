// Hand-built model of คณะบริหารธุรกิจ (KMITL Business School, OSM way 516308732, BM AG-01: five storeys).
// The OSM way has no name and its outline sits about 8 m east of the imagery.
// Surveyed 2026-10-19 from Google Maps satellite imagery (plan, roofs: solar panels on the wings, the tower's flat
// roof between them, the stepped link to the south wing) and the faculty's 2026 film "#ที่นี่ลาดกระบัง KMITL
// Business School" (youtu.be/mfGSrcOlX6g, 0:02-0:16: the north front from across the lawn and car park to the
// north-east, the arched screen, the tower top). Street View on the roads round it predates the refurbishment
// (white banded walls); it was used for the south wing and the floor count. Photos were only looked at.
//
// x = east, z = south, y = up.
//   north wing x 356..418, z -220..-199: five storeys of white render with ribbon windows, in two parts joined by
//     a recessed link at x 381..386; a salmon-pink arcade of small arches in front of the ground floor;
//     "KMITL BUSINESS SCHOOL" on the parapet; solar panels on both roofs
//   tower x 419..436: six storeys clad in terracotta with a glazed strip up the middle, a white top box with the
//     emblem and a sloping steel trellis over it
//   east block x 438..466: three storeys behind a salmon-pink screen wall with two tall arches, a blue-grey fascia
//     with "คณะบริหารธุรกิจ" on top, a white canopy over the entrance
//   south wing x 437..465, z -183..-135: four storeys of white bands, deep fins down the east face, solar roof,
//     joined to the east block by a two-storey link with a stepped roof
import * as THREE from 'three';
import { Acc, F, onFace, block, solar, tube, mats, meshes, BASE_MATS } from './kit.js';
import { textTex } from './ecc.js';

const G = 4.4, FL = 3.8, ZN = -220;
const lv = (n) => G + (n - 1) * FL;                   // roof level of an n-storey block

const SPEC = { ...BASE_MATS, wall: '#f1f0ec', band: '#f7f6f2', pink: '#e3ab9b', terra: '#c9765d', fascia: '#7e93a6',
  steel: { color: '#4b5156', roughness: 0.5, metalness: 0.5 }, emblem: '#3d4a5c', emblemIn: '#e9e5dc' };

// a wall on face f from a0 to a1, y0..yt, d0..d1 deep, pierced by round-headed arches: `arches` = [[u0, u1], ...]
// springing at ys (the opening runs down to y0)
function arcade(A, m, f, a0, a1, y0, yt, ys, d0, d1, arches) {
  let a = a0;
  for (const [u0, u1] of arches) {
    if (u0 > a) onFace(A, m, f, a, u0, y0, yt, d0, d1);
    const r = (u1 - u0) / 2, uc = (u0 + u1) / 2, N = 12;
    for (let i = 0; i < N; i++) {
      const ua = u0 + ((u1 - u0) * i) / N, ub = ua + (u1 - u0) / N, um = (ua + ub) / 2;
      const h = ys + Math.sqrt(Math.max(0, r * r - (um - uc) ** 2));
      if (h < yt) onFace(A, m, f, ua, ub, h, yt, d0, d1);
    }
    a = u1;
  }
  if (a < a1) onFace(A, m, f, a, a1, y0, yt, d0, d1);
}

// a flat sign facing north (viewer looks south, so east is on the left) from x xe (east) to xw (west)
function signN(owner, tex, xe, xw, y0, y1, z) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([xe, y0, z, xw, y0, z, xw, y1, z, xe, y0, z, xw, y1, z, xe, y1, z], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
  g.computeVertexNormals();
  g.userData.owner = new Int32Array(2).fill(owner);
  const s = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.7 }));
  s.userData.kind = 'building';
  return s;
}

// a disc facing north, centred on (cx, cy) in the plane z
function discN(A, m, cx, cy, z, r, seg = 24) {
  for (let i = 0; i < seg; i++) {
    const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
    A.tri(m, [cx, cy, z], [cx + r * Math.cos(t1), cy + r * Math.sin(t1), z], [cx + r * Math.cos(t0), cy + r * Math.sin(t0), z]);
  }
}

export function buildKbs(owner) {
  const A = new Acc();
  const N = F('z', ZN, -1);
  const white = { G, FL, bay: 3.8, style: 'band', mats: { wall: 'wall', pier: 'wall' } };

  // ---- north wing: two five-storey parts and a recessed link ----
  const tw = block(A, 356, 381, ZN, -199, { ...white, n: 5 });
  block(A, 386, 418, ZN, -199, { ...white, n: 5 }, { e: false });
  block(A, 380, 387, ZN + 2.5, -201.5, { ...white, n: 5 }, { e: false, w: false });
  solar(A, 357, 380, ZN + 1, -200, tw + 0.1);
  solar(A, 387, 417, ZN + 1, -200, tw + 0.1);
  // salmon arcade in front of the ground floor
  for (const [a0, a1] of [[356, 381], [386, 418]]) {
    const n = Math.round((a1 - a0) / 5.4), w = (a1 - a0) / n, arches = [];
    for (let i = 0; i < n; i++) arches.push([a0 + i * w + 0.45, a0 + (i + 1) * w - 0.45]);
    arcade(A, 'pink', N, a0, a1, 0, G + 0.3, 1.9, 1.2, 1.7, arches);
  }

  // ---- tower ----
  const TX0 = 418, TX1 = 437, TZ0 = ZN - 1, TT = lv(6);
  A.box('terra', TX0, TX1, 0, TT, TZ0, -200);
  onFace(A, 'glass', F('z', TZ0, -1), 424.5, 430.5, 1, TT - 1.2, 0, 0.06);
  for (let k = 1; k < 6; k++) onFace(A, 'band', F('z', TZ0, -1), 424.3, 430.7, lv(k) - 0.15, lv(k) + 0.25, 0, 0.2);
  onFace(A, 'band', F('z', TZ0, -1), TX0 - 0.2, TX1 + 0.2, TT - 0.2, TT + 0.6, 0, 0.3);
  // white top box with the emblem, steel trellis sloping back over it
  const BX0 = 420.5, BX1 = 434.5, BT = TT + 3.6;
  A.box('wall', BX0, BX1, TT, BT, TZ0 + 0.5, -206);
  discN(A, 'emblem', 427.5, TT + 1.8, TZ0 + 0.44, 1.45);
  discN(A, 'emblemIn', 427.5, TT + 1.8, TZ0 + 0.42, 0.95);
  for (let x = BX0 - 0.5; x <= BX1 + 0.5; x += 1.5) tube(A, 'steel', [x, BT + 0.2, TZ0 - 0.6], [x, BT + 2.6, -210], 0.08, 0.08, 6);
  for (const t of [0, 0.5, 1]) {
    const y = BT + 0.2 + 2.4 * t, z = TZ0 - 0.6 + (-210 - TZ0 + 0.6) * t;
    tube(A, 'steel', [BX0 - 0.6, y, z], [BX1 + 0.6, y, z], 0.1, 0.1, 6);
  }
  for (const x of [BX0 - 0.5, BX1 + 0.5]) tube(A, 'steel', [x, BT, TZ0 - 0.6], [x, BT + 0.2, TZ0 - 0.6], 0.1, 0.1, 6);

  // ---- east block behind the arched screen ----
  const EX0 = 437, EX1 = 466, et = block(A, EX0, EX1, ZN, -199, { ...white, n: 3 }, { w: false });
  solar(A, EX0 + 2, EX1 - 1, ZN + 1, -200, et + 1.6);
  const SZ = ZN - 1.4;                                   // screen wall face
  const S = F('z', SZ, -1);
  arcade(A, 'pink', S, EX0, EX1, 0, et, 3.4, 0, 1.0, [[EX0 + 2.4, EX0 + 13.2], [EX1 - 13.2, EX1 - 2.4]]);
  // blue-grey fascia on top of the screen and round the east end
  A.box('fascia', EX0, EX1 + 0.4, et, et + 2.2, SZ - 1.0, ZN + 4);
  A.box('fascia', EX1, EX1 + 0.4, et, et + 2.2, ZN, -199);
  // entrance canopy between the arches
  A.box('band', EX0 + 12, EX1 - 12, 3.6, 4.0, SZ - 4.5, SZ);
  for (const x of [EX0 + 12.6, EX1 - 12.6]) A.box('wall', x - 0.25, x + 0.25, 0, 3.6, SZ - 4.2, SZ - 3.7);

  // ---- south wing and the link to it ----
  const st = block(A, 437, 465, -183, -135, { ...white, n: 4 });
  solar(A, 439, 456, -181, -137, st + 0.1);
  for (let z = -182.4; z < -135; z += 1.6) A.box('band', 465, 465.9, 0.6, st, z - 0.12, z + 0.12);   // fins on the east face
  const lt = block(A, 437, 446, -199, -183, { ...white, n: 2 }, { n: false, s: false });
  for (let s = 0; s < 4; s++) A.box('roof', 437.3, 445.7, lt, lt + 0.6 + s * 0.6, -199 + s * 4, -195 + s * 4);

  const extra = [
    signN(owner, textTex('คณะบริหารธุรกิจ', { w: 2048, h: 220, color: '#ffffff' }), EX1 - 3, EX0 + 3, et + 0.3, et + 1.9, SZ - 1.04),
    signN(owner, textTex('KMITL BUSINESS SCHOOL', { w: 2048, h: 160, color: '#2f5f9e' }), 416, 389, tw - 0.05, tw + 0.8, ZN - 0.33),
  ];
  return { meshes: [...meshes(A, mats(SPEC), owner), ...extra], top: BT + 2.8 };
}

export const KBS_OUTLINE = [[356, -221.5], [437, -221.5], [437, -222.8], [466.4, -222.8], [466.4, -199], [465.9, -199], [465.9, -135], [437, -135],
  [437, -199], [356, -199], [356, -221.5]];
