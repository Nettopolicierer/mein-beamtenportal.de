"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/ueber-uns", label: "Über Mich" },
  { href: "/kontakt", label: "Kontakt" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 items-center justify-center rounded-lg text-primary"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-mediumlight/40 bg-white px-6 py-4 shadow-lg">
          <nav className="flex flex-col gap-4 text-base font-medium text-primary">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
