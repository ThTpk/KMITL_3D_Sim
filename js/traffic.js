// Moving decoration: SRT trains on the Eastern Line (stopping at Phra Chom Klao station, next to the
// campus), freight trains on the ICD Lat Krabang branch, and cars / pickups / buses / motorbikes on the
// roads. Everything is instanced boxes driven along the OSM polylines; vehicles keep to the LEFT (Thailand).
import * as THREE from 'three';
import { elevationFn, ROAD_Y, rng } from './builders.js';

// ---------- polyline with arc-length sampling ----------
export class Path {
  constructor(pts) { // pts: [[x, y, z], ...]
    this.p = pts;
    this.cum = [0];
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]));
    this.L = this.cum[this.cum.length - 1];
  }
  // position + horizontal unit tangent at arc length s (clamped)
  at(s, out) {
    const c = this.cum, n = c.length;
    s = Math.max(0, Math.min(this.L, s));
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= s) lo = m; else hi = m; }
    const a = this.p[lo], b = this.p[hi], seg = c[hi] - c[lo] || 1, t = (s - c[lo]) / seg;
    out.x = a[0] + (b[0] - a[0]) * t; out.y = a[1] + (b[1] - a[1]) * t; out.z = a[2] + (b[2] - a[2]) * t;
    out.tx = (b[0] - a[0]) / seg; out.tz = (b[2] - a[2]) / seg;
    return out;
  }
  nearest(x, z) {
    let best = Infinity, bs = 0;
    for (let i = 1; i < this.p.length; i++) {
      const a = this.p[i - 1], b = this.p[i], dx = b[0] - a[0], dz = b[2] - a[2], l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[2]) * dz) / l2));
      const d = Math.hypot(a[0] + dx * t - x, a[2] + dz * t - z);
      if (d < best) { best = d; bs = this.cum[i - 1] + t * Math.sqrt(l2); }
    }
    return { s: bs, d: best };
  }
}

const lenOf = (p) => { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; };
// 3D points following the same elevation (bridges / ramps) as the drawn road or track
export function lift(way, base, extra) {
  const L = lenOf(way.p), yf = elevationFn(way, L, base);
  let acc = 0;
  return way.p.map((q, i) => { if (i) acc += Math.hypot(q[0] - way.p[i - 1][0], q[1] - way.p[i - 1][1]); return [q[0], yf(acc, L) + extra, q[1]]; });
}

// Join track pieces that meet end-to-end (same line, no sharp turn) into long runs
function chainRails(rails) {
  const segs = rails.map((r) => ({ r, pts: lift(r, 0.3, 0.2), used: false, L: lenOf(r.p) }));
  const dirAt = (pts, end) => {
    const n = pts.length, a = end ? pts[n - 2] : pts[1], b = end ? pts[n - 1] : pts[0];
    const l = Math.hypot(b[0] - a[0], b[2] - a[2]) || 1;
    return [(b[0] - a[0]) / l, (b[2] - a[2]) / l]; // pointing outward from the piece
  };
  const near = (p, q) => Math.hypot(p[0] - q[0], p[2] - q[2]) < 2;
  const chains = [];
  for (const seed of [...segs].sort((a, b) => b.L - a.L)) {
    if (seed.used) continue;
    seed.used = true;
    let pts = seed.pts.slice();
    for (const atEnd of [true, false]) {
      for (;;) {
        const tip = atEnd ? pts[pts.length - 1] : pts[0];
        const out = dirAt(pts, atEnd);
        let pick = null;
        for (const s of segs) {
          if (s.used || s.r.n !== seed.r.n) continue;
          for (const rev of [false, true]) {
            const q = rev ? s.pts.slice().reverse() : s.pts;
            if (!near(q[0], tip)) continue;
            const d = dirAt(q, false); // outward at its start = -travel direction
            if (-(d[0] * out[0] + d[1] * out[1]) > 0.85) pick = { s, q };
          }
          if (pick) break;
        }
        if (!pick) break;
        pick.s.used = true;
        // q starts at the joint; prepend it reversed (without the duplicate joint point)
        pts = atEnd ? pts.concat(pick.q.slice(1)) : pick.q.slice(1).reverse().concat(pts);
      }
    }
    const path = new Path(pts);
    if (path.L > 600) chains.push({ path, name: seed.r.n });
  }
  return chains;
}

// ---------- instanced box pools ----------
const unitBox = new THREE.BoxGeometry(1, 1, 1);
class Pool {
  constructor(material, count, { shadow = true, colors = true } = {}) {
    this.mesh = new THREE.InstancedMesh(unitBox, material, Math.max(1, count));
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.castShadow = shadow; this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
    if (colors) this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, count) * 3).fill(1), 3);
    this.n = 0;
  }
  add(color) { const i = this.n++; if (color) this.mesh.setColorAt(i, color); return i; }
}
const M = new THREE.Matrix4(), Mp = new THREE.Matrix4(), V = new THREE.Vector3(), V2 = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
// part = [pool, index, width, y0, y1, length, zCentre, xCentre]
function placeParts(parts, base) {
  for (const [pool, i, w, y0, y1, l, zc = 0, xc = 0] of parts) {
    Mp.makeScale(w, y1 - y0, l).setPosition(xc, (y0 + y1) / 2, zc);
    pool.mesh.setMatrixAt(i, M.multiplyMatrices(base, Mp));
  }
}
// world matrix whose +z points from `rear` to `front`
function frame(front, rear) {
  M.lookAt(V.set(front.x, front.y, front.z), V2.set(rear.x, rear.y, rear.z), UP);
  M.setPosition((front.x + rear.x) / 2, (front.y + rear.y) / 2, (front.z + rear.z) / 2);
  return M.clone();
}

const C = (h) => new THREE.Color(h);

// ---------- trains ----------
// SRT liveries: red-orange diesel locomotive, cream coaches with a red band; blue freight locos with containers
const LOCO = { len: 17, w: 2.8, h: 3.9, body: '#c9452c', band: '#efe6d3', roof: '#55595d', loco: true };
const COACH = { len: 20, w: 2.85, h: 3.75, body: '#e9e1cd', band: '#b5332b', roof: '#8b9094' };
const COACH_B = { len: 20, w: 2.85, h: 3.75, body: '#f1f1ee', band: '#2f5d9e', roof: '#8b9094' };
const FLOCO = { len: 18, w: 2.8, h: 3.9, body: '#2b5592', band: '#e9c43b', roof: '#4a4f54', loco: true };
const CONTAINERS = ['#b63b2e', '#2f6f9f', '#d18b22', '#3f7d4a', '#7a7f85', '#e7e3da', '#8f2f45'];

function buildTrains(data, pools) {
  const chains = chainRails(data.rails);
  const east = chains.filter((c) => c.name === 'ทางรถไฟสายตะวันออก').sort((a, b) => b.path.L - a.path.L);
  const icd = chains.filter((c) => c.name && c.name !== 'ทางรถไฟสายตะวันออก').sort((a, b) => b.path.L - a.path.L);
  const st = data.pois.find((p) => p.en === 'Phra Chom Klao');
  const R = rng(4242);
  const trains = [];
  const make = (chain, consist, opts) => {
    if (!chain) return;
    const cars = consist.map((spec, k) => {
      const parts = [];
      const body = C(spec.body), band = C(spec.band), roof = C(spec.roof);
      parts.push([pools.dark, pools.dark.add(), spec.w - 0.3, 0.45, 1.25, spec.len - 1.5]); // underframe + bogies
      if (spec.container) { // flat wagon with a 40 ft and a 20 ft box
        parts.push([pools.paint, pools.paint.add(body), spec.w, 1.15, 1.45, spec.len]);
        if (R() < 0.85) parts.push([pools.paint, pools.paint.add(C(CONTAINERS[Math.floor(R() * CONTAINERS.length)])), 2.45, 1.45, 4.05, 12.2, -3]);
        if (R() < 0.7) parts.push([pools.paint, pools.paint.add(C(CONTAINERS[Math.floor(R() * CONTAINERS.length)])), 2.45, 1.45, 4.05, 6.0, 6.2]);
        return { spec, parts };
      }
      parts.push([pools.paint, pools.paint.add(body), spec.w, 1.25, spec.h - 0.35, spec.len]);
      parts.push([pools.paint, pools.paint.add(roof), spec.w - 0.35, spec.h - 0.35, spec.h, spec.len - 0.6]);
      if (spec.loco) {
        parts.push([pools.paint, pools.paint.add(band), spec.w + 0.04, 1.5, 1.85, spec.len]);
        parts.push([pools.glass, pools.glass.add(), spec.w + 0.02, 2.55, 3.2, 1.6, spec.len / 2 - 0.9]); // cab windows (front)
        parts.push([pools.glass, pools.glass.add(), spec.w + 0.02, 2.55, 3.2, 1.6, -spec.len / 2 + 0.9]);
      } else {
        parts.push([pools.paint, pools.paint.add(band), spec.w + 0.04, 1.55, 1.95, spec.len - 0.4]);
        parts.push([pools.glass, pools.glass.add(), spec.w + 0.03, 2.15, 2.95, spec.len - 2.4]); // window band
      }
      return { spec, parts };
    });
    const length = consist.reduce((a, c) => a + c.len + 0.8, 0);
    const stopS = opts.stop && st ? (() => { const n = chain.path.nearest(st.p[0], st.p[1]); return n.d < 60 ? n.s : null; })() : null;
    trains.push({ path: chain.path, cars, length, s: opts.s0 ?? R() * chain.path.L, dir: opts.dir, v: opts.vmax, vmax: opts.vmax, stopS, dwell: 0, served: false, wait: 0 });
  };
  const commuter = (n, alt) => [LOCO, ...Array.from({ length: n }, (_, i) => (alt && i % 3 === 2 ? COACH_B : COACH))];
  const freight = (n) => [FLOCO, ...Array.from({ length: n }, () => ({ len: 19, w: 2.6, h: 1.5, body: '#4d4f52', band: '#4d4f52', roof: '#4d4f52', container: true }))];
  // three tracks of the Eastern Line: east- and westbound passenger trains and a freight on the third
  make(east[0], commuter(7, false), { dir: 1, vmax: 17, stop: true });
  make(east[1], commuter(6, true), { dir: -1, vmax: 17, stop: true });
  make(east[2] || east[0], freight(14), { dir: 1, vmax: 12, stop: false });
  if (icd[0]) make(icd[0], freight(12), { dir: -1, vmax: 9, stop: false });
  return trains;
}

const P1 = {}, P2 = {};
function updateTrain(t, dt) {
  const L = t.path.L;
  if (t.wait > 0) { // waiting beyond the end of the line, then come back the other way
    t.wait -= dt;
    if (t.wait <= 0) { t.dir = -t.dir; t.served = false; t.v = 0; }
  } else if (t.dwell > 0) {
    t.dwell -= dt;
    if (t.dwell <= 0) t.served = true;
  } else {
    let target = t.vmax;
    if (t.stopS != null && !t.served) {
      const stopFront = t.stopS + (t.dir * t.length) / 2; // train centred on the platform
      const d = (stopFront - t.s) * t.dir;
      if (d > 0) target = Math.min(target, Math.sqrt(2 * 0.55 * d) + 0.3);
      if (d <= 0.4 && d > -5) { t.dwell = 25; t.v = 0; }
    }
    t.v += Math.sign(target - t.v) * Math.min(Math.abs(target - t.v), (target > t.v ? 0.5 : 1.2) * dt);
    t.s += t.dir * t.v * dt;
    if ((t.dir > 0 && t.s - t.length > L + 40) || (t.dir < 0 && t.s + t.length < -40)) t.wait = 20 + Math.random() * 40;
  }
  // place each car between its two bogie points (follows curves and ramps)
  let off = 0;
  for (const car of t.cars) {
    const L2 = car.spec.len / 2 - 2.5;
    const sc = t.s - t.dir * (off + car.spec.len / 2);
    off += car.spec.len + 0.8;
    const hide = sc + 1 < 0 || sc - 1 > L;
    t.path.at(sc + t.dir * L2, P1); t.path.at(sc - t.dir * L2, P2);
    const base = frame(P1, P2);
    if (hide) base.makeScale(0, 0, 0);
    placeParts(car.parts, base);
  }
}

// ---------- road traffic ----------
const ROAD = { // vehicles per km (each direction together) and cruising speed (m/s)
  motorway: [20, 24], trunk: [14, 18], primary: [16, 13], secondary: [11, 11], tertiary: [8, 10],
  motorway_link: [6, 14], primary_link: [6, 9], secondary_link: [5, 8], tertiary_link: [5, 8],
  residential: [3, 7], unclassified: [3, 7], living_street: [2, 4], service: [1.4, 5],
};
const PAINT = [['#f4f4f2', 34], ['#c6c9cc', 18], ['#1f2226', 14], ['#7b8086', 10], ['#a3262a', 6], ['#2b4f86', 6], ['#8a6a48', 3], ['#e2549c', 3], ['#f2cf3a', 3], ['#5fa83a', 3]];
const pickPaint = (r) => { let t = r * 100; for (const [c, w] of PAINT) { if ((t -= w) <= 0) return c; } return PAINT[0][0]; };
// type: [weight, length, width, parts(builder)]
const TYPES = {
  sedan: { w: 0.36, len: 4.5, width: 1.75, parts: (W, L) => [['dark', W - 0.15, 0, 0.55, L - 0.9, 0], ['paint', W, 0.4, 1.0, L, 0], ['glass', W - 0.15, 1.0, 1.42, 2.3, -0.2], ['paint', W - 0.25, 1.42, 1.48, 2.0, -0.25]] },
  pickup: { w: 0.27, len: 5.2, width: 1.8, parts: (W, L) => [['dark', W - 0.15, 0, 0.6, L - 1.0, 0], ['paint', W, 0.45, 1.15, L, 0], ['glass', W - 0.12, 1.15, 1.62, 1.9, 0.55], ['paint', W - 0.2, 1.62, 1.68, 1.75, 0.55]] },
  van: { w: 0.14, len: 4.9, width: 1.85, parts: (W, L) => [['dark', W - 0.15, 0, 0.6, L - 1.0, 0], ['paint', W, 0.45, 1.25, L, 0], ['glass', W - 0.08, 1.25, 1.85, L - 0.8, -0.15], ['paint', W - 0.1, 1.85, 1.98, L - 0.6, -0.1]] },
  moto: { w: 0.15, len: 1.9, width: 0.6, parts: (W, L) => [['dark', 0.2, 0, 0.62, L - 0.1, 0], ['paint', 0.5, 0.5, 0.95, 1.4, 0], ['glass', 0.45, 0.95, 1.55, 0.5, -0.15], ['paint', 0.3, 1.55, 1.8, 0.32, -0.12]] },
  bus: { w: 0.04, len: 11, width: 2.5, big: true, parts: (W, L) => [['dark', W - 0.2, 0, 0.9, L - 1.5, 0], ['paint', W, 0.5, 1.4, L, 0], ['glass', W + 0.02, 1.4, 2.55, L - 0.6, 0], ['white', W, 2.55, 3.1, L, 0]] },
  truck: { w: 0.04, len: 9, width: 2.5, big: true, parts: (W, L) => [['dark', W - 0.2, 0, 0.95, L - 1.2, 0], ['paint', W, 0.6, 2.6, 2.2, L / 2 - 1.1], ['glass', W + 0.02, 1.85, 2.45, 0.6, L / 2 - 0.25], ['white', W, 0.95, 3.5, L - 2.6, -1.3]] },
};

function buildCars(data, pools) {
  const R = rng(777);
  const ways = [];
  data.roads.forEach((r) => {
    const cfg = ROAD[r.k];
    if (!cfg || r.p.length < 2) return;
    const path = new Path(lift(r, ROAD_Y[r.k] ?? 0.2, 0.02));
    if (path.L < 8) return;
    ways.push({ r, path, cfg, ow: !!r.ow, big: ['motorway', 'trunk', 'primary', 'secondary'].includes(r.k) });
  });
  // junctions: ways meeting at their end nodes
  const key = (p) => Math.round(p[0] / 1.5) + ',' + Math.round(p[2] / 1.5);
  const ends = new Map();
  ways.forEach((w, i) => {
    for (const atStart of [true, false]) {
      const k = key(atStart ? w.path.p[0] : w.path.p[w.path.p.length - 1]);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push([i, atStart]);
    }
  });
  const total = ways.reduce((a, w) => a + w.path.L * w.cfg[0] / 1000, 0);
  const scale = Math.min(1, 650 / total);
  const cars = [];
  for (let wi = 0; wi < ways.length; wi++) {
    const w = ways[wi];
    let n = w.path.L * w.cfg[0] / 1000 * scale;
    n = Math.floor(n) + (R() < n % 1 ? 1 : 0);
    for (let j = 0; j < n; j++) {
      let type = 'sedan', t = R(), acc = 0;
      for (const [k, T] of Object.entries(TYPES)) { acc += T.w; if (t <= acc) { type = k; break; } }
      if (TYPES[type].big && !w.big) type = 'pickup';
      const T = TYPES[type];
      const paint = C(type === 'bus' ? (R() < 0.5 ? '#c8352f' : '#2f62a8') : type === 'truck' ? (R() < 0.5 ? '#3b6db3' : '#e1e1dc') : pickPaint(R()));
      const parts = T.parts(T.width, T.len).map(([kind, pw, y0, y1, pl, zc]) => {
        const pool = kind === 'dark' ? pools.dark : kind === 'glass' ? pools.glass : pools.paint;
        const col = kind === 'paint' ? paint : kind === 'white' ? C('#efeee9') : null;
        return [pool, pool.add(col), pw, y0, y1, pl, zc];
      });
      parts.push([pools.head, pools.head.add(), T.width - 0.4, 0.6, 0.85, 0.08, T.len / 2 + 0.02]);
      parts.push([pools.tail, pools.tail.add(), T.width - 0.4, 0.65, 0.85, 0.08, -T.len / 2 - 0.02]);
      const dir = w.ow ? 1 : R() < 0.5 ? 1 : -1;
      const vmax = w.cfg[1] * (0.8 + R() * 0.35) * (type === 'bus' || type === 'truck' ? 0.85 : 1);
      cars.push({ w: wi, s: R() * w.path.L, dir, v: vmax, vmax, T, parts, lane: R() < 0.5 ? 0 : 1 });
    }
  }
  const F = {}, B = {};
  // lateral offset to the LEFT of the direction of travel (Thailand drives on the left)
  const lane = (car) => {
    const w = ways[car.w];
    if (w.ow) return w.r.w > 6 ? (car.lane - 0.5) * (w.r.w / 2) : 0;
    return w.r.w / 4;
  };
  const step = (car, dt) => {
    let w = ways[car.w];
    car.s += car.dir * car.v * dt;
    if (car.s < 0 || car.s > w.path.L) {
      const atEnd = car.s > w.path.L;
      const node = key(atEnd ? w.path.p[w.path.p.length - 1] : w.path.p[0]);
      const opts = (ends.get(node) || []).filter(([i, st]) => i !== car.w && (!ways[i].ow || st));
      if (opts.length) {
        const [i, st] = opts[Math.floor(Math.random() * opts.length)];
        car.w = i; w = ways[i];
        car.dir = st ? 1 : -1; car.s = st ? 0 : w.path.L;
        car.vmax = w.cfg[1] * (0.8 + Math.random() * 0.35);
      } else if (!w.ow) {
        car.dir = -car.dir; car.s = Math.max(0, Math.min(w.path.L, car.s)); // turn round at a dead end
      } else {
        car.w = Math.floor(Math.random() * ways.length); w = ways[car.w];
        car.dir = w.ow ? 1 : -1; car.s = car.dir > 0 ? 0 : w.path.L;
      }
    }
    car.v += (car.vmax - car.v) * Math.min(1, dt);
    const half = car.T.len / 2;
    w.path.at(car.s + car.dir * half, F); w.path.at(car.s - car.dir * half, B);
    const tx = F.x - B.x, tz = F.z - B.z, l = Math.hypot(tx, tz) || 1, o = lane(car);
    const ox = (tz / l) * o, oz = (-tx / l) * o; // left of travel = (tz, -tx)
    F.x += ox; F.z += oz; B.x += ox; B.z += oz;
    placeParts(car.parts, frame(F, B));
  };
  return { cars, step };
}

// ---------- public ----------
export function buildTraffic(data) {
  const paintMat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.25 });
  const glassMat = new THREE.MeshStandardMaterial({ color: '#2a3540', roughness: 0.2, metalness: 0.5, emissive: new THREE.Color('#ffd79a'), emissiveIntensity: 0 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#222426', roughness: 0.9 });
  const headMat = new THREE.MeshBasicMaterial({ color: '#fff6d5' });
  const tailMat = new THREE.MeshBasicMaterial({ color: '#ff3a2a' });
  const pools = {
    paint: new Pool(paintMat, 6000), glass: new Pool(glassMat, 2500, { colors: false }), dark: new Pool(darkMat, 2500, { colors: false }),
    head: new Pool(headMat, 900, { shadow: false, colors: false }), tail: new Pool(tailMat, 900, { shadow: false, colors: false }),
  };
  const trains = buildTrains(data, pools);
  const traffic = buildCars(data, pools);
  const group = new THREE.Group();
  for (const p of Object.values(pools)) { p.mesh.count = p.n; group.add(p.mesh); }
  pools.head.mesh.visible = pools.tail.mesh.visible = false;
  const update = (dt) => {
    dt = Math.min(dt, 0.1);
    for (const t of trains) updateTrain(t, dt);
    for (const c of traffic.cars) traffic.step(c, dt);
    for (const p of Object.values(pools)) p.mesh.instanceMatrix.needsUpdate = true;
  };
  const setNight = (f) => {
    glassMat.emissiveIntensity = f * 0.9;
    pools.head.mesh.visible = pools.tail.mesh.visible = f > 0.25;
  };
  update(0);
  group.userData = { trains: trains.length, cars: traffic.cars.length };
  return { group, update, setNight, trains, cars: traffic.cars };
}
