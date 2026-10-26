// Memory: every mesh's vertex data lives twice, once in JS and once on the graphics card. The hand-built models
// alone are about a million flat-shaded triangles (~55 MB of positions, normals and uvs), so:
//   - normals are stored as 8-bit integers instead of 32-bit floats (a quarter of the size, looks the same)
//   - uvs are dropped from meshes whose materials have no texture to read them
//   - once a buffer is on the graphics card, the JS copy of anything not read again is emptied
// `keep` names the attributes that are still read in JS afterwards (positions for picking, the disaster rig).
import * as THREE from 'three';

const TEX_SLOTS = ['map', 'emissiveMap', 'bumpMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'aoMap', 'lightMap'];
const usesUV = (m) => TEX_SLOTS.some((k) => m[k]);
const EMPTY = { Float32Array: new Float32Array(0), Int8Array: new Int8Array(0), Uint16Array: new Uint16Array(0), Uint32Array: new Uint32Array(0) };
function release() { this.array = EMPTY[this.array.constructor.name] || new this.array.constructor(0); }

export function slim(root, keep = []) {
  const seen = new Set();
  let saved = 0;
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry || seen.has(o.geometry)) return;
    const g = o.geometry;
    seen.add(g);
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    if (mats.some((m) => m.isShaderMaterial)) return;                   // custom shaders may read anything
    // bounds are computed from positions on demand: do it now, while they are still here
    if (!g.boundingSphere) g.computeBoundingSphere();
    if (!g.boundingBox) g.computeBoundingBox();
    const uv = g.attributes.uv;
    if (uv && !mats.some(usesUV)) { saved += uv.array.byteLength * 2; g.deleteAttribute('uv'); }
    const n = g.attributes.normal;
    if (n && n.array instanceof Float32Array && n.itemSize === 3 && !n.isInterleavedBufferAttribute) {
      const q = new Int8Array(n.array.length);
      for (let i = 0; i < q.length; i++) q[i] = Math.round(Math.max(-1, Math.min(1, n.array[i])) * 127);
      saved += n.array.byteLength * 0.75;
      g.setAttribute('normal', new THREE.BufferAttribute(q, 3, true));
    }
    for (const [name, a] of Object.entries(g.attributes)) {
      if (keep.includes(name) || a.isInterleavedBufferAttribute) continue;
      saved += a.array.byteLength;
      a.onUpload(release);
    }
    if (g.index && !keep.includes('index')) g.index.onUpload(release);
    g.userData.slim = true;                                              // its arrays can't be uploaded again
  });
  return saved;
}

// Canvas textures: once the pixels are on the graphics card the canvas is only memory, so it is shrunk to 1x1
// after the first upload. Textures that are drawn on again later are marked userData.live and keep theirs.
// userData.size keeps the real size, and marks the texture as one that can't be uploaded again.
export function dropCanvas(t) {
  const cv = t.image;
  if (!(cv instanceof HTMLCanvasElement) || t.userData.live || t.userData.size) return 0;
  t.userData.size = [cv.width, cv.height];
  const prev = t.onUpdate;
  t.onUpdate = (tex) => { cv.width = cv.height = 1; t.onUpdate = prev; prev?.(tex); };
  return cv.width * cv.height * 4;
}
export function dropCanvases(root) {
  let saved = 0;
  root.traverse((o) => {
    if (o.material) for (const m of [].concat(o.material)) for (const k in m) if (m[k]?.isTexture) saved += dropCanvas(m[k]);
  });
  return saved;
}

// free the graphics-card copies of everything under root (a finished event scene). Shared world resources that
// can't be uploaded again (slimmed geometry, dropped canvases) are left alone.
export function disposeTree(root) {
  const done = new Set();
  root.traverse((o) => {
    if (o.geometry && !done.has(o.geometry) && !o.geometry.userData.slim) { done.add(o.geometry); o.geometry.dispose(); }
    if (o.isInstancedMesh) o.dispose();
    if (o.material) for (const m of [].concat(o.material)) {
      if (done.has(m)) continue;
      done.add(m);
      for (const k in m) { const t = m[k]; if (t?.isTexture && !done.has(t) && !t.userData.size) { done.add(t); t.dispose(); } }
      m.dispose();
    }
  });
}
