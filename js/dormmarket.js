// ตลาดหอใน (the dormitory-area evening market; Tuesdays and Thursdays 16:00-20:00 by one student blog; see events.md):
// food stalls and carts along the footway east of dormitory buildings 9-11 and past building 12, under string
// lights at dusk, with smoke off the grills; students from the dorms in casual clothes stroll up and down,
// stop to buy and walk off with a bag. The source gives the area and the hours, not the stalls.
//
// x = east, z = south, y = up. Dorms 9-11 x -389..-327, z -161..-102; dorm 12 x -388..-337, z -97..-80; the footway
// along their east side at x ~-322 from z -160 to -76 (OSM).
import * as THREE from 'three';
import { rng } from './builders.js';
import { Crowd } from './crowd.js';
import { tent } from './props.js';
import { Amblers, Spray, lightCloud, stringLights, groundGlow } from './scenekit.js';

const X = -322, STALL_X = -317.4, Z0 = -156, Z1 = -82;
const CASUAL = ['#3f8fd1', '#e8a33d', '#2fa37a', '#d94f70', '#7a7f85', '#1f1f22', '#f4f4f1', '#6a4fb3', '#c0392b'];
const CLOTH = ['#c0392b', '#e8641e', '#2f6fb0', '#2e7d4f', '#d9a43a', '#6a4fb3'];

export function buildDormMarket({ say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  function build() {
    const R = rng(4242);
    const crowd = new Crowd();
    const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m); return m; };
    const bulbs = [], stalls = [], grills = [];
    for (let z = Z0; z <= Z1; z += 3.4) {
      const cart = R() < 0.3;
      if (cart) {                                                        // a push cart with a little roof
        box(1.8, 0.9, 1.0, std(CLOTH[Math.floor(R() * CLOTH.length)]), STALL_X + 0.3, 0.75, z);
        box(2.0, 0.06, 1.4, std('#f4f1ea'), STALL_X + 0.3, 2.2, z);
        for (const dz of [-0.6, 0.6]) box(0.05, 1.0, 0.05, std('#cfd2d6'), STALL_X + 1.1, 1.7, z + dz);
      } else tent(group, STALL_X, z, -Math.PI / 2, { cloth: CLOTH[Math.floor(R() * CLOTH.length)] });
      const grill = R() < 0.45;
      if (grill) { box(1.0, 0.12, 0.5, std('#2b2b2b'), STALL_X - 0.9, 0.95, z); grills.push([STALL_X - 0.9, 1.05, z]); }
      for (let i = 0; i < 4; i++) box(0.25, 0.1 + R() * 0.15, 0.25, std(['#f2c230', '#ffffff', '#e8641e', '#8a5a3c'][i]), STALL_X - 0.9, 0.85, z - 0.9 + i * 0.6);
      stalls.push({ z, m: crowd.add(R, R() < 0.6, CASUAL[Math.floor(R() * CASUAL.length)]) });
      for (let i = 0; i < 4; i++) bulbs.push([STALL_X - 1.4, 2.3, z - 1.2 + i * 0.8, '#ffcf6b']);
      groundGlow(group, STALL_X - 1.5, z, 3, '#ffc070', 0.4);
    }
    stringLights(bulbs, [[X - 1.6, Z0 - 3], [X + 1.4, (Z0 + Z1) / 2], [X - 1.6, Z1 + 3]], 3.6, ['#ff6b6b', '#ffd36b', '#6bd0ff', '#9bff8a', '#ff9ad0'], 0.6, 4);
    lightCloud(group, bulbs, 1.5);
    // students from the dorms, some carrying a bag of food
    const am = new Amblers([[[X, Z0 - 6], [X, Z1 + 6]]]);
    for (let i = 0; i < 150; i++) {
      const bag = R() < 0.35;
      am.add(crowd.add(R, R() < 0.55, CASUAL[Math.floor(R() * CASUAL.length)], undefined, bag ? [['#f4f4f1', 0.25, 0, 0.75, 0.05, 0.22, 0.25, 0.12, 0]] : []), R, { width: 3.4, v: 0.75 });
    }
    group.add(crowd.finish());
    const smoke = new Spray(group, 500, '#9a9a9a', { size: 0.9, gravity: -0.6, life: 3.5, opacity: 0.25 });
    built = { crowd, stalls, grills, am, smoke };
  }

  let t = 0, prevTime = null;
  function start() {
    if (!built) build();
    t = 0; built.crowd.hideAll();
    prevTime = getTime(); setTime(18.75);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  function update(dt) {
    t += dt;
    const { crowd, stalls, grills, am, smoke } = built;
    am.update(crowd, dt);
    for (const s of stalls) crowd.place(s.m, STALL_X + 0.4, 0.22, s.z, -Math.PI / 2, 0, Math.sin(t * 1.5 + s.z) > 0.3 ? -1.0 : -0.4);   // cooking, serving
    for (const [x, y, z] of grills) if (Math.random() < dt * 6) smoke.emit(x + (Math.random() - 0.5) * 0.6, y, z + (Math.random() - 0.5) * 0.3, 0.3, 0, 0.3, 0.6, 0.6);
    smoke.update(dt);
    crowd.flush();
    say(`ตลาดหอใน · ทางเดินหน้าหอพักนักศึกษาอาคาร 9-12 · ร้านอาหารและรถเข็น ${stalls.length} ร้าน · นักศึกษาเดินซื้อของตอนเย็น`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(X, 0, -120) : null), view: { dist: 60, polar: 60, az: 70 } };
}
