// Hand-built model of ตึก L (Engineering Lecture Building L, KMITL building register EN-21), east of the L canteen and
// the 7-Eleven, south of ECC. It is not in OpenStreetMap; its outline is traced on Google Maps satellite imagery
// and stored in overrides.json (id -5, "ll"). The register still lists the old one-storey building; the new one
// has four storeys. Surveyed 2026-10-19 from the user's KMITL Virtual Tour photos (the south front from under the
// covered walk along the railway) and the imagery (flat roof with a square skylight in the middle, a row of dark
// plant pits along the south side). Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up. Walls x -283..-241, z -118..-94.
//   four storeys of plain white render; the south front steps in and out: a set-back middle with three windows a
//   floor over a glazed entrance under a dark steel canopy, two bays standing forward on either side with big
//   gridded windows, narrow slots of windows at the ends; steps across the entrance
import { Acc, F, onFace, mats, meshes, BASE_MATS } from './kit.js';

const X0 = -283, X1 = -241, ZN = -118, ZS = -94, G = 4.2, FL = 3.8, NF = 4;
const TOP = G + (NF - 1) * FL + 1.0;                                            // parapet top, 16.6

export function buildLbld(owner) {
  const A = new Acc();
  const lv = (k) => (k === 0 ? 0 : G + (k - 1) * FL);                          // bottom of floor k (0 = ground)
  // massing: the main block, the two bays standing forward on the south, the set-back middle
  const MX0 = -268, MX1 = -256, BAY = 1.4;
  A.box('wall', X0, X1, 0, TOP, ZN, ZS - BAY);
  A.box('wall', X0, MX0, 0, TOP, ZS - BAY, ZS);
  A.box('wall', MX1, X1, 0, TOP, ZS - BAY, ZS);
  A.box('roof', X0 + 0.3, X1 - 0.3, TOP, TOP + 0.1, ZN + 0.3, ZS - 0.3);
  A.box('glassRoof', -268, -258, TOP, TOP + 1.2, -112, -104);                   // square skylight
  const S = F('z', ZS, 1), Sm = F('z', ZS - BAY, 1);
  for (let k = 0; k < NF; k++) {
    const yb = lv(k), yt = k === NF - 1 ? TOP - 1.0 : lv(k + 1);
    // forward bays: big gridded windows
    for (const b0 of [MX0 - 10, MX1 + 2]) {
      const b1 = b0 + 8;
      onFace(A, 'glass', S, b0, b1, yb + 0.9, yt - 0.5, 0, 0.04);
      for (let a = b0; a <= b1 + 0.01; a += 2) onFace(A, 'mullion', S, a - 0.05, a + 0.05, yb + 0.9, yt - 0.5, 0, 0.07);
      onFace(A, 'mullion', S, b0, b1, (yb + yt) / 2 - 0.05, (yb + yt) / 2 + 0.05, 0, 0.07);
    }
    // narrow end slots
    for (const a of [X0 + 1.4, X1 - 2.6]) onFace(A, 'glass', S, a, a + 1.2, yb + 0.9, yt - 0.5, 0, 0.04);
    // set-back middle: three windows a floor above the ground
    if (k > 0) for (let i = 0; i < 3; i++) {
      const a = MX0 + 1.6 + i * 3.2;
      onFace(A, 'glass', Sm, a, a + 2.4, yb + 1.0, yt - 0.6, 0, 0.04);
      onFace(A, 'mullion', Sm, a + 1.15, a + 1.25, yb + 1.0, yt - 0.6, 0, 0.07);
    }
  }
  // glazed entrance, dark steel canopy sloping down to the front, steps
  onFace(A, 'glass', Sm, MX0 + 2, MX1 - 2, 0.5, G - 0.6, 0, 0.04);
  for (let a = MX0 + 2; a <= MX1 - 2 + 0.01; a += 1.6) onFace(A, 'mullion', Sm, a - 0.05, a + 0.05, 0.5, G - 0.6, 0, 0.07);
  A.quad('canopy', [MX0 - 2, G + 0.4, ZS - BAY], [MX1 + 2, G + 0.4, ZS - BAY], [MX1 + 2, G - 0.2, ZS + 3.4], [MX0 - 2, G - 0.2, ZS + 3.4]);
  A.quad('canopy', [MX0 - 2, G - 0.2, ZS + 3.4], [MX1 + 2, G - 0.2, ZS + 3.4], [MX1 + 2, G + 0.4, ZS - BAY], [MX0 - 2, G + 0.4, ZS - BAY]);
  A.box('canopy', MX0 - 2, MX1 + 2, G - 0.6, G - 0.2, ZS + 3.2, ZS + 3.5);
  for (let s = 0; s < 3; s++) A.box('paving', MX0 - 4, MX1 + 4, 0, 0.5 - s * 0.16, ZS - BAY, ZS + 1 + s * 0.6);
  // plain windows on the other faces
  for (const [f, a0, a1] of [[F('z', ZN, -1), X0, X1], [F('x', X0, -1), ZN, ZS], [F('x', X1, 1), ZN, ZS]])
    for (let k = 0; k < NF; k++) {
      const yb = lv(k), yt = k === NF - 1 ? TOP - 1.0 : lv(k + 1);
      for (let a = a0 + 2; a < a1 - 3; a += 4.5) onFace(A, 'glass', f, a, a + 2.4, yb + 1.0, yt - 0.6, 0, 0.04);
    }

  const MAT = mats({ ...BASE_MATS, wall: '#f3f3f1', mullion: { color: '#e9ecee', metalness: 0.3, roughness: 0.4 }, canopy: { color: '#3d4247', roughness: 0.5, metalness: 0.4 },
    glassRoof: { color: '#9fb2bd', roughness: 0.25, metalness: 0.3 }, glass: { color: '#4d5a62' } });
  return { meshes: meshes(A, MAT, owner), top: TOP + 1.2 };
}

export const LBLD_OUTLINE = [[-283, -118], [-241, -118], [-241, -94], [-283, -94], [-283, -118]];
