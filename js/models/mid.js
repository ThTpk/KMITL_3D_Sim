// Hand-built models of smaller buildings in the middle of the campus:
// สมาคมศิษย์เก่า (OSM way 516204080), โรงอาหาร ตึกพระเทพฯ (309919518), นาโน (516204097),
// ธนาคารและไปรษณีย์ (516204096), คลินิกเวชกรรม สจล. (516204098) and ภาคอัตโนมัติ (516204094).
// Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads
// and walks round each one. Photos were only looked at.
//
// x = east, z = south, y = up.
//   สมาคมศิษย์เก่า: two storeys; a deep white fascia across the north front with the association's name in red
//   (Thai above English), a glazed ground floor behind slim white columns, a canopy over the door; a glazed
//   pyramid over the middle of the roof; a wing south
//   โรงอาหาร ตึกพระเทพฯ: two storeys facing south over a pond: a glazed ground-floor canteen behind white columns
//   with red-brick piers at the south corners and steps up from the pond walk; a white slab; the upper floor
//   behind a ring of deep white fins whose tops rise outward into a sawtooth skyline; a grey hipped roof with
//   solar panels on its south slope; a small service block east (front from Street View on the pond walk)
//   นาโน: two storeys of red brick with white floor bands and green-tinted glass, an arched entrance portico
//   ธนาคารและไปรษณีย์: a long single-storey row of shops (bank, post office, coffee) under a flat concrete roof,
//   a covered walk along its east side
//   คลินิกเวชกรรม: a two-storey brick-faced block behind a tall white frame of slender square columns carrying a
//   deep roof slab; a low wing with a long covered drop-off
//   ภาคอัตโนมัติ: four storeys, white walls with cream floor bands and panels of grey louvres
import * as THREE from 'three';
import { Acc, F, onFace, block, pilotis, solar, hip, mats, meshes, BASE_MATS } from './kit.js';
import { textTex } from './ecc.js';

const SPEC = { ...BASE_MATS, wall: '#f1f0ec', band: '#f7f6f2', brick: { color: '#b0573d' }, cream: '#e9dcc0', louvre: { color: '#9a9ea0' },
  glassGreen: { color: '#4f7f74', roughness: 0.25, metalness: 0.3 }, glassRoof: { color: '#a8bcc6', roughness: 0.2, metalness: 0.3 }, roofSheet: '#c3c5c4' };
const done = (A, owner, top, extra = []) => ({ meshes: [...meshes(A, mats(SPEC), owner), ...extra], top });

export function buildAlumni(owner) {
  const A = new Acc();
  const X0 = -372, X1 = -340, Z0 = -370, Z1 = -338, G = 4.4, T = 9.2;
  A.box('glass', X0 + 1.5, X1 - 1.5, 0, G, Z0 + 1.5, Z1);
  for (let x = X0 + 1; x <= X1 - 1; x += 3.75) A.box('wall', x - 0.25, x + 0.25, 0, G, Z0 + 0.6, Z0 + 1.1);
  A.box('wall', X0, X1, G, T, Z0, Z1);
  A.box('band', X0 - 0.3, X1 + 0.3, G - 0.2, T + 0.8, Z0 - 0.4, Z0);
  A.box('band', -360, -352, 3.2, 3.6, Z0 - 4, Z0);
  const pyr = [[-363, -362], [-349, -362], [-349, -348], [-363, -348]];
  A.prism('band', pyr, T, T + 0.4);
  for (let i = 0; i < 4; i++) { const a = pyr[i], b = pyr[(i + 1) % 4]; A.tri('glassRoof', [b[0], T + 0.4, b[1]], [a[0], T + 0.4, a[1]], [-356, T + 4.5, -355]); }
  block(A, -366, -344, -338, -308, { G: 4.2, FL: 3.8, n: 2, bay: 3.6, style: 'punched' }, { n: false });
  // the name on the fascia (faces north: viewer looks south, east on the left)
  const g = new THREE.BufferGeometry(), z = Z0 - 0.42, x0 = X1 - 0.5, x1 = X0 + 0.5, y0 = G + 0.6, y1 = T + 0.5;
  g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y0, z, x1, y0, z, x1, y1, z, x0, y0, z, x1, y1, z, x0, y1, z], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
  g.computeVertexNormals();
  g.userData.owner = new Int32Array(2).fill(owner);
  const sign = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: textTex('สมาคมศิษย์เก่าสถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง', { w: 2048, h: 200, color: '#c0392b', bg: '#f7f6f2' }), roughness: 0.7 }));
  sign.userData.kind = 'building';
  return done(A, owner, T + 4.5, [sign]);
}

// one fin standing out from face f at position a along the wall: d metres deep, its top rising from y1 at the
// wall to y2 at the outer edge (drawn two-sided)
function fin(A, m, f, a, y0, y1, y2, d, t = 0.22) {
  const P = (u, y, w) => (f.ax === 'z' ? [u, y, f.at + f.out * w] : [f.at + f.out * w, y, u]);
  const sides = [[a - t / 2, a + t / 2]];
  for (const [u0, u1] of sides) {
    const q = [[P(u0, y0, 0), P(u0, y0, d), P(u0, y2, d), P(u0, y1, 0)], [P(u1, y0, d), P(u1, y0, 0), P(u1, y1, 0), P(u1, y2, d)],
      [P(u0, y0, d), P(u1, y0, d), P(u1, y2, d), P(u0, y2, d)], [P(u0, y1, 0), P(u0, y2, d), P(u1, y2, d), P(u1, y1, 0)]];
    for (const [p0, p1, p2, p3] of q) { A.quad(m, p0, p1, p2, p3); A.quad(m, p3, p2, p1, p0); }
  }
}

export function buildThepCan(owner) {
  const A = new Acc();
  const X0 = -247, X1 = -201, Z0 = -247, Z1 = -219, G = 4.2, T = 8.4, D = 1.4;
  // ground floor: glazed canteen behind white columns, red-brick piers at the south corners
  A.box('glass', X0 + 1.5, X1 - 1.5, 0.5, G, Z0 + 1.5, Z1 - 2.2);
  A.box('paving', X0 - 1, X1 + 1, 0, 0.5, Z0 - 1, Z1 + 1);
  for (let x = X0 + 4; x < X1 - 3; x += 4.6) A.box('wall', x - 0.25, x + 0.25, 0.5, G, Z1 - 0.8, Z1 - 0.3);
  for (const x of [X0, X1 - 3.2]) A.box('brick', x, x + 3.2, 0, G + 0.4, Z1 - 3.2, Z1);
  for (let s = 0; s < 4; s++) A.box('paving', -227, -220, 0, 0.5 - s * 0.12, Z1 + 1 + s * 0.4, Z1 + 1.4 + s * 0.4);
  // white slab over the ground floor
  A.box('band', X0 - 0.4, X1 + 0.4, G, G + 0.6, Z0 - 0.4, Z1 + 0.4);
  // upper floor: wall with a strip of windows, set back behind a ring of deep fins with a sawtooth top
  A.box('wall', X0 + D, X1 - D, G + 0.6, T, Z0 + D, Z1 - D);
  for (const [f, a0, a1] of [[F('z', Z0 + D, -1), X0 + D, X1 - D], [F('z', Z1 - D, 1), X0 + D, X1 - D], [F('x', X0 + D, -1), Z0 + D, Z1 - D], [F('x', X1 - D, 1), Z0 + D, Z1 - D]]) {
    onFace(A, 'glass', f, a0 + 0.3, a1 - 0.3, G + 1.6, T - 0.8, 0, 0.04);
    for (let a = a0 - D + 0.3; a <= a1 + D - 0.2; a += 1.7) fin(A, 'band', f, a, G + 0.6, T + 0.2, T + 1.0, D);
  }
  // hipped roof with solar panels on the south slope
  const h = 2.0, zc = (Z0 + Z1) / 2, z1 = Z1 - D;
  hip(A, 'roofSheet', X0 + D, X1 - D, Z0 + D, Z1 - D, T + 0.2, h, 0.2);
  for (let z = zc + 1.2; z < z1 - 1.2; z += 2.2) for (let x = X0 + D + 8; x < X1 - D - 9; x += 2.1) {
    const y = T + 0.2 + h * (z1 + 0.2 - (z + 0.9)) / (z1 + 0.2 - zc) + 0.15;
    A.box('solar', x, x + 1.9, y, y + 0.1, z, z + 1.8);
  }
  // small service block east
  block(A, -201, -192, -240, -226, { G: 3.8, n: 1, bay: 3.4, style: 'punched' }, { w: false });
  return done(A, owner, T + h + 0.3);
}

export function buildNano(owner) {
  const A = new Acc();
  const o = { G: 4.2, FL: 3.8, n: 2, bay: 4.4, style: 'band', mats: { wall: 'brick', pier: 'brick', glass: 'glassGreen' } };
  const t = block(A, -100, -76, -137, -101, o, {});
  block(A, -76, -48, -132, -114, o, {});
  solar(A, -75.5, -48.5, -131.5, -114.5, t + 0.1);
  A.box('roof', -99.7, -76.3, t, t + 0.12, -136.7, -101.3);
  // arched portico on the north
  for (let i = 0; i < 4; i++) {
    const x = -94 + i * 4.5;
    A.box('brick', x - 0.5, x + 0.5, 0, 6, -142, -137);
    if (i < 3) for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI, b = ((s + 1) / 6) * Math.PI;
      A.quad('band', [x + 0.5 + 1.75 * (1 - Math.cos(a)), 4.5 + 1.2 * Math.sin(a), -142], [x + 0.5 + 1.75 * (1 - Math.cos(b)), 4.5 + 1.2 * Math.sin(b), -142],
        [x + 0.5 + 1.75 * (1 - Math.cos(b)), 4.5 + 1.2 * Math.sin(b), -137], [x + 0.5 + 1.75 * (1 - Math.cos(a)), 4.5 + 1.2 * Math.sin(a), -137]); }
  }
  A.box('band', -95, -79, 6, 6.8, -142.3, -137);
  return done(A, owner, t + 0.8);
}

export function buildBank(owner) {
  const A = new Acc();
  block(A, -130, -122, -174, -88, { G: 3.8, n: 1, bay: 3.4, style: 'band' }, {});
  A.box('band', -130.5, -114.5, 3.8, 4.3, -174.5, -87.5);
  for (let z = -172; z < -88; z += 4.2) A.box('wall', -115.5, -115, 0, 3.8, z, z + 0.4);
  A.box('paving', -122, -115, 0, 0.2, -174, -88);
  return done(A, owner, 4.3);
}

export function buildClinic(owner) {
  const A = new Acc();
  const t = block(A, -86, -60, -180, -164, { G: 4.4, FL: 3.8, n: 2, bay: 4, style: 'band', mats: { wall: 'brick', pier: 'brick' } }, {});
  // tall white frame on the north
  for (let x = -86; x <= -60; x += 3.25) A.box('band', x - 0.3, x + 0.3, 0, t + 0.6, -184, -183.4);
  A.box('band', -86.5, -59.5, t, t + 0.9, -184.5, -163.5);
  for (let s = 0; s < 3; s++) A.box('paving', -84, -62, 0, 0.5 - s * 0.15, -186 - s * 0.6, -184);
  // low wing and covered drop-off
  block(A, -60, -38, -182, -161, { G: 4.2, n: 1, bay: 4, style: 'band' }, { w: false });
  A.box('band', -60, -38, 3.6, 4.0, -188, -182);
  for (let x = -58; x <= -40; x += 6) A.box('band', x - 0.25, x + 0.25, 0, 3.6, -187.8, -187.3);
  return done(A, owner, t + 0.9);
}

export function buildAutomation(owner) {
  const A = new Acc();
  const o = { G: 4.2, FL: 3.6, n: 4, bay: 3.8, style: 'band', mats: { band: 'cream' } };
  const t = block(A, -167, -139, -163, -138, o, {});
  for (const f of [F('z', -138, 1), F('z', -163, -1)]) for (const x of [-160, -148]) onFace(A, 'louvre', f, x, x + 3.6, 4.2, t - 0.4, 0, 0.15);
  A.box('roof', -166.7, -139.3, t, t + 0.12, -162.7, -138.3);
  return done(A, owner, t + 0.9);
}

const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
export const ALUMNI_OUTLINE = [[-372, -370], [-340, -370], [-340, -338], [-344, -338], [-344, -308], [-366, -308], [-366, -338], [-372, -338], [-372, -370]];
export const THEPCAN_OUTLINE = [[-247, -247], [-201, -247], [-201, -240], [-192, -240], [-192, -226], [-201, -226], [-201, -219], [-247, -219], [-247, -247]];
export const NANO_OUTLINE = [[-100, -137], [-76, -137], [-76, -132], [-48, -132], [-48, -114], [-76, -114], [-76, -101], [-100, -101], [-100, -137]];
export const BANK_OUTLINE = rect(-130, -115, -174, -88);
export const CLINIC_OUTLINE = [[-86, -184], [-60, -184], [-60, -188], [-38, -188], [-38, -161], [-60, -161], [-60, -164], [-86, -164], [-86, -184]];
export const AUTOMATION_OUTLINE = rect(-167, -139, -163, -138);
