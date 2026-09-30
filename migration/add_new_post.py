"""Haengt einen neuen, vom Blog-Autopiloten geschriebenen Artikel an
src/content-posts-new.json an (NICHT an content-posts.json - das File wird
bei jedem migration/build_content.py-Lauf komplett aus dem WordPress-Export
neu geschrieben und wuerde Autopilot-Artikel sonst loeschen).

Nutzung: Post als JSON ueber stdin, z.B.
  cat post.json | python3 migration/add_new_post.py

Erwartete Felder (siehe Post-Interface in src/lib/content.ts):
  slug, title, subtitle, toc, description, date, categories,
  featuredImage, featuredImageAlt, html
"modified" wird automatisch auf "date" gesetzt, falls nicht angegeben.
"""
import json
import re
import sys

ALLOWED_CATEGORIES = {"Beamte", "PKV", "Pension", "Referendare", "BU", "DU", "Allgemein"}
REQUIRED_FIELDS = {"slug", "title", "subtitle", "toc", "description", "date", "categories", "html"}
SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")

NEW_POSTS_PATH = "src/content-posts-new.json"
EXISTING_POSTS_PATH = "src/content-posts.json"


def fail(msg: str):
    print(f"FEHLER: {msg}", file=sys.stderr)
    sys.exit(1)


def main():
    raw = sys.stdin.read()
    try:
        post = json.loads(raw)
    except json.JSONDecodeError as e:
        fail(f"Ungueltiges JSON: {e}")

    missing = REQUIRED_FIELDS - post.keys()
    if missing:
        fail(f"Pflichtfelder fehlen: {sorted(missing)}")

    if not SLUG_RE.match(post["slug"]):
        fail(f"Slug '{post['slug']}' ist nicht kebab-case (nur a-z, 0-9, Bindestriche)")

    bad_cats = set(post["categories"]) - ALLOWED_CATEGORIES
    if bad_cats:
        fail(f"Unbekannte Kategorien {sorted(bad_cats)} - erlaubt: {sorted(ALLOWED_CATEGORIES)}")

    if not (70 <= len(post["description"]) <= 160):
        fail(f"description sollte 70-160 Zeichen lang sein, ist {len(post['description'])}")

    if len(post["title"]) > 60:
        fail(
            f"title ist {len(post['title'])} Zeichen lang, sollte max. 60 sein "
            "(Google schneidet Title-Tags in den Suchergebnissen sonst ab)"
        )

    existing = json.load(open(EXISTING_POSTS_PATH))
    new_posts = json.load(open(NEW_POSTS_PATH))
    all_slugs = {p["slug"] for p in existing} | {p["slug"] for p in new_posts}
    if post["slug"] in all_slugs:
        fail(f"Slug '{post['slug']}' existiert bereits - anderen Slug waehlen oder bestehenden Artikel erweitern")

    post.setdefault("modified", post["date"])
    post.setdefault("featuredImage", None)
    post.setdefault("featuredImageAlt", "")

    new_posts.append(post)
    with open(NEW_POSTS_PATH, "w") as f:
        json.dump(new_posts, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"OK: '{post['slug']}' zu {NEW_POSTS_PATH} hinzugefuegt ({len(new_posts)} Autopilot-Artikel insgesamt)")


if __name__ == "__main__":
    main()
