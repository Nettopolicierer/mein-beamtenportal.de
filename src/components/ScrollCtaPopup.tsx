"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { BOOKING_LINK } from "@/lib/site";
import { isCalmPath, isLandingPath } from "@/lib/landing";

// Beratungs-Hinweis ab 70 % Scroll-Tiefe (liest noch, ist also überzeugt). Einmal weggeklickt,
// kommt er erst nach ein paar Tagen wieder (siehe DISMISS_DAYS).
const BERATUNG_THRESHOLD = 0.7;
const DISMISS_DAYS = 7;

function dismissKey() {
  return "mbp_scroll_cta_beratung_dismissed_at";
}

function recentlyDismissed(): boolean {
  const raw = localStorage.getItem(dismissKey());
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;
  const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return days < DISMISS_DAYS;
}

export function ScrollCtaPopup() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let shown = false;
    try {
      if (recentlyDismissed()) shown = true;
    } catch {
      // localStorage kann im Privat-Modus fehlschlagen - dann ohne Wiedervorlage-Sperre.
    }
    // Eigenwerbung vermeiden: nicht auf der Kontaktseite, Landingpages und ruhigen Seiten.
    if (pathname === "/kontakt" || isLandingPath(pathname) || isCalmPath(pathname)) shown = true;

    function onScroll() {
      // Artikel mit Rechner-Leiste: nur eine Aufforderung gleichzeitig.
      if (document.querySelector("[data-rechner-bar]")) return;
      if (shown) {
        window.removeEventListener("scroll", onScroll);
        return;
      }
      const scrollDepth =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollDepth >= BERATUNG_THRESHOLD) {
        shown = true;
        setShow(true);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(dismissKey(), String(Date.now()));
    } catch {
      // s.o.
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm">
      <div className="relative rounded-2xl bg-primary p-5 pr-10 text-white shadow-2xl shadow-primary/30">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Schließen"
          className="absolute top-3 right-3 rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
        <p className="font-heading mb-1 text-base font-bold">Fragen zu Beihilfe oder Pension?</p>
        <p className="mb-4 text-sm text-white/80">
          In einem kostenfreien Erstgespräch klären wir, wo Sie stehen und was sich lohnt.
        </p>
        <Link prefetch={false}
          href={BOOKING_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="block rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-primary hover:bg-white/90"
        >
          Kostenfreies Erstgespräch
        </Link>
      </div>
    </div>
  );
}
