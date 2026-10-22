// แคแสดสัมพันธ์ (December; a cheerleading contest of business-school teams, the 24th held at the KMITL stadium on
// 23 Dec 2024; see events.md). One squad at a time performs on the pitch in front of the west grandstand and the
// judges' table: pom-poms, arm motions on the beat, formations from lines to a V, two circles and stunt pyramids
// with a flyer lifted on each; the next squads wait at the ends of the pitch and the stand cheers. Team colours
// and routines are ours.
//
// x = east, z = south, y = up. Pitch centre -626, -256; the stand's front at x ~-690; the squad faces west.
import * as THREE from 'three';
import { rng } from './builders.js';
import { Crowd } from './crowd.js';
import { textBoard } from './props.js';
import { grandstandSeats } from './scenekit.js';

const C = [-642, -256], N = 20, BPM = 132;
const TEAMS = [['#e8641e', '#1b1c1f', 'KBS สจล.'], ['#2f6fb0', '#ffffff', 'ทีม 2'], ['#c0392b', '#f2c230', 'ทีม 3'], ['#2e7d4f', '#ffffff', 'ทีม 4']];
// formations, [u (along z), v (back from the front, +x)] for N members; pyramids handled apart
const FORMS = [
  Array.from({ length: N }, (_, i) => [((i % 5) - 2) * 3, Math.floor(i / 5) * 2.4]),
  Array.from({ length: N }, (_, i) => [(i - 9.5) * 1.3, Math.abs(i - 9.5) * 0.7]),
  Array.from({ length: N }, (_, i) => { const a = ((i % 10) / 10) * Math.PI * 2; return [(i < 10 ? -5 : 5) + Math.cos(a) * 3.4, 3.4 + Math.sin(a) * 3.4]; }),
  Array.from({ length: N }, (_, i) => { const g = Math.floor(i / 4), k = i % 4; return k === 3 ? [-8 + g * 4, 2.3, true] : [-8 + g * 4 + [-0.55, 0.55, 0][k], 2.3 + [0, 0, 0.6][k]]; }),
];

export function buildCheer({ say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  function build() {
    const R = rng(2312);
    const crowd = new Crowd();
    const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m); return m; };
    // squads: pom-poms ride on the forearms (swing ±2 like the arms)
    const squads = TEAMS.map(([shirt, skirt, name]) => {
      const pom = [[shirt, 0.205, 1.38, -0.64, 0, 0.26, 0.26, 0.26, 2], [shirt, -0.205, 1.38, -0.64, 0, 0.26, 0.26, 0.26, -2]];
      return { name, members: Array.from({ length: N }, (_, i) => ({ m: crowd.add(R, i % 5 !== 2, shirt, i % 5 !== 2 ? skirt : undefined, pom), i })) };
    });
    // judges' table on the track in front of the stand
    box(8, 0.8, 1.2, std('#1f2a44'), -679, 0.4, -256);
    const judges = [0, 1, 2, 3, 4].map((i) => ({ m: crowd.add(R, i % 2 === 0, '#f4f4f1'), x: -680, z: -259 + i * 1.5 }));
    const sign = textBoard([['แคแสดสัมพันธ์ ครั้งที่ 24', 0.6, '#ffffff'], ['การแข่งขันเชียร์ลีดเดอร์', 0.4, '#ffe0c2', 600]], '#e8641e', 8, 1.3, { double: true });
    sign.position.set(-678.3, 1.5, -256); sign.rotation.y = Math.PI / 2; group.add(sign);
    // the stand: about half the seats, mixed colours
    const fans = grandstandSeats().filter(() => R() < 0.55).map((s) => ({ ...s, m: crowd.add(R, R() < 0.5, [TEAMS[Math.floor(R() * TEAMS.length)][0], '#f4f4f1', '#1f1f22'][Math.floor(R() * 3)]), ph: R() * 6 }));
    group.add(crowd.finish());
    built = { crowd, squads, judges, fans };
  }

  let t = 0, prevTime = null;
  function start() {
    if (!built) build();
    t = 0; built.crowd.hideAll();
    prevTime = getTime(); setTime(16.5);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
  function update(dt, dtReal) {
    t += dtReal;
    const { crowd, squads, judges, fans } = built;
    const ROUTINE = 48, cur = Math.floor(t / ROUTINE) % squads.length, rt = t % ROUTINE;
    const beat = (t * BPM) / 60, bp = Math.floor(beat) % 4;
    const fi = Math.min(FORMS.length - 1, Math.floor(rt / 11)), ft = rt - fi * 11, prev = FORMS[(fi + FORMS.length - 1) % FORMS.length], next = FORMS[fi];
    const k = ease(Math.min(1, ft / 2.5));
    squads.forEach((sq, si) => {
      const performing = si === cur;
      // waiting squads stand in lines at the north and south ends of the pitch, facing the action
      const wait = (si - cur + squads.length) % squads.length;
      sq.members.forEach((mb, i) => {
        if (!performing) {
          const end = wait % 2 ? -1 : 1, x = -650 + (i % 10) * 1.4 + Math.floor(wait / 2) * 4, z = -256 + end * (38 + Math.floor(i / 10) * 1.4);
          crowd.place(mb.m, x, 0.27, z, end > 0 ? Math.PI : 0, 0, Math.sin(t * 2 + i) > 0.6 ? -2.6 : 0);
          return;
        }
        const a = rt < 2.5 ? [((i % 10) - 4.5) * 1.6, 9 + Math.floor(i / 10) * 1.5] : prev[i], b = next[i];
        const u = a[0] + (b[0] - a[0]) * k, v = a[1] + (b[1] - a[1]) * k;
        const flyer = fi === 3 && b[2] && ft > 3 && ft < 9.5;
        const moving = k < 1;
        if (moving) mb.m.phase += 3 * Math.PI * dtReal;
        // arm motions on the beat: high V, T, punch up, down; jumps on beat 4 of each bar in the first two forms
        const arm = flyer ? -2.9 : moving ? null : [-2.8, -1.57, -2.4, -0.3][bp];
        const jump = !moving && fi < 2 && bp === 3 ? Math.sin((beat % 1) * Math.PI) * 0.5 : 0;
        const lift = flyer ? 1.55 + Math.sin(ft * 3) * 0.05 : 0;
        crowd.place(mb.m, C[0] + v, 0.27 + jump + lift, C[1] + u, -Math.PI / 2, moving ? Math.sin(mb.m.phase) : 0, arm);
      });
    });
    for (const j of judges) crowd.place(j.m, j.x, 0.2, j.z, Math.PI / 2, 0, Math.sin(t * 0.4 + j.z) > 0.8 ? -1 : 0);
    const big = (rt > 41 && rt < 47) || ((t % ROUTINE) < 1);
    for (const f of fans) {
      f.ph += dtReal * 6;
      crowd.place(f.m, f.x, f.y + (big ? 0.35 : 0), f.z, f.yaw, 0, big ? -2.8 + 0.2 * Math.sin(f.ph) : Math.sin(f.ph * 0.2 + f.col) > 0.85 ? -1.4 : 0);
    }
    crowd.flush();
    const label = ['ตั้งแถว', 'แปรขบวนรูปตัววี', 'แปรขบวนวงกลม', 'ต่อตัวพีระมิด'][fi];
    say(`แคแสดสัมพันธ์ · สนามกีฬากลาง สจล. · ${squads[cur].name} กำลังแสดง: ${label} · ทีมถัดไปรอที่ขอบสนาม`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(-650, 0, -256) : null), view: { dist: 75, polar: 62, az: 90 } };
}
