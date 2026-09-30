"""SEO-Check für alle Blogartikel, angelehnt an die Regeln von RankMath
(WordPress-Plugin) - das Aequivalent gibt es hier nicht mehr, seit die
Seite von WordPress auf Next.js migriert ist. Liest src/content-posts.json,
prueft pro Artikel eine Reihe von SEO-Basisregeln und schreibt das Ergebnis
als Markdown-Tabelle in $GITHUB_STEP_SUMMARY (GitHub Actions Job Summary)
bzw. bei lokalem Aufruf auf stdout.

Aufruf lokal: python3 scripts/seo_check.py
"""
import json
import os
import re
import sys

TITLE_MIN, TITLE_MAX = 40, 70
DESCRIPTION_MIN, DESCRIPTION_MAX = 70, 160
WORDCOUNT_MIN = 300


def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html)


def check_post(post: dict) -> list[str]:
    issues = []
    title = post.get("title", "")
    description = post.get("description", "")
    html = post.get("html", "")

    if not (TITLE_MIN <= len(title) <= TITLE_MAX):
        issues.append(f"Titel {len(title)} Zeichen (Ziel {TITLE_MIN}-{TITLE_MAX})")

    if not description:
        issues.append("Meta-Description fehlt")
    elif not (DESCRIPTION_MIN <= len(description) <= DESCRIPTION_MAX):
        issues.append(
            f"Meta-Description {len(description)} Zeichen (Ziel {DESCRIPTION_MIN}-{DESCRIPTION_MAX})"
        )

    if not post.get("featuredImage"):
        issues.append("Kein Featured Image")
    elif not (post.get("featuredImageAlt") or "").strip():
        issues.append("Featured Image ohne Alt-Text")

    if "<h2" not in html:
        issues.append("Keine H2-Überschrift (Struktur/Lesbarkeit)")
    if "<h1" in html:
        issues.append("H1 im Artikeltext (dupliziert den Seitentitel)")

    # Migrierte Artikel verlinken sich per voller Domain-URL statt relativ
    # (Original aus WordPress-Export) - beides zaehlt als interner Link.
    internal_links = len(
        re.findall(r'href="(?:/(?!/)|https?://(?:www\.)?mein-beamtenportal\.de/)[^"]*"', html)
    )
    if internal_links == 0:
        issues.append("Keine internen Verlinkungen")

    word_count = len(strip_tags(html).split())
    if word_count < WORDCOUNT_MIN:
        issues.append(f"Nur {word_count} Wörter (dünner Inhalt, Ziel >{WORDCOUNT_MIN})")

    if not post.get("categories"):
        issues.append("Keine Kategorie zugewiesen")

    return issues


def ampel(issue_count: int) -> str:
    if issue_count == 0:
        return "🟢"
    if issue_count <= 2:
        return "🟡"
    return "🔴"


def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(repo_root, "src", "content-posts.json"), encoding="utf-8") as f:
        posts = json.load(f)

    results = []
    for post in posts:
        issues = check_post(post)
        results.append((post["slug"], post["title"], issues))

    # Schlechteste zuerst, damit Handlungsbedarf oben steht statt
    # zwischen 140 gruenen Artikeln unterzugehen.
    results.sort(key=lambda r: -len(r[2]))

    n_green = sum(1 for _, _, issues in results if len(issues) == 0)
    n_yellow = sum(1 for _, _, issues in results if 1 <= len(issues) <= 2)
    n_red = sum(1 for _, _, issues in results if len(issues) >= 3)

    lines = []
    lines.append("## SEO-Check\n")
    lines.append(f"🟢 {n_green}  ·  🟡 {n_yellow}  ·  🔴 {n_red}  (von {len(posts)} Artikeln)\n")
    lines.append("| | Artikel | Hinweise |")
    lines.append("|---|---|---|")
    for slug, title, issues in results:
        issue_text = "; ".join(issues) if issues else "–"
        lines.append(f"| {ampel(len(issues))} | [{title}](/{slug}) | {issue_text} |")

    output = "\n".join(lines)
    print(output)

    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as f:
            f.write(output + "\n")

    # Nicht-blockierend: warnt nur, blockiert keinen Merge/Deploy wegen
    # Stil-Hinweisen. Bei Bedarf hier exit(1) bei harten Fehlern ergaenzen.
    sys.exit(0)


if __name__ == "__main__":
    main()
