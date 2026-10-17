// Hand-built model of Lita cafe & roaster - KMITL (OSM way 1564107231), the small pavilion in the garden
// north of ตึก A. Google Maps places the cafe on the egg-shaped roof seen in the satellite imagery.
// Surveyed 2026-10-17 from Google Maps satellite imagery only: every Street View capture of this garden
// predates the cafe (it shows open lawn here), so the walls and height are not photographed; they are a
// plain reading of the roof shape (glass walls under a low shell roof), to be revisited if photos appear.
// The OSM outline is a rough rectangle overlapping ตึก A; the outline below follows the imagery.
//
// x = east, z = south, y = up.
//   egg-shaped shell roof, smooth light grey, widest at the north (x -93.7..-84.9, z -299.8..-288.5),
//   with a dark oval opening near its north end; glazed walls under the eaves
//   a lower flat-roofed service block at the south tip, against the garden wall of ตึก A
//   a cream semicircular deck to the east
import * as THREE from 'three';
import { Acc, glassTex } from './ecc.js';

const C = [-89.3, -294.6];                                   // shell centre
const WALL = 2.8, RISE = 2.0;                                // glazed wall height, shell rise above it

// plan of the shell: an egg, wider at the north (negative z)
const R = (t) => {
  const cz = Math.sin(t);                                     // -1 north .. +1 south
  return [4.4 * (1 - 0.12 * cz), 5.6 * (1 + 0.06 * cz)];
};
const P = (t, k) => { const [rx, rz] = R(t); return [C[0] + rx * k * Math.cos(t), C[1] + rz * k * Math.sin(t)]; };

export function buildLita(owner) {
  const A = new Acc();
  const N = 40, M = 8;
  // glazed wall and its mullions
  for (let i = 0; i < N; i++) {
    const t0 = (i / N) * Math.PI * 2, t1 = ((i + 1) / N) * Math.PI * 2;
    const a = P(t0, 0.93), b = P(t1, 0.93);
    A.quad('glass', [b[0], 0.3, b[1]], [a[0], 0.3, a[1]], [a[0], WALL, a[1]], [b[0], WALL, b[1]]);
    if (i % 2 === 0) A.box('frame', a[0] - 0.05, a[0] + 0.05, 0.3, WALL, a[1] - 0.05, a[1] + 0.05);
  }
  A.prism('base', Array.from({ length: N }, (_, i) => P((i / N) * Math.PI * 2, 1.0)), 0, 0.3);
  // shell roof: rings rising towards the top, eave overhanging the glass
  const ring = (k) => {
    const s = 1 - k / M;                                     // plan scale, 1 at the eave
    const y = WALL + RISE * Math.sin((k / M) * Math.PI / 2);
    return Array.from({ length: N }, (_, i) => { const p = P((i / N) * Math.PI * 2, s * 1.04 + 0.02); return [p[0], y, p[1]]; });
  };
  for (let k = 0; k < M; k++) {
    const r0 = ring(k), r1 = ring(k + 1);
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      A.quad('shell', r0[j], r0[i], r1[i], r1[j]);
    }
  }
  const eave = ring(0);
  for (let i = 0; i < N; i++) {                              // eave edge and soffit
    const j = (i + 1) % N, a = eave[i], b = eave[j];
    A.quad('shell', [b[0], WALL - 0.25, b[2]], [a[0], WALL - 0.25, a[2]], a, b);
    const ai = P((i / N) * Math.PI * 2, 0.93), bi = P((j / N) * Math.PI * 2, 0.93);
    A.quad('soffit', [a[0], WALL - 0.25, a[2]], [b[0], WALL - 0.25, b[2]], [bi[0], WALL, bi[1]], [ai[0], WALL, ai[1]]);
  }
  // dark oval opening near the north end of the shell
  {
    const oc = [C[0] - 0.2, C[1] - 1.9], top = WALL + RISE * 0.93;
    const ov = Array.from({ length: 16 }, (_, i) => { const t = (i / 16) * Math.PI * 2; return [oc[0] + 1.2 * Math.cos(t), oc[1] + 0.75 * Math.sin(t)]; });
    A.prism('opening', ov, top - 0.05, top + 0.08, { sides: false });
  }
  // service block at the south tip
  A.box('block', -92.4, -86.0, 0, 3.1, -290.3, -287.6);
  A.box('blockRoof', -92.6, -85.8, 3.1, 3.3, -290.5, -287.4);
  // cream semicircular deck to the east
  const deck = [[-86.2, -298.6]];
  for (let i = 0; i <= 16; i++) { const t = -Math.PI / 2 + (Math.PI * i) / 16; deck.push([-86.2 + 4.6 * Math.cos(t), -294.2 + 4.4 * Math.sin(t)]); }
  deck.push([-86.2, -289.8]);
  A.prism('deck', deck, 0, 0.35);

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true);
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    glass: std({ color: '#55656e', map: gDay, roughness: 0.25, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0, side: THREE.DoubleSide }),
    frame: std({ color: '#2e2f30', roughness: 0.5, metalness: 0.4 }),
    base: std({ color: '#bdb8ae', roughness: 1 }),
    shell: std({ color: '#a9abab', roughness: 0.55, metalness: 0.1, side: THREE.DoubleSide }),
    soffit: std({ color: '#d9d2c4', roughness: 0.9, side: THREE.DoubleSide }),
    opening: std({ color: '#202224', roughness: 0.6 }),
    block: std({ color: '#c9c8c3' }),
    blockRoof: std({ color: '#b7b7b3', roughness: 0.9 }),
    deck: std({ color: '#d8c7a0', roughness: 0.9 }),
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
  return { meshes, top: WALL + RISE };
}

// Ground outline: the shell plus the service block
export const LITA_OUTLINE = (() => {
  const pts = Array.from({ length: 24 }, (_, i) => P((i / 24) * Math.PI * 2, 1.0).map((v) => +v.toFixed(2)));
  pts.push(pts[0]);
  return pts;
})();
