// Small props shared by the event scenes: market / booth tents, feather flags, printed boards.
import * as THREE from 'three';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });
const shadowed = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
const poleMat = std('#cfd2d6', { metalness: 0.5 });
const roofGeo = new THREE.ConeGeometry(2.3, 1.0, 4, 1).rotateY(Math.PI / 4);
const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6);

// a 3 x 3 m pop-up tent, its open front (+z) turned to yaw; a table across the front; a coloured valance
export function tent(parent, x, z, yaw, { roof = '#f4f1ea', cloth = '#e8641e', table = true } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; parent.add(g);
  const add = (geo, mat, px, py, pz) => { const m = shadowed(new THREE.Mesh(geo, mat)); m.position.set(px, py, pz); g.add(m); return m; };
  for (const a of [-1.45, 1.45]) for (const b of [-1.45, 1.45]) add(poleGeo, poleMat, a, 1.2, b);
  add(roofGeo, std(roof), 0, 2.9, 0);
  add(new THREE.BoxGeometry(3.0, 0.25, 0.04), std(cloth), 0, 2.3, 1.5);
  if (table) add(new THREE.BoxGeometry(2.6, 0.75, 0.8), std(cloth), 0, 0.38, 0.9);
  return g;
}

// a printed board (canvas drawing) facing +z, w x h metres, lit or not
export function board(draw, w, h, { px = 512, lit = true, double = false } = {}) {
  const cv = document.createElement('canvas'); cv.width = px; cv.height = Math.round((px * h) / w);
  draw(cv.getContext('2d'), cv.width, cv.height);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mat = lit ? new THREE.MeshBasicMaterial({ map: tex, side: double ? THREE.DoubleSide : THREE.FrontSide })
    : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, side: double ? THREE.DoubleSide : THREE.FrontSide });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
}

// centred text lines on a solid background: lines = [[text, sizeFraction, colour], ...]
export function textBoard(lines, bg, w, h, opts) {
  return board((g, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const total = lines.reduce((a, l) => a + l[1], 0);
    let y = (H * (1 - total)) / 2;
    for (const [text, f, col, weight = 700] of lines) {
      g.fillStyle = col; g.font = `${weight} ${H * f * 0.8}px "IBM Plex Sans Thai", sans-serif`;
      g.fillText(text, W / 2, y + (H * f) / 2, W * 0.94); y += H * f;
    }
  }, w, h, opts);
}

// a feather flag: a pole with a tall curved banner, printed vertically
export function featherFlag(parent, x, z, yaw, text, color) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; parent.add(g);
  const pole = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4.6, 6), poleMat)); pole.position.y = 2.3; g.add(pole);
  const flag = board((c, W, H) => {
    c.fillStyle = color; c.fillRect(0, 0, W, H);
    c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.save(); c.translate(W / 2, H / 2); c.rotate(-Math.PI / 2);
    c.font = `700 ${W * 0.5}px "IBM Plex Sans Thai", sans-serif`; c.fillText(text, 0, 0, H * 0.9); c.restore();
  }, 0.8, 3.4, { px: 128, lit: false, double: true });
  flag.position.set(0.42, 2.8, 0); flag.castShadow = true; g.add(flag);
  return g;
}
