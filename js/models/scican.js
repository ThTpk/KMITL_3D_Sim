// Hand-built model of โรงอาหาร คณะวิทยาศาสตร์ (science canteen, OSM way 265596517).
// Surveyed 2026-10-17 from Google Maps satellite imagery (a broad hall roofed in solar panels, a raised lantern
// along its middle) and Google Street View from the car park to the east (the open side under the tall roof, the
// slatted shade canopy in front). Photos were only looked at.
//
// x = east, z = south, y = up.
//   a tall single-storey hall open on the sides: a flat roof on slender steel columns, a raised clerestory lantern
//   down the middle, solar panels over the rest; a white kitchen block along the west side; a white slatted shade
//   canopy on posts in front of the east side
import { Acc, block, solar, mats, meshes, BASE_MATS } from './kit.js';

export function buildScican(owner) {
  const A = new Acc();
  const X0 = 122, X1 = 170, Z0 = -140, Z1 = -113, H = 7.5;
  block(A, X0, X0 + 8, Z0, Z1, { G: 5, n: 1, style: 'punched', bay: 4 }, { e: false });
  for (let x = X0 + 10; x <= X1; x += 6) for (const z of [Z0 + 0.3, Z1 - 0.3, (Z0 + Z1) / 2]) A.cyl('metal', x - 0.3, z, 0.18, 0, H, 8);
  A.box('roofSheet', X0, X1 + 0.5, H, H + 0.4, Z0 - 0.5, Z1 + 0.5);
  A.box('band', X0, X1 + 0.5, H - 0.6, H, Z0 - 0.5, Z0); A.box('band', X0, X1 + 0.5, H - 0.6, H, Z1, Z1 + 0.5);
  A.box('glass', X0 + 6, X1 - 2, H + 0.4, H + 1.8, -129, -124);
  A.box('roofSheet', X0 + 5.5, X1 - 1.5, H + 1.8, H + 2.0, -129.5, -123.5);
  solar(A, X0 + 1, X1 - 1, Z0, -130, H + 0.4); solar(A, X0 + 1, X1 - 1, -123, Z1, H + 0.4);
  A.box('paving', X0 + 8, X1, 0, 0.15, Z0, Z1);
  // slatted shade canopy east
  for (let z = Z0 + 2; z < Z1; z += 0.8) A.box('band', X1 + 2, X1 + 12, 3.6, 3.75, z, z + 0.3);
  for (const x of [X1 + 2.5, X1 + 11.5]) for (const z of [Z0 + 2, Z1 - 2]) A.box('band', x - 0.15, x + 0.15, 0, 3.6, z - 0.15, z + 0.15);

  const MAT = mats({ ...BASE_MATS, wall: '#f1f0ec', roofSheet: '#b7b9b8' });
  return { meshes: meshes(A, MAT, owner), top: H + 2 };
}

export const SCICAN_OUTLINE = [[122, -140], [170, -140], [170, -113], [122, -113], [122, -140]];
