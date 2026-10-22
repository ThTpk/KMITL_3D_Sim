// งานเกษตรเจ้าคุณทหารแฟร์ / KMITL Agri Fair (ten days in February at the Faculty of Agricultural Technology; 6-15 Feb
// 2025 and 2026; see events.md): sales of fruit trees, flowering and ornamental plants, farm tools and machinery,
// pets and pet goods, factory products, food and drink, and the faculty's exhibitions. The sources name the faculty
// but not the layout, so the stalls are put in rows along the three roads of the car park south of its building
// (OSM service roads at z ~225, ~236 and ~253) and along the road on its west side, with a tractor display and a
// pen of goats and chickens on the strip between the car park's south road and the road beyond it (z 256..268; the
// two lawns in OSM south of the building are the courtyards of its wings). Visitors amble along the rows, stop at
// the stalls, and some walk off carrying a potted plant.
//
// x = east, z = south, y = up. The faculty building (agri.js) spans x 240..389, z 68..227.
import * as THREE from 'three';
import { rng } from './builders.js';
import { Path } from './traffic.js';
import { Crowd } from './crowd.js';
import { tent, textBoard } from './props.js';

const ROAD_A = [[233, 227], [289, 225], [336, 224]], ROAD_B = [[258, 237], [337, 235]], ROAD_C = [[261, 254], [339, 252]];
const WEST = [[233, 172], [233, 227]], LINK = [[247, 227], [258, 237], [261, 254]];
const ZONES = {
  plant: { cloth: '#3f8a3a', label: 'ต้นไม้' }, food: { cloth: '#c0392b', label: 'อาหาร' },
  tool: { cloth: '#2f6fb0', label: 'อุปกรณ์การเกษตร' }, pet: { cloth: '#d9a43a', label: 'สัตว์เลี้ยง' },
  show: { cloth: '#6a4fb3', label: 'นิทรรศการคณะ' },
};
const LEAF = ['#3f8a3a', '#2f6f30', '#5aa04a', '#4f7d2a', '#6fae4f'], BLOOM = ['#e05a7a', '#f7d35c', '#ffffff', '#f08a3c', '#c58be0'];
const CLOTHES = ['#d94f70', '#e8a33d', '#6a4fb3', '#3f8fd1', '#2fa37a', '#f0e0b0', '#ffffff', '#c0392b', '#7a7f85', '#f4f4f1'];

export function buildAgriFair({ say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });

  function build() {
    const R = rng(8080);
    const crowd = new Crowd();
    const box = (w, h, d, mat, x, y, z, parent = group) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };

    // ===== stalls: [z of the row, facing (+1 south / -1 north), zone by x] =====
    const stalls = [], pots = [];
    const row = (x0, x1, z, face, zoneAt) => {
      for (let x = x0; x <= x1; x += 4) {
        const zone = zoneAt(x), Z = ZONES[zone];
        const yaw = face > 0 ? 0 : Math.PI;
        tent(group, x, z, yaw, { cloth: Z.cloth });
        stalls.push({ x, z: z - face * 0.3, yaw, zone });
        // goods: potted plants spilling out in front of the plant stalls, boxes on the others
        if (zone === 'plant') for (let i = 0; i < 9; i++) pots.push([x - 1.3 + (i % 5) * 0.65, z + face * (2.0 + Math.floor(i / 5) * 0.6), 0.6 + R() * 0.9]);
        else for (let i = 0; i < 4; i++) box(0.4, 0.15 + R() * 0.3, 0.35, std(zone === 'food' ? '#f2c230' : zone === 'tool' ? '#7a7f85' : zone === 'pet' ? '#e8a33d' : '#ffffff'), x - 0.9 + i * 0.6, 0.9, z + face * 0.9);
      }
    };
    row(252, 332, 229.8, -1, (x) => (x < 300 ? 'plant' : 'show'));                 // road A, south side
    row(262, 334, 233.0, 1, (x) => 'food');                                          // road B, north side
    row(262, 334, 240.3, -1, (x) => (x < 296 ? 'tool' : 'plant'));                  // road B, south side
    row(264, 336, 250.6, 1, (x) => (x < 300 ? 'pet' : 'plant'));                    // road C, north side
    for (let z = 178; z <= 214; z += 4) {                                           // west road, east side: plants
      tent(group, 237.6, z, -Math.PI / 2, { cloth: ZONES.plant.cloth });
      stalls.push({ x: 237.9, z, yaw: -Math.PI / 2, zone: 'plant' });
      for (let i = 0; i < 6; i++) pots.push([235.4 - Math.floor(i / 3) * 0.6, z - 0.8 + (i % 3) * 0.8, 0.6 + R() * 0.9]);
    }
    // potted plants: pot, leaves, flowers on some
    const potGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.28, 8).translate(0, 0.14, 0);
    const leafGeo = new THREE.IcosahedronGeometry(0.3, 0);
    const potM = new THREE.InstancedMesh(potGeo, std('#8a5a3c'), pots.length), leafM = new THREE.InstancedMesh(leafGeo, std('#ffffff', { flatShading: true }), pots.length);
    const M = new THREE.Matrix4(), c = new THREE.Color();
    pots.forEach(([x, z, h], i) => {
      potM.setMatrixAt(i, M.makeTranslation(x, 0.2, z));
      M.makeScale(0.8 + R() * 0.4, h / 0.6, 0.8 + R() * 0.4).setPosition(x, 0.48 + h * 0.45, z);
      leafM.setMatrixAt(i, M); leafM.setColorAt(i, c.set(R() < 0.3 ? BLOOM[Math.floor(R() * BLOOM.length)] : LEAF[Math.floor(R() * LEAF.length)]));
    });
    for (const m of [potM, leafM]) { m.castShadow = m.receiveShadow = true; group.add(m); }

    // ===== entrance arch over road A at the west road =====
    const green = std('#3f8a3a');
    for (const z of [221.2, 232.8]) box(1, 5.5, 1, green, 243, 2.75, z);
    const sign = textBoard([['เกษตรเจ้าคุณทหารแฟร์', 0.6, '#ffffff'], ['KMITL Agri Fair · คณะเทคโนโลยีการเกษตร', 0.4, '#e6f2c9', 600]], '#2f6f30', 12.6, 2.1, { double: true });
    sign.position.set(243, 6.2, 227); sign.rotation.y = Math.PI / 2; group.add(sign);

    // ===== tractor display on the strip south of road C =====
    const tractor = (x, z, yaw, col) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; group.add(g);
      box(1.3, 0.9, 2.6, std(col), 0, 1.15, 0.2, g);                                 // body and bonnet
      box(1.2, 1.3, 0.9, std('#22303a', { roughness: 0.3 }), 0, 2.1, -0.6, g);         // cab
      box(1.5, 0.08, 1.2, std(col), 0, 2.8, -0.6, g);
      const tyre = std('#1b1c1f');
      for (const s of [-1, 1]) {
        const big = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.45, 16).rotateZ(Math.PI / 2), tyre); big.position.set(s * 0.95, 0.75, -0.7); big.castShadow = true; g.add(big);
        const small = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 12).rotateZ(Math.PI / 2), tyre); small.position.set(s * 0.8, 0.42, 1.2); small.castShadow = true; g.add(small);
      }
    };
    tractor(272, 262, -0.5, '#c0392b'); tractor(281, 262, -0.5, '#2f8a3a'); tractor(290, 262, -0.5, '#2f6fb0');

    // ===== animal pen on the same strip: goats and chickens =====
    const fence = std('#a07850');
    const P0 = [312, 257.5], P1 = [338, 267];
    for (const [ax, az, bx, bz] of [[P0[0], P0[1], P1[0], P0[1]], [P1[0], P0[1], P1[0], P1[1]], [P1[0], P1[1], P0[0], P1[1]], [P0[0], P1[1], P0[0], P0[1]]]) {
      const l = Math.hypot(bx - ax, bz - az);
      for (const y of [0.45, 0.85]) { const m = box(l, 0.08, 0.08, fence, (ax + bx) / 2, y, (az + bz) / 2); m.rotation.y = Math.atan2(-(bz - az), bx - ax); }
      for (let s = 0; s <= l; s += 2) box(0.1, 1.0, 0.1, fence, ax + ((bx - ax) * s) / l, 0.5, az + ((bz - az) * s) / l);
    }
    const animals = [];
    const goat = (col) => { const g = new THREE.Group(); group.add(g); box(0.35, 0.35, 0.8, std(col), 0, 0.6, 0, g); box(0.22, 0.25, 0.3, std(col), 0, 0.85, 0.5, g); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.07, 0.42, 0.07, std('#5a4a3a'), sx * 0.12, 0.21, sz * 0.3, g); return g; };
    const hen = () => { const g = new THREE.Group(); group.add(g); box(0.22, 0.2, 0.3, std(R() < 0.5 ? '#ffffff' : '#a0522d'), 0, 0.22, 0, g); box(0.1, 0.12, 0.1, std('#c0392b'), 0, 0.36, 0.14, g); return g; };
    for (let i = 0; i < 7; i++) animals.push({ g: goat(R() < 0.5 ? '#f2efe6' : '#6b4a32'), x: P0[0] + 2 + R() * 22, z: P0[1] + 1.5 + R() * 6, yaw: R() * 6.28, v: 0.4, ph: R() * 6 });
    for (let i = 0; i < 14; i++) animals.push({ g: hen(), x: P0[0] + 2 + R() * 22, z: P0[1] + 1.5 + R() * 6, yaw: R() * 6.28, v: 0.6, ph: R() * 6 });
    const penSign = textBoard([['สัตว์เลี้ยงและปศุสัตว์', 1, '#ffffff']], '#d9a43a', 4, 0.8, { double: true });
    penSign.position.set((P0[0] + P1[0]) / 2, 1.6, P0[1] - 0.1); penSign.rotation.y = Math.PI; group.add(penSign);
    box(0.08, 1.6, 0.08, fence, (P0[0] + P1[0]) / 2 - 2, 0.8, P0[1] - 0.1); box(0.08, 1.6, 0.08, fence, (P0[0] + P1[0]) / 2 + 2, 0.8, P0[1] - 0.1);   // facing road C to the north

    // ===== people =====
    const paths = [ROAD_A, ROAD_B, ROAD_C, WEST, LINK].map((p) => new Path(p.map(([x, z]) => [x, 0.25, z])));
    const carry = [['#8a5a3c', 0, 0, 0.92, 0.32, 0.24, 0.24, 0.24, 0], ['#3f8a3a', 0, 0, 1.2, 0.32, 0.42, 0.42, 0.42, 0]];
    const visitors = [];
    for (let i = 0; i < 300; i++) {
      const path = paths[i < 270 ? i % 3 : 3 + (i % 2)];
      const plant = R() < 0.28;
      const m = crowd.add(R, R() < 0.55, CLOTHES[Math.floor(R() * CLOTHES.length)], undefined, plant ? carry : []);
      visitors.push({ m, plant, path, s: R() * path.L, dir: R() < 0.5 ? 1 : -1, v: 0.7 + R() * 0.4, pause: R() * 6, side: (R() - 0.5) * 3.4 });
    }
    const vendors = stalls.map((st) => ({ st, m: crowd.add(R, R() < 0.5, ['#3f8a3a', '#f4f4f1', '#e8641e'][Math.floor(R() * 3)]) }));
    const keepers = [0, 1].map((i) => ({ m: crowd.add(R, i === 1, '#3f8a3a'), x: P0[0] + 5 + i * 14, z: P0[1] + 2 }));
    group.add(crowd.finish());
    built = { crowd, visitors, vendors, keepers, animals, P0, P1, stalls };
  }

  let t = 0, prevTime = null;
  function start() {
    if (!built) build();
    t = 0; built.crowd.hideAll();
    prevTime = getTime(); setTime(16.5);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  const A = {}, B = {};
  function update(dt) {
    t += dt;
    const { crowd, visitors, vendors, keepers, animals, P0, P1, stalls } = built;
    for (const a of visitors) {
      if (a.pause > 0) a.pause -= dt;
      else {
        a.s += a.dir * a.v * dt;
        if (a.s < 0 || a.s > a.path.L) { a.dir = -a.dir; a.s = Math.max(0, Math.min(a.path.L, a.s)); }
        if (Math.random() < dt * 0.08) a.pause = 3 + Math.random() * 9;
      }
      const moving = a.pause <= 0;
      a.path.at(a.s + a.dir * 0.8, A); a.path.at(a.s - a.dir * 0.8, B);
      let tx = A.x - B.x, tz = A.z - B.z; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      const x = (A.x + B.x) / 2 + tz * a.side, z = (A.z + B.z) / 2 - tx * a.side;
      const yaw = Math.atan2(tx, tz) + (moving ? 0 : a.side * a.dir > 0 ? Math.PI / 2 : -Math.PI / 2);   // stopped: face the stalls on that side
      if (moving) a.m.phase += (a.v / 0.65) * Math.PI * dt;
      crowd.place(a.m, x, 0.25, z, yaw, moving ? Math.sin(a.m.phase) : 0, a.plant ? -0.9 : null);
    }
    for (const v of vendors) crowd.place(v.m, v.st.x - Math.sin(v.st.yaw) * 0.4, 0.2, v.st.z - Math.cos(v.st.yaw) * 0.4, v.st.yaw, 0, Math.sin(t * 0.6 + v.st.x) > 0.6 ? -0.8 : 0);
    for (const k of keepers) crowd.place(k.m, k.x, 0.2, k.z, 0, 0, Math.sin(t * 0.5 + k.x) > 0.5 ? -0.7 : 0);
    // animals wander inside the pen, stopping to graze or peck
    for (const an of animals) {
      an.ph += dt;
      const graze = Math.sin(an.ph * 0.7) > 0.2;
      if (!graze) {
        an.yaw += (Math.random() - 0.5) * dt * 2;
        let nx = an.x + Math.sin(an.yaw) * an.v * dt, nz = an.z + Math.cos(an.yaw) * an.v * dt;
        if (nx < P0[0] + 1 || nx > P1[0] - 1 || nz < P0[1] + 1 || nz > P1[1] - 1) { an.yaw += Math.PI; nx = an.x; nz = an.z; }
        an.x = nx; an.z = nz;
      }
      an.g.position.set(an.x, 0.2 + (graze ? 0 : Math.abs(Math.sin(an.ph * 8)) * 0.03), an.z);
      an.g.rotation.set(graze ? 0.25 : 0, an.yaw, 0);
    }
    crowd.flush();
    const carrying = visitors.filter((v) => v.plant).length;
    say(`เกษตรเจ้าคุณทหารแฟร์ · คณะเทคโนโลยีการเกษตร (ก.พ. 10 วัน) · ร้าน ${stalls.length} ร้าน: ต้นไม้ อาหาร อุปกรณ์การเกษตร สัตว์เลี้ยง นิทรรศการ · ผู้เข้าชม ${visitors.length} คน หิ้วต้นไม้กลับบ้าน ${carrying} คน`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(292, 0, 232) : null), view: { dist: 120, polar: 58, az: 25 } };
}
