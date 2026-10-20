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
  });
  return saved;
}
