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
//   7-Eleven and Lawson: small white shop boxes with a glazed front and the brand colours in stripes on the fascia
//   club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled
//   gables
//   café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia
//   ตึกกระจก: two storeys clad in blue-green glass; ลานเชียร์: an open hall of steel posts under a broad roof
import { Acc, F, onFace, block, hip, gable, mats, meshes, BASE_MATS } from './kit.js';

const SPEC = { ...BASE_MATS, wall: '#efede6', cream: '#ece3cf', roofSheet: '#bfc2c1', tile: { color: '#a8473a', roughness: 0.85 },
  steel: { color: '#6a7076', metalness: 0.5, roughness: 0.5 }, orange: '#f08a24', green: '#1f8a4c', red: '#d32f2f', blue: '#2a5caa',
  amazon: '#3d6b35', curtain: { color: '#4f8a95', roughness: 0.2, metalness: 0.4 }, glass: { color: '#6f7d84' } };
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
export function buildLcan(owner) { const A = new Acc(); hall(A, -304, -283, -110, -90, 3.8, 'roofSheet', false); A.box('cream', -302, -285, 0, 3.8, -108, -103); return done(A, owner, 6.2); }
export function buildSeven(owner) { const A = new Acc(); shop(A, -304, -283, -90, -75, ['orange', 'green', 'red'], F('x', -283, 1)); return done(A, owner, 4.2); }
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
export function buildCheer(owner) { const A = new Acc(); hall(A, 431, 471, 190, 210, 7.0, 'roofSheet', false); A.box('paving', 431, 471, 0, 0.3, 190, 210); return done(A, owner, 9.4); }
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
  A.box('curtain', -40, -10, 0, 8.2, -104, -88);
  for (const y of [4.2, 8.2]) A.box('wall', -40.2, -9.8, y - 0.2, y + 0.3, -104.2, -87.8);
  A.box('roof', -39.8, -10.2, 8.5, 8.6, -103.8, -88.2);
  return done(A, owner, 8.6);
}
export function buildKruClub(owner) {
  const A = new Acc();
  block(A, 272, 295, -110, -101, { G: 3.8, n: 1, bay: 3.6, style: 'punched' }, {});
  gable(A, 'roofSheet', 272, 295, -110, -101, 3.8, 1.4, { eave: 0.8 });
  return done(A, owner, 5.2);
}
export function buildLawson(owner) { const A = new Acc(); shop(A, 44, 55, -134, -120, ['blue', 'wall'], F('x', 44, -1)); return done(A, owner, 4.2); }
export function buildInthanin(owner) {
  const A = new Acc();
  shop(A, -192, -179, -234, -226, ['green'], F('z', -226, 1));
  A.box('wall', -193, -178, 4.0, 4.4, -235, -225);
  return done(A, owner, 4.4);
}

export const TINCAN_OUTLINE = rect(-364, -336, 6, 32);
export const LCAN_OUTLINE = rect(-304, -283, -110, -90);
export const SEVEN_OUTLINE = rect(-304, -283, -90, -75);
export const ENGCLUB_OUTLINE = rect(-301, -280, 102, 114);
export const AMAZON_OUTLINE = rect(-313, -297, -370, -352);
export const CHEER_OUTLINE = rect(431, 471, 190, 210);
export const CLUB_OUTLINE = [[109, -122], [136, -122], [136, -110], [146, -110], [146, -93], [124, -93], [124, -104], [109, -104], [109, -122]];
export const GLASS_OUTLINE = rect(-40, -10, -104, -88);
export const KRUCLUB_OUTLINE = rect(272, 295, -110, -101);
export const LAWSON_OUTLINE = rect(44, 55, -134, -120);
export const INTHANIN_OUTLINE = rect(-192, -179, -234, -226);
