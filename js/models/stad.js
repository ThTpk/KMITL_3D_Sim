// Hand-built model of สนามกีฬากลาง (KMITL central stadium): the west grandstand (OSM way 1138463206), with
// the grass banks, floodlight towers and scoreboard round the track (the track and pitch themselves are the
// OSM sport areas, drawn by builders.js). Surveyed 2026-10-17 from Google Maps satellite imagery (curved
// grandstand plan, solar panels on its roof, the banks and their radial stair paths, the gates) and a Google
// Street View pano on the west straight of the track (looking west at the grandstand, east across the pitch,
// north along the track). The grandstand front was reworked 2026-10-19 from two photos of the KMITL Virtual Tour
// (ทางเข้าอัฒจันทร์, from the track in front of the stand). Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up.
//   grandstand: curved in plan, about 105 m long and 20 m deep; a slate-blue podium with windows and AC units,
//   a blue rail along its top; blue seats in two tiers split by a walkway, the lower tier spelling "KMITL" in
//   orange on each side of the centre; white end walls; a cantilevered roof (dark soffit, blue fascia, a rail
//   along the edge) hung from raking concrete beams over the back columns, solar panels on top; a glazed press box
//   under the roof in the middle; a white VIP stand in front of it with "KMITL SPORT WORLD" on its face, the
//   institute crest on a banner above and stairs down both sides; green see-through dugouts and red benches at
//   the track edge
//   banks: low grassed embankment round the rest of the oval
//   four lattice floodlight towers; a scoreboard on the north bank
import * as THREE from 'three';
import { Acc, textTex, canvasTex } from './ecc.js';

export const STAD_OUTLINE = [[-707.31, -306.01], [-687.71, -301.33], [-689.95, -294.13], [-690.69, -287.61], [-691.52, -281.38], [-692.32, -274.86], [-692.82, -268.52], [-693.14, -262.19], [-693.21, -255.6], [-693.17, -248.62], [-692.51, -242.32], [-691.95, -236.21], [-691.16, -229.56], [-690.28, -223.22], [-688.89, -216.95], [-687.28, -210.83], [-685.05, -203.59], [-701.73, -199.76], [-705.3, -198.94], [-707.45, -206.29], [-709.19, -213.77], [-710.62, -220.79], [-711.83, -228.0], [-712.65, -234.91], [-713.04, -242.25], [-713.41, -249.01], [-713.58, -256.26], [-713.58, -263.48], [-713.31, -270.71], [-712.86, -278.01], [-711.74, -285.04], [-710.42, -292.04], [-709.12, -298.87], [-707.31, -306.01]];

export function buildStad(owner) {
  const A = new Acc();
  const O = STAD_OUTLINE;
  const Fr = O.slice(1, 17);                                   // front arc, south -> north
  const Bk = O.slice(18, 34).reverse();                        // back arc, south -> north
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const P = 3.4, SEAT0 = 4.0, SEAT1 = 11.5, RB = 17.0, RF = 15.6, CANT = 7;   // podium, seat rake, roof back/front

  // ---- podium: orange wall with small windows, white rail ----
  A.prism('podium', O.slice(0, -1), 0, P);
  for (let i = 0; i < Fr.length - 1; i++) {
    const a = Fr[i], b = Fr[i + 1];
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = dz / L, nz = -dx / L;   // outward (east-ish)
    const off = (p, d, y) => [p[0] + nx * d, y, p[1] + nz * d];
    A.quad('orange', off(a, 0.02, 0.2), off(b, 0.02, 0.2), off(b, 0.02, P), off(a, 0.02, P));
    const at = (t, d) => [a[0] + dx * t + nx * d, a[1] + dz * t + nz * d];
    for (const t of [0.3, 0.7]) {                                                      // two windows a bay
      const p = at(t - 0.09, 0.04), q = at(t + 0.09, 0.04);
      A.quad('win', [p[0], 1.1, p[1]], [q[0], 1.1, q[1]], [q[0], 2.5, q[1]], [p[0], 2.5, p[1]]);
    }
    if (i % 2 === 1) { const c = at(0.5, 0.5); A.box('ac', c[0] - 0.35, c[0] + 0.35, 0.3, 1.0, c[1] - 0.45, c[1] + 0.45); }
    A.quad('concrete', off(a, 0.03, P - 0.35), off(b, 0.03, P - 0.35), off(b, 0.03, P), off(a, 0.03, P));
    A.quad('rail', off(a, 0.3, P), off(b, 0.3, P), off(b, 0.3, P + 1.0), off(a, 0.3, P + 1.0));
  }
  const SUB = 8, COLS = (Fr.length - 1) * SUB, ROWS = 16, WALK = 9;   // WALK: the row of the cross walkway
  // seat colours spelling "KMITL" in orange on the lower tier, once on each side of the VIP stand (sampled from a canvas)
  const letter = (() => {
    const cv = document.createElement('canvas'); cv.width = COLS; cv.height = ROWS;
    const g = cv.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, COLS, ROWS);
    g.fillStyle = '#fff'; g.font = 'bold 7px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const x0 of [0.08, 0.6]) ['K', 'M', 'I', 'T', 'L'].forEach((ch, j) => g.fillText(ch, (x0 + j * 0.068 + 0.03) * COLS, ROWS - 4.4));
    const d = g.getImageData(0, 0, COLS, ROWS).data;
    return (x, y) => {
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return null;
      return d[(y * COLS + x) * 4] > 110 ? 'seatLetter' : null;
    };
  })();
  // ---- seating rake, rear wall, columns, cantilevered roof on raking beams ----
  for (let i = 0; i < Fr.length - 1; i++) {
    const f0 = Fr[i], f1 = Fr[i + 1], b0 = Bk[i], b1 = Bk[i + 1];
    const s0 = lerp(f0, b0, 0.08), s1 = lerp(f1, b1, 0.08), t0 = lerp(f0, b0, 0.9), t1 = lerp(f1, b1, 0.9);
    // stepped seat rows as a sawtooth of ROWS risers; each bay split into SUB columns so orange seats can spell
    // "KMITL" across the lower tier, read from the pitch; the walkway row has no seats
    const N = ROWS;
    for (let k = 0; k < N; k++) {
      const u0 = k / N, u1 = (k + 1) / N, y0 = SEAT0 + (SEAT1 - SEAT0) * u0, y1 = SEAT0 + (SEAT1 - SEAT0) * u1;
      for (let c = 0; c < SUB; c++) {
        const v0 = c / SUB, v1 = (c + 1) / SUB;
        const p0 = lerp(lerp(s0, s1, v0), lerp(t0, t1, v0), u0), p1 = lerp(lerp(s0, s1, v1), lerp(t0, t1, v1), u0);
        const q0 = lerp(lerp(s0, s1, v0), lerp(t0, t1, v0), u1), q1 = lerp(lerp(s0, s1, v1), lerp(t0, t1, v1), u1);
        const paint = k === WALK ? null : letter(COLS - 1 - (i * SUB + c), N - 1 - k);   // Fr runs north -> south, i.e. right -> left from the pitch
        const m = k === WALK ? 'walk' : paint || (k % 2 ? 'seatDark' : 'seat');
        A.quad(k === WALK ? 'concrete' : paint || 'riser', [p1[0], y0, p1[1]], [p0[0], y0, p0[1]], [p0[0], y1, p0[1]], [p1[0], y1, p1[1]]);   // riser (seat backs)
        A.quad(m, [p0[0], y1, p0[1]], [p1[0], y1, p1[1]], [q1[0], y1, q1[1]], [q0[0], y1, q0[1]]);                              // tread
      }
    }
    A.quad('concrete', [s1[0], P, s1[1]], [s0[0], P, s0[1]], [s0[0], SEAT0, s0[1]], [s1[0], SEAT0, s1[1]]);
    // rear wall up to the roof
    A.quad('concrete', [t0[0], SEAT1, t0[1]], [t1[0], SEAT1, t1[1]], [t1[0], RB, t1[1]], [t0[0], RB, t0[1]]);
    A.quad('rearWall', [b1[0], 0, b1[1]], [b0[0], 0, b0[1]], [b0[0], RB, b0[1]], [b1[0], RB, b1[1]]);
    // roof slab from the back, cantilevered past the front
    const d0 = [f0[0] - b0[0], f0[1] - b0[1]], d1 = [f1[0] - b1[0], f1[1] - b1[1]];
    const l0 = Math.hypot(...d0), l1 = Math.hypot(...d1);
    const e0 = [f0[0] + d0[0] / l0 * CANT, f0[1] + d0[1] / l0 * CANT], e1 = [f1[0] + d1[0] / l1 * CANT, f1[1] + d1[1] / l1 * CANT];
    A.quad('roof', [b0[0], RB, b0[1]], [e0[0], RF, e0[1]], [e1[0], RF, e1[1]], [b1[0], RB, b1[1]]);
    A.quad('soffit', [b1[0], RB - 0.3, b1[1]], [e1[0], RF - 0.3, e1[1]], [e0[0], RF - 0.3, e0[1]], [b0[0], RB - 0.3, b0[1]]);
    A.quad('fascia', [e0[0], RF - 0.6, e0[1]], [e1[0], RF - 0.6, e1[1]], [e1[0], RF + 0.15, e1[1]], [e0[0], RF + 0.15, e0[1]]);
    A.quad('rail', [e0[0], RF + 0.15, e0[1]], [e1[0], RF + 0.15, e1[1]], [e1[0], RF + 1.1, e1[1]], [e0[0], RF + 1.1, e0[1]]);
    // solar panels on the roof
    const sp = (u) => [lerp(b0, e0, u), lerp(b1, e1, u)];
    const [p0, p1] = sp(0.12), [q0, q1] = sp(0.8);
    const yy = (u) => RB + (RF - RB) * u + 0.15;
    A.quad('solar', [p0[0], yy(0.12), p0[1]], [q0[0], yy(0.8), q0[1]], [q1[0], yy(0.8), q1[1]], [p1[0], yy(0.12), p1[1]]);
    // column at the back of every bay, raking beam over the roof
    {
      const c = lerp(t0, b0, 0.5);
      A.box('beam', c[0] - 0.45, c[0] + 0.45, 0, RB + 1.2, c[1] - 0.45, c[1] + 0.45);
      const steps = 6;
      for (let s = 0; s < steps; s++) {
        const u0 = s / steps, u1 = (s + 1) / steps, a0 = lerp(c, e0, u0), a1 = lerp(c, e0, u1);
        const y0 = RB + 1.2 - 1.6 * u0, y1 = RB + 1.2 - 1.6 * u1;
        A.box('beam', Math.min(a0[0], a1[0]) - 0.25, Math.max(a0[0], a1[0]) + 0.25, Math.min(y0, y1) - 0.6, Math.max(y0, y1), Math.min(a0[1], a1[1]) - 0.25, Math.max(a0[1], a1[1]) + 0.25);
      }
    }
  }
  // press box in the middle, under the roof
  {
    const i = 7, a = lerp(Fr[i], Bk[i], 0.75), b = lerp(Fr[i + 2], Bk[i + 2], 0.75);
    A.box('concrete', Math.min(a[0], b[0]) - 1, Math.max(a[0], b[0]) + 2, SEAT1 - 1, RB - 0.4, Math.min(a[1], b[1]), Math.max(a[1], b[1]));
    A.box('win', Math.max(a[0], b[0]) + 2, Math.max(a[0], b[0]) + 2.05, SEAT1 + 0.6, RB - 1.6, Math.min(a[1], b[1]) + 1, Math.max(a[1], b[1]) - 1);
  }
  // white VIP stand in front of the press box: a base block with the name, a box with a rail, the crest banner on
  // top, stairs down both sides with blue rails; green see-through dugouts and red benches at the track edge
  const extra = [];
  const plane = (tex, x, y0, y1, zS, zN) => {                                       // faces east (+x): south on the left
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([x, y0, zS, x, y0, zN, x, y1, zN, x, y0, zS, x, y1, zN, x, y1, zS], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals(); g.computeBoundingSphere();
    g.userData.owner = new Int32Array(2).fill(owner);
    const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.2, roughness: 0.7 }));
    mesh.userData.kind = 'building'; extra.push(mesh);
  };
  {
    const m = lerp(Fr[7], Fr[8], 0.5), X = m[0], Z = m[1];
    A.box('white', X - 6, X + 2.6, 0, 6.2, Z - 5, Z + 5);
    A.box('white', X - 8, X + 0.6, 6.2, 9.6, Z - 4.4, Z + 4.4);
    A.box('win', X + 0.62, X + 0.66, 6.9, 8.6, Z - 3.6, Z + 3.6);
    A.box('railW', X + 0.4, X + 0.6, 9.6, 10.6, Z - 4.4, Z + 4.4);
    A.box('white', X - 7.2, X - 6.6, 9.6, 13.4, Z - 4.6, Z + 4.6);                 // banner board
    plane(textTex('KMITL SPORT WORLD', { w: 1024, h: 120, color: '#8e8e8a' }), X + 2.62, 3.4, 4.6, Z + 4.4, Z - 4.4);
    plane(canvasTex(512, 256, (g, w, h) => {                                        // the crest banner: blue and yellow with the shield
      g.fillStyle = '#2f5e8e'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#e8c33a'; g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.32, h * 0.25); g.lineTo(w * 0.5, h * 0.05); g.lineTo(w * 0.68, h * 0.25); g.lineTo(w, h); g.fill();
      g.fillStyle = '#f4efe2'; g.beginPath(); g.arc(w * 0.5, h * 0.55, h * 0.3, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#2f5e8e'; g.beginPath(); g.arc(w * 0.5, h * 0.55, h * 0.2, 0, Math.PI * 2); g.fill();
    }, 1, 1), X - 6.58, 10.2, 13.2, Z + 4.4, Z - 4.4);
    for (const sd of [-1, 1]) {
      const n = 14;
      for (let k = 0; k < n; k++) {
        const z0 = Z + sd * (11.5 - (k * 6) / n), z1 = Z + sd * (11.5 - ((k + 1) * 6) / n);
        A.box('step', X + 0.2, X + 2.4, 0, ((k + 1) / n) * 6.2, Math.min(z0, z1), Math.max(z0, z1));
      }
      for (const x of [X + 0.25, X + 2.35]) for (let k = 0; k < 6; k++) {
        const za = Z + sd * (11.5 - k), zb = Z + sd * (10.5 - k), ya = 1.0 + (k / 6) * 6.2, yb = 1.0 + ((k + 1) / 6) * 6.2;
        A.box('railBlue', x - 0.04, x + 0.04, Math.min(ya, yb), Math.max(ya, yb) + 0.08, Math.min(za, zb), Math.max(za, zb));
      }
    }
    for (const k of [3, 12]) {
      const d = lerp(Fr[k], Fr[k + 1], 0.5);
      A.box('dugoutBase', d[0] + 1.0, d[0] + 3.4, 0, 0.5, d[1] - 4, d[1] + 4);
      for (let s = 0; s < 6; s++) {                                                 // curved see-through shell
        const t0 = (s / 6) * Math.PI / 2, t1 = ((s + 1) / 6) * Math.PI / 2;
        const xa = d[0] + 1.0 + 2.4 * Math.sin(t0), ya = 0.5 + 2.0 * Math.cos(t0), xb = d[0] + 1.0 + 2.4 * Math.sin(t1), yb = 0.5 + 2.0 * Math.cos(t1);
        A.quad('dugout', [xa, ya, d[1] - 4], [xa, ya, d[1] + 4], [xb, yb, d[1] + 4], [xb, yb, d[1] - 4]);
      }
    }
    for (const k of [1, 5, 6, 9, 10, 13]) {
      const d = lerp(Fr[k], Fr[k + 1], 0.5);
      A.box('bench', d[0] + 2.0, d[0] + 2.6, 0, 0.8, d[1] - 2.2, d[1] + 2.2);
    }
  }
  // white end walls of the stand
  for (const [f, bk] of [[Fr[0], Bk[0]], [Fr[Fr.length - 1], Bk[Bk.length - 1]]]) {
    A.quad('white', [f[0], 0, f[1]], [bk[0], 0, bk[1]], [bk[0], RB, bk[1]], [f[0], P + 1.2, f[1]]);
  }

  // ---- grass banks round the rest of the oval ----
  {
    const C = [-626, -256], rin = [47, 92], rout = [66, 105], H = 1.8, N = 64;
    const pt = (t, r, y) => [C[0] + r[0] * Math.cos(t), y, C[1] + r[1] * Math.sin(t)];
    const mid = [(rin[0] * 0.6 + rout[0] * 0.4), (rin[1] * 0.6 + rout[1] * 0.4)];
    for (let i = 0; i < N; i++) {
      const t0 = (i / N) * Math.PI * 2, t1 = ((i + 1) / N) * Math.PI * 2;
      const tc = (t0 + t1) / 2;
      if (Math.cos(tc) < -0.72) continue;                                       // grandstand side
      const gate = Math.abs(Math.cos(tc)) < 0.08;                               // north and south gates
      const h = gate ? 0.3 : H, m = i % 4 === 0 && !gate ? 'path' : 'grass';
      A.quad(m, pt(t1, rin, 0.2), pt(t0, rin, 0.2), pt(t0, mid, h), pt(t1, mid, h));
      A.quad(m, pt(t1, mid, h), pt(t0, mid, h), pt(t0, rout, 0.05), pt(t1, rout, 0.05));
    }
  }
  // ---- floodlight towers ----
  for (const [x, z] of [[-701, -338], [-560, -330], [-704, -172], [-562, -180]]) {
    const H = 34;
    for (let s = 0; s < 6; s++) {
      const y0 = (s / 6) * H, y1 = ((s + 1) / 6) * H, w = 1.3 - s * 0.16;
      for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) A.box('mast', x + sx * w - 0.1, x + sx * w + 0.1, y0, y1, z + sz * w - 0.1, z + sz * w + 0.1);
      A.box('mast', x - w, x + w, y1 - 0.08, y1, z - w, z + w);
    }
    const dx = -626 - x, dz = -256 - z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, px = -uz, pz = ux;
    const hc = [x + ux * 0.8, z + uz * 0.8];
    A.quad('lamp', [hc[0] - px * 2.5, H, hc[1] - pz * 2.5], [hc[0] + px * 2.5, H, hc[1] + pz * 2.5], [hc[0] + px * 2.5, H + 3.2, hc[1] + pz * 2.5], [hc[0] - px * 2.5, H + 3.2, hc[1] - pz * 2.5]);
    A.box('mast', x - 2.6, x + 2.6, H - 0.2, H, z - 2.6, z + 2.6);
  }
  // ---- scoreboard on the north bank ----
  A.box('frameW', -637, -619, 0, 7.5, -353.5, -352.6);
  A.box('board', -635.6, -620.4, 4.0, 7.0, -352.6, -352.5);
  for (const x of [-636, -620]) A.box('frameW', x - 0.4, x + 0.4, 0, 8.2, -353.5, -352.6);

  // ===== materials & meshes =====
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    podium: std({ color: '#d9d5cc' }),
    orange: std({ color: '#6f87a6', side: THREE.DoubleSide }),
    win: std({ color: '#3f4a52', roughness: 0.4, side: THREE.DoubleSide }),
    rail: std({ color: '#3f6fb0', roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }),
    railW: std({ color: '#f1f1ee', roughness: 0.6, transparent: true, opacity: 0.8 }),
    railBlue: std({ color: '#3f6fb0', roughness: 0.5, metalness: 0.3 }),
    ac: std({ color: '#ecebe7' }), white: std({ color: '#efeeea', side: THREE.DoubleSide }),
    fascia: std({ color: '#2f5fae', roughness: 0.6, side: THREE.DoubleSide }), walk: std({ color: '#b9b5ad', side: THREE.DoubleSide }),
    dugout: std({ color: '#3fae8a', roughness: 0.3, transparent: true, opacity: 0.6, side: THREE.DoubleSide }), dugoutBase: std({ color: '#cfcbc2' }),
    bench: std({ color: '#d4473a' }),
    seat: std({ color: '#2f63b8', side: THREE.DoubleSide }),
    seatDark: std({ color: '#2a56a0', side: THREE.DoubleSide }),
    step: std({ color: '#bdb7ad', side: THREE.DoubleSide }),
    riser: std({ color: '#244f96', side: THREE.DoubleSide }),
    seatLetter: std({ color: '#ef8a2c', side: THREE.DoubleSide }),
    concrete: std({ color: '#d7d3cb', side: THREE.DoubleSide }),
    rearWall: std({ color: '#cfcbc2', side: THREE.DoubleSide }),
    roof: std({ color: '#e8e6e0', roughness: 0.7, side: THREE.DoubleSide }),
    soffit: std({ color: '#5d6266', side: THREE.DoubleSide }),
    solar: std({ color: '#2a3550', roughness: 0.35, metalness: 0.3, side: THREE.DoubleSide }),
    beam: std({ color: '#c3c0b9', roughness: 0.75 }),
    grass: std({ color: '#5f8c46', roughness: 1, side: THREE.DoubleSide }),
    path: std({ color: '#cbb9a0', roughness: 1, side: THREE.DoubleSide }),
    mast: std({ color: '#d8dadc', roughness: 0.4, metalness: 0.6 }),
    lamp: std({ color: '#f5f3e8', emissive: new THREE.Color('#fff6d8'), emissiveIntensity: 0.15, side: THREE.DoubleSide }),
    frameW: std({ color: '#f2f2f0' }),
    board: std({ color: '#1d1f22', emissive: new THREE.Color('#c0392b'), emissiveIntensity: 0.25 }),
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
  return { meshes: [...meshes, ...extra], top: 37 };
}
