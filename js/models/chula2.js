// Hand-built model of จุฬาภรณ์วลัยลักษณ์ 2 (Faculty of Science, OSM way 265574874).
// Surveyed 2026-10-17 from Google Maps satellite imagery (the plan curving round its north-west side, solar panels
// on the roof) and Google Street View from the roads on the north, west and east sides (the curved north face with
// "SCHOOL OF SCIENCE" in red letters, the entrance on the east, the faculty's Thai name on the east end).
// Photos were only looked at.
//
// x = east, z = south, y = up.
//   six storeys; white render with deep continuous sunshade slabs at every floor and strip windows between;
//   a red-brick ground floor behind round white columns; the plan curves round from the west end to the
//   north-east corner; flat roof with solar panels
import { Acc, F, onFace, ringStack, solar, mats, meshes, BASE_MATS } from './kit.js';

const RING = [[171, -270], [171, -242], [125, -240], [125, -248], [130, -252], [134, -256], [138, -259], [144, -262],
  [149, -265], [155, -267], [161, -269], [166, -270]];

export function buildChula2(owner) {
  const A = new Acc();
  const G = 4.4, FL = 3.6, N = 6;
  const top = ringStack(A, RING, { y0: G, G: FL, n: N - 1, depth: 1.1 });
  // ground floor: brick behind round columns
  const cx = 150, cz = -254;
  const inset = RING.map(([x, z]) => { const l = Math.hypot(x - cx, z - cz); return [x - ((x - cx) / l) * 2.2, z - ((z - cz) / l) * 2.2]; });
  A.prism('brick', inset, 0, G, { top: false });
  for (let i = 0; i < RING.length; i++) {
    const [x0, z0] = RING[i], [x1, z1] = RING[(i + 1) % RING.length];
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 6.5));
    for (let j = 0; j < n; j++) { const t = j / n; A.cyl('wall', x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 0.45, 0, G, 10); }
  }
  A.prism('band', RING.map(([x, z]) => { const l = Math.hypot(x - cx, z - cz); return [x + ((x - cx) / l) * 1.1, z + ((z - cz) / l) * 1.1]; }), G - 0.2, G + 0.3);
  // entrance on the east: glazed stair strip
  onFace(A, 'glass', F('x', 171, 1), -258, -254, G, top - 1, 0, 0.6);
  A.prism('roof', RING.map(([x, z]) => [x + (cx - x) * 0.02, z + (cz - z) * 0.02]), top, top + 0.1, { sides: false });
  solar(A, 140, 169, -258, -243, top + 0.1);

  const MAT = mats({ ...BASE_MATS, wall: '#f1f0ec', band: '#f7f6f2', brick: { color: '#b4553f' } });
  return { meshes: meshes(A, MAT, owner), top: top + 1 };
}

export const CHULA2_OUTLINE = [...RING, RING[0]];
