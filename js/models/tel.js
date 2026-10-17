// Hand-built model of ตึกโทรคมนาคม (Telecommunication Engineering building, OSM way 190868528).
// Surveyed 2026-10-17 from Google Maps satellite imagery (plan, roofs, tower position) and Google Street View.
// Street View coverage here is thin and mostly under covered walkways: the south face was read through trees
// from the parking road, the ground floor of the north face across the pond, and the tower from Soi Chalong
// Krung 1 north of the site (its height from the viewing angle, about 46 m to the top platform's mast).
// Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up. Footprint x -226.3..-177, z 32.9..56.4 (satellite roof outline moved 2.2 m
// south for the imagery's lean; the OSM outline is offset).
//   four storeys, painted royal blue, a cantilevered ledge at every floor on the long faces
//   south face: ribbon windows in white frames with AC units, stair tower at the east end
//   north face: punched windows with AC units
//   cream parapet all round; flat roof over the west bay, low gabled metal roof over the rest
//   red-and-white banded concrete telecom tower rising from a round drum on the west roof, two white
//   platforms with rails near the top, a dish and panel antennas, lightning mast
import * as THREE from 'three';
import { Acc, onFace, glassTex } from './ecc.js';

const FL = 3.4, NF = 4, ROOF = FL * NF;       // 13.6
const X0 = -226.3, X1 = -177, Z0 = 32.9, Z1 = 56.4, XG = -210.4, ZR = (Z0 + Z1) / 2;
const TW = [-219.4, 46.6];                     // tower axis

export function buildTel(owner) {
  const A = new Acc();
  const N = { ax: 'z', at: Z0, out: -1 }, S = { ax: 'z', at: Z1, out: 1 };
  const W = { ax: 'x', at: X0, out: -1 }, E = { ax: 'x', at: X1, out: 1 };
  // round bar between two points
  const bar = (m, p, q, r, seg = 8) => {
    const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], L = Math.hypot(...d), w = d.map((v) => v / L);
    const h = Math.abs(w[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let u = [w[1] * h[2] - w[2] * h[1], w[2] * h[0] - w[0] * h[2], w[0] * h[1] - w[1] * h[0]];
    const ul = Math.hypot(...u); u = u.map((v) => v / ul);
    const v = [w[1] * u[2] - w[2] * u[1], w[2] * u[0] - w[0] * u[2], w[0] * u[1] - w[1] * u[0]];
    const ring = (c, t) => [0, 1, 2].map((k) => c[k] + r * (Math.cos(t) * u[k] + Math.sin(t) * v[k]));
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
      A.quad(m, ring(p, t0), ring(p, t1), ring(q, t1), ring(q, t0));
      A.tri(m, p, ring(p, t1), ring(p, t0));
      A.tri(m, q, ring(q, t0), ring(q, t1));
    }
  };

  // ---- body ----
  A.box('wall', X0, X1, 0, ROOF, Z0, Z1);
  // floor ledges on the long faces, a thin band on the ends
  for (let k = 1; k <= NF; k++) {
    const y = k * FL;
    for (const f of [N, S]) onFace(A, 'ledge', f, X0, X1, y - 0.25, y, 0, 0.7);
    for (const f of [W, E]) onFace(A, 'ledge', f, Z0, Z1, y - 0.25, y, 0, 0.15);
  }
  onFace(A, 'base', S, X0, X1, 0, 0.5, 0, 0.1);
  onFace(A, 'base', N, X0, X1, 0, 0.5, 0, 0.1);

  // ---- south face: ribbon windows with white frames, AC units; stair tower at the east end ----
  const SE = X1 - 4.5;
  for (let k = 0; k < NF; k++) {
    const y = k * FL;
    onFace(A, 'frame', S, X0 + 1.2, SE - 0.6, y + 0.85, y + 2.75, 0, 0.06);
    onFace(A, 'glass', S, X0 + 1.4, SE - 0.8, y + 1.0, y + 2.6, 0.06, 0.09);
    for (let x = X0 + 1.4 + 1.6; x < SE - 1; x += 1.6) onFace(A, 'frame', S, x - 0.05, x + 0.05, y + 1.0, y + 2.6, 0.06, 0.1);
    for (let x = X0 + 3; x < SE - 2; x += 7.2) onFace(A, 'ac', S, x, x + 0.9, y + 0.25, y + 0.85, 0, 0.35);
  }
  A.box('wall', SE, X1, 0, ROOF + 1.6, Z1 - 0.2, Z1 + 1.2);
  for (let k = 0; k < NF; k++) A.box('louvre', SE + 1.6, X1 - 1.6, k * FL + 1.6, k * FL + 3.2, Z1 + 1.2, Z1 + 1.26);

  // ---- north face: punched windows, AC units ----
  for (let k = 0; k < NF; k++) {
    const y = k * FL;
    for (let x = X0 + 2.2; x < X1 - 2; x += 4.1) {
      onFace(A, 'frame', N, x - 0.12, x + 1.72, y + 1.0, y + 2.6, 0, 0.06);
      onFace(A, 'glass', N, x, x + 1.6, y + 1.12, y + 2.48, 0.06, 0.09);
      if ((Math.round((x - X0) / 4.1) + k) % 3 === 0) onFace(A, 'ac', N, x + 0.3, x + 1.2, y + 0.3, y + 0.9, 0, 0.35);
    }
  }
  // ---- ends: a column of small windows at the stair landings ----
  for (const f of [W, E]) for (let k = 0; k < NF; k++) {
    onFace(A, 'frame', f, ZR - 0.9, ZR + 0.9, k * FL + 1.4, k * FL + 2.6, 0, 0.06);
    onFace(A, 'glass', f, ZR - 0.75, ZR + 0.75, k * FL + 1.52, k * FL + 2.48, 0.06, 0.09);
  }

  // ---- roof: cream parapet, flat west bay, low gabled metal roof over the rest ----
  const P = 1.2;
  A.box('coping', X0, X1, ROOF, ROOF + P, Z0, Z0 + 0.35);
  A.box('coping', X0, X1, ROOF, ROOF + P, Z1 - 0.35, Z1);
  A.box('coping', X0, X0 + 0.35, ROOF, ROOF + P, Z0, Z1);
  A.box('coping', X1 - 0.35, X1, ROOF, ROOF + P, Z0, Z1);
  A.box('roofFlat', X0 + 0.35, XG, ROOF, ROOF + 0.1, Z0 + 0.35, Z1 - 0.35);
  const RE = ROOF + 0.4, RR = ROOF + 2.6, gy = (z) => RE + (RR - RE) * (1 - Math.abs(z - ZR) / (ZR - Z0 - 0.35));
  for (const [za, zb] of [[Z0 + 0.35, ZR], [ZR, Z1 - 0.35]]) {
    const p = (x, z) => [x, gy(z), z];
    A.quad('metal', p(XG, zb), p(X1 - 0.35, zb), p(X1 - 0.35, za), p(XG, za));
  }
  // gable ends (west one faces the flat roof, east one shows above the parapet)
  for (const [x, o] of [[XG, -1], [X1 - 0.35, 1]]) {
    const a = [x, ROOF, Z0 + 0.35], b = [x, ROOF, Z1 - 0.35], c = [x, RR, ZR], d = [x, RE, Z0 + 0.35], e = [x, RE, Z1 - 0.35];
    if (o > 0) { A.quad('wall', b, a, d, e); A.tri('wall', e, d, c); }
    else { A.quad('wall', a, b, e, d); A.tri('wall', d, e, c); }
  }
  A.box('plant', -224, -221.5, ROOF, ROOF + 1.4, Z0 + 1.5, Z0 + 4);              // water tanks / plant
  A.box('plant', -215, -212, ROOF, ROOF + 1.0, Z1 - 4, Z1 - 1.5);

  // ---- telecom tower ----
  const [tx, tz] = TW, TOP = 44;
  A.cyl('coping', tx, tz, 3.3, ROOF, ROOF + 2.4, 24);                           // round drum on the roof
  let red = true;
  for (let y = TOP; y > ROOF + 2.4; y -= 3) {                                     // banded shaft, red at the top
    A.cyl(red ? 'red' : 'white', tx, tz, 0.85, Math.max(ROOF + 2.4, y - 3), y, 16);
    red = !red;
  }
  for (const y of [37.6, 42.4]) {
    A.cyl('white', tx, tz, 1.65, y - 0.4, y, 24);                                  // platform
    A.cyl('white', tx, tz, 1.2, y - 0.9, y - 0.4, 16);                            // bracket cone
    for (let i = 0; i < 16; i++) {                                                 // railing posts
      const t = (i / 16) * Math.PI * 2;
      bar('rail', [tx + 1.55 * Math.cos(t), y, tz + 1.55 * Math.sin(t)], [tx + 1.55 * Math.cos(t), y + 1.0, tz + 1.55 * Math.sin(t)], 0.03, 4);
    }
    for (let i = 0; i < 16; i++) {                                                 // top rail
      const t0 = (i / 16) * Math.PI * 2, t1 = ((i + 1) / 16) * Math.PI * 2;
      bar('rail', [tx + 1.55 * Math.cos(t0), y + 1.0, tz + 1.55 * Math.sin(t0)], [tx + 1.55 * Math.cos(t1), y + 1.0, tz + 1.55 * Math.sin(t1)], 0.035, 4);
    }
  }
  bar('white', [tx + 1.2, 39.6, tz + 0.9], [tx + 1.45, 39.6, tz + 1.1], 0.95, 16);   // dish facing south-east
  bar('rail', [tx + 0.6, 39.6, tz + 0.45], [tx + 1.2, 39.6, tz + 0.9], 0.06, 4);
  for (const t of [0.4, 2.5, 4.4]) bar('panel', [tx + 1.5 * Math.cos(t), 42.6, tz + 1.5 * Math.sin(t)], [tx + 1.5 * Math.cos(t), 44.2, tz + 1.5 * Math.sin(t)], 0.14, 4);
  A.cyl('red', tx, tz, 0.5, TOP, TOP + 0.6, 12);
  bar('rail', [tx, TOP + 0.6, tz], [tx, TOP + 3.2, tz], 0.07, 6);                 // lightning mast

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true);
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    wall: std({ color: '#2e52b8' }),
    ledge: std({ color: '#3558bd' }),
    base: std({ color: '#25428f' }),
    frame: std({ color: '#eef0f2', roughness: 0.6 }),
    glass: std({ color: '#4d6474', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    ac: std({ color: '#e4e4e0', roughness: 0.7 }),
    louvre: std({ color: '#c9cdd3', roughness: 0.6, metalness: 0.3 }),
    coping: std({ color: '#e6d3c3', roughness: 0.8 }),
    roofFlat: std({ color: '#9a9c9c', roughness: 0.95 }),
    metal: std({ color: '#a4abb5', roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide }),
    plant: std({ color: '#c3c4c2', roughness: 0.8 }),
    red: std({ color: '#d4402f', roughness: 0.6 }),
    white: std({ color: '#f4f4f2', roughness: 0.6 }),
    rail: std({ color: '#d9dcdf', roughness: 0.4, metalness: 0.5 }),
    panel: std({ color: '#e9e9e6', roughness: 0.5 }),
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
  return { meshes, top: TOP + 3.2 };
}

// Ground outline traced from the satellite imagery
export const TEL_OUTLINE = [[X0, Z0], [X1, Z0], [X1, Z1], [X0, Z1], [X0, Z0]];
