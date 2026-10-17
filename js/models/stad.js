// Hand-built model of สนามกีฬากลาง (KMITL central stadium): the west grandstand (OSM way 1138463206), with
// the grass banks, floodlight towers and scoreboard round the track (the track and pitch themselves are the
// OSM sport areas, drawn by builders.js). Surveyed 2026-10-17 from Google Maps satellite imagery (curved
// grandstand plan, solar panels on its roof, the banks and their radial stair paths, the gates) and a Google
// Street View pano on the west straight of the track (looking west at the grandstand, east across the pitch,
// north along the track). Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up.
//   grandstand: curved in plan, about 105 m long and 20 m deep; orange-painted podium with small windows and
//   AC units behind a white rail; raked red-brown seating; a cantilevered roof on raking beams over the back
//   columns, a press box under the roof in the middle, solar panels on the roof; a central VIP stand with a
//   green canopy and stairs, two blue dugouts at the track edge
//   banks: low grassed embankment round the rest of the oval
//   four lattice floodlight towers; a scoreboard on the north bank
import * as THREE from 'three';
import { Acc } from './ecc.js';

export const STAD_OUTLINE = [[-707.31, -306.01], [-687.71, -301.33], [-689.95, -294.13], [-690.69, -287.61], [-691.52, -281.38], [-692.32, -274.86], [-692.82, -268.52], [-693.14, -262.19], [-693.21, -255.6], [-693.17, -248.62], [-692.51, -242.32], [-691.95, -236.21], [-691.16, -229.56], [-690.28, -223.22], [-688.89, -216.95], [-687.28, -210.83], [-685.05, -203.59], [-701.73, -199.76], [-705.3, -198.94], [-707.45, -206.29], [-709.19, -213.77], [-710.62, -220.79], [-711.83, -228.0], [-712.65, -234.91], [-713.04, -242.25], [-713.41, -249.01], [-713.58, -256.26], [-713.58, -263.48], [-713.31, -270.71], [-712.86, -278.01], [-711.74, -285.04], [-710.42, -292.04], [-709.12, -298.87], [-707.31, -306.01]];

export function buildStad(owner) {
  const A = new Acc();
  const O = STAD_OUTLINE;
  const Fr = O.slice(1, 17);                                   // front arc, south -> north
  const Bk = O.slice(18, 34).reverse();                        // back arc, south -> north
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const P = 2.6, SEAT0 = 3.2, SEAT1 = 11.5, RB = 17.0, RF = 15.6, CANT = 7;   // podium, seat rake, roof back/front

  // ---- podium: orange wall with small windows, white rail ----
  A.prism('podium', O.slice(0, -1), 0, P);
  for (let i = 0; i < Fr.length - 1; i++) {
    const a = Fr[i], b = Fr[i + 1];
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = dz / L, nz = -dx / L;   // outward (east-ish)
    const off = (p, d, y) => [p[0] + nx * d, y, p[1] + nz * d];
    A.quad('orange', off(a, 0.02, 0.2), off(b, 0.02, 0.2), off(b, 0.02, P), off(a, 0.02, P));
    const m = lerp(a, b, 0.5), w = 0.6;
    const u = [dx / L, dz / L];
    A.quad('win', [m[0] - u[0] * w + nx * 0.04, 1.0, m[1] - u[1] * w + nz * 0.04], [m[0] + u[0] * w + nx * 0.04, 1.0, m[1] + u[1] * w + nz * 0.04],
      [m[0] + u[0] * w + nx * 0.04, 2.0, m[1] + u[1] * w + nz * 0.04], [m[0] - u[0] * w + nx * 0.04, 2.0, m[1] - u[1] * w + nz * 0.04]);
    A.quad('rail', off(a, 0.3, P), off(b, 0.3, P), off(b, 0.3, P + 1.0), off(a, 0.3, P + 1.0));
  }
  const SUB = 6, COLS = (Fr.length - 1) * SUB, ROWS = 12;
  // seat colours spelling "I ♥ KMITL" across the stand: white letters, a red heart (sampled from a canvas)
  const letter = (() => {
    const cv = document.createElement('canvas'); cv.width = COLS; cv.height = ROWS;
    const g = cv.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, COLS, ROWS);
    g.fillStyle = '#fff'; g.font = 'bold 9px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    [['I', 0.08], ['K', 0.38], ['M', 0.53], ['I', 0.665], ['T', 0.77], ['L', 0.88]].forEach(([ch, x]) => g.fillText(ch, x * COLS, ROWS * 0.45));
    const hx = 0.215 * COLS, hy = ROWS * 0.36, r = 2.3;                        // heart: two lobes and a point
    g.fillStyle = '#f00'; g.beginPath();
    g.arc(hx - r * 0.95, hy, r, 0, Math.PI * 2); g.arc(hx + r * 0.95, hy, r, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(hx - r * 2.05, hy + 0.4); g.lineTo(hx + r * 2.05, hy + 0.4); g.lineTo(hx, hy + r * 2.5); g.closePath(); g.fill();
    const d = g.getImageData(0, 0, COLS, ROWS).data;
    return (x, y) => {
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return null;
      const i = (y * COLS + x) * 4, R = d[i], G = d[i + 1];
      return R > 110 && G > 110 ? 'seatWhite' : R > 110 ? 'seatHeart' : null;
    };
  })();
  // ---- seating rake, rear wall, columns, cantilevered roof on raking beams ----
  for (let i = 0; i < Fr.length - 1; i++) {
    const f0 = Fr[i], f1 = Fr[i + 1], b0 = Bk[i], b1 = Bk[i + 1];
    const s0 = lerp(f0, b0, 0.08), s1 = lerp(f1, b1, 0.08), t0 = lerp(f0, b0, 0.9), t1 = lerp(f1, b1, 0.9);
    // stepped seat rows as a sawtooth of 12 risers; each bay split into SUB columns so white seats can spell
    // "I ♥ KMITL" across the stand, read from the pitch (photos of the stand from the field)
    const N = 12;
    for (let k = 0; k < N; k++) {
      const u0 = k / N, u1 = (k + 1) / N, y0 = SEAT0 + (SEAT1 - SEAT0) * u0, y1 = SEAT0 + (SEAT1 - SEAT0) * u1;
      for (let c = 0; c < SUB; c++) {
        const v0 = c / SUB, v1 = (c + 1) / SUB;
        const p0 = lerp(lerp(s0, s1, v0), lerp(t0, t1, v0), u0), p1 = lerp(lerp(s0, s1, v1), lerp(t0, t1, v1), u0);
        const q0 = lerp(lerp(s0, s1, v0), lerp(t0, t1, v0), u1), q1 = lerp(lerp(s0, s1, v1), lerp(t0, t1, v1), u1);
        const paint = letter(COLS - 1 - (i * SUB + c), N - 1 - k);   // Fr runs north -> south, i.e. right -> left from the pitch
        const m = paint || (k % 3 === 2 ? 'seatDark' : 'seat');
        A.quad(paint || 'riser', [p1[0], y0, p1[1]], [p0[0], y0, p0[1]], [p0[0], y1, p0[1]], [p1[0], y1, p1[1]]);   // riser (seat backs)
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
    A.quad('roof', [e0[0], RF - 0.3, e0[1]], [e1[0], RF - 0.3, e1[1]], [e1[0], RF, e1[1]], [e0[0], RF, e0[1]]);
    // solar panels on the roof
    const sp = (u) => [lerp(b0, e0, u), lerp(b1, e1, u)];
    const [p0, p1] = sp(0.12), [q0, q1] = sp(0.8);
    const yy = (u) => RB + (RF - RB) * u + 0.15;
    A.quad('solar', [p0[0], yy(0.12), p0[1]], [q0[0], yy(0.8), q0[1]], [q1[0], yy(0.8), q1[1]], [p1[0], yy(0.12), p1[1]]);
    // column at the back of every other bay, raking beam over the roof
    if (i % 2 === 0) {
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
  // VIP stand with a green canopy, stairs; blue dugouts at the track edge
  {
    const m = lerp(Fr[7], Fr[8], 0.5);
    A.box('green', m[0] - 1, m[0] + 3, 4.6, 5.0, m[1] - 6, m[1] + 6);
    for (const dz of [-5.6, 5.6]) A.box('beam', m[0] + 2.6, m[0] + 2.9, 0, 4.6, m[1] + dz - 0.15, m[1] + dz + 0.15);
    for (let s = 0; s < 6; s++) A.box('step', m[0] + 0.3 + s * 0.45, m[0] + 0.75 + s * 0.45, 0, P - s * 0.4, m[1] - 3, m[1] + 3);
    for (const k of [4, 11]) {
      const d = lerp(Fr[k], Fr[k + 1], 0.5);
      A.box('blue', d[0] + 1.0, d[0] + 3.4, 0, 2.2, d[1] - 3, d[1] + 3);
    }
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
    orange: std({ color: '#e07a3c', side: THREE.DoubleSide }),
    win: std({ color: '#3f4a52', roughness: 0.4, side: THREE.DoubleSide }),
    rail: std({ color: '#f1f1ee', roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }),
    seat: std({ color: '#9b4436', side: THREE.DoubleSide }),
    seatDark: std({ color: '#6d3a32', side: THREE.DoubleSide }),
    step: std({ color: '#bdb7ad', side: THREE.DoubleSide }),
    riser: std({ color: '#8a3b30', side: THREE.DoubleSide }),
    seatWhite: std({ color: '#ecebe6', side: THREE.DoubleSide }),
    seatHeart: std({ color: '#ec2f38', emissive: new THREE.Color('#5a0a0e'), side: THREE.DoubleSide }),
    concrete: std({ color: '#d7d3cb', side: THREE.DoubleSide }),
    rearWall: std({ color: '#cfcbc2', side: THREE.DoubleSide }),
    roof: std({ color: '#e8e6e0', roughness: 0.7, side: THREE.DoubleSide }),
    soffit: std({ color: '#c9c6bf', side: THREE.DoubleSide }),
    solar: std({ color: '#2a3550', roughness: 0.35, metalness: 0.3, side: THREE.DoubleSide }),
    beam: std({ color: '#e2e0da', roughness: 0.7 }),
    green: std({ color: '#2e9a5c', roughness: 0.6 }),
    blue: std({ color: '#3c63b4', roughness: 0.5 }),
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
  return { meshes, top: 37 };
}
