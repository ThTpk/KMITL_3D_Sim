// Hand-built model of the wing around the Engineering auditorium (OSM way 190868498, also tagged
// หอประชุมวิศวะ: offices and meeting rooms west and north of the hall, with the statue plaza on the south).
// Surveyed 2026-10-17 from Google Maps satellite imagery (the OSM outline matches it once the imagery's
// lean is allowed for; the taller north block with its skylight grid; the raised hall roof on the south)
// and Google Street View from the statue plaza (looking north-north-west, north-east and east).
// Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up.
//   two storeys of salmon-pink brick, a white band at the upper floor and a white coping
//   ground floor: wide windows in white frames, glazed entrances; upper floor: tall narrow windows
//   north block (x -140..-120, z 5..21) one storey higher, a grid of skylights on its roof
//   a slightly taller meeting-hall roof on the south (x -125.5..-106, z 36..48)
import * as THREE from 'three';
import { Acc, glassTex, brickTex } from './ecc.js';

export const WING_OUTLINE = [[-139.86, 25.87], [-146.55, 25.97], [-146.28, 44.93], [-125.52, 44.64], [-125.46, 48.4], [-106.12, 48.12], [-106.3, 35.37], [-89.45, 35.12], [-89.24, 50.17], [-87.43, 50.15], [-87.53, 44.09], [-49.64, 43.55], [-49.69, 39.85], [-83.81, 40.35], [-83.94, 31.14], [-88.32, 31.2], [-88.4, 25.25], [-117.14, 25.66], [-124.3, 25.76], [-124.37, 21.03], [-119.65, 20.96], [-119.87, 5.02], [-140.15, 5.32], [-139.86, 25.87]];

const FL = 3.7, H2 = 7.6, H3 = 11.3;

export function buildWing(owner) {
  const A = new Acc();
  // rings are walked so that the outside is on the left of each edge (left normal = quad normal)
  const orient = (r) => {
    let s = 0;
    for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; s += a[0] * b[1] - b[0] * a[1]; }
    return s > 0 ? r.slice().reverse() : r;
  };
  const ring = orient(WING_OUTLINE.slice(0, -1));

  // outward-facing facade on one straight edge: bands, windows
  const facade = (a, b, top, floors, { skipBelow = 0 } = {}) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    if (L < 2.5) return;
    const ux = dx / L, uz = dz / L, nx = -uz, nz = ux;                            // outward normal
    const P = (t, y, d) => [a[0] + ux * t + nx * d, y, a[1] + uz * t + nz * d];
    const quad = (m, t0, t1, y0, y1, d) => A.quad(m, P(t0, y0, d), P(t1, y0, d), P(t1, y1, d), P(t0, y1, d));
    const slab = (m, t0, t1, y0, y1, d0, d1) => {                              // thin box standing off the wall
      quad(m, t0, t1, y0, y1, d1);
      A.quad(m, P(t0, y1, d0), P(t0, y1, d1), P(t1, y1, d1), P(t1, y1, d0));
      A.quad(m, P(t1, y0, d0), P(t1, y0, d1), P(t0, y0, d1), P(t0, y0, d0));
      A.quad(m, P(t0, y0, d0), P(t0, y0, d1), P(t0, y1, d1), P(t0, y1, d0));
      A.quad(m, P(t1, y1, d0), P(t1, y1, d1), P(t1, y0, d1), P(t1, y0, d0));
    };
    for (let k = 1; k < floors; k++) slab('white', 0, L, k * FL - 0.2, k * FL + 0.25, 0, 0.15);   // floor bands
    slab('white', -0.05, L + 0.05, top - 0.45, top + 0.05, 0, 0.18);                              // coping
    slab('white', 0, L, 0, 0.45, 0, 0.06);
    const n = Math.max(1, Math.round(L / 5));
    for (let i = 0; i < n; i++) {
      const c = (L * (i + 0.5)) / n;
      for (let k = 0; k < floors; k++) {
        if (k * FL < skipBelow) continue;
        const [w, y0, y1] = k === 0 ? [1.4, 0.9, 2.9] : [0.6, k * FL + 0.8, k * FL + 3.1];
        slab('white', c - w - 0.15, c + w + 0.15, y0 - 0.15, y1 + 0.15, 0, 0.05);
        slab('glass', c - w, c + w, y0, y1, 0.05, 0.08);
      }
    }
  };

  // ---- two-storey body ----
  A.prism('brick', ring, 0, H2);
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    // the strip along the auditorium's north side is a one-storey link: no upper windows facing the hall
    facade(a, b, H2, 2);
  }
  A.prism('roof', ring.map(([x, z]) => [x, z]), H2 - 0.05, H2 + 0.02, { sides: false });

  // ---- north block, one storey higher, skylight grid ----
  const NB = orient([[-140.15, 5.32], [-119.87, 5.02], [-119.65, 20.96], [-139.95, 21.2]]);
  A.prism('brick', NB, H2, H3);
  for (let i = 0; i < 4; i++) facade(NB[i], NB[(i + 1) % 4], H3, 3, { skipBelow: H2 - 0.1 });
  A.prism('roof', NB, H3 - 0.05, H3 + 0.02, { sides: false });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const x = -133 + i * 2.6, z = 9 + j * 2.6;
    A.box('sky', x, x + 2.0, H3, H3 + 0.5, z, z + 2.0);
  }

  // ---- meeting hall on the south, slightly taller ----
  const MH = [[-125.5, 36.2], [-106.2, 35.9], [-106.12, 48.12], [-125.46, 48.4]];
  A.prism('brick', MH, H2, H2 + 1.6);
  A.prism('white', MH, H2 + 1.6, H2 + 2.0);

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    brick: std({ color: '#dca08e', map: brick, roughness: 0.95 }),
    white: std({ color: '#f3f2ee', roughness: 0.6, side: THREE.DoubleSide }),
    glass: std({ color: '#3f4f58', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0, side: THREE.DoubleSide }),
    roof: std({ color: '#b7b4a8', roughness: 0.95, side: THREE.DoubleSide }),
    sky: std({ color: '#3b4248', roughness: 0.3, metalness: 0.3 }),
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
  return { meshes, top: H3 + 0.5 };
}
