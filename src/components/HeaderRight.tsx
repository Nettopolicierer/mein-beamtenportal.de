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

  return (
    <>
      <nav className="hidden items-center gap-5 text-[13px] font-medium tracking-wide text-primary uppercase xl:gap-7 xl:text-sm xl:flex">
        {nav.map((item) => (
          <Link prefetch={false} key={item.href} href={item.href} className="hover:opacity-70">
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        <Link prefetch={false}
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
