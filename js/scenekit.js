// Pieces several event scenes share: glowing lights (one cloud of points), soft pools of light on the ground, a
// concert stage with a printed backdrop and moving beams, people ambling along paths, and a water-spray particle
// pool. Each takes the scene's group and adds to it.
import * as THREE from 'three';
import { Path } from './traffic.js';
import { textBoard } from './props.js';
import { STAD_OUTLINE } from './models/stad.js';

let GLOW = null;
export function glowTex() {
  if (GLOW) return GLOW;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  GLOW = new THREE.CanvasTexture(cv); GLOW.colorSpace = THREE.SRGBColorSpace;
  return GLOW;
}
const additive = (o = {}) => ({ map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, ...o });

// bulbs: [[x, y, z, colour], ...] → one Points object
export function lightCloud(group, bulbs, size = 1.6) {
  const pos = [], col = [], c = new THREE.Color();
  for (const [x, y, z, h] of bulbs) { pos.push(x, y, z); c.set(h); col.push(c.r, c.g, c.b); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size, vertexColors: true, sizeAttenuation: true, ...additive() }));
  group.add(p);
  return p;
}
// a string of bulbs along a polyline, sagging between posts every `span` metres
export function stringLights(bulbs, pts, y, colours, step = 0.7, span = 5) {
  const path = new Path(pts.map(([x, z]) => [x, y, z])), P = {};
  for (let s = 0; s < path.L; s += step) {
    path.at(s, P);
    bulbs.push([P.x, y - Math.abs(Math.sin((s / span) * Math.PI)) * 0.5, P.z, colours[Math.floor(s / step) % colours.length]]);
  }
}
const poolGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
export function groundGlow(group, x, z, r, color, opacity = 0.5, y = 0.3) {
  const m = new THREE.Mesh(poolGeo, new THREE.MeshBasicMaterial(additive({ color, opacity })));
  m.position.set(x, y, z); m.scale.set(r * 2, 1, r * 2); m.renderOrder = 2;
  group.add(m);
  return m;
}

// a stage: platform x0..x1 by depth d, its front edge at (cx, front z) facing `face` (+1 south, -1 north);
// a printed backdrop, a truss with moving coloured beams. Returns { beams, top, update(t) }.
export function stage(group, { cx, z: zf, w = 16, d = 6, h = 1.2, face = -1, title, sub, bg = '#1a1446', fg = '#ffe3a3' }) {
  const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, ...o });
  const g = new THREE.Group(); g.position.set(cx, 0, zf); g.rotation.y = face < 0 ? 0 : Math.PI; group.add(g);
  // local frame: front edge at z 0, the stage extends to +z (away from the audience), audience at -z
  const box = (bw, bh, bd, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  box(w, h, d, std('#2a2a30'), 0, h / 2, d / 2);
  box(w + 0.1, h - 0.1, 0.08, std('#a3242a'), 0, h / 2, -0.05);
  const back = textBoard([[title, 0.55, fg], [sub || '', 0.45, '#ffffff', 600]], bg, w, 5);
  back.position.set(0, h + 2.5, d - 0.2); back.rotation.y = Math.PI; g.add(back);
  const truss = std('#b9bcc2', { metalness: 0.6, roughness: 0.4 });
  for (const x of [-w / 2 - 0.3, w / 2 + 0.3]) for (const z of [0.2, d - 0.2]) box(0.35, 8, 0.35, truss, x, 4, z);
  for (const z of [0.2, d - 0.2]) box(w + 0.95, 0.35, 0.35, truss, 0, 8, z);
  const COL = ['#ff4fb0', '#40c8ff', '#ffd040', '#9a6bff', '#40ffb0', '#ff7040'], beams = [], bulbs = [];
  for (let i = 0; i < 6; i++) {
    const x = -w / 2 + 1.5 + i * ((w - 3) / 5);
    box(0.4, 0.4, 0.4, new THREE.MeshBasicMaterial({ color: COL[i] }), x, 7.6, 0.2);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 6.2, 20, 1, true).translate(0, -3.1, 0),
      new THREE.MeshBasicMaterial({ color: COL[i], transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    cone.position.set(x, 7.5, 0.2); g.add(cone);
    beams.push({ cone, ph: i * 1.1 });
  }
  for (let x = -w / 2; x <= w / 2; x += 0.6) bulbs.push([x, h + 5.1, d - 0.4, '#ffd27a']);
  lightCloud(g, bulbs, 1.5);
  groundGlow(g, 0, -4, w * 0.7, '#ff9ad0', 0.45);
  groundGlow(g, 0, d / 2, w * 0.55, '#ffd9a0', 0.55);
  // world position of a point in the stage frame (x along the front, z back from the front edge)
  const at = (x, z) => [cx + (face < 0 ? x : -x), zf + (face < 0 ? z : -z)];
  return { beams, top: h, at, yaw: face < 0 ? Math.PI : 0, update(t) { for (const b of beams) b.cone.rotation.set(Math.sin(t * 0.7 + b.ph) * 0.45, 0, Math.cos(t * 0.5 + b.ph) * 0.3); } };
}

// people ambling up and down paths ([[x, z], ...] each), stopping now and then and turning to one side
export class Amblers {
  constructor(paths, y = 0.25) { this.paths = paths.map((p) => new Path(p.map(([x, z]) => [x, y, z]))); this.list = []; this.y = y; }
  add(m, R, { path = null, width = 3, v = 0.8, arm = null } = {}) {
    const p = path ?? Math.floor(R() * this.paths.length);
    const a = { m, path: this.paths[p], s: R() * this.paths[p].L, dir: R() < 0.5 ? 1 : -1, v: v * (0.85 + R() * 0.3), pause: R() * 5, side: (R() - 0.5) * width, arm };
    this.list.push(a);
    return a;
  }
  update(crowd, dt) {
    const A = {}, B = {};
    for (const a of this.list) {
      if (a.pause > 0) a.pause -= dt;
      else {
        a.s += a.dir * a.v * dt;
        if (a.s < 0 || a.s > a.path.L) { a.dir = -a.dir; a.s = Math.max(0, Math.min(a.path.L, a.s)); }
        if (Math.random() < dt * 0.07) a.pause = 3 + Math.random() * 9;
      }
      const moving = a.pause <= 0;
      a.path.at(a.s + a.dir * 0.8, A); a.path.at(a.s - a.dir * 0.8, B);
      let tx = A.x - B.x, tz = A.z - B.z; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      const yaw = Math.atan2(tx, tz) + (moving ? 0 : a.side * a.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
      if (moving) a.m.phase += (a.v / 0.65) * Math.PI * dt;
      crowd.place(a.m, (A.x + B.x) / 2 + tz * a.side, this.y, (A.z + B.z) / 2 - tx * a.side, yaw, moving ? Math.sin(a.m.phase) : 0, a.arm);
    }
  }
}

// water spray: droplets launched from points, falling under gravity (Songkran); with gravity < 0 and a grey
// colour, smoke rising off a grill
export class Spray {
  constructor(group, n = 900, color = '#9fd8ff', { size = 0.35, gravity = 9.8, life = 1.6, opacity = 0.8 } = {}) {
    this.n = n; this.i = 0; this.g = gravity; this.maxLife = life;
    this.p = new Float32Array(n * 3).fill(-50); this.v = new Float32Array(n * 3); this.life = new Float32Array(n);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(this.p, 3));
    this.points = new THREE.Points(g, new THREE.PointsMaterial({ size, color, sizeAttenuation: true, ...additive({ opacity }) }));
    this.points.frustumCulled = false; group.add(this.points);
  }
  emit(x, y, z, dx, dz, speed = 7, spread = 0.25, up = 2) {
    const k = this.i++ % this.n, o = k * 3;
    this.p[o] = x; this.p[o + 1] = y; this.p[o + 2] = z;
    this.v[o] = dx * speed + (Math.random() - 0.5) * spread * speed; this.v[o + 1] = up + Math.random(); this.v[o + 2] = dz * speed + (Math.random() - 0.5) * spread * speed;
    this.life[k] = this.maxLife;
  }
  update(dt) {
    for (let k = 0; k < this.n; k++) {
      if (this.life[k] <= 0) continue;
      const o = k * 3;
      this.life[k] -= dt; this.v[o + 1] -= this.g * dt;
      this.p[o] += this.v[o] * dt; this.p[o + 1] += this.v[o + 1] * dt; this.p[o + 2] += this.v[o + 2] * dt;
      if (this.p[o + 1] < 0.2 || this.life[k] <= 0) { this.life[k] = 0; this.p[o + 1] = -50; }
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

// seats of the central stadium's west grandstand (stad.js: 15 bays x 8 columns, 16 rows, walkway on row 9):
// [{ x, y (a seated figure's feet), z, yaw (facing the pitch), col (0 = left from the pitch), row (0 = front) }]
export function grandstandSeats() {
  const O = STAD_OUTLINE, Fr = O.slice(1, 17), Bk = O.slice(18, 34).reverse();
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const ROWS = 16, WALK = 9, SUB = 8, SEAT0 = 4.0, SEAT1 = 11.5, COLS = (Fr.length - 1) * SUB, seats = [];
  for (let i = 0; i < Fr.length - 1; i++) {
    const s0 = lerp(Fr[i], Bk[i], 0.08), s1 = lerp(Fr[i + 1], Bk[i + 1], 0.08), t0 = lerp(Fr[i], Bk[i], 0.9), t1 = lerp(Fr[i + 1], Bk[i + 1], 0.9);
    const yaw = Math.atan2((Fr[i][0] + Fr[i + 1][0]) / 2 - (Bk[i][0] + Bk[i + 1][0]) / 2, (Fr[i][1] + Fr[i + 1][1]) / 2 - (Bk[i][1] + Bk[i + 1][1]) / 2);
    for (let k = 0; k < ROWS; k++) {
      if (k === WALK) continue;
      for (let c = 0; c < SUB; c++) {
        const p = lerp(lerp(s0, s1, (c + 0.5) / SUB), lerp(t0, t1, (c + 0.5) / SUB), (k + 0.55) / ROWS);
        seats.push({ x: p[0], y: SEAT0 + ((SEAT1 - SEAT0) * (k + 1)) / ROWS - 0.42, z: p[1], yaw, col: COLS - 1 - (i * SUB + c), row: k });
      }
    }
  }
  return seats;
}
