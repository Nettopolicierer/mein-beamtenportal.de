import type { Metadata } from "next";
import { PensionsLueckenRechner } from "@/components/PensionsLueckenRechner";

export const metadata: Metadata = {
  title: "Pensionsrechner für Beamte: Wie groß ist Ihre Versorgungslücke?",
  description:
    "Berechnen Sie in einer Minute Ihre voraussichtliche Netto-Pension und die Lücke zum heutigen Netto. Kostenlos, mit PDF-Auswertung für Beamte von A7 bis A15.",
  alternates: { canonical: "/pensionsrechner" },
};

export default function PensionsrechnerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="font-heading mb-3 text-3xl font-bold text-primary sm:text-4xl">Pensionsrechner für Beamte</h1>
      <p className="mb-6 text-lg text-mediumdark">
        Wie viel Pension bleibt Ihnen netto, und wie groß ist die Lücke zu Ihrem heutigen Netto? Geben Sie Besoldungsgruppe,
        Alter und Dienstjahre ein und sehen Sie das Ergebnis sofort. Auf Wunsch erhalten Sie eine PDF-Auswertung per E-Mail.
      </p>
      <PensionsLueckenRechner gated />
      <h2 className="font-heading mt-12 mb-3 text-2xl font-bold text-primary">So wird gerechnet</h2>
      <p className="text-mediumdark">
        Der Rechner nutzt den Ruhegehaltssatz von 1,79375 % je Dienstjahr (höchstens 71,75 %), berücksichtigt einen möglichen
        Versorgungsabschlag bei vorzeitigem Ruhestand und schätzt Steuern, Pflege- und Krankenversicherung. Alle Werte sind
        Richtwerte einer vereinfachten Modellrechnung. Sie ersetzen keine Auskunft Ihrer Versorgungsstelle und keine Steuer-
        oder Rechtsberatung.
      </p>
    </main>
  );
}
