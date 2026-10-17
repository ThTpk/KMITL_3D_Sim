// Hand-built model of ตึก A (OSM way 1137554506; Google Maps lists it as "ตึก A", 3 Chalong Krung Rd),
// the long block north of the Princess Sirindhorn lecture building, linked to it by the level-2 skybridge
// modelled in thep.js. Surveyed 2026-10-17 from Google Maps satellite imagery (length, the central entrance
// block with two stair towers on the north, solar panels on both wings) and Google Street View: the south
// face from the garden plaza in front of it (looking north, north-east and north-west) and the north face
// from the garden at its east end.
// Photos were only looked at; everything here is procedural.
//
// Built axis-aligned around the OSM centroid, then turned about -1.1° onto the OSM outline. x = east, z = south.
//   five storeys (ground 4.2 m, upper floors 3.5 m), cream concrete
//   south: open corridors on every floor behind deep solid balustrades, dark louvred windows and doors
//          behind them, thin columns at the corridor edge; the ground floor on a plinth with a grass bank
//   north: groups of white-framed windows under thin concrete sunshades, AC units, square piers
//   ends: orange-brick strip the full height of the wall
//   centre x -140..-113: entrance block, glazed on the south where the skybridge arrives, two stair towers
//          standing out on the north and rising above the roof
//   roof: rows of solar panels on both wings
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex } from './ecc.js';

const PIV = [-123.6, -268.8], ROT = Math.atan2(-3.05, 164.9);
const G = 4.2, FL = 3.5, NF = 5, ROOF = G + (NF - 1) * FL;   // 18.2
const lvY = (k) => (k === 0 ? 0 : G + (k - 1) * FL);
const X0 = -206.1, X1 = -41.2, ZN = -275.6, ZS = -261.9, CX = [-140, -113], CORR = 2.4;

export function buildTka(owner) {
  const A = new Acc();
  const N = { ax: 'z', at: ZN, out: -1 }, S = { ax: 'z', at: ZS, out: 1 };
  const W = { ax: 'x', at: X0, out: -1 }, E = { ax: 'x', at: X1, out: 1 };
  const SI = { ax: 'z', at: ZS - CORR, out: 1 };                                // wall behind the south corridors

  // ---- body: rooms behind the corridor zone, slabs across the corridors ----
  A.box('wall', X0, X1, 0, ROOF, ZN, ZS - CORR);
  A.box('plinth', X0 - 0.5, X1 + 0.5, 0, 0.6, ZS - CORR, ZS + 1.2);
  for (let k = 1; k < NF; k++) A.box('wall', X0, X1, lvY(k) - 0.25, lvY(k), ZS - CORR, ZS, false);
  A.box('wall', X0, X1, ROOF - 0.5, ROOF, ZS - CORR, ZS, false);
  for (const x of [X0, X1]) A.box('wall', x - (x === X0 ? 0 : 0.4), x + (x === X0 ? 0.4 : 0), 0, ROOF, ZS - CORR, ZS);  // corridor end walls

  // ---- south: corridors behind solid balustrades ----
  const wing = [[X0 + 0.4, CX[0]], [CX[1], X1 - 0.4]];
  for (const [a0, a1] of wing) {
    for (let k = 0; k < NF; k++) {
      const y = lvY(k) + (k === 0 ? 0.6 : 0), top = k === NF - 1 ? ROOF - 0.5 : lvY(k + 1) - 0.25;
      onFace(A, 'bal', S, a0, a1, y, y + 1.15, -0.25, 0);                       // solid balustrade
      onFace(A, 'joint', S, a0, a1, y + 1.15, y + 1.22, -0.25, 0.02);
      for (let a = a0 + 3; a < a1 - 2; a += 7.2) onFace(A, 'joint', S, a - 0.03, a + 0.03, y, y + 1.15, 0, 0.02);
      // rooms behind: louvred windows high, doors
      for (let a = a0 + 1.5; a < a1 - 3; a += 7.2) {
        onFace(A, 'louvre', SI, a, a + 3.2, y + 1.0, top - 0.5, 0, 0.05);
        onFace(A, 'door', SI, a + 4.2, a + 5.2, y, y + 2.1, 0, 0.05);
        onFace(A, 'glass', SI, a + 4.0, a + 5.4, y + 2.3, top - 0.5, 0, 0.04);
      }
    }
    for (let a = a0 + 3; a < a1 - 1; a += 7.2) A.box('wall', a - 0.2, a + 0.2, 0.6, ROOF - 0.5, ZS - 0.5, ZS - 0.1);  // corridor columns
    onFace(A, 'bal', S, a0, a1, ROOF - 0.5, ROOF + 0.9, -0.25, 0);               // roof fascia / parapet
  }

  // ---- north: framed window groups under thin sunshades ----
  for (const [a0, a1] of wing) {
    for (let k = 0; k < NF; k++) {
      const y = lvY(k), h = k === 0 ? G : FL;
      for (let a = a0 + 0.8; a < a1 - 1; a += 7.2) {
        const b = Math.min(a + 6.0, a1 - 0.6);
        onFace(A, 'frame', N, a - 0.1, b + 0.1, y + 0.85, y + h - 0.65, 0, 0.05);
        onFace(A, 'glass', N, a, b, y + 0.95, y + h - 0.75, 0.05, 0.08);
        for (let m = a + 0.75; m < b - 0.1; m += 0.75) onFace(A, 'frame', N, m - 0.03, m + 0.03, y + 0.95, y + h - 0.75, 0.05, 0.1);
        onFace(A, 'frame', N, a, b, y + (h - 0.75 + 0.95) / 2 - 0.03, y + (h - 0.75 + 0.95) / 2 + 0.03, 0.05, 0.1);
        if (k === 0 || (k + Math.round(a)) % 3 === 0) onFace(A, 'ac', N, a + 1, a + 1.9, y + 0.15, y + 0.75, 0, 0.4);
      }
      onFace(A, 'wall', N, a0, a1, y + h - 0.55, y + h - 0.45, 0, 0.7);         // sunshade
    }
    for (let a = a0; a <= a1 + 0.01; a += 7.2) onFace(A, 'wall', N, Math.max(a0, a - 0.35), Math.min(a1, a + 0.35), 0, ROOF, 0, 0.25); // piers
    onFace(A, 'wall', N, a0, a1, ROOF - 0.3, ROOF + 0.9, 0, 0.3);
  }

  // ---- ends: orange-brick strip, a few windows ----
  for (const f of [W, E]) {
    onFace(A, 'brick', f, ZN + 1.2, ZN + 6.2, 0.6, ROOF + 0.9, 0, 0.1);
    for (let k = 0; k < NF; k++) onFace(A, 'glass', f, ZS - CORR - 4.5, ZS - CORR - 2.5, lvY(k) + 1.2, lvY(k) + 2.4, 0, 0.05);
    onFace(A, 'wall', f, ZN, ZS, ROOF - 0.3, ROOF + 0.9, 0, 0.2);
  }

  // ---- centre: entrance block, glazed south face, stair towers on the north ----
  {
    const SC = { ax: 'z', at: ZS - 1.2, out: 1 };
    A.box('wall', CX[0], CX[1], 0, ROOF + 0.9, ZS - CORR, ZS - 1.2);
    for (let k = 1; k < NF; k++) onFace(A, 'glass', SC, CX[0] + 1, CX[1] - 1, lvY(k) + 0.3, k < NF - 1 ? lvY(k + 1) - 0.3 : ROOF - 0.6, 0, 0.04);
    for (let x = CX[0] + 1; x <= CX[1] - 0.99; x += 3.125) onFace(A, 'frame', SC, x - 0.06, x + 0.06, G, ROOF - 0.3, 0, 0.1);
    for (let k = 1; k < NF; k++) onFace(A, 'wall', SC, CX[0], CX[1], lvY(k) - 0.3, lvY(k) + 0.3, 0, 0.3);
    onFace(A, 'glass', SC, CX[0] + 4, CX[1] - 4, 0.6, G - 0.4, 0, 0.04);          // ground-floor lobby
    for (const [x0, x1] of [[-139, -131.5], [-121.5, -114]]) {
      A.box('wall', x0, x1, 0, ROOF + 2.6, ZN - 4.2, ZN + 0.5);
      onFace(A, 'brick', { ax: 'z', at: ZN - 4.2, out: -1 }, x0 + 0.6, x1 - 0.6, 0.6, ROOF + 2.0, 0, 0.06);
      for (let k = 0; k < NF; k++) onFace(A, 'glass', { ax: 'z', at: ZN - 4.2, out: -1 }, (x0 + x1) / 2 - 0.5, (x0 + x1) / 2 + 0.5, lvY(k) + 1.6, lvY(k) + 3.0, 0.06, 0.1);
      A.box('wall', x0 - 0.2, x1 + 0.2, ROOF + 2.6, ROOF + 3.0, ZN - 4.4, ZN + 0.7);
    }
  }

  // ---- roof: deck, solar panel rows on the wings ----
  A.box('roof', X0 + 0.3, X1 - 0.3, ROOF, ROOF + 0.1, ZN + 0.3, ZS - 0.3);
  for (const [a0, a1] of wing) {
    for (let x = a0 + 2; x < a1 - 4; x += 11) for (const z of [ZN + 2, ZN + 5.2, ZN + 8.4]) {
      const p = (xx, yy, zz) => [xx, yy, zz];
      const xe = Math.min(x + 9.5, a1 - 2);
      A.quad('solar', p(x, ROOF + 0.4, z + 2.4), p(xe, ROOF + 0.4, z + 2.4), p(xe, ROOF + 1.0, z), p(x, ROOF + 1.0, z));
    }
  }
  for (const [x, z] of [[-128, -272], [-125, -266.5]]) A.box('plant', x, x + 3, ROOF + 0.1, ROOF + 1.6, z, z + 2.5);

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    wall: std({ color: '#ece7dc' }),
    bal: std({ color: '#efebe2' }),
    joint: std({ color: '#cdc7ba' }),
    plinth: std({ color: '#d6d1c6', roughness: 1 }),
    frame: std({ color: '#f7f7f5', roughness: 0.6 }),
    glass: std({ color: '#4a5c66', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    louvre: std({ color: '#3b2f29', roughness: 0.8 }),
    door: std({ color: '#5a3e30', roughness: 0.8 }),
    ac: std({ color: '#e6e6e3', roughness: 0.7 }),
    brick: std({ color: '#d0703f', map: brick, roughness: 0.95 }),
    roof: std({ color: '#9fa09d', roughness: 0.95 }),
    solar: std({ color: '#26324a', roughness: 0.35, metalness: 0.3, side: THREE.DoubleSide }),
    plant: std({ color: '#c0c1bf', roughness: 0.8 }),
  };
  const c = Math.cos(ROT), s = Math.sin(ROT);
  const rot = (arr, isPos) => {
    for (let i = 0; i < arr.length; i += 3) {
      const ox = isPos ? PIV[0] : 0, oz = isPos ? PIV[1] : 0, dx = arr[i] - ox, dz = arr[i + 2] - oz;
      arr[i] = ox + dx * c - dz * s; arr[i + 2] = oz + dx * s + dz * c;
    }
  };
  const meshes = [];
  for (const [k, B] of Object.entries(A.b)) {
    rot(B.p, true); rot(B.n, false);
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
  return { meshes, top: ROOF + 3.0 };
}

// Ground outline (OSM way 1137554506)
export const TKA_OUTLINE = [[-206.22, -274.07], [-205.96, -260.37], [-129.49, -261.81], [-120.86, -261.83], [-41.06, -263.42], [-41.32, -277.15], [-76.18, -276.67], [-94.01, -276.42], [-110.32, -276.19], [-125.74, -275.98], [-206.22, -274.07]];
