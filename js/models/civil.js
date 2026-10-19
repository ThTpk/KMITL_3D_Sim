// Hand-built model of ภาคโยธา (Civil Engineering department, OSM way 516204085). OSM draws one big block;
// the satellite imagery shows a group of buildings round a tree-filled courtyard, modelled separately.
// Re-surveyed 2026-10-19 from Google Maps satellite imagery (plan, roofs) and Google Street View sweeps from
// all four sides: eight panos on the road along the north, six on the lane to the west, five on the lane to
// the east and six on the road along the south, each looked at in several directions and tilts.
// Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up.
//   north wing   x -420..-396, z 96..116: two storeys, orange-brick piers with cream panels, dark green roller
//                shutters under a cream lintel band, upper windows between the piers, red gable roof; benches,
//                tables and a poster board out front
//   stair tower  x -397..-393, z 94.5..100: tall plain cream tower between the wing and the entrance block
//   entrance     x -394..-382, z 94..116.5: cream, an open double-height hall up a flight of steps under a deep
//                fascia carrying the dark sign "ภาควิชาวิศวกรรมโยธา / DEPARTMENT OF CIVIL ENGINEERING", grey gable
//   east block   x -382..-371.5, z 97..118: blank tall cream north wall with a green rail at its foot; the east face
//                two storeys of tan render between pink pilasters, teal louvred windows below, a recessed upper
//                balcony with white panels and air-conditioners, a pink parapet lettered DEPARTMENT OF CIVIL
//                ENGINEERING; light metal gable behind
//   south block  x -422..-372.5, z 134..149: four storeys facing the south road, tan render, ribbon windows with
//                brown spandrels, concrete sun-shade fins on the upper floors, white top fascia, entrance steps
//                at the east end; light metal roof
//   west halls   x -446..-425, z 112.5..155.5: tall white workshop halls, grey roller shutters under concrete
//                canopies, louvre vents, metal gable roofs eaving to the west lane
//   two small flat-roofed blocks off the courtyard
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex, textTex } from './ecc.js';

const N = (at) => ({ ax: 'z', at, out: -1 }), S = (at) => ({ ax: 'z', at, out: 1 });
const W = (at) => ({ ax: 'x', at, out: -1 }), E = (at) => ({ ax: 'x', at, out: 1 });

export function buildCivil(owner) {
  const A = new Acc();
  // gable roof over [x0,x1]x[z0,z1] at eave height y, ridge along 'x' or 'z'; gable ends filled with m2
  const gable = (m, x0, x1, z0, z1, y, rise, along, ov = 0.6, m2 = 'wall') => {
    const X0 = x0 - ov, X1 = x1 + ov, Z0 = z0 - ov, Z1 = z1 + ov;
    if (along === 'z') {
      const xm = (x0 + x1) / 2;
      A.quad(m, [X0, y, Z1], [xm, y + rise, Z1], [xm, y + rise, Z0], [X0, y, Z0]);
      A.quad(m, [xm, y + rise, Z1], [X1, y, Z1], [X1, y, Z0], [xm, y + rise, Z0]);
      A.tri(m2, [x1, y, z1], [x0, y, z1], [xm, y + rise - 0.1, z1]);
      A.tri(m2, [x0, y, z0], [x1, y, z0], [xm, y + rise - 0.1, z0]);
    } else {
      const zm = (z0 + z1) / 2;
      A.quad(m, [X1, y, Z0], [X1, y + rise, zm], [X0, y + rise, zm], [X0, y, Z0]);
      A.quad(m, [X1, y + rise, zm], [X1, y, Z1], [X0, y, Z1], [X0, y + rise, zm]);
      A.tri(m2, [x1, y, z0], [x1, y, z1], [x1, y + rise - 0.1, zm]);
      A.tri(m2, [x0, y, z1], [x0, y, z0], [x0, y + rise - 0.1, zm]);
    }
  };
  const texts = [];   // [text, opts, bottom-left, bottom-right, height]

  // ---- north wing: brick piers, cream panels, green shutters, upper windows, red gable ----
  {
    const x0 = -420, x1 = -396, z0 = 96, z1 = 116, H = 7.4, f = N(z0);
    A.box('cream', x0, x1, 0, H, z0, z1);
    for (let x = x0; x <= x1 + 0.01; x += 4.8) onFace(A, 'brick', f, Math.max(x0, x - 0.6), Math.min(x1, x + 0.6), 0, H, 0, 0.35);
    for (let x = x0 + 0.6; x < x1 - 1; x += 4.8) {
      onFace(A, 'shutter', f, x + 0.15, x + 3.45, 0, 2.9, 0, 0.05);
      onFace(A, 'cream', f, x, x + 3.6, 2.9, 3.8, 0, 0.3);                               // lintel band
      onFace(A, 'canopy', f, x - 0.1, x + 3.7, 3.55, 3.65, 0, 1.1);                     // thin canopy
      onFace(A, 'frame', f, x + 0.3, x + 3.3, 4.3, 6.5, 0, 0.04);
      onFace(A, 'glass', f, x + 0.45, x + 3.15, 4.45, 6.35, 0, 0.07);
    }
    for (const g of [S(z1), W(x0)]) {
      const [a0, a1] = g.ax === 'z' ? [x0, x1] : [z0, z1];
      for (let a = a0 + 1.2; a < a1 - 2; a += 4) for (const y of [1.0, 4.4]) onFace(A, 'glass', g, a, a + 2.4, y, y + 1.7, 0, 0.05);
      for (let a = a0; a <= a1 + 0.01; a += 4.8) onFace(A, 'brick', g, Math.max(a0, a - 0.5), Math.min(a1, a + 0.5), 0, H, 0, 0.25);
    }
    gable('red', x0, x1, z0, z1, H, 2.6, 'x', 0.9, 'cream');
    onFace(A, 'fascia', f, x0 - 0.9, x1 + 0.9, H - 0.35, H, 0, 1.0);
    // benches, tables and a poster board in front
    for (const x of [-416, -409, -402]) { A.box('bench', x, x + 1.8, 0.4, 0.5, 91.5, 92); A.box('bench', x, x + 1.8, 0.5, 0.9, 91.5, 91.6); }
    for (const x of [-413, -405]) { A.box('stair', x, x + 1.6, 0.7, 0.78, 93, 94.2); A.box('stair', x + 0.6, x + 1.0, 0, 0.7, 93.4, 93.8); }
    A.box('board', -410.5, -409.2, 0.3, 2.4, 92.6, 92.7); A.box('rail', -410.4, -409.3, 0, 0.3, 92.6, 92.7);
  }
  // ---- stair tower: tall plain cream ----
  A.box('cream', -397, -393, 0, 10.4, 94.5, 100);
  onFace(A, 'glass', E(-393), 96.5, 97.3, 1.5, 9, 0, 0.05);
  // ---- entrance block: open double-height hall under the sign fascia, grey gable ----
  {
    const x0 = -394, x1 = -382, z0 = 94, z1 = 116.5, H = 8.2, f = N(z0);
    const hx0 = -392.5, hx1 = -383.5, hz = z0 + 6;                                         // open hall
    A.box('cream', x0, x1, 0, H, hz, z1);
    A.box('cream', x0, hx0, 0, H, z0, hz); A.box('cream', hx1, x1, 0, H, z0, hz);
    A.box('cream', hx0, hx1, 5.2, H, z0, z0 + 1.2);                                         // fascia over the hall
    A.box('stair', hx0, hx1, 0, 0.9, z0 + 1.2, hz);                                         // hall floor
    for (let s = 0; s < 5; s++) A.box('stair', hx0, hx1, 0, 0.18 * (s + 1), z0 - 0.3 * (4 - s) + 0.0, z0 + 1.2);
    A.box('cream', hx0, hx1, 5.0, 5.2, z0 + 1.2, hz, false);                                // hall ceiling
    for (const x of [hx0 + 3, hx1 - 3]) A.box('cream', x - 0.25, x + 0.25, 0.9, 5.0, z0 + 1.6, z0 + 2.1);
    onFace(A, 'rail', N(hz), hx0, hx1, 0.9, 1.0, 0, 0.6);
    onFace(A, 'glass', N(hz), hx0 + 1, hx1 - 1, 1.0, 4.6, 0, 0.05);
    onFace(A, 'sign', f, hx0 + 0.4, hx1 - 0.4, 5.55, 7.6, 0, 0.12);
    texts.push(['ภาควิชาวิศวกรรมโยธา', { color: '#e9e4d8', h: 150 }, [hx1 - 0.7, 6.65, z0 - 0.14], [hx0 + 0.7, 6.65, z0 - 0.14], 0.8]);
    texts.push(['DEPARTMENT OF CIVIL ENGINEERING', { color: '#e9e4d8', h: 120, font: 'Arial' }, [hx1 - 1.0, 5.85, z0 - 0.14], [hx0 + 1.0, 5.85, z0 - 0.14], 0.5]);
    for (const g of [W(x0), E(x1)]) for (let z = hz + 2; z < z1 - 2; z += 4) for (const y of [1.0, 4.6]) onFace(A, 'glass', g, z, z + 2.2, y, y + 1.6, 0, 0.05);
    gable('roofGrey', x0, x1, z0, z1, H, 2.6, 'z', 0.5, 'cream');
  }
  // ---- east block: blank north wall, pink pilasters, louvres, recessed balcony, lettered parapet ----
  {
    const x0 = -382, x1 = -371.5, z0 = 97, z1 = 118, H = 7.6, f = E(x1);
    A.box('tan', x0, x1 - 1.6, 0, H, z0, z1);                                               // upper floor set back
    A.box('tan', x0, x1, 0, 3.8, z0, z1);
    A.box('cream', x0, x1, 0, H + 0.4, z0, z0 + 0.6);                                       // tall blank north wall
    onFace(A, 'green', N(z0), x0 + 0.5, x1 - 0.5, 0.2, 1.1, 0, 0.1);                         // green rail at its foot
    for (let z = z0 + 0.6; z <= z1 + 0.01; z += 5.1) onFace(A, 'pink', f, Math.max(z0, z - 0.5), Math.min(z1, z + 0.5), 0, H - 0.2, 0, 0.2);
    for (let z = z0 + 1.6; z < z1 - 2; z += 5.1) {
      onFace(A, 'frame', f, z, z + 3.0, 0.9, 3.0, 0, 0.04);
      onFace(A, 'louvre', f, z + 0.12, z + 2.88, 1.0, 2.9, 0, 0.07);
      onFace(A, 'panel', E(x1 - 1.6), z - 0.2, z + 3.2, 4.4, 6.3, 0, 0.3);                  // white balcony panels
      A.box('ac', x1 - 1.3, x1 - 0.7, 4.1, 4.7, z + 3.4, z + 4.2);
    }
    onFace(A, 'cream', f, z0, z1, 3.6, 4.1, 0, 0.15);                                       // balcony slab edge
    A.box('pink', x1 - 1.6, x1 + 0.1, H - 0.2, H + 1.2, z0, z1);                             // parapet
    texts.push(['DEPARTMENT OF CIVIL ENGINEERING', { color: '#b98f8a', h: 120, font: 'Arial' }, [x1 + 0.13, H + 0.15, z1 - 3], [x1 + 0.13, H + 0.15, z0 + 3], 0.75]);
    for (let a = x0 + 1; a < x1 - 2; a += 4) onFace(A, 'glass', S(z1), a, a + 2, 1.0, 2.6, 0, 0.05);
    gable('metal', x0, x1 - 1.6, z0 + 0.6, z1, H, 1.6, 'z', 0.3, 'tan');
  }
  // ---- south block: four storeys, ribbon windows, brown spandrels, sun-shade fins, white fascia ----
  {
    const x0 = -422, x1 = -372.5, z0 = 134, z1 = 149, G = 3.8, FL = 3.4, n = 4, H = G + (n - 1) * FL;
    A.box('tan', x0, x1, 0, H, z0, z1);
    for (const f of [S(z1), N(z0)]) {
      for (let k = 0; k < n; k++) {
        const yb = k === 0 ? 0 : G + (k - 1) * FL;
        onFace(A, 'spandrel', f, x0, x1, yb + 0.1, yb + 1.0, 0, 0.06);
        onFace(A, 'frame', f, x0 + 0.6, x1 - 0.6, yb + 1.0, yb + 2.6, 0, 0.04);
        onFace(A, 'glassG', f, x0 + 0.7, x1 - 0.7, yb + 1.05, yb + 2.55, 0, 0.07);
        if (k > 0) onFace(A, 'white', f, x0 - 0.2, x1 + 0.2, yb - 0.15, yb + 0.1, 0, 0.9);  // floor slab / sun-shade
      }
      for (let x = x0; x <= x1 + 0.01; x += 3.3) onFace(A, 'fin', f, x - 0.12, x + 0.12, 0.1, H, 0, 0.7);
      onFace(A, 'white', f, x0 - 0.3, x1 + 0.3, H, H + 1.0, 0, 0.5);                      // top fascia
    }
    for (const f of [W(x0), E(x1)]) for (let k = 0; k < n; k++) {
      const yb = k === 0 ? 0 : G + (k - 1) * FL;
      onFace(A, 'glassG', f, z0 + 3, z1 - 3, yb + 1.05, yb + 2.55, 0, 0.05);
    }
    onFace(A, 'white', E(x1), z0 - 0.3, z1 + 0.3, H, H + 1.0, 0, 0.3);
    onFace(A, 'white', W(x0), z0 - 0.3, z1 + 0.3, H, H + 1.0, 0, 0.3);
    A.box('metal', x0, x1, H + 0.3, H + 1.3, z0, z1);
    // entrance steps and door at the east end of the south face
    onFace(A, 'door', S(z1), x1 - 6, x1 - 4, 0.6, 2.8, 0.75, 0.8);
    for (let s = 0; s < 4; s++) A.box('stair', x1 - 7, x1 - 3, 0, 0.15 * (s + 1), z1, z1 + 2.2 - s * 0.5);
  }
  // ---- west halls: tall white, roller shutters under concrete canopies, louvres, gables to the lane ----
  for (const [z0, z1] of [[112.5, 136], [136, 155.5]]) {
    const x0 = -446, x1 = -425, h = 6.6, f = W(x0);
    A.box('white', x0, x1, 0, h, z0, z1);
    onFace(A, 'base', f, z0, z1, 0, 0.5, 0, 0.05);
    for (let z = z0 + 1.5; z < z1 - 4; z += 7.5) {
      onFace(A, 'shutterG', f, z, z + 4.2, 0, 3.6, 0, 0.05);
      onFace(A, 'concrete', f, z - 0.3, z + 4.5, 3.7, 4.1, 0, 0.9);                         // canopy
      for (let y = 4.7; y < 6.1; y += 0.32) onFace(A, 'concrete', f, z + 5.0, z + 6.6, y, y + 0.08, 0, 0.12);  // louvre vent
      A.box('ac', x0 - 0.5, x0, 2.4, 3.1, z + 5.1, z + 6.0);
    }
    for (const g of [S(z1), N(z0), E(x1)]) {
      const [a0, a1] = g.ax === 'z' ? [x0, x1] : [z0, z1];
      for (let a = a0 + 1.5; a < a1 - 2.5; a += 4.5) onFace(A, 'glass', g, a, a + 2.6, h - 2.0, h - 0.7, 0, 0.05);
    }
    gable('metal', x0, x1, z0, z1, h, 2.0, 'z', 0.8, 'white');
  }
  // ---- small flat-roofed blocks off the courtyard ----
  for (const [x0, x1, z0, z1, h] of [[-424.5, -414, 127.5, 134, 4.2], [-381.5, -371, 123, 134, 4.6]]) {
    A.box('cream', x0, x1, 0, h, z0, z1);
    for (const f of [N(z0), E(x1), W(x0)]) {
      const [a0, a1] = f.ax === 'z' ? [x0, x1] : [z0, z1];
      for (let a = a0 + 1; a < a1 - 2; a += 3) onFace(A, 'glass', f, a, a + 1.6, 1.0, 2.6, 0, 0.05);
    }
    A.box('roofGrey', x0 - 0.2, x1 + 0.2, h, h + 0.3, z0 - 0.2, z1 + 0.2);
    A.box('ac', x0 + 1.5, x0 + 2.5, h + 0.3, h + 1.0, z0 + 1.5, z0 + 2.5);
  }

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const glass = (color) => std({ color, map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 });
  const MAT = {
    wall: std({ color: '#e6d8bd', side: THREE.DoubleSide }),
    cream: std({ color: '#ecdcc0', side: THREE.DoubleSide }),
    tan: std({ color: '#d8c3a2', side: THREE.DoubleSide }),
    white: std({ color: '#ecebe6', side: THREE.DoubleSide }),
    pink: std({ color: '#e4c3bd' }),
    base: std({ color: '#b9b3a6' }),
    concrete: std({ color: '#c9c6bf' }),
    brick: std({ color: '#c46a45', map: brick, roughness: 0.95 }),
    shutter: std({ color: '#2f5a44', roughness: 0.6, metalness: 0.3 }),
    shutterG: std({ color: '#74787b', roughness: 0.6, metalness: 0.4 }),
    green: std({ color: '#3f8f7a', roughness: 0.5, metalness: 0.3 }),
    louvre: std({ color: '#3f7f7c', roughness: 0.6 }),
    frame: std({ color: '#f1f0ec' }),
    panel: std({ color: '#f4f3ef' }),
    spandrel: std({ color: '#a4835e' }),
    fin: std({ color: '#cbbb9f' }),
    canopy: std({ color: '#d7d8d6', roughness: 0.5, metalness: 0.3 }),
    fascia: std({ color: '#8b8d8e' }),
    sign: std({ color: '#2b2f33', roughness: 0.6 }),
    door: std({ color: '#3a3f44', roughness: 0.6 }),
    glass: glass('#46555e'),
    glassG: glass('#4d6461'),
    red: std({ color: '#b5524a', roughness: 0.7, side: THREE.DoubleSide }),
    roofGrey: std({ color: '#8a8c8e', roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide }),
    metal: std({ color: '#d3d5d3', roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide }),
    stair: std({ color: '#cfcac0', roughness: 1 }),
    rail: std({ color: '#d9dcdf', roughness: 0.4, metalness: 0.5 }),
    bench: std({ color: '#8a4f32', roughness: 0.8 }),
    board: std({ color: '#e9e6df' }),
    ac: std({ color: '#e8e8e6', roughness: 0.6 }),
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
  // lettering: quad from bottom-left p to bottom-right q (as the viewer sees it), height h
  for (const [text, opts, p, q, h] of texts) {
    const P = [p, q, [q[0], q[1] + h, q[2]], [p[0], p[1] + h, p[2]]];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([...P[0], ...P[1], ...P[2], ...P[0], ...P[2], ...P[3]], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: textTex(text, opts), transparent: true, alphaTest: 0.3 }));
  }
  return { meshes, top: 15.6 };
}

// Ground outline: the whole group (OSM way 516204085 moved to the imagery), courtyard included
export const CIVIL_OUTLINE = [[-446, 94], [-371, 94], [-371, 149.5], [-425, 149.5], [-425, 155.5], [-446, 155.5], [-446, 94]];
