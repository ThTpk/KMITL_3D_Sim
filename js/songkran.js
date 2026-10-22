// สงกรานต์ / รดน้ำขอพรผู้ใหญ่ (April, before the Thai New Year holiday; held at the Office of the President, the
// Innovation building and the King Rama IV royal history hall in 2025; see events.md). In front of the Office of
// the President: elders seated under an awning while staff and students in Thai dress queue to pour scented water
// over their hands; a procession with a Buddha image on a float and long drums comes along the lawn south of the
// building; on the lawn, students in flowered shirts play with water guns and bowls, the spray arcing in the sun.
// The sources give the ceremony and the buildings, not the layout.
//
// x = east, z = south, y = up. Office of the President x -72..-6, z -338..-316 (its south face at z -316); the lawn
// (OSM recreation ground) x -112..-29, z -313..-276; a footway along z -313.
import * as THREE from 'three';
import { rng } from './builders.js';
import { Path } from './traffic.js';
import { Crowd } from './crowd.js';
import { tent, textBoard } from './props.js';
import { Spray } from './scenekit.js';

const THAI = [['#d9a43a', '#7a1f3d'], ['#e889b0', '#5a2d82'], ['#f2d27a', '#a3242a'], ['#9fd3c7', '#1f4f5c'], ['#c9a0dc', '#7a5a12'], ['#ffffff', '#2e7d4f']];
const FLORAL = ['#3fa7d6', '#f28c28', '#e05a7a', '#58b947', '#f7d35c', '#9a6bff'];   // flowered Songkran shirts
const ELDERS_Z = -312.5, QUEUE_Z = -307;

export function buildSongkran({ say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  function build() {
    const R = rng(1304);
    const crowd = new Crowd();
    const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m); return m; };

    // ===== awning with the elders on a row of chairs, a long table of water bowls =====
    const awning = std('#f2d27a');
    box(26, 0.12, 6, awning, -39, 3.2, -312);
    for (const x of [-51.5, -39, -26.5]) for (const z of [-314.8, -309.2]) box(0.12, 3.2, 0.12, std('#d9d9d6'), x, 1.6, z);
    box(24, 0.06, 5, std('#a3171f', { roughness: 0.9 }), -39, 0.23, -312);                   // carpet
    const elders = [];
    for (let i = 0; i < 10; i++) {
      const x = -50 + i * 2.4;
      box(0.6, 0.45, 0.6, std('#c9a227'), x, 0.45, ELDERS_Z - 0.4);                            // chair
      box(0.9, 0.12, 0.6, std('#ffffff'), x, 0.6, ELDERS_Z + 1.0);                              // bowl stand
      elders.push({ m: crowd.add(R, i % 2 === 1, i % 3 ? '#ffffff' : '#f2d27a', i % 2 ? '#3a2a1a' : undefined), x, z: ELDERS_Z });
    }
    const banner = textBoard([['สืบสานประเพณีสงกรานต์ รดน้ำขอพรผู้ใหญ่', 0.6, '#7a1f3d'], ['KMITL Songkran Festival', 0.4, '#a3242a', 600]], '#fff3c4', 18, 1.6, { double: true });
    banner.position.set(-39, 4.2, -309.1); group.add(banner);

    // ===== a queue to pour water: walks up to each elder in turn =====
    const pourers = [];
    for (let i = 0; i < 40; i++) {
      const female = R() < 0.6, [sh, sk] = THAI[Math.floor(R() * THAI.length)];
      pourers.push({ m: crowd.add(R, female, sh, female ? sk : undefined, [['#d9a43a', 0, 0, 1.05, 0.32, 0.2, 0.1, 0.2, 0]]), q: i, x: 0, z: 0, yaw: 0 });
    }

    // ===== procession: float with a Buddha image, long drums, dancers =====
    const float = new THREE.Group(); group.add(float);
    const fb = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; float.add(m); };
    fb(2.4, 0.9, 4, std('#a3242a'), 0, 0.75, 0); fb(1.6, 0.3, 1.6, std('#d9a43a', { metalness: 0.6, roughness: 0.3 }), 0, 1.35, 0);
    const buddha = new THREE.Mesh(new THREE.LatheGeometry([[0.45, 0], [0.5, 0.15], [0.35, 0.4], [0.3, 0.75], [0.18, 0.9], [0.2, 1.05], [0.12, 1.25], [0, 1.45]].map(([a, b]) => new THREE.Vector2(a, b)), 14), std('#d6a83a', { metalness: 0.8, roughness: 0.3 }));
    buddha.position.set(0, 1.5, 0); buddha.castShadow = true; float.add(buddha);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) fb(0.1, 1.6, 0.1, std('#ffffff'), sx * 1.1, 2.3, sz * 1.8);
    fb(2.6, 0.08, 4.2, std('#f2d27a'), 0, 3.1, 0);
    const proc = [];
    for (let i = 0; i < 18; i++) {
      const drum = i < 4, female = !drum && R() < 0.7, [sh, sk] = THAI[i % THAI.length];
      proc.push({ m: crowd.add(R, female, drum ? '#a3242a' : sh, female ? sk : undefined, drum ? [['#8a5a3c', 0, 0, 1.0, 0.25, 0.3, 0.3, 0.7, 0]] : []), k: i, drum });
    }

    // ===== water play on the lawn =====
    const players = [];
    for (let i = 0; i < 70; i++) {
      const gun = R() < 0.6;
      const m = crowd.add(R, R() < 0.5, FLORAL[Math.floor(R() * FLORAL.length)], undefined, gun ? [[['#ff4fb0', '#40c8ff', '#ffd040'][i % 3], 0, 0, 1.12, 0.38, 0.12, 0.16, 0.45, 0]] : [['#d9d9d6', 0, 0, 1.1, 0.3, 0.28, 0.12, 0.28, 0]]);
      players.push({ m, gun, x: -105 + R() * 70, z: -306 + R() * 26, yaw: R() * 6.28, tx: 0, tz: 0, wait: R() * 3 });
    }
    // two water stations (barrels) the players refill at
    for (const [x, z] of [[-90, -290], [-55, -284]]) { box(0.9, 1.0, 0.9, std('#2f6fb0'), x, 0.7, z); tent(group, x, z - 2.5, 0, { cloth: '#3fa7d6', table: false }); }
    group.add(crowd.finish());
    const spray = new Spray(group, 1200);
    built = { crowd, elders, pourers, float, proc, players, spray };
  }

  let t = 0, prevTime = null, poured = 0;
  function start() {
    if (!built) build();
    t = 0; poured = 0; built.crowd.hideAll();
    built.pourers.forEach((p) => { p.state = 'queue'; p.e = 0; p.wait = 0; p.x = 0; });
    prevTime = getTime(); setTime(10.5);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  const walk = (a, tx, tz, v, dt) => {
    const dx = tx - a.x, dz = tz - a.z, d = Math.hypot(dx, dz);
    if (d < 0.15) return true;
    const st = Math.min(d, v * dt); a.x += (dx / d) * st; a.z += (dz / d) * st; a.yaw = Math.atan2(dx, dz);
    a.m.phase += (v / 0.65) * Math.PI * dt;
    return false;
  };

  function update(dt, dtReal) {
    t += dt;
    const { crowd, elders, pourers, float, proc, players, spray } = built;
    for (const e of elders) crowd.place(e.m, e.x, -0.1, e.z, 0, 0, -0.6);     // seated (sunk into the chair), hands out

    // queue: a line west of the awning; whoever is at the front walks along the row, pours at each elder and
    // leaves to the east; the next one starts once the one ahead has reached the third elder
    let canStart = pourers.every((p) => (p.state !== 'row' && p.state !== 'pour') || p.e >= 2);
    let slot = 0;
    for (const p of pourers) {
      if (p.state === 'queue') {
        const qx = -54 - slot * 0.8; slot++;
        if (canStart && slot === 1) { p.state = 'row'; p.e = 0; canStart = false; }
        if (!p.x) { p.x = qx; p.z = QUEUE_Z; }
        walk(p, qx, QUEUE_Z, 1, dt);
        crowd.place(p.m, p.x, 0.25, p.z, Math.PI / 2, 0, -0.9);
      } else if (p.state === 'row') {
        const e = elders[p.e];
        if (walk(p, e.x, ELDERS_Z + 1.7, 0.9, dt)) { p.state = 'pour'; p.wait = 2.2; }
        crowd.place(p.m, p.x, 0.25, p.z, p.yaw, Math.sin(p.m.phase), -0.9);
      } else if (p.state === 'pour') {
        p.wait -= dt;
        const e = elders[p.e];
        crowd.place(p.m, p.x, 0.25 - 0.15, p.z, Math.PI, 0, -1.3);              // facing the elder, bowing a little
        if (Math.random() < dt * 25) spray.emit(e.x + (Math.random() - 0.5) * 0.2, 1.05, e.z + 0.45, 0, -1, 0.4, 0.5, 0.2);
        if (p.wait <= 0) { poured++; p.e++; p.state = p.e < elders.length ? 'row' : 'out'; }
      } else if (p.state === 'out') {
        if (walk(p, -20, -300, 1.1, dt)) { p.state = 'queue'; p.x = -60 - slot * 0.8; p.z = QUEUE_Z; }   // back to the end of the line
        crowd.place(p.m, p.x, 0.25, p.z, p.yaw, Math.sin(p.m.phase));
      }
    }

    // procession: a loop round the lawn every 90 s
    const loop = built.loop ??= new Path([[-108, -300], [-40, -300], [-40, -282], [-108, -282], [-108, -300]].map(([x, z]) => [x, 0, z]));
    const per = loop.L, u = t * 1.0, Q = {};
    const pointAt = (s) => { loop.at(((s % per) + per) % per, Q); return [Q.x, Q.z, Math.atan2(Q.tx, Q.tz)]; };
    const [fx, fz, fyaw] = pointAt(u);
    float.position.set(fx, 0, fz); float.rotation.y = fyaw;
    for (const p of proc) {
      const [x, z, yaw] = pointAt(u - 4 - Math.floor(p.k / 2) * 1.3);
      const side = (p.k % 2 ? 1 : -1) * 0.7;
      p.m.phase += 2.2 * Math.PI * dt;
      crowd.place(p.m, x + Math.cos(yaw) * side, 0.25, z - Math.sin(yaw) * side, yaw, Math.sin(p.m.phase) * 0.6, p.drum ? -0.9 + 0.25 * Math.sin(t * 9 + p.k) : -1.6 + 0.5 * Math.sin(t * 3 + p.k));   // drumming, dancing (ฟ้อน)
    }

    // water play: wander to a spot, then squirt at the nearest person
    for (const a of players) {
      if (a.wait > 0) {
        a.wait -= dt;
        const o = players[(players.indexOf(a) * 7 + 3) % players.length];
        const dx = o.x - a.x, dz = o.z - a.z, d = Math.hypot(dx, dz) || 1;
        a.yaw = Math.atan2(dx, dz);
        crowd.place(a.m, a.x, 0.25, a.z, a.yaw, 0, -1.4);
        if (Math.random() < dt * (a.gun ? 30 : 6)) spray.emit(a.x + (dx / d) * 0.5, 1.2, a.z + (dz / d) * 0.5, dx / d, dz / d, a.gun ? 8 : 4, a.gun ? 0.08 : 0.5, a.gun ? 1.5 : 2.5);
        if (a.wait <= 0) { a.tx = -105 + Math.random() * 70; a.tz = -306 + Math.random() * 26; }
      } else {
        if (walk(a, a.tx, a.tz, 1.6, dt)) a.wait = 2 + Math.random() * 5;
        crowd.place(a.m, a.x, 0.25, a.z, a.yaw, Math.sin(a.m.phase), -1.0);
      }
    }
    spray.update(dt);
    crowd.flush();
    say(`สงกรานต์ สจล. · รดน้ำขอพรผู้ใหญ่หน้าสำนักงานอธิการบดี (รดแล้ว ${poured} ครั้ง) · ขบวนแห่พระพุทธรูปและกลองยาว · เล่นน้ำบนสนามหญ้า`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(-58, 0, -300) : null), view: { dist: 95, polar: 58, az: 20 } };
}
