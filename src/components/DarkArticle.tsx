import Link from "next/link";
import { PensionsLueckenRechner } from "@/components/PensionsLueckenRechner";
import { formatDate, type Post } from "@/lib/content";

// Ruhige Artikelvorlage in Navy/Gold: keine Stockfotos, keine Buchungs-Buttons, ein einziger
// Lead-Pfad. Der Rechner mit Formular wird an der Stelle <!--LEAD--> im Artikeltext eingesetzt.
export function DarkArticle({ post, related }: { post: Post; related: Post[] }) {
  const [before, after] = post.html.split("<!--LEAD-->");

  return (
    <article className="bg-[#0a1128] text-[#cbd5e1]">
      <header className="border-b border-[#cbd5e1]/20 bg-gradient-to-b from-[#0f172a] to-[#0a1128]">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            {post.categories.map((c) => (
              <span key={c} className="rounded-full border border-[#eab308]/50 px-2.5 py-0.5 font-medium text-[#eab308]">
                {c}
              </span>
            ))}
          </div>
          <h1 className="font-heading text-3xl font-bold break-words text-white sm:text-4xl">{post.title}</h1>
          {post.subtitle && <p className="mt-3 text-lg text-[#cbd5e1]">{post.subtitle}</p>}
          <p className="mt-4 text-sm text-[#cbd5e1]/80">
            Von Albert Sibert, Versicherungsvertreter (§ 34d GewO) · Aktualisiert am {formatDate(post.modified)}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 lg:grid-cols-[1fr_240px]">
        <div className="min-w-0">
          <div className="dark-article" dangerouslySetInnerHTML={{ __html: before }} />
          {after !== undefined && (
            <>
              <PensionsLueckenRechner />
              <div className="dark-article" dangerouslySetInnerHTML={{ __html: after }} />
            </>
          )}
        </div>

        <aside className="hidden lg:block">
          <nav className="sticky top-24 rounded-xl border border-[#cbd5e1]/20 bg-[#0f172a] p-5">
            <p className="font-heading mb-2 text-sm font-bold text-white">Inhalt</p>
            <ul className="flex flex-col gap-1.5 text-xs">
              {post.toc.map((e) => (
                <li key={e.href}>
                  <a href={e.href} className="block text-[#cbd5e1] hover:text-[#eab308]">
                    {e.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      {related.length > 0 && (
        <div className="border-t border-[#cbd5e1]/20">
          <div className="mx-auto max-w-4xl px-6 py-12">
            <h2 className="font-heading mb-4 text-xl font-bold text-white">Weiterlesen</h2>
            <ul className="flex flex-col gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/${r.slug}`} className="text-[#eab308] underline underline-offset-4">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/ratgeber" className="mt-6 inline-block text-sm text-[#cbd5e1] hover:text-[#eab308]">
              ← Zurück zum Ratgeber
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}
