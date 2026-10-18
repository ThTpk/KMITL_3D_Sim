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
//   monument     facing south at 66.6, -322 (reworked 2026-10-18 in more detail from a Google Maps photo sphere
//                in front of it and a published KMITL ceremony photo): a stepped marble platform with broad
//                steps; a jointed marble pedestal with a bronze plaque, a round emblem and a two-step cornice;
//                the larger-than-life bronze statue, bare-headed in a long open frock coat with a sash over chong
//                kraben, the right hand on a cloth-draped stand topped by the tiered great crown, the left holding
//                a sword point-down; a rounded offering base with a bronze bowl and a boat-shaped candle tray on
//                legs; bronze lotus-bud urns on footed stands on side blocks; a curved balustrade of turned
//                balusters behind; bronze elephants facing outwards with trunks raised on pedestals at both ends;
//                two navy lamp posts each with a candelabra of nine white globes on tulip cups
import * as THREE from 'three';
import { Acc } from './ecc.js';
import { lathe, tube, blob, chain } from './kit.js';

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
    // stepped marble platform, broad steps on the south
    A.box('marble', mx - 8.5, mx + 8.5, 0.24, 0.5, mz - 4.5, mz + 3.5);
    A.box('marble', mx - 7.5, mx + 7.5, 0.5, 0.76, mz - 4.5, mz + 2.4);
    A.box('marble', mx - 6.5, mx + 6.5, 0.76, 1.02, mz - 4.5, mz + 1.4);
    for (const [y, z] of [[0.5, mz + 3.5], [0.76, mz + 2.4], [1.02, mz + 1.4]]) A.box('marbleEdge', mx - 6, mx + 6, y - 0.03, y + 0.01, z - 0.04, z + 0.02);

    // curved balustrade behind (north): plinth, turned balusters, top rail, piers
    {
      const cz = mz + 0.8, RX = 6.6, RZ = 3.96, N = 48;
      const pt = (i) => { const t = Math.PI + (Math.PI * i) / N; return [mx + RX * Math.cos(t), cz + RZ * Math.sin(t)]; };
      const band = (i, w, y0, y1) => {
        const [ax, az] = pt(i), [bx, bz] = pt(i + 1), l = Math.hypot(bx - ax, bz - az), nx = (-(bz - az) / l) * w, nz = ((bx - ax) / l) * w;
        A.prism('marble', [[ax + nx, az + nz], [bx + nx, bz + nz], [bx - nx, bz - nz], [ax - nx, az - nz]], y0, y1);
      };
      for (let i = 0; i < N; i++) { band(i, 0.2, 1.02, 1.2); band(i, 0.17, 1.78, 1.86); band(i, 0.2, 1.86, 1.96); }
      for (let i = 0; i < N; i++) for (const f of [0.25, 0.75]) {
        if (i % 8 === 0 && f === 0.25) continue;
        const [ax, az] = pt(i), [bx, bz] = pt(i + 1), x = ax + (bx - ax) * f, z = az + (bz - az) * f;
        lathe(A, 'marble', x, z, [[0.07, 1.2], [0.1, 1.27], [0.06, 1.37], [0.11, 1.52], [0.07, 1.68], [0.09, 1.74], [0.09, 1.78]], 8);
      }
      for (let i = 0; i <= N; i += 8) {
        const [x, z] = pt(i);
        A.box('marble', x - 0.24, x + 0.24, 1.02, 2.05, z - 0.24, z + 0.24);
        A.box('marble', x - 0.3, x + 0.3, 2.05, 2.15, z - 0.3, z + 0.3);
      }
    }

    // pedestal: moulded base, jointed marble shaft with a bronze plaque and emblem, two-step cornice
    A.box('marble', mx - 2.0, mx + 2.0, 1.02, 1.35, mz - 2.0, mz + 2.0);
    A.box('marble', mx - 1.8, mx + 1.8, 1.35, 1.7, mz - 1.8, mz + 1.8);
    A.box('marble', mx - 1.45, mx + 1.45, 1.7, 4.75, mz - 1.45, mz + 1.45);
    for (let y = 2.3; y < 4.7; y += 0.6) {                                              // stone courses
      A.box('joint', mx - 1.46, mx + 1.46, y - 0.012, y + 0.012, mz + 1.44, mz + 1.455);
      A.box('joint', mx - 1.46, mx + 1.46, y - 0.012, y + 0.012, mz - 1.455, mz - 1.44);
      A.box('joint', mx + 1.44, mx + 1.455, y - 0.012, y + 0.012, mz - 1.46, mz + 1.46);
      A.box('joint', mx - 1.455, mx - 1.44, y - 0.012, y + 0.012, mz - 1.46, mz + 1.46);
    }
    A.box('marble', mx - 1.55, mx + 1.55, 4.75, 4.9, mz - 1.55, mz + 1.55);
    A.box('marble', mx - 1.65, mx + 1.65, 4.9, 5.15, mz - 1.65, mz + 1.65);
    A.box('bronze', mx - 0.7, mx + 0.7, 2.3, 3.9, mz + 1.44, mz + 1.47);
    A.box('plaque', mx - 0.65, mx + 0.65, 2.35, 3.85, mz + 1.45, mz + 1.5);
    tube(A, 'bronze', [mx, 4.3, mz + 1.44], [mx, 4.3, mz + 1.52], 0.3, 0.3, 16);       // round emblem
    tube(A, 'plaque', [mx, 4.3, mz + 1.5], [mx, 4.3, mz + 1.53], 0.22, 0.22, 16);

    // side blocks with bronze lotus-bud urns on footed stands
    for (const s of [-1, 1]) {
      const bx = mx + s * 2.7;
      A.box('marble', bx - 0.6, bx + 0.6, 1.02, 2.25, mz - 0.6, mz + 0.6);
      A.box('marble', bx - 0.7, bx + 0.7, 2.25, 2.4, mz - 0.7, mz + 0.7);
      lathe(A, 'bronze', bx, mz, [[0.3, 2.4], [0.3, 2.5], [0.14, 2.56], [0.11, 2.74], [0.34, 2.84], [0.38, 2.9], [0.16, 2.95],
        [0.28, 3.08], [0.34, 3.25], [0.3, 3.45], [0.19, 3.64], [0.07, 3.82], [0, 3.92]], 16);
      for (let k = 0; k < 8; k++) {                                                      // petal ridges
        const a = (k / 8) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
        chain(A, 'bronze', [[bx + c * 0.28, 3.06, mz + sn * 0.28, 0.025], [bx + c * 0.35, 3.25, mz + sn * 0.35, 0.025],
          [bx + c * 0.2, 3.62, mz + sn * 0.2, 0.02], [bx + c * 0.05, 3.85, mz + sn * 0.05, 0.012]], 5);
      }
    }

    // offering place in front: a rounded marble base, a bronze bowl, the boat-shaped candle tray on two legs
    {
      const N = 20, oz = mz + 1.9, R = 1.25;
      const half = (r) => Array.from({ length: N + 1 }, (_, i) => { const t = (Math.PI * i) / N; return [mx + r * Math.cos(t), oz + r * Math.sin(t)]; });
      A.prism('marble', half(R), 0.5, 1.45);
      A.prism('marble', half(R + 0.08), 1.45, 1.53);
      lathe(A, 'bronze', mx, oz + 0.6, [[0.26, 1.53], [0.34, 1.57], [0.42, 1.75], [0.45, 1.9], [0.41, 1.9], [0, 1.86]], 18);
      blob(A, 'bronze', [mx, 2.12, oz + 0.15], 1.15, 0.08, 0.13, 14, 5);
      for (const s of [-1, 1]) {
        chain(A, 'bronze', [[mx + s * 1.05, 2.12, oz + 0.15, 0.06], [mx + s * 1.25, 2.2, oz + 0.15, 0.05], [mx + s * 1.36, 2.36, oz + 0.15, 0.035], [mx + s * 1.32, 2.48, oz + 0.15, 0.02]], 6);
        tube(A, 'bronze', [mx + s * 0.55, 1.53, oz + 0.15], [mx + s * 0.55, 2.08, oz + 0.15], 0.04, 0.04, 6);
        A.box('bronze', mx + s * 0.55 - 0.18, mx + s * 0.55 + 0.18, 1.53, 1.58, oz + 0.05, oz + 0.25);
      }
      for (let x = -0.9; x <= 0.91; x += 0.15) tube(A, 'bronze', [mx + x, 2.18, oz + 0.15], [mx + x, 2.28, oz + 0.15], 0.012, 0.006, 4);
    }

    // the statue, facing south: bare-headed, a long open frock coat with a sash over chong kraben, stockings and
    // shoes; the right hand rests on the draped stand with the great crown, the left holds a sword point-down
    const sy = 5.15, sz = mz;
    const mark = Object.fromEntries(Object.entries(A.b).map(([k, B]) => [k, B.p.length]));
    for (const s of [-1, 1]) {
      const lx = mx + s * 0.13;
      blob(A, 'bronze', [lx, sy + 0.05, sz + 0.06], 0.085, 0.06, 0.16, 8, 4);            // shoe
      tube(A, 'bronze', [lx, sy + 0.08, sz], [lx, sy + 0.7, sz], 0.065, 0.085);           // stocking
      blob(A, 'bronze', [lx, sy + 0.92, sz], 0.15, 0.28, 0.16, 10, 6);                    // chong kraben leg
    }
    blob(A, 'bronze', [mx, sy + 1.15, sz], 0.29, 0.22, 0.19, 12, 6);
    lathe(A, 'bronze', mx, sz, [[0.33, sy + 0.6], [0.31, sy + 0.9], [0.27, sy + 1.2], [0.25, sy + 1.33], [0.27, sy + 1.6], [0.3, sy + 1.86],
      [0.26, sy + 1.98], [0.12, sy + 2.04], [0, sy + 2.05]], 16, 1, 0.62);                // coat
    lathe(A, 'bronzeDark', mx, sz, [[0.262, sy + 1.3], [0.262, sy + 1.37]], 16, 1, 0.64);   // belt
    // open coat front: the inner tunic down the middle and the lapels
    A.box('bronzeDark', mx - 0.07, mx + 0.07, sy + 0.62, sy + 1.95, sz + 0.13, sz + 0.2);
    for (const s of [-1, 1]) tube(A, 'bronze', [mx + s * 0.1, sy + 1.98, sz + 0.18], [mx + s * 0.08, sy + 0.62, sz + 0.2], 0.03, 0.025, 5);
    tube(A, 'bronzeDark', [mx - 0.24, sy + 1.92, sz + 0.12], [mx + 0.25, sy + 1.32, sz + 0.17], 0.03, 0.03, 6);   // sash
    lathe(A, 'bronze', mx, sz, [[0.1, sy + 2.0], [0.09, sy + 2.1], [0.07, sy + 2.14]], 10);                       // collar
    tube(A, 'bronze', [mx, sy + 2.1, sz], [mx, sy + 2.2, sz + 0.01], 0.065, 0.06, 8);                            // neck
    blob(A, 'bronze', [mx, sy + 2.31, sz + 0.02], 0.105, 0.135, 0.12, 12, 7);                                    // head
    blob(A, 'bronzeDark', [mx, sy + 2.37, sz - 0.01], 0.108, 0.09, 0.115, 12, 5);                                // short hair
    for (const s of [-1, 1]) blob(A, 'bronze', [mx + s * 0.105, sy + 2.3, sz + 0.01], 0.02, 0.04, 0.03, 6, 3);  // ears
    blob(A, 'bronze', [mx, sy + 2.28, sz + 0.13], 0.025, 0.03, 0.03, 6, 3);                                       // nose
    // arms (sleeves): the right on the stand (west), the left with the sword (east)
    chain(A, 'bronze', [[mx - 0.29, sy + 1.9, sz, 0.08], [mx - 0.42, sy + 1.6, sz + 0.02, 0.075], [mx - 0.6, sy + 1.43, sz + 0.04, 0.06]]);
    blob(A, 'bronze', [mx - 0.66, sy + 1.4, sz + 0.04], 0.07, 0.04, 0.06, 8, 4);
    chain(A, 'bronze', [[mx + 0.29, sy + 1.9, sz, 0.08], [mx + 0.36, sy + 1.58, sz + 0.02, 0.075], [mx + 0.37, sy + 1.33, sz + 0.1, 0.06]]);
    blob(A, 'bronze', [mx + 0.37, sy + 1.29, sz + 0.12], 0.05, 0.065, 0.05, 8, 4);
    tube(A, 'bronze', [mx + 0.37, sy + 1.42, sz + 0.13], [mx + 0.42, sy + 0.05, sz + 0.2], 0.03, 0.022, 6);       // sword in its scabbard
    A.box('bronze', mx + 0.3, mx + 0.44, sy + 1.2, sy + 1.24, sz + 0.1, sz + 0.16);                              // guard
    // draped stand on the statue's right, the great crown of victory on top
    {
      const dx = mx - 0.88;
      lathe(A, 'bronze', dx, sz, [[0.52, sy], [0.5, sy + 0.12], [0.41, sy + 0.55], [0.34, sy + 1.0], [0.3, sy + 1.25], [0.32, sy + 1.32], [0, sy + 1.34]], 20);
      for (let k = 0; k < 10; k++) {                                                    // cloth folds
        const a = (k / 10) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
        tube(A, 'bronze', [dx + c * 0.5, sy + 0.02, sz + s * 0.5], [dx + c * 0.3, sy + 1.22, sz + s * 0.3], 0.05, 0.02, 5);
      }
      lathe(A, 'bronze', dx, sz, [[0.19, sy + 1.34], [0.2, sy + 1.42], [0.16, sy + 1.45], [0.17, sy + 1.53], [0.12, sy + 1.56], [0.13, sy + 1.64],
        [0.09, sy + 1.67], [0.1, sy + 1.74], [0.065, sy + 1.77], [0.05, sy + 1.9], [0.025, sy + 2.05], [0.012, sy + 2.12], [0, sy + 2.15]], 14);
    }
    // the figures are drawn at about life size above; the statue is larger than life (about 0.8 of the pedestal
    // width tall in the photos), so scale everything drawn since `mark` about the statue's feet
    const SC = 1.3;
    for (const [k, B] of Object.entries(A.b)) for (let i = mark[k] || 0; i < B.p.length; i += 3) {
      B.p[i] = mx + (B.p[i] - mx) * SC; B.p[i + 1] = sy + (B.p[i + 1] - sy) * SC; B.p[i + 2] = sz + (B.p[i + 2] - sz) * SC;
    }

    // bronze elephants on moulded pedestals at both ends, facing outwards, trunks raised
    for (const s of [-1, 1]) {
      const ex = mx + s * 7.6, ez = mz + 1.0, ey = 2.0;
      A.box('marble', ex - 1.05, ex + 1.05, 0.24, 0.5, ez - 1.15, ez + 1.15);
      A.box('marble', ex - 0.9, ex + 0.9, 0.5, 1.75, ez - 1.0, ez + 1.0);
      A.box('marble', ex - 1.0, ex + 1.0, 1.75, ey, ez - 1.1, ez + 1.1);
      A.box('plaque', ex - 0.5, ex + 0.5, 0.85, 1.4, ez + 1.0, ez + 1.03);
      blob(A, 'bronze', [ex, ey + 0.95, ez], 0.62, 0.42, 0.38, 14, 7);                                          // body
      for (const fx of [-0.33, 0.33]) for (const fz of [-0.2, 0.2])
        tube(A, 'bronze', [ex + fx, ey, ez + fz], [ex + fx, ey + 0.8, ez + fz], 0.13, 0.14, 8);                  // legs
      blob(A, 'bronze', [ex + s * 0.72, ey + 1.12, ez], 0.28, 0.32, 0.27, 12, 6);                               // head
      for (const fz of [-1, 1]) blob(A, 'bronze', [ex + s * 0.6, ey + 1.15, ez + fz * 0.3], 0.07, 0.26, 0.2, 8, 5);   // ears
      chain(A, 'bronze', [[ex + s * 0.94, ey + 0.98, ez, 0.1], [ex + s * 1.08, ey + 0.96, ez, 0.075], [ex + s * 1.2, ey + 1.18, ez, 0.06],
        [ex + s * 1.16, ey + 1.45, ez, 0.05], [ex + s * 1.04, ey + 1.56, ez, 0.04]], 7);                        // trunk, raised
      for (const fz of [-1, 1]) tube(A, 'bronze', [ex + s * 0.9, ey + 0.92, ez + fz * 0.1], [ex + s * 1.12, ey + 0.86, ez + fz * 0.13], 0.035, 0.015, 5);   // tusks
      tube(A, 'bronze', [ex - s * 0.6, ey + 1.05, ez], [ex - s * 0.68, ey + 0.55, ez], 0.03, 0.02, 5);         // tail
    }

    // lamp posts: navy columns with a candelabra of nine white globes on tulip cups
    for (const s of [-1, 1]) {
      const lx = mx + s * 5.4, lz = mz - 1.6;
      lathe(A, 'navy', lx, lz, [[0.22, 1.02], [0.22, 1.3], [0.14, 1.4], [0.1, 1.6], [0.075, 3.5], [0.06, 4.3]], 10);
      const globe = (x, y, z) => {
        lathe(A, 'navy', x, z, [[0.025, y - 0.3], [0.04, y - 0.2], [0.13, y - 0.1], [0, y - 0.1]], 8);
        blob(A, 'globe', [x, y + 0.07, z], 0.19, 0.19, 0.19, 10, 6);
      };
      globe(lx, 4.45, lz);
      for (let k = 0; k < 4; k++) {
        const a = Math.PI / 4 + (k * Math.PI) / 2, x = lx + Math.cos(a) * 0.45, z = lz + Math.sin(a) * 0.45;
        chain(A, 'navy', [[lx, 3.85, lz, 0.035], [x, 3.88, z, 0.03], [x, 4.05, z, 0.025]], 5);
        globe(x, 4.15, z);
        const b = (k * Math.PI) / 2, x2 = lx + Math.cos(b) * 0.75, z2 = lz + Math.sin(b) * 0.75;
        chain(A, 'navy', [[lx, 3.45, lz, 0.035], [lx + Math.cos(b) * 0.5, 3.42, lz + Math.sin(b) * 0.5, 0.03], [x2, 3.55, z2, 0.025], [x2, 3.65, z2, 0.025]], 5);
        globe(x2, 3.75, z2);
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
    marbleEdge: std({ color: '#cfc3bb', roughness: 0.5 }),
    joint: std({ color: '#c4b8b0', roughness: 0.7 }),
    plaque: std({ color: '#2b2c2e', roughness: 0.5, metalness: 0.3 }),
    bronze: std({ color: '#4a3f33', roughness: 0.45, metalness: 0.7 }),
    bronzeDark: std({ color: '#2f2822', roughness: 0.5, metalness: 0.6 }),
    navy: std({ color: '#1f2a5c', roughness: 0.45, metalness: 0.4 }),
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
