import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "UNICID_2.geojson"
OUTPUT = ROOT / "data" / "locais.json"
NEEDED_TAGS = {
    "osm_id", "name", "amenity", "shop", "leisure", "healthcare", "tourism",
    "addr_street", "addr_housenumber", "entrance:wheelchair", "wheelchair",
    "toilets:wheelchair", "wheelchair:toilets", "parking:wheelchair",
    "sign_language:pt-BR", "sign_language", "communication:sign_language",
    "tactile_paving", "tactile_paving:floor", "braille", "information:braille",
}
PLACE_TAGS = {"amenity", "shop", "leisure", "healthcare", "tourism"}


def points_in(value, output):
    if isinstance(value, list) and value and isinstance(value[0], (int, float)):
        output.append(value)
    elif isinstance(value, list):
        for item in value:
            points_in(item, output)


def main():
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    features = []
    for feature in source.get("features", []):
        properties = feature.get("properties") or {}
        if not str(properties.get("name") or "").strip():
            continue
        if not any(properties.get(tag) for tag in PLACE_TAGS):
            continue

        geometry = feature.get("geometry") or {}
        coordinates = geometry.get("coordinates")
        if geometry.get("type") == "Point":
            point = coordinates
        else:
            points = []
            points_in(coordinates, points)
            if not points:
                continue
            point = [
                sum(value[0] for value in points) / len(points),
                sum(value[1] for value in points) / len(points),
            ]

        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": point},
            "properties": {key: value for key, value in properties.items() if key in NEEDED_TAGS and value is not None},
        })

    OUTPUT.write_text(json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(features)} features, {OUTPUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()