import { notFound } from "next/navigation";
import { getPage } from "@/lib/content";

export function StaticPageView({ slug }: { slug: string }) {
  const page = getPage(slug);
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">{page.title}</h1>
      <div
        className="prose prose-slate max-w-none prose-a:text-blue-700"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </article>
  );
}
