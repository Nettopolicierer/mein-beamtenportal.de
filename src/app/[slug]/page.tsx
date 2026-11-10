import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PensionsLueckenRechner } from "@/components/PensionsLueckenRechner";
import { articleJsonLd, jsonLdString } from "@/lib/jsonld";
import { KURZANTWORTEN } from "@/lib/kurzantworten";
import { quellenFor } from "@/lib/quellen";
import { RechnerStickyBar } from "@/components/RechnerStickyBar";
import { GRUPPEN, type Gruppe } from "@/lib/pension-calc";
import { ALL_POSTS, getPost, formatDate, getRelatedPosts, BOOKING_LINK } from "@/lib/content";

// Hinweis auf den BU-Check mitten im Artikel - nur bei Artikeln zu Pension, Dienst-
// oder Berufsunfaehigkeit (Kategorie BU/DU/Pension oder Thema in Titel, Slug bzw.
// Beschreibung). Als HTML-String vor die 3. Zwischenueberschrift gesetzt (statt
// den Artikel zu teilen), damit die verschachtelten Wrapper-Divs der migrierten
// Artikel intakt bleiben.
const CTA_CATEGORIES = ["Pension", "BU", "DU"];
const CTA_TOPIC = /dienstunf|berufsunf/i;

// Artikel mit Pensions-Lückenrechner (Marker <!--LEAD-->) bekommen keinen BU-Check-Hinweis:
// Der Rechner ist dort der einzige Lead-Pfad.
const LEAD_MARKER = "<!--LEAD-->";

// Standard-Besoldungsgruppe des Rechners aus dem Artikel-Slug ("...pension-bei-a9" -> A9), sonst A13.
function defaultGruppeFor(slug: string): Gruppe {
  const m = /pension-bei-a(\d+)/.exec(slug);
  const g = m ? (`A${m[1]}` as Gruppe) : "A13";
  return (GRUPPEN as string[]).includes(g) ? g : "A13";
}

function withBuCheckCta(post: { slug: string; title: string; description?: string; categories: string[]; html: string }) {
  if (post.html.includes(LEAD_MARKER)) return post.html;
  const relevant =
    post.categories.some((c) => CTA_CATEGORIES.includes(c)) ||
    CTA_TOPIC.test(`${post.title} ${post.slug} ${post.description ?? ""}`);
  if (!relevant) return post.html;
  const box = `<div class="not-prose my-8 rounded-2xl border border-mediumlight/60 bg-base p-6"><p class="font-heading mb-1 text-lg font-bold text-primary">Und wenn Sie vor der Pension dienstunfähig werden?</p><p class="mb-4 text-sm text-mediumdark">Bei vorzeitiger Dienstunfähigkeit fällt die Versorgung oft deutlich niedriger aus. Machen Sie den kostenfreien BU-Check in einer Minute.</p><a href="/bu-check?src=${encodeURIComponent(post.slug)}" class="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">Kostenfreien BU-Check starten</a></div>`;
  const headings = [...post.html.matchAll(/<h2[\s>]/g)];
  const at = headings[2]?.index;
  return at === undefined ? post.html + box : post.html.slice(0, at) + box + post.html.slice(at);
}

// Hinweiskarte zum Pensionsrechner vor der 2. Zwischenüberschrift (als HTML-String wie der BU-Check-Hinweis,
// damit verschachtelte Wrapper-Divs der migrierten Artikel intakt bleiben). Artikel mit eingebettetem Rechner
// verlinken per Anker auf ihn, alle anderen auf die Seite /pensionsrechner.
// Artikel, bei denen die Checkliste im Vordergrund steht: Einsteiger (Referendare, Anwärter, Berufsanfänger, junge Beamte)
// sowie Themen Dienstunfähigkeit, Berufsunfähigkeit, Beihilfe, PKV und Krankheit.
const EINSTEIGER =
  /referendar|anw(ä|ae)rter|berufsanf|berufseinsteig|einsteiger|junge[nr]? beamte|studenten|studium|verbeamtung|dienstunf|berufsunf|bu-|du-|beihilfe|pkv|krankenversicherung|krankheit/i;
function isEinsteiger(post: { slug: string; title: string; categories: string[] }) {
  return post.categories.includes("Referendare") || EINSTEIGER.test(`${post.slug} ${post.title}`);
}

// Hinweiskarte vor der 2. Zwischenüberschrift (als HTML-String wie der BU-Check-Hinweis, damit verschachtelte
// Wrapper-Divs der migrierten Artikel intakt bleiben). Einsteiger-Artikel führen zur Checkliste, alle anderen zum
// Pensionsrechner (Artikel mit eingebettetem Rechner per Anker, sonst Seite /pensionsrechner).
function withHinweisCard(html: string, mode: "checkliste" | "rechner", rechnerHref: string) {
  const btn = (href: string, label: string) =>
    `<a href="${href}" class="inline-block rounded-lg px-5 py-2.5 text-sm font-semibold" style="background:#1E5FA8;color:#FFFFFF;text-decoration:none">${label}</a>`;
  const head =
    mode === "checkliste"
      ? { h: "Gut abgesichert in den Dienst starten", t: "Die 360°-Beamten-Versorgungs-Checkliste: Beihilfe, PKV, Dienstunfähigkeit und Vorsorge auf zwei Seiten. Kostenlos als PDF.", b: btn("/checkliste", "Kostenlose Checkliste anfordern") }
      : { h: "Wie groß ist Ihre Pensionslücke?", t: "Berechnen Sie in einer Minute, was Ihnen im Ruhestand netto fehlt. Kostenlos, auf Wunsch mit PDF-Auswertung.", b: btn(rechnerHref, "Pensionslücke berechnen") };
  const card = `<div class="not-prose my-8 rounded-2xl border p-6" style="border-color:#C9DCF0;background:#EAF2FB"><p class="font-heading mb-1 text-lg font-bold" style="color:#002855">${head.h}</p><p class="mb-4 text-sm" style="color:#334155">${head.t}</p>${head.b}</div>`;
  const at = [...html.matchAll(/<h2[\s>]/g)][1]?.index;
  return at === undefined ? html : html.slice(0, at) + card + html.slice(at);
}

export function generateStaticParams() {
  return ALL_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/${post.slug}`,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);
  const hasWidget = post.html.includes(LEAD_MARKER);
  const einsteiger = !hasWidget && isEinsteiger(post);

  return (
    <article data-rechner-bar>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(articleJsonLd(post)) }} />
      <RechnerStickyBar href={einsteiger ? "/checkliste" : hasWidget ? "#pl-rechner" : "/pensionsrechner"} label={einsteiger ? "Kostenlose Checkliste anfordern" : "Pensionslücke berechnen"} hasWidget={hasWidget} />
      {/* Hero: Hintergrundbild + Titel + Untertitel + CTAs, wie im Original */}
      <div className="relative">
        {post.featuredImage && (
          <div
            // Eine einzige feste Position (center/top) fuer alle Titelbilder
            // passt nie zu allen - je nachdem wo die Person im Foto steht,
            // schneidet das den Kopf ab oder laesst zu viel Leerraum. Statt-
            // dessen migration/detect_hero_focus.py: Gesichtserkennung pro
            // Bild, "featuredImagePosition" ist der individuell berechnete
            // CSS-Fokuspunkt (Augenhoehe der erkannten Gesichter). Bilder
            // ohne Person fallen auf eine leicht obere Standardposition zurueck.
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: `url(${post.featuredImage})`,
              backgroundPosition: post.featuredImagePosition || "50% 22%",
            }}
          />
        )}
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/70">
            {post.categories.map((cat) => (
              <span key={cat} className="rounded-full bg-white/15 px-2.5 py-0.5 font-medium">
                {cat}
              </span>
            ))}
            <span>{formatDate(post.date)}</span>
          </div>
          <h1 className="font-heading mb-4 text-3xl font-bold break-words text-white sm:text-4xl">
            {post.title}
          </h1>
          {post.subtitle && <p className="mb-8 text-lg break-words text-white/85">{post.subtitle}</p>}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90"
            >
              Kostenfreie Beratung anfordern
            </Link>
            <Link
              href="#content-start"
              className="rounded-lg border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Zum Ratgeber
            </Link>
          </div>
        </div>
      </div>

      {/* Trust-Badge (ProvenExpert), kompakt direkt unter dem Hero - das
          volle Testimonial-Grid sitzt stattdessen auf der Startseite, wo es
          nicht vom eigentlichen Artikeltext ablenkt/wegnimmt. */}
      <div className="border-b border-mediumlight/40 bg-white py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-3 px-6">
          <Image src="/proven-expert.webp" alt="ProvenExpert" width={32} height={32} unoptimized />
          <Image src="/stars.svg" alt="" width={90} height={16} unoptimized />
          <span className="text-sm text-mediumdark">4,9/5 · echte Kundenstimmen</span>
        </div>
      </div>

      {/* Artikeltext + sticky Sidebar (Inhalt + Buchungs-CTA) */}
      <div
        id="content-start"
        className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1fr_260px]"
      >
        <div className="prose prose-sm max-w-none leading-normal prose-headings:font-heading prose-headings:text-primary prose-p:leading-relaxed prose-a:text-primary sm:prose-base">
          <p className="not-prose mb-5 text-sm text-mediumdark">
            Von <Link href="/ueber-uns" className="font-semibold text-primary underline-offset-2 hover:underline">Albert Sibert</Link>, Finanzberater (§ 34d / § 34f GewO) · Zuletzt aktualisiert am {formatDate(post.modified)}
          </p>
          {KURZANTWORTEN[post.slug] && (
            <div className="not-prose mb-6 rounded-xl border border-[#C9DCF0] bg-[#EAF2FB] p-4">
              <p className="mb-1 text-xs font-semibold tracking-widest text-[#1E5FA8] uppercase">Kurz beantwortet</p>
              <p className="text-sm text-[#0F172A]">{KURZANTWORTEN[post.slug]}</p>
            </div>
          )}
          {(() => {
            // Marker <!--LEAD--> im Artikeltext: hier sitzt der Pensions-Lückenrechner.
            const body = hasWidget ? withBuCheckCta(post) : withHinweisCard(withBuCheckCta(post), einsteiger ? "checkliste" : "rechner", "/pensionsrechner");
            const [before, after] = body.split(LEAD_MARKER);
            return (
              <>
                <div dangerouslySetInnerHTML={{ __html: before }} />
                {after !== undefined && (
                  <>
                    <PensionsLueckenRechner defaultGruppe={defaultGruppeFor(post.slug)} />
                    <div dangerouslySetInnerHTML={{ __html: after }} />
                  </>
                )}
              </>
            );
          })()}

          {quellenFor(post).length > 0 && (
            <div className="not-prose mt-8 rounded-xl bg-base p-4 text-sm text-mediumdark">
              <p className="mb-1 font-semibold text-primary">Rechtsgrundlagen (Bundesrecht, zur Orientierung)</p>
              <p>
                {quellenFor(post).map((q, i) => (
                  <span key={q.url}>
                    {i > 0 && " · "}
                    <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">{q.label}</a>
                  </span>
                ))}
              </p>
              <p className="mt-1 text-xs">In den Ländern gelten teils abweichende Regelungen. Keine individuelle Rechts- oder Steuerberatung.</p>
            </div>
          )}

          {/* Die aus WordPress migrierten Artikel haben "Über den Autor" +
              die Buchungs-CTA-Box schon fest im html eingebettet - neue
              Autopilot-Artikel nicht zwingend (und die Sidebar-CTA ist auf
              Mobile komplett unsichtbar, "hidden lg:block"). Ohne diese Box
              fehlt auf kleinen Bildschirmen jeder Buchungs-CTA im Artikel.
              Deshalb hier als Fallback ergaenzen, wenn der Artikeltext sie
              nicht schon selbst enthaelt. */}
          {!post.html.includes("Über den Autor") && !post.html.includes("Über mich") && (
            <div className="team-box">
              <div>
                <img alt="Albert Sibert" className="profile-photo" src="/albert-portrait.webp" />
                <div>
                  <h4>Albert Sibert</h4>
                  <p>Versicherungsexperte</p>
                  <ul>
                    <li>
                      <a href="https://www.linkedin.com/in/albert-sibert-86225a231/">LinkedIn</a>
                    </li>
                    <li>
                      <a href="https://wa.me/4917692609041">WhatsApp</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <h2>Über mich</h2>
                <p>
                  Unabhängiger Finanzberater mit Schwerpunkt auf Beamte, Referendare und Anwärter im
                  öffentlichen Dienst. Seit 2019 begleite ich Sie bei Beihilfe, PKV, Dienstunfähigkeit
                  und Altersvorsorge – mit über 250 Partnergesellschaften zur Auswahl.
                </p>
              </div>
            </div>
          )}
          {!post.html.includes("Kostenfreie, individuelle Beratung") && (
            <div className="team-box">
              <div>
                <h2>
                  <strong>Kostenfreie, individuelle Beratung</strong>
                </h2>
                <p>100% kostenfrei &amp; unverbindlich</p>
              </div>
              <a className="btn" href={BOOKING_LINK} target="_blank" rel="noopener noreferrer">
                Termin buchen
              </a>
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 z-10 flex flex-col gap-4">
            {(() => {
              // Der erste TOC-Eintrag wiederholt meist nur den Artikeltitel
              // und verlinkt auf eine Ueberschrift, die beim Bereinigen als
              // Hero-Duplikat entfernt wurde - Klick fuehrt ins Leere, daher
              // raus aus der Liste.
              const visibleToc = post.toc.filter((entry) => entry.text.trim() !== post.title.trim());
              if (visibleToc.length === 0) return null;
              return (
              <nav className="rounded-xl bg-base p-5">
                <p className="font-heading mb-2 text-sm font-bold text-primary">Inhalt</p>
                <ul className="flex flex-col gap-1.5 text-xs">
                  {visibleToc.map((entry) => (
                    <li key={entry.href}>
                      <a
                        href={entry.href}
                        title={entry.text}
                        className="block truncate text-mediumdark hover:text-primary"
                      >
                        {entry.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              );
            })()}

            <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-5 text-center shadow-lg shadow-primary/20">
              <p className="font-heading mb-4 text-base font-bold text-white">
                Kostenfreie, individuelle Beratung
              </p>
              <Link
                href={BOOKING_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 block rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
              >
                Termin buchen
              </Link>
              <p className="text-xs text-white/70">100% kostenfrei &amp; unverbindlich</p>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <div className="bg-base">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-heading mb-8 text-2xl font-bold text-primary">
              Diese Beiträge könnten Sie ebenfalls interessieren
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/${r.slug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-mediumlight/40 bg-white p-6 transition-colors hover:border-primary/30"
                >
                  <span className="text-xs text-mediumdark">{formatDate(r.date)}</span>
                  <h3 className="font-heading text-base leading-snug font-semibold text-gray-900">
                    {r.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-mediumdark">{r.description}</p>
                  <span className="text-sm font-medium text-gray-900 group-hover:underline">
                    mehr erfahren →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/ratgeber" className="text-sm font-medium text-primary hover:underline">
          ← Zurück zum Ratgeber
        </Link>
      </div>
    </article>
  );
}
