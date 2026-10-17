// Hand-built model of อาคารหอพระราชประวัติพระบาทสมเด็จพระจอมเกล้าเจ้าอยู่หัว (King Mongkut royal history hall,
// OSM way 516308734), with ลานพระจอม (the plaza in front) and พระบรมราชานุสาวรีย์พระบาทสมเด็จพระจอมเกล้าเจ้าอยู่หัว
// (the King Mongkut monument, OSM artwork node at 66.9, -320).
// Surveyed 2026-10-17 from Google Maps satellite imagery (the U-shaped plan, the raised courtyard, the plaza,
// the loop road and the round court to the south), Google Street View from the south edge of the plaza (two
// views supplied by the user), a 360° photo on the monument platform, and a published photo of the monument
// and hall front supplied by the user. Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up.
//   wings        west x 33..53, east x 78..99: two Thai halls side by side, two storeys, white walls with
//                maroon window frames, gables facing south with maroon bargeboards, white gable panels and a
//                red arched gable window; grey roofs, two tiers; rear halls x 42.5..50.5 and 80..88
//   courtyard    x 51..79, z -379..-353.5: a white podium 3.8 m high, terracotta paving on top, a balustrade
//                along the front, red doors and a round window in the front wall, two stairs up
//   gate         a small gold-trimmed Thai pavilion on the podium at the centre of the front
//   court pavilion and the main north hall (x 56..76, z -396..-379) stand on the podium, gold trim
//   terrace      white, x 55..78, z -353.5..-344, steps down to the path
//   ลานพระจอม    grey stone plaza x 57..76.5, z -329..-308 inside a terracotta-paved U and hedges; a round court
//                (pink paving in a grey ring) to the south, centre 67.3, -289.8
//   monument     facing south at 66.6, -322: stepped platform, pink marble pedestal with a dark plaque, side
//                blocks with bronze lotus-bud urns, the bronze standing statue beside a draped tiered stand,
//                a bronze boat-shaped offering tray, a curved marble balustrade behind, bronze elephants on
//                pedestals at both ends, two lamp posts with clusters of white globes
import * as THREE from 'three';
import { Acc } from './ecc.js';

export function buildRoyal(owner) {
  const A = new Acc();
  const POD = 3.8;                                                // courtyard podium height

  // ---- Thai hall: walls, a two-tier roof with the ridge along z, gables at both ends ----
  const thaiHall = (x0, x1, z0, z1, { wall = 5.0, base = 0.8, trim = 'trimRed', floors = 2, gableWin = true } = {}) => {
    A.box('base', x0 - 0.5, x1 + 0.5, 0, base, z0 - 0.5, z1 + 0.5);
    A.box('wall', x0, x1, base, base + wall, z0, z1);
    const w = x1 - x0, xm = (x0 + x1) / 2, y0 = base + wall;
    // windows with maroon frames on each floor, long sides and the front
    const fh = wall / floors;
    for (let f = 0; f < floors; f++) {
      const ya = base + f * fh + 0.7, yb = base + (f + 1) * fh - 0.5;
      for (const [x, o] of [[x0, -1], [x1, 1]])
        for (let z = z0 + 1.6; z < z1 - 1.2; z += 3.0) {
          A.box('frame', x + o * 0.02 - 0.06, x + o * 0.02 + 0.06, ya - 0.12, yb + 0.12, z - 0.12, z + 1.22);
          A.box('door', x + o * 0.09 - 0.03, x + o * 0.09 + 0.03, ya, yb, z, z + 1.1);
        }
      for (let x = x0 + 1.0; x < x1 - 1.2; x += 2.4) {
        A.box('frame', x - 0.12, x + 1.22, ya - 0.12, yb + 0.12, z1, z1 + 0.06);
        A.box('door', x, x + 1.1, ya, yb, z1 + 0.06, z1 + 0.1);
      }
    }
    // lower skirt tier
    const sk = 1.3, ys = y0 - 0.2, yt = y0 + 1.0;
    const sx0 = x0 - sk, sx1 = x1 + sk, sz0 = z0 - sk, sz1 = z1 + sk;
    A.quad('roof', [sx0, ys, sz1], [x0 + 0.6, yt, z1], [x0 + 0.6, yt, z0], [sx0, ys, sz0]);
    A.quad('roof', [x1 - 0.6, yt, z1], [sx1, ys, sz1], [sx1, ys, sz0], [x1 - 0.6, yt, z0]);
    A.quad('roof', [sx1, ys, sz1], [x1 - 0.6, yt, z1], [x0 + 0.6, yt, z1], [sx0, ys, sz1]);
    A.quad('roof', [sx0, ys, sz0], [x0 + 0.6, yt, z0], [x1 - 0.6, yt, z0], [sx1, ys, sz0]);
    A.box(trim, sx0, sx1, ys - 0.3, ys, sz0, sz0 + 0.2); A.box(trim, sx0, sx1, ys - 0.3, ys, sz1 - 0.2, sz1);
    A.box(trim, sx0, sx0 + 0.2, ys - 0.3, ys, sz0, sz1); A.box(trim, sx1 - 0.2, sx1, ys - 0.3, ys, sz0, sz1);
    // upper steep gable
    const rise = w * 0.62, yr = yt + rise, ov = 0.9;
    const a0 = x0 + 0.3, a1 = x1 - 0.3, g0 = z0 - ov, g1 = z1 + ov;
    A.quad('roof', [a0, yt, g1], [xm, yr, g1], [xm, yr, g0], [a0, yt, g0]);
    A.quad('roof', [xm, yr, g1], [a1, yt, g1], [a1, yt, g0], [xm, yr, g0]);
    for (const [z, o] of [[g1 - 0.4, 1], [g0 + 0.4, -1]]) {
      if (o > 0) A.tri('gable', [a0 + 0.4, yt, z], [a1 - 0.4, yt, z], [xm, yr - 0.4, z]);
      else A.tri('gable', [a1 - 0.4, yt, z], [a0 + 0.4, yt, z], [xm, yr - 0.4, z]);
      const zb = z + o * 0.4;
      // pointed-arch window in the gable panel
      if (gableWin) {
        const wy = yt + rise * 0.28, ww = Math.min(0.9, w * 0.07), wh = rise * 0.3;
        if (o > 0) A.tri('gableWin', [xm - ww, wy, z + 0.02], [xm + ww, wy, z + 0.02], [xm, wy + wh, z + 0.02]);
        else A.tri('gableWin', [xm + ww, wy, z - 0.02], [xm - ww, wy, z - 0.02], [xm, wy + wh, z - 0.02]);
        A.box('gableWin', xm - ww, xm + ww, wy - wh * 0.5, wy, z - 0.02, z + 0.02);
      }
      const rake = (p, q) => {
        const n = 8;
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = (i + 1) / n;
          const pa = [p[0] + (q[0] - p[0]) * t0, p[1] + (q[1] - p[1]) * t0], pb = [p[0] + (q[0] - p[0]) * t1, p[1] + (q[1] - p[1]) * t1];
          A.box(trim, Math.min(pa[0], pb[0]) - 0.14, Math.max(pa[0], pb[0]) + 0.14, Math.min(pa[1], pb[1]) - 0.1, Math.max(pa[1], pb[1]) + 0.3, zb - 0.15, zb + 0.15);
        }
      };
      rake([a0 - 0.2, yt - 0.1], [xm, yr + 0.1]);
      rake([xm, yr + 0.1], [a1 + 0.2, yt - 0.1]);
      A.box(trim, xm - 0.12, xm + 0.12, yr, yr + 1.6, zb - 0.12, zb + 0.12);               // chofa finial
      A.box(trim, xm - 0.12, xm + 0.55, yr + 1.3, yr + 1.6, zb - 0.12, zb + 0.12);
    }
    A.box(trim, xm - 0.15, xm + 0.15, yr - 0.1, yr + 0.2, g0, g1);                          // ridge
  };
  const wing = (x0, x1, z0, z1) => {
    const w = (x1 - x0) / 2;
    for (let i = 0; i < 2; i++) thaiHall(x0 + i * w + 0.3, x0 + (i + 1) * w - 0.3, z0, z1, { wall: 6.4, base: 0.8 });
  };

  // ===== the hall complex =====
  wing(33, 53, -373, -354);
  thaiHall(42.5, 50.5, -385, -373, { wall: 6.4 });
  wing(78, 99, -374, -358);
  thaiHall(80, 88, -386, -374, { wall: 6.4 });

  // raised courtyard: white podium, terracotta top, balustrade, red doors, round window, two stairs
  {
    const x0 = 53.5, x1 = 78, z0 = -379, zf = -353.5;
    A.box('wall', x0, x1, 0, POD, z0, zf);
    A.box('court', x0 + 0.3, x1 - 0.3, POD, POD + 0.05, z0 + 0.3, zf - 0.3);
    for (const x of [55.5, 58.5, 72, 75]) A.box('red', x, x + 1.4, 0.2, 2.6, zf, zf + 0.06);
    // round window in the middle of the front
    const cx = 65.75, cy = 2.2, N = 18, R = 1.1;
    for (let i = 0; i < N; i++) {
      const t0 = (i / N) * Math.PI * 2, t1 = ((i + 1) / N) * Math.PI * 2;
      A.tri('gableWin', [cx, cy, zf + 0.07], [cx + R * Math.cos(t0), cy + R * Math.sin(t0), zf + 0.07], [cx + R * Math.cos(t1), cy + R * Math.sin(t1), zf + 0.07]);
    }
    // balustrade along the front of the podium
    for (let x = x0 + 0.3; x < x1 - 0.2; x += 0.42) A.box('trim', x - 0.08, x + 0.08, POD, POD + 0.75, zf - 0.25, zf - 0.05);
    A.box('trim', x0, x1, POD + 0.75, POD + 0.9, zf - 0.3, zf);
    // two stairs climbing from the middle outwards, from the terrace (0.9) to the podium
    for (const [xa, xb, dir] of [[58.5, 63.3, -1], [68.2, 73, 1]]) {
      const n = 10;
      for (let s = 0; s < n; s++) {
        const y1 = 0.9 + ((POD - 0.9) * (s + 1)) / n, t0 = s / n, t1 = (s + 1) / n;
        const xs0 = dir < 0 ? xb - (xb - xa) * t0 : xa + (xb - xa) * t0, xs1 = dir < 0 ? xb - (xb - xa) * t1 : xa + (xb - xa) * t1;
        A.box('terrace', Math.min(xs0, xs1), Math.max(xs0, xs1), 0.9, y1, zf, zf + 1.6);
      }
      A.box('trim', xa, xb, 0.9, POD + 0.9, zf + 1.6, zf + 1.75);
    }
  }
  thaiHall(56, 75.5, -396, -379, { wall: 5.6, base: POD + 0.2, trim: 'trimGold', floors: 1 });   // main north hall
  thaiHall(63, 68.5, -374, -366, { wall: 2.8, base: POD + 0.3, trim: 'trimGold', floors: 1, gableWin: false });
  thaiHall(63, 68.5, -358, -354.4, { wall: 2.6, base: POD + 0.2, trim: 'trimGold', floors: 1, gableWin: false });   // gate pavilion
  // white terrace with balustrades and steps down to the path
  A.box('terrace', 53.5, 78, 0, 0.9, -353.5, -344);
  for (let s = 0; s < 4; s++) A.box('terrace', 60, 71.5, 0, 0.9 - (s + 1) * 0.22, -344, -343.5 + s * 0.5 + 0.5);
  for (const [x0, x1] of [[53.5, 59.5], [72, 78]]) {
    for (let x = x0 + 0.2; x < x1; x += 0.45) A.box('trim', x - 0.08, x + 0.08, 0.9, 1.7, -344.2, -344);
    A.box('trim', x0, x1, 1.7, 1.85, -344.25, -343.95);
  }

  // ===== ลานพระจอม: paving, hedges, round court =====
  A.box('terracotta', 50, 84.5, 0, 0.14, -343.5, -306);                         // terracotta U (under everything)
  A.box('terracotta', 57, 76.5, 0, 0.14, -306, -301);
  A.box('stone', 57.1, 76.5, 0, 0.24, -329, -308.3);                              // grey stone plaza
  for (const x of [52.7, 76.6]) A.box('hedge', x, x + 4.5, 0, 0.9, -328, -309);   // hedge strips
  {
    const C = [67.3, -289.8], N = 48;
    const disc = (m, r, y) => A.prism(m, Array.from({ length: N }, (_, i) => [C[0] + r * Math.cos((i / N) * Math.PI * 2), C[1] + r * Math.sin((i / N) * Math.PI * 2)]), 0, y);
    disc('stone', 16.8, 0.16);
    disc('pink', 13.3, 0.22);
  }

  // ===== the monument =====
  {
    const mx = 66.6, mz = -322;
    // stepped platform, steps on the south
    A.box('marble', mx - 8.5, mx + 8.5, 0.24, 0.5, mz - 4.5, mz + 3.5);
    A.box('marble', mx - 7.5, mx + 7.5, 0.5, 0.76, mz - 4.5, mz + 2.4);
    A.box('marble', mx - 6.5, mx + 6.5, 0.76, 1.02, mz - 4.5, mz + 1.4);
    // curved marble balustrade behind (north)
    const R = 6.6, N = 18;
    for (let i = 0; i <= N; i++) {
      const t = Math.PI + (Math.PI * i) / N;                                      // north half circle
      const x = mx + R * Math.cos(t), z = mz + 0.8 + R * 0.6 * Math.sin(t);
      A.box('marble', x - 0.09, x + 0.09, 1.02, 1.8, z - 0.09, z + 0.09);
      if (i < N) {
        const t2 = Math.PI + (Math.PI * (i + 1)) / N, x2 = mx + R * Math.cos(t2), z2 = mz + 0.8 + R * 0.6 * Math.sin(t2);
        A.box('marble', Math.min(x, x2) - 0.12, Math.max(x, x2) + 0.12, 1.8, 1.95, Math.min(z, z2) - 0.12, Math.max(z, z2) + 0.12);
      }
    }
    // pedestal: lower base, shaft with a plaque, cornice
    A.box('marble', mx - 1.9, mx + 1.9, 1.02, 1.7, mz - 1.9, mz + 1.9);
    A.box('marble', mx - 1.45, mx + 1.45, 1.7, 4.9, mz - 1.45, mz + 1.45);
    A.box('plaque', mx - 0.6, mx + 0.6, 2.6, 4.0, mz + 1.45, mz + 1.5);
    A.box('marble', mx - 1.6, mx + 1.6, 4.9, 5.15, mz - 1.6, mz + 1.6);
    // side blocks with bronze lotus-bud urns
    for (const s of [-1, 1]) {
      const bx = mx + s * 2.7;
      A.box('marble', bx - 0.6, bx + 0.6, 1.02, 2.4, mz - 0.6, mz + 0.6);
      A.cyl('bronze', bx, mz, 0.25, 2.4, 2.55, 10);
      A.cyl('bronze', bx, mz, 0.42, 2.55, 3.1, 12);
      A.cyl('bronze', bx, mz, 0.28, 3.1, 3.4, 10);
      A.cyl('bronze', bx, mz, 0.08, 3.4, 3.8, 6);
    }
    // statue: bronze standing figure facing south
    const sy = 5.15;
    A.box('bronze', mx - 0.35, mx + 0.35, sy, sy + 0.25, mz - 0.25, mz + 0.35);           // feet
    A.box('bronze', mx - 0.38, mx + 0.38, sy + 0.25, sy + 1.2, mz - 0.25, mz + 0.25);     // lower robe
    A.box('bronze', mx - 0.45, mx + 0.45, sy + 1.2, sy + 2.25, mz - 0.28, mz + 0.28);     // coat
    A.box('bronze', mx - 0.55, mx + 0.55, sy + 2.0, sy + 2.3, mz - 0.25, mz + 0.25);      // shoulders
    A.cyl('bronze', mx, mz, 0.09, sy + 2.3, sy + 2.45, 8);                                // neck
    A.cyl('bronze', mx, mz, 0.2, sy + 2.45, sy + 2.85, 10);                               // head
    A.box('bronze', mx + 0.48, mx + 0.6, sy + 0.4, sy + 2.0, mz - 0.08, mz + 0.08);        // arm with the sword
    // draped tiered stand on the statue's right (viewer's left, west)
    const dx = mx - 1.0;
    A.box('bronze', dx - 0.45, dx + 0.45, sy, sy + 1.3, mz - 0.4, mz + 0.4);
    A.cyl('bronze', dx, mz, 0.3, sy + 1.3, sy + 1.8, 10);
    for (let k = 0; k < 4; k++) A.cyl('bronze', dx, mz, 0.24 - k * 0.05, sy + 1.8 + k * 0.3, sy + 2.1 + k * 0.3, 10);
    A.cyl('bronze', dx, mz, 0.03, sy + 3.0, sy + 3.5, 6);
    // boat-shaped offering tray in front
    A.box('bronze', mx - 1.3, mx + 1.3, 1.02, 1.35, mz + 2.4, mz + 2.9);
    A.box('bronze', mx - 1.6, mx - 1.3, 1.2, 1.55, mz + 2.45, mz + 2.85);
    A.box('bronze', mx + 1.3, mx + 1.6, 1.2, 1.55, mz + 2.45, mz + 2.85);
    // elephants on pedestals at both ends
    for (const s of [-1, 1]) {
      const ex = mx + s * 7.6, ez = mz + 1.0;
      A.box('marble', ex - 0.9, ex + 0.9, 0.24, 1.8, ez - 1.0, ez + 1.0);
      A.box('marble', ex - 1.0, ex + 1.0, 1.8, 2.0, ez - 1.1, ez + 1.1);
      A.box('bronze', ex - 0.45, ex + 0.45, 2.5, 3.3, ez - 0.75, ez + 0.6);                  // body
      for (const [lx, lz] of [[-0.3, -0.55], [0.3, -0.55], [-0.3, 0.45], [0.3, 0.45]]) A.box('bronze', ex + lx - 0.13, ex + lx + 0.13, 2.0, 2.6, ez + lz - 0.13, ez + lz + 0.13);
      A.box('bronze', ex - 0.32, ex + 0.32, 2.9, 3.45, ez + 0.55, ez + 0.95);                 // head, facing south
      A.box('bronze', ex - 0.08, ex + 0.08, 2.15, 3.0, ez + 0.9, ez + 1.06);                  // trunk
    }
    // lamp posts with clusters of white globes
    for (const s of [-1, 1]) {
      const lx = mx + s * 5.4, lz = mz - 1.6;
      A.box('lampPost', lx - 0.09, lx + 0.09, 1.02, 4.2, lz - 0.09, lz + 0.09);
      for (const [ox, oz, oy] of [[0, 0, 4.55], [0.55, 0, 4.15], [-0.55, 0, 4.15], [0, 0.55, 4.15], [0, -0.55, 4.15]]) {
        A.box('lampPost', lx + Math.min(0, ox) - 0.03, lx + Math.max(0, ox) + 0.03, oy - 0.25, oy - 0.2, lz + Math.min(0, oz) - 0.03, lz + Math.max(0, oz) + 0.03);
        A.cyl('globe', lx + ox, lz + oz, 0.2, oy - 0.2, oy + 0.2, 10);
      }
    }
  }

  // ===== materials & meshes =====
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    base: std({ color: '#ece9e2' }),
    wall: std({ color: '#f4f2ec' }),
    roof: std({ color: '#7a8494', roughness: 0.55, metalness: 0.15, side: THREE.DoubleSide }),
    gable: std({ color: '#f6f4ee', side: THREE.DoubleSide }),
    gableWin: std({ color: '#9b2a2a', roughness: 0.6, side: THREE.DoubleSide }),
    trim: std({ color: '#f8f8f6', roughness: 0.6 }),
    trimRed: std({ color: '#8e2c2c', roughness: 0.6 }),
    trimGold: std({ color: '#d6a73c', roughness: 0.35, metalness: 0.6 }),
    frame: std({ color: '#8a3a2a', roughness: 0.7 }),
    door: std({ color: '#4c4f55', roughness: 0.4 }),
    red: std({ color: '#9b2f2a', roughness: 0.6 }),
    court: std({ color: '#b57455', roughness: 0.95 }),
    terrace: std({ color: '#e9e5dd', roughness: 0.9 }),
    terracotta: std({ color: '#b0705a', roughness: 1 }),
    stone: std({ color: '#a9aba9', roughness: 0.8 }),
    pink: std({ color: '#c9a8a6', roughness: 0.8 }),
    hedge: std({ color: '#4e7d3a', roughness: 1 }),
    marble: std({ color: '#e3d6cf', roughness: 0.5 }),
    plaque: std({ color: '#2b2c2e', roughness: 0.5, metalness: 0.3 }),
    bronze: std({ color: '#4a3f33', roughness: 0.45, metalness: 0.7 }),
    lampPost: std({ color: '#2a2b2d', roughness: 0.5, metalness: 0.5 }),
    globe: std({ color: '#ffffff', roughness: 0.3, emissive: new THREE.Color('#fff4d6'), emissiveIntensity: 0.25 }),
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
  return { meshes, top: 24 };
}

// Ground outline of the hall complex, traced from the satellite imagery (the plaza and monument are not included)
export const ROYAL_OUTLINE = [
  [54, -397], [76, -397], [76, -387], [89, -387], [89, -375], [99.5, -375], [99.5, -357], [78, -357],
  [78, -355], [69, -355], [69, -353], [62, -353], [62, -355], [53.5, -355], [53.5, -353.5], [32.5, -353.5],
  [32.5, -373.5], [42, -373.5], [42, -386], [54, -386], [54, -397],
];
