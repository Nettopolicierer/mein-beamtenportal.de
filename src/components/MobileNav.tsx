"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, UserRound, Mail, Menu, X } from "lucide-react";

const NAV = [
  { href: "/ratgeber", label: "Ratgeber", icon: BookOpen },
  { href: "/ueber-uns", label: "Über Mich", icon: UserRound },
  { href: "/kontakt", label: "Kontakt", icon: Mail },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-mediumlight/60 text-primary sm:hidden"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[73px] z-30 bg-primary/20 backdrop-blur-[1px] sm:hidden"
          />
          <div className="absolute inset-x-3 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl border border-mediumlight/40 bg-white shadow-xl shadow-primary/10 sm:hidden">
            <nav className="flex flex-col divide-y divide-mediumlight/30 py-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 text-base font-medium text-primary active:bg-base"
                >
                  <item.icon className="size-[18px] text-primary/60" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
