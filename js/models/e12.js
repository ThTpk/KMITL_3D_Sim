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
//   east stair   x -563..-557   one floor lower (north half); stair towers at both south corners rise above
//                                the roof; west end wall rises as a fin at its north end
//   podium       x -647..-575   z 35..87.5   3 storeys under four red hipped roofs round a small court;
//                                             a service road runs under the two north pavilions (z 41.5..50)
//                                             south front (and the SE pavilion's east side) on square piers
//                                             over a tall undercroft, lettering
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
// one face of the tower slab: deep salmon floor bands, ribbon of dark windows with recessed AC balconies
function slabFace(A, f, { skip = [], banner = null, louvre = false } = {}) {
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
        if (louvre && (i + k) % 3 === 1) {                                // light louvre screen over the window
          onFace(A, 'louvre', f, a + 0.3, a + 3.7, y + 1.3, top - 0.45, 0.05, 0.12);
        } else if (!louvre && (i + k) % 4 === 3) {                        // recessed balcony with an AC unit
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
// box on face f like onFace, keeping its underside (ceilings)
function fbox(A, m, f, a0, a1, y0, y1, d0, d1) {
  const p0 = f.at + f.out * d0, p1 = f.at + f.out * d1;
  if (f.ax === 'z') A.box(m, a0, a1, y0, y1, p0, p1, false);
  else A.box(m, p0, p1, y0, y1, a0, a1, false);
}
// podium frontage (south fronts, east side of the SE pavilion): a deep open hall on a raised plinth
// behind wide square piers, steps and low balustrades between them, ribbed ceiling, interior columns;
// above: cantilevered band, brick panels alternating with deep-set windows between fins, lettered fascia.
// f.at is the front line; the upper wall stands 0.9 m behind it, the hall's back wall UD behind.
const UD = 12, PL = 1.0;
function front(A, f, HP) {
  const { a0: x0, a1: x1 } = f;
  fbox(A, 'soffit', f, x0, x1, 6.9, 7.0, -UD, 0);                        // hall ceiling
  for (let a = x0 + 2.5; a < x1 - 1; a += 3.2) onFace(A, 'soffit', f, a, a + 0.35, 6.3, 6.9, -UD + 0.4, 0); // ribs
  for (let d = 2.5; d < UD; d += 3.2) onFace(A, 'soffit', f, x0, x1, 6.5, 6.9, -d - 0.3, -d);
  onFace(A, 'glass', f, x0 + 1, x1 - 1, PL + 0.4, 6.2, -UD, -UD + 0.05);  // glazed back wall of the hall
  onFace(A, 'paving', f, x0, x1, 0, PL, -UD, 0);                           // raised plinth
  for (let a = x0 + 6; a < x1 - 4; a += 8) for (const d of [4.5, 8.5]) onFace(A, 'wall', f, a - 0.35, a + 0.35, PL, 6.9, -d - 0.35, -d + 0.35); // hall columns
  onFace(A, 'band', f, x0, x1, 7.0, 8.4, -0.9, 0.6);
  const m = Math.round((x1 - x0) / 4.8), mw = (x1 - x0) / m;
  for (let i = 0; i < m; i++) {
    const a0 = x0 + i * mw + 0.35, a1 = x0 + (i + 1) * mw - 0.35;
    if (i % 2 === 0) onFace(A, 'brick', f, a0, a1, 8.4, HP - 0.9, -0.9, 0.04);
    else onFace(A, 'glass', f, a0 + 0.3, a1 - 0.3, 9.0, HP - 1.6, -0.9, -0.85);
  }
  for (let i = 0; i <= m; i++) onFace(A, 'band', f, x0 + i * mw - 0.35, x0 + i * mw + 0.35, 8.4, HP - 0.9, -0.9, 0.5); // fins
  onFace(A, 'band', f, x0, x1, HP - 0.9, HP + 0.6, -0.9, 0.6);            // fascia with the lettering
  // wide square piers; steps up to the hall in alternate bays, low balustrade walls in the others
  const n = Math.round((x1 - x0) / 9.5), bw = (x1 - x0) / n;
  for (let i = 0; i <= n; i++) {
    const a = Math.min(x1 - 0.9, Math.max(x0 + 0.9, x0 + i * bw));
    onFace(A, 'wall', f, a - 0.9, a + 0.9, 0, 7.0, -1.8, 0);
    if (i === n) break;
    const b0 = a + 0.9, b1 = Math.min(x1, x0 + (i + 1) * bw) - 0.9;
    if (i % 2 === 0) for (let k = 0; k < 4; k++) onFace(A, 'paving', f, b0, b1, 0, PL - k * 0.25, 0, 0.4 * (k + 1));
    else {
      onFace(A, 'band', f, b0, b1, PL, PL + 0.15, -0.25, 0);
      onFace(A, 'band', f, b0, b1, PL + 0.75, PL + 0.95, -0.25, 0);
      for (let a2 = b0 + 1.2; a2 < b1 - 0.5; a2 += 2.0) onFace(A, 'band', f, a2, a2 + 0.2, PL, PL + 0.8, -0.2, -0.05);
    }
  }
}
// stair tower with slit windows down its edges, one floor above the roof
function stairTower(A, x0, x1, z0, z1, top, faces) {
  A.box('core', x0, x1, 0, top, z0, z1);
  for (const [f, a0, a1] of faces) for (const a of [a0 + 0.5, a1 - 1.4]) onFace(A, 'glass', f, a, a + 0.9, G, top - 1.5, 0, 0.05);
  A.box('roofLight', x0 + 0.2, x1 - 0.2, top, top + 0.12, z0 + 0.2, z1 - 0.2);
}
// parapet wall round a pavilion roof
function parapetRing(A, x0, x1, z0, z1, y, h, t = 0.3) {
  A.box('wall', x0, x1, y, y + h, z0, z0 + t); A.box('wall', x0, x1, y, y + h, z1 - t, z1);
  A.box('wall', x0, x0 + t, y, y + h, z0, z1); A.box('wall', x1 - t, x1, y, y + h, z0, z1);
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
  const ES = [-563, -557, 12.4, 24];         // east stair bay (north half), one floor lower
  const SE = [-570, -557, 26, 37.5];         // south-east stair tower, rises above the roof
  const SW = [-652, -639, 26, 37.5];         // south-west stair tower, same
  const CT = ROOF + 6.3;                     // core top
  const ST = ROOF + 3.8;                     // stair tower tops
  const HPOD = 14.0;                         // podium parapet

  // ===== tower slab =====
  A.box('wall', SL[0], SL[1], G, ROOF, SL[2], SL[3]);
  A.box('wall', SL[0], SL[1], 0, G, SL[2] + 2.4, SL[3] - 2.4); // ground floor set back behind the piers
  A.box('soffit', SL[0], SL[1], G - 0.3, G, SL[2], SL[3], false);
  const N = { ax: 'z', at: SL[2], out: -1, a0: SL[0], a1: SL[1] };
  const S = { ax: 'z', at: SL[3], out: 1, a0: SL[0], a1: SL[1] };
  slabFace(A, N, { skip: [[CO[0] - 0.4, CO[1] + 0.4]], banner: { a0: -637.5, a1: -629.5, k0: 9 } });
  slabFace(A, S, { skip: [[SW[0], SW[1] + 0.4], [CO[0] - 0.4, CO[1] + 0.4], [SE[0] - 0.4, SL[1]]], louvre: true });
  // plain end walls with a slit window by the north face
  for (const [x, out] of [[SL[0], -1], [ES[1], 1]]) {
    const f = { ax: 'x', at: x, out, a0: SL[2], a1: SL[3] };
    onFace(A, 'glass', f, 15.0, 16.2, G + 1, (x === SL[0] ? ROOF : lvY(12)) - 1.5, 0, 0.05);
    onFace(A, 'band', f, SL[2], SL[3], G - 0.4, G + 0.2, 0, 0.2);
  }
  onFace(A, 'band', { ax: 'x', at: SL[0], out: -1 }, SL[2], SL[3], ROOF - 0.35, ROOF + 1.2, 0, 0.3);
  A.box('core', SL[0] - 0.6, SL[0] + 0.4, 0, ROOF + 3.0, SL[2] - 0.8, 21);  // west end fin, above the roof
  // east stair bay, one floor lower, slit window facing north
  A.box('wall', ES[0], ES[1], 0, lvY(12), ES[2], ES[3]);
  onFace(A, 'glass', { ax: 'z', at: ES[2], out: -1 }, -561.5, -560.3, G + 1, lvY(12) - 1.5, 0, 0.05);
  A.box('roofLight', ES[0], ES[1] - 0.2, lvY(12), lvY(12) + 0.12, ES[2] + 0.2, ES[3] - 0.2);
  // stair towers at the two south corners (seen from the SE entrance road and the NW)
  stairTower(A, SE[0], SE[1], SE[2], SE[3], ST, [[{ ax: 'z', at: SE[3], out: 1 }, SE[0], SE[1]], [{ ax: 'x', at: SE[0], out: -1 }, SL[3], SE[3]], [{ ax: 'x', at: SE[1], out: 1 }, SE[2], SE[3]]]);
  stairTower(A, SW[0], SW[1], SW[2], SW[3], ST, [[{ ax: 'z', at: SW[3], out: 1 }, SW[0], SW[1]], [{ ax: 'x', at: SW[1], out: 1 }, SL[3], SW[3]]]);
  onFace(A, 'glass', { ax: 'x', at: SW[0], out: -1 }, 30.6, 33.0, G, ST - 1.5, 0, 0.05);       // tall glazed strip facing west
  for (let k = 2; k <= 13; k++) onFace(A, 'band', { ax: 'x', at: SW[0], out: -1 }, 30.6, 33.0, lvY(k) - 0.15, lvY(k) + 0.15, 0, 0.1);

  // ===== core: projects from both long faces and rises above the roof =====
  A.box('core', CO[0], CO[1], 0, CT, CO[2], SL[3] + 1.3);           // runs through to the south face
  const CF = { ax: 'z', at: CO[2], out: -1 };
  for (const a of [CO[0] + 0.6, CO[1] - 1.5]) onFace(A, 'glass', CF, a, a + 0.9, G + 0.5, CT - 3.2, 0, 0.05); // edge slits
  for (let k = 2; k <= 12; k++) onFace(A, 'glass', CF, -609.1, -606.9, lvY(k) + 1.3, lvY(k) + 2.7, 0, 0.05);
  for (const a of [CO[0] + 2.2, CO[1] - 3.0]) onFace(A, 'wall', CF, a, a + 0.8, G, CT - 3.2, 0, 0.25);     // fins
  A.box('roofLight', CO[0] + 0.2, CO[1] - 0.2, CT, CT + 0.12, CO[2] + 0.2, SL[3] + 1.1);
  for (const a of [CO[0] + 0.6, CO[1] - 1.5]) onFace(A, 'glass', { ax: 'z', at: SL[3] + 1.3, out: 1 }, a, a + 0.9, HPOD + 1, CT - 2, 0, 0.05);

  // ===== roof =====
  A.box('roofLight', SL[0] + 0.3, SL[1] - 0.3, ROOF, ROOF + 0.12, SL[2] + 0.3, SL[3] - 0.3);
  for (const [x0, z0] of [[-640, 18], [-628, 25], [-590, 18], [-578, 25]]) A.box('wall', x0, x0 + 5, ROOF, ROOF + 2.6, z0, z0 + 4); // plant rooms
  for (const [x, z, h] of [[-646, 14, 6], [-571, 13.5, 4.5]]) A.cyl('rail', x, z, 0.08, ROOF, ROOF + h, 6);
  A.cyl('ac', -621, 15.5, 0.9, ROOF + 1.6, ROOF + 1.75, 12);                                     // dish
  A.cyl('rail', -621, 15.5, 0.1, ROOF, ROOF + 1.6, 6);

  // ===== podium: four pavilions under red hipped roofs round a small court =====
  const HP = HPOD;
  const DT = [41.5, 50], DH = 5.1; // service road through both north pavilions and the court (OSM service way), clearance
  const PAV = [[-647, -622.5, 35, 59], [-602, -575, 35, 59], [-643, -614, 59, 87.5], [-609, -579, 59, 87.5]];
  for (const [x0, x1, z0, z1] of PAV) {
    const under = z1 === 87.5, east = under && x1 === -579; // fronts over the undercroft: south, and east on the SE pavilion
    const north = z0 === 35;                                  // north pavilions bridge the service road
    A.box('wall', x0, east ? x1 - 0.9 : x1, under ? 7.0 : north ? DH : 0, HP, z0, under ? z1 - 0.9 : z1);
    if (under) A.box('wall', x0, east ? x1 - UD : x1, 0, 7.0, z0, z1 - UD);
    if (north) {
      // open below DH along the outer side (piers) and through the lane; glazed lobbies either side of the lane
      const out = x0 === -647 ? -1 : 1, xo = out < 0 ? x0 : x1, lx0 = out < 0 ? x0 + 1.6 : x0, lx1 = out < 0 ? x1 : x1 - 1.6;
      A.box('soffit', x0, x1, DH - 0.12, DH, z0, z1, false);
      A.box('wall', lx0, lx1, 0, DH - 0.12, z0, DT[0] - 0.5);
      A.box('wall', lx0, lx1, 0, DH - 0.12, DT[1] + 0.5, z1);
      for (const [z, o] of [[DT[0] - 0.5, 1], [DT[1] + 0.5, -1]]) onFace(A, 'glass', { ax: 'z', at: z, out: o }, lx0 + 0.8, lx1 - 0.8, 0.4, DH - 0.6, 0, 0.05);
      const fo = { ax: 'x', at: out < 0 ? lx0 : lx1, out };
      for (const [a0, a1] of [[z0 + 0.8, DT[0] - 1.3], [DT[1] + 1.3, z1 - 0.8]]) onFace(A, 'glass', fo, a0, a1, 0.4, DH - 0.6, 0, 0.05);
      for (const z of [z0 + 0.5, DT[0] - 0.6, DT[1] + 0.6, z1 - 0.5]) A.box('wall', out < 0 ? xo : xo - 1.0, out < 0 ? xo + 1.0 : xo, 0, DH, z - 0.5, z + 0.5);
      // bridge face over the road: band, brick panels with paired slit windows, top band
      const fb = { ax: 'x', at: xo, out };
      onFace(A, 'band', fb, z0, z1, DH, DH + 1.4, 0, 0.5);
      onFace(A, 'brick', fb, z0 + 0.6, z1 - 0.6, DH + 1.4, HP - 1.4, 0, 0.04);
      for (let z = z0 + 3.2; z + 2.4 < z1 - 1; z += 5.4) for (const dz of [0, 1.4]) onFace(A, 'glass', fb, z + dz, z + dz + 0.8, DH + 2.0, HP - 2.0, 0, 0.06);
      onFace(A, 'band', fb, z0, z1, HP - 1.4, HP + 0.6, 0, 0.5);
    }
    hipRoof(A, 'roofRed', x0, x1, z0, z1, HP - 0.3, Math.min(x1 - x0, z1 - z0) * 0.08, -0.6); // low, behind the parapet
    parapetRing(A, x0, x1, z0, z1, HP, 1.5);
    const faces = [
      { ax: 'x', at: x0, out: -1, a0: z0, a1: z1 }, { ax: 'x', at: x1, out: 1, a0: z0, a1: z1 },
      { ax: 'z', at: z0, out: -1, a0: x0, a1: x1 },
    ];
    for (const f of faces) {
      if (f.ax === 'z' && f.at === 35) continue; // against the tower
      if (east && f.ax === 'x' && f.out === 1) continue;
      if (north && f.ax === 'x' && f.at === (x0 === -647 ? x0 : x1)) continue; // bridge face, done above
      // on the south pavilions the sides stop where the open hall (below 7 m) and the front set-back begin
      const lo = under && f.ax === 'x' ? z1 - UD : f.a1, hi = under && f.ax === 'x' ? z1 - 0.9 : f.a1;
      for (const [y0, y1] of [[1.0, 3.2], [4.6, 6.6], [8.4, 10.4]]) {
        if (north && y0 < DH + 0.5) continue;
        const e = y1 < 7 ? lo : hi;
        for (let a = f.a0 + 1.2; a + 2.6 <= e - 0.8; a += 3.6) onFace(A, 'glass', f, a, a + 2.6, y0, y1, 0, 0.05);
      }
      for (const y of north ? [DH + 0.3, 7.4, 11.2] : [3.8, 7.4, 11.2]) onFace(A, 'band', f, f.a0, y < 7 ? lo : hi, y - 0.3, y + 0.5, 0, 0.45);
      onFace(A, 'brick', f, f.a0 + 0.6, hi - 0.6, 11.7, HP - 0.4, 0, 0.04);
    }
  }
  // flat link roofs between the pavilions, entrance hall on the axis, lawn court
  A.box('wall', -622.5, -602, 0, 11.0, 35, 39);
  A.box('roofLight', -622.5, -602, 11.0, 11.12, 35, 39);
  A.box('wall', -614, -609, 7.0, HP - 1, 59, 87.5);
  A.box('wall', -614, -609, 0, 7.0, 59, 87.5 - UD);
  A.box('soffit', -614, -609, 6.9, 7.0, 87.5 - UD, 87.5, false);
  A.box('paving', -614, -609, 0, PL, 87.5 - UD, 87.5);
  onFace(A, 'glass', { ax: 'z', at: 87.5, out: 1 }, -613.6, -609.4, 8.0, HP - 1.8, 0, 0.05);
  A.box('roofLight', -614.2, -608.8, HP - 1, HP - 0.88, 58.8, 87.5);
  A.box('lawn', -622.5, -602, 0.02, 0.1, DT[1] + 0.5, 59);
  A.box('lawn', -622.5, -602, 0.02, 0.1, 39, DT[0] - 0.5);
  A.box('paving', -622.5, -602, 0.02, 0.12, DT[0] - 0.5, DT[1] + 0.5);
  A.box('wall', -622.5, -614, 0, 7.4, 58, 59); A.box('wall', -609, -602, 0, 7.4, 58, 59);

  const ZS = 87.5;
  front(A, { ax: 'z', at: ZS, out: 1, a0: -643, a1: -614 }, HP);
  front(A, { ax: 'z', at: ZS, out: 1, a0: -609, a1: -579 }, HP);
  front(A, { ax: 'x', at: -579, out: 1, a0: 59, a1: ZS }, HP);
  // entrance steps and the plinth along the front

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true), brick = brickTex();
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    wall: std({ color: '#ebc2a8' }),
    band: std({ color: '#f0cdb6' }),
    core: std({ color: '#efc6ac' }),
    shade: std({ color: '#a8887a' }),
    recess: std({ color: '#e2b49b' }),
    louvre: std({ color: '#d4d6d3', roughness: 0.6, metalness: 0.2 }),
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
  const zs = ZS + 0.62;
  sign(textTex('FACULTY OF ENGINEERING', { color: '#3a3532', h: 140 }), [[-605, HP - 0.75, zs], [-583, HP - 0.75, zs], [-583, HP + 0.45, zs], [-605, HP + 0.45, zs]]);
  sign(textTex('คณะวิศวกรรมศาสตร์', { color: '#3a3532', h: 140 }), [[-639, HP - 0.75, zs], [-618, HP - 0.75, zs], [-618, HP + 0.45, zs], [-639, HP + 0.45, zs]]);
  return { meshes, top: CT + 2 };
}

// Ground outline in world coordinates (the OSM outline of way 516204086)
export const E12_OUTLINE = [[-650.75, 12.41], [-557.73, 9.44], [-555.06, 86.71], [-649.26, 88.79], [-650.75, 12.41]];
