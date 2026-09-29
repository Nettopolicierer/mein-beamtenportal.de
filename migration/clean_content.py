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

    # Greyd-Theme "Dynamic Tags" (data-tag="date"/"categories" etc.) - werden
    # normalerweise serverseitig durch echte Werte ersetzt, stehen im rohen
    # API-Export aber nur als Platzhalter-Label da ("Beitragsdatum"). Muss vor
    # dem Whitelist-Trim laufen, sonst ist das data-tag-Attribut schon weg.
    for tag in soup.find_all(attrs={"data-tag": True}):
        tag.decompose()
    for ul in soup.find_all("ul"):
        if not ul.get_text(strip=True) and not ul.find("img"):
            ul.decompose()

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

    # Feste Template-Bausteine, die in fast jedem Post vorkommen und von der
    # neuen Seitenvorlage selbst gerendert werden: CTA-Buttons zur Buchung
    # und die Google-Bewertungsbadge (Sterne-Bild + "X reviews"-Zeile).
    for a in soup.find_all("a", href=True):
        if "cal.eu/mein-beamtenportal" in a["href"] or a["href"] == "#content-start":
            a.decompose()
    for p_tag in soup.find_all("p"):
        text = p_tag.get_text(strip=True)
        if text == "Google Reviews" or re.match(r"^\d(\.\d)?\s*Stars", text) or "reviews</strong>" in str(p_tag):
            p_tag.decompose()
    for img in soup.find_all("img", src=re.compile(r"/(g\.webp|stars\.svg)$")):
        img.decompose()

    # Direkt aufeinanderfolgende Bilder mit identischer src (Cover- +
    # Feature-Bild-Dopplung) auf ein Vorkommen reduzieren.
    for img in soup.find_all("img"):
        prev = img.find_previous_sibling()
        while prev and isinstance(prev, NavigableString) and not prev.strip():
            prev = prev.find_previous_sibling()
        if prev and prev.name == "img" and prev.get("src") == img.get("src"):
            img.decompose()

    # Freistehenden Text (durch unwrap() entstanden, z.B. Subtitle-Spans) in
    # <p> einpacken statt als nacktes Text-Fragment im HTML zu belassen.
    for node in list(soup.contents):
        if isinstance(node, NavigableString) and node.strip():
            p = soup.new_tag("p")
            node.replace_with(p)
            p.string = node.strip()

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
