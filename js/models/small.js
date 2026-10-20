// Hand-built models of small campus buildings: โรงอาหารถิ่นชงโค (OSM way 1049724130), โรงอาหาร ตึก L
// (309557500), 7-Eleven (1138469403), สโมสรนักศึกษา คณะวิศวกรรมศาสตร์ (516204084), คาเฟ่ อเมซอน (1138988422),
// ลานเชียร์ (404292180), สโมสรนักศึกษา (265596519), ตึกกระจก (516204099), สโมสรนักศึกษา คณะครุศาสตร์ฯ
// (1564107227), Lawson 108 (265596521) and อินทนิล (1136346802).
// Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads
// and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and
// follow the imagery. Photos were only looked at.
//
// x = east, z = south, y = up.
//   canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves
//   Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia
//   โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos)
//   club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled
//   gables
//   café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia
//   ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof
import * as THREE from 'three';
import { Acc, F, onFace, block, hip, gable, mats, meshes, BASE_MATS } from './kit.js';
import { textTex } from './ecc.js';

const SPEC = { ...BASE_MATS, wall: '#efede6', cream: '#ece3cf', roofSheet: '#bfc2c1', tile: { color: '#a8473a', roughness: 0.85 },
  steel: { color: '#6a7076', metalness: 0.5, roughness: 0.5 }, orange: '#f08a24', green: '#1f8a4c', red: '#d32f2f', blue: '#2a5caa',
  amazon: '#3d6b35', glass: { color: '#6f7d84' },
  tan: '#d6a373', louvre: { color: '#a9adae', roughness: 0.6, metalness: 0.2 }, brown: '#8a6a52', greyClad: { color: '#8f9395', roughness: 0.6, metalness: 0.3 },
  signBack: '#e9e6dd' };
const done = (A, owner, top) => ({ meshes: meshes(A, mats(SPEC), owner), top });
const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];

function hall(A, x0, x1, z0, z1, H, roof = 'roofSheet', wall = true) {
  if (wall) block(A, x0, x1, z0, z1, { G: H, n: 1, bay: 3.6, style: 'punched', mats: { wall: 'cream' } }, {});
  else for (let x = x0 + 0.3; x <= x1; x += (x1 - x0) / Math.round((x1 - x0) / 5)) for (const z of [z0 + 0.3, z1 - 0.3]) A.box('wall', x - 0.2, x + 0.2, 0, H, z - 0.2, z + 0.2);
  hip(A, roof, x0, x1, z0, z1, H, Math.min(2.4, (Math.min(x1 - x0, z1 - z0)) * 0.12), 1.4);
}

function shop(A, x0, x1, z0, z1, stripes, front) {
  block(A, x0, x1, z0, z1, { G: 4.0, n: 1, bay: 3, style: 'blank' }, {});
  onFace(A, 'glass', front, (front.ax === 'z' ? x0 : z0) + 1, (front.ax === 'z' ? x1 : z1) - 1, 0.3, 2.9, 0, 0.05);
  stripes.forEach((m, i) => onFace(A, m, front, front.ax === 'z' ? x0 : z0, front.ax === 'z' ? x1 : z1, 3.1 + i * 0.3, 3.4 + i * 0.3, 0, 0.1));
}

export function buildTincan(owner) { const A = new Acc(); hall(A, -364, -336, 6, 32, 4.0); return done(A, owner, 6.4); }
// โรงอาหาร ตึก L and the 7-Eleven are one building facing west onto the road: a cream hall with a tan colonnade of
// square piers along the west and south fronts, a band of louvred clerestory windows above it, a flat-roofed middle,
// and at each end a raised block whose roof slopes up to the outer end and folds down at the outer corners into
// grey ribbed triangular prows. The canteen is the north half, the 7-Eleven the south half.
const LX0 = -313, LX1 = -290, LZN = -115, LZS = -78, LG = 4.2, LT = 8.0, LZM = -92;
function lHalf(A, z0, z1, end) {
  const W = F('x', LX0, -1), E = F('x', LX1, 1);
  A.box('paving', LX0 - 2.2, LX1, 0, 0.6, z0, z1);
  A.box('glass', LX0 + 2.0, LX1, 0.6, LG, z0, z1);                                  // glazed ground floor set back
  A.box('cream', LX0, LX1, LG, LT, z0, z1);
  onFace(A, 'louvre', W, z0 + 0.6, z1 - 0.6, LG + 1.0, LT - 1.2, 0, 0.05);           // clerestory louvres
  onFace(A, 'louvre', E, z0 + 0.6, z1 - 0.6, LG + 1.6, LT - 1.2, 0, 0.05);
  onFace(A, 'brown', E, z0, z1, 0, 3.2, 0, 0.05);
  // colonnade: tan beam over square piers along the west front
  onFace(A, 'tan', W, z0, z1, LG - 0.4, LG + 0.5, 0, 0.8);
  for (let z = z0 + 0.4; z < z1 - 0.3; z += 4.2) A.box('tan', LX0 - 0.1, LX0 + 0.7, 0.6, LG, z, z + 0.7);
  if (!end) return;
  // raised end block: roof slopes up to the outer end, grey cladding above the walls, prows at the outer corners
  const dir = end === 'n' ? -1 : 1, zo = end === 'n' ? z0 : z1, zi = zo - dir * 9, yi = LT + 0.4, yo = LT + 3.4;
  const y = (z) => yi + ((yo - yi) * (z - zi)) / (zo - zi);
  const both = (m, a, b, c, d) => { A.quad(m, a, b, c, d); A.quad(m, d, c, b, a); };
  const xa = LX0 - 1.4, xb = LX1 + 1.2, ze = zo + dir * 1.0;
  both('roofSheet', [xa, y(zi) + 0.25, zi], [xb, y(zi) + 0.25, zi], [xb, y(ze) + 0.25, ze], [xa, y(ze) + 0.25, ze]);
  both('greyClad', [xa, y(zi), zi], [xb, y(zi), zi], [xb, y(ze), ze], [xa, y(ze), ze]);
  for (const x of [LX0, LX1]) both('greyClad', [x, LT, zi], [x, LT, zo], [x, y(zo), zo], [x, y(zi), zi]);
  both('greyClad', [LX0, LT, zo], [LX1, LT, zo], [LX1, y(zo), zo], [LX0, y(zo), zo]);
  for (const x of [xa, xb]) {
    const zt = ze - dir * 4.8;
    A.tri('greyClad', [x, y(ze), ze], [x, y(zt), zt], [x, 0.6, ze - dir * 0.4]);
    A.tri('greyClad', [x, 0.6, ze - dir * 0.4], [x, y(zt), zt], [x, y(ze), ze]);
  }
  // the colonnade turns the outer end
  const O = F('z', zo, dir);
  onFace(A, 'tan', O, LX0, LX1, LG - 0.4, LG + 0.5, 0, 0.8);
  for (let x = LX0 + 0.2; x < LX1 - 0.5; x += 4.5) A.box('tan', x, x + 0.7, 0.6, LG, zo + dir * 0.1, zo + dir * 0.8);
  onFace(A, 'louvre', O, LX0 + 0.8, LX1 - 0.8, LG + 1.0, LT - 1.2, 0, 0.05);
}
export function buildLcan(owner) { const A = new Acc(); lHalf(A, LZN, LZM, 'n'); return done(A, owner, LT + 3.7); }
export function buildSeven(owner) {
  const A = new Acc();
  lHalf(A, LZM, LZS, 's');
  for (let s = 0; s < 4; s++) A.box('paving', LX0 - 2.2 - (4 - s) * 0.35, LX0 - 2.2, 0, 0.15 * (s + 1), -91, -83);     // steps up to the shop
  // the 7-ELEVEN sign on the clerestory band, the brand stripes under it
  onFace(A, 'signBack', F('x', LX0, -1), -86.5, -80.5, LG + 1.2, LG + 2.2, 0.06, 0.14);
  onFace(A, 'orange', F('x', LX0, -1), -86.5, -80.5, LG + 1.08, LG + 1.2, 0.06, 0.14);
  // west-facing text (viewer looks east, north on the left)
  const x = LX0 - 0.16, y0 = LG + 1.25, y1 = LG + 2.15, zN = -86.3, zS = -80.7;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([x, y0, zN, x, y0, zS, x, y1, zS, x, y0, zN, x, y1, zS, x, y1, zN], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
  g.computeVertexNormals();
  g.userData.owner = new Int32Array(2).fill(owner);
  const sign = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: textTex('7-ELEVEN', { w: 1024, h: 170, color: '#0f7b45', weight: 700 }), transparent: true, alphaTest: 0.3, roughness: 0.7 }));
  sign.userData.kind = 'building';
  const out = done(A, owner, LT + 3.7);
  out.meshes.push(sign);
  return out;
}
export function buildEngClub(owner) {
  const A = new Acc();
  block(A, -301, -280, 102, 114, { G: 3.8, FL: 3.4, n: 2, bay: 3.6, style: 'punched' }, {});
  return done(A, owner, 7.6);
}
export function buildAmazon(owner) {
  const A = new Acc();
  shop(A, -313, -297, -370, -352, ['amazon'], F('x', -297, 1));
  A.box('wall', -314, -296, 4.0, 4.4, -371, -351);
  return done(A, owner, 4.4);
}
export function buildCheer(owner) {
  const A = new Acc();
  A.box('paving', 431, 471, 0, 0.6, 190, 210);
  hall(A, 431, 471, 190, 210, 7.0, 'roofSheet', false);
  A.box('dark', 431, 471, 5.2, 7.0, 189.6, 189.8);
  return done(A, owner, 9.4);
}
export function buildClub(owner) {
  const A = new Acc();
  block(A, 109, 136, -122, -104, { G: 3.8, FL: 3.4, n: 2, bay: 3.6, style: 'punched' }, {});
  gable(A, 'tile', 109, 136, -122, -104, 7.2, 2.6, { eave: 0.8 });
  block(A, 124, 146, -110, -93, { G: 3.8, n: 1, bay: 3.6, style: 'punched' }, {});
  gable(A, 'tile', 124, 146, -110, -93, 3.8, 2.2, { eave: 0.8 });
  return done(A, owner, 9.8);
}
export function buildGlass(owner) {
  const A = new Acc();
  const t = block(A, -40, -10, -104, -88, { G: 4.4, FL: 3.8, n: 2, bay: 4.2, style: 'band', mats: { glass: 'glass' } }, {});
  for (const f of [F('z', -104, -1), F('z', -88, 1)]) for (let x = -36; x < -12; x += 8) onFace(A, 'glass', f, x, x + 5.6, 1.0, t - 1.0, 0, 0.06);
  A.box('roof', -39.7, -10.3, t, t + 0.12, -103.7, -88.3);
  return done(A, owner, t + 0.9);
}
export function buildKruClub(owner) {
  const A = new Acc();
  const t = block(A, 272, 290.5, -110, -101, { G: 3.4, FL: 3.0, n: 2, bay: 3.6, style: 'punched' }, {});
  for (const x of [280, 284.5]) onFace(A, 'red', F('z', -101, 1), x, x + 3.6, 3.8, 6.0, 0, 0.12);
  gable(A, 'roofSheet', 272, 290.5, -110, -101, t, 1.3, { eave: 0.9 });
  return done(A, owner, t + 1.3);
}
export function buildLawson(owner) { const A = new Acc(); shop(A, 44, 55, -134, -120, ['blue', 'wall'], F('x', 44, -1)); return done(A, owner, 4.2); }
export function buildInthanin(owner) {
  const A = new Acc();
  shop(A, -192, -179, -234, -226, ['green'], F('z', -226, 1));
  A.box('wall', -193, -178, 4.0, 4.4, -235, -225);
  return done(A, owner, 4.4);
}

export const TINCAN_OUTLINE = rect(-364, -336, 6, 32);
export const LCAN_OUTLINE = rect(LX0 - 2.2, LX1, LZN - 1, LZM);
export const SEVEN_OUTLINE = rect(LX0 - 2.2, LX1, LZM, LZS + 1);
export const ENGCLUB_OUTLINE = rect(-301, -280, 102, 114);
export const AMAZON_OUTLINE = rect(-313, -297, -370, -352);
export const CHEER_OUTLINE = rect(431, 471, 190, 210);
export const CLUB_OUTLINE = [[109, -122], [136, -122], [136, -110], [146, -110], [146, -93], [124, -93], [124, -104], [109, -104], [109, -122]];
export const GLASS_OUTLINE = rect(-40, -10, -104, -88);
export const KRUCLUB_OUTLINE = rect(272, 290.5, -110, -101);
export const LAWSON_OUTLINE = rect(44, 55, -134, -120);
export const INTHANIN_OUTLINE = rect(-192, -179, -234, -226);
