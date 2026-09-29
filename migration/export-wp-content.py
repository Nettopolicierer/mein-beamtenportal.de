import json, urllib.request, time

BASE = "https://mein-beamtenportal.de/wp-json/wp/v2"

def fetch_all(endpoint, fields):
    items = []
    page = 1
    while True:
        url = f"{BASE}/{endpoint}?per_page=50&page={page}&_fields={fields}"
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                data = json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 400:
                break
            raise
        if not data:
            break
        items.extend(data)
        page += 1
        time.sleep(0.2)
    return items

fields = "id,slug,link,title,content,excerpt,date,modified,categories,tags,featured_media"
posts = fetch_all("posts", fields)
pages = fetch_all("pages", "id,slug,link,title,content,date")
cats = fetch_all("categories", "id,name,slug,count")

with open("migration/wp-posts.json", "w") as f:
    json.dump(posts, f, ensure_ascii=False, indent=2)
with open("migration/wp-pages.json", "w") as f:
    json.dump(pages, f, ensure_ascii=False, indent=2)
with open("migration/wp-categories.json", "w") as f:
    json.dump(cats, f, ensure_ascii=False, indent=2)

print(f"Posts: {len(posts)}, Pages: {len(pages)}, Categories: {len(cats)}")
