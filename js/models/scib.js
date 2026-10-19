// Hand-built models of two buildings first seen in YouTube campus films (2026-10-19):
//
// อาคารอิฐข้างสกายวอล์ก (OSM way 265596520, unnamed): the five-storey brick building at the north end of the
// CMKL Sky Walk, with Lawson 108 in its ground floor. From the Campus Tour (youtu.be/-hBd_k2Ld5E 19:40, looking
// north-east from the Sky Walk deck) and Google Maps satellite imagery (four parts round a small yard: a west
// block and a central bar with solar panels, a flat-roofed block north of the bar, a south block on the road).
//   red brick walls crossed by thin white floor bands, single tall narrow windows; the south block steps back at
//   its west end, each storey edged by a white slab; flat roofs, solar panels on the west block and the bar
//
// อาคาร 2 ชั้นริมสนามบาส (not in OSM; outline traced from the satellite imagery): the long two-storey block
// between the basketball court and the HM / SIIE building. From the SIIE film (youtu.be/lod-jYKKEZ0 5:40,
// looking south across the court) and the satellite imagery.
//   pale pink render in a white frame; the east part plain with pilasters, the west part open walkways on both
//   floors behind square white columns with dark grey rails; a flat roof with a deep white fascia
// Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up.
import { Acc, F, onFace, facade, block, solar, mats, meshes, BASE_MATS } from './kit.js';

const SPEC = { ...BASE_MATS, brick: { color: '#c0703f' }, band: '#f2efe9', glass: { color: '#4f5c63' }, pink: '#e6cfc6',
  white: '#f3f2ee', rail: { color: '#4b4f53', roughness: 0.5, metalness: 0.3 }, dark: '#3a3d40' };

// brick facade: white floor bands, single narrow windows per bay
function brickFace(A, f, a0, a1, o) {
  const { y0 = 0, G, FL, n, bay = 3.2 } = o;
  onFace(A, 'brick', f, a0, a1, y0, y0 + G + (n - 1) * FL, 0, 0.04);
  for (let k = 0; k < n; k++) {
    const yb = y0 + (k === 0 ? 0 : G + (k - 1) * FL), yt = y0 + G + k * FL;
    if (k > 0) onFace(A, 'band', f, a0 - 0.1, a1 + 0.1, yb - 0.12, yb + 0.12, 0, 0.12);
    const bays = Math.max(1, Math.round((a1 - a0) / bay)), w = (a1 - a0) / bays;
    for (let i = 0; i < bays; i++) {
      const c = a0 + (i + 0.5) * w;
      onFace(A, 'glass', f, c - 0.45, c + 0.45, yb + 0.9, yt - 0.5, 0.04, 0.07);
    }
  }
  const top = y0 + G + (n - 1) * FL;
  onFace(A, 'band', f, a0 - 0.1, a1 + 0.1, top - 0.1, top + 0.6, 0, 0.14);   // white coping
}

function brickBlock(A, x0, x1, z0, z1, o, skip = '') {
  const top = (o.y0 || 0) + o.G + (o.n - 1) * o.FL;
  A.box('brick', x0, x1, o.y0 || 0, top, z0, z1);
  const list = { n: [F('z', z0, -1), x0, x1], s: [F('z', z1, 1), x0, x1], w: [F('x', x0, -1), z0, z1], e: [F('x', x1, 1), z0, z1] };
  for (const [k, [f, a0, a1]] of Object.entries(list)) if (!skip.includes(k)) brickFace(A, f, a0, a1, o);
  A.box('roof', x0 + 0.3, x1 - 0.3, top, top + 0.12, z0 + 0.3, z1 - 0.3);
  return top;
}

export function buildScib(owner) {
  const A = new Acc();
  const o = { G: 4.2, FL: 3.6, n: 5 };
  // west block: over the Lawson shop (which stays as its own model) the upper floors only
  brickBlock(A, 44, 55, -120.5, -106, o, 'e');
  brickBlock(A, 44, 55, -134.5, -120.5, { ...o, y0: 4.2, G: 3.6, n: 4 }, 'e');
  A.box('dark', 44.2, 54.8, 0, 4.2, -134.3, -133.9);
  solar(A, 44.5, 54.5, -134, -107, 4.2 + 3.6 * 4 + 0.1);
  // central bar with solar panels, flat-roofed block north of it
  const t = brickBlock(A, 55, 84, -124, -110, o, 'w');
  solar(A, 56, 83, -123.5, -110.5, t + 0.1);
  brickBlock(A, 55, 78.5, -134.8, -124, { ...o, n: 4 }, 'ws');
  // south block on the road: stepped back at the west end, each storey edged by a white slab
  brickBlock(A, 67, 96, -110, -90.5, o, 'n');
  brickBlock(A, 78.5, 95.5, -122, -110, o, 'nw');
  for (let k = 1; k <= 5; k++) {
    const y = k === 1 ? o.G : o.G + (k - 1) * o.FL;
    A.box('band', 62.5, 67, y - 0.2, y + 0.1, -105.5, -98);                         // balcony slabs at the step
    A.box('rail', 62.6, 62.7, y + 0.1, y + 1.1, -105.5, -98);
  }
  A.box('brick', 62.5, 63, 0, o.G + 4 * o.FL, -98, -97.4);
  return { meshes: meshes(A, mats(SPEC), owner), top: o.G + 4 * o.FL + 0.7 };
}

export function buildCourtBlock(owner) {
  const A = new Acc();
  const X0 = -342, X1 = -295, Z0 = 117.5, Z1 = 128.5, G = 3.8, FL = 3.6, H = G + FL;
  const XW = -318;                                                                   // west walkways | east plain part
  A.box('pink', XW, X1, 0, H, Z0, Z1);
  A.box('pink', X0, XW, 0, H, Z0 + 2.6, Z1);
  // east part: pilasters and blank panels on the north, small high windows
  const N = F('z', Z0, -1);
  for (let x = XW; x <= X1 - 0.5; x += 3.4) onFace(A, 'white', N, x - 0.25, x + 0.25, 0, H, 0, 0.25);
  for (const y of [G, H]) onFace(A, 'white', N, XW, X1, y - 0.3, y + 0.1, 0, 0.3);
  for (let x = XW + 2.7; x < X1 - 1; x += 6.8) onFace(A, 'glass', N, x - 0.6, x + 0.6, G + 2.0, G + 2.9, 0, 0.05);
  // west part: open walkways on both floors behind square white columns, dark grey rails, doors and windows
  for (let x = X0 + 0.4; x <= XW; x += 3.6) A.box('white', x - 0.3, x + 0.3, 0, H, Z0, Z0 + 0.6);
  A.box('white', X0, XW, G - 0.3, G, Z0, Z0 + 2.6, false);                            // walkway slab
  A.box('rail', X0, XW, G + 0.9, G + 1.0, Z0 + 0.05, Z0 + 0.15);
  for (let x = X0 + 0.4; x < XW; x += 0.9) A.box('rail', x, x + 0.04, G, G + 0.9, Z0 + 0.08, Z0 + 0.12);
  for (let x = X0 + 2; x < XW - 1; x += 3.6) for (const y of [0.9, G + 0.9]) onFace(A, 'glass', F('z', Z0 + 2.6, -1), x - 0.8, x + 0.8, y, y + 1.6, 0, 0.05);
  // deep white fascia and flat roof
  A.box('white', X0 - 0.4, X1 + 0.4, H, H + 0.8, Z0 - 0.4, Z1 + 0.4);
  A.box('roof', X0, X1, H + 0.8, H + 0.85, Z0, Z1);
  for (const f of [F('z', Z1, 1), F('x', X0, -1), F('x', X1, 1)]) {
    const [a0, a1] = f.ax === 'z' ? [X0, X1] : [Z0, Z1];
    facade(A, f, a0, a1, { G, FL, n: 2, style: 'punched', bay: 3.4, mats: { band: 'white' } });
  }
  return { meshes: meshes(A, mats(SPEC), owner), top: H + 0.85 };
}

export const SCIB_OUTLINE = [[54.6, -134.3], [77.8, -134.8], [78.4, -121.8], [95.3, -121.7], [96.1, -90.5], [66.8, -90.0],
  [66.7, -98.2], [69.7, -98.3], [69.5, -104.5], [66.8, -105.8], [44.2, -106.2], [44.0, -114.2], [43.9, -120.4], [55.1, -120.8], [54.6, -134.3]];
export const COURTBLOCK_OUTLINE = [[-342, 117.5], [-295, 117.5], [-295, 128.5], [-342, 128.5], [-342, 117.5]];
