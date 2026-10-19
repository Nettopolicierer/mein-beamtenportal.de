import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Erstinformation nach § 15 VersVermV",
  robots: { index: false, follow: false },
  alternates: { canonical: "/erstinformation" },
};

export default function ErstinformationPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="font-heading text-3xl font-bold text-primary">Erstinformation nach § 15 VersVermV</h1>
      <div className="mt-8 flex flex-col gap-6 text-sm text-mediumdark">
        <section>
          <h2 className="mb-2 text-base font-semibold text-primary">Angaben zum Vermittler</h2>
          <p>
            Albert Sibert, Gämsenbergstraße 22, 71640 Ludwigsburg, Telefon +49 176 92609041, E-Mail
            kontakt@mein-beamtenportal.de
          </p>
          <p className="mt-2">
            Status: Versicherungsvertreter mit Erlaubnis nach § 34d Abs. 1 GewO. Registrierungsnummer im
            Vermittlerregister: D-4EHE-G249E-13 (Registerabfrage: www.vermittlerregister.info). Zuständige Behörde:
            IHK Region Stuttgart, Jägerstraße 30, 70174 Stuttgart.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-primary">Beteiligungen</h2>
          <p>[Angabe zu Beteiligungen von mehr als 10 % an Versicherungsunternehmen bzw. durch Versicherungsunternehmen wird ergänzt.]</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-primary">Vergütung</h2>
          <p>
            Für die Vermittlung erhalte ich in der Regel eine Provision vom Versicherer, die im Versicherungsbeitrag
            einkalkuliert ist. Zusätzliche Kosten entstehen für Sie nicht, sofern nichts anderes vereinbart wird.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-primary">Berufshaftpflicht</h2>
          <p>Berufshaftpflichtversicherung bei der ERGO Versicherung AG, New-York-Ring 1, 22297 Hamburg (Geltungsraum Deutschland).</p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-primary">Beschwerden und Schlichtung</h2>
          <p>
            Bei Beschwerden können Sie sich zunächst an mich wenden. Außerdem steht Ihnen die Möglichkeit offen, sich an
            den Versicherungsombudsmann e.V., Postfach 08 06 32, 10006 Berlin (www.versicherungsombudsmann.de), zu
            wenden.
          </p>
        </section>
      </div>
    </div>
  );
}
