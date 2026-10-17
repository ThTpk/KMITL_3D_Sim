// Ground elevation and flood layers from the elevation grid in data/kmitl_dem.js (see tools/fetch_dem.py).
// The scene's ground is flat at y = 0, so heights are shown as colour (elevation) and the flood as water standing
// on the ground at its depth (water level minus ground elevation): it rises up the walls of the buildings.
import * as THREE from 'three';

// colour ramp for ground elevation in metres above mean sea level
export const ELEV_STOPS = [[-1, '#2b5fa8'], [0, '#3f9fc4'], [1, '#5fbf7a'], [2, '#b8d65a'], [3, '#f0d24a'], [4, '#e89a3c'], [6, '#b5562f']];
const ramp = ELEV_STOPS.map(([v, c]) => [v, new THREE.Color(c)]);
function colourAt(v, out) {
  if (v <= ramp[0][0]) return out.copy(ramp[0][1]);
  for (let i = 1; i < ramp.length; i++) {
    if (v <= ramp[i][0]) return out.copy(ramp[i - 1][1]).lerp(ramp[i][1], (v - ramp[i - 1][0]) / (ramp[i][0] - ramp[i - 1][0]));
  }
  return out.copy(ramp[ramp.length - 1][1]);
}

function gridGeometry(D, y) {
  const { x0, z0, step, nx, nz } = D;
  const pos = new Float32Array(nx * nz * 3);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = (j * nx + i) * 3;
    pos[k] = x0 + i * step; pos[k + 1] = y; pos[k + 2] = z0 + j * step;
  }
  const idx = [];
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

// ground coloured by elevation, laid just above the satellite imagery
export function buildElevation(D) {
  const g = gridGeometry(D, 0.12);
  const col = new Float32Array(D.nx * D.nz * 3), c = new THREE.Color();
  D.e.forEach((v, i) => { colourAt(v / 10, c); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; });
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.62, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  m.renderOrder = 1;
  return m;
}

// water at a given level (m above sea level): each grid point sits at its depth; points above the water go below
// the ground so the shoreline falls where the depth crosses zero
export function buildFlood(D, inside) {
  const g = gridGeometry(D, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#3d7fb3', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.78 });
  const mesh = new THREE.Mesh(g, mat);
  mesh.receiveShadow = true;
  mesh.renderOrder = 2;
  const pos = g.attributes.position;
  // grid points inside KMITL, for the flooded share of the campus
  const inCampus = D.e.map((_, i) => inside(D.x0 + (i % D.nx) * D.step, D.z0 + Math.floor(i / D.nx) * D.step));
  const nCampus = inCampus.filter(Boolean).length || 1;
  function setLevel(level) {
    let wet = 0;
    for (let i = 0; i < D.e.length; i++) {
      const depth = level - D.e[i] / 10;
      pos.setY(i, depth > 0 ? depth + 0.02 : Math.max(depth, -2) - 0.3);
      if (depth > 0 && inCampus[i]) wet++;
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return { share: wet / nCampus };
  }
  return { mesh, setLevel };
}

// ground elevation (m) at a point, for the info panel
export function elevationAt(D, x, z) {
  const i = Math.round((x - D.x0) / D.step), j = Math.round((z - D.z0) / D.step);
  if (i < 0 || j < 0 || i >= D.nx || j >= D.nz) return null;
  return D.e[j * D.nx + i] / 10;
}
