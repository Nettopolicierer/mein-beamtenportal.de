import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { BOOKING_LINK } from "@/lib/content";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktieren Sie Mein Beamtenportal per Telefon, WhatsApp oder E-Mail.",
  alternates: { canonical: "/kontakt" },
};

const CONTACT_METHODS = [
  { label: "Telefon", value: "+49 176 92609041", href: "tel:+4917692609041", icon: Phone },
  { label: "WhatsApp", value: "+49 176 92609041", href: "https://wa.me/4917692609041", icon: MessageCircle },
  { label: "E-Mail", value: "kontakt@mein-beamtenportal.de", href: "mailto:kontakt@mein-beamtenportal.de", icon: Mail },
];

export default function KontaktPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Reveal>
        <div className="mb-10 flex items-center gap-4">
          <Image
            src="/albert-portrait.webp"
            alt="Albert Sibert"
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-full object-cover ring-4 ring-base"
          />
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-primary">
              Sie haben Fragen oder Anregungen?
            </h1>
            <span className="mt-2 block h-1 w-12 rounded-full bg-primary" />
          </div>
        </div>
        <p className="mb-10 max-w-xl text-mediumdark">
          Melden Sie sich gerne telefonisch, per WhatsApp oder E-Mail – oder vereinbaren Sie direkt
          ein kostenfreies Erstgespräch. Ich antworte in der Regel noch am selben Tag.
        </p>
      </Reveal>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {CONTACT_METHODS.map((c, i) => (
          <Reveal key={c.label} delay={i * 80} variant="fade-up">
            <Link
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex flex-col gap-3 rounded-2xl border border-mediumlight/40 bg-base p-5 transition-colors hover:border-primary/30"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <c.icon className="size-5" />
              </span>
              <div>
                <span className="block text-xs font-semibold tracking-widest text-primary uppercase">
                  {c.label}
                </span>
                <span className="text-sm text-foreground">{c.value}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <Link
          href={BOOKING_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Kostenfreies Erstgespräch vereinbaren
        </Link>
      </Reveal>
    </div>
  );
}
