// วันพยาบาลแห่งชาติ (21 October): the Faculty of Nursing with the Faculty of Dentistry gives free health checks (blood
// pressure, blood sugar, body fat) and free dental care to the public at the Faculty of Dentistry building (see
// events.md). Check-up tents in the car park south of the building with nurses in white and caps; people
// register, queue at each station, sit for the check, then either leave or go on into the building for the
// dental care. The source names the services and the building, not the layout.
//
// x = east, z = south, y = up. Faculty of Dentistry x 219..281, z -388..-343 (its south face at z -343); the car
// park south of it x 198..269, z -339..-307, a road across it at z ~-331.
import * as THREE from 'three';
import { rng } from './builders.js';
import { Crowd } from './crowd.js';
import { tent, textBoard } from './props.js';

// stations along the car park, west to east: [x, label]; the tents face south, away from the building
const STATIONS = [[208, 'ลงทะเบียน'], [216, 'วัดความดัน'], [224, 'ตรวจน้ำตาลในเลือด'], [232, 'วัดไขมันในร่างกาย'], [240, 'ให้คำปรึกษา']];
const TENT_Z = -324, DOOR = [250, -342];
const NURSE = '#ffffff', CAP = [['#ffffff', 0, 0, 1.7, 0.02, 0.22, 0.08, 0.16, 0]];

export function buildNurseDay({ say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  function build() {
    const R = rng(2110);
    const crowd = new Crowd();
    const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m); return m; };
    const nurses = [];
    for (const [x, label] of STATIONS) {
      tent(group, x, TENT_Z, 0, { cloth: '#2f8fd1' });
      const sign = textBoard([[label, 1, '#ffffff']], '#2f8fd1', 2.8, 0.45, { double: true });
      sign.position.set(x, 2.55, TENT_Z + 1.55); group.add(sign);
      box(0.45, 0.45, 0.45, std('#7a7f85'), x, 0.42, TENT_Z + 1.75);                          // patient's stool
      nurses.push({ m: crowd.add(R, true, NURSE, NURSE, CAP), x, z: TENT_Z + 0.3 });
    }
    const banner = textBoard([['บริการตรวจสุขภาพและทันตกรรมฟรี', 0.6, '#1f3f7a'], ['วันพยาบาลแห่งชาติ 21 ตุลาคม · คณะพยาบาลศาสตร์ และคณะทันตแพทยศาสตร์', 0.4, '#2f6fb0', 600]], '#e6f3ff', 16, 1.6, { double: true });
    banner.position.set(224, 3.6, TENT_Z - 2.2); group.add(banner);
    for (const x of [216.4, 231.6]) box(0.08, 3.6, 0.08, std('#d9d9d6'), x, 1.8, TENT_Z - 2.2);
    // a dental-care queue sign at the building door
    const dsign = textBoard([['ทันตกรรมฟรี →', 1, '#ffffff']], '#6a3f9e', 2.6, 0.5, { double: true });
    dsign.position.set(DOOR[0] - 3, 1.8, DOOR[1] + 1.5); group.add(dsign);
    box(0.06, 1.6, 0.06, std('#d9d9d6'), DOOR[0] - 3, 0.8, DOOR[1] + 1.5);
    // the public: mostly older people, some staff and students
    const people = Array.from({ length: 70 }, () => ({ m: crowd.add(R, R() < 0.6, ['#e8a33d', '#7a7f85', '#3f8fd1', '#c0392b', '#f0e0b0', '#2fa37a', '#f4f4f1'][Math.floor(R() * 7)]) }));
    group.add(crowd.finish());
    built = { crowd, nurses, people };
  }

  let t = 0, prevTime = null, checked = 0, dental = 0;
  function start() {
    if (!built) build();
    t = 0; checked = 0; dental = 0; built.crowd.hideAll();
    built.people.forEach((p, i) => { p.state = 'arrive'; p.st = 0; p.x = 190 + Math.random() * 6; p.z = -305 - Math.random() * 4; p.delay = i * 2.2; p.yaw = 0; });
    prevTime = getTime(); setTime(9);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  const walk = (p, tx, tz, dt, v = 0.9) => {
    const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
    if (d < 0.2) return true;
    const s = Math.min(d, v * dt); p.x += (dx / d) * s; p.z += (dz / d) * s; p.yaw = Math.atan2(dx, dz); p.m.phase += (v / 0.65) * Math.PI * dt;
    return false;
  };

  function update(dt) {
    t += dt;
    const { crowd, nurses, people } = built;
    // each station seats one person at a time; the rest queue south of it in a line
    const seat = STATIONS.map(() => null), queues = STATIONS.map(() => []);
    for (const p of people) if (p.state === 'queue' || p.state === 'sit') (p.state === 'sit' ? (seat[p.st] = p) : queues[p.st].push(p));
    for (const p of people) {
      if (p.state === 'arrive') {
        if (t < p.delay) { crowd.hide(p.m); continue; }
        p.state = 'queue'; p.st = 0;
      }
      if (p.state === 'queue') {
        const q = queues[p.st].indexOf(p), [sx] = STATIONS[p.st];
        if (q === 0 && !seat[p.st]) { p.state = 'sit'; seat[p.st] = p; p.wait = 5 + Math.random() * 3; }
        const tx = sx, tz = TENT_Z + 3.4 + Math.max(0, q) * 0.8;
        const there = walk(p, p.state === 'sit' ? sx : tx, p.state === 'sit' ? TENT_Z + 1.75 : tz, dt);
        crowd.place(p.m, p.x, 0.22, p.z, there ? Math.PI : p.yaw, there ? 0 : Math.sin(p.m.phase));
      } else if (p.state === 'sit') {
        const [sx] = STATIONS[p.st];
        if (walk(p, sx, TENT_Z + 1.75, dt)) {
          p.wait -= dt;
          crowd.place(p.m, p.x, -0.08, p.z, Math.PI, 0, p.st === 1 ? -1.4 : -0.3);                 // seated; arm out for the cuff
          if (p.wait <= 0) {
            seat[p.st] = null;
            if (p.st < STATIONS.length - 1) { p.st++; p.state = 'queue'; }
            else { checked++; p.state = Math.random() < 0.5 ? 'dental' : 'leave'; }
          }
        } else crowd.place(p.m, p.x, 0.22, p.z, p.yaw, Math.sin(p.m.phase));
      } else if (p.state === 'dental') {
        if (walk(p, DOOR[0] + (Math.random() - 0.5) * 0.1, DOOR[1], dt)) { dental++; p.state = 'inside'; p.wait = 30; crowd.hide(p.m); continue; }
        crowd.place(p.m, p.x, 0.22, p.z, p.yaw, Math.sin(p.m.phase));
      } else if (p.state === 'inside') {
        p.wait -= dt; crowd.hide(p.m);
        if (p.wait <= 0) { p.state = 'leave'; p.x = DOOR[0]; p.z = DOOR[1] + 0.5; }
      } else if (p.state === 'leave') {
        if (walk(p, 290, -320, dt)) { p.state = 'arrive'; p.delay = t + 20 + Math.random() * 40; p.x = 190 + Math.random() * 6; p.z = -305 - Math.random() * 4; crowd.hide(p.m); continue; }
        crowd.place(p.m, p.x, 0.22, p.z, p.yaw, Math.sin(p.m.phase));
      }
    }
    nurses.forEach((n, i) => crowd.place(n.m, n.x, 0.22, n.z, 0, 0, seat[i] ? -1.1 + 0.15 * Math.sin(t * 2 + i) : -0.3));
    crowd.flush();
    say(`วันพยาบาลแห่งชาติ · ตรวจสุขภาพฟรีหน้าคณะทันตแพทยศาสตร์ · ตรวจครบทุกจุดแล้ว ${checked} คน · เข้ารับทันตกรรม ${dental} คน`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(228, 0, -326) : null), view: { dist: 60, polar: 58, az: 20 } };
}
