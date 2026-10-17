// Hand-built model of ตึกปฏิบัติการณ์หลังใหม่ (OSM way 265588799), the ten-storey white laboratory building.
// Surveyed 2026-10-17 from Google Maps satellite imagery (the tower roof with solar panels, which leans about
// 6 m north in the imagery and was moved south; the lower south part) and Google Street View from the roads on
// the south, east and north sides. Photos were only looked at.
//
// x = east, z = south, y = up.
//   all white: a deep egg-crate of fins and slabs round recessed windows with AC units, broad pilasters every
//   few bays, full-height strips of vertical louvres at the stairs; the ground floor is an open car park
//   tower x 188..245 / z -150..-122, ten storeys; a four-storey part south-east x 213..251 / z -122..-102
//   a canopy on round columns over the entrance on the north
import { Acc, F, onFace, facade, block, pilotis, solar, mats, meshes, BASE_MATS } from './kit.js';

const G = 4.6, FL = 3.6;

export function buildNewlab(owner) {
  const A = new Acc();
  const o = { y0: G, G: FL, bay: 3.6, style: 'grid', depth: 1.0 };
  const t10 = block(A, 188, 245, -150, -122, { ...o, n: 9 }, {});
  pilotis(A, 188, 245, -150, -122, G, { step: 7.2, w: 1.2 });
  for (const x of [201, 231]) onFace(A, 'louvre', F('z', -150, -1), x, x + 2.4, G, t10, 0, 1.05);
  for (const z of [-140, -130]) onFace(A, 'louvre', F('x', 245, 1), z, z + 2.4, G, t10, 0, 1.05);
  A.box('band', 188, 245, t10, t10 + 1.2, -150, -149.6); A.box('band', 188, 245, t10, t10 + 1.2, -122.4, -122);
  solar(A, 190, 243, -148, -124, t10 + 0.1);
  const t4 = block(A, 213, 251, -122, -102, { ...o, n: 3 }, { n: false });
  pilotis(A, 213, 251, -122, -102, G, { step: 7.6, w: 1.2 });
  A.box('roof', 213.3, 250.7, t4, t4 + 0.12, -121.7, -102.3);
  // entrance canopy on the north
  A.box('band', 205, 220, 4.2, 4.7, -158, -150);
  for (const x of [206, 219]) A.cyl('wall', x, -157, 0.45, 0, 4.2, 12);

  const MAT = mats({ ...BASE_MATS, wall: '#f3f3f0', band: '#f7f7f4', glass: { color: '#7d8a92' }, louvre: { color: '#d9dad6', roughness: 0.6 } });
  return { meshes: meshes(A, MAT, owner), top: t10 + 1.2 };
}

export const NEWLAB_OUTLINE = [[188, -150], [245, -150], [245, -122], [251, -122], [251, -102], [213, -102], [213, -122], [188, -122], [188, -150]];
