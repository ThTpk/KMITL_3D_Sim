// Shared parts for the hand-built models: placing a block built in its own frame (for buildings that are not
// aligned with the x/z axes), generic floor-by-floor facades, and turning an Acc into meshes.
// The older models each carry their own copy of the mesh/material code; newer ones use this.
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex } from './ecc.js';

export { Acc, onFace };

export const F = (ax, at, out) => ({ ax, at, out });

// copy everything in `src` into `dst`, turned by `ang` (radians; local +x points along (cos ang, sin ang) in x/z)
// and moved to (ox, oz)
export function place(dst, src, ox, oz, ang = 0) {
  const c = Math.cos(ang), s = Math.sin(ang);
  for (const [m, B] of Object.entries(src.b)) {
    const D = dst.bucket(m);
    for (let i = 0; i < B.p.length; i += 3) {
      const x = B.p[i], y = B.p[i + 1], z = B.p[i + 2];
      D.p.push(ox + x * c - z * s, y, oz + x * s + z * c);
      const nx = B.n[i], ny = B.n[i + 1], nz = B.n[i + 2];
      D.n.push(nx * c - nz * s, ny, nx * s + nz * c);
    }
    D.uv.push(...B.uv);
  }
}

// One face of a block, floor by floor. f = F(...), wall runs a0..a1 along it.
// o: { y0 = 0, G = ground storey, FL = upper storey, n = storeys, style, bay, mats, skip: [[a0, a1], ...] }
// styles:
//   band     white floor slab edges, ribbon windows between piers
//   punched  plain wall with a window per bay
//   corridor open walkway with a solid parapet band on every upper floor (dark recess behind)
//   brick    solid brick (end walls, stair towers) crossed by the floor bands
//   blank    floor bands only
export function facade(A, f, a0, a1, o) {
  const { y0 = 0, G = 3.8, FL = 3.6, n = 1, style = 'band', bay = 4, skip = [] } = o;
  const M = { band: 'band', glass: 'glass', pier: 'wall', brick: 'brick', dark: 'dark', ...(o.mats || {}) };
  const len = a1 - a0;
  if (len < 1.5) return;
  const bays = Math.max(1, Math.round(len / bay)), w = len / bays;
  const free = (b0, b1) => !skip.some(([s0, s1]) => b1 > s0 && b0 < s1);
  for (let k = 0; k < n; k++) {
    const yb = y0 + (k === 0 ? 0 : G + (k - 1) * FL), yt = y0 + G + k * FL;
    const h = yt - yb;
    if (k > 0 || style === 'brick' || style === 'blank') onFace(A, M.band, f, a0 - 0.15, a1 + 0.15, yb - 0.15, yb + 0.45, 0, 0.3);
    if (style === 'brick') { onFace(A, M.brick, f, a0, a1, yb + 0.45, yt - 0.15, 0, 0.04); continue; }
    if (style === 'blank') continue;
    for (let i = 0; i < bays; i++) {
      const b0 = a0 + i * w, b1 = b0 + w;
      if (!free(b0, b1)) continue;
      if (style === 'band') {
        if (o.spandrel) onFace(A, o.spandrel, f, b0, b1, yb + 0.45, yb + h * 0.32, 0, 0.05);
        onFace(A, M.glass, f, b0 + 0.25, b1 - 0.25, yb + h * 0.32, yt - 0.55, 0, 0.04);
        onFace(A, M.pier, f, b0 - 0.2, b0 + 0.2, yb + 0.45, yt - 0.15, 0, 0.12);
      } else if (style === 'punched') {
        const m = Math.min(0.9, w * 0.2);
        onFace(A, M.glass, f, b0 + m, b1 - m, yb + h * 0.3, yt - 0.7, 0, 0.04);
      } else if (style === 'corridor') {
        if (k === 0) onFace(A, M.glass, f, b0 + 0.6, b1 - 0.6, yb + 0.8, yt - 0.6, 0, 0.04);
        else {
          onFace(A, M.dark, f, b0 + 0.2, b1 - 0.2, yb + 1.2, yt - 0.3, 0, 0.03);
          onFace(A, M.pier, f, b0 - 0.2, b0 + 0.2, yb + 0.45, yt - 0.15, 0, 0.12);
        }
      }
    }
    if (style !== 'corridor' || k === 0) continue;
    onFace(A, M.band, f, a0, a1, yb + 0.45, yb + 1.15, 0, 0.18);           // walkway parapet
  }
  const top = y0 + G + (n - 1) * FL;
  onFace(A, M.band, f, a0 - 0.15, a1 + 0.15, top - 0.15, top + 0.9, 0, 0.3); // roof parapet
}

// rectangular block x0..x1 / z0..z1 with a facade on every face; faces: { n, s, e, w } override o per face
// (false = no facade, e.g. where another block abuts)
export function block(A, x0, x1, z0, z1, o, faces = {}) {
  const { y0 = 0, G = 3.8, FL = 3.6, n = 1, roof = 'roof' } = o;
  const top = y0 + G + (n - 1) * FL;
  A.box(o.mats?.wall || 'wall', x0, x1, y0, top, z0, z1);
  const list = { n: [F('z', z0, -1), x0, x1], s: [F('z', z1, 1), x0, x1], w: [F('x', x0, -1), z0, z1], e: [F('x', x1, 1), z0, z1] };
  for (const [k, [f, a0, a1]] of Object.entries(list)) {
    if (faces[k] === false) continue;
    facade(A, f, a0, a1, { ...o, ...(faces[k] || {}) });
  }
  if (roof) A.box(roof, x0 + 0.3, x1 - 0.3, top, top + 0.12, z0 + 0.3, z1 - 0.3);
  return top;
}

// hipped roof over x0..x1 / z0..z1 from eave height y, rising h; ridge along the longer side (a pyramid when square)
export function hip(A, m, x0, x1, z0, z1, y, h, eave = 0.6) {
  x0 -= eave; x1 += eave; z0 -= eave; z1 += eave;
  const t = y + h, alongX = x1 - x0 >= z1 - z0, r = (alongX ? z1 - z0 : x1 - x0) / 2;
  const a = alongX ? [x0 + r, t, (z0 + z1) / 2] : [(x0 + x1) / 2, t, z0 + r];
  const b = alongX ? [x1 - r, t, (z0 + z1) / 2] : [(x0 + x1) / 2, t, z1 - r];
  const p00 = [x0, y, z0], p10 = [x1, y, z0], p11 = [x1, y, z1], p01 = [x0, y, z1];
  if (alongX) {
    A.quad(m, p10, p00, a, b); A.quad(m, p01, p11, b, a); A.tri(m, p00, p01, a); A.tri(m, p11, p10, b);
  } else {
    A.quad(m, p00, p01, b, a); A.quad(m, p11, p10, a, b); A.tri(m, p10, p00, a); A.tri(m, p01, p11, b);
  }
  A.box(m, x0, x1, y - 0.25, y, z0, z1);
}

// rows of solar panels over x0..x1 / z0..z1 at height y (panels run along x)
export function solar(A, x0, x1, z0, z1, y, m = 'solar') {
  for (let z = z0 + 0.6; z < z1 - 1.8; z += 2.3)
    for (let x = x0 + 0.6; x < x1 - 1.6; x += 2.1) A.box(m, x, x + 1.9, y + 0.25, y + 0.42, z, z + 1.8);
}

// materials by name: '#hex', or an object of MeshStandardMaterial options. 'glass' and 'brick' get the shared
// textures (glass lights up at night).
export function mats(spec) {
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const M = {};
  for (const [k, v] of Object.entries(spec)) {
    const o = typeof v === 'string' ? { color: v } : v;
    if (k.startsWith('glass')) M[k] = std({ color: '#5f7380', map: glassTex(false), roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: glassTex(true), emissiveIntensity: 0, ...o });
    else if (k.startsWith('brick')) M[k] = std({ color: '#b5533c', map: brickTex(), roughness: 0.95, ...o });
    else M[k] = std(o);
  }
  return M;
}

// one mesh per material bucket, tagged so picking/highlighting treats them as building `owner`
export function meshes(A, MAT, owner) {
  const out = [];
  for (const [k, B] of Object.entries(A.b)) {
    if (!MAT[k]) throw new Error('no material ' + k);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    g.computeBoundingSphere();
    g.userData.owner = new Int32Array(B.p.length / 9).fill(owner);
    const mesh = new THREE.Mesh(g, MAT[k]);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.kind = 'building';
    out.push(mesh);
  }
  return out;
}

// the usual palette; models add or override entries
export const BASE_MATS = {
  wall: '#ece6d8', band: '#f3f1ec', glass: {}, brick: {}, dark: '#4a4d50', roof: '#a3a29d', solar: { color: '#2a3550', roughness: 0.35, metalness: 0.3 },
  paving: { color: '#c7c2b8', roughness: 1 }, metal: { color: '#b9bcbd', roughness: 0.5, metalness: 0.4 },
};
