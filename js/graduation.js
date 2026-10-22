// พิธีพระราชทานปริญญาบัตร (the degree ceremony; Nov, Jan or Feb depending on the year, held in the Chao Phya
// Surawongwaiwat (Worn Bunnag) Convention Hall; see events.md). Only the outside is shown: graduates in gowns queue
// on the car park aisles, file up a red carpet and the front steps into the hall, and come out again after the
// ceremony to their families, who wait with flowers and cameras; then groups pose on photo risers. Flags line the
// road in front and flower sellers set up by the road. The gown colour (black with an orange sash here) is not
// confirmed by a source.
//
// x = east, z = south, y = up. Hall front steps x 116..166 at z 189..192.6 (podium 1 m up), the door line at
// z ~191; the road in front at z ~204; car park aisles x 71..131 between z 215 and 309.
import * as THREE from 'three';
import { rng } from './builders.js';
import { Crowd } from './crowd.js';
import { tent, textBoard } from './props.js';

const DOOR = [141, 190.5], AISLES = [71, 91, 111, 131], GRADS = 280;
const RISERS = [[36, 60], [170, 194]];            // x ranges; three steps rising to the north at z 219..222.6, facing south
const RISER_Z = 222.6;
const GOWN = '#17171b', SASH = '#e8641e';
const CLOTHES = ['#d94f70', '#e8a33d', '#6a4fb3', '#3f8fd1', '#2fa37a', '#f0e0b0', '#ffffff', '#c0392b', '#7a7f85'];
const FLOWERS = ['#f4a7c0', '#f7d35c', '#e05a7a', '#ffffff', '#c58be0', '#f08a3c'];
const stepY = (z) => (z < 189 ? 1.0 : z < 192.6 ? 1.0 - ((z - 189) / 3.6) * 0.8 : 0.2);

export function buildGraduation({ say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  function build() {
    const R = rng(4747);
    const crowd = new Crowd();
    const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m); return m; };

    // ===== red carpet, flags along the road, a banner, photo risers, flower sellers =====
    const red = std('#a3171f', { roughness: 0.9 });
    box(9, 0.04, 13.5, red, DOOR[0], 0.22, 199.3);
    box(9, 0.04, 7, red, DOOR[0], 1.02, 185.5);
    for (let s = 0; s < 6; s++) box(9, 0.04, 0.62, red, DOOR[0], 1.04 - s * 0.2, 189.3 + s * 0.6);
    const pole = std('#d9d9d6', { metalness: 0.5 });
    for (let x = 22, i = 0; x < 228; x += 11, i++) {
      if (x > 128 && x < 154) continue;
      box(0.08, 7, 0.08, pole, x, 3.5, 199.5);
      if (i % 2) box(1.6, 1.0, 0.03, std('#f2c230'), x + 0.85, 6.3, 199.5);              // yellow flag
      else for (const [c, y, h] of [['#c8102e', 6.72, 0.16], ['#ffffff', 6.56, 0.16], ['#241d4f', 6.3, 0.36], ['#ffffff', 6.04, 0.16], ['#c8102e', 5.88, 0.16]]) box(1.6, h, 0.03, std(c), x + 0.85, y, 199.5);   // Thai flag
    }
    const banner = textBoard([['ยินดีกับบัณฑิตทุกท่าน', 0.55, '#ffffff'], ['Congratulations KMITL Graduates', 0.45, '#ffe0c2', 600]], '#7a1f2b', 34, 3.0);
    banner.position.set(141, 10.6, 190.6); group.add(banner);
    const riserMat = std('#cfcbc2');
    for (const [x0, x1] of RISERS) for (let s = 0; s < 3; s++) box(x1 - x0, 0.45 * (s + 1), 1.2, riserMat, (x0 + x1) / 2, 0.225 * (s + 1), RISER_Z - 0.6 - s * 1.2);
    const sellers = [];
    for (let i = 0; i < 6; i++) {
      const x = 24 + i * 5.5, z = 211;
      tent(group, x, z, Math.PI, { cloth: '#2e7d4f' });
      for (let k = 0; k < 6; k++) box(0.25, 0.35, 0.25, std(FLOWERS[(i + k) % FLOWERS.length]), x - 1 + k * 0.4, 0.95, z - 0.9);
      sellers.push({ m: crowd.add(R, R() < 0.7, CLOTHES[Math.floor(R() * CLOTHES.length)]), x, z: z + 0.4, yaw: Math.PI });
    }

    // ===== families: clusters on the plaza and car park edge, some with flowers =====
    const families = [];
    const spots = [];
    for (let i = 0; i < GRADS; i++) {
      let x, z, ok;
      do {
        x = 26 + R() * 200; z = 207 + R() * 32; ok = !(x > 133 && x < 149) && !(z > RISER_Z - 4 && z < RISER_Z + 9 && RISERS.some(([a, b]) => x > a - 2 && x < b + 2)) && !(z > 207 && z < 214 && x < 58);
        ok = ok && spots.every(([sx, sz]) => Math.hypot(sx - x, sz - z) > 2.4);
      } while (!ok && spots.length < 400);
      spots.push([x, z]);
      const n = 1 + Math.floor(R() * 3), members = [];
      for (let j = 0; j < n; j++) {
        const flowers = R() < 0.4;
        const fc = FLOWERS[Math.floor(R() * FLOWERS.length)];
        const extra = flowers ? [[fc, 0, 0, 1.12, 0.3, 0.3, 0.3, 0.28, 0], ['#3f7a2c', 0, 0, 0.9, 0.26, 0.08, 0.25, 0.08, 0]] : [];
        members.push({ m: crowd.add(R, R() < 0.55, CLOTHES[Math.floor(R() * CLOTHES.length)], undefined, extra), flowers, dx: (j - (n - 1) / 2) * 0.65, cam: !flowers && R() < 0.4 });
      }
      families.push({ x, z, members });
    }

    // ===== graduates: gown, an orange sash down the front =====
    const sash = [[SASH, 0, 0, 1.2, 0.12, 0.13, 0.55, 0.02, 0], [SASH, 0, 0, 1.38, 0.115, 0.36, 0.09, 0.02, 0]];
    const grads = [];
    for (let i = 0; i < GRADS; i++) {
      const female = R() < 0.5;
      const q = i % AISLES.length, rank = Math.floor(i / AISLES.length);
      grads.push({ m: crowd.add(R, female, GOWN, GOWN, sash), q, rank, fam: families[i], x: 0, z: 0, yaw: 0, way: [], state: 'queue', v: 1.0 + R() * 0.15 });
    }
    // photographers at the risers
    const photographers = RISERS.map(([x0, x1]) => ({ m: crowd.add(R, false, '#1f1f22'), x: (x0 + x1) / 2, z: RISER_Z + 7, yaw: Math.PI }));
    group.add(crowd.finish());

    // camera flashes
    const flashMat = new THREE.SpriteMaterial({ color: '#ffffff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const flashes = Array.from({ length: 10 }, () => { const s = new THREE.Sprite(flashMat); s.scale.set(1.4, 1.4, 1); s.visible = false; group.add(s); return { s, t: 0 }; });
    built = { crowd, grads, families, sellers, photographers, flashes };
  }

  // ---------- state ----------
  let t = 0, phase = 'queue', tPhase = 0, inside = 0, out = 0, prevTime = null;
  const setPhase = (p) => { phase = p; tPhase = t; };
  function queueUp() {
    for (const g of built.grads) {
      g.x = AISLES[g.q]; g.z = 216 + g.rank * 1.05; g.yaw = Math.PI; g.state = 'queue'; g.way = [];
    }
    inside = 0; out = 0; setPhase('queue');
  }
  function start() {
    if (!built) build();
    t = 0; built.crowd.hideAll(); queueUp();
    prevTime = getTime(); setTime(9);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  function walk(g, dt) {
    const [tx, tz] = g.way[0], dx = tx - g.x, dz = tz - g.z, d = Math.hypot(dx, dz);
    if (d < 0.25) { g.way.shift(); return !g.way.length; }
    const st = Math.min(d, g.v * dt); g.x += (dx / d) * st; g.z += (dz / d) * st; g.yaw = Math.atan2(dx, dz);
    g.m.phase += (g.v / 0.65) * Math.PI * dt;
    built.crowd.place(g.m, g.x, stepY(g.z), g.z, g.yaw, Math.sin(g.m.phase));
    return false;
  }
  function flash(x, y, z) {
    const f = built.flashes.find((q) => q.t <= 0); if (!f) return;
    f.s.position.set(x, y, z); f.s.visible = true; f.t = 0.12;
  }

  function update(dt) {
    t += dt;
    const { crowd, grads, families, sellers, photographers, flashes } = built;
    const el = () => t - tPhase;                                                // time in the phase, live

    // ---- phases ----
    if (phase === 'queue' && el() > 12) setPhase('enter');
    if (phase === 'enter' && inside === GRADS) setPhase('ceremony');
    if (phase === 'ceremony' && el() > 40) setPhase('exit');
    if (phase === 'exit' && out === GRADS && el() > 20) {
      setPhase('photo');
      // the first 4 x 22 to the risers, four rows each (ground + three steps)
      grads.slice(0, 88).forEach((g, i) => {
        const r = RISERS[i % 2], k = Math.floor(i / 2), row = Math.floor(k / 11), col = k % 11;
        const x = r[0] + 1.2 + col * ((r[1] - r[0] - 2.4) / 10), z = RISER_Z + 0.6 - row * 1.2;
        g.state = 'toPhoto'; g.way = [[x, RISER_Z + 2], [x, z]]; g.row = row;
      });
    }
    if (phase === 'photo' && el() > 45) {
      setPhase('back');
      grads.slice(0, 88).forEach((g) => { g.state = 'toFamily'; g.way = [[g.x, RISER_Z + 2], [g.fam.x, g.fam.z - 1.1]]; });
    }
    if (phase === 'back' && el() > 30) { crowd.hideAll(); queueUp(); }

    const pt = el();

    // ---- graduates ----
    grads.forEach((g, i) => {
      if (g.state === 'queue') {
        if (phase === 'enter' && pt > g.rank * 1.1 + g.q * 0.25) {
          const lane = (g.q - 1.5) * 1.6;
          g.state = 'in'; g.way = [[AISLES[g.q], 210], [DOOR[0] + lane, 206], [DOOR[0] + lane * 0.6, DOOR[1]]];
        } else { crowd.place(g.m, g.x, 0.2, g.z, g.yaw, 0); return; }
      }
      if (g.state === 'in') { if (walk(g, dt)) { g.state = 'inside'; inside++; crowd.hide(g.m); } return; }
      if (g.state === 'inside') {
        if (phase === 'exit' && pt > i * 0.18) { g.state = 'toFamily'; g.x = DOOR[0] + ((i % 5) - 2) * 1.2; g.z = DOOR[1]; g.way = [[g.x, 196], [g.fam.x, g.fam.z - 1.1]]; }
        else { crowd.hide(g.m); return; }
      }
      if (g.state === 'toFamily') { if (walk(g, dt)) { g.state = 'family'; if (phase === 'exit') out++; } return; }
      if (g.state === 'toPhoto') { if (walk(g, dt)) g.state = 'pose'; return; }
      if (g.state === 'pose') { crowd.place(g.m, g.x, 0.2 + 0.45 * g.row, g.z, 0, 0, pt > 20 && pt < 30 ? -2.8 : 0); return; }   // hands up for one shot
      if (g.state === 'family') { crowd.place(g.m, g.x, 0.2, g.z, 0, 0, Math.sin(t * 0.7 + i) > 0.8 ? -1.0 : 0); }
    });

    // ---- families: face the door until their graduate is back, then clap, hold out flowers, take pictures ----
    families.forEach((f, i) => {
      const g = grads[i], back = g.state === 'family';
      const yaw = back ? Math.atan2(g.x - f.x, g.z - f.z) : Math.atan2(DOOR[0] - f.x, DOOR[1] - f.z);
      f.members.forEach((mb) => {
        const arm = back ? (mb.flowers ? -0.9 : mb.cam ? -1.4 : -1.25 + 0.2 * Math.sin(t * 9 + mb.dx * 5)) : 0;
        crowd.place(mb.m, f.x + mb.dx * Math.cos(yaw), 0.2, f.z - mb.dx * Math.sin(yaw), yaw, 0, arm);
        if (back && mb.cam && Math.random() < dt * 0.15) flash(f.x + mb.dx * Math.cos(yaw) + Math.sin(yaw) * 0.4, 1.6, f.z + Math.cos(yaw) * 0.4);
      });
    });
    for (const s of sellers) crowd.place(s.m, s.x, 0.2, s.z, s.yaw, 0);
    for (const p of photographers) {
      crowd.place(p.m, p.x, 0.2, p.z, p.yaw, 0, phase === 'photo' ? -1.4 : 0);
      if (phase === 'photo' && pt > 12 && Math.random() < dt * 0.8) flash(p.x, 1.6, p.z - 0.5);
    }
    for (const f of flashes) { if (f.t > 0) { f.t -= dt; if (f.t <= 0) f.s.visible = false; } }
    crowd.flush();

    const text = {
      queue: 'บัณฑิตตั้งแถวที่ลานจอดรถหน้าหอประชุม',
      enter: `บัณฑิตเดินเข้าหอประชุมเจ้าพระยาสุรวงษ์ไวยวัฒน์ ${inside}/${GRADS} คน`,
      ceremony: 'พิธีพระราชทานปริญญาบัตรในหอประชุม · ครอบครัวรอด้านหน้า',
      exit: `บัณฑิตออกมาพบครอบครัว ${out}/${GRADS} คน · มอบดอกไม้ ถ่ายรูป`,
      photo: 'ถ่ายภาพหมู่บนอัฒจันทร์ถ่ายรูปหน้าหอประชุม',
      back: 'บัณฑิตกลับไปหาครอบครัว',
    }[phase];
    say(`พิธีพระราชทานปริญญาบัตร · ${text}`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(120, 0, 212) : null), view: { dist: 120, polar: 60, az: 20 } };
}
