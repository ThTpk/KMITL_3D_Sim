// Hand-built model of อาคารหอพระราชประวัติพระบาทสมเด็จพระจอมเกล้าเจ้าอยู่หัว (King Mongkut royal history hall,
// OSM way 516308734). Surveyed 2026-10-17 from Google Maps satellite imagery (the U-shaped plan of Thai-style
// halls round a terracotta courtyard, the small pavilion in the court, the gate and front terrace, the ponds
// either side) and a 360° photo at the King Rama IV monument 45 m to the south (white walls and grey-blue
// tiered Thai gable roofs with white trim and finials seen over the garden). No road runs close enough for
// Street View; wall details are a plain reading of that photo. Photos were only looked at; procedural only.
//
// x = east, z = south, y = up.
//   north hall   x 54..76, z -396..-379: the main hall, ridge north-south, two-tier Thai roof
//   west wing    x 33..53, z -373..-354, with a narrower rear hall x 42..51, z -385..-373
//   east wing    x 78..99, z -374..-358, with a rear hall x 79..89, z -386..-374
//     each wing: three parallel halls side by side, ridges north-south, gables facing the front
//   courtyard    x 51..79, z -379..-355: terracotta paving, a small Thai pavilion in the middle
//   gate         x 62..69, z -357..-353, with a white terrace and steps down to the garden in front
import * as THREE from 'three';
import { Acc } from './ecc.js';

export function buildRoyal(owner) {
  const A = new Acc();
  const WALL = 4.6, BASE = 1.0;

  // Thai roof over [x0,x1] x [z0,z1], ridge along z: a steep upper gable and a lower skirt tier
  const thaiHall = (x0, x1, z0, z1, { wall = WALL, base = BASE } = {}) => {
    A.box('base', x0 - 0.6, x1 + 0.6, 0, base, z0 - 0.6, z1 + 0.6);
    A.box('wall', x0, x1, base, base + wall, z0, z1);
    const w = x1 - x0, xm = (x0 + x1) / 2, y0 = base + wall;
    // lower skirt tier, shallow, overhanging
    const sk = 1.3, ys = y0 - 0.2, yt = y0 + 1.0;
    const sx0 = x0 - sk, sx1 = x1 + sk, sz0 = z0 - sk, sz1 = z1 + sk;
    A.quad('roof', [sx0, ys, sz1], [x0 + 0.6, yt, z1], [x0 + 0.6, yt, z0], [sx0, ys, sz0]);
    A.quad('roof', [x1 - 0.6, yt, z1], [sx1, ys, sz1], [sx1, ys, sz0], [x1 - 0.6, yt, z0]);
    A.quad('roof', [sx1, ys, sz1], [x1 - 0.6, yt, z1], [x0 + 0.6, yt, z1], [sx0, ys, sz1]);
    A.quad('roof', [sx0, ys, sz0], [x0 + 0.6, yt, z0], [x1 - 0.6, yt, z0], [sx1, ys, sz0]);
    A.box('trim', sx0, sx1, ys - 0.25, ys, sz0, sz0 + 0.2); A.box('trim', sx0, sx1, ys - 0.25, ys, sz1 - 0.2, sz1);
    A.box('trim', sx0, sx0 + 0.2, ys - 0.25, ys, sz0, sz1); A.box('trim', sx1 - 0.2, sx1, ys - 0.25, ys, sz0, sz1);
    // upper steep gable, ridge along z, gables at both ends
    const rise = w * 0.62, yr = yt + rise, ov = 0.9;
    const a0 = x0 + 0.3, a1 = x1 - 0.3, g0 = z0 - ov, g1 = z1 + ov;
    A.quad('roof', [a0, yt, g1], [xm, yr, g1], [xm, yr, g0], [a0, yt, g0]);
    A.quad('roof', [xm, yr, g1], [a1, yt, g1], [a1, yt, g0], [xm, yr, g0]);
    // gable faces (white panels set back), white bargeboards along the rakes, finials
    for (const [z, o] of [[g1 - 0.4, 1], [g0 + 0.4, -1]]) {
      if (o > 0) A.tri('gable', [a0 + 0.4, yt, z], [a1 - 0.4, yt, z], [xm, yr - 0.4, z]);
      else A.tri('gable', [a1 - 0.4, yt, z], [a0 + 0.4, yt, z], [xm, yr - 0.4, z]);
      const zb = z + o * 0.4;
      const rake = (p, q) => {
        const n = 8;
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = (i + 1) / n;
          const pa = [p[0] + (q[0] - p[0]) * t0, p[1] + (q[1] - p[1]) * t0], pb = [p[0] + (q[0] - p[0]) * t1, p[1] + (q[1] - p[1]) * t1];
          A.box('trim', Math.min(pa[0], pb[0]) - 0.12, Math.max(pa[0], pb[0]) + 0.12, Math.min(pa[1], pb[1]) - 0.1, Math.max(pa[1], pb[1]) + 0.25, zb - 0.15, zb + 0.15);
        }
      };
      rake([a0 - 0.2, yt - 0.1], [xm, yr + 0.1]);
      rake([xm, yr + 0.1], [a1 + 0.2, yt - 0.1]);
      A.box('trim', xm - 0.12, xm + 0.12, yr, yr + 1.6, zb - 0.12, zb + 0.12);             // chofa finial
      A.box('trim', xm - 0.12, xm + 0.55, yr + 1.3, yr + 1.6, zb - 0.12, zb + 0.12);
    }
    A.box('trim', xm - 0.15, xm + 0.15, yr - 0.1, yr + 0.2, g0, g1);                        // ridge
    // tall narrow windows / doors on the long sides and the front
    for (const [x, o] of [[x0, -1], [x1, 1]])
      for (let z = z0 + 2; z < z1 - 1.5; z += 3.2) A.box('door', x + o * 0.02 - 0.05, x + o * 0.02 + 0.05, base + 0.5, base + 3.4, z, z + 1.3);
    A.box('door', xm - 0.9, xm + 0.9, base, base + 3.6, z1, z1 + 0.06);
  };
  // a wing of three halls side by side
  const wing = (x0, x1, z0, z1) => {
    const w = (x1 - x0) / 3;
    for (let i = 0; i < 3; i++) thaiHall(x0 + i * w + 0.3, x0 + (i + 1) * w - 0.3, z0, z1);
  };

  thaiHall(56, 74, -396, -379, { wall: 5.6, base: 1.4 });                 // main north hall
  wing(33, 53, -373, -354);
  thaiHall(42.5, 50.5, -385, -373);
  wing(78, 99, -374, -358);
  thaiHall(80, 88, -386, -374);

  // courtyard and its pavilion
  A.box('court', 51, 79, 0, 0.9, -379, -355);
  thaiHall(63, 68, -374, -366, { wall: 2.8, base: 1.2 });
  // gate and front terrace with balustrade and steps
  thaiHall(62.5, 68.5, -357.5, -353.5, { wall: 3.2, base: 0.9 });
  A.box('terrace', 55, 78, 0, 0.9, -353.5, -344);
  for (let s = 0; s < 4; s++) A.box('terrace', 60, 71, 0, 0.9 - (s + 1) * 0.22, -344, -343.5 + s * 0.5 + 0.5);
  for (const [x0, x1] of [[55, 59.5], [71.5, 78]]) {
    A.box('trim', x0, x1, 0.9, 1.0, -344.2, -344);
    for (let x = x0 + 0.2; x < x1; x += 0.45) A.box('trim', x - 0.08, x + 0.08, 0.9, 1.7, -344.2, -344);
    A.box('trim', x0, x1, 1.7, 1.85, -344.25, -343.95);
  }

  // ===== materials & meshes =====
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    base: std({ color: '#ece9e2' }),
    wall: std({ color: '#f4f2ec' }),
    roof: std({ color: '#6d7889', roughness: 0.55, metalness: 0.15, side: THREE.DoubleSide }),
    gable: std({ color: '#f6f4ee', side: THREE.DoubleSide }),
    trim: std({ color: '#f8f8f6', roughness: 0.6 }),
    door: std({ color: '#7a5636', roughness: 0.7 }),
    court: std({ color: '#b57455', roughness: 0.95 }),
    terrace: std({ color: '#e9e5dd', roughness: 0.9 }),
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
  return { meshes, top: 22 };
}

// Ground outline traced from the satellite imagery
export const ROYAL_OUTLINE = [
  [54, -397], [76, -397], [76, -387], [89, -387], [89, -375], [99.5, -375], [99.5, -357], [78, -357],
  [78, -355], [69, -355], [69, -353], [62, -353], [62, -355], [53.5, -355], [53.5, -353.5], [32.5, -353.5],
  [32.5, -373.5], [42, -373.5], [42, -386], [54, -386], [54, -397],
];
