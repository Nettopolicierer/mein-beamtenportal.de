import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_POSTS, getPost, getRelatedPosts, formatDate, BOOKING_LINK } from "@/lib/content";

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

// Nutzer-Vorgabe: fertiges Grid-Template 1:1 übernommen (siehe Chat), nur mit
// echten Daten befüllt. Kein eigener Header hier - kommt schon global aus
// layout.tsx, ein zweiter würde doppelt erscheinen.
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* 2. HERO SECTION (2-Spalten-Grid) */}
        <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* LINKE SPALTE: Berater-Card (Span 8) */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-8 md:p-8">
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
              {/* Text links */}
              <div className="space-y-4 md:col-span-7">
                <h1 className="text-2xl leading-tight font-bold text-[#0a2540] md:text-3xl">
                  Jetzt kostenfreie Beratung buchen
                </h1>
                <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                  Vereinbaren Sie jetzt Ihre persönliche Beratung mit mir und finden Sie die
                  richtige Vorsorge-Lösung, die wirklich zu Ihnen passt.
                </p>
                <Link
                  href={BOOKING_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-xl bg-[#0a2540] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#081d33]"
                >
                  Termin buchen
                </Link>
              </div>

              {/* Foto rechts INNERHALB der Card */}
              <div className="h-64 min-h-[220px] md:col-span-5 md:h-full">
                <img
                  src="/albert-portrait.webp"
                  alt="Albert Sibert"
                  className="h-full w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>

          {/* RECHTE SPALTE: Inhaltsverzeichnis (Span 4) */}
          <div className="rounded-3xl border border-gray-100 bg-[#f3f6f9] p-6 lg:col-span-4 md:p-8">
            <h2 className="mb-4 text-xl font-bold text-[#0a2540]">Inhalt</h2>
            <ul className="space-y-3 text-sm font-medium text-gray-700">
              {post.toc.map((entry) => (
                <li key={entry.href}>
                  <a href={entry.href} className="block transition hover:text-blue-600">
                    {entry.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. DUNKELBLAUES BANNER */}
        <section className="rounded-3xl bg-[#0a2540] p-8 text-white shadow-lg md:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-7">
              <h2 className="text-2xl leading-tight font-bold md:text-3xl">{post.title}</h2>
            </div>
            <div className="rounded-2xl bg-white p-6 text-center text-gray-900 shadow-md lg:col-span-5">
              <h3 className="mb-3 text-lg font-bold">Kostenfreie, individuelle Beratung</h3>
              <Link
                href={BOOKING_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 block w-full rounded-xl bg-[#0a2540] px-4 py-3 text-sm font-bold tracking-wider text-white uppercase transition hover:bg-[#081d33]"
              >
                Termin buchen
              </Link>
              <p className="text-xs font-medium text-gray-500">100% kostenfrei &amp; unverbindlich</p>
            </div>
          </div>
        </section>

        {/* 4. HAUPTARTIKEL CONTENT */}
        <article
          className="prose mx-auto max-w-4xl space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-10 prose-headings:text-[#0a2540] prose-a:text-blue-700"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {related.length > 0 && (
          <section className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-2xl font-bold text-[#0a2540]">
              Diese Beiträge könnten Sie ebenfalls interessieren
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/${r.slug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors hover:border-blue-200"
                >
                  <span className="text-xs text-gray-500">{formatDate(r.date)}</span>
                  <h3 className="text-base leading-snug font-semibold text-[#0a2540] group-hover:text-blue-700">
                    {r.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-gray-500">{r.description}</p>
                  <span className="text-sm font-medium text-blue-700 group-hover:underline">
                    mehr erfahren →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mx-auto max-w-4xl">
          <Link href="/ratgeber" className="text-sm font-medium text-blue-700 hover:underline">
            ← Zurück zum Ratgeber
          </Link>
        </div>
      </main>
    </div>
  );
}
