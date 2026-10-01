"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { BOOKING_LINK } from "@/lib/content";
import { getNextWebinar } from "@/lib/webinar-config";

// Zwei Stufen statt einem einzelnen Popup: bei 30% Scroll-Tiefe (noch
// unentschlossen) das niedrigschwellige Angebot - das kostenlose Webinar.
// Bei 70% (liest noch, ist also schon überzeugter) das hochwertigere
// Angebot - das direkte Erstgespräch. Nur eine Stufe gleichzeitig sichtbar;
// einmal gezeigt/weggeklickt, kommt dieselbe Stufe erst nach ein paar Tagen
// wieder (siehe DISMISS_DAYS).
const WEBINAR_THRESHOLD = 0.3;
const BERATUNG_THRESHOLD = 0.7;
const DISMISS_DAYS = 7;

function dismissKey(stage: "webinar" | "beratung") {
  return `mbp_scroll_cta_${stage}_dismissed_at`;
}

function recentlyDismissed(stage: "webinar" | "beratung"): boolean {
  const raw = localStorage.getItem(dismissKey(stage));
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;
  const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return days < DISMISS_DAYS;
}

export function ScrollCtaPopup() {
  const pathname = usePathname();
  const [stage, setStage] = useState<"webinar" | "beratung" | null>(null);

  useEffect(() => {
    const shown = { webinar: false, beratung: false };
    try {
      if (recentlyDismissed("webinar")) shown.webinar = true;
      if (recentlyDismissed("beratung")) shown.beratung = true;
    } catch {
      // localStorage kann in Private-Modus o.ä. fehlschlagen - dann zeigen
      // wir die Pop-ups einfach ohne Wiedervorlage-Sperre.
    }
    // Eigenwerbung vermeiden: das Webinar-Popup nicht auf der Webinar-Seite
    // selbst, das Beratungs-Popup nicht auf der Kontaktseite selbst.
    if (pathname === "/webinar") shown.webinar = true;
    if (pathname === "/kontakt") shown.beratung = true;

    function onScroll() {
      if (shown.webinar && shown.beratung) {
        window.removeEventListener("scroll", onScroll);
        return;
      }
      const scrollDepth =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

      if (!shown.beratung && scrollDepth >= BERATUNG_THRESHOLD) {
        shown.beratung = true;
        setStage("beratung");
      } else if (!shown.webinar && scrollDepth >= WEBINAR_THRESHOLD) {
        shown.webinar = true;
        setStage((current) => current ?? "webinar");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  function dismiss() {
    const current = stage;
    setStage(null);
    if (!current) return;
    try {
      localStorage.setItem(dismissKey(current), String(Date.now()));
    } catch {
      // s.o.
    }
  }

  if (!stage) return null;

  if (stage === "webinar") {
    const { dateDisplay, timeDisplay } = getNextWebinar();
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-primary/70 p-4 backdrop-blur-sm"
        onClick={dismiss}
      >
        <div
          className="relative w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Schließen"
            className="absolute top-4 right-4 rounded-full p-1 text-mediumdark hover:bg-base hover:text-primary"
          >
            <X className="size-5" />
          </button>
          <p className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
            Kostenfreies Live-Webinar
          </p>
          <h2 className="font-heading mb-3 text-2xl font-bold text-primary">
            Für alle auf dem Weg in die Verbeamtung
          </h2>
          <p className="mb-5 text-sm text-mediumdark">
            Studierende, Referendare, Anwärter und Beamte in den ersten Dienstjahren: Anwartschaft,
            Beihilfe, PKV, Dienstunfähigkeit, Versorgungsansprüche und weitere wichtige Versicherungen
            verständlich erklärt – live und unverbindlich.
          </p>
          <p className="mb-5 text-sm font-medium text-primary">
            {dateDisplay} · {timeDisplay} · 45 Min. · online
          </p>
          <Link
            href="/webinar"
            onClick={dismiss}
            className="block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Jetzt kostenlos anmelden
          </Link>
        </div>
      </div>
    );
  }

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
