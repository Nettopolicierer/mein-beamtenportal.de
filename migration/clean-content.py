"""Reduziert WordPress-Gutenberg-HTML auf sauberes, semantisches HTML fuer die
Next.js-Migration. Entfernt Block-Wrapper (wp-block-*, Cover-Bilder mit
Platzhalter-IDs, Style-Attribute), behaelt Ueberschriften/Absaetze/Listen/
Bilder/Tabellen/Zitate.
"""
import json
import re
from bs4 import BeautifulSoup, NavigableString

KEEP_TAGS = {"h2", "h3", "h4", "p", "ul", "ol", "li", "blockquote", "img",
             "table", "thead", "tbody", "tr", "th", "td", "a", "strong", "em", "br"}


def clean_html(raw_html: str, post_title: str = "") -> str:
    soup = BeautifulSoup(raw_html, "lxml")

    # Platzhalter-Cover-Bilder (BITTE_BILD_ID_EINTRAGEN) komplett entfernen.
    for img in soup.find_all("img", src=re.compile("BITTE_BILD_ID_EINTRAGEN")):
        img.decompose()

    # Hero-Block vor dem eigentlichen Inhalt entfernen: Cover-Bild, CTA-Buttons,
    # Google-Bewertungsbadge und jede Ueberschrift, die den Post-Titel
    # wiederholt (h1 + oft zusaetzlich ein doppeltes h2) - das rendert die
    # neue Seitenvorlage selbst, nicht der Artikelinhalt.
    if post_title:
        title_norm = post_title.strip()
        while True:
            first_heading = soup.find(["h1", "h2", "h3"])
            if not first_heading or first_heading.get_text(strip=True) != title_norm:
                break
            for sibling in list(first_heading.find_previous_siblings()):
                sibling.decompose()
            first_heading.decompose()

    # Alle Attribute ausser href/src/alt entfernen, Tags auf Whitelist reduzieren.
    for tag in soup.find_all(True):
        if tag.name not in KEEP_TAGS:
            tag.unwrap()
            continue
        allowed_attrs = {"href", "src", "alt"} & tag.attrs.keys()
        tag.attrs = {k: tag.attrs[k] for k in allowed_attrs}

    # Leere Absaetze/Listenpunkte entfernen.
    for tag in soup.find_all(["p", "li"]):
        if not tag.get_text(strip=True) and not tag.find("img"):
            tag.decompose()

    result = str(soup)
    result = re.sub(r"\n{3,}", "\n\n", result)
    return result.strip()


if __name__ == "__main__":
    posts = json.load(open("migration/wp-posts.json"))
    sample = posts[0]
    cleaned = clean_html(sample["content"]["rendered"], sample["title"]["rendered"])
    print(f"Vorher: {len(sample['content']['rendered'])} Zeichen")
    print(f"Nachher: {len(cleaned)} Zeichen")
    print("--- erste 1500 Zeichen ---")
    print(cleaned[:1500])
