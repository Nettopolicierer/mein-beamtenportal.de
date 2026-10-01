"""Nachbearbeitungsschritte auf src/content-posts.json, die NICHT in
clean_content.py/build_content.py kodiert sind (weil sie redaktionelle
Entscheidungen statt genereller Bereinigungsregeln sind). MUSS nach jedem
`python3 migration/build_content.py`-Lauf erneut ausgefuehrt werden - sonst
ueberschreibt der naechste Rebuild diese Aenderungen wieder, weil
build_content.py content-posts.json komplett neu aus wp-posts.json erzeugt.

Empfohlene Reihenfolge fuer einen vollstaendigen Rebuild:
  1. python3 migration/build_content.py
  2. python3 migration/postprocess_content.py   (dieses Skript)
  3. python3 migration/detect_hero_focus.py      (Hero-Bild-Fokuspunkte)
  4. npm run build                               (Fehler? nicht committen)

Siehe Commit-Historie fuer den Kontext der einzelnen Schritte unten.
"""
import json
import re
from bs4 import BeautifulSoup

POSTS_PATH = "src/content-posts.json"

# ---------------------------------------------------------------------------
# Schritt A: "Beamtenpension Rechner"-Artikel war explizit blacklisteter
# "Pensionshöhe berechnen"-Content (zieht renten-nahe statt beratungsbedürf-
# tige Leser an) - komplett entfernt, alle internen Links darauf entpackt,
# Fliesstext-Erwaehnungen des (jetzt geloeschten) eigenen Tools umformuliert.
# ---------------------------------------------------------------------------
REMOVED_SLUG = "beamtenpension-rechner-berechnen-sie-ihre-pension"

TOOL_MENTION_EDITS = {
    "pension-fuer-beamte-in-hamburg-ihr-kompletter-ueberblick": (
        "Für eine genauere Planung Ihrer Altersvorsorge können Sie auch unseren Beamtenpension Rechner verwenden, der Ihnen eine erste Orientierung über Ihre voraussichtliche Pension",
        "Für eine genauere Planung Ihrer Altersvorsorge lohnt sich ein Blick auf Ihre voraussichtliche Pension",
    ),
    "pension-fuer-beamte-in-niedersachsen-ihr-ueberblick": (
        "Sie können Ihre Pension mit dem Beamtenpension Rechner vorab berechnen.",
        "Die Höhe hängt dabei von Ihren individuellen Dienstzeiten und Ihrer Besoldungsgruppe ab.",
    ),
    "pension-beamte-in-berlin-berechnung": (
        "Zusätzlich können Sie auch den Beamtenpension Rechner nutzen, um eine erste Schätzung Ihrer voraussichtlichen Pension zu erhalten.",
        "Zusätzlich hilft die Versorgungsauskunft von berlin.de für eine erste Schätzung Ihrer voraussichtlichen Pension.",
    ),
    "pension-lehrer-in-baden-wuerttemberg": (
        "Mit einem Beamtenpension Rechner können Sie Ihre voraussichtliche Versorgungslücke ermitteln.",
        "Mit einer Versorgungsauskunft Ihres Dienstherrn können Sie Ihre voraussichtliche Versorgungslücke ermitteln.",
    ),
    "pension-lehrer-in-sachsen": (
        "Für eine genaue Analyse Ihrer persönlichen Pensionsansprüche nutzen Sie am besten einen Beamtenpension Rechner.",
        "Für eine genaue Analyse Ihrer persönlichen Pensionsansprüche wenden Sie sich am besten an Ihre Bezügestelle.",
    ),
    "pension-lehrer-in-berlin": (
        "Praktisch ist auch der Beamtenpension Rechner, mit dem Sie Ihre Pension schnell und unkompliziert berechnen können.",
        "Praktisch ist auch die Versorgungsauskunft des Landesverwaltungsamts, mit der Sie Ihre Pension unkompliziert schätzen können.",
    ),
}

# ---------------------------------------------------------------------------
# Schritt B: Pension-Artikel fuer renten-nahe Leser (Bundesland-/Besoldungs-
# gruppen-spezifisch) hatten Fliesstext-Absaetze, die explizit "Ihre
# individuelle Versorgungssituation" in einem kostenfreien Beratungstermin
# analysieren wollten - genau die Zielgruppe, die NICHT beraten werden soll
# (siehe .github/blog-autopilot.md Themen-Blacklist). Drei Regex-Runden +
# manuell gefundene Reste per Volltext-Durchsicht.
# ---------------------------------------------------------------------------
PENSION_BLACKLIST_SLUGS = [
    "pension-fuer-lehrer-hamburg", "wann-koennen-lehrer-in-rente-gehen-ihr-ueberblick",
    "wie-viel-pension-bekommt-ein-lehrer-netto", "pension-fuer-beamte-in-berlin-was-sie-jetzt-wissen-muessen",
    "pension-fuer-beamte-in-niedersachsen-ihr-ueberblick", "pension-beamte-in-berlin-berechnung",
    "pension-lehrer-in-thueringen", "pension-beamte-in-brandenburg", "pension-lehrer-in-hessen",
    "pension-lehrer-in-baden-wuerttemberg", "pension-beamte-in-nrw", "pension-lehrer-in-sachsen",
    "pension-fuer-beamte-abschaffen-das-sind-pro-und-contra", "ehepaar-beide-beamte-pension",
    "pension-lehrer-in-berlin", "pension-fuer-beamte-im-saarland-was-sie-wissen-muessen",
    "pension-beamte-sachsen", "pension-beamte-baden-wuerttemberg",
    "pension-fuer-beamte-in-hessen-was-sie-wissen-muessen", "pension-beamte-bayern",
    "wie-hoch-ist-die-pension-bei-a8-netto", "wie-hoch-ist-die-pension-bei-a12",
    "wie-hoch-ist-die-pension-bei-a9", "wie-hoch-ist-die-pension-bei-a13-netto",
    "pension-fuer-lehrer-in-niedersachsen", "berechnung-pension-als-lehrer-in-teilzeit",
    "pension-fuer-lehrer-in-bayern", "pension-fuer-lehrer-in-nrw", "beamte-wann-in-pension-gehen",
    "ruhegehalt-bei-dienstunfaehigkeit-tabelle-ueberblick-fuer-beamte",
]

PITCH_PATTERN_1 = re.compile(
    r"(Beratungstermin|Vereinbaren Sie|kostenfreie[ns]? (Erst)?[Gg]espr|"
    r"individuelle[rn]? Beratung|kenne ich die Besonderheiten|"
    r"(Als|Mit meiner Expertise als) (unabhängiger|spezialisierter)[^.?!]*(Berater|Finanzberater|Experte)|"
    r"Möchten Sie (wissen|Ihre|Klarheit)|Optimierungsm(ö|oe)glichkeiten|Optimierungspotenzial|"
    r"Lassen Sie uns gemeinsam|In einem (kostenfreien |persönlichen )?(Beratungs)?[Gg]espr(ä|ae)ch|"
    r"sichern Sie sich|maßgeschneiderte (Lösung|Strategie)|Nutzen Sie unseren Beamtenpension Rechner|"
    r"analysiere(n)? (ich |wir )?Ihre (persönliche|individuelle)|empfiehlt sich eine individuelle Beratung|"
    r"Hier empfiehlt sich|Nutzen Sie (meine|unsere) (Expertise|Erfahrung)|profitieren Sie von|"
    r"Buchen Sie|entwickle ich (gemeinsam )?mit Ihnen|gemeinsam mit Ihnen eine|"
    r"kontaktieren Sie mich|melden Sie sich)",
    re.I,
)
PITCH_PATTERN_2 = re.compile(
    r"(professionelle Beratung|fundierte Beratung|empfiehlt sich eine[a-zA-Z ]*Beratung|"
    r"Beratung (hilft|kann Ihnen|wertvoll|sinnvoll|unverzichtbar)|"
    r"Interessiert Sie,|Haben Sie Fragen)",
    re.I,
)

# (slug, alter Text, neuer Text) - Faelle mit eingebettetem internem Link
# (Sentence-Filter wuerde den Link mit raustrennen) oder individuell
# formulierte Pitches, die die Regex-Muster nicht erfasst haben.
PENSION_MANUAL_EDITS = [
    ("pension-fuer-beamte-in-berlin-was-sie-jetzt-wissen-muessen",
     '<p>Die Komplexität der Beamtenversorgung macht professionelle Beratung wertvoll. Als spezialisierter Berater für Beamte kenne ich alle relevanten Regelungen und Optimierungsmöglichkeiten. Vereinbaren Sie einen kostenfreien Beratungstermin, um Ihre individuelle Versorgungssituation zu analysieren. Gemeinsam entwickeln wir eine maßgeschneiderte Strategie für Ihre optimale <a href="https://mein-beamtenportal.de/ratgeber/pension/altersvorsorge-fuer-beamte/">Altersvorsorge</a>. Nutzen Sie meine Expertise für Ihre sichere Zukunft.</p>',
     ''),
    ("pension-fuer-beamte-in-niedersachsen-ihr-ueberblick",
     '<p>Die Komplexität der Pensionsberechnung mit ihren vielen Sonderregelungen macht eine professionelle Beratung oft unverzichtbar. Besonders wenn Sie überlegen, vorzeitig in Pension zu gehen oder Ihre Arbeitszeit zu reduzieren, sollten Sie die finanziellen Auswirkungen genau kennen. In einem persönlichen Gespräch kann ich Ihre individuelle Situation analysieren und Ihnen zeigen, wie Sie Ihre <a href="https://mein-beamtenportal.de/ratgeber/pension/altersvorsorge-fuer-beamte/">Altersvorsorge für Beamte</a> optimal gestalten.</p>',
     '<p>Die Komplexität der Pensionsberechnung mit ihren vielen Sonderregelungen zeigt sich besonders, wenn Sie überlegen, vorzeitig in Pension zu gehen oder Ihre Arbeitszeit zu reduzieren – die finanziellen Auswirkungen sollten Sie genau kennen, etwa im Zusammenspiel mit Ihrer <a href="https://mein-beamtenportal.de/ratgeber/pension/altersvorsorge-fuer-beamte/">Altersvorsorge für Beamte</a>.</p>'),
    ("pension-lehrer-in-hessen",
     '<p>Möchten Sie Ihre persönliche Pensionssituation genau analysieren und den optimalen Ruhestandszeitpunkt ermitteln? Die Vielzahl der Regelungen und Berechnungsfaktoren macht eine individuelle Beratung sinnvoll. Vereinbaren Sie gerne einen kostenfreien Beratungstermin bei Albert Sibert. Als unabhängiger Finanzberater mit Spezialisierung auf Beamte und Lehrer entwickle ich gemeinsam mit Ihnen eine maßgeschneiderte Strategie für Ihre finanzielle Zukunft. Nutzen Sie meine Expertise aus über fünf Jahren Beratungserfahrung und profitieren Sie von einer transparenten, verständlichen Analyse Ihrer Pensionsansprüche. Buchen Sie jetzt Ihren persönlichen Termin und sichern Sie sich die bestmögliche <a href="https://mein-beamtenportal.de/ratgeber/beamte/altersvorsorge-fuer-beamte-sinnvoll/">Altersvorsorge für Beamte</a>.</p>',
     ''),
    ("pension-beamte-in-nrw",
     '<p>Die Berechnung Ihrer persönlichen Pension kann schnell komplex werden. Besonders wenn Sie überlegen, früher in den Ruhestand zu gehen oder Ihre Altersversorgung durch <a href="https://mein-beamtenportal.de/ratgeber/allgemein/private-altersvorsorge-fuer-beamte/">private Altersvorsorge</a> ergänzen möchten, lohnt sich eine professionelle Beratung. Als unabhängiger Finanzberater mit Spezialisierung auf Beamte kenne ich die Besonderheiten Ihrer Versorgung genau und entwickle mit Ihnen gemeinsam eine optimale Strategie für Ihren Ruhestand.</p>',
     '<p>Die Berechnung Ihrer persönlichen Pension kann schnell komplex werden, besonders wenn Sie überlegen, früher in den Ruhestand zu gehen oder Ihre Altersversorgung durch <a href="https://mein-beamtenportal.de/ratgeber/allgemein/private-altersvorsorge-fuer-beamte/">private Altersvorsorge</a> ergänzen möchten.</p>'),
    ("pension-lehrer-in-sachsen",
     '<p>Die tatsächliche Höhe Ihrer Pension hängt von verschiedenen Faktoren ab: Besoldungsgruppe, Dienstjahre, Familienzuschlag, Inflation bis zu Ihrer Pension und eventuelle ruhegehaltfähige Zulagen. Eine individuelle Berechnung ist daher unerlässlich. Für eine genaue Analyse Ihrer persönlichen Pensionsansprüche nutzen Sie am besten einen <a href="https://mein-beamtenportal.de/ratgeber/rechner/beamtenpension-rechner-berechnen-sie-ihre-pension/">Beamtenpension Rechner</a> oder vereinbaren Sie gerne einen kostenfreien Beratungstermin.</p>',
     '<p>Die tatsächliche Höhe Ihrer Pension hängt von verschiedenen Faktoren ab: Besoldungsgruppe, Dienstjahre, Familienzuschlag, Inflation bis zu Ihrer Pension und eventuelle ruhegehaltfähige Zulagen. Eine individuelle Berechnung ist daher unerlässlich.</p>'),
    ("beamtenpension-rechner-berechnen-sie-ihre-pension",
     '<p>Eine professionelle Pensionsberechnung zeigt Ihnen auch Optimierungspotenziale auf. Möglicherweise lohnt sich ein längerer Verbleib im Dienst finanziell erheblich. Oder Sie erkennen frühzeitig, dass zusätzliche <a href="https://mein-beamtenportal.de/ratgeber/allgemein/private-altersvorsorge-fuer-beamte/">private Altersvorsorge für Beamte</a> notwendig ist. Diese Erkenntnisse sind unbezahlbar für Ihre finanzielle Zukunft.</p>',
     '<p>Möglicherweise lohnt sich ein längerer Verbleib im Dienst finanziell erheblich. Oder Sie erkennen frühzeitig, dass zusätzliche <a href="https://mein-beamtenportal.de/ratgeber/allgemein/private-altersvorsorge-fuer-beamte/">private Altersvorsorge für Beamte</a> notwendig ist.</p>'),
    ("beamte-wann-in-pension-gehen",
     '<p>Vereinbaren Sie jetzt einen kostenfreien Beratungstermin und sichern Sie sich die optimale Planung für Ihre <a href="https://mein-beamtenportal.de/ratgeber/beamte/beamtenpension/">Beamtenpension</a>. In einem persönlichen Gespräch klären wir all Ihre Fragen und finden die beste Lösung für Ihre finanzielle Zukunft im Ruhestand.</p>',
     ''),
    ("pension-lehrer-in-hessen",
     '<p>Diese Berechnung basiert auf Steuerklasse I ohne Kirchensteuer. Mit anderen Steuerklassen oder bei Kirchenzugehörigkeit ändert sich der Nettobetrag entsprechend. Die genaue Berechnung hängt von Ihrer individuellen Situation ab. Für eine präzise Ermittlung Ihrer zu erwartenden <a href="https://mein-beamtenportal.de/ratgeber/beamte/wie-hoch-ist-die-pension-bei-a13-netto/">Pension bei A13 netto</a> sollten Sie eine professionelle Beratung in Anspruch nehmen.</p>',
     '<p>Diese Berechnung basiert auf Steuerklasse I ohne Kirchensteuer. Mit anderen Steuerklassen oder bei Kirchenzugehörigkeit ändert sich der Nettobetrag entsprechend. Die genaue Berechnung hängt von Ihrer individuellen Situation ab, mehr dazu in unserem Artikel zur <a href="https://mein-beamtenportal.de/ratgeber/beamte/wie-hoch-ist-die-pension-bei-a13-netto/">Pension bei A13 netto</a>.</p>'),
    ("pension-fuer-beamte-im-saarland-was-sie-wissen-muessen",
     '<p>Die endgültige Feststellung erfolgt bei Ihrem Ruhestandseintritt. Für eine Vorabberechnung Ihrer persönlichen Dienstzeiten stehe ich Ihnen gerne zur Verfügung.</p>',
     '<p>Die endgültige Feststellung erfolgt bei Ihrem Ruhestandseintritt.</p>'),
    ("berechnung-pension-als-lehrer-in-teilzeit",
     'Bundeslandspezifische Regelungen, persönliche Faktoren und sich ändernde Gesetze machen eine verlässliche Prognose schwierig. Albert Sibert unterstützt Sie gerne mit einer kostenfreien Erstberatung bei der Planung Ihrer Altersvorsorge.',
     'Bundeslandspezifische Regelungen, persönliche Faktoren und sich ändernde Gesetze machen eine verlässliche Prognose schwierig.'),
    ("pension-lehrer-in-baden-wuerttemberg",
     'Die Berechnung des optimalen Pensionszeitpunkts unter Berücksichtigung aller Faktoren wie Abschläge, Zulagen, Inflation bis zu Ihrer Pension und persönlicher Lebensumstände kann schnell komplex werden. Genau hier unterstütze ich Sie gerne mit einer individuellen Analyse Ihrer Situation.',
     'Die Berechnung des optimalen Pensionszeitpunkts unter Berücksichtigung aller Faktoren wie Abschläge, Zulagen, Inflation bis zu Ihrer Pension und persönlicher Lebensumstände kann schnell komplex werden.'),
    ("berechnung-pension-als-lehrer-in-teilzeit",
     'Jede Situation ist einzigartig: Ihr Bundesland, Ihre Besoldungsgruppe, Ihre Familienssituation und Ihre Karriereplanung beeinflussen Ihre optimale Strategie. Albert Sibert bietet Ihnen eine kostenfreie Erstberatung, in der Sie Ihre persönliche Situation analysieren und die beste Lösung für Ihre Altersvorsorge finden können.',
     'Jede Situation ist einzigartig: Ihr Bundesland, Ihre Besoldungsgruppe, Ihre Familienssituation und Ihre Karriereplanung beeinflussen Ihre optimale Strategie.'),
    ("ruhegehalt-bei-dienstunfaehigkeit-tabelle-ueberblick-fuer-beamte",
     'Die genaue Prüfung Ihrer anrechenbaren Zeiten bespreche ich gerne in einem persönlichen Termin mit Ihnen.',
     ''),
    ("ruhegehalt-bei-dienstunfaehigkeit-tabelle-ueberblick-fuer-beamte",
     ' In meiner Beratung habe ich mich auch auf die speziellen Bedürfnisse von Zeitsoldaten und Berufssoldaten spezialisiert.',
     ''),
]


def split_sentences(text):
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p for p in parts if p.strip()]


def strip_pitch_sentences(by_slug, slugs, pattern):
    skipped_with_link = []
    for slug in slugs:
        post = by_slug.get(slug)
        if not post:
            continue
        soup = BeautifulSoup(post["html"], "lxml")
        changed = False
        for tag in soup.find_all("p"):
            if tag.find_parent(class_="team-box") or tag.find_parent(class_="photo-cta"):
                continue
            if "legal-note" in (tag.get("class") or []):
                continue
            text = tag.get_text()
            if not pattern.search(text):
                continue
            sentences = split_sentences(text)
            kept = [s for s in sentences if not pattern.search(s)]
            if len(kept) == len(sentences):
                continue
            if tag.find("a") is not None:
                skipped_with_link.append((slug, str(tag)))
                continue
            changed = True
            if not kept:
                tag.decompose()
            else:
                tag.string = " ".join(kept)
        if changed:
            post["html"] = str(soup)
    return skipped_with_link


def remove_pension_calculator(posts):
    kept = [p for p in posts if p["slug"] != REMOVED_SLUG]
    removed = len(posts) - len(kept)
    link_re = re.compile(
        r'<a href="https://(?:www\.)?mein-beamtenportal\.de/(?:ratgeber/[^/]+/)?'
        + re.escape(REMOVED_SLUG) + r'/?">(.*?)</a>'
    )
    links_fixed = 0
    for p in kept:
        new_html, n = link_re.subn(r"\1", p["html"])
        if n:
            links_fixed += n
            p["html"] = new_html
    return kept, removed, links_fixed


def remove_checklist_cta(posts):
    changed = 0
    for post in posts:
        if "Meine Ultimative PKV" not in post["html"]:
            continue
        soup = BeautifulSoup(post["html"], "lxml")
        for cta in soup.find_all("div", class_="photo-cta"):
            heading = cta.find(["h2", "h3"])
            if heading and "Ultimative PKV" in heading.get_text():
                parent = cta.parent
                cta.decompose()
                while parent and parent.name == "div" and not parent.get_text(strip=True) and not parent.find("img"):
                    grandparent = parent.parent
                    parent.decompose()
                    parent = grandparent
        new_html = str(soup)
        if new_html != post["html"]:
            post["html"] = new_html
            changed += 1
    return changed


def main():
    posts = json.load(open(POSTS_PATH))

    posts, removed_count, links_fixed = remove_pension_calculator(posts)
    print(f"Beamtenpension-Rechner-Artikel entfernt: {removed_count}, Links entpackt: {links_fixed}")

    by_slug = {p["slug"]: p for p in posts}
    for slug, (old, new) in TOOL_MENTION_EDITS.items():
        p = by_slug.get(slug)
        if p and old in p["html"]:
            p["html"] = p["html"].replace(old, new, 1)

    skipped1 = strip_pitch_sentences(by_slug, PENSION_BLACKLIST_SLUGS, PITCH_PATTERN_1)
    skipped2 = strip_pitch_sentences(by_slug, PENSION_BLACKLIST_SLUGS, PITCH_PATTERN_2)
    print(f"Pension-Pitch-Bereinigung: Pass 1 uebersprungen (Link) {len(skipped1)}, Pass 2 {len(skipped2)}")

    for slug, old, new in PENSION_MANUAL_EDITS:
        p = by_slug.get(slug)
        if not p:
            continue
        if old in p["html"]:
            p["html"] = p["html"].replace(old, new, 1)

    cta_removed = remove_checklist_cta(posts)
    print(f"PKV-Checkliste-CTA entfernt aus {cta_removed} Artikeln")

    json.dump(posts, open(POSTS_PATH, "w"), ensure_ascii=False, indent=2)
    print("Fertig.")


if __name__ == "__main__":
    main()
