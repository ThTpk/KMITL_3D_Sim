// Hand-built model of CMKL University (OSM way 784091346), north-west of the central library.
// Surveyed 2026-10-17 from Google Maps satellite imagery (the angular stepped roofs with solar panels, the curved
// terraces facing the library) and Google Street View from the road along the north side (the glass tower and
// the orange-trimmed footbridge) and the road along the west side. Photos were only looked at.
//
// x = east, z = south, y = up.
//   a ten-storey tower of blue-green curtain-wall glass in the north-west, its north-east corner cut at an angle
//   a seven-storey cream block south of it with horizontal louvre screens, stepping down in solar-panelled roofs
//   curved stepped terraces (an outdoor amphitheatre) opening south-east toward the library
import { Acc, F, onFace, facade, block, solar, mats, meshes, BASE_MATS } from './kit.js';

export function buildCmkl(owner) {
  const A = new Acc();
  // glass tower with a cut corner
  const H = 4.6 + 9 * 3.7;
  const ring = [[22, -14], [40, -14], [48, -6], [48, 10], [22, 10]];
  A.prism('curtain', ring, 0, H);
  for (let k = 1; k <= 10; k++) {
    const y = 4.6 + (k - 1) * 3.7;
    A.prism('mullion', ring.map(([x, z]) => [x + (x < 35 ? -0.12 : 0.12), z + (z < 0 ? -0.12 : 0.12)]), y - 0.1, y + 0.1, { top: false });
  }
  A.prism('white', ring, H, H + 1.0);
  // cream block, stepping down
  const oc = { G: 4.6, FL: 3.7, bay: 2.6, style: 'band', mats: { wall: 'cream', glass: 'louvre', pier: 'cream', band: 'white' } };
  const t7 = block(A, 22, 40, 10, 32, { ...oc, n: 7 }, { n: false });
  const t5 = block(A, 40, 52, 10, 32, { ...oc, n: 5 }, { n: false, w: false });
  solar(A, 22.5, 39.5, 11, 31, t7 + 0.1);
  solar(A, 40.5, 51.5, 11, 31, t5 + 0.1);
  // curved terraces toward the library (centre 70, 30)
  for (let s = 0; s < 6; s++) {
    const r0 = 26 - s * 2.4, r1 = 28.4 - s * 2.4, y = 0.6 + s * 0.55;
    const arc = [];
    for (let i = 0; i <= 10; i++) { const t = Math.PI + (i / 10) * (Math.PI / 2); arc.push([70 + r1 * Math.cos(t), 30 + r1 * Math.sin(t)]); }
    for (let i = 10; i >= 0; i--) { const t = Math.PI + (i / 10) * (Math.PI / 2); arc.push([70 + r0 * Math.cos(t), 30 + r0 * Math.sin(t)]); }
    A.prism(s % 2 ? 'paving' : 'lawn', arc, 0, y);
  }

  const MAT = mats({ ...BASE_MATS, curtain: { color: '#4f8a95', roughness: 0.2, metalness: 0.4 }, mullion: { color: '#d4dadc', metalness: 0.4, roughness: 0.4 },
    white: '#f1efea', cream: '#ece3cf', louvre: { color: '#c9c7c0', roughness: 0.6, metalness: 0.2 }, lawn: { color: '#6c8b4b', roughness: 1 } });
  return { meshes: meshes(A, MAT, owner), top: H + 1 };
}

export const CMKL_OUTLINE = [[22, -14], [40, -14], [48, -6], [48, 10], [52, 10], [52, 32], [22, 32], [22, -14]];
