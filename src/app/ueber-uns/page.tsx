import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BOOKING_LINK } from "@/lib/content";

export const metadata: Metadata = {
  title: "Über mich",
  description: "Albert Sibert – unabhängiger Finanzberater für Beamte, Referendare und Anwärter im öffentlichen Dienst.",
  alternates: { canonical: "/ueber-uns" },
};

const HIGHLIGHTS = [
  {
    title: "Über 250 Partnergesellschaften",
    text: "Ich vergleiche unabhängig, statt nur ein Produkt zu verkaufen.",
  },
  {
    title: "Spezialisiert auf den öffentlichen Dienst",
    text: "Beihilfe, PKV und Beamtenversorgung kenne ich im Detail.",
  },
  {
    title: "Persönliche Betreuung",
    text: "Sie erreichen mich direkt, ohne Warteschleife oder Callcenter.",
  },
];

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
          <div className="grid items-center gap-10 lg:grid-cols-[320px_1fr]">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-3xl lg:mx-0 lg:max-w-none">
              <Image
                src="/albert-ueber-mich.jpg"
                alt="Albert Sibert, unabhängiger Finanzberater für Beamte"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="text-mediumdark">
              Ich bin Albert Sibert, unabhängiger Finanzberater mit Schwerpunkt auf Beamte,
              Referendare und Anwärter im öffentlichen Dienst. Seit 2019 begleite ich Menschen im
              öffentlichen Dienst bei Beihilfe, PKV, Dienstunfähigkeit und Altersvorsorge – mit
              über 250 Partnergesellschaften zur Auswahl statt einem einzigen Produkt.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="rounded-2xl bg-white p-6">
                <h3 className="font-heading mb-2 text-base font-semibold text-primary">{h.title}</h3>
                <p className="text-sm text-mediumdark">{h.text}</p>
              </div>
            ))}
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
          Seit 2019 berate ich Menschen im öffentlichen Dienst und habe über 300 Beamtinnen,
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
