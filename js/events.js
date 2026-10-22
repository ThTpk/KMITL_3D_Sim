// Campus events played out on the model (the KMITL Open House digital twin). The first one is วันลูกพระจอม /
// KMITL First Step (late June, see events.md): a special train from Hua Lamphong pulls into Phra Chom Klao station,
// the freshmen get off on the south platform and line up four abreast on Soi Chalong Krung 1, seniors in faculty
// workshop shirts line the way and clap, and the column walks behind a banner, the crown (พระมหามงกุฎ) on a
// palanquin and four tiered umbrellas (ฉัตร) east along the soi, south down Chalong Krung Road and up the front
// steps into the Chao Phya Surawongwaiwat (Worn Bunnag) Convention Hall, where the tie-and-pin ceremony is held.
// News reports give the train, the station and the hall but not the streets walked; the route here is the
// shortest one along the roads.
//
// x = east, z = south, y = up. Figures come from students.js; the train is a few boxes per car, like traffic.js.
import * as THREE from 'three';
import { rng } from './builders.js';
import { Path, chainRails } from './traffic.js';
import { Crowd } from './crowd.js';
import { buildLoyKrathong } from './loykrathong.js';
import { buildFootball } from './football.js';
import { buildExpo } from './expo.js';
import { buildGraduation } from './graduation.js';
import { buildAgriFair } from './agrifair.js';
import { buildSongkran } from './songkran.js';
import { buildFoundingDay } from './foundingday.js';
import { buildFreshyMusic } from './freshymusic.js';
import { buildSciDay } from './sciday.js';
import { buildCheer } from './cheer.js';
import { buildKmidsSports } from './kmidssports.js';
import { buildNurseDay } from './nurseday.js';
import { buildDormMarket } from './dormmarket.js';

// speed: the default playback speed for the scene
export const EVENTS = [                         // in calendar order from the start of the academic year
  { id: 'firststep', th: '🎓 วันลูกพระจอม (ปลาย มิ.ย.)', speed: 4 },
  { id: 'sciday', th: '🔭 นิทรรศการวันวิทยาศาสตร์ (ส.ค.)', speed: 1 },
  { id: 'foundingday', th: '🙏 วันคล้ายวันสถาปนาสถาบัน (22–24 ส.ค.)', speed: 2 },
  { id: 'expo', th: '🔬 ลาดกระบังนิทรรศน์ / KMITL EXPO (ปลาย ส.ค.–ก.ย.)', speed: 2 },
  { id: 'freshymusic', th: '🎸 Freshy Music (ต.ค.)', speed: 1 },
  { id: 'nurseday', th: '🩺 ตรวจสุขภาพฟรี วันพยาบาล (21 ต.ค.)', speed: 2 },
  { id: 'loykrathong', th: '🪷 ลอยกระทง สจล. (พ.ย.)', speed: 1 },
  { id: 'kmidssports', th: '🏃 KMIDS Sports Day (พ.ย.)', speed: 1 },
  { id: 'graduation', th: '🎓 พิธีพระราชทานปริญญาบัตร (พ.ย.–ก.พ.)', speed: 2 },
  { id: 'cheer', th: '📣 แคแสดสัมพันธ์ (ธ.ค.)', speed: 1 },
  { id: 'agrifair', th: '🌱 เกษตรเจ้าคุณทหารแฟร์ (ก.พ.)', speed: 1 },
  { id: 'football', th: '⚽ ฟุตบอลประเพณี 3 พระจอมเกล้า (ก.พ.–มี.ค.)', speed: 1 },
  { id: 'songkran', th: '💦 สงกรานต์ รดน้ำขอพร (เม.ย.)', speed: 1 },
  { id: 'dormmarket', th: '🍢 ตลาดหอใน (ทุกสัปดาห์)', speed: 1 },
];

const G = 0.2;                                 // walking height on the roads
// station south platform → Soi Chalong Krung 1 → Chalong Krung Road → service road in front of the hall →
// front steps (x 116..166, z 189..192.6, podium 1 m up) → glass wall at z 182
const ROUTE = [[-310, G, -11.4], [-171, G, -15], [-104, G, -16], [7, G, -19], [9, G, 83], [11, G, 163], [13, G, 205],
  [91, G, 203.5], [141, G, 203], [141, G, 193.2], [141, 1.0, 189.2], [141, 1.0, 184.5]];
const STATION = [-274, -28];                   // centre of the platform, on the southernmost track
const FRESHMEN = 320, COLS = 4, ROW_GAP = 1.15, COL_GAP = 0.72;
const HEAD0 = 105;                             // route distance of the front row while the column forms up
const LINE = [120, 28];                        // seniors line the route from s 120 to 28 m before its end
const WALK_V = 1.25, ALIGHT_V = 1.5;
const SENIOR_SHIRTS = ['#1f2f52', '#5a1f27', '#28452e', '#2a2f38', '#e2601f', '#e2601f', '#f4f4f1'];

// round the corners so a column four abreast turns smoothly
function rounded(pts, r) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1];
    const l1 = Math.hypot(b[0] - a[0], b[2] - a[2]), l2 = Math.hypot(c[0] - b[0], c[2] - b[2]);
    const k = Math.min(r, l1 / 2, l2 / 2);
    const p = b.map((v, j) => v + (a[j] - v) * k / l1), q = b.map((v, j) => v + (c[j] - v) * k / l2);
    for (let j = 0; j <= 6; j++) {
      const t = j / 6, u = 1 - t;
      out.push([0, 1, 2].map((d) => u * u * p[d] + 2 * u * t * b[d] + t * t * q[d]));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// ---------- props ----------
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
const GOLD = std('#d6a83a', { metalness: 0.8, roughness: 0.3 });
function shadowed(g) { g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; }

// palanquin carried on two poles at shoulder height, a red-draped pedestal and the pointed Thai crown
function crownPalanquin() {
  const g = new THREE.Group();
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
  for (const x of [-0.45, 0.45]) add(new THREE.BoxGeometry(0.09, 0.09, 3.4), GOLD, x, 1.42, 0);
  add(new THREE.BoxGeometry(1.0, 0.12, 1.2), GOLD, 0, 1.52, 0);
  add(new THREE.BoxGeometry(0.75, 0.3, 0.75), std('#a3242a'), 0, 1.73, 0);
  add(new THREE.BoxGeometry(0.55, 0.06, 0.55), GOLD, 0, 1.91, 0);
  const prof = [[0.17, 0], [0.19, 0.05], [0.16, 0.12], [0.15, 0.16], [0.16, 0.2], [0.12, 0.29], [0.11, 0.31], [0.12, 0.34],
    [0.085, 0.45], [0.07, 0.47], [0.075, 0.5], [0.05, 0.6], [0.03, 0.7], [0.012, 0.82], [0, 0.9]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(prof, 16), GOLD, 0, 1.94, 0).scale.setScalar(0.85);
  return shadowed(g);
}
// tiered white umbrella with gold edges on a pole, held in front of the bearer
function chattra() {
  const g = new THREE.Group();
  const white = std('#f7f5ee');
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.5, 6), GOLD); pole.position.set(0, 2.55, 0.35); g.add(pole);
  for (let i = 0; i < 5; i++) {
    const r = 0.75 - i * 0.11, y = 3.1 + i * 0.24;
    const tier = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r, 0.16, 16), white); tier.position.set(0, y, 0.35); g.add(tier);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.02, r + 0.02, 0.04, 16), GOLD); rim.position.set(0, y - 0.08, 0.35); g.add(rim);
  }
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 8), GOLD); tip.position.set(0, 4.4, 0.35); g.add(tip);
  return shadowed(g);
}
// orange banner between two poles, carried at the head of the column
function banner() {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256;
  const c = cv.getContext('2d');
  c.fillStyle = '#e2601f'; c.fillRect(0, 0, 1024, 256);
  c.strokeStyle = '#fff'; c.lineWidth = 10; c.strokeRect(14, 14, 996, 228);
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '700 96px "IBM Plex Sans Thai", sans-serif'; c.fillText('KMITL FIRST STEP', 512, 92);
  c.font = '600 64px "IBM Plex Sans Thai", sans-serif'; c.fillText('วันลูกพระจอม', 512, 188);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const g = new THREE.Group();
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.95), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }));
  cloth.position.set(0, 2.25, 0.3); g.add(cloth);
  for (const x of [-1.95, 1.95]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 6), std('#d9d9d6')); p.position.set(x, 1.75, 0.3); g.add(p); }
  return shadowed(g);
}

// ---------- special train: SRT locomotive and cream coaches ----------
const LOCO = { len: 17, w: 2.8, h: 3.9, body: '#c9452c', band: '#efe6d3', loco: true };
const COACH = { len: 20, w: 2.85, h: 3.75, body: '#e9e1cd', band: '#b5332b' };
function car(spec) {
  const g = new THREE.Group();
  const box = (w, y0, y1, l, mat, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, y1 - y0, l), mat); m.position.set(0, (y0 + y1) / 2, z); g.add(m); };
  box(spec.w - 0.3, 0.45, 1.25, spec.len - 1.5, std('#2a2c2f'));
  box(spec.w, 1.25, spec.h - 0.35, spec.len, std(spec.body));
  box(spec.w - 0.35, spec.h - 0.35, spec.h, spec.len - 0.6, std('#8b9094'));
  const glass = std('#22303a', { roughness: 0.2, metalness: 0.3 });
  if (spec.loco) {
    box(spec.w + 0.04, 1.5, 1.85, spec.len, std(spec.band));
    box(spec.w + 0.02, 2.55, 3.2, 1.6, glass, spec.len / 2 - 0.9);
  } else {
    box(spec.w + 0.04, 1.55, 1.95, spec.len - 0.4, std(spec.band));
    box(spec.w + 0.03, 2.15, 2.95, spec.len - 2.4, glass);
  }
  return shadowed(g);
}

function buildFirstStep({ data, say }) {
  const group = new THREE.Group();
  let built = null;

  function build() {
    const R = rng(1357);
    const route = new Path(rounded(ROUTE, 7));
    const L = route.L;
    const P = {}, Q = {};

    // track: the Eastern Line chain closest to the south platform; the train runs east (from Hua Lamphong)
    const chains = chainRails(data.rails).filter((c) => c.name === 'ทางรถไฟสายตะวันออก');
    let rail = null;
    for (const c of chains) { const n = c.path.nearest(STATION[0], STATION[1]); if (!rail || n.d < rail.d) rail = { path: c.path, s: n.s, d: n.d }; }
    rail.path.at(rail.s, P);
    const dirT = P.tx > 0 ? 1 : -1;
    const consist = [LOCO, ...Array.from({ length: 8 }, () => COACH)];
    const length = consist.reduce((a, c) => a + c.len + 0.8, 0);
    const cars = consist.map((spec) => { const g = car(spec); group.add(g); return { spec, g }; });
    const train = { path: rail.path, cars, length, stopFront: rail.s + (dirT * length) / 2, dir: dirT };
    // doors: two per coach on the platform side, positions taken with the train at the stop
    const doors = [];
    {
      let off = 0;
      for (const c of consist) {
        const sc = train.stopFront - dirT * (off + c.len / 2);
        off += c.len + 0.8;
        if (c.loco) continue;
        for (const e of [-1, 1]) {
          rail.path.at(sc + e * (c.len / 2 - 2.2), P);
          let nx = -P.tz, nz = P.tx; if (nz < 0) { nx = -nx; nz = -nz; }   // towards the platform (south)
          doors.push([P.x + nx * 2.0, P.z + nz * 2.0]);
        }
      }
      doors.sort((a, b) => b[0] - a[0]);                                    // east first: they fill the front rows
    }

    // figures (one instanced mesh for everybody)
    const crowd = new Crowd();
    const fresh = [], seniors = [], bearers = [];
    const mk = (female, shirt) => crowd.add(R, female, shirt);
    const perDoor = Math.ceil(FRESHMEN / doors.length);
    for (let k = 0; k < FRESHMEN; k++) {
      const d = Math.floor(k / perDoor), i = k % perDoor;
      const m = mk(R() < 0.5, '#f4f4f1');
      Object.assign(m, { row: Math.floor(k / COLS), col: k % COLS, door: doors[d], t0: i * 1.1 + d * 0.15, state: 0, x: 0, z: 0, yaw: 0, jit: (R() - 0.5) * 0.25 });
      fresh.push(m);
    }
    for (let s = LINE[0]; s < L - LINE[1]; s += 2.3 + R() * 0.6) {
      for (const side of [1, -1]) {
        const deep = R() < 0.35 ? 2 : 1;
        for (let r = 0; r < deep; r++) {
          const m = mk(R() < 0.5, SENIOR_SHIRTS[Math.floor(R() * SENIOR_SHIRTS.length)]);
          Object.assign(m, { s: s + (R() - 0.5) * 0.8 + r * 1.1, o: side * (3.4 + r * 0.9 + R() * 0.3), rate: 7 + R() * 3 });
          seniors.push(m);
        }
      }
    }
    // the head of the column: banner, crown palanquin, four umbrellas (s ahead of the front row, o to the left)
    const lead = [];
    const bannerG = banner(), crownG = crownPalanquin(); group.add(bannerG, crownG);
    lead.push({ prop: bannerG, ds: 13, o: 0, men: [[0, 1.95], [0, -1.95]] });
    lead.push({ prop: crownG, ds: 8, o: 0, men: [[1.2, 0.45], [1.2, -0.45], [-1.2, 0.45], [-1.2, -0.45]] });
    for (const [ds, o] of [[4.5, 1.3], [4.5, -1.3], [2, 1.3], [2, -1.3]]) { const u = chattra(); group.add(u); lead.push({ prop: u, ds, o, men: [[0, 0]] }); }
    for (const l of lead) l.men = l.men.map(([a, b]) => { const m = mk(false, '#f4f4f1'); m.a = a; m.b = b; bearers.push(m); return m; });

    group.add(crowd.finish());

    built = { route, L, train, doors, fresh, seniors, lead, bearers, crowd, P, Q };
  }

  const place = (...a) => built.crowd.place(...a), hide = (m) => built.crowd.hide(m);
  // a point on the route s metres along, o metres to the left; returns the heading too
  const A = {}, B = {};
  function onRoute(s, o, out) {
    const { route } = built;
    route.at(s + 0.8, A); route.at(s - 0.8, B);
    let tx = A.x - B.x, tz = A.z - B.z; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    out.x = (A.x + B.x) / 2 + tz * o; out.y = (A.y + B.y) / 2; out.z = (A.z + B.z) / 2 - tx * o;
    out.tx = tx; out.tz = tz; out.yaw = Math.atan2(tx, tz);
    return out;
  }

  // ---------- state ----------
  let t = 0, phase = 'idle', head = HEAD0, trainS = 0, trainV = 0, tDoors = 0, tReady = 0, entered = 0, tDone = 0;

  function start() {
    if (!built) build();
    const { train, fresh } = built;
    t = 0; phase = 'arrive'; head = HEAD0; entered = 0; tDone = 0; tReady = 0;
    trainS = train.stopFront - train.dir * 650; trainV = 14;
    for (const m of fresh) m.state = 0;
    built.crowd.hideAll();
    say('รถไฟขบวนพิเศษจากหัวลำโพงกำลังเข้าสถานีพระจอมเกล้า');
  }
  function stop() { phase = 'idle'; }

  // dt: scene time (sped up), dtReal: wall-clock time
  function update(dt, dtReal) {
    t += dt;
    const { L, train, fresh, seniors, lead, P } = built;

    // train: brake into the platform, wait, pull out east once everybody is off
    if (phase === 'arrive') {
      const d = (train.stopFront - trainS) * train.dir;
      const target = Math.min(14, Math.sqrt(2 * 0.6 * Math.max(0, d)) + 0.3);
      trainV += Math.sign(target - trainV) * Math.min(Math.abs(target - trainV), 1.2 * dt);
      trainS += train.dir * trainV * dt;
      if (d <= 0.3) { trainS = train.stopFront; trainV = 0; phase = 'alight'; tDoors = t; say('น้องใหม่ลงจากรถไฟ รุ่นพี่ตั้งแถวรอต้อนรับ'); }
    } else if (tReady && t - tReady > 6) {
      trainV = Math.min(14, trainV + 0.6 * dt); trainS += train.dir * trainV * dt;
    }
    let off = 0;
    for (const c of train.cars) {
      const sc = trainS - train.dir * (off + c.spec.len / 2); off += c.spec.len + 0.8;
      const gone = (sc - train.stopFront) * train.dir > 700;
      c.g.visible = !gone;
      train.path.at(sc + train.dir * (c.spec.len / 2 - 2.5), P); const fx = P.x, fy = P.y, fz = P.z;
      train.path.at(sc - train.dir * (c.spec.len / 2 - 2.5), P);
      c.g.position.set((fx + P.x) / 2, (fy + P.y) / 2 - 0.1, (fz + P.z) / 2);
      c.g.lookAt(fx, (fy + P.y) / 2 - 0.1, fz);
    }

    // freshmen
    const marching = phase === 'march';
    let inSlot = 0;
    for (const m of fresh) {
      const s = head - m.row * ROW_GAP + m.jit, o = (m.col - (COLS - 1) / 2) * COL_GAP;
      if (m.state === 0) {
        if (phase === 'alight' && t - tDoors > m.t0) { m.state = 1; m.x = m.door[0]; m.z = m.door[1]; }
        else { hide(m); continue; }
      }
      if (m.state === 3) { hide(m); continue; }
      onRoute(Math.max(0, s), o, P);
      if (m.state === 1) {                                                   // walk from the door to the slot
        const dx = P.x - m.x, dz = P.z - m.z, d = Math.hypot(dx, dz);
        if (d < 0.25) m.state = 2;
        else { const st2 = Math.min(d, ALIGHT_V * dt); m.x += (dx / d) * st2; m.z += (dz / d) * st2; m.yaw = Math.atan2(dx, dz); }
        m.phase += (ALIGHT_V / 0.65) * Math.PI * dt;
        place(m, m.x, G, m.z, m.yaw, Math.sin(m.phase));
        continue;
      }
      inSlot++;
      if (s >= L) { m.state = 3; entered++; hide(m); continue; }
      if (marching) m.phase += (WALK_V / 0.65) * Math.PI * dt;
      place(m, P.x, P.y + (marching ? Math.abs(Math.cos(m.phase)) * 0.03 : 0), P.z, P.yaw, marching ? Math.sin(m.phase) : 0);
    }
    if (phase === 'alight') {
      say(`น้องใหม่ลงจากรถไฟและตั้งแถว ${inSlot}/${FRESHMEN} คน`);
      if (inSlot === FRESHMEN) { if (!tReady) tReady = t; }
      else if (t - tDoors > 90) tReady = tReady || t;                        // stragglers catch up on the move
      if (tReady && t - tReady > 4) { phase = 'march'; say('ขบวนอัญเชิญพระมหามงกุฎและฉัตร นำน้องใหม่เดินไปหอประชุมเจ้าพระยาสุรวงษ์ไวยวัฒน์'); }
    }
    if (marching) {
      head += WALK_V * dt;
      if (entered) say(`น้องใหม่เข้าหอประชุมแล้ว ${entered}/${FRESHMEN} คน`);
      if (entered === FRESHMEN) { phase = 'done'; tDone = t; say('ครบแล้ว: พิธีมอบเนกไทและเข็มพระมหามงกุฎในหอประชุม'); }
    }

    // the head of the column
    for (const l of lead) {
      const s = head + l.ds;
      const show = phase !== 'arrive' && s < L;
      l.prop.visible = show;
      if (!show) { for (const m of l.men) hide(m); continue; }
      onRoute(s, l.o, P);
      l.prop.position.set(P.x, P.y, P.z); l.prop.rotation.set(0, P.yaw, 0);
      for (const m of l.men) {
        if (marching) m.phase += (WALK_V / 0.65) * Math.PI * dt;
        const x = P.x + P.tx * m.a + P.tz * m.b, z = P.z + P.tz * m.a - P.tx * m.b;
        place(m, x, P.y, z, P.yaw, marching ? Math.sin(m.phase) : 0, -0.9);
      }
    }

    // seniors: face the route, clap while the column goes past
    const front = head + 15, tail = head - Math.ceil(FRESHMEN / COLS) * ROW_GAP;
    for (const m of seniors) {
      if (phase === 'arrive') { hide(m); continue; }
      onRoute(m.s, m.o, P);
      const yaw = P.yaw + (m.o > 0 ? -Math.PI / 2 : Math.PI / 2);
      const clap = (phase === 'march' && m.s > tail - 12 && m.s < front + 30) || (phase === 'done' && t - tDone < 8 && m.s > L - 80);
      m.phase += m.rate * dtReal;                                     // claps at real speed
      place(m, P.x, P.y, P.z, yaw, 0, clap ? -1.25 + 0.2 * Math.sin(m.phase) : 0);
    }
    built.crowd.flush();
  }

  // where the camera should look: the train coming in, the platform, then just ahead of the column
  const F = new THREE.Vector3(), FP = {};
  function focus() {
    if (!built || phase === 'idle') return null;
    if (phase === 'arrive') { built.train.path.at(trainS - built.train.dir * 40, FP); return F.set(FP.x, 0, FP.z); }
    if (phase === 'alight') return F.set(-245, 0, -16);
    if (phase === 'done') return F.set(141, 0, 195);
    onRoute(Math.min(built.L, head - 15), 0, FP);
    return F.set(FP.x, 0, FP.z);
  }

  return { group, start, stop, update, focus, view: { dist: 260, polar: 58, az: -20 } };
}

// ---------- the event player: one scene at a time ----------
const MAKERS = { firststep: buildFirstStep, loykrathong: buildLoyKrathong, football: buildFootball, expo: buildExpo, graduation: buildGraduation, agrifair: buildAgriFair,
  songkran: buildSongkran, foundingday: buildFoundingDay, freshymusic: buildFreshyMusic, sciday: buildSciDay, cheer: buildCheer,
  kmidssports: buildKmidsSports, nurseday: buildNurseDay, dormmarket: buildDormMarket };
// ctx: { data, setTime(h), getTime() } from app.js
export function buildEvents(ctx) {
  const group = new THREE.Group();
  const scenes = {};
  let cur = null, listener = () => {};
  const st = { running: false, text: '', speed: 4, id: null };
  const emit = () => listener({ ...st });
  const say = (text) => { if (text !== st.text) { st.text = text; emit(); } };
  function stop() {
    if (cur) { cur.stop(); cur.group.visible = false; }
    cur = null; st.running = false; st.id = null; st.text = '';
    emit();
  }
  function start(id) {
    stop();
    if (!scenes[id]) { scenes[id] = MAKERS[id]({ ...ctx, say }); group.add(scenes[id].group); }
    cur = scenes[id]; st.running = true; st.id = id;
    cur.group.visible = true;
    cur.start();
    emit();
  }
  return {
    group, start, stop, state: st,
    update(dt) { if (cur) cur.update(Math.min(dt, 0.1) * st.speed, Math.min(dt, 0.1)); },
    focus() { return cur ? cur.focus() : null; },
    view() { return cur ? cur.view : null; },
    setSpeed(v) { st.speed = v; },
    onChange(fn) { listener = fn; },
  };
}
