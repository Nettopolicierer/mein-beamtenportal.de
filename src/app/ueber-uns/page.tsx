import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BOOKING_LINK } from "@/lib/content";
import { Reveal } from "@/components/Reveal";

const STATS = [
  { value: ">400", label: "Beamte beraten" },
  { value: "seit 2019", label: "als Berater aktiv" },
  { value: "250+", label: "Partnergesellschaften" },
  { value: "4,9/5", label: "ProvenExpert" },
];

export const metadata: Metadata = {
  title: "Über mich",
  description: "Albert Sibert – unabhängiger Finanzberater für Beamte, Referendare und Anwärter im öffentlichen Dienst.",
  alternates: { canonical: "/ueber-uns" },
};

export default function UeberUnsPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Über mich</p>
        <h1 className="font-heading mb-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Albert Sibert
        </h1>
        <p className="text-lg text-mediumdark">
          Unabhängiger Finanzberater für Beamte, Referendare und Anwärter im öffentlichen Dienst.
        </p>
      </div>

      <div className="bg-base">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:items-stretch">
            <Reveal variant="fade-right" className="lg:h-full">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-3xl shadow-lg lg:mx-0 lg:h-full lg:max-w-none">
                <Image
                  src="/albert-ueber-mich.jpg"
                  alt="Albert Sibert, unabhängiger Finanzberater für Beamte"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </Reveal>
            <Reveal variant="fade-left" delay={100} className="flex flex-col justify-center">
              <p className="text-lg leading-relaxed text-mediumdark">
                Ich bin Albert Sibert, unabhängiger Finanzberater mit Schwerpunkt auf Beamte,
                Referendare und Anwärter im öffentlichen Dienst. Seit 2019 begleite ich Menschen im
                öffentlichen Dienst bei Beihilfe, PKV, Dienstunfähigkeit und Altersvorsorge – mit
                über 250 Partnergesellschaften zur Auswahl statt einem einzigen Produkt.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-6 border-t border-mediumlight/40 pt-8 sm:grid-cols-4">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="font-heading text-2xl font-bold text-primary">{s.value}</p>
                    <p className="text-xs text-mediumdark">{s.label}</p>
                  </div>
                ))}
              </div>

              <Link
                href={BOOKING_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-fit items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Kostenfreies Erstgespräch
              </Link>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Vision</p>
        <h2 className="font-heading mb-4 text-2xl font-bold text-primary">
          Klarheit bei Beihilfe und Pension schaffen
        </h2>
        <p className="mb-4 text-mediumdark">
          Die Beihilfevorschriften unterscheiden sich von Bundesland zu Bundesland, der
          Bemessungssatz ändert sich mit jedem Kind und jeder Beförderung, und die Frist für die
          PKV-Aufnahmeprüfung läuft bei vielen schon während des Referendariats. Ich erkläre genau,
          welche Regel in Ihrem Bundesland und in Ihrer Situation gilt – nicht die allgemeine
          Theorie aus dem Beamtenrecht.
        </p>
        <p className="mb-4 text-mediumdark">
          Angefangen habe ich bei einer großen privaten Krankenversicherung, die auf den
          öffentlichen Dienst spezialisiert war. Dort habe ich schnell gemerkt, dass ich mich
          nicht auf die Produkte eines einzigen Anbieters beschränken will – meine Kundinnen und
          Kunden sollen den wirklich besten Tarif bekommen, nicht nur den besten aus einem
          Portfolio. Deshalb arbeite ich heute unabhängig und marktübergreifend mit über 250
          Partnergesellschaften.
        </p>
        <p className="text-mediumdark">
          Seit 2019 berate ich Menschen im öffentlichen Dienst und habe über 400 Beamtinnen,
          Beamte, Referendare und Anwärter begleitet – vom ersten Beihilfeantrag bis zur
          Pensionsplanung. Diese Erfahrung fließt in jedes Gespräch ein.
        </p>
      </div>

      <div className="bg-primary">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-heading mb-4 text-2xl font-bold text-white">
            Haben Sie Lust auf ein Kennenlernen?
          </h2>
          <p className="mb-8 text-white/80">
            Im kostenfreien Erstgespräch (ca. 30–45 Minuten, online oder persönlich) schauen wir
            uns Ihre Situation an – Beihilfebemessungssatz, bestehende PKV oder Versorgungslücken
            bei Dienstunfähigkeit. Danach wissen Sie, ob und wo sich etwas lohnt.
          </p>
          <Link
            href={BOOKING_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-primary hover:bg-white/90"
          >
            Kostenfreies Erstgespräch vereinbaren
          </Link>
        </div>
      </div>
    </div>
  );
}
