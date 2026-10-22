// A detailed student figure for the programme page: the same look as the campus students (white shirt, black
// trousers or skirt, black shoes) but with rounded limbs, jointed arms and legs, hands, a face and hair.
// Feet at y = 0, about 1.72 m tall (a woman 0.94 of that), facing +z. Clothes come from an outfit object so the
// same body can wear the university uniform, the red KMITL gown or a work outfit.
import * as THREE from 'three';

export const SKIN = '#e2b48e', HAIR = '#1b1512', BLACK = '#1b1c1f';
const MATS = new Map();
export const mat = (c, o = {}) => {
  const key = c + JSON.stringify(o);
  if (!MATS.has(key)) MATS.set(key, new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0, ...o }));
  return MATS.get(key);
};
const cap = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 14);
function mesh(geo, m, parent, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, typeof m === 'string' ? mat(m) : m);
  o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
const joint = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

// outfit: { shirt, long (sleeves), pants, lower: 'trousers' | 'skirt', coat, hood, collar, lanyard, gown: { color, trim, stripe } }
export function buildHuman({ female = false, outfit = {} } = {}) {
  const o = { shirt: '#f6f6f3', long: false, ...outfit };
  const root = new THREE.Group(), body = joint(root, 0, 0, 0);
  const lower = o.lower || (female ? 'skirt' : 'trousers');
  const W = female ? 0.92 : 1;                 // shoulders and hips a little narrower for a woman
  const J = {};

  // ---------- legs: hip -> knee -> ankle, shoes ----------
  for (const s of [1, -1]) {
    const hip = J['hip' + s] = joint(body, 0.088 * s * W, 0.93, 0);
    const legCol = lower === 'trousers' ? o.pants || BLACK : SKIN;
    mesh(cap(female ? 0.06 : 0.068, 0.3), legCol, hip, 0, -0.215, 0);
    const knee = J['knee' + s] = joint(hip, 0, -0.43, 0);
    mesh(cap(female ? 0.047 : 0.056, 0.3), legCol, knee, 0, -0.2, 0);
    if (lower === 'trousers') mesh(new THREE.CylinderGeometry(0.062, 0.066, 0.06, 14), o.pants || BLACK, knee, 0, -0.38, 0); // trouser hem
    const shoe = mesh(cap(0.043, 0.15), '#121214', knee, 0, -0.435, 0.04);
    shoe.rotation.x = Math.PI / 2; shoe.scale.set(1.05, 1, 0.72);
  }
  // ---------- hips / skirt, belt ----------
  if (lower === 'skirt') {
    const sk = mesh(new THREE.CylinderGeometry(0.16, 0.25, 0.52, 24), BLACK, body, 0, 0.73, 0); sk.scale.z = 0.72;
  } else {
    const p = mesh(new THREE.CylinderGeometry(0.152, 0.158, 0.16, 20), o.pants || BLACK, body, 0, 0.92, 0); p.scale.z = 0.66;
  }
  const belt = mesh(new THREE.CylinderGeometry(0.153, 0.153, 0.04, 24), '#151517', body, 0, 0.995, 0); belt.scale.z = 0.66;
  mesh(new THREE.BoxGeometry(0.055, 0.036, 0.012), mat('#c9ccd1', { metalness: 0.8, roughness: 0.3 }), body, 0, 0.995, 0.103);

  // ---------- torso (shirt or coat), collar, buttons, pocket ----------
  const top = o.coat || o.shirt;
  const torso = mesh(new THREE.CylinderGeometry(0.168 * W, 0.15 * W, 0.42, 24), top, body, 0, 1.2, 0); torso.scale.z = 0.64;
  const chest = mesh(new THREE.SphereGeometry(0.168 * W, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), top, body, 0, 1.41, 0); chest.scale.set(1, 0.32, 0.64);
  for (const s of [1, -1]) mesh(new THREE.SphereGeometry(0.068, 16, 12), top, body, 0.165 * s * W, 1.37, 0);
  if (female) { const b = mesh(new THREE.SphereGeometry(0.11, 18, 12), top, body, 0, 1.27, 0.035); b.scale.set(1.25, 0.6, 0.55); }
  const collarCol = o.collar || o.shirt;
  for (const s of [1, -1]) {
    const c = mesh(new THREE.BoxGeometry(0.075, 0.05, 0.012), collarCol, body, 0.03 * s, 1.425, 0.095);
    c.rotation.z = 0.55 * s; c.rotation.x = -0.25;
  }
  if (!o.coat && !o.hood) {
    mesh(new THREE.BoxGeometry(0.012, 0.36, 0.006), '#e4e4df', body, 0, 1.22, 0.1);
    for (let i = 0; i < 4; i++) mesh(new THREE.SphereGeometry(0.007, 8, 6), '#d8d8d2', body, 0, 1.36 - i * 0.095, 0.104);
    mesh(new THREE.BoxGeometry(0.075, 0.08, 0.006), o.shirt, body, 0.075 * W, 1.29, 0.098);
    mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.004, 12), mat('#ff6b00', { emissive: '#ff6b00', emissiveIntensity: 0.2 }), body, 0.075 * W, 1.315, 0.102).rotation.x = Math.PI / 2; // university pin
  }
  if (o.coat) { mesh(new THREE.BoxGeometry(0.012, 0.42, 0.006), '#c6ced6', body, 0, 1.2, 0.1); const tail = mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.42, 20, 1, true), mat(o.coat, { side: THREE.DoubleSide }), body, 0, 0.8, 0); tail.scale.z = 0.7; }
  if (o.hood) { const h = mesh(new THREE.SphereGeometry(0.13, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), o.hood, body, 0, 1.43, -0.07); h.scale.set(1, 0.6, 0.8); h.rotation.x = -0.5; }
  if (o.lanyard) { for (const s of [1, -1]) { const l = mesh(new THREE.BoxGeometry(0.012, 0.2, 0.004), o.lanyard, body, 0.035 * s, 1.33, 0.1); l.rotation.z = 0.18 * s; } mesh(new THREE.BoxGeometry(0.06, 0.085, 0.006), '#ffffff', body, 0, 1.2, 0.106); }

  // ---------- arms: shoulder -> elbow -> wrist, hands ----------
  for (const s of [1, -1]) {
    const sh = J['sh' + s] = joint(body, 0.2 * s * W, 1.385, 0);
    if (o.long) mesh(cap(0.05, 0.22), top, sh, 0, -0.145, 0);
    else { mesh(new THREE.CylinderGeometry(0.062, 0.058, 0.15, 14), top, sh, 0, -0.07, 0); mesh(cap(0.043, 0.2), SKIN, sh, 0, -0.16, 0); }
    const el = J['el' + s] = joint(sh, 0, -0.29, 0);
    mesh(cap(o.long ? 0.045 : 0.039, 0.18), o.long ? top : SKIN, el, 0, -0.12, 0);
    const wr = J['wr' + s] = joint(el, 0, -0.25, 0);
    const palm = mesh(new THREE.SphereGeometry(0.045, 14, 10), SKIN, wr, 0, -0.05, 0); palm.scale.set(0.75, 1.15, 0.5);
    const th = mesh(cap(0.013, 0.035), SKIN, wr, -0.028 * s, -0.035, 0.02); th.rotation.z = 0.5 * s;
  }

  // ---------- neck and head: face, ears, hair ----------
  mesh(cap(0.045, 0.06), SKIN, body, 0, 1.47, 0);
  const head = J.head = joint(body, 0, 1.6, 0);
  const skull = mesh(new THREE.SphereGeometry(0.104, 28, 20), SKIN, head, 0, 0, 0); skull.scale.set(0.95, 1.13, 1.04);
  const jaw = mesh(new THREE.SphereGeometry(0.08, 20, 14), SKIN, head, 0, -0.055, 0.02); jaw.scale.set(1, 0.8, 1);
  for (const s of [1, -1]) {
    const ear = mesh(new THREE.SphereGeometry(0.022, 10, 8), SKIN, head, 0.1 * s, 0, -0.005); ear.scale.set(0.45, 1, 0.75);
    const eye = mesh(new THREE.SphereGeometry(0.015, 12, 8), '#fbfaf7', head, 0.036 * s, 0.012, 0.091); eye.scale.set(1.15, 0.75, 0.5);
    mesh(new THREE.SphereGeometry(0.0085, 10, 8), '#2a1a12', head, 0.036 * s, 0.012, 0.098);
    const brow = mesh(new THREE.BoxGeometry(0.036, 0.007, 0.01), HAIR, head, 0.037 * s, 0.042, 0.095); brow.rotation.z = -0.1 * s;
  }
  const nose = mesh(new THREE.SphereGeometry(0.017, 10, 8), mat('#d9a882'), head, 0, -0.012, 0.103); nose.scale.set(0.9, 1.1, 0.9);
  mesh(new THREE.BoxGeometry(0.036, 0.007, 0.008), female ? '#b4555a' : '#a0605a', head, 0, -0.05, 0.094);
  // the hair cap is tipped back so it sits above the forehead at the front and comes down to the nape behind
  const hairTop = mesh(new THREE.SphereGeometry(0.112, 26, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), HAIR, head, 0, 0.02, -0.01);
  hairTop.scale.set(0.98, 1.12, 1.08); hairTop.rotation.x = -0.5;
  if (female) {
    const back = mesh(new THREE.SphereGeometry(0.11, 20, 14), HAIR, head, 0, -0.1, -0.05); back.scale.set(1.05, 1.6, 0.6);
    for (const s of [1, -1]) { const side = mesh(cap(0.03, 0.14), HAIR, head, 0.088 * s, -0.08, 0.0); side.scale.z = 0.7; }
    const bangs = mesh(new THREE.BoxGeometry(0.17, 0.035, 0.03), HAIR, head, 0, 0.075, 0.085); bangs.rotation.x = -0.3;
  } else {
    const fringe = mesh(new THREE.BoxGeometry(0.16, 0.025, 0.04), HAIR, head, 0, 0.09, 0.07); fringe.rotation.x = -0.5;
    const nape = mesh(new THREE.SphereGeometry(0.1, 18, 12), HAIR, head, 0, -0.02, -0.035); nape.scale.set(1.02, 0.9, 0.82);
    for (const s of [1, -1]) mesh(new THREE.BoxGeometry(0.012, 0.05, 0.05), HAIR, head, 0.098 * s, 0.03, 0.02);
  }

  // ---------- gown (ครุย สจล.): a straight red-orange robe to mid-shin, open down the front; a gold สำรด edged with
  // black runs round the back of the neck, down both front edges and along the hem; straight wide sleeves to the
  // wrist with a gold-and-black band at the cuff (from a photo of the gown supplied by the user) ----------
  if (o.gown) {
    const g = o.gown, robe = mat(g.color, { side: THREE.DoubleSide, roughness: 0.6 });
    const gold = mat(g.trim, { roughness: 0.35, metalness: 0.45 }), black = mat(g.stripe, { roughness: 0.5 });
    const gap = 0.36, rT = 0.205 * W, rB = 0.26, yT = 1.44, yB = 0.34, D = 0.74;   // open front half-angle, radii, depth squash
    const th0 = gap, thL = Math.PI * 2 - gap * 2;
    const r = mesh(new THREE.CylinderGeometry(rT, rB, yT - yB, 40, 1, true, th0, thL), robe, body, 0, (yT + yB) / 2, 0); r.scale.z = D;
    const yoke = mesh(new THREE.SphereGeometry(rT + 0.004, 32, 10, th0, thL, 0, Math.PI / 2), robe, body, 0, yT, 0); yoke.scale.set(1, 0.28, D);
    // hem: a gold band with a black line above it, following the robe round
    const goldS = mat(g.trim, { side: THREE.DoubleSide, roughness: 0.35, metalness: 0.45 }), blackS = mat(g.stripe, { side: THREE.DoubleSide });
    const ring = (h, y, m, dr) => { const c = mesh(new THREE.CylinderGeometry(rB + dr, rB + dr + 0.002, h, 40, 1, true, th0, thL), m, body, 0, y, 0); c.scale.z = D; };
    ring(0.07, yB + 0.035, goldS, 0.004); ring(0.012, yB + 0.078, blackS, 0.005); ring(0.01, yB + 0.004, blackS, 0.005);
    // front edges: a wide gold band between two black lines, laid on the robe just beside the opening
    const up = new THREE.Vector3(), nrm = new THREE.Vector3(), rgt = new THREE.Vector3(), M = new THREE.Matrix4();
    for (const s of [1, -1]) {
      const T = new THREE.Vector3(Math.sin(gap) * rT * s, yT, Math.cos(gap) * rT * D);
      const B = new THREE.Vector3(Math.sin(gap) * rB * s, yB, Math.cos(gap) * rB * D);
      up.subVectors(T, B); const len = up.length(); up.normalize();
      nrm.set(Math.sin(gap) * s, 0, Math.cos(gap) / D).normalize();
      rgt.crossVectors(up, nrm).normalize(); nrm.crossVectors(rgt, up).normalize();
      M.makeBasis(rgt, up, nrm);
      const mid = T.clone().add(B).multiplyScalar(0.5).addScaledVector(nrm, 0.006);
      const out = s * Math.sign(rgt.x || 1);      // which way along `rgt` leads away from the opening
      for (const [w, off, m, z] of [[0.095, 0.0475, gold, 0], [0.01, 0.003, black, 0.002], [0.01, 0.078, black, 0.002], [0.006, 0.092, gold, 0.002]]) {
        const b = mesh(new THREE.BoxGeometry(w, len, 0.008), m, body);
        b.quaternion.setFromRotationMatrix(M); b.position.copy(mid).addScaledVector(rgt, off * out).addScaledVector(nrm, z);
      }
      // sleeves: straight and wide, to the wrist; a gold cuff band with black lines
      const sh = J['sh' + s], el = J['el' + s];
      mesh(new THREE.CylinderGeometry(0.072, 0.095, 0.3, 20, 1, true), robe, sh, 0, -0.15, 0);
      mesh(new THREE.CylinderGeometry(0.095, 0.11, 0.24, 20, 1, true), robe, el, 0, -0.11, 0);
      mesh(new THREE.CylinderGeometry(0.111, 0.113, 0.07, 20, 1, true), goldS, el, 0, -0.19, 0);
      for (const y of [-0.152, -0.205]) mesh(new THREE.CylinderGeometry(0.114, 0.114, 0.01, 20, 1, true), blackS, el, 0, y, 0);
    }
    // the สำรด round the back of the neck, joining the two front bands
    const neck = mesh(new THREE.TorusGeometry(0.115, 0.03, 8, 40, Math.PI * 1.25), gold, body, 0, 1.445, -0.015);
    neck.rotation.set(Math.PI / 2, 0, Math.PI * 0.875); neck.scale.set(1.2, 0.95, 0.55);
    const neckLine = mesh(new THREE.TorusGeometry(0.15, 0.006, 6, 40, Math.PI * 1.25), black, body, 0, 1.44, -0.015);
    neckLine.rotation.set(Math.PI / 2, 0, Math.PI * 0.875); neckLine.scale.set(1.12, 0.95, 1);
  }

  // a relaxed stance: arms slightly out, elbows a little bent
  for (const s of [1, -1]) { J['sh' + s].rotation.z = 0.09 * s; J['el' + s].rotation.x = -0.18; }
  if (female) root.scale.setScalar(0.94);
  return { root, body, J };
}
