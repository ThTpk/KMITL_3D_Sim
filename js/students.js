// Students walking about the campus: men and women in the university uniform (white shirt, black trousers or a
// black skirt; some men in a navy / maroon / green faculty workshop shirt), alone or in groups of two or three.
// They keep to the footways, pedestrian paths and steps inside the campus fence (never the roads), and they walk
// and hang about under the buildings that have an open ground floor. Low-poly figures built from instanced
// boxes; legs and arms swing with the stride.
import * as THREE from 'three';
import { ROAD_Y, rng, pointInRing } from './builders.js';
import { Path, lift } from './traffic.js';

const WALK_KINDS = new Set(['footway', 'pedestrian', 'path', 'steps']);
// footprints that do not block a footway: roofs over car parks / walkways, the sky walk, bridges
const NOT_BLOCKING = new Set(['roof', 'carport', 'bridge']);

// ---------- open ground floors (world x/z, floor height y), traced from the building models ----------
// open: a polyline walked back and forth; loop: a closed ring walked round. `rot` = [pivot, angle] for models
// that are built square and then turned to the OSM outline (thep.js, e12.js).
const rect = (x0, x1, z0, z1, d) => [[x0 + d, z0 + d], [x1 - d, z0 + d], [x1 - d, z1 - d], [x0 + d, z1 - d], [x0 + d, z0 + d]];
const THEP = [[-121, -226.5], Math.atan2(-1.62, 115.2)];
const E12 = [[-603.2, 49.3], Math.atan2(-2.97, 93.02)];
const ZONES = [
  { n: 'IT', loop: rect(302, 368, -366, -320, 1.7), y: 0, walk: 5, idle: 2 },          // it.js: core 3 m in
  { n: 'IT canteen', loop: rect(427, 463, -383, -347, 1.3), y: 0, walk: 4, idle: 3 },  // itcan.js: shops 2.5 m in
  { n: 'Architecture N', loop: rect(-265, -168, 210, 229, 1.3), y: 0, walk: 5, idle: 2 },
  { n: 'Architecture S', loop: rect(-265, -168, 259, 280, 1.3), y: 0, walk: 5, idle: 2 },
  { n: 'New lab W', loop: rect(188, 245, -150, -122, 1.8), y: 0, walk: 4, idle: 1 },
  { n: 'New lab E', loop: rect(213, 251, -122, -102, 1.8), y: 0, walk: 3, idle: 1 },
  { n: 'SIIE', open: [[-345, 159.6], [-257, 159.6]], y: 0.6, walk: 4, idle: 2 },        // siie.js: 6 m deep, on a plinth
  { n: 'Thep north', open: [[-139.5, -238.7], [-114, -238.7]], y: 0, walk: 2, idle: 1, rot: THEP },
  { n: 'Thep entrance', open: [[-130, -223], [-118.5, -223]], y: 0, walk: 1, idle: 1, rot: THEP },
  { n: 'E12 undercroft', open: [[-641, 81.5], [-585, 81.5], [-585, 62]], y: 1.0, walk: 5, idle: 3, rot: E12 },
  { n: 'B theatre', open: [[-291, 63.5], [-273.5, 63.5]], y: 1.9, walk: 2, idle: 1 },  // bbld.js: on the podium
];
const turn = (pts, rot) => {
  if (!rot) return pts;
  const [[px, pz], a] = rot, c = Math.cos(a), s = Math.sin(a);
  return pts.map(([x, z]) => [px + (x - px) * c - (z - pz) * s, pz + (x - px) * s + (z - pz) * c]);
};

// ---------- figures ----------
const SKIN = ['#e8bf9a', '#d9a77f', '#c98f66', '#f0cba8', '#b97c55'];
const HAIR = ['#141110', '#1d1612', '#2b1d14', '#3a2718', '#141110'];
const BAGS = ['#1f2a44', '#2d2d2f', '#6b2b2b', '#3d5a3a', '#7a6a55', '#3a5f8f', '#c9c3b6'];
const SHOP = ['#1f2f52', '#5a1f27', '#28452e', '#2a2f38'];   // faculty workshop shirts (เสื้อช็อป)
// part: [colour, pivotX, pivotY, centreY (from the pivot), centreZ, w, h, d, swing]
// swing: 1 / -1 = left / right leg, 2 / -2 = left / right arm, 0 = rigid with the body
// shirt / skirt: optional colours; a skirt colour gives anyone an ankle-length skirt (Thai dress, a gown)
export function figure(R, female, shirtOverride, skirt) {
  const k = (female ? 0.94 : 1) * (0.95 + R() * 0.1);
  const skin = SKIN[Math.floor(R() * SKIN.length)], hair = HAIR[Math.floor(R() * HAIR.length)];
  const shirt = shirtOverride ?? (!female && R() < 0.18 ? SHOP[Math.floor(R() * SHOP.length)] : '#f4f4f1');
  const black = '#1b1c1f', shoe = R() < 0.2 ? '#e9e9e6' : '#141416';
  const P = [];
  const hip = 0.86, leg = 0.8, sh = 1.38;
  for (const s of [1, -1]) {
    const x = 0.1 * s;
    P.push([female ? skin : black, x, hip, -leg / 2, 0, female ? 0.12 : 0.15, leg, female ? 0.13 : 0.17, s]);
    P.push([shoe, x, hip, -leg - 0.02, 0.04, 0.12, 0.07, 0.26, s]);
  }
  if (skirt) P.push([skirt, 0, 0, 0.5, 0, 0.36, 0.84, 0.26, 0]);                     // ankle-length skirt
  else if (female) P.push([R() < 0.8 ? black : '#1e2740', 0, 0, 0.66, 0, 0.37, 0.48, 0.25, 0]);  // skirt to the knee
  else P.push([black, 0, 0, 0.86, 0, 0.36, 0.12, 0.2, 0]);                                    // trousers at the waist
  P.push([shirt, 0, 0, 1.15, 0, female ? 0.33 : 0.38, 0.5, female ? 0.19 : 0.21, 0]);       // shirt / blouse
  for (const s of [1, -1]) {
    const x = (female ? 0.205 : 0.235) * s;
    P.push([shirt, x, sh, -0.12, 0, 0.11, 0.25, 0.12, 2 * s]);                              // short sleeve
    P.push([skin, x, sh, -0.42, 0, 0.08, 0.36, 0.09, 2 * s]);                               // forearm and hand
  }
  P.push([skin, 0, 0, 1.55, 0, 0.19, 0.22, 0.21, 0]);                                        // head
  P.push([hair, 0, 0, 1.665, -0.01, 0.21, 0.07, 0.23, 0]);                                   // hair on top
  if (female && R() < 0.7) P.push([hair, 0, 0, 1.43, -0.1, 0.21, 0.32, 0.06, 0]);           // long hair down the back
  else P.push([hair, 0, 0, 1.58, -0.1, 0.2, 0.15, 0.05, 0]);
  const bag = R();
  if (bag < 0.55) P.push([BAGS[Math.floor(R() * BAGS.length)], 0, 0, 1.13, -0.17, 0.3, 0.38, 0.12, 0]);   // backpack
  else if (bag < 0.75) P.push([BAGS[Math.floor(R() * BAGS.length)], 0.22, 0, 0.98, 0, 0.07, 0.3, 0.26, 0]); // shoulder bag
  return P.map(([c, px, py, cy, cz, w, h, d, sw]) => [new THREE.Color(c), px * k, py * k, cy * k, cz * k, w * k, h * k, d * k, sw]);
}

// ---------- walkable network ----------
function buildNetwork(data) {
  const campus = data.campus.map((c) => c.o);
  const inCampus = (x, z) => campus.some((o) => pointInRing(x, z, o));
  const blocks = data.buildings.filter((b) => !NOT_BLOCKING.has(b.bt) && b.o).map((b) => {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const [x, z] of b.o) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    return { o: b.o, x0, x1, z0, z1 };
  });
  const blocked = (x, z) => !inCampus(x, z) || blocks.some((b) => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && pointInRing(x, z, b.o));
  const pieces = [];
  for (const r of data.roads) {
    if (!WALK_KINDS.has(r.k) || r.p.length < 2 || r.tu) continue;
    const pts = lift(r, ROAD_Y[r.k] ?? 0.15, 0.01);
    // resample every ~2 m and cut the way wherever it runs into a building or leaves the campus
    let run = [];
    const flush = () => { if (run.length > 1) { const p = new Path(run); if (p.L > 8) pieces.push({ path: p, w: Math.max(1.6, r.w || 2) }); } run = []; };
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / 2));
      for (let j = i === 1 ? 0 : 1; j <= n; j++) {
        const t = j / n, q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
        if (blocked(q[0], q[2])) flush(); else run.push(q);
      }
    }
    flush();
  }
  // junctions: pieces whose ends meet
  const key = (p) => Math.round(p[0] / 2) + ',' + Math.round(p[2] / 2);
  const ends = new Map();
  pieces.forEach((pc, i) => {
    for (const atStart of [true, false]) {
      const k = key(atStart ? pc.path.p[0] : pc.path.p[pc.path.p.length - 1]);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push([i, atStart]);
    }
  });
  pieces.forEach((pc) => {
    pc.next = [key(pc.path.p[0]), key(pc.path.p[pc.path.p.length - 1])].map((k) => ends.get(k) || []);
  });
  return pieces;
}

// ---------- public ----------
export function buildStudents(data) {
  const R = rng(2468);
  const pieces = buildNetwork(data);
  const zones = ZONES.map((z) => {
    const pts = turn(z.loop || z.open, z.rot).map(([x, zz]) => [x, z.y + 0.01, zz]);
    return { ...z, path: new Path(pts), closed: !!z.loop };
  });

  // agents move along a path; each carries 1–3 students side by side
  const agents = [];
  const groupSize = () => { const r = R(); return r < 0.5 ? 1 : r < 0.85 ? 2 : 3; };
  const total = pieces.reduce((a, p) => a + p.path.L, 0);
  const nNet = Math.round(total / 16);
  for (let i = 0; i < nNet && pieces.length; i++) {
    // pick a piece weighted by length
    let t = R() * total, pi = 0;
    while (pi < pieces.length - 1 && (t -= pieces[pi].path.L) > 0) pi++;
    const pc = pieces[pi];
    agents.push({ piece: pi, path: pc.path, s: R() * pc.path.L, dir: R() < 0.5 ? 1 : -1, v: 1.05 + R() * 0.45, n: groupSize(), side: (R() - 0.5) * 0.5, pause: 0 });
  }
  for (const z of zones) {
    for (let i = 0; i < z.walk; i++) agents.push({ zone: z, path: z.path, s: R() * z.path.L, dir: R() < 0.5 ? 1 : -1, v: 0.9 + R() * 0.4, n: groupSize(), side: (R() - 0.5) * 0.6, pause: R() * 4 });
    for (let i = 0; i < z.idle; i++) agents.push({ zone: z, path: z.path, s: R() * z.path.L, dir: 1, v: 0, n: 2 + Math.floor(R() * 3), idle: true, side: 0, pause: 0 });
  }

  // figures
  const members = [];
  let parts = 0;
  for (const a of agents) {
    a.m = [];
    for (let j = 0; j < a.n; j++) {
      const female = R() < 0.5, P = figure(R, female);
      // walking groups: side by side across the path; idle groups: a ring facing inwards
      const lat = a.idle ? Math.cos((j / a.n) * Math.PI * 2) * 0.55 : (j - (a.n - 1) / 2) * 0.62;
      const back = a.idle ? Math.sin((j / a.n) * Math.PI * 2) * 0.55 : (R() - 0.5) * 0.35;
      const m = { P, lat, back, phase: R() * Math.PI * 2, i0: parts, face: a.idle ? Math.atan2(-lat, back) : 0 };
      parts += P.length;
      a.m.push(m); members.push(m);
    }
  }

  const mat = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0 });
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, Math.max(1, parts));
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  for (const m of members) m.P.forEach((p, k) => mesh.setColorAt(m.i0 + k, p[0]));

  const base = new THREE.Matrix4(), Mp = new THREE.Matrix4(), M = new THREE.Matrix4(), S = new THREE.Vector3();
  const A = {}, B = {};
  const placeMember = (m, x, y, z, yaw, swing) => {
    base.makeRotationY(yaw).setPosition(x, y, z);
    for (let k = 0; k < m.P.length; k++) {
      const [, px, py, cy, cz, w, h, d, sw] = m.P[k];
      const ang = sw === 0 ? 0 : (Math.abs(sw) === 1 ? 0.42 : -0.36) * Math.sign(sw) * swing;
      const c = Math.cos(ang), s = Math.sin(ang);
      Mp.makeRotationX(ang).scale(S.set(w, h, d)).setPosition(px, py + cy * c - cz * s, cy * s + cz * c);
      mesh.setMatrixAt(m.i0 + k, M.multiplyMatrices(base, Mp));
    }
  };

  const advance = (a, dt) => {
    if (a.idle) return;
    if (a.pause > 0) { a.pause -= dt; return; }
    const L = a.path.L;
    a.s += a.dir * a.v * dt;
    if (a.zone) {
      if (a.zone.closed) a.s = ((a.s % L) + L) % L;
      else if (a.s < 0 || a.s > L) { a.s = Math.max(0, Math.min(L, a.s)); a.dir = -a.dir; a.pause = 2 + Math.random() * 6; }
      return;
    }
    if (a.s >= 0 && a.s <= L) return;
    // end of a piece: carry on along a connected one, or turn round at a dead end
    const atEnd = a.s > L, pc = pieces[a.piece];
    const opts = pc.next[atEnd ? 1 : 0].filter(([i]) => i !== a.piece);
    if (opts.length) {
      const [i, st] = opts[Math.floor(Math.random() * opts.length)];
      a.piece = i; a.path = pieces[i].path;
      a.dir = st ? 1 : -1; a.s = st ? 0 : a.path.L;
    } else {
      a.dir = -a.dir; a.s = Math.max(0, Math.min(L, a.s));
      a.pause = Math.random() < 0.3 ? 1 + Math.random() * 3 : 0;
    }
  };

  const place = (a, dt) => {
    const moving = !a.idle && a.pause <= 0;
    // heading from two points 0.8 m apart so the figures turn smoothly at the bends
    a.path.at(a.s + a.dir * 0.8, A); a.path.at(a.s - a.dir * 0.8, B);
    let tx = A.x - B.x, tz = A.z - B.z;
    const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    const lx = tz, lz = -tx; // to the left of the direction of travel
    const cx = (A.x + B.x) / 2, cy = (A.y + B.y) / 2, cz = (A.z + B.z) / 2;
    const yaw = Math.atan2(tx, tz);
    for (const m of a.m) {
      const o = a.side + m.lat;
      const x = cx + lx * o - tx * m.back, z = cz + lz * o - tz * m.back;
      if (moving) m.phase += (a.v / 0.65) * Math.PI * dt; // one full stride (two steps) per 1.3 m
      const swing = moving ? Math.sin(m.phase) : 0;
      const bob = moving ? Math.abs(Math.cos(m.phase)) * 0.03 : 0;
      placeMember(m, x, cy + bob, z, a.idle ? yaw + m.face : yaw, swing);
    }
  };

  const update = (dt) => {
    dt = Math.min(dt, 0.1);
    for (const a of agents) { advance(a, dt); place(a, dt); }
    mesh.instanceMatrix.needsUpdate = true;
  };
  update(0);
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  const group = new THREE.Group();
  group.add(mesh);
  group.userData = { students: members.length, pieces: pieces.length, agents: agents.length };
  return { group, update, agents, pieces };
}
