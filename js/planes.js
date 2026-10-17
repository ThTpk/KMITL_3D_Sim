// Airliners passing over KMITL on the line through the stadium and the 12-storey lecture building. The line runs
// a little east of south, close to the approach to Suvarnabhumi's runways a few km to the south-west: arrivals
// fly south descending on a 3° glide, departures fly north climbing. Shown with the trains and cars.
import * as THREE from 'three';

const P1 = new THREE.Vector3(-645, 0, -250);    // over the stadium field
const P2 = new THREE.Vector3(-603, 0, 49);      // over the 12-storey building
const DIR = P2.clone().sub(P1).normalize();     // heading roughly south
const MID = P1.clone().add(P2).multiplyScalar(0.5);
const HALF = 4500;                              // metres either side of KMITL
const SPEED = 75;                               // m/s, final approach / initial climb

function airliner(livery) {
  const g = new THREE.Group();
  const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.25, ...o });
  const white = std('#f2f3f5'), tail = std(livery), grey = std('#9aa0a6'), dark = std('#2b3138');
  // fuselage along +z (nose at +z)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.9, 52, 16), white); body.rotation.x = Math.PI / 2; g.add(body);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(2.9, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), white); nose.rotation.x = Math.PI / 2; nose.scale.y = 2.2; nose.position.z = 26; g.add(nose);
  const tailCone = new THREE.Mesh(new THREE.ConeGeometry(2.9, 12, 16), white); tailCone.rotation.x = -Math.PI / 2; tailCone.position.set(0, 0.8, -32); tailCone.scale.z = 0.7; g.add(tailCone);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(2.95, 2.95, 50, 16, 1, true, -0.4, 0.8), tail); stripe.rotation.x = Math.PI / 2; stripe.rotation.y = Math.PI / 2; g.add(stripe);
  const windows = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 40), dark); for (const x of [-2.85, 2.85]) { const w = windows.clone(); w.position.set(x, 0.9, 1); g.add(w); }
  // swept wings and tailplane as flat prisms
  const wing = (span, root, tip, sweep, t) => {
    const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(span, -sweep), new THREE.Vector2(span, -sweep - tip), new THREE.Vector2(0, -root)]);
    return new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
  };
  for (const side of [1, -1]) {
    const w = new THREE.Mesh(wing(30, 11, 3, 14, 0.6), grey); w.rotation.x = Math.PI / 2; w.scale.x = side; w.position.set(side * 2, -1.2, 6); g.add(w);
    const t = new THREE.Mesh(wing(10, 6, 2, 6, 0.4), grey); t.rotation.x = Math.PI / 2; t.scale.x = side; t.position.set(side * 1, 1, -27); g.add(t);
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.3, 6, 12), grey); eng.rotation.x = Math.PI / 2; eng.position.set(side * 10, -3.2, 3); g.add(eng);
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 6), new THREE.MeshBasicMaterial({ color: side > 0 ? '#3cff6a' : '#ff3b30' }));
    light.position.set(side * 32, -1.2, -9); g.add(light);
  }
  const fin = new THREE.Mesh(wing(11, 9, 4, 8, 0.5), tail);
  fin.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)));
  fin.position.set(-0.25, 2.2, -21); g.add(fin);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff2a2a' }));
  beacon.position.set(0, 3.2, 0); beacon.userData.beacon = true; g.add(beacon);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

export function buildPlanes() {
  const group = new THREE.Group();
  const liveries = ['#4b2a7b', '#1d4f91', '#c8102e', '#0b6e4f'];
  // two aircraft on the line at a time, one arriving and one departing, offset in time
  const planes = [0, 1].map((k) => {
    const mesh = airliner(liveries[k]);
    group.add(mesh);
    return { mesh, arriving: k === 0, s: k === 0 ? -HALF : -HALF * 0.2, livery: k };
  });
  let t = 0;
  const pos = new THREE.Vector3();
  function place(p) {
    // s runs along the direction of flight; arrivals head along DIR (south), departures against it (north)
    const d = p.arriving ? DIR : DIR.clone().negate();
    pos.copy(MID).addScaledVector(d, p.s);
    // height over KMITL ~300 m; arrivals descend 3° toward the south, departures climb 6° toward the north
    const y = p.arriving ? 300 - Math.tan(THREE.MathUtils.degToRad(3)) * p.s : 260 + Math.tan(THREE.MathUtils.degToRad(6)) * p.s;
    pos.y = THREE.MathUtils.clamp(y, 60, 1400);
    p.mesh.position.copy(pos);
    p.mesh.rotation.set(0, Math.atan2(d.x, d.z), 0);
    p.mesh.rotateX(THREE.MathUtils.degToRad(p.arriving ? -2 : -10));   // nose up on approach and in the climb
  }
  planes.forEach(place);
  function update(dt) {
    t += dt;
    for (const p of planes) {
      p.s += SPEED * dt;
      if (p.s > HALF) p.s = -HALF;
      place(p);
      p.mesh.traverse((o) => { if (o.userData.beacon) o.visible = Math.sin(t * 6 + p.livery) > 0.6; });
    }
  }
  return { group, update };
}
