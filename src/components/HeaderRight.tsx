"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/MobileNav";

export function HeaderRight({
  nav,
  bookingLink,
}: {
  nav: { href: string; label: string }[];
  bookingLink: string;
}) {
  const pathname = usePathname();

  // Werbe-Landingpage: keine Navigation, nur ein Weg - zum Check.
  if (pathname === "/bu-check") {
    return (
      <a
        href="#check"
        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 sm:px-5 sm:py-2.5 sm:text-sm"
      >
        Zum BU-Check
      </a>
    );
  }

  return (
    <>
      <nav className="hidden items-center gap-8 text-sm font-medium tracking-wide text-primary uppercase sm:flex">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="hover:opacity-70">
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={bookingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 sm:px-5 sm:py-2.5 sm:text-sm"
        >
          <span className="sm:hidden">Termin sichern</span>
          <span className="hidden sm:inline">Kostenfreies Erstgespräch</span>
        </Link>
        <MobileNav />
      </div>
    </>
  );
}
