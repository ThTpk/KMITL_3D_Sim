// A crowd of event figures (students.js figures) in one instanced mesh, posed every frame by the event scenes.
import * as THREE from 'three';
import { figure } from './students.js';

const base = new THREE.Matrix4(), Mp = new THREE.Matrix4(), M = new THREE.Matrix4(), S = new THREE.Vector3();
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

export class Crowd {
  constructor() { this.members = []; this.parts = 0; this.mesh = null; }
  // extra: more parts in figure() form [colour, pivotX, pivotY, centreY, centreZ, w, h, d, swing] (a sash, a bouquet)
  add(R, female, shirt, skirt, extra = []) {
    const P = figure(R, female, shirt, skirt).concat(extra.map(([c, ...r]) => [new THREE.Color(c), ...r]));
    const m = { P, i0: this.parts, phase: R() * Math.PI * 2 };
    this.parts += P.length;
    this.members.push(m);
    return m;
  }
  // call once every figure has been added
  finish() {
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.8 }), Math.max(1, this.parts));
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
    for (const m of this.members) m.P.forEach((p, k) => mesh.setColorAt(m.i0 + k, p[0]));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    this.mesh = mesh;
    return mesh;
  }
  // legs swing with `swing`; arms swing with the stride, or are held at `arm` (radians, negative = forwards)
  place(m, x, y, z, yaw, swing, arm = null) {
    base.makeRotationY(yaw).setPosition(x, y, z);
    for (let k = 0; k < m.P.length; k++) {
      const [, px, py, cy, cz, w, h, d, sw] = m.P[k];
      let ang = 0;
      if (Math.abs(sw) === 1) ang = 0.42 * Math.sign(sw) * swing;
      else if (sw) ang = arm ?? -0.36 * Math.sign(sw) * swing;
      const c = Math.cos(ang), s = Math.sin(ang);
      Mp.makeRotationX(ang).scale(S.set(w, h, d)).setPosition(px, py + cy * c - cz * s, cy * s + cz * c);
      this.mesh.setMatrixAt(m.i0 + k, M.multiplyMatrices(base, Mp));
    }
  }
  hide(m) { for (let k = 0; k < m.P.length; k++) this.mesh.setMatrixAt(m.i0 + k, ZERO); }
  hideAll() { for (const m of this.members) this.hide(m); }
  flush() { this.mesh.instanceMatrix.needsUpdate = true; }
}
