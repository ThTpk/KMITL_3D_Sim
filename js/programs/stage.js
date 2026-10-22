// The 3D stage of the programme page.
//  study:   the student on a podium, ringed by course-group icons that grow with the required courses taken
//  grad:    the same student in the red KMITL gown, confetti
//  careers: the student, small, at the foot of a fan of paths, one to each career (and one to further study);
//           pick one and the student walks down it and changes into that job's clothes
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildHuman, mat } from './human.js';
import { GROUP_ICONS, CAREER_ICONS, iconTexture, labelTexture } from './icons.js';

// KMITL gown, from a photo the user supplied: red-orange robe, gold สำรด edged with black
const GOWN = { color: '#e4402a', trim: '#e2b23a', stripe: '#141414' };
const OUTFITS = {
  student: {},
  gown: { gown: GOWN, long: true },
  computer: { shirt: '#bcd6f2', long: true, lanyard: '#ff6b00' },
  software: { shirt: '#4a4f57', long: true, hood: '#4a4f57' },
  network: { shirt: '#1f2f52', collar: '#f6f6f3' },
  hardware: { shirt: '#f6f6f3', long: true, coat: '#eef3f6' },
  system: { shirt: '#2a2f38', long: true, lanyard: '#378add' },
  cyber: { shirt: '#1d1d22', long: true, hood: '#1d1d22' },
  devops: { shirt: '#1d9e75' },
  ai: { shirt: '#ffffff', long: true, collar: '#534ab7' },
  study: {},
};
const KIND_ORDER = ['math', 'code', 'hw', 'net', 'sec', 'ai', 'soc', 'lang', 'team', 'proj', 'ge'];

export function createStage(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 2.4; controls.maxDistance = 14; controls.maxPolarAngle = Math.PI * 0.49;

  scene.add(new THREE.HemisphereLight('#fff6ee', '#7d828c', 1.3));
  const sun = new THREE.DirectionalLight('#ffffff', 2.4);
  sun.position.set(3, 6, 4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); scene.add(sun);
  const fill = new THREE.DirectionalLight('#cfe0ff', 0.6); fill.position.set(-4, 3, -2); scene.add(fill);

  // ---------- podium (study / grad) ----------
  const podium = new THREE.Group(); scene.add(podium);
  const pod = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.45, 0.16, 72), mat('#f4f1ec', { roughness: 0.9 })); pod.position.y = -0.08; pod.receiveShadow = true; podium.add(pod);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.025, 8, 120), mat('#ff6b00', { emissive: '#ff6b00', emissiveIntensity: 0.4 })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.002; podium.add(rim);
  const flashRing = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.5, 64), new THREE.MeshBasicMaterial({ color: '#ffb066', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  flashRing.rotation.x = -Math.PI / 2; flashRing.position.y = 0.01; podium.add(flashRing);

  // ---------- the student ----------
  let female = false, outfit = 'student', student = null;
  const studentHolder = new THREE.Group(); scene.add(studentHolder);
  function dress(id) {
    outfit = id;
    if (student) studentHolder.remove(student.root);
    // under the gown men wear white from collar to trousers, women a white blouse and black skirt (as in the photo)
    const of = id === 'gown' && !female ? { ...OUTFITS.gown, pants: '#f2f2ee' } : OUTFITS[id] || {};
    student = buildHuman({ female, outfit: of });
    studentHolder.add(student.root);
    if (id === 'study') addBook(student);
  }
  function addBook(h) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.04), mat('#a3171f')); b.position.set(0, -0.1, 0.05); b.rotation.x = -0.2; b.castShadow = true; h.J['wr-1'].add(b); h.J['el-1'].rotation.x = -1.1; }

  // ---------- course-group icons (study / grad) ----------
  const ring = new THREE.Group(); scene.add(ring);
  const icons = {};
  KIND_ORDER.forEach((k, i) => {
    const [color, glyph] = GROUP_ICONS[k];
    // spread round the student, leaving the front clear; alternate heights so neighbours do not overlap
    const a = THREE.MathUtils.degToRad(48 + (i * 264) / (KIND_ORDER.length - 1));
    const R = 1.25 + (i % 2) * 0.2, y = 0.75 + (i % 3) * 0.5;
    const g = new THREE.Group(); g.position.set(Math.sin(a) * R, y, Math.cos(a) * R); ring.add(g);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTexture(color, glyph), transparent: true })); g.add(sp);
    const lab = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true })); g.add(lab);
    icons[k] = { g, sp, lab, size: 0, target: 0, pop: 0, y, text: '' };
    g.visible = false;
  });
  const iconSize = (n) => (n ? 0.2 + Math.min(n, 9) * 0.055 : 0);
  function setGroups(stats, fresh = [], names = {}) {
    for (const k of KIND_ORDER) {
      const s = stats[k] || { req: 0, el: 0 }, ic = icons[k], n = s.req + s.el;
      ic.target = iconSize(s.req || (s.el ? 1 : 0)) + Math.min(s.el, 4) * 0.02;
      ic.g.visible = n > 0;
      const text = `${names[k] || k}|บังคับ ${s.req}${s.el ? ` · เลือก ${s.el}` : ''}`;
      if (text !== ic.text && n > 0) {
        ic.text = text; const { texture, aspect } = labelTexture([names[k] || k, `บังคับ ${s.req} วิชา${s.el ? ` · เลือก ${s.el}` : ''}`], { size: 40 });
        ic.lab.material.map?.dispose(); ic.lab.material.map = texture; ic.lab.material.needsUpdate = true; ic.lab.userData.aspect = aspect;
      }
      if (fresh.includes(k)) ic.pop = 1;
    }
    if (fresh.length) flash();
  }
  function flash() { flashRing.userData.t = 0; }

  // ---------- career map ----------
  const map = new THREE.Group(); map.visible = false; scene.add(map);
  const START = new THREE.Vector3(0, 0, 2.6);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(6.2, 96), mat('#f4f1ec', { roughness: 0.95 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.005; ground.receiveShadow = true; map.add(ground);
  const startPad = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.06, 48), mat('#ff6b00', { emissive: '#ff6b00', emissiveIntensity: 0.25 })); startPad.position.copy(START).setY(0.03); startPad.receiveShadow = true; map.add(startPad);
  const nodes = [];
  function setCareers(list) {
    for (const n of nodes) map.remove(n.group, n.path, ...n.dots);
    nodes.length = 0;
    list.forEach((c, i) => {
      const a = THREE.MathUtils.degToRad(-64 + (i * 128) / (list.length - 1)), R = 4.1;
      const P = new THREE.Vector3(START.x + Math.sin(a) * R * 0.82, 0, START.z - Math.cos(a) * R);
      const [color, glyph] = CAREER_ICONS[c.id] || ['#5f5e5a', 'star'];
      const group = new THREE.Group(); group.position.copy(P); map.add(group);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.08, 48), mat(color, { roughness: 0.6 })); pad.position.y = 0.04; pad.receiveShadow = true; pad.castShadow = true; group.add(pad);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.01, 48), mat('#ffffff', { roughness: 0.8 })); top.position.y = 0.085; group.add(top);
      const fig = buildHuman({ female: i % 2 === 1, outfit: OUTFITS[c.id] || {} });
      if (c.id === 'study') addBook(fig);
      fig.root.scale.multiplyScalar(0.5); fig.root.position.y = 0.09; fig.root.rotation.y = Math.atan2(START.x - P.x, START.z - P.z); group.add(fig.root);
      const ic = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTexture(color, glyph), transparent: true })); ic.scale.setScalar(0.42); ic.position.y = 1.3; group.add(ic);
      const short = c.name.split('/')[0];
      const { texture, aspect } = labelTexture([short], { size: 46, color });
      const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })); lab.renderOrder = 3;
      lab.scale.set(0.2 * aspect, 0.2, 1); lab.position.y = 1.62 + (i % 2) * 0.24; group.add(lab);
      // the path: a gentle curve along the ground from the start pad to this career
      const mid = START.clone().lerp(P, 0.5); mid.x += Math.sin(a) * 0.5; mid.z += 0.4;
      const curve = new THREE.QuadraticBezierCurve3(START.clone().setY(0.02), mid.setY(0.02), P.clone().setY(0.02));
      const path = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.03, 6), mat(color, { emissive: color, emissiveIntensity: 0.25, transparent: true, opacity: 0.75 }));
      path.scale.y = 0.3; map.add(path);
      const dots = [0, 1, 2].map(() => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mat('#ffffff', { emissive: color, emissiveIntensity: 1 })); map.add(d); return d; });
      for (const o of [pad, top, ...fig.root.children]) o.userData.career = c.id;
      fig.root.traverse((o) => (o.userData.career = c.id));
      nodes.push({ id: c.id, group, pad, path, dots, curve, color, fig, ic });
    });
  }
  let picked = null, walk = null, onPick = null;
  function selectCareer(id) {
    picked = id;
    for (const n of nodes) {
      const on = !id || n.id === id;
      n.path.material.opacity = on ? 0.85 : 0.25; n.path.material.emissiveIntensity = n.id === id ? 0.9 : 0.25;
      n.group.scale.setScalar(n.id === id ? 1.12 : 1);
    }
    const n = nodes.find((x) => x.id === id);
    if (!n) { dress('gown'); placeStudent(START, 0); walk = null; return; }
    dress('gown');
    walk = { n, t: 0 };
  }
  function placeStudent(p, yaw) { studentHolder.position.copy(p); studentHolder.rotation.y = yaw; }

  // ---------- modes ----------
  let mode = 'study';
  const cam = { from: null, to: null, t: 1 };
  function aim(pos, target) { cam.from = { p: camera.position.clone(), t: controls.target.clone() }; cam.to = { p: pos, t: target }; cam.t = 0; }
  function camFor(m) {
    const tall = camera.aspect < 1;
    if (m === 'careers') return tall ? [new THREE.Vector3(0, 10.5, 13.5), new THREE.Vector3(0, 0.4, 0.4)] : [new THREE.Vector3(0, 6.2, 10.4), new THREE.Vector3(0, 0.6, 0.2)];
    return tall ? [new THREE.Vector3(1.3, 1.9, 7.6), new THREE.Vector3(0, 1.2, 0)] : [new THREE.Vector3(1.4, 1.6, 6.2), new THREE.Vector3(0, 1.0, 0)];
  }
  function setMode(m, opts = {}) {
    const was = mode; mode = m;
    podium.visible = ring.visible = m !== 'careers';
    map.visible = m === 'careers';
    if (m === 'study') { if (outfit !== 'student') dress('student'); placeStudent(new THREE.Vector3(), 0); studentHolder.scale.setScalar(1); }
    if (m === 'grad') { dress('gown'); placeStudent(new THREE.Vector3(), 0); studentHolder.scale.setScalar(1); if (was !== 'grad') { spin(); confetti(); } }
    if (m === 'careers') { studentHolder.scale.setScalar(0.5); selectCareer(opts.career || null); }
    if (was !== m || opts.reaim) aim(...camFor(m));
  }
  function setFemale(f) { female = f; dress(outfit); }
  let spinT = null; function spin() { spinT = 0; flash(); }

  // ---------- confetti ----------
  let conf = null;
  function confetti() {
    if (conf) scene.remove(conf);
    const n = 320, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), v = [];
    const C = ['#e4402a', '#ff6b00', '#ffd166', '#ffffff', '#e2b23a'].map((c) => new THREE.Color(c));
    for (let i = 0; i < n; i++) { pos.set([(Math.random() - 0.5) * 3, 2.6 + Math.random() * 1.8, (Math.random() - 0.5) * 3], i * 3); const c = C[i % C.length]; col.set([c.r, c.g, c.b], i * 3); v.push(0.4 + Math.random() * 0.6); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    conf = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.05, vertexColors: true })); conf.userData = { v, t: 0 }; scene.add(conf);
  }

  // ---------- picking on the career map ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hit = (e) => {
    if (mode !== 'careers') return null;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(nodes.map((n) => n.group), true).find((x) => x.object.userData.career);
    return h ? h.object.userData.career : null;
  };
  let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => (down = [e.clientX, e.clientY]));
  renderer.domElement.addEventListener('pointerup', (e) => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 5) { const id = hit(e); if (id) onPick?.(id); } down = null; });
  renderer.domElement.addEventListener('pointermove', (e) => { renderer.domElement.style.cursor = hit(e) ? 'pointer' : ''; });

  // ---------- loop ----------
  const clock = new THREE.Clock();
  const ease = (p) => 1 - Math.pow(1 - p, 3);
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    if (cam.t < 1) { cam.t = Math.min(1, cam.t + dt / 1.2); const e = ease(cam.t); camera.position.lerpVectors(cam.from.p, cam.to.p, e); controls.target.lerpVectors(cam.from.t, cam.to.t, e); }
    controls.update();
    // the student: breathing, a slow glance about, walking on the career map
    if (student) {
      const J = student.J;
      student.body.position.y = Math.sin(t * 1.6) * 0.004;
      J.head.rotation.y = Math.sin(t * 0.45) * 0.18; J.head.rotation.x = Math.sin(t * 0.3) * 0.04;
      let swing = 0;
      if (walk) {
        walk.t += dt / 2.4; const p = Math.min(1, walk.t), c = walk.n.curve;
        const pt = c.getPoint(p * 0.9), tg = c.getTangent(p * 0.9);
        placeStudent(pt, Math.atan2(tg.x, tg.z));
        swing = Math.sin(t * 9) * (p < 1 ? 1 : 0);
        if (p >= 1) { const id = walk.n.id; walk = null; dress(id); studentHolder.rotation.y = Math.atan2(START.x - studentHolder.position.x, START.z - studentHolder.position.z); spin(); }
      }
      for (const s of [1, -1]) { J['hip' + s].rotation.x = swing * 0.45 * s; J['knee' + s].rotation.x = Math.max(0, -swing * s) * 0.6; J['sh' + s].rotation.x = -swing * 0.4 * s; }
    }
    if (spinT != null) { spinT += dt; const p = Math.min(1, spinT / 0.9); student.root.rotation.y = ease(p) * Math.PI * 2; if (p >= 1) { student.root.rotation.y = 0; spinT = null; } }
    // icons: grow towards their target size, pop when a level is gained, bob gently
    for (const k of KIND_ORDER) {
      const ic = icons[k]; if (!ic.g.visible) { ic.size = 0; continue; }
      ic.size += (ic.target - ic.size) * Math.min(1, dt * 4);
      if (ic.pop > 0) ic.pop = Math.max(0, ic.pop - dt * 1.6);
      const s = ic.size * (1 + Math.sin((1 - ic.pop) * Math.PI) * 0.45 * ic.pop);
      ic.sp.scale.setScalar(s); ic.g.position.y = ic.y + Math.sin(t * 1.2 + ic.y * 3) * 0.03;
      const a = ic.lab.userData.aspect || 3; ic.lab.scale.set(0.11 * a, 0.11, 1); ic.lab.position.y = -s / 2 - 0.08;
    }
    // career map: dots run along each path; the picked one faster
    if (map.visible) for (const n of nodes) n.dots.forEach((d, i) => { const sp = n.id === picked ? 0.45 : 0.18; d.position.copy(n.curve.getPoint(((t * sp + i / 3) % 1))).setY(0.05); d.visible = !picked || n.id === picked; });
    if (map.visible) for (const n of nodes) n.ic.position.y = 1.3 + Math.sin(t * 1.5 + n.group.position.x) * 0.04;
    if (flashRing.userData.t != null) { flashRing.userData.t += dt; const p = flashRing.userData.t / 0.9; flashRing.scale.setScalar(1 + p * 2.4); flashRing.material.opacity = Math.max(0, 0.8 * (1 - p)); if (p >= 1) flashRing.userData.t = null; }
    if (conf) { const P = conf.geometry.attributes.position; conf.userData.t += dt; for (let i = 0; i < P.count; i++) { let y = P.getY(i) - conf.userData.v[i] * dt; if (y < 0) y = 0.01; P.setY(i, y); P.setX(i, P.getX(i) + Math.sin(t * 3 + i) * 0.002); } P.needsUpdate = true; if (conf.userData.t > 9) { scene.remove(conf); conf = null; } }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function resize() {
    const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    const [p, tg] = camFor(mode); camera.position.copy(p); controls.target.copy(tg); cam.t = 1;
  }
  new ResizeObserver(resize).observe(el);
  dress('student'); resize(); frame();

  return { setGroups, setMode, setFemale, setCareers, selectCareer: (id) => setMode('careers', { career: id }), onPick: (f) => (onPick = f), flash };
}
