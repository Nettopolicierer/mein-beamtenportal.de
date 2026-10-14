"""Sucht ein passendes Hero-Bild fuer einen neuen Autopilot-Artikel ueber die
Unsplash-API und speichert es lokal unter public/blog-media/<slug>.jpg -
genau wie bei den migrierten Artikeln liegt das Bild danach lokal im Repo,
nicht extern verlinkt (siehe migration/localize_media.py).

Braucht das Secret UNSPLASH_ACCESS_KEY (kostenloser Unsplash-Developer-Account,
https://unsplash.com/developers). Ohne Key oder ohne Treffer bricht das
Skript NICHT den Artikel ab, sondern gibt leere Werte zurueck - der Artikel
wird dann ohne Hero-Bild veroeffentlicht statt gar nicht.

Nutzung:
  python3 migration/fetch_autopilot_image.py "<slug>" "<suchbegriff englisch>" [--skip=N]

--skip=N ueberspringt die ersten N Treffer (z. B. wenn das erste Bild nicht passt).
Bereits fuer andere Artikel genutzte Fotos werden automatisch uebersprungen; ohne
Treffer wird einmal mit einem allgemeinen Suchbegriff erneut gesucht.
Gibt JSON {"featuredImage": "...", "featuredImageAlt": "..."} auf stdout aus.
"""
import hashlib
import json
import os
import sys
import urllib.parse
import urllib.request

OUT_DIR = "public/blog-media"


FALLBACK_QUERY = "german office desk documents"


def existing_hashes():
    """MD5 aller schon im Repo liegenden Hero-Bilder - damit dasselbe Foto nicht
    fuer zwei Artikel verwendet wird (gleiche Suchbegriffe liefern sonst immer
    den gleichen ersten Treffer)."""
    hashes = set()
    if os.path.isdir(OUT_DIR):
        for name in os.listdir(OUT_DIR):
            path = os.path.join(OUT_DIR, name)
            if os.path.isfile(path):
                with open(path, "rb") as f:
                    hashes.add(hashlib.md5(f.read()).hexdigest())
    return hashes


def search(access_key, query):
    params = urllib.parse.urlencode({
        "query": query,
        "per_page": 15,
        "orientation": "landscape",
        "content_filter": "high",
    })
    req = urllib.request.Request(
        f"https://api.unsplash.com/search/photos?{params}",
        headers={"Authorization": f"Client-ID {access_key}"},
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read()).get("results", [])


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--skip=")]
    skip = 0
    for a in sys.argv[1:]:
        if a.startswith("--skip="):
            skip = int(a.split("=", 1)[1])
    if len(args) != 2:
        print(json.dumps({"featuredImage": None, "featuredImageAlt": ""}))
        return
    slug, query = args
    access_key = os.environ.get("UNSPLASH_ACCESS_KEY", "")
    if not access_key:
        print(json.dumps({"featuredImage": None, "featuredImageAlt": ""}))
        return

    try:
        results = search(access_key, query)
        if len(results) <= skip:
            # Kein (weiterer) Treffer: einmal mit einem allgemeinen Suchbegriff versuchen
            print(f"Keine Treffer fuer '{query}', Fallback '{FALLBACK_QUERY}'", file=sys.stderr)
            results = search(access_key, FALLBACK_QUERY)
            skip = 0
        used = existing_hashes()
        os.makedirs(OUT_DIR, exist_ok=True)
        dest = f"{OUT_DIR}/{slug}.jpg"
        for photo in results[skip:]:
            with urllib.request.urlopen(photo["urls"]["regular"], timeout=30) as r:
                data = r.read()
            if hashlib.md5(data).hexdigest() in used:
                continue  # schon bei einem anderen Artikel im Einsatz
            with open(dest, "wb") as f:
                f.write(data)
            alt = photo.get("alt_description") or query
            print(json.dumps({"featuredImage": f"/blog-media/{slug}.jpg", "featuredImageAlt": alt}))
            return
        print(json.dumps({"featuredImage": None, "featuredImageAlt": ""}))
    except Exception as e:
        print(f"FEHLER: {e}", file=sys.stderr)
        print(json.dumps({"featuredImage": None, "featuredImageAlt": ""}))


if __name__ == "__main__":
    main()
