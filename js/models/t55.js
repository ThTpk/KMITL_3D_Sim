// Hand-built model of อาคารเฉลิมพระเกียรติ 55 พรรษา สมเด็จพระเทพฯ (OSM way 309556942).
// Surveyed 2026-10-17 from Google Maps satellite imagery (the block, solar panels on the north part of the
// roof, plant on the south part, a low annex along the east side, the car park to the south) and Google
// Street View from the road south of the car park (the whole south front, wide and zoomed).
// Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up. Block x -307..-270, z -258..-219 (roof traced on the imagery).
//   eight storeys of light blue-grey render; the ground floor open behind square white columns with steps
//   and a rail across the front, red-orange panels on the entrance walls; a white canopy band over it
//   upper floors: deep white floor bands, white-framed windows with AC units, recessed balconies at the
//   corners; an orange stripe along the bottom of the third floor; a white roof edge
//   north part of the roof with solar panels, plant on the south part; low annex on the east side
import * as THREE from 'three';
import { Acc, onFace, glassTex } from './ecc.js';

const X0 = -307, X1 = -270, Z0 = -258, Z1 = -219, G = 4.4, FL = 3.4, NF = 8;
const lvY = (k) => (k === 0 ? 0 : G + (k - 1) * FL);
const TOP = lvY(NF);                                             // 28.2

export function buildT55(owner) {
  const A = new Acc();
  const F = (ax, at, out) => ({ ax, at, out });
  const S = F('z', Z1, 1), N = F('z', Z0, -1), W = F('x', X0, -1), E = F('x', X1, 1);

  // ---- ground floor: open, columns, steps, rail, red-orange entrance walls ----
  A.box('render', X0 + 3, X1 - 3, 0, G, Z0 + 3, Z1 - 3);
  A.box('plinth', X0, X1, 0, 0.9, Z0, Z1);
  for (let s = 0; s < 4; s++) A.box('plinth', -297, -282, 0, 0.9 - s * 0.22, Z1, Z1 + 0.45 * (s + 1));
  for (let x = X0 + 0.5; x <= X1 - 0.4; x += 6.0) for (const z of [Z0 + 0.5, Z1 - 0.5]) A.box('column', x - 0.4, x + 0.4, 0.9, G, z - 0.4, z + 0.4);
  onFace(A, 'rail', S, X0 + 1, -297.5, 0.9, 1.9, -0.7, -0.65);
  onFace(A, 'rail', S, -281.5, X1 - 1, 0.9, 1.9, -0.7, -0.65);
  const SI = F('z', Z1 - 3, 1);
  for (const [a0, a1] of [[-303, -299], [-284, -281], [-276, -273]]) onFace(A, 'orange', SI, a0, a1, 0.9, G - 0.4, 0, 0.06);
  onFace(A, 'glass', SI, -297, -284.5, 1.0, G - 0.5, 0, 0.05);
  A.box('white', X0 - 0.6, X1 + 0.6, G - 0.1, G + 0.5, Z0 - 0.6, Z1 + 0.8);       // canopy band

  // ---- upper floors ----
  A.box('render', X0, X1, G + 0.5, TOP, Z0, Z1);
  for (const [f, a0, a1] of [[S, X0, X1], [N, X0, X1], [W, Z0, Z1], [E, Z0, Z1]]) {
    for (let k = 2; k <= NF; k++) {
      const y = lvY(k);
      onFace(A, 'white', f, a0 - 0.3, a1 + 0.3, y - 0.25, y + 0.2, 0, 0.6);         // deep floor band
      if (k === NF) continue;
      const top = lvY(k + 1);
      const n = Math.max(2, Math.round((a1 - a0) / 5.2));
      for (let i = 0; i < n; i++) {
        const c = a0 + ((a1 - a0) * (i + 0.5)) / n;
        if ((i === 0 || i === n - 1) && f.ax === 'z') {                              // recessed corner balconies
          onFace(A, 'shadow', f, c - 2.2, c + 2.2, y + 0.2, top - 0.25, -0.05, 0.01);
          onFace(A, 'rail', f, c - 2.2, c + 2.2, y + 0.2, y + 1.15, 0.3, 0.35);
          continue;
        }
        onFace(A, 'frame', f, c - 1.45, c + 1.45, y + 0.85, top - 0.75, 0, 0.06);
        onFace(A, 'glass', f, c - 1.3, c + 1.3, y + 1.0, top - 0.9, 0.06, 0.09);
        onFace(A, 'frame', f, c - 0.04, c + 0.04, y + 1.0, top - 0.9, 0.06, 0.12);
        if ((i + k) % 2 === 0) onFace(A, 'ac', f, c - 2.3, c - 1.55, y + 0.25, y + 0.85, 0, 0.45);
      }
    }
    onFace(A, 'orange', f, a0, a1, lvY(3) - 0.75, lvY(3) - 0.25, 0, 0.62);           // orange stripe
    onFace(A, 'white', f, a0 - 0.3, a1 + 0.3, TOP - 0.2, TOP + 1.0, 0, 0.6);         // roof edge
  }
  // ---- roof: solar panels to the north, plant to the south ----
  A.box('roof', X0 + 0.3, X1 - 0.3, TOP, TOP + 0.1, Z0 + 0.3, Z1 - 0.3);
  for (let x = X0 + 2; x < X1 - 6; x += 2.4) for (let z = Z0 + 2; z < -238; z += 2.4) A.box('solar', x, x + 2.0, TOP + 0.4, TOP + 0.6, z, z + 2.0);
  for (const [x, z, w, d] of [[-300, -233, 6, 4], [-290, -230, 4, 3], [-282, -233, 5, 4], [-304, -225, 7, 3]]) A.box('plant', x, x + w, TOP + 0.1, TOP + 1.8, z, z + d);
  // ---- low annex on the east side ----
  A.box('render', X1, X1 + 5, 0, 7.0, Z0 + 2, Z1 - 4);
  A.box('roofLight', X1 - 0.2, X1 + 5.3, 7.0, 7.3, Z0 + 1.8, Z1 - 3.8);
  for (let z = Z0 + 4; z < Z1 - 6; z += 4.5) onFace(A, 'glass', E, z, z + 2.4, 4.2, 6.0, 5, 5.05);

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true);
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    render: std({ color: '#b7c1c9' }),
    plinth: std({ color: '#c9c6bf', roughness: 1 }),
    column: std({ color: '#eceeef', roughness: 0.6 }),
    rail: std({ color: '#d9dcdf', roughness: 0.4, metalness: 0.5 }),
    orange: std({ color: '#e0582c', roughness: 0.6 }),
    white: std({ color: '#f0f1f1', roughness: 0.7 }),
    frame: std({ color: '#f7f7f6', roughness: 0.6 }),
    glass: std({ color: '#3f5562', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    shadow: std({ color: '#5e676d', roughness: 0.9 }),
    ac: std({ color: '#e8e8e5', roughness: 0.7 }),
    roof: std({ color: '#8f9294', roughness: 0.95 }),
    roofLight: std({ color: '#d4d4cf', roughness: 0.9 }),
    solar: std({ color: '#2a3550', roughness: 0.35, metalness: 0.3 }),
    plant: std({ color: '#c0c1bf', roughness: 0.8 }),
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
  return { meshes, top: TOP + 1.8 };
}

export const T55_OUTLINE = [[X0, Z0], [X1, Z0], [X1, Z0 + 2], [X1 + 5, Z0 + 2], [X1 + 5, Z1 - 4], [X1, Z1 - 4], [X1, Z1], [X0, Z1], [X0, Z0]];
