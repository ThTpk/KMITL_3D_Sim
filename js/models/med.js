// Hand-built model of คณะแพทยศาสตร์ (Faculty of Medicine, OSM way 592798785; the sign on its north front
// reads PTEC). Surveyed 2026-10-17 from Google Maps satellite imagery (a cross-shaped plan of a central block
// with three wings, solar panels over most of the roof, the entrance court to the south) and Google Street View
// from the road along the north side (the north front, near and zoomed). Photos were only looked at.
//
// x = east, z = south, y = up.
//   three storeys, white render with orange-red brick-tile panels: brick at ground level between white
//   piers, a white middle band, brick again under the top-floor windows; strip windows of small grey panes
//   a glazed stair tower in the centre of the north front, rising above the roof
//   the PTEC sign on the parapet west of the tower; flat roof with solar panels behind a white parapet
//   entrance court to the south with a small porch block
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex, textTex } from './ecc.js';

const H = 12.0;
// the cross-shaped plan as boxes [x0, x1, z0, z1]
const BLOCKS = [
  [-272, -253, -385, -345],      // central spine, north -> south
  [-279, -266, -369, -350],      // west wing
  [-253, -246, -366, -349],      // east wing
  [-271, -258, -345, -337],      // south wing toward the court
];

export function buildMed(owner) {
  const A = new Acc();
  const F = (ax, at, out) => ({ ax, at, out });
  for (const [x0, x1, z0, z1] of BLOCKS) {
    A.box('white', x0, x1, 0, H, z0, z1);
    for (const [f, a0, a1] of [[F('z', z0, -1), x0, x1], [F('z', z1, 1), x0, x1], [F('x', x0, -1), z0, z1], [F('x', x1, 1), z0, z1]]) {
      if (a1 - a0 < 3) continue;
      // brick panels: ground floor and top floor, between white piers
      const bays = Math.max(1, Math.round((a1 - a0) / 6));
      const w = (a1 - a0) / bays;
      for (let i = 0; i < bays; i++) {
        const b0 = a0 + i * w + 0.5, b1 = a0 + (i + 1) * w - 0.5;
        onFace(A, 'brick', f, b0, b1, 0.3, 3.4, 0, 0.05);
        onFace(A, 'brick', f, b0, b1, 7.6, 9.4, 0, 0.05);
        // strip windows: low on the ground floor, a band on the first floor, high on the top floor
        onFace(A, 'glass', f, b0 + 0.4, b1 - 0.4, 1.2, 2.9, 0.05, 0.09);
        onFace(A, 'glass', f, b0 + 0.4, b1 - 0.4, 5.0, 6.2, 0, 0.05);
        onFace(A, 'glass', f, b0 + 0.6, b1 - 0.6, 9.6, 10.2, 0, 0.05);
      }
      onFace(A, 'white', f, a0 - 0.1, a1 + 0.1, H - 0.2, H + 0.9, 0, 0.12);       // parapet
    }
    A.box('roof', x0 + 0.3, x1 - 0.3, H, H + 0.1, z0 + 0.3, z1 - 0.3);
  }
  // north front: glazed stair tower in the middle and a tall curtain-wall panel beside it
  {
    const N = F('z', -385, -1);
    A.box('white', -265.5, -259.5, 0, H + 2.2, -386.5, -383);
    onFace(A, 'glass', F('z', -386.5, -1), -264.6, -260.4, 0.4, H + 1.6, 0, 0.05);
    for (let y = 2.6; y < H + 1.6; y += 3.0) onFace(A, 'frame', F('z', -386.5, -1), -264.6, -260.4, y, y + 0.12, 0, 0.1);
    for (const x of [-263.2, -261.8]) onFace(A, 'frame', F('z', -386.5, -1), x - 0.06, x + 0.06, 0.4, H + 1.6, 0, 0.1);
    // sign on the west part of the parapet (right of the stair tower, seen from the road)
    var sign = { x0: -266.6, x1: -271.2, y0: H + 0.1, y1: H + 0.85, z: -385.14 };
    void N;
  }
  // solar panels on the roofs
  for (const [x0, x1, z0, z1] of BLOCKS)
    for (let z = z0 + 1.5; z < z1 - 2.5; z += 2.4)
      for (let x = x0 + 1.2; x < x1 - 2; x += 2.2) A.box('solar', x, x + 1.9, H + 0.3, H + 0.5, z, z + 1.9);
  // entrance court porch
  A.box('white', -268, -261, 0, 3.8, -337, -333);
  A.box('roofLight', -268.5, -260.5, 3.8, 4.1, -337.5, -332.5);
  A.box('paving', -272, -256, 0, 0.12, -337, -326);

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    white: std({ color: '#ecebe6' }),
    brick: std({ color: '#c7573a', map: brick, roughness: 0.95 }),
    glass: std({ color: '#5f7380', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    frame: std({ color: '#d9dcde', roughness: 0.5, metalness: 0.3 }),
    roof: std({ color: '#a0a19f', roughness: 0.95 }),
    roofLight: std({ color: '#d6d5d0', roughness: 0.9 }),
    solar: std({ color: '#2a3550', roughness: 0.35, metalness: 0.3 }),
    paving: std({ color: '#c7c2b8', roughness: 1 }),
  };
  const meshes = [];
  const add = (g, mat) => {
    g.computeBoundingSphere();
    g.userData.owner = new Int32Array(g.attributes.position.count / 3).fill(owner);
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.kind = 'building';
    meshes.push(mesh);
  };
  for (const [k, B] of Object.entries(A.b)) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    add(g, MAT[k]);
  }
  // PTEC sign (faces north: viewer looks south, east on the left)
  {
    const g = new THREE.BufferGeometry();
    const { x0, x1, y0, y1, z } = sign;
    g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y0, z, x1, y0, z, x1, y1, z, x0, y0, z, x1, y1, z, x0, y1, z], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: textTex('PTEC', { w: 512, h: 160, color: '#f4f6f8', bg: '#2f4f86', font: 'Arial', weight: 700 }), roughness: 0.6 }));
  }
  return { meshes, top: H + 2.2 };
}

export const MED_OUTLINE = [
  [-272, -386.5], [-253, -386.5], [-253, -366], [-246, -366], [-246, -349], [-253, -349], [-253, -345], [-258, -345],
  [-258, -333], [-268, -333], [-268, -337], [-271, -337], [-271, -345], [-272, -345], [-272, -350], [-279, -350],
  [-279, -369], [-272, -369], [-272, -386.5],
];
