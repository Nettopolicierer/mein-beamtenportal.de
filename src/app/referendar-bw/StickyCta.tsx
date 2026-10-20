"use client";

import { useEffect, useState } from "react";

// Mobile Leiste unten: erscheint nach dem Hero und verschwindet, sobald der Check sichtbar ist.
export function StickyCta({ label = "Passende Anwärter-Tarife prüfen (60 Sek.)" }: { label?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = document.getElementById("check");
    const hero = document.getElementById("hero");
    if (!check || !hero) return;
    let heroGone = false;
    let checkVisible = false;
    const update = () => setShow(heroGone && !checkVisible);
    const o1 = new IntersectionObserver(([e]) => {
      heroGone = !e.isIntersecting;
      update();
    });
    const o2 = new IntersectionObserver(([e]) => {
      checkVisible = e.isIntersecting;
      update();
    });
    o1.observe(hero);
    o2.observe(check);
    return () => {
      o1.disconnect();
      o2.disconnect();
    };
  }, []);

  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mediumlight/40 bg-white/95 p-3 shadow-lg backdrop-blur sm:hidden">
      <a href="#check" className="block rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white">
        {label}
      </a>
    </div>
  );
}
