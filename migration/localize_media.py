"""Laedt alle wp-content/uploads-Bilder (Featured Images + Inline-Bilder in
Artikeln/Seiten) von der IONOS-Systemdomain herunter, solange die alte
WordPress-Installation dort noch erreichbar ist (die echte Domain zeigt seit
dem Go-Live auf Vercel, nicht mehr auf WordPress). Speichert sie unter
public/wp-media/, damit die Seite unabhaengig vom WordPress-Hosting ist.
"""
import json
import re
import urllib.request
from pathlib import Path

SYSTEM_HOST = "https://mein-beamtenportal-6rwldksm19.live-website.com"
UPLOADS_RE = re.compile(r'https?://(?:www\.)?mein-beamtenportal\.de/wp-content/uploads/([^"\'\s)]+)')

OUT_DIR = Path("public/wp-media")
OUT_DIR.mkdir(parents=True, exist_ok=True)


def collect_urls() -> set[str]:
    urls = set()
    for fname in ("migration/wp-posts.json", "migration/wp-pages.json"):
        data = json.load(open(fname))
        for item in data:
            html = item["content"]["rendered"]
            urls.update(UPLOADS_RE.findall(html))
    media = json.load(open("migration/wp-media.json"))
    for item in media.values():
        m = UPLOADS_RE.match(item["url"])
        if m:
            urls.add(m.group(1))
    return urls


def download(rel_path: str) -> bool:
    dest = OUT_DIR / rel_path
    if dest.exists():
        return True
    dest.parent.mkdir(parents=True, exist_ok=True)
    src = f"{SYSTEM_HOST}/wp-content/uploads/{rel_path}"
    try:
        with urllib.request.urlopen(src, timeout=30) as r:
            dest.write_bytes(r.read())
        return True
    except Exception as e:
        print(f"FEHLER bei {rel_path}: {e}")
        return False


def main():
    urls = collect_urls()
    print(f"{len(urls)} eindeutige Bilder gefunden")
    ok, failed = 0, []
    for i, rel in enumerate(sorted(urls), 1):
        if download(rel):
            ok += 1
        else:
            failed.append(rel)
        if i % 20 == 0:
            print(f"  {i}/{len(urls)}")
    print(f"Heruntergeladen: {ok}, fehlgeschlagen: {len(failed)}")
    if failed:
        print("Fehlgeschlagen:", failed)


if __name__ == "__main__":
    main()
