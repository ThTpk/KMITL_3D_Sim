// Hand-built model of ตึกบี (Building B, Faculty of Engineering, OSM way 190870224).
// Surveyed 2026-10-17 from Google Maps satellite imagery (the parts of the plan and their roofs: the west
// block's translucent skylight, the solar panels, the lower north strip, the theatre block on the south)
// and Google Street View: the south face from the parking road (about 22 m away; height from the viewing
// angle, about 13.5 m) and a 360° photo on the same road in front of the theatre block and its steps.
// The east side is behind a covered walkway and the north side behind trees; they follow the same pattern.
// Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up. Parts (OSM outline, which matches the imagery once its lean is allowed for):
//   west block   x -324.5..-293, z 27..60.4   four storeys, translucent ridged skylight on the roof
//   east block   x -293..-247.5, z 31..51.4   four storeys, solar panels on the roof
//   north strip  x -293..-251,   z 18..31     three storeys; a one-storey front x -293..-255, z 9.7..18
//   theatre      x -293..-271.3, z 51.4..68.2 raised on pilotis over a podium with wide steps to the road,
//                raked underside, brick walls with small windows, white overhanging roof slab
// Facades: exposed light-grey concrete frame; upper floors with ribbon windows over red-brick spandrels;
// ground floor rendered, with a band of breeze blocks and AC units.
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex, textTex } from './ecc.js';

const FL = 3.3, ROOF4 = 4 * FL + 0.4, ROOF3 = 3 * FL + 0.4;
const W_ = [-324.5, -293, 27, 60.4], E_ = [-293, -247.5, 31, 51.4], N_ = [-293, -251, 18, 31], F_ = [-293, -255, 9.7, 18];
const T_ = [-293, -271.3, 51.4, 68.2];

export function buildB(owner) {
  const A = new Acc();
  const faces = ([x0, x1, z0, z1]) => ({
    N: { ax: 'z', at: z0, out: -1, a: [x0, x1] }, S: { ax: 'z', at: z1, out: 1, a: [x0, x1] },
    W: { ax: 'x', at: x0, out: -1, a: [z0, z1] }, E: { ax: 'x', at: x1, out: 1, a: [z0, z1] },
  });

  // facade on one face of a block: frame, brick spandrels, ribbon windows; rendered ground floor
  const facade = (f, floors, top, { a0 = f.a[0], a1 = f.a[1], bay = 6 } = {}) => {
    if (a1 - a0 < 1) return;
    // ground floor: render, breeze-block band, a few windows and AC units
    onFace(A, 'render', f, a0, a1, 0, FL, 0, 0.05);
    onFace(A, 'breeze', f, a0 + 0.4, a1 - 0.4, 2.2, 3.0, 0.05, 0.08);
    for (let a = a0 + 2; a < a1 - 2; a += bay) {
      onFace(A, 'glass', f, a, a + 2.2, 0.9, 2.0, 0.05, 0.08);
      onFace(A, 'ac', f, a + 2.6, a + 3.4, 1.0, 1.6, 0.05, 0.4);
    }
    for (let k = 1; k < floors; k++) {
      const y = k * FL;
      onFace(A, 'frame', f, a0, a1, y - 0.15, y + 0.45, 0, 0.3);              // floor beam
      onFace(A, 'brick', f, a0, a1, y + 0.45, y + 1.3, 0, 0.12);              // brick spandrel
      onFace(A, 'glass', f, a0, a1, y + 1.3, y + FL - 0.2, 0, 0.04);          // ribbon window
      for (let a = a0 + 1.2; a < a1 - 0.3; a += 1.2) onFace(A, 'mull', f, a - 0.04, a + 0.04, y + 1.3, y + FL - 0.2, 0, 0.08);
      if (k === floors - 1) for (let a = a0 + bay / 2; a < a1 - 1; a += bay) onFace(A, 'brick', f, a - 1.2, a + 1.2, y + 1.3, y + FL - 0.2, 0, 0.12); // brick panels between top-floor windows
    }
    for (let a = a0; a <= a1 + 0.01; a += bay) onFace(A, 'frame', f, Math.max(a0, a - 0.25), Math.min(a1, a + 0.25), FL - 0.15, top, 0, 0.4); // columns
    onFace(A, 'frame', f, a0 - 0.2, a1 + 0.2, top - 0.6, top + 0.3, 0, 0.5);  // roof cornice
  };

  // ---- west and east blocks (four storeys) ----
  for (const b of [W_, E_]) A.box('render', b[0], b[1], 0, ROOF4, b[2], b[3]);
  const fw = faces(W_), fe = faces(E_);
  facade(fw.W, 4, ROOF4); facade(fw.N, 4, ROOF4); facade(fw.S, 4, ROOF4);
  facade(fe.E, 4, ROOF4); facade(fe.S, 4, ROOF4, { a0: T_[1] }); facade(fe.N, 4, ROOF4, { a0: N_[1] });
  facade(fw.E, 4, ROOF4, { a0: E_[3] });                                         // the bit of the west block's east face south of the east block
  // ---- north strip (three storeys) and one-storey front ----
  A.box('render', N_[0], N_[1], 0, ROOF3, N_[2], N_[3]);
  const fn = faces(N_);
  facade(fn.N, 3, ROOF3, { a0: F_[1] }); facade(fn.E, 3, ROOF3); facade(fn.W, 3, ROOF3, { a0: N_[2], a1: W_[2] });
  A.box('render', F_[0], F_[1], 0, 3.6, F_[2], F_[3]);
  const ff = faces(F_);
  for (const f of [ff.N, ff.E, ff.W]) {
    onFace(A, 'breeze', f, f.a[0] + 0.4, f.a[1] - 0.4, 2.2, 3.0, 0, 0.06);
    for (let a = f.a[0] + 1.5; a < f.a[1] - 2; a += 5) onFace(A, 'glass', f, a, a + 2.4, 0.9, 2.0, 0, 0.05);
    onFace(A, 'frame', f, f.a[0] - 0.2, f.a[1] + 0.2, 3.3, 3.9, 0, 0.5);
  }
  for (const [x, z] of [[-270, 11], [-262, 12.5], [-284, 12]]) A.box('plant', x, x + 4, 3.6, 5.4, z, z + 3.5);

  // ---- roofs ----
  A.box('roof', W_[0] + 0.3, W_[1], ROOF4, ROOF4 + 0.1, W_[2] + 0.3, W_[3] - 0.3);
  A.box('roof', E_[0], E_[1] - 0.3, ROOF4, ROOF4 + 0.1, E_[2] + 0.3, E_[3] - 0.3);
  A.box('roof', N_[0], N_[1] - 0.3, ROOF3, ROOF3 + 0.1, N_[2] + 0.3, N_[3]);
  A.box('roofLight', F_[0], F_[1] - 0.3, 3.6, 3.7, F_[2] + 0.3, F_[3]);
  // translucent ridged skylight on the west block (ridges run east-west)
  for (let i = 0; i < 4; i++) {
    const z0 = 33.5 + i * 4.2, z1 = z0 + 4.2, zm = (z0 + z1) / 2, x0 = -308, x1 = -294.5, y0 = ROOF4 + 0.1, y1 = ROOF4 + 1.4;
    A.quad('sky', [x0, y0, z1], [x1, y0, z1], [x1, y1, zm], [x0, y1, zm]);
    A.quad('sky', [x1, y0, z0], [x0, y0, z0], [x0, y1, zm], [x1, y1, zm]);
    A.tri('sky', [x0, y0, z0], [x0, y0, z1], [x0, y1, zm]);
    A.tri('sky', [x1, y0, z1], [x1, y0, z0], [x1, y1, zm]);
  }
  // solar panels and plant on the east block
  for (let i = 0; i < 4; i++) A.box('solar', -287 + i * 2.3, -285.2 + i * 2.3, ROOF4 + 0.4, ROOF4 + 0.6, 40, 48.5);
  for (const x of [-275, -271.5, -268, -264.5]) A.box('plant', x, x + 2.8, ROOF4 + 0.1, ROOF4 + 1.2, 44, 46.5);
  A.box('plant', -320, -312, ROOF4 + 0.1, ROOF4 + 1.6, 30, 36);                   // water tanks
  A.box('plant', -263, -257, ROOF4 + 0.1, ROOF4 + 2.2, 33, 37);
  // TV antennas
  for (const [x, z] of [[-300, 56], [-260, 49]]) {
    A.box('frame', x - 0.05, x + 0.05, ROOF4, ROOF4 + 3.5, z - 0.05, z + 0.05);
    for (const y of [ROOF4 + 2.6, ROOF4 + 3.2]) A.box('frame', x - 0.9, x + 0.9, y, y + 0.05, z - 0.03, z + 0.03);
  }

  // ---- theatre on pilotis over a podium, wide steps to the road ----
  {
    const [x0, x1, z0, z1] = T_, P = 1.2, U = 4.6, TOP = 12.2;
    A.box('paving', x0 - 3, x1 + 3, 0, P, z0, z1 + 1.5);
    for (let s = 0; s < 6; s++) A.box('paving', x0 - 3, x1 + 3, 0, P - s * 0.2, z1 + 1.5, z1 + 1.5 + (s + 1) * 0.4);
    A.box('render', x0 + 3, x1 - 3, P, U, z0, z0 + 6);                              // lobby / stair core under the hall
    onFace(A, 'glass', { ax: 'z', at: z0 + 6, out: 1 }, x0 + 4, x1 - 4, P + 0.3, U - 0.6, 0, 0.05);
    // hall: brick walls with a white frame, raked underside rising to the north
    A.box('brick', x0, x1, U + 1.5, TOP, z0, z1);
    A.box('frame', x0 - 0.3, x1 + 0.3, TOP - 0.2, TOP + 0.5, z0, z1 + 0.8);         // white roof slab, overhang on the south
    const ys = U, yn = U + 1.6;                                                      // underside heights at the south and north ends
    A.quad('soffit', [x0, ys, z1], [x0, yn, z0], [x1, yn, z0], [x1, ys, z1]);
    for (const x of [x0, x1]) A.quad('frame', [x, ys, z1], [x, yn, z0], [x, U + 1.6, z0], [x, U + 1.6, z1]);
    A.box('frame', x0, x1, ys - 0.1, U + 1.6, z1 - 0.4, z1);
    for (let x = x0 + 0.4; x < x1; x += 5.3) for (const z of [z0 + 8, z1 - 0.6]) A.box('frame', x - 0.35, x + 0.35, P, ys + (z1 - z) / (z1 - z0) * (yn - ys), z - 0.35, z + 0.35);
    for (let x = x0 + 0.4; x < x1; x += 5.3) A.box('frame', x - 0.3, x + 0.3, U + 1.5, TOP, z1, z1 + 0.35);   // frame columns on the south wall
    for (let x = x0 + 2.8; x < x1 - 1; x += 5.3) onFace(A, 'glass', { ax: 'z', at: z1, out: 1 }, x - 0.6, x + 0.6, 8.6, 10.4, 0, 0.05);
    for (const f of [{ ax: 'x', at: x0, out: -1 }, { ax: 'x', at: x1, out: 1 }]) {
      onFace(A, 'frame', f, z0, z1, U + 1.5, U + 1.9, 0, 0.3);
      for (let z = z0 + 3; z < z1 - 2; z += 4.5) onFace(A, 'glass', f, z, z + 1.0, 8.6, 10.4, 0, 0.05);
    }
  }

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const breezeTex = (() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const g = cv.getContext('2d'); g.fillStyle = '#d9dde4'; g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#6d727a'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) g.fillRect(i * 16 + 4, j * 16 + 4, 8, 8);
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 0.8, 1 / 0.8); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const MAT = {
    render: std({ color: '#c9d0dc' }),
    frame: std({ color: '#dfe2ea', roughness: 0.8 }),
    brick: std({ color: '#b65a3a', map: brick, roughness: 0.95 }),
    glass: std({ color: '#3f4d55', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    mull: std({ color: '#d4d7dc', roughness: 0.6 }),
    breeze: std({ color: '#ffffff', map: breezeTex }),
    ac: std({ color: '#e6e6e3', roughness: 0.7 }),
    roof: std({ color: '#5f6366', roughness: 0.95 }),
    roofLight: std({ color: '#8d9093', roughness: 0.95 }),
    sky: std({ color: '#e9e3c4', roughness: 0.5, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
    solar: std({ color: '#2a3550', roughness: 0.35, metalness: 0.3 }),
    plant: std({ color: '#b9bcbd', roughness: 0.8 }),
    paving: std({ color: '#c9c5bd', roughness: 1 }),
    soffit: std({ color: '#c4c8d0', side: THREE.DoubleSide }),
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
  // the letter B on the south-west pilotis column of the theatre (faces south)
  {
    const x = T_[0] + 0.4, z = T_[3] - 0.6 + 0.36, y0 = 2.6, y1 = 3.6;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([x - 0.32, y0, z, x + 0.32, y0, z, x + 0.32, y1, z, x - 0.32, y0, z, x + 0.32, y1, z, x - 0.32, y1, z], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: textTex('B', { w: 160, h: 160, color: '#3a3d42', font: 'Arial', weight: 700 }), transparent: true, alphaTest: 0.3 }));
  }
  return { meshes, top: ROOF4 + 3.5 };
}

// Ground outline (OSM way 190870224)
export const B_OUTLINE = [[-324.56, 27.06], [-323.5, 60.48], [-293.01, 60.3], [-292.76, 68.31], [-271.29, 68.02], [-272.17, 51.49], [-247.22, 51.2], [-247.8, 32.05], [-250.8, 32.02], [-251.21, 18.15], [-254.76, 18.12], [-254.97, 9.67], [-293.17, 10.14], [-292.76, 23.63], [-295.17, 23.61], [-295.08, 26.54], [-324.56, 27.06]];
