import type { Metadata } from "next";
import Link from "next/link";
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
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p className="mx-auto max-w-2xl text-center text-mediumdark">
            Ich bin Albert Sibert, unabhängiger Finanzberater mit Schwerpunkt auf Beamte,
            Referendare und Anwärter im öffentlichen Dienst. Ich kenne die Besonderheiten der
            Beihilfe, der privaten Krankenversicherung und der Beamtenversorgung genau und
            begleite Sie bei Beihilfe, PKV, Dienstunfähigkeit und Altersvorsorge – ohne
            Fachjargon, ohne Druck.
          </p>

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
          Mein Anspruch ist es, Beratung zu Beihilfe, Pension und PKV verständlich, transparent
          und praxisnah zu gestalten. Statt Behördendeutsch und Fachbegriffe in den Vordergrund zu
          stellen, erkläre ich Beamtinnen und Beamten ihre Versorgungsansprüche so, dass sie
          nachvollziehbar und umsetzbar sind.
        </p>
        <p className="text-mediumdark">
          Ich möchte Beamtinnen und Beamte befähigen, ihre Beihilfe, ihre Pension und ihre private
          Krankenversicherung sicher einzuschätzen und fundierte Entscheidungen zu treffen, ohne
          Unsicherheit oder Überforderung. Denn ich bin überzeugt: Jede Beamtin und jeder Beamte
          verdient finanziellen Schutz und Klarheit über die eigene Versorgung.
        </p>
      </div>

      <div className="bg-primary">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-heading mb-4 text-2xl font-bold text-white">
            Haben Sie Lust auf ein Kennenlernen?
          </h2>
          <p className="mb-8 text-white/80">
            Unser erstes Gespräch dient in erster Linie dazu, uns persönlich kennenzulernen und
            Klarheit über Ihre Wünsche und Erwartungen zu schaffen. Nur wenn auf beiden Seiten ein
            gutes Gefühl herrscht, starten wir gemeinsam in die Zusammenarbeit.
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
