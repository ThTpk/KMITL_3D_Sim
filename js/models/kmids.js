// Hand-built model of โรงเรียนสาธิตนานาชาติพระจอมเกล้าลาดกระบัง (KMIDS, OSM way 1008793634).
// Surveyed 2026-10-17 from Google Maps satellite imagery (the main block with solar arrays on its roof, the
// stepped seating along its south side, the low south wing, the stairs at the east end) and a 360° photo at the
// north gate (the north face from the drop-off, looking up). Every Street View car pano here predates the school
// (it shows a pond on the site). The south and west faces and the storey count were reworked 2026-10-19 from a
// photo the user took across the swimming pool to the south-west. Photos were only looked at; everything here is
// procedural.
//
// x = east, z = south, y = up. Main block x -227..-141, z -370..-337 (roof traced on the imagery, moved south
// for the lean).
//   ground floor dark grey, set back; second floor red brick with white-framed windows on square columns
//   five upper floors of glass; on the north face behind a folded white frame: every slab edge zig-zags out and in,
//   and diagonal struts join the points of one floor to the next, so the face reads as a lattice of diamonds
//   south face: a pale pink rendered bay with punched windows at each end (the west one standing forward), between
//   them a screen of terracotta vertical fins whose depth swells and shrinks in waves over floors 2-5, and the top two
//   floors glazed behind white V struts under the roof; the west and east ends pale pink render with punched windows
//   thin steel roof overhanging on all sides, rising to the north, with the gold KMIDS sign on its fascia;
//   solar panel rows on top
//   north-west: a deep canopy over the drop-off on slanted steel columns
//   south: stepped seating down to the garden, a low two-storey wing x -189..-146, z -333..-324
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex, textTex } from './ecc.js';

const X0 = -227, X1 = -141, ZN = -370, ZS = -337, G = 4.0, L2 = 7.6, FL = 3.8, NUP = 5;
const TOP = L2 + NUP * FL;                                       // 26.6, seven storeys

export function buildKmids(owner) {
  const A = new Acc();
  const F = (ax, at, out) => ({ ax, at, out });
  const N = F('z', ZN, -1), S = F('z', ZS, 1), W = F('x', X0, -1), E = F('x', X1, 1);

  // ---- ground floor (set back) and brick second floor on columns ----
  A.box('dark', X0 + 2, X1 - 2, 0, G, ZN + 2, ZS - 2);
  for (let x = X0 + 0.5; x <= X1 - 0.4; x += 7.2) for (const z of [ZN + 0.5, ZS - 0.5]) A.box('column', x - 0.35, x + 0.35, 0, G, z - 0.35, z + 0.35);
  A.box('slab', X0, X1, G - 0.3, G + 0.2, ZN, ZS);
  A.box('brick', X0, X1, G + 0.2, L2, ZN + 0.3, ZS - 0.3);
  for (const [f, a0, a1] of [[N, X0, X1], [S, X0, X1], [W, ZN, ZS], [E, ZN, ZS]]) {
    for (let a = a0 + 1.5; a < a1 - 1; a += 3.6) {
      onFace(A, 'frame', f, a - 0.15, a + 1.05, G + 0.9, L2 - 0.6, -0.3, -0.24);
      onFace(A, 'glass', f, a, a + 0.9, G + 1.05, L2 - 0.75, -0.24, -0.2);
    }
    for (let a = a0; a <= a1 + 0.01; a += 7.2) onFace(A, 'slab', f, Math.max(a0, a - 0.25), Math.min(a1, a + 0.25), G + 0.2, L2, -0.3, 0.05);
  }
  A.box('slab', X0 - 0.4, X1 + 0.4, L2 - 0.1, L2 + 0.25, ZN - 0.4, ZS + 0.4);

  // ---- upper floors: glass box behind a folded white frame ----
  A.box('glass', X0 + 0.3, X1 - 0.3, L2, TOP, ZN + 0.3, ZS - 0.3);
  const P = 6.0, OUT = 1.6;                                      // zig-zag period along the face, depth out
  // zig-zag slab edges and diamond struts on a face running along 'x' (north/south) or 'z' (east/west)
  const folded = (f, a0, a1, kMin = 0) => {
    const pt = (a, k, out) => {                                  // point on the face at position a, floor k
      const y = L2 + k * FL, d = f.at + f.out * out;
      return f.ax === 'z' ? [a, y, d] : [d, y, a];
    };
    for (let k = kMin; k <= NUP; k++) {
      const ph = (k % 2) * P / 2;                                 // alternate floors shift by half a period
      for (let a = a0 - ph; a < a1; a += P) {
        const s0 = Math.max(a0, a), s1 = Math.min(a1, a + P / 2), s2 = Math.min(a1, a + P);
        if (s1 <= s0) continue;
        // triangular slab plate: base on the wall, point out
        const tip = Math.max(a0, Math.min(a1, a + P / 2));
        const base0 = pt(s0, k, 0), base1 = pt(s2, k, 0), apex = pt(tip, k, OUT);
        const up = (p) => [p[0], p[1] + 0.22, p[2]];
        const tri = (a, b, c) => { A.tri('white', a, b, c); A.tri('white', c, b, a); };
        tri(base0, apex, base1); tri(up(base0), up(apex), up(base1));
        A.quad('white', base0, apex, up(apex), up(base0)); A.quad('white', apex, base1, up(base1), up(apex));
        A.quad('white', up(base0), up(apex), apex, base0); A.quad('white', up(apex), up(base1), base1, apex);
        // struts from this tip to the two tips of the floor above (half a period either side)
        if (k < NUP) for (const s of [-1, 1]) {
          const t2 = tip + s * P / 2;
          if (t2 < a0 || t2 > a1) continue;
          const p = pt(tip, k, OUT), q = pt(t2, k + 1, OUT);
          const n = 6;
          for (let i = 0; i < n; i++) {
            const u0 = i / n, u1 = (i + 1) / n;
            const a = [p[0] + (q[0] - p[0]) * u0, p[1] + (q[1] - p[1]) * u0, p[2] + (q[2] - p[2]) * u0];
            const b = [p[0] + (q[0] - p[0]) * u1, p[1] + (q[1] - p[1]) * u1, p[2] + (q[2] - p[2]) * u1];
            A.box('white', Math.min(a[0], b[0]) - 0.09, Math.max(a[0], b[0]) + 0.09, Math.min(a[1], b[1]), Math.max(a[1], b[1]), Math.min(a[2], b[2]) - 0.09, Math.max(a[2], b[2]) + 0.09);
          }
        }
      }
    }
  };
  folded(N, X0, X1);
  // ---- south, west and east: pink render bays with punched windows, a wavy terracotta fin screen between ----
  const SB0 = X0 + 14, SB1 = X1 - 18;                                     // fin-screen span on the south face
  const pinkBay = (x0, x1, z0, z1) => {                                   // a rendered block from the slab up to the roof
    A.box('pink', x0, x1, G + 0.2, TOP + 0.6, z0, z1);
    for (const [f, a0, a1] of [[F('z', z1, 1), x0, x1], [F('x', x0, -1), z0, z1], [F('x', x1, 1), z0, z1]]) {
      const n = Math.max(1, Math.round((a1 - a0) / 4.2));
      for (let k = 0; k <= NUP; k++) {
        const yb = k === 0 ? G + 0.2 : L2 + (k - 1) * FL, yt = k === 0 ? L2 : L2 + k * FL;
        for (let i = 0; i < n; i++) {
          const a = a0 + ((i + 0.5) * (a1 - a0)) / n;
          onFace(A, 'glass', f, a - 0.75, a + 0.75, yb + 1.0, yt - 0.9, 0, 0.04);
          onFace(A, 'frame', f, a - 0.85, a + 0.85, yb + 0.9, yb + 1.0, 0, 0.12);
        }
      }
    }
  };
  pinkBay(X0 - 1.5, SB0, ZS - 10, ZS + 1.5);                              // west bay stands forward
  pinkBay(SB1, X1, ZS - 8, ZS);
  pinkBay(X0, X0 + 0.6, ZN, ZS - 10);                                     // west end
  pinkBay(X1 - 0.6, X1, ZN, ZS - 8);                                      // east end
  // fin screen over floors 2-5: depth swells and shrinks in waves along the face and up it
  const yF0 = G + 0.2, yF1 = L2 + 3 * FL;
  A.box('dark', SB0, SB1, yF0, yF1, ZS - 0.4, ZS - 0.3);
  for (let x = SB0 + 0.3, i = 0; x < SB1; x += 0.7, i++) {
    for (let j = 0; j < 6; j++) {
      const y0 = yF0 + ((yF1 - yF0) * j) / 6, y1 = yF0 + ((yF1 - yF0) * (j + 1)) / 6;
      const d = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(x * 0.32 + j * 0.55));
      A.box('fin', x - 0.08, x + 0.08, y0, y1, ZS - 0.3, ZS - 0.3 + d);
    }
  }
  // top two floors glazed behind white V struts
  folded(F('z', ZS, 1), SB0, SB1, NUP - 2);

  // ---- thin steel roof, rising to the north, overhanging; solar rows; sign ----
  const yS = TOP + 0.9, yN = TOP + 2.6, OV = 3.0;
  const ry = (z) => yS + (yN - yS) * (ZS + OV - z) / (ZS - ZN + 2 * OV);
  A.quad('roofSteel', [X0 - OV, ry(ZS + OV), ZS + OV], [X1 + OV, ry(ZS + OV), ZS + OV], [X1 + OV, ry(ZN - OV), ZN - OV], [X0 - OV, ry(ZN - OV), ZN - OV]);
  A.quad('roofSoffit', [X0 - OV, ry(ZN - OV) - 0.05, ZN - OV], [X1 + OV, ry(ZN - OV) - 0.05, ZN - OV], [X1 + OV, ry(ZS + OV) - 0.05, ZS + OV], [X0 - OV, ry(ZS + OV) - 0.05, ZS + OV]);
  A.box('fascia', X0 - OV, X1 + OV, ry(ZN - OV) - 1.4, ry(ZN - OV), ZN - OV - 0.15, ZN - OV);
  A.box('fascia', X0 - OV, X1 + OV, ry(ZS + OV) - 0.6, ry(ZS + OV), ZS + OV, ZS + OV + 0.15);
  for (const x of [X0 - OV, X1 + OV - 0.15]) A.box('fascia', x, x + 0.15, yS - 0.6, yN, ZN - OV, ZS + OV);
  for (let x = X0 + 2; x < X1 - 2; x += 5.5)
    for (let z = ZN + 2; z < ZS - 3; z += 4.4) A.box('solar', x, x + 4.6, ry(z) + 0.15, ry(z) + 0.3, z, z + 3.6);
  for (let x = X0 + 6; x < X1 - 4; x += 14) for (const z of [ZN + 4, ZS - 4]) A.box('column', x - 0.15, x + 0.15, TOP, ry(z), z - 0.15, z + 0.15);

  // ---- north-west drop-off canopy on slanted steel columns ----
  {
    const cx0 = X0 - 6, cx1 = -192, cz0 = ZN - 11, cz1 = ZN;
    A.box('slab', cx0, cx1, 7.2, 8.0, cz0, cz1);
    A.box('roofSoffit', cx0, cx1, 7.15, 7.2, cz0, cz1, false);
    for (const x of [cx0 + 3, (cx0 + cx1) / 2, cx1 - 3]) {
      for (const s of [-1, 1]) {
        const p = [x, 0, cz0 + 4], q = [x + s * 3, 7.2, cz0 + 1.5];
        const n = 7;
        for (let i = 0; i < n; i++) {
          const u0 = i / n, u1 = (i + 1) / n;
          const a = [p[0] + (q[0] - p[0]) * u0, p[1] + (q[1] - p[1]) * u0, p[2] + (q[2] - p[2]) * u0];
          const b = [p[0] + (q[0] - p[0]) * u1, p[1] + (q[1] - p[1]) * u1, p[2] + (q[2] - p[2]) * u1];
          A.box('steel', Math.min(a[0], b[0]) - 0.16, Math.max(a[0], b[0]) + 0.16, a[1], b[1], Math.min(a[2], b[2]) - 0.16, Math.max(a[2], b[2]) + 0.16);
        }
      }
    }
  }

  // ---- south: stepped seating down to the garden, low two-storey wing ----
  for (let s = 0; s < 8; s++) A.box('step', -222, -150, 0, G - s * 0.5, ZS, ZS + 0.8 * (s + 1));
  {
    const x0 = -189, x1 = -146, z0 = -333, z1 = -324, H = 8.0, SW = F('z', z1, 1);
    A.box('wing', x0, x1, 0, H, z0, z1);
    for (let k = 0; k < 2; k++) for (let x = x0 + 1.5; x < x1 - 1; x += 3.6) onFace(A, 'glass', SW, x, x + 2.2, k * 4 + 1.0, k * 4 + 3.0, 0, 0.05);
    A.box('roofLight', x0 - 0.3, x1 + 0.3, H, H + 0.3, z0 - 0.3, z1 + 0.3);
  }
  // stairs at the east end
  for (let s = 0; s < 10; s++) A.box('step', X1, X1 + 1.0 + s * 0.6, 0, L2 - s * 0.76, ZN + 8, ZN + 12);

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    dark: std({ color: '#5a5f63', roughness: 0.8 }),
    column: std({ color: '#6c7176', roughness: 0.6, metalness: 0.3 }),
    slab: std({ color: '#c9ccce', roughness: 0.8 }),
    brick: std({ color: '#b5684e', map: brick, roughness: 0.95 }),
    frame: std({ color: '#f2f2f0', roughness: 0.6 }),
    glass: std({ color: '#3e5260', map: gDay, roughness: 0.25, metalness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    white: std({ color: '#e9ebec', roughness: 0.55, metalness: 0.2 }),
    roofSteel: std({ color: '#b8bcbf', roughness: 0.5, metalness: 0.5, side: THREE.DoubleSide }),
    roofSoffit: std({ color: '#8e9396', roughness: 0.7, side: THREE.DoubleSide }),
    fascia: std({ color: '#d7dadc', roughness: 0.5, metalness: 0.4 }),
    solar: std({ color: '#283551', roughness: 0.35, metalness: 0.3 }),
    steel: std({ color: '#9ea4a8', roughness: 0.45, metalness: 0.6 }),
    step: std({ color: '#c3c1bb', roughness: 1 }),
    wing: std({ color: '#ecebe7' }),
    roofLight: std({ color: '#d9d8d3', roughness: 0.9 }),
    pink: std({ color: '#ecd9d2' }),
    fin: std({ color: '#9a5b3f', roughness: 0.8 }),
  };
  const meshes = [];
  const add = (g, mat) => {
    g.computeBoundingSphere();
    g.userData.owner = new Int32Array(g.attributes.position.count / 3).fill(owner);
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.kind = 'building';
    meshes.push(mesh);
  };
  for (const [k, B] of Object.entries(A.b)) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    add(g, MAT[k]);
  }
  // gold KMIDS sign on the north fascia (faces north: viewer looks south, east on the left)
  {
    const z = ZN - OV - 0.17, y1 = ry(ZN - OV) - 0.1, y0 = y1 - 1.25, xe = -168, xw = -202;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([xe, y0, z, xw, y0, z, xw, y1, z, xe, y0, z, xw, y1, z, xe, y1, z], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: textTex('KMIDS  International Demonstration School', { color: '#d4a63a', h: 150, font: 'Arial', weight: 700 }), transparent: true, alphaTest: 0.3, metalness: 0.4, roughness: 0.4 }));
  }
  return { meshes, top: yN + 0.5 };
}

// Ground outline (OSM way 1008793634)
export const KMIDS_OUTLINE = [[-235.3, -361.3], [-229.7, -361.3], [-229.7, -369.9], [-149.9, -369.9], [-149.9, -356.6], [-136.5, -356.6], [-136.4, -342.2], [-136.7, -322.5], [-228.7, -322.5], [-228.7, -325.3], [-235.3, -325.3], [-235.3, -361.3]];
