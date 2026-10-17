// Hand-built models of the workshop sheds ("shop ...") in the yard west of the arts road, OSM ways 1243388144-7
// and 1491133180-91. Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with
// ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end.
// No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the
// two-level ones in OSM). Photos were only looked at.
//
// x = east, z = south, y = up.
//   cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops
//   at the south end are open frames of grey steel with part of the roof sheeted
import { Acc, F, onFace, gable, mats, meshes, BASE_MATS } from './kit.js';

const SPEC = { ...BASE_MATS, wall: '#ece5d4', roofSheet: '#c9cbca', roofBrown: { color: '#7a4a3c', roughness: 0.8 }, steel: { color: '#7d8287', metalness: 0.5, roughness: 0.5 },
  shutter: { color: '#8a9196', metalness: 0.4, roughness: 0.5 }, glass: { color: '#6f7d84' }, skylight: { color: '#e4eceb', roughness: 0.3 } };

// [key, x0, x1, z0, z1, eave height, roof material, open frame]
const SHEDS = {
  shopPower: [-110, -72, 212, 226, 6.5], shopWood1: [-66, -28, 211, 225, 6.5, 'roofBrown'], shopTextile: [-65, -28, 233, 247, 6.5],
  shopFurn2: [-109, -72, 250.5, 261, 6.5], shopBlack: [-108, -72, 261.5, 277, 6.5], shopFurn1: [-66, -29, 260, 275, 6.5],
  shopOrangeS: [-93, -72, 278, 293, 4.5], shopCeramic1: [-63, -42, 278, 293, 4.5], shopFurn3: [-41, -28, 277, 292, 4.5, 'roofBrown'],
  shopOrange: [-107, -70, 295.5, 311, 6.5], shopCeramic2: [-61, -24, 294.5, 310, 6.5], shopJewel: [-93, -72, 312, 327, 4.5],
  shopPlastic: [-61, -40, 311, 326, 6.5], shopSteel: [-106, -70, 329.5, 345, 6.0, 'roofSheet', true], shopWood2: [-61, -25, 327.5, 343, 6.0, 'roofSheet', true],
};

function shed(owner, [x0, x1, z0, z1, H, roof = 'roofSheet', open = false]) {
  const A = new Acc();
  const rise = (z1 - z0) * 0.14;
  if (open) {
    for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 6) for (const z of [z0, z1]) A.box('steel', x - 0.15, x + 0.15, 0, H, z - 0.15, z + 0.15);
    for (const z of [z0, z1]) A.box('steel', x0, x1, H - 0.4, H, z - 0.15, z + 0.15);
    gable(A, roof, x0, (x0 + x1) / 2, z0, z1, H, rise, { end: false });
    for (let x = (x0 + x1) / 2; x < x1; x += 3) A.box('steel', x, x + 0.2, H, H + rise * 0.6, z0, z1);
  } else {
    A.box('wall', x0, x1, 0, H, z0, z1);
    for (const f of [F('z', z0, -1), F('z', z1, 1)]) {
      onFace(A, 'glass', f, x0 + 1, x1 - 1, H - 1.8, H - 0.6, 0, 0.05);
      onFace(A, 'shutter', f, x0 + 2, x0 + 6, 0, Math.min(4, H - 2), 0, 0.06);
    }
    gable(A, roof, x0, x1, z0, z1, H, rise);
    for (let x = x0 + 3; x < x1 - 3; x += 6) A.box('skylight', x, x + 1.4, H + rise * 0.45, H + rise * 0.55 + 0.05, z0 + (z1 - z0) * 0.22, z0 + (z1 - z0) * 0.32);
  }
  return { meshes: meshes(A, mats(SPEC), owner), top: H + rise };
}

const rect = ([x0, x1, z0, z1]) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
export const buildShopPower = (o) => shed(o, SHEDS.shopPower), SHOPPOWER_OUTLINE = rect(SHEDS.shopPower);
export const buildShopWood1 = (o) => shed(o, SHEDS.shopWood1), SHOPWOOD1_OUTLINE = rect(SHEDS.shopWood1);
export const buildShopTextile = (o) => shed(o, SHEDS.shopTextile), SHOPTEXTILE_OUTLINE = rect(SHEDS.shopTextile);
export const buildShopFurn2 = (o) => shed(o, SHEDS.shopFurn2), SHOPFURN2_OUTLINE = rect(SHEDS.shopFurn2);
export const buildShopBlack = (o) => shed(o, SHEDS.shopBlack), SHOPBLACK_OUTLINE = rect(SHEDS.shopBlack);
export const buildShopFurn1 = (o) => shed(o, SHEDS.shopFurn1), SHOPFURN1_OUTLINE = rect(SHEDS.shopFurn1);
export const buildShopOrangeS = (o) => shed(o, SHEDS.shopOrangeS), SHOPORANGES_OUTLINE = rect(SHEDS.shopOrangeS);
export const buildShopCeramic1 = (o) => shed(o, SHEDS.shopCeramic1), SHOPCERAMIC1_OUTLINE = rect(SHEDS.shopCeramic1);
export const buildShopFurn3 = (o) => shed(o, SHEDS.shopFurn3), SHOPFURN3_OUTLINE = rect(SHEDS.shopFurn3);
export const buildShopOrange = (o) => shed(o, SHEDS.shopOrange), SHOPORANGE_OUTLINE = rect(SHEDS.shopOrange);
export const buildShopCeramic2 = (o) => shed(o, SHEDS.shopCeramic2), SHOPCERAMIC2_OUTLINE = rect(SHEDS.shopCeramic2);
export const buildShopJewel = (o) => shed(o, SHEDS.shopJewel), SHOPJEWEL_OUTLINE = rect(SHEDS.shopJewel);
export const buildShopPlastic = (o) => shed(o, SHEDS.shopPlastic), SHOPPLASTIC_OUTLINE = rect(SHEDS.shopPlastic);
export const buildShopSteel = (o) => shed(o, SHEDS.shopSteel), SHOPSTEEL_OUTLINE = rect(SHEDS.shopSteel);
export const buildShopWood2 = (o) => shed(o, SHEDS.shopWood2), SHOPWOOD2_OUTLINE = rect(SHEDS.shopWood2);
