import Link from "next/link";
import { SORTED_POSTS, getAllCategories, formatDate } from "@/lib/content";

export default function Home() {
  const latest = SORTED_POSTS.slice(0, 6);
  const categories = getAllCategories();

  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="mb-3 text-xs font-semibold tracking-widest text-blue-700 uppercase">
          Für Beamtinnen &amp; Beamte
        </p>
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance text-slate-900 sm:text-5xl">
          Beihilfe, Pension &amp; PKV für Beamte – verständlich erklärt.
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-slate-500">
          Unabhängige Beratung für Beamtinnen, Beamte, Referendare und Anwärter im öffentlichen
          Dienst.
        </p>
        <Link
          href="/ratgeber"
          className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Ratgeber entdecken
        </Link>
      </section>

      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">Neueste Beiträge</h2>
            <Link href="/ratgeber" className="text-sm font-medium text-blue-700 hover:underline">
              Alle Beiträge →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <Link
                key={post.slug}
                href={`/${post.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:border-blue-200"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{post.categories[0] ?? "Ratgeber"}</span>
                  <span>·</span>
                  <span>{formatDate(post.date)}</span>
                </div>
                <h3 className="text-base leading-snug font-semibold text-slate-900 group-hover:text-blue-700">
                  {post.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">Themen</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-medium text-slate-600">
              {cat}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
