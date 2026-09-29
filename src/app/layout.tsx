import type { Metadata } from "next";
import { Raleway, Mulish, Caveat } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { BOOKING_LINK } from "@/lib/content";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Apex ist die kanonische Domain (www leitet per 301 auf Apex um) - siehe
// migration-Notizen. Nicht mit dem www-Muster von albert-sibert.de verwechseln.
const BASE_URL = "https://mein-beamtenportal.de";

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

const NAV = [
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/ueber-uns", label: "Über Uns" },
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
        <header className="sticky top-0 z-40 border-b border-mediumlight/40 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="shrink-0">
              <Image src="/logo.svg" alt="Mein Beamtenportal" width={150} height={63} priority />
            </Link>
            <nav className="hidden items-center gap-8 text-sm font-medium tracking-wide text-primary uppercase sm:flex">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="hover:opacity-70">
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href={BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Kostenfreies Erstgespräch
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-mediumlight/40 bg-base">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr]">
              <div>
                <Image src="/logo.svg" alt="Mein Beamtenportal" width={140} height={59} className="mb-4" />
                <p className="max-w-sm text-sm text-mediumdark">
                  Ihr unabhängiges Informationsportal für Vorsorge, Beihilfe und Absicherung im
                  öffentlichen Dienst.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <p className="mb-1 font-semibold text-primary">Navigation</p>
                <Link href="/ueber-uns" className="text-mediumdark hover:text-primary">
                  Über Uns
                </Link>
                <Link href="/ratgeber" className="text-mediumdark hover:text-primary">
                  Ratgeber
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
      </body>
    </html>
  );
}
