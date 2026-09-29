"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { BOOKING_LINK } from "@/lib/content";

const DISMISS_KEY = "mbp_scroll_cta_dismissed_at";
const DISMISS_DAYS = 7;

function recentlyDismissed(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;
  const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return days < DISMISS_DAYS;
}

export function ScrollCtaPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let shown = false;
    try {
      if (recentlyDismissed()) shown = true;
    } catch {
      // localStorage kann in Private-Modus o.ä. fehlschlagen - dann zeigen
      // wir das Pop-up einfach ohne Wiedervorlage-Sperre.
    }

    function onScroll() {
      if (shown) return;
      const scrollDepth =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollDepth >= 0.5) {
        shown = true;
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // s.o.
    }
  }

  if (!visible) return null;

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
        <Link
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
