// ตลาดหอใน (the dormitory-area evening market; Tuesdays and Thursdays 16:00-20:00 by one student blog; see events.md):
// food stalls and carts in a row along the road from the three-way junction at the 7-Eleven west past the dormitories
// and the front of the sports hall (โรงยิม), then round the curved road beside the hall, under string lights at dusk,
// with smoke off the grills; students from the dorms in casual clothes stroll up and down, stop to buy and walk off
// with a bag. The source gives the area and the hours, not the stalls; the stretch of road is the user's.
//
// x = east, z = south, y = up. The service road runs from the curve's east end (-597, -63) past the hall's front
// (x -592..-500, south face z -77) through (-435, -67) to the junction with the road up past the 7-Eleven (-315, -70);
// the curve loops north round the hall's west lawn, (-597, -63) - (-611, -79) - (-636, -79) - (-645, -62) (OSM). The
// stalls stand on the road's north side facing it, clear of the covered railway walk on the south side (z -64..-60
// east of x -440), of dorm 12 (z -97..-80) and of the hall's entrance portico (x -590..-578); round the curve they
// stand on its outer side, along the north stretch and the west leg (the east leg runs too close to the hall). The
// paved island inside the curve (x -638..-604, z -77..-65) is filled with two rows back to back, one facing the road
// in front of the hall and one facing the curve. The campus fence is only ~3 m south of the road, so no stalls there.
import * as THREE from 'three';
import { rng } from './builders.js';
import { Crowd } from './crowd.js';
import { tent } from './props.js';
import { Amblers, Spray, lightCloud, stringLights, groundGlow } from './scenekit.js';

const MAIN = [[-645, -62], [-597, -63], [-500, -65], [-435, -67], [-315, -70]];
const CURVE = [[-608, -78.5], [-611, -79], [-636, -79], [-639, -78], [-641, -75], [-645, -62]];
// each row: the road line, the side the stalls stand on (+1 left of the line's direction, -1 right), where along it to
// start and stop (m), x ranges to leave open, and whether the shoppers walk that road
const ROWS = [
  { line: MAIN, side: 1, from: 10, to: 322, skip: [[-604.5, -575]], walk: true },   // across the island, then from past the portico
  { line: CURVE, side: -1, from: 1, to: 43, skip: [], walk: true },                 // stops short of the road west along z -62
  { line: [[-608, -79], [-640, -79]], side: 1, from: 1.5, to: 28.5, skip: [] },    // the island's north edge, facing the curve
];
const BACK = 5.2, STEP = 3.6;                         // stall centres BACK m from the road line, STEP m apart
const CASUAL = ['#3f8fd1', '#e8a33d', '#2fa37a', '#d94f70', '#7a7f85', '#1f1f22', '#f4f4f1', '#6a4fb3', '#c0392b'];
const CLOTH = ['#c0392b', '#e8641e', '#2f6fb0', '#2e7d4f', '#d9a43a', '#6a4fb3'];

// a point s m along a polyline with its unit direction
function along(line, s) {
  for (let i = 1; i < line.length; i++) {
    const [ax, az] = line[i - 1], [bx, bz] = line[i], l = Math.hypot(bx - ax, bz - az);
    if (s <= l || i === line.length - 1) { const k = Math.min(s, l) / l; return { x: ax + (bx - ax) * k, z: az + (bz - az) * k, tx: (bx - ax) / l, tz: (bz - az) / l }; }
    s -= l;
  }
}
const length = (line) => line.slice(1).reduce((L, [x, z], i) => L + Math.hypot(x - line[i][0], z - line[i][1]), 0);
// the line pushed d m to the stall side
const offset = (line, side, d) => line.map((_, i) => {
  const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [line[i][0] + side * ((b[1] - a[1]) / l) * d, line[i][1] - side * ((b[0] - a[0]) / l) * d];
});

export function buildDormMarket({ say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  function build() {
    const R = rng(4242);
    const crowd = new Crowd();
    const box = (w, h, d, mat, x, y, z, yaw) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.y = yaw; m.castShadow = m.receiveShadow = true; group.add(m); return m; };
    const bulbs = [], stalls = [], grills = [];
    for (const row of ROWS) {
      const L = Math.min(row.to, length(row.line));
      for (let s = row.from; s <= L; s += STEP) {
        const p = along(row.line, s), nx = row.side * p.tz, nz = -row.side * p.tx;   // unit normal to the stall side
        const x = p.x + nx * BACK, z = p.z + nz * BACK;
        if (row.skip.some(([a, b]) => x > a && x < b)) continue;
        const yaw = Math.atan2(-nx, -nz), c = Math.cos(yaw), sn = Math.sin(yaw);       // the stall faces the road
        const W = (lx, y, lz) => [x + lx * c + lz * sn, y, z - lx * sn + lz * c];      // stall-local (+z = front) to world
        const cart = R() < 0.3;
        if (cart) {                                                      // a push cart with a little roof
          box(1.8, 0.9, 1.0, std(CLOTH[Math.floor(R() * CLOTH.length)]), ...W(0, 0.75, -0.3), yaw);
          box(1.4, 0.06, 2.0, std('#f4f1ea'), ...W(0, 2.2, -0.3), yaw);
          for (const dx of [-0.6, 0.6]) box(0.05, 1.0, 0.05, std('#cfd2d6'), ...W(dx, 1.7, -1.1), yaw);
        } else tent(group, x, z, yaw, { cloth: CLOTH[Math.floor(R() * CLOTH.length)] });
        if (R() < 0.45) { box(0.5, 0.12, 1.0, std('#2b2b2b'), ...W(0, 0.95, 0.9), yaw); grills.push(W(0, 1.05, 0.9)); }
        for (let i = 0; i < 4; i++) box(0.25, 0.1 + R() * 0.15, 0.25, std(['#f2c230', '#ffffff', '#e8641e', '#8a5a3c'][i]), ...W(-0.9 + i * 0.6, 0.85, 0.9), yaw);
        const [vx, , vz] = W(0, 0, -0.4);
        stalls.push({ x: vx, z: vz, yaw, m: crowd.add(R, R() < 0.6, CASUAL[Math.floor(R() * CASUAL.length)]) });
        for (let i = 0; i < 4; i++) bulbs.push([...W(-1.2 + i * 0.8, 2.3, 1.4), '#ffcf6b']);
        const [gx, , gz] = W(0, 0, 1.5);
        groundGlow(group, gx, gz, 3, '#ffc070', 0.4);
      }
      // a string of coloured bulbs swagged along the front of the row
      const swag = [], SL = Math.min(row.to, length(row.line));
      for (let s = Math.max(0, row.from - 3), k = 0; s <= SL + 3; s += 12, k++) {
        const p = along(row.line, s), d = BACK - 2.2 - (k % 2 ? 1.2 : 0);
        swag.push([p.x + row.side * p.tz * d, p.z - row.side * p.tx * d]);
      }
      stringLights(bulbs, swag, 3.6, ['#ff6b6b', '#ffd36b', '#6bd0ff', '#9bff8a', '#ff9ad0'], 0.6, 4);
    }
    lightCloud(group, bulbs, 1.5);
    // students from the dorms walk the road in front of the stalls, some carrying a bag of food
    const walks = ROWS.filter((r) => r.walk).map((r) => offset(r.line, r.side, 1.5));
    const am = new Amblers(walks);
    const share = length(MAIN) / (length(MAIN) + length(CURVE));
    for (let i = 0; i < 340; i++) {
      const bag = R() < 0.35;
      am.add(crowd.add(R, R() < 0.55, CASUAL[Math.floor(R() * CASUAL.length)], undefined, bag ? [['#f4f4f1', 0.25, 0, 0.75, 0.05, 0.22, 0.25, 0.12, 0]] : []), R, { path: R() < share ? 0 : 1, width: 3.6, v: 0.75 });
    }
    group.add(crowd.finish());
    const smoke = new Spray(group, 1000, '#9a9a9a', { size: 0.9, gravity: -0.6, life: 3.5, opacity: 0.25 });
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
    for (const s of stalls) crowd.place(s.m, s.x, 0.22, s.z, s.yaw, 0, Math.sin(t * 1.5 + s.x + s.z) > 0.3 ? -1.0 : -0.4);   // cooking, serving
    for (const [x, y, z] of grills) if (Math.random() < dt * 6) smoke.emit(x + (Math.random() - 0.5) * 0.4, y, z + (Math.random() - 0.5) * 0.4, 0.3, 0, 0.3, 0.6, 0.6);
    smoke.update(dt);
    crowd.flush();
    say(`ตลาดหอใน · ริมถนนจากสามแยก 7-Eleven ผ่านหอพักและหน้าโรงยิม ถึงถนนโค้งข้างโรงยิม · ร้านอาหารและรถเข็น ${stalls.length} ร้าน · นักศึกษาเดินซื้อของตอนเย็น`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(-485, 0, -70) : null), view: { dist: 210, polar: 58, az: 15 } };
}
