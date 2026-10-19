import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Building2, ShieldCheck, Star, Scale, Users } from "lucide-react";
import { QualiFunnel } from "./QualiFunnel";
import { StickyCta } from "./StickyCta";

// Werbe-Landingpage (Google Ads): bewusst nicht im Suchindex.
export const metadata: Metadata = {
  title: "Private Krankenversicherung für Referendare in Baden-Württemberg",
  description:
    "Referendariat in Baden-Württemberg ab 2027: Beihilfetarife vergleichen und das kostenfreie Erstgespräch buchen.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/referendar-bw" },
};

const USPS = [
  {
    icon: Building2,
    title: "Kein Ein-Haus-Vertrieb",
    text: "Ich bin kein Ausschließlichkeitsvertreter, der nur die Produkte eines einzigen Versicherers anbieten darf. Ich vergleiche Tarife mehrerer Gesellschaften für dich, statt dir nur das Angebot eines Hauses zu zeigen.",
  },
  {
    icon: Scale,
    title: "Beihilfe BW im Blick",
    text: "In Baden-Württemberg übernimmt die Beihilfe in der Regel 50 % deiner Krankheitskosten, die PKV deckt den Rest. Ich achte darauf, dass Tarif und Beihilfe zusammenpassen und keine unnötigen Lücken entstehen, zum Beispiel bei Zahnersatz oder Wahlleistungen.",
  },
  {
    icon: ShieldCheck,
    title: "Mit Blick auf später",
    text: "Viele Tarife bieten Optionsrechte, später ohne erneute Gesundheitsprüfung höher zu versichern, etwa bei der Verbeamtung auf Lebenszeit. Ich zeige dir, welche Tarife das bieten und welche Bedingungen gelten.",
  },
];

const FAQ = [
  {
    q: "Was kostet mich das Erstgespräch?",
    a: "Nichts. Das Gespräch ist kostenfrei. Ob du danach etwas abschließt, entscheidest du allein.",
  },
  {
    q: "Wie verdienst du dein Geld?",
    a: "Wenn du über mich abschließt, erhalte ich eine Provision vom Versicherer. Sie ist im Beitrag einkalkuliert, zusätzliche Kosten entstehen dir dadurch nicht.",
  },
  {
    q: "Warum soll ich nicht einfach beim Anbieter bleiben, der im Seminar vorbeikommt?",
    a: "Das kann passen, muss aber nicht. Wer nur die Produkte eines Versicherers vermittelt, darf dir auch nur diese zeigen. Ein Vergleich zeigt dir, ob der Tarif zu deiner Situation passt und was er im Vergleich kostet.",
  },
  {
    q: "Bis wann muss ich mich entscheiden?",
    a: "Für den Beginn des Referendariats ist der Zeitpunkt wichtig, weil bestimmte Aufnahmeregeln und Fristen davon abhängen. Deshalb lohnt es sich, den Vergleich vor dem Start zu machen. Die Details für dich besprechen wir im Erstgespräch.",
  },
];

export default function ReferendarBwPage() {
  return (
    <div className="w-full">
      {/* Mini-Kopf ohne Navigation und ohne Link */}
      <header className="border-b border-mediumlight/40 bg-white">
        <div className="mx-auto flex max-w-5xl items-center px-5 py-3">
          <Image src="/logo.svg" alt="Mein Beamtenportal" width={120} height={50} className="h-auto w-[104px]" priority />
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="bg-base">
        <div className="mx-auto max-w-5xl px-5 pt-10 pb-8 sm:pt-14">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Lehramt in Baden-Württemberg • Start 2027
          </span>
          <h1 className="font-heading mt-4 max-w-3xl text-3xl font-bold tracking-tight text-balance text-primary sm:text-5xl">
            Dein Referendariat in BW startet bald? Finde die PKV, die zu dir passt – in Ruhe und mit Vergleich.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-mediumdark sm:text-lg">
            Viele entscheiden sich unter Zeitdruck für den ersten Anbieter, der auf dem Campus oder im Seminar
            vorbeikommt. Ich vergleiche für dich die Beihilfetarife mehrerer Gesellschaften, transparent und
            abgestimmt auf die Beihilfe in Baden-Württemberg.
          </p>
          <a
            href="#check"
            className="mt-6 inline-block w-full rounded-lg bg-primary px-6 py-4 text-center text-base font-semibold text-white hover:bg-primary/90 sm:w-auto"
          >
            Jetzt passende Anwärter-Tarife prüfen (Dauert 60 Sek.)
          </a>

          <ul className="mt-8 grid gap-3 text-sm text-primary sm:grid-cols-3">
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 size-5 shrink-0" />
              <span>
                Über 400 Beamte beraten
                <span className="block text-xs text-mediumdark">Seit 2019 im öffentlichen Dienst</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="mt-0.5 size-5 shrink-0" />
              <span>
                Nicht an einen Versicherer gebunden
                <span className="block text-xs text-mediumdark">Tarife mehrerer Gesellschaften</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="mt-0.5 size-5 shrink-0" />
              <span>
                4,90 von 5 Sternen bei über 80 Bewertungen
                <span className="block text-xs text-mediumdark">Kundenbewertungen auf ProvenExpert</span>
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Qualifizierungs-Check */}
      <section className="mx-auto max-w-xl px-5 py-10">
        <QualiFunnel />
      </section>

      {/* USPs */}
      <section className="bg-base">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <h2 className="font-heading mb-8 text-2xl font-bold text-primary sm:text-3xl">Worauf es bei der Wahl ankommt</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {USPS.map((u) => (
              <div key={u.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <u.icon className="mb-3 size-7 text-primary" />
                <h3 className="mb-2 font-semibold text-primary">{u.title}</h3>
                <p className="text-sm text-mediumdark">{u.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparenz */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h2 className="font-heading mb-3 text-2xl font-bold text-primary">So arbeite ich</h2>
        <p className="text-mediumdark">
          Wenn du über mich abschließt, erhalte ich eine Provision vom Versicherer. Sie ist in deinem Beitrag enthalten,
          zusätzliche Kosten entstehen dir nicht. Der Vergleich soll dir helfen, selbst zu entscheiden.
        </p>
      </section>

      {/* Über Albert */}
      <section className="bg-base">
        <div className="mx-auto grid max-w-3xl items-center gap-6 px-5 py-12 sm:grid-cols-[9rem_1fr]">
          <Image
            src="/albert-portrait.webp"
            alt="Albert Sibert"
            width={144}
            height={144}
            className="size-28 rounded-2xl object-cover sm:size-36"
          />
          <div>
            <h2 className="font-heading text-xl font-bold text-primary">Albert Sibert</h2>
            <p className="mt-2 text-sm text-mediumdark">
              Ich bin Versicherungsvertreter mit Erlaubnis nach § 34d GewO und spezialisiert auf Beamte, Referendare und
              Anwärter. Seit 2019 begleite ich Menschen im öffentlichen Dienst bei Beihilfe, privater Krankenversicherung,
              Dienstunfähigkeit und Altersvorsorge. Auf meinem Fachportal mein-beamtenportal.de erkläre ich diese Themen
              in über 150 Ratgeber-Beiträgen.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h2 className="font-heading mb-5 text-2xl font-bold text-primary">Häufige Fragen</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-xl border border-mediumlight/60 bg-white p-5">
              <summary className="cursor-pointer font-semibold text-primary">{f.q}</summary>
              <p className="mt-3 text-sm text-mediumdark">{f.a}</p>
            </details>
          ))}
        </div>
        <a
          href="#check"
          className="mt-8 block rounded-lg bg-primary px-6 py-4 text-center text-base font-semibold text-white hover:bg-primary/90"
        >
          Jetzt passende Anwärter-Tarife prüfen
        </a>
      </section>

      {/* Footer: nur Pflichtangaben */}
      <footer className="border-t border-mediumlight/40 bg-base px-5 pt-8 pb-24 sm:pb-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 text-sm text-mediumdark sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Albert Sibert, Versicherungsvertreter (§ 34d GewO)</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/impressum" className="hover:text-primary">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-primary">
              Datenschutz
            </Link>
            <Link href="/erstinformation" className="hover:text-primary">
              Erstinformation (§ 15 VersVermV)
            </Link>
          </nav>
        </div>
      </footer>

      <StickyCta />
    </div>
  );
}
