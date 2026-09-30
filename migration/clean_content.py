"""Reduziert WordPress-Gutenberg-HTML auf sauberes, semantisches HTML fuer die
Next.js-Migration. Entfernt Block-Wrapper (wp-block-*, Cover-Bilder mit
Platzhalter-IDs, Style-Attribute), behaelt Ueberschriften/Absaetze/Listen/
Bilder/Tabellen/Zitate. Baut das Rank-Math-Inhaltsverzeichnis und
Buchungs-Buttons als eigene, stylebare Bausteine nach.
"""
import json
import re
from bs4 import BeautifulSoup, NavigableString

BOOKING_LINK_FALLBACK = "https://cal.eu/mein-beamtenportal/kostenfreie-erstberatung"

# "div" bleibt bewusst NICHT erhalten (unwrap statt keep): die
# Hero-Bereinigung entfernt vorangehende Geschwister-Elemente der
# Duplikat-Ueberschrift - das funktioniert nur zuverlaessig auf einer
# flachen Struktur. Verschachtelte Divs wuerden das aushebeln.
KEEP_TAGS = {"h1", "h2", "h3", "h4", "p", "ul", "ol", "li", "blockquote", "img",
             "table", "thead", "tbody", "tr", "th", "td", "a", "strong", "em",
             "br", "nav", "details", "summary", "div"}


def clean_html(raw_html: str, post_title: str = "") -> dict:
    """Gibt {"html", "subtitle", "toc"} zurueck. "subtitle" ist der Hero-
    Untertitel (aus dem sonst komplett entfernten Cover-Block), "toc" eine
    Liste von {"href","text"} fuers Rank-Math-Inhaltsverzeichnis - beides
    wird von der Seitenvorlage separat gerendert (Hero-Band / Sidebar),
    nicht mehr inline in den Artikeltext eingebettet.
    """
    soup = BeautifulSoup(raw_html, "lxml")

    # <style>/<script> IMMER komplett entfernen (decompose, nicht unwrap) -
    # sonst wird ihr Inhalt (z.B. ".gs_xyz { color: ... }") zu sichtbarem
    # Fliesstext, sobald das Tag selbst unwrapped wird.
    for tag in soup.find_all(["style", "script"]):
        tag.decompose()

    # Eingebettete Greyd-Formulare (z.B. der interaktive PKV-Kostenrechner)
    # brauchen Backend/JS, das es hier nicht gibt - "form" steht nicht auf
    # der KEEP_TAGS-Whitelist, wuerde also weiter unten nur unwrapped statt
    # entfernt, und ALLE Formularfelder (inkl. versteckter Honeypot-Felder
    # wie "Contact me by fax only", deren hidden-Attribut beim Attribut-Trim
    # ebenfalls verloren geht) blieben als nackter, unbedienbarer Text-/Div-
    # Wust im Artikel stehen. Komplett entfernen statt kaputt darzustellen.
    for tag in soup.find_all("form"):
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
    # Untertitel aus dem Hero-Cover sichern, bevor der ganze Block entfernt
    # wird: der erste <p> darin, der nicht Teil der Button-Gruppe ist.
    subtitle = ""
    if hero_cover:
        for p_tag in hero_cover.find_all("p"):
            if p_tag.find_parent("div", class_="wp-block-greyd-buttons"):
                continue
            text = p_tag.get_text(strip=True)
            if text:
                subtitle = text
                break
        hero_cover.decompose()

    # Rank-Math-Inhaltsverzeichnis als strukturierte Daten extrahieren (fuer
    # eine echte, mitscrollende Sidebar in der Seitenvorlage) und aus dem
    # Artikeltext entfernen statt es inline einzubetten.
    toc_entries = []
    for toc in soup.find_all("div", class_="wp-block-rank-math-toc-block"):
        for a in toc.find_all("a"):
            text = a.get_text(strip=True)
            if text == "Über uns":
                text = "Über mich"  # bleibt konsistent mit der personalisierten Box unten
            toc_entries.append({"href": a.get("href", ""), "text": text})
        toc.decompose()

    # Zweites TOC-Plugin ("Stackable Table of Contents") steckt zusaetzlich
    # in JEDEM Post - komplett redundant zur Rank-Math-Box oben, wird aber
    # NICHT von der bisherigen Erkennung erfasst (andere Blockklasse) und
    # blieb deshalb unveraendert im Artikeltext stehen: eine zweite,
    # unformatierte "Inhalt"-Liste mitten/am Ende des Artikels.
    for stk_nav in soup.find_all("nav", class_="wp-block-stackable-table-of-contents"):
        wrapper = stk_nav.find_parent("div", class_="wp-block-group") or stk_nav
        heading = wrapper.find_previous_sibling(["h2", "h3", "h4"])
        if heading and heading.get_text(strip=True) == "Inhalt":
            heading.decompose()
        wrapper.decompose()

    # Buchungs-Buttons (Gutenberg "button"-Klasse) als eigenen Marker
    # erhalten, damit sie in der neuen Vorlage wie ein Button aussehen statt
    # wie ein normaler Textlink - sonst wuerden sie durch den Whitelist-Trim
    # zu ununterscheidbaren <a>-Links.
    for a in soup.find_all("a", class_=re.compile(r"\bbutton\b")):
        href = a.get("href", "")
        # Manche Buttons oeffnen im Original ein JS-Popup (Lead-Formular)
        # statt zu verlinken - ohne diese Popup-Logik zeigen wir stattdessen
        # den Buchungslink, sonst waere der Button ein totes href="".
        if not href:
            href = BOOKING_LINK_FALLBACK
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

    # Icon direkt vor einer Zwischenueberschrift (z.B. Persona-Boxen wie
    # "Tobias dachte lange...") stand im Original in einer Flex-Gruppe neben
    # der Ueberschrift. Ohne die Gruppierung faellt das Icon auf eine eigene
    # Zeile ueber der Ueberschrift - wird deshalb in einen eigenen
    # <div class="icon-row"> zusammengefasst und per Flex gestylt.
    for group in soup.find_all("div", class_="is-layout-flex"):
        fig = group.find("figure", recursive=False)
        heading = group.find(["h2", "h3", "h4"], recursive=False)
        img = fig.find("img") if fig else None
        if img and heading:
            row = soup.new_tag("div")
            row["class"] = ["icon-row"]
            img.extract()
            heading.extract()
            row.append(img)
            row.append(heading)
            group.replace_with(row)

    # "Das Wichtigste in Kürze"-Box: Überschrift (ggf. schon zur icon-row
    # zusammengefasst) + die direkt folgende Liste in eine gemeinsame,
    # farblich abgesetzte Box packen statt als normale Fliesstext-Liste.
    kuerze_heading = None
    for h in soup.find_all(["h2", "h3", "h4"]):
        if h.get_text(strip=True) == "Das Wichtigste in Kürze":
            kuerze_heading = h
            break
    if kuerze_heading:
        anchor = kuerze_heading.parent if kuerze_heading.parent.get("class") == ["icon-row"] else kuerze_heading
        next_list = anchor.find_next_sibling(["ul", "ol"])
        if next_list:
            box = soup.new_tag("div")
            box["class"] = ["summary-box"]
            anchor.insert_before(box)
            anchor.extract()
            next_list.extract()
            box.append(anchor)
            box.append(next_list)

    # Inline-Foto-CTA-Karten (z.B. "Jetzt kostenfreie Beratung buchen" oder
    # "Meine Ultimative PKV-Checkliste zum Download") - ein wp-block-cover
    # MITTEN im Artikel (nicht der Hero, der ist schon entfernt) mit echtem
    # Foto, direkt vorangestellt eine Textgruppe (Ueberschrift + Absatz +
    # Button). Bild-URL und Text kommen aus dem jeweiligen Post, nicht
    # hartkodiert - je nach Post ist der Inhalt unterschiedlich.
    for cover in list(soup.find_all("div", class_="wp-block-cover")):
        img = cover.find("img")
        if not img:
            continue
        prev = cover.find_previous_sibling("div", class_="wp-block-group")
        if not prev or not prev.find(["h2", "h3", "h4"]):
            continue
        card = soup.new_tag("div")
        card["class"] = ["photo-cta"]
        cover.replace_with(card)  # Karte uebernimmt die Position des Covers
        new_img = soup.new_tag("img", src=img.get("src", ""))
        new_img["alt"] = img.get("alt", "")
        prev.extract()
        card.append(prev)
        card.append(new_img)

    # Navy-Boxen ("Wir sind ein Team...", "Redaktionsteam / Über uns",
    # "Kostenfreie, individuelle Beratung") - im Original stehen pro Post
    # bis zu drei davon (nicht nur die erste!), jede mit eigenem
    # Navy-Hintergrund. find_all statt find, sonst verlieren die
    # nachfolgenden Boxen ihre Formatierung komplett.
    for team_box in soup.find_all("div", class_="has-primary-background-color"):
        team_box["class"] = ["team-box"]

    # "Wir sind ein Team..."-Box auf Albert als Einzelperson personalisieren
    # (Ich-Form) und die generische Illustration gegen sein echtes
    # Portraitfoto tauschen.
    for team_box in soup.find_all("div", class_="team-box"):
        p_tag = team_box.find("p")
        if p_tag and p_tag.get_text(strip=True).startswith("Wir sind ein Team"):
            p_tag.string = (
                "Ich bin Albert Sibert, unabhängiger Finanzberater mit Schwerpunkt auf Beamte, "
                "Referendare und Anwärter. Seit 2019 begleite ich Sie bei Beihilfe, PKV, BU und "
                "Altersvorsorge – mit über 250 Partnergesellschaften statt nur einem Produkt."
            )
            # Diese Box hat im Original 2 <img> (Mobile-/Desktop-Variante der
            # Illustration) - nur eins zum echten Foto machen, das andere
            # verwerfen, sonst bleiben zwei Bilder uebrig.
            imgs = team_box.find_all("img")
            if imgs:
                imgs[0]["src"] = "/albert-portrait.webp"
                imgs[0]["alt"] = "Albert Sibert"
                imgs[0]["style"] = ""
                existing_class = imgs[0].get("class") or []
                imgs[0]["class"] = list(existing_class) + ["profile-photo"]
                for extra in imgs[1:]:
                    extra.decompose()
            break

    # "Über uns" (Redaktionsteam-Textbaustein) auf "Über mich" personalisieren
    # mit 3 Highlights - Albert tritt als Einzelperson auf, nicht als
    # anonymes Redaktionsteam. Manche Artikel hatten diesen Block in WP schon
    # direkt als "Über den Autor" mit echtem Bio-Text angelegt - dort nur den
    # Text belassen, aber trotzdem wrappen (sonst werden Ueberschrift + beide
    # Absaetze zu 3 einzelnen Flex-Items der .team-box und die Spalten
    # quetschen sich kaputt, siehe naechster Kommentarblock).
    # Ueber die Rank-Math-ID laesst sich dieser Block nicht zuverlaessig
    # finden: "u" ist nicht eindeutig (z.B. teilt sich eine "Jetzt
    # herunterladen"-Ueberschrift in einer photo-cta-Box dieselbe ID), und
    # bei einer zweiten Kollision im selben Artikel haengt Rank-Math sogar
    # "-1" an ("u-1") - stattdessen robust ueber Text UND team-box-Vorfahre
    # suchen.
    ueber_uns_heading = next(
        (
            h for h in soup.find_all(["h2", "h3"])
            if h.get_text(strip=True) in ("Über uns", "Über den Autor", "Über mich")
            and h.find_parent("div", class_="team-box")
        ),
        None,
    )
    heading_text = ueber_uns_heading.get_text(strip=True) if ueber_uns_heading else None
    if ueber_uns_heading and heading_text == "Über uns":
        byline = ueber_uns_heading.find_previous("h4")
        if byline:
            byline.string = "Albert Sibert"
            # Das Icon steckt als <img> in einem <figure>, das Geschwister
            # (nicht Vorfahre) des h4-umschliessenden Divs ist.
            byline_img = None
            byline_parent = byline.find_parent()
            if byline_parent:
                prev_sib = byline_parent.find_previous_sibling()
                if prev_sib:
                    byline_img = prev_sib.find("img") if prev_sib.name != "img" else prev_sib
            if byline_img:
                byline_img["src"] = "/albert-portrait.webp"
                byline_img["alt"] = "Albert Sibert"
                byline_img["style"] = ""  # feste Icon-Groesse (z.B. 48px) verwerfen, echtes Fotoformat nutzen
                existing_class = byline_img.get("class") or []
                byline_img["class"] = list(existing_class) + ["profile-photo"]
        ueber_uns_heading.string = "Über mich"
        old_paras = ueber_uns_heading.find_next_siblings("p", limit=2)
        for op in old_paras:
            op.decompose()
        intro = soup.new_tag("p")
        intro.string = (
            "Unabhängiger Finanzberater mit Schwerpunkt auf Beamte, Referendare und Anwärter im "
            "öffentlichen Dienst. Seit 2019 begleite ich Sie bei Beihilfe, PKV, Dienstunfähigkeit "
            "und Altersvorsorge – mit über 250 Partnergesellschaften zur Auswahl."
        )
        highlights_ul = soup.new_tag("ul")
        for lead, rest in [
            ("Über 250 Partnergesellschaften:", "Ich vergleiche unabhängig, statt nur ein Produkt zu verkaufen."),
            ("Spezialisiert auf den öffentlichen Dienst:", "Beihilfe, PKV und Beamtenversorgung kenne ich im Detail."),
            ("Persönliche Betreuung:", "Sie erreichen mich direkt, ohne Warteschleife oder Callcenter."),
        ]:
            li = soup.new_tag("li")
            strong = soup.new_tag("strong")
            strong.string = lead
            li.append(strong)
            li.append(" " + rest)
            highlights_ul.append(li)
        # h2 + Intro + Highlights in EINEN Container packen, damit sie im
        # Flex-Layout der team-box als ein Block stehen statt als drei
        # separate Flex-Items unkontrolliert umzubrechen.
        content_wrap = soup.new_tag("div")
        ueber_uns_heading.insert_before(content_wrap)
        ueber_uns_heading.extract()
        content_wrap.append(ueber_uns_heading)
        content_wrap.append(intro)
        content_wrap.append(highlights_ul)
    elif ueber_uns_heading and heading_text in ("Über den Autor", "Über mich"):
        following_paras = ueber_uns_heading.find_next_siblings("p", limit=2)
        content_wrap = soup.new_tag("div")
        ueber_uns_heading.insert_before(content_wrap)
        ueber_uns_heading.extract()
        content_wrap.append(ueber_uns_heading)
        for p in following_paras:
            p.extract()
            content_wrap.append(p)

    # Alle Attribute ausser href/src/alt entfernen, Tags auf Whitelist
    # reduzieren. id bleibt an Ueberschriften erhalten (Sprungmarken des
    # Inhaltsverzeichnisses funktionieren sonst nicht mehr). class bleibt nur
    # an unseren eigenen Markern (btn/icon-row/blue-background/team-box).
    MARKER_CLASSES = {"btn", "icon-row", "blue-background", "team-box", "summary-box", "photo-cta", "profile-photo"}
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
        # Bild-Groesse erhalten: kleine Icons (z.B. "width:auto;height:48px")
        # haben im Original eine explizite Pixel-Groesse per Inline-Style,
        # die sonst verloren geht - Icons wuerden dann in ihrer vollen
        # SVG-Nativgroesse (teils 300px+) gerendert statt als kleines Icon.
        if tag.name == "img":
            style = tag.attrs.get("style", "")
            size_decls = re.findall(r"(width|height)\s*:\s*(\d+px)", style)
            if size_decls:
                attrs["style"] = ";".join(f"{prop}:{val}" for prop, val in size_decls)
        tag.attrs = attrs

    # Leere Absaetze/Listenpunkte entfernen.
    for tag in soup.find_all(["p", "li"]):
        if not tag.get_text(strip=True) and not tag.find("img"):
            tag.decompose()
    for container in soup.find_all(["ul", "nav", "div"]):
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

    # Rechtliche Hinweis-/Disclaimer-Zeilen klein und kursiv absetzen statt
    # im normalen Fliesstext unterzugehen.
    for p_tag in soup.find_all("p"):
        text = p_tag.get_text(strip=True)
        if text.startswith("Hinweis:") or text.startswith("Disclaimer:"):
            p_tag["class"] = ["legal-note"]

    # Direkt aufeinanderfolgende Bilder mit identischer src (Cover- +
    # Feature-Bild-Dopplung) auf ein Vorkommen reduzieren.
    for img in soup.find_all("img"):
        prev = img.find_previous_sibling()
        while prev and isinstance(prev, NavigableString) and not prev.strip():
            prev = prev.find_previous_sibling()
        if prev and prev.name == "img" and prev.get("src") == img.get("src"):
            img.decompose()

    # Freistehende Bilder (eigener Div-Wrapper ohne Begleittext, keine Icon-/
    # Team-/Summary-/Photo-Box) in den naechsten Absatz mit Text einbetten.
    # Grund: globals.css floatet ".prose img" nach rechts, damit Text daneben
    # umbricht - steht danach aber nur noch eine Ueberschrift/Box (clear:both),
    # bleibt links vom Bild eine leere Flaeche, weil nichts mehr umzubrechen
    # hat. Das Bild als erstes Kind IN den Absatz zu haengen, statt als
    # Geschwister davor/danach, macht den Umbruch immer bündig - unabhaengig
    # davon, was im Originalartikel um das Bild herum stand.
    STANDALONE_IMG_SKIP_CLASSES = {"icon-row", "team-box", "summary-box", "photo-cta", "profile-photo", "btn"}

    def _find_text_p(tags):
        for sib in tags:
            if isinstance(sib, NavigableString):
                continue
            if sib.name == "p" and sib.get_text(strip=True):
                return sib
            if sib.name == "div":
                found = sib.find("p")
                if found and found.get_text(strip=True):
                    return found
            if sib.name in {"h1", "h2", "h3", "h4"}:
                return None
        return None

    for img in soup.find_all("img"):
        parent = img.parent
        if parent is None or parent.name != "div":
            continue
        if set(parent.attrs.get("class", [])) & STANDALONE_IMG_SKIP_CLASSES:
            continue
        if parent.get_text(strip=True):
            continue
        target_p = _find_text_p(parent.find_previous_siblings())
        if target_p is None:
            target_p = _find_text_p(parent.find_next_siblings())
        if target_p is None:
            continue
        img.extract()
        target_p.insert(0, img)
        if not parent.get_text(strip=True) and not parent.find("img"):
            parent.decompose()

    # Freistehenden Text (durch unwrap() entstanden, z.B. Subtitle-Spans) in
    # <p> einpacken statt als nacktes Text-Fragment im HTML zu belassen.
    for node in list(soup.contents):
        if isinstance(node, NavigableString) and node.strip():
            p = soup.new_tag("p")
            node.replace_with(p)
            p.string = node.strip()

    # Rank-Math exportiert manche TOC-Links (z.B. "#u-1"), deren Ziel-ID im
    # eigentlichen Artikeltext gar nicht existiert - Rank Math dedupliziert
    # kollidierende IDs (mehrere Elemente mit id="u", siehe Author-Box-Fix
    # oben) offenbar nur clientseitig beim Rendern; der Rohtext-Export
    # behaelt die kollidierende ID. Damit die Sidebar-Links zuverlaessig zum
    # richtigen Abschnitt springen: IDs im finalen Dokument in Reihenfolge
    # deduplizieren (erstes Vorkommen behaelt die ID, weitere bekommen
    # -1, -2, ...) und die TOC-Hrefs danach ueber den Ueberschriften-TEXT neu
    # auflösen statt sich auf die urspruengliche, moeglicherweise falsche ID
    # zu verlassen.
    seen_ids = {}
    for tag in soup.find_all(id=True):
        original_id = tag["id"]
        if original_id not in seen_ids:
            seen_ids[original_id] = 0
            continue
        seen_ids[original_id] += 1
        tag["id"] = f"{original_id}-{seen_ids[original_id]}"

    headings_by_text = {}
    for heading in soup.find_all(["h1", "h2", "h3"]):
        heading_id = heading.get("id")
        if not heading_id:
            continue
        headings_by_text.setdefault(heading.get_text(strip=True), heading_id)
    # Manche Rank-Math-TOC-Eintraege zeigen auf Abschnitte, die es im
    # migrierten Artikel gar nicht mehr gibt: die eigentliche H1 (steht im
    # Hero der Seitenvorlage, nicht im Fliesstext), Cross-Selling-/Kontakt-
    # Bloecke am Artikelende (werden durch eigene Next.js-Sektionen ersetzt)
    # oder vereinzelt verwaiste Alt-Eintraege einer schon umbenannten
    # Ueberschrift ("Über den Autor" neben dem aktuellen "Über mich"). Solche
    # Eintraege ohne aufloesbares Ziel rausfiltern statt eine tote
    # Sidebar-Sprungmarke stehen zu lassen.
    resolved_entries = []
    for entry in toc_entries:
        resolved_id = headings_by_text.get(entry["text"])
        if not resolved_id:
            continue
        entry["href"] = f"#{resolved_id}"
        resolved_entries.append(entry)
    toc_entries = resolved_entries

    result = str(soup)
    result = re.sub(r"\n{3,}", "\n\n", result)
    return {"html": result.strip(), "subtitle": subtitle, "toc": toc_entries}


if __name__ == "__main__":
    posts = json.load(open("migration/wp-posts.json"))
    sample = posts[0]
    cleaned = clean_html(sample["content"]["rendered"], sample["title"]["rendered"])
    print(f"Vorher: {len(sample['content']['rendered'])} Zeichen")
    print(f"Nachher: {len(cleaned['html'])} Zeichen")
    print(f"Untertitel: {cleaned['subtitle']!r}")
    print(f"TOC-Eintraege: {len(cleaned['toc'])}")
    print("--- erste 1500 Zeichen ---")
    print(cleaned["html"][:1500])
