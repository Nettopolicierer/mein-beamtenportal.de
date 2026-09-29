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
      <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {post.categories.map((cat) => (
          <span key={cat} className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
            {cat}
          </span>
        ))}
        <span>{formatDate(post.date)}</span>
      </div>

      <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{post.title}</h1>

      {post.featuredImage && (
        <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
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
        className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-blue-700"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <div className="mt-14 border-t border-slate-100 pt-8">
        <Link href="/ratgeber" className="text-sm font-medium text-blue-700 hover:underline">
          ← Zurück zum Ratgeber
        </Link>
      </div>
    </article>
  );
}
