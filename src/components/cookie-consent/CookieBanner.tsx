"use client";

import { useState } from "react";
import Link from "next/link";
import { GOOGLE_ADS_ENABLED } from "@/lib/google-ads";
import { useCookieConsent } from "./CookieConsentProvider";

export function CookieBanner() {
  const { consent, setConsent } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [marketing, setMarketing] = useState(false);

  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto border-t border-mediumlight/40 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl text-sm text-mediumdark">
          <span className="font-medium text-foreground">Cookies &amp; externe Inhalte</span>
          <br />
          {GOOGLE_ADS_ENABLED
            ? "Wir verwenden technisch notwendige Cookies. Mit Ihrer Einwilligung nutzen wir außerdem Microsoft Clarity zur anonymen Reichweitenmessung und Google Ads zur Erfolgsmessung unserer Anzeigen. Dabei werden Daten an Microsoft bzw. Google übermittelt. Sie können Ihre Auswahl einzeln treffen. Mehr dazu in unserer "
            : "Wir verwenden nur technisch notwendige Cookies. Für anonyme Reichweitenmessung nutzen wir zusätzlich Microsoft Clarity, das erst nach Ihrer Einwilligung geladen wird. Mehr dazu in unserer "}
          <Link href="/datenschutz" className="underline hover:text-foreground">
            Datenschutzerklärung
          </Link>
          .
          {GOOGLE_ADS_ENABLED && showSettings && (
            <div className="mt-3 flex flex-col gap-2 text-foreground">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked disabled className="mt-1 size-4" />
                <span>
                  <strong>Notwendig</strong> (immer aktiv)
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={functional} onChange={(e) => setFunctional(e.target.checked)} className="mt-1 size-4" />
                <span>
                  <strong>Reichweitenmessung</strong> (Microsoft Clarity)
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 size-4" />
                <span>
                  <strong>Marketing</strong> (Google Ads: Erfolgsmessung der Anzeigen)
                </span>
              </label>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={() => setConsent(false, false)}
            className="rounded-lg border border-mediumlight px-4 py-2 text-sm font-medium text-mediumdark hover:bg-base"
          >
            Nur notwendige
          </button>
          {GOOGLE_ADS_ENABLED &&
            (showSettings ? (
              <button
                type="button"
                onClick={() => setConsent(functional, marketing)}
                className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-base"
              >
                Auswahl speichern
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="rounded-lg border border-mediumlight px-4 py-2 text-sm font-medium text-mediumdark hover:bg-base"
              >
                Einstellungen
              </button>
            ))}
          <button
            type="button"
            onClick={() => setConsent(true, GOOGLE_ADS_ENABLED)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
