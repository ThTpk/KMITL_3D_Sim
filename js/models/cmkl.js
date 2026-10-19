// Hand-built model of CMKL University (OSM way 784091346), north-west of the central library.
// Surveyed 2026-10-17 from Google Maps satellite imagery (the angular stepped roofs with solar panels, the curved
// terraces facing the library) and Google Street View from the road along the north side (the glass tower and
// the orange-trimmed footbridge) and the road along the west side. Photos were only looked at.
//
// x = east, z = south, y = up.
//   a ten-storey tower of blue-green curtain-wall glass in the north-west, its north-east corner cut at an angle
//   a seven-storey cream block south of it with horizontal louvre screens, stepping down in solar-panelled roofs
//   curved stepped terraces (an outdoor amphitheatre) opening south-east toward the library
//   signs (added 2026-10-19 from the SIIE "Key locations" film, 9:05, seen from the road to the north): a white blade
//   at the north-east corner carrying "KMITL" in tall red letters stacked one above the other, a white panel with
//   the CMKL logo on the cut corner and a dark "42 Bangkok" panel below it. Their exact placement is a best guess
//   from that one low-resolution frame.
import * as THREE from 'three';
import { Acc, F, onFace, facade, block, solar, mats, meshes, BASE_MATS } from './kit.js';
import { canvasTex } from './ecc.js';

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

  // ---- signs ----
  const extra = [];
  // a flat sign from p0 (viewer's left) to p1 (right), y0..y1, standing d m out along the outward normal n
  const sign = (tex, p0, p1, y0, y1, n, d = 0.08) => {
    const a = [p0[0] + n[0] * d, p0[1] + n[1] * d], b = [p1[0] + n[0] * d, p1[1] + n[1] * d];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y0, a[1], b[0], y1, b[1], a[0], y1, a[1]], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    g.userData.owner = new Int32Array(2).fill(owner);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, side: THREE.DoubleSide }));
    m.userData.kind = 'building'; extra.push(m);
  };
  // white blade at the north-east corner, "KMITL" stacked in red, facing north
  A.box('white', 38.4, 42.0, 0, H + 1.0, -16.2, -13.8);
  sign(canvasTex(128, 640, (g, w, h) => {
    g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#d6332b'; g.font = '700 112px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    [...'KMITL'].forEach((ch, i) => g.fillText(ch, w / 2, h * (0.1 + i * 0.2)));
  }, 1, 1), [41.8, -16.2], [38.6, -16.2], 6, H - 1, [0, -1], 0.04);
  // CMKL panel on the cut corner (faces north-east), the 42 Bangkok panel below it
  const n45 = [Math.SQRT1_2, -Math.SQRT1_2], c0 = [48, -6], c1 = [40, -14];
  sign(canvasTex(512, 384, (g, w, h) => {
    g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c8202f'; g.lineWidth = 14; g.beginPath(); g.arc(w * 0.2, h * 0.32, 44, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#c8202f'; g.font = '700 84px Arial, sans-serif'; g.textBaseline = 'middle'; g.fillText('CMKL', w * 0.36, h * 0.32);
    g.fillStyle = '#4a4a4a'; g.font = '500 30px Arial, sans-serif';
    ['CMKL University', 'Carnegie Mellon', 'KMITL'].forEach((t, i) => g.fillText(t, w * 0.1, h * (0.62 + i * 0.12)));
  }, 1, 1), c0, c1, 21, 31, n45);
  sign(canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#1d1f22'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f2f2'; g.font = '800 150px Arial, sans-serif'; g.textBaseline = 'middle'; g.fillText('42', w * 0.12, h * 0.5);
    g.font = '500 44px Arial, sans-serif'; g.fillText('Bangkok', w * 0.5, h * 0.52);
  }, 1, 1), [46.5, -7.5], [41.5, -12.5], 13.5, 17.5, n45);

  const MAT = mats({ ...BASE_MATS, curtain: { color: '#4f8a95', roughness: 0.2, metalness: 0.4 }, mullion: { color: '#d4dadc', metalness: 0.4, roughness: 0.4 },
    white: '#f1efea', cream: '#ece3cf', louvre: { color: '#c9c7c0', roughness: 0.6, metalness: 0.2 }, lawn: { color: '#6c8b4b', roughness: 1 } });
  return { meshes: [...meshes(A, MAT, owner), ...extra], top: H + 1 };
}

export const CMKL_OUTLINE = [[22, -14], [40, -14], [48, -6], [48, 10], [52, 10], [52, 32], [22, 32], [22, -14]];
