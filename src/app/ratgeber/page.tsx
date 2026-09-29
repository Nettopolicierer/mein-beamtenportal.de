import type { Metadata } from "next";
import { SORTED_POSTS } from "@/lib/content";
import { PostList } from "./PostList";

export const metadata: Metadata = {
  title: "Ratgeber",
  description:
    "Alle Ratgeber-Beiträge rund um Beihilfe, Pension, PKV und Dienstunfähigkeit für Beamtinnen und Beamte.",
  alternates: { canonical: "/ratgeber" },
};

export default function RatgeberPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Ratgeber</p>
      <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight text-primary">
        Wissen rund um Beihilfe, Pension &amp; PKV.
      </h1>
      <p className="mb-12 max-w-2xl text-mediumdark">
        {SORTED_POSTS.length} Beiträge für Beamtinnen, Beamte, Referendare und Anwärter im
        öffentlichen Dienst.
      </p>

      <PostList posts={SORTED_POSTS} />
    </div>
  );
}
