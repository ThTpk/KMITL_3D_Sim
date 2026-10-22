// KMIDS Sports Day (November; the KMITL international demonstration school's sports day at the KMITL sports field,
// 19-20 Nov 2026 on its calendar; see events.md). Four colour houses sit in blocks in the west grandstand and cheer;
// sprint heats of eight run 60 m down the west straight in front of the stand to a finish tape; a tug of war goes
// back and forth on the infield. Children are smaller figures. House colours and events are ours.
//
// x = east, z = south, y = up. The west straight runs between the pitch (x -658) and the track's outer edge at x -668
// (OSM; the red track on the satellite image lies inside it); lane 1 is the inner one.
import * as THREE from 'three';
import { rng } from './builders.js';
import { Crowd } from './crowd.js';
import { textBoard } from './props.js';
import { grandstandSeats } from './scenekit.js';

const HOUSES = [['#c0392b', 'แดง'], ['#f2c230', 'เหลือง'], ['#2f6fb0', 'น้ำเงิน'], ['#2e7d4f', 'เขียว']];
const LANE = (k) => -659.6 - k * 1.15, START = -298, FINISH = -238;     // run south, finishing in front of the VIP stand
const KID = 0.72;

export function buildKmidsSports({ say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  function build() {
    const R = rng(1911);
    const crowd = new Crowd();
    const kid = (house, female = R() < 0.5) => { const m = crowd.add(R, female, HOUSES[house][0], female ? '#1e2740' : undefined); m.scale = KID; return m; };
    const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m); return m; };

    // houses in the stand: four blocks of columns
    const seats = grandstandSeats();
    const fans = seats.filter((s) => s.row < 9 || R() < 0.3).map((s) => ({ ...s, house: Math.min(3, Math.floor(s.col / 30)), ph: R() * 6 }))
      .map((s) => ({ ...s, m: s.row < 9 ? kid(s.house) : crowd.add(R, R() < 0.6, CLOTHES()) }));
    function CLOTHES() { return ['#f4f4f1', '#7a7f85', '#3f8fd1', '#e8a33d'][Math.floor(R() * 4)]; }
    // runners: eight lanes, one per house twice
    const runners = Array.from({ length: 8 }, (_, k) => ({ m: kid(k % 4), k, v: 0 }));
    // finish tape and posts, start line marks
    const post = std('#f4f4f1');
    for (const x of [LANE(-0.5), LANE(7.5)]) box(0.08, 1.2, 0.08, post, x, 0.6, FINISH);
    const tape = box(LANE(-0.5) - LANE(7.5), 0.04, 0.04, std('#e8641e'), (LANE(-0.5) + LANE(7.5)) / 2, 0.85, FINISH);
    for (const z of [START, FINISH]) box(LANE(-0.5) - LANE(7.5), 0.02, 0.1, std('#ffffff'), (LANE(-0.5) + LANE(7.5)) / 2, 0.28, z);
    const starter = { m: crowd.add(R, false, '#1f1f22'), x: -670.5, z: START - 3 };
    // tug of war on the infield: two houses, a rope, a flag in the middle
    const rope = box(20, 0.06, 0.06, std('#c9a227'), -626, 0.9, -256);
    const tugs = [];
    for (let i = 0; i < 16; i++) { const side = i < 8 ? -1 : 1; tugs.push({ m: kid(side < 0 ? 0 : 2), side, k: i % 8 }); }
    const sign = textBoard([['KMIDS Sports Day', 0.6, '#ffffff'], ['โรงเรียนสาธิตนานาชาติพระจอมเกล้าลาดกระบัง', 0.4, '#d6ecff', 600]], '#1f3f7a', 10, 1.6, { double: true });
    sign.position.set(-671, 1.6, FINISH + 3); sign.rotation.y = Math.PI / 2; group.add(sign);
    group.add(crowd.finish());
    built = { crowd, fans, runners, tape, starter, rope, tugs };
  }

  let t = 0, prevTime = null, heats = 0, wins = [0, 0, 0, 0];
  function start() {
    if (!built) build();
    t = 0; heats = 0; wins = [0, 0, 0, 0]; built.crowd.hideAll();
    prevTime = getTime(); setTime(9);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  function update(dt, dtReal) {
    t += dt;
    const { crowd, fans, runners, tape, starter, rope, tugs } = built;
    // a heat every 22 s: set 4 s, run (about 10-12 s), walk back
    const H = 22, ht = t % H, heat = Math.floor(t / H);
    if (heat !== heats) {
      heats = heat;
      const winner = runners.reduce((a, r) => (r.z > a.z ? r : a));
      wins[winner.k % 4]++;
      for (const r of runners) r.speed = 5 + Math.random() * 1.6;
    }
    let leader = null;
    for (const r of runners) {
      r.speed ??= 5 + Math.random() * 1.6;
      const run = ht - 4;
      if (run < 0) { r.z = START; crowd.place(r.m, LANE(r.k), 0.27, START, 0, 0, run > -1.5 ? -0.6 : 0); continue; }   // set
      r.z = Math.min(FINISH + 4, START + run * r.speed * (run < 1.5 ? run / 1.5 : 1));
      const done = r.z >= FINISH + 4;
      r.m.phase += (done ? 0 : r.speed / 1.2) * Math.PI * dt;
      crowd.place(r.m, LANE(r.k), 0.27, r.z, 0, done ? 0 : Math.sin(r.m.phase), done ? -2.8 : null);
      if (!leader || r.z > leader.z) leader = r;
    }
    tape.visible = !(leader && leader.z >= FINISH);
    crowd.place(starter.m, starter.x, 0.27, starter.z, 0, 0, ht > 3.5 && ht < 4.3 ? -2.9 : -0.3);
    // tug of war: the rope drifts one way then the other
    const pull = Math.sin(t * 0.35) * 2.2;
    rope.position.x = -626 + pull;
    for (const g of tugs) {
      const x = -626 + pull + g.side * (2 + g.k * 1.1), lean = g.side * 0.05;
      crowd.place(g.m, x, 0.27 - 0.08, -256 + (g.k % 2 ? 0.35 : -0.35), g.side > 0 ? -Math.PI / 2 : Math.PI / 2, lean, -1.45);
    }
    // the stand: houses wave and jump when their runner leads
    for (const f of fans) {
      f.ph += dtReal * 7;
      const cheering = leader && leader.k % 4 === f.house && ht > 4 && ht < 16;
      crowd.place(f.m, f.x, f.y + (cheering ? Math.abs(Math.sin(f.ph)) * 0.25 : 0), f.z, f.yaw, 0, cheering ? -2.8 + 0.2 * Math.sin(f.ph) : Math.sin(f.ph * 0.2 + f.col) > 0.8 ? -2.4 : 0);
    }
    crowd.flush();
    say(`KMIDS Sports Day · สนามกีฬากลาง สจล. · วิ่ง 60 เมตร รอบที่ ${heats + 1} · ชนะ: แดง ${wins[0]} เหลือง ${wins[1]} น้ำเงิน ${wins[2]} เขียว ${wins[3]} · ชักเย่อกลางสนาม`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(-660, 0, -262) : null), view: { dist: 80, polar: 60, az: 70 } };
}
