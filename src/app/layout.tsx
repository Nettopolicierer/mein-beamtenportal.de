import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { BOOKING_LINK } from "@/lib/content";
import { CookieConsentProvider } from "@/components/cookie-consent/CookieConsentProvider";
import { GoogleAdsTag } from "@/components/GoogleAdsTag";
import { ClarityTag } from "@/components/ClarityTag";
import { ScrollCtaPopup } from "@/components/ScrollCtaPopup";
import { WebinarBanner } from "@/components/WebinarBanner";
import { LogoLink } from "@/components/LogoLink";
import { ChromeGate } from "@/components/ChromeGate";
import { HeaderRight } from "@/components/HeaderRight";
import "./globals.css";

// Schriften liegen als Dateien im Projekt (src/app/fonts) statt von Google geladen zu
// werden: Der Build haengt so nicht mehr von fonts.googleapis.com ab (mehrfach
// "Module not found ... font/google" bei Vercel), und beim Besuch der Website
// werden keine Daten an Google uebertragen. Schriftarten: Raleway, Mulish und
// Caveat (SIL Open Font License), Latin-Zeichensatz inkl. Umlaute.
const raleway = localFont({
  variable: "--font-raleway",
  display: "swap",
  src: [
    { path: "./fonts/raleway-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/raleway-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/raleway-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

const mulish = localFont({
  variable: "--font-mulish",
  display: "swap",
  src: [
    { path: "./fonts/mulish-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/mulish-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/mulish-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

const caveat = localFont({
  variable: "--font-caveat",
  display: "swap",
  src: [
    { path: "./fonts/caveat-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/caveat-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

// www ist die kanonische Domain: mein-beamtenportal.de (Apex) leitet in Vercel per
// 308 auf www um. Canonical, Sitemap und robots.txt müssen auf dieselbe Adresse
// zeigen, sonst verweist Google auf eine weiterleitende URL.
const BASE_URL = "https://www.mein-beamtenportal.de";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Beihilfe, Pension & PKV für Beamte | Mein Beamtenportal",
    template: "%s | Mein Beamtenportal",
  },
  description:
    "Beihilfe, Pension und PKV für Beamte verständlich erklärt. Unabhängige Beratung für Beamtinnen, Beamte, Referendare und Anwärter im öffentlichen Dienst.",
  alternates: { canonical: BASE_URL },
};

// maximumScale verhindert Pinch-Zoom, damit auf Mobile kein horizontaler
// Leerraum durch Rauszoomen entsteht.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const NAV = [
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/webinar", label: "Webinar" },
  { href: "/ueber-uns", label: "Über Mich" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${raleway.variable} ${mulish.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-foreground">
        <CookieConsentProvider>
        <ClarityTag />
        <GoogleAdsTag />
        <WebinarBanner />
        <ChromeGate>
        <header className="sticky top-0 z-40 border-b border-mediumlight/40 bg-white/95 backdrop-blur">
          <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
            <LogoLink
              width={150}
              height={63}
              priority
              linkClassName="shrink-0"
              className="h-auto w-[104px] sm:w-[150px]"
            />
            <HeaderRight nav={NAV} bookingLink={BOOKING_LINK} />
          </div>
        </header>
        </ChromeGate>

        <main className="flex-1">{children}</main>

        <ChromeGate>
        <footer className="border-t border-mediumlight/40 bg-base">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr]">
              <div>
                <LogoLink width={140} height={59} linkClassName="mb-4 inline-block" />
                <p className="max-w-sm text-sm text-mediumdark">
                  Ihr unabhängiges Informationsportal für Vorsorge, Beihilfe und Absicherung im
                  öffentlichen Dienst.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <p className="mb-1 font-semibold text-primary">Navigation</p>
                <Link href="/ueber-uns" className="text-mediumdark hover:text-primary">
                  Über Mich
                </Link>
                <Link href="/ratgeber" className="text-mediumdark hover:text-primary">
                  Ratgeber
                </Link>
                <Link href="/webinar" className="text-mediumdark hover:text-primary">
                  Webinar
                </Link>
                <Link href="/kontakt" className="text-mediumdark hover:text-primary">
                  Kontakt
                </Link>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <p className="mb-1 font-semibold text-primary">Kontakt</p>
                <Link href="mailto:kontakt@mein-beamtenportal.de" className="text-mediumdark hover:text-primary">
                  kontakt@mein-beamtenportal.de
                </Link>
                <Link href="tel:+4917692609041" className="text-mediumdark hover:text-primary">
                  +49 176 92609041
                </Link>
              </div>
            </div>
            <div className="mt-10 flex flex-col gap-4 border-t border-mediumlight/40 pt-6 text-sm text-mediumdark sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} Mein Beamtenportal</p>
              <div className="flex gap-5">
                <Link href="/impressum" className="hover:text-primary">
                  Impressum
                </Link>
                <Link href="/datenschutz" className="hover:text-primary">
                  Datenschutz
                </Link>
              </div>
            </div>
          </div>
        </footer>
        </ChromeGate>
        <ScrollCtaPopup />
        </CookieConsentProvider>
        <Analytics />
      </body>
    </html>
  );
}
