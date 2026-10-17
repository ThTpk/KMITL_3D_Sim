// Hand-built model of โรงอาหาร คณะเทคโนโลยีสารสนเทศ (IT faculty canteen, OSM way 314205127).
// Surveyed 2026-10-17 from Google Maps satellite imagery (a square two-storey block, solar panels round a central
// light well with a raised roof, a round stair at the south-west corner) and Google Street View from the road
// to the west and the main road to the south (the block behind trees, its west front and steps).
// Photos were only looked at.
//
// x = east, z = south, y = up.
//   two storeys: an open ground floor of shops and tables behind white columns, a white upper floor with a strip
//   of windows; solar panels round a raised clerestory roof over the central well; a round stair at the corner
import { Acc, block, solar, pilotis, mats, meshes, BASE_MATS } from './kit.js';

export function buildItcan(owner) {
  const A = new Acc();
  const X0 = 427, X1 = 463, Z0 = -383, Z1 = -347, G = 4.4;
  pilotis(A, X0, X1, Z0, Z1, G, { step: 6, inset: 2.5, core: 'shop' });
  const t = block(A, X0, X1, Z0, Z1, { y0: G, G: 4.2, n: 1, bay: 4 });
  for (const [x0, x1, z0, z1] of [[X0, X1, Z0, Z0 + 12], [X0, X1, Z1 - 12, Z1], [X0, X0 + 12, Z0 + 12, Z1 - 12], [X1 - 12, X1, Z0 + 12, Z1 - 12]]) solar(A, x0 + 0.5, x1 - 0.5, z0 + 0.5, z1 - 0.5, t + 0.1);
  block(A, X0 + 13, X1 - 13, Z0 + 13, Z1 - 13, { y0: t, G: 1.6, n: 1, style: 'band', bay: 2.5 });
  A.cyl('wall', X0 + 2, Z1 - 2, 3.2, 0, t + 1, 16);
  for (let s = 0; s < 4; s++) A.box('paving', X0 - 3 + s * 0.6, X0, 0, 0.6 - s * 0.15, Z0 + 8, Z1 - 8);

  const MAT = mats({ ...BASE_MATS, wall: '#f1f0ec', shop: '#6f655a' });
  return { meshes: meshes(A, MAT, owner), top: t + 1.8 };
}

export const ITCAN_OUTLINE = [[427, -383], [463, -383], [463, -347], [427, -347], [427, -383]];
