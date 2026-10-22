// นิทรรศการวันวิทยาศาสตร์ / Science Day exhibition (early-mid August, Faculty of Science; department open houses and
// workshops, a nationwide high-school science project contest for a royal trophy, an invention contest, a quiz; see
// events.md). Booths of the departments and rows of project poster boards in the car park east of the faculty's
// building, school students in uniform going round them and presenting at their boards, and a water-rocket
// contest launching off the north edge of the car park. The source names the faculty, not the layout.
//
// x = east, z = south, y = up. Science building (จุฬาภรณ์วลัยลักษณ์ 2) x 125..172, z -270..-240; the road east of it at
// x ~173; the car park x 181..243, z -272..-229.
import * as THREE from 'three';
import { rng } from './builders.js';
import { Crowd } from './crowd.js';
import { tent, textBoard, board } from './props.js';
import { Amblers, Spray } from './scenekit.js';

const DEPTS = ['ฟิสิกส์', 'เคมี', 'ชีววิทยา', 'คณิตศาสตร์', 'สถิติ', 'วิทยาการคอมพิวเตอร์', 'จุลชีววิทยา', 'นาโน', 'วิทยาศาสตร์สิ่งแวดล้อม', 'เคมีอุตสาหกรรม'];
const COLS = ['#2f6fb0', '#c0392b', '#2e7d4f', '#6a4fb3', '#c9a227', '#1f6f8b', '#8a5a3c', '#5a5a5a'];
const PAD = [226, -273], LAND_Z = -305;

export function buildSciDay({ say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  function build() {
    const R = rng(1808);
    const crowd = new Crowd();
    const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m); return m; };

    // ===== department booths: a row along the south side, facing north =====
    const staff = [];
    DEPTS.forEach((d, i) => {
      const x = 186 + i * 5.6, z = -233.5;
      tent(group, x, z, Math.PI, { cloth: COLS[i % COLS.length] });
      const sign = textBoard([[d, 1, '#ffffff']], COLS[i % COLS.length], 2.8, 0.45, { double: true });
      sign.position.set(x, 2.55, z - 1.55); group.add(sign);
      staff.push({ m: crowd.add(R, R() < 0.5, '#f4f4f1'), x, z: z + 0.3, yaw: Math.PI });
    });
    // ===== project poster boards: two double rows across the car park =====
    const presenters = [];
    const poster = (g, W, H) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
      g.fillStyle = COLS[Math.floor(R() * COLS.length)]; g.fillRect(0, 0, W, H * 0.16);
      for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#d9dee6' : '#eef1f5'; g.fillRect(W * (0.06 + (k % 2) * 0.48), H * (0.22 + Math.floor(k / 2) * 0.25), W * 0.42, H * 0.2); }
    };
    for (const z of [-248, -260]) for (let x = 188; x <= 236; x += 3.2) for (const side of [-1, 1]) {
      const b = board(poster, 1.6, 1.2, { px: 96, lit: false });
      b.position.set(x, 1.5, z + side * 0.05); b.rotation.y = side > 0 ? 0 : Math.PI; group.add(b);
      if (side > 0) box(0.05, 1.2, 0.05, std('#7a7f85'), x, 0.6, z);
      if (R() < 0.6) presenters.push({ m: crowd.add(R, R() < 0.55, '#f4f4f1', R() < 0.5 ? '#1e2740' : undefined), x: x + 0.9, z: z + side * 1.0, yaw: side > 0 ? 0 : Math.PI, ph: R() * 6 });
    }
    const gate = textBoard([['นิทรรศการวันวิทยาศาสตร์', 0.6, '#ffffff'], ['คณะวิทยาศาสตร์ สจล. · ประกวดโครงงานวิทยาศาสตร์', 0.4, '#d6ecff', 600]], '#1f3f7a', 12, 1.8, { double: true });
    gate.position.set(178, 5, -250.5); gate.rotation.y = Math.PI / 2; group.add(gate);
    for (const z of [-256.5, -244.5]) box(0.8, 5, 0.8, std('#1f3f7a'), 178, 2.5, z);

    // ===== water-rocket launch pad and the contestants =====
    box(3, 0.1, 3, std('#7a7f85'), PAD[0], 0.25, PAD[1]);
    const rocket = new THREE.Group(); group.add(rocket);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 10), std('#bfe3ff', { transparent: true, opacity: 0.8 })); rocket.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 10), std('#e8641e')); nose.position.y = 0.4; rocket.add(nose);
    const team = [0, 1, 2].map((i) => ({ m: crowd.add(R, i === 1, '#f4f4f1'), x: PAD[0] - 3 + i * 1.5, z: PAD[1] + 4 }));
    const watchers = Array.from({ length: 20 }, (_, i) => ({ m: crowd.add(R, R() < 0.5, '#f4f4f1'), x: PAD[0] - 12 + i * 1.2, z: PAD[1] + 7 + (i % 2) * 0.8 }));

    // ===== visitors =====
    const am = new Amblers([[[184, -254], [240, -254]], [[184, -241], [240, -241]], [[184, -266], [240, -266]], [[174, -275], [174, -232]]]);
    for (let i = 0; i < 220; i++) am.add(crowd.add(R, R() < 0.55, R() < 0.75 ? '#f4f4f1' : COLS[Math.floor(R() * COLS.length)], R() < 0.4 ? '#1e2740' : undefined), R, { width: 3.2, v: 0.75 });
    group.add(crowd.finish());
    const spray = new Spray(group, 400, '#cfefff');
    built = { crowd, staff, presenters, rocket, team, watchers, am, spray };
  }

  let t = 0, prevTime = null, launches = 0;
  function start() {
    if (!built) build();
    t = 0; launches = 0; built.crowd.hideAll();
    prevTime = getTime(); setTime(10);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  function update(dt) {
    t += dt;
    const { crowd, staff, presenters, rocket, team, watchers, am, spray } = built;
    am.update(crowd, dt);
    for (const s of staff) crowd.place(s.m, s.x, 0.2, s.z, s.yaw, 0, Math.sin(t * 0.7 + s.x) > 0.5 ? -1.0 : 0);
    for (const p of presenters) crowd.place(p.m, p.x, 0.2, p.z, p.yaw + (Math.sin(t * 0.5 + p.ph) > 0 ? 0.6 : 0), 0, Math.sin(t * 1.3 + p.ph) > 0.3 ? -1.2 : 0);   // turning to the board and back, pointing

    // a launch every 20 s: count down 4 s, then a ballistic arc to the north with a spray of water at lift-off
    const cyc = t % 20, fly = cyc - 4, T = 3.2;
    if (fly < 0) { rocket.position.set(PAD[0], 0.6, PAD[1]); rocket.rotation.set(-0.5, 0, 0); }
    else if (fly < T) {
      const k = fly / T, z = PAD[1] + (LAND_Z - PAD[1]) * k, y = 0.6 + 4 * 22 * k * (1 - k);
      rocket.position.set(PAD[0], y, z);
      rocket.rotation.set(-Math.atan2(Math.abs(LAND_Z - PAD[1]), 4 * 22 * (1 - 2 * k)), 0, 0);   // tilt from upright, along the flight
      if (fly < 0.35) for (let i = 0; i < 6; i++) spray.emit(PAD[0], y - 0.3, z + 0.3, 0, 1, 3, 0.6, -1);
      if (fly + dt >= T) launches++;
    } else rocket.position.set(PAD[0], 0.3, LAND_Z);
    for (const m of team) crowd.place(m.m, m.x, 0.2, m.z, Math.PI, 0, fly >= 0 && fly < T ? -2.8 : -0.6);
    for (const w of watchers) crowd.place(w.m, w.x, 0.2, w.z, Math.PI, 0, fly >= 0 && fly < T ? -2.6 + 0.2 * Math.sin(t * 9 + w.x) : 0);
    spray.update(dt);
    crowd.flush();
    say(`นิทรรศการวันวิทยาศาสตร์ · คณะวิทยาศาสตร์ · บูธ ${staff.length} ภาควิชา · โครงงานนักเรียน ${presenters.length} ทีม · แข่งจรวดขวดน้ำ ยิงแล้ว ${launches} ลูก`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(212, 0, -254) : null), view: { dist: 85, polar: 58, az: 30 } };
}
