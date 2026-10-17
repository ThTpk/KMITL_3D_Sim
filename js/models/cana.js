// Hand-built model of โรงอาหาร A คณะวิศวกรรมศาสตร์ (Engineering A-Dining Hall, OSM way 190880523).
// Surveyed 2026-10-17 from Google Maps satellite imagery (three roofs: a white west block, a grey central
// hall that reaches further north as the entrance, a white east hall, and a low annex on the south) and
// Google Street View: the north-east corner and east side from the road (a car pano about 25 m away) and a
// 360° photo at the north entrance (looking into the hall). The west and south sides are behind other
// buildings and trees and follow the same pattern. Photos were only looked at; everything is procedural.
//
// x = east, z = south, y = up.
//   east hall   x -245.5..-224.5, z 96..117: one storey on a 1.2 m plinth, open sides with a low white
//               parapet, square white columns, deep white eaves, low light-grey metal roof; an enclosed
//               pink block with a steel grille at the north-east corner, steps up from the road
//   centre      x -257..-245.5, z 89.5..120: taller hall; at the north a deep white slab on round columns
//               over the entrance steps, behind it a high open hall with a low gabled roof
//   west block  x -273..-257, z 96..122: cream walls with windows, flat white roof
//   south annex x -246..-232, z 117..126: low service block
import * as THREE from 'three';
import { Acc, onFace, glassTex } from './ecc.js';

const P = 1.2, EAVE = 4.9;                               // plinth, eave height
const EH = [-245.5, -224.5, 96, 117], CH = [-257, -245.5, 89.5, 120], WB = [-273, -257, 96, 122], SA = [-246, -232, 117, 126];

export function buildCanA(owner) {
  const A = new Acc();
  const face = (ax, at, out) => ({ ax, at, out });

  // ---- east hall: plinth, open sides, parapet, columns, eaves, low hipped metal roof ----
  {
    const [x0, x1, z0, z1] = EH;
    A.box('plinth', x0, x1, 0, P, z0, z1);
    A.box('floor', x0 + 0.3, x1 - 0.3, P, P + 0.05, z0 + 0.3, z1 - 0.3);
    A.box('wall', x0 + 2, x1 - 9, P, EAVE - 0.3, z0 + 6, z1 - 3);               // kitchens / stalls inside
    for (const [f, a0, a1] of [[face('z', z0, -1), x0, x1 - 6], [face('x', x1, 1), z0 + 8, z1], [face('z', z1, 1), x0, x1]]) {
      onFace(A, 'wall', f, a0, a1, P, P + 1.0, -0.2, 0);                           // low parapet
      onFace(A, 'wall', f, a0, a1, P + 1.0, P + 1.1, -0.25, 0.05);
    }
    for (let x = x0 + 0.3; x <= x1 - 0.29; x += 3.5) for (const z of [z0 + 0.3, z1 - 0.3]) A.box('column', x - 0.22, x + 0.22, P, EAVE, z - 0.22, z + 0.22);
    for (let z = z0 + 0.3; z <= z1 - 0.29; z += 3.5) A.box('column', x1 - 0.52, x1 - 0.08, P, EAVE, z - 0.22, z + 0.22);
    A.box('white', x0 - 1.2, x1 + 1.2, EAVE, EAVE + 0.45, z0 - 1.2, z1 + 1.2);   // deep eave slab
    A.box('soffit', x0 - 1.15, x1 + 1.15, EAVE - 0.02, EAVE, z0 - 1.15, z1 + 1.15, false);
    const y0 = EAVE + 0.45, y1 = y0 + 1.3, xm0 = x0 + 6, xm1 = x1 - 6, zm = (z0 + z1) / 2;   // low hipped roof
    const a = [x0 - 1, y0, z0 - 1], b = [x1 + 1, y0, z0 - 1], c = [x1 + 1, y0, z1 + 1], d = [x0 - 1, y0, z1 + 1];
    const r0 = [xm0, y1, zm], r1 = [xm1, y1, zm];
    A.quad('metal', b, a, r0, r1); A.quad('metal', d, c, r1, r0); A.tri('metal', a, d, r0); A.tri('metal', c, b, r1);
    // pink enclosed corner block with a steel grille, steps up from the road
    A.box('pink', x1 - 6, x1, P, EAVE, z0, z0 + 7.5);
    onFace(A, 'grille', face('z', z0, -1), x1 - 5.5, x1 - 3.5, P + 0.2, EAVE - 0.4, 0, 0.06);
    onFace(A, 'grille', face('x', x1, 1), z0 + 0.5, z0 + 3, P + 0.2, EAVE - 0.4, 0, 0.06);
    for (let s = 0; s < 6; s++) A.box('plinth', x1 - 9.5, x1 - 7.3, 0, P - s * 0.2, z0 - 1.2 - s * 0.3, z0);
    for (let s = 0; s < 6; s++) A.box('plinth', x1, x1 + 1.2 + s * 0.3, 0, P - s * 0.2, z0 + 12, z0 + 14.5);
  }

  // ---- centre: entrance slab on round columns, high hall behind with a low gable ----
  {
    const [x0, x1, z0, z1] = CH, ZE = 96, HH = 7.2;
    A.box('plinth', x0, x1, 0, P, z0 + 3, z1);
    for (let s = 0; s < 4; s++) A.box('plinth', x0 + 0.5, x1 - 0.5, 0, P - s * 0.3, z0 + 3 - (s + 1) * 0.6, z0 + 3);
    A.box('white', x0 - 0.5, x1 + 0.5, 4.6, 5.2, z0, ZE + 0.5);                   // deep entrance slab
    A.box('soffit', x0 - 0.45, x1 + 0.45, 4.58, 4.6, z0 + 0.05, ZE, false);
    for (const x of [x0 + 1.2, (x0 + x1) / 2, x1 - 1.2]) A.cyl('column', x, z0 + 1.6, 0.35, P, 4.6, 14);
    A.cyl('column', x0 + 1.2, ZE - 0.6, 0.35, P, 4.6, 14);
    for (const x of [x0, x1 - 0.35]) A.box('white', x, x + 0.35, P, HH, ZE, z1);  // hall side walls (upper part)
    onFace(A, 'glass', face('x', x0, -1), ZE + 2, z1 - 2, 5.4, HH - 0.6, 0, 0.05); // clerestory
    onFace(A, 'glass', face('x', x1, 1), ZE + 2, z1 - 2, 5.4, HH - 0.6, 0, 0.05);
    A.box('white', x0, x1, P, P + 1.0, z1 - 0.3, z1);
    const ym = HH + 1.4, xm = (x0 + x1) / 2;
    A.quad('roofGrey', [x0 - 0.6, HH, z1 + 0.6], [xm, ym, z1 + 0.6], [xm, ym, ZE - 0.3], [x0 - 0.6, HH, ZE - 0.3]);
    A.quad('roofGrey', [xm, ym, z1 + 0.6], [x1 + 0.6, HH, z1 + 0.6], [x1 + 0.6, HH, ZE - 0.3], [xm, ym, ZE - 0.3]);
    for (const z of [ZE - 0.3, z1 + 0.6]) {
      const o = z < 100 ? -1 : 1;
      if (o > 0) A.tri('white', [x0 - 0.6, HH, z], [x1 + 0.6, HH, z], [xm, ym, z]);
      else A.tri('white', [x1 + 0.6, HH, z], [x0 - 0.6, HH, z], [xm, ym, z]);
    }
    A.box('white', x0 + 0.2, x1 - 0.2, 5.2, HH, ZE - 0.3, ZE);                     // gable wall over the entrance
    for (let k = 0; k < 6; k++) onFace(A, 'vent', face('z', ZE - 0.3, -1), x0 + 1.2 + k * 1.6, x0 + 2.3 + k * 1.6, 5.6, 6.6, 0, 0.05);
  }

  // ---- west block: cream walls with windows, flat white roof ----
  {
    const [x0, x1, z0, z1] = WB, H = 5.6;
    A.box('cream', x0, x1, 0, H, z0, z1);
    A.box('plinth', x0 - 0.2, x1, 0, P, z0 - 0.2, z1 + 0.2);
    const fN = face('z', z0, -1), fW = face('x', x0, -1), fS = face('z', z1, 1);
    for (let a = x0 + 1.5; a < x1 - 2; a += 3.4) { onFace(A, 'glass', fN, a, a + 2.0, 2.2, 4.0, 0, 0.05); onFace(A, 'glass', fS, a, a + 2.0, 2.2, 4.0, 0, 0.05); }
    for (let a = z0 + 1.5; a < z1 - 2; a += 3.4) onFace(A, 'glass', fW, a, a + 2.0, 2.2, 4.0, 0, 0.05);
    for (const f of [fN, fW, fS]) onFace(A, 'white', f, f.ax === 'z' ? x0 : z0, f.ax === 'z' ? x1 : z1, H - 0.5, H, 0, 0.25);
    A.box('roofWhite', x0 + 0.2, x1, H, H + 0.08, z0 + 0.2, z1 - 0.2);
  }

  // ---- south annex ----
  {
    const [x0, x1, z0, z1] = SA;
    A.box('cream', x0, x1, 0, 3.6, z0, z1);
    for (let a = x0 + 1.5; a < x1 - 2; a += 3.2) onFace(A, 'vent', face('z', z1, 1), a, a + 1.6, 2.2, 3.0, 0, 0.05);
    A.box('roofGrey', x0 - 0.3, x1 + 0.3, 3.6, 3.75, z0, z1 + 0.3);
  }

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true);
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    plinth: std({ color: '#cfcac0', roughness: 1 }),
    floor: std({ color: '#b9b5ad', roughness: 0.9 }),
    wall: std({ color: '#f1efe9' }),
    white: std({ color: '#f4f3ef', roughness: 0.7, side: THREE.DoubleSide }),
    column: std({ color: '#efede7', roughness: 0.7 }),
    soffit: std({ color: '#e9e6de', roughness: 0.9, side: THREE.DoubleSide }),
    metal: std({ color: '#c3c6c8', roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide }),
    pink: std({ color: '#ead4d4' }),
    grille: std({ color: '#5c5a57', roughness: 0.6, metalness: 0.4 }),
    cream: std({ color: '#ece4d2' }),
    glass: std({ color: '#4a5a62', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    vent: std({ color: '#8d8f90', roughness: 0.7 }),
    roofGrey: std({ color: '#8f9294', roughness: 0.8, metalness: 0.2, side: THREE.DoubleSide }),
    roofWhite: std({ color: '#e7e5df', roughness: 0.9 }),
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
  return { meshes, top: 8.6 };
}

// Ground outline traced from the satellite imagery
export const CANA_OUTLINE = [
  [-273, 96], [-257, 96], [-257, 89.5], [-245.5, 89.5], [-245.5, 96], [-224.5, 96], [-224.5, 117], [-232, 117],
  [-232, 126], [-246, 126], [-246, 120], [-257, 120], [-257, 122], [-273, 122], [-273, 96],
];
