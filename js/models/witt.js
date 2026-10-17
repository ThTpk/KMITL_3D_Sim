// Hand-built model of ตึก วท. (OSM way 265596518), the long two-storey block on the road south of the science
// canteen. Surveyed 2026-10-17 from Google Maps satellite imagery (a long light roof with a lower part on the
// north-east) and Google Street View from the road along its south side. Photos were only looked at.
//
// x = east, z = south, y = up.
//   two storeys of white render: strip windows of louvred glass on both floors under a deep white overhang,
//   AC units on brackets; a flat roof with a raised clerestory strip; a single-storey part on the north-east
import { Acc, F, onFace, block, mats, meshes, BASE_MATS } from './kit.js';

export function buildWitt(owner) {
  const A = new Acc();
  const t = block(A, 146, 206, -113, -101, { G: 4.2, FL: 3.8, n: 2, bay: 3.4, bandDepth: 1.0 }, {});
  A.box('glass', 150, 202, t, t + 1.0, -108.5, -105.5);
  A.box('roof', 149.5, 202.5, t + 1.0, t + 1.15, -109, -105);
  block(A, 177, 185, -123, -113, { G: 4.2, n: 1, bay: 3 }, { s: false });
  for (let x = 150; x < 204; x += 6.8) onFace(A, 'metal', F('z', -101, 1), x, x + 0.9, 4.6, 5.3, 0, 0.6);

  const MAT = mats({ ...BASE_MATS, wall: '#f0efea', glass: { color: '#7e8a8e' } });
  return { meshes: meshes(A, MAT, owner), top: t + 1.2 };
}

export const WITT_OUTLINE = [[146, -113], [177, -113], [177, -123], [185, -123], [185, -113], [206, -113], [206, -101], [146, -101], [146, -113]];
