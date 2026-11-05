"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Schwebende Leiste (nur Handy) auf Artikeln: erscheint nach ca. 30 % Scrollen und
// verschwindet, sobald der Rechner im Artikel im Bild ist.
export function RechnerStickyBar({ href, hasWidget }: { href: string; hasWidget: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [widgetVisible, setWidgetVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(max > 0 && window.scrollY / max >= 0.3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = hasWidget ? document.getElementById("pl-rechner") : null;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setWidgetVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [hasWidget]);

  if (!scrolled || widgetVisible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#C9DCF0] bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <Link
        href={href}
        style={{ backgroundColor: "#1E5FA8", color: "#FFFFFF" }}
        className="block rounded-xl px-4 py-3 text-center text-base font-bold"
      >
        Pensionslücke berechnen
      </Link>
    </div>
  );
}
