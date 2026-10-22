// KMITL Loy Krathong Festival (5 Nov 2025, 17:00-21:00, ลานนวัตกรรมดาราศาสตร์ beside the King Mongkut royal history
// hall; see events.md): a night scene round ลานพระจอม. A stage south of the round court for the Nopphamat pageant
// and the student club bands, a walking street of market tents with string lights along the footways west and
// south-east of the court, a table of contest krathong, and visitors who walk down to the two ponds beside the hall
// and set their krathong afloat; the candles drift out across the water and show in its reflection.
// The news gives the event, its date and the plaza, not the layout of the stage or the stalls; they are placed on
// the open paving and grass round the round court.
//
// x = east, z = south, y = up. Positions are from royal.js (round court centre 67.3, -289.8, radius 16.8; the
// monument at 66.6, -322) and the OSM footways and ponds.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng, pointInRing, WATER_Y } from './builders.js';
import { Path } from './traffic.js';
import { Crowd } from './crowd.js';

const COURT = [67.3, -289.8];
const STAGE = { x0: 58, x1: 76, z0: -269.5, z1: -263.5, h: 1.2 };   // its front (z0) faces north, over the court
const WEST_ST = [[6, -285], [21, -286], [48, -287]];                 // walking street west of the court
const EAST_ST = [[84, -287], [94, -286], [100, -292], [106, -297], [114, -302], [122, -304], [130, -307], [139, -308], [149, -310]];
const KRATHONGS = 140;
const SHIRTS = ['#d94f70', '#e8a33d', '#6a4fb3', '#3f8fd1', '#2fa37a', '#c0392b', '#f0e0b0', '#e2601f'];
const THAI = [['#d9a43a', '#7a1f3d'], ['#e889b0', '#5a2d82'], ['#f2d27a', '#a3242a'], ['#9fd3c7', '#1f4f5c'], ['#c9a0dc', '#7a5a12']];
const FLOWERS = ['#f4a7c0', '#f7d35c', '#ffffff', '#f08a3c', '#e05a7a', '#c58be0'];
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- textures ----------
function glowTex() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function backdropTex() {
  const cv = document.createElement('canvas'); cv.width = 1536; cv.height = 470;
  const g = cv.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 470); gr.addColorStop(0, '#1a1446'); gr.addColorStop(1, '#3a1650');
  g.fillStyle = gr; g.fillRect(0, 0, 1536, 470);
  g.fillStyle = 'rgba(255,215,120,0.9)';
  for (let i = 0; i < 90; i++) { g.beginPath(); g.arc(Math.random() * 1536, Math.random() * 470, 1 + Math.random() * 2.5, 0, 7); g.fill(); }
  g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(1330, 110, 70, 0, 7); g.fill();               // full moon of the twelfth month
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffe3a3';
  g.font = '700 150px "IBM Plex Sans Thai", sans-serif'; g.fillText('ลอยกระทง สจล.', 700, 170);
  g.font = '600 64px "IBM Plex Sans Thai", sans-serif'; g.fillStyle = '#ffffff'; g.fillText('KMITL Loy Krathong Festival', 700, 320);
  g.font = '500 44px "IBM Plex Sans Thai", sans-serif'; g.fillStyle = '#f2b8d8'; g.fillText('ประกวดนางนพมาศ · ประกวดกระทง · ถนนคนเดิน', 700, 410);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

// ---------- krathong: banana-trunk base, leaf petals, a mound of flowers, a candle ----------
function krathongGeos() {
  const base = new THREE.CylinderGeometry(0.3, 0.27, 0.1, 14).translate(0, 0.05, 0);
  const petals = mergeGeometries(Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return new THREE.ConeGeometry(0.07, 0.2, 4).rotateX(-0.35).translate(0, 0.19, 0.24).rotateY(a);
  }));
  const flower = new THREE.SphereGeometry(0.17, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.2, 1).translate(0, 0.1, 0);
  const candle = new THREE.CylinderGeometry(0.018, 0.018, 0.16, 6).translate(0, 0.38, 0);
  return { base, petals, flower, candle };
}

export function buildLoyKrathong({ data, say, setTime, getTime }) {
  const group = new THREE.Group();
  let built = null;
  const GLOW = glowTex();
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });
  const lit = (color) => new THREE.MeshBasicMaterial({ color });
  const additive = (o = {}) => ({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, ...o });

  // all the little lights (bulbs, flames) as one cloud of glowing points; pool lights on the ground as quads
  function lights(pts, cols, size) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ size, vertexColors: true, sizeAttenuation: true, ...additive() }));
  }
  const poolGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  function pool(x, z, r, color, opacity = 0.45) {
    const m = new THREE.Mesh(poolGeo, new THREE.MeshBasicMaterial(additive({ color, opacity })));
    m.position.set(x, 0.3, z); m.scale.set(r * 2, 1, r * 2); m.renderOrder = 2;
    group.add(m);
  }

  function build() {
    const R = rng(2025);
    const crowd = new Crowd();
    const bulbs = [], bulbCol = [], c = new THREE.Color();
    const bulb = (x, y, z, col) => { bulbs.push(x, y, z); c.set(col); bulbCol.push(c.r, c.g, c.b); };
    const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m); return m; };

    // ===== stage =====
    const S = STAGE, sx = (S.x0 + S.x1) / 2;
    box(S.x1 - S.x0, S.h, S.z1 - S.z0, std('#2a2a30'), sx, S.h / 2, (S.z0 + S.z1) / 2);
    box(S.x1 - S.x0 + 0.1, S.h - 0.1, 0.08, std('#a3242a'), sx, S.h / 2, S.z0 - 0.05);              // red skirt
    const back = new THREE.Mesh(new THREE.PlaneGeometry(S.x1 - S.x0, 5.5), new THREE.MeshBasicMaterial({ map: backdropTex() }));
    back.position.set(sx, S.h + 2.75, S.z1 - 0.2); back.rotation.y = Math.PI; group.add(back);
    const truss = std('#b9bcc2', { metalness: 0.6, roughness: 0.4 });
    for (const x of [S.x0 - 0.3, S.x1 + 0.3]) for (const z of [S.z0 + 0.2, S.z1 - 0.2]) box(0.35, 8, 0.35, truss, x, 4, z);
    for (const z of [S.z0 + 0.2, S.z1 - 0.2]) box(S.x1 - S.x0 + 0.95, 0.35, 0.35, truss, sx, 8, z);
    // moving-head lights on the front beam, each with a soft beam of light down onto the stage
    const beams = [];
    const BEAM_COL = ['#ff4fb0', '#40c8ff', '#ffd040', '#9a6bff', '#40ffb0', '#ff7040'];
    for (let i = 0; i < 6; i++) {
      const x = S.x0 + 1.5 + i * ((S.x1 - S.x0 - 3) / 5);
      box(0.4, 0.4, 0.4, lit(BEAM_COL[i]), x, 7.6, S.z0 + 0.2);
      bulb(x, 7.6, S.z0 + 0.2, BEAM_COL[i]);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 6.2, 20, 1, true).translate(0, -3.1, 0),
        new THREE.MeshBasicMaterial({ color: BEAM_COL[i], transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      cone.position.set(x, 7.5, S.z0 + 0.2); group.add(cone);
      beams.push({ cone, ph: i * 1.1 });
    }
    // fairy lights along the top of the backdrop and the stage edge
    for (let x = S.x0; x <= S.x1; x += 0.6) { bulb(x, S.h + 5.6, S.z1 - 0.4, '#ffd27a'); bulb(x, S.h + 0.05, S.z0 - 0.15, '#ffd27a'); }
    pool(sx, S.z0 - 4, 12, '#ff9ad0', 0.5);
    pool(sx, (S.z0 + S.z1) / 2, 9, '#ffd9a0', 0.6);

    // ===== walking street: market tents with string lights =====
    const stalls = [];
    const canopy = std('#f4f1ea'), pole = std('#cfd2d6', { metalness: 0.5 });
    const roofGeo = new THREE.ConeGeometry(2.3, 1.0, 4, 1).rotateY(Math.PI / 4);
    const tent = (x, z, yaw) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; group.add(g);
      const add = (geo, mat, px, py, pz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.castShadow = m.receiveShadow = true; g.add(m); };
      for (const a of [-1.45, 1.45]) for (const b of [-1.45, 1.45]) add(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), pole, a, 1.2, b);
      add(roofGeo, canopy, 0, 2.9, 0);
      add(new THREE.BoxGeometry(2.6, 0.75, 0.8), std(SHIRTS[Math.floor(R() * SHIRTS.length)]), 0, 0.38, 0.9);   // table with cloth, front
      for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(0.3, 0.12 + R() * 0.2, 0.3), std(FLOWERS[Math.floor(R() * FLOWERS.length)]), -1 + i * 0.4, 0.82, 0.9);   // goods
      // bulbs round the eave, in world space
      const cs = Math.cos(yaw), sn = Math.sin(yaw);
      for (let i = 0; i < 12; i++) {
        const t = i / 12, side = Math.floor(t * 4), u = (t * 4) % 1;
        const [a, b] = [[-1.5 + 3 * u, -1.5], [1.5, -1.5 + 3 * u], [1.5 - 3 * u, 1.5], [-1.5, 1.5 - 3 * u]][side];
        bulb(x + a * cs + b * sn, 2.35, z - a * sn + b * cs, '#ffcf6b');
      }
      pool(x, z, 4.2, '#ffc070', 0.6);
      stalls.push({ x, z, yaw, front: [x + 1.9 * sn, z + 1.9 * cs], back: [x - 0.3 * sn, z - 0.3 * cs] });
    };
    const west = new Path(WEST_ST.map(([x, z]) => [x, 0.2, z])), east = new Path(EAST_ST.map(([x, z]) => [x, 0.2, z]));
    const P = {};
    for (let s = 4; s < west.L - 3; s += 5) {
      west.at(s, P);
      for (const side of [1, -1]) tent(P.x + P.tz * 4.1 * side, P.z - P.tx * 4.1 * side, Math.atan2(-P.tz * side, P.tx * side));
    }
    for (let s = 6; s < east.L - 3; s += 5.5) {
      east.at(s, P);
      const side = P.tx > 0 ? -1 : 1;           // the south side (the pond is on the north)
      tent(P.x + P.tz * 4.1 * side, P.z - P.tx * 4.1 * side, Math.atan2(-P.tz * side, P.tx * side));
    }
    // string lights zig-zagging over both streets
    for (const path of [west, east]) {
      for (let s = 0; s < path.L; s += 0.7) {
        path.at(s, P);
        const sag = Math.abs(Math.sin((s / 5) * Math.PI)) * 0.5, side = Math.sin((s / 5) * Math.PI / 2) > 0 ? 1 : -1;
        bulb(P.x + P.tz * 1.2 * side, 3.4 - sag, P.z - P.tx * 1.2 * side, ['#ff6b6b', '#ffd36b', '#6bd0ff', '#9bff8a', '#ff9ad0'][Math.floor(s / 0.7) % 5]);
      }
    }

    // ===== krathong contest table, east of the stage =====
    const geos = krathongGeos();
    const big = new THREE.Group(); group.add(big);
    box(9, 0.8, 1.4, std('#7a1f3d'), 86, 0.4, -268);
    for (let i = 0; i < 5; i++) {
      const k = new THREE.Group(); k.position.set(82.5 + i * 1.75, 0.8, -268); k.scale.setScalar(2.4); big.add(k);
      k.add(new THREE.Mesh(geos.base, std('#5f8a3a')), new THREE.Mesh(geos.petals, std('#3f7a2c')), new THREE.Mesh(geos.flower, std(FLOWERS[i])), new THREE.Mesh(geos.candle, std('#f6f2e6')));
      bulb(k.position.x, 0.8 + 0.47 * 2.4, k.position.z, '#ffb347');
    }
    pool(86, -268, 5, '#ffb347', 0.35);

    // ===== ponds, and the banks people float their krathong from =====
    const ponds = data.water.filter((w) => w.o && (pointInRing(30, -360, w.o) || pointInRing(125, -360, w.o))).map((w) => w.o);
    const inWater = (x, z, m = 0.6) => ponds.find((o) => pointInRing(x, z, o) && pointInRing(x + m, z, o) && pointInRing(x - m, z, o) && pointInRing(x, z + m, o) && pointInRing(x, z - m, o));
    const banks = [];
    for (const o of ponds) {
      let cx = 0, cz = 0; for (const [x, z] of o) { cx += x; cz += z; } cx /= o.length; cz /= o.length;
      for (let i = 1; i < o.length; i++) {
        const [ax, az] = o[i - 1], [bx, bz] = o[i], l = Math.hypot(bx - ax, bz - az);
        for (let s = 1.5; s < l; s += 3) {
          const x = ax + ((bx - ax) * s) / l, z = az + ((bz - az) * s) / l;
          let nx = x - cx, nz = z - cz; const n = Math.hypot(nx, nz); nx /= n; nz /= n;
          const stand = [x + nx * 0.9, z + nz * 0.9], drop = [x - nx * 1.4, z - nz * 1.4];
          if (Math.hypot(x - COURT[0], z - COURT[1]) < 80 && !inWater(stand[0], stand[1], 0.2) && inWater(drop[0], drop[1])) banks.push({ stand, drop, yaw: Math.atan2(-nx, -nz) });
        }
      }
    }

    // floating krathong: instanced parts and a flame point each
    const kmesh = ['base', 'petals', 'flower', 'candle'].map((k, i) => {
      const m = new THREE.InstancedMesh(geos[k], [std('#5f8a3a'), std('#3f7a2c'), std('#ffffff'), std('#f6f2e6')][i], KRATHONGS);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; group.add(m); return m;
    });
    for (let i = 0; i < KRATHONGS; i++) kmesh[2].setColorAt(i, c.set(FLOWERS[Math.floor(R() * FLOWERS.length)]));
    kmesh[2].instanceColor.needsUpdate = true;
    const flames = lights(new Array(KRATHONGS * 3).fill(0), new Array(KRATHONGS * 3).fill(1), 2.2);
    flames.geometry.attributes.color.array.forEach((_, i, a) => { a[i] = [1, 0.72, 0.32][i % 3]; });
    group.add(flames);
    const krathong = Array.from({ length: KRATHONGS }, () => ({ on: false, x: 0, z: 0, vx: 0, vz: 0, rot: R() * 6.28, spin: (R() - 0.5) * 0.2, ph: R() * 6.28, age: 0 }));

    group.add(lights(bulbs, bulbCol, 1.7));

    // ===== people =====
    const visitor = () => {
      const female = R() < 0.55, r = R();
      if (r < 0.4) return crowd.add(R, female, '#f4f4f1');                                 // students in uniform
      if (r < 0.65 && female) { const [sh, sk] = THAI[Math.floor(R() * THAI.length)]; return crowd.add(R, true, sh, sk); }   // Thai dress
      return crowd.add(R, female, SHIRTS[Math.floor(R() * SHIRTS.length)]);
    };
    // strollers on the footways round the court and along the walking streets
    const walks = [west, east];
    for (const r of data.roads) {
      if (r.k !== 'footway' || !r.p.every(([x, z]) => x > 40 && x < 95 && z > -340 && z < -265)) continue;
      walks.push(new Path(r.p.map(([x, z]) => [x, 0.25, z])));
    }
    const strollers = [];
    for (let i = 0; i < 110; i++) {
      const path = walks[i < 70 || walks.length < 3 ? i % 2 : 2 + (i % (walks.length - 2))];
      const n = R() < 0.5 ? 1 : R() < 0.7 ? 2 : 3;
      strollers.push({ path, s: R() * path.L, dir: R() < 0.5 ? 1 : -1, v: 0.7 + R() * 0.4, pause: 0, side: (R() - 0.5) * 1.4, m: Array.from({ length: n }, () => visitor()) });
    }
    // audience on the round court facing the stage
    const audience = [];
    for (let i = 0; i < 90; i++) {
      const a = R() * Math.PI, r = 4 + R() * 11.5;
      const x = sx + Math.cos(a) * r * 1.05, z = S.z0 - 1.5 - Math.sin(a) * r;
      audience.push({ x, z, yaw: Math.atan2(sx - x, (S.z0 + 1) - z) + (R() - 0.5) * 0.3, m: visitor(), clap: R() * 6.28 });
    }
    // vendors behind their tables
    const vendors = stalls.map((st) => ({ st, m: crowd.add(R, R() < 0.6, SHIRTS[Math.floor(R() * SHIRTS.length)]) }));
    // people taking a krathong down to the water
    const floaters = Array.from({ length: 22 }, () => ({ m: visitor(), state: 'walk', x: 0, z: 0, to: null, bank: null, wait: R() * 20 }));
    // the stage: Nopphamat contestants, two MCs; a band takes over between rounds
    const contestants = Array.from({ length: 6 }, (_, i) => ({ m: crowd.add(R, true, THAI[i % THAI.length][0], THAI[i % THAI.length][1]), ph: i / 6 }));
    const band = [0, 1, 2, 3].map((i) => ({ m: crowd.add(R, i % 2 === 0, '#1b1c1f'), x: S.x0 + 4 + i * 3.3, z: S.z1 - 1.6 }));
    const mcs = [0, 1].map((i) => ({ m: crowd.add(R, i === 1, i ? '#d9a43a' : '#7a1f3d', i ? '#7a1f3d' : undefined), x: S.x0 + 1.5 + i * 1.2, z: S.z0 + 1 }));
    group.add(crowd.finish());

    built = { crowd, stalls, banks, krathong, kmesh, flames, beams, strollers, audience, vendors, floaters, contestants, band, mcs, walks, inWater, R };
  }

  // ---------- state ----------
  let t = 0, prevTime = null, floated = 0;
  const M = new THREE.Matrix4(), Qn = new THREE.Quaternion(), SC = new THREE.Vector3(1, 1, 1), Y = V(0, 1, 0), A = {}, B = {};

  function spawnKrathong(x, z, scatter) {
    const { krathong } = built;
    let k = krathong.find((q) => !q.on);
    if (!k) k = krathong.reduce((a, q) => (q.age > a.age ? q : a));             // reuse the one afloat longest
    const a = Math.random() * 6.28, v = 0.05 + Math.random() * 0.08;
    Object.assign(k, { on: true, x, z, vx: Math.cos(a) * v, vz: Math.sin(a) * v, age: scatter ? Math.random() * 300 : 0 });
  }
  function randomWaterPoint() {
    const { banks, inWater } = built;
    for (let i = 0; i < 50; i++) {
      const b = banks[Math.floor(Math.random() * banks.length)];
      const x = b.drop[0] + (Math.random() - 0.5) * 30, z = b.drop[1] + (Math.random() - 0.5) * 30;
      if (inWater(x, z)) return [x, z];
    }
    return built.banks[0].drop;
  }
  // one of the nearer banks that can be walked to without going through the water
  const dry = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])); for (let i = 1; i < n; i++) if (built.inWater(a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n, 0)) return false; return true; };
  function pickBank(x, z) {
    const near = built.banks.map((b) => [Math.hypot(b.stand[0] - x, b.stand[1] - z), b]).sort((a, b) => a[0] - b[0]).slice(0, 25).map(([, b]) => b).filter((b) => dry([x, z], b.stand));
    return near.length ? near[Math.floor(Math.random() * Math.min(6, near.length))] : built.banks[0];
  }
  const streetPoint = () => { const p = built.walks[Math.random() < 0.5 ? 0 : 1]; p.at(Math.random() * p.L, A); return [A.x, A.z]; };

  function start() {
    if (!built) build();
    t = 0; floated = 0;
    for (const k of built.krathong) k.on = false;
    for (let i = 0; i < 60; i++) { const [x, z] = randomWaterPoint(); spawnKrathong(x, z, true); }
    for (const f of built.floaters) { [f.x, f.z] = streetPoint(); f.state = 'wait'; f.wait = Math.random() * 25; }
    built.crowd.hideAll();
    prevTime = getTime();
    setTime(19.5);
  }
  function stop() { if (prevTime != null) setTime(prevTime); prevTime = null; }

  function walkTo(f, dt, v) {
    const dx = f.to[0] - f.x, dz = f.to[1] - f.z, d = Math.hypot(dx, dz);
    if (d < 0.2) return true;
    const st = Math.min(d, v * dt); f.x += (dx / d) * st; f.z += (dz / d) * st; f.yaw = Math.atan2(dx, dz);
    f.m.phase += (v / 0.65) * Math.PI * dt;
    built.crowd.place(f.m, f.x, 0.25, f.z, f.yaw, Math.sin(f.m.phase));
    return false;
  }

  function update(dt, dtReal) {
    t += dt;
    const { crowd, krathong, kmesh, flames, beams, strollers, audience, vendors, floaters, contestants, band, mcs, banks, inWater } = built;
    const pageant = Math.floor(t / 70) % 2 === 0;           // pageant and band take turns, 70 s each

    // stage lights sweep
    for (const b of beams) b.cone.rotation.set(Math.sin(t * 0.7 + b.ph) * 0.45, 0, Math.cos(t * 0.5 + b.ph) * 0.3);

    // strollers: amble, stop at the stalls now and then
    for (const a of strollers) {
      if (a.pause > 0) a.pause -= dt;
      else {
        a.s += a.dir * a.v * dt;
        if (a.s < 0 || a.s > a.path.L) { a.dir = -a.dir; a.s = Math.max(0, Math.min(a.path.L, a.s)); }
        if (Math.random() < dt * 0.06) a.pause = 3 + Math.random() * 10;
      }
      const moving = a.pause <= 0;
      a.path.at(a.s + a.dir * 0.8, A); a.path.at(a.s - a.dir * 0.8, B);
      let tx = A.x - B.x, tz = A.z - B.z; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      const yaw = Math.atan2(tx, tz) + (moving ? 0 : (a.side > 0 ? -1.3 : 1.3));   // stopped: turn to the stalls
      a.m.forEach((m, j) => {
        const o = a.side + (j - (a.m.length - 1) / 2) * 0.6, x = (A.x + B.x) / 2 + tz * o, z = (A.z + B.z) / 2 - tx * o;
        if (moving) m.phase += (a.v / 0.65) * Math.PI * dt;
        crowd.place(m, x, 0.25, z, yaw, moving ? Math.sin(m.phase) : 0);
      });
    }
    // audience: clap now and then
    for (const a of audience) {
      a.clap += dtReal * 8;
      const clapping = Math.sin(t * 0.21 + a.x * 0.1) > 0.75;
      crowd.place(a.m, a.x, 0.22, a.z, a.yaw, 0, clapping ? -1.25 + 0.2 * Math.sin(a.clap) : 0);
    }
    for (const v of vendors) crowd.place(v.m, v.st.back[0], 0.2, v.st.back[1], v.st.yaw, 0, Math.sin(t * 0.5 + v.st.x) > 0.6 ? -0.8 : 0);

    // stage: contestants walk a loop to the front and back; MCs; or the band
    const S = STAGE, top = S.h;
    contestants.forEach((c) => {
      if (!pageant) { crowd.hide(c.m); return; }
      const u = ((t / 40 + c.ph) % 1) * 2 * Math.PI;
      const x = (S.x0 + S.x1) / 2 + Math.cos(u) * 6.5, z = (S.z0 + S.z1) / 2 + Math.sin(u) * 1.6;
      c.m.phase += 1.6 * Math.PI * dt;
      crowd.place(c.m, x, top, z, Math.atan2(-Math.sin(u), Math.cos(u) * 0.25), Math.sin(c.m.phase) * 0.6, Math.cos(u) > 0.95 ? -0.5 : null);
    });
    for (const m of mcs) crowd.place(m.m, m.x, top, m.z, Math.PI, 0, -0.7);
    band.forEach((b, i) => {
      if (pageant) { crowd.hide(b.m); return; }
      crowd.place(b.m, b.x, top, b.z + Math.sin(t * 2 + i) * 0.05, Math.PI, 0, i === 3 ? -0.9 + 0.3 * Math.sin(t * 9) : -0.75 + 0.1 * Math.sin(t * 4 + i));
    });

    // people floating krathong: walk to the bank, crouch, let it go, walk back to the street
    for (const f of floaters) {
      if (f.state === 'wait') {
        f.wait -= dt;
        crowd.place(f.m, f.x, 0.25, f.z, f.yaw || 0, 0);
        if (f.wait <= 0) { f.bank = pickBank(f.x, f.z); f.to = f.bank.stand; f.state = 'go'; }
      } else if (f.state === 'go') {
        if (walkTo(f, dt, 1.05)) { f.state = 'kneel'; f.wait = 4; }
      } else if (f.state === 'kneel') {
        f.wait -= dt;
        crowd.place(f.m, f.x, -0.3, f.z, f.bank.yaw, 0, -1.0);
        if (f.wait <= 0) { spawnKrathong(f.bank.drop[0], f.bank.drop[1]); floated++; f.to = streetPoint(); f.state = 'back'; }
      } else if (walkTo(f, dt, 1.05)) { f.state = 'wait'; f.wait = 10 + Math.random() * 30; }
    }

    // krathong drift on the ponds, turning away from the banks
    const fp = flames.geometry.attributes.position.array;
    krathong.forEach((k, i) => {
      if (!k.on) { M.makeScale(0, 0, 0); for (const m of kmesh) m.setMatrixAt(i, M); fp[i * 3 + 1] = -50; return; }
      k.age += dt;
      k.vx += (Math.random() - 0.5) * 0.02 * dt; k.vz += (Math.random() - 0.5) * 0.02 * dt;
      const sp = Math.hypot(k.vx, k.vz); if (sp > 0.14) { k.vx *= 0.14 / sp; k.vz *= 0.14 / sp; }
      const nx = k.x + k.vx * dt * 6, nz = k.z + k.vz * dt * 6;
      if (!inWater(nx, nz, 0.5)) { k.vx = -k.vx + (Math.random() - 0.5) * 0.03; k.vz = -k.vz + (Math.random() - 0.5) * 0.03; }
      else { k.x += k.vx * dt; k.z += k.vz * dt; }
      k.rot += k.spin * dt;
      const y = WATER_Y - 0.03 + Math.sin(t * 1.3 + k.ph) * 0.02;
      Qn.setFromAxisAngle(Y, k.rot);
      M.compose(V(k.x, y, k.z), Qn, SC.set(1.5, 1.5, 1.5));
      for (const m of kmesh) m.setMatrixAt(i, M);
      fp[i * 3] = k.x; fp[i * 3 + 1] = y + 0.72 + Math.sin(t * 13 + k.ph) * 0.02; fp[i * 3 + 2] = k.z;
    });
    for (const m of kmesh) m.instanceMatrix.needsUpdate = true;
    flames.geometry.attributes.position.needsUpdate = true;
    crowd.flush();

    const afloat = krathong.filter((k) => k.on).length;
    say(`ลอยกระทง สจล. · ลานพระจอม ข้างหอพระราชประวัติ ร.4 · ${pageant ? 'ประกวดนางนพมาศ' : 'วงดนตรีชมรม'} · กระทงในสระ ${afloat} ใบ (ลอยเพิ่ม ${floated})`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(88, 0, -305) : null), view: { dist: 150, polar: 62, az: 35 } };
}
