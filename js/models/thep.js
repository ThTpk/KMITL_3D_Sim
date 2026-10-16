// Hand-built model of อาคารเรียนรวม สมเด็จพระเทพฯ (Princess Sirindhorn lecture building, OSM way 309919519).
// Surveyed 2026-10-17 from Google Street View and photo spheres: the art street to the south (car panos at
// x -146 and -112, photo sphere at the entrance walkway), the plaza to the north (car panos at x -163 and -144),
// plus Esri World Imagery for the plan and roofs. Photos were only looked at; everything here is procedural.
// East end and the east wing's north colonnade from car panos supplied by the user (north plaza, east car park).
// West end from a pano at the plaza's west end (also supplied by the user).
//
// Built axis-aligned around the OSM centroid, then turned -0.8° onto the OSM outline. x = east, z = south.
//   west wing    x -179..-135.3   2 storeys (9.4 m): white frame, square piers every ~6.4 m, deep floor bands,
//                                 4-pane window groups, solid parapet; roof with long E-W skylight strips
//   east wing    x -112.3..-63.5  same frame on the south; on the north a double-height colonnade under a deep
//                                 fascia (corridor behind); east end: brick panel with the name over a low canopy;
//                                 roof with N-S ridged (sawtooth) skylights
//   centre       x -141.2..-112.3 entrance between orange-brick towers, set back to z -219.7 behind a forecourt:
//                                 open ground floor on columns, level-2 balcony, lettered level-3 band, KMITL sign;
//                                 north half 2 storeys on columns with brick stair towers above the roof and a
//                                 level-2 skybridge to ตึก A across the plaza
//   ponds on both long sides come from the OSM water layer
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex, textTex } from './ecc.js';

const PIV = [-121, -226.5], ROT = Math.atan2(-1.62, 115.2);
const G = 4.2, FL = 3.8;                 // ground floor, upper floor
const Y2 = G, ROOFW = G + FL, PAR = 1.4; // level-2 floor, wing roof (8.0), parapet height

function triOut(A, m, a, b, c, ref) {
  const n = [
    (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]),
    (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]),
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]),
  ];
  const d = (a[0] - ref[0]) * n[0] + (a[1] - ref[1]) * n[1] + (a[2] - ref[2]) * n[2];
  if (d < 0) A.tri(m, a, c, b); else A.tri(m, a, b, c);
}
// ridge skylights running along z: triangular prisms (glass on the north-facing slope, roof on the other)
function sawtooth(A, x0, x1, z0, z1, y, pitch = 4.6, h = 1.3) {
  for (let x = x0; x + pitch <= x1 + 0.01; x += pitch) {
    const a = [x, y, z0], b = [x + pitch, y, z0], t = [x + pitch * 0.35, y + h, z0];
    const a1 = [x, y, z1], b1 = [x + pitch, y, z1], t1 = [x + pitch * 0.35, y + h, z1];
    const ref = [x + pitch * 0.4, y + 0.3, (z0 + z1) / 2];
    triOut(A, 'skylight', a, t, t1, ref); triOut(A, 'skylight', a, t1, a1, ref);
    triOut(A, 'roof', t, b, b1, ref); triOut(A, 'roof', t, b1, t1, ref);
    triOut(A, 'roof', a, b, t, ref); triOut(A, 'roof', a1, b1, t1, ref);
  }
}

// one long face of a wing: piers on a bay grid, deep floor bands, window groups set back, solid parapet
function wingFace(A, f, { lintel = [] } = {}) {
  const n = Math.max(1, Math.round((f.a1 - f.a0) / 6.4)), bw = (f.a1 - f.a0) / n;
  for (let i = 0; i < n; i++) {
    const b0 = f.a0 + i * bw + 0.45, b1 = f.a0 + (i + 1) * bw - 0.45;
    for (const [y0, y1] of [[0.7, G - 0.75], [Y2 + 0.75, ROOFW - 0.55]]) {
      onFace(A, 'glass', f, b0 + 0.35, b1 - 0.35, y0, y1, -0.6, -0.55);
      // mullions: 4 panes per group, transom near the top
      for (let k = 1; k < 4; k++) { const a = b0 + 0.35 + ((b1 - b0 - 0.7) * k) / 4; onFace(A, 'frame', f, a - 0.05, a + 0.05, y0, y1, -0.6, -0.5); }
      onFace(A, 'frame', f, b0 + 0.35, b1 - 0.35, y1 - 0.75, y1 - 0.68, -0.6, -0.5);
      onFace(A, 'wall', f, b0, b1, y0 - 0.25, y0, -0.6, -0.35); // sill
    }
    if (lintel.includes(i)) onFace(A, 'salmon', f, b0 + 0.2, b1 - 0.2, G - 0.75, G - 0.35, -0.6, -0.3);
    if (i % 2 === 1) onFace(A, 'ac', f, b0 + 1.0, b0 + 1.9, Y2 + 0.9, Y2 + 1.6, 0, 0.45);
  }
  for (const [y0, y1] of [[G - 0.75, Y2 + 0.75], [ROOFW - 0.55, ROOFW + PAR]]) onFace(A, 'wall', f, f.a0, f.a1, y0, y1, -0.6, 0.15); // bands
  for (let i = 0; i <= n; i++) { const a = f.a0 + i * bw; onFace(A, 'wall', f, Math.max(f.a0, a - 0.45), Math.min(f.a1, a + 0.45), 0, ROOFW + PAR, -0.6, 0.25); } // piers
  onFace(A, 'plinth', f, f.a0, f.a1, 0, 0.7, -0.6, 0.05);
}

export function buildThep(owner) {
  const A = new Acc();
  const Z0 = -241.5, Z1 = -211.1;                          // north / south faces
  const WW = [-179, -135.3], EW = [-112.3, -63.5];         // wings (the west wing runs up to the narrow brick tower)
  const CX = [-141.2, -112.3], ZN = -219.7;                 // centre, entrance set-back line
  const HW = ROOFW + PAR;                                    // wing parapet top 9.4

  // ===== wings =====
  const PD = 5;                                              // depth of the east wing's north colonnade
  for (const [x0, x1] of [WW, EW]) {
    const east = x0 === EW[0], zb = east ? Z0 + PD : Z0;     // east wing: north wall stands behind the colonnade
    A.box('wall', x0 + 0.6, x1 - 0.6, 0, ROOFW, zb + 0.6, Z1 - 0.6);            // body behind the frame
    A.box('roof', x0 + 0.3, x1 - 0.3, ROOFW, ROOFW + 0.1, Z0 + 0.3, Z1 - 0.3);
    wingFace(A, { ax: 'z', at: zb, out: -1, a0: x0, a1: x1 }, { lintel: x0 === WW[0] ? [4, 5] : [] });
    wingFace(A, { ax: 'z', at: Z1, out: 1, a0: x0, a1: x1 });
    if (!east) {
      // west end (seen from the plaza's west end): orange-brick end wall framed in white at the corners and top,
      // a covered walk at level-2 height running west along the north edge towards the canteen, with a low wall
      const f = { ax: 'x', at: x0, out: -1 };
      onFace(A, 'wall', f, Z0, Z1, 0, HW, -0.6, 0);
      onFace(A, 'brick', f, Z0 + 1.2, Z1 - 1.2, 0.5, ROOFW - 0.3, 0, 0.05);
      onFace(A, 'wall', f, Z0, Z1, ROOFW - 0.3, HW, 0, 0.25);
      for (const [z0, z1] of [[Z0, Z0 + 1.2], [Z1 - 1.2, Z1]]) onFace(A, 'wall', f, z0, z1, 0, HW, 0, 0.25);
      const CW = [x0 - 14, x0], CZ = [Z0, Z0 + 5];
      A.box('wall', CW[0], CW[1], Y2 - 0.3, Y2 + 0.1, CZ[0], CZ[1]);                  // canopy slab
      A.box('wall', CW[0], CW[1], Y2 + 0.1, Y2 + 0.5, CZ[0], CZ[0] + 0.4);           // edge upstand
      for (let x = CW[0] + 0.5; x < CW[1] - 1; x += 4.6) for (const z of [CZ[0] + 0.4, CZ[1] - 0.4]) A.box('wall', x - 0.3, x + 0.3, 0, Y2 - 0.3, z - 0.3, z + 0.3);
      A.box('wall', CW[0], CW[1], 0, 0.9, CZ[0], CZ[0] + 0.3);                      // low wall along the pond
      A.box('plinth', CW[0], CW[1], 0, 0.3, CZ[0], CZ[1]);
    }
  }
  // east wing, north side: double-height colonnade of tall square columns under a deep fascia, with the
  // level-2 corridor (slab + railing) running along the recessed wall behind it
  {
    const n = Math.round((EW[1] - EW[0]) / 6.1), bw = (EW[1] - EW[0]) / n;
    for (let i = 0; i <= n; i++) {
      const x = Math.min(EW[1] - 0.7, Math.max(EW[0] + 0.7, EW[0] + i * bw));
      A.box('wall', x - 0.7, x + 0.7, 0, ROOFW, Z0, Z0 + 1.4);
    }
    A.box('wall', EW[0], EW[1], ROOFW - 0.9, HW, Z0, Z0 + 1.4);                  // fascia beam
    A.box('soffit', EW[0], EW[1], ROOFW - 0.3, ROOFW, Z0 + 1.4, Z0 + PD, false); // portico ceiling
    for (let x = EW[0] + 3; x < EW[1]; x += 6.1) A.box('soffit', x - 0.25, x + 0.25, ROOFW - 0.9, ROOFW - 0.3, Z0 + 1.4, Z0 + PD);
    A.box('wall', EW[0], EW[1], Y2 - 0.2, Y2 + 0.25, Z0 + PD - 2.2, Z0 + PD);    // corridor slab
    A.box('rail', EW[0], EW[1], Y2 + 0.25, Y2 + 1.2, Z0 + PD - 2.2, Z0 + PD - 2.12);
    A.box('plinth', EW[0], EW[1], 0, 0.5, Z0, Z0 + PD);
  }
  // east end (seen from the car park): white frame round a big orange-brick panel with the building name,
  // brick ground floor with windows behind a low canopy on columns that carries on south as a covered walk
  {
    const X = EW[1], f = { ax: 'x', at: X, out: 1 };
    onFace(A, 'wall', f, Z0, Z1, 0, HW, -0.6, 0);                                  // end wall, flush with the frame
    onFace(A, 'brick', f, Z0 + PD + 0.8, Z1 - 0.8, Y2 + 0.6, ROOFW - 0.3, 0, 0.05);
    onFace(A, 'wall', f, Z0, Z1, ROOFW - 0.3, HW, 0, 0.25);                       // top fascia
    onFace(A, 'wall', f, Z0 + PD, Z0 + PD + 0.8, 0, HW, 0, 0.25);                  // frame edges
    onFace(A, 'wall', f, Z1 - 0.8, Z1, 0, HW, 0, 0.25);
    onFace(A, 'brick', f, Z0 + PD + 0.8, Z1 - 0.8, 0.5, 3.4, 0, 0.05);             // brick ground floor
    for (let z = Z0 + PD + 2; z + 3 < Z1 - 1; z += 4.6) onFace(A, 'glass', f, z, z + 3, 1.1, 2.9, 0.05, 0.1);
    A.box('wall', X, X + 4, Y2 - 0.3, Y2 + 0.1, Z0 + PD, -199);                      // canopy slab at level-2 height
    A.box('wall', X + 3.6, X + 4, Y2 + 0.1, Y2 + 0.5, Z0 + PD, -199);              // its edge upstand
    for (let z = Z0 + PD + 1; z <= -199.5; z += 5.2) A.box('wall', X + 3.2, X + 3.7, 0, Y2 - 0.3, z - 0.25, z + 0.25);
    A.box('plinth', X, X + 4, 0, 0.3, Z0 + PD, -199);
    // the colonnade turns the corner at the north end of the east face
    for (const z of [Z0 + PD - 0.7]) A.box('wall', X - 1.4, X, 0, ROOFW, z - 0.7, z + 0.7);
    A.box('wall', X - 1.4, X, ROOFW - 0.9, HW, Z0, Z0 + PD);
  }
  // roofs from the satellite: long E-W skylight strips on the west wing, N-S ridges on the east wing
  for (const z of [-236.5, -229.5, -222.5, -215.5]) A.box('skylight', WW[0] + 2, WW[1] - 2, ROOFW + 0.1, ROOFW + 0.9, z - 1.2, z + 1.2);
  sawtooth(A, EW[0] + 2.2, EW[1] - 2.2, Z0 + 3, Z1 - 3, ROOFW + 0.1);

  // ===== centre =====
  // south: entrance block behind a forecourt, 3 storeys, between two brick towers
  const H3 = 12.4;
  A.box('wall', CX[0], CX[1], H3 - 0.6, H3 + 0.6, ZN - 8, ZN);                  // level-3 roof slab / band block
  A.box('wall', -131.8, -116.5, Y2 + 0.2, H3 - 0.6, ZN - 8, ZN - 4);           // upper floors, set back
  A.box('soffit', -131.8, -116.5, Y2 - 0.1, Y2 + 0.2, ZN - 8, ZN, false);       // level-2 slab over the open ground floor
  A.box('glass', -130.8, -117.5, 0.6, Y2 - 0.3, ZN - 8, ZN - 7.9);              // lobby glazing at the back
  for (const x of [-129.5, -124, -118.5]) A.cyl('wall', x, ZN - 0.8, 0.35, 0, H3 - 0.6, 12); // columns
  // level-2 balcony and level-3 band with lettering, KMITL sign on top
  const FS = { ax: 'z', at: ZN, out: 1 };
  onFace(A, 'wall', FS, -131.8, -116.5, Y2 - 0.1, Y2 + 0.7, -4, 0.3);
  onFace(A, 'rail', FS, -131.8, -116.5, Y2 + 0.7, Y2 + 1.7, 0.2, 0.3);
  onFace(A, 'glass', { ax: 'z', at: ZN - 4, out: 1 }, -131, -117.3, Y2 + 1.0, H3 - 1.4, 0, 0.05);
  onFace(A, 'wall', FS, -131.8, -116.5, ROOFW + 0.6, ROOFW + 1.8, -4, 0.4);      // lettered band
  onFace(A, 'brick', FS, -131.8, -116.5, ROOFW + 1.8, H3 - 0.6, -4.2, -4.0);
  onFace(A, 'planter', FS, -131.4, -116.9, ROOFW + 1.8, ROOFW + 2.3, 0.1, 0.4);
  // forecourt: paving, steps up to the lobby, low white balustrade
  A.box('plinth', -131.8, -112.3, 0, 0.6, ZN, Z1);
  for (let s = 0; s < 3; s++) A.box('plinth', -128, -120, 0, 0.6 - s * 0.2, Z1, Z1 + 0.4 * (s + 1));
  for (const x0 of [-131.6, -120]) A.box('wall', x0, x0 + 8.4, 0.6, 1.5, Z1 - 0.3, Z1);
  // brick towers either side of the entrance (west one is the large mass seen from the street)
  const brickTower = (x0, x1, z0, z1, h) => {
    A.box('brick', x0, x1, 0, h, z0, z1);
    for (const y of [G - 0.4, ROOFW]) A.box('wall', x0 - 0.15, x1 + 0.15, y, y + 0.5, z0 - 0.15, z1 + 0.15);
    A.box('wall', x0 - 0.15, x1 + 0.15, h, h + 0.4, z0 - 0.15, z1 + 0.15);
  };
  brickTower(-135.3, -131.8, -226, Z1, 13.4);                                  // narrow but deep, seen side-on from the street
  brickTower(-116.5, CX[1], -224.5, ZN, 14.2);
  // north half: 2 storeys on columns (open ground floor), level-2 corridor to the skybridge
  A.box('wall', CX[0], CX[1], Y2 + 0.2, HW, Z0, ZN - 8);
  A.box('soffit', CX[0], CX[1], Y2 - 0.1, Y2 + 0.2, Z0, ZN - 8, false);
  A.box('wall', CX[0] + 4, CX[1] - 4, 0, Y2 - 0.1, Z0 + 5, ZN - 8);             // core behind the columns
  for (let x = CX[0] + 1.5; x < CX[1]; x += 6.5) for (const z of [Z0 + 0.6, Z0 + 5]) A.box('wall', x - 0.35, x + 0.35, 0, Y2, z - 0.35, z + 0.35);
  const FN = { ax: 'z', at: Z0, out: -1 };
  onFace(A, 'glass', FN, CX[0] + 1, CX[1] - 1, Y2 + 0.9, ROOFW - 0.5, -0.5, -0.45);
  onFace(A, 'rail', FN, CX[0], CX[1], Y2 + 0.2, Y2 + 1.2, 0.3, 0.38);
  A.box('roof', CX[0], CX[1], HW, HW + 0.1, Z0, ZN - 8);
  for (let x = CX[0] + 3; x < CX[1] - 2; x += 4.5) A.box('skylight', x, x + 2, HW + 0.1, HW + 0.5, Z0 + 3, ZN - 11); // grid of rooflights
  brickTower(-138.5, -132, -240, -233, 12.6);                                   // stair towers above the roof
  brickTower(-121, -114.5, -239, -232, 13.4);
  // skybridge to ตึก A across the plaza (level 2), with steps down under it
  const BZ = [-266.5, Z0], BX = [-131, -125];
  A.box('wall', BX[0], BX[1], Y2 - 0.1, Y2 + 0.5, BZ[0], BZ[1]);
  A.box('soffit', BX[0], BX[1], Y2 - 0.35, Y2 - 0.1, BZ[0], BZ[1], false);
  for (const x of BX) A.box('rail', x - 0.05, x + 0.05, Y2 + 0.5, Y2 + 1.6, BZ[0], BZ[1]);
  for (const z of [-261, -251]) for (const x of [BX[0] + 0.6, BX[1] - 0.6]) A.cyl('wall', x, z, 0.35, 0, Y2 - 0.3, 10);
  for (let s = 0; s < 4; s++) A.box('plinth', BX[0] - 1, BX[1] + 1, 0, 0.6 - s * 0.15, -250 - s * 0.4, -249.6 - s * 0.4);

  A.box('wall', -127, -121.2, H3 + 0.6, H3 + 2.4, ZN - 0.3, ZN);                // KMITL sign panel

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    wall: std({ color: '#f1efe9' }),
    plinth: std({ color: '#d9d6cf', roughness: 1 }),
    frame: std({ color: '#c9ccce', roughness: 0.6, metalness: 0.2 }),
    glass: std({ color: '#5b6f7c', map: gDay, roughness: 0.35, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    brick: std({ color: '#c86a48', map: brick, roughness: 0.92 }),
    salmon: std({ color: '#e59a7d' }),
    rail: std({ color: '#d8d8d4', roughness: 0.6, metalness: 0.3 }),
    ac: std({ color: '#e4e4e0' }),
    planter: std({ color: '#6f8f4e', roughness: 1 }),
    soffit: std({ color: '#e7e3da', roughness: 0.95, side: THREE.DoubleSide, emissive: new THREE.Color('#3a3631') }),
    roof: std({ color: '#9a9c9a', roughness: 0.9, side: THREE.DoubleSide }),
    skylight: std({ color: '#6f7d86', roughness: 0.3, metalness: 0.3, side: THREE.DoubleSide }),
  };
  const c = Math.cos(ROT), s = Math.sin(ROT);
  const rot = (arr, isPos) => {
    for (let i = 0; i < arr.length; i += 3) {
      const ox = isPos ? PIV[0] : 0, oz = isPos ? PIV[1] : 0, dx = arr[i] - ox, dz = arr[i + 2] - oz;
      arr[i] = ox + dx * c - dz * s; arr[i + 2] = oz + dx * s + dz * c;
    }
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
    rot(B.p, true); rot(B.n, false);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    add(g, MAT[k]);
  }
  const sign = (tex, pts) => {
    const p = pts.flat(); rot(p, true);
    const v = (i) => p.slice(i * 3, i * 3 + 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([...v(0), ...v(1), ...v(2), ...v(0), ...v(2), ...v(3)], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.8 }));
  };
  const xe = EW[1] + 0.08, ze0 = Z0 + PD + 3, ze1 = Z1 - 3;
  sign(textTex('ศูนย์เรียนรวมสมเด็จพระเทพฯ', { color: '#efe7da', h: 140 }), [[xe, Y2 + 2.0, ze1], [xe, Y2 + 2.0, ze0], [xe, Y2 + 3.1, ze0], [xe, Y2 + 3.1, ze1]]);
  const zs = ZN + 0.42;
  sign(textTex('อาคารเรียนรวม สมเด็จพระเทพฯ', { color: '#5a4a40', h: 140 }), [[-130.8, ROOFW + 0.75, zs], [-117.5, ROOFW + 0.75, zs], [-117.5, ROOFW + 1.65, zs], [-130.8, ROOFW + 1.65, zs]]);
  sign(textTex('KMITL', { color: '#ffffff', bg: '#e2661f', w: 512, h: 160, weight: 700 }), [[-126.6, H3 + 0.7, ZN + 0.02], [-121.6, H3 + 0.7, ZN + 0.02], [-121.6, H3 + 2.2, ZN + 0.02], [-126.6, H3 + 2.2, ZN + 0.02]]);
  return { meshes, top: 16 };
}

// Ground outline in world coordinates (OSM way 309919519)
export const THEP_OUTLINE = [[-178.96, -240.67], [-178.86, -210.86], [-131.64, -211.03], [-131.67, -219.56], [-112.16, -219.78], [-112.04, -211.22], [-63.34, -211.91], [-63.76, -242.29], [-178.96, -240.67]];
