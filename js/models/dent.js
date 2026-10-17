// Hand-built model of คณะทันตแพทยศาสตร์ (Faculty of Dentistry, OSM way 501351775).
// Surveyed 2026-10-17 from Google Maps satellite imagery (a five-storey block with solar panels over its whole
// roof, a lower wing on the south with a grid of small roof lights, a forecourt on the south) and Google Street
// View from the roads on the east, south and west sides. Photos were only looked at.
//
// x = east, z = south, y = up.
//   main block x 222..275 / z -388..-365: five storeys of white render, rows of windows in white frames with thin
//   sunshade hoods, a stair tower stepping up on the east end
//   south wing x 222..265 / z -365..-345: two storeys with a glazed ground floor, purple panels and a curved
//   canopy over the entrance steps
import { Acc, F, onFace, block, solar, mats, meshes, BASE_MATS } from './kit.js';

export function buildDent(owner) {
  const A = new Acc();
  const t5 = block(A, 222, 275, -388, -365, { G: 4.4, FL: 3.7, n: 5, bay: 3.6, style: 'punched' }, {});
  for (let k = 1; k < 5; k++) onFace(A, 'band', F('z', -365, 1), 224, 273, 4.4 + k * 3.7 - 1.0, 4.4 + k * 3.7 - 0.85, 0, 0.7);
  solar(A, 223, 274, -387, -366, t5 + 0.1);
  block(A, 275, 281, -386, -370, { G: 4.4, FL: 3.7, n: 6, bay: 3, style: 'blank' }, { w: false });
  const t2 = block(A, 222, 265, -365, -345, { G: 4.4, FL: 3.8, n: 2, bay: 4.3 }, { n: false });
  onFace(A, 'glass', F('z', -345, 1), 224, 263, 0.4, 3.9, 0, 0.05);
  for (const x of [230, 246, 258]) onFace(A, 'purple', F('z', -345, 1), x, x + 3, 0.4, 3.9, 0, 0.1);
  for (let x = 228; x < 262; x += 4) for (let z = -362; z < -350; z += 4) A.box('glassRoof', x, x + 1.6, t2, t2 + 0.6, z, z + 1.6);
  // curved canopy over the entrance
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI, a1 = ((i + 1) / 8) * Math.PI;
    A.quad('band', [238, 4.2 + Math.sin(a0) * 0.8, -345 + Math.cos(a0) * -4 + 4], [250, 4.2 + Math.sin(a0) * 0.8, -345 + Math.cos(a0) * -4 + 4],
      [250, 4.2 + Math.sin(a1) * 0.8, -345 + Math.cos(a1) * -4 + 4], [238, 4.2 + Math.sin(a1) * 0.8, -345 + Math.cos(a1) * -4 + 4]);
  }
  for (const x of [239, 249]) A.cyl('band', x, -338, 0.2, 0, 4.2, 8);

  const MAT = mats({ ...BASE_MATS, wall: '#f2f1ee', band: '#f7f7f5', purple: '#7a5a96', glassRoof: { color: '#a8bcc6', roughness: 0.2, metalness: 0.3 } });
  return { meshes: meshes(A, MAT, owner), top: 4.4 + 5 * 3.7 };
}

export const DENT_OUTLINE = [[222, -388], [281, -388], [281, -370], [275, -370], [275, -365], [265, -365], [265, -345], [222, -345], [222, -388]];
