import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ALL_POSTS, getPost, formatDate, getRelatedPosts, BOOKING_LINK } from "@/lib/content";

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

  return (
    <article>
      {/* Hero: Hintergrundbild + Titel + Untertitel + CTAs, wie im Original */}
      <div className="relative">
        {post.featuredImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.featuredImage})` }}
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
          <h1 className="font-heading mb-4 text-3xl font-bold text-white sm:text-4xl">{post.title}</h1>
          {post.subtitle && <p className="mb-8 text-lg text-white/85">{post.subtitle}</p>}
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
          <div dangerouslySetInnerHTML={{ __html: post.html }} />

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
              <h2>
                <strong>Kostenfreie, individuelle Beratung</strong>
              </h2>
              <div>
                <a className="btn" href={BOOKING_LINK} target="_blank" rel="noopener noreferrer">
                  Termin buchen
                </a>
              </div>
              <p>100% kostenfrei &amp; unverbindlich</p>
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
