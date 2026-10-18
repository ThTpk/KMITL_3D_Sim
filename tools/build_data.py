"""Convert raw Overpass JSON (data/kmitl_osm.json) into a compact scene file for the 3D viewer.

Coordinates are projected to local metres (x = east, z = south) around ORIGIN.
Output: data/kmitl_data.js  (sets window.KMITL_DATA so it also works without fetch)

Usage: python tools/build_data.py
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = (13.7279, 100.7780)  # lat, lon – roughly the centre of KMITL main campus
R = 6378137.0
COS0 = math.cos(math.radians(ORIGIN[0]))


def proj(lat, lon):
    x = math.radians(lon - ORIGIN[1]) * R * COS0
    y = math.radians(lat - ORIGIN[0]) * R
    return [round(x, 2), round(-y, 2)]  # three.js: +x east, +z south


def ring_from_geom(geom):
    return [proj(p["lat"], p["lon"]) for p in geom]


def close_ring(r):
    if len(r) > 2 and r[0] != r[-1]:
        r = r + [r[0]]
    return r


def assemble_rings(ways):
    """Join way segments (lists of [x,z]) into closed rings."""
    segs = [list(w) for w in ways if len(w) >= 2]
    rings = []
    while segs:
        cur = segs.pop(0)
        changed = True
        while cur[0] != cur[-1] and changed:
            changed = False
            for i, s in enumerate(segs):
                if s[0] == cur[-1]:
                    cur += s[1:]
                elif s[-1] == cur[-1]:
                    cur += s[::-1][1:]
                elif s[-1] == cur[0]:
                    cur = s[:-1] + cur
                elif s[0] == cur[0]:
                    cur = s[::-1][:-1] + cur
                else:
                    continue
                segs.pop(i)
                changed = True
                break
        if len(cur) >= 4:
            rings.append(close_ring(cur))
    return rings


def area(r):
    a = 0.0
    for i in range(len(r) - 1):
        a += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]
    return a / 2


def centroid(r):
    xs = [p[0] for p in r[:-1]]
    zs = [p[1] for p in r[:-1]]
    return [round(sum(xs) / len(xs), 1), round(sum(zs) / len(zs), 1)]


def pnum(v):
    if v is None:
        return None
    try:
        return float(str(v).replace("m", "").replace(",", ".").split(";")[0].strip())
    except ValueError:
        return None


def polygons_of(e):
    """Return list of (outer, [holes]) for a way/relation element."""
    if e["type"] == "way":
        if "geometry" not in e:
            return []
        r = ring_from_geom(e["geometry"])
        if len(r) < 4 or r[0] != r[-1]:
            return []
        return [(r, [])]
    if e["type"] == "relation":
        outers = [ring_from_geom(m["geometry"]) for m in e.get("members", []) if m.get("role") == "outer" and "geometry" in m]
        inners = [ring_from_geom(m["geometry"]) for m in e.get("members", []) if m.get("role") == "inner" and "geometry" in m]
        outs = assemble_rings(outers)
        ins = assemble_rings(inners)
        res = []
        for o in outs:
            res.append((o, []))
        for h in ins:  # assign hole to first outer containing its first point
            for o, hs in res:
                if point_in(h[0], o):
                    hs.append(h)
                    break
        return res
    return []


def point_in(p, ring):
    x, z = p
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, zi = ring[i]
        xj, zj = ring[j]
        if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / (zj - zi + 1e-12) + xi:
            inside = not inside
        j = i
    return inside


GREEN = {
    ("landuse", "grass"), ("landuse", "meadow"), ("landuse", "orchard"), ("landuse", "recreation_ground"),
    ("landuse", "farmland"), ("landuse", "forest"), ("leisure", "park"), ("leisure", "garden"),
    ("natural", "scrub"), ("natural", "grassland"), ("natural", "wood"), ("landuse", "village_green"),
}
SPORT = {("leisure", "pitch"), ("leisure", "track"), ("leisure", "stadium"), ("leisure", "sports_centre")}

ROAD_WIDTH = {
    "motorway": 14, "motorway_link": 7, "trunk": 14, "primary": 12, "primary_link": 6, "secondary": 9,
    "secondary_link": 6, "tertiary": 7.5, "tertiary_link": 5, "unclassified": 6, "residential": 6,
    "service": 4.5, "living_street": 5, "pedestrian": 4, "track": 3, "footway": 2, "path": 1.6,
    "cycleway": 2, "steps": 2,
}


def main():
    raw = json.loads((ROOT / "data" / "kmitl_osm.json").read_text(encoding="utf-8"))
    els = raw["elements"]
    buildings, roads, rails, water, green, sport, parking, campus, pois = [], [], [], [], [], [], [], [], []
    overrides = {}
    ov_path = ROOT / "data" / "overrides.json"
    if ov_path.exists():
        overrides = {int(k): v for k, v in json.loads(ov_path.read_text(encoding="utf-8")).items() if not k.startswith("_")}

    # buildings missing from OSM: overrides entries with their own outline "ll" ([lon, lat] pairs) and a negative id
    for k, v in overrides.items():
        if k < 0 and v.get("ll"):
            outer = close_ring([proj(lat, lon) for lon, lat in v["ll"]])
            b = {"id": k, "t": "x", "o": outer, "c": centroid(outer), "a": round(abs(area(outer))), "bt": v.get("bt", "yes")}
            b.update({kk: vv for kk, vv in v.items() if kk != "ll"})
            buildings.append(b)

    for e in els:
        t = e.get("tags", {})
        typ = e["type"]

        if typ == "node":
            name = t.get("name") or t.get("name:th")
            if name and ("amenity" in t or "shop" in t or "public_transport" in t or "railway" in t or "tourism" in t or "historic" in t):
                pois.append({
                    "n": name, "en": t.get("name:en"), "k": t.get("amenity") or t.get("shop") or t.get("railway") or t.get("tourism") or t.get("historic") or t.get("public_transport"),
                    "p": proj(e["lat"], e["lon"]), "ll": [e["lat"], e["lon"]],
                })
            continue

        if "building" in t or "building:part" in t:
            if t.get("building") in ("construction",) and "building:levels" not in t:
                pass
            for outer, holes in polygons_of(e):
                a = abs(area(outer))
                if a < 6:
                    continue
                lv = pnum(t.get("building:levels"))
                h = pnum(t.get("height"))
                mh = pnum(t.get("min_height"))
                ml = pnum(t.get("building:min_level"))
                rl = pnum(t.get("roof:levels"))
                b = {
                    "id": e["id"], "t": typ[0],
                    "o": outer, "c": centroid(outer), "a": round(a),
                    "bt": t.get("building") or t.get("building:part"),
                }
                if holes:
                    b["h"] = holes
                if "building:part" in t and "building" not in t:
                    b["pt"] = 1
                for key, src in (("n", "name"), ("en", "name:en"), ("th", "name:th"), ("am", "amenity"), ("rs", "roof:shape"),
                                 ("col", "building:colour"), ("rcol", "roof:colour"), ("mat", "building:material"),
                                 ("st", "addr:street"), ("op", "opening_hours"), ("web", "website")):
                    if t.get(src):
                        b[key] = t[src]
                if lv is not None:
                    b["lv"] = lv
                if h is not None:
                    b["ht"] = h
                if mh is not None:
                    b["mh"] = mh
                elif ml is not None:
                    b["mh"] = ml * 3.5
                if rl is not None:
                    b["rl"] = rl
                if t.get("layer"):
                    b["ly"] = t["layer"]
                if e["id"] in overrides:
                    b.update(overrides[e["id"]])
                if b.get("pitch"):
                    # mis-tagged as a building in OSM: draw it as an open sports surface instead
                    sport.append({"o": outer, "h": holes, "k": b["pitch"], "lk": "pitch", "n": b.get("n")})
                    continue
                buildings.append(b)
            continue

        if typ == "way" and "highway" in t and "geometry" in e:
            hw = t["highway"]
            if hw in ("elevator", "services", "proposed", "construction", "platform", "bus_stop"):
                continue
            pts = ring_from_geom(e["geometry"])
            area_flag = t.get("area") == "yes" or (pts[0] == pts[-1] and hw in ("pedestrian", "service") and t.get("area") == "yes")
            if area_flag:
                parking.append({"o": close_ring(pts), "k": "plaza"})
                continue
            w = pnum(t.get("width")) or ROAD_WIDTH.get(hw, 4)
            lanes = pnum(t.get("lanes"))
            if lanes and hw in ("primary", "secondary", "tertiary", "motorway", "trunk") and not t.get("width"):
                w = max(w, lanes * 3.3)
            r = {"p": pts, "k": hw, "w": round(w, 1)}
            if t.get("name"):
                r["n"] = t["name"]
            if t.get("bridge"):
                r["br"] = 1
            if t.get("layer"):
                r["ly"] = pnum(t["layer"])
            if t.get("tunnel"):
                r["tn"] = 1
            if t.get("oneway") == "yes":
                r["ow"] = 1
            roads.append(r)
            continue

        if typ == "way" and "railway" in t and "geometry" in e:
            if t["railway"] in ("proposed", "abandoned", "razed", "construction"):
                continue
            pts = ring_from_geom(e["geometry"])
            if t["railway"] == "platform":
                if pts[0] == pts[-1]:
                    parking.append({"o": pts, "k": "platform", "ly": pnum(t.get("layer")) or 0})
                continue
            rails.append({"p": pts, "k": t["railway"], "n": t.get("name"), "br": 1 if t.get("bridge") else 0, "ly": pnum(t.get("layer")) or 0})
            continue

        is_water = t.get("natural") == "water" or "water" in t or t.get("leisure") == "swimming_pool"
        if is_water:
            for outer, holes in polygons_of(e):
                water.append({"o": outer, "h": holes, "k": t.get("water") or t.get("leisure") or "water", "n": t.get("name")})
            continue
        if typ == "way" and "waterway" in t and "geometry" in e:
            pts = ring_from_geom(e["geometry"])
            water.append({"line": pts, "k": t["waterway"], "w": pnum(t.get("width")) or (8 if t["waterway"] in ("canal", "river") else 3), "n": t.get("name")})
            continue

        if t.get("amenity") == "university":
            for outer, holes in polygons_of(e):
                campus.append({"o": outer, "n": t.get("name"), "en": t.get("name:en")})
            continue

        kv = next(((k, t[k]) for k in ("landuse", "leisure", "natural") if k in t), None)
        if kv in GREEN:
            for outer, holes in polygons_of(e):
                green.append({"o": outer, "h": holes, "k": kv[1]})
        elif kv in SPORT:
            for outer, holes in polygons_of(e):
                sport.append({"o": outer, "h": holes, "k": t.get("sport") or kv[1], "lk": kv[1], "n": t.get("name")})
        elif t.get("amenity") == "parking":
            for outer, holes in polygons_of(e):
                parking.append({"o": outer, "h": holes, "k": "parking", "n": t.get("name")})

    # roads drawn in the wrong place in OSM: overrides "_roadfix" moves the nodes of a named road by dz metres
    # (north is negative) for x0 <= x <= x1, easing back to no shift over `ramp` metres beyond either end; other
    # roads that join it at one of those nodes move with it
    fixes = json.loads(ov_path.read_text(encoding="utf-8")).get("_roadfix", []) if ov_path.exists() else []
    for f in fixes:
        def weight(x):
            d = max(f["x0"] - x, x - f["x1"], 0)
            return max(0.0, 1 - d / f["ramp"])
        moved = {}
        for r in roads:
            if r.get("n") != f["name"]:
                continue
            for p in r["p"]:
                key = (p[0], p[1])
                if key not in moved:
                    moved[key] = round(f["dz"] * weight(p[0]), 2)
                p[1] = round(p[1] + moved[key], 2)
        for r in roads:
            if r.get("n") == f["name"]:
                continue
            for p in r["p"]:
                dz = moved.get((p[0], p[1]))
                if dz:
                    p[1] = round(p[1] + dz, 2)

    out = {
        "origin": ORIGIN,
        "generated_from": "OpenStreetMap contributors (ODbL) via Overpass API",
        "osm_timestamp": raw.get("osm3s", {}).get("timestamp_osm_base"),
        "buildings": buildings, "roads": roads, "rails": rails, "water": water, "green": green,
        "sport": sport, "parking": parking, "campus": campus, "pois": pois,
    }
    js = "window.KMITL_DATA = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "data" / "kmitl_data.js").write_text(js, encoding="utf-8")
    print({k: len(v) for k, v in out.items() if isinstance(v, list)}, f"{len(js)/1024:.0f} KB")


if __name__ == "__main__":
    main()
