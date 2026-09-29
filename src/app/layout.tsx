import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <header className="border-b border-slate-100">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Mein Beamtenportal
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-slate-900">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Mein Beamtenportal</p>
            <div className="flex gap-5">
              <Link href="/impressum" className="hover:text-slate-900">
                Impressum
              </Link>
              <Link href="/datenschutz" className="hover:text-slate-900">
                Datenschutz
              </Link>
              <Link href="/kontakt" className="hover:text-slate-900">
                Kontakt
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
