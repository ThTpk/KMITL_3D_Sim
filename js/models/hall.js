// Hand-built model of หอประชุมเจ้าพระยาสุรวงษ์ไวยวัฒน์ (วร บุนนาค) (Convention Hall, OSM way 190697575).
// Surveyed 2026-10-17 from Google Maps satellite imagery (plan, roof shapes; the OSM outline is coarse and
// shifted, the imagery lines up with the mapped roads) and Google Street View: a 360° photo from the car
// park 47 m south of the front (whole south face), the entrance steps close up, the south-west corner, the
// west end beside the steel carport, the north face from the north road, the north-east corner and the east
// service road. Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up. Masses (from the imagery):
//   main hall  x 90..192, z 95..149: tall plain white box under a barrel roof (ridge east-west at z 122)
//   south front x 69..214, z 151..190: foyer block under a wing roof in four bays whose eave sags between the
//     seams and sweeps up at both outer corners; tall white columns with V struts carry the overhang;
//     two-storey glass wall with a white band above; the hall's name on a white board, emblem above;
//     both ends in red brick with white-framed windows and white floor bands
//   north strip x 60..190, z 87..95: white ground floor (windows, louvres), recessed balconies, brick piers
//   north-west wing x 48..78, z 94..137: white, ribbon windows, flat overhanging roof, brick name tower
//   east annex x 190..198: two-storey white service block with a roof terrace, loading bays below
//   west carport x 48..70.5, z 153..170: light steel roof on slanted posts
//   all large roofs are covered in solar panels
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex, textTex } from './ecc.js';

const N0 = (at) => ({ ax: 'z', at, out: -1 }), S0 = (at) => ({ ax: 'z', at, out: 1 });
const W0 = (at) => ({ ax: 'x', at, out: -1 }), E0 = (at) => ({ ax: 'x', at, out: 1 });

// ---- south roof: four bays, eave sags between seams, outer corners sweep up ----
const BAYS = [[69, 106.5], [107.1, 141.7], [142.3, 177.6], [178.2, 214.5]];
const RZ0 = 151, RZ1 = 190.5;                     // roof back / front edge
function eave(x) {
  let i = BAYS.findIndex(([a, b]) => x <= b + 0.31);
  if (i < 0) i = 3;
  const [a, b] = BAYS[i], t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  let e = 15.8 + 1.1 * (1 - Math.sin(Math.PI * t));
  if (i === 0) e += 3.2 * (1 - t) ** 3;
  if (i === 3) e += 3.2 * t ** 3;
  return e;
}
const roofY = (x, z) => eave(x) - 2.6 * (RZ1 - z) / (RZ1 - RZ0);   // underside; rises towards the front

// ---- main hall barrel roof ----
const MH = { x0: 90, x1: 192, z0: 95, z1: 149, zr: 122, eave: 20, rise: 5 };
const vaultY = (z) => MH.eave + MH.rise * (1 - ((z - MH.zr) / (MH.zr - MH.z0)) ** 2);

export function buildHall(owner) {
  const A = new Acc();
  const step = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

  // surface y = f(x,z) over a rectangle; up = normal points up
  const surf = (m, x0, x1, z0, z1, f, up, nx = 8, nz = 8) => {
    const X = step(x0, x1, nx), Z = step(z0, z1, nz);
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const [xa, xb, za, zb] = [X[i], X[i + 1], Z[j], Z[j + 1]];
      const p = (x, z) => [x, f(x, z), z];
      if (up) A.quad(m, p(xa, zb), p(xb, zb), p(xb, za), p(xa, za));
      else A.quad(m, p(xa, za), p(xb, za), p(xb, zb), p(xa, zb));
    }
  };
  // vertical strip on a z-plane between y0(x) and y1(x), facing +z (out=1) or -z
  const stripZ = (m, z, x0, x1, y0, y1, out, n = 12) => {
    const X = step(x0, x1, n);
    for (let i = 0; i < n; i++) {
      const [a, b] = [X[i], X[i + 1]];
      if (out > 0) A.quad(m, [a, y0(a), z], [b, y0(b), z], [b, y1(b), z], [a, y1(a), z]);
      else A.quad(m, [b, y0(b), z], [a, y0(a), z], [a, y1(a), z], [b, y1(b), z]);
    }
  };
  // same on an x-plane, facing +x (out=1) or -x
  const stripX = (m, x, z0, z1, y0, y1, out, n = 12) => {
    const Z = step(z0, z1, n);
    for (let i = 0; i < n; i++) {
      const [a, b] = [Z[i], Z[i + 1]];
      if (out > 0) A.quad(m, [x, y0(b), b], [x, y0(a), a], [x, y1(a), a], [x, y1(b), b]);
      else A.quad(m, [x, y0(a), a], [x, y0(b), b], [x, y1(b), b], [x, y1(a), a]);
    }
  };
  // round strut between two points
  const strut = (m, p, q, r, seg = 6) => {
    const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], L = Math.hypot(...d);
    const w = d.map((v) => v / L);
    const h = Math.abs(w[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let u = [w[1] * h[2] - w[2] * h[1], w[2] * h[0] - w[0] * h[2], w[0] * h[1] - w[1] * h[0]];
    const ul = Math.hypot(...u); u = u.map((v) => v / ul);
    const v = [w[1] * u[2] - w[2] * u[1], w[2] * u[0] - w[0] * u[2], w[0] * u[1] - w[1] * u[0]];
    const ring = (c, t) => [0, 1, 2].map((k) => c[k] + r * (Math.cos(t) * u[k] + Math.sin(t) * v[k]));
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
      A.quad(m, ring(p, t0), ring(p, t1), ring(q, t1), ring(q, t0));
    }
  };
  // window with a white frame, on face f
  const win = (f, a0, a1, y0, y1, fr = 0.18) => {
    onFace(A, 'frame', f, a0 - fr, a1 + fr, y0 - fr, y1 + fr, 0, 0.08);
    onFace(A, 'glass', f, a0, a1, y0, y1, 0.08, 0.11);
  };
  // red-brick end facade: white floor bands, wide windows below, tall narrow ones above
  const FLOORS = [1.0, 5.0, 9.0, 13.2];
  const brickFace = (f, a0, a1, { door = null } = {}) => {
    onFace(A, 'brick', f, a0, a1, 0.6, FLOORS[3], 0, 0.04);
    for (const y of FLOORS.slice(1)) onFace(A, 'frame', f, a0, a1, y - 0.2, y + 0.2, 0, 0.12);
    onFace(A, 'frame', f, a0, a1, 0, 1.0, 0, 0.12);
    const span = a1 - a0;
    const nw = Math.max(1, Math.round(span / 6.5));
    for (let i = 0; i < nw; i++) {
      const c = a0 + (span * (i + 0.5)) / nw;
      if (door && c > door[0] - 2 && c < door[1] + 2) continue;
      win(f, c - 1.8, c + 1.8, 1.9, 4.2);
    }
    const nu = Math.max(1, Math.round(span / 3.2));
    for (let i = 0; i < nu; i++) {
      const c = a0 + (span * (i + 0.5)) / nu;
      for (const y of [FLOORS[1], FLOORS[2]]) win(f, c - 0.6, c + 0.6, y + 0.8, y + 3.4, 0.14);
    }
    if (door) {
      onFace(A, 'frame', f, door[0] - 0.4, door[1] + 0.4, 0.6, 4.6, 0, 0.3);
      onFace(A, 'glass', f, door[0], door[1], 1.0, 4.2, 0.3, 0.34);
    }
  };

  // ===== main hall: plain white box, barrel roof with solar panels =====
  A.box('wall', 92, 190, 0, MH.eave, 97, 148.5);
  for (const y of [6.5, 11.5, 16.0]) {                                            // panel joints
    onFace(A, 'joint', E0(190), 97, 148.5, y - 0.06, y + 0.06, 0, 0.03);
    onFace(A, 'joint', W0(92), 97, 148.5, y - 0.06, y + 0.06, 0, 0.03);
  }
  stripX('wall', 190, 97, 148.5, () => MH.eave - 0.1, (z) => vaultY(z) - 0.05, 1);   // gables
  stripX('wall', 92, 97, 148.5, () => MH.eave - 0.1, (z) => vaultY(z) - 0.05, -1);
  surf('solar', MH.x0, MH.x1, MH.z0, MH.z1, (x, z) => vaultY(z) + 0.55, true, 4, 16);
  surf('soffit', MH.x0, MH.x1, MH.z0, MH.z1, (x, z) => vaultY(z), false, 4, 16);
  for (const [x, o] of [[MH.x0, -1], [MH.x1, 1]]) stripX('fascia', x, MH.z0, MH.z1, (z) => vaultY(z), (z) => vaultY(z) + 0.55, o, 16);
  for (const [z, o] of [[MH.z0, -1], [MH.z1, 1]]) stripZ('fascia', z, MH.x0, MH.x1, () => MH.eave, () => MH.eave + 0.55, o, 2);
  A.box('wall', 138, 146, vaultY(122) + 0.5, vaultY(122) + 1.6, 117, 126);         // plant housing on the ridge

  // ===== east annex: loading bays below, white upper floor, roof terrace =====
  A.box('dark', 190, 197.4, 0, 3.6, 112.5, 146.5);
  A.box('wall', 190, 198, 3.6, 7.6, 112, 147);
  for (let z = 113; z <= 146; z += 5.5) A.box('column', 196.6, 197.6, 0, 3.6, z, z + 0.7);
  for (let z = 116; z < 145; z += 6) win(E0(198), z, z + 1.6, 4.6, 6.6, 0.12);
  onFace(A, 'rail', E0(198), 112, 147, 7.6, 8.7, -0.2, -0.1);
  onFace(A, 'rail', N0(112), 190, 198, 7.6, 8.7, -0.2, -0.1);
  for (const [x, z] of [[192, 118], [192, 126], [192, 134]]) A.box('plant', x, x + 3, 7.6, 9.2, z, z + 4);
  A.box('dark', 198, 199.5, -0.01, 0.02, 140, 147);                                 // ramp down to the basement

  // ===== north strip: white ground floor, recessed balconies, brick piers =====
  {
    const X0 = 60, X1 = 190, ZN = 87, ZB = 95;
    A.box('wall', X0, X1, 0, 5.2, ZN, ZB);
    A.box('wall', X0 + 0.5, X1 - 0.5, 5.2, 15.0, ZN + 2.5, ZB);
    A.box('roofLight', X0, X1, 15.0, 15.5, ZN + 0.5, ZB);
    for (let x = X0 + 2.5; x < X1 - 2; x += 4.4) {
      if ((Math.round((x - X0) / 4.4) % 6) === 3) continue;
      win(N0(ZN), x, x + 1.6, 1.4, 3.9, 0.14);
      onFace(A, 'louvre', N0(ZN), x - 0.3, x + 1.9, 0.15, 0.7, 0, 0.06);
    }
    for (const y of [8.6, 12.0]) {
      onFace(A, 'wall', N0(ZN + 2.5), X0 + 0.5, X1 - 0.5, y - 0.25, y, 0, 2.0);       // balcony slabs
      onFace(A, 'rail', N0(ZN + 2.5), X0 + 0.5, X1 - 0.5, y, y + 1.05, 1.9, 1.95);
    }
    for (const y of [5.2, 8.6, 12.0]) onFace(A, 'glass', N0(ZN + 2.5), X0 + 1, X1 - 1, y + 1.0, y + 3.0, -0.05, 0.02);
    for (let x = X0 + 6; x < X1 - 3; x += 13) onFace(A, 'brick', N0(ZN + 2.5), x, x + 1.8, 5.2, 16.6, 0, 2.4);
  }

  // ===== north-west wing: white, ribbon windows, overhanging solar roof, brick name tower =====
  {
    const X0 = 48, X1 = 78, Z0 = 94, Z1 = 137;
    A.box('wall', X0, X1, 0, 15, Z0, Z1);
    for (const y of [1.6, 6.0, 10.3]) {
      onFace(A, 'glass', W0(X0), Z0 + 1.5, Z1 - 1.5, y, y + 2.6, 0, 0.05);
      onFace(A, 'glass', N0(Z0), X0 + 1.5, X1 - 1.5, y, y + 2.6, 0, 0.05);
      onFace(A, 'glass', S0(Z1), X0 + 1.5, 64, y, y + 2.6, 0, 0.05);
      for (let z = Z0 + 4; z < Z1 - 1; z += 4) onFace(A, 'frame', W0(X0), z - 0.08, z + 0.08, y, y + 2.6, 0, 0.08);
    }
    A.box('soffit', X0 - 1.6, X1 + 1.6, 15.0, 15.1, Z0 - 1.6, Z1 + 1.6, false);
    A.box('fascia', X0 - 1.6, X1 + 1.6, 15.1, 15.6, Z0 - 1.6, Z1 + 1.6);
    A.box('solar', X0 - 1.0, X1 + 1.0, 15.6, 15.75, Z0 - 1.0, Z1 + 1.0);
    A.box('brick', 65, 78, 0, 16.4, Z1 - 0.5, Z1 + 1.2);                               // name tower
    // link terrace between the wing and the main hall
    A.box('wall', X1, 92, 0, 10.5, 95, 137);
    A.box('roofLight', X1, 92, 10.5, 10.8, 95, 137);
    onFace(A, 'rail', N0(95), X1, 92, 10.8, 11.9, -0.2, -0.1);
  }

  // ===== south foyer block =====
  const ZF = 182;                                                               // front wall line
  A.box('wall', 70.5, 213, 0, 13.2, 153, ZF);
  A.box('wall', 85, 197, 0, 12, 148.5, 153);                                    // link to the main hall
  // white band up to the sloping roof over the glass wall (the brick ends stop at 13 m, roof open above)
  stripZ('wall', ZF, 80, 203, () => 13.1, (x) => roofY(x, ZF) - 0.02, 1, 40);
  // two-storey glass wall with mullions and a mezzanine rail band
  onFace(A, 'glass', S0(ZF), 80, 203, 1.0, 10.6, 0, 0.05);
  for (let x = 80; x <= 203.01; x += 4.1) onFace(A, 'frame', S0(ZF), x - 0.12, x + 0.12, 1.0, 10.6, 0, 0.2);
  for (const y of [4.6, 6.4, 10.6]) onFace(A, 'frame', S0(ZF), 80, 203, y - 0.1, y + 0.1, 0, 0.16);
  onFace(A, 'rail', S0(ZF), 80, 203, 4.7, 6.3, 0.06, 0.09);
  for (let y = 11.6; y < 15.5; y += 1.2) onFace(A, 'joint', S0(ZF), 80, 203, y - 0.04, y + 0.04, 0, 0.03);
  // brick ends on the front and the end walls
  brickFace(S0(ZF), 70.5, 80);
  brickFace(S0(ZF), 203, 213);
  brickFace(W0(70.5), 153, ZF, { door: [164, 169] });
  brickFace(E0(213), 153, ZF);
  // north corners stepping back towards the main hall, in brick under flat overhanging roofs
  for (const [x0, x1, z0] of [[72, 85, 139], [197, 209, 138]]) {
    A.box('wall', x0, x1, 0, 13.2, z0, 153);
    brickFace(N0(z0), x0, x1);
    brickFace(x0 < 100 ? W0(x0) : E0(x1), z0, 153);
    A.box('soffit', x0 - 1, x1 + 1, 14.6, 14.7, z0 - 1, 153, false);
    A.box('fascia', x0 - 1, x1 + 1, 14.7, 15.2, z0 - 1, 153);
    A.box('solar', x0 - 0.6, x1 + 0.6, 15.2, 15.3, z0 - 0.6, 152.5);
  }
  // wing roof: four bays with gutters between, solar panels on top, light soffit below
  BAYS.forEach(([a, b], i) => {
    surf('solar', a, b, RZ0, RZ1, (x, z) => roofY(x, z) + 0.6, true, 14, 4);
    surf('soffit', a, b, RZ0, RZ1, roofY, false, 14, 4);
    stripZ('fascia', RZ1, a, b, (x) => roofY(x, RZ1), (x) => roofY(x, RZ1) + 0.6, 1, 14);
    stripZ('fascia', RZ0, a, b, (x) => roofY(x, RZ0), (x) => roofY(x, RZ0) + 0.6, -1, 14);
    stripX('fascia', a, RZ0, RZ1, (z) => roofY(a, z), (z) => roofY(a, z) + 0.6, -1, 4);
    stripX('fascia', b, RZ0, RZ1, (z) => roofY(b, z), (z) => roofY(b, z) + 0.6, 1, 4);
    if (i < 3) {
      const g0 = b, g1 = BAYS[i + 1][0];
      surf('roofDark', g0, g1, RZ0, RZ1, (x, z) => Math.min(roofY(b, z), roofY(g1, z)) + 0.2, true, 1, 4);
    }
  });
  // podium, steps, columns with V struts
  A.box('paving', 72, 211, 0, 1.0, ZF, 189);
  for (const [x0, x1] of [[82, 104], [116, 166], [178, 200]])
    for (let s = 0; s < 5; s++) A.box('paving', x0, x1, 0, 1.0 - s * 0.2, 189, 189.6 + s * 0.6 + 0.6);
  const ZC = 186.6;
  for (let i = 0; i <= 16; i++) {
    const x = 74 + i * 8.5;
    A.box('column', x - 0.5, x + 0.5, 1.0, roofY(x, ZC) + 0.05, ZC - 0.7, ZC + 0.7);
    for (const s of [-1, 1]) {
      const xe = x + s * 3.8;
      if (xe < 69.5 || xe > 214) continue;
      strut('strut', [x + s * 0.4, 9.2, ZC + 0.4], [xe, roofY(xe, RZ1 - 0.6) - 0.05, RZ1 - 0.6], 0.13);
    }
  }
  // name board between the columns, emblem on the white band above
  A.box('wall', 113.5, 168.5, 9.0, 12.4, 185.1, 185.4);
  A.box('frame', 139.2, 144.6, 12.9, 17.0, ZF + 0.1, ZF + 0.35);

  // ===== steel carport at the west end =====
  A.box('metal', 48.5, 70.5, 8.2, 8.45, 153, 170);
  A.box('soffit', 48.7, 70.5, 7.6, 8.2, 153.3, 153.6);
  A.box('soffit', 48.7, 70.5, 7.6, 8.2, 169.4, 169.7);
  for (const z of [154, 161.5, 169]) {
    strut('strut', [52.5, 0, z], [49.5, 8.2, z], 0.16);
    strut('strut', [52.5, 0, z], [56.5, 8.2, z], 0.12);
  }

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const solar = (() => {
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128;
    const g = cv.getContext('2d');
    g.fillStyle = '#9aa0a6'; g.fillRect(0, 0, 64, 128);
    g.fillStyle = '#26324a'; g.fillRect(3, 3, 58, 122);
    g.strokeStyle = '#3a4866'; g.lineWidth = 1;
    for (let y = 18; y < 125; y += 15) { g.beginPath(); g.moveTo(3, y); g.lineTo(61, y); g.stroke(); }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 0.5); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const MAT = {
    wall: std({ color: '#f2f1ed' }),
    joint: std({ color: '#d6d5d0' }),
    frame: std({ color: '#f7f7f5', roughness: 0.6 }),
    column: std({ color: '#f4f4f2', roughness: 0.6 }),
    strut: std({ color: '#dfe2e5', roughness: 0.4, metalness: 0.5 }),
    glass: std({ color: '#3f5f63', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    brick: std({ color: '#c06a50', map: brick, roughness: 0.95 }),
    rail: std({ color: '#d8d8d4', roughness: 0.6, metalness: 0.3 }),
    louvre: std({ color: '#c9cbcb', roughness: 0.7 }),
    dark: std({ color: '#3b3f42', roughness: 0.95 }),
    plant: std({ color: '#b9bcbd', roughness: 0.8 }),
    soffit: std({ color: '#ddd8cd', roughness: 0.9, side: THREE.DoubleSide }),
    fascia: std({ color: '#f5f5f3', roughness: 0.5 }),
    solar: std({ color: '#ffffff', map: solar, roughness: 0.35, metalness: 0.2 }),
    metal: std({ color: '#c7cacc', roughness: 0.5, metalness: 0.4 }),
    paving: std({ color: '#d4d0c8', roughness: 1 }),
    roofDark: std({ color: '#7d8185', roughness: 0.9 }),
    roofLight: std({ color: '#d9d7d1', roughness: 0.9 }),
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
  // signs: facing south (viewer looks north, west on the left) or west
  const sign = (tex, a0, a1, y0, y1, at, face = 'S') => {
    const P = face === 'S'
      ? [[a0, y0, at], [a1, y0, at], [a1, y1, at], [a0, y1, at]]
      : [[at, y0, a1], [at, y0, a0], [at, y1, a0], [at, y1, a1]];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([...P[0], ...P[1], ...P[2], ...P[0], ...P[2], ...P[3]], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.8 }));
  };
  sign(textTex('หอประชุมเจ้าพระยาสุรวงษ์ไวยวัฒน์ (วร บุนนาค)', { color: '#1f3f8f', h: 150 }), 114.5, 167.5, 10.75, 12.2, 185.43);
  sign(textTex('Chao Phya Surawongwaiwat (Worn Bunnag) Convention Hall', { color: '#1f3f8f', h: 150, font: 'Times New Roman' }), 117, 165, 9.3, 10.55, 185.43);
  sign(textTex('KMITL', { color: '#ffffff', w: 512, h: 160, font: 'Arial', weight: 700 }), 66.5, 76.5, 13.0, 15.4, 138.23);
  sign(textTex('Convention Hall', { color: '#ffffff', w: 1024, h: 160, font: 'Arial', weight: 700 }), 66.5, 76.5, 11.4, 12.7, 138.23);
  const emblem = (() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const g = cv.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#9b3b2c'; g.lineWidth = 12; g.beginPath(); g.arc(128, 128, 96, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#b5543f'; g.beginPath(); g.arc(128, 128, 70, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d9b04c'; g.beginPath(); g.arc(128, 128, 34, 0, Math.PI * 2); g.fill();
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  sign(emblem, 139.5, 144.3, 13.2, 16.7, ZF + 0.38);
  return { meshes, top: vaultY(MH.zr) + 1.6 };
}

// Ground outline traced from the satellite imagery (walls, roof overhangs left out)
export const HALL_OUTLINE = [
  [48, 94], [60, 94], [60, 87], [190, 87], [190, 97], [192, 97], [192, 112], [198, 112], [198, 138],
  [209, 138], [209, 153], [213, 153], [213, 189], [70.5, 189], [70.5, 153], [72, 153], [72, 139],
  [78, 139], [78, 137], [48, 137], [48, 94],
];
