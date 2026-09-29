"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Post } from "@/lib/content";
import { formatDate } from "@/lib/content";

export function PostList({ posts }: { posts: Post[] }) {
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const p of posts) {
      for (const c of p.categories) {
        if (!seen.includes(c)) seen.push(c);
      }
    }
    return seen.sort();
  }, [posts]);

  const [active, setActive] = useState<string | null>(null);
  const visible = active ? posts.filter((p) => p.categories.includes(active)) : posts;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            active === null ? "bg-primary text-white" : "bg-base text-mediumdark hover:bg-mediumlight/30"
          }`}
        >
          Alle ({posts.length})
        </button>
        {categories.map((cat) => {
          const count = posts.filter((p) => p.categories.includes(cat)).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active === cat ? "bg-primary text-white" : "bg-base text-mediumdark hover:bg-mediumlight/30"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {visible.map((post) => (
          <Link
            key={post.slug}
            href={`/${post.slug}`}
            className="group flex flex-col gap-3 rounded-2xl border border-mediumlight/40 bg-base p-6 transition-all hover:border-primary/30"
          >
            <div className="flex items-center gap-2 text-xs text-mediumdark">
              <span>{post.categories[0] ?? "Ratgeber"}</span>
              <span>·</span>
              <span>{formatDate(post.date)}</span>
            </div>
            <h2 className="text-base leading-snug font-semibold text-primary group-hover:opacity-80">
              {post.title}
            </h2>
            <p className="line-clamp-3 text-sm text-mediumdark">{post.description}</p>
          </Link>
        ))}

        {visible.length === 0 && (
          <p className="col-span-2 py-8 text-center text-sm text-mediumdark/70">
            Noch keine Beiträge in dieser Kategorie.
          </p>
        )}
      </div>
    </div>
  );
}
