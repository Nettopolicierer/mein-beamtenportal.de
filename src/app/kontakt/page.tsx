import type { Metadata } from "next";
import Link from "next/link";
import { BOOKING_LINK } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktieren Sie Mein Beamtenportal per Telefon, WhatsApp oder E-Mail.",
  alternates: { canonical: "/kontakt" },
};

const CONTACT_METHODS = [
  { label: "Telefon", value: "+49 176 92609041", href: "tel:+4917692609041" },
  { label: "WhatsApp", value: "+49 176 92609041", href: "https://wa.me/4917692609041" },
  { label: "E-Mail", value: "kontakt@mein-beamtenportal.de", href: "mailto:kontakt@mein-beamtenportal.de" },
];

export default function KontaktPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading mb-4 text-3xl font-bold tracking-tight text-primary">
        Sie haben Fragen oder Anregungen?
      </h1>
      <p className="mb-10 text-mediumdark">
        Melden Sie sich gerne telefonisch, per WhatsApp oder E-Mail – oder vereinbaren Sie direkt
        ein kostenfreies Erstgespräch.
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {CONTACT_METHODS.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex flex-col gap-1 rounded-2xl border border-mediumlight/40 bg-base p-5 hover:border-primary/30"
          >
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              {c.label}
            </span>
            <span className="text-sm text-foreground">{c.value}</span>
          </Link>
        ))}
      </div>

      <Link
        href={BOOKING_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
      >
        Kostenfreies Erstgespräch vereinbaren
      </Link>
    </div>
  );
}
