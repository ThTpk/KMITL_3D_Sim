"""Sample ground elevation over KMITL into data/kmitl_dem.js for the elevation and flood layers.

Source: the open Terrain Tiles on AWS (Terrarium encoding, built mainly from SRTM / Copernicus-class global
DEMs at about 30 m), metres above mean sea level. These are surface models: roofs, tree canopy and the
elevated highway read as high ground. To get closer to the ground, samples inside building outlines and
near the elevated roads are dropped and filled from the surrounding ground, and every cell then takes a low
percentile of a wide neighbourhood (trees and dense blocks). Treat the result as approximate (errors of 1-2 m are normal).

Output: window.KMITL_DEM = { x0, z0, step, nx, nz, e: [decimetres, row by row from z0] } in the viewer's
local metres (x = east, z = south).

Usage: python tools/fetch_dem.py
"""
import io
import json
import math
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = (13.7279, 100.7780)
R = 6378137.0
COS0 = math.cos(math.radians(ORIGIN[0]))
X0, X1, Z0, Z1, STEP = -760, 660, -500, 470, 10
ZOOM = 15
CACHE = ROOT / 'tools' / '.dem_cache'


def unproj(x, z):
    return ORIGIN[0] - math.degrees(z / R), ORIGIN[1] + math.degrees(x / (R * COS0))


def tile_xy(lat, lon):
    n = 2 ** ZOOM
    r = math.radians(lat)
    return (lon + 180) / 360 * n, (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * n


_tiles = {}


def tile(tx, ty):
    if (tx, ty) not in _tiles:
        CACHE.mkdir(exist_ok=True)
        p = CACHE / f'{ZOOM}_{tx}_{ty}.png'
        if not p.exists():
            u = f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{ZOOM}/{tx}/{ty}.png'
            p.write_bytes(urllib.request.urlopen(u, timeout=60).read())
        _tiles[(tx, ty)] = Image.open(p).convert('RGB').load()
    return _tiles[(tx, ty)]


def elev(x, z):
    fx, fy = tile_xy(*unproj(x, z))
    tx, ty = int(fx), int(fy)
    r, g, b = tile(tx, ty)[min(255, int((fx - tx) * 256)), min(255, int((fy - ty) * 256))]
    return r * 256 + g + b / 256 - 32768


def in_ring(x, z, ring):
    ins = False
    for i in range(len(ring)):
        xi, zi = ring[i]
        xj, zj = ring[i - 1]
        if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / (zj - zi) + xi:
            ins = not ins
    return ins


def seg_dist(x, z, a, b):
    dx, dz = b[0] - a[0], b[1] - a[1]
    l2 = dx * dx + dz * dz or 1
    t = max(0, min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2))
    return math.hypot(x - a[0] - t * dx, z - a[1] - t * dz)


def main():
    s = (ROOT / 'data' / 'kmitl_data.js').read_text(encoding='utf-8')
    data = json.loads(s[s.index('{'):s.rindex('}') + 1])
    nx, nz = (X1 - X0) // STEP + 1, (Z1 - Z0) // STEP + 1
    grid = [[elev(X0 + i * STEP, Z0 + j * STEP) for i in range(nx)] for j in range(nz)]

    # drop samples on roofs and on/near elevated roads (bridges and the motorway)
    blds = [b['o'] for b in data['buildings'] if X0 - 50 < b['c'][0] < X1 + 50 and Z0 - 50 < b['c'][1] < Z1 + 50]
    lifted = [r['p'] for r in data['roads'] if r.get('br') or r.get('k') in ('motorway', 'motorway_link', 'trunk', 'trunk_link')]
    bad = [[False] * nx for _ in range(nz)]
    for j in range(nz):
        for i in range(nx):
            x, z = X0 + i * STEP, Z0 + j * STEP
            if any(in_ring(x, z, o) for o in blds if min(p[0] for p in o) - 6 < x < max(p[0] for p in o) + 6):
                bad[j][i] = True
            elif any(seg_dist(x, z, p[k], p[k + 1]) < 18 for p in lifted for k in range(len(p) - 1)
                     if min(p[k][0], p[k + 1][0]) - 20 < x < max(p[k][0], p[k + 1][0]) + 20):
                bad[j][i] = True
    # fill dropped cells from valid neighbours, growing inward
    for _ in range(40):
        changed = False
        for j in range(nz):
            for i in range(nx):
                if not bad[j][i]:
                    continue
                v = [grid[b][a] for a, b in ((i - 1, j), (i + 1, j), (i, j - 1), (i, j + 1), (i - 1, j - 1), (i + 1, j + 1), (i - 1, j + 1), (i + 1, j - 1))
                     if 0 <= a < nx and 0 <= b < nz and not bad[b][a]]
                if v:
                    grid[j][i] = sum(v) / len(v)
                    bad[j][i] = 'filled'
                    changed = True
        for j in range(nz):
            for i in range(nx):
                if bad[j][i] == 'filled':
                    bad[j][i] = False
        if not changed:
            break
    # ground filter: the area is flat, so a low percentile over a wide window (about 110 m) takes off the
    # canopy and the dense blocks the radar surface still sees, then a 5x5 mean smooths the steps
    W = 5
    low = [[0.0] * nx for _ in range(nz)]
    for j in range(nz):
        for i in range(nx):
            v = sorted(grid[b][a] for a in range(i - W, i + W + 1) for b in range(j - W, j + W + 1) if 0 <= a < nx and 0 <= b < nz)
            low[j][i] = v[len(v) // 10]
    out = []
    for j in range(nz):
        for i in range(nx):
            v = [low[b][a] for a in range(i - 2, i + 3) for b in range(j - 2, j + 3) if 0 <= a < nx and 0 <= b < nz]
            out.append(round(sum(v) / len(v) * 10))
    dem = {'x0': X0, 'z0': Z0, 'step': STEP, 'nx': nx, 'nz': nz,
           'src': 'AWS Terrain Tiles (Terrarium, SRTM-based), ground-filtered', 'e': out}
    (ROOT / 'data' / 'kmitl_dem.js').write_text('window.KMITL_DEM = ' + json.dumps(dem, separators=(',', ':')) + ';\n', encoding='utf-8')
    print(nx, 'x', nz, 'cells; elevation %.1f..%.1f m' % (min(out) / 10, max(out) / 10))


if __name__ == '__main__':
    main()
