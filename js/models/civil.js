// Hand-built model of ภาคโยธา (Civil Engineering department, OSM way 516204085). OSM draws one big block;
// the satellite imagery shows a group of low buildings round a tree-filled courtyard, modelled separately.
// Surveyed 2026-10-17 from Google Maps satellite imagery (plan and roofs) and Google Street View from the
// road along the north side (one car pano, looking south-west, south and south-east). The courtyard and
// the west and south halls are not visible from any road; they follow the roofs and the north wing.
// Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up.
//   north wing  x -419..-395, z 89..108: two storeys, cream walls between orange-brick piers, green roller
//               shutters on the ground floor, an open stair at the east end, grey fascia band, red hipped roof
//   north-east  x -395..-381, z 89..111: two storeys, cream walls with the department sign, grey gable roof
//               x -381..-365, z 90..109: workshop, light metal gable roof
//   west hall   x -441..-424, z 105..152 and south hall x -418..-370, z 125..140: single-storey workshops,
//               light corrugated metal gable roofs
//   two small flat-roofed blocks off the courtyard
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex, textTex } from './ecc.js';

export function buildCivil(owner) {
  const A = new Acc();
  // gable roof over [x0,x1]x[z0,z1] at eave height y, ridge along 'x' or 'z'
  const gable = (m, x0, x1, z0, z1, y, rise, along, ov = 0.6) => {
    x0 -= ov; x1 += ov; z0 -= ov; z1 += ov;
    if (along === 'z') {
      const xm = (x0 + x1) / 2;
      A.quad(m, [x0, y, z1], [xm, y + rise, z1], [xm, y + rise, z0], [x0, y, z0]);
      A.quad(m, [xm, y + rise, z1], [x1, y, z1], [x1, y, z0], [xm, y + rise, z0]);
      A.tri('wall', [x1 - ov, y, z1 - ov], [x0 + ov, y, z1 - ov], [xm, y + rise, z1 - ov]);
      A.tri('wall', [x0 + ov, y, z0 + ov], [x1 - ov, y, z0 + ov], [xm, y + rise, z0 + ov]);
    } else {
      const zm = (z0 + z1) / 2;
      A.quad(m, [x1, y, z0], [x1, y + rise, zm], [x0, y + rise, zm], [x0, y, z0]);
      A.quad(m, [x1, y + rise, zm], [x1, y, z1], [x0, y, z1], [x0, y + rise, zm]);
      A.tri('wall', [x1 - ov, y, z0 + ov], [x1 - ov, y, z1 - ov], [x1 - ov, y + rise, zm]);
      A.tri('wall', [x0 + ov, y, z1 - ov], [x0 + ov, y, z0 + ov], [x0 + ov, y + rise, zm]);
    }
  };
  // workshop: plain walls, high window band, roller doors
  const workshop = (x0, x1, z0, z1, h, along) => {
    A.box('wall', x0, x1, 0, h, z0, z1);
    const faces = [{ ax: 'z', at: z0, out: -1, a: [x0, x1] }, { ax: 'z', at: z1, out: 1, a: [x0, x1] }, { ax: 'x', at: x0, out: -1, a: [z0, z1] }, { ax: 'x', at: x1, out: 1, a: [z0, z1] }];
    for (const f of faces) {
      const [a0, a1] = f.a;
      onFace(A, 'base', f, a0, a1, 0, 0.6, 0, 0.05);
      for (let a = a0 + 1.5; a < a1 - 2.5; a += 4.5) onFace(A, 'glass', f, a, a + 2.6, h - 2.1, h - 0.7, 0, 0.05);
    }
    gable('metal', x0, x1, z0, z1, h, 2.2, along);
  };

  // ---- north wing: brick piers, cream infill, shutters, grey fascia, red hipped roof ----
  {
    const x0 = -419, x1 = -395, z0 = 89, z1 = 108, H = 7.6, N = { ax: 'z', at: z0, out: -1 };
    A.box('wall', x0, x1, 0, H, z0, z1);
    for (let x = x0; x <= x1 + 0.01; x += 4.8) onFace(A, 'brick', N, Math.max(x0, x - 0.7), Math.min(x1, x + 0.7), 0, H - 0.8, 0, 0.4);
    for (let x = x0 + 0.7; x < x1 - 1; x += 4.8) {
      onFace(A, 'shutter', N, x + 0.2, x + 3.2, 0, 2.9, 0, 0.05);
      onFace(A, 'wall', N, x, x + 3.4, 3.3, 3.7, 0, 0.35);                          // sill / canopy band
      onFace(A, 'glass', N, x + 0.4, x + 3.0, 4.2, 6.3, 0, 0.05);
    }
    onFace(A, 'fascia', N, x0 - 0.3, x1 + 0.3, H - 0.8, H + 0.3, 0, 0.45);
    for (const f of [{ ax: 'x', at: x0, out: -1 }, { ax: 'x', at: x1, out: 1 }, { ax: 'z', at: z1, out: 1 }])
      onFace(A, 'fascia', f, f.ax === 'x' ? z0 : x0, f.ax === 'x' ? z1 : x1, H - 0.8, H + 0.3, 0, 0.3);
    const y = H + 0.3, r = 2.4, a = [x0, y, z0], b = [x1, y, z0], c = [x1, y, z1], d = [x0, y, z1];
    const m0 = [x0 + 5, y + r, (z0 + z1) / 2], m1 = [x1 - 5, y + r, (z0 + z1) / 2];
    A.quad('red', b, a, m0, m1); A.quad('red', d, c, m1, m0); A.tri('red', a, d, m0); A.tri('red', c, b, m1);
    // open stair at the east end
    A.box('wall', x1, x1 + 3.2, 0, 0.4, z0, z0 + 5);
    for (let s = 0; s < 10; s++) A.box('stair', x1 + 0.2, x1 + 3.0, s * 0.37, s * 0.37 + 0.18, z0 + 4.6 - s * 0.42, z0 + 5 - s * 0.42);
    A.box('rail', x1 + 3.0, x1 + 3.05, 0.4, 4.6, z0 + 0.2, z0 + 5);
  }
  // ---- north-east: cream two-storey with the sign, grey gable ----
  {
    const x0 = -395, x1 = -381, z0 = 89, z1 = 111, H = 7.6, N = { ax: 'z', at: z0, out: -1 };
    A.box('cream', x0, x1, 0, H, z0, z1);
    onFace(A, 'glass', N, x0 + 3, x0 + 5.5, 0, 2.6, 0, 0.05);
    onFace(A, 'fascia', N, x0 + 2, x1 - 2, 5.0, 6.4, 0, 0.1);                         // sign board
    for (const f of [{ ax: 'x', at: x1, out: 1 }, { ax: 'x', at: x0, out: -1 }])
      for (let z = z0 + 2; z < z1 - 2; z += 4) { onFace(A, 'glass', f, z, z + 2.2, 1.0, 2.6, 0, 0.05); onFace(A, 'glass', f, z, z + 2.2, 4.4, 6.0, 0, 0.05); }
    gable('roofGrey', x0, x1, z0, z1, H, 2.6, 'z');
  }
  workshop(-381, -365, 90, 109, 6.4, 'z');

  // ---- west and south workshop halls, small blocks ----
  workshop(-441, -424, 105, 128, 6.0, 'z');
  workshop(-441, -424, 128, 152, 6.0, 'z');
  workshop(-418, -370, 125, 140, 6.0, 'x');
  for (const [x0, x1, z0, z1] of [[-421, -412, 117, 124], [-381, -371, 116, 123]]) {
    A.box('cream', x0, x1, 0, 4.0, z0, z1);
    A.box('roofGrey', x0 - 0.2, x1 + 0.2, 4.0, 4.3, z0 - 0.2, z1 + 0.2);
  }

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    wall: std({ color: '#e6d8bd', side: THREE.DoubleSide }),
    cream: std({ color: '#ead9b8' }),
    base: std({ color: '#b9b3a6' }),
    brick: std({ color: '#c46a45', map: brick, roughness: 0.95 }),
    shutter: std({ color: '#2f5a44', roughness: 0.6, metalness: 0.3 }),
    fascia: std({ color: '#6f7274', roughness: 0.8 }),
    glass: std({ color: '#46555e', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    red: std({ color: '#b5524a', roughness: 0.7, side: THREE.DoubleSide }),
    roofGrey: std({ color: '#8a8c8e', roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide }),
    metal: std({ color: '#d3d5d3', roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide }),
    stair: std({ color: '#cfcac0', roughness: 1 }),
    rail: std({ color: '#d9dcdf', roughness: 0.4, metalness: 0.5 }),
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
  // department sign (faces north: viewer looks south, east on the left)
  {
    const z = 89 - 0.12, x0 = -383.2, x1 = -392.8, y0 = 5.2, y1 = 6.2;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y0, z, x1, y0, z, x1, y1, z, x0, y0, z, x1, y1, z, x0, y1, z], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: textTex('ภาควิชาวิศวกรรมโยธา', { color: '#f2efe8', h: 150 }), transparent: true, alphaTest: 0.3 }));
  }
  return { meshes, top: 10.3 };
}

// Ground outline: the whole group (OSM way 516204085 nudged to the imagery), courtyard included
export const CIVIL_OUTLINE = [[-441.5, 88.5], [-364.5, 88.5], [-364.5, 152.5], [-441.5, 152.5], [-441.5, 88.5]];
