// Hand-built model of ภาคไฟฟ้าและพลังงานไฟฟ้า (Electrical Engineering department, OSM way 516204095).
// Surveyed 2026-10-17 from Google Maps satellite imagery (plan, roofs, the round drum) and one Google Street
// View car pano on the road to the west. That capture is old and stands about 40 m from the south-west part,
// across a car park: it shows white rendered walls, a round drum, a band of deep vertical fins and louvred
// metal-clad clerestory boxes. The north block is newer than the capture and is modelled from the roof
// only; its height (three storeys) is an estimate. Photos were only looked at; everything is procedural.
//
// x = east, z = south, y = up.
//   north block   x -204..-180, z -168..-138: three storeys, white, ribbon windows; flat roof with plant
//   west link     x -210..-204, z -164..-120: single-storey corridor
//   core          x -185..-175, z -140..-128
//   south-west    x -205..-175, z -127..-102: two storeys, white; round drum (stair) at the north-west
//                 corner, deep vertical fins along the west face, louvred clerestory box on the roof
//   south-east    x -175..-142, z -132..-115: two storeys, white, louvred clerestory along the roof
import * as THREE from 'three';
import { Acc, onFace, glassTex } from './ecc.js';

export function buildElec(owner) {
  const A = new Acc();
  const F = (ax, at, out) => ({ ax, at, out });
  const ribbon = (f, a0, a1, floors, h0, fl) => {
    for (let k = 0; k < floors; k++) {
      const y = h0 + k * fl;
      onFace(A, 'glass', f, a0 + 0.8, a1 - 0.8, y + 1.0, y + 2.4, 0, 0.05);
      onFace(A, 'white', f, a0, a1, y + 2.9, y + 3.2, 0, 0.5);                      // sunshade band
    }
  };

  // ---- north block ----
  {
    const x0 = -204, x1 = -180, z0 = -168, z1 = -138, H = 11.4;
    A.box('white', x0, x1, 0, H, z0, z1);
    ribbon(F('x', x0, -1), z0, z1, 3, 0, 3.6);
    ribbon(F('x', x1, 1), z0, z1, 3, 0, 3.6);
    ribbon(F('z', z0, -1), x0, x1, 3, 0, 3.6);
    onFace(A, 'grey', F('z', z0, -1), x0, x1, H - 0.4, H + 0.4, 0, 0.2);
    A.box('roof', x0 + 0.3, x1 - 0.3, H, H + 0.1, z0 + 0.3, z1 - 0.3);
    A.box('plant', -193, -186, H, H + 2.2, -155, -148);
    A.box('plant', -201, -196, H, H + 1.5, -150, -146);
  }
  // ---- west link and core ----
  A.box('white', -210, -204, 0, 3.8, -164, -120);
  A.box('roofLight', -210.3, -203.8, 3.8, 4.0, -164.3, -119.7);
  for (let z = -162; z < -122; z += 4) onFace(A, 'glass', F('x', -210, -1), z, z + 2.4, 1.0, 2.6, 0, 0.05);
  A.box('white', -185, -175, 0, 9.5, -140, -127);

  // ---- south-west: drum, fins, clerestory ----
  {
    const x0 = -205, x1 = -175, z0 = -127, z1 = -102, H = 7.8;
    A.box('white', x0, x1, 0, H, z0, z1);
    A.cyl('white', -191, -125, 3.3, 0, H + 2.2, 28);                              // round drum
    A.cyl('roof', -191, -125, 3.25, H + 2.2, H + 2.3, 28);
    const W = F('x', x0, -1);
    onFace(A, 'glass', W, z0 + 1, z1 - 1, 3.6, 6.6, 0, 0.05);
    for (let z = z0 + 1; z < z1 - 0.8; z += 1.3) onFace(A, 'white', W, z, z + 0.3, 3.3, 7.0, 0, 1.1);   // deep fins
    onFace(A, 'white', W, z0, z1, 7.0, 7.4, 0, 1.2);
    onFace(A, 'glass', W, z0 + 2, z1 - 2, 0.8, 2.6, 0, 0.05);
    ribbon(F('z', z1, 1), x0, x1, 2, 0, 3.7);
    A.box('clad', -201, -188, H, H + 2.6, -122, -108);                             // louvred clerestory box
    for (let y = H + 0.4; y < H + 2.4; y += 0.35) onFace(A, 'louvre', F('x', -201, -1), -121, -109, y, y + 0.12, 0, 0.15);
    A.box('roof', x0 + 0.3, x1 - 0.3, H, H + 0.1, z0 + 0.3, z1 - 0.3);
    A.box('rail', -178.05, -177.95, H, H + 4.5, -105.05, -104.95);                  // TV antenna
    for (const y of [H + 3.6, H + 4.2]) A.box('rail', -179, -177, y, y + 0.05, -105.03, -104.97);
  }
  // ---- south-east: louvred clerestory along a low gable ----
  {
    const x0 = -175, x1 = -142, z0 = -132, z1 = -115, H = 7.8;
    A.box('white', x0, x1, 0, H, z0, z1);
    ribbon(F('z', z1, 1), x0, x1, 2, 0, 3.7);
    ribbon(F('x', x1, 1), z0, z1, 2, 0, 3.7);
    A.box('clad', x0 + 2, x1 - 2, H, H + 2.0, z0 + 5, z1 - 5);
    for (let y = H + 0.3; y < H + 1.8; y += 0.35) {
      onFace(A, 'louvre', F('z', z0 + 5, -1), x0 + 2.5, x1 - 2.5, y, y + 0.12, 0, 0.15);
      onFace(A, 'louvre', F('z', z1 - 5, 1), x0 + 2.5, x1 - 2.5, y, y + 0.12, 0, 0.15);
    }
    const y0 = H + 2.0, zm = (z0 + z1) / 2;
    A.quad('metal', [x1 - 1.6, y0, z0 + 4.4], [x0 + 1.6, y0, z0 + 4.4], [x0 + 1.6, y0 + 1.0, zm], [x1 - 1.6, y0 + 1.0, zm]);
    A.quad('metal', [x0 + 1.6, y0, z1 - 4.4], [x1 - 1.6, y0, z1 - 4.4], [x1 - 1.6, y0 + 1.0, zm], [x0 + 1.6, y0 + 1.0, zm]);
    A.box('roof', x0, x1 - 0.3, H, H + 0.1, z0 + 0.3, z1 - 0.3);
  }

  // ===== materials & meshes =====
  const gDay = glassTex(false), gNight = glassTex(true);
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02, ...o });
  const MAT = {
    white: std({ color: '#ecebe6' }),
    grey: std({ color: '#9fa2a4' }),
    glass: std({ color: '#46555e', map: gDay, roughness: 0.3, emissive: new THREE.Color('#ffc978'), emissiveMap: gNight, emissiveIntensity: 0 }),
    roof: std({ color: '#a3a4a2', roughness: 0.95 }),
    roofLight: std({ color: '#d4d3cd', roughness: 0.9 }),
    plant: std({ color: '#c0c1bf', roughness: 0.8 }),
    clad: std({ color: '#dcdcd6', roughness: 0.6, metalness: 0.3 }),
    louvre: std({ color: '#b9bab5', roughness: 0.6, metalness: 0.3 }),
    metal: std({ color: '#c9cbc9', roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide }),
    rail: std({ color: '#d9dcdf', roughness: 0.4, metalness: 0.5 }),
  };
  const meshes = [];
  for (const [k, B] of Object.entries(A.b)) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    g.computeBoundingSphere();
    g.userData.owner = new Int32Array(g.attributes.position.count / 3).fill(owner);
    const mesh = new THREE.Mesh(g, MAT[k]);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.kind = 'building';
    meshes.push(mesh);
  }
  return { meshes, top: 13.6 };
}

// Ground outline traced from the satellite imagery
export const ELEC_OUTLINE = [
  [-204, -168], [-180, -168], [-180, -140], [-175, -140], [-175, -132], [-142, -132], [-142, -115], [-175, -115],
  [-175, -102], [-205, -102], [-205, -120], [-210, -120], [-210, -164], [-204, -164], [-204, -168],
];
