"use client";

import { useState } from "react";
import Link from "next/link";
import { GOOGLE_ADS_ENABLED } from "@/lib/google-ads";
import { useCookieConsent } from "./CookieConsentProvider";

// Banner bewusst gut sichtbar (Karte am unteren Rand, gleitet ein). Wichtig: "Nur notwendige" und
// "Alle akzeptieren" sind gleich groß, gleich gewichtet und beide auf der ersten Ebene - nur so
// ist die Einwilligung rechtlich wirksam (Ablehnen darf nicht schwerer sein als Zustimmen).
const buttonBase = "h-12 w-full rounded-lg px-5 text-base font-semibold transition sm:w-auto sm:min-w-[11rem]";

export function CookieBanner() {
  const { consent, setConsent } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [marketing, setMarketing] = useState(false);

  if (consent !== null) return null;

  return (
    <div role="dialog" aria-label="Cookie-Einstellungen" className="cookie-banner-in fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="mx-auto max-h-[85vh] max-w-3xl overflow-y-auto rounded-2xl border border-mediumlight/60 bg-white p-5 shadow-2xl shadow-primary/25 sm:p-6">
        <p className="font-heading text-lg font-bold text-primary">Ihre Privatsphäre, Ihre Wahl</p>
        <p className="mt-2 text-sm text-mediumdark">
          {GOOGLE_ADS_ENABLED
            ? "Wir verwenden technisch notwendige Cookies. Mit Ihrer Zustimmung messen wir außerdem mit Microsoft Clarity, welche Inhalte hilfreich sind, und mit Google Ads, ob unsere Anzeigen zu Beratungsterminen führen. Dabei werden Daten an Microsoft bzw. Google übermittelt, auch in die USA. Sie entscheiden selbst und können jederzeit widerrufen. Mehr dazu in unserer "
            : "Wir verwenden nur technisch notwendige Cookies. Für anonyme Reichweitenmessung nutzen wir zusätzlich Microsoft Clarity, das erst nach Ihrer Einwilligung geladen wird. Mehr dazu in unserer "}
          <Link href="/datenschutz" className="underline hover:text-foreground">
            Datenschutzerklärung
          </Link>
          .
        </p>

        {GOOGLE_ADS_ENABLED && showSettings && (
          <div className="mt-4 flex flex-col gap-2 rounded-xl bg-base p-4 text-sm text-foreground">
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

        {/* Mobil steht "Alle akzeptieren" oben; beide Buttons haben identische Größe und Gewichtung. */}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setConsent(false, false)}
            className={`${buttonBase} border-2 border-primary bg-white text-primary hover:bg-base`}
          >
            Nur notwendige
          </button>
          {GOOGLE_ADS_ENABLED && showSettings && (
            <button
              type="button"
              onClick={() => setConsent(functional, marketing)}
              className={`${buttonBase} border-2 border-primary bg-white text-primary hover:bg-base`}
            >
              Auswahl speichern
            </button>
          )}
          <button
            type="button"
            onClick={() => setConsent(true, GOOGLE_ADS_ENABLED)}
            className={`${buttonBase} border-2 border-primary bg-primary text-white hover:bg-primary/90`}
          >
            Alle akzeptieren
          </button>
        </div>

        {GOOGLE_ADS_ENABLED && !showSettings && (
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="mt-3 w-full text-center text-sm text-mediumdark underline hover:text-foreground sm:text-right"
          >
            Einstellungen
          </button>
        )}
      </div>
    </div>
  );
}
