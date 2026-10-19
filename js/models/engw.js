// Hand-built models of buildings in the west part of the engineering faculty:
// ภาควิชาวิศวกรรมเครื่องกล (OSM way 190889051), ตึกบูรณาการ (190886413), ยิมเล็ก (190886418),
// โรงอาหาร 3 (C) (190890100) and ภาคอุตสาหการ (516204087).
// Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads
// round each building. Photos were only looked at.
//
// x = east, z = south, y = up.
//   ภาควิชาวิศวกรรมเครื่องกล: four storeys of white render with deep floor slabs, big windows over red-brick
//   spandrels, a canopy on round columns over the entrance with the department's name, a round stair at the
//   north-west corner
//   ตึกบูรณาการ: five storeys; the lower three in salmon tile with punched windows under white sunshade
//   louvres, the upper two in cream; a six-storey centre tower with a three-hexagon emblem, a deep tan canopy over
//   the entrance on the north; light metal gabled roofs on the long wings
//   ยิมเล็ก: a tall orange hall with a long band of white-framed windows on an orange ledge high up on both long
//   sides, a light metal hipped roof with deep eaves (re-surveyed 2026-10-19, see buildGym)
//   โรงอาหาร 3 (C): two storeys of pale peach render, shops on the ground floor under a solid cream band with a
//   white rail, an open upper floor, a red metal hipped roof with deep eaves and a white clerestory box through
//   it; a three-storey pink block on its east side (re-surveyed 2026-10-19, see buildCanC)
//   ภาคอุตสาหการ: an L of two- and three-storey cream blocks with light metal gabled roofs
import { Acc, F, onFace, facade, block, pilotis, hip, mats, meshes, BASE_MATS } from './kit.js';

const SPEC = { ...BASE_MATS, wall: '#f0efeb', band: '#f7f6f2', brick: { color: '#b0573d' }, salmon: '#d9a383', cream: '#ece4d2',
  tan: '#c9a26b', orange: '#e27f5a', slate: '#7d8c98', pink: '#ecd0bd', red: { color: '#a8473a', roughness: 0.8 },
  roofSheet: '#c3c5c4', winFrame: '#f2f1ec', rail: '#f4f4f2', step: '#c9c6bf', emblem: '#3c4148', sign: '#e9e7e2', glass: { color: '#6f7d84' } };
const done = (A, owner, top) => ({ meshes: meshes(A, mats(SPEC), owner), top });

export function buildMech(owner) {
  const A = new Acc();
  const o = { G: 4.4, FL: 3.8, n: 4, bay: 4.2, bandDepth: 1.1, spandrel: 'brick' };
  const t = block(A, -460, -405, 8, 40, o, {});
  block(A, -405, -401, 16, 25, { ...o, n: 5, style: 'blank' }, { w: false });
  A.cyl('wall', -454, 37, 3.5, 0, t + 2, 16);
  A.box('band', -440, -420, 4.0, 4.6, 40, 47);
  onFace(A, 'sign', F('z', 47, 1), -438, -422, 4.6, 5.6, 0, 0.15);
  for (const x of [-438, -422]) A.cyl('wall', x, 46, 0.35, 0, 4.0, 10);
  A.box('roof', -459.7, -405.3, t, t + 0.12, 8.3, 39.7);
  return done(A, owner, t + 2);
}

export function buildInteg(owner) {
  const A = new Acc();
  const G = 4.2, FL = 3.6;
  const o = { G, FL, n: 5, bay: 3.6, style: 'punched', mats: { wall: 'cream' } };
  const wings = [[-497, -448, 224, 249], [-427, -386, 222, 248]];
  let t = 0;
  for (const [x0, x1, z0, z1] of wings) {
    t = block(A, x0, x1, z0, z1, o, {});
    A.box('salmon', x0 - 0.05, x1 + 0.05, 0, G + 2 * FL, z0 - 0.05, z1 + 0.05);
    for (const f of [F('z', z0, -1), F('z', z1, 1)]) for (let k = 0; k < 3; k++) for (let x = x0 + 1.4; x < x1 - 1.6; x += 3.6) {
      const y = k === 0 ? 1.2 : G + (k - 1) * FL + 0.9;
      onFace(A, 'glass', f, x, x + 1.6, y, y + 1.8, 0, 0.1);
      onFace(A, 'band', f, x - 0.2, x + 1.8, y + 1.9, y + 2.1, 0, 0.6);
    }
    hip(A, 'roofSheet', x0, x1, z0, z1, t + 0.9, 2.4, 0.6);
  }
  // centre tower with the emblem, canopy on the north
  const tc = block(A, -448, -427, 219, 252, { ...o, n: 6, style: 'punched' }, {});
  A.box('salmon', -448.05, -426.95, 0, G + 2 * FL, 218.95, 252.05);
  for (let i = 0; i < 3; i++) {
    const cx = -437.5 + [-1.6, 1.6, 0][i], cy = tc - 5 + [0, 0, -2.6][i];
    onFace(A, 'emblem', F('z', 219, -1), cx - 1.4, cx + 1.4, cy - 1.2, cy + 1.2, 0, 0.12);
  }
  A.box('tan', -446, -429, 4.2, 5.6, 210, 219);
  return done(A, owner, tc + 1);
}

// ยิมเล็ก (ยิมเนเซียม 1) re-surveyed 2026-10-19 from the clips youtu.be/xTK53jBjDFQ 0:05-0:08 and
// youtu.be/lod-jYKKEZ0 5:50: the walls are orange up to about 5 m; above them a long band of white-framed
// windows (two rows of small top-hung sashes) stands out on an orange ledge with a sloped underside and runs the
// whole length of both long sides under the roof eave, where the steel roof ties show; a flat orange canopy on
// steel hangers over the door on the south, with steps.
export function buildGym(owner) {
  const A = new Acc();
  const X0 = -498, X1 = -448, Z0 = 103, Z1 = 135, H = 9.6, W0 = 5.2;
  A.box('orange', X0, X1, 0, H, Z0, Z1);
  for (const [f, a0, a1] of [[F('z', Z0, -1), X0, X1], [F('z', Z1, 1), X0, X1]]) {
    onFace(A, 'orange', f, a0, a1, W0 - 0.6, W0, 0, 1.0);                                      // ledge
    onFace(A, 'orange', f, a0, a1, W0 - 1.0, W0 - 0.6, 0, 0.5);                                // its sloped underside, stepped
    onFace(A, 'winFrame', f, a0 + 0.3, a1 - 0.3, W0, H - 0.2, 0.55, 0.95);                    // window band
    onFace(A, 'glass', f, a0 + 0.4, a1 - 0.4, W0 + 0.1, H - 0.3, 0.95, 0.98);
    for (let a = a0 + 0.4; a < a1 - 0.3; a += 1.1) onFace(A, 'winFrame', f, a, a + 0.09, W0 + 0.1, H - 0.3, 0.95, 1.03);
    for (const y of [W0 + 1.15, W0 + 2.3, W0 + 3.3]) onFace(A, 'winFrame', f, a0 + 0.4, a1 - 0.4, y - 0.05, y + 0.05, 0.95, 1.03);
    for (let a = a0 + 2; a < a1 - 1; a += 3.3) onFace(A, 'winFrame', f, a, a + 0.9, W0 + 1.2, W0 + 1.26, 1.0, 1.4);  // open sashes
  }
  // door canopy and steps on the south side, near the west end
  onFace(A, 'orange', F('z', Z1, 1), X0 + 4, X0 + 12, 3.6, 3.85, 0, 2.4);
  onFace(A, 'metal', F('z', Z1, 1), X0 + 4.2, X0 + 4.3, 3.85, W0 - 0.6, 0, 2.3);
  onFace(A, 'metal', F('z', Z1, 1), X0 + 11.7, X0 + 11.8, 3.85, W0 - 0.6, 0, 2.3);
  onFace(A, 'glass', F('z', Z1, 1), X0 + 7, X0 + 8.8, 0.9, 3.2, 0, 0.05);
  for (let s = 0; s < 5; s++) onFace(A, 'step', F('z', Z1, 1), X0 + 5.5, X0 + 10.5, 0, 0.18 * (5 - s), 0, 0.35 * (s + 1));
  hip(A, 'roofSheet', X0, X1, Z0, Z1, H, 2.6, 1.6);
  return done(A, owner, H + 2.6);
}

// โรงอาหาร 3 (C) re-surveyed 2026-10-19 from youtu.be/lod-jYKKEZ0 4:42 (the street front): pale peach columns,
// shop fronts on the ground floor (7-Eleven, a copy shop), a solid cream band over them with a white rail along
// its top, the open dining floor above, a red metal hipped roof with deep eaves and a white clerestory box with
// windows rising through the middle of the roof under its own red roof.
export function buildCanC(owner) {
  const A = new Acc();
  const X0 = -660, X1 = -622, Z0 = 103, Z1 = 131, G = 3.8;
  A.box('pink', X0 + 2, X1 - 2, 0, G, Z0 + 2, Z1 - 2);
  for (const [f, a0, a1] of [[F('z', Z0, -1), X0 + 2, X1 - 2], [F('z', Z1, 1), X0 + 2, X1 - 2], [F('x', X0, -1), Z0 + 2, Z1 - 2], [F('x', X1, 1), Z0 + 2, Z1 - 2]]) {
    const ff = { ...f, at: f.at - f.out * 2 };
    for (let a = a0 + 0.8; a < a1 - 1; a += 6.3) onFace(A, 'glass', ff, a, a + 5, 0.1, G - 0.9, 0, 0.05);   // shop fronts
  }
  for (let x = X0 + 0.4; x <= X1; x += 6.3) for (const z of [Z0 + 0.4, Z1 - 0.4]) A.box('pink', x - 0.3, x + 0.3, 0, 7.6, z - 0.3, z + 0.3);
  A.box('cream', X0, X1, G - 0.6, G + 0.5, Z0, Z1);                                            // solid band over the shops
  A.box('pink', X0 + 3, X1 - 3, G + 0.5, 7.6, Z0 + 3, Z1 - 3);
  for (const [f, a0, a1] of [[F('z', Z0, -1), X0, X1], [F('z', Z1, 1), X0, X1], [F('x', X0, -1), Z0, Z1], [F('x', X1, 1), Z0, Z1]]) {
    onFace(A, 'rail', f, a0, a1, G + 1.45, G + 1.55, -0.05, 0.05);
    for (let a = a0; a <= a1; a += 1.2) onFace(A, 'rail', f, a, a + 0.05, G + 0.5, G + 1.5, -0.03, 0.03);
  }
  hip(A, 'red', X0, X1, Z0, Z1, 7.6, 3.2, 2.0);
  // white clerestory box through the middle of the roof
  const cx0 = X0 + 13, cx1 = X1 - 10, cz0 = Z0 + 8, cz1 = Z1 - 8;
  A.box('cream', cx0, cx1, 7.6, 12.2, cz0, cz1);
  for (const [f, a0, a1] of [[F('z', cz0, -1), cx0, cx1], [F('z', cz1, 1), cx0, cx1]])
    for (let a = a0 + 1; a < a1 - 1.5; a += 3.6) onFace(A, 'glass', f, a, a + 3, 10.4, 11.7, 0, 0.05);
  hip(A, 'red', cx0, cx1, cz0, cz1, 12.2, 1.2, 0.6);
  // three-storey pink block east
  const t = block(A, -622, -610, 102, 131, { G: 3.8, FL: 3.6, n: 3, bay: 3.6, style: 'band', mats: { wall: 'pink' } }, { w: false });
  A.box('roof', -621.7, -610.3, t, t + 0.12, 102.3, 130.7);
  return done(A, owner, 13.4);
}

export function buildIndus(owner) {
  const A = new Acc();
  const o = { G: 4.2, FL: 3.8, bay: 3.8, style: 'punched', mats: { wall: 'cream' } };
  const t3 = block(A, -526, -476, 12, 31, { ...o, n: 3 }, {});
  hip(A, 'roofSheet', -526, -476, 12, 31, t3 + 0.9, 2.4, 0.8);
  const t2 = block(A, -529, -514, 31, 54, { ...o, n: 2 }, { n: false });
  hip(A, 'roofSheet', -529, -514, 31, 54, t2 + 0.9, 2.2, 0.8);
  return done(A, owner, t3 + 3.3);
}

const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
export const MECH_OUTLINE = [[-460, 8], [-405, 8], [-405, 16], [-401, 16], [-401, 25], [-405, 25], [-405, 40], [-460, 40], [-460, 8]];
export const INTEG_OUTLINE = [[-497, 224], [-448, 224], [-448, 219], [-427, 219], [-427, 222], [-386, 222], [-386, 248], [-427, 248], [-427, 252], [-448, 252], [-448, 249], [-497, 249], [-497, 224]];
export const GYM_OUTLINE = rect(-498, -448, 103, 135);
export const CANC_OUTLINE = rect(-660, -610, 102, 131);
export const INDUS_OUTLINE = [[-526, 12], [-476, 12], [-476, 31], [-514, 31], [-514, 54], [-529, 54], [-529, 31], [-526, 31], [-526, 12]];
