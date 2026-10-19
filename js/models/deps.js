// Hand-built models of engineering department buildings and workshops:
// ภาควิชาวิศวกรรมวัดและควบคุม (OSM way 190889047), ภาควิชาวิศวกรรมเกษตร (190890102) and the two
// เครื่องกล workshop halls (190889049, 190889053).
// Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads
// and car parks round each one. Photos were only looked at.
//
// x = east, z = south, y = up.
//   ภาควิชาวิศวกรรมวัดและควบคุม: a U of three-storey wings, white render with continuous floor slabs and strip
//   windows in grey frames
//   ภาควิชาวิศวกรรมเกษตร: two storeys in a white concrete frame; roller shutters on the ground floor, panels of
//   horizontal louvres and glass block above, top-hung windows under the eaves; a low light metal roof
//   เครื่องกล workshops: tall single-storey halls with strip windows under a deep metal roof overhang, roller doors
import { Acc, F, onFace, block, hip, mats, meshes, BASE_MATS } from './kit.js';

const SPEC = { ...BASE_MATS, wall: '#f0efea', band: '#f6f5f1', roofSheet: '#c3c5c4', shutter: { color: '#a3a9ad', metalness: 0.4, roughness: 0.5 },
  louvre: { color: '#cdb8a2', roughness: 0.6 }, glassBlock: { color: '#b9c1c3', roughness: 0.5 }, glass: { color: '#6f7d84' } };
const done = (A, owner, top) => ({ meshes: meshes(A, mats(SPEC), owner), top });

export function buildControl(owner) {
  const A = new Acc();
  const o = { G: 4.2, FL: 3.7, n: 3, bay: 4, bandDepth: 1.0 };
  let t = block(A, -402, -387, 32, 72, o, { e: { style: 'band' } });
  block(A, -377, -362, 31, 71, o, {});
  block(A, -390, -377, 27, 46, o, { e: false, w: false });
  for (const [x0, x1, z0, z1] of [[-402, -387, 32, 72], [-377, -362, 31, 71], [-387, -377, 27, 46]]) A.box('roof', x0 + 0.3, x1 - 0.3, t, t + 0.12, z0 + 0.3, z1 - 0.3);
  return done(A, owner, t + 0.9);
}

// Re-surveyed 2026-10-19 from the Uni Tour clip (youtu.be/XKpuIm42uQc 5:04, the long face with the department's
// name): per bay a full-width roller shutter, a white band, tan horizontal louvres over the whole lower half of
// the upper floor, a plain white strip, then a row of black-framed top-hung windows or glass block (in runs
// along the face), under a deep flat white roof slab.
export function buildAgEng(owner) {
  const A = new Acc();
  const X0 = -609, X1 = -567, Z0 = 141, Z1 = 168, T = 8.6;
  A.box('wall', X0, X1, 0, T, Z0, Z1);
  for (const [f, a0, a1] of [[F('z', Z0, -1), X0, X1], [F('z', Z1, 1), X0, X1], [F('x', X0, -1), Z0, Z1], [F('x', X1, 1), Z0, Z1]]) {
    const n = Math.round((a1 - a0) / 6), w = (a1 - a0) / n;
    for (let i = 0; i < n; i++) {
      const b0 = a0 + i * w, c0 = b0 + 0.3, c1 = b0 + w - 0.3;
      onFace(A, 'band', f, b0 - 0.3, b0 + 0.3, 0, T, 0, 0.35);                              // white frame columns
      onFace(A, 'shutter', f, c0, c1, 0, 3.6, 0, 0.05);
      for (let y = 4.3; y < 6.5; y += 0.22) onFace(A, 'louvre', f, c0, c1, y, y + 0.13, 0, 0.14);
      if (i % 5 < 3) {                                                                         // windows in runs of three bays
        onFace(A, 'dark', f, c0, c1, 7.3, 8.3, 0, 0.04);
        onFace(A, 'glass', f, c0 + 0.08, c1 - 0.08, 7.38, 8.22, 0.04, 0.06);
        for (let x = c0 + (c1 - c0) / 3; x < c1 - 0.2; x += (c1 - c0) / 3) onFace(A, 'dark', f, x - 0.04, x + 0.04, 7.38, 8.22, 0.04, 0.08);
        for (let x = c0; x < c1 - 0.2; x += (c1 - c0) / 3) {                                    // top-hung sashes pushed out
          onFace(A, 'dark', f, x + 0.06, x + (c1 - c0) / 3 - 0.06, 7.4, 7.47, 0.06, 0.3);
        }
      } else {
        onFace(A, 'glassBlock', f, c0, c1, 7.2, 8.4, 0, 0.06);
        for (let y = 7.5; y < 8.4; y += 0.3) onFace(A, 'band', f, c0, c1, y - 0.02, y + 0.02, 0.06, 0.07);
        for (let x = c0 + 0.3; x < c1; x += 0.3) onFace(A, 'band', f, x - 0.02, x + 0.02, 7.2, 8.4, 0.06, 0.07);
      }
    }
    onFace(A, 'band', f, a0, a1, 3.6, 4.2, 0, 0.3);
  }
  A.box('band', X0 - 1.4, X1 + 1.4, T, T + 0.35, Z0 - 1.4, Z1 + 1.4);                          // deep flat roof slab
  hip(A, 'roofSheet', X0 + 2, X1 - 2, Z0 + 2, Z1 - 2, T + 0.35, 0.8, 0);
  return done(A, owner, T + 1.2);
}

function workshop(owner, x0, x1, z0, z1) {
  const A = new Acc();
  const H = 6.6;
  A.box('wall', x0, x1, 0, H, z0, z1);
  for (const [f, a0, a1] of [[F('z', z0, -1), x0, x1], [F('z', z1, 1), x0, x1]]) {
    onFace(A, 'glass', f, a0 + 1, a1 - 1, 2.0, 3.6, 0, 0.05);
    for (let x = a0 + 4; x < a1; x += 4.3) onFace(A, 'band', f, x - 0.2, x + 0.2, 0, H, 0, 0.25);
    onFace(A, 'shutter', f, a0 + 2, a0 + 6, 0, 4.2, 0, 0.06);
  }
  hip(A, 'roofSheet', x0, x1, z0, z1, H, 1.8, 1.8);
  return done(A, owner, H + 1.8);
}
export const buildWorkshopW = (owner) => workshop(owner, -527, -475, 59, 77);
export const buildWorkshopE = (owner) => workshop(owner, -459, -408, 57, 74);

const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
export const CONTROL_OUTLINE = [[-402, 32], [-390, 32], [-390, 27], [-377, 27], [-377, 31], [-362, 31], [-362, 71], [-377, 71], [-377, 46], [-387, 46], [-387, 72], [-402, 72], [-402, 32]];
export const AGENG_OUTLINE = rect(-609, -567, 141, 168);
export const WORKSHOPW_OUTLINE = rect(-527, -475, 59, 77);
export const WORKSHOPE_OUTLINE = rect(-459, -408, 57, 74);
