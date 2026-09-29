"use client";

import Script from "next/script";
import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";

// Bewusst dieselbe Projekt-ID wie bei albert-sibert.de: beide Seiten sollen
// in einem gemeinsamen Clarity-Dashboard erscheinen (Nutzerwunsch), nicht
// getrennt. Sitzungen sind ueber die URL innerhalb des Projekts unterscheidbar.
const CLARITY_PROJECT_ID = "yps6cbdpsy";

export function ClarityTag() {
  const { consent } = useCookieConsent();

  if (!consent?.functional) return null;

  return (
    <Script id="ms-clarity" strategy="lazyOnload">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  );
}
