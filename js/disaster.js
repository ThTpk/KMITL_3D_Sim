// Disasters and recovery, for fun: pick a disaster and it wrecks random KMITL buildings (meteors, a giant
// monster, a UFO, an earthquake, a tornado, a tsunami); the recovery button sends crews of students in hard hats
// to put each one back up behind scaffolding, floor by floor.
//
// The buildings are not rebuilt as new objects: each one's triangles are found in the existing meshes through
// geometry.userData.owner, their original positions are kept, and every frame the positions are rewritten from
// a small state (height the building is cut off at, lean, spin, lift, shrink, shake). When a building is put back,
// the original positions are copied back exactly.
import * as THREE from 'three';
import { pointInRing } from './builders.js';
import { figure } from './students.js';

const rnd = Math.random;
const clamp = THREE.MathUtils.clamp, lerp = THREE.MathUtils.lerp;
const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const DECAL_Y = 0.45;
const SKIP_MODELS = /^(carport|skywalk|railwalk|footbridge)/;

export const DISASTERS = [
  { id: 'meteor', th: 'อุกาบาต', msg: 'อุกาบาตพุ่งชนแคมปัส!' },
  { id: 'kaiju', th: 'ก๊อดซิลล่า', msg: 'ก๊อดซิลล่ากำลังบุก!' },
  { id: 'ufo', th: 'มนุษย์ต่างดาว (UFO)', msg: 'UFO กำลังดูดอาคาร!' },
  { id: 'quake', th: 'แผ่นดินไหว', msg: 'แผ่นดินไหวรุนแรง!' },
  { id: 'tornado', th: 'พายุทอร์นาโด', msg: 'พายุทอร์นาโดถล่ม!' },
  { id: 'tsunami', th: 'คลื่นยักษ์สึนามิ', msg: 'คลื่นยักษ์ซัดเข้าแคมปัส!' },
];

// ---------- textures ----------
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const radial = (stops) => canvasTex(64, 64, (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  for (const [o, c] of stops) gr.addColorStop(o, c);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
});

export function buildDisasters({ scene, group, meta, inCampus, flyTo, camera }) {
  const PUFF = radial([[0, 'rgba(255,255,255,0.95)'], [0.45, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']]);
  const GLOW = radial([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.8)'], [1, 'rgba(255,255,255,0)']]);
  const CRATER = radial([[0, 'rgba(20,16,14,0.95)'], [0.55, 'rgba(45,36,30,0.9)'], [0.78, 'rgba(110,88,66,0.85)'], [1, 'rgba(110,88,66,0)']]);
  const SCORCH = radial([[0, 'rgba(25,22,20,0.7)'], [0.7, 'rgba(25,22,20,0.35)'], [1, 'rgba(25,22,20,0)']]);
  const STREAK = canvasTex(256, 256, (g, w, h) => {
    for (let i = 0; i < 170; i++) {
      g.strokeStyle = `rgba(${200 + rnd() * 40},${195 + rnd() * 40},${185 + rnd() * 40},${0.08 + rnd() * 0.45})`;
      g.lineWidth = 2 + rnd() * 9;
      const x = rnd() * w;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 60 + rnd() * 60, h); g.stroke();
      g.beginPath(); g.moveTo(x - w, 0); g.lineTo(x - w + 60 + rnd() * 60, h); g.stroke();
    }
  });
  STREAK.wrapS = STREAK.wrapT = THREE.RepeatWrapping;

  const root = new THREE.Group();
  root.name = 'disasters';
  scene.add(root);

  // ======================= building rig =======================
  const runs = new Map();
  group.traverse((o) => {
    const ow = o.isMesh && o.geometry.userData.owner;
    if (!ow) return;
    const attr = o.geometry.attributes.position;
    let s = 0;
    for (let t = 1; t <= ow.length; t++) {
      if (t < ow.length && ow[t] === ow[s]) continue;
      if (ow[s] >= 0) {
        if (!runs.has(ow[s])) runs.set(ow[s], []);
        runs.get(ow[s]).push({ mesh: o, attr, off: s * 9, len: (t - s) * 9, orig: null });
      }
      s = t;
    }
  });

  const states = new Map();
  function stateOf(idx) {
    let st = states.get(idx);
    if (st) return st;
    const b = meta[idx].b, rs = runs.get(idx) || [];
    let H = 0, x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, big = null;
    for (const r of rs) {
      r.orig = r.attr.array.slice(r.off, r.off + r.len);
      for (let i = 0; i < r.len; i += 3) {
        const x = r.orig[i], y = r.orig[i + 1], z = r.orig[i + 2];
        if (y > H) H = y;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z;
      }
      if (!big || r.len > big.len) big = r;
    }
    // a colour for the rubble: the vertex colour of the walls, or the main material of a hand-built model
    const col = new THREE.Color('#d8d3c8');
    if (big) {
      const ca = big.mesh.geometry.attributes.color;
      if (ca) col.fromArray(ca.array, big.off);
      else if (big.mesh.material.color) col.copy(big.mesh.material.color);
    }
    st = {
      idx, b, runs: rs, H: Math.max(H, 3), cx: b.c[0], cz: b.c[1], R: Math.max(4, Math.hypot(x1 - x0, z1 - z0) / 2), col,
      hc: Infinity, tilt: 0, tdx: 1, tdz: 0, spin: 0, lift: 0, shrink: 1, jx: 0, jz: 0, hidden: false,
      destroyed: false, anim: null, rubble: null, scaffold: null, noRubble: false,
    };
    states.set(idx, st);
    return st;
  }
  const pristine = (st) => !st.hidden && st.hc >= st.H && !st.tilt && !st.spin && !st.lift && st.shrink === 1 && !st.jx && !st.jz;
  function apply(st) {
    const { cx, cz } = st;
    const cs = Math.cos(st.spin), sn = Math.sin(st.spin), lt = Math.sin(st.tilt), ct = Math.cos(st.tilt), sh = st.shrink;
    const exact = pristine(st);
    for (const r of st.runs) {
      const a = r.attr.array, o = r.orig, off = r.off;
      if (exact) a.set(o, off);
      else if (st.hidden) for (let i = 0; i < o.length; i += 3) { a[off + i] = cx; a[off + i + 1] = -100; a[off + i + 2] = cz; }
      else {
        for (let i = 0; i < o.length; i += 3) {
          const x = (o[i] - cx) * sh, y = Math.min(o[i + 1], st.hc) * sh, z = (o[i + 2] - cz) * sh;
          a[off + i] = cx + x * cs - z * sn + st.tdx * lt * y + st.jx;
          a[off + i + 1] = y * ct + st.lift;
          a[off + i + 2] = cz + x * sn + z * cs + st.tdz * lt * y + st.jz;
        }
      }
      r.attr.addUpdateRange(off, o.length);
      r.attr.needsUpdate = true;
      r.mesh.frustumCulled = false;
    }
  }

  const candidates = [];
  meta.forEach((m, idx) => {
    const b = m.b;
    if (!b.c || !b.o || !(b.model || inCampus(b.c[0], b.c[1]))) return;
    if ((b.a || 0) < 80 || b.bt === 'bridge' || b.bt === 'roof' || b.bt === 'carport' || (b.model && SKIP_MODELS.test(b.model))) return;
    if (!runs.has(idx)) return;
    candidates.push(idx);
  });
  const alive = () => candidates.filter((i) => !states.get(i)?.destroyed);
  // the building selected when the disaster was triggered (-1: none); it is hit first, then random ones round it
  let focus = -1;
  const isLead = (st) => st.idx === focus;
  // n random buildings near each other (within r of a random first one), so the action stays in one view
  const pickTargets = (n, r = 300) => {
    const all = alive();
    if (!all.length) return [];
    const s0 = all.includes(focus) ? focus : pick(all), [x0, z0] = meta[s0].b.c;
    const close = shuffle(all.filter((i) => i !== s0 && Math.hypot(meta[i].b.c[0] - x0, meta[i].b.c[1] - z0) < r));
    return [s0, ...close.slice(0, n - 1)].map(stateOf);
  };
  // only buildings whose centre is close are given a state (that copies their vertex positions)
  const near = (x, z, r) => alive().filter((i) => Math.hypot(meta[i].b.c[0] - x, meta[i].b.c[1] - z) < r + 80).map(stateOf)
    .filter((st) => Math.hypot(st.cx - x, st.cz - z) < r + st.R * 0.5);

  // ======================= instanced pools =======================
  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), SC = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  function pool(n, matOpts) {
    const mesh = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ roughness: 0.9, ...matOpts }), n);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    for (let i = 0; i < n; i++) { mesh.setMatrixAt(i, ZERO); mesh.setColorAt(i, new THREE.Color('#ffffff')); }
    root.add(mesh);
    // bump allocator that starts again from 0 once everything has been released
    const P = { mesh, n, next: 0, live: 0 };
    P.alloc = (k) => { if (P.next + k > n) return -1; const i = P.next; P.next += k; P.live++; return i; };
    P.free = (i0, k) => { for (let i = i0; i < i0 + k; i++) mesh.setMatrixAt(i, ZERO); mesh.instanceMatrix.needsUpdate = true; if (--P.live <= 0) { P.live = 0; P.next = 0; } };
    return P;
  }
  // the pools (and the sprites below) are only made when the first disaster starts, so the feature costs
  // nothing until it is used
  let rubbleP, scaffP, crewP, debrisP, smokeS, fireS, fxReady = false;
  function ensureFx() {
    if (fxReady) return;
    fxReady = true;
    rubbleP = pool(9000); scaffP = pool(9000, { color: '#c8c3b4', metalness: 0.4, roughness: 0.5 }); crewP = pool(5000, { roughness: 0.8 });
    debrisP = pool(1600);
    smokeS = spritePool(520, THREE.NormalBlending); fireS = spritePool(300, THREE.AdditiveBlending);
  }
  // free the geometry, materials and textures of a finished monster / saucer / wave (not the shared ones)
  const SHARED = new Set();
  function disposeTree(obj) {
    root.remove(obj);
    obj.traverse((o) => {
      if (o.geometry && !SHARED.has(o.geometry)) o.geometry.dispose();
      for (const m of [].concat(o.material || [])) {
        if (SHARED.has(m)) continue;
        for (const k of ['map', 'bumpMap', 'emissiveMap']) if (m[k] && !SHARED.has(m[k])) m[k].dispose();
        m.dispose();
      }
    });
  }

  // ---------- rubble heaps ----------
  function makeRubble(st) {
    if (st.rubble || st.noRubble) return;
    const b = st.b, o = b.o;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const [x, z] of o) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    const n = clamp(Math.round((b.a || 200) / 9), 25, 300);
    const i0 = rubbleP.alloc(n);
    if (i0 < 0) return;
    const hmax = clamp(st.H * 0.2, 1.5, 8), items = [];
    for (let k = 0, tries = 0; k < n && tries < n * 20; tries++) {
      const x = lerp(x0, x1, rnd()), z = lerp(z0, z1, rnd());
      if (!pointInRing(x, z, o)) continue;
      const d = clamp(Math.hypot((x - st.cx) / ((x1 - x0) / 2 || 1), (z - st.cz) / ((z1 - z0) / 2 || 1)), 0, 1);
      const s = 1.2 + rnd() * 3;
      items.push({ x, z, y: hmax * (1 - d * d) * (0.4 + rnd() * 0.6), sx: s * (0.6 + rnd()), sy: s * (0.3 + rnd() * 0.5), sz: s * (0.6 + rnd()), r: [rnd() * 0.6, rnd() * 3, rnd() * 0.6] });
      const c = rnd() < 0.55 ? st.col.clone().multiplyScalar(0.7 + rnd() * 0.35) : new THREE.Color().setHSL(0.08, 0.06 + rnd() * 0.1, 0.35 + rnd() * 0.3);
      rubbleP.mesh.setColorAt(i0 + k, c);
      k++;
    }
    rubbleP.mesh.instanceColor.needsUpdate = true;
    st.rubble = { i0, n, items, k: 0 };
  }
  function setRubble(st, k) {
    const r = st.rubble;
    if (!r) return;
    r.k = k;
    r.items.forEach((it, j) => {
      if (k <= 0.001) { rubbleP.mesh.setMatrixAt(r.i0 + j, ZERO); return; }
      Q.setFromEuler(E.set(it.r[0], it.r[1], it.r[2]));
      M4.compose(V.set(it.x, it.y * k + it.sy * 0.3 * k, it.z), Q, SC.set(it.sx * k, it.sy * k, it.sz * k));
      rubbleP.mesh.setMatrixAt(r.i0 + j, M4);
    });
    rubbleP.mesh.instanceMatrix.needsUpdate = true;
  }

  // ---------- flying debris ----------
  const chunks = [];
  let debrisNext = 0;
  function debris(x, y, z, vx, vy, vz, s, col) {
    const i = debrisNext; debrisNext = (debrisNext + 1) % debrisP.n;
    debrisP.mesh.setColorAt(i, col);
    debrisP.mesh.instanceColor.needsUpdate = true;
    const old = chunks.findIndex((c) => c.i === i);
    if (old >= 0) chunks.splice(old, 1);
    chunks.push({ i, p: new THREE.Vector3(x, y, z), v: new THREE.Vector3(vx, vy, vz), r: new THREE.Vector3(rnd() * 6, rnd() * 6, rnd() * 6), w: new THREE.Vector3((rnd() - 0.5) * 8, (rnd() - 0.5) * 8, (rnd() - 0.5) * 8), s, age: 0, landed: false });
  }
  function burstDebris(st, n, push = [0, 0], up = 12) {
    for (let k = 0; k < n; k++) {
      const a = rnd() * Math.PI * 2, rr = st.R * Math.sqrt(rnd()) * 0.8, sp = 4 + rnd() * 14;
      const c = rnd() < 0.6 ? st.col.clone().multiplyScalar(0.75 + rnd() * 0.3) : new THREE.Color().setHSL(0.07, 0.08, 0.3 + rnd() * 0.3);
      debris(st.cx + Math.cos(a) * rr, 2 + rnd() * st.H * 0.8, st.cz + Math.sin(a) * rr,
        Math.cos(a) * sp + push[0], up * (0.3 + rnd()), Math.sin(a) * sp + push[1], 0.6 + rnd() * 2.2, c);
    }
  }
  function updateDebris(dt) {
    for (let k = chunks.length - 1; k >= 0; k--) {
      const c = chunks[k];
      c.age += dt;
      if (!c.landed) {
        c.v.y -= 22 * dt;
        c.p.addScaledVector(c.v, dt);
        c.r.addScaledVector(c.w, dt);
        if (c.p.y < c.s * 0.35) {
          c.p.y = c.s * 0.35; c.v.y *= -0.3; c.v.x *= 0.5; c.v.z *= 0.5; c.w.multiplyScalar(0.5);
          if (Math.abs(c.v.y) < 2) c.landed = true;
        }
      }
      const fade = c.age > 16 ? 1 - (c.age - 16) / 2 : 1;
      if (fade <= 0) { debrisP.mesh.setMatrixAt(c.i, ZERO); chunks.splice(k, 1); continue; }
      Q.setFromEuler(E.set(c.r.x, c.r.y, c.r.z));
      M4.compose(c.p, Q, SC.set(c.s, c.s * 0.6, c.s * 0.8).multiplyScalar(fade));
      debrisP.mesh.setMatrixAt(c.i, M4);
    }
    debrisP.mesh.instanceMatrix.needsUpdate = true;
  }

  // ---------- smoke, dust, fire sprites ----------
  function spritePool(n, blending) {
    const items = [];
    for (let i = 0; i < n; i++) {
      // fire is not tone-mapped so it still glows in daylight
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: PUFF, transparent: true, depthWrite: false, blending, fog: true, toneMapped: blending !== THREE.AdditiveBlending }));
      s.visible = false;
      root.add(s);
      items.push({ s, on: false });
    }
    let next = 0;
    return {
      items,
      spawn(o) {
        const it = items[next]; next = (next + 1) % n;
        Object.assign(it, { on: true, age: 0, ...o });
        it.s.visible = true;
        it.s.position.set(o.x, o.y, o.z);
        it.s.material.color.copy(o.c0);
        it.s.material.rotation = rnd() * 6.28;
      },
    };
  }
  const C = (h) => new THREE.Color(h);
  const COL = { smoke: C('#3a3734'), dust: C('#c4b8a2'), spray: C('#f2f7fa'), f0: C('#ffd27a'), f1: C('#ff3d0a'), blue0: C('#bfe8ff'), blue1: C('#2a7bff') };
  function puff(kind, x, y, z, vx, vy, vz, extra = {}) {
    if (kind === 'fire' || kind === 'flame') {
      fireS.spawn({ x, y, z, vx, vy, vz, life: 0.8 + rnd() * 0.6, s0: 3, s1: 7, a: 0.9, c0: COL.f0, c1: COL.f1, drag: 0.4, ...extra });
    } else {
      const c = COL[kind] || COL.smoke;
      smokeS.spawn({ x, y, z, vx, vy, vz, life: kind === 'smoke' ? 7 : 4.5, s0: kind === 'smoke' ? 5 : 6, s1: kind === 'smoke' ? 24 : 26, a: kind === 'smoke' ? 0.55 : 0.6, c0: c, c1: c, drag: 0.6, ...extra });
    }
  }
  function updateSprites(dt) {
    for (const P of [smokeS, fireS]) for (const it of P.items) {
      if (!it.on) continue;
      it.age += dt;
      const t = it.age / it.life;
      if (t >= 1) { it.on = false; it.s.visible = false; continue; }
      const dr = 1 - it.drag * dt;
      it.vx *= dr; it.vz *= dr; it.vy *= 1 - it.drag * 0.5 * dt;
      it.s.position.x += it.vx * dt; it.s.position.y += it.vy * dt; it.s.position.z += it.vz * dt;
      const sc = lerp(it.s0, it.s1, Math.sqrt(t));
      it.s.scale.set(sc, sc, 1);
      it.s.material.opacity = it.a * (1 - t) * Math.min(1, t * 8);
      if (it.c0 !== it.c1) it.s.material.color.copy(it.c0).lerp(it.c1, t);
    }
  }
  function dustBurst(x, z, R, n) {
    for (let k = 0; k < n; k++) {
      const a = rnd() * 6.28, sp = 3 + rnd() * 9;
      puff('dust', x + Math.cos(a) * R * 0.5 * rnd(), 1 + rnd() * 4, z + Math.sin(a) * R * 0.5 * rnd(), Math.cos(a) * sp, 1 + rnd() * 3, Math.sin(a) * sp, { s0: 6 + R * 0.1, s1: 20 + R * 0.4 });
    }
  }

  // emitters: fire and smoke over wrecks, dust under tornadoes; `owner` lets recovery put them out
  const emitters = [];
  function emitFire(st) {
    emitters.push({ owner: st.idx, rate: 10 + st.R * 0.3, acc: 0, fn() {
      const a = rnd() * 6.28, r = st.R * 0.55 * Math.sqrt(rnd());
      const x = st.cx + Math.cos(a) * r, z = st.cz + Math.sin(a) * r;
      if (rnd() < 0.7) puff('fire', x, 0.5 + rnd() * 3, z, (rnd() - 0.5) * 2, 3 + rnd() * 4, (rnd() - 0.5) * 2, { s0: 2.5 + rnd() * 2, s1: 6 + rnd() * 5 });
      else puff('smoke', x, 4, z, 1.5 + rnd(), 4 + rnd() * 2, 0.6, {});
    } });
  }
  function updateEmitters(dt) {
    for (const e of emitters) {
      e.acc += e.rate * dt;
      while (e.acc >= 1) { e.acc--; e.fn(); }
    }
  }

  // ---------- flashes, shockwaves, decals ----------
  const flashLight = new THREE.PointLight('#ffb070', 0, 700, 1.4);
  root.add(flashLight);
  const fx = [];
  const ringGeo = new THREE.RingGeometry(0.85, 1, 64).rotateX(-Math.PI / 2);
  const sphereGeo = new THREE.SphereGeometry(1, 24, 16);
  [ringGeo, sphereGeo, BOX, PUFF, GLOW, STREAK, CRATER, SCORCH].forEach((x) => SHARED.add(x));
  function explosion(x, y, z, R, col = '#ffb36b') {
    const flash = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    flash.position.set(x, y, z);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#fff3e0', transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    ring.position.set(x, 1.2, z);
    root.add(flash, ring);
    fx.push({ t: 0, dur: 1.4, fn(t) {
      flash.scale.setScalar(R * (0.3 + smooth(t * 2) * 0.7));
      flash.material.opacity = Math.max(0, 1 - t * 1.6);
      ring.scale.setScalar(R * 0.3 + t * R * 2.6);
      ring.material.opacity = 0.8 * (1 - t);
    }, end() { root.remove(flash, ring); flash.material.dispose(); ring.material.dispose(); } });
    flashLight.position.set(x, y + 20, z);
    flashLight.color.set(col);
    flashLight.intensity = Math.max(flashLight.intensity, 5000);
    for (let k = 0; k < 26; k++) {
      const a = rnd() * 6.28, e = rnd() * 1.2, sp = 10 + rnd() * 20;
      puff('fire', x, y + 2, z, Math.cos(a) * Math.cos(e) * sp, Math.sin(e) * sp, Math.sin(a) * Math.cos(e) * sp, { life: 0.9 + rnd() * 0.5, s0: R * 0.2, s1: R * 0.45 });
    }
    for (let k = 0; k < 14; k++) puff('smoke', x + (rnd() - 0.5) * R * 0.6, y + rnd() * 10, z + (rnd() - 0.5) * R * 0.6, (rnd() - 0.5) * 6, 5 + rnd() * 6, (rnd() - 0.5) * 6, { s0: R * 0.25, s1: R * 0.8, life: 6 });
    shake(2.5);
  }
  const decals = [];
  function decal(tex, x, z, r, rot = rnd() * 6.28, opacity = 1) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    m.position.set(x, DECAL_Y, z); m.scale.setScalar(r); m.rotation.y = rot;
    m.renderOrder = 1;
    root.add(m);
    decals.push({ m, o: opacity, fade: null });
    return m;
  }
  const crackMat = new THREE.MeshStandardMaterial({ color: '#221d1a', roughness: 1, transparent: true });
  function crack(x, z, ang, len) {
    const segs = [];
    let px = x, pz = z;
    for (let k = 0; k < Math.round(len / 6); k++) {
      ang += (rnd() - 0.5) * 0.9;
      const L = 4 + rnd() * 5, w = 0.4 + rnd() * 1.4 * (1 - k / (len / 6));
      const m = new THREE.Mesh(BOX, crackMat);
      m.position.set(px + Math.cos(ang) * L / 2, DECAL_Y - 0.05, pz + Math.sin(ang) * L / 2);
      m.rotation.y = -ang;
      m.scale.set(L + 0.6, 0.12, Math.max(0.3, w));
      m.userData.full = m.scale.x;
      m.scale.x = 0.001;
      root.add(m);
      segs.push(m);
      px += Math.cos(ang) * L; pz += Math.sin(ang) * L;
    }
    decals.push({ m: null, segs, fade: null, grow: 0 });
  }
  function updateFx(dt) {
    for (let k = fx.length - 1; k >= 0; k--) {
      const f = fx[k];
      f.t += dt;
      f.fn(Math.min(1, f.t / f.dur), dt);
      if (f.t >= f.dur) { f.end?.(); fx.splice(k, 1); }
    }
    flashLight.intensity *= Math.exp(-dt * 6);
    if (flashLight.intensity < 50) flashLight.intensity = 0;
    for (let k = decals.length - 1; k >= 0; k--) {
      const d = decals[k];
      if (d.segs && d.grow < 1) { d.grow = Math.min(1, d.grow + dt * 0.7); d.segs.forEach((m, j) => { m.scale.x = Math.max(0.001, m.userData.full * clamp(d.grow * d.segs.length - j, 0, 1)); }); }
      if (d.fade === null) continue;
      d.fade -= dt / 3;
      if (d.m) d.m.material.opacity = d.o * Math.max(0, d.fade);
      if (d.segs) d.segs.forEach((m) => { m.scale.z *= 0.97; });
      if (d.fade <= 0) {
        if (d.m) { root.remove(d.m); d.m.geometry.dispose(); d.m.material.dispose(); }
        if (d.segs) d.segs.forEach((m) => root.remove(m));
        decals.splice(k, 1);
      }
    }
  }

  // ---------- camera shake ----------
  let shakeAmp = 0, shakeHold = 0;
  const shakeOffset = new THREE.Vector3();
  function shake(a, hold = 0) { shakeAmp = Math.max(shakeAmp, a); shakeHold = Math.max(shakeHold, hold); }

  // ======================= building animations =======================
  const active = new Set();
  // collapse: the floors drop into a dust cloud from the top down while the building leans over
  function collapse(st, o = {}) {
    if (st.destroyed) return;
    st.destroyed = true;
    const dir = o.dir || [Math.cos(rnd() * 6.28), Math.sin(rnd() * 6.28)];
    const l = Math.hypot(dir[0], dir[1]) || 1;
    st.tdx = dir[0] / l; st.tdz = dir[1] / l;
    st.hc = Math.min(st.hc, st.H);
    st.anim = { kind: 'collapse', t: -(o.delay || 0), dur: o.dur || 1.8 + st.H / 30, tilt: o.tilt ?? 0.15 + rnd() * 0.3, spin: o.spin || 0, lift: o.lift || 0, fire: o.fire, push: o.push || [0, 0], started: false };
    active.add(st);
  }
  function stepCollapse(st, a, dt) {
    a.t += dt;
    if (a.t < 0) return;
    if (!a.started) {
      a.started = true;
      makeRubble(st);
      dustBurst(st.cx, st.cz, st.R, 10 + Math.round(st.R * 0.6));
      burstDebris(st, clamp(Math.round((st.b.a || 200) / 30), 10, 60), a.push);
      shake(0.8);
    }
    const e = clamp(a.t / a.dur, 0, 1);
    st.hc = st.H * (1 - e * e);
    st.tilt = a.tilt * smooth(e);
    st.spin = a.spin * smooth(e);
    st.lift = a.lift * Math.sin(e * Math.PI);
    if (rnd() < dt * 12) puff('dust', st.cx + (rnd() - 0.5) * st.R, st.hc * 0.6, st.cz + (rnd() - 0.5) * st.R, (rnd() - 0.5) * 4, 1, (rnd() - 0.5) * 4, { s0: 8, s1: 20 + st.R * 0.3 });
    setRubble(st, smooth(e));
    if (e >= 1) {
      st.hidden = true;
      st.anim = null;
      if (a.fire) emitFire(st);
    }
    apply(st);
  }

  // ======================= recovery crews =======================
  const crew = [];
  const HAT = new THREE.Color('#f5c518'), VEST = new THREE.Color('#ff7a1a');
  function spawnWorker(st, slot) {
    const P = figure(rnd, rnd() < 0.45);
    P.push([HAT, 0, 0, 1.71, 0, 0.27, 0.11, 0.3, 0], [HAT, 0, 0, 1.66, 0.06, 0.3, 0.03, 0.38, 0]);   // hard hat with a brim
    P.push([VEST, 0, 0, 1.17, 0.005, 0.4, 0.34, 0.23, 0]);                                          // safety vest
    const i0 = crewP.alloc(P.length);
    if (i0 < 0) return null;
    P.forEach((p, k) => crewP.mesh.setColorAt(i0 + k, p[0]));
    crewP.mesh.instanceColor.needsUpdate = true;
    const a = rnd() * 6.28, d = st.R + 25 + rnd() * 20;
    const w = { P, i0, st, x: st.cx + Math.cos(a) * d, z: st.cz + Math.sin(a) * d, tx: slot[0], tz: slot[1], yaw: 0, state: 'walk', phase: rnd() * 6, v: 3.6 + rnd() * 1.2, t: 0 };
    crew.push(w);
    return w;
  }
  const base = new THREE.Matrix4(), Mp = new THREE.Matrix4();
  function placeWorker(w, y, leg, arm, armsTogether) {
    base.makeRotationY(w.yaw).setPosition(w.x, y, w.z);
    for (let k = 0; k < w.P.length; k++) {
      const [, px, py, cy, cz, sw, sh, sd, s] = w.P[k];
      let ang = 0;
      if (Math.abs(s) === 1) ang = 0.42 * Math.sign(s) * leg;
      else if (Math.abs(s) === 2) ang = armsTogether ? arm : -0.36 * Math.sign(s) * arm;
      const c = Math.cos(ang), sn = Math.sin(ang);
      Mp.makeRotationX(ang).scale(SC.set(sw, sh, sd)).setPosition(px, py + cy * c - cz * sn, cy * sn + cz * c);
      crewP.mesh.setMatrixAt(w.i0 + k, M4.multiplyMatrices(base, Mp));
    }
  }
  function updateCrew(dt) {
    for (let k = crew.length - 1; k >= 0; k--) {
      const w = crew[k];
      w.t += dt;
      if (w.state === 'walk' || w.state === 'leave') {
        const dx = w.tx - w.x, dz = w.tz - w.z, d = Math.hypot(dx, dz);
        if (d > 0.3) {
          const s = Math.min(d, w.v * dt);
          w.x += (dx / d) * s; w.z += (dz / d) * s;
          w.yaw = Math.atan2(dx, dz);
          w.phase += (w.v / 0.75) * Math.PI * dt;
          placeWorker(w, Math.abs(Math.cos(w.phase)) * 0.05, Math.sin(w.phase), Math.sin(w.phase), false);
        } else if (w.state === 'walk') { w.state = 'work'; w.yaw = Math.atan2(w.st.cx - w.x, w.st.cz - w.z); }
        else { crewP.free(w.i0, w.P.length); crew.splice(k, 1); continue; }
      }
      if (w.state === 'work') {
        w.phase += dt * 9;
        placeWorker(w, 0, 0, -(1.5 + 0.6 * Math.sin(w.phase)), true);
      } else if (w.state === 'cheer') {
        w.phase += dt * 8;
        placeWorker(w, Math.abs(Math.sin(w.phase)) * 0.45, 0, -2.9 + 0.2 * Math.sin(w.phase * 2), true);
        if (w.t > w.until) {
          w.state = 'leave';
          const a = Math.atan2(w.z - w.st.cz, w.x - w.st.cx) + (rnd() - 0.5);
          w.tx = w.x + Math.cos(a) * 30; w.tz = w.z + Math.sin(a) * 30;
        }
      }
    }
    crewP.mesh.instanceMatrix.needsUpdate = true;
  }

  // scaffolding round the outline, offset outwards, following the height the building has reached
  function ringOf(st, off) {
    const pts = st.b.o.slice(0, -1);
    return pts.map(([x, z]) => { const dx = x - st.cx, dz = z - st.cz, d = Math.hypot(dx, dz) || 1; return [x + (dx / d) * off, z + (dz / d) * off]; });
  }
  function makeScaffold(st) {
    const ring = ringOf(st, 1.4), posts = [], rails = [];
    for (let i = 0; i < ring.length; i++) {
      const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % ring.length], L = Math.hypot(bx - ax, bz - az);
      const n = Math.max(1, Math.round(L / 3.5));
      for (let j = 0; j < n; j++) posts.push([ax + ((bx - ax) * j) / n, az + ((bz - az) * j) / n]);
      for (let y = 2; y < st.H + 1.5; y += 2.2) rails.push({ x: (ax + bx) / 2, z: (az + bz) / 2, y, L, ang: Math.atan2(bz - az, bx - ax) });
    }
    const n = posts.length + rails.length, i0 = scaffP.alloc(n);
    if (i0 < 0) return;
    st.scaffold = { i0, n, posts, rails };
  }
  function setScaffold(st, h) {
    const s = st.scaffold;
    if (!s) return;
    const top = Math.min(h + 2, st.H + 1.5);
    s.posts.forEach(([x, z], j) => scaffP.mesh.setMatrixAt(s.i0 + j, top < 0.3 ? ZERO : M4.compose(V.set(x, top / 2, z), Q.identity(), SC.set(0.15, top, 0.15))));
    s.rails.forEach((r, j) => {
      const on = r.y <= top;
      if (!on) { scaffP.mesh.setMatrixAt(s.i0 + s.posts.length + j, ZERO); return; }
      Q.setFromAxisAngle(V.set(0, 1, 0), -r.ang);
      scaffP.mesh.setMatrixAt(s.i0 + s.posts.length + j, M4.compose(V.set(r.x, r.y, r.z), Q, SC.set(r.L, 0.12, 0.6)));
    });
    scaffP.mesh.instanceMatrix.needsUpdate = true;
  }

  function rebuild(st, delay) {
    st.anim = { kind: 'rebuild', t: -delay, phase: 'wait', workers: [] };
    active.add(st);
  }
  function stepRebuild(st, a, dt) {
    a.t += dt;
    if (a.t < 0) return;
    if (a.phase === 'wait') {
      a.phase = 'gather';
      // put the fires out, send a crew to stand round the site
      for (let k = emitters.length - 1; k >= 0; k--) if (emitters[k].owner === st.idx) emitters.splice(k, 1);
      const n = clamp(Math.round(Math.sqrt(st.b.a || 200) / 3), 4, 12);
      const ring = ringOf(st, 3.2), per = [];
      let L = 0;
      for (let i = 0; i < ring.length; i++) { const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % ring.length]; per.push([ax, az, bx, bz, L]); L += Math.hypot(bx - ax, bz - az); }
      for (let j = 0; j < n; j++) {
        let s = (L * (j + rnd() * 0.5)) / n, seg = per[0];
        for (const p of per) if (p[4] <= s) seg = p;
        const sl = Math.hypot(seg[2] - seg[0], seg[3] - seg[1]) || 1, f = clamp((s - seg[4]) / sl, 0, 1);
        const w = spawnWorker(st, [seg[0] + (seg[2] - seg[0]) * f, seg[1] + (seg[3] - seg[1]) * f]);
        if (w) a.workers.push(w);
      }
      a.tg = 0;
    }
    if (a.phase === 'gather') {
      a.tg += dt;
      const there = a.workers.filter((w) => w.state === 'work').length;
      if (there >= Math.ceil(a.workers.length / 2) || a.tg > 14) {
        a.phase = 'build'; a.tb = 0; a.T = 5 + st.H / 3.5;
        makeScaffold(st);
        st.hidden = false; st.tilt = 0; st.spin = 0; st.lift = 0; st.shrink = 1; st.jx = st.jz = 0; st.hc = 0.02;
        apply(st);
      }
      return;
    }
    if (a.phase === 'build') {
      a.tb += dt;
      const e = clamp(a.tb / a.T, 0, 1);
      st.hc = Math.max(0.02, st.H * e);
      setRubble(st, 1 - smooth(e / 0.45));
      setScaffold(st, st.hc);
      if (rnd() < dt * 3) puff('dust', st.cx + (rnd() - 0.5) * st.R, 1, st.cz + (rnd() - 0.5) * st.R, 0, 1, 0, { s0: 3, s1: 9, a: 0.35, life: 2.5 });
      if (e >= 1) {
        st.hc = Infinity;
        if (st.rubble) { rubbleP.free(st.rubble.i0, st.rubble.n); st.rubble = null; }
        if (st.scaffold) { scaffP.free(st.scaffold.i0, st.scaffold.n); st.scaffold = null; }
        st.destroyed = false; st.noRubble = false; st.anim = null;
        for (const w of a.workers) { w.state = 'cheer'; w.t = 0; w.until = 1.6 + rnd() * 0.8; w.phase = rnd() * 3; }
        rebuilt++;
      }
      apply(st);
    }
  }
  function updateBuildings(dt) {
    for (const st of active) {
      const a = st.anim;
      if (!a) { if (!st.destroyed && pristine(st)) active.delete(st); continue; }
      if (a.kind === 'collapse') stepCollapse(st, a, dt);
      else if (a.kind === 'rebuild') stepRebuild(st, a, dt);
    }
  }

  // ======================= disaster scripts =======================
  const centroid = (sts) => [sts.reduce((s, t) => s + t.cx, 0) / sts.length, sts.reduce((s, t) => s + t.cz, 0) / sts.length];
  const spread = (sts, c) => Math.max(...sts.map((t) => Math.hypot(t.cx - c[0], t.cz - c[1])), 60);
  const view = (sts, k = 2.4, polar = 58) => { const c = centroid(sts); flyTo(c[0], c[1], clamp(spread(sts, c) * k + 220, 380, 1100), polar); };
  // a path through the targets: sort them along a random direction, start and end well outside
  function route(n, r) {
    const sts = pickTargets(n, r);
    if (!sts.length) return null;
    let a = rnd() * 6.28;
    if (isLead(sts[0]) && sts.length > 1) { const c = centroid(sts.slice(1)); a = Math.atan2(c[1] - sts[0].cz, c[0] - sts[0].cx); }
    const d = [Math.cos(a), Math.sin(a)], u = (s) => s.cx * d[0] + s.cz * d[1];
    sts.sort((p, q) => (isLead(q) - isLead(p)) || u(p) - u(q));
    return { sts, d };
  }

  // ---- meteors ----
  function meteor() {
    const sts = pickTargets(3);
    if (!sts.length) return null;
    view(sts, 2.2, 60);
    const items = sts.map((st, i) => {
      const a = rnd() * 6.28, end = new THREE.Vector3(st.cx, st.H * 0.4, st.cz);
      const start = end.clone().add(new THREE.Vector3(Math.cos(a) * 420, 560, Math.sin(a) * 420));
      const rock = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: '#fff0c0' }));
      rock.scale.setScalar(4);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: '#ff8a2a', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.scale.set(45, 45, 1);
      rock.visible = glow.visible = false;
      root.add(rock, glow);
      return { st, t: -i * 1.6 - 0.8, start, end, rock, glow, hit: false };
    });
    let tEnd = Infinity, t = 0;
    return {
      update(dt) {
        t += dt;
        for (const it of items) {
          if (it.hit) continue;
          it.t += dt;
          if (it.t < 0) continue;
          const e = Math.min(1, it.t / 2.4);
          it.rock.visible = it.glow.visible = true;
          it.rock.position.lerpVectors(it.start, it.end, e);
          it.glow.position.copy(it.rock.position);
          for (let k = 0; k < 3; k++) {
            const p = it.rock.position;
            puff('fire', p.x + (rnd() - 0.5) * 3, p.y + (rnd() - 0.5) * 3, p.z + (rnd() - 0.5) * 3, 0, 0, 0, { life: 0.6, s0: 9, s1: 3 });
            if (k === 0) puff('smoke', p.x, p.y, p.z, 0, 0, 0, { life: 3.5, s0: 6, s1: 18, a: 0.45 });
          }
          if (e >= 1) {
            it.hit = true;
            disposeTree(it.rock); disposeTree(it.glow);
            const { st } = it;
            explosion(st.cx, 6, st.cz, 55);
            decal(CRATER, st.cx, st.cz, Math.max(14, st.R * 0.9));
            shake(4);
            collapse(st, { dur: 1.3, tilt: 0.1, fire: true, push: [0, 0] });
            for (const o of near(st.cx, st.cz, 42)) if (rnd() < 0.75) {
              const dx = o.cx - st.cx, dz = o.cz - st.cz;
              collapse(o, { dir: [dx, dz], tilt: 0.35 + rnd() * 0.3, delay: 0.2 + rnd() * 0.5, fire: rnd() < 0.5, push: [dx * 0.3, dz * 0.3] });
            }
            if (items.every((x) => x.hit)) tEnd = t + 3.5;
          }
        }
        return t > tEnd;
      },
    };
  }

  // ---- giant monster ----
  // modelled on photos of a classic Godzilla figure the user supplied: charcoal hide, upright pear-shaped body
  // on thick thighs, hands held up at the chest with yellow claws, open red mouth with white teeth, yellow eyes,
  // three rows of jagged white dorsal plates, a long ridged tail that curls up at the tip
  function makeKaiju() {
    const g = new THREE.Group();
    // wrinkled hide: a noisy grey texture multiplied into the skin colour
    const HIDE = canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#9a9a9a'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { const v = (90 + rnd() * 120) | 0; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 5, 1 + rnd() * 3); }
    });
    HIDE.wrapS = HIDE.wrapT = THREE.RepeatWrapping; HIDE.repeat.set(3, 3);
    const skin = new THREE.MeshStandardMaterial({ color: '#97a2aa', map: HIDE, bumpMap: HIDE, bumpScale: 1.5, roughness: 0.95, emissive: '#252b30', emissiveIntensity: 1 });
    const belly = new THREE.MeshStandardMaterial({ color: '#a7b0b6', map: HIDE, bumpMap: HIDE, bumpScale: 1.5, roughness: 0.95, emissive: '#2a3034', emissiveIntensity: 1 });
    const plate = new THREE.MeshStandardMaterial({ color: '#eef2f3', roughness: 0.7, emissive: '#3aa8ff', emissiveIntensity: 0 });
    const claw = new THREE.MeshStandardMaterial({ color: '#d9b15c', roughness: 0.5 });
    const mouthM = new THREE.MeshStandardMaterial({ color: '#b3262b', roughness: 0.6 });
    const tooth = new THREE.MeshStandardMaterial({ color: '#f4f1e8', roughness: 0.4 });
    const eye = new THREE.MeshBasicMaterial({ color: '#ffc22e' });
    const add = (parent, geo, mat, p, s = [1, 1, 1], r = [0, 0, 0]) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(...p); m.scale.set(...s); m.rotation.set(...r);
      m.castShadow = true;
      parent.add(m);
      return m;
    };
    const sph = new THREE.SphereGeometry(1, 24, 16), cyl = (a, b, h) => new THREE.CylinderGeometry(a, b, h, 16);
    const clawGeo = new THREE.ConeGeometry(0.45, 1.8, 6), toothGeo = new THREE.ConeGeometry(0.22, 0.7, 4);
    // a jagged maple-leaf plate, extruded thin; base at y 0, tip at y 1, flat in the y/z plane
    const leaf = new THREE.Shape();
    const L = [[-0.5, 0], [-0.55, 0.3], [-0.85, 0.42], [-0.5, 0.5], [-0.62, 0.72], [-0.28, 0.7], [-0.25, 0.92], [0, 1], [0.25, 0.92], [0.28, 0.7], [0.62, 0.72], [0.5, 0.5], [0.85, 0.42], [0.55, 0.3], [0.5, 0]];
    leaf.moveTo(...L[0]);
    for (const p of L.slice(1)) leaf.lineTo(...p);
    const plateGeo = new THREE.ExtrudeGeometry(leaf, { depth: 0.12, bevelEnabled: false }).translate(0, 0, -0.06).rotateY(Math.PI / 2);
    const plates = (parent, y, z, h, tiltX) => {
      add(parent, plateGeo, plate, [0, y, z], [1, h, h * 0.9], [tiltX, 0, 0]);
      for (const s of [-1, 1]) add(parent, plateGeo, plate, [s * 1.3, y - h * 0.15, z + 0.4], [1, h * 0.7, h * 0.65], [tiltX, 0, s * 0.3]);
    };

    // torso: a pear, widest at the hips; the belly a little lighter, crossed by ridges
    add(g, sph, skin, [0, 31, 0], [8, 12, 7], [0.15, 0, 0]);
    add(g, sph, skin, [0, 20, -0.5], [9.5, 9, 8.2]);
    add(g, sph, belly, [0, 27, 3], [6.2, 11, 5], [0.15, 0, 0]);
    for (let k = 0; k < 6; k++) add(g, sph, skin, [0, 20 + k * 2.6, 6.6 - k * 0.15 - (k > 3 ? (k - 3) * 0.5 : 0)], [5.2 - k * 0.25, 0.35, 1.3]);
    // legs: thick thighs, short shins, broad feet with four yellow claws
    const legs = [-1, 1].map((s) => {
      const G = new THREE.Group();
      G.position.set(5.8 * s, 18, 0);
      add(G, sph, skin, [0.4 * s, -3, 0.5], [5, 7.5, 5.8]);
      add(G, cyl(3.4, 3.8, 9), skin, [0.3 * s, -11.5, 0.6]);
      add(G, sph, skin, [0.3 * s, -16.4, 2.2], [3.6, 1.8, 5.2]);
      for (let c = 0; c < 4; c++) add(G, clawGeo, claw, [0.3 * s + (c - 1.5) * 1.6, -17.2, 7], [1, 1, 1], [Math.PI / 2 + 0.3, 0, 0]);
      g.add(G);
      return G;
    });
    // arms held up in front of the chest, hands open with yellow claws
    const arms = [-1, 1].map((s) => {
      const A = new THREE.Group();
      A.position.set(7 * s, 36, 2);
      add(A, cyl(1.9, 2.3, 7), skin, [0.5 * s, -3, 1.2], [1, 1, 1], [-0.5, 0, 0.15 * s]);
      const fore = new THREE.Group();
      fore.position.set(0.9 * s, -6, 2.6);
      add(fore, cyl(1.6, 1.9, 6), skin, [0, 2.4, 1.6], [1, 1, 1], [0.6, 0, 0]);
      add(fore, sph, skin, [0, 5.4, 3.4], [1.8, 2.2, 1.4]);
      for (let c = 0; c < 4; c++) add(fore, clawGeo, claw, [(c - 1.5) * 0.85, 7.3, 3.6 + (c === 0 || c === 3 ? -0.3 : 0)], [0.7, 0.7, 0.7], [0.3, 0, 0]);
      A.add(fore);
      g.add(A);
      return A;
    });
    // neck: two overlapping swells that run smoothly from the shoulders up into the head (no hard edge)
    add(g, sph, skin, [0, 39.5, 2.2], [5.6, 6.2, 5.2], [0.3, 0, 0]);
    add(g, sph, skin, [0, 43, 3.8], [4.3, 4.4, 4.4], [0.4, 0, 0]);
    // head, tilted up as on the figure: round skull, heavy brows over yellow eyes, wide cheeks at the hinge,
    // a tapering snout, the jaw dropped wide open on a red mouth lined with white teeth
    const head = new THREE.Group();
    head.position.set(0, 45.2, 5.2);
    add(head, sph, skin, [0, 1.3, 0.4], [3.2, 2.9, 3.6]);                                             // skull
    for (const s of [-1, 1]) {
      add(head, sph, skin, [s * 1.85, 0.1, 1.9], [1.55, 1.6, 2.3]);                                    // cheek
      add(head, sph, skin, [s * 1.25, 2.55, 2.9], [1.35, 0.62, 1.7], [0.25, s * 0.35, s * 0.2]);       // brow ridge
      add(head, sph, eye, [s * 1.75, 1.85, 3.55], [0.42, 0.32, 0.3]);                                  // eye
      add(head, sph, skin, [s * 2.1, 1.6, -1.4], [0.7, 1.2, 0.8]);                                     // ear bump
    }
    add(head, sph, skin, [0, 1.05, 4.5], [2.15, 1.25, 3.3], [0.1, 0, 0]);                              // snout
    add(head, sph, skin, [0, 1.25, 7.4], [1.3, 0.8, 0.9]);                                             // nose
    add(head, sph, mouthM, [0, -0.05, 3.6], [1.85, 0.75, 3.1]);                                        // roof of the mouth
    // upper teeth follow the curve of the snout, longest at the front corners
    for (let i = 0; i < 7; i++) for (const s of [-1, 1]) {
      const z = 1.8 + i * 0.78, x = s * (1.95 - Math.max(0, i - 3) * 0.33);
      add(head, toothGeo, tooth, [x, -0.45, z], [1, i === 5 ? 1.6 : 1.1, 1], [Math.PI, 0, 0]);
    }
    const jaw = new THREE.Group();
    jaw.position.set(0, -0.4, 1.4);
    add(jaw, sph, skin, [0, -0.85, 2.9], [2.05, 0.72, 3.2]);                                           // lower jaw
    add(jaw, sph, skin, [0, -1.3, 1.2], [1.8, 0.8, 1.6]);                                              // throat under the jaw
    add(jaw, sph, mouthM, [0, -0.3, 2.9], [1.65, 0.35, 2.8]);                                          // tongue
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) {
      const z = 1.1 + i * 0.78, x = s * (1.7 - Math.max(0, i - 2) * 0.3);
      add(jaw, toothGeo, tooth, [x, -0.05, z], [1, i === 4 ? 1.5 : 1, 1]);
    }
    jaw.rotation.x = 0.45;
    head.add(jaw);
    head.rotation.x = -0.22;
    g.add(head);
    // dorsal plates from the neck down to the hips, largest in the middle of the back
    for (let k = 0; k < 9; k++) {
      const f = k / 8, y = 43 - k * 3.4, z = -3.2 - Math.sin(f * Math.PI) * 4.6 - f * 1.5;
      plates(g, y, z, 3.5 + Math.sin(Math.min(1, f * 1.4) * Math.PI) * 5.5, -0.45);
    }
    // tail: a chain of tapering segments, each a child of the one before (so a small sway per joint adds up).
    // As on the figure it is an S: down from the hips to lie along the ground, then rising steeply at the end.
    // Each joint's pitch is relative to the one before (negative = down).
    const PITCH = [-0.6, 0.07, 0.07, 0.07, 0.17, 0.17, 0.17, 0.3, 0.3, 0.3, 0.3];
    const tail = [];
    let parent = g, pos = [0, 17, -7];
    for (let k = 0; k < PITCH.length; k++) {
      const T = new THREE.Group();
      T.position.set(...pos);
      T.rotation.x = PITCH[k];
      const r0 = 5.4 * (1 - k / 12), r1 = 5.4 * (1 - (k + 1) / 12), len = 6.4;
      add(T, cyl(r1, r0, len), skin, [0, 0, -len / 2], [1, 1, 1], [Math.PI / 2, 0, 0]);
      add(T, sph, belly, [0, -r0 * 0.55, -len / 2], [r0 * 0.75, r0 * 0.4, len * 0.45]);             // lighter underside
      for (let j = 0; j < 2; j++) add(T, sph, skin, [0, 0, -len * (0.25 + j * 0.5)], [r0 * 1.04, r0 * 1.04, 0.5]);   // ring ridges
      plates(T, r0 * 0.85, -len / 2, 2.6 * (1 - k / 11) + 0.5, -0.6);
      parent.add(T);
      tail.push(T);
      parent = T; pos = [0, 0, -len];
    }
    g.scale.setScalar(1.15);
    return { g, legs, arms, head, jaw, tail, plate };
  }
  function kaiju() {
    const r = route(4, 220);
    if (!r) return null;
    const { sts, d } = r;
    const last = sts.pop();
    const K = makeKaiju();
    root.add(K.g);
    const first = sts[0] || last, lead = isLead(first);
    const way = [[first.cx - d[0] * 120, first.cz - d[1] * 120], ...sts.map((s) => [s.cx, s.cz]), [last.cx - d[0] * 75, last.cz - d[1] * 75]];
    const pos = new THREE.Vector2(...way[0]);
    let wi = 1, yaw = Math.atan2(d[0], d[1]), phase = 0, mode = 'walk', mt = 0, t = 0, smashed = 0, beam = null;
    view([first, last, ...sts], 1.6, 62);
    const mouth = new THREE.Vector3();
    const exit = [last.cx + d[0] * 60 + d[1] * 160, last.cz + d[1] * 60 - d[0] * 160];
    const walkTo = (tx, tz, dt) => {
      const dx = tx - pos.x, dz = tz - pos.y, dist = Math.hypot(dx, dz);
      const want = Math.atan2(dx, dz);
      let dy = want - yaw; while (dy > Math.PI) dy -= 6.28; while (dy < -Math.PI) dy += 6.28;
      const turn = 0.9 + 3 * (1 - Math.min(1, dist / 40));                       // turn harder near the point, never circle it
      yaw += clamp(dy, -dt * turn, dt * turn);
      const s = Math.min(dist, 18 * dt);
      pos.x += Math.sin(yaw) * s; pos.y += Math.cos(yaw) * s;
      const before = Math.sin(phase);
      phase += (s / 18) * Math.PI;
      if (Math.sign(before) !== Math.sign(Math.sin(phase))) shake(0.9);
      return dist < 8;
    };
    return {
      update(dt) {
        t += dt; mt += dt;
        if (mode === 'walk') {
          if (walkTo(way[wi][0], way[wi][1], dt)) { wi++; if (wi >= way.length) { mode = 'charge'; mt = 0; } }
          // stomp what is underfoot
          if (smashed < 14) for (const st of near(pos.x, pos.y, 20)) if (st !== last && (!lead || first.destroyed || st === first)) {
            collapse(st, { dir: [Math.sin(yaw), Math.cos(yaw)], tilt: 0.4 + rnd() * 0.4, push: [Math.sin(yaw) * 10, Math.cos(yaw) * 10], fire: rnd() < 0.3 });
            smashed++;
          }
        } else if (mode === 'charge') {
          const want = Math.atan2(last.cx - pos.x, last.cz - pos.y);
          yaw += clamp(want - yaw, -dt, dt);
          K.plate.emissiveIntensity = smooth(mt / 1.6) * 3;
          K.jaw.rotation.x = 0.45 + smooth(mt / 1.6) * 0.3;
          if (mt > 1.8) {
            mode = 'breath'; mt = 0;
            beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 16, 1, true).translate(0, 0.5, 0).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#7fd0ff', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
            root.add(beam);
          }
        } else if (mode === 'breath') {
          K.head.updateWorldMatrix(true, false);
          mouth.set(0, -0.3, 7).applyMatrix4(K.head.matrixWorld);
          const target = new THREE.Vector3(last.cx, last.H * 0.5, last.cz);
          beam.position.copy(mouth);
          beam.lookAt(target);
          beam.scale.set(2.2 + Math.sin(t * 40) * 0.5, 2.2 + Math.sin(t * 37) * 0.5, mouth.distanceTo(target));
          for (let k = 0; k < 2; k++) puff('fire', target.x + (rnd() - 0.5) * 8, target.y + (rnd() - 0.5) * 8, target.z + (rnd() - 0.5) * 8, 0, 4, 0, { c0: COL.blue0, c1: COL.blue1, s0: 8, s1: 16 });
          if (mt > 0.7 && !last.destroyed) {
            explosion(last.cx, last.H * 0.4, last.cz, 60, '#9ad8ff');
            decal(SCORCH, last.cx, last.cz, last.R * 1.4);
            collapse(last, { dir: [d[0], d[1]], tilt: 0.3, fire: true, push: [d[0] * 12, d[1] * 12] });
          }
          if (mt > 1.8) { mode = 'leave'; mt = 0; root.remove(beam); beam.geometry.dispose(); beam.material.dispose(); }
        } else if (mode === 'leave') {
          K.plate.emissiveIntensity *= Math.exp(-dt * 2);
          K.jaw.rotation.x = 0.45 + (K.jaw.rotation.x - 0.45) * Math.exp(-dt * 3);
          walkTo(exit[0], exit[1], dt);
          if (mt > 5) { K.g.position.y -= dt * 16; if (mt > 9) { disposeTree(K.g); return true; } }
        }
        // pose
        K.g.position.x = pos.x; K.g.position.z = pos.y;
        if (mode !== 'leave' || mt <= 5) K.g.position.y = Math.abs(Math.sin(phase)) * 0.8;
        K.g.rotation.y = yaw;
        K.legs[0].rotation.x = Math.sin(phase) * 0.45; K.legs[1].rotation.x = -Math.sin(phase) * 0.45;
        K.arms[0].rotation.x = Math.sin(t * 2) * 0.15; K.arms[1].rotation.x = -Math.sin(t * 2) * 0.15;
        K.tail.forEach((T, k) => { T.rotation.y = Math.sin(t * 1.6 - k * 0.5) * 0.09; });
        K.head.rotation.y = Math.sin(t * 0.7) * 0.15;
        return false;
      },
    };
  }

  // ---- UFO ----
  function makeUfo() {
    const g = new THREE.Group();
    const hullPts = [[0, -2.4], [6, -2.2], [13, -1], [20, 0], [13, 1.4], [6, 2.3], [0, 2.5]].map(([r, y]) => new THREE.Vector2(r, y));
    const hull = new THREE.Mesh(new THREE.LatheGeometry(hullPts, 48), new THREE.MeshStandardMaterial({ color: '#c9ced6', metalness: 0.85, roughness: 0.25 }));
    hull.castShadow = true;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(6.5, 24, 12, 0, 6.28, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#8ff7ff', transparent: true, opacity: 0.6, emissive: '#2ad8ff', emissiveIntensity: 0.5 }));
    dome.position.y = 2.2;
    const under = new THREE.Mesh(new THREE.CircleGeometry(6, 32).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#aaffff' }));
    under.position.y = -2.45;
    g.add(hull, dome, under);
    const lights = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * 6.28, m = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
      m.position.set(Math.cos(a) * 18.6, 0.1, Math.sin(a) * 18.6);
      g.add(m); lights.push(m);
    }
    return { g, hull, lights };
  }
  function ufo() {
    const sts = pickTargets(5);
    if (!sts.length) return null;
    view(sts, 2.2, 62);
    const U = makeUfo();
    root.add(U.g);
    const ALT = 95, a0 = rnd() * 6.28;
    const pos = new THREE.Vector3(sts[0].cx + Math.cos(a0) * 700, 320, sts[0].cz + Math.sin(a0) * 700);
    U.g.position.copy(pos);
    const beamMat = new THREE.MeshBasicMaterial({ color: '#9ff8ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 1, 1, 32, 1, true).translate(0, 0.5, 0), beamMat);
    const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1, 10, 1, true).translate(0, 0.5, 0).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ff3355', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    beam.visible = laser.visible = false;
    root.add(beam, laser);
    let i = 0, mode = 'fly', mt = 0, t = 0, from = pos.clone();
    const to = new THREE.Vector3();
    const station = (st) => to.set(st.cx, Math.max(ALT, st.H + 45), st.cz);
    station(sts[0]);
    return {
      update(dt) {
        t += dt; mt += dt;
        U.hull.rotation.y += dt * 1.5;
        U.lights.forEach((m, k) => m.material.color.setHSL(((k / 16) + t * 0.6) % 1, 1, 0.6));
        const st = sts[i];
        if (mode === 'fly') {
          const e = smooth(mt / 3);
          U.g.position.lerpVectors(from, to, e);
          if (e >= 1) {
            if (st.destroyed) { next(); return false; }                        // already flattened by a laser blast
            mode = i % 3 === 2 ? 'laser' : 'beam'; mt = 0;
            if (mode === 'beam') dustBurst(st.cx, st.cz, st.R, 12);
          }
        } else if (mode === 'beam') {
          // tractor beam: the building rises, spins and shrinks into the saucer
          beam.visible = true;
          beamMat.opacity = 0.32 * smooth(mt / 0.5) * (0.85 + 0.15 * Math.sin(t * 20));
          const top = U.g.position.y - 2.4;
          beam.position.set(st.cx, 0.3, st.cz);
          beam.scale.set(st.R * 1.05, top, st.R * 1.05);
          if (mt > 0.6) {
            const e = clamp((mt - 0.6) / 3.4, 0, 1);
            if (!st.destroyed) { st.destroyed = true; st.noRubble = true; st.hc = st.H; active.add(st); }
            st.lift = e * e * (top - st.H * 0.2);
            st.shrink = 1 - 0.93 * smooth(e);
            st.spin = e * e * 9;
            apply(st);
            if (rnd() < dt * 10) puff('dust', st.cx + (rnd() - 0.5) * st.R, 1, st.cz + (rnd() - 0.5) * st.R, 0, 6, 0, { s0: 4, s1: 10, a: 0.4 });
            if (e >= 1) { st.hidden = true; apply(st); decal(SCORCH, st.cx, st.cz, st.R * 1.1, 0, 0.6); }
          }
          if (mt > 4.4) { beam.visible = false; next(); }
        } else if (mode === 'laser') {
          const p = U.g.position, target = new THREE.Vector3(st.cx, st.H * 0.6, st.cz);
          laser.visible = mt < 1.2 && Math.sin(t * 50) > -0.3;
          laser.position.set(p.x, p.y - 2.5, p.z);
          laser.lookAt(target);
          laser.scale.set(1, 1, laser.position.distanceTo(target));
          if (mt > 1.0 && !st.destroyed) {
            explosion(st.cx, st.H * 0.5, st.cz, 50, '#ff6a7a');
            collapse(st, { tilt: 0.3, fire: true });
            for (const o of near(st.cx, st.cz, 25)) if (rnd() < 0.5) collapse(o, { delay: rnd() * 0.4, fire: rnd() < 0.4 });
          }
          if (mt > 2.2) { laser.visible = false; next(); }
        } else if (mode === 'away') {
          const e = mt / 3;
          U.g.position.lerpVectors(from, to, e * e);
          if (e >= 1) { disposeTree(U.g); disposeTree(beam); disposeTree(laser); return true; }
        }
        U.g.position.y += Math.sin(t * 2) * 0.03;
        return false;
      },
    };
    function next() {
      mt = 0; from = U.g.position.clone(); i++;
      if (i < sts.length) { mode = 'fly'; station(sts[i]); }
      else { mode = 'away'; const a = rnd() * 6.28; to.set(from.x + Math.cos(a) * 900, 650, from.z + Math.sin(a) * 900); }
    }
  }

  // ---- earthquake ----
  function quake() {
    const victims = pickTargets(6 + Math.floor(rnd() * 4), 380);
    if (!victims.length) return null;
    const c = centroid(victims);
    view(victims, 1.5, 60);
    const shaken = shuffle(alive().filter((i) => !victims.some((v) => v.idx === i))).slice(0, 30).map(stateOf);
    shaken.forEach((st) => { st.ph = rnd() * 6.28; active.add(st); });
    victims.forEach((st) => { st.at = isLead(st) ? 1 : 1.6 + rnd() * 4.4; st.ph = rnd() * 6.28; active.add(st); });
    for (let k = 0; k < 4; k++) { const v = pick(victims); crack(v.cx, v.cz, rnd() * 6.28, 60 + rnd() * 100); }
    crack(c[0], c[1], rnd() * 6.28, 160);
    let t = 0;
    const D = 9;
    return {
      update(dt) {
        t += dt;
        const env = t < D ? Math.min(1, t / 1.2) * (t > D - 2 ? (D - t) / 2 : 1) : 0;
        shake(1.6 * env);
        for (const st of shaken) {
          st.jx = Math.sin(t * 19 + st.ph) * 0.35 * env; st.jz = Math.cos(t * 23 + st.ph) * 0.35 * env;
          apply(st);
        }
        for (const st of victims) {
          if (!st.destroyed) {
            st.jx = Math.sin(t * 17 + st.ph) * 0.6 * env; st.jz = Math.cos(t * 21 + st.ph) * 0.6 * env;
            apply(st);
            if (t > st.at) { st.jx = st.jz = 0; collapse(st, { tilt: 0.3 + rnd() * 0.4, dur: 2.2 + st.H / 25, fire: rnd() < 0.35 }); }
          }
        }
        if (rnd() < dt * 6 * env) dustBurst(c[0] + (rnd() - 0.5) * 300, c[1] + (rnd() - 0.5) * 300, 10, 2);
        if (t > D + 1.5) { for (const st of shaken) { st.jx = st.jz = 0; apply(st); } return true; }
        return false;
      },
    };
  }

  // ---- tornado ----
  function tornado() {
    const r = route(5, 260);
    if (!r) return null;
    const { sts, d } = r;
    view(sts, 1.5, 62);
    const g = new THREE.Group();
    const H = 150, prof = [];
    for (let k = 0; k <= 24; k++) { const y = (k / 24) * H; prof.push(new THREE.Vector2(3 + 42 * (y / H) ** 1.7, y)); }
    const geo = new THREE.LatheGeometry(prof, 40);
    const mk = (op, col) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: STREAK, color: col, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, fog: true })); g.add(m); return m; };
    const outer = mk(0.75, '#a7a29a'), inner = mk(0.55, '#7d7871');
    inner.scale.set(0.72, 1, 0.72);
    const cloud = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: '#5f5e5b', transparent: true, opacity: 0.88, roughness: 1 }));
    cloud.scale.set(95, 14, 95); cloud.position.y = H + 4;
    g.add(cloud);
    // junk whirling round the funnel
    const junk = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: '#6d655c', roughness: 1 }), 160);
    const orbit = [];
    for (let k = 0; k < 160; k++) {
      const y = rnd() * H * 0.8;
      orbit.push({ y, r: (3 + 42 * (y / H) ** 1.7) * (0.8 + rnd() * 0.5), a: rnd() * 6.28, s: 0.5 + rnd() * 1.8 });
    }
    g.add(junk);
    root.add(g);
    const first = sts[0], last = sts[sts.length - 1], lead = isLead(first);
    const way = [[first.cx - d[0] * 160, first.cz - d[1] * 160], ...sts.map((s) => [s.cx, s.cz]), [last.cx + d[0] * 180, last.cz + d[1] * 180]];
    let wi = 1, t = 0, ripped = 0;
    const pos = new THREE.Vector2(...way[0]);
    return {
      update(dt) {
        t += dt;
        const [tx, tz] = way[wi], dx = tx - pos.x, dz = tz - pos.y, dist = Math.hypot(dx, dz);
        const s = Math.min(dist, 16 * dt);
        if (dist > 0.1) { pos.x += (dx / dist) * s; pos.y += (dz / dist) * s; }
        if (dist < 2) wi++;
        const wob = Math.sin(t * 0.9) * 8;
        const gx = pos.x - d[1] * wob, gz = pos.y + d[0] * wob;
        g.position.set(gx, 0, gz);
        const k = wi >= way.length ? 0 : Math.min(1, t / 1.5);
        g.scale.setScalar(Math.max(0.001, wi >= way.length - 1 ? Math.min(k, dist / 120 + 0.05) : k));
        outer.rotation.y += dt * 2.5; inner.rotation.y -= dt * 4;
        outer.material.map.offset.y -= dt * 0.3;
        orbit.forEach((o, j) => {
          o.a += dt * (3 - o.y / H * 1.5);
          Q.setFromEuler(E.set(t * 3 + j, t * 2, 0));
          junk.setMatrixAt(j, M4.compose(V.set(Math.cos(o.a) * o.r, o.y, Math.sin(o.a) * o.r), Q, SC.set(o.s, o.s * 0.5, o.s)));
        });
        junk.instanceMatrix.needsUpdate = true;
        for (let k2 = 0; k2 < 3; k2++) {
          const a = rnd() * 6.28;
          puff('dust', gx + Math.cos(a) * 8, 1, gz + Math.sin(a) * 8, -Math.sin(a) * 14 + Math.cos(a) * 4, 3 + rnd() * 5, Math.cos(a) * 14 + Math.sin(a) * 4, { s0: 7, s1: 22, life: 3 });
        }
        shake(0.5);
        if (ripped < 12) for (const st of near(gx, gz, 20)) if (!lead || first.destroyed || st === first) {
          const a = Math.atan2(st.cz - gz, st.cx - gx);
          collapse(st, { spin: (rnd() < 0.5 ? -1 : 1) * (1 + rnd()), tilt: 0.25, dur: 1.5, lift: 4, push: [-Math.sin(a) * 18, Math.cos(a) * 18] });
          ripped++;
        }
        if (wi >= way.length) { disposeTree(g); return true; }
        return false;
      },
    };
  }

  // ---- tsunami ----
  function tsunami() {
    // the wave sweeps a strip over a cluster of buildings, about 700 m across
    let victims = pickTargets(11, 350);
    if (!victims.length) return null;
    let a = rnd() * 6.28;
    const lead = isLead(victims[0]) && victims[0];
    if (lead && victims.length > 1) { const c = centroid(victims.slice(1)); a = Math.atan2(c[1] - lead.cz, c[0] - lead.cx); }
    const d = [Math.cos(a), Math.sin(a)], p = [-d[1], d[0]];
    const U = (s) => s.cx * d[0] + s.cz * d[1], Vv = (s) => s.cx * p[0] + s.cz * p[1];
    if (lead) victims = victims.filter((s) => s === lead || U(s) - s.R * 0.3 > U(lead) - lead.R * 0.3 + 4);
    const umin = Math.min(...victims.map(U)), umax = Math.max(...victims.map(U)), vmin = Math.min(...victims.map(Vv)) - 120, vmax = Math.max(...victims.map(Vv)) + 120;
    view(victims, 1.4, 60);
    const W = vmax - vmin + 300;
    const shape = new THREE.Shape();
    shape.moveTo(-70, 0); shape.lineTo(2, 0);
    shape.quadraticCurveTo(8, 9, 5, 16);
    shape.quadraticCurveTo(2, 23, -5, 23.5);
    shape.quadraticCurveTo(-11, 24, -14, 20);
    shape.quadraticCurveTo(-28, 10, -70, 8);
    shape.lineTo(-70, 0);
    const waveGeo = new THREE.ExtrudeGeometry(shape, { depth: W, bevelEnabled: false, curveSegments: 10 });
    const waterMat = new THREE.MeshStandardMaterial({ color: '#2d6f8c', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.88, side: THREE.DoubleSide });
    const wave = new THREE.Mesh(waveGeo, waterMat);
    const foam = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: '#f4f8fa', roughness: 0.6 }));
    foam.scale.set(9, 1.6, W); foam.position.set(-4, 23.4, W / 2);
    wave.add(foam);
    const theta = Math.atan2(-d[1], d[0]);
    wave.rotation.y = theta;
    const flood = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: '#4c7c88', roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.8 }));
    flood.rotation.y = theta;
    root.add(wave, flood);
    const u0 = umin - 160, u1 = umax + 160;
    let front = u0, t = 0, level = 7, after = 0;
    const vc = (vmin + vmax) / 2;
    return {
      update(dt) {
        t += dt;
        if (front < u1) front += 26 * dt;
        else { after += dt; level = 7 * Math.max(0, 1 - after / 7); }
        wave.visible = front < u1;
        wave.position.set(d[0] * front + p[0] * (vmin - 150), 0, d[1] * front + p[1] * (vmin - 150));
        const back = u0, len = Math.max(0.1, front - 60 - back);
        flood.visible = level > 0.05 && len > 1;
        flood.scale.set(len, level, W);
        flood.position.set(d[0] * (back + len / 2) + p[0] * vc, level / 2, d[1] * (back + len / 2) + p[1] * vc);
        if (front < u1) {
          shake(0.6);
          for (let k = 0; k < 5; k++) {
            const v = lerp(vmin - 100, vmax + 100, rnd());
            puff('spray', d[0] * (front + 3) + p[0] * v, 18 + rnd() * 6, d[1] * (front + 3) + p[1] * v, d[0] * 8, 6 + rnd() * 6, d[1] * 8, { s0: 8, s1: 20, life: 2, a: 0.7 });
          }
          for (const st of victims) if (!st.destroyed && front > U(st) - st.R * 0.3) {
            collapse(st, { dir: d, tilt: 0.55 + rnd() * 0.3, dur: 1.6, push: [d[0] * 22, d[1] * 22] });
          }
        }
        if (level <= 0 && front >= u1) { disposeTree(wave); disposeTree(flood); return true; }
        return false;
      },
    };
  }

  const SCRIPTS = { meteor, kaiju, ufo, quake, tornado, tsunami };

  // ======================= public =======================
  let script = null, scriptId = null, rebuilt = 0, toRebuild = 0;
  const listeners = [];
  const notify = () => listeners.forEach((f) => f(api.status()));
  const api = {
    root,
    shakeOffset,
    // for debugging from the console
    makeKaiju,
    verify: () => { let bad = 0; for (const st of states.values()) for (const r of st.runs) { const a = r.attr.array; for (let i = 0; i < r.len; i++) if (a[r.off + i] !== r.orig[i]) { bad++; break; } } return { checked: states.size, bad }; },
    debug: () => ({ active: [...active].map((st) => ({ idx: st.idx, H: st.H, hc: st.hc, hidden: st.hidden, anim: st.anim && { kind: st.anim.kind, phase: st.anim.phase, t: st.anim.t, tb: st.anim.tb } })), crew: crew.map((w) => w.state) }),
    onChange(f) { listeners.push(f); f(api.status()); },
    destroyedCount: () => candidates.filter((i) => states.get(i)?.destroyed).length,
    rebuilding: () => [...active].some((st) => st.anim?.kind === 'rebuild'),
    status() {
      const busy = !!script, rec = api.rebuilding(), n = api.destroyedCount();
      let text = '';
      if (busy) text = DISASTERS.find((x) => x.id === scriptId)?.msg || '';
      else if (rec) text = `นักศึกษากำลังช่วยกันสร้าง… ${rebuilt}/${toRebuild} อาคาร`;
      else if (n) text = `อาคารเสียหาย ${n} หลัง`;
      else if (toRebuild) text = `ฟื้นฟูครบ ${toRebuild} อาคารแล้ว 🎉`;
      return { busy, rebuilding: rec, destroyed: n, text };
    },
    trigger(id, lead = -1) {
      if (script || api.rebuilding()) return false;
      ensureFx();
      if (id === 'random' || !SCRIPTS[id]) id = pick(DISASTERS).id;
      // a selected building that is too small for the random pool still counts, so recovery rebuilds it too
      if (lead >= 0 && runs.has(lead) && meta[lead].b.c && !candidates.includes(lead)) candidates.push(lead);
      focus = lead;
      const s = SCRIPTS[id]();
      focus = -1;
      if (!s) return false;
      script = s; scriptId = id; toRebuild = 0;
      notify();
      return true;
    },
    recover() {
      if (script || api.rebuilding()) return false;
      const list = candidates.map((i) => states.get(i)).filter((st) => st?.destroyed);
      if (!list.length) return false;
      const c = centroid(list);
      list.sort((a, b) => Math.hypot(a.cx - c[0], a.cz - c[1]) - Math.hypot(b.cx - c[0], b.cz - c[1]));
      list.forEach((st, k) => rebuild(st, k * 0.8));
      rebuilt = 0; toRebuild = list.length;
      // craters, scorch marks and cracks fade as the crews arrive
      decals.forEach((dc) => { dc.fade = 1 + rnd(); });
      flyTo(c[0], c[1], clamp(spread(list, c) * 2.2 + 200, 300, 1000), 60);
      notify();
      return true;
    },
    // camDist: camera to orbit target, so the shake reads the same zoomed in or out
    update(dt, camDist = 500) {
      dt = Math.min(dt, 0.1);
      if (!fxReady) return;
      const before = JSON.stringify(api.status());
      if (script && script.update(dt)) { script = null; scriptId = null; }
      updateBuildings(dt);
      updateCrew(dt);
      updateDebris(dt);
      updateEmitters(dt);
      updateSprites(dt);
      updateFx(dt);
      if (shakeHold > 0) shakeHold -= dt; else shakeAmp *= Math.exp(-dt * 3);
      if (shakeAmp < 0.01) shakeAmp = 0;
      const k = shakeAmp * 0.0025 * clamp(camDist, 100, 2000);
      shakeOffset.set((rnd() - 0.5) * k, (rnd() - 0.5) * k, (rnd() - 0.5) * k);
      if (JSON.stringify(api.status()) !== before) notify();
    },
  };
  return api;
}
