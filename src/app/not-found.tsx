import Link from "next/link";
import Image from "next/image";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
      <Image
        src="/hero-illustration.png"
        alt=""
        width={180}
        height={180}
        className="mb-6 opacity-90"
        unoptimized
      />
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <SearchX className="size-6" />
      </span>
      <h1 className="font-heading mb-3 text-2xl font-bold text-primary sm:text-3xl">
        Diese Seite gibt es nicht (mehr)
      </h1>
      <p className="mb-8 text-mediumdark">
        Der Link ist entweder veraltet oder es hat sich ein Tippfehler eingeschlichen. Im Ratgeber
        finden Sie garantiert den passenden Artikel zu Beihilfe, PKV, Pension oder
        Dienstunfähigkeit.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Zur Startseite
        </Link>
        <Link
          href="/ratgeber"
          className="rounded-lg border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Zum Ratgeber
        </Link>
      </div>
    </div>
  );
}
