// Geometry builders: turn the compact OSM-derived data into merged three.js meshes.
import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { buildECC, ECC_OUTLINE } from './models/ecc.js';
import { buildE12, E12_OUTLINE } from './models/e12.js';
import { buildThep, THEP_OUTLINE } from './models/thep.js';
import { buildPres, PRES_OUTLINE } from './models/pres.js';
import { buildHall, HALL_OUTLINE } from './models/hall.js';
import { buildTel, TEL_OUTLINE } from './models/tel.js';
import { buildA, A_OUTLINE } from './models/abld.js';
import { buildEaud, EAUD_OUTLINE } from './models/eaud.js';
import { buildWing, WING_OUTLINE } from './models/ewing.js';
import { buildB, B_OUTLINE } from './models/bbld.js';
import { buildTka, TKA_OUTLINE } from './models/tka.js';
import { buildLita, LITA_OUTLINE } from './models/lita.js';
import { buildCanA, CANA_OUTLINE } from './models/cana.js';
import { buildSiie, SIIE_OUTLINE } from './models/siie.js';
import { buildCivil, CIVIL_OUTLINE } from './models/civil.js';
import { buildElec, ELEC_OUTLINE } from './models/elec.js';
import { buildStad, STAD_OUTLINE } from './models/stad.js';
import { buildRoyal, ROYAL_OUTLINE } from './models/royal.js';
import { buildUni, UNI_OUTLINE } from './models/uni.js';
import { buildKmids, KMIDS_OUTLINE } from './models/kmids.js';
import { buildMed, MED_OUTLINE } from './models/med.js';
import { buildT55, T55_OUTLINE } from './models/t55.js';
import { buildAgri, AGRI_OUTLINE } from './models/agri.js';
import { buildJomtrai, JOMTRAI_OUTLINE } from './models/jomtrai.js';
import { buildIt, IT_OUTLINE } from './models/it.js';
import { buildLib, LIB_OUTLINE } from './models/lib.js';
import { buildCmkl, CMKL_OUTLINE } from './models/cmkl.js';
import { buildChula2, CHULA2_OUTLINE } from './models/chula2.js';
import { buildChula1, CHULA1_OUTLINE } from './models/chula1.js';
import { buildNewlab, NEWLAB_OUTLINE } from './models/newlab.js';
import { buildChaud, CHAUD_OUTLINE } from './models/chaud.js';
import { buildInnov, INNOV_OUTLINE } from './models/innov.js';
import { buildKosen, KOSEN_OUTLINE } from './models/kosen.js';
import { buildDent, DENT_OUTLINE } from './models/dent.js';
import { buildItcan, ITCAN_OUTLINE } from './models/itcan.js';
import { buildScican, SCICAN_OUTLINE } from './models/scican.js';
import { buildWitt, WITT_OUTLINE } from './models/witt.js';
import { buildDorm9, DORM9_OUTLINE, buildDorm10, DORM10_OUTLINE, buildDorm11, DORM11_OUTLINE, buildDorm12, DORM12_OUTLINE, buildDormK, DORMK_OUTLINE, buildDormKs, DORMKS_OUTLINE } from './models/dorms.js';
import { buildArchLec, ARCHLEC_OUTLINE, buildArchAud, ARCHAUD_OUTLINE, buildArchSouth, ARCHSOUTH_OUTLINE } from './models/archs.js';
import { buildEnglab1, ENGLAB1_OUTLINE } from './models/englab1.js';
import { buildMech, MECH_OUTLINE, buildInteg, INTEG_OUTLINE, buildGym, GYM_OUTLINE, buildCanC, CANC_OUTLINE, buildIndus, INDUS_OUTLINE } from './models/engw.js';
import { buildAlumni, ALUMNI_OUTLINE, buildThepCan, THEPCAN_OUTLINE, buildNano, NANO_OUTLINE, buildBank, BANK_OUTLINE, buildClinic, CLINIC_OUTLINE, buildAutomation, AUTOMATION_OUTLINE } from './models/mid.js';
import { buildControl, CONTROL_OUTLINE, buildAgEng, AGENG_OUTLINE, buildWorkshopW, WORKSHOPW_OUTLINE, buildWorkshopE, WORKSHOPE_OUTLINE } from './models/deps.js';
import { buildShopPower, SHOPPOWER_OUTLINE, buildShopWood1, SHOPWOOD1_OUTLINE, buildShopTextile, SHOPTEXTILE_OUTLINE, buildShopFurn2, SHOPFURN2_OUTLINE, buildShopBlack, SHOPBLACK_OUTLINE, buildShopFurn1, SHOPFURN1_OUTLINE, buildShopOrangeS, SHOPORANGES_OUTLINE, buildShopCeramic1, SHOPCERAMIC1_OUTLINE, buildShopFurn3, SHOPFURN3_OUTLINE, buildShopOrange, SHOPORANGE_OUTLINE, buildShopCeramic2, SHOPCERAMIC2_OUTLINE, buildShopJewel, SHOPJEWEL_OUTLINE, buildShopPlastic, SHOPPLASTIC_OUTLINE, buildShopSteel, SHOPSTEEL_OUTLINE, buildShopWood2, SHOPWOOD2_OUTLINE } from './models/shops.js';
import { buildCarportInteg, CARPORTINTEG_OUTLINE, buildCarportCanC1, CARPORTCANC1_OUTLINE, buildCarportCanC2, CARPORTCANC2_OUTLINE, buildCarportCtrl1, CARPORTCTRL1_OUTLINE, buildCarportCtrl2, CARPORTCTRL2_OUTLINE } from './models/carports.js';
import { buildTincan, TINCAN_OUTLINE, buildLcan, LCAN_OUTLINE, buildSeven, SEVEN_OUTLINE, buildEngClub, ENGCLUB_OUTLINE, buildAmazon, AMAZON_OUTLINE, buildCheer, CHEER_OUTLINE, buildClub, CLUB_OUTLINE, buildGlass, GLASS_OUTLINE, buildKruClub, KRUCLUB_OUTLINE, buildLawson, LAWSON_OUTLINE, buildInthanin, INTHANIN_OUTLINE } from './models/small.js';
import { buildGymN, GYMN_OUTLINE } from './models/gymn.js';
import { buildPool, POOL_OUTLINE } from './models/pool.js';

// Buildings modelled by hand from the Street View / satellite survey (overrides.json "model")
const MODELS = { ecc: { build: buildECC, outline: ECC_OUTLINE }, e12: { build: buildE12, outline: E12_OUTLINE }, thep: { build: buildThep, outline: THEP_OUTLINE }, pres: { build: buildPres, outline: PRES_OUTLINE }, hall: { build: buildHall, outline: HALL_OUTLINE }, tel: { build: buildTel, outline: TEL_OUTLINE }, abld: { build: buildA, outline: A_OUTLINE }, eaud: { build: buildEaud, outline: EAUD_OUTLINE }, ewing: { build: buildWing, outline: WING_OUTLINE }, bbld: { build: buildB, outline: B_OUTLINE }, tka: { build: buildTka, outline: TKA_OUTLINE }, lita: { build: buildLita, outline: LITA_OUTLINE }, cana: { build: buildCanA, outline: CANA_OUTLINE }, siie: { build: buildSiie, outline: SIIE_OUTLINE }, civil: { build: buildCivil, outline: CIVIL_OUTLINE }, elec: { build: buildElec, outline: ELEC_OUTLINE }, stad: { build: buildStad, outline: STAD_OUTLINE }, royal: { build: buildRoyal, outline: ROYAL_OUTLINE }, uni: { build: buildUni, outline: UNI_OUTLINE }, kmids: { build: buildKmids, outline: KMIDS_OUTLINE }, med: { build: buildMed, outline: MED_OUTLINE }, t55: { build: buildT55, outline: T55_OUTLINE }, agri: { build: buildAgri, outline: AGRI_OUTLINE }, jomtrai: { build: buildJomtrai, outline: JOMTRAI_OUTLINE }, it: { build: buildIt, outline: IT_OUTLINE }, lib: { build: buildLib, outline: LIB_OUTLINE }, cmkl: { build: buildCmkl, outline: CMKL_OUTLINE }, chula2: { build: buildChula2, outline: CHULA2_OUTLINE }, chula1: { build: buildChula1, outline: CHULA1_OUTLINE }, newlab: { build: buildNewlab, outline: NEWLAB_OUTLINE }, chaud: { build: buildChaud, outline: CHAUD_OUTLINE }, innov: { build: buildInnov, outline: INNOV_OUTLINE }, kosen: { build: buildKosen, outline: KOSEN_OUTLINE }, dent: { build: buildDent, outline: DENT_OUTLINE }, itcan: { build: buildItcan, outline: ITCAN_OUTLINE }, scican: { build: buildScican, outline: SCICAN_OUTLINE }, witt: { build: buildWitt, outline: WITT_OUTLINE }, dorm9: { build: buildDorm9, outline: DORM9_OUTLINE }, dorm10: { build: buildDorm10, outline: DORM10_OUTLINE }, dorm11: { build: buildDorm11, outline: DORM11_OUTLINE }, dorm12: { build: buildDorm12, outline: DORM12_OUTLINE }, dormk: { build: buildDormK, outline: DORMK_OUTLINE }, dormks: { build: buildDormKs, outline: DORMKS_OUTLINE }, archlec: { build: buildArchLec, outline: ARCHLEC_OUTLINE }, archaud: { build: buildArchAud, outline: ARCHAUD_OUTLINE }, archsouth: { build: buildArchSouth, outline: ARCHSOUTH_OUTLINE }, englab1: { build: buildEnglab1, outline: ENGLAB1_OUTLINE }, mech: { build: buildMech, outline: MECH_OUTLINE }, integ: { build: buildInteg, outline: INTEG_OUTLINE }, gym: { build: buildGym, outline: GYM_OUTLINE }, canc: { build: buildCanC, outline: CANC_OUTLINE }, indus: { build: buildIndus, outline: INDUS_OUTLINE }, alumni: { build: buildAlumni, outline: ALUMNI_OUTLINE }, thepcan: { build: buildThepCan, outline: THEPCAN_OUTLINE }, nano: { build: buildNano, outline: NANO_OUTLINE }, bank: { build: buildBank, outline: BANK_OUTLINE }, clinic: { build: buildClinic, outline: CLINIC_OUTLINE }, automation: { build: buildAutomation, outline: AUTOMATION_OUTLINE }, control: { build: buildControl, outline: CONTROL_OUTLINE }, ageng: { build: buildAgEng, outline: AGENG_OUTLINE }, workshopw: { build: buildWorkshopW, outline: WORKSHOPW_OUTLINE }, workshope: { build: buildWorkshopE, outline: WORKSHOPE_OUTLINE }, shoppower: { build: buildShopPower, outline: SHOPPOWER_OUTLINE }, shopwood1: { build: buildShopWood1, outline: SHOPWOOD1_OUTLINE }, shoptextile: { build: buildShopTextile, outline: SHOPTEXTILE_OUTLINE }, shopfurn2: { build: buildShopFurn2, outline: SHOPFURN2_OUTLINE }, shopblack: { build: buildShopBlack, outline: SHOPBLACK_OUTLINE }, shopfurn1: { build: buildShopFurn1, outline: SHOPFURN1_OUTLINE }, shoporanges: { build: buildShopOrangeS, outline: SHOPORANGES_OUTLINE }, shopceramic1: { build: buildShopCeramic1, outline: SHOPCERAMIC1_OUTLINE }, shopfurn3: { build: buildShopFurn3, outline: SHOPFURN3_OUTLINE }, shoporange: { build: buildShopOrange, outline: SHOPORANGE_OUTLINE }, shopceramic2: { build: buildShopCeramic2, outline: SHOPCERAMIC2_OUTLINE }, shopjewel: { build: buildShopJewel, outline: SHOPJEWEL_OUTLINE }, shopplastic: { build: buildShopPlastic, outline: SHOPPLASTIC_OUTLINE }, shopsteel: { build: buildShopSteel, outline: SHOPSTEEL_OUTLINE }, shopwood2: { build: buildShopWood2, outline: SHOPWOOD2_OUTLINE }, carportinteg: { build: buildCarportInteg, outline: CARPORTINTEG_OUTLINE }, carportcanc1: { build: buildCarportCanC1, outline: CARPORTCANC1_OUTLINE }, carportcanc2: { build: buildCarportCanC2, outline: CARPORTCANC2_OUTLINE }, carportctrl1: { build: buildCarportCtrl1, outline: CARPORTCTRL1_OUTLINE }, carportctrl2: { build: buildCarportCtrl2, outline: CARPORTCTRL2_OUTLINE }, tincan: { build: buildTincan, outline: TINCAN_OUTLINE }, lcan: { build: buildLcan, outline: LCAN_OUTLINE }, seven: { build: buildSeven, outline: SEVEN_OUTLINE }, engclub: { build: buildEngClub, outline: ENGCLUB_OUTLINE }, amazon: { build: buildAmazon, outline: AMAZON_OUTLINE }, cheer: { build: buildCheer, outline: CHEER_OUTLINE }, club: { build: buildClub, outline: CLUB_OUTLINE }, glass: { build: buildGlass, outline: GLASS_OUTLINE }, kruclub: { build: buildKruClub, outline: KRUCLUB_OUTLINE }, lawson: { build: buildLawson, outline: LAWSON_OUTLINE }, inthanin: { build: buildInthanin, outline: INTHANIN_OUTLINE }, gymn: { build: buildGymN, outline: GYMN_OUTLINE }, pool: { build: buildPool, outline: POOL_OUTLINE } };

// ---------- small helpers ----------
export function hash(n) {
  let x = (n | 0) ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5) >>> 0) / 4294967296;
}
const pick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];

export function pointInRing(x, z, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
export function pointInPoly(x, z, outer, holes = []) {
  if (!pointInRing(x, z, outer)) return false;
  for (const h of holes) if (pointInRing(x, z, h)) return false;
  return true;
}
export function ringBBox(r) {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const [x, z] of r) { if (x < a) a = x; if (z < b) b = z; if (x > c) c = x; if (z > d) d = z; }
  return [a, b, c, d];
}
function openRing(r) {
  const n = r.length;
  return n > 1 && r[0][0] === r[n - 1][0] && r[0][1] === r[n - 1][1] ? r.slice(0, -1) : r.slice();
}

// Simple accumulator for non-indexed triangle soups
class Soup {
  constructor(withUV = false) { this.p = []; this.n = []; this.c = []; this.uv = withUV ? [] : null; this.owner = []; }
  tri(a, b, c, col, owner = -1, uvs = null, nrm = null) {
    const n = nrm || faceNormal(a, b, c);
    for (const v of [a, b, c]) { this.p.push(v[0], v[1], v[2]); this.n.push(n[0], n[1], n[2]); this.c.push(col.r, col.g, col.b); }
    if (this.uv) { if (uvs) this.uv.push(...uvs[0], ...uvs[1], ...uvs[2]); else this.uv.push(0, 0, 0, 0, 0, 0); }
    this.owner.push(owner);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    if (this.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.computeBoundingSphere();
    g.userData.owner = Int32Array.from(this.owner);
    return g;
  }
}
function faceNormal(a, b, c) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}

// Flat (horizontal) polygon with holes at height y, facing up
function flatPoly(soup, outer, holes, y, col, owner = -1, uvScale = 0) {
  const contour = openRing(outer).map(([x, z]) => new THREE.Vector2(x, z));
  const hs = (holes || []).map((h) => openRing(h).map(([x, z]) => new THREE.Vector2(x, z)));
  if (contour.length < 3) return;
  let faces;
  try { faces = THREE.ShapeUtils.triangulateShape(contour, hs); } catch { return; }
  const all = contour.concat(...hs);
  for (const [i, j, k] of faces) {
    const A = all[i], B = all[j], C = all[k];
    if (!A || !B || !C) continue;
    let a = [A.x, y, A.y], b = [B.x, y, B.y], c = [C.x, y, C.y];
    // ensure upward normal
    const cross = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
    if (cross < 0) [b, c] = [c, b];
    const uvs = uvScale ? [a, b, c].map((v) => [v[0] * uvScale, -v[2] * uvScale]) : null;
    soup.tri(a, b, c, col, owner, uvs, [0, 1, 0]);
  }
}

// ---------- colours ----------
const C = (h) => new THREE.Color(h);
// Campus buildings seen in Street View are mostly white / off-white / cream concrete,
// older blocks tan-beige, with red-brick stair towers and a few orange accents.
const PALETTE = {
  edu: ['#f2f0eb', '#eeebe4', '#f4f2ee', '#e9e3d6', '#ddd0bd', '#e6e2da', '#d9cbb0', '#efeadf'],
  resi: ['#f1e8da', '#efd9bd', '#f2e4cc', '#e5e2dc', '#eedcc7', '#f3eadf', '#e8d2b9'],
  house: ['#f4efe6', '#ece2d0', '#f0e3cf', '#e9e4dc'],
  shop: ['#ececea', '#e2ded7', '#f0ebe1', '#dfe2e4'],
  plain: ['#c9cbcc', '#bfc3c6', '#d4d2cc', '#b7bcc0'],
  temple: ['#f7f3ea'],
};
const EDU_FACADES = ['band', 'band', 'ribbon', 'ribbon', 'punched', 'brickframe', 'grid', 'edu'];
const ROOF_FLAT = ['#b5b2ab', '#a9aaa6', '#bcb6aa', '#9fa5a8', '#c2beb4', '#a7a093'];
const ROOF_PITCH = ['#9c4a3a', '#8b5444', '#6d7277', '#a35d3c', '#7b4b3d', '#5f6b74', '#b06a45'];
const ROOF_METAL = ['#8e9aa3', '#a3adb4', '#7f8a92', '#5d7a8c'];

function styleOf(bt) {
  if (['dormitory', 'apartments', 'residential', 'terrace'].includes(bt)) return 'resi';
  if (['house', 'detached'].includes(bt)) return 'house';
  if (['retail', 'commercial', 'train_station'].includes(bt)) return 'shop';
  if (['garage', 'shed', 'industrial', 'service', 'carport', 'warehouse', 'sports_centre', 'stadium', 'construction'].includes(bt)) return 'plain';
  if (bt === 'temple') return 'temple';
  return 'edu';
}

// Height model (metres)
export function buildingHeights(b) {
  const style = styleOf(b.bt);
  const fh = style === 'resi' || style === 'house' ? 3.1 : style === 'plain' ? 4.5 : 3.6;
  let levels = b.lv, h = b.ht;
  if (h == null && levels == null) {
    const a = b.a;
    switch (b.bt) {
      case 'house': case 'detached': levels = 2; break;
      case 'garage': case 'carport': case 'shed': levels = 1; h = 3.2; break;
      case 'roof': h = 4.5; levels = 1; break;
      case 'temple': levels = 1; h = 9; break;
      case 'dormitory': case 'apartments': levels = a > 600 ? 5 : 4; break;
      case 'university': case 'school': case 'office': levels = a > 2500 ? 4 : a > 700 ? 3 : 2; break;
      case 'sports_centre': case 'stadium': h = 14; levels = 1; break;
      case 'industrial': case 'service': h = 7; levels = 1; break;
      default: levels = a > 2500 ? 3 : a > 250 ? 2 : 1;
    }
  }
  if (levels == null) levels = Math.max(1, Math.round(h / fh));
  if (h == null) h = levels * fh;
  const minH = b.mh || 0;
  return { h: Math.max(h, minH + 2), minH, levels: Math.max(1, levels), floorH: Math.max(2.4, (h - minH) / Math.max(1, levels)), style };
}

// Facade patterns observed on KMITL buildings in Street View. Each draws one cell
// (one bay x one floor, y0 = top of the floor). White areas take the building's wall colour.
const FACADE_DRAW = {
  // deep horizontal floor slabs with a recessed continuous window band (ECC 12 floors, Agri-Tech, 55th Anniversary)
  band(g, x0, y0, S, W, night) {
    if (!night) { g.fillStyle = 'rgba(0,0,0,0.30)'; g.fillRect(x0, y0 + S * 0.2, S, S * 0.58); }
    W(x0 + 3, y0 + S * 0.3, S - 6, S * 0.42, 3);
    if (!night) {
      g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x0, y0 + S * 0.2, S, 7); // shadow under the slab
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x0, y0 + S * 0.78, S, 3);
    }
  },
  // continuous ribbon windows in a flat wall (engineering labs, Mechanical, ECC)
  ribbon(g, x0, y0, S, W, night) {
    W(x0, y0 + S * 0.24, S, S * 0.44, 4);
    if (!night) { g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x0, y0 + S * 0.68, S, 5); g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(x0, y0 + S * 0.9, S, 2); }
  },
  // glass curtain wall (IT faculty, CMKL); wall colour tints the glass
  glass(g, x0, y0, S, W, night, r) {
    if (night) { W(x0, y0 + 2, S, S * 0.86); return; }
    const gr = g.createLinearGradient(x0, y0, x0 + S, y0 + S);
    gr.addColorStop(0, '#d7e1ea'); gr.addColorStop(0.5, '#aebdcb'); gr.addColorStop(1, '#c5d2de');
    g.fillStyle = gr; g.fillRect(x0, y0, S, S);
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x0 + S * (0.1 + r() * 0.5), y0, S * 0.18, S);
    g.fillStyle = '#eef1f3'; g.fillRect(x0, y0 + S * 0.88, S, S * 0.12); // floor edge
    g.fillRect(x0, y0, 3, S); g.fillRect(x0 + S / 2 - 1, y0, 2, S * 0.88);
  },
  // white structural grid with deep recessed bays (President's building, Prathep)
  grid(g, x0, y0, S, W, night, r) {
    if (!night) { g.fillStyle = 'rgba(0,0,0,0.32)'; g.fillRect(x0 + 14, y0 + 18, S - 28, S - 18); }
    W(x0 + 24, y0 + S * 0.3, S - 48, S * 0.42, 2);
    if (!night) {
      g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x0 + 14, y0 + 18, S - 28, 6);
      if (r() < 0.4) { g.fillStyle = '#e7e7e4'; g.fillRect(x0 + S - 46, y0 + S * 0.76, 22, 14); }
    }
  },
  // vertical sun-shading fins over the windows (Central Library, SIIE)
  louver(g, x0, y0, S, W, night) {
    W(x0 + 4, y0 + S * 0.14, S - 8, S * 0.7);
    g.fillStyle = night ? '#000' : '#9da2a6';
    for (let k = 0; k < 10; k++) g.fillRect(x0 + 6 + k * 12.4, y0 + S * 0.14, 5, S * 0.7);
    if (!night) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x0, y0 + S * 0.84, S, 4); }
  },
  // light concrete frame with red-brick infill panels (older engineering blocks)
  brickframe(g, x0, y0, S, W, night) {
    W(x0 + 12, y0 + S * 0.18, S - 24, S * 0.34, 2);
    if (night) { g.fillStyle = '#000'; g.fillRect(x0 + 12, y0 + S * 0.55, S - 24, S * 0.45); return; }
    g.fillStyle = '#a4553d'; g.fillRect(x0 + 12, y0 + S * 0.55, S - 24, S * 0.45);
    g.fillStyle = 'rgba(255,235,220,0.25)';
    for (let k = 0; k < 7; k++) g.fillRect(x0 + 12, y0 + S * 0.55 + k * 8, S - 24, 1.5);
    g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(x0 + 12, y0 + S * 0.52, S - 24, 4);
  },
  // white diagonal steel lattice screen over the facade (KMIDS demonstration school)
  lattice(g, x0, y0, S, W, night) {
    W(x0 + 10, y0 + S * 0.22, S - 20, S * 0.5, 2);
    g.strokeStyle = night ? '#000' : '#f4f4f2'; g.lineWidth = night ? 7 : 6;
    g.beginPath();
    g.moveTo(x0, y0); g.lineTo(x0 + S, y0 + S); g.moveTo(x0 + S, y0); g.lineTo(x0, y0 + S);
    g.moveTo(x0, y0 + 3); g.lineTo(x0 + S, y0 + 3); g.stroke();
  },
  // wall with punched windows and a small canopy (default teaching block)
  punched(g, x0, y0, S, W, night) {
    W(x0 + 18, y0 + 26, S - 36, S * 0.5, 2);
    if (!night) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x0 + 12, y0 + 22, S - 24, 5); g.fillRect(x0 + 14, y0 + 26 + S * 0.5, S - 28, 4); }
  },
};

// ---------- facade textures (canvas, 4x4 cells: one cell = one bay x one floor) ----------
function makeFacade(style, night = false) {
  const N = 4, S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = N * S;
  const g = cv.getContext('2d');
  const r = rng(style.length * 977 + (night ? 7 : 1));
  g.fillStyle = night ? '#000' : '#ffffff';
  g.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = i * S, y0 = j * S;
    // cell drawn with y=0 at top of image -> top of floor
    const lit = r() < 0.55;
    const warm = r();
    const glass = night ? (lit ? (warm < 0.5 ? '#ffd28a' : '#fff1cf') : '#05070a') : pick(['#3c4a57', '#42525f', '#36434f', '#4a5a66', '#2f3d4a'], r());
    if (!night) {
      // subtle wall noise / panel joints
      g.fillStyle = 'rgba(0,0,0,0.035)';
      g.fillRect(x0, y0 + S - 3, S, 3);
      g.fillRect(x0 + S - 2, y0, 2, S);
    }
    if (style === 'edu') {
      g.fillStyle = glass; g.fillRect(x0 + 10, y0 + 22, S - 20, S * 0.56);
      if (!night) {
        g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x0 + 10, y0 + 22, (S - 20) * 0.35, S * 0.56);
        g.fillStyle = '#d9d6cf'; g.fillRect(x0 + S / 2 - 2, y0 + 22, 4, S * 0.56); // mullion
        g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x0 + 6, y0 + 22 + S * 0.56, S - 12, 6); // sill shadow
      }
    } else if (style === 'resi') {
      g.fillStyle = glass; g.fillRect(x0 + 22, y0 + 26, S - 44, S * 0.5);
      if (!night) {
        g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(x0 + 22, y0 + 26, (S - 44) * 0.4, S * 0.5);
        g.fillStyle = '#7d8187'; // balcony railing
        g.fillRect(x0 + 12, y0 + S * 0.72, S - 24, 4);
        for (let k = 0; k < 9; k++) g.fillRect(x0 + 14 + k * ((S - 30) / 8), y0 + S * 0.72, 2, S * 0.2);
        g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x0 + 8, y0 + S * 0.92, S - 16, 7); // slab edge
        if (r() < 0.45) { g.fillStyle = '#e9e9e6'; g.fillRect(x0 + S - 34, y0 + S * 0.76, 22, 14); } // AC unit
      }
    } else if (style === 'house') {
      g.fillStyle = glass; g.fillRect(x0 + 34, y0 + 30, S - 68, S * 0.45);
      if (!night) { g.fillStyle = '#8b6b4a'; g.fillRect(x0 + 30, y0 + 26, S - 60, 5); g.fillRect(x0 + 30, y0 + 30 + S * 0.45, S - 60, 5); }
    } else if (style === 'shop') {
      g.fillStyle = glass; g.fillRect(x0 + 6, y0 + 14, S - 12, S * 0.74);
      if (!night) { g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(x0 + 6, y0 + 14, S * 0.3, S * 0.74); g.fillStyle = '#bdbab3'; g.fillRect(x0 + S / 2 - 2, y0 + 14, 4, S * 0.74); }
    } else if (style === 'plain') {
      if (!night) { g.fillStyle = 'rgba(0,0,0,0.08)'; for (let k = 0; k < 8; k++) g.fillRect(x0 + k * 16, y0, 2, S); }
      g.fillStyle = night ? (lit ? '#ffe2a8' : '#000') : '#56636c'; g.fillRect(x0 + 8, y0 + 12, S - 16, 16);
    } else if (FACADE_DRAW[style]) {
      // styles derived from the Street View survey
      const W = (x, y, w, h, mull = 0) => {
        g.fillStyle = glass; g.fillRect(x, y, w, h);
        if (night) return;
        g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(x, y, w * 0.3, h);
        if (mull) { g.fillStyle = 'rgba(225,228,230,0.9)'; for (let k = 1; k < mull; k++) g.fillRect(x + (w * k) / mull - 1.5, y, 3, h); }
      };
      FACADE_DRAW[style](g, x0, y0, S, W, night, r);
    } else if (style === 'temple') {
      g.fillStyle = night ? '#000' : '#6b2e1f';
      g.beginPath(); g.moveTo(x0 + 44, y0 + S * 0.85); g.lineTo(x0 + 44, y0 + 40); g.lineTo(x0 + S / 2, y0 + 16); g.lineTo(x0 + S - 44, y0 + 40); g.lineTo(x0 + S - 44, y0 + S * 0.85); g.fill();
      if (!night) { g.strokeStyle = '#c9a23a'; g.lineWidth = 4; g.stroke(); }
    }
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / N, 1 / N);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ---------- buildings ----------
// Oriented bounding box of a footprint: returns centre, axis (unit), half-lengths
function obb(ring) {
  const pts = openRing(ring);
  let best = null;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 0.5) continue;
    const ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
    let mnu = Infinity, mxu = -Infinity, mnv = Infinity, mxv = -Infinity;
    for (const [x, z] of pts) {
      const u = x * ux + z * uz, v = -x * uz + z * ux;
      mnu = Math.min(mnu, u); mxu = Math.max(mxu, u); mnv = Math.min(mnv, v); mxv = Math.max(mxv, v);
    }
    const area = (mxu - mnu) * (mxv - mnv);
    if (!best || area < best.area) {
      const cu = (mnu + mxu) / 2, cv = (mnv + mxv) / 2;
      best = { area, ux, uz, hu: (mxu - mnu) / 2, hv: (mxv - mnv) / 2, cx: cu * ux - cv * uz, cz: cu * uz + cv * ux };
    }
  }
  if (best && best.hv > best.hu) { // make u the long axis
    best = { ...best, ux: -best.uz, uz: best.ux, hu: best.hv, hv: best.hu };
  }
  return best;
}

function addPitchedRoof(soup, ring, base, shape, col, owner, roofH) {
  const o = obb(ring);
  if (!o) return false;
  const ov = 0.5; // eave overhang
  const hu = o.hu + ov, hv = o.hv + ov;
  const P = (u, v, y) => [o.cx + u * o.ux - v * o.uz, y, o.cz + u * o.uz + v * o.ux];
  const top = base + roofH;
  const c1 = P(-hu, -hv, base), c2 = P(hu, -hv, base), c3 = P(hu, hv, base), c4 = P(-hu, hv, base);
  if (shape === 'pyramidal' || shape === 'dome') {
    const apex = P(0, 0, top);
    soup.tri(c1, apex, c2, col, owner); soup.tri(c2, apex, c3, col, owner); soup.tri(c3, apex, c4, col, owner); soup.tri(c4, apex, c1, col, owner);
    return true;
  }
  if (shape === 'skillion') {
    const t1 = P(-hu, -hv, top), t2 = P(hu, -hv, top);
    soup.tri(c4, t2, t1, col, owner); soup.tri(c4, c3, t2, col, owner);
    return true;
  }
  const inset = shape === 'hipped' || shape === 'mansard' ? Math.min(hv, hu * 0.45) : 0;
  const r1 = P(-hu + inset, 0, top), r2 = P(hu - inset, 0, top);
  // two long slopes
  soup.tri(c1, r1, r2, col, owner); soup.tri(c1, r2, c2, col, owner);
  soup.tri(c3, r2, r1, col, owner); soup.tri(c3, r1, c4, col, owner);
  // ends: hip triangles or gable walls
  soup.tri(c2, r2, c3, col, owner);
  soup.tri(c4, r1, c1, col, owner);
  return true;
}

export function buildBuildings(list) {
  const walls = new Soup(true), roofs = new Soup(false);
  const meta = [];
  const custom = [];
  // skip outlines that are fully described by building:part
  const parts = list.filter((b) => b.pt);
  const skip = new Set();
  for (const b of list) {
    if (b.pt) continue;
    if (parts.some((p) => pointInRing(p.c[0], p.c[1], b.o))) skip.add(b);
  }
  list.forEach((b) => {
    if (skip.has(b) || b.hide) return; // hide: footprint already covered by a hand-built model
    const idx = meta.length;
    const H = buildingHeights(b);
    const M = MODELS[b.model];
    if (M) {
      // replace the OSM outline with the surveyed one (highlight, label, area)
      b.o = M.outline; delete b.h;
      const pts = openRing(b.o);
      b.c = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length].map((v) => Math.round(v * 10) / 10);
      b.a = Math.round(Math.abs(ringOutwardSign(b.o)) / 2);
      const built = M.build(idx, b);
      custom.push(...built.meshes);
      meta.push({ b, H, fac: 'custom', top: built.top });
      return;
    }
    const r = hash(b.id);
    const style = H.style;
    const wallCol = C(b.col || pick(PALETTE[style], r));
    // facade pattern: from overrides (Street View survey) or a weighted guess based on what is common on campus
    const fac = b.fac || (style === 'edu' ? pick(EDU_FACADES, (r * 13) % 1) : style);
    const opts = {};
    if (b.acc) opts.acc = C(b.acc);
    else if (!b.fac && style === 'edu' && (r * 29) % 1 < 0.35) opts.acc = C('#a9563c'); // brick stair towers are very common
    if (b.base) opts.base = C(b.base);
    if (b.accLen) opts.accLen = b.accLen;
    const isHouse = style === 'house' || style === 'temple';
    let rs = b.rs || (isHouse || (b.bt === 'yes' && b.a < 160) ? 'gabled' : 'flat');
    if (b.bt === 'roof' || b.bt === 'carport') rs = 'canopy';
    const roofCol = C(b.rcol || (rs === 'flat' ? pick(ROOF_FLAT, r * 7 % 1) : style === 'plain' ? pick(ROOF_METAL, r * 3 % 1) : style === 'temple' ? '#c4492b' : pick(ROOF_PITCH, r * 5 % 1)));
    const shortSide = Math.sqrt(b.a) * 0.6;
    const roofH = rs === 'flat' || rs === 'canopy' ? 0 : Math.min(b.bt === 'temple' || rs === 'thai' ? 8 : 5, Math.max(1.4, shortSide * (b.bt === 'temple' || rs === 'thai' ? 0.5 : 0.32)));
    const wallTop = H.h - roofH * 0.0; // walls go up to eave; pitched roof sits on top
    const base = H.minH;
    meta.push({ b, H, fac, top: H.h + roofH * (rs === 'thai' ? 1.6 : 1) });

    if (rs === 'canopy') {
      // thin slab on posts
      const t = H.h, slab = 0.35;
      flatPoly(roofs, b.o, b.h, t, roofCol, idx);
      ringWalls(walls, b.o, t - slab, t, 1, wallCol.clone().multiplyScalar(0.8), idx, b, true);
      const pts = openRing(b.o);
      const postCol = C('#9a9a96');
      const step = Math.max(1, Math.floor(pts.length / 8));
      for (let i = 0; i < pts.length; i += step) box(walls, pts[i][0], pts[i][1], 0.25, 0, t - slab, postCol, idx);
      return;
    }
    const parapet = rs === 'flat' && H.h - base > 4 ? 0.9 : 0;
    // walls (outer + holes)
    ringWalls(walls, b.o, base, wallTop, H.floorH, wallCol, idx, b, false, parapet, opts);
    for (const h of b.h || []) ringWalls(walls, h, base, wallTop, H.floorH, wallCol, idx, b, false, parapet, opts);
    if (rs === 'flat') {
      flatPoly(roofs, b.o, b.h, wallTop + 0.05, roofCol, idx);
      if (parapet) {
        const pc = wallCol.clone().multiplyScalar(0.93);
        innerParapet(walls, b.o, wallTop, wallTop + parapet, pc, idx);
      }
      // rooftop equipment on big roofs
      if (b.a > 350 && H.h > 6) {
        const rr = rng(b.id);
        const o = obb(b.o);
        const n = Math.min(4, 1 + Math.floor(b.a / 900));
        for (let i = 0; i < n; i++) {
          const u = (rr() - 0.5) * o.hu * 1.2, v = (rr() - 0.5) * o.hv * 1.2;
          const x = o.cx + u * o.ux - v * o.uz, z = o.cz + u * o.uz + v * o.ux;
          if (!pointInRing(x, z, b.o)) continue;
          const s = 1.5 + rr() * 2.5;
          box(roofs, x, z, s, wallTop, wallTop + 1.2 + rr() * 2.2, C(rr() < 0.5 ? '#d7d7d3' : '#a9adb0'), idx, o);
        }
      }
    } else {
      // close the top in case the pitched roof doesn't cover a non-rectangular footprint
      flatPoly(roofs, b.o, b.h, wallTop, roofCol.clone().multiplyScalar(0.7), idx);
      if (rs === 'dome') {
        dome(roofs, b, wallTop, roofCol, idx);
      } else {
        addPitchedRoof(roofs, b.o, wallTop, rs === 'thai' ? 'hipped' : rs, roofCol, idx, roofH);
        if (rs === 'thai') { // traditional Thai pavilion: a second, steeper hipped tier of the same tile colour
          const o = obb(b.o);
          if (o) {
            const inner = [[-0.62, -0.62], [0.62, -0.62], [0.62, 0.62], [-0.62, 0.62], [-0.62, -0.62]].map(([u, v]) => [o.cx + u * o.hu * o.ux - v * o.hv * o.uz, o.cz + u * o.hu * o.uz + v * o.hv * o.ux]);
            addPitchedRoof(roofs, inner, wallTop + roofH * 0.6, 'gabled', roofCol.clone().multiplyScalar(0.9), idx, roofH);
          }
        } else if (b.bt === 'temple') { // second, smaller tier for Thai temple roofs
          const o = obb(b.o);
          if (o) {
            const inner = [[-0.6, -0.6], [0.6, -0.6], [0.6, 0.6], [-0.6, 0.6], [-0.6, -0.6]].map(([u, v]) => [o.cx + u * o.hu * o.ux - v * o.hv * o.uz, o.cz + u * o.hu * o.uz + v * o.hv * o.ux]);
            addPitchedRoof(roofs, inner, wallTop + roofH * 0.55, 'gabled', C('#2f7d4f'), idx, roofH * 0.75);
          }
        }
      }
    }
  });

  const facades = {};
  const wallGeo = walls.geometry();
  // split walls by style using groups would need sorting; instead use one atlas per style via a style attribute in the UV offset
  // -> simplest: one material per style. We re-bucket triangles by style.
  const byStyle = {};
  const own = wallGeo.userData.owner;
  const pos = wallGeo.attributes.position.array, nor = wallGeo.attributes.normal.array, col = wallGeo.attributes.color.array, uv = wallGeo.attributes.uv.array;
  for (let t = 0; t < own.length; t++) {
    const st = own[t] >= 0 ? meta[own[t]].fac : 'edu';
    (byStyle[st] ||= []).push(t);
  }
  const wallMeshes = [];
  for (const [st, tris] of Object.entries(byStyle)) {
    const P = new Float32Array(tris.length * 9), Nn = new Float32Array(tris.length * 9), Cc = new Float32Array(tris.length * 9), U = new Float32Array(tris.length * 6), O = new Int32Array(tris.length);
    tris.forEach((t, k) => {
      P.set(pos.subarray(t * 9, t * 9 + 9), k * 9); Nn.set(nor.subarray(t * 9, t * 9 + 9), k * 9); Cc.set(col.subarray(t * 9, t * 9 + 9), k * 9);
      U.set(uv.subarray(t * 6, t * 6 + 6), k * 6); O[k] = own[t];
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(Nn, 3));
    g.setAttribute('color', new THREE.BufferAttribute(Cc, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    g.computeBoundingSphere();
    g.userData.owner = O;
    facades[st] ||= { day: makeFacade(st), night: makeFacade(st, true) };
    const m = new THREE.MeshStandardMaterial({
      map: facades[st].day, vertexColors: true, roughness: 0.82, metalness: 0.02,
      emissiveMap: facades[st].night, emissive: new THREE.Color('#ffc978'), emissiveIntensity: 0,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.kind = 'building';
    wallMeshes.push(mesh);
  }
  const roofMesh = new THREE.Mesh(roofs.geometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide, shadowSide: THREE.FrontSide }));
  roofMesh.castShadow = roofMesh.receiveShadow = true;
  roofMesh.userData.kind = 'building';
  return { meshes: [...wallMeshes, roofMesh, ...custom], meta };
}

function ringOutwardSign(ring) {
  // signed area in x/z; for our wall winding (a,b,c) normal = (-dz, 0, dx)
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return a; // >0 : (-dz,dx) points inward for CCW-in-xz => flip
}

// Walls along a ring. opts: { acc: Color for short walls (stair towers / end walls), accLen, base: Color for the ground floor }
function ringWalls(soup, ring, y0, y1, floorH, col, owner, b, both = false, parapet = 0, opts = {}) {
  const pts = ring;
  const s = ringOutwardSign(pts);
  // For a ring with positive signed area (x,z), the left normal (-dz,dx) points inward.
  const flip = s > 0;
  const top = y1 + parapet;
  const quad = (x0, z0, x1, z1, ya, yb, u0, u1, c) => {
    const va = (ya - y0) / floorH, vb = (yb - y0) / floorH;
    const A = [x0, ya, z0], B = [x1, ya, z1], Cc = [x1, yb, z1], D = [x0, yb, z0];
    const t1 = [[u0, va], [u1, va], [u1, vb]], t2 = [[u0, va], [u1, vb], [u0, vb]];
    const out = () => { soup.tri(A, B, Cc, c, owner, t1); soup.tri(A, Cc, D, c, owner, t2); };
    const inn = () => { soup.tri(A, Cc, B, c, owner, [t1[0], t1[2], t1[1]]); soup.tri(A, D, Cc, c, owner, [t2[0], t2[2], t2[1]]); };
    if (!flip) out(); else inn();
    if (both) { if (flip) out(); else inn(); }
  };
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
    const len = Math.hypot(x1 - x0, z1 - z0);
    if (len < 0.05) continue;
    const bays = Math.max(1, Math.round(len / 3.4));
    const u0 = (hash(owner * 31 + i) * 4) | 0; // random start column in the atlas
    // one texture cell = one bay x one floor; v=0 at the wall base so floors line up with cells
    const c = opts.acc && len < (opts.accLen || 14) ? opts.acc : col;
    if (opts.base && top - y0 > floorH * 1.5) {
      quad(x0, z0, x1, z1, y0, y0 + floorH, u0, u0 + bays, opts.base);
      quad(x0, z0, x1, z1, y0 + floorH, top, u0, u0 + bays, c);
    } else quad(x0, z0, x1, z1, y0, top, u0, u0 + bays, c);
  }
}

function innerParapet(soup, ring, y0, y1, col, owner) {
  const flip = ringOutwardSign(ring) > 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, z0] = ring[i], [x1, z1] = ring[i + 1];
    const A = [x0, y0, z0], B = [x1, y0, z1], Cc = [x1, y1, z1], D = [x0, y1, z0];
    const uv = [[0.02, 0.02], [0.02, 0.02], [0.02, 0.02]];
    if (flip) { soup.tri(A, B, Cc, col, owner, uv); soup.tri(A, Cc, D, col, owner, uv); }
    else { soup.tri(A, Cc, B, col, owner, uv); soup.tri(A, D, Cc, col, owner, uv); }
  }
}

function box(soup, x, z, s, y0, y1, col, owner, o = null) {
  const ux = o ? o.ux : 1, uz = o ? o.uz : 0, h = s / 2;
  const P = (a, b) => [x + a * ux - b * uz, z + a * uz + b * ux];
  const ring = [P(-h, -h), P(h, -h), P(h, h), P(-h, h), P(-h, -h)];
  const uv = soup.uv ? [[0.02, 0.02], [0.02, 0.02], [0.02, 0.02]] : null;
  const flip = ringOutwardSign(ring) > 0;
  for (let i = 0; i < 4; i++) {
    const [x0, z0] = ring[i], [x1, z1] = ring[i + 1];
    const A = [x0, y0, z0], B = [x1, y0, z1], Cc = [x1, y1, z1], D = [x0, y1, z0];
    if (!flip) { soup.tri(A, B, Cc, col, owner, uv); soup.tri(A, Cc, D, col, owner, uv); }
    else { soup.tri(A, Cc, B, col, owner, uv); soup.tri(A, D, Cc, col, owner, uv); }
  }
  if (!soup.uv) flatPoly(soup, ring, [], y1, col, owner);
}

function dome(soup, b, base, col, owner) {
  const [cx, cz] = b.c, R = Math.sqrt(b.a / Math.PI) * 0.9;
  const seg = 16, rings = 6;
  for (let i = 0; i < rings; i++) {
    const a0 = (i / rings) * Math.PI / 2, a1 = ((i + 1) / rings) * Math.PI / 2;
    for (let j = 0; j < seg; j++) {
      const t0 = (j / seg) * Math.PI * 2, t1 = ((j + 1) / seg) * Math.PI * 2;
      const p = (a, t) => [cx + Math.cos(a) * R * Math.cos(t), base + Math.sin(a) * R * 0.6, cz + Math.cos(a) * R * Math.sin(t)];
      soup.tri(p(a0, t0), p(a1, t0), p(a1, t1), col, owner);
      soup.tri(p(a0, t0), p(a1, t1), p(a0, t1), col, owner);
    }
  }
}

// ---------- ground layers ----------
export function buildAreas(data) {
  const s = new Soup(false);
  const add = (list, colFn, y) => list.forEach((a) => a.o && flatPoly(s, a.o, a.h, y, C(colFn(a))));
  add(data.green, (a) => (a.k === 'scrub' || a.k === 'wood' || a.k === 'forest' ? '#7fa25e' : a.k === 'orchard' ? '#8db06a' : '#9cbf78'), 0.04);
  add(data.parking.filter((p) => p.k === 'parking'), () => '#a3a29f', 0.06);
  add(data.parking.filter((p) => p.k === 'plaza'), () => '#d6cfc2', 0.07);
  // stack sport areas so overlapping polygons (pitch inside track inside stadium) never z-fight
  const sportY = { stadium: 0.08, sports_centre: 0.08, track: 0.1, pitch: 0.12 };
  data.sport.forEach((a) => flatPoly(s, a.o, a.h, sportY[a.lk] ?? 0.12,
    C(a.lk === 'track' ? '#b9583f' : ['basketball', 'tennis', 'volleyball', 'futsal', 'badminton'].includes(a.k) ? '#4f8aa3' : a.lk === 'sports_centre' || a.lk === 'stadium' ? '#c9c4b8' : '#6fa653')));
  const mesh = new THREE.Mesh(s.geometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }));
  mesh.receiveShadow = true;
  mesh.userData.areas = true;

  // platforms (raised)
  const ps = new Soup(false);
  data.parking.filter((p) => p.k === 'platform').forEach((p) => flatPoly(ps, p.o, [], p.ly ? 7.5 : 1.1, C('#cfcac0')));
  const plat = new THREE.Mesh(ps.geometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }));
  plat.receiveShadow = true;
  return [mesh, plat];
}

// Tileable water normal map, made procedurally: a sum of sine waves with whole-number frequencies across the
// tile, so it wraps seamlessly (no texture file to download)
function waterNormals(N = 256) {
  const waves = [];
  const r = rng(77);
  for (let i = 0; i < 24; i++) {
    const k = 1 + Math.floor(r() * (i < 8 ? 4 : 12));
    const a = r() * Math.PI * 2;
    waves.push([Math.round(Math.cos(a) * k), Math.round(Math.sin(a) * k), r() * Math.PI * 2, 1 / (k + 1.5)]);
  }
  const d = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let gx = 0, gy = 0;
    for (const [kx, ky, ph, amp] of waves) {
      const c = Math.cos(2 * Math.PI * (kx * x + ky * y) / N + ph) * amp;
      gx += c * kx; gy += c * ky;
    }
    const nx = -gx * 0.09, ny = -gy * 0.09, l = Math.hypot(nx, ny, 1);
    const i = (y * N + x) * 4;
    d[i] = (nx / l * 0.5 + 0.5) * 255; d[i + 1] = (ny / l * 0.5 + 0.5) * 255; d[i + 2] = (1 / l * 0.5 + 0.5) * 255; d[i + 3] = 255;
  }
  const t = new THREE.DataTexture(d, N, N);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

export const WATER_Y = 0.12;
// Ponds and canals use the three.js Water shader (a planar reflection of the scene, rippled by scrolling normal
// maps, with sun glints); swimming pools stay a plain bright surface
export function buildWater(data) {
  const s = new Soup(false), pools = new Soup(false);
  const col = C('#4f8fb0');
  data.water.forEach((w) => {
    // the covered pool is part of its hand-built model (js/models/pool.js), which draws its own water
    if (w.k === 'swimming_pool' && w.o && pointInRing(w.o[0][0], w.o[0][1], POOL_OUTLINE)) return;
    if (w.o) flatPoly(w.k === 'swimming_pool' ? pools : s, w.o, w.h, WATER_Y, w.k === 'swimming_pool' ? C('#4fb7d6') : col);
    else if (w.line) ribbon(s, w.line, w.w, () => WATER_Y, col);
  });
  const group = new THREE.Group();

  // Water reflects about its local XY plane, so the world-space soup is moved into it: (x, y, z) -> (x, -z, 0),
  // and the mesh is turned flat again with rotation.x = -90°
  const geo = s.geometry();
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i), -p.getZ(i), 0);
  geo.deleteAttribute('color');
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const water = new Water(geo, {
    textureWidth: 512, textureHeight: 512,
    waterNormals: waterNormals(),
    sunDirection: new THREE.Vector3(0.3, 1, 0.2).normalize(),
    sunColor: '#fff4e0',
    waterColor: '#1f4f5c',
    distortionScale: 5,
    fog: true,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.y = WATER_Y;
  water.receiveShadow = true;
  water.material.uniforms.size.value = 1.5;   // one ripple tile ≈ 70 m
  // the bright sky made the reflection read as grey glass: tint it towards murky pond water
  water.material.fragmentShader = water.material.fragmentShader.replace('vec3 outgoingLight = albedo;', 'vec3 outgoingLight = albedo * vec3(0.55, 0.74, 0.84);');
  Object.assign(water.material, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  group.add(water);

  const pm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.15, metalness: 0.25, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  const poolMesh = new THREE.Mesh(pools.geometry(), pm);
  poolMesh.receiveShadow = true;
  group.add(poolMesh);
  group.userData.surface = water;
  return group;
}

// Ribbon along a polyline; yFn(distanceAlong, totalLength) gives elevation
function ribbon(soup, pts, width, yFn, col, owner = -1, thickness = 0, sideCol = null) {
  const n = pts.length;
  if (n < 2) return;
  const cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = cum[n - 1];
  const hw = width / 2;
  const L_ = [], R_ = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[1] - a[1];
    const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    let nx = -dz, nz = dx, k = 1;
    if (i > 0 && i < n - 1) { // miter
      const d1x = p[0] - a[0], d1z = p[1] - a[1], l1 = Math.hypot(d1x, d1z) || 1;
      const m = (-d1z / l1) * nx + (d1x / l1) * nz;
      k = 1 / Math.max(0.5, m);
    }
    const y = yFn(cum[i], L);
    L_.push([p[0] + nx * hw * k, y, p[1] + nz * hw * k]);
    R_.push([p[0] - nx * hw * k, y, p[1] - nz * hw * k]);
  }
  for (let i = 0; i < n - 1; i++) {
    const a = L_[i], b = R_[i], c = R_[i + 1], d = L_[i + 1];
    soup.tri(a, d, c, col, owner, null, [0, 1, 0]);
    soup.tri(a, c, b, col, owner, null, [0, 1, 0]);
    if (thickness) {
      const sc = sideCol || col;
      const dn = (v) => [v[0], v[1] - thickness, v[2]];
      soup.tri(a, dn(a), dn(d), sc, owner); soup.tri(a, dn(d), d, sc, owner);
      soup.tri(b, c, dn(c), sc, owner); soup.tri(b, dn(c), dn(b), sc, owner);
      soup.tri(dn(a), dn(b), dn(c), sc, owner); soup.tri(dn(a), dn(c), dn(d), sc, owner);
    }
  }
  return { L, cum };
}

const ROAD_COL = {
  motorway: '#55595f', motorway_link: '#5b5f65', trunk: '#55595f', primary: '#5f6369', primary_link: '#64686e', secondary: '#676b71', secondary_link: '#6b6f74',
  tertiary: '#6f7378', tertiary_link: '#73777c', unclassified: '#777a7f', residential: '#777a7f', service: '#7f8286', living_street: '#7f8286',
  pedestrian: '#cfc6b6', footway: '#d2c8b5', path: '#c4b79e', cycleway: '#b4645a', steps: '#bdb2a0', track: '#a99c80',
};
export const ROAD_Y = { motorway: 0.34, trunk: 0.34, primary: 0.32, secondary: 0.3, tertiary: 0.28, motorway_link: 0.27, primary_link: 0.27, secondary_link: 0.27, tertiary_link: 0.27, residential: 0.24, unclassified: 0.24, living_street: 0.22, service: 0.2, pedestrian: 0.18, track: 0.16, footway: 0.15, path: 0.15, cycleway: 0.16, steps: 0.15 };
const MAJOR = new Set(['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'primary_link', 'secondary_link', 'motorway_link']);

export function elevationFn(r, L, base) {
  if (!r.br && !(r.ly > 0)) return () => base;
  const H = L < 60 ? 1.0 : Math.max(1, r.ly || 1) * 6.5;
  const ramp = Math.min(90, L / 3);
  return (s) => base + H * Math.min(1, s / ramp, (L - s) / ramp);
}

export function buildRoads(data) {
  const s = new Soup(false), marks = new Soup(false), walks = new Soup(false);
  const pillars = [];
  const white = C('#f2f0ea'), yellow = C('#e8c547'), curb = C('#bdb9b0');
  const sorted = [...data.roads].sort((a, b) => (ROAD_Y[a.k] || 0.2) - (ROAD_Y[b.k] || 0.2));
  for (const r of sorted) {
    const base = ROAD_Y[r.k] ?? 0.2;
    let L = 0;
    for (let i = 1; i < r.p.length; i++) L += Math.hypot(r.p[i][0] - r.p[i - 1][0], r.p[i][1] - r.p[i - 1][1]);
    const yf = elevationFn(r, L, base);
    const elevated = (r.br || r.ly > 0) && L >= 60;
    const col = C(ROAD_COL[r.k] || '#7f8286');
    // sidewalk / shoulder below vehicle roads
    if (!elevated && ['primary', 'secondary', 'tertiary', 'residential', 'unclassified', 'primary_link', 'secondary_link'].includes(r.k)) {
      ribbon(walks, r.p, r.w + 3.2, (d, l) => yf(d, l) - 0.06, curb);
    }
    ribbon(s, r.p, r.w, yf, col, -1, elevated ? 1.2 : 0, C('#b8b4ac'));
    if (elevated) {
      // pillars every ~28 m where high enough
      let acc = 0;
      for (let i = 1; i < r.p.length; i++) {
        const a = r.p[i - 1], b = r.p[i], seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
        for (let t = 14 - (acc % 28); t < seg; t += 28) {
          const d = acc + t, y = yf(d, L);
          if (y > 3) pillars.push([a[0] + (b[0] - a[0]) * t / seg, a[1] + (b[1] - a[1]) * t / seg, y - 1.2, Math.min(2.2, r.w / 4)]);
        }
        acc += seg;
      }
    }
    // lane markings
    if (MAJOR.has(r.k) || r.k === 'residential' || r.k === 'unclassified') {
      const dashL = 3, gap = MAJOR.has(r.k) ? 6 : 5;
      const mcol = r.ow || r.k.startsWith('motorway') ? white : (MAJOR.has(r.k) ? yellow : white);
      const lanes = r.ow ? Math.max(1, Math.round(r.w / 3.4)) : 2;
      const offsets = [];
      for (let k = 1; k < lanes; k++) offsets.push(-r.w / 2 + (r.w * k) / lanes);
      if (!r.ow && r.w < 7) offsets.splice(0, offsets.length, 0);
      let acc = 0;
      for (let i = 1; i < r.p.length; i++) {
        const a = r.p[i - 1], b = r.p[i], seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (seg < 0.1) continue;
        const ux = (b[0] - a[0]) / seg, uz = (b[1] - a[1]) / seg;
        for (let t = (gap - (acc % (dashL + gap))) % (dashL + gap); t < seg - 0.5; t += dashL + gap) {
          const t2 = Math.min(seg, t + dashL);
          for (const off of offsets) {
            const ox = -uz * off, oz = ux * off;
            const p0 = [a[0] + ux * t + ox, a[1] + uz * t + oz], p1 = [a[0] + ux * t2 + ox, a[1] + uz * t2 + oz];
            ribbon(marks, [p0, p1], 0.18, (d) => yf(acc + t + d, L) + 0.03, mcol);
          }
        }
        acc += seg;
      }
      // edge lines on major roads
      if (MAJOR.has(r.k) && !elevated) {
        for (const side of [-1, 1]) {
          const off = side * (r.w / 2 - 0.4);
          const line = r.p.map((p, i) => {
            const a = r.p[Math.max(0, i - 1)], b = r.p[Math.min(r.p.length - 1, i + 1)];
            const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
            return [p[0] - (b[1] - a[1]) / l * off, p[1] + (b[0] - a[0]) / l * off];
          });
          ribbon(marks, line, 0.15, (d, l) => yf(d * L / (l || 1), L) + 0.03, white);
        }
      }
    }
  }
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 });
  const road = new THREE.Mesh(s.geometry(), mat);
  road.receiveShadow = true; road.castShadow = true;
  const markMesh = new THREE.Mesh(marks.geometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -10 }));
  markMesh.receiveShadow = true;
  const walkMesh = new THREE.Mesh(walks.geometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  walkMesh.receiveShadow = true;
  const group = new THREE.Group();
  group.add(walkMesh, road, markMesh, pillarMesh(pillars));
  return group;
}

function pillarMesh(list) {
  const geo = new THREE.CylinderGeometry(1, 1, 1, 10);
  geo.translate(0, 0.5, 0);
  const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: '#c3bfb6', roughness: 0.9 }), Math.max(1, list.length));
  const M = new THREE.Matrix4();
  list.forEach(([x, z, h, r], i) => { M.makeScale(r * 0.5, h, r * 0.5).setPosition(x, 0, z); m.setMatrixAt(i, M); });
  m.count = list.length;
  m.castShadow = m.receiveShadow = true;
  return m;
}

export function buildRails(data) {
  const s = new Soup(false), steel = new Soup(false);
  const pillars = [];
  const ballast = C('#8c857b'), rail = C('#4a4b4e'), deck = C('#bdb8ae');
  for (const r of data.rails) {
    let L = 0;
    for (let i = 1; i < r.p.length; i++) L += Math.hypot(r.p[i][0] - r.p[i - 1][0], r.p[i][1] - r.p[i - 1][1]);
    const elevated = r.br && L >= 60;
    const yf = elevationFn(r, L, 0.3);
    ribbon(s, r.p, elevated ? 5 : 3.6, yf, elevated ? deck : ballast, -1, elevated ? 1.5 : 0, deck);
    for (const off of [-0.72, 0.72]) {
      const line = offsetLine(r.p, off);
      ribbon(steel, line, 0.14, (d, l) => yf(d * L / (l || 1), L) + 0.18, rail);
    }
    if (elevated) {
      let acc = 0;
      for (let i = 1; i < r.p.length; i++) {
        const a = r.p[i - 1], b = r.p[i], seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
        for (let t = 15 - (acc % 30); t < seg; t += 30) {
          const y = yf(acc + t, L);
          if (y > 3) pillars.push([a[0] + (b[0] - a[0]) * t / seg, a[1] + (b[1] - a[1]) * t / seg, y - 1.5, 2]);
        }
        acc += seg;
      }
    }
  }
  const g = new THREE.Group();
  const m1 = new THREE.Mesh(s.geometry(), new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 }));
  m1.receiveShadow = m1.castShadow = true;
  const m2 = new THREE.Mesh(steel.geometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.6, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -10 }));
  g.add(m1, m2, pillarMesh(pillars));
  return g;
}

function offsetLine(pts, off) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [p[0] - (b[1] - a[1]) / l * off, p[1] + (b[0] - a[0]) / l * off];
  });
}

export function buildCampusOutline(data) {
  const s = new Soup(false);
  const col = C('#ff7a1a');
  data.campus.forEach((c) => ribbon(s, c.o, 2.2, () => 0.4, col));
  const m = new THREE.Mesh(s.geometry(), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -12 }));
  return m;
}

// single-building highlight geometry (used on hover/select)
export function highlightGeometry(meta) {
  const { b, H } = meta;
  const pts = openRing(b.o).map(([x, z]) => new THREE.Vector2(x, -z));
  const shape = new THREE.Shape(pts);
  for (const h of b.h || []) shape.holes.push(new THREE.Path(openRing(h).map(([x, z]) => new THREE.Vector2(x, -z))));
  const g = new THREE.ExtrudeGeometry(shape, { depth: meta.top - H.minH + 0.6, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  g.translate(0, H.minH - 0.2, 0);
  return g;
}
