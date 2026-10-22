// วันคล้ายวันสถาปนาสถาบัน (the founding anniversary, about 22-24 August; see events.md): in the early morning at ลานพระจอม,
// a file of monks walks the footways round the plaza and the round court while staff and students put food in their
// bowls from tables along the way; on the stone plaza guests in white stand facing the King Mongkut monument, and
// one after another the institute's representatives carry wreaths up to it, so the row of wreaths in front of the
// steps grows. The news gives the alms-giving, the merit-making and the wreath-laying at the monument; the
// placing of the tables and guests is ours.
//
// x = east, z = south, y = up. From royal.js: monument facing south at 66.6, -322 (platform z -326.5..-318.5, steps on
// the south), stone plaza x 57..76.5, z -329..-308.3, round court centre 67.3, -289.8; footways from OSM.
import * as THREE from 'three';
import { rng } from './builders.js';
import { Path } from './traffic.js';
import { Crowd } from './crowd.js';
import { textBoard } from './props.js';

// the monks' walk: along the footway from the west, round the north of the round court, out east beside the pond
const ALMS = [[14, -285.5], [50, -287], [52, -295], [57, -301], [65, -304], [73, -303], [80, -298], [84, -290], [94, -286], [100, -292], [114, -302], [130, -307]];
const MONK = '#d9822b', MONKS = 15, GAP = 1.7;
const WREATH_Z = -316.2;

export function buildFoundingDay({ say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  function build() {
    const R = rng(2408);
    const crowd = new Crowd();
    const route = new Path(ALMS.map(([x, z]) => [x, 0.25, z]));
    const P = {};
    const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m); return m; };

    // ===== monks: saffron robes to the ankle, shaven heads, an alms bowl held in front =====
    const head = '#c98f66';
    const monkParts = [[head, 0, 0, 1.665, -0.01, 0.22, 0.08, 0.24, 0], [head, 0, 0, 1.58, -0.1, 0.21, 0.16, 0.06, 0], [MONK, 0, 0, 1.2, 0, 0.4, 0.52, 0.23, 0], ['#2b2b2b', 0, 0, 1.0, 0.26, 0.28, 0.2, 0.28, 0]];
    const monks = Array.from({ length: MONKS }, (_, i) => ({ m: crowd.add(R, false, MONK, MONK, monkParts), k: i }));

    // ===== donors behind small white-clothed tables along the route, both sides =====
    const donors = [], white = std('#ffffff');
    for (let s = 6; s < route.L - 4; s += 2.6) {
      route.at(s, P);
      for (const side of [1, -1]) {
        if (R() < 0.25) continue;
        const nx = P.tz * side, nz = -P.tx * side;               // to the left (side 1) or right
        const x = P.x + nx * 2.4, z = P.z + nz * 2.4;
        box(0.9, 0.7, 0.5, white, P.x + nx * 1.6, 0.35, P.z + nz * 1.6).rotation.y = Math.atan2(P.tx, P.tz);
        box(0.25, 0.12, 0.25, std(['#f2c230', '#e8641e', '#3f8a3a', '#ffffff'][Math.floor(R() * 4)]), P.x + nx * 1.6, 0.76, P.z + nz * 1.6);
        donors.push({ m: crowd.add(R, R() < 0.6, R() < 0.7 ? '#ffffff' : '#e8641e'), s, x, z, yaw: Math.atan2(-nx, -nz) });
      }
    }

    // ===== guests in white on the stone plaza, facing the monument =====
    const guests = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++) {
      if (R() < 0.12) continue;
      guests.push({ m: crowd.add(R, R() < 0.4, '#f4f4f1'), x: 59.5 + c * 1.4, z: -311.5 + r * 1.0 });
    }
    // ===== wreath bearers and the wreaths =====
    const wreathGeo = new THREE.TorusGeometry(0.45, 0.12, 8, 18);
    const leaves = std('#2f6f30'), flowers = [std('#f7d35c'), std('#ffffff'), std('#e05a7a')];
    const wreaths = [];
    for (let i = 0; i < 12; i++) {
      const g = new THREE.Group(); group.add(g);
      const ring = new THREE.Mesh(wreathGeo, leaves); g.add(ring);
      for (let k = 0; k < 8; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), flowers[(i + k) % 3]); f.position.set(Math.cos((k / 8) * 6.28) * 0.45, Math.sin((k / 8) * 6.28) * 0.45, 0.1); g.add(f); }
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.06), std('#c9a227')); stand.position.set(0, -0.75, -0.05); g.add(stand);
      g.visible = false; wreaths.push(g);
    }
    const bearers = Array.from({ length: 12 }, () => ({ m: crowd.add(R, R() < 0.3, '#f4f4f1') }));
    const banner = textBoard([['66 ปี สจล. · วันคล้ายวันสถาปนาสถาบัน', 0.6, '#ffffff'], ['24 สิงหาคม', 0.4, '#ffe0c2', 600]], '#e8641e', 12, 1.6, { double: true });
    banner.position.set(66.8, 3.4, -306.4); group.add(banner);
    for (const x of [60.6, 73]) box(0.1, 4.2, 0.1, std('#d9d9d6'), x, 2.1, -306.4);
    group.add(crowd.finish());
    built = { crowd, route, monks, donors, guests, wreaths, bearers };
  }

  let t = 0, prevTime = null, given = 0;
  function start() {
    if (!built) build();
    t = 0; given = 0; built.crowd.hideAll();
    built.wreaths.forEach((w) => { w.visible = false; });
    prevTime = getTime(); setTime(7.25);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  const A = {}, B = {};
  function update(dt, dtReal) {
    t += dt;
    const { crowd, route, monks, donors, guests, wreaths, bearers } = built;

    // monks walk the route slowly, one after another, then start again from the west
    const V = 0.45, cycle = route.L + MONKS * GAP + 20;
    const lead = (t * V) % cycle;
    const near = [];
    for (const mk of monks) {
      const s = lead - mk.k * GAP;
      if (s < 0 || s > route.L) { crowd.hide(mk.m); continue; }
      route.at(s + 0.5, A); route.at(s - 0.5, B);
      mk.m.phase += (V / 0.55) * Math.PI * dt;
      crowd.place(mk.m, (A.x + B.x) / 2, 0.25, (A.z + B.z) / 2, Math.atan2(A.x - B.x, A.z - B.z), Math.sin(mk.m.phase) * 0.7, -0.75);
      near.push(s);
    }
    for (const d of donors) {
      const giving = near.some((s) => Math.abs(s - d.s) < 1.0);
      if (giving && !d.was) given++;
      d.was = giving;
      crowd.place(d.m, d.x, 0.25 - (giving ? 0.15 : 0), d.z, d.yaw, 0, giving ? -1.2 : -0.35);   // bowing a little to give
    }
    for (const g of guests) crowd.place(g.m, g.x, 0.3, g.z, Math.PI, 0, 0);

    // wreaths: one bearer every 7 s walks from the plaza's east side up to the monument and sets a wreath down
    const every = 7, n = Math.min(bearers.length, Math.floor(t / every) + 1);
    bearers.forEach((b, i) => {
      const w = wreaths[i], slotX = 59.6 + i * 1.25;
      const tt = t - i * every;
      if (tt < 0) { crowd.hide(b.m); return; }
      // path: (78, -312) → (slotX, -314.8) facing north, place, back to (78, -309)
      const go = 6, place = 2, back = 6;
      let x, z, yaw, swing = 0, arm = -1.1, carry = true;
      if (tt < go) { const k = tt / go; x = 78 + (slotX - 78) * k; z = -312 + (-314.8 + 312) * k; yaw = Math.atan2(slotX - 78, -2.8); swing = Math.sin(tt * 5); }
      else if (tt < go + place) { x = slotX; z = -314.8; yaw = Math.PI; arm = -1.5; carry = tt < go + place * 0.6; }
      else if (tt < go + place + back) { const k = (tt - go - place) / back; x = slotX + (78 - slotX) * k; z = -314.8 + 5.8 * k; yaw = Math.atan2(78 - slotX, 5.8); swing = Math.sin(tt * 5); arm = null; carry = false; }
      else { crowd.hide(b.m); if (i < n) { w.visible = true; w.position.set(slotX, 1.2, WREATH_Z); w.rotation.set(0, 0, 0); } return; }
      crowd.place(b.m, x, 0.3, z, yaw, swing, arm);
      w.visible = true;
      if (carry) { w.position.set(x + Math.sin(yaw) * 0.45, 1.25, z + Math.cos(yaw) * 0.45); w.rotation.set(0, yaw, 0); }
      else { w.position.set(slotX, 1.2, WREATH_Z); w.rotation.set(0, 0, 0); }
    });
    if (t > bearers.length * every + 40) { t = 0; for (const w of wreaths) w.visible = false; }      // and again
    crowd.flush();
    const laid = wreaths.filter((w, i) => w.visible && t - i * every > 8).length;
    say(`วันคล้ายวันสถาปนาสถาบัน · ลานพระจอม หน้าพระบรมราชานุสาวรีย์ ร.4 · ตักบาตรพระสงฆ์ ${MONKS} รูป (ใส่บาตรแล้ว ${given} ครั้ง) · วางพวงมาลา ${laid} พวง`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(70, 0, -303) : null), view: { dist: 75, polar: 60, az: 30 } };
}
