// Hand-built model of อาคารจอมไตร (OSM way 516308731), a three-storey complex of courtyard blocks.
// Surveyed 2026-10-17 from Google Maps satellite imagery (the blocks, the courtyards, the hipped hall, the solar
// arrays and skylights) and Google Street View: the road along the west side (north-west block, the brick
// entrance tower with the name, the hall), the road along the south side, the road along the east side and the
// north-east corner, and the indoor walkways and courtyards. Photos were only looked at.
//
// x = east, z = south, y = up.
//   three storeys (about 12.5 m) of white render: ribbon windows of grey louvres between white floor bands with
//   red-brick spandrels; large blank red-brick walls on a white base at the block ends and on the north hall
//   (with tall recessed slits)
//   west block around a planted courtyard; a long walkway block x 300..312 running the whole length; the east
//   blocks around a second courtyard; the south block
//   a single-storey hall with a red hipped roof and a two-storey annex with solar panels south-west
//   north end (2026-10-19): broad steps, a four-storey glass building under a large flat steel canopy on four
//   white round columns branching into steel struts
import { Acc, F, onFace, facade, block, solar, hip, tube, mats, meshes, BASE_MATS } from './kit.js';

const G = 4.4, FL = 4.0, N = 3;
const TOP = G + (N - 1) * FL;                                    // 12.4

export function buildJomtrai(owner) {
  const A = new Acc();
  const o = { G, FL, n: N, bay: 3.8, spandrel: 'brick' };
  const brick = { style: 'brick' };
  // west block around a courtyard
  block(A, 262, 300, -213, -200, o, { e: brick, w: brick });
  block(A, 262, 300, -182, -168, o, { e: brick, w: brick });
  block(A, 262, 276, -200, -182, o, { n: false, s: false, e: { style: 'corridor' } });
  block(A, 296, 300, -200, -182, o, { n: false, s: false, w: { style: 'corridor' } });
  A.box('lawn', 276, 296, 0, 0.08, -200, -182);
  solar(A, 263, 299, -212, -201, TOP + 0.1);
  solar(A, 263, 299, -181, -169, TOP + 0.1);
  // brick entrance tower with the name, on the west road
  block(A, 256.5, 262, -176, -168, { G, FL, n: N + 1, style: 'brick', mats: { wall: 'brick' } });
  // long walkway block along x 300..312
  block(A, 300, 312, -242, -106, { ...o, style: 'corridor', spandrel: null }, { n: brick, s: brick });
  // north end (reworked 2026-10-19 from the SIET tour clip, youtu.be/wuoE9wXu3mA 0:30, looking south from the
  // triangle-paved forecourt; the satellite shows one flat grey roof over x 312..347): a broad flight of steps
  // up to a raised entrance terrace, a four-storey glass building with white floor slabs and glass balcony rails
  // set back under a large flat steel canopy, carried on four white round columns that branch into steel struts
  for (let s = 0; s < 8; s++) A.box('step', 314, 345, 0, 0.2 * (s + 1), -242 + s * 0.6, -212);
  A.box('stone', 311.5, 314, 0, 1.8, -242, -228);                                    // dark stone cheek walls
  A.box('stone', 345, 347.5, 0, 1.8, -242, -228);
  const GB = [315, 344, -233, -212], LV = [1.6, 5.8, 9.6, 13.4, 17.2];
  A.box('glassDark', GB[0] + 0.6, GB[1] - 0.6, LV[0], LV[4], GB[2] + 0.6, GB[3]);
  for (let k = 1; k < LV.length; k++) {
    A.box('wall', GB[0], GB[1], LV[k] - 0.35, LV[k], GB[2], GB[3]);                  // white slab
    if (k < LV.length - 1) A.box('balRail', GB[0], GB[1], LV[k], LV[k] + 1.05, GB[2] - 0.02, GB[2] + 0.05);
  }
  for (const x of [GB[0], GB[1] - 0.6]) A.box('wall', x, x + 0.6, LV[0], LV[4], GB[2], GB[3]);
  for (let x = GB[0] + 4; x < GB[1] - 1; x += 4.2) A.box('mullion', x, x + 0.12, LV[0], LV[4] - 0.4, GB[2] + 0.5, GB[2] + 0.62);
  // canopy: deep flat slab with a grey soffit, edged by a thin white fascia
  const CY = 20.5;
  A.box('canopy', 311, 348, CY, CY + 0.9, -244, -211, false);                     // keep the underside
  A.box('wall', 310.8, 348.2, CY + 0.9, CY + 1.05, -244.2, -210.8);
  // four round columns along the front, each branching into six struts under the slab
  for (const x of [319, 326.5, 334, 341.5]) {
    const z = -237.5, yb = 11.5;
    tube(A, 'wall', [x, 1.6, z], [x, yb, z], 0.55, 0.55, 14);
    for (const [dx, dz] of [[-3.6, -4], [3.6, -4], [-3.6, 4], [3.6, 4], [0, -5.5], [0, 5.5]])
      tube(A, 'steel', [x, yb, z], [x + dx, CY, z + dz], 0.16, 0.12, 6);
  }
  // east blocks around the second courtyard
  block(A, 312, 350, -212, -200, o, { e: brick });
  block(A, 330, 350, -200, -150, o, { n: false, e: { spandrel: 'brick' } });
  block(A, 312, 330, -180, -150, o, { e: false, w: false });
  A.box('lawn', 312, 330, 0, 0.08, -200, -180);
  solar(A, 318, 341, -211, -201, TOP + 0.1);
  solar(A, 331, 349, -199, -151, TOP + 0.1, 'skylight');
  // south block
  block(A, 312, 348, -150, -106, o, { n: false, e: brick, s: brick });
  // hall with a red hipped roof, two-storey annex with solar panels
  block(A, 276, 292, -160, -128, { G: 5, n: 1, style: 'punched', bay: 4 }, {});
  hip(A, 'tile', 276, 292, -160, -128, 5, 4.2, 1.2);
  const ta = block(A, 262, 276, -157, -127, { G: 4.2, FL: 3.8, n: 2, bay: 3.8 }, { e: false });
  solar(A, 263, 275, -156, -128, ta + 0.1);

  const MAT = mats({ ...BASE_MATS, wall: '#eeece6', band: '#f5f4f0', glass: { color: '#7d8a8f' }, base: '#e9e7e1',
    tile: { color: '#a8493a', roughness: 0.9 }, lawn: { color: '#6c8b4b', roughness: 1 }, skylight: { color: '#c9d2d6', roughness: 0.3, metalness: 0.2 },
    step: { color: '#b9b6b0', roughness: 0.95 }, stone: { color: '#4b4d50', roughness: 0.8 }, glassDark: { color: '#5d6d77', roughness: 0.25, metalness: 0.3 },
    balRail: { color: '#b8c7cc', roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.5 }, mullion: { color: '#2e3134', roughness: 0.5 },
    canopy: { color: '#b4b8bb', roughness: 0.6, metalness: 0.3 }, steel: { color: '#cdd2d6', roughness: 0.4, metalness: 0.4 } });
  return { meshes: meshes(A, MAT, owner), top: 21.6 };
}

export const JOMTRAI_OUTLINE = [
  [262, -213], [300, -213], [300, -242], [347, -242], [350, -212], [350, -150], [348, -150], [348, -106], [300, -106],
  [300, -127], [262, -127], [262, -160], [292, -160], [292, -168], [256.5, -168], [256.5, -176], [262, -176], [262, -213],
];
