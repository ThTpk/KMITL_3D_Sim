// Hand-built model of A-Building (Faculty of Engineering, OSM way 292807567; not ตึก A, which is tka.js).
// Surveyed 2026-10-17 from Google Maps satellite imagery (plan, roof, the three towers on the south side)
// and Google Street View: the north face and the entrance from Engineering Avenue (two points, 20 m and
// 35 m away) and the east end from the east road (its height from the viewing angle, about 21.5 m).
// No Street View reaches the south side (pond and trees); it is modelled from the imagery only.
// Re-coloured 2026-10-19 from the SIIE clip (youtu.be/lod-jYKKEZ0 0:57 the east end from the north-east,
// 1:00 the north face and the porte-cochère): the long faces are cream with stained cream ledges, not mustard;
// the ends are salmon-pink with a white strip and a white panel with "KMITL" in red at its top; the porte-cochère
// is a cream slab on orange columns; the roof fascia is tan.
// Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up. Body x -195.5..-136.5, z 94..110.5 (satellite roof moved for the lean).
//   six storeys; long faces in cream with a stained cream concrete ledge at every floor, ribbon windows
//   between cream piers, a heavy tan roof fascia
//   ends: salmon-pink walls with a white vertical strip, a white panel with "KMITL" in red at the top of the east end
//   north: cream porte-cochère slab on orange columns with flags, blue-roofed steel carports either side
//   south: three cream stair/lift towers rising above the roof, the middle one widest, each with a white strip
import * as THREE from 'three';
import { Acc, onFace, glassTex, textTex } from './ecc.js';

const FL = 3.4, NF = 6, ROOF = FL * NF;        // 20.4
const X0 = -195.5, X1 = -136.5, Z0 = 94, Z1 = 110.5;
const TOWERS = [[-187.1, -182.0, 2.2], [-171.5, -160.0, 3.4], [-150.8, -145.0, 2.2]];   // x0, x1, height above roof
const ENT = [-178, -162];                       // porte-cochère, x range

export function buildA(owner) {
  const A = new Acc();
  const N = { ax: 'z', at: Z0, out: -1 }, S = { ax: 'z', at: Z1, out: 1 };
  const W = { ax: 'x', at: X0, out: -1 }, E = { ax: 'x', at: X1, out: 1 };

  A.box('yellow', X0, X1, 0, ROOF, Z0, Z1);

  // ---- long faces: ledges, ribbon windows, piers ----
  const BAY = 4.5;
  const longFace = (f, skip = []) => {
    for (let k = 0; k < NF; k++) {
      const y = k * FL;
      const runs = [[X0 + 0.6, X1 - 0.6]];
      for (const [a, b] of skip) {                                  // leave out what the towers cover
        const r = runs.pop(); runs.push([r[0], a], [b, r[1]]);
      }
      for (const [a0, a1] of runs) {
        if (a1 - a0 < 1) continue;
        onFace(A, 'glass', f, a0, a1, y + 0.95, y + 2.75, 0, 0.04);
        for (let a = a0 + 1.5; a < a1 - 0.3; a += 1.5) onFace(A, 'yellow', f, a - 0.06, a + 0.06, y + 0.95, y + 2.75, 0, 0.1);
      }
      if (k > 0) onFace(A, 'ledge', f, X0, X1, y - 0.15, y + 0.25, 0, 1.0);   // grey concrete ledge
      onFace(A, 'yellow', f, X0, X1, y + 0.25, y + 0.95, 0, 0.12);           // sill band
    }
    for (let a = X0 + BAY; a < X1 - 1; a += BAY) onFace(A, 'yellow', f, a - 0.3, a + 0.3, FL, ROOF, 0, 0.35); // piers
    onFace(A, 'orange', f, X0, X1, 0, 0.6, 0, 0.08);                            // orange plinth
  };
  longFace(N);
  longFace(S, TOWERS.map(([a, b]) => [a, b]));

  // ---- heavy tan roof fascia with a cream soffit ----
  A.box('fascia', X0 - 1.4, X1 + 1.4, ROOF, ROOF + 1.4, Z0 - 1.4, Z1 + 1.4);
  A.box('yellow', X0 - 1.35, X1 + 1.35, ROOF - 0.05, ROOF, Z0 - 1.35, Z1 + 1.35, false);
  A.box('roof', X0 - 1.0, X1 + 1.0, ROOF + 1.4, ROOF + 1.45, Z0 - 1.0, Z1 + 1.0);
  for (const [x, z] of [[-190, 99], [-155, 100], [-142, 104]]) A.box('plant', x, x + 3.5, ROOF + 1.45, ROOF + 3.0, z, z + 3);

  // ---- ends: salmon-pink wall, white strip south of centre, panel joints ----
  const ZS = [Z0 + 9.4, Z0 + 12.4];
  for (const f of [W, E]) {
    onFace(A, 'endWall', f, Z0, Z1, 0, ROOF, 0, 0.08);
    onFace(A, 'strip', f, ZS[0], ZS[1], 0.6, ROOF, 0.08, 0.14);
    for (let y = 3.0; y < ROOF; y += 3.0) onFace(A, 'joint', f, Z0, Z1, y - 0.03, y + 0.03, 0.08, 0.1);
  }

  // ---- south towers: cream, slot windows, lavender strip, rising above the roof fascia ----
  for (const [x0, x1, h] of TOWERS) {
    const zt = Z1 + 3.4, top = ROOF + 1.4 + h;
    A.box('cream', x0, x1, 0, top, Z1 - 1, zt);
    const xc = (x0 + x1) / 2;
    onFace(A, 'strip', { ax: 'z', at: zt, out: 1 }, xc - 0.7, xc + 0.7, 0.6, top, 0, 0.06);
    for (let k = 0; k < NF; k++) for (const s of [-1, 1]) {
      const xa = xc + s * ((x1 - x0) / 2 - 1.2);
      onFace(A, 'glass', { ax: 'z', at: zt, out: 1 }, xa - 0.35, xa + 0.35, k * FL + 1.2, k * FL + 2.8, 0, 0.05);
    }
    A.box('ledge', x0 - 0.3, x1 + 0.3, top, top + 0.4, Z1 - 1.3, zt + 0.3);
  }
  A.box('cream', -171.5, -160.0, ROOF + 1.4, ROOF + 1.4 + 3.4, Z0 + 2.5, Z1);   // lift room over the core

  // ---- north porte-cochère: cream slab on orange columns, flags on top ----
  const PZ = Z0 - 9;
  A.box('yellow', ENT[0], ENT[1], 4.4, 5.4, PZ, Z0);
  A.box('soffit', ENT[0] + 0.2, ENT[1] - 0.2, 4.3, 4.4, PZ + 0.2, Z0, false);
  for (const x of [ENT[0] + 1, ENT[0] + 6, ENT[1] - 6, ENT[1] - 1]) A.box('orange', x - 0.35, x + 0.35, 0, 4.4, PZ + 0.8, PZ + 1.5);
  for (const x of [ENT[0] + 3.5, ENT[1] - 3.5]) A.box('orange', x - 0.35, x + 0.35, 0, 4.4, Z0 - 4, Z0 - 3.3);
  A.box('paving', ENT[0] - 1, ENT[1] + 1, 0, 0.6, PZ - 1, Z0);
  for (let s = 0; s < 3; s++) A.box('paving', ENT[0] + 3, ENT[1] - 3, 0, 0.2 * (s + 1), PZ - 1 - (3 - s) * 0.5, PZ - 1);
  const flags = ['#d23b3b', '#f2d24a', '#2f63c8', '#f2d24a', '#2f63c8', '#ffffff'];
  flags.forEach((c, i) => {
    const x = ENT[0] + 4 + i * 1.6;
    A.box('pole', x - 0.04, x + 0.04, 5.4, 8.6, PZ + 4, PZ + 4.08);
    A.box('flag' + i, x + 0.04, x + 0.9, 7.7, 8.5, PZ + 4.02, PZ + 4.06);
  });

  // ---- blue-roofed steel carports along the north face ----
  for (const [a, b] of [[X0 + 0.5, ENT[0] - 1], [ENT[1] + 1, X1 - 0.5]]) {
    const z0 = Z0 - 6.5, p = (x, y, z) => [x, y, z];
    A.quad('carRoof', p(a, 3.0, Z0 - 0.3), p(b, 3.0, Z0 - 0.3), p(b, 3.4, z0), p(a, 3.4, z0));
    A.quad('carRoof', p(a, 3.0, Z0 - 0.3), p(a, 3.4, z0), p(b, 3.4, z0), p(b, 3.0, Z0 - 0.3));
    for (let x = a + 0.5; x <= b; x += 5) {
      A.box('steel', x - 0.1, x + 0.1, 0, 3.3, z0 + 1.2, z0 + 1.4);
      A.box('steel', x - 0.08, x + 0.08, 2.9, 3.2, z0 + 0.2, Z0 - 0.3);
    }
  }

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true);
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    yellow: std({ color: '#ece5d3' }),                    // name kept from the first survey; the faces are cream
    ledge: std({ color: '#d3cdbf', roughness: 0.95 }),
    fascia: std({ color: '#b98c62', roughness: 0.9 }),
    endWall: std({ color: '#e2ac94' }),
    strip: std({ color: '#f1ede5' }),
    orange: std({ color: '#d6764a', roughness: 0.75 }),
    cream: std({ color: '#e9dcc4' }),
    lav: std({ color: '#948fcb', roughness: 0.75 }),
    joint: std({ color: '#d2c6b0' }),
    glass: std({ color: '#4e6170', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    roof: std({ color: '#a7a8a6', roughness: 0.95 }),
    plant: std({ color: '#c4c5c3', roughness: 0.8 }),
    soffit: std({ color: '#f1ece2', side: THREE.DoubleSide }),
    paving: std({ color: '#c9c4bb', roughness: 1 }),
    pole: std({ color: '#e8e8e8', metalness: 0.5, roughness: 0.4 }),
    carRoof: std({ color: '#3d6fb6', roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide }),
    steel: std({ color: '#d9a92a', roughness: 0.6, metalness: 0.3 }),
  };
  flags.forEach((c, i) => { MAT['flag' + i] = std({ color: c, side: THREE.DoubleSide }); });
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
  // white panel with "KMITL" in red near the top of the east end, at the white strip
  A.b = {};
  onFace(A, 'strip', E, ZS[0] - 4.2, ZS[1] + 0.3, ROOF - 3.0, ROOF - 0.4, 0.14, 0.2);
  for (const [k, B] of Object.entries(A.b)) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    add(g, MAT[k]);
  }
  {
    const x = X1 + 0.21, y0 = ROOF - 2.4, y1 = ROOF - 1.0, za = ZS[1], zb = ZS[0] - 3.9;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([x, y0, za, x, y0, zb, x, y1, zb, x, y0, za, x, y1, zb, x, y1, za], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: textTex('KMITL', { color: '#c8302b', w: 1024, h: 220 }), transparent: true, alphaTest: 0.3 }));
  }
  return { meshes, top: ROOF + 1.4 + 3.4 };
}

// Ground outline (body and south towers)
export const A_OUTLINE = [
  [X0, Z0], [X1, Z0], [X1, Z1], [-145.0, Z1], [-145.0, Z1 + 3.4], [-150.8, Z1 + 3.4], [-150.8, Z1],
  [-160.0, Z1], [-160.0, Z1 + 3.4], [-171.5, Z1 + 3.4], [-171.5, Z1], [-182.0, Z1], [-182.0, Z1 + 3.4],
  [-187.1, Z1 + 3.4], [-187.1, Z1], [X0, Z1], [X0, Z0],
];
