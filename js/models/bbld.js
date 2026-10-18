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
import { tube, lathe, chain } from './kit.js';

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

  // ---- theatre on pilotis over a podium; the front (south) reworked 2026-10-18 from Street View on the road in
  // front (two panoramas the user sent: the steps, the undercroft, the brick wall, the west stair) ----
  {
    const [x0, x1, z0, z1] = T_, P = 1.9, U = 4.6, TOP = 12.2;
    // podium of washed gravel. In front, from the west: the covered ramp (x -293.5..-289.5), a garden with round
    // planters, then the stairs: a wide lower flight, a landing and a narrower upper flight west of the "B" column
    // with a planter east of it (third panorama the user sent, from the foot of the ramp)
    const zf = z1 + 1.5;                                                             // front edge of the podium
    A.box('granite', x0 - 3, x1 + 3, 0, P, z0, zf);
    const LW = 1.0, nl = 6, nu = 5, tr = 0.32, SX0 = -285, UX0 = -284.5, UX1 = -278.2;
    const zl = zf + 2.2;                                                             // landing from zf to zl
    A.box('granite', SX0, x1 + 3, 0, LW, zf, zl);
    for (let s = 0; s < nu; s++) {                                                    // upper flight
      const za = zf + s * (2.2 / nu), y = P - (s * (P - LW)) / nu;
      A.box('granite', UX0, UX1, LW, y, za, za + 2.2 / nu);
    }
    A.box('granite', SX0, UX0, 0, P + 0.4, zf, zl);                                  // cheek wall west of the upper flight
    A.box('granite', UX1, x1 + 3, LW, P + 0.5, zf, zl - 0.3);                        // planter east of it
    A.box('soil', UX1 + 0.25, x1 + 2.75, P + 0.5, P + 0.55, zf + 0.25, zl - 0.55);
    for (let s = 0; s < nl; s++) {                                                    // lower flight
      const y = LW - (s * LW) / nl, za = zl + s * tr;
      A.box('granite', SX0, x1 + 3, 0, y, za, za + tr);
    }
    const zb = zl + nl * tr;
    for (const x of [SX0, x1 + 2.5]) A.box('granite', x, x + 0.5, 0, LW + 0.6, zl, zb);   // cheek walls
    for (const x of [UX0 + 0.3, UX1 - 0.3]) chain(A, 'rail', [[x, P + 0.9, zf + 0.2, 0.035], [x, LW + 0.9, zl - 0.2, 0.035]], 5);
    for (const x of [SX0 + 0.8, -279, -273.5, x1 + 2]) chain(A, 'rail', [[x, LW + 0.9, zl + 0.1, 0.035], [x, 0.9, zb - 0.1, 0.035]], 5);
    // garden between the ramp and the stairs, round planters
    A.box('lawn', -289.3, SX0, 0, 0.12, zf, zb + 2);
    for (const [x, z] of [[-287.5, zf + 2.5], [-286.2, zb + 0.5]]) lathe(A, 'granite', x, z, [[0.5, 0.12], [0.55, 0.6], [0.5, 0.6], [0, 0.55]], 12);
    // lamp post with a mushroom cap on the podium edge (east)
    tube(A, 'rail', [x1 + 1.5, P, zf - 0.6], [x1 + 1.5, P + 2.6, zf - 0.6], 0.07, 0.06, 6);
    lathe(A, 'rail', x1 + 1.5, zf - 0.6, [[0.06, P + 2.55], [0.28, P + 2.62], [0.26, P + 2.72], [0, P + 2.78]], 10);

    // covered ramp from the road up to the podium: low concrete walls, a flat slab on pairs of square columns,
    // a dark lamp post at its foot; at the top it runs into the undercroft
    {
      const RX0 = -293.5, RX1 = -289.5, RZ0 = zf, RZ1 = zf + 11.5, CY = 4.2;
      const ry = (z) => P * (RZ1 - z) / (RZ1 - RZ0);                                 // ramp surface height
      // ramp surface (sloped) with a gravel body under it
      const a = [RX0 + 0.2, ry(RZ0), RZ0], b = [RX1 - 0.2, ry(RZ0), RZ0], c = [RX1 - 0.2, 0.02, RZ1], d = [RX0 + 0.2, 0.02, RZ1];
      A.quad('rampTop', d, c, b, a);
      for (const x of [RX0 + 0.2, RX1 - 0.2]) {
        const o = x < (RX0 + RX1) / 2 ? -1 : 1, t = [x, 0, RZ0], u = [x, ry(RZ0), RZ0], v = [x, 0.02, RZ1];
        if (o < 0) A.tri('granite', t, v, u); else A.tri('granite', t, u, v);
      }
      // side walls with sloped tops, 1 m above the ramp
      const face = (m, q, nrm) => {                                                  // quad turned to face nrm
        const [p0, p1, p2] = q, u = p1.map((v, i) => v - p0[i]), w = p2.map((v, i) => v - p0[i]);
        const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
        if (n[0] * nrm[0] + n[1] * nrm[1] + n[2] * nrm[2] >= 0) A.quad(m, ...q); else A.quad(m, q[3], q[2], q[1], q[0]);
      };
      for (const xa of [RX0, RX1 - 0.2]) {
        const xb = xa + 0.2, t0 = ry(RZ0) + 1.0, t1 = 1.0;
        face('granite', [[xa, t0, RZ0], [xb, t0, RZ0], [xb, t1, RZ1], [xa, t1, RZ1]], [0, 1, 0]);
        face('granite', [[xa, 0, RZ0], [xa, 0, RZ1], [xa, t1, RZ1], [xa, t0, RZ0]], [-1, 0, 0]);
        face('granite', [[xb, 0, RZ0], [xb, 0, RZ1], [xb, t1, RZ1], [xb, t0, RZ0]], [1, 0, 0]);
        face('granite', [[xa, 0, RZ1], [xb, 0, RZ1], [xb, t1, RZ1], [xa, t1, RZ1]], [0, 0, 1]);
      }
      // canopy: flat slab with edge beams, on pairs of columns
      A.box('frame', RX0 - 0.3, RX1 + 0.3, CY, CY + 0.3, RZ0 - 0.5, RZ1 + 0.3);
      for (const x of [RX0 - 0.3, RX1 + 0.05]) A.box('frame', x, x + 0.25, CY - 0.45, CY, RZ0 - 0.5, RZ1 + 0.3);
      A.box('frame', RX0 - 0.3, RX1 + 0.3, CY - 0.45, CY, RZ1, RZ1 + 0.3);
      for (const z of [RZ1 - 0.2, RZ1 - 3.9, RZ1 - 7.6, RZ0 + 0.4]) for (const x of [RX0 + 0.1, RX1 - 0.1])
        A.box('pier', x - 0.18, x + 0.18, ry(z), CY - 0.45, z - 0.18, z + 0.18);
      // lamp post at the foot
      tube(A, 'lampGreen', [RX0 - 0.8, 0, RZ1 + 0.4], [RX0 - 0.8, 3.9, RZ1 + 0.4], 0.08, 0.06, 8);
      lathe(A, 'lampGreen', RX0 - 0.8, RZ1 + 0.4, [[0.12, 3.9], [0.2, 4.1], [0.2, 4.4], [0.1, 4.55], [0, 4.6]], 8);
      // the undercroft beyond the top: a back wall with a dark doorway, a wall along the garden side
      A.box('render', RX0 - 0.5, RX1 + 1.5, P, U - 0.1, z1 - 7, z1 - 6.7);
      onFace(A, 'dark', { ax: 'z', at: z1 - 6.7, out: 1 }, RX0 + 0.6, RX1 - 0.6, P, P + 2.4, 0, 0.04);
    }
    // white stair up the west side from the car park, behind white walls
    for (let s = 0; s < 10; s++) {
      const z = z1 + 1.2 - s * 0.32, y = ((s + 1) * P) / 10;
      A.box('granite', -299.5, x0 - 3, 0, y, z - 0.32, z);
    }
    A.box('render', -300, -299.5, 0, P + 2.2, z1 - 6, z1 + 3);
    A.box('render', -300, x0 - 3, 0, 2.4, z1 + 2.8, z1 + 3.2);
    A.box('frame', -300.2, -299.3, 0, P + 2.6, z1 - 2.5, z1 - 1.9);                 // white portal
    A.box('frame', -300.2, x0 - 3, P + 2.4, P + 2.8, z1 - 2.5, z1 - 1.9);

    A.box('render', x0 + 3, x1 - 3, P, U, z0, z0 + 6);                              // lobby / stair core under the hall
    onFace(A, 'glass', { ax: 'z', at: z0 + 6, out: 1 }, x0 + 4, x1 - 4, P + 0.3, U - 0.6, 0, 0.05);
    // hall: solid brick with two tall slot windows on the front, white corner piers, a thick white fascia below
    // and the white roof slab above; raked underside with exposed ribs rising to the north
    A.box('brick', x0, x1, U + 1.5, TOP, z0, z1);
    A.box('frame', x0 - 0.3, x1 + 0.3, TOP - 0.2, TOP + 0.5, z0, z1 + 0.8);         // white roof slab, overhang on the south
    for (const x of [x0, x1 - 0.6]) A.box('frame', x, x + 0.6, U + 1.5, TOP - 0.2, z1 - 0.3, z1 + 0.25);   // corner piers
    const front = { ax: 'z', at: z1, out: 1 };
    for (const [a, b] of [[x0 + 0.9, x0 + 1.9], [x0 + 9.2, x0 + 10.5]]) {
      onFace(A, 'frame', front, a - 0.15, b + 0.15, 7.9, 10.75, 0, 0.06);
      onFace(A, 'glass', front, a, b, 8.05, 10.6, 0, 0.1);
    }
    const ys = U, yn = U + 1.6;                                                      // underside heights at the south and north ends
    A.quad('soffit', [x0, ys, z1], [x0, yn, z0], [x1, yn, z0], [x1, ys, z1]);
    for (let x = x0 + 1.3; x < x1 - 0.5; x += 2.6) tube(A, 'frame', [x, ys - 0.25, z1 - 0.5], [x, yn - 0.25, z0], 0.22, 0.22, 4);   // ribs
    for (const x of [x0, x1]) A.quad('frame', [x, ys, z1], [x, yn, z0], [x, U + 1.6, z0], [x, U + 1.6, z1]);
    A.box('frame', x0 - 0.2, x1 + 0.2, ys - 0.6, U + 1.6, z1 - 0.5, z1 + 0.3);       // thick white fascia
    for (const f of [{ ax: 'x', at: x0, out: -1 }, { ax: 'x', at: x1, out: 1 }]) {
      onFace(A, 'frame', f, z0, z1 + 0.3, U + 1.2, U + 1.9, 0, 0.3);
      for (let z = z0 + 3; z < z1 - 2; z += 4.5) onFace(A, 'glass', f, z, z + 1.0, 8.6, 10.4, 0, 0.05);
    }
    // grey square pilotis
    for (let x = x0 + 0.4; x < x1; x += 5.3) for (const z of [z0 + 8, z1 - 0.6]) A.box('pier', x - 0.35, x + 0.35, P, ys + (z1 - z) / (z1 - z0) * (yn - ys), z - 0.35, z + 0.35);
    A.box('gold', x0 + 11 - 0.06, x0 + 11 + 0.06, P + 1.0, P + 2.6, z1 - 0.25, z1 - 0.22);    // name plaque on the third front column
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
    granite: std({ color: '#b7b0a5', roughness: 0.95 }),
    soil: std({ color: '#5b6b3c', roughness: 1 }),
    rail: std({ color: '#7a4a35', roughness: 0.6, metalness: 0.3 }),
    pier: std({ color: '#b9bdc4', roughness: 0.85 }),
    gold: std({ color: '#c9a24a', roughness: 0.35, metalness: 0.6 }),
    rampTop: std({ color: '#a9a49b', roughness: 0.95 }),
    lawn: std({ color: '#6f9a4a', roughness: 1 }),
    lampGreen: std({ color: '#26332c', roughness: 0.5, metalness: 0.4 }),
    dark: std({ color: '#2b2e31', roughness: 0.8 }),
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
  // the letter B on the fourth front pilotis column of the theatre, east of the upper flight (faces south)
  {
    const x = T_[0] + 0.4 + 3 * 5.3, z = T_[3] - 0.6 + 0.36, y0 = 2.6, y1 = 3.6;
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
