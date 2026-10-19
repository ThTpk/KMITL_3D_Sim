// Hand-built model of สำนักงานอธิการบดี (KMITL President Building, OSM way 516308733).
// Surveyed 2026-10-17 from Google Street View, picking wide views with few trees: the north face from the
// service road (36 m), the canal road (70 m) and across the highway (106 m); the porte-cochère close up; the
// east end from the east road and from the south-east; the west end from the west road; the north-west corner.
// The south face is screened by a garden and a neighbouring building - modelled from partial views only.
// Esri World Imagery for the roof. Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up. Footprint x -72..-5.7, z -338.5 (north) .. -315.6 (south).
//   north face (east → west): white window grid | dark glazed stair core | balcony bay with white breeze-block
//     balustrades and orange spandrels | thin blue fin | deep white egg-crate grid with a large framed panel
//   roof parapet with the institute's name in blue; orange penthouse with the emblem over the core
//   porte-cochère: a white folded canopy rising to a ridge over the middle, on round white columns, in front of
//   the west half; the name on a dark board beside the steps (2026-10-19)
//   east end: brick panels in a white grid, few windows; west end: brick bays, balcony bays, central glazed core
//   rising above the roof; south face: continuous balcony slabs with rails in a white frame, the west part with
//   orange-brick balcony fronts on floors 2-7, the institute's name on the south parapet too (south face reworked
//   2026-10-19 from the SIIE "Key locations" film, 5:40, looking north across the garden)
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex, textTex } from './ecc.js';

const G = 5.0, FL = 3.6, NF = 10;
const lvY = (k) => (k <= 1 ? 0 : G + (k - 2) * FL); // bottom of floor k (11 = roof)
const ROOF = lvY(NF + 1);                           // 37.4

export function buildPres(owner) {
  const A = new Acc();
  const X0 = -72, X1 = -5.7, ZN = -338.5, ZS = -315.6;
  const N = { ax: 'z', at: ZN, out: -1 }, S = { ax: 'z', at: ZS, out: 1 };
  const W = { ax: 'x', at: X0, out: -1 }, E = { ax: 'x', at: X1, out: 1 };
  const CORE = [-25.4, -22], BAL = [-39, -25.4], FIN = [-40.6, -39], BAN = [-62, -46];

  // body (ground floor set back behind the columns on the long faces)
  A.box('wall', X0, X1, G, ROOF, ZN + 0.6, ZS - 0.6);
  A.box('wall', X0 + 0.6, X1 - 0.6, 0, G, ZN + 2.5, ZS - 2.5);
  A.box('soffit', X0, X1, G - 0.3, G, ZN, ZS, false);
  for (const f of [N, S]) {
    onFace(A, 'glass', f, X0 + 1.5, X1 - 1.5, 0.4, G - 0.6, -2.5, -2.45);
    for (let x = X0 + 2; x < X1 - 1; x += 6.3) A.cyl('column', x, f.at + (f.out < 0 ? 1.0 : -1.0), 0.4, 0, G - 0.3, 14);
  }

  // ---- north face ----
  const grid = (f, a0, a1, bay, deep) => {
    for (let k = 2; k <= NF; k++) {
      const y = lvY(k), top = lvY(k + 1);
      onFace(A, 'glass', f, a0, a1, y + 0.9, top - 0.45, -0.1, -0.05);
      onFace(A, 'wall', f, a0, a1, y - 0.15, y + 0.9, 0, deep);              // floor slab / spandrel
      for (let a = a0 + bay / 2; a < a1 - 0.5; a += bay) onFace(A, 'frame', f, a - 0.04, a + 0.04, y + 0.9, top - 0.45, -0.05, 0); // mullion
    }
    for (let a = a0; a <= a1 + 0.01; a += bay) onFace(A, 'wall', f, Math.max(a0, a - 0.3), Math.min(a1, a + 0.3), G - 0.2, ROOF, 0, deep); // piers
  };
  grid(N, CORE[1], X1, 4.1, 0.5);                                               // east part
  grid(N, X0, FIN[0], 4.4, 1.0);                                                // west part: deeper egg-crate
  // glazed stair core, projecting, running up into the penthouse
  A.box('core', CORE[0], CORE[1], G, ROOF + 1.2, ZN - 0.6, ZN + 0.6);
  for (let k = 2; k <= NF; k++) onFace(A, 'wall', N, CORE[0], CORE[1], lvY(k) - 0.1, lvY(k) + 0.1, 0.6, 0.65);
  // balcony bay: breeze-block balustrades and orange spandrels
  for (let k = 2; k <= NF; k++) {
    const y = lvY(k), top = lvY(k + 1);
    onFace(A, 'glass', N, BAL[0], BAL[1], y + 1.0, top - 0.4, -0.1, -0.05);
    onFace(A, 'wall', N, BAL[0], BAL[1], y - 0.2, y + 0.05, 0, 1.4);            // balcony slab
    onFace(A, 'breeze', N, BAL[0] + 0.3, -30.8, y + 0.05, y + 1.05, 1.3, 1.4);
    onFace(A, 'orange', N, -30.8, BAL[1] - 0.3, y + 0.05, y + 1.05, 1.3, 1.4);
  }
  for (const x of [BAL[0], -30.8, BAL[1]]) onFace(A, 'wall', N, x - 0.25, x + 0.25, G - 0.2, ROOF, 0, 1.4);
  onFace(A, 'blue', N, FIN[0], FIN[1], G, ROOF + 0.8, 0, 1.2);                 // thin blue fin
  // large framed panel on the west part (floors 3-9), drawn plain
  onFace(A, 'frame', N, BAN[0] - 0.5, BAN[1] + 0.5, lvY(3) - 0.5, lvY(10) + 0.4, 1.0, 1.15);
  onFace(A, 'panel', N, BAN[0], BAN[1], lvY(3), lvY(10) - 0.1, 1.15, 1.2);

  // ---- south face: continuous balcony slabs with rails ----
  for (let k = 2; k <= NF; k++) {
    const y = lvY(k), top = lvY(k + 1);
    onFace(A, 'glass', S, X0 + 0.6, X1 - 0.6, y + 0.9, top - 0.4, -0.1, -0.05);
    onFace(A, 'wall', S, X0, X1, y - 0.2, y + 0.05, 0, 1.6);
    onFace(A, 'wall', S, X0, X1, y + 0.05, y + 0.45, 1.45, 1.6);
    onFace(A, 'rail', S, X0, X1, y + 0.45, y + 1.05, 1.5, 1.55);
  }
  for (let x = X0; x <= X1 + 0.01; x += 6.6) onFace(A, 'wall', S, Math.max(X0, x - 0.3), Math.min(X1, x + 0.3), G - 0.2, ROOF, 0, 1.6);
  // west part: orange-brick balcony fronts on floors 2-7, white slabs between them
  for (let k = 2; k <= 7; k++) onFace(A, 'brick', S, X0 + 0.3, X0 + 19.5, lvY(k) + 0.05, lvY(k) + 1.05, 1.56, 1.62);
  onFace(A, 'wall', S, X0 - 0.1, X1 + 0.1, ROOF - 0.2, ROOF + 1.4, 0, 1.7);                                     // deep white top frame

  // ---- east end: brick panels in a white grid (3 bays), few small windows, glazed entrance at the north ----
  {
    const zs = [ZN, -330.9, -323.2, ZS];
    for (let k = 2; k <= NF; k++) {
      const y = lvY(k), top = lvY(k + 1);
      for (let i = 0; i < 3; i++) onFace(A, 'brick', E, zs[i] + 0.35, zs[i + 1] - 0.35, y + 0.2, top - 0.2, 0, 0.04);
      onFace(A, 'wall', E, ZN, ZS, y - 0.2, y + 0.2, 0, 0.25);
    }
    for (const z of zs) onFace(A, 'wall', E, Math.max(ZN, z - 0.35), Math.min(ZS, z + 0.35), 0, ROOF, 0, 0.3);
    for (const k of [3, 4]) onFace(A, 'glass', E, -327.6, -326.0, lvY(k) + 1.0, lvY(k) + 2.4, 0.04, 0.08);
    onFace(A, 'brick', E, ZN + 0.4, ZS - 0.4, 0.4, G - 0.3, -0.6, -0.55);
    onFace(A, 'glass', E, ZN + 1.0, ZN + 7.5, 0.4, G - 1.4, -0.55, -0.5);
  }
  // ---- west end: brick | balconies | glazed core above the roof | balconies | brick ----
  {
    const zc = (ZN + ZS) / 2, zb = [ZN, ZN + 4.5, zc - 1.3, zc + 1.3, ZS - 4.5, ZS];
    for (let k = 2; k <= NF; k++) {
      const y = lvY(k), top = lvY(k + 1);
      for (const [z0, z1] of [[zb[0], zb[1]], [zb[4], zb[5]]]) onFace(A, 'brick', W, z0 + 0.35, z1 - 0.35, y + 0.2, top - 0.2, 0, 0.04);
      for (const [z0, z1] of [[zb[1], zb[2]], [zb[3], zb[4]]]) {
        onFace(A, 'glass', W, z0 + 0.3, z1 - 0.3, y + 1.0, top - 0.4, -0.1, -0.05);
        onFace(A, 'wall', W, z0, z1, y - 0.2, y + 0.05, 0, 1.2);
        onFace(A, 'breeze', W, z0 + 0.2, z1 - 0.2, y + 0.05, y + 1.05, 1.1, 1.2);
      }
      onFace(A, 'wall', W, ZN, ZS, y - 0.2, y + 0.2, 0, 0.25);
    }
    for (const z of zb) onFace(A, 'wall', W, Math.max(ZN, z - 0.3), Math.min(ZS, z + 0.3), 0, ROOF, 0, 1.25);
    A.box('core', X0 - 0.8, X0 + 2, G, ROOF + 3.5, zb[2], zb[3]);               // glazed stair core, above the roof
    for (let k = 2; k <= NF + 1; k++) A.box('wall', X0 - 0.85, X0 + 2, lvY(k) - 0.1, lvY(k) + 0.1, zb[2], zb[3]);
    A.box('wall', X0 - 0.9, X0 + 2.2, ROOF + 3.5, ROOF + 3.8, zb[2] - 0.1, zb[3] + 0.1);
  }

  // ---- roof: parapet with the name, orange penthouse with the emblem, plant, mast ----
  A.box('roofDark', X0 + 0.3, -30, ROOF, ROOF + 0.1, ZN + 0.3, ZS - 0.3);
  A.box('roofLight', -30, X1 - 0.3, ROOF, ROOF + 0.1, ZN + 0.3, ZS - 0.3);
  const par = (x0, x1, z0, z1) => A.box('wall', x0, x1, ROOF, ROOF + 1.4, z0, z1);
  par(X0, X1, ZN, ZN + 0.3); par(X0, X1, ZS - 0.3, ZS); par(X0, X0 + 0.3, ZN, ZS); par(X1 - 0.3, X1, ZN, ZS);
  const PH = [-38, -21.5, ZN + 0.6, ZN + 10];
  A.box('orange', PH[0], PH[1], ROOF, ROOF + 4.6, PH[2], PH[3]);
  A.box('wall', PH[0] - 0.2, PH[1] + 0.2, ROOF + 4.6, ROOF + 5.0, PH[2] - 0.2, PH[3] + 0.2);
  for (const [x0, z0] of [[-62, -332], [-52, -326], [-14, -332]]) A.box('wall', x0, x0 + 6, ROOF, ROOF + 2.4, z0, z0 + 4);
  A.cyl('rail', -30, -328, 0.1, ROOF + 5, ROOF + 12, 6);

  // ---- porte-cochère on the north side of the west half ----
  // re-surveyed 2026-10-19 from youtu.be/lod-jYKKEZ0 5:47: a white folded slab, its edges rising from the sides
  // to a ridge over the middle (running north-south), on round white columns; the building's name on a dark
  // board beside the steps
  const PC = [-70, -48, -358, ZN];
  {
    const xm = (PC[0] + PC[1]) / 2, z0 = PC[2], z1 = PC[3] - 0.6, yE = 6.0, yR = 8.6, t = 0.45;
    for (const [xa, xb] of [[PC[0] - 1.5, xm], [xm, PC[1] + 1.5]]) {
      const ya = xa === xm ? yR : yE, yb = xb === xm ? yR : yE;
      A.quad('white', [xa, ya + t, z1], [xb, yb + t, z1], [xb, yb + t, z0], [xa, ya + t, z0]);    // top
      A.quad('white', [xa, ya, z0], [xb, yb, z0], [xb, yb, z1], [xa, ya, z1]);                    // soffit
      A.quad('white', [xa, ya, z0], [xa, ya + t, z0], [xb, yb + t, z0], [xb, yb, z0]);            // front edge
      A.quad('white', [xb, yb, z1], [xb, yb + t, z1], [xa, ya + t, z1], [xa, ya, z1]);
    }
    for (const x of [PC[0] - 1.5, PC[1] + 1.5]) A.box('white', Math.min(x, x + 0.01), Math.max(x, x + 0.01) + 0.01, yE, yE + t, z0, z1);
    A.box('dark', PC[1] + 2, PC[1] + 5.5, 0.4, 2.2, PC[2] + 1.5, PC[2] + 1.7);                    // name board
  }
  for (const x of [PC[0] + 2.5, (PC[0] + PC[1]) / 2, PC[1] - 2.5]) for (const z of [PC[2] + 2.5, PC[2] + 10]) A.cyl('column', x, z, 0.55, 0, 6.0 + 2.6 * (1 - Math.abs(x - (PC[0] + PC[1]) / 2) / ((PC[1] - PC[0]) / 2 + 1.5)), 16);
  A.box('paving', PC[0] + 1, PC[1] - 1, 0, 0.3, PC[2] + 1, PC[3]);

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const breeze = (() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const g = cv.getContext('2d'); g.fillStyle = '#f4f3ef'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#8f9396'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) g.fillRect(i * 32 + 9, j * 32 + 9, 14, 14);
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 0.8, 1 / 0.8); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const MAT = {
    wall: std({ color: '#f3f2ee' }),
    frame: std({ color: '#c9ccce', roughness: 0.6, metalness: 0.2 }),
    column: std({ color: '#f1f1ef', roughness: 0.6 }),
    glass: std({ color: '#4c5d69', map: gDay, roughness: 0.35, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    core: std({ color: '#2f3b45', roughness: 0.3, metalness: 0.3, emissive: new THREE.Color('#ffd9a0'), emissiveMap: gNight, emissiveIntensity: 0 }),
    breeze: std({ color: '#ffffff', map: breeze }),
    orange: std({ color: '#e0713a', roughness: 0.6 }),
    blue: std({ color: '#2f5fb0', roughness: 0.6 }),
    panel: std({ color: '#cdbb8a', roughness: 0.8 }),
    brick: std({ color: '#d79a7f', map: brick, roughness: 0.95 }),
    rail: std({ color: '#d8d8d4', roughness: 0.6, metalness: 0.3 }),
    white: std({ color: '#f4f4f1', roughness: 0.7, side: THREE.DoubleSide }),
    dark: std({ color: '#2b2d30', roughness: 0.6 }),
    soffit: std({ color: '#5a4f48', roughness: 0.9, side: THREE.DoubleSide }),
    paving: std({ color: '#cfc8bd', roughness: 1 }),
    roofDark: std({ color: '#5d6266', roughness: 0.9 }),
    roofLight: std({ color: '#e1dfda', roughness: 0.9 }),
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
  // signs facing north (viewer looks south, so east is on the left): a = east end, b = west end
  const signN = (tex, xe, xw, y0, y1, z) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([xe, y0, z, xw, y0, z, xw, y1, z, xe, y0, z, xw, y1, z, xe, y1, z], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.8 }));
  };
  signN(textTex('สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง', { color: '#2f5fb0', h: 150 }), -12, -60, ROOF + 0.2, ROOF + 1.3, ZN - 0.03);
  signN(textTex('อาคารกรมหลวงนราธิวาสราชนครินทร์', { color: '#e9d8a6', h: 150 }), PC[1] + 5.4, PC[1] + 2.1, 1.1, 1.7, PC[2] + 1.47);   // on the dark board
  const emblem = (() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const g = cv.getContext('2d');
    g.fillStyle = '#d9b04c'; g.beginPath(); g.arc(128, 128, 120, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#a77a22'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 96, 0, Math.PI * 2); g.stroke();
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  // the name on the south parapet (faces south: viewer looks north, so west is on the left)
  {
    const g = new THREE.BufferGeometry(), z = ZS + 1.73, y0 = ROOF - 0.05, y1 = ROOF + 1.2, xw = -62, xe = -16;
    g.setAttribute('position', new THREE.Float32BufferAttribute([xw, y0, z, xe, y0, z, xe, y1, z, xw, y0, z, xe, y1, z, xw, y1, z], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: textTex('สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง', { color: '#2f5fb0', h: 150 }), transparent: true, alphaTest: 0.3, roughness: 0.8 }));
  }
  const ex = (PH[0] + PH[1]) / 2;
  signN(emblem, ex + 1.6, ex - 1.6, ROOF + 0.9, ROOF + 4.1, PH[2] - 0.03);
  return { meshes, top: ROOF + 6 };
}

// Ground outline (OSM way 516308733)
export const PRES_OUTLINE = [[-72.04, -338.42], [-5.72, -338.48], [-5.7, -315.68], [-9.51, -315.68], [-29.53, -315.66], [-72.02, -315.6], [-72.04, -338.42]];
