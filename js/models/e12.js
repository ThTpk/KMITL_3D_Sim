// Hand-built model of the Engineering Classroom Complex, 12 floors (อาคารเรียนรวม คณะวิศวกรรมศาสตร์ 12 ชั้น).
// Surveyed 2026-10-16: Google Street View from the road north of the railway (whole north face) and from
// the south entrance under the podium, Esri World Imagery for the plan and roof colours.
// Photos were only looked at; everything here is procedural geometry.
//
// Built axis-aligned in local metres around the OSM centroid, then turned -1.83° to the OSM outline
// (way 516204086). x = east, z = south, y = up.
//   tower slab   x -650..-563   z 10.9..35   12 floors, salmon concrete, deep floor bands, ribbon windows
//                                             with recessed AC balconies; gold banner panel on the west wing
//   core         x -614.3..-601.7, projects 1.3 m north, rises above the roof, slit windows, blue sign
//   east stair   x -563..-557   one floor lower, set back
//   podium       x -647..-575   z 35..87.5   3 storeys under four red hipped roofs round a small court;
//                                             south front on raked columns over a tall undercroft, lettering
import * as THREE from 'three';
import { Acc, onFace, glassTex, brickTex, textTex } from './ecc.js';

const PIV = [-603.2, 49.3], ROT = Math.atan2(-2.97, 93.02); // OSM north edge direction
const G = 6.0, FL = 3.75;                                    // ground floor height, typical floor
const lvY = (k) => (k <= 1 ? 0 : G + (k - 2) * FL);          // bottom of level k (13 = roof slab)
const ROOF = lvY(13);                                        // 47.25

// triangle with its normal forced away from `ref` (used for the pitched roofs)
function triOut(A, m, a, b, c, ref) {
  const n = [
    (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]),
    (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]),
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]),
  ];
  const d = (a[0] - ref[0]) * n[0] + (a[1] - ref[1]) * n[1] + (a[2] - ref[2]) * n[2];
  if (d < 0) A.tri(m, a, c, b); else A.tri(m, a, b, c);
}
// hipped roof over x0..x1, z0..z1 from eave y up h, ridge along the long side, with eave overhang o
function hipRoof(A, m, x0, x1, z0, z1, y, h, o = 0.9) {
  x0 -= o; x1 += o; z0 -= o; z1 += o;
  const w = x1 - x0, d = z1 - z0, xm = (x0 + x1) / 2, zm = (z0 + z1) / 2, yt = y + h;
  const ref = [xm, y - 1, zm];
  const c = [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
  let r0, r1;
  if (w >= d) { r0 = [x0 + d / 2, yt, zm]; r1 = [x1 - d / 2, yt, zm]; } else { r0 = [xm, yt, z0 + w / 2]; r1 = [xm, yt, z1 - w / 2]; }
  if (w >= d) {
    triOut(A, m, c[0], c[1], r1, ref); triOut(A, m, c[0], r1, r0, ref); // north slope
    triOut(A, m, c[3], c[2], r1, ref); triOut(A, m, c[3], r1, r0, ref); // south slope
    triOut(A, m, c[0], c[3], r0, ref); triOut(A, m, c[1], c[2], r1, ref); // hips
  } else {
    triOut(A, m, c[0], c[3], r1, ref); triOut(A, m, c[0], r1, r0, ref);
    triOut(A, m, c[1], c[2], r1, ref); triOut(A, m, c[1], r1, r0, ref);
    triOut(A, m, c[0], c[1], r0, ref); triOut(A, m, c[3], c[2], r1, ref);
  }
  A.quad('soffit', c[0], c[1], c[2], c[3]); // underside of the eaves
}
// slanted box: bottom rectangle centred at (xb, zb), top centred at (xt, zt), size sx * sz
function rake(A, m, xb, zb, xt, zt, y0, y1, sx, sz) {
  const P = (x, y, z, i, j) => [x + (i - 0.5) * sx, y, z + (j - 0.5) * sz];
  const b = [P(xb, y0, zb, 0, 0), P(xb, y0, zb, 1, 0), P(xb, y0, zb, 1, 1), P(xb, y0, zb, 0, 1)];
  const t = [P(xt, y1, zt, 0, 0), P(xt, y1, zt, 1, 0), P(xt, y1, zt, 1, 1), P(xt, y1, zt, 0, 1)];
  const ref = [(xb + xt) / 2, (y0 + y1) / 2, (zb + zt) / 2];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    triOut(A, m, b[i], b[j], t[j], ref); triOut(A, m, b[i], t[j], t[i], ref);
  }
}

// one face of the tower slab: deep salmon floor bands, ribbon of dark windows with recessed AC balconies
function slabFace(A, f, { skip = [], banner = null } = {}) {
  const inSkip = (a0, a1) => skip.some(([s0, s1]) => a1 > s0 && a0 < s1);
  // ground floor: recessed dark glazing behind square piers
  onFace(A, 'shade', f, f.a0, f.a1, 0.3, G, -2.4, -2.38);
  for (let a = f.a0 + 0.8; a < f.a1 - 2; a += 4.4) if (!inSkip(a, a + 3)) onFace(A, 'glass', f, a + 0.4, a + 3.6, 0.6, G - 1.0, -2.38, -2.3);
  for (let a = f.a0; a <= f.a1 + 0.01; a += 8.8) if (!inSkip(a - 0.4, a + 0.4)) onFace(A, 'wall', f, Math.max(f.a0, a - 0.4), Math.min(f.a1, a + 0.4), 0, G, -2.4, 0);
  for (let k = 2; k <= 12; k++) {
    const y = lvY(k), top = lvY(k + 1);
    for (const [a0, a1] of spans(f.a0, f.a1, skip)) {
      onFace(A, 'band', f, a0, a1, y - 0.35, y + 1.15, 0, 0.75);          // deep spandrel / floor band
      onFace(A, 'recess', f, a0, a1, y + 1.15, top - 0.35, 0, 0.02);      // recessed wall behind the windows
      let i = 0;
      for (let a = a0 + 0.5; a + 4.0 <= a1; a += 4.4, i++) {
        if (banner && k >= banner.k0 && a + 4 > banner.a0 && a < banner.a1) continue;
        if ((i + k) % 4 === 3) {                                          // recessed balcony with an AC unit
          onFace(A, 'rail', f, a + 0.2, a + 3.8, y + 1.15, y + 1.9, 0.5, 0.55);
          onFace(A, 'ac', f, a + 0.6, a + 1.5, y + 1.15, y + 1.85, 0.05, 0.6);
        } else {
          onFace(A, 'glass', f, a + 0.3, a + 3.7, y + 1.45, top - 0.6, 0, 0.05);
        }
      }
    }
  }
  onFace(A, 'band', f, f.a0, f.a1, ROOF - 0.35, ROOF + 1.2, 0, 0.5); // parapet band
  if (banner) onFace(A, 'gold', f, banner.a0, banner.a1, lvY(banner.k0) - 0.2, lvY(12) + 2.2, 0.8, 0.9);
}
function spans(a0, a1, skip) {
  const out = [];
  let s = a0;
  for (const [k0, k1] of [...skip].sort((p, q) => p[0] - q[0])) { if (k0 > s) out.push([s, Math.min(k0, a1)]); s = Math.max(s, k1); }
  if (s < a1) out.push([s, a1]);
  return out;
}

function signTex() {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 300;
  const g = cv.getContext('2d');
  g.fillStyle = '#2f5fae'; g.fillRect(0, 0, 1024, 300);
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '600 74px "IBM Plex Sans Thai", sans-serif'; g.fillText('คณะวิศวกรรมศาสตร์', 512, 70);
  g.font = '700 150px "IBM Plex Sans Thai", sans-serif'; g.fillText('วิศวลาดกระบัง', 512, 200);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function buildE12(owner) {
  const A = new Acc();
  const SL = [-650, -563, 10.9, 35];        // tower slab
  const CO = [-614.3, -601.7, 9.6];          // core x range, north face
  const ES = [-563, -557, 12.4, 33.5];       // east stair bay
  const CT = ROOF + 6.3;                     // core top

  // ===== tower slab =====
  A.box('wall', SL[0], SL[1], G, ROOF, SL[2], SL[3]);
  A.box('wall', SL[0], SL[1], 0, G, SL[2] + 2.4, SL[3] - 2.4); // ground floor set back behind the piers
  A.box('soffit', SL[0], SL[1], G - 0.3, G, SL[2], SL[3], false);
  const N = { ax: 'z', at: SL[2], out: -1, a0: SL[0], a1: SL[1] };
  const S = { ax: 'z', at: SL[3], out: 1, a0: SL[0], a1: SL[1] };
  slabFace(A, N, { skip: [[CO[0] - 0.4, CO[1] + 0.4]], banner: { a0: -637.5, a1: -629.5, k0: 9 } });
  slabFace(A, S);
  // plain end walls with a slit window by the north face
  for (const [x, out] of [[SL[0], -1], [ES[1], 1]]) {
    const f = { ax: 'x', at: x, out, a0: SL[2], a1: SL[3] };
    onFace(A, 'glass', f, 15.0, 16.2, G + 1, (x === SL[0] ? ROOF : lvY(12)) - 1.5, 0, 0.05);
    onFace(A, 'band', f, SL[2], SL[3], G - 0.4, G + 0.2, 0, 0.2);
  }
  onFace(A, 'band', { ax: 'x', at: SL[0], out: -1 }, SL[2], SL[3], ROOF - 0.35, ROOF + 1.2, 0, 0.3);
  // east stair bay, one floor lower and set back, slit windows on both long faces
  A.box('wall', ES[0], ES[1], 0, lvY(12), ES[2], ES[3]);
  for (const [z, out] of [[ES[2], -1], [ES[3], 1]]) onFace(A, 'glass', { ax: 'z', at: z, out }, -561.5, -560.3, G + 1, lvY(12) - 1.5, 0, 0.05);
  A.box('roofLight', ES[0], ES[1] - 0.2, lvY(12), lvY(12) + 0.12, ES[2] + 0.2, ES[3] - 0.2);

  // ===== core: projects from the north face and rises above the roof =====
  A.box('core', CO[0], CO[1], 0, CT, CO[2], 20);
  A.box('core', CO[0], CO[1], ROOF, CT - 0.8, 20, 27);
  const CF = { ax: 'z', at: CO[2], out: -1 };
  for (const a of [CO[0] + 0.6, CO[1] - 1.5]) onFace(A, 'glass', CF, a, a + 0.9, G + 0.5, CT - 3.2, 0, 0.05); // edge slits
  for (let k = 2; k <= 12; k++) onFace(A, 'glass', CF, -609.1, -606.9, lvY(k) + 1.3, lvY(k) + 2.7, 0, 0.05);
  for (const a of [CO[0] + 2.2, CO[1] - 3.0]) onFace(A, 'wall', CF, a, a + 0.8, G, CT - 3.2, 0, 0.25);     // fins
  A.box('roofLight', CO[0] + 0.2, CO[1] - 0.2, CT, CT + 0.12, CO[2] + 0.2, 19.8);

  // ===== roof =====
  A.box('roofLight', SL[0] + 0.3, SL[1] - 0.3, ROOF, ROOF + 0.12, SL[2] + 0.3, SL[3] - 0.3);
  for (const [x0, z0] of [[-640, 18], [-628, 25], [-590, 18], [-578, 25]]) A.box('wall', x0, x0 + 5, ROOF, ROOF + 2.6, z0, z0 + 4); // plant rooms
  for (const [x, z, h] of [[-646, 14, 6], [-571, 13.5, 4.5]]) A.cyl('rail', x, z, 0.08, ROOF, ROOF + h, 6);
  A.cyl('ac', -621, 15.5, 0.9, ROOF + 1.6, ROOF + 1.75, 12);                                     // dish
  A.cyl('rail', -621, 15.5, 0.1, ROOF, ROOF + 1.6, 6);

  // ===== podium: four pavilions under red hipped roofs round a small court =====
  const HP = 14.0;
  const PAV = [[-647, -622.5, 35, 59], [-602, -575, 35, 59], [-643, -614, 59, 87.5], [-609, -579, 59, 87.5]];
  for (const [x0, x1, z0, z1] of PAV) {
    const under = z1 === 87.5; // south pavilions stand over the undercroft
    A.box('wall', x0, x1, under ? 7.0 : 0, HP, z0, z1);
    if (under) A.box('wall', x0, x1, 0, 7.0, z0, z1 - 5.4);
    hipRoof(A, 'roofRed', x0, x1, z0, z1, HP, Math.min(x1 - x0, z1 - z0) * 0.15);
    const faces = [
      { ax: 'x', at: x0, out: -1, a0: z0, a1: z1 }, { ax: 'x', at: x1, out: 1, a0: z0, a1: z1 },
      { ax: 'z', at: z0, out: -1, a0: x0, a1: x1 },
    ];
    for (const f of faces) {
      if (f.ax === 'z' && f.at === 35) continue; // against the tower
      for (const [y0, y1] of [[1.0, 3.2], [4.6, 6.6], [8.4, 10.4]]) for (let a = f.a0 + 1.2; a + 2.6 <= f.a1 - 0.8; a += 3.6) onFace(A, 'glass', f, a, a + 2.6, y0, y1, 0, 0.05);
      for (const y of [3.8, 7.4, 11.2]) onFace(A, 'band', f, f.a0, f.a1, y - 0.3, y + 0.5, 0, 0.45);
      onFace(A, 'brick', f, f.a0 + 0.6, f.a1 - 0.6, 11.7, HP - 0.4, 0, 0.04);
    }
  }
  // flat link roofs between the pavilions, entrance hall on the axis, lawn court
  A.box('wall', -622.5, -602, 0, 11.0, 35, 39);
  A.box('roofLight', -622.5, -602, 11.0, 11.12, 35, 39);
  A.box('wall', -614, -609, 0, HP - 1, 59, 87.5);
  A.box('roofLight', -614.2, -608.8, HP - 1, HP - 0.88, 58.8, 87.5);
  A.box('lawn', -622.5, -602, 0.02, 0.1, 39, 59);
  A.box('wall', -622.5, -614, 0, 7.4, 58, 59); A.box('wall', -609, -602, 0, 7.4, 58, 59);

  // south front: tall undercroft behind raked columns, cantilevered band, brick panels with lettering
  const ZS = 87.5;
  for (const [x0, x1] of [[-643, -614], [-609, -579]]) {
    const F = { ax: 'z', at: ZS, out: 1 };
    A.box('soffit', x0, x1, 6.9, 7.0, ZS - 5.4, ZS, false);       // coffered ceiling of the undercroft
    for (let x = x0 + 2.5; x < x1 - 1; x += 3.2) A.box('soffit', x, x + 0.35, 6.4, 7.0, ZS - 5, ZS);
    onFace(A, 'glass', { ax: 'z', at: ZS - 5.4, out: 1 }, x0 + 1, x1 - 1, 0.8, 6.2, 0, 0.05);
    // over-the-undercroft levels set out to the front line
    onFace(A, 'band', F, x0, x1, 7.0, 8.4, 0, 0.6);
    onFace(A, 'glass', F, x0 + 0.6, x1 - 0.6, 8.4, 10.6, 0, 0.05);
    onFace(A, 'band', F, x0, x1, 10.6, 11.6, 0, 0.9);
    onFace(A, 'brick', F, x0 + 0.6, x1 - 0.6, 11.6, HP - 0.5, 0, 0.04);
    onFace(A, 'band', F, x0, x1, HP - 0.5, HP + 0.3, 0, 0.6);
    // A-shaped pairs of raked columns
    const n = Math.round((x1 - x0) / 9.5), bw = (x1 - x0) / n;
    for (let i = 0; i <= n; i++) {
      const xc = x0 + i * bw;
      if (i < n) { rake(A, 'wall', xc + 1.2, ZS - 0.6, xc + bw / 2 - 0.6, ZS - 0.5, 0, 7.0, 0.9, 0.9); rake(A, 'wall', xc + bw - 1.2, ZS - 0.6, xc + bw / 2 + 0.6, ZS - 0.5, 0, 7.0, 0.9, 0.9); }
      A.box('wall', xc - 0.5, xc + 0.5, 0, 7.0, ZS - 1.0, ZS);
    }
  }
  // entrance steps and the plinth along the front
  for (let s = 0; s < 4; s++) A.box('paving', -616, -606, 0, 0.9 - s * 0.22, ZS - 5, ZS + 0.4 + s * 0.45);
  A.box('paving', -643, -579, 0, 0.5, ZS - 5, ZS);

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    wall: std({ color: '#ebc2a8' }),
    band: std({ color: '#f0cdb6' }),
    core: std({ color: '#efc6ac' }),
    shade: std({ color: '#a8887a' }),
    recess: std({ color: '#e2b49b' }),
    glass: std({ color: '#3d5470', map: gDay, roughness: 0.35, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    rail: std({ color: '#6c6f72', roughness: 0.5, metalness: 0.4 }),
    ac: std({ color: '#e4e4e0' }),
    gold: std({ color: '#d1ad55', roughness: 0.6 }),
    brick: std({ color: '#c49a85', map: brick, roughness: 0.95 }),
    soffit: std({ color: '#e4cdb8', roughness: 0.95, side: THREE.DoubleSide, emissive: new THREE.Color('#3f342c') }),
    paving: std({ color: '#c9bfb3', roughness: 1 }),
    lawn: std({ color: '#7c9a5a', roughness: 1 }),
    roofLight: std({ color: '#cfcac2', roughness: 0.9 }),
    roofRed: std({ color: '#d0583f', roughness: 0.8, side: THREE.DoubleSide }),
  };
  // turn everything onto the OSM outline
  const c = Math.cos(ROT), s = Math.sin(ROT);
  const rot = (arr, isPos) => {
    for (let i = 0; i < arr.length; i += 3) {
      const dx = arr[i] - (isPos ? PIV[0] : 0), dz = arr[i + 2] - (isPos ? PIV[1] : 0);
      arr[i] = (isPos ? PIV[0] : 0) + dx * c - dz * s;
      arr[i + 2] = (isPos ? PIV[1] : 0) + dx * s + dz * c;
    }
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
    rot(B.p, true); rot(B.n, false);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    add(g, MAT[k]);
  }
  // signs: blue core sign facing north, lettering on the podium's south band
  const sign = (tex, pts) => {
    const p = pts.flat(); rot(p, true);
    const v = (i) => p.slice(i * 3, i * 3 + 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([...v(0), ...v(1), ...v(2), ...v(0), ...v(2), ...v(3)], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.8 }));
  };
  const zn = CO[2] - 0.06;
  sign(signTex(), [[CO[1] - 0.6, CT - 3.0, zn], [CO[0] + 0.6, CT - 3.0, zn], [CO[0] + 0.6, CT - 0.4, zn], [CO[1] - 0.6, CT - 0.4, zn]]);
  const zs = ZS + 0.92;
  sign(textTex('FACULTY OF ENGINEERING', { color: '#3a3532', h: 140 }), [[-605, 10.65, zs], [-583, 10.65, zs], [-583, 11.55, zs], [-605, 11.55, zs]]);
  sign(textTex('คณะวิศวกรรมศาสตร์', { color: '#3a3532', h: 140 }), [[-639, 10.6, zs], [-618, 10.6, zs], [-618, 11.6, zs], [-639, 11.6, zs]]);
  return { meshes, top: CT + 2 };
}

// Ground outline in world coordinates (the OSM outline of way 516204086)
export const E12_OUTLINE = [[-650.75, 12.41], [-557.73, 9.44], [-555.06, 86.71], [-649.26, 88.79], [-650.75, 12.41]];
