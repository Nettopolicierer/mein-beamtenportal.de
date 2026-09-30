"""Sucht ein passendes Hero-Bild fuer einen neuen Autopilot-Artikel ueber die
Unsplash-API und speichert es lokal unter public/blog-media/<slug>.jpg -
genau wie bei den migrierten Artikeln liegt das Bild danach lokal im Repo,
nicht extern verlinkt (siehe migration/localize_media.py).

Braucht das Secret UNSPLASH_ACCESS_KEY (kostenloser Unsplash-Developer-Account,
https://unsplash.com/developers). Ohne Key oder ohne Treffer bricht das
Skript NICHT den Artikel ab, sondern gibt leere Werte zurueck - der Artikel
wird dann ohne Hero-Bild veroeffentlicht statt gar nicht.

Nutzung:
  python3 migration/fetch_autopilot_image.py "<slug>" "<suchbegriff englisch>"
Gibt JSON {"featuredImage": "...", "featuredImageAlt": "..."} auf stdout aus.
"""
import json
import os
import sys
import urllib.parse
import urllib.request

OUT_DIR = "public/blog-media"


def main():
    if len(sys.argv) != 3:
        print(json.dumps({"featuredImage": None, "featuredImageAlt": ""}))
        return
    slug, query = sys.argv[1], sys.argv[2]
    access_key = os.environ.get("UNSPLASH_ACCESS_KEY", "")
    if not access_key:
        print(json.dumps({"featuredImage": None, "featuredImageAlt": ""}))
        return

    params = urllib.parse.urlencode({
        "query": query,
        "per_page": 1,
        "orientation": "landscape",
        "content_filter": "high",
    })
    req = urllib.request.Request(
        f"https://api.unsplash.com/search/photos?{params}",
        headers={"Authorization": f"Client-ID {access_key}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read())
        results = data.get("results", [])
        if not results:
            print(json.dumps({"featuredImage": None, "featuredImageAlt": ""}))
            return
        photo = results[0]
        img_url = photo["urls"]["regular"]
        alt = photo.get("alt_description") or query

        os.makedirs(OUT_DIR, exist_ok=True)
        dest = f"{OUT_DIR}/{slug}.jpg"
        with urllib.request.urlopen(img_url, timeout=30) as r:
            with open(dest, "wb") as f:
                f.write(r.read())

        print(json.dumps({"featuredImage": f"/blog-media/{slug}.jpg", "featuredImageAlt": alt}))
    except Exception as e:
        print(f"FEHLER: {e}", file=sys.stderr)
        print(json.dumps({"featuredImage": None, "featuredImageAlt": ""}))


if __name__ == "__main__":
    main()
