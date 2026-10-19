// Hand-built models of the Faculty of Architecture group: อาคารเรียนรวมสถาปัตย์ (OSM way 516204090),
// หอประชุมสถาปัตยกรรมศาสตร์ (190881393) and ตึกที่ติดกับหอประชุมสถาปัตยกรรมศาสตร์ (190880792).
// Surveyed 2026-10-17 from Google Maps satellite imagery (the two long bars and their link, the auditorium hall
// with its round drum and east porch, the flat-roofed block south of it) and Google Street View from the road
// along the west side (the auditorium's brick walls, the south block), the road to the north and the courtyard
// south of the south block. Photos were only looked at.
//
// x = east, z = south, y = up.
//   lecture building: two long three-storey bars (x -265..-167) joined by a link; white walls with tall orange
//   vertical strips between the windows, an open ground floor behind columns, light metal gabled roofs; on the
//   street (north) face: white fins, a deep white canopy over glazed rooms and the orange AAD logo (2026-10-19)
//   auditorium: a tall blank box of red brick crossed by thin white bands, a glazed entrance on the west; a round
//   drum on its east half under a shallow dome, a porch on the east
//   south block: four storeys, a red-brick ground floor, the upper floors behind dark-grey horizontal metal
//   louvre screens on steel frames, a flat roof
import { Acc, F, onFace, facade, block, pilotis, hip, chain, mats, meshes, BASE_MATS } from './kit.js';

const MAT_SPEC = { ...BASE_MATS, wall: '#efede8', band: '#f6f4f0', orange: '#d9773f', brick: { color: '#b0573d' },
  roofSheet: '#c3c5c4', shade: '#8a5f3d', louvre: { color: '#5d6266', roughness: 0.5, metalness: 0.4 }, glass: { color: '#6f7d84' } };

// street: the north face of the north bar (re-surveyed 2026-10-19 from Cinematic EP.1, youtu.be/3VEUZdzv2EA
// 2:00): glazed rooms and a breeze-block panel on the ground floor under a deep white canopy slab, white fins on
// the upper floors with a brown sunshade under the eaves, and the orange AAD logo (three hexagons) over the
// canopy at the east end; the other long faces keep the orange strips seen from the courtyard.
function bar(A, x0, x1, z0, z1, street = false) {
  const G = 4.2, FL = 3.8, H = G + 2 * FL;
  pilotis(A, x0, x1, z0, z1, G, { step: 6, inset: 2.5 });
  block(A, x0, x1, z0, z1, { y0: G, G: FL, n: 2, bay: 3.2, style: 'punched' }, {});
  for (const f of [F('z', z0, -1), F('z', z1, 1)]) {
    const isStreet = street && f.at === z0;
    for (let x = x0 + 3; x < x1 - 2; x += isStreet ? 3.2 : 6.4)
      onFace(A, isStreet ? 'band' : 'orange', f, x, x + (isStreet ? 0.3 : 0.9), G, H, 0, isStreet ? 0.6 : 0.25);
  }
  if (street) {
    const f = F('z', z0, -1);
    onFace(A, 'wall', f, x0, x1, 0, G - 0.6, 0, 2.4);                        // ground-floor rooms brought out to the line
    for (let x = x0 + 1; x < x1 - 4; x += 5.6) onFace(A, 'glass', f, x, x + 3.6, 0.3, G - 1.0, 2.4, 2.45);
    onFace(A, 'band', f, x1 - 25, x1 - 22, 0.4, G - 1.0, 2.4, 2.46);         // breeze-block panel
    onFace(A, 'band', f, x0 - 0.3, x1 + 0.3, G - 0.6, G, 0, 3.6);            // deep white canopy slab
    onFace(A, 'shade', f, x0, x1, H - 0.9, H - 0.4, 0, 1.4);                 // brown sunshade under the eaves
    // AAD logo: three orange hexagon rings standing on the canopy near the east end, the letters west of them
    const z = z0 - 2.6;
    for (const [cx, cy] of [[x1 - 4.5, G + 2.6], [x1 - 7.3, G + 2.6], [x1 - 5.9, G + 4.9]]) {
      const pts = [];
      for (let i = 0; i <= 6; i++) { const t = Math.PI / 6 + (i * Math.PI) / 3; pts.push([cx + 1.45 * Math.cos(t), cy + 1.45 * Math.sin(t), z, 0.22]); }
      chain(A, 'orange', pts, 4);
    }
    for (const x of [x1 - 12.2, x1 - 15.2]) A.box('orange', x, x + 2.2, G, G + 3.6, z - 0.2, z + 0.2);  // the "A" letters, blocky
  }
  hip(A, 'roofSheet', x0, x1, z0, z1, H + 0.9, 2.2, 0.8);
}

export function buildArchLec(owner) {
  const A = new Acc();
  bar(A, -265, -168, 210, 229, true);
  bar(A, -265, -168, 259, 280);
  block(A, -233, -218, 229, 259, { G: 4.2, FL: 3.8, n: 3, bay: 3.2, style: 'corridor' }, { n: false, s: false });
  return { meshes: meshes(A, mats(MAT_SPEC), owner), top: 17 };
}

export function buildArchAud(owner) {
  const A = new Acc();
  const H = 15.5;
  A.box('brick', -345, -318, 0, H, 226, 262);
  for (const y of [5, 10]) A.box('band', -345.2, -317.8, y, y + 0.35, 225.8, 262.2);
  A.box('band', -345.3, -317.7, H, H + 0.6, 225.7, 262.3);
  onFace(A, 'glass', F('x', -345, -1), 238, 250, 0.3, 3.4, 0, 0.05);
  A.box('roof', -344.7, -318.3, H + 0.6, H + 0.7, 226.3, 261.7);
  A.cyl('wall', -303, 244, 17, 0, 12.5, 32);
  // shallow stepped dome over the drum
  for (let i = 0; i < 6; i++) {
    const t0 = (i / 6) * (Math.PI / 2), t1 = ((i + 1) / 6) * (Math.PI / 2);
    A.cyl('roof', -303, 244, 17 * Math.cos(t0), 12.5 + Math.sin(t0) * 3, 12.5 + Math.sin(t1) * 3, 32);
  }
  block(A, -290, -275, 232, 258, { G: 4.4, FL: 3.8, n: 2, bay: 4 }, { w: false });
  return { meshes: meshes(A, mats(MAT_SPEC), owner), top: 15.5 };
}

export function buildArchSouth(owner) {
  const A = new Acc();
  const X0 = -340, X1 = -282, Z0 = 278, Z1 = 318, G = 4.2, FL = 3.7, T = G + 3 * FL;
  block(A, X0, X1, Z0, Z1, { G, FL, n: 4, bay: 4, style: 'band', mats: { glass: 'glass' } }, {});
  A.box('brick', X0 - 0.05, X1 + 0.05, 0, G, Z0 - 0.05, Z1 + 0.05);
  for (const [f, a0, a1] of [[F('z', Z0, -1), X0, X1], [F('z', Z1, 1), X0, X1], [F('x', X0, -1), Z0, Z1], [F('x', X1, 1), Z0, Z1]])
    for (let y = G + 0.6; y < T; y += 0.45) onFace(A, 'louvre', f, a0, a1, y, y + 0.12, 1.0, 1.15);
  onFace(A, 'glass', F('z', Z1, 1), -320, -300, 0.3, 3.6, 0, 0.05);
  A.box('band', -322, -298, 3.8, 4.2, Z1, Z1 + 3);
  return { meshes: meshes(A, mats(MAT_SPEC), owner), top: T + 1 };
}

const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
export const ARCHLEC_OUTLINE = [[-265, 210], [-168, 210], [-168, 229], [-218, 229], [-218, 259], [-168, 259], [-168, 280], [-265, 280], [-265, 259], [-233, 259], [-233, 229], [-265, 229], [-265, 210]];
export const ARCHAUD_OUTLINE = [[-345, 226], [-318, 226], [-318, 227], [-303, 227], [-290, 232], [-275, 232], [-275, 258], [-290, 258], [-303, 261], [-318, 261], [-318, 262], [-345, 262], [-345, 226]];
export const ARCHSOUTH_OUTLINE = rect(-340, -282, 278, 318);
