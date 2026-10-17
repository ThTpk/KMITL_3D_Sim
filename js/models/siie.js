// Hand-built model of SIIE - Faculty of Engineering, International Program (OSM way 516204082).
// Surveyed 2026-10-17 from Google Maps satellite imagery (two roof halves either side of a stair core) and
// Google Street View on the road along the south face: close up at the west end (entrance steps, car-park
// ramp, open ground floor) and from 22 m beyond the east end (whole east elevation and the south face in
// perspective; height from the floor count, about 30 m). The north face is not visible from any road and
// follows the end walls. Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up. Footprint x -347..-255, z 138..163 (OSM outline).
//   ground floor 5 m, open behind square white columns, with broad steps up from the road and a car-park
//   ramp at the west; seven floors of 3.55 m above
//   south face: white floor slabs, dark-brown vertical louvre screens in front of the glass, lighter open
//   balconies with rails on floors 2-3, a white pleated panel at the base of the east part
//   ends and north: beige walls in a white frame (floor bands, corner strips), small punched windows
//   stair/lift core at x -292..-281 a little above the roof, lightning mast
import * as THREE from 'three';
import { Acc, onFace, glassTex } from './ecc.js';

const X0 = -347, X1 = -255, Z0 = 138, Z1 = 163, G = 5.0, FL = 3.55, NF = 7, ROOF = G + NF * FL;   // 29.85
const CORE = [-292, -281];
const lvY = (k) => (k === 0 ? 0 : G + (k - 1) * FL);

export function buildSiie(owner) {
  const A = new Acc();
  const N = { ax: 'z', at: Z0, out: -1 }, S = { ax: 'z', at: Z1, out: 1 };
  const W = { ax: 'x', at: X0, out: -1 }, E = { ax: 'x', at: X1, out: 1 };

  // ---- body; open ground floor recessed on the south ----
  A.box('beige', X0, X1, G, ROOF, Z0, Z1 - 0.62);                                // south glass line sits 0.6 m in
  A.box('beige', X0, X1, 0, G, Z0, Z1 - 6);
  A.box('soffit', X0, X1, G - 0.05, G, Z1 - 6, Z1, false);
  for (let x = X0 + 1.5; x < X1; x += 7.6) A.box('white', x - 0.4, x + 0.4, 0, G, Z1 - 1.2, Z1 - 0.4);
  onFace(A, 'glass', { ax: 'z', at: Z1 - 6, out: 1 }, X0 + 3, X1 - 3, 0.6, G - 0.5, 0, 0.05);
  A.box('plinth', X0, X1, 0, 0.6, Z1 - 6, Z1);
  for (let s = 0; s < 5; s++) A.box('plinth', -322, -296, 0, 0.6 - s * 0.12, Z1, Z1 + 0.5 + s * 0.4);
  A.box('dark', -335, -327, -0.01, 3.0, Z1 - 0.2, Z1 + 0.02);                      // car-park ramp mouth
  A.box('white', -336, -326, 3.0, 3.6, Z1 - 0.6, Z1 + 0.2);

  // ---- south face ----
  for (let k = 1; k <= NF; k++) {
    const y = lvY(k), top = k === NF ? ROOF : lvY(k + 1);
    onFace(A, 'white', S, X0, X1, y - 0.15, y + 0.35, 0, 0.9);                       // floor slab edge
    onFace(A, 'glass', S, X0 + 1, X1 - 1, y + 0.35, top - 0.15, -0.6, -0.55);
    if (k <= 2) {                                                                     // open balconies, rails
      onFace(A, 'rail', S, X0 + 1, X1 - 1, y + 0.35, y + 1.4, 0.7, 0.75);
    } else {                                                                          // louvre screens
      for (let x = X0 + 1.2; x < X1 - 1; x += 0.55) {
        if (x > CORE[0] && x < CORE[1]) continue;
        onFace(A, 'louvre', S, x, x + 0.12, y + 0.35, top - 0.15, 0.15, 0.6);
      }
    }
  }
  onFace(A, 'white', S, CORE[0], CORE[1], G, ROOF + 1.6, 0, 1.0);                    // core faced in white
  for (let k = 1; k <= NF; k++) onFace(A, 'glass', S, CORE[0] + 4, CORE[1] - 4, lvY(k) + 0.6, lvY(k) + 2.8, 1.0, 1.05);
  for (let x = -276; x < -260; x += 0.7) onFace(A, 'white', S, x, x + 0.35, 0.6, G - 0.4, 0, 0.35);   // pleated panel
  onFace(A, 'white', S, X0 - 0.3, X1 + 0.3, ROOF - 0.2, ROOF + 1.0, 0, 1.0);         // roof fascia

  // ---- ends and north: beige wall in a white frame, punched windows ----
  const framed = (f, a0, a1, bay) => {
    for (let k = 1; k <= NF; k++) onFace(A, 'white', f, a0, a1, lvY(k) - 0.2, lvY(k) + 0.25, 0, 0.12);
    for (const a of [a0, a1]) onFace(A, 'white', f, Math.max(a0, a - 0.7), Math.min(a1, a + 0.7), 0, ROOF + 1.0, 0, 0.14);
    onFace(A, 'white', f, a0, a1, ROOF - 0.2, ROOF + 1.0, 0, 0.14);
    for (let k = 1; k <= NF; k++) for (let a = a0 + bay / 2; a < a1 - 1; a += bay) {
      onFace(A, 'glass', f, a - 0.55, a + 0.55, lvY(k) + 1.0, lvY(k) + 2.3, 0, 0.06);
    }
  };
  framed(E, Z0, Z1, 3.2);
  framed(W, Z0, Z1, 3.2);
  framed(N, X0, X1, 3.8);
  for (const f of [E, W]) onFace(A, 'white', f, (Z0 + Z1) / 2 - 0.4, (Z0 + Z1) / 2 + 0.4, 0, ROOF + 1.0, 0, 0.14);

  // ---- roof ----
  A.box('roof', X0 + 0.3, X1 - 0.3, ROOF, ROOF + 0.1, Z0 + 0.3, Z1 - 0.3);
  A.box('white', CORE[0], CORE[1], ROOF, ROOF + 3.4, Z0 + 3, Z1 - 1);
  for (const [x, z] of [[-335, 144], [-318, 150], [-268, 146]]) A.box('plant', x, x + 5, ROOF + 0.1, ROOF + 1.6, z, z + 3.5);
  A.box('rail', -261.05, -260.95, ROOF, ROOF + 6, 143.95, 144.05);

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true);
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    beige: std({ color: '#d9cdbf' }),
    white: std({ color: '#f4f3f0', roughness: 0.7 }),
    soffit: std({ color: '#e7e4dd', side: THREE.DoubleSide }),
    plinth: std({ color: '#cfcbc3', roughness: 1 }),
    dark: std({ color: '#2a2a2a', roughness: 1 }),
    glass: std({ color: '#44535c', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    louvre: std({ color: '#5a4a3f', roughness: 0.6, metalness: 0.2 }),
    rail: std({ color: '#d9dcdf', roughness: 0.4, metalness: 0.5 }),
    roof: std({ color: '#8d8f8f', roughness: 0.95 }),
    plant: std({ color: '#bfc0bf', roughness: 0.8 }),
  };
  const meshes = [];
  for (const [k, B] of Object.entries(A.b)) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    g.computeBoundingSphere();
    g.userData.owner = new Int32Array(g.attributes.position.count / 3).fill(owner);
    const mesh = new THREE.Mesh(g, MAT[k]);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.kind = 'building';
    meshes.push(mesh);
  }
  return { meshes, top: ROOF + 6 };
}

// Ground outline (OSM way 516204082)
export const SIIE_OUTLINE = [[-347.3, 139.02], [-255.12, 137.35], [-254.67, 162.42], [-346.85, 164.1], [-347.3, 139.02]];
