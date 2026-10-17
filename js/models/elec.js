// Hand-built model of ภาคไฟฟ้าและพลังงานไฟฟ้า (Electrical Engineering department, OSM way 516204095).
// Surveyed 2026-10-17 from Google Maps satellite imagery (plan, roofs, the round drum) and Google Street
// View: seven views supplied by the user from the roads and car park round it - the south face from the
// south road, the west face from the carport, the north block and the drum from the west road (two
// points), the south-east corner and the green hall from the east - plus an older car pano on the west road.
// Photos were only looked at; everything here is procedural.
//
// x = east, z = south, y = up.
//   south-west block x -205..-175, z -127..-102:
//     ground floor cream, set back behind yellow-cream square columns on a raised verandah, windows and AC
//     units, entrance steps at the east end of the south face, the department name on the fascia
//     upper storey white and overhanging, a band of deep vertical fins across the south face
//     west face: three projecting angled bay windows, a strip of small windows, a triangular window
//     roof: a stepped grey louvred clerestory box with a metal edge; round stair drum at the north-west
//   north block x -204..-180, z -168..-138: two-storey grey metal-clad hall, louvre bands, low gable roof
//   core x -185..-175, z -140..-127 (white) and a single-storey link along the west x -210..-204
//   south-east hall x -175..-142, z -132..-115: single storey, painted bright green, a band of orange and
//     white diagonal stripes, glazed doors, low metal roof behind the parapet
import * as THREE from 'three';
import { Acc, onFace, glassTex, textTex } from './ecc.js';

export function buildElec(owner) {
  const A = new Acc();
  const F = (ax, at, out) => ({ ax, at, out });

  // ===== south-west block =====
  {
    const x0 = -205, x1 = -175, z0 = -127, z1 = -102, G = 3.8, H = 8.2, P = 0.6, SB = 2.6;
    const S = F('z', z1, 1), W = F('x', x0, -1), E = F('x', x1, 1);
    // ground floor: cream walls set back on the south and east behind columns, raised verandah
    A.box('cream', x0, x1 - SB, 0, G, z0, z1 - SB);
    A.box('plinth', x0, x1, 0, P, z0, z1);
    const SI = F('z', z1 - SB, 1);
    for (const [a0, a1] of [[-202, -199], [-196, -192], [-189, -185]]) onFace(A, 'glass', SI, a0, a1, P + 0.8, G - 0.6, 0, 0.05);
    onFace(A, 'door', SI, -204, -202.6, P, P + 2.2, 0, 0.05);
    for (const x of [-197.5, -187]) onFace(A, 'ac', SI, x, x + 0.9, P + 0.5, P + 1.1, 0, 0.4);
    for (let x = x0 + 0.4; x <= x1 - 0.2; x += 6) A.box('column', x - 0.3, x + 0.3, P, G, z1 - 0.7, z1 - 0.1);
    A.box('column', x1 - 0.7, x1 - 0.1, P, G, z1 - 8, z1 - 7.4);
    for (let s = 0; s < 4; s++) A.box('plinth', -184, -177, 0, P - s * 0.15, z1, z1 + 0.35 * (s + 1));   // entrance steps
    onFace(A, 'yellow', S, x0, x1, G - 0.35, G, 0, 0.05);
    // upper storey: white, overhanging, fins across the south face
    A.box('white', x0 - 0.4, x1 + 0.4, G, H, z0 - 0.4, z1 + 0.6);
    for (let x = -201.5; x < -181; x += 1.15) onFace(A, 'white', S, x, x + 0.28, G + 1.4, H - 1.4, 0.6, 1.5);
    onFace(A, 'glass', S, -201.6, -180.8, G + 1.4, H - 1.4, 0.6, 0.62);
    onFace(A, 'white', S, -202, -180.4, H - 1.4, H - 1.2, 0.6, 1.5);
    onFace(A, 'white', S, -202, -180.4, G + 1.2, G + 1.4, 0.6, 1.5);
    // west face: angled bay windows, small strip windows, triangular window
    const WW = F('x', x0 - 0.4, -1);
    for (let i = 0; i < 3; i++) {
      const z = z1 - 2.5 - i * 1.4;
      A.quad('glass', [x0 - 0.4, G + 0.8, z], [x0 - 1.1, G + 0.8, z - 0.9], [x0 - 1.1, H - 0.9, z - 0.9], [x0 - 0.4, H - 0.9, z]);
      A.quad('white', [x0 - 1.1, G + 0.8, z - 0.9], [x0 - 0.4, G + 0.8, z - 1.2], [x0 - 0.4, H - 0.9, z - 1.2], [x0 - 1.1, H - 0.9, z - 0.9]);
    }
    for (let z = -114; z > -122; z -= 1.6) onFace(A, 'glass', WW, z - 1.1, z, H - 2.2, H - 1.5, 0, 0.05);
    A.tri('glass', [x0 - 0.45, G + 1.0, -112.5], [x0 - 0.45, G + 1.0, -116.5], [x0 - 0.45, G + 3.0, -116.5]);
    for (let z = z0 + 2; z < z1 - 8; z += 3.6) onFace(A, 'glass', F('x', x0, -1), z, z + 1.8, P + 0.9, G - 0.6, 0, 0.05);
    // department name on the south fascia (faces south: viewer looks north, west on the left)
    var sign = { x0: -189, x1: -176.2, y0: G + 0.35, y1: G + 1.05, z: z1 + 0.62 };
    // roof: stepped grey louvred clerestory box with a metal edge
    A.box('roof', x0 - 0.2, x1 + 0.2, H, H + 0.1, z0 - 0.2, z1 + 0.4);
    const cb = [x0 + 1.5, x1 - 1.0, z0 + 1.5, z1 - 1.5];
    for (let i = 0; i < 4; i++) {
      const y = H + 0.1 + i * 0.75, inset = i * 0.45;
      A.box('louvre', cb[0] + inset, cb[1] - inset, y, y + 0.55, cb[2] + inset, cb[3] - inset);
      A.box('shadow', cb[0] + inset + 0.1, cb[1] - inset - 0.1, y + 0.55, y + 0.75, cb[2] + inset + 0.1, cb[3] - inset - 0.1);
    }
    A.box('metal', cb[0] + 1.2, cb[1] - 1.2, H + 3.1, H + 3.4, cb[2] + 1.2, cb[3] - 1.2);
    A.cyl('white', -191, -125.5, 3.3, 0, H + 2.4, 28);                             // round stair drum
    A.cyl('roof', -191, -125.5, 3.25, H + 2.4, H + 2.5, 28);
    A.box('rail', -178.05, -177.95, H, H + 4.5, -105.05, -104.95);                  // TV antenna
    for (const y of [H + 3.6, H + 4.2]) A.box('rail', -179, -177, y, y + 0.05, -105.03, -104.97);
  }

  // ===== north block: grey metal-clad hall =====
  {
    const x0 = -204, x1 = -180, z0 = -168, z1 = -138, H = 8.6;
    A.box('clad', x0, x1, 0, H, z0, z1);
    for (const f of [F('x', x0, -1), F('x', x1, 1), F('z', z0, -1), F('z', z1, 1)]) {
      const [a0, a1] = f.ax === 'x' ? [z0, z1] : [x0, x1];
      onFace(A, 'whiteBase', f, a0, a1, 0, 1.0, 0, 0.05);
      for (let y = 5.6; y < H - 0.6; y += 0.4) onFace(A, 'louvre', f, a0 + 1.2, a1 - 1.2, y, y + 0.15, 0, 0.12);
      onFace(A, 'whiteBase', f, a0, a1, 4.2, 4.5, 0, 0.12);
      for (let a = a0 + 2; a < a1 - 2; a += 5) onFace(A, 'glass', f, a, a + 2.4, 1.6, 3.6, 0, 0.05);
    }
    const zm = (z0 + z1) / 2, r = 1.8, o = 0.5;
    A.quad('metal', [x1 + o, H, z0 - o], [x0 - o, H, z0 - o], [x0 - o, H + r, zm], [x1 + o, H + r, zm]);
    A.quad('metal', [x0 - o, H, z1 + o], [x1 + o, H, z1 + o], [x1 + o, H + r, zm], [x0 - o, H + r, zm]);
    A.tri('clad', [x0, H, z1], [x0, H, z0], [x0, H + r, zm]);
    A.tri('clad', [x1, H, z0], [x1, H, z1], [x1, H + r, zm]);
  }
  // ===== core and west link =====
  A.box('white', -185, -175, 0, 9.6, -140, -127);
  A.box('white', -210, -204, 0, 3.8, -164, -120);
  A.box('roofLight', -210.3, -203.8, 3.8, 4.0, -164.3, -119.7);
  for (let z = -162; z < -122; z += 4) onFace(A, 'glass', F('x', -210, -1), z, z + 2.4, 1.0, 2.6, 0, 0.05);

  // ===== south-east hall: green, orange/white stripe band =====
  {
    const x0 = -175, x1 = -142, z0 = -132, z1 = -115, H = 5.2;
    A.box('green', x0, x1, 0, H, z0, z1);
    onFace(A, 'glass', F('z', z1, 1), -162, -158, 0.2, 2.6, 0, 0.05);
    onFace(A, 'glass', F('x', x1, 1), -127, -123, 0.2, 2.6, 0, 0.05);
    var stripes = [[F('z', z1, 1), x0, x1], [F('x', x1, 1), z0, z1], [F('z', z0, -1), x0, x1]];
    A.box('metal', x0 + 0.6, x1 - 0.6, H - 0.4, H + 0.6, z0 + 0.6, z1 - 0.6);
    A.box('greenDark', x0, x1, H, H + 0.25, z0, z1);
  }

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true);
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    white: std({ color: '#edece7', side: THREE.DoubleSide }),
    whiteBase: std({ color: '#e4e3de' }),
    cream: std({ color: '#ebdfc4' }),
    yellow: std({ color: '#e3c97f' }),
    column: std({ color: '#ead69c' }),
    plinth: std({ color: '#cbc6bb', roughness: 1 }),
    glass: std({ color: '#3f4c55', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0, side: THREE.DoubleSide }),
    door: std({ color: '#5b4a3c', roughness: 0.8 }),
    ac: std({ color: '#e6e6e3', roughness: 0.7 }),
    roof: std({ color: '#a3a4a2', roughness: 0.95 }),
    roofLight: std({ color: '#d4d3cd', roughness: 0.9 }),
    louvre: std({ color: '#a6a9aa', roughness: 0.6, metalness: 0.3 }),
    shadow: std({ color: '#5e6163', roughness: 0.9 }),
    clad: std({ color: '#b9bcbc', roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide }),
    metal: std({ color: '#c9cbc9', roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide }),
    rail: std({ color: '#d9dcdf', roughness: 0.4, metalness: 0.5 }),
    green: std({ color: '#2fb54a', roughness: 0.7 }),
    greenDark: std({ color: '#25963c', roughness: 0.7 }),
  };
  const meshes = [];
  const add = (g, mat) => {
    g.computeBoundingSphere();
    g.userData.owner = new Int32Array(g.attributes.position.count / 3).fill(owner);
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.kind = 'building';
    meshes.push(mesh);
  };
  for (const [k, B] of Object.entries(A.b)) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    add(g, MAT[k]);
  }
  const quadTex = (tex, P0, P1, P2, P3, rx = 1) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([...P0, ...P1, ...P2, ...P0, ...P2, ...P3], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, rx, 0, rx, 1, 0, 0, rx, 1, 0, 1], 2));
    g.computeVertexNormals();
    add(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.8 }));
  };
  quadTex(textTex('ภาควิชาวิศวกรรมไฟฟ้า', { color: '#5d5b57', h: 150 }), [sign.x0, sign.y0, sign.z], [sign.x1, sign.y0, sign.z], [sign.x1, sign.y1, sign.z], [sign.x0, sign.y1, sign.z]);
  // orange/white diagonal stripe band on the green hall
  const stripe = (() => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
    const g = cv.getContext('2d'); g.fillStyle = '#2fb54a'; g.fillRect(0, 0, 256, 64);
    for (let i = -1; i < 4; i++) {
      g.fillStyle = '#e8622c'; g.beginPath(); g.moveTo(i * 64 + 8, 64); g.lineTo(i * 64 + 40, 0); g.lineTo(i * 64 + 64, 0); g.lineTo(i * 64 + 32, 64); g.fill();
      g.fillStyle = '#f4f2ec'; g.beginPath(); g.moveTo(i * 64 + 32, 64); g.lineTo(i * 64 + 64, 0); g.lineTo(i * 64 + 76, 0); g.lineTo(i * 64 + 44, 64); g.fill();
    }
    const t = new THREE.CanvasTexture(cv); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  for (const [f, a0, a1] of stripes) {
    const y0 = 3.6, y1 = 4.9, d = 0.06, n = (a1 - a0) / 5.5;
    if (f.ax === 'z') {
      const z = f.at + f.out * d;
      const [l, r] = f.out > 0 ? [a0, a1] : [a1, a0];
      quadTex(stripe, [l, y0, z], [r, y0, z], [r, y1, z], [l, y1, z], n);
    } else {
      const x = f.at + f.out * d;
      const [l, r] = f.out > 0 ? [a1, a0] : [a0, a1];
      quadTex(stripe, [x, y0, l], [x, y0, r], [x, y1, r], [x, y1, l], n);
    }
  }
  return { meshes, top: 11.6 };
}

// Ground outline traced from the satellite imagery
export const ELEC_OUTLINE = [
  [-204, -168], [-180, -168], [-180, -140], [-175, -140], [-175, -132], [-142, -132], [-142, -115], [-175, -115],
  [-175, -102], [-205, -102], [-205, -120], [-210, -120], [-210, -164], [-204, -164], [-204, -168],
];
