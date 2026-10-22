// The student on the programme page: the same low-poly box figure as the campus students (students.js figure()),
// built from separate meshes so its clothes can change (uniform -> gown -> a career outfit) and gear can hang on it.
// Gear: one piece per course kind (math, code, hw ...), shown from the first course of that kind and growing to
// level 3 as more are taken. x = the figure's left, y = up, +z = the way it faces (towards the camera).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const SKIN = '#e0b48f', HAIR = '#1d1612', BLACK = '#1b1c1f', SHOE = '#141416';
const GOWN = '#17171b', SASH = '#e8641e';   // as graduation.js (gown colour not confirmed by a source)

// clothes: shirt colour, long sleeves, lower half ('trousers' | 'skirt' | 'robe' | 'coat'), extra trims
const OUTFITS = {
  student: { shirt: '#f4f4f1', long: false },
  gown: { shirt: GOWN, long: true, lower: 'robe', robe: GOWN, sash: SASH },
  computer: { shirt: '#bcd6f2', long: true, lanyard: '#ff6b00' },
  software: { shirt: '#4a4f57', long: true, hood: '#4a4f57' },
  network: { shirt: '#1f2f52', long: false, collar: '#f4f4f1' },
  hardware: { shirt: '#f4f4f1', long: true, lower: 'coat', robe: '#eef3f6' },
  system: { shirt: '#2a2f38', long: true },
  cyber: { shirt: '#141418', long: true, hood: '#141418' },
  devops: { shirt: '#1d9e75', long: false },
  ai: { shirt: '#ffffff', long: true, collar: '#534ab7' },
};

const ARM = -0.75;   // the arms held forward so what is in the hands shows
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0, ...o });
function box(parent, w, h, d, c, x, y, z, o) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), c.isMaterial ? c : mat(c, o));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}

export function createStage(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(1.1, 1.5, 5.6);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.95, 0); controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 2.4; controls.maxDistance = 8; controls.maxPolarAngle = Math.PI * 0.55;
  controls.autoRotate = false;

  scene.add(new THREE.HemisphereLight('#fff6ee', '#8a8f99', 1.1));
  const sun = new THREE.DirectionalLight('#ffffff', 2.2);
  sun.position.set(2.5, 5, 3.5); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 });
  scene.add(sun);

  // podium: a round plinth with an orange rim and a ring that flashes when gear is gained
  const pod = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.18, 64), mat('#f4f1ec', { roughness: 0.9 }));
  pod.position.y = -0.09; pod.receiveShadow = true; scene.add(pod);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.025, 8, 96), mat('#ff6b00', { emissive: '#ff6b00', emissiveIntensity: 0.4 }));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.005; scene.add(rim);
  const flashRing = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.5, 64),
    new THREE.MeshBasicMaterial({ color: '#ffb066', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  flashRing.rotation.x = -Math.PI / 2; flashRing.position.y = 0.01; scene.add(flashRing);

  const root = new THREE.Group(); scene.add(root);
  let body = null, female = false, outfit = 'student';
  const arms = {}; // 1 = left, -1 = right: pivot groups at the shoulders
  let anchors = {};

  // ---------- the figure ----------
  function buildBody() {
    if (body) root.remove(body);
    body = new THREE.Group(); root.add(body);
    const o = OUTFITS[outfit] || OUTFITS.student;
    const k = female ? 0.94 : 1, hip = 0.86 * k, leg = 0.8 * k, sh = 1.38 * k;
    const lower = o.lower || (female ? 'skirt' : 'trousers');
    for (const s of [1, -1]) {
      const x = 0.1 * s * k;
      box(body, (female ? 0.12 : 0.15) * k, leg, (female ? 0.13 : 0.17) * k, female && lower === 'skirt' ? SKIN : BLACK, x, hip - leg / 2, 0);
      box(body, 0.12 * k, 0.07 * k, 0.26 * k, SHOE, x, hip - leg - 0.02 * k, 0.04 * k);
    }
    if (lower === 'robe') box(body, 0.4 * k, 0.9 * k, 0.28 * k, o.robe, 0, 0.49 * k, 0);
    else if (lower === 'coat') box(body, 0.4 * k, 0.5 * k, 0.26 * k, o.robe, 0, 0.66 * k, 0);
    else if (lower === 'skirt') box(body, 0.37 * k, 0.48 * k, 0.25 * k, BLACK, 0, 0.66 * k, 0);
    else box(body, 0.36 * k, 0.12 * k, 0.2 * k, BLACK, 0, 0.86 * k, 0);
    const torso = lower === 'coat' ? o.robe : o.shirt;
    box(body, (female ? 0.33 : 0.38) * k, 0.5 * k, (female ? 0.19 : 0.21) * k, torso, 0, 1.15 * k, 0);
    if (o.sash) box(body, 0.09 * k, 0.86 * k, 0.02 * k, o.sash, 0.07 * k, 1.0 * k, 0.15 * k);
    if (o.lanyard) { box(body, 0.02 * k, 0.26 * k, 0.01 * k, o.lanyard, 0, 1.25 * k, 0.11 * k); box(body, 0.08 * k, 0.1 * k, 0.012 * k, '#ffffff', 0, 1.08 * k, 0.115 * k); }
    if (o.collar) box(body, 0.2 * k, 0.04 * k, 0.2 * k, o.collar, 0, 1.39 * k, 0.02 * k);
    if (lower === 'coat') box(body, 0.03 * k, 0.5 * k, 0.01 * k, '#c8d2da', 0, 1.15 * k, 0.11 * k);
    if (o.hood) box(body, 0.26 * k, 0.12 * k, 0.12 * k, o.hood, 0, 1.4 * k, -0.12 * k);
    for (const s of [1, -1]) {
      const p = new THREE.Group(); p.position.set((female ? 0.205 : 0.235) * s * k, sh, 0); body.add(p); arms[s] = p;
      const sleeve = o.long ? 0.5 : 0.25;
      box(p, 0.11 * k, sleeve * k, 0.12 * k, lower === 'coat' ? o.robe : o.shirt, 0, -sleeve / 2 * k, 0);
      if (!o.long) box(p, 0.08 * k, 0.36 * k, 0.09 * k, SKIN, 0, -0.42 * k, 0);
      else box(p, 0.08 * k, 0.1 * k, 0.09 * k, SKIN, 0, -0.56 * k, 0);
    }
    box(body, 0.19 * k, 0.22 * k, 0.21 * k, SKIN, 0, 1.55 * k, 0);
    box(body, 0.21 * k, 0.07 * k, 0.23 * k, HAIR, 0, 1.665 * k, -0.01 * k);
    if (female) box(body, 0.21 * k, 0.32 * k, 0.06 * k, HAIR, 0, 1.43 * k, -0.1 * k);
    else box(body, 0.2 * k, 0.15 * k, 0.05 * k, HAIR, 0, 1.58 * k, -0.1 * k);
    for (const s of [1, -1]) box(body, 0.03 * k, 0.03 * k, 0.01 * k, '#141110', 0.045 * s * k, 1.57 * k, 0.106 * k);  // eyes
    anchors = { k, hand: (s) => [arms[s], new THREE.Vector3(0, -0.62 * k, 0.04 * k)], chest: new THREE.Vector3(-0.09 * k, 1.27 * k, 0.11 * k),
      back: new THREE.Vector3(0, 1.13 * k, -0.12 * k), head: 1.55 * k, waist: 0.92 * k };
    arms[1].rotation.x = ARM; arms[-1].rotation.x = ARM;
  }

  // ---------- gear (built per body, kept in `gear[kind]` with levels 1-3) ----------
  let gear = {}, levels = {};
  const glow = (c, i = 0.6) => mat(c, { emissive: c, emissiveIntensity: i, roughness: 0.4 });
  function buildGear() {
    for (const g of Object.values(gear)) g.obj.parent?.remove(g.obj);
    gear = {};
    const k = anchors.k;
    const add = (kind, parent, pos, make) => { const obj = new THREE.Group(); obj.position.copy(pos); if (parent === arms[1] || parent === arms[-1]) obj.rotation.x = -ARM; make(obj); obj.visible = false; parent.add(obj); gear[kind] = { obj, parts: obj.children.slice() }; };
    const [lh, lp] = anchors.hand(1), [rh, rp] = anchors.hand(-1);
    // math: a scientific calculator in the left hand; level 2 adds glasses; level 3 a floating π
    add('math', lh, lp, (g) => { box(g, 0.1, 0.02, 0.16, '#2d2f36', 0, 0, 0.05); box(g, 0.08, 0.022, 0.04, glow('#9fe1cb', 0.5), 0, 0.002, 0.1); });
    add('glasses', body, new THREE.Vector3(0, 1.575 * k, 0.11 * k), (g) => { for (const s of [1, -1]) box(g, 0.06, 0.04, 0.01, '#222', 0.045 * s, 0, 0); box(g, 0.2, 0.01, 0.01, '#222', 0, 0.01, 0); });
    // code: an open laptop in the right hand, the screen brighter with each level
    add('code', rh, rp, (g) => { box(g, 0.26, 0.015, 0.18, '#b9bdc4', 0, 0, 0.09); const sc = box(g, 0.26, 0.17, 0.012, '#b9bdc4', 0, 0.085, 0.0); box(sc, 0.23, 0.14, 0.004, glow('#5dcaa5', 0.5), 0, 0, 0.008); g.userData.screen = sc.children[0]; });
    // hw: a backpack with a green circuit board on it
    add('hw', body, anchors.back, (g) => { box(g, 0.3, 0.38, 0.12, '#1f2a44', 0, 0, -0.04); box(g, 0.22, 0.2, 0.012, '#2f7a3a', 0, 0.02, -0.105); for (let i = 0; i < 3; i++) box(g, 0.05, 0.04, 0.012, '#141416', -0.06 + i * 0.06, 0.04, -0.115); box(g, 0.16, 0.01, 0.012, glow('#f0c050', 0.4), 0, -0.04, -0.115); });
    // net: a coil of blue network cable over the right shoulder
    add('net', body, new THREE.Vector3(-0.2 * k, 1.36 * k, 0), (g) => { const t = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 8, 32), glow('#378add', 0.3)); t.rotation.y = Math.PI / 2; t.rotation.z = 0.5; t.castShadow = true; g.add(t); });
    // sec: a hexagonal shield on the left forearm
    add('sec', arms[1], new THREE.Vector3(0.07 * k, -0.42 * k, 0), (g) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 6), glow('#534ab7', 0.35)); s.rotation.z = Math.PI / 2; s.castShadow = true; g.add(s); box(g, 0.03, 0.12, 0.05, '#e6e4f6', 0.015, 0, 0); });
    // ai: small glowing icosahedra circling the head, one per level
    add('ai', body, new THREE.Vector3(0, anchors.head + 0.12, 0), (g) => { for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), glow('#d4537e', 0.8)); m.userData.i = i; g.add(m); } g.userData.orbit = true; });
    // soc: a green leaf pin on the chest
    add('soc', body, anchors.chest, (g) => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.04, 0), glow('#639922', 0.4)); m.scale.set(1, 1.4, 0.4); g.add(m); });
    // lang: a headset with a microphone
    add('lang', body, new THREE.Vector3(0, 1.6 * k, 0), (g) => { box(g, 0.24, 0.03, 0.04, '#2d2d2f', 0, 0.09, 0); for (const s of [1, -1]) box(g, 0.03, 0.08, 0.07, '#2d2d2f', 0.11 * s, 0, 0); box(g, 0.012, 0.012, 0.11, '#2d2d2f', 0.11, -0.04, 0.06); box(g, 0.025, 0.025, 0.025, glow('#ef9f27', 0.5), 0.1, -0.04, 0.12); });
    // team: an orange armband on the right arm
    add('team', arms[-1], new THREE.Vector3(0, -0.17 * k, 0), (g) => { box(g, 0.125, 0.05, 0.135, glow('#ff6b00', 0.3), 0, 0, 0); });
    // proj: a tool belt; level 3 adds a toolbox by the feet
    add('proj', body, new THREE.Vector3(0, anchors.waist, 0), (g) => { box(g, 0.4, 0.05, 0.24, '#6b4a2b', 0, 0, 0); for (const s of [1, -1]) box(g, 0.07, 0.09, 0.05, '#7a5634', 0.15 * s, -0.05, 0.1); });
    add('toolbox', root, new THREE.Vector3(0.42, 0.08, 0.15), (g) => { box(g, 0.3, 0.16, 0.16, '#c0392b', 0, 0, 0); box(g, 0.14, 0.03, 0.03, '#2d2d2f', 0, 0.1, 0); });
    // ge: a gold star badge
    add('ge', body, new THREE.Vector3(0.09 * k, 1.27 * k, 0.11 * k), (g) => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.035, 0), glow('#efb027', 0.6)); m.scale.set(1, 1, 0.4); g.add(m); });
    applyLevels(levels, null, true);
  }

  // ---------- career props (shown with the career outfits) ----------
  let props = null;
  function buildProps(id) {
    if (props) root.remove(props);
    props = new THREE.Group(); root.add(props);
    const k = anchors.k, [rh, rp] = anchors.hand(-1), [lh, lp] = anchors.hand(1);
    const inHand = (s) => { const g = new THREE.Group(); g.position.copy(s === 1 ? lp : rp); g.rotation.x = -ARM; (s === 1 ? lh : rh).add(g); return g; };
    const laptop = (g) => { box(g, 0.28, 0.015, 0.19, '#b9bdc4', 0, 0, 0.09); const sc = box(g, 0.28, 0.18, 0.012, '#b9bdc4', 0, 0.09, 0); box(sc, 0.25, 0.15, 0.004, glow('#5dcaa5', 0.7), 0, 0, 0.008); };
    if (id === 'computer') laptop(inHand(-1));
    if (id === 'software') { laptop(inHand(-1)); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 16), mat('#ffffff')); m.castShadow = true; inHand(1).add(m); }
    if (id === 'network') { const g = inHand(-1); box(g, 0.3, 0.05, 0.16, '#2d2f36', 0, 0, 0.06); for (let i = 0; i < 6; i++) box(g, 0.03, 0.02, 0.01, glow('#5dcaa5', 0.8), -0.11 + i * 0.044, 0.005, 0.145); const t = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.016, 8, 32), glow('#378add', 0.3)); t.position.set(-0.2 * k, 1.36 * k, 0); t.rotation.y = Math.PI / 2; props.add(t); }
    if (id === 'hardware') { const g = inHand(-1); box(g, 0.2, 0.012, 0.15, '#2f7a3a', 0, 0, 0.07); box(g, 0.05, 0.03, 0.05, '#141416', 0.03, 0.02, 0.07); box(inHand(1), 0.02, 0.02, 0.2, '#e8641e', 0, 0, 0.1); }
    if (id === 'system') { for (let i = 0; i < 4; i++) { box(props, 0.42, 0.26, 0.5, '#2a2f38', -0.6, 0.15 + i * 0.28, -0.1); box(props, 0.3, 0.03, 0.01, glow('#5dcaa5', 0.9), -0.6, 0.18 + i * 0.28, 0.155); } }
    if (id === 'cyber') { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 6), glow('#534ab7', 0.5)); s.rotation.z = Math.PI / 2; const g = new THREE.Group(); g.position.set(0.08 * k, -0.42 * k, 0); arms[1].add(g); g.add(s); props.userData.extra = g; }
    if (id === 'devops') { const c = new THREE.Group(); c.position.set(0, 2.05, 0); for (const [x, y, r] of [[0, 0, 0.16], [-0.17, -0.04, 0.12], [0.17, -0.04, 0.12], [0.08, 0.08, 0.11]]) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat('#e6f1fb', { emissive: '#85b7eb', emissiveIntensity: 0.25 })); m.position.set(x, y, 0); c.add(m); } props.add(c); props.userData.float = c; const t = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 6, 8), mat('#888780', { metalness: 0.6 })); inHand(-1).add(t); }
    if (id === 'ai') { const g = new THREE.Group(); g.position.set(0, 1.95, 0); const pts = []; for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2, p = new THREE.Vector3(Math.cos(a) * 0.32, Math.sin(i * 2.1) * 0.08, Math.sin(a) * 0.32); pts.push(p); const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), glow('#d4537e', 0.9)); m.position.copy(p); g.add(m); } const lg = new THREE.BufferGeometry().setFromPoints(pts.flatMap((p, i) => [p, pts[(i + 2) % 7]])); g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#ed93b1' }))); props.add(g); props.userData.spin = g; box(inHand(-1), 0.16, 0.012, 0.22, '#2d2f36', 0, 0, 0.09); }
  }

  // ---------- state ----------
  const anim = []; // {obj, t, kind:'pop'|'pulse'}
  function applyLevels(lv, fresh, silent) {
    levels = { ...lv };
    const vis = (key, on) => { if (gear[key]) gear[key].obj.visible = on; };
    const L = (kind) => (outfit === 'student' ? levels[kind] || 0 : 0);
    for (const kind of ['math', 'code', 'hw', 'net', 'sec', 'ai', 'soc', 'lang', 'team', 'proj', 'ge']) {
      const n = L(kind); vis(kind, n > 0);
      const g = gear[kind]; if (!g) continue;
      const s = 1 + (n - 1) * 0.15; g.obj.scale.setScalar(n > 0 ? s : 1);
      if (kind === 'ai') g.obj.children.forEach((m, i) => (m.visible = i < n));
      if (kind === 'code' && g.obj.userData.screen) g.obj.userData.screen.material.emissiveIntensity = 0.3 + n * 0.3;
    }
    vis('glasses', L('math') >= 2); vis('toolbox', L('proj') >= 3);
    if (!silent && fresh) for (const kind of fresh) if (gear[kind] && gear[kind].obj.visible) { anim.push({ obj: gear[kind].obj, t: 0, kind: 'pop', s: gear[kind].obj.scale.x }); }
    if (!silent && fresh && fresh.length) flash();
  }
  function flash() { flashRing.userData.t = 0; }

  function setOutfit(id, { spin = true } = {}) {
    outfit = id; buildBody(); buildGear();
    if (props) { root.remove(props); props = null; }
    if (id !== 'student' && id !== 'gown') buildProps(id);
    if (spin) { root.userData.spin = 0; flash(); }
    if (id === 'gown') confetti();
  }
  function setFemale(f) { female = f; setOutfit(outfit, { spin: false }); }

  // confetti for graduation
  let conf = null;
  function confetti() {
    if (conf) scene.remove(conf);
    const n = 260, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), v = [];
    const C = ['#ff6b00', '#ffd166', '#ffffff', '#ef476f', '#118ab2'].map((c) => new THREE.Color(c));
    for (let i = 0; i < n; i++) { pos.set([(Math.random() - 0.5) * 2.6, 2.6 + Math.random() * 1.6, (Math.random() - 0.5) * 2.6], i * 3); const c = C[i % C.length]; col.set([c.r, c.g, c.b], i * 3); v.push(0.4 + Math.random() * 0.6); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    conf = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.05, vertexColors: true })); conf.userData = { v, t: 0 }; scene.add(conf);
  }

  // ---------- loop ----------
  const clock = new THREE.Clock();
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    controls.update();
    if (body) { body.position.y = Math.sin(t * 1.6) * 0.008; arms[1].rotation.z = 0.05 + Math.sin(t * 1.2) * 0.02; arms[-1].rotation.z = -0.05 - Math.sin(t * 1.2) * 0.02; }
    if (root.userData.spin != null) { root.userData.spin += dt; const p = Math.min(1, root.userData.spin / 0.9); root.rotation.y = (1 - Math.pow(1 - p, 3)) * Math.PI * 2; if (p >= 1) { root.rotation.y = 0; root.userData.spin = null; } }
    const ai = gear.ai?.obj; if (ai?.visible) ai.children.forEach((m) => { const a = t * 1.4 + (m.userData.i * Math.PI * 2) / 3; m.position.set(Math.cos(a) * 0.24, Math.sin(t * 2 + m.userData.i) * 0.03, Math.sin(a) * 0.24); m.rotation.y = t * 2; });
    if (props?.userData.spin) props.userData.spin.rotation.y = t * 0.6;
    if (props?.userData.float) props.userData.float.position.y = 2.05 + Math.sin(t * 1.3) * 0.04;
    for (let i = anim.length - 1; i >= 0; i--) {
      const a = anim[i]; a.t += dt; const p = Math.min(1, a.t / 0.7);
      const e = p < 1 ? 1 + Math.sin(p * Math.PI) * 0.6 * (1 - p) : 1;   // pop up past full size and settle
      a.obj.scale.setScalar(a.s * (p < 0.25 ? p / 0.25 : e));
      if (p >= 1) { a.obj.scale.setScalar(a.s); anim.splice(i, 1); }
    }
    if (flashRing.userData.t != null) { flashRing.userData.t += dt; const p = flashRing.userData.t / 0.9; flashRing.scale.setScalar(1 + p * 2.2); flashRing.material.opacity = Math.max(0, 0.8 * (1 - p)); if (p >= 1) flashRing.userData.t = null; }
    if (conf) { const P = conf.geometry.attributes.position; conf.userData.t += dt; for (let i = 0; i < P.count; i++) { let y = P.getY(i) - conf.userData.v[i] * dt; if (y < 0) y = 0.01; P.setY(i, y); P.setX(i, P.getX(i) + Math.sin(t * 3 + i) * 0.002); } P.needsUpdate = true; if (conf.userData.t > 9) { scene.remove(conf); conf = null; } }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function resize() {
    const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    // portrait stages (phones) have the header over the top third: step back and look a little higher
    const tall = camera.aspect < 1;
    controls.target.set(0, tall ? 1.25 : 0.95, 0);
    camera.position.sub(controls.target).setLength(tall ? 7.4 : 5.8).add(controls.target);
  }
  new ResizeObserver(resize).observe(el);
  setOutfit('student', { spin: false }); resize(); frame();

  return { setLevels: applyLevels, setOutfit, setFemale, flash };
}
