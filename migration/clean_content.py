"""Reduziert WordPress-Gutenberg-HTML auf sauberes, semantisches HTML fuer die
Next.js-Migration. Entfernt Block-Wrapper (wp-block-*, Cover-Bilder mit
Platzhalter-IDs, Style-Attribute), behaelt Ueberschriften/Absaetze/Listen/
Bilder/Tabellen/Zitate. Baut das Rank-Math-Inhaltsverzeichnis und
Buchungs-Buttons als eigene, stylebare Bausteine nach.
"""
import json
import re
from bs4 import BeautifulSoup, NavigableString

# "div" bleibt bewusst NICHT erhalten (unwrap statt keep): die
# Hero-Bereinigung entfernt vorangehende Geschwister-Elemente der
# Duplikat-Ueberschrift - das funktioniert nur zuverlaessig auf einer
# flachen Struktur. Verschachtelte Divs wuerden das aushebeln.
KEEP_TAGS = {"h1", "h2", "h3", "h4", "p", "ul", "ol", "li", "blockquote", "img",
             "table", "thead", "tbody", "tr", "th", "td", "a", "strong", "em",
             "br", "nav"}


def clean_html(raw_html: str, post_title: str = "") -> str:
    soup = BeautifulSoup(raw_html, "lxml")

    # <style>/<script> IMMER komplett entfernen (decompose, nicht unwrap) -
    # sonst wird ihr Inhalt (z.B. ".gs_xyz { color: ... }") zu sichtbarem
    # Fliesstext, sobald das Tag selbst unwrapped wird.
    for tag in soup.find_all(["style", "script"]):
        tag.decompose()

    # Platzhalter-Cover-Bilder (BITTE_BILD_ID_EINTRAGEN) komplett entfernen.
    for img in soup.find_all("img", src=re.compile("BITTE_BILD_ID_EINTRAGEN")):
        img.decompose()

    # Greyd-Theme "Dynamic Tags" (data-tag="date"/"categories" etc.) - werden
    # normalerweise serverseitig durch echte Werte ersetzt, stehen im rohen
    # API-Export aber nur als Platzhalter-Label da ("Beitragsdatum"). Muss vor
    # dem Whitelist-Trim laufen, sonst ist das data-tag-Attribut schon weg.
    for tag in soup.find_all(attrs={"data-tag": True}):
        tag.decompose()

    # Der komplette Hero (Cover-Bild, Titel, Untertitel, CTA-Buttons,
    # Bewertungsbadge) steckt bei jedem Post in einem wp-block-cover, der
    # immer den Hero-CTA-Link "#content-start" enthaelt ("Zum Ratgeber") -
    # das ist ein eindeutigerer Anker als Text-/Titel-Vergleiche, die bei
    # abweichenden H1-Formulierungen (SEO-Titel != on-page H1) versagen.
    # Manche Posts haben mehrere Cover-Bloecke (z.B. weiter unten im
    # Cross-Selling-Bereich) - nur den mit dem Hero-Link entfernen. Muss vor
    # dem Button-Marker laufen, sonst ist die "button"-Klasse fuer den
    # Fallback schon durch "btn" ersetzt.
    content_start_link = soup.find("a", href="#content-start")
    hero_cover = (
        content_start_link.find_parent("div", class_="wp-block-cover")
        if content_start_link
        else None
    )
    # Fallback fuer die wenigen Posts mit abweichendem Hero-Template (z.B.
    # Rechner-Landingpages ohne "#content-start"-Anker, dafuer mit anderem
    # Booking-Link): der allererste Cover-Block, sofern er einen Button
    # enthaelt, ist bei diesen Templates ebenfalls immer der Hero.
    if not hero_cover:
        first_cover = soup.find("div", class_="wp-block-cover")
        if first_cover and first_cover.find("a", class_=re.compile(r"\bbutton\b")):
            hero_cover = first_cover
    if hero_cover:
        hero_cover.decompose()

    # Rank-Math-Inhaltsverzeichnis in eine saubere <nav class="toc"><ul>...
    # Struktur ueberfuehren, bevor der Whitelist-Trim die Original-Divs
    # plattwalzt (sonst: einzelne <a>-Links ohne jede Struktur).
    for toc in soup.find_all("div", class_="wp-block-rank-math-toc-block"):
        heading = toc.find(["h2", "h3", "h4"])
        heading_text = heading.get_text(strip=True) if heading else "Inhalt"
        links = [(a.get("href", ""), a.get_text(strip=True)) for a in toc.find_all("a")]
        nav = soup.new_tag("nav")
        nav["class"] = ["toc"]
        title_p = soup.new_tag("p")
        title_p["class"] = ["toc-title"]
        title_p.string = heading_text
        nav.append(title_p)
        ul = soup.new_tag("ul")
        for href, text in links:
            li = soup.new_tag("li")
            a = soup.new_tag("a", href=href)
            a.string = text
            li.append(a)
            ul.append(li)
        nav.append(ul)
        toc.replace_with(nav)

    # Buchungs-Buttons (Gutenberg "button"-Klasse) als eigenen Marker
    # erhalten, damit sie in der neuen Vorlage wie ein Button aussehen statt
    # wie ein normaler Textlink - sonst wuerden sie durch den Whitelist-Trim
    # zu ununterscheidbaren <a>-Links.
    for a in soup.find_all("a", class_=re.compile(r"\bbutton\b")):
        href = a.get("href", "")
        text = a.get_text(strip=True)
        new_a = soup.new_tag("a", href=href)
        new_a["class"] = ["btn"]
        new_a.string = text
        a.replace_with(new_a)

    # Hero-Block vor dem eigentlichen Inhalt entfernen: Cover-Bild, CTA-Buttons,
    # Google-Bewertungsbadge und jede Ueberschrift, die den Post-/Seitentitel
    # wiederholt (h1 + bei Posts oft zusaetzlich ein doppeltes h2) - das
    # rendert die neue Seitenvorlage selbst, nicht der Artikelinhalt. Greyd
    # verschachtelt den Hero oft tief (Cover > Inner-Container > Group > h1),
    # waehrend die zweite (h2-)Dopplung meist auf einer anderen Ebene liegt -
    # ein einfaches find_previous_siblings() auf der Ueberschrift selbst
    # erfasst deshalb nicht zuverlaessig alles davor. Stattdessen: die LETZTE
    # Dopplungs-Ueberschrift suchen und auf JEDER Ebene ihrer Ahnenkette bis
    # zum Wurzel-Element vorherige Geschwister entfernen.
    if post_title:
        title_norm = post_title.strip().lower()
        last_match = None
        for heading in soup.find_all(["h1", "h2", "h3"]):
            # get_text(strip=True) strippt jedes Text-Fragment einzeln VOR dem
            # Verketten und frisst dadurch Leerzeichen um Inline-Tags wie
            # <em> weg ("Über " + "uns" -> "Überuns"). Nur die Aussenraender
            # stripp en, nicht pro Fragment.
            heading_text = heading.get_text().strip().lower()
            if heading_text == title_norm:
                last_match = heading
            elif last_match is not None:
                break  # erste Nicht-Dopplung nach mind. einem Treffer = echter Inhalt

        if last_match is not None:
            node = last_match
            while node is not None and node.parent is not None:
                for sibling in list(node.find_previous_siblings()):
                    sibling.decompose()
                node = node.parent
            last_match.decompose()

    # Alle Attribute ausser href/src/alt entfernen, Tags auf Whitelist
    # reduzieren. id bleibt an Ueberschriften erhalten (Sprungmarken des
    # Inhaltsverzeichnisses funktionieren sonst nicht mehr). class bleibt nur
    # an unseren eigenen Markern (toc/toc-title/btn) erhalten.
    MARKER_CLASSES = {"toc", "toc-title", "btn"}
    for tag in soup.find_all(True):
        if tag.name not in KEEP_TAGS:
            tag.unwrap()
            continue
        allowed_attrs = {"href", "src", "alt"} & tag.attrs.keys()
        attrs = {k: tag.attrs[k] for k in allowed_attrs}
        if tag.name in {"h1", "h2", "h3", "h4"} and tag.attrs.get("id"):
            attrs["id"] = tag.attrs["id"]
        existing_class = tag.attrs.get("class")
        if existing_class:
            kept = [c for c in existing_class if c in MARKER_CLASSES]
            if kept:
                attrs["class"] = kept
        tag.attrs = attrs

    # Leere Absaetze/Listenpunkte entfernen.
    for tag in soup.find_all(["p", "li"]):
        if not tag.get_text(strip=True) and not tag.find("img"):
            tag.decompose()
    for container in soup.find_all(["ul", "nav"]):
        if not container.get_text(strip=True) and not container.find("img"):
            container.decompose()

    # Feste Template-Bausteine, die in fast jedem Post vorkommen und von der
    # neuen Seitenvorlage selbst gerendert werden: die Google-Bewertungsbadge
    # (Sterne-Bild + "X reviews"-Zeile) direkt im Hero.
    for p_tag in soup.find_all("p"):
        text = p_tag.get_text(strip=True)
        if text == "Google Reviews" or re.match(r"^\d(\.\d)?\s*Stars", text):
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
