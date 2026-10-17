// Hand-built model of the sports hall (โรงยิม) between the railway road and the tennis courts, x -592..-500. It is
// not in OpenStreetMap; its outline was given by the user and is stored in overrides.json (id -1, "ll").
// Surveyed 2026-10-17 from Google Maps satellite imagery (a long hall under two light roofs with solar panels, an
// annex at the east end) and Google Street View from the road along the south side (the whole south face, the
// entrance portico at the south-west corner), the west lawn (the west gable end) and the east road (the annex).
// The user's outline also takes in the road and forecourt; the model follows the building in the imagery.
// Photos were only looked at.
//
// x = east, z = south, y = up.
//   a tall hall: orange walls to about 5.5 m, then a grey upper band standing slightly proud with two rows of large
//   white-framed windows and louvres along both long sides; plain grey gable ends with an orange base; a shallow
//   light metal gabled roof with solar panels, ridge east-west, in two lengths
//   a portico of square granite-faced frames over the entrance at the south-west corner
//   a two-storey annex at the east end: orange ground floor, grey upper floor with windows
import { Acc, F, onFace, gable, mats, meshes, BASE_MATS } from './kit.js';

export function buildGymN(owner) {
  const A = new Acc();
  const X0 = -592, X1 = -510, Z0 = -110, Z1 = -77, O = 5.5, H = 11.2, rise = 2.6;
  A.box('orange', X0, X1, 0, O, Z0, Z1);
  A.box('grey', X0 - 0.4, X1 + 0.4, O, H, Z0 - 0.4, Z1 + 0.4);
  A.box('dark', X0 - 0.45, X1 + 0.45, O - 0.1, O + 0.15, Z0 - 0.45, Z1 + 0.45);
  for (const f of [F('z', Z0 - 0.4, -1), F('z', Z1 + 0.4, 1)]) {
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
    gable(A, 'roofSheet', x0, x1, Z0 - 0.4, Z1 + 0.4, H, rise, { eave: 0.8, end: 'grey' });
    for (const [z0, z1, s] of [[Z0 + 1, (Z0 + Z1) / 2 - 1, -1], [(Z0 + Z1) / 2 + 1, Z1 - 1, 1]])
      for (let z = z0; z < z1 - 1.8; z += 2.2) for (let x = x0 + 1.5; x < x1 - 2; x += 2.1) {
        const y = H + rise * (1 - Math.abs(z + 0.9 - (Z0 + Z1) / 2) / ((Z1 - Z0) / 2 + 0.4)) + 0.12;
        A.box('solar', x, x + 1.9, y, y + 0.1, z, z + 1.8);
      }
  }
  // entrance portico at the south-west corner
  for (let i = 0; i < 3; i++) {
    const x = X0 + 2 + i * 5;
    A.box('granite', x, x + 1.2, 0, 6.2, Z1 + 0.2, Z1 + 5);
  }
  A.box('granite', X0 + 1.5, X0 + 13.5, 5.2, 6.6, Z1 + 0.2, Z1 + 5);
  // annex at the east end
  A.box('orange', X1, -500, 0, 3.8, -106, -81);
  A.box('grey', X1, -500, 3.8, 8.0, -106, -81);
  for (const f of [F('x', -500, 1)]) { onFace(A, 'glass', f, -104, -84, 4.8, 7.2, 0, 0.05); onFace(A, 'glass', f, -104, -84, 2.0, 3.0, 0, 0.05); }
  A.box('roof', X1, -500, 8.0, 8.4, -106, -81);

  const MAT = mats({ ...BASE_MATS, orange: '#e8823a', grey: '#a3a8ad', white: '#f2f2f0', granite: { color: '#cdbfae', roughness: 1 },
    roofSheet: '#cfd2d1', louvre: { color: '#c8cacb', roughness: 0.6 }, glassBlock: { color: '#b9c9c3', roughness: 0.5 }, glass: { color: '#5f7380' } });
  return { meshes: meshes(A, MAT, owner), top: H + rise };
}

export const GYMN_OUTLINE = [[-592, -110], [-510, -110], [-510, -106], [-500, -106], [-500, -81], [-510, -81], [-510, -77], [-592, -77], [-592, -110]];
