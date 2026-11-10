"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

// Misst Klicks auf Terminbuchung (Cal.com) und auf die Rechner-Hinweise in Artikeln, ohne jeden Link einzeln anzupassen.
export function ClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.includes("cal.com/")) {
        if (location.pathname.startsWith("/referendar-bw")) return; // dort misst der Funnel selbst
        track("booking_click", { page: location.pathname }, "booking");
      } else if (href === "#pl-rechner" || href === "/pensionsrechner" || href.startsWith("/pensionsrechner?")) {
        track("rechner_cta_click", { page: location.pathname, place: a.closest("[data-rechner-bar-el]") ? "leiste" : "karte" });
      } else if (href.startsWith("/checkliste")) {
        track("checkliste_cta_click", { page: location.pathname });
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
