import json, urllib.request, time

BASE = "https://mein-beamtenportal.de/wp-json/wp/v2"
posts = json.load(open("migration/wp-posts.json"))
ids = sorted(set(p["featured_media"] for p in posts if p.get("featured_media")))
print(f"Benoetigte Media-IDs: {len(ids)}")

media_map = {}
CHUNK = 30
for i in range(0, len(ids), CHUNK):
    chunk = ids[i:i+CHUNK]
    url = f"{BASE}/media?include={','.join(map(str, chunk))}&per_page=100&_fields=id,source_url,alt_text"
    with urllib.request.urlopen(url, timeout=30) as r:
        data = json.loads(r.read())
    for item in data:
        media_map[item["id"]] = {"url": item["source_url"], "alt": item.get("alt_text", "")}
    time.sleep(0.2)

with open("migration/wp-media.json", "w") as f:
    json.dump(media_map, f, ensure_ascii=False, indent=2)
print(f"Aufgeloest: {len(media_map)}")
