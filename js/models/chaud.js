// Hand-built model of หอประชุมจุฬาภรณ์วลัยลักษณ์ (OSM way 265574872).
// Surveyed 2026-10-17 from Google Maps satellite imagery (a red hipped roof with solar panels) and Google Street
// View from the walk on its south side (the front with the name), the north-east and south-east corners and
// the west walk. Photos were only looked at.
//
// x = east, z = south, y = up.
//   three storeys: the ground floor set back behind square red-brick columns; white upper walls with red-brick
//   parapet panels, a band of deep white louvre fins across the first floor, a row of clerestory windows under
//   the eaves; the name on the south front; a low red hipped roof with solar panels; a covered bridge to the
//   building to the east
import { Acc, F, onFace, mats, meshes, hip, BASE_MATS } from './kit.js';

export function buildChaud(owner) {
  const A = new Acc();
  const X0 = 135, X1 = 169, Z0 = -230, Z1 = -195, G = 4.4, H = 12.6;
  A.box('wall', X0, X1, G, H, Z0, Z1);
  A.box('glassDark', X0 + 2.5, X1 - 2.5, 0, G, Z0 + 2.5, Z1 - 2.5);
  for (let x = X0 + 0.6; x <= X1; x += 6.5) for (const z of [Z0 + 0.6, Z1 - 0.6]) A.box('brick', x - 0.6, x + 0.6, 0, G, z - 0.6, z + 0.6);
  for (let z = Z0 + 6.5; z < Z1 - 1; z += 6.5) for (const x of [X0 + 0.6, X1 - 0.6]) A.box('brick', x - 0.6, x + 0.6, 0, G, z - 0.6, z + 0.6);
  const faces = [[F('z', Z1, 1), X0, X1], [F('z', Z0, -1), X0, X1], [F('x', X0, -1), Z0, Z1], [F('x', X1, 1), Z0, Z1]];
  for (const [f, a0, a1] of faces) {
    onFace(A, 'band', f, a0 - 0.6, a1 + 0.6, G - 0.3, G + 0.3, 0, 1.0);
    onFace(A, 'brick', f, a0 + 3, a1 - 3, G + 0.4, G + 1.4, 0, 0.12);
    for (let y = G + 1.6; y < G + 3.6; y += 0.5) onFace(A, 'band', f, a0, a1, y, y + 0.22, 0, 0.9);
    onFace(A, 'glass', f, a0 + 2, a1 - 2, H - 2.2, H - 0.6, 0, 0.05);
  }
  hip(A, 'tile', X0, X1, Z0, Z1, H, 3.2, 1.0);
  for (let z = Z0 + 3; z < Z1 - 6; z += 2.2) for (let x = X0 + 6; x < X1 - 6; x += 2.1) {
    const y = H + 3.2 * (1 - Math.abs(z - (Z0 + Z1) / 2) / ((Z1 - Z0) / 2 + 1)) + 0.15;
    A.box('solar', x, x + 1.9, y, y + 0.12, z, z + 1.8);
  }
  // name sign on the south front
  onFace(A, 'sign', F('z', Z1, 1), 140, 162, G + 4.2, G + 5.2, 0, 0.06);
  // covered bridge east
  A.box('band', X1, X1 + 12, 8.2, 8.8, -214, -210);

  const MAT = mats({ ...BASE_MATS, wall: '#efede6', band: '#f5f3ee', glassDark: { color: '#3d4245' }, brick: { color: '#b0533d' },
    tile: { color: '#a24a37', roughness: 0.9 }, sign: { color: '#b98a3a', metalness: 0.5, roughness: 0.4 } });
  return { meshes: meshes(A, MAT, owner), top: H + 3.4 };
}

export const CHAUD_OUTLINE = [[135, -230], [169, -230], [169, -195], [135, -195], [135, -230]];
