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
//   south-east (2026-10-20): two five-storey blocks with brick south walls, the east one with a deep egg-crate on
//   the east road; the old two-storey workshops round the service yard are gone (bare slab)
//   a low two-storey white building with a louvred upper floor between the hall and the five-storey block
//   north end (2026-10-19): broad steps, a four-storey glass building under a large flat steel canopy on four
//   white round columns branching into steel struts
import { Acc, F, onFace, facade, block, solar, hip, gable, tube, mats, meshes, BASE_MATS } from './kit.js';

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
  block(A, 300, 312, -242, -150, { ...o, style: 'corridor', spandrel: null }, { n: brick, s: false });
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
  // south-east (reworked 2026-10-20 from Street View on the south and east roads, Esri/Google satellite):
  // two five-storey blocks, each ending at the south in a red-brick wall crossed by white floor bands
  //   x 302..313 down to the south road: white with windows facing east, a light steel greenhouse frame on
  //   part of the roof; small windows near the top of the brick end wall
  //   x 330..350: a deep white egg-crate of recessed bays along the east road, the name in grey raised letters
  //   along the parapet of the brick south wall
  const o5 = { G: 4.4, FL: 3.8, n: 5, bay: 3.8 }, T5 = 4.4 + 4 * 3.8;               // 19.6
  block(A, 302, 313, -150, -101, { ...o5, style: 'band' }, { n: false, w: { style: 'band', spandrel: null }, s: brick, e: { style: 'band', spandrel: null } });
  for (const x of [304.5, 309.5]) A.box('glass', x - 0.6, x + 0.6, T5 - 3, T5 - 1.6, -100.96, -100.92);
  for (let z = -147; z <= -105; z += 3.5) A.box('steel', 303, 303.12, T5, T5 + 3, z, z + 0.12);   // greenhouse frame
  for (let z = -147; z <= -105; z += 3.5) A.box('steel', 311, 311.12, T5, T5 + 3, z, z + 0.12);
  A.box('greenhouse', 303, 311.12, T5 + 2.9, T5 + 3.05, -147, -104.9);
  // the low white building beside it (added 2026-10-20 from the south-road Street View and the satellite roof):
  // x 291..302, two storeys of white render, barred windows on the ground floor and a continuous band of
  // horizontal louvres round the upper floor; a small bin shelter with a green corrugated roof on the pavement
  const LT = block(A, 291, 302, -153, -101, { G: 3.8, FL: 3.4, n: 2, bay: 3.6, style: 'punched' }, { e: false, n: false });
  for (let y = 4.4; y < LT - 0.3; y += 0.38) {
    A.box('louvre', 290.75, 302, y, y + 0.12, -101.05, -100.75);                     // south face
    A.box('louvre', 290.75, 291.05, y, y + 0.12, -153, -101);                        // west face
  }
  for (const [x, z] of [[288.3, -100.6], [295.7, -100.6], [288.3, -97.4], [295.7, -97.4]]) A.box('wall', x - 0.15, x + 0.15, 0, 2.5, z - 0.15, z + 0.15);
  A.box('wall', 288.3, 295.7, 0, 1.1, -97.55, -97.25);                                 // low front wall
  gable(A, 'greenRoof', 288, 296, -100.9, -97.1, 2.5, 0.8, { eave: 0.5 });
  block(A, 330, 350, -200, -150, { ...o5 }, { n: false, w: { style: 'band' }, e: { style: 'grid', depth: 1.3 }, s: brick });
  for (let i = 0; i < 24; i++) A.box('letter', 332 + i * 0.68, 332.45 + i * 0.68, T5 + 0.05, T5 + 0.75, -149.7, -149.6);
  block(A, 312, 330, -180, -150, o, { e: false, w: false });
  A.box('lawn', 312, 330, 0, 0.08, -200, -180);
  solar(A, 318, 341, -211, -201, TOP + 0.1);
  solar(A, 331, 349, -199, -151, T5 + 0.1);
  // the two-storey workshop wings that stood round a service yard south of x 313..352 (white, brick panels,
  // deep eaves on brackets, a raised loading walk) have been demolished: a bare concrete slab with rubble
  A.box('slab', 313, 352, 0, 0.2, -148, -101);
  for (const [x, z, w, h] of [[322, -140, 3, 0.8], [338, -127, 4, 0.6], [330, -108, 5, 1.0], [344, -112, 2.5, 0.7], [318, -118, 2, 0.5]])
    A.box('rubble', x, x + w, 0.2, 0.2 + h, z, z + w * 0.7);
  // hall with a red hipped roof, two-storey annex with solar panels
  block(A, 276, 292, -160, -128, { G: 5, n: 1, style: 'punched', bay: 4 }, {});
  hip(A, 'tile', 276, 292, -160, -128, 5, 4.2, 1.2);
  const ta = block(A, 262, 276, -157, -127, { G: 4.2, FL: 3.8, n: 2, bay: 3.8 }, { e: false });
  solar(A, 263, 275, -156, -128, ta + 0.1);

  const MAT = mats({ ...BASE_MATS, wall: '#eeece6', band: '#f5f4f0', glass: { color: '#7d8a8f' }, base: '#e9e7e1',
    tile: { color: '#a8493a', roughness: 0.9 }, lawn: { color: '#6c8b4b', roughness: 1 }, skylight: { color: '#c9d2d6', roughness: 0.3, metalness: 0.2 },
    step: { color: '#b9b6b0', roughness: 0.95 }, stone: { color: '#4b4d50', roughness: 0.8 }, glassDark: { color: '#5d6d77', roughness: 0.25, metalness: 0.3 },
    balRail: { color: '#b8c7cc', roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.5 }, mullion: { color: '#2e3134', roughness: 0.5 },
    canopy: { color: '#b4b8bb', roughness: 0.6, metalness: 0.3 }, steel: { color: '#cdd2d6', roughness: 0.4, metalness: 0.4 },
    greenhouse: { color: '#dfe6e3', roughness: 0.3, transparent: true, opacity: 0.45 }, letter: { color: '#77756f', roughness: 0.7 },
    slab: { color: '#a9a49b', roughness: 1 }, louvre: '#f1f0eb', greenRoof: { color: '#6f9a6a', roughness: 0.7 }, rubble: { color: '#8a8278', roughness: 1 } });
  return { meshes: meshes(A, MAT, owner), top: 21.6 };
}

export const JOMTRAI_OUTLINE = [
  [262, -213], [300, -213], [300, -242], [347, -242], [350, -212], [350, -150], [313, -150], [313, -101], [291, -101],
  [291, -127], [262, -127], [262, -160], [292, -160], [292, -168], [256.5, -168], [256.5, -176], [262, -176], [262, -213],
];
