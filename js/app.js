import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  buildBuildings, buildAreas, buildWater, buildRoads, buildRails, buildCampusOutline,
  highlightGeometry, pointInRing,
} from './builders.js';
import { buildTraffic } from './traffic.js';
import { buildPlanes } from './planes.js';
import { buildStudents } from './students.js';
import { buildDisasters, DISASTERS } from './disaster.js';
import { buildEvents, EVENTS } from './events.js';
import { loadCurricula } from './curricula.js';
import { slim } from './memory.js';

const DATA = window.KMITL_DATA;
const [LAT0, LON0] = DATA.origin;
const R_EARTH = 6378137;
const COS0 = Math.cos((LAT0 * Math.PI) / 180);
const toLatLon = (x, z) => [LAT0 - (z / R_EARTH) * (180 / Math.PI), LON0 + (x / (R_EARTH * COS0)) * (180 / Math.PI)];
const toXZ = (lat, lon) => [((lon - LON0) * Math.PI / 180) * R_EARTH * COS0, -((lat - LAT0) * Math.PI / 180) * R_EARTH];

// ---------- renderer / scene ----------
const container = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.55;
container.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
Object.assign(labelRenderer.domElement.style, { position: 'absolute', top: '0', left: '0', pointerEvents: 'none' });
container.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#cfd9e3', 1400, 4200);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 15000);
camera.position.set(-520, 520, 760);

const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = false;
controls.maxPolarAngle = THREE.MathUtils.degToRad(86);
controls.minDistance = 12;
controls.maxDistance = 4000;
controls.target.set(0, 0, 0);
controls.zoomToCursor = true;

// ---------- sky + lights ----------
const sky = new Sky();
sky.scale.setScalar(40000);
Object.assign(sky.material.uniforms, {});
sky.material.uniforms.turbidity.value = 6;
sky.material.uniforms.rayleigh.value = 1.6;
sky.material.uniforms.mieCoefficient.value = 0.004;
sky.material.uniforms.mieDirectionalG.value = 0.8;
scene.add(sky);

const hemi = new THREE.HemisphereLight('#dfeaff', '#7d7462', 1.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e0', 3.2);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);   // 4096² used ~65 MB of video memory for a barely sharper shadow
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.6;
const SH = 520;
Object.assign(sun.shadow.camera, { left: -SH, right: SH, top: SH, bottom: -SH, near: 10, far: 4000 });
scene.add(sun, sun.target);

// ---------- ground ----------
const ground = new THREE.Mesh(new THREE.PlaneGeometry(30000, 30000), new THREE.MeshStandardMaterial({ color: '#bcc6a5', roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ---------- build the world ----------
const layers = {};
const t0 = performance.now();
// only KMITL's own buildings are drawn in 3D (inside the campus outlines, or hand-built); buildings outside the
// campus are left out, while roads, rails and the elevated highway are still drawn everywhere
const campusRings = DATA.campus.map((c) => c.o);
const inCampus = (x, z) => campusRings.some((o) => pointInRing(x, z, o));
DATA.buildings = DATA.buildings.filter((b) => b.model || inCampus(b.c[0], b.c[1]));
const { meshes: buildingMeshes, meta: buildingMeta } = buildBuildings(DATA.buildings);
layers.buildings = new THREE.Group();
buildingMeshes.forEach((m) => layers.buildings.add(m));
const areas = buildAreas(DATA);
layers.areas = new THREE.Group(); areas.forEach((a) => layers.areas.add(a));
layers.water = buildWater(DATA);
layers.roads = buildRoads(DATA);
layers.rails = buildRails(DATA);
layers.campus = buildCampusOutline(DATA);
const traffic = buildTraffic(DATA);
layers.traffic = traffic.group;
// airliners over the stadium and the 12-storey building share the trains/cars toggle
const planes = buildPlanes();
layers.traffic.add(planes.group);
// students on the footways and under the open ground floors (inside the campus fence only)
const students = buildStudents(DATA);
layers.students = students.group;
for (const k of ['areas', 'water', 'roads', 'rails', 'campus', 'buildings', 'traffic', 'students']) scene.add(layers[k]);
// drop the JS copies of vertex data that is never read again once it is on the graphics card; buildings keep
// their positions (picking, disasters) and vertex colours (rubble)
const freed = slim(layers.buildings, ['position', 'color']) + ['areas', 'water', 'roads', 'rails', 'campus'].reduce((s, k) => s + slim(layers[k]), 0);
console.log(`world built in ${(performance.now() - t0).toFixed(0)} ms – ${buildingMeta.length} buildings, ~${(freed / 1e6).toFixed(0)} MB of vertex copies to free`);

// ---------- labels ----------
const TYPE_TH = {
  university: 'อาคารมหาวิทยาลัย', school: 'อาคารเรียน', office: 'สำนักงาน', dormitory: 'หอพัก', apartments: 'อพาร์ตเมนต์/หอพัก',
  residential: 'ที่พักอาศัย', house: 'บ้าน', terrace: 'ทาวน์เฮาส์', retail: 'ร้านค้า', commercial: 'อาคารพาณิชย์', temple: 'วัด/ศาสนสถาน',
  roof: 'หลังคา/โรงจอดรถ', garage: 'โรงรถ', carport: 'ที่จอดรถมีหลังคา', shed: 'โรงเก็บของ', industrial: 'อาคารอุตสาหกรรม', service: 'อาคารบริการ',
  sports_centre: 'ศูนย์กีฬา', stadium: 'สนามกีฬา', train_station: 'สถานีรถไฟ', construction: 'กำลังก่อสร้าง', bridge: 'สะพาน', yes: 'อาคาร',
};
const labels = [];
layers.labels = new THREE.Group();
buildingMeta.forEach((m, idx) => {
  const b = m.b;
  const name = b.n || b.th || b.en;
  if (!name) return;
  const div = document.createElement('div');
  const campusB = inCampus(b.c[0], b.c[1]);
  div.className = 'lbl' + (campusB && (b.a > 1200 || m.H.h > 20) ? ' major' : '');
  div.textContent = name.length > 38 ? name.slice(0, 36) + '…' : name;
  div.title = b.en && b.en !== name ? b.en : '';
  div.addEventListener('click', (e) => { e.stopPropagation(); select(idx, true); });
  const obj = new CSS2DObject(div);
  obj.position.set(b.c[0], m.top + 4, b.c[1]);
  obj.center.set(0.5, 1);
  layers.labels.add(obj);
  // priority: campus buildings, big, tall
  const pr = (campusB ? 2 : 1) * (Math.sqrt(b.a) + m.H.h * 2);
  labels.push({ obj, div, pr, range: 180 + pr * 6 });
});
scene.add(layers.labels);

// road names: one label per (name, ~400 m cell) on the longest piece
layers.roadLabels = new THREE.Group();
const roadLabelSeen = new Map();
for (const r of DATA.roads) {
  if (!r.n || ['footway', 'path', 'steps', 'service', 'cycleway'].includes(r.k)) continue;
  let L = 0;
  for (let i = 1; i < r.p.length; i++) L += Math.hypot(r.p[i][0] - r.p[i - 1][0], r.p[i][1] - r.p[i - 1][1]);
  const mid = r.p[Math.floor(r.p.length / 2)];
  const key = r.n + '|' + Math.round(mid[0] / 400) + ',' + Math.round(mid[1] / 400);
  const prev = roadLabelSeen.get(key);
  if (!prev || prev.L < L) roadLabelSeen.set(key, { r, L, mid });
}
for (const { r, mid, L } of roadLabelSeen.values()) {
  if (L < 40) continue;
  const div = document.createElement('div');
  div.className = 'lbl road';
  div.textContent = r.n;
  const obj = new CSS2DObject(div);
  obj.position.set(mid[0], 3, mid[1]);
  layers.roadLabels.add(obj);
  labels.push({ obj, div, pr: 50, range: ['primary', 'motorway', 'secondary', 'trunk'].includes(r.k) ? 1600 : 650, road: true });
}
scene.add(layers.roadLabels);

function updateLabels() {
  const camPos = camera.position;
  const showB = layers.labels.visible, showR = layers.roadLabels.visible;
  const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
  const placed = [];
  const visible = [];
  for (const l of labels) {
    if ((l.road && !showR) || (!l.road && !showB)) { l.obj.visible = false; continue; }
    const d = camPos.distanceTo(l.obj.position);
    if (d > l.range || !frustum.containsPoint(l.obj.position)) { l.obj.visible = false; continue; }
    visible.push({ l, d, score: l.pr / Math.max(60, d) });
  }
  visible.sort((a, b) => b.score - a.score);
  const v = new THREE.Vector3();
  let count = 0;
  for (const { l } of visible) {
    v.copy(l.obj.position).project(camera);
    const x = (v.x + 1) * innerWidth / 2, y = (1 - v.y) * innerHeight / 2;
    const w = Math.min(260, l.div.textContent.length * 6.5 + 16), h = 22;
    const box = [x - w / 2, y - h, x + w / 2, y];
    const overlap = placed.some((p) => !(box[2] < p[0] || box[0] > p[2] || box[3] < p[1] || box[1] > p[3]));
    l.obj.visible = !overlap && count < 70;
    if (l.obj.visible) { placed.push(box); count++; }
  }
}

// ---------- satellite imagery (Esri World Imagery) ----------
let satMesh = null, satLoading = false;
async function ensureSatellite() {
  if (satMesh || satLoading) return;
  satLoading = true;
  const z = 17;
  const lon2x = (lon) => ((lon + 180) / 360) * 2 ** z;
  const lat2y = (lat) => ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** z;
  const x2lon = (x) => (x / 2 ** z) * 360 - 180;
  const y2lat = (y) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / 2 ** z))) * 180) / Math.PI;
  const S = 13.711, W = 100.758, N = 13.741, E = 100.795;
  const tx0 = Math.floor(lon2x(W)), tx1 = Math.floor(lon2x(E)), ty0 = Math.floor(lat2y(N)), ty1 = Math.floor(lat2y(S));
  const nx = tx1 - tx0 + 1, ny = ty1 - ty0 + 1;
  const cv = document.createElement('canvas');
  cv.width = nx * 256; cv.height = ny * 256;
  const g = cv.getContext('2d');
  g.fillStyle = '#7d8a6a'; g.fillRect(0, 0, cv.width, cv.height);
  const jobs = [];
  for (let x = tx0; x <= tx1; x++) for (let y = ty0; y <= ty1; y++) {
    jobs.push(new Promise((res) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { g.drawImage(img, (x - tx0) * 256, (y - ty0) * 256); res(); };
      img.onerror = res;
      img.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
    }));
  }
  await Promise.all(jobs);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  // once the mosaic is on the GPU the ~47 MB canvas is not needed: shrink it so the browser frees it
  tex.onUpdate = () => { cv.width = cv.height = 1; tex.onUpdate = null; };
  const [x0, z0] = toXZ(y2lat(ty0), x2lon(tx0));
  const [x1, z1] = toXZ(y2lat(ty1 + 1), x2lon(tx1 + 1));
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  geo.rotateX(-Math.PI / 2);
  satMesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }));
  satMesh.position.set((x0 + x1) / 2, 0.05, (z0 + z1) / 2);
  satMesh.receiveShadow = true;
  satMesh.visible = layerState.satellite;
  scene.add(satMesh);
  satLoading = false;
  applyLayers();
}

// ---------- picking / selection ----------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const pickables = buildingMeshes;
const hlMat = new THREE.MeshBasicMaterial({ color: '#ff7a1a', transparent: true, opacity: 0.28, depthWrite: false });
const hlEdgeMat = new THREE.LineBasicMaterial({ color: '#ff6b00' });
let hlGroup = null, hoverIdx = -1, selectedIdx = -1;

function pick(clientX, clientY) {
  mouse.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(layers.buildings.visible ? pickables : [], false)[0];
  if (!hit) return -1;
  return hit.object.geometry.userData.owner[hit.faceIndex] ?? -1;
}

function setHighlight(idx) {
  if (hlGroup) { scene.remove(hlGroup); hlGroup.children.forEach((c) => c.geometry.dispose()); hlGroup = null; }
  if (idx < 0) return;
  const g = highlightGeometry(buildingMeta[idx]);
  hlGroup = new THREE.Group();
  hlGroup.add(new THREE.Mesh(g, hlMat), new THREE.LineSegments(new THREE.EdgesGeometry(g, 30), hlEdgeMat));
  scene.add(hlGroup);
}

const tooltip = document.getElementById('tooltip');
let lastMove = 0;
renderer.domElement.addEventListener('pointermove', (e) => {
  const now = performance.now();
  if (now - lastMove < 50 || e.buttons) return;
  lastMove = now;
  const idx = pick(e.clientX, e.clientY);
  hoverIdx = idx;
  renderer.domElement.style.cursor = idx >= 0 ? 'pointer' : '';
  if (idx >= 0) {
    const b = buildingMeta[idx].b;
    tooltip.textContent = b.n || b.en || TYPE_TH[b.bt] || 'อาคาร';
    tooltip.style.left = e.clientX + 'px'; tooltip.style.top = e.clientY + 'px';
    tooltip.hidden = false;
  } else tooltip.hidden = true;
});
renderer.domElement.addEventListener('pointerleave', () => (tooltip.hidden = true));

let downAt = null;
renderer.domElement.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; stopOrbit(); });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return;
  if (walk.click(e.clientX, e.clientY)) return;
  const idx = pick(e.clientX, e.clientY);
  if (idx >= 0) select(idx, false); else closeInfo();
});

// ---------- info panel ----------
const info = document.getElementById('info'), infoBody = document.getElementById('info-body');
document.getElementById('info-close').onclick = closeInfo;
function closeInfo() { info.hidden = true; selectedIdx = -1; setHighlight(-1); }

const drivable = DATA.roads.filter((r) => !['footway', 'path', 'steps', 'cycleway', 'track'].includes(r.k) && !r.br);
function nearestRoadPoint(x, z) {
  let best = null, bd = Infinity;
  for (const r of drivable) for (let i = 1; i < r.p.length; i++) {
    const a = r.p[i - 1], b = r.p[i];
    const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2));
    const px = a[0] + t * dx, pz = a[1] + t * dz, d = Math.hypot(x - px, z - pz);
    if (d < bd) { bd = d; best = [px, pz]; }
  }
  return best;
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// pid: a programme to open and highlight in the faculty's list
function select(idx, fly, pid = null) {
  selectedIdx = idx;
  setHighlight(idx);
  const { b, H, top } = buildingMeta[idx];
  const [lat, lon] = toLatLon(b.c[0], b.c[1]);
  const name = b.n || b.th || b.en || TYPE_TH[b.bt] || 'อาคาร (ไม่มีชื่อในฐานข้อมูล)';
  const rp = nearestRoadPoint(b.c[0], b.c[1]);
  let svLat = lat, svLon = lon, heading = 0;
  if (rp) {
    [svLat, svLon] = toLatLon(rp[0], rp[1]);
    heading = ((Math.atan2(b.c[0] - rp[0], -(b.c[1] - rp[1])) * 180) / Math.PI + 360) % 360;
  }
  const q = encodeURIComponent((b.n || b.en || '') + ' สจล. ลาดกระบัง');
  const osmType = { w: 'way', r: 'relation' }[b.t] || 'way';
  const rows = [
    ['ประเภท', TYPE_TH[b.bt] || b.bt],
    ['จำนวนชั้น', b.lv != null ? `${b.lv} ชั้น` : `~${H.levels} ชั้น (ประมาณ)`],
    ['ความสูง', `${H.h.toFixed(1)} ม.${b.ht == null ? ' (ประมาณ)' : ''}`],
    ['พื้นที่ฐานอาคาร', `${b.a.toLocaleString()} ตร.ม.`],
    ['พิกัด', `${lat.toFixed(5)}, ${lon.toFixed(5)}`],
  ];
  if (b.sv) rows.push([`รูปลักษณ์ (สำรวจจาก ${b.src || 'Street View'})`, b.sv]);
  if (b.st) rows.push(['ถนน', b.st]);
  if (b.op) rows.push(['เวลาทำการ', b.op]);
  // t: 'x' = not in OpenStreetMap (outline added in overrides.json)
  if (b.t === 'x') rows.push(['ที่มา', 'ไม่มีใน OpenStreetMap (เพิ่มจากการสำรวจ)']);
  else rows.push(['OSM id', `<a href="https://www.openstreetmap.org/${osmType}/${b.id}" target="_blank" rel="noopener">${osmType}/${b.id}</a>`]);
  const fac = curricula?.facultyOfModel(b.model);
  infoBody.innerHTML = `
    ${b.img ? `<img class="ref-img" src="${esc(b.img)}" alt="">` : ''}
    <h2>${esc(name)}</h2>
    <div class="en">${esc(b.en && b.en !== name ? b.en : inCampus(b.c[0], b.c[1]) ? 'ภายในพื้นที่ สจล.' : 'นอกเขตสถาบัน')}</div>
    ${fac ? curricula.html(fac, pid) : ''}
    <table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${k === 'OSM id' ? v : esc(v)}</td></tr>`).join('')}</table>
    <div class="links">
      <a class="primary" target="_blank" rel="noopener" href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${svLat.toFixed(6)},${svLon.toFixed(6)}&heading=${heading.toFixed(0)}&pitch=10&fov=90">Street View</a>
      <a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lon.toFixed(6)}">Google Maps</a>
      <a target="_blank" rel="noopener" href="https://www.google.com/search?tbm=isch&q=${q}">ภาพจาก Google</a>
      <a target="_blank" rel="noopener" href="https://www.facebook.com/search/photos/?q=${q}">ภาพจาก Facebook</a>
    </div>
    <div class="note">ความสูงและรูปทรงมาจาก OpenStreetMap หากไม่ตรงกับภาพจริง แก้ได้ที่ <code>data/overrides.json</code> ด้วย id <b>${b.id}</b></div>`;
  info.hidden = false;
  showProgramme(pid);
  if (fly) flyTo(b.c[0], b.c[1], Math.max(140, Math.sqrt(b.a) * 3 + top * 3));
}

// ---------- programmes (data/programs.json) ----------
let curricula = null;
function showProgramme(pid) {
  if (!pid) { info.scrollTop = 0; return; }
  const li = infoBody.querySelector(`[data-pid="${CSS.escape(pid)}"]`);
  if (li) li.scrollIntoView({ block: 'center' });
}
// a faculty whose building is not in the model yet: the panel without a building
function showFaculty(fac, pid = null) {
  selectedIdx = -1; setHighlight(-1);
  infoBody.innerHTML = `<h2>${esc(fac.th)}</h2><div class="note">ยังไม่ได้ระบุอาคารของคณะนี้ในแบบจำลอง</div>${curricula.html(fac, pid)}`;
  info.hidden = false;
  showProgramme(pid);
}
loadCurricula().then((c) => {
  curricula = c;
  const idxOf = new Map();
  buildingMeta.forEach((m, i) => { if (m.b.model && !idxOf.has(m.b.model)) idxOf.set(m.b.model, i); });
  for (const fac of c.faculties) {
    const i = fac.buildings.map((m) => idxOf.get(m)).find((v) => v != null);
    const open = (pid) => (i != null ? select(i, true, pid) : showFaculty(fac, pid));
    index.push({ name: fac.th, en: fac.en, kind: `คณะ · ${c.programsOf(fac.id).length} หลักสูตร`, campus: true, go: () => open(null) });
    for (const p of c.programsOf(fac.id)) {
      index.push({ name: p.field, en: p.name, kind: `หลักสูตร ป.${p.level} ฉบับ ${p.latest} · ${fac.th}`, campus: true, prog: p.latest, go: () => open(p.id) });
    }
  }
  if (selectedIdx >= 0) select(selectedIdx, false);
}).catch((e) => console.warn('programmes not loaded', e));

// ---------- camera animation ----------
let tween = null;
function flyTo(x, z, dist, polar = 55, azimuth = null) {
  if (walk.mode !== 'off') walk.exit(false);      // any other camera move leaves street view first
  const az = azimuth ?? controls.getAzimuthalAngle();
  const ph = THREE.MathUtils.degToRad(polar);
  const target = new THREE.Vector3(x, 0, z);
  const pos = new THREE.Vector3(x + dist * Math.sin(ph) * Math.sin(az), dist * Math.cos(ph), z + dist * Math.sin(ph) * Math.cos(az));
  tween = { t: 0, from: [camera.position.clone(), controls.target.clone()], to: [pos, target] };
}
function stepTween(dt) {
  if (!tween) return;
  tween.t = Math.min(1, tween.t + dt / 1.3);
  const k = tween.t < 0.5 ? 4 * tween.t ** 3 : 1 - (-2 * tween.t + 2) ** 3 / 2;
  if (tween.spin) {                                  // swing round the target, keeping the distance and the tilt
    const { off, a0, a1 } = tween.spin, a = a0 + (a1 - a0) * k, r = Math.hypot(off.x, off.z);
    camera.position.set(controls.target.x + r * Math.sin(a), controls.target.y + off.y, controls.target.z + r * Math.cos(a));
  } else {
    camera.position.lerpVectors(tween.from[0], tween.to[0], k);
    controls.target.lerpVectors(tween.from[1], tween.to[1], k);
  }
  if (tween.t >= 1) tween = null;
}

// ---------- views ----------
const campusCentre = (() => {
  const big = DATA.campus.reduce((a, c) => (c.o.length > a.o.length ? c : a), DATA.campus[0]);
  const xs = big.o.map((p) => p[0]), zs = big.o.map((p) => p[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2];
})();
let orbiting = false;
const orbitBtn = document.getElementById('orbit-btn');
function stopOrbit() { orbiting = false; controls.autoRotate = false; orbitBtn.classList.remove('on'); }
document.querySelectorAll('[data-view]').forEach((btn) => btn.addEventListener('click', () => {
  const v = btn.dataset.view;
  if (v === 'orbit') {
    orbiting = !orbiting; controls.autoRotate = orbiting; controls.autoRotateSpeed = 0.6; orbitBtn.classList.toggle('on', orbiting);
    return;
  }
  stopOrbit();
  if (v === 'overview') flyTo(campusCentre[0], campusCentre[1], 1150, 52, THREE.MathUtils.degToRad(-35));
  if (v === 'top') flyTo(campusCentre[0], campusCentre[1], 1500, 0.5, 0);
  if (v === 'front') flyTo(campusCentre[0] - 150, campusCentre[1] + 250, 420, 70, THREE.MathUtils.degToRad(10));
}));
// hide every menu and panel (button or the H key), leaving just the model and this button
{
  const btn = document.getElementById('ui-toggle');
  const setHidden = (on) => {
    document.body.classList.toggle('ui-hidden', on);
    btn.setAttribute('aria-pressed', on);
    btn.title = on ? 'แสดงเมนู (H)' : 'ซ่อนเมนู (H)';
    btn.setAttribute('aria-label', on ? 'แสดงเมนู' : 'ซ่อนเมนู');
  };
  btn.addEventListener('click', () => setHidden(!document.body.classList.contains('ui-hidden')));
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest?.('input, select, textarea')) setHidden(!document.body.classList.contains('ui-hidden'));
  });
}
// the compass flips the view between north-up and south-up: whichever way the camera faces more, it turns to the other
document.getElementById('compass').addEventListener('click', () => {
  if (walk.mode === 'walk') { walk.yaw = Math.abs(walk.yaw) < Math.PI / 2 ? Math.PI : 0; return; }
  stopOrbit();
  const a0 = controls.getAzimuthalAngle();
  const a1 = Math.abs(a0) < Math.PI / 2 ? (a0 < 0 ? -Math.PI : Math.PI) : 0;
  tween = { t: 0, spin: { off: camera.position.clone().sub(controls.target), a0, a1 } };
});

// ---------- street view: walk around at eye level ----------
// the button (or Esc) toggles it: first click a spot on the map, the camera drops to eye height there;
// ↑/↓ walk along the view, ←/→ turn, dragging looks round (grab style, like Google Street View), the wheel zooms
const walk = (() => {
  const EYE = 1.7, SPEED = 5, RUN = 3, TURN = 1.7, R = 0.7, PITCH = THREE.MathUtils.degToRad(80);
  const btn = document.getElementById('walk-btn'), hint = document.getElementById('walk-hint');
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();
  // footprints whose walls come down to the ground block the way; canopies, carports and skywalks you walk under
  const OPEN = new Set(['roof', 'carport', 'bridge']), OPEN_MODELS = new Set(['skywalk', 'skywalkcmkl', 'railwalk', 'footbridge']);
  const blockers = buildingMeta.filter((m) => m.b.o?.length > 2 && m.H.minH < 2.2 && !OPEN.has(m.b.bt) && !OPEN_MODELS.has(m.b.model)).map((m) => {
    const xs = m.b.o.map((p) => p[0]), zs = m.b.o.map((p) => p[1]);
    return { o: m.b.o, x0: Math.min(...xs) - R, x1: Math.max(...xs) + R, z0: Math.min(...zs) - R, z1: Math.max(...zs) + R };
  });
  const insideAt = (x, z) => blockers.some((k) => x > k.x0 && x < k.x1 && z > k.z0 && z < k.z1 && pointInRing(x, z, k.o));
  // a body of radius R: probe the centre and four points round it
  const blocked = (x, z) => [[0, 0], [R, 0], [-R, 0], [0, R], [0, -R]].some(([dx, dz]) => insideAt(x + dx, z + dz));
  const keys = new Set();
  const s = { mode: 'off', yaw: 0, pitch: 0, pos: new THREE.Vector3(), anim: null, drag: null };
  const lookQ = (yaw, pitch) => new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
  const groundAt = (cx, cy) => {
    mouse.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    return raycaster.ray.intersectPlane(groundPlane, hitP);
  };
  function setUI() {
    document.body.classList.toggle('walk-pick', s.mode === 'pick');
    document.body.classList.toggle('walking', s.mode === 'walk');
    btn.classList.toggle('on', s.mode !== 'off');
    btn.textContent = s.mode === 'walk' ? '✕ ออกจาก Street View' : s.mode === 'pick' ? '✕ ยกเลิก' : '🚶 Street View';
    hint.hidden = s.mode === 'off';
    hint.innerHTML = s.mode === 'pick' ? 'คลิกจุดบนแผนที่ที่ต้องการยืน · <kbd>Esc</kbd> ยกเลิก'
      : '<kbd>↑</kbd><kbd>↓</kbd> เดิน · <kbd>←</kbd><kbd>→</kbd> หันซ้าย/ขวา · ลากเมาส์เพื่อมองรอบ · คลิกพื้นเพื่อเดินไปตรงนั้น · <kbd>Shift</kbd> วิ่ง · <kbd>Esc</kbd> ออก';
  }
  // glide the camera to a standing spot (and optionally a new heading)
  function goTo(x, z, yaw = s.yaw, pitch = s.pitch, time = 1.2, force = false) {
    if (blocked(x, z)) {                             // landed inside a building: step out onto the nearest road
      const rp = nearestRoadPoint(x, z);
      if (rp && !blocked(rp[0], rp[1])) [x, z] = rp; else if (!force) return;
    }
    s.yaw = yaw; s.pitch = pitch;
    s.pos.set(x, EYE, z);
    s.anim = { t: 0, time, p0: camera.position.clone(), q0: camera.quaternion.clone(), p1: s.pos.clone() };
  }
  function enter(x, z) {
    s.mode = 'walk';
    tween = null; controls.enabled = false;
    if (eventFollow.checked && events.state.running) eventFollow.checked = false;
    goTo(x, z, controls.getAzimuthalAngle(), 0, 1.6, true);
    setUI();
  }
  // fly: back up to an orbit view over the spot where we stood, facing the same way
  function exit(fly = true) {
    const was = s.mode;
    s.mode = 'off'; s.anim = null; s.drag = null; keys.clear();
    controls.enabled = true;
    if (camera.fov !== 45) { camera.fov = 45; camera.updateProjectionMatrix(); }
    setUI();
    if (was !== 'walk') return;
    const fx = -Math.sin(s.yaw), fz = -Math.cos(s.yaw);
    controls.target.set(camera.position.x + fx * 20, 0, camera.position.z + fz * 20);
    camera.up.set(0, 1, 0);
    if (fly) flyTo(controls.target.x, controls.target.z, 180, 58, s.yaw);
  }
  btn.addEventListener('click', () => {
    btn.blur();                                      // keep Space/Enter from re-pressing it while walking
    if (s.mode === 'off') { stopOrbit(); s.mode = 'pick'; setUI(); } else exit();
  });
  // a click (not a drag) on the canvas: choose where to stand, or walk to the clicked spot on the ground
  function click(cx, cy) {
    if (s.mode === 'pick') {
      const p = groundAt(cx, cy);
      if (p) enter(p.x, p.z);
      return true;
    }
    if (s.mode !== 'walk') return false;
    if (pick(cx, cy) >= 0) return false;              // buildings still open their info panel
    const p = groundAt(cx, cy);
    if (!p || p.distanceTo(camera.position) > 120) return true;
    goTo(p.x, p.z, s.yaw, s.pitch, Math.min(1.5, 0.4 + p.distanceTo(camera.position) / 40));
    return true;
  }
  const el = renderer.domElement;
  el.addEventListener('pointerdown', (e) => { if (s.mode === 'walk') s.drag = [e.clientX, e.clientY]; });
  addEventListener('pointerup', () => (s.drag = null));
  el.addEventListener('pointermove', (e) => {
    if (s.mode !== 'walk' || !s.drag || !e.buttons) return;
    const k = THREE.MathUtils.degToRad(camera.fov) / innerHeight;
    s.yaw += (e.clientX - s.drag[0]) * k;
    s.pitch = THREE.MathUtils.clamp(s.pitch + (e.clientY - s.drag[1]) * k, -PITCH, PITCH);
    s.drag = [e.clientX, e.clientY];
  });
  el.addEventListener('wheel', (e) => {
    if (s.mode !== 'walk') return;
    camera.fov = THREE.MathUtils.clamp(camera.fov * (e.deltaY > 0 ? 1.1 : 1 / 1.1), 20, 80);
    camera.updateProjectionMatrix();
  }, { passive: true });
  const MOVE_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd', 'W', 'S', 'A', 'D'];
  document.addEventListener('keydown', (e) => {
    if (s.mode === 'off' || e.target.closest?.('input, select, textarea')) return;
    if (e.key === 'Escape') { exit(); return; }
    if (e.key === 'Shift') keys.add('shift');
    if (s.mode === 'walk' && MOVE_KEYS.includes(e.key)) { keys.add(e.key.toLowerCase()); e.preventDefault(); }
  });
  document.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  addEventListener('blur', () => keys.clear());
  // one frame of walking; runs in place of controls.update()
  function update(dt) {
    const k = (a, b) => keys.has(a) || keys.has(b);
    const run = keys.has('shift');
    if (k('arrowleft', 'a')) s.yaw += TURN * dt;
    if (k('arrowright', 'd')) s.yaw -= TURN * dt;
    s.yaw = Math.atan2(Math.sin(s.yaw), Math.cos(s.yaw));
    const fwd = (k('arrowup', 'w') ? 1 : 0) - (k('arrowdown', 's') ? 1 : 0);
    if (s.anim) {
      const a = s.anim;
      a.t = Math.min(1, a.t + dt / a.time);
      const e = a.t < 0.5 ? 4 * a.t ** 3 : 1 - (-2 * a.t + 2) ** 3 / 2;
      camera.position.lerpVectors(a.p0, a.p1, e);
      camera.quaternion.slerpQuaternions(a.q0, lookQ(s.yaw, s.pitch), e);
      if (a.t >= 1) s.anim = null;
    } else {
      if (fwd) {
        const d = fwd * SPEED * (run ? RUN : 1) * dt, dx = -Math.sin(s.yaw) * d, dz = -Math.cos(s.yaw) * d;
        const { x, z } = s.pos;
        // slide along walls: try the full step, then each axis on its own
        if (!blocked(x + dx, z + dz)) s.pos.set(x + dx, EYE, z + dz);
        else if (!blocked(x + dx, z)) s.pos.x = x + dx;
        else if (!blocked(x, z + dz)) s.pos.z = z + dz;
      }
      camera.position.copy(s.pos);
      camera.quaternion.copy(lookQ(s.yaw, s.pitch));
    }
    // the shadows and labels centre on controls.target: keep it a little ahead of the walker
    controls.target.set(camera.position.x - Math.sin(s.yaw) * 30, 0, camera.position.z - Math.cos(s.yaw) * 30);
  }
  setUI();
  return Object.assign(s, { exit, click, update, blocked });
})();

// ---------- disasters and recovery ----------
// pick a disaster to wreck random campus buildings; recovery sends crews of students to build them back
const disasters = buildDisasters({ scene, group: layers.buildings, meta: buildingMeta, inCampus, flyTo, camera });
{
  const sel = document.getElementById('disaster-type'), go = document.getElementById('disaster-go');
  const fix = document.getElementById('disaster-fix'), msg = document.getElementById('disaster-msg');
  sel.innerHTML = '<option value="random">🎲 สุ่ม</option>' + DISASTERS.map((d) => `<option value="${d.id}">${d.th}</option>`).join('');
  go.addEventListener('click', () => { stopOrbit(); const lead = selectedIdx; closeInfo(); disasters.trigger(sel.value, lead); });
  fix.addEventListener('click', () => { stopOrbit(); disasters.recover(); });
  disasters.onChange((s) => {
    go.disabled = s.busy || s.rebuilding;
    fix.disabled = s.busy || s.rebuilding || !s.destroyed;
    msg.textContent = s.text;
  });
}

// ---------- campus events ----------
// play a yearly event on the model (events.md); the camera follows it until the user moves the view
const events = buildEvents({ data: DATA, getTime: () => +timeInput.value, setTime: (h) => { timeInput.value = h; setTime(h); } });
scene.add(events.group);
const eventFollow = document.getElementById('event-follow');
{
  const sel = document.getElementById('event-type'), speed = document.getElementById('event-speed');
  const go = document.getElementById('event-go'), stop = document.getElementById('event-stop'), msg = document.getElementById('event-msg');
  sel.innerHTML = EVENTS.map((e) => `<option value="${e.id}">${e.th}</option>`).join('');
  events.setSpeed(+speed.value);
  speed.addEventListener('change', () => events.setSpeed(+speed.value));
  events.onChange((s) => { msg.textContent = s.text; stop.disabled = !s.running; });   // starting another event switches to it
  go.addEventListener('click', () => {
    stopOrbit(); closeInfo();
    speed.value = String(EVENTS.find((e) => e.id === sel.value).speed);
    events.setSpeed(+speed.value);
    events.start(sel.value);
    eventFollow.checked = true;
    const f = events.focus(), v = events.view();
    flyTo(f.x, f.z, v.dist, v.polar, THREE.MathUtils.degToRad(v.az));
  });
  stop.addEventListener('click', () => events.stop());
  controls.addEventListener('start', () => { if (events.state.running) eventFollow.checked = false; });
}

// ---------- layer toggles ----------
// defaults: buildings, satellite imagery and shadows; everything else can be switched on in the panel
const layerState = { buildings: true, labels: false, roadLabels: false, traffic: false, students: false, satellite: true, shadows: true };
function applyLayers() {
  layers.buildings.visible = layerState.buildings;
  layers.labels.visible = layerState.buildings && layerState.labels;
  layers.roadLabels.visible = layerState.roadLabels;
  layers.traffic.visible = layerState.traffic;
  layers.students.visible = layerState.students;
  layers.areas.visible = !layerState.satellite;
  if (satMesh) satMesh.visible = layerState.satellite;
  document.getElementById('sat-attrib').hidden = !layerState.satellite;
  sun.castShadow = layerState.shadows;
  if (!layerState.buildings) closeInfo();
}
// the panel always starts from layerState (browsers may restore old checkbox states on reload)
document.querySelectorAll('[data-layer]').forEach((cb) => { cb.checked = !!layerState[cb.dataset.layer]; });
document.querySelectorAll('[data-layer]').forEach((cb) => cb.addEventListener('change', () => {
  layerState[cb.dataset.layer] = cb.checked;
  if (cb.dataset.layer === 'satellite' && cb.checked) ensureSatellite();
  applyLayers();
}));

// ---------- time of day ----------
const timeInput = document.getElementById('time'), timeLabel = document.getElementById('time-label');
const sunDir = new THREE.Vector3();
const nightBg = new THREE.Color('#0b1220');
let windowGlow = 0;
function setTime(h) {
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  timeLabel.textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  // Bangkok in mid-October: sunrise ~6:10, sunset ~18:00, sun passes south of zenith (~76° max)
  const f = (h - 6.1) / (18.0 - 6.1);
  const elev = Math.sin(Math.PI * f) * 76;
  const az = THREE.MathUtils.degToRad(90 + 180 * f); // east -> south -> west (bearing)
  const el = THREE.MathUtils.degToRad(elev);
  // bearing to three.js: north = -z, east = +x
  sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
  sky.material.uniforms.sunPosition.value.copy(sunDir);
  const day = THREE.MathUtils.clamp((elev + 4) / 14, 0, 1);
  // after dusk the directional light becomes a cool moonlight
  const moon = elev < 0;
  sun.intensity = moon ? 0.9 : 3.2 * THREE.MathUtils.clamp(elev / 12, 0.08, 1);
  sun.color.set(moon ? '#9fb4ff' : elev < 12 ? '#ffc58a' : '#fff4e0');
  hemi.intensity = 0.7 + 0.45 * day;
  hemi.color.set(day > 0.5 ? '#dfeaff' : '#6f84c4');
  hemi.groundColor.set(day > 0.5 ? '#7d7462' : '#2a2f3d');
  renderer.toneMappingExposure = 0.5 + 0.32 * day;
  sky.visible = day > 0.02;
  scene.background = day > 0.02 ? null : nightBg;
  scene.fog.color.set(day > 0.3 ? '#cfd9e3' : new THREE.Color('#cfd9e3').lerp(nightBg, 1 - day / 0.3));
  windowGlow = THREE.MathUtils.clamp((8 - elev) / 10, 0, 1);
  buildingMeshes.forEach((m) => { if (m.material.emissiveMap) m.material.emissiveIntensity = windowGlow * 1.6; });
  traffic.setNight(windowGlow);
  // sun glints on the water follow the sun (or the moon after dusk); the water itself darkens at night
  const wu = layers.water.userData.surface.material.uniforms;
  wu.sunDirection.value.copy(moon ? new THREE.Vector3(-sunDir.x, -sunDir.y, -sunDir.z) : sunDir).normalize();
  wu.sunColor.value.copy(sun.color).multiplyScalar(moon ? 0.25 : THREE.MathUtils.clamp(elev / 12, 0.3, 1));
  wu.waterColor.value.set('#1f4f5c').lerp(nightBg, 1 - day);
}
timeInput.addEventListener('input', () => setTime(+timeInput.value));
setTime(+timeInput.value);

// ---------- search ----------
const searchInput = document.getElementById('search'), results = document.getElementById('results');
const index = [];
buildingMeta.forEach((m, i) => {
  const b = m.b;
  if (b.n || b.en || b.th) index.push({ name: b.n || b.th || b.en, en: b.en, kind: TYPE_TH[b.bt] || 'อาคาร', go: () => select(i, true), campus: inCampus(b.c[0], b.c[1]) });
});
DATA.pois.forEach((p) => {
  index.push({ name: p.n, en: p.en, kind: p.k, campus: inCampus(p.p[0], p.p[1]), go: () => { closeInfo(); flyTo(p.p[0], p.p[1], 220); } });
});
let active = 0, current = [];
function renderResults() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { results.hidden = true; return; }
  current = index.filter((e) => e.name.toLowerCase().includes(q) || (e.en || '').toLowerCase().includes(q))
    .sort((a, b) => b.campus - a.campus || (b.prog ? 0 : 1) - (a.prog ? 0 : 1) || (b.prog || 0) - (a.prog || 0)).slice(0, 30);
  active = 0;
  results.innerHTML = current.length ? current.map((e, i) => `<li data-i="${i}" class="${i === 0 ? 'active' : ''}">${esc(e.name)}<small>${esc(e.kind)}${e.en ? ' · ' + esc(e.en) : ''}${e.campus ? ' · ใน สจล.' : ''}</small></li>`).join('')
    : '<li><small>ไม่พบผลลัพธ์</small></li>';
  results.hidden = false;
}
searchInput.addEventListener('input', renderResults);
searchInput.addEventListener('keydown', (e) => {
  if (results.hidden || !current.length) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    active = (active + (e.key === 'ArrowDown' ? 1 : current.length - 1)) % current.length;
    [...results.children].forEach((li, i) => li.classList.toggle('active', i === active));
    e.preventDefault();
  } else if (e.key === 'Enter') { current[active].go(); results.hidden = true; searchInput.blur(); }
  else if (e.key === 'Escape') results.hidden = true;
});
results.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-i]');
  if (li) { current[+li.dataset.i].go(); results.hidden = true; }
});
document.addEventListener('click', (e) => { if (!e.target.closest('.search')) results.hidden = true; });

// ---------- main loop ----------
const compassNeedle = document.querySelector('#compass svg');
const clock = new THREE.Clock();
let frame = 0;
const fallbackSunDir = new THREE.Vector3(0.3, 1, 0.2).normalize(), origin = new THREE.Vector3();
const lightBasis = new THREE.Matrix4(), lightX = new THREE.Vector3(), lightY = new THREE.Vector3(), lightZ = new THREE.Vector3(), snapped = new THREE.Vector3();
function loop(manual = false) {
  const dt = manual ? 0.1 : Math.min(0.1, clock.getDelta());
  stepTween(dt);
  layers.water.userData.surface.material.uniforms.time.value += dt * 0.6;
  if (layers.traffic.visible) { traffic.update(dt); planes.update(dt); }
  if (layers.students.visible) students.update(dt);
  events.update(dt);
  // follow the event: slide the view along with it
  const ef = eventFollow.checked && !tween && walk.mode !== 'walk' ? events.focus() : null;
  if (ef) { const d = ef.sub(controls.target).multiplyScalar(Math.min(1, dt * 1.5)); controls.target.add(d); camera.position.add(d); }
  if (orbiting && !tween) controls.target.lerp(new THREE.Vector3(campusCentre[0], 0, campusCentre[1]), 0.01);
  if (walk.mode === 'walk') walk.update(dt); else controls.update();
  disasters.update(dt, camera.position.distanceTo(controls.target));
  camera.position.add(disasters.shakeOffset);   // camera shake, taken off again after rendering
  // keep the shadow frustum centred on what we're looking at
  const t = controls.target;
  const dist = camera.position.distanceTo(t);
  // the ground layers sit only a few cm apart: with a fixed 1 m near plane the depth buffer could not tell them
  // apart beyond a few hundred metres and they z-fought (flickered); pushing the near plane out with the
  // distance keeps the depth precision near the target at a few mm
  const near = walk.mode === 'walk' ? 0.3 : THREE.MathUtils.clamp(dist * 0.015, 1, 25);
  if (Math.abs(camera.near - near) > 0.05 * near) { camera.near = near; camera.updateProjectionMatrix(); }
  // shadow frustum size in fixed steps (x1.25) so zooming does not keep resampling the shadow map
  const ext = 180 * 1.25 ** THREE.MathUtils.clamp(Math.round(Math.log(dist * 0.75 / 180) / Math.log(1.25)), 0, 7);
  const sc = sun.shadow.camera;
  if (sc.right !== ext) { sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.updateProjectionMatrix(); }
  // snap the frustum centre to whole shadow-map texels, so panning slides the shadows instead of making
  // their edges shimmer
  const dir = sunDir.y > 0.02 ? sunDir : fallbackSunDir;
  lightBasis.lookAt(dir, origin, camera.up).extractBasis(lightX, lightY, lightZ);
  const texel = (2 * ext) / sun.shadow.mapSize.x;
  const tx = t.dot(lightX), ty = t.dot(lightY);
  snapped.copy(t).addScaledVector(lightX, Math.round(tx / texel) * texel - tx).addScaledVector(lightY, Math.round(ty / texel) * texel - ty);
  sun.target.position.copy(snapped);
  sun.position.copy(snapped).addScaledVector(dir, 1800);
  compassNeedle.style.transform = `rotate(${THREE.MathUtils.radToDeg(walk.mode === 'walk' ? walk.yaw : controls.getAzimuthalAngle())}deg)`;
  if (frame++ % 6 === 0) updateLabels();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  camera.position.sub(disasters.shakeOffset);
  if (!manual) requestAnimationFrame(() => loop());
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  labelRenderer.setSize(innerWidth, innerHeight);
});

// initial view
flyTo(campusCentre[0], campusCentre[1], 1150, 52, THREE.MathUtils.degToRad(-35));
tween.t = 0.999;
applyLayers();
if (layerState.satellite) ensureSatellite();
renderer.setAnimationLoop(null);
loop();
document.getElementById('loading').classList.add('done');
// debugging hook: advance n frames synchronously (useful when the tab is in the background)
window.__kmitl = { renderer, scene, camera, controls, buildingMeta, select, flyTo, walk, setTime, traffic, students, disasters, events, step: (n = 20) => { for (let i = 0; i < n; i++) loop(true); } };
