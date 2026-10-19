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
//   a covered walk along its east side; its south end is a bank hall with a light-blue fascia and ATMs under the
//   overhang. Beside it on the road (OSM 1138463213, 1138463212; added 2026-10-19 from the user's Virtual Tour photos):
//   a Krungsri pavilion with a grey-and-yellow fascia, a glazed ATM front on a raised plinth and a tall yellow pylon
//   sign, and a white bank pavilion with a deep flat fascia and pale green glazing
//   คลินิกเวชกรรม (signed โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร): white, two storeys; the west block has three tall bays of pale
//   glazing in a white frame with the name in red on its parapet; a set-back glazed entrance with wide steps, a slab
//   over it and an open loggia on square columns above; a single-storey colonnade over the drop-off to the east with
//   solar panels on top (re-surveyed 2026-10-19 from the user's Virtual Tour photos)
//   ภาคอัตโนมัติ (BM EN-24, three storeys): refurbished - re-surveyed 2026-10-19 from the KMITL Virtual Tour (ไปรษณีย์ 5-9,
//   from the road and the post-office walk east of it): charcoal cladding with big screens of grey vertical slats on
//   the upper floors, orange trim on every floor edge and the parapet, a slate-blue ground floor with dark-framed
//   glazing, an orange sign box with the department's name over the entrance on the east front
import * as THREE from 'three';
import { Acc, F, onFace, block, pilotis, solar, hip, mats, meshes, BASE_MATS } from './kit.js';
import { textTex } from './ecc.js';

const SPEC = { ...BASE_MATS, wall: '#f1f0ec', band: '#f7f6f2', brick: { color: '#b0573d' }, cream: '#e9dcc0', louvre: { color: '#9a9ea0' },
  glassGreen: { color: '#4f7f74', roughness: 0.25, metalness: 0.3 }, glassRoof: { color: '#a8bcc6', roughness: 0.2, metalness: 0.3 }, roofSheet: '#c3c5c4', glassPale: { color: '#b9c4c4', roughness: 0.3 }, white: '#f2f1ed', skyBlue: '#48b4e0', atm: '#2a8fd0', ksYellow: '#f4b81c', ksGrey: '#55595d',
  charcoal: '#41464b', green: '#22a04b', slate: '#4f6c8a', slat: { color: '#8c9196', roughness: 0.6, metalness: 0.3 }, rust: '#c9622e', orangeSign: '#ef6a1f' };
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
  // bank hall at the south end: light-blue fascia over the overhang, ATMs under it
  A.box('white', -130.6, -114.4, 3.3, 4.6, -100, -87.2);
  onFace(A, 'skyBlue', F('z', -87.2, 1), -130.6, -114.4, 3.6, 4.5, 0, 0.06);
  onFace(A, 'skyBlue', F('x', -114.4, 1), -100, -87.2, 3.6, 4.5, 0, 0.06);
  for (const z of [-96, -94.5, -93]) A.box('atm', -122.4, -121.6, 0.2, 2.0, z, z + 0.9);
  return done(A, owner, 4.6);
}

// Krungsri pavilion on the corner west of the bank row
export function buildKrungsri(owner) {
  const A = new Acc();
  const X0 = -140, X1 = -129.5, Z0 = -107, Z1 = -82, H = 4.6;
  A.box('paving', X0 - 0.6, X1 + 0.6, 0, 0.6, Z0, Z1 + 1.5);
  for (let s2 = 0; s2 < 2; s2++) A.box('paving', X0, X1, 0, 0.3 - s2 * 0.15, Z1 + 1.5, Z1 + 2.1 + s2 * 0.5);
  A.box('wall', X0 + 0.5, X1 - 0.5, 0.6, H, Z0 + 0.5, Z1 - 1.5);
  onFace(A, 'glass', F('z', Z1 - 1.5, 1), X0 + 1.5, X1 - 1.5, 0.8, H - 0.4, 0, 0.05);
  onFace(A, 'glass', F('x', X1 - 0.5, 1), Z0 + 4, Z1 - 2, 0.8, H - 0.4, 0, 0.05);
  for (const x of [X0 + 1.2, X0 + 2.4, X0 + 3.6]) A.box('ksYellow', x, x + 0.9, 0.6, 2.4, Z1 - 2.4, Z1 - 1.6);           // ATMs
  for (const [x, z] of [[X0 + 0.3, Z1 - 0.3], [X1 - 0.3, Z1 - 0.3], [X1 - 0.3, Z0 + 4]]) A.box('wall', x - 0.25, x + 0.25, 0.6, H, z - 0.25, z + 0.25);
  // deep fascia: grey on the west half of the front, yellow on the rest and round the east side
  A.box('ksGrey', X0 - 0.4, X1 + 0.4, H, H + 1.6, Z0, Z1 + 0.4);
  onFace(A, 'ksYellow', F('z', Z1 + 0.4, 1), X0 + 4.5, X1 + 0.4, H, H + 1.6, 0, 0.05);
  onFace(A, 'ksYellow', F('x', X1 + 0.4, 1), Z0, Z1 + 0.4, H, H + 1.6, 0, 0.05);
  A.box('roof', X0 - 0.2, X1 + 0.2, H + 1.6, H + 1.7, Z0 + 0.2, Z1 + 0.2);
  // tall yellow pylon sign at the south-west corner
  A.box('wall', X0 - 0.8, X0 - 0.4, 0, 6.0, Z1 + 1.6, Z1 + 2.0);
  A.box('ksYellow', X0 - 1.1, X0 - 0.1, 5.6, 9.6, Z1 + 1.2, Z1 + 2.4);
  // the KRUNGSRI name on the grey fascia (faces south: viewer looks north, west on the left)
  const g = new THREE.BufferGeometry(), z = Z1 + 0.43, x0 = X0 + 0.2, x1 = X0 + 4.3, y0 = H + 0.35, y1 = H + 1.25;
  g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y0, z, x1, y0, z, x1, y1, z, x0, y0, z, x1, y1, z, x0, y1, z], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
  g.computeVertexNormals();
  g.userData.owner = new Int32Array(2).fill(owner);
  const sign = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: textTex('krungsri', { w: 512, h: 150, color: '#ffffff', font: 'Arial', weight: 700 }), transparent: true, alphaTest: 0.3, roughness: 0.7 }));
  sign.userData.kind = 'building';
  return done(A, owner, H + 1.7, [sign]);
}

// white bank pavilion east of the bank row
export function buildBankW(owner) {
  const A = new Acc();
  const X0 = -114.5, X1 = -103, Z0 = -108, Z1 = -80, H = 4.0;
  A.box('paving', X0, X1 + 0.5, 0, 0.5, Z0, Z1 + 1);
  A.box('wall', X0 + 1, X1 - 1, 0.5, H, Z0 + 1, Z1 - 1.5);
  onFace(A, 'glassPale', F('z', Z1 - 1.5, 1), X0 + 1.5, X1 - 1.5, 0.6, H - 0.3, 0, 0.05);
  onFace(A, 'glassPale', F('x', X1 - 1, 1), Z0 + 3, Z1 - 2, 0.6, H - 0.3, 0, 0.05);
  for (let z = Z0 + 3; z < Z1 - 2; z += 4) onFace(A, 'wall', F('x', X1 - 1, 1), z - 0.2, z + 0.2, 0.5, H, 0, 0.1);
  A.box('white', X0 - 0.3, X1 + 0.3, H, H + 1.3, Z0, Z1 + 0.3);
  A.box('roof', X0, X1, H + 1.3, H + 1.4, Z0 + 0.3, Z1);
  return done(A, owner, H + 1.4);
}

export function buildClinic(owner) {
  // re-surveyed 2026-10-19 from the user's KMITL Virtual Tour photos of the north front and the drop-off
  const A = new Acc();
  const X0 = -91, XM0 = -63, XM1 = -50, X1 = -42, ZN = -188, ZS = -165, T = 10.4, G = 4.6, LT = 5.2;
  const N = F('z', ZN, -1);
  // west block: tall glazed bays in a white frame
  A.box('wall', X0, XM0, 0, T, ZN + 0.6, ZS);
  A.box('band', X0, XM0, 0, 0.9, ZN, ZN + 0.6);
  A.box('band', X0, XM0, T - 1.7, T + 0.4, ZN, ZN + 0.6);
  for (let i = 0; i < 3; i++) {
    const a0 = X0 + 1.4 + i * 8.6, a1 = a0 + 7.2;
    onFace(A, 'glassPale', F('z', ZN + 0.6, -1), a0, a1, 0.9, T - 1.7, 0, 0.05);
    for (let x = a0; x <= a1 + 0.01; x += 1.8) onFace(A, 'band', F('z', ZN + 0.6, -1), x - 0.05, x + 0.05, 0.9, T - 1.7, 0, 0.1);
    for (const y of [3.4, 6.2]) onFace(A, 'band', F('z', ZN + 0.6, -1), a0, a1, y - 0.05, y + 0.05, 0, 0.1);
    onFace(A, 'band', N, a1 - 0.0, a1 + 1.4, 0.9, T - 1.7, -0.6, 0);
  }
  onFace(A, 'band', N, X0, X0 + 1.4, 0.9, T - 1.7, -0.6, 0);
  // west face (user's photo from the ramp, 2026-10-19): two tall glazed bays at the north end wrapping the corner, then
  // orange brick with a white band at the floor line, the KMC HOSPITAL sign and a green cross; a ramp with white rails
  const Wf = F('x', X0, -1);
  for (const [z0, z1] of [[ZN + 1.6, ZN + 6.4]]) {
    onFace(A, 'glassPale', Wf, z0, z1, 0.9, T - 1.7, 0, 0.05);
    for (let z = z0; z <= z1 + 0.01; z += 1.6) onFace(A, 'band', Wf, z - 0.05, z + 0.05, 0.9, T - 1.7, 0, 0.1);
    onFace(A, 'band', Wf, z0, z1, 4.6, 4.75, 0, 0.1);
  }
  onFace(A, 'band', Wf, ZN + 6.4, ZN + 7.8, 0.6, T - 1.7, 0, 0.3);
  onFace(A, 'brick', Wf, ZN + 7.8, ZS, 0.6, T - 1.7, 0, 0.05);
  onFace(A, 'band', Wf, ZN + 7.8, ZS, 4.6, 5.6, 0, 0.08);
  onFace(A, 'band', Wf, ZS - 8, ZS + 1, 3.4, 3.7, 0, 2.6);                     // white canopy over the south door
  onFace(A, 'band', Wf, ZN, ZS, T - 1.7, T + 0.4, 0, 0.08);
  onFace(A, 'green', Wf, ZN + 9.0, ZN + 10.0, 7.6, 7.9, 0.08, 0.14);
  onFace(A, 'green', Wf, ZN + 9.35, ZN + 9.65, 7.25, 8.25, 0.08, 0.14);
  A.box('paving', X0 - 3.2, X0, 0, 0.6, ZN + 9, ZS + 2);
  for (const x of [X0 - 3.1, X0 - 0.1]) for (let z = ZN + 9.5; z < ZS + 2; z += 1.8) A.box('band', x - 0.04, x + 0.04, 0.6, 1.6, z - 0.04, z + 0.04);
  for (const x of [X0 - 3.1, X0 - 0.1]) A.box('band', x - 0.05, x + 0.05, 1.5, 1.6, ZN + 9.5, ZS + 2);
  // middle: set-back glazed entrance, slab, open loggia with square columns above, steps
  A.box('wall', XM0, XM1, 0, T, ZN + 5, ZS);
  onFace(A, 'glass', F('z', ZN + 5, -1), XM0 + 1, XM1 - 1, 0.6, G - 0.4, 0, 0.05);
  onFace(A, 'glass', F('z', ZN + 5, -1), XM0 + 1, XM1 - 1, G + 0.8, T - 1.4, 0, 0.05);
  A.box('band', XM0, XM1 + 8, G - 0.3, G + 0.3, ZN - 1.2, ZN + 5);
  A.box('band', XM0, XM1, T - 1.4, T + 0.4, ZN, ZN + 5);
  for (const x of [XM0 + 0.4, (XM0 + XM1) / 2, XM1 - 0.4]) A.box('band', x - 0.45, x + 0.45, 0, T - 1.4, ZN + 0.1, ZN + 1.0);
  // white triangular fins under the top band of the loggia (SIIE film 6:20-6:30)
  for (let x = XM0 + 1.4; x < XM1 - 0.8; x += 2.2) {
    const y1 = T - 1.4, y0 = y1 - 2.0, z0 = ZN + 0.2, z1 = ZN + 4.6, side = (xx) => {
      A.tri('band', [xx, y1, z0], [xx, y1, z1], [xx, y0, z0]); A.tri('band', [xx, y0, z0], [xx, y1, z1], [xx, y1, z0]); };
    side(x - 0.1); side(x + 0.1);
    A.quad('band', [x - 0.1, y0, z0], [x + 0.1, y0, z0], [x + 0.1, y1, z1], [x - 0.1, y1, z1]);
  }
  for (let s2 = 0; s2 < 5; s2++) A.box('paving', XM0 - 3 - s2 * 0.4, XM1 + 3 + s2 * 0.4, 0, 0.9 - s2 * 0.18, ZN - 0.2 - s2 * 0.45, ZN + 5);
  // east: single-storey colonnade over the drop-off, tilted solar panels on its roof
  A.box('wall', XM1, X1, 0, LT, ZN + 6, ZS - 3);
  A.box('band', XM1, X1 + 0.6, LT - 0.9, LT + 0.5, ZN - 0.6, ZS);
  for (let x = XM1 + 2.5; x <= X1 + 0.3; x += 4.2) for (const z of [ZN - 0.2, ZS - 0.8]) A.box('band', x - 0.35, x + 0.35, 0, LT - 0.9, z - 0.35, z + 0.35);
  for (let z = ZN + 1; z < ZS - 3; z += 4.2) A.box('band', X1 + 0.1, X1 + 0.8, 0, LT - 0.9, z - 0.35, z + 0.35);
  for (let x = XM1 + 1; x < X1 - 2; x += 3.2) {
    A.quad('solar', [x, LT + 0.7, ZN + 3], [x + 2.6, LT + 0.7, ZN + 3], [x + 2.6, LT + 2.0, ZN + 5], [x, LT + 2.0, ZN + 5]);
    A.quad('solar', [x, LT + 2.0, ZN + 5], [x + 2.6, LT + 2.0, ZN + 5], [x + 2.6, LT + 0.7, ZN + 3], [x, LT + 0.7, ZN + 3]);
  }
  // covered walk along the south side
  A.box('band', X0, X1, 3.6, 4.0, ZS, ZS + 3);
  A.box('roof', X0 + 0.3, XM1 - 0.3, T + 0.4, T + 0.5, ZN + 0.3, ZS - 0.3);
  // the hospital's name in red on the west block's parapet (faces north: viewer looks south, east on the left)
  const g = new THREE.BufferGeometry(), z = ZN - 0.03, x0 = XM0 - 3, x1 = X0 + 3, y0 = T - 1.45, y1 = T + 0.15;
  g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y0, z, x1, y0, z, x1, y1, z, x0, y0, z, x1, y1, z, x0, y1, z], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
  g.computeVertexNormals();
  g.userData.owner = new Int32Array(2).fill(owner);
  const sign = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: textTex('โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร', { w: 2048, h: 180, color: '#e8641e' }), transparent: true, alphaTest: 0.3, roughness: 0.7 }));
  sign.userData.kind = 'building';
  // KMC HOSPITAL on the west brick (faces west: the viewer looks east, north on the left)
  const g2 = new THREE.BufferGeometry(), xw = X0 - 0.1, za = ZN + 8.0, zb = ZN + 11.0;
  g2.setAttribute('position', new THREE.Float32BufferAttribute([xw, 5.9, za, xw, 5.9, zb, xw, 7.1, zb, xw, 5.9, za, xw, 7.1, zb, xw, 7.1, za], 3));
  g2.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
  g2.computeVertexNormals();
  g2.userData.owner = new Int32Array(2).fill(owner);
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 200;
  const c = cv.getContext('2d'); c.fillStyle = '#f4f4f2'; c.font = '500 80px Arial, sans-serif'; c.textAlign = 'right'; c.textBaseline = 'middle';
  c.fillText('KMC', 500, 55); c.fillText('HOSPITAL', 500, 150);
  const t2 = new THREE.CanvasTexture(cv); t2.colorSpace = THREE.SRGBColorSpace;
  const kmc = new THREE.Mesh(g2, new THREE.MeshStandardMaterial({ map: t2, transparent: true, alphaTest: 0.3, roughness: 0.7 }));
  kmc.userData.kind = 'building';
  return done(A, owner, T + 0.5, [sign, kmc]);
}

export function buildAutomation(owner) {
  const A = new Acc();
  const X0 = -167, X1 = -139, Z0 = -163, Z1 = -138, G = 4.6, FL = 4.0, T = G + 2 * FL;   // three storeys
  A.box('slate', X0, X1, 0, G, Z0, Z1);
  A.box('charcoal', X0, X1, G, T + 1.0, Z0, Z1);
  A.box('roof', X0 + 0.3, X1 - 0.3, T + 1.0, T + 1.1, Z0 + 0.3, Z1 - 0.3);
  const faces = [[F('x', X1, 1), Z0, Z1, true], [F('z', Z0, -1), X0, X1, true], [F('z', Z1, 1), X0, X1, true], [F('x', X0, -1), Z0, Z1, false]];
  for (const [f, a0, a1, front] of faces) {
    for (const y of [G, G + FL, T + 0.85]) onFace(A, 'rust', f, a0 - 0.1, a1 + 0.1, y - 0.15, y + 0.2, 0, 0.35);   // orange floor edges
    if (!front) { for (let a = a0 + 2; a < a1 - 3; a += 5) onFace(A, 'glass', f, a, a + 2.4, G + 1.2, T - 1.0, 0, 0.04); continue; }
    // big slat screens on the upper floors, glazing behind
    for (const [b0, b1] of [[a0 + 1.2, (a0 + a1) / 2 - 1.5], [(a0 + a1) / 2 + 1.5, a1 - 1.2]]) {
      onFace(A, 'glass', f, b0, b1, G + 0.6, T - 0.4, 0, 0.04);
      for (let a = b0; a <= b1; a += 0.45) onFace(A, 'slat', f, a - 0.06, a + 0.06, G + 0.3, T + 0.6, 0.1, 0.55);
    }
    // ground floor: dark-framed glazing in the slate-blue wall
    for (let a = a0 + 1.5; a < a1 - 3; a += 4.2) {
      onFace(A, 'glass', f, a, a + 3.2, 0.5, G - 0.8, 0, 0.04);
      onFace(A, 'charcoal', f, a - 0.12, a + 3.32, G - 0.8, G - 0.65, 0, 0.08);
    }
  }
  // entrance canopy and the orange sign box on the east front
  const E = F('x', X1, 1), zc = (Z0 + Z1) / 2;
  onFace(A, 'charcoal', E, zc - 4, zc + 4, G - 1.0, G - 0.6, 0, 2.6);
  onFace(A, 'orangeSign', E, zc - 4.5, zc + 1.5, G + 0.9, G + 3.1, 0.3, 0.9);
  const x = X1 + 0.92, y0 = G + 1.1, y1 = G + 2.9, zS = zc + 1.3, zN = zc - 4.3;                    // faces east: south on the left
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([x, y0, zS, x, y0, zN, x, y1, zN, x, y0, zS, x, y1, zN, x, y1, zS], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
  g.computeVertexNormals();
  g.userData.owner = new Int32Array(2).fill(owner);
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 320;
  const c = cv.getContext('2d');
  c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '600 92px "IBM Plex Sans Thai", sans-serif'; c.fillText('ภาควิชาวิศวกรรมอัตโนมัติ', 512, 115);
  c.font = '500 70px "IBM Plex Sans Thai", sans-serif'; c.fillText('Automation Engineering', 512, 225);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const sign = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.7 }));
  sign.userData.kind = 'building';
  return done(A, owner, T + 1.1, [sign]);
}

const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
export const ALUMNI_OUTLINE = [[-372, -370], [-340, -370], [-340, -338], [-344, -338], [-344, -308], [-366, -308], [-366, -338], [-372, -338], [-372, -370]];
export const THEPCAN_OUTLINE = [[-247, -247], [-201, -247], [-201, -240], [-192, -240], [-192, -226], [-201, -226], [-201, -219], [-247, -219], [-247, -247]];
export const NANO_OUTLINE = [[-100, -137], [-76, -137], [-76, -132], [-48, -132], [-48, -114], [-76, -114], [-76, -101], [-100, -101], [-100, -137]];
export const BANK_OUTLINE = rect(-130, -115, -174, -88);
export const KRUNGSRI_OUTLINE = rect(-141.1, -129.1, -107, -79.6);
export const BANKW_OUTLINE = rect(-114.8, -102.7, -108, -79.7);
export const CLINIC_OUTLINE = [[-91, -189], [-41.2, -189], [-41.2, -162], [-91, -162], [-91, -189]];
export const AUTOMATION_OUTLINE = rect(-167, -139, -163, -138);
