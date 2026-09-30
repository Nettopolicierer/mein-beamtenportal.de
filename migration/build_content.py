"""Wandelt den WordPress-Export in src/content/posts.json + pages.json um,
bereit fuer generateStaticParams in Next.js. Nutzt clean-content.py fuer die
HTML-Bereinigung.
"""
import html
import json
import re
import sys
from clean_content import clean_html

posts = json.load(open("migration/wp-posts.json"))
pages = json.load(open("migration/wp-pages.json"))
categories = {c["id"]: c for c in json.load(open("migration/wp-categories.json"))}
media = json.load(open("migration/wp-media.json"))

RESERVED_SLUGS = {p["slug"] for p in pages}

# Bilder liegen nicht mehr auf der WordPress-Installation (die Domain zeigt seit
# dem Go-Live auf Vercel) - migration/localize_media.py hat sie nach
# public/wp-media/ heruntergeladen. Alle wp-content/uploads-URLs im Content auf
# den lokalen Pfad umschreiben.
WP_UPLOADS_RE = re.compile(r'https?://(?:www\.)?mein-beamtenportal\.de/wp-content/uploads/')


def localize_media_urls(text: str) -> str:
    return WP_UPLOADS_RE.sub("/wp-media/", text)


def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html)


# WP liefert im REST-Export teils undekodierte numerische Entities (z.B.
# "&#038;" statt "&", ein bekannter esc_html()-Effekt) und weiche Trennzeichen
# (­, unsichtbar bis auf einen Zeilenumbruch an der Stelle) im Titel.
# Beides sieht im Title-Tag/H1 kaputt bzw. unnoetig lang aus - bereinigen.
def clean_text(text: str) -> str:
    text = html.unescape(text)
    text = text.replace("­", "")
    return re.sub(r"\s+", " ", text).strip()


# Titel gezielt auf das Beamten-Publikum zuschneiden bzw. auf SEO-taugliche
# Laenge kuerzen (Google schneidet Title-Tags in den Suchergebnissen bei ca.
# 55-60 Zeichen ab - alles danach wird nicht angezeigt). Bedeutung/Fokus-
# Keyword bewusst erhalten, nur Fuellwoerter ("Was Sie wissen muessen", "Ihr
# Ratgeber" etc.) gekuerzt.
TITLE_OVERRIDES = {
    "krankenversicherung-absolvent": "Krankenversicherung als Referendar: GKV oder PKV?",
    "berufs-oder-dienstunfaehigkeitsversicherung": "Berufs- oder Dienstunfähigkeitsversicherung für Lehrer",
    "dienstunfaehigkeit-bei-berufsanfaengern": "Dienstunfähigkeit bei Berufsanfängern: Das Risiko",
    "finanzen-berufsstart-beamte": "Finanzen zum Berufsstart für Beamte: Die Checkliste",
    "versicherung-fuer-lehramtsstudenten": "Versicherungen für Lehramtsstudenten im Überblick",
    "private-krankenversicherung-wechseln-als-beamter": "Private Krankenversicherung wechseln als Beamter",
    "pension-fuer-lehrer-in-bayern": "Pension für Lehrer in Bayern: So berechnet sie sich",
    "freiwillig-gesetzlich-versicherter-beamter-beihilfe": "Freiwillig gesetzlich versicherter Beamter und Beihilfe",
    "beihilfeversicherung-fuer-beamte": "Beihilfeversicherung für Beamte: So funktioniert sie",
    "berufsunfaehigkeitsversicherung-fuer-beamte-lehrer-sinnvoll": "Berufsunfähigkeitsversicherung für Lehrer: Sinnvoll?",
    "berufsunfaehigkeitsversicherung-steuerlich-absetzbar": "Berufsunfähigkeitsversicherung steuerlich absetzbar",
    "oeffnungsklausel-in-der-pkv": "Öffnungsklausel in der PKV für Beamte",
    "private-krankenversicherung-fuer-kinder-beamte": "Private Krankenversicherung für Kinder von Beamten",
    "gehaltserhoehung-investieren": "Gehaltserhöhung investieren: So bauen Sie Vermögen auf",
    "private-altersvorsorge-fuer-beamte": "Private Altersvorsorge für Beamte trotz Pension",
    "ablehnung-der-pkv-als-beamter": "Ablehnung der PKV als Beamter: Was jetzt zählt",
    "berufsunfaehigkeitsversicherung-beamte-2026": "Berufsunfähigkeitsversicherung für Beamte 2026",
    "berufsunfaehigkeitsversicherung-lehramtsstudenten": "Berufsunfähigkeitsversicherung für Lehramtsstudenten",
    "anwartschaft-student-private-krankenversicherung": "PKV-Anwartschaft für Studenten: So funktioniert sie",
    "dienstunfaehigkeitsversicherung-mit-beitragsrueckerstattung-lohnt-sich-das": "DU-Versicherung mit Beitragsrückerstattung: Lohnt es?",
    "beihilfe-beamte": "Beihilfe für Beamte 2026: Was wird erstattet?",
    "altersvorsorge-referendare": "Altersvorsorge für Referendare 2026: Jetzt starten",
    "kosten-dienstunfaehigkeitsversicherung-referendariat": "Kosten der DU-Versicherung im Referendariat",
    "verbeamtung-finanzen": "Verbeamtung: Die Finanz-Checkliste für den Start",
    "beihilfe-im-ausland": "Beihilfe im Ausland: Ansprüche und Regelungen",
    "fondsgebundene-rentenversicherung-fuer-beamte": "Fondsgebundene Rentenversicherung für Beamte",
    "dienstunfaehigkeit-berufsunfaehigkeit": "Unterschied zwischen Dienst- und Berufsunfähigkeit",
    "dienstunfaehigkeit-bei-beamten": "Dienstunfähigkeit bei Beamten 2026: Der Überblick",
    "haftpflichtversicherung-lehramtstudent": "Haftpflichtversicherung für Lehramtsstudenten",
    "anwartschaft-im-lehramt": "Anwartschaft im Lehramt: Der Weg in die PKV",
    "berufsunfaehigkeitsversicherung-fuer-studenten-was-sie-wissen-muessen": "Berufsunfähigkeitsversicherung für Studenten",
    "kosten-private-krankenversicherung-fuer-beamte": "PKV für Beamte: Kosten und Einflussfaktoren",
    "dienstunfaehigkeitsversicherung-fuer-lehrer": "Dienstunfähigkeitsversicherung für Lehrer",
    "berufsunfaehigkeitsversicherung-fuer-lehrer-sinnvoll": "Berufsunfähigkeitsversicherung für Lehrer: Sinnvoll?",
    "bu-versicherung-fuer-lehrer": "BU-Versicherung für Lehrer im Schuldienst",
    "altersvorsorgedepot": "Altersvorsorgedepot 2027: Jetzt Förderung sichern",
    "versicherung-referendariat-lehramt-niedersachsen": "Versicherung im Lehramtsreferendariat Niedersachsen",
    "berufsunfaehigkeit-gruende": "Gründe für Berufsunfähigkeit bei Lehrern",
    "pkv-fuer-lehrer": "Private Krankenversicherung (PKV) für Lehrer",
    "pkv-fuer-beamte": "Private Krankenversicherung (PKV) für Beamte",
    "pflegeversicherung-beamte": "Pflegeversicherung für Beamte: Beihilfe-Lücken",
    "dienstunfaehigkeit-beamte-baden-wuerttemberg-was-sie-wissen-muessen": "Dienstunfähigkeit bei Beamten in Baden-Württemberg",
    "beamte-wann-in-pension-gehen": "Wann können Beamte in Pension gehen?",
    "oeffnungsaktion-pkv-fuer-beamte": "Öffnungsaktion in der PKV für Beamte",
    "krankenversicherung-fuer-beamtenanwaerter": "Krankenversicherung für Beamtenanwärter",
    "berufsunfaehigkeit-als-student-wie-sinnvoll-ist-die-absicherung": "Berufsunfähigkeit als Student: Wie sinnvoll ist sie?",
    "riester-rente-beamte": "Riester-Rente für Beamte: Lohnt sie sich?",
    "pkv-oeffnungsklausel-nachteile": "PKV-Öffnungsklausel: Diese Nachteile sollten Sie kennen",
    "pkv-fuer-verbeamtete-bundeslaender": "PKV für Lehrer: Unterschiede nach Bundesland",
    "verbeamtung-auf-probe-finanzfehler": "Verbeamtung auf Probe: Diese Finanzfehler vermeiden",
    "pkv-beamte-vorteile": "PKV für Beamte 2026: Die wichtigsten Vorteile",
    "private-krankenversicherung-im-referendariat-lehramt": "Private Krankenversicherung im Lehramtsreferendariat",
    "dienstunfaehigkeitsversicherung-sinnvoll-so-sichern-sie-sich-ab": "Dienstunfähigkeitsversicherung: So sichern Sie sich ab",
    "pension-fuer-lehrer-in-nrw": "Pension für Lehrer in NRW: Ihre Altersvorsorge",
    "kosten-fuer-pensionierte-beamte": "PKV-Kosten für pensionierte Beamte",
    "berufsunfaehigkeitsversicherung-beamte-sinnvoll": "Berufsunfähigkeitsversicherung für Beamte: Sinnvoll?",
    "dienstunfaehigkeitsversicherung-mit-vorerkrankung-ihre-chancen": "DU-Versicherung mit Vorerkrankung: Ihre Chancen",
    "pension-lehrer-in-baden-wuerttemberg": "Pension für Lehrer in Baden-Württemberg",
    "ruhegehalt-bei-dienstunfaehigkeit-tabelle-ueberblick-fuer-beamte": "Ruhegehalt bei Dienstunfähigkeit: Tabelle für Beamte",
    "altersvorsorge-verbeamte-lehrer": "Altersvorsorge für verbeamtete Lehrer",
    "pension-beamte-baden-wuerttemberg": "Pension für Beamte in Baden-Württemberg",
    "berufsunfaehigkeitsversicherung-fuer-lehrer-kosten": "BU-Versicherung für Lehrer: Kosten im Überblick",
    "altersvorsorgedepot-fuer-referendare": "Altersvorsorgedepot 2027 für Referendare",
    "abstrakte-verweisung-bu": "Abstrakte Verweisung bei der BU: Der Fallstrick",
    "krankenversicherung-im-mutterschutz": "Krankenversicherung im Mutterschutz für Lehrerinnen",
}


def apply_title_override(slug: str, title: str, html: str) -> tuple[str, str]:
    override = TITLE_OVERRIDES.get(slug)
    if not override:
        return title, html
    if slug == "krankenversicherung-absolvent":
        # Erste Überschrift im Content (fasst meist den Titel noch einmal
        # zusammen) ebenfalls anpassen, sonst widerspricht sie dem neuen
        # Seitentitel - gilt nur fuer diesen einen Sonderfall, bei den
        # reinen Laengen-Kuerzungen der anderen Titel taucht der alte
        # Titeltext im Content nicht wortgleich als Ueberschrift auf.
        html = re.sub(r"(<h2[^>]*>)[^<]*Absolvent[^<]*(</h2>)", r"\1" + override + r"\2", html, count=1)
        html = html.replace("Krankenversicherung als Absolvent", "Krankenversicherung als Referendar")
    return override, html


DESCRIPTION_MAX = 155

# Dieser Excerpt-Text steckt unveraendert (Copy-Paste-Ueberbleibsel) in 7
# WP-Posts mit voellig anderem Thema (Audit per SEO-Check aufgefallen: Titel
# zu Dienstunfaehigkeit/Pension/Beihilfe, Excerpt zu "PKV fuer Referendare
# in Berlin"). Wird ignoriert, Fallback ist dann der echte Artikeltext.
BROKEN_EXCERPT = "Sie suchen die beste PKV für Referendare in Berlin für 2026?"


def truncate_at_word(text: str) -> str:
    if len(text) <= DESCRIPTION_MAX:
        return text
    truncated = text[:DESCRIPTION_MAX].rsplit(" ", 1)[0]
    return truncated.rstrip(".,;:–-") + "…"


def make_description(post, html: str) -> str:
    excerpt = strip_tags(post["excerpt"]["rendered"]).strip()
    excerpt = re.sub(r"\s+", " ", excerpt)
    if excerpt and BROKEN_EXCERPT not in excerpt:
        return truncate_at_word(excerpt)
    # Kein (brauchbarer) Excerpt - ersten echten <p>-Absatz aus dem
    # bereinigten Artikeltext als Fallback nehmen (nicht die vorangehende
    # Zwischenüberschrift, sonst laufen Überschrift und Absatz ohne
    # Satzzeichen ineinander).
    first_p = re.search(r"<p[^>]*>(.*?)</p>", html, re.S)
    body_text = strip_tags(first_p.group(1)) if first_p else strip_tags(html)
    body_text = re.sub(r"\s+", " ", body_text).strip()
    return truncate_at_word(body_text)


# WP-Kategorienamen sind uneinheitlich grossgeschrieben ("pkv" statt "PKV")
# - Akronyme korrigieren, damit die Filter-Chips auf /ratgeber konsistent
# aussehen.
CATEGORY_NAME_FIXES = {"pkv": "PKV"}

# Auf Wunsch des Nutzers inhaltlich zu grobkoernige/ueberlappende Kategorien
# zusammenlegen, damit auf /ratgeber weniger, aussagekraeftigere Filter-Chips
# stehen (z.B. "Krankenversicherung" ist inhaltlich dasselbe wie "PKV").
CATEGORY_MERGES = {
    "Krankenversicherung": "PKV",
    "Rechner": "Pension",
    "Lehrer": "Beamte",
    "Anwärter": "Referendare",
}


def fix_category_name(name: str) -> str:
    name = CATEGORY_NAME_FIXES.get(name, name)
    return CATEGORY_MERGES.get(name, name)


# Vereinzelte WP-Fehlzuordnungen (per Audit gefunden: Themen-Kategorie passt
# nicht zum Titel/Inhalt, z.B. "PKV" bei einem reinen DU-Artikel) manuell
# korrigieren statt die falsche WP-Kategorie zu uebernehmen.
CATEGORY_OVERRIDES = {
    "dienstunfaehigkeit-bei-berufsanfaengern": ["DU", "Referendare"],
    "dienstunfaehigkeit-berufsunfaehigkeit": ["DU", "BU", "Beamte"],
    "altersvorsorge-referendare": ["Pension", "Referendare"],
}


out_posts = []
skipped = []
for p in posts:
    slug = p["slug"]
    if slug in RESERVED_SLUGS:
        skipped.append(slug)
        continue
    title = clean_text(p["title"]["rendered"])
    cleaned = clean_html(p["content"]["rendered"], title)
    body_html = localize_media_urls(cleaned["html"])
    title, body_html = apply_title_override(slug, title, body_html)
    raw_cats = [fix_category_name(categories[cid]["name"]) for cid in p.get("categories", []) if cid in categories]
    # Nach Normalisierung/Zusammenlegung koennen Duplikate entstehen (z.B. ein
    # Post mit sowohl "PKV" als auch "Krankenversicherung") - deduplizieren,
    # Reihenfolge des ersten Vorkommens beibehalten.
    cats = list(dict.fromkeys(raw_cats))
    # "Allgemein" ist WP-Standardkategorie ohne Aussagekraft, nur behalten wenn einzige.
    non_generic = [c for c in cats if c != "Allgemein"]
    display_cats = non_generic if non_generic else cats
    display_cats = CATEGORY_OVERRIDES.get(slug, display_cats)

    fm = media.get(str(p["featured_media"]), None)

    out_posts.append({
        "slug": slug,
        "title": title,
        "subtitle": clean_text(cleaned["subtitle"]) if cleaned["subtitle"] else cleaned["subtitle"],
        "toc": cleaned["toc"],
        "description": clean_text(make_description(p, body_html)),
        "date": p["date"],
        "modified": p["modified"],
        "categories": display_cats,
        "featuredImage": localize_media_urls(fm["url"]) if fm else None,
        "featuredImageAlt": fm["alt"] if fm else "",
        "html": body_html,
    })

# Jeder Post traegt oft 2+ Kategorien in willkuerlicher WP-Reihenfolge - die
# ERSTE wird aber als alleiniger Badge auf Artikelkarten/Hero angezeigt.
# Nach Gesamt-Haeufigkeit ueber alle Posts sortieren, damit dort immer die
# aussagekraeftigste (statt eine zufaellige Nebenkategorie) vorne steht.
from collections import Counter

category_counts = Counter(c for post in out_posts for c in post["categories"])
for post in out_posts:
    post["categories"].sort(key=lambda c: -category_counts[c])

out_pages = []
for pg in pages:
    title = clean_text(pg["title"]["rendered"])
    cleaned = clean_html(pg["content"]["rendered"], title)
    out_pages.append({
        "slug": pg["slug"],
        "title": title,
        "subtitle": clean_text(cleaned["subtitle"]) if cleaned["subtitle"] else cleaned["subtitle"],
        "html": localize_media_urls(cleaned["html"]),
    })

with open("src/content-posts.json", "w") as f:
    json.dump(out_posts, f, ensure_ascii=False, indent=2)
with open("src/content-pages.json", "w") as f:
    json.dump(out_pages, f, ensure_ascii=False, indent=2)

print(f"Beiträge konvertiert: {len(out_posts)}")
print(f"Übersprungen (Slug-Kollision mit Seite): {skipped}")
print(f"Seiten konvertiert: {len(out_pages)}")
