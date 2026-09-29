import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ALL_POSTS, getPost, formatDate } from "@/lib/content";

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
    <article className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-mediumdark">
        {post.categories.map((cat) => (
          <span key={cat} className="rounded-full bg-base px-2.5 py-0.5 font-medium text-primary">
            {cat}
          </span>
        ))}
        <span>{formatDate(post.date)}</span>
      </div>

      <h1 className="font-heading mb-8 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        {post.title}
      </h1>

      {post.featuredImage && (
        <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-xl bg-base">
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        </div>
      )}

      <div
        className="prose max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <div className="mt-14 border-t border-mediumlight/40 pt-8">
        <Link href="/ratgeber" className="text-sm font-medium text-primary hover:underline">
          ← Zurück zum Ratgeber
        </Link>
      </div>
    </article>
  );
}
