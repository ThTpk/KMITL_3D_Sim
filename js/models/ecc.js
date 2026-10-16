// Hand-built model of the ECC building (อาคารปฏิบัติการรวมวิศวกรรมศาสตร์ 2).
// Surveyed 2026-10-16: Google Street View walk-around (east entrance, north car park, west road,
// south path, far views from the north car park / NE / SE) for facades, Esri World Imagery for the
// plan and roof colours. Photos were only looked at; everything here is procedural geometry.
//
// Local metres, x = east, z = south, y = up (same frame as data/kmitl_data.js).
// Plan (from the satellite roofs, checked against Street View distances; OSM building parts 1138463209/1138463210):
//   west block  x -314..-294.9   z -169.2..-144.9 HV lab, 21.5 m, white frame with large brick panels
//   podium      x -294.9..-231.3 z -169.5..-159.8 3 storeys (14.8 m), brick + white bands, AC units on a plinth
//   north wing  x -294.9..-239.4 z -159.8..-145.3 10 floors (~35 m), set back behind the podium, balcony bands
//   NE tower    x -239.4..-224.6 z -163.2..-145.3 floors 5-9 on round columns above the canopy
//   south wing  x -300..-237.3   z -133.5..-117.4 10 floors, white bands wrapping a rounded SE end;
//               west end on the road: deep balcony stack over a 2-storey brick base, shutter + ramp
//   yard block  x -300..-287     full height, closes the open yard from the west road; blue glass strip
//               (position fixed from Street View on the west road + its white roof on the satellite)
//   court       z -145.3..-133.5: open yard x -314..-300, yard block, low workshops to the lobby
//   entrance    curved white canopy (name lettering + blue glass ribbon) on round columns, facing east
import * as THREE from 'three';

// bottom of level k (1 = ground .. 10 = roof slab); tall ground floor, canopy levels 3-4
// measured from Street View (90° thumbnails, f = 512 px): plinth 1.1, ground-floor band 6.1,
// podium parapet 15.4, tower floors ~3.5, roofline ~39
const LV = [0, 6.1, 10.5, 14.3, 18.0, 21.5, 24.8, 28.2, 31.8, 35.3, 38.7];
const lvY = (k) => LV[Math.min(k, 11) - 1];
const ROOF = 38.8; // roof slab; parapet to ~39.8

// ---------- geometry accumulator (one bucket per material) ----------
class Acc {
  constructor() { this.b = {}; }
  bucket(m) { return (this.b[m] ||= { p: [], n: [], uv: [] }); }
  tri(m, a, b, c) {
    const B = this.bucket(m);
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
    for (const v of [a, b, c]) {
      B.p.push(v[0], v[1], v[2]); B.n.push(nx, ny, nz);
      // world-planar UVs in metres
      if (ay >= ax && ay >= az) B.uv.push(v[0], -v[2]);
      else if (ax >= az) B.uv.push(nx > 0 ? -v[2] : v[2], v[1]);
      else B.uv.push(nz > 0 ? v[0] : -v[0], v[1]);
    }
  }
  quad(m, a, b, c, d) { this.tri(m, a, b, c); this.tri(m, a, c, d); }
  box(m, x0, x1, y0, y1, z0, z1, skipBottom = true) {
    if (x0 > x1) [x0, x1] = [x1, x0];
    if (z0 > z1) [z0, z1] = [z1, z0];
    this.quad(m, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]);
    this.quad(m, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]);
    this.quad(m, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]);
    this.quad(m, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]);
    this.quad(m, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]);
    if (!skipBottom) this.quad(m, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]);
  }
  cyl(m, x, z, r, y0, y1, seg = 14) {
    const P = (t, y) => [x + r * Math.cos(t), y, z + r * Math.sin(t)];
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
      this.quad(m, P(t1, y0), P(t0, y0), P(t0, y1), P(t1, y1));
      this.tri(m, [x, y1, z], P(t1, y1), P(t0, y1));
    }
  }
  // vertical prism from a ring of [x,z]
  prism(m, ring, y0, y1, { top = true, bottom = false, sides = true } = {}) {
    let s = 0;
    for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; s += a[0] * b[1] - b[0] * a[1]; }
    const r = s > 0 ? ring : ring.slice().reverse();
    if (sides) for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length];
      this.quad(m, [b[0], y0, b[1]], [a[0], y0, a[1]], [a[0], y1, a[1]], [b[0], y1, b[1]]);
    }
    const flat = (y, up) => {
      const tris = THREE.ShapeUtils.triangulateShape(r.map(([x, z]) => new THREE.Vector2(x, z)), []);
      for (const [i, j, k] of tris) {
        let A = [r[i][0], y, r[i][1]], B = [r[j][0], y, r[j][1]], Cc = [r[k][0], y, r[k][1]];
        const cy = (B[2] - A[2]) * (Cc[0] - A[0]) - (B[0] - A[0]) * (Cc[2] - A[2]);
        if ((cy < 0) === up) [B, Cc] = [Cc, B];
        this.tri(m, A, B, Cc);
      }
    };
    if (top) flat(y1, true);
    if (bottom) flat(y0, false);
  }
  // half cylinder lying along x (barrel roof)
  barrelX(m, x0, x1, zc, r, y, squash = 0.45, seg = 10) {
    const P = (t, x) => [x, y + Math.sin(t) * r * squash, zc - Math.cos(t) * r];
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI, t1 = ((i + 1) / seg) * Math.PI;
      this.quad(m, P(t1, x0), P(t1, x1), P(t0, x1), P(t0, x0));
      this.tri(m, [x1, y, zc], P(t0, x1), P(t1, x1));
      this.tri(m, [x0, y, zc], P(t1, x0), P(t0, x0));
    }
  }
}

const arc = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
  const t = a0 + ((a1 - a0) * i) / n;
  return [cx + r * Math.cos(t), cz + r * Math.sin(t)];
});

// ---------- textures (procedural canvas) ----------
function canvasTex(w, h, draw, rx, ry) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / rx, 1 / ry);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
// orange-brick facing tiles with light joints (2.4 m square)
const brickTex = () => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
  const rows = 32, cols = 10;
  for (let j = 0; j < rows; j++) for (let i = -1; i < cols; i++) {
    const x = (i + (j % 2) * 0.5) * (w / cols), y = j * (h / rows);
    const k = 0.86 + ((i * 7 + j * 13) % 9) / 60;
    g.fillStyle = `rgb(${255 * k | 0},${232 * k | 0},${222 * k | 0})`;
    g.fillRect(x + 1, y + 1, w / cols - 2, h / rows - 2);
  }
}, 2.4, 2.4);
// window glass: mullions by day, random lit rooms at night (cells 2 m x 3.8 m)
function glassTex(night) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = night ? '#000' : '#ffffff'; g.fillRect(0, 0, w, h);
    let s = 7;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const cw = w / 8, ch = h / 4;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) {
      if (night) {
        if (r() < 0.55) { g.fillStyle = r() < 0.5 ? '#ffd28a' : '#fff1cf'; g.fillRect(i * cw + 3, j * ch + 3, cw - 6, ch - 6); }
      } else {
        g.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.12})`; g.fillRect(i * cw, j * ch, cw * 0.4, ch);
        g.fillStyle = 'rgba(210,214,216,0.9)'; g.fillRect(i * cw, j * ch, 4, ch); g.fillRect(i * cw, j * ch + ch * 0.62, cw, 3);
      }
    }
  }, 16, 15.2);
}
function textTex(text, { w = 2048, h = 160, color = '#5d5b57', bg = null, font = 'IBM Plex Sans Thai', weight = 600 } = {}) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  let size = h * 0.72;
  g.font = `${weight} ${size}px "${font}", sans-serif`;
  while (g.measureText(text).width > w * 0.96 && size > 10) { size -= 4; g.font = `${weight} ${size}px "${font}", sans-serif`; }
  g.fillText(text, w / 2, h * 0.54);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

// ---------- facade helpers ----------
// Faces are described by an axis-aligned wall line; `out` is the outward unit step (±1) along the normal axis.
// face = { ax: 'z' | 'x', at: plane coord, out: ±1, a0, a1 } where a0..a1 runs along the wall.
function onFace(acc, m, f, a0, a1, y0, y1, d0, d1) {
  // box on face f from depth d0..d1 measured outward from the wall plane
  const p0 = f.at + f.out * d0, p1 = f.at + f.out * d1;
  if (f.ax === 'z') acc.box(m, a0, a1, y0, y1, p0, p1);
  else acc.box(m, p0, p1, y0, y1, a0, a1);
}

// Brick podium with white pilasters and floor bands, ribbon windows (north face of the north wing)
function podium(acc, f, levels, bay = 8.4, { doors = [], balc = 4 } = {}) {
  const { a0, a1 } = f;
  for (const k of levels) {
    const y = lvY(k), top = lvY(k + 1);
    if (k === 1) {
      onFace(acc, 'brick', f, a0, a1, 1.1, top - 0.5, 0, 0.05);
      for (const [d0, d1] of doors) onFace(acc, 'shutter', f, d0, d1, 0, 4.4, 0, 0.09);
      // wide windows behind the AC units, small vents above
      for (let a = a0 + 0.8; a + bay / 2 < a1; a += bay / 2) {
        if (doors.some(([d0, d1]) => a + bay / 2 > d0 && a < d1)) continue;
        onFace(acc, 'glass', f, a, a + bay / 2 - 1.2, 2.8, 4.5, 0, 0.08);
        onFace(acc, 'soffit', f, a + 1, a + 1.5, 5.0, 5.4, 0, 0.08);
      }
    } else if (k === balc) {
      // recessed balcony level: glass behind a white balustrade band
      onFace(acc, 'glass', f, a0, a1, y + 1.0, top - 0.6, 0, 0.04);
      onFace(acc, 'white', f, a0, a1, y - 0.2, y + 1.05, 0, 0.9);
      onFace(acc, 'rail', f, a0, a1, y + 1.05, y + 1.12, 0.75, 0.9);
    } else if (k === 2) {
      onFace(acc, 'brick', f, a0, a1, y, y + 1.7, 0, 0.05);
      onFace(acc, 'glass', f, a0, a1, y + 1.7, top - 0.7, 0, 0.04);
    } else {
      onFace(acc, 'brick', f, a0, a1, y, y + 1.1, 0, 0.05);
      onFace(acc, 'glass', f, a0, a1, y + 1.1, top - 0.7, 0, 0.04);
    }
    onFace(acc, 'white', f, a0, a1, top - 0.7, top, 0, 0.35); // floor band
  }
  const yTop = lvY(levels[levels.length - 1] + 1);
  for (let a = a0; a <= a1 + 0.01; a += bay) onFace(acc, 'white', f, Math.max(a0, a - 0.35), Math.min(a1, a + 0.35), 0, yTop, 0, 0.45);
}

// Stacked white balcony bands: solid balustrade on a projecting slab, glass + spandrel behind
function balconyBands(acc, f, levels, proj, { stepped = 0, back = 'white', ac = false } = {}) {
  levels.forEach((k, i) => {
    const y = lvY(k), top = lvY(k + 1);
    const p = proj + stepped * i;
    const bk = back === 'white' ? 'shade' : back; // recessed wall behind the balcony sits in shadow
    onFace(acc, bk, f, f.a0, f.a1, y, y + 1.0, 0, 0.04);
    onFace(acc, 'glass', f, f.a0, f.a1, y + 1.0, top - 0.35, 0, 0.03);
    // wall piers between the room windows (windows ~2.6 m wide on a 4.2 m grid)
    for (let a = f.a0; a < f.a1 - 0.5; a += 4.2) onFace(acc, bk, f, a, Math.min(f.a1, a + 1.5), y + 1.0, top - 0.35, 0, 0.06);
    const w0 = f.a0 - (f.wrap0 ? p : 0), w1 = f.a1 + (f.wrap1 ? p : 0);
    // balcony: slab with a solid white lower balustrade, light grey grille, white top rail
    onFace(acc, 'white', f, w0, w1, y - 0.25, y + 0.5, 0, p);
    onFace(acc, 'grille', f, w0, w1, y + 0.5, y + 0.95, p - 0.08, p - 0.02);
    onFace(acc, 'white', f, w0, w1, y + 0.95, y + 1.1, p - 0.18, p);
    if (ac) for (let a = f.a0 + 3; a < f.a1 - 1; a += 7.3) onFace(acc, 'ac', f, a, a + 0.85, y + 0.05, y + 0.7, 0.2, 0.55);
  });
  const kt = levels[levels.length - 1] + 1, pt = proj + stepped * levels.length;
  onFace(acc, 'white', f, f.a0 - (f.wrap0 ? pt : 0), f.a1 + (f.wrap1 ? pt : 0), lvY(kt) - 0.25, ROOF + 1.1, 0, pt * 0.6); // crown
}

// White wall with punched windows
function punched(acc, f, levels, { every = 4, w = 1.6, h = 1.5, skip = [] } = {}) {
  for (const k of levels) {
    const y = lvY(k);
    for (let a = f.a0 + every / 2 - w / 2; a + w <= f.a1; a += every) {
      if (skip.some(([s0, s1]) => a + w > s0 && a < s1)) continue;
      onFace(acc, 'glass', f, a, a + w, y + 1.0, y + 1.0 + h, 0, 0.04);
      onFace(acc, 'white', f, a - 0.15, a + w + 0.15, y + 0.85, y + 1.0, 0, 0.22); // sill
    }
  }
}

// White frame with pairs of large brick panels per bay (west block / HV lab, court workshops).
// rows = y edges of the panel rows; bays of about bayW, each split into `sub` panels.
function panelGrid(acc, f, rows, bayW, sub = 2, pier = 1.3, mull = 0.45) {
  const n = Math.max(1, Math.round((f.a1 - f.a0) / bayW)), bw = (f.a1 - f.a0) / n;
  for (let i = 0; i < n; i++) {
    const b0 = f.a0 + i * bw + pier / 2, b1 = f.a0 + (i + 1) * bw - pier / 2, pw = (b1 - b0 - mull * (sub - 1)) / sub;
    for (let j = 0; j < rows.length - 1; j++) {
      if (f.skip && f.skip(i, j)) continue;
      for (let s = 0; s < sub; s++) {
        const a = b0 + s * (pw + mull);
        onFace(acc, 'brick', f, a, a + pw, rows[j] + 0.3, rows[j + 1] - 0.3, -0.1, 0.03);
      }
    }
  }
  for (const y of rows) onFace(acc, 'white', f, f.a0, f.a1, y - 0.3, y + 0.3, 0, 0.16);
  for (let i = 0; i <= n; i++) onFace(acc, 'white', f, f.a0 + i * bw - pier / 2, f.a0 + i * bw + pier / 2, rows[0], rows[rows.length - 1], 0, 0.22);
}

// rectangle (x east, z south) with optional rounded corners {ne, se, sw, nw}, grown by p
function rrect(x0, x1, z0, z1, r = {}, p = 0) {
  x0 -= p; x1 += p; z0 -= p; z1 += p;
  const out = [];
  const R = (k) => (r[k] ? r[k] + p : 0);
  const corner = (cx, cz, rad, t0, sx, sz) => {
    if (rad <= 0) { out.push([cx, cz]); return; }
    const c = [cx - sx * rad, cz - sz * rad];
    for (let i = 0; i <= 6; i++) { const t = t0 + (i / 6) * (Math.PI / 2); out.push([c[0] + rad * Math.cos(t), c[1] + rad * Math.sin(t)]); }
  };
  corner(x1, z0, R('ne'), -Math.PI / 2, 1, -1);
  corner(x1, z1, R('se'), 0, 1, 1);
  corner(x0, z1, R('sw'), Math.PI / 2, -1, 1);
  corner(x0, z0, R('nw'), Math.PI, -1, -1);
  return out;
}

// Continuous white balcony bands around a whole block outline (south wing, NE tower)
function ringBands(acc, rect, levels, proj, { base = true, roofY = ROOF } = {}) {
  const [x0, x1, z0, z1, r] = rect;
  const ring = (p) => rrect(x0, x1, z0, z1, r, p);
  for (const k of levels) {
    const y = lvY(k), top = lvY(k + 1);
    // shaded wall behind the balcony with a narrower window strip, so the bands read white like the photos
    acc.prism('shade', ring(0.02), y + 1.1, top - 0.25, { top: false });
    acc.prism('glass', ring(0.05), y + 1.4, top - 0.9, { top: false });
    acc.prism('white', ring(proj), y - 0.25, y + 0.5, { bottom: true });
    acc.prism('grille', ring(proj - 0.06), y + 0.5, y + 0.95, { top: false });
    acc.prism('white', ring(proj), y + 0.95, y + 1.1, { bottom: true });
  }
  acc.prism('white', ring(proj * 0.5), lvY(levels[levels.length - 1] + 1) - 0.25, roofY + 1.0, { top: false });
  if (base) {
    acc.prism('brick', ring(0.04), 0.3, lvY(levels[0]) - 0.3, { top: false });
    acc.prism('white', ring(0.3), lvY(2) - 0.35, lvY(2) + 0.25, { bottom: true });
  }
}

// ---------- the model ----------
export function buildECC(owner) {
  const A = new Acc();
  const L = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const WB = [-314, -294.9, -169.2, -144.9], HWB = 21.5;     // west block (HV lab)
  const PD = [-294.9, -231.3, -169.5, -159.8], HPD = 15.4; // 3-storey brick podium along the car park
  const NW = [-294.9, -239.4, -159.8, -145.3];             // north wing tower (set back behind the podium)
  const NE = [-239.4, -224.6, -163.2, -145.3];             // NE tower (above the canopy)
  const SW = [-300, -237.3, -133.5, -117.4, { se: 7 }];    // south wing tower with rounded SE end
  const CB = [-300, -287, NW[3], SW[2]];                   // tall block closing the yard (blue glass strip)
  const [c0, c1] = [8.0, 15.0];                            // canopy soffit / top (measured at the entrance and from the NE)
  const NEtop = lvY(10) + 0.3;                             // NE tower roof, one floor below the main roof
  const UP = L(5, 10);                                     // tower floors above the podium

  // ===== main volumes =====
  A.box('white', WB[0], WB[1], 0, HWB, WB[2], WB[3]);
  A.box('white', PD[0], PD[1], 0, HPD, PD[2], PD[3]);
  A.box('white', NW[0], NW[1], 0, ROOF, NW[2], NW[3]);
  A.box('white', NE[0], NE[1], c1, NEtop, NE[2], NE[3]);
  A.prism('white', rrect(SW[0], SW[1], SW[2], SW[3], SW[4]), 0, ROOF);
  A.box('white', CB[0], CB[1], 0, ROOF, CB[2], CB[3]);

  // ===== west block: white frame, big brick panels, HV lab on the road =====
  const rowsWB = [0.6, 7.4, 12.6, 17.8];
  const WBN = { ax: 'z', at: WB[2], out: -1, a0: WB[0], a1: WB[1] };
  const WBW = { ax: 'x', at: WB[0], out: -1, a0: WB[2], a1: WB[3] };
  const WBS = { ax: 'z', at: WB[3], out: 1, a0: WB[0], a1: WB[1] };
  panelGrid(A, WBN, rowsWB, 6.4);
  panelGrid(A, { ...WBW, skip: (i, j) => i === 2 && j === 0 }, rowsWB, 8.1);
  panelGrid(A, WBS, rowsWB, 6.4);
  for (const f of [WBN, WBW, WBS]) {
    for (let a = f.a0 + 2.2; a < f.a1 - 1.5; a += 3.7) onFace(A, 'glass', f, a, a + 1.1, 19.0, 20.2, 0, 0.04); // small top windows
    onFace(A, 'white', f, f.a0, f.a1, HWB - 0.5, HWB + 0.6, 0, 0.2);
  }
  A.box('shutter', WB[0] - 0.1, WB[0], 0, 4.6, -154.6, -150.6);
  A.box('orange', WB[0] - 1.1, WB[0], 5.2, 6.6, -155.0, -150.2);

  // ===== podium along the car park (north) =====
  const PF = { ax: 'z', at: PD[2], out: -1, a0: PD[0], a1: PD[1] };
  podium(A, PF, [1, 2, 3], 8.0, { doors: [[-262, -258.5], [-276, -272.5]], balc: 3 });
  onFace(A, 'white', PF, PD[0], PD[1], lvY(4) - 0.2, HPD + 0.3, 0, 0.45); // thick parapet band
  const PE = { ax: 'x', at: PD[1], out: 1, a0: PD[2], a1: PD[3] };
  podium(A, PE, [1, 2, 3], 6.4, { balc: 3 });
  onFace(A, 'white', PE, PD[2], PD[3], lvY(4) - 0.2, HPD + 0.3, 0, 0.45);
  // raised plinth with rows of large AC condensers standing on it
  A.box('white', WB[0], PD[1], 0, 1.1, PD[2] - 1.2, PD[2]);
  for (const [x0, n] of [[-284, 4], [-276, 11], [-258, 10], [-244, 3]]) for (let i = 0; i < n; i++) A.box('ac', x0 + i * 1.4, x0 + i * 1.4 + 1.3, 1.1, 2.3, PD[2] - 0.9, PD[2] - 0.3);

  // ===== north wing tower, north face above the podium =====
  const NF = { ax: 'z', at: NW[2], out: -1 };
  punched(A, { ...NF, a0: NW[0], a1: -281.4 }, UP, { every: 3.4 });
  for (const k of UP) onFace(A, 'white', NF, -291, -285, lvY(k) - 0.2, lvY(k) + 1.05, 0, 1.3);
  balconyBands(A, { ...NF, a0: -281.4, a1: -251.2 }, UP, 1.8, { ac: true });
  balconyBands(A, { ...NF, a0: -251.2, a1: NW[1] }, UP, 0.6, { back: 'brick' });
  onFace(A, 'white', NF, NW[0], NW[1], ROOF - 0.2, ROOF + 1.0, 0, 0.3);
  // west end above the west block, court side
  punched(A, { ax: 'x', at: NW[0], out: -1, a0: NW[2], a1: NW[3] }, L(8, 10), { every: 4.8, w: 1.3 });
  const NS = { ax: 'z', at: NW[3], out: 1, a0: NW[0], a1: -256 };
  punched(A, NS, L(3, 10), { every: 3.6, w: 1.5, skip: [[-270, -256]] });
  for (const k of L(4, 10)) onFace(A, 'white', NS, -282, -272, lvY(k) - 0.2, lvY(k) + 1.05, 0, 1.2);
  // lobby walls under the NE tower (behind the columns): brick, glass, white bands
  for (const f of [{ ax: 'x', at: NW[1], out: 1, a0: NW[2], a1: NE[3] }, { ax: 'z', at: PD[3], out: 1, a0: NW[1], a1: PD[1] }]) {
    onFace(A, 'brick', f, f.a0, f.a1, 1.2, c0, 0, 0.05);
    onFace(A, 'glass', f, f.a0 + 1, f.a1 - 1, 2.6, 4.6, 0, 0.08);
    onFace(A, 'glass', f, f.a0 + 1, f.a1 - 1, 6.3, 7.5, 0, 0.08);
    for (const y of [5.4, 7.6]) onFace(A, 'white', f, f.a0, f.a1, y, y + 0.45, 0, 0.3);
  }

  // ===== NE tower and south wing: deep white bands all round =====
  ringBands(A, [...NE, {}], L(5, 9), 1.0, { base: false, roofY: NEtop });
  ringBands(A, SW, L(3, 10), 1.4);
  // west end: deep balconies stacked up the road face, over the brick base with a roller shutter and ramp
  const SWW = { ax: 'x', at: SW[0], out: -1, a0: -130.2, a1: SW[3] };
  for (const k of L(3, 10)) {
    const y = lvY(k);
    onFace(A, 'white', SWW, SWW.a0, SWW.a1, y - 0.25, y + 0.5, 0, 2.8);
    onFace(A, 'grille', SWW, SWW.a0, SWW.a1, y + 0.5, y + 0.95, 2.7, 2.76);
    onFace(A, 'white', SWW, SWW.a0, SWW.a1, y + 0.95, y + 1.1, 2.6, 2.8);
    onFace(A, 'white', SWW, SWW.a0, SWW.a0 + 0.3, y + 0.5, y + 1.1, 1.4, 2.8); // side cheek
  }
  onFace(A, 'shutter', SWW, -125.6, -121.4, 0.9, 4.6, 0, 0.12);
  A.box('paving', SW[0] - 9, SW[0], 0, 0.9, -126.4, -120.6);              // ramp up to the shutter
  for (const z of [-126.6, -120.4]) A.box('white', SW[0] - 9, SW[0], 0, 1.3, z - 0.2, z);
  for (const x of [-282, -266]) A.box('shutter', x, x + 3.4, 0, 3.6, SW[3], SW[3] + 0.1);

  // ===== court (seen from the west road: open yard closed by a tall block, low workshops beyond) =====
  A.box('court', WB[0], CB[0], 0.02, 0.08, WB[3], SW[2]);     // open yard from the road
  // tall block: brick ground floor with shutters and louvres, blue glass strip up the middle,
  // stacked small balconies to its left, windows to its right
  const CW = { ax: 'x', at: CB[0], out: -1 };
  onFace(A, 'brick', CW, CB[2], CB[3], 0.3, lvY(2) - 0.3, 0, 0.05);
  for (const [z0, z1] of [[-144.4, -141.6], [-137.2, -134.2]]) onFace(A, 'shutter', CW, z0, z1, 0, 3.8, 0, 0.09);
  onFace(A, 'grille', CW, -141.2, -137.6, 2.2, 4.6, 0, 0.08);
  onFace(A, 'white', CW, CB[2], CB[3], lvY(2) - 0.3, lvY(2) + 0.3, 0, 0.3);
  onFace(A, 'blueGlass', CW, -140.6, -138.2, lvY(2) + 0.3, ROOF + 0.6, 0, 0.06);
  for (let k = 3; k <= 11; k++) onFace(A, 'white', CW, -140.9, -137.9, lvY(k) - 0.3, lvY(k), 0, 0.3);
  for (const k of L(3, 10)) {
    const y = lvY(k);
    onFace(A, 'shade', CW, -144.6, -141.6, y + 0.4, lvY(k + 1) - 0.3, 0, 0.05);
    onFace(A, 'white', CW, -144.6, -141.6, y - 0.2, y + 0.5, 0, 1.2);
    onFace(A, 'grille', CW, -144.6, -141.6, y + 0.5, y + 1.0, 1.1, 1.16);
  }
  punched(A, { ...CW, a0: -137.6, a1: CB[3] }, L(3, 10), { every: 2.0, w: 1.2 });
  A.box('roofWhite', CB[0] + 0.2, CB[1] - 0.2, ROOF, ROOF + 0.12, CB[2] + 0.2, CB[3] - 0.2);
  A.box('white', CB[0], CB[0] + 0.25, ROOF, ROOF + 1.0, CB[2], CB[3]);
  A.barrelX('teal', -299.5, -288, -142.5, 1.95, ROOF, 0.55);      // lift machine room
  // low workshops behind it, then the back of the lobby
  A.box('brick', CB[1], -270, 0, 6.1, NW[3], SW[2]);
  A.box('white', CB[1], -258, 6.1, 6.7, NW[3], SW[2]);
  A.box('roofDark', CB[1], -270, 6.7, 6.82, NW[3] + 0.1, SW[2] - 0.1);
  A.box('white', -270, -258, 0, 9, -143, -135.4);             // taller white part (satellite white roof)
  A.box('roofWhite', -269.8, -258.2, 9, 9.12, -142.8, -135.6);
  A.box('white', -258, -246.9, 0, 8.0, NW[3], SW[2]);
  A.box('roofDark', -258, -246.9, 8.0, 8.12, NW[3] + 0.1, SW[2] - 0.1);

  // ===== entrance: platform, steps, lobby, round columns, curved canopy =====
  const ell = (rx, rz, n = 10) => Array.from({ length: n }, (_, i) => {
    const t = ((i + 1) / n) * (Math.PI / 2);
    return [-237 + rx * Math.cos(t), -135 + rz * Math.sin(t)];
  });
  const canopyRing = [[-246.9, NE[2]], [-223.7, NE[2]], [-223.7, -135], ...ell(13.3, 12.3), [-246.9, -122.7]];
  A.prism('paving', [[-246.9, NE[2]], [-225.6, NE[2]], [-225.6, -135], ...ell(11.4, 10.4, 8), [-246.9, -124.6]], 0, 1.2);
  for (let s = 0; s < 4; s++) A.box('paving', -225.6 + s * 0.4, -225.2 + s * 0.4, 0, 1.2 - s * 0.3, -161.5, -133);
  const LB = { ax: 'x', at: -240, out: 1, a0: NE[3], a1: SW[2] };
  A.box('white', -246.9, -240, 1.2, c0, NE[3], SW[2]);
  onFace(A, 'glass', LB, -144.5, -136.5, 1.2, 5.4, 0, 0.06);
  onFace(A, 'brick', LB, -144.8, -134.2, 6.2, 7.8, 0, 0.05);
  onFace(A, 'white', LB, NE[3], SW[2], 5.4, 6.2, 0, 0.3);
  // curved mezzanine balustrade inside the lobby
  A.prism('white', [...arc(-241.6, -139.5, 3.0, -Math.PI / 2, Math.PI / 2, 8), ...arc(-241.6, -139.5, 2.7, Math.PI / 2, -Math.PI / 2, 8)], 5.4, 6.5);
  const cols = [];
  for (const z of [-161.6, -155.6, -149.6, -143.6, -137.6]) cols.push([-224.6, z], [-231.2, z]);
  for (const t of [0.5, 1.05]) cols.push([-237 + 12.2 * Math.cos(t), -135 + 11.2 * Math.sin(t)]);
  cols.push([-237 + 6 * Math.cos(0.6), -135 + 5.5 * Math.sin(0.6)]);
  for (const [x, z] of cols) A.cyl('column', x, z, 0.46, 0, c0, 16);
  A.prism('soffit', canopyRing, c0 - 0.3, c0, { top: false, bottom: true });
  A.prism('white', canopyRing, c0, 13.0, { top: false });
  A.prism('blueGlass', canopyRing.map(([x, z]) => [x + (x > -237 ? -0.08 : 0.08), z + (z > -135 ? -0.08 : 0)]), 13.0, 13.9, { top: false });
  A.prism('white', canopyRing, 13.9, c1, { top: false });
  A.prism('roofTan', canopyRing, c1 - 0.1, c1 + 0.02, { sides: false });
  A.prism('white', [[-223.7, NE[3]], [-223.7, -135], ...ell(13.3, 12.3), ...ell(12.7, 11.7).reverse(), [-224.3, -135], [-224.3, NE[3]]], c1, c1 + 0.9);
  A.box('white', -236, -231.5, c1, c1 + 2.8, -140, -136);
  for (const [x, z] of [[-235.6, -139.6], [-232, -136.4]]) A.cyl('rail', x, z, 0.06, c1 + 2.8, c1 + 6, 6);

  // ===== roofs (colours from the satellite image) =====
  A.box('roofWhite', WB[0] + 0.2, -309.8, HWB, HWB + 0.12, WB[2] + 0.2, WB[3] - 0.2);
  A.box('roofNavy', -309.8, WB[1] - 0.2, HWB, HWB + 0.12, WB[2] + 0.2, -158.8);   // north half navy like the podium
  A.box('roofLight', -309.8, WB[1] - 0.2, HWB, HWB + 0.12, -158.8, WB[3] - 0.2);
  A.box('roofNavy', PD[0], PD[1] - 0.2, HPD, HPD + 0.12, PD[2] + 0.2, PD[3]);
  A.box('roofLight', NW[0], NW[1] - 0.2, ROOF, ROOF + 0.12, NW[2] + 0.2, NW[3] - 0.2);
  A.prism('roofWhite', rrect(SW[0], SW[1], SW[2], SW[3], SW[4], -0.2), ROOF, ROOF + 0.12, { sides: false });
    A.box('roofWhite', NE[0] + 0.2, NE[1] - 0.2, NEtop, NEtop + 0.12, NE[2] + 0.2, NE[3] - 0.2);
  const parapet = (x0, x1, z0, z1, y, h = 1.0, t = 0.25) => {
    A.box('white', x0, x1, y, y + h, z0, z0 + t); A.box('white', x0, x1, y, y + h, z1 - t, z1);
    A.box('white', x0, x0 + t, y, y + h, z0, z1); A.box('white', x1 - t, x1, y, y + h, z0, z1);
  };
  parapet(WB[0], WB[1], WB[2], WB[3], HWB, 0.6);
  parapet(NW[0], NW[1], NW[2], NW[3], ROOF);
  parapet(PD[0], PD[1], PD[2], PD[3] + 0.25, HPD, 0.5);
  parapet(NE[0], NE[1], NE[2], NE[3], NEtop, 0.8);
  // teal barrel roofs over the two stair halls, plant rooms, tank, antenna masts
  A.barrelX('teal', -271, -257.8, -147.4, 1.95, ROOF, 0.55);
  A.box('white', -268, -261, ROOF, ROOF + 3.0, -158, -152);
  A.box('white', -283, -278, ROOF, ROOF + 2.4, -158.5, -154);
  A.box('tank', -250, -246, ROOF, ROOF + 2.0, -158.5, -155.5);
  A.box('white', -252, -245, ROOF, ROOF + 2.6, -130, -124);
  for (const [x, z, h, y] of [[-244, -121, 4.6, ROOF], [-241, -128, 4.0, ROOF], [-226.5, -147.5, 4.8, NEtop], [-237.5, -161.5, 3.6, NEtop], [-296.5, -128, 3.4, ROOF]]) {
    A.cyl('rail', x, z, 0.07, y, y + h, 6);
    A.box('ac', x - 0.25, x + 0.25, y + h - 1.6, y + h - 0.6, z - 0.12, z + 0.12);
  }

  // ===== materials & meshes =====
  const brick = brickTex(), gDay = glassTex(false), gNight = glassTex(true);
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    white: std({ color: '#faf9f5' }),
    shade: std({ color: '#c9c6bf' }),
    grille: std({ color: '#b3b7b9', roughness: 0.6, metalness: 0.2 }),
    column: std({ color: '#f6f5f1', roughness: 0.7 }),
    soffit: std({ color: '#d9d3c7', roughness: 0.95, side: THREE.DoubleSide, emissive: new THREE.Color('#4a463f') }),
    brick: std({ color: '#c4703f', map: brick, roughness: 0.92 }),
    glass: std({ color: '#71838f', map: gDay, roughness: 0.35, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    blueGlass: std({ color: '#3f72b0', roughness: 0.3, emissive: new THREE.Color('#ffd9a0'), emissiveMap: gNight, emissiveIntensity: 0 }),
    rail: std({ color: '#5f666c', roughness: 0.5, metalness: 0.4 }),
    shutter: std({ color: '#8c9196', roughness: 0.6, metalness: 0.3 }),
    ac: std({ color: '#e4e4e0' }),
    orange: std({ color: '#e2661f' }),
    paving: std({ color: '#c9b7a4', roughness: 1 }),
    court: std({ color: '#6a6862', roughness: 1 }),
    teal: std({ color: '#2f6b74', roughness: 0.6, metalness: 0.2 }),
    tank: std({ color: '#3a6f9a' }),
    roofNavy: std({ color: '#4f6276', roughness: 0.9 }),
    roofLight: std({ color: '#a7bfcb', roughness: 0.9 }),
    roofWhite: std({ color: '#e6e5e0', roughness: 0.9 }),
    roofTan: std({ color: '#a8896a', roughness: 1 }),
    roofDark: std({ color: '#5b5650', roughness: 1 }),
  };
  const meshes = [];
  for (const [k, B] of Object.entries(A.b)) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    g.computeBoundingSphere();
    g.userData.owner = new Int32Array(B.p.length / 9).fill(owner);
    const mesh = new THREE.Mesh(g, MAT[k]);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.kind = 'building';
    meshes.push(mesh);
  }
  // lettering: building name on the canopy front, lab name on the orange sign
  const sign = (tex, pts) => {
    const g = new THREE.BufferGeometry();
    const [a, b, c, d] = pts;
    g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals(); g.computeBoundingSphere();
    g.userData.owner = new Int32Array(2).fill(owner);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.8 }));
    m.userData.kind = 'building';
    meshes.push(m);
  };
  const x = -223.65;
  sign(textTex('อาคารปฏิบัติการรวมวิศวกรรมศาสตร์ ๒'), [[x, 9.9, -151.0], [x, 9.9, -163.4], [x, 11.5, -163.4], [x, 11.5, -151.0]]);
  const xs = WB[0] - 1.15;
  sign(textTex('ห้องปฏิบัติการไฟฟ้าแรงสูง  HIGH VOLTAGE', { color: '#ffffff', bg: '#e2661f', h: 220 }), [[xs, 5.35, -154.85], [xs, 5.35, -150.35], [xs, 6.45, -150.35], [xs, 6.45, -154.85]]);
  return { meshes, top: ROOF + 4 };
}

// Overall ground outline (used for highlight, label position, tree clearance)
export const ECC_OUTLINE = (() => {
  const SWX = -302.8; // south wing west balconies
  const ell = Array.from({ length: 6 }, (_, i) => { const t = ((i + 1) / 6) * (Math.PI / 2); return [-237 + 13.3 * Math.cos(t), -135 + 12.3 * Math.sin(t)]; });
  const se = arc(-244.3, -124.4, 7, 0, Math.PI / 2, 4);
  const ring = [[-314, -169.5], [-231.3, -169.5], [-231.3, -163.2], [-223.7, -163.2], [-223.7, -135], ...ell, ...se, [SWX, -117.4], [SWX, -133.5], [-314, -133.5]];
  return [...ring, ring[0]];
})();
