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
      {/* Titelbereich: kompakt, kein großes Bild-Band */}
      <div className="mx-auto max-w-4xl px-6 pt-12 pb-6 text-center">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs text-mediumdark">
          {post.categories.map((cat) => (
            <span key={cat} className="rounded-full bg-base px-2.5 py-0.5 font-medium text-primary">
              {cat}
            </span>
          ))}
          <span>{formatDate(post.date)}</span>
        </div>
        <h1 className="font-heading mb-4 text-3xl font-bold text-primary sm:text-4xl">{post.title}</h1>
        {post.subtitle && <p className="mb-6 text-lg text-mediumdark">{post.subtitle}</p>}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={BOOKING_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Kostenfreie Beratung anfordern
          </Link>
          <Link
            href="#content-start"
            className="rounded-lg border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            Zum Ratgeber
          </Link>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Image src="/proven-expert.webp" alt="ProvenExpert" width={28} height={28} unoptimized />
          <Image src="/stars.svg" alt="" width={80} height={14} unoptimized />
          <span className="text-xs text-mediumdark">5.0 Stars | 8 reviews</span>
        </div>
      </div>

      {/* Obere Sektion: Foto-CTA-Karte + Inhaltsverzeichnis nebeneinander */}
      <div id="content-start" className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-10 lg:grid-cols-12">
        <div className="overflow-hidden rounded-3xl bg-base shadow-sm lg:col-span-8">
          <div className="grid h-full sm:grid-cols-2">
            <div className="flex flex-col justify-center gap-4 p-8">
              <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
                Jetzt kostenfreie Beratung buchen
              </h2>
              <p className="text-sm text-mediumdark">
                Vereinbaren Sie jetzt Ihre persönliche Beratung mit mir und finden Sie die richtige
                Vorsorge-Lösung, die wirklich zu Ihnen passt.
              </p>
              <Link
                href={BOOKING_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Termin buchen
              </Link>
            </div>
            <div className="relative hidden min-h-[260px] sm:block">
              <Image
                src="/albert-portrait.webp"
                alt="Albert Sibert"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>

        {post.toc.length > 0 && (
          <aside className="lg:col-span-4">
            <nav className="rounded-3xl bg-base p-6">
              <p className="font-heading mb-3 text-sm font-bold text-primary">Inhalt</p>
              <ul className="flex flex-col gap-2 text-sm">
                {post.toc.map((entry) => (
                  <li key={entry.href}>
                    <a href={entry.href} className="text-mediumdark hover:text-primary">
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>

      {/* Artikeltext + sticky Buchungs-CTA (ohne TOC, das steht bereits oben) */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-16 lg:grid-cols-[1fr_260px]">
        <div
          className="prose max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl bg-primary p-5 text-center">
            <p className="font-heading mb-4 text-base font-bold text-white">
              Kostenfreie, individuelle Beratung
            </p>
            <Link
              href={BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 block rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-white/90"
            >
              Termin buchen
            </Link>
            <p className="text-xs text-white/70">100% kostenfrei &amp; unverbindlich</p>
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
                  <h3 className="font-heading text-base leading-snug font-semibold text-primary group-hover:opacity-80">
                    {r.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-mediumdark">{r.description}</p>
                  <span className="text-sm font-medium text-primary group-hover:underline">
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
