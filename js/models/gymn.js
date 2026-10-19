// Hand-built model of the sports hall (โรงยิม) between the railway road and the tennis courts, x -592..-500. It is
// not in OpenStreetMap; its outline was given by the user and is stored in overrides.json (id -1, "ll").
// Surveyed 2026-10-17 from Google Maps satellite imagery (a long hall under two light roofs with solar panels, an
// annex at the east end) and Google Street View from the road along the south side (the whole south face, the
// entrance portico at the south-west corner), the west lawn (the west gable end) and the east road (the annex).
// The user's outline also takes in the road and forecourt; the model follows the building in the imagery.
// The end towers and the canted upper walls were added 2026-10-19 from the KMITL Virtual Tour (ศูนย์กีฬา 1 and 3,
// at the road corner and on the walk by the football pitch) and the SIIE "Key locations" film (7:15); the east end
// from the user's Virtual Tour photo (สนามแบดมินตัน, from the road corner south-east of the hall).
// Photos were only looked at.
//
// x = east, z = south, y = up.
//   a tall hall: orange walls to about 5.5 m, then a grey upper band leaning out over them on a sloped ledge, with two
//   rows of large white-framed windows and louvres along both long sides; grey gable ends with an orange base, each
//   with a square grey tower at the south corner rising above the roof that carries a round cross-barred window and a
//   grid of small square vents (a smaller tower with a round window at the north-east corner); a shallow light metal
//   gabled roof with solar panels, ridge east-west, in two lengths
//   a portico of square granite-faced frames over the entrance at the south-west corner
//   a two-storey annex across the whole east end: orange ground floor with small top-hung windows and AC units, a
//   grey upper floor with big windows in groups, a grey louvred plant box on its roof against the hall's gable
import { Acc, F, onFace, gable, mats, meshes, BASE_MATS } from './kit.js';

export function buildGymN(owner) {
  const A = new Acc();
  const X0 = -592, X1 = -510, Z0 = -110, Z1 = -77, O = 5.5, H = 11.2, rise = 2.6;
  const C = 1.0, L = 0.7;                                                     // upper walls lean out C m over a ledge L high
  A.box('orange', X0, X1, 0, O, Z0, Z1);
  A.box('grey', X0 - 0.4, X1 + 0.4, O + L, H, Z0 - C, Z1 + C);
  A.box('grey', X0 - 0.4, X1 + 0.4, O, O + L, Z0, Z1);
  for (const [z, zo] of [[Z0, Z0 - C], [Z1, Z1 + C]]) {                       // sloped ledge under the canted walls
    A.quad('grey', [X0 - 0.4, O, z], [X1 + 0.4, O, z], [X1 + 0.4, O + L, zo], [X0 - 0.4, O + L, zo]);
    A.quad('grey', [X1 + 0.4, O + L, zo], [X1 + 0.4, O, z], [X0 - 0.4, O, z], [X0 - 0.4, O + L, zo]);
  }
  A.box('dark', X0 - 0.45, X1 + 0.45, O - 0.1, O + 0.05, Z0 - 0.05, Z1 + 0.05);
  for (const f of [F('z', Z0 - C, -1), F('z', Z1 + C, 1)]) {
    for (let x = X0 + 2; x < X1 - 4; x += 6.4) {
      onFace(A, 'glass', f, x, x + 5.4, O + 1.0, O + 2.6, 0, 0.05);
      onFace(A, 'glass', f, x, x + 5.4, O + 2.8, H - 1.6, 0, 0.05);
      onFace(A, 'louvre', f, x, x + 5.4, H - 1.5, H - 0.6, 0, 0.06);
      onFace(A, 'white', f, x - 0.2, x, O + 0.9, H - 0.5, 0, 0.1);
    }
    for (let x = X0 + 8; x < X1; x += 12.8) onFace(A, 'white', f, x, x + 0.25, 0, O, 0, 0.12);   // downpipes
  }
  for (const f of [F('z', Z0, -1), F('z', Z1, 1)]) for (let x = X0 + 3; x < X1 - 3; x += 9) onFace(A, 'glassBlock', f, x, x + 4, 3.6, 4.6, 0, 0.05);
  // two roof lengths with solar panels
  for (const [x0, x1] of [[X0, -560], [-560, X1]]) {
    gable(A, 'roofSheet', x0, x1, Z0 - C, Z1 + C, H, rise, { eave: 0.8, end: 'grey' });
    for (const [z0, z1, s] of [[Z0 + 1, (Z0 + Z1) / 2 - 1, -1], [(Z0 + Z1) / 2 + 1, Z1 - 1, 1]])
      for (let z = z0; z < z1 - 1.8; z += 2.2) for (let x = x0 + 1.5; x < x1 - 2; x += 2.1) {
        const y = H + rise * (1 - Math.abs(z + 0.9 - (Z0 + Z1) / 2) / ((Z1 - Z0) / 2 + 0.4)) + 0.12;
        A.box('solar', x, x + 1.9, y, y + 0.1, z, z + 1.8);
      }
  }
  // square grey towers on both gable ends: round cross-barred window, a grid of small square vents above it
  const AX = -500;                                                            // east face of the annex
  for (const [x0, x1, xf, out, ZC, TW, TT, r, vents] of [[X0 - 1.2, X0 + 3, X0 - 1.2, -1, Z1 - 3.4, 4.6, H + rise + 2.6, 1.7, true],
    [AX - 6, AX + 0.6, AX + 0.6, 1, Z1 - 3.6, 4.6, H + rise + 2.6, 1.7, true], [AX - 5, AX + 0.4, AX + 0.4, 1, Z0 + 3.2, 3.2, H + 0.6, 1.0, false]]) {
    A.box('grey', x0, x1, out > 0 ? 5.0 : 0, TT, ZC - TW, ZC + TW);              // the east towers stand on the annex's orange wall
    A.box('white', x0 - 0.1, x1 + 0.1, TT, TT + 0.3, ZC - TW - 0.1, ZC + TW + 0.1);
    const f = F('x', xf, out), cy = TT - (vents ? 4.6 : 1.8), x = xf + out * 0.05;
    for (let i = 0; i < 20; i++) {
      const t0 = (i / 20) * Math.PI * 2, t1 = ((i + 1) / 20) * Math.PI * 2;
      const a = [x, cy, ZC], b = [x, cy + r * Math.sin(t0), ZC + r * Math.cos(t0)], c = [x, cy + r * Math.sin(t1), ZC + r * Math.cos(t1)];
      A.tri('white', a, b, c); A.tri('white', a, c, b);
      const ri = r - 0.25, bi = [x + out * 0.02, cy + ri * Math.sin(t0), ZC + ri * Math.cos(t0)], ci = [x + out * 0.02, cy + ri * Math.sin(t1), ZC + ri * Math.cos(t1)];
      A.tri('glass', [x + out * 0.02, cy, ZC], bi, ci); A.tri('glass', [x + out * 0.02, cy, ZC], ci, bi);
    }
    onFace(A, 'white', f, ZC - r, ZC + r, cy - 0.06, cy + 0.06, 0.03, 0.08);
    onFace(A, 'white', f, ZC - 0.06, ZC + 0.06, cy - r, cy + r, 0.03, 0.08);
    if (vents) for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const z = ZC - 1.2 + i * 0.8, y = TT - 2.3 + j * 0.55;
      onFace(A, 'dark', f, z - 0.14, z + 0.14, y - 0.14, y + 0.14, 0, 0.03);
    }
  }
  // entrance portico at the south-west corner
  for (let i = 0; i < 3; i++) {
    const x = X0 + 2 + i * 5;
    A.box('granite', x, x + 1.2, 0, 6.2, Z1 + 0.2, Z1 + 5);
  }
  A.box('granite', X0 + 1.5, X0 + 13.5, 5.2, 6.6, Z1 + 0.2, Z1 + 5);
  // annex at the east end
  {
    const AO = 5.0, AT = 9.2, Ef = F('x', AX, 1);
    A.box('orange', X1, AX, 0, AO, Z0, Z1);
    A.box('grey', X1, AX + 0.3, AO, AT, Z0, Z1);
    onFace(A, 'dark', Ef, Z0, Z1, AO - 0.05, AO + 0.12, 0.3, 0.45);
    for (const [z0, z1] of [[-98, -94.6], [-93.8, -90.4], [-87.5, -85.8], [-84.4, -82.7], [-108.2, -104.6], [-103.6, -100]]) {
      onFace(A, 'glass', Ef, z0, z1, AO + 0.9, AT - 0.8, 0.3, 0.35);
      onFace(A, 'white', Ef, z0 - 0.12, z1 + 0.12, AT - 0.8, AT - 0.65, 0.3, 0.42);
    }
    for (let z = -97.5; z < -82; z += 1.9) onFace(A, 'awning', Ef, z, z + 1.4, AO - 1.4, AO - 0.6, 0, 0.35);    // small top-hung windows
    for (const z of [-96.5, -87, -81.5]) onFace(A, 'white', Ef, z, z + 1.1, 2.6, 3.4, 0, 0.6);               // AC units
    onFace(A, 'door', Ef, -87.8, -86.6, 0.5, 2.6, 0, 0.05);
    A.box('roof', X1, AX + 0.3, AT, AT + 0.3, Z0, Z1);
    A.box('grey', X1 - 2, AX - 6, AT, AT + 4.2, -100, -88);                                                   // plant box on the roof
    onFace(A, 'louvre', F('x', AX - 6, 1), -95.5, -92.5, AT + 1.6, AT + 3.4, 0, 0.05);
  }

  const MAT = mats({ ...BASE_MATS, orange: '#e8823a', grey: '#a3a8ad', white: '#f2f2f0', granite: { color: '#cdbfae', roughness: 1 },
    roofSheet: '#cfd2d1', louvre: { color: '#c8cacb', roughness: 0.6 }, glassBlock: { color: '#b9c9c3', roughness: 0.5 }, glass: { color: '#5f7380' }, awning: { color: '#8fc3bd', roughness: 0.4 }, door: '#9ab8d6' });
  return { meshes: meshes(A, MAT, owner), top: H + rise };
}

export const GYMN_OUTLINE = [[-592, -110], [-500, -110], [-500, -77], [-592, -77], [-592, -110]];
