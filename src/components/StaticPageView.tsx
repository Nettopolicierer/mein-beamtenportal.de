import { notFound } from "next/navigation";
import { getPage } from "@/lib/content";

export function StaticPageView({ slug }: { slug: string }) {
  const page = getPage(slug);
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading mb-8 text-3xl font-bold tracking-tight text-primary">{page.title}</h1>
      <div
        className="prose max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </article>
  );
}
