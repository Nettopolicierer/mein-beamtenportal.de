"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CookieConsent, readStoredConsent, writeStoredConsent } from "./consent-store";
import { CookieBanner } from "./CookieBanner";

interface CookieConsentContextValue {
  /** null = Nutzer hat noch nicht entschieden */
  consent: CookieConsent | null;
  setConsent: (functional: boolean, marketing?: boolean) => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<CookieConsent | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConsentState(readStoredConsent());
    setHydrated(true);
  }, []);

  const setConsent = useCallback((functional: boolean, marketing = false) => {
    const next: CookieConsent = { necessary: true, functional, marketing };
    setConsentState(next);
    writeStoredConsent(next);
  }, []);

  const value = useMemo(() => ({ consent, setConsent }), [consent, setConsent]);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {hydrated && <CookieBanner />}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return ctx;
}
