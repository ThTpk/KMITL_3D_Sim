"""Download KMITL map data (buildings, roads, water, landuse) from OpenStreetMap via Overpass.

Usage: python tools/fetch_osm.py
Writes data/kmitl_osm.json
"""
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

# Bounding box around KMITL Ladkrabang main campus (south, west, north, east)
BBOX = (13.7150, 100.7620, 13.7360, 100.7900)

ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

QUERY = """
[out:json][timeout:180];
(
  way["building"]({b});
  relation["building"]({b});
  way["building:part"]({b});
  way["highway"]({b});
  way["railway"]({b});
  way["natural"="water"]({b});
  relation["natural"="water"]({b});
  way["water"]({b});
  way["waterway"]({b});
  way["landuse"]({b});
  way["leisure"]({b});
  way["amenity"="parking"]({b});
  way["amenity"="university"]({b});
  relation["amenity"="university"]({b});
  way["natural"~"wood|scrub|grassland"]({b});
  node["amenity"]({b});
  node["name"]({b});
);
out geom qt;
"""


def fetch():
    b = ",".join(str(x) for x in BBOX)
    data = urllib.parse.urlencode({"data": QUERY.format(b=b)}).encode()
    for attempt in range(4):
        for ep in ENDPOINTS:
            try:
                req = urllib.request.Request(ep, data=data, headers={"User-Agent": "KMITL3DMap/1.0 (education project)"})
                with urllib.request.urlopen(req, timeout=240) as r:
                    raw = r.read()
                d = json.loads(raw)
                print(f"OK from {ep}: {len(d['elements'])} elements")
                return d
            except Exception as e:  # noqa: BLE001
                print(f"fail {ep}: {e}")
        time.sleep(15)
    sys.exit("All Overpass endpoints failed")


if __name__ == "__main__":
    out = Path(__file__).resolve().parent.parent / "data" / "kmitl_osm.json"
    out.parent.mkdir(exist_ok=True)
    d = fetch()
    out.write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
    print("saved", out)
