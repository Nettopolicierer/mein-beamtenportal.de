import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star, Video } from "lucide-react";
import { AnfrageFormular } from "./AnfrageFormular";
import { StickyCta } from "../referendar-bw/StickyCta";

// Werbe-Landingpage (Instagram): bewusst nicht im Suchindex.
export const metadata: Metadata = {
  title: "Kostenfreies Erstgespräch für Beamte und Anwärter",
  description: "Dienstunfähigkeit, PKV und Beihilfe, Altersvorsorge: Themen wählen und das kostenfreie Erstgespräch anfragen.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/anfrage" },
};

const ABLAUF = [
  {
    title: "Kontaktaufnahme",
    text: "Du schickst deine Anfrage ab. Ich melde mich in der Regel innerhalb von 24 Stunden persönlich bei dir.",
  },
  {
    title: "Kurzes Kennenlernen",
    text: "Wir klären in einem kurzen Gespräch deine Situation und deine Ziele. Ich bereite danach vor, was für dich passt.",
  },
  {
    title: "Beratungstermin",
    text: "Digital per Video oder auf Wunsch persönlich. Ich zeige dir, was zu deiner Situation passt und was es kostet.",
  },
  {
    title: "Du entscheidest",
    text: "Ob du etwas abschließt, entscheidest du allein. Fragen danach beantworte ich dir gern.",
  },
];

const FAQ = [
  {
    q: "Ist die Beratung wirklich kostenfrei?",
    a: "Ja. Das Gespräch kostet dich nichts. Ob du danach etwas abschließt, entscheidest du allein.",
  },
  {
    q: "Wie verdienst du dein Geld?",
    a: "Wenn du über mich abschließt, erhalte ich eine Provision vom Versicherer. Sie ist im Beitrag einkalkuliert, zusätzliche Kosten entstehen dir dadurch nicht.",
  },
  {
    q: "Wie läuft das Gespräch ab?",
    a: "Meist digital per Video, auf Wunsch auch telefonisch oder persönlich. Du bringst deine Fragen mit, ich bereite mich anhand deiner gewählten Themen vor.",
  },
  {
    q: "Brauche ich schon Unterlagen?",
    a: "Nein. Hast du bereits Verträge, etwa eine Berufsunfähigkeits- oder Krankenversicherung, bring sie gern mit. Zum Start reicht deine Anfrage.",
  },
  {
    q: "Was passiert mit meinen Daten?",
    a: "Ich verwende deine Angaben nur, um dich zu den gewählten Themen zu kontaktieren. Gesundheitsangaben brauche ich im Formular nicht. Mehr steht in der Datenschutzerklärung.",
  },
];

export default function AnfragePage() {
  return (
    <div className="w-full">
      <header className="border-b border-mediumlight/40 bg-white">
        <div className="mx-auto flex max-w-5xl items-center px-5 py-3">
          <Image src="/logo.svg" alt="Mein Beamtenportal" width={120} height={50} className="h-auto w-[104px]" priority />
        </div>
      </header>

      <section id="hero" className="bg-base">
        <div className="mx-auto max-w-5xl px-5 pt-10 pb-8 sm:pt-14">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Für Beamte, Referendare und Anwärter
          </span>
          <h1 className="font-heading mt-4 max-w-3xl text-3xl font-bold tracking-tight text-balance text-primary sm:text-5xl">
            Lass uns sprechen: Dienstunfähigkeit, PKV und Altersvorsorge verständlich geklärt.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-mediumdark sm:text-lg">
            Wähle unten deine Themen. Ich melde mich persönlich bei dir, kostenfrei und unverbindlich.
          </p>
          <a
            href="#check"
            className="mt-6 inline-block w-full rounded-lg bg-primary px-6 py-4 text-center text-base font-semibold text-white hover:bg-primary/90 sm:w-auto"
          >
            Kostenfreie Beratung anfragen
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
              <Video className="mt-0.5 size-5 shrink-0" />
              <span>
                Digital oder persönlich
                <span className="block text-xs text-mediumdark">Per Video, Telefon oder vor Ort</span>
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

      <section className="mx-auto max-w-xl px-5 py-10">
        <AnfrageFormular />
      </section>

      <section className="bg-base">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <h2 className="font-heading mb-8 text-2xl font-bold text-primary sm:text-3xl">So läuft die Beratung ab</h2>
          <ol className="grid gap-5 sm:grid-cols-4">
            {ABLAUF.map((a, i) => (
              <li key={a.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="mb-3 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mb-2 font-semibold text-primary">{a.title}</h3>
                <p className="text-sm text-mediumdark">{a.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-3xl items-center gap-6 px-5 py-12 sm:grid-cols-[9rem_1fr]">
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
            Dienstunfähigkeit und Altersvorsorge. Auf mein-beamtenportal.de erkläre ich diese Themen in über 150
            Ratgeber-Beiträgen.
          </p>
        </div>
      </section>

      <section className="bg-base">
        <div className="mx-auto max-w-3xl px-5 py-12">
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
            Kostenfreie Beratung anfragen
          </a>
        </div>
      </section>

      <footer className="border-t border-mediumlight/40 bg-white px-5 pt-8 pb-24 sm:pb-8">
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

      <StickyCta label="Kostenfreie Beratung anfragen" />
    </div>
  );
}
