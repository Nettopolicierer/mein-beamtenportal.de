import type { Metadata } from "next";
import Link from "next/link";
import { SORTED_POSTS, BOOKING_LINK } from "@/lib/content";
import { PostList } from "./PostList";
import { TestimonialStrip } from "@/components/TestimonialStrip";

export const metadata: Metadata = {
  title: "Ratgeber",
  description:
    "Alle Ratgeber-Beiträge rund um Beihilfe, Pension, PKV und Dienstunfähigkeit für Beamtinnen und Beamte.",
  alternates: { canonical: "/ratgeber" },
};

export default function RatgeberPage() {
  return (
    <div>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
              Mein Ratgeber
            </p>
            <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight text-primary">
              Umfassendes Finanz-&nbsp;und Versicherungswissen.
            </h1>
            <p className="max-w-2xl text-mediumdark">
              {SORTED_POSTS.length} Beiträge für Beamtinnen, Beamte, Referendare und Anwärter im
              öffentlichen Dienst.
            </p>
          </div>
          <Link
            href={BOOKING_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Kostenfreies Erstgespräch
          </Link>
        </div>

        <PostList posts={SORTED_POSTS} />
      </div>

      <TestimonialStrip />
    </div>
  );
}
