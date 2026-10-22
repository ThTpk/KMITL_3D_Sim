// Freshy Music KMITL (October; the Office of Student Affairs' concert for the freshmen, held at the activity ground
// beside the sports centre's field in 2024; see events.md): a night concert. A stage at the north end of the
// artificial-turf pitch next to the central stadium, a student band, and several hundred freshmen in uniform
// packed in front, jumping on the beat with their arms up and phone lights waving. The ground is the nearest
// open pitch to the stadium; the source names the area, not the stage.
//
// x = east, z = south, y = up. The pitch (OSM "สนามฟุตบอลหญ้าเทียม") x -569..-539, z -160..-111.
import * as THREE from 'three';
import { rng } from './builders.js';
import { Crowd } from './crowd.js';
import { stage, lightCloud } from './scenekit.js';

const CX = -554, FRONT = -151.5, BPM = 124;
const SHOP = ['#1f2f52', '#5a1f27', '#28452e', '#2a2f38', '#e8641e'];

export function buildFreshyMusic({ say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;

  function build() {
    const R = rng(1010);
    const crowd = new Crowd();
    const st = stage(group, { cx: CX, z: FRONT, w: 18, d: 6, face: 1, title: 'FRESHY MUSIC KMITL', sub: 'ต้อนรับน้องใหม่ · สำนักงานกิจการนักศึกษา', bg: '#10203a', fg: '#7fe3ff' });
    // band: singer at the front, guitars either side, drums and keys at the back (stage frame: x along, z back)
    const band = [[0, 1.2, 'sing'], [-4.5, 2.2, 'guitar'], [4.5, 2.2, 'guitar'], [-2, 4.3, 'drum'], [3, 4.3, 'keys']].map(([x, z, role]) => {
      const [wx, wz] = st.at(x, z);
      return { m: crowd.add(R, role === 'sing' && R() < 0.5, '#1b1c1f'), x: wx, z: wz, role, ph: R() * 6 };
    });
    // the crowd: freshmen in uniform, some in faculty workshop shirts, packed denser near the stage
    const fans = [], phones = [];
    for (let i = 0; i < 420; i++) {
      const d = Math.pow(R(), 1.6) * 34, x = CX + (R() - 0.5) * 26 * (0.6 + d / 60);
      const z = FRONT + 3 + d;
      if (x < -568 || x > -540 || z > -112) continue;
      const female = R() < 0.5, shirt = !female && R() < 0.25 ? SHOP[Math.floor(R() * SHOP.length)] : '#f4f4f1';
      const f = { m: crowd.add(R, female, shirt), x, z, yaw: Math.atan2(CX - x, FRONT - z) + (R() - 0.5) * 0.3, ph: R() * 0.25, phone: R() < 0.3, sway: R() * 6 };
      fans.push(f);
      if (f.phone) phones.push(f);
    }
    group.add(crowd.finish());
    // phone torches: a point of light above each raised hand
    const lights = lightCloud(group, phones.map(() => [0, -50, 0, '#ffffff']), 0.8);
    built = { crowd, st, band, fans, phones, lights };
  }

  let t = 0, prevTime = null;
  function start() {
    if (!built) build();
    t = 0; built.crowd.hideAll();
    prevTime = getTime(); setTime(20);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  function update(dt, dtReal) {
    t += dtReal;                                                   // music keeps real time whatever the speed
    const { crowd, st, band, fans, phones, lights } = built;
    st.update(t);
    const beat = (t * BPM) / 60, bp = beat % 1, song = Math.floor(t / 40) % 3;   // three songs: a jumper, a sway, a jumper
    const jumpy = song !== 1;
    for (const b of band) {
      const y = st.top;
      if (b.role === 'sing') crowd.place(b.m, b.x + Math.sin(t * 0.4) * 2, y, b.z, 0, 0, bp < 0.5 && jumpy ? -2.8 : -1.4);
      else if (b.role === 'drum') crowd.place(b.m, b.x, y, b.z, 0, 0, -0.9 + 0.4 * Math.sin(beat * Math.PI * 2));
      else crowd.place(b.m, b.x, y + (jumpy ? Math.max(0, Math.sin(beat * Math.PI * 2)) * 0.15 : 0), b.z, 0, 0, -0.8 + 0.15 * Math.sin(t * 8 + b.ph));
    }
    for (const f of fans) {
      // jump on the beat (each a little late), or sway with arms up for the slow song
      const k = (beat - f.ph) % 1;
      const hop = jumpy ? Math.max(0, Math.sin(k * Math.PI * 2)) * 0.35 : 0;
      const sway = jumpy ? 0 : Math.sin(t * 1.6 + f.x * 0.2) * 0.25;
      const arm = f.phone || !jumpy ? -2.7 + 0.15 * Math.sin(t * 2 + f.sway) : k < 0.5 ? -2.8 : -1.6;
      crowd.place(f.m, f.x + sway, 0.22 + hop, f.z, f.yaw, 0, arm);
      f.top = 0.22 + hop + 2.05;
    }
    const pos = lights.geometry.attributes.position.array;
    phones.forEach((f, i) => { pos[i * 3] = f.x + Math.sin(f.yaw) * 0.3 + (jumpy ? 0 : Math.sin(t * 1.6 + f.x * 0.2) * 0.25); pos[i * 3 + 1] = f.top; pos[i * 3 + 2] = f.z + Math.cos(f.yaw) * 0.3; });
    lights.geometry.attributes.position.needsUpdate = true;
    crowd.flush();
    say(`Freshy Music KMITL · ลานกิจกรรมข้างสนามกีฬากลาง · น้องใหม่ ${fans.length} คน · ${jumpy ? 'เพลงเร็ว กระโดดตามจังหวะ' : 'เพลงช้า เปิดไฟฉายโทรศัพท์'}`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(CX, 0, -138) : null), view: { dist: 70, polar: 62, az: 20 } };
}
