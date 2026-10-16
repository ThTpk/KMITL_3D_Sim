import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  buildBuildings, buildAreas, buildWater, buildRoads, buildRails, buildTrees, buildCampusOutline,
  highlightGeometry, pointInRing,
} from './builders.js';

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
sun.shadow.mapSize.set(4096, 4096);
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
const { meshes: buildingMeshes, meta: buildingMeta } = buildBuildings(DATA.buildings);
layers.buildings = new THREE.Group();
buildingMeshes.forEach((m) => layers.buildings.add(m));
const areas = buildAreas(DATA);
layers.areas = new THREE.Group(); areas.forEach((a) => layers.areas.add(a));
layers.water = buildWater(DATA);
layers.roads = buildRoads(DATA);
layers.rails = buildRails(DATA);
layers.campus = buildCampusOutline(DATA);
layers.trees = buildTrees(DATA, DATA.buildings);
for (const k of ['areas', 'water', 'roads', 'rails', 'campus', 'buildings', 'trees']) scene.add(layers[k]);
console.log(`world built in ${(performance.now() - t0).toFixed(0)} ms – ${buildingMeta.length} buildings, ${layers.trees.userData.count} trees`);

// ---------- labels ----------
const TYPE_TH = {
  university: 'อาคารมหาวิทยาลัย', school: 'อาคารเรียน', office: 'สำนักงาน', dormitory: 'หอพัก', apartments: 'อพาร์ตเมนต์/หอพัก',
  residential: 'ที่พักอาศัย', house: 'บ้าน', terrace: 'ทาวน์เฮาส์', retail: 'ร้านค้า', commercial: 'อาคารพาณิชย์', temple: 'วัด/ศาสนสถาน',
  roof: 'หลังคา/โรงจอดรถ', garage: 'โรงรถ', carport: 'ที่จอดรถมีหลังคา', shed: 'โรงเก็บของ', industrial: 'อาคารอุตสาหกรรม', service: 'อาคารบริการ',
  sports_centre: 'ศูนย์กีฬา', stadium: 'สนามกีฬา', train_station: 'สถานีรถไฟ', construction: 'กำลังก่อสร้าง', yes: 'อาคาร',
};
const campusRings = DATA.campus.map((c) => c.o);
const inCampus = (x, z) => campusRings.some((o) => pointInRing(x, z, o));

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

function select(idx, fly) {
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
  rows.push(['OSM id', `<a href="https://www.openstreetmap.org/${osmType}/${b.id}" target="_blank" rel="noopener">${osmType}/${b.id}</a>`]);
  infoBody.innerHTML = `
    ${b.img ? `<img class="ref-img" src="${esc(b.img)}" alt="">` : ''}
    <h2>${esc(name)}</h2>
    <div class="en">${esc(b.en && b.en !== name ? b.en : inCampus(b.c[0], b.c[1]) ? 'ภายในพื้นที่ สจล.' : 'นอกเขตสถาบัน')}</div>
    <table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${k === 'OSM id' ? v : esc(v)}</td></tr>`).join('')}</table>
    <div class="links">
      <a class="primary" target="_blank" rel="noopener" href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${svLat.toFixed(6)},${svLon.toFixed(6)}&heading=${heading.toFixed(0)}&pitch=10&fov=90">Street View</a>
      <a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lon.toFixed(6)}">Google Maps</a>
      <a target="_blank" rel="noopener" href="https://www.google.com/search?tbm=isch&q=${q}">ภาพจาก Google</a>
      <a target="_blank" rel="noopener" href="https://www.facebook.com/search/photos/?q=${q}">ภาพจาก Facebook</a>
    </div>
    <div class="note">ความสูงและรูปทรงมาจาก OpenStreetMap หากไม่ตรงกับภาพจริง แก้ได้ที่ <code>data/overrides.json</code> ด้วย id <b>${b.id}</b></div>`;
  info.hidden = false;
  if (fly) flyTo(b.c[0], b.c[1], Math.max(140, Math.sqrt(b.a) * 3 + top * 3));
}

// ---------- camera animation ----------
let tween = null;
function flyTo(x, z, dist, polar = 55, azimuth = null) {
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
  camera.position.lerpVectors(tween.from[0], tween.to[0], k);
  controls.target.lerpVectors(tween.from[1], tween.to[1], k);
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
document.getElementById('compass').addEventListener('click', () => {
  const t = controls.target;
  const d = camera.position.distanceTo(t);
  flyTo(t.x, t.z, d, THREE.MathUtils.radToDeg(controls.getPolarAngle()), 0);
});

// ---------- layer toggles ----------
const layerState = { buildings: true, labels: true, roadLabels: true, trees: true, satellite: false, shadows: true };
function applyLayers() {
  layers.buildings.visible = layerState.buildings;
  layers.labels.visible = layerState.buildings && layerState.labels;
  layers.roadLabels.visible = layerState.roadLabels;
  layers.trees.visible = layerState.trees;
  layers.areas.visible = !layerState.satellite;
  if (satMesh) satMesh.visible = layerState.satellite;
  document.getElementById('sat-attrib').hidden = !layerState.satellite;
  sun.castShadow = layerState.shadows;
  if (!layerState.buildings) closeInfo();
}
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
    .sort((a, b) => b.campus - a.campus).slice(0, 30);
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
const compassNeedle = document.querySelector('#compass span');
const clock = new THREE.Clock();
let frame = 0;
function loop(manual = false) {
  const dt = manual ? 0.1 : Math.min(0.1, clock.getDelta());
  stepTween(dt);
  if (orbiting && !tween) controls.target.lerp(new THREE.Vector3(campusCentre[0], 0, campusCentre[1]), 0.01);
  controls.update();
  // keep the shadow frustum centred on what we're looking at
  const t = controls.target;
  const dist = camera.position.distanceTo(t);
  const ext = THREE.MathUtils.clamp(dist * 0.75, 180, 900);
  const sc = sun.shadow.camera;
  if (Math.abs(sc.right - ext) > 20) { sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.updateProjectionMatrix(); }
  sun.target.position.copy(t);
  sun.position.copy(t).addScaledVector(sunDir.y > 0.02 ? sunDir : new THREE.Vector3(0.3, 1, 0.2).normalize(), 1800);
  compassNeedle.style.transform = `rotate(${THREE.MathUtils.radToDeg(controls.getAzimuthalAngle())}deg)`;
  if (frame++ % 6 === 0) updateLabels();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
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
renderer.setAnimationLoop(null);
loop();
document.getElementById('loading').classList.add('done');
// debugging hook: advance n frames synchronously (useful when the tab is in the background)
window.__kmitl = { scene, camera, controls, buildingMeta, select, flyTo, setTime, step: (n = 20) => { for (let i = 0; i < n; i++) loop(true); } };
