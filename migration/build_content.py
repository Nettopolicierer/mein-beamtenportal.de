"""Wandelt den WordPress-Export in src/content/posts.json + pages.json um,
bereit fuer generateStaticParams in Next.js. Nutzt clean-content.py fuer die
HTML-Bereinigung.
"""
import json
import re
import sys
from clean_content import clean_html

posts = json.load(open("migration/wp-posts.json"))
pages = json.load(open("migration/wp-pages.json"))
categories = {c["id"]: c for c in json.load(open("migration/wp-categories.json"))}
media = json.load(open("migration/wp-media.json"))

RESERVED_SLUGS = {p["slug"] for p in pages}


def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html)


# Titel gezielt auf das Beamten-Publikum zuschneiden: bei diesem Beitrag war
# der Originaltitel generisch ("als Absolvent") formuliert, obwohl der Inhalt
# (siehe Excerpt) sich klar an Referendare vor der Verbeamtung richtet.
TITLE_OVERRIDES = {
    "krankenversicherung-absolvent": "Krankenversicherung als Referendar: GKV oder PKV vor der Verbeamtung?",
}


def apply_title_override(slug: str, title: str, html: str) -> tuple[str, str]:
    override = TITLE_OVERRIDES.get(slug)
    if not override:
        return title, html
    # Erste Überschrift im Content (fasst meist den Titel noch einmal aus)
    # ebenfalls anpassen, sonst widerspricht sie dem neuen Seitentitel.
    html = re.sub(r"(<h2[^>]*>)[^<]*Absolvent[^<]*(</h2>)", r"\1" + override + r"\2", html, count=1)
    html = html.replace("Krankenversicherung als Absolvent", "Krankenversicherung als Referendar")
    return override, html


def make_description(post) -> str:
    excerpt = strip_tags(post["excerpt"]["rendered"]).strip()
    excerpt = re.sub(r"\s+", " ", excerpt)
    if excerpt:
        return excerpt[:300]
    return ""


out_posts = []
skipped = []
for p in posts:
    slug = p["slug"]
    if slug in RESERVED_SLUGS:
        skipped.append(slug)
        continue
    title = p["title"]["rendered"].strip()
    cleaned = clean_html(p["content"]["rendered"], title)
    html = cleaned["html"]
    title, html = apply_title_override(slug, title, html)
    cats = [categories[cid]["name"] for cid in p.get("categories", []) if cid in categories]
    # "Allgemein" ist WP-Standardkategorie ohne Aussagekraft, nur behalten wenn einzige.
    non_generic = [c for c in cats if c != "Allgemein"]
    display_cats = non_generic if non_generic else cats

    fm = media.get(str(p["featured_media"]), None)

    out_posts.append({
        "slug": slug,
        "title": title,
        "subtitle": cleaned["subtitle"],
        "toc": cleaned["toc"],
        "description": make_description(p),
        "date": p["date"],
        "modified": p["modified"],
        "categories": display_cats,
        "featuredImage": fm["url"] if fm else None,
        "featuredImageAlt": fm["alt"] if fm else "",
        "html": html,
    })

out_pages = []
for pg in pages:
    title = pg["title"]["rendered"].strip()
    cleaned = clean_html(pg["content"]["rendered"], title)
    out_pages.append({
        "slug": pg["slug"],
        "title": title,
        "subtitle": cleaned["subtitle"],
        "html": cleaned["html"],
    })

with open("src/content-posts.json", "w") as f:
    json.dump(out_posts, f, ensure_ascii=False, indent=2)
with open("src/content-pages.json", "w") as f:
    json.dump(out_pages, f, ensure_ascii=False, indent=2)

print(f"Beiträge konvertiert: {len(out_posts)}")
print(f"Übersprungen (Slug-Kollision mit Seite): {skipped}")
print(f"Seiten konvertiert: {len(out_pages)}")
