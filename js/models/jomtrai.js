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
import { Acc, F, onFace, facade, block, solar, hip, mats, meshes, BASE_MATS } from './kit.js';

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
  // north hall: blank brick with tall slits
  A.box('brick', 312, 347, 0, TOP + 1, -242, -212);
  A.box('base', 311.8, 347.2, 0, 1.2, -242.2, -211.8);
  for (let x = 315; x < 345; x += 4) onFace(A, 'dark', F('z', -242, -1), x, x + 1.2, 1.6, TOP - 0.6, 0, 0.04);
  facade(A, F('x', 347, 1), -242, -212, { G, FL, n: N, bay: 4, spandrel: 'brick' });
  A.box('roof', 312.3, 346.7, TOP + 1, TOP + 1.12, -241.7, -212.3);
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
    tile: { color: '#a8493a', roughness: 0.9 }, lawn: { color: '#6c8b4b', roughness: 1 }, skylight: { color: '#c9d2d6', roughness: 0.3, metalness: 0.2 } });
  return { meshes: meshes(A, MAT, owner), top: G + N * FL };
}

export const JOMTRAI_OUTLINE = [
  [262, -213], [300, -213], [300, -242], [347, -242], [350, -212], [350, -150], [348, -150], [348, -106], [300, -106],
  [300, -127], [262, -127], [262, -160], [292, -160], [292, -168], [256.5, -168], [256.5, -176], [262, -176], [262, -213],
];
