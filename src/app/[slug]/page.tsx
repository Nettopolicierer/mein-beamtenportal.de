import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_POSTS, getPost, formatDate, BOOKING_LINK } from "@/lib/content";

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

      <div id="content-start" className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_260px]">
        <div
          className="prose max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {post.toc.length > 0 && (
          <aside className="hidden lg:block">
            <nav className="sticky top-24 rounded-xl bg-base p-5">
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

      <div className="mx-auto max-w-4xl border-t border-mediumlight/40 px-6 pb-16">
        <Link href="/ratgeber" className="text-sm font-medium text-primary hover:underline">
          ← Zurück zum Ratgeber
        </Link>
      </div>
    </article>
  );
}
