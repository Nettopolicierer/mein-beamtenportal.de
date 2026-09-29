"use client";

import Link from "next/link";
import { useCookieConsent } from "./CookieConsentProvider";

export function CookieBanner() {
  const { consent, setConsent } = useCookieConsent();

  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-mediumlight/40 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-mediumdark">
          <span className="font-medium text-foreground">Cookies &amp; externe Inhalte</span>
          <br />
          Wir verwenden nur technisch notwendige Cookies. Für anonyme Reichweitenmessung nutzen
          wir zusätzlich Microsoft Clarity, das erst nach Ihrer Einwilligung geladen wird. Mehr
          dazu in unserer{" "}
          <Link href="/datenschutz" className="underline hover:text-foreground">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={() => setConsent(false)}
            className="rounded-lg border border-mediumlight px-4 py-2 text-sm font-medium text-mediumdark hover:bg-base"
          >
            Nur notwendige
          </button>
          <button
            type="button"
            onClick={() => setConsent(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
