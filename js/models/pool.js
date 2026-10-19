// Hand-built model of the covered swimming pool (สระว่ายน้ำ) and the KMITL Wellness & Sports Center south of it,
// between the road west of ตึก 55 พรรษา and the canteen, x -306..-216. Not in OpenStreetMap as a building (only the
// pool and the sports-centre area are); the outline was given by the user and is stored in overrides.json (id -2,
// "ll"). Surveyed 2026-10-18 from Google Maps satellite imagery (the plan, the roof strips, the open east end of the
// pool, the sheds and the two-part roof of the south block) and Google Street View from the road along the west
// side (the pool roof over the trees, the brick entrance block and its bridge) and the road along the north side
// (the whole north side of the pool roof). No Street View reaches the south block; it follows the imagery and the
// brick of the entrance block. Photos were only looked at.
//
// x = east, z = south, y = up.
//   the pool sits in a concrete deck raised about 1 m, with a railing along its edges
//   a 50 m pool, eight lanes; its west 30 m under an open-sided steel shelter: white round columns, a light
//   gabled roof (ridge east-west) of white sheet with green translucent strips running down both slopes, a ridge
//   cap, steel tie beams under it; the east 20 m open to the sky
//   a single-storey entrance block at the west end, clad in brown timber boards (red brick until a refit) with a
//   band of dark louvre windows above, a white-framed glass door and a thin flat roof,
//   reached by a small concrete bridge with steps over the ditch along the road
//   east of the pool: a flat-roofed grey service block and an open shed with a rusty corrugated mono-pitch roof
//   the Wellness & Sports Center south of the pool: brick below, grey cladding with a high window band above,
//   flat light roofs in two parts, the east part taller
import { Acc, F, onFace, mats, meshes, BASE_MATS } from './kit.js';

const DECK = 1.0;

export function buildPool(owner) {
  const A = new Acc();

  // ---- deck around the pool, the water, lane ropes ----
  const PX0 = -291, PX1 = -241, PZ0 = -297.5, PZ1 = -278.5;
  A.box('deck', -296, -238, 0, DECK, -303.5, PZ0);
  A.box('deck', -296, -261.5, 0, DECK, PZ1, -271.5);
  A.box('deck', -261.5, -238, 0, DECK, PZ1, -277);
  A.box('deck', -296, PX0, 0, DECK, PZ0, PZ1);
  A.box('deck', PX1, -238, 0, DECK, PZ0, PZ1);
  A.box('pool', PX0, PX1, 0, DECK - 0.15, PZ0, PZ1);
  for (let i = 1; i < 8; i++) {
    const z = PZ0 + (i * (PZ1 - PZ0)) / 8;
    A.box('lane', PX0 + 0.5, PX1 - 0.5, DECK - 0.15, DECK - 0.11, z - 0.08, z + 0.08);
  }
  A.box('lane', PX0, PX0 + 0.4, DECK - 0.15, DECK + 0.1, PZ0, PZ1);                  // touch pads at both ends
  A.box('lane', PX1 - 0.4, PX1, DECK - 0.15, DECK + 0.1, PZ0, PZ1);
  // railing along the deck edges
  const rail = (x0, x1, z0, z1) => {
    const along = Math.abs(x1 - x0) > Math.abs(z1 - z0), L = along ? x1 - x0 : z1 - z0;
    if (along) A.box('rail', x0, x1, DECK + 1.0, DECK + 1.08, z0 - 0.04, z0 + 0.04);
    else A.box('rail', x0 - 0.04, x0 + 0.04, DECK + 1.0, DECK + 1.08, z0, z1);
    for (let t = 0; t <= L; t += 1.8) {
      const x = along ? x0 + t : x0, z = along ? z0 : z0 + t;
      A.box('rail', x - 0.03, x + 0.03, DECK, DECK + 1.0, z - 0.03, z + 0.03);
    }
  };
  rail(-296, -238, -303.5, -303.5);
  rail(-261.5, -238, -277, -277);
  rail(-238, -238, -303.5, -277);
  rail(-296, -296, -303.5, -283);

  // ---- open-sided shelter over the west 30 m ----
  const X0 = -295, X1 = -261.5, Z0 = -302.5, Z1 = -271.5, zc = (Z0 + Z1) / 2, yE = 6.2, yR = 9.4, ov = 1.0;
  const s = (yR - yE) / (zc - Z0), y = (z) => yR - s * Math.abs(z - zc);
  const nCol = 6;
  for (let i = 0; i <= nCol; i++) {
    const x = X0 + (i * (X1 - X0)) / nCol;
    for (const z of [Z0 + 0.3, Z1 - 0.3]) A.cyl('steel', x, z, 0.2, DECK, yE, 10);
    A.box('steel', x - 0.12, x + 0.12, yE - 0.35, yE, Z0, Z1);                        // tie beam
    A.box('steel', x - 0.06, x + 0.06, yE, yR - 0.2, zc - 0.06, zc + 0.06);           // king post
  }
  for (const z of [Z0 + 0.3, Z1 - 0.3]) A.box('steel', X0, X1, yE - 0.4, yE, z - 0.15, z + 0.15);   // eave beams
  // roof planes (both faces, the shelter is open underneath)
  const slope = (m, xa, xb, za, zb, dy = 0) => {
    const a = [xa, y(za) + dy, za], b = [xb, y(za) + dy, za], c = [xb, y(zb) + dy, zb], d = [xa, y(zb) + dy, zb];
    if (za < zb) { A.quad(m, b, a, d, c); if (!dy) A.quad('roofUnder', a, b, c, d); }
    else { A.quad(m, a, b, c, d); if (!dy) A.quad('roofUnder', b, a, d, c); }
  };
  const RX0 = X0 - ov, RX1 = X1 + ov, RZ0 = Z0 - ov, RZ1 = Z1 + ov;
  slope('roofSheet', RX0, RX1, RZ0, zc);
  slope('roofSheet', RX0, RX1, RZ1, zc);
  for (const xc of [-290.6, -284.4, -278.6, -272.4, -266.3]) {
    slope('roofGreen', xc - 1.1, xc + 1.1, RZ0 + 0.4, zc - 1.6, 0.04);
    slope('roofGreen', xc - 1.1, xc + 1.1, RZ1 - 0.4, zc + 1.6, 0.04);
  }
  slope('roofSheet', RX0, RX1, zc - 1.6, zc, 0.12);                                  // ridge cap
  slope('roofSheet', RX0, RX1, zc + 1.6, zc, 0.12);
  for (const z of [RZ0, RZ1]) A.box('steel', RX0, RX1, y(z) - 0.25, y(z), z - 0.08, z + 0.08);      // gutters

  // ---- brick entrance block at the west end, with its bridge over the ditch ----
  const EX0 = -306, EX1 = -298, EZ0 = -282.5, EZ1 = -270.5, EH = DECK + 3.6;
  A.box('concrete', EX0, EX1, 0, DECK, EZ0, EZ1);
  // re-surveyed 2026-10-19 from youtu.be/lod-jYKKEZ0 8:10: the block is now clad in brown timber boards with the
  // pool's name and an "O3 KMITL" logo on its north face, and a band of dark louvre windows runs above it
  A.box('timber', EX0, EX1, DECK, EH, EZ0, EZ1);
  for (let y = DECK + 0.3; y < EH; y += 0.3) A.box('timberJoint', EX0 - 0.02, EX1 + 0.02, y - 0.02, y, EZ0 - 0.02, EZ1 + 0.02);
  A.box('louvreDark', EX0 + 0.1, EX1 - 0.1, EH, EH + 1.3, EZ0 + 0.1, EZ1 - 0.1);
  for (let y = EH + 0.15; y < EH + 1.3; y += 0.18) A.box('white', EX0, EX1, y, y + 0.03, EZ0, EZ1);
  A.box('white', EX0 - 0.8, EX1 + 0.4, EH + 1.3, EH + 1.6, EZ0 - 0.8, EZ1 + 0.8);
  A.box('deck', EX1, -296, 0, DECK, EZ0, EZ1);
  const W = F('x', EX0, -1);
  onFace(A, 'white', W, -280.6, -276.2, DECK, EH - 0.4, 0, 0.08);
  onFace(A, 'glassDoor', W, -280.3, -276.5, DECK + 0.1, EH - 0.6, 0, 0.12);
  onFace(A, 'sign', W, -275.8, -275.0, DECK + 1.4, DECK + 2.4, 0, 0.1);
  A.box('concrete', -311, EX0, DECK - 0.15, DECK, -281, -275.5);                    // bridge
  for (let k = 0; k < 4; k++) A.box('concrete', -311, -308, 0, DECK - 0.2 - k * 0.2, -275.5 + k * 0.35, -275.15 + k * 0.35);   // steps down to the path
  for (const z of [-281, -275.5]) A.box('railDark', -311, EX0, DECK + 0.9, DECK + 0.96, z - 0.03, z + 0.03);

  // ---- east of the pool: grey service block, small store, open shed ----
  A.box('greyWall', -241, -233.6, 0, 4.2, -299, -277.3);
  A.box('roof', -241.3, -233.4, 4.2, 4.5, -299.3, -277);
  for (const z of [-295, -289, -283]) onFace(A, 'glass', F('x', -241, -1), z, z + 2.4, 2.2, 3.4, 0, 0.05);
  A.box('greyWall', -237.6, -233.6, 0, 3.6, -305, -299);
  A.box('roof', -237.8, -233.4, 3.6, 3.85, -305.2, -299);
  const shed = (x) => 4.6 - ((x + 233.6) / 7.6) * 1.2;
  for (const z of [-304.6, -298, -291.5, -285, -278.4]) for (const x of [-233.2, -226.4]) A.box('steel', x - 0.1, x + 0.1, 0, shed(x), z - 0.1, z + 0.1);
  {
    const a = [-233.6, shed(-233.6), -305.2], b = [-226, shed(-226), -305.2], c = [-226, shed(-226), -277.8], d = [-233.6, shed(-233.6), -277.8];
    A.quad('roofRust', a, d, c, b); A.quad('roofUnder', a, b, c, d);
  }

  // ---- Wellness & Sports Center ----
  const wing = (x0, x1, z0, z1, h) => {
    A.box('brick', x0, x1, 0, 3.4, z0, z1);
    A.box('greyWall', x0, x1, 3.4, h, z0, z1);
    A.box('band', x0 - 0.2, x1 + 0.2, 3.3, 3.55, z0 - 0.2, z1 + 0.2);
    A.box('roof', x0 - 0.3, x1 + 0.3, h, h + 0.25, z0 - 0.3, z1 + 0.3);
    A.box('greyWall', x0, x1, h + 0.25, h + 0.8, z0, z0 + 0.25);                    // parapets on the long sides
    A.box('greyWall', x0, x1, h + 0.25, h + 0.8, z1 - 0.25, z1);
    for (const f of [F('z', z0, -1), F('z', z1, 1)]) {
      for (let x = x0 + 1.5; x < x1 - 3; x += 4.2) onFace(A, 'glass', f, x, x + 3.2, h - 2.2, h - 0.9, 0, 0.05);
      for (let x = x0 + 3; x < x1 - 3; x += 8.4) onFace(A, 'glass', f, x, x + 2.4, 0.9, 2.6, 0, 0.05);
    }
  };
  wing(-277.5, -240.8, -274.5, -257, 7.4);
  wing(-240.8, -216, -276, -258, 8.8);
  A.box('concrete', -280, -277.5, 0, 2.6, -273, -258.5);
  const S = F('z', -257, 1);
  onFace(A, 'white', S, -262.5, -256.5, 0, 3.0, 0, 0.1);
  onFace(A, 'glassDoor', S, -262.2, -256.8, 0.05, 2.7, 0, 0.14);
  A.box('white', -264, -255, 3.0, 3.25, -257, -254.5);                                // canopy over the door

  const MAT = mats({ ...BASE_MATS,
    timber: { color: '#9a5f3a', roughness: 0.75 }, timberJoint: { color: '#6b3f26', roughness: 0.8 }, louvreDark: { color: '#3a4447', roughness: 0.5 },
    deck: { color: '#d8d3c8', roughness: 0.95 }, concrete: { color: '#c9c5bc', roughness: 1 },
    pool: { color: '#3fb1c9', roughness: 0.12, metalness: 0.1 }, lane: '#f2f2ee',
    rail: { color: '#d9dcdd', roughness: 0.5, metalness: 0.3 }, railDark: { color: '#2b2d30', roughness: 0.6 },
    steel: { color: '#eef0ef', roughness: 0.5, metalness: 0.2 },
    roofSheet: { color: '#e6e8e4', roughness: 0.55 }, roofGreen: { color: '#4f9c86', roughness: 0.3, emissive: '#1d4a3c', emissiveIntensity: 0.25 },
    roofUnder: { color: '#b9c2bd', roughness: 0.7 }, roofRust: { color: '#8c7a66', roughness: 0.8 },
    roof: '#bdbcb7', greyWall: '#a9adb0', white: '#f2f2f0', band: '#e9e7e2', sign: '#e3c234',
    glassDoor: { color: '#3d4b55', roughness: 0.25 } });
  return { meshes: meshes(A, MAT, owner), top: yR + 0.2 };
}

export const POOL_OUTLINE = [[-306, -305.2], [-226, -305.2], [-226, -277], [-216, -277], [-216, -258], [-255, -257], [-255, -254.5], [-264, -254.5], [-264, -257], [-280, -257], [-280, -270.5], [-311, -270.5], [-311, -282.5], [-306, -282.5], [-306, -305.2]];
