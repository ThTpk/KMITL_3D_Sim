// Hand-built model of อาคารมหาวิทยาลัย, the two-storey brick building between the President building and ตึก A
// (OSM way 1138463196 with its roof parts 1138463195, the covered link to the President building, and
// 1138463197, the entrance porch). Surveyed 2026-10-17 from Google Maps satellite imagery (an eight-sided
// white pyramid roof over the north half, a flat roof over the south half, the link and the porch) and three
// Google Street View angles supplied by the user: from the junction south-east of it, from the road along
// its east side (close up), and from the garden to the west. Photos were only looked at; procedural only.
//
// x = east, z = south, y = up.
//   body x -30..-9.3, z -306.6..-267: ground floor glazed, set back behind round white columns under a grey
//   louvred soffit band; upper storey red brick in a white frame of columns and floor slabs, balcony with AC
//   units at the north-east corner; white roof edge
//   north half: low eight-sided pyramid roof, light grey; south half: flat roof, dark
//   porch x -28.8..-17, z -267..-257: white zig-zag canopy with a green translucent roof on white columns,
//   steps; covered link x -29.8..-9.3, z -316.5..-306.6: flat roof on columns to the President building
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex } from './ecc.js';

export function buildUni(owner) {
  const A = new Acc();
  const X0 = -30, X1 = -9.3, Z0 = -306.6, Z1 = -267, G = 4.4, H = 8.6, IN = 2.4, P = 0.5;
  const F = (ax, at, out) => ({ ax, at, out });

  // ---- ground floor: glazed core set back behind round columns ----
  A.box('plinth', X0 - 0.4, X1 + 0.4, 0, P, Z0 - 0.4, Z1 + 0.4);
  A.box('glass', X0 + IN, X1 - IN, P, G - 0.2, Z0 + IN, Z1 - IN);
  for (let x = X0 + 0.6; x <= X1 - 0.5; x += 4.1) for (const z of [Z0 + 0.6, Z1 - 0.6]) A.cyl('column', x, z, 0.35, P, G, 14);
  for (let z = Z0 + 4.6; z <= Z1 - 4; z += 4.1) for (const x of [X0 + 0.6, X1 - 0.6]) A.cyl('column', x, z, 0.35, P, G, 14);
  for (const [f, a0, a1] of [[F('z', Z0, -1), X0, X1], [F('z', Z1, 1), X0, X1], [F('x', X0, -1), Z0, Z1], [F('x', X1, 1), Z0, Z1]]) {
    onFace(A, 'rail', f, a0 + 0.6, a1 - 0.6, P, P + 1.0, -1.2, -1.15);
  }
  // ---- grey louvred soffit band and the upper storey ----
  A.box('soffit', X0 - 0.3, X1 + 0.3, G, G + 0.9, Z0 - 0.3, Z1 + 0.3);
  for (const [f, a0, a1] of [[F('z', Z0 - 0.3, -1), X0, X1], [F('z', Z1 + 0.3, 1), X0, X1], [F('x', X0 - 0.3, -1), Z0, Z1], [F('x', X1 + 0.3, 1), Z0, Z1]])
    for (let y = G + 0.1; y < G + 0.85; y += 0.18) onFace(A, 'louvreDark', f, a0 - 0.3, a1 + 0.3, y, y + 0.06, 0, 0.05);
  A.box('white', X0 - 0.4, X1 + 0.4, G + 0.9, G + 1.25, Z0 - 0.4, Z1 + 0.4);   // upper floor slab edge
  A.box('brick', X0, X1, G + 1.25, H, Z0, Z1);
  // white frame: columns at the corners and every bay, roof edge
  const frame = (f, a0, a1, bay) => {
    for (let a = a0; a <= a1 + 0.01; a += bay) onFace(A, 'white', f, Math.max(a0, a - 0.3), Math.min(a1, a + 0.3), G + 1.25, H, 0, 0.3);
    for (let a = a0 + bay / 2; a < a1 - 0.5; a += bay) onFace(A, 'glass', f, a - 0.9, a + 0.9, G + 2.1, H - 0.9, 0, 0.05);
  };
  frame(F('x', X1, 1), Z0, Z1, 6.6);
  frame(F('x', X0, -1), Z0, Z1, 6.6);
  frame(F('z', Z1, 1), X0, X1, 6.9);
  frame(F('z', Z0, -1), X0, X1, 6.9);
  // balcony with AC units at the north-east corner
  A.box('glass', X1 - 5.4, X1 - 0.3, G + 1.25, H - 0.3, Z0 + 0.3, Z0 + 2.4);
  A.box('white', X1 - 5.7, X1, G + 1.25, G + 1.4, Z0, Z0 + 2.4);
  for (const x of [X1 - 4.6, X1 - 3.4, X1 - 2.2]) A.box('ac', x, x + 0.9, G + 1.4, G + 2.0, Z0 + 2.0, Z0 + 2.4);
  A.box('white', X0 - 0.4, X1 + 0.4, H, H + 0.6, Z0 - 0.4, Z1 + 0.4);           // roof edge

  // ---- roofs: eight-sided pyramid over the north half, flat over the south half ----
  {
    const cx = (X0 + X1) / 2, cz = -294.5, rx = 9.0, rz = 9.0, y0 = H + 0.6, y1 = H + 4.6, N = 8;
    const P8 = (i) => { const t = (i / N) * Math.PI * 2 + Math.PI / 8; return [cx + rx * Math.cos(t) / Math.cos(Math.PI / 8), y0, cz + rz * Math.sin(t) / Math.cos(Math.PI / 8)]; };
    for (let i = 0; i < N; i++) {
      const a = P8(i), b = P8((i + 1) % N);
      const clamp = (p) => [Math.max(X0 + 0.5, Math.min(X1 - 0.5, p[0])), p[1], Math.max(Z0 + 0.5, Math.min(-283, p[2]))];
      A.tri(i % 2 ? 'pyr' : 'pyrLight', clamp(b), clamp(a), [cx, y1, cz]);
    }
    A.box('roof', X0 - 0.2, X1 + 0.2, H + 0.5, H + 0.6, Z0, Z1);
  }

  // ---- porch: white zig-zag canopy, green translucent roof, columns, steps ----
  {
    const px0 = -28.8, px1 = -17, pz0 = Z1, pz1 = -257, y = 4.2;
    for (const x of [px0 + 0.5, px1 - 0.5]) for (const z of [pz1 - 0.6, pz1 - 5]) A.cyl('column', x, z, 0.3, 0, y, 12);
    const n = 4, w = (px1 - px0) / n;
    for (let i = 0; i < n; i++) {
      const a = px0 + i * w, b = a + w, m = a + w / 2;
      A.quad('white', [a, y + 1.0, pz1], [m, y, pz1], [m, y, pz0], [a, y + 1.0, pz0]);
      A.quad('white', [m, y, pz1], [b, y + 1.0, pz1], [b, y + 1.0, pz0], [m, y, pz0]);
      A.quad('greenGlass', [a, y + 1.08, pz1], [m, y + 0.08, pz1], [m, y + 0.08, pz0], [a, y + 1.08, pz0]);
      A.quad('greenGlass', [m, y + 0.08, pz1], [b, y + 1.08, pz1], [b, y + 1.08, pz0], [m, y + 0.08, pz0]);
    }
    for (let s = 0; s < 3; s++) A.box('plinth', px0 + 1, px1 - 1, 0, P - s * 0.15, pz0, pz1 - 2 + s * 0.6 + 0.6);
  }
  // ---- covered link to the President building ----
  {
    const lz0 = -315.8, lz1 = Z0;
    A.box('roof', X0 + 0.2, X1 - 0.2, 4.4, 4.75, lz0, lz1);
    A.box('white', X0 + 0.1, X1 - 0.1, 4.2, 4.4, lz0, lz1);
    for (let x = X0 + 1; x < X1; x += 4.9) A.cyl('column', x, lz0 + 1.5, 0.28, 0, 4.2, 12);
  }

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    plinth: std({ color: '#d2cec5', roughness: 1 }),
    glass: std({ color: '#435259', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    column: std({ color: '#f1f0ec', roughness: 0.6 }),
    rail: std({ color: '#3d3f40', roughness: 0.5, metalness: 0.5 }),
    soffit: std({ color: '#7d8082', roughness: 0.6, metalness: 0.2 }),
    louvreDark: std({ color: '#5a5d60', roughness: 0.6, metalness: 0.3 }),
    white: std({ color: '#f2f1ed', roughness: 0.7, side: THREE.DoubleSide }),
    brick: std({ color: '#b8603f', map: brick, roughness: 0.95 }),
    ac: std({ color: '#e8e8e5', roughness: 0.7 }),
    pyr: std({ color: '#dedcd6', roughness: 0.6, metalness: 0.2 }),
    pyrLight: std({ color: '#ebeae5', roughness: 0.6, metalness: 0.2 }),
    roof: std({ color: '#55585b', roughness: 0.95 }),
    greenGlass: std({ color: '#7fb79a', roughness: 0.3, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
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
  return { meshes, top: 13.2 };
}

export const UNI_OUTLINE = [[-30, -306.6], [-9.3, -306.6], [-9.3, -267], [-17, -267], [-17, -257], [-28.8, -257], [-28.8, -267], [-30, -267], [-30, -306.6]];
