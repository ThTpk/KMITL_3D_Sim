// ลาดกระบังนิทรรศน์ / KMITL Innovation Expo (late Aug - early Sep with the institute's anniversary; see events.md):
// the campus-wide open house. The Chao Phya Surawongwaiwat (Worn Bunnag) Convention Hall holds the opening and
// the main booth hall, so its front gets a big banner and the car park south of it a gate and rows of faculty
// booth tents; school students and parents walk the aisles and go in and out of the hall; feather flags mark the
// open-house faculty buildings across the campus and two shuttle trams run from the hall to the Engineering side.
// Sources give the venue (the hall plus faculty buildings) and dates, not the outdoor layout; the tents are put on
// the car park aisles.
//
// x = east, z = south, y = up. Hall front steps x 116..166 at z 189..192.6; the road in front at z ~204; car park
// aisles at x 50, 71, 91, 111, 131 between the cross roads z 215 and 309 (OSM service roads).
import * as THREE from 'three';
import { rng } from './builders.js';
import { Path } from './traffic.js';
import { Crowd } from './crowd.js';
import { tent, textBoard, featherFlag } from './props.js';

const AISLES = [50, 71, 91, 111, 131], CROSS = [215, 309], FRONT_Z = 205.5, DOOR = [141, 191.5];
const FACULTY = [
  ['it', 'IT', '#2f6fb0'], ['kbs', 'KBS', '#1f3f7a'], ['e12', 'วิศวะ', '#8c1d1d'], ['archaud', 'สถาปัตย์', '#5a5a5a'], ['integ', 'สถาปัตย์', '#5a5a5a'],
  ['med', 'แพทย์', '#2e7d4f'], ['dent', 'ทันตะ', '#6a3f9e'], ['witt', 'วิทยาศาสตร์', '#c9a227'], ['agri', 'เกษตร', '#3f7a2c'], ['siie', 'SIIE', '#8c1d1d'],
  ['kosen', 'KOSEN', '#1f6f8b'], ['kmids', 'KMIDS', '#c0392b'], ['lib', 'KLLC', '#e8641e'],
];
const TENT_COL = ['#8c1d1d', '#2f6fb0', '#5a5a5a', '#2e7d4f', '#6a3f9e', '#c9a227', '#3f7a2c', '#1f6f8b', '#e8641e', '#1f3f7a'];
// shuttle: hall front → Chalong Krung Road → Soi Chalong Krung 1 west towards Engineering, and back
const TRAM_ROUTE = [[141, 207.5], [16, 207.5], [12, 160], [10, 83], [9.5, -12], [-171, -12], [-430, -4]];

export function buildExpo({ data, say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  function build() {
    const R = rng(6606);
    const crowd = new Crowd();
    const box = (w, h, d, mat, x, y, z, parent = group) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };

    // ===== hall banner under the front eave, gate over the car park entrance =====
    const banner = textBoard([['KMITL INNOVATION EXPO 2026', 0.55, '#ffffff'], ['ลาดกระบังนิทรรศน์ · Open House ทุกคณะ', 0.45, '#ffe0c2', 600]], '#e8641e', 42, 3.4);
    banner.position.set(141, 10.6, 190.6); group.add(banner);
    const orange = std('#e8641e');
    for (const x of [84.5, 97.5]) { box(1.1, 6, 1.1, orange, x, 3, 209.5); }
    const gate = textBoard([['KMITL EXPO', 0.6, '#ffffff'], ['ลาดกระบังนิทรรศน์', 0.4, '#ffe0c2', 600]], '#1f2a44', 14.2, 2.0, { double: true });
    gate.position.set(91, 6.2, 209.5); group.add(gate);
    const BALLOON = ['#e8641e', '#ffffff', '#f2c230', '#2f6fb0'];
    const ball = new THREE.SphereGeometry(0.35, 10, 8);
    for (const x of [84.5, 97.5]) for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(ball, std(BALLOON[i % 4], { roughness: 0.3 }));
      m.position.set(x + (Math.random() - 0.5) * 0.9, 6.3 + (i % 3) * 0.55, 209.5 + (Math.random() - 0.5) * 0.9); group.add(m);
    }

    // ===== booth tents along three aisles, and the staff in them =====
    const staff = [];
    for (const ax of [71, 91, 111]) {
      for (let z = 222; z <= 298; z += 6.5) {
        for (const side of [-1, 1]) {
          const col = TENT_COL[Math.floor(R() * TENT_COL.length)];
          const x = ax + side * 5.2, yaw = side > 0 ? -Math.PI / 2 : Math.PI / 2;     // open side to the aisle
          tent(group, x, z, yaw, { cloth: col });
          for (let i = 0; i < 5; i++) box(0.35, 0.15 + R() * 0.35, 0.3, std(['#ffffff', '#3f4a52', '#e8641e', '#2f6fb0'][i % 4]), x - side * 0.9, 0.85, z - 1 + i * 0.5);
          staff.push({ m: crowd.add(R, R() < 0.5, R() < 0.6 ? '#e8641e' : '#f4f4f1'), x: x + side * 0.4, z, yaw: side > 0 ? -Math.PI / 2 : Math.PI / 2 });
        }
      }
    }

    // ===== open-house feather flags at the faculty buildings (south side of each) =====
    for (const [model, label, col] of FACULTY) {
      const b = data.buildings.find((q) => q.model === model);
      if (!b) continue;
      let z1 = -Infinity, x0 = Infinity, x1 = -Infinity;
      for (const [x, z] of b.o) { z1 = Math.max(z1, z); x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
      for (const dx of [-4, 4]) featherFlag(group, Math.min(x1 - 2, Math.max(x0 + 2, b.c[0])) + dx, z1 + 3.5, 0, `OPEN HOUSE · ${label}`, col);
    }

    // ===== shuttle trams =====
    // out and back as one loop (keeping left, so the return runs on the other side of the road)
    const loop = TRAM_ROUTE.concat(TRAM_ROUTE.slice(0, -1).reverse());
    const route = new Path(loop.map(([x, z]) => [x, 0.2, z]));
    const trams = [0, 1].map((i) => {
      const cars = [0, 1, 2].map((k) => {
        const g = new THREE.Group(); group.add(g);
        if (k === 0) { box(1.6, 1.4, 2.4, std('#e8641e'), 0, 1.0, 0, g); box(1.5, 0.6, 1.0, std('#22303a', { roughness: 0.2 }), 0, 1.6, 0.5, g); }
        else {
          box(1.8, 0.5, 4.2, std('#f2f2ee'), 0, 0.65, 0, g);
          for (const sx of [-0.85, 0.85]) for (const sz of [-1.9, 1.9]) box(0.06, 1.6, 0.06, std('#cfd2d6'), sx, 1.7, sz, g);
          box(1.9, 0.12, 4.3, orange, 0, 2.55, 0, g);
          for (let r = 0; r < 3; r++) for (const sx of [-0.45, 0.45]) box(0.38, 0.55, 0.38, std(R() < 0.5 ? '#f4f4f1' : TENT_COL[Math.floor(R() * TENT_COL.length)]), sx, 1.2, -1.2 + r * 1.2, g);   // riders
        }
        return g;
      });
      return { cars, s: 20 + i * route.L * 0.5, wait: 0 };
    });

    // ===== visitors =====
    const visitors = [];
    for (let i = 0; i < 360; i++) {
      const female = R() < 0.55, r = R();
      const m = r < 0.55 ? crowd.add(R, female, '#f4f4f1') : crowd.add(R, female, TENT_COL[Math.floor(R() * TENT_COL.length)]);
      const ax = AISLES[Math.floor(R() * AISLES.length)], z = 218 + R() * 88;
      visitors.push({ m, x: ax + (R() - 0.5) * 2, z, way: [], inside: 0, lane: (R() - 0.5) * 2.2, v: 0.9 + R() * 0.4, pause: R() * 5, yaw: R() * 6.28 });
    }
    group.add(crowd.finish());
    built = { crowd, staff, visitors, trams, route };
  }

  // a walk along the aisles and cross roads to an aisle point or the hall door
  function plan(v) {
    const goIn = Math.random() < 0.25;
    const ax = AISLES[Math.floor(Math.random() * AISLES.length)], tz = 218 + Math.random() * 88;
    const curA = AISLES.reduce((a, x) => (Math.abs(x - v.x) < Math.abs(a - v.x) ? x : a));
    const way = [];
    if (goIn) {
      way.push([curA + v.lane * 0.4, FRONT_Z], [DOOR[0] + v.lane, FRONT_Z], [DOOR[0] + v.lane, DOOR[1]]);
    } else if (ax === curA) way.push([ax + v.lane, tz]);
    else {
      const cz = Math.abs(v.z - CROSS[0]) + Math.abs(tz - CROSS[0]) < Math.abs(v.z - CROSS[1]) + Math.abs(tz - CROSS[1]) ? CROSS[0] : CROSS[1];
      way.push([curA + v.lane, cz + v.lane * 0.5], [ax + v.lane, cz + v.lane * 0.5], [ax + v.lane, tz]);
    }
    v.way = way; v.goIn = goIn;
  }

  let t = 0, prevTime = null;
  function start() {
    if (!built) build();
    t = 0;
    for (const v of built.visitors) { v.way = []; v.inside = 0; }
    built.crowd.hideAll();
    prevTime = getTime(); setTime(10.5);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  const A = {}, Bp = {};
  function update(dt) {
    t += dt;
    const { crowd, staff, visitors, trams, route } = built;
    let inside = 0;
    for (const v of visitors) {
      if (v.inside > 0) {                                                       // in the exhibition hall
        v.inside -= dt; inside++;
        if (v.inside <= 0) { v.x = DOOR[0] + v.lane; v.z = DOOR[1] + 1; v.way = [[v.x, FRONT_Z + 1]]; v.goIn = false; }
        else { crowd.hide(v.m); continue; }
      }
      if (v.pause > 0) {
        v.pause -= dt;
        crowd.place(v.m, v.x, 0.2, v.z, v.yaw, 0);
        continue;
      }
      if (!v.way.length) plan(v);
      const [tx, tz] = v.way[0], dx = tx - v.x, dz = tz - v.z, d = Math.hypot(dx, dz);
      if (d < 0.3) {
        v.way.shift();
        if (!v.way.length) {
          if (v.goIn) { v.inside = 20 + Math.random() * 60; crowd.hide(v.m); continue; }
          v.pause = 2 + Math.random() * 10;
          v.yaw = Math.atan2(v.x > tx ? 1 : -1, 0) + (Math.random() < 0.5 ? Math.PI : 0);   // look at a booth
        }
        continue;
      }
      const st = Math.min(d, v.v * dt);
      v.x += (dx / d) * st; v.z += (dz / d) * st; v.yaw = Math.atan2(dx, dz);
      v.m.phase += (v.v / 0.65) * Math.PI * dt;
      const y = v.z < DOOR[1] + 1.2 ? 1.0 : v.z < 192.6 ? 0.2 + (192.6 - v.z) / 3.6 * 0.8 : 0.2;   // up the hall steps
      crowd.place(v.m, v.x, y, v.z, v.yaw, Math.sin(v.m.phase));
    }
    for (const s of staff) crowd.place(s.m, s.x, 0.2, s.z, s.yaw, 0, Math.sin(t * 0.4 + s.z) > 0.7 ? -0.8 : 0);
    crowd.flush();

    // trams: round the loop, 15 s stop at the hall (s 0) and at the far end (half way)
    const L = route.L, at = (s, o) => route.at(((s % L) + L) % L, o);
    for (const tr of trams) {
      if (tr.wait > 0) tr.wait -= dt;
      else {
        const before = tr.s;
        tr.s += 5 * dt;
        if (Math.floor(before / (L / 2)) !== Math.floor(tr.s / (L / 2))) tr.wait = 15;
      }
      tr.cars.forEach((g, k) => {
        const s = tr.s - k * 4.8;
        at(s + 1.2, A); at(s - 1.2, Bp);
        g.position.set((A.x + Bp.x) / 2 + A.tz * 1.6, 0.2, (A.z + Bp.z) / 2 - A.tx * 1.6);   // keep left
        g.rotation.y = Math.atan2(A.x - Bp.x, A.z - Bp.z);
      });
    }
    say(`ลาดกระบังนิทรรศน์ / KMITL EXPO · หอประชุมเจ้าพระยาสุรวงษ์ไวยวัฒน์ + Open House ${FACULTY.length - 1} คณะ · ผู้เข้าชมในหอประชุม ${inside} คน · รถรางรับส่ง 2 คัน`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(100, 0, 235) : null), view: { dist: 170, polar: 58, az: 20 } };
}
