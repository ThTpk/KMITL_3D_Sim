// ตลาดหอใน (the dormitory-area evening market; Tuesdays and Thursdays 16:00-20:00 by one student blog; see events.md):
// food stalls and carts in a row along the road from the sports hall (โรงยิม) east to the dormitories and the
// three-way junction at the 7-Eleven, under string lights at dusk, with smoke off the grills; students from the
// dorms in casual clothes stroll up and down, stop to buy and walk off with a bag. The source gives the area and the
// hours, not the stalls; the stretch of road is the user's.
//
// x = east, z = south, y = up. The service road runs from the hall's east end (x -500, z -65) through (-435, -67)
// to the junction with the road up past the 7-Eleven (-315, -70) (OSM). The stalls stand on its north side facing
// the road, clear of the covered railway walk on the south side (z -64..-60 east of x -440) and of dorm 12 (z -97..-80).
import * as THREE from 'three';
import { rng } from './builders.js';
import { Crowd } from './crowd.js';
import { tent } from './props.js';
import { Amblers, Spray, lightCloud, stringLights, groundGlow } from './scenekit.js';

const ROAD = [[-500, -65], [-435, -67], [-315, -70]], X0 = -490, X1 = -322, BACK = 5.2;   // stall centres BACK m north of the road line
const roadZ = (x) => { for (let i = 1; i < ROAD.length; i++) { const [ax, az] = ROAD[i - 1], [bx, bz] = ROAD[i]; if (x <= bx) return az + ((x - ax) / (bx - ax)) * (bz - az); } return ROAD[ROAD.length - 1][1]; };
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
    for (let x = X0; x <= X1; x += 3.6) {
      const z = roadZ(x) - BACK;                                         // the stall faces south, onto the road
      const cart = R() < 0.3;
      if (cart) {                                                        // a push cart with a little roof
        box(1.8, 0.9, 1.0, std(CLOTH[Math.floor(R() * CLOTH.length)]), x, 0.75, z - 0.3);
        box(1.4, 0.06, 2.0, std('#f4f1ea'), x, 2.2, z - 0.3);
        for (const dx of [-0.6, 0.6]) box(0.05, 1.0, 0.05, std('#cfd2d6'), x + dx, 1.7, z - 1.1);
      } else tent(group, x, z, 0, { cloth: CLOTH[Math.floor(R() * CLOTH.length)] });
      const grill = R() < 0.45;
      if (grill) { box(0.5, 0.12, 1.0, std('#2b2b2b'), x, 0.95, z + 0.9); grills.push([x, 1.05, z + 0.9]); }
      for (let i = 0; i < 4; i++) box(0.25, 0.1 + R() * 0.15, 0.25, std(['#f2c230', '#ffffff', '#e8641e', '#8a5a3c'][i]), x - 0.9 + i * 0.6, 0.85, z + 0.9);
      stalls.push({ x, z, m: crowd.add(R, R() < 0.6, CASUAL[Math.floor(R() * CASUAL.length)]) });
      for (let i = 0; i < 4; i++) bulbs.push([x - 1.2 + i * 0.8, 2.3, z + 1.4, '#ffcf6b']);
      groundGlow(group, x, z + 1.5, 3, '#ffc070', 0.4);
    }
    // a string of coloured bulbs swagged along the front of the row
    const swag = [];
    for (let x = X0 - 3; x <= X1 + 3; x += 12) swag.push([x, roadZ(x) - BACK + 2.2 + (swag.length % 2 ? 1.2 : 0)]);
    stringLights(bulbs, swag, 3.6, ['#ff6b6b', '#ffd36b', '#6bd0ff', '#9bff8a', '#ff9ad0'], 0.6, 4);
    lightCloud(group, bulbs, 1.5);
    // students from the dorms walk the road in front of the stalls, some carrying a bag of food
    const am = new Amblers([[[X0 - 6, roadZ(X0 - 6) - 1.5], [-435, roadZ(-435) - 1.5], [X1 + 6, roadZ(X1 + 6) - 1.5]]]);
    for (let i = 0; i < 260; i++) {
      const bag = R() < 0.35;
      am.add(crowd.add(R, R() < 0.55, CASUAL[Math.floor(R() * CASUAL.length)], undefined, bag ? [['#f4f4f1', 0.25, 0, 0.75, 0.05, 0.22, 0.25, 0.12, 0]] : []), R, { width: 3.6, v: 0.75 });
    }
    group.add(crowd.finish());
    const smoke = new Spray(group, 800, '#9a9a9a', { size: 0.9, gravity: -0.6, life: 3.5, opacity: 0.25 });
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
    for (const s of stalls) crowd.place(s.m, s.x, 0.22, s.z - 0.4, 0, 0, Math.sin(t * 1.5 + s.x) > 0.3 ? -1.0 : -0.4);   // cooking, serving
    for (const [x, y, z] of grills) if (Math.random() < dt * 6) smoke.emit(x + (Math.random() - 0.5) * 0.3, y, z + (Math.random() - 0.5) * 0.6, 0.3, 0, 0.3, 0.6, 0.6);
    smoke.update(dt);
    crowd.flush();
    say(`ตลาดหอใน · ริมถนนจากโรงยิมถึงหอพัก สามแยก 7-Eleven · ร้านอาหารและรถเข็น ${stalls.length} ร้าน · นักศึกษาเดินซื้อของตอนเย็น`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set((X0 + X1) / 2, 0, roadZ((X0 + X1) / 2) - 3) : null), view: { dist: 140, polar: 58, az: 15 } };
}
