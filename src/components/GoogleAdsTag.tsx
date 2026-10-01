"use client";

import Script from "next/script";
import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";
import { GOOGLE_ADS_ENABLED, GOOGLE_ADS_ID } from "@/lib/google-ads";

// Laedt den Google-Tag erst nach ausdruecklicher Marketing-Einwilligung. Die
// Consent-Mode-v2-Signale werden vor dem Laden gesetzt (default: denied, dann
// update: granted, weil der Tag nur bei Zustimmung geladen wird).
export function GoogleAdsTag() {
  const { consent } = useCookieConsent();

  if (!GOOGLE_ADS_ENABLED || !consent?.marketing) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
      <Script id="google-ads" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied'});
          gtag('consent', 'update', {ad_storage:'granted', ad_user_data:'granted', ad_personalization:'granted'});
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
