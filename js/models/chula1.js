// Hand-built model of จุฬาภรณ์วลัยลักษณ์ 1 (OSM way 3568617), an L of three wings round a car park.
// Surveyed 2026-10-17 from Google Maps satellite imagery (the wings, solar panels on the west wing) and Google
// Street View from the car park in the crook of the L (the entrance tower with the name), the road along the
// east side and the north-east corner. Photos were only looked at.
//
// x = east, z = south, y = up.
//   seven storeys of white render: deep continuous sunshade slabs at every floor with strip windows of green-grey
//   glass between; a plain white parapet
//   north wing x 180..247, west wing to z -191, east wing to z -151; the entrance tower fills the inner corner on
//   a diagonal, a red-brick panel up its middle above a band of white louvres, a glazed lobby on round columns
//   under it, broad steps to the car park
import { Acc, F, place, facade, block, solar, mats, meshes, BASE_MATS } from './kit.js';

const G = 4.4, FL = 3.6, N = 7, TOP = G + (N - 1) * FL;

export function buildChula1(owner) {
  const A = new Acc();
  const o = { G, FL, n: N, bay: 4.2, bandDepth: 1.1, mats: { glass: 'glass' } };
  block(A, 180, 247, -218, -200, o, { s: { skip: [[206, 221]] } });
  block(A, 180, 206, -200, -191, o, { n: false, e: false });
  block(A, 221, 247, -200, -151, o, { n: false, w: { skip: [[-200, -186]] } });
  solar(A, 181, 205, -217, -192, TOP + 0.1);
  // entrance tower on the diagonal of the inner corner
  const T = new Acc();
  T.box('wall', -7, 7, 0, TOP + 2, -6, 0);
  T.box('brick', -3.2, 3.2, 9, TOP + 1, 0, 0.1);
  for (let y = 5.2; y < 8.8; y += 0.6) T.box('band', -6, 6, y, y + 0.25, 0, 0.9);
  T.box('glass', -5, 5, 0.8, 4.6, -4, -3.9);
  T.box('band', -6, 6, 4.4, 4.9, -4.5, 1);
  for (const x of [-4.5, 0, 4.5]) T.cyl('wall', x, 0.2, 0.4, 0, 4.4, 10);
  for (let s = 0; s < 5; s++) T.box('paving', -6, 6, 0, 0.75 - s * 0.15, 0.2 + s * 0.6, 0.8 + s * 0.6);
  place(A, T, 212.5, -189, Math.PI * 0.75);

  const MAT = mats({ ...BASE_MATS, wall: '#f2f1ed', band: '#f8f7f3', glass: { color: '#7a8c86' }, brick: { color: '#a9503c' } });
  return { meshes: meshes(A, MAT, owner), top: TOP + 2 };
}

export const CHULA1_OUTLINE = [[180, -218], [247, -218], [247, -151], [221, -151], [221, -186], [206, -191], [180, -191], [180, -218]];
