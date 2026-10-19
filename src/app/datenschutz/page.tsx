import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Datenschutz",
  alternates: { canonical: "/datenschutz" },
};

function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-heading mt-10 mb-3 text-xl font-bold text-primary">{children}</h2>;
}
function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-6 mb-2 font-semibold text-primary">{children}</h3>;
}
function P({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-sm leading-relaxed text-mediumdark">{children}</p>;
}

export default function DatenschutzPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading mb-2 text-3xl font-bold tracking-tight text-primary">Datenschutzerklärung</h1>
      <p className="text-sm text-mediumdark">Stand: 19. Oktober 2026</p>

      <H2>1. Verantwortlicher und Überblick</H2>
      <P>
        Verantwortlich für die Datenverarbeitung auf dieser Website ist Albert Sibert, Gämsenbergstraße 22, 71640
        Ludwigsburg, Deutschland, Telefon +49 176 92609041, E-Mail kontakt@mein-beamtenportal.de (siehe auch Impressum).
      </P>
      <P>
        Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Wir verarbeiten
        sie nur, soweit das für den Betrieb der Website, die Bearbeitung Ihrer Anfragen oder aufgrund Ihrer Einwilligung
        erforderlich ist. Einzelheiten zu jedem Dienst und jeder Funktion finden Sie unten.
      </P>

      <H2>2. Hosting und Domain</H2>
      <H3>Vercel</H3>
      <P>
        Anbieter ist die Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Beim Aufruf dieser Website
        verarbeitet Vercel technisch notwendige Zugriffsdaten (u. a. IP-Adresse, Datum und Uhrzeit, aufgerufene Seite,
        Browser- und Gerätedaten) in Server-Logfiles, um die Website auszuliefern und abzusichern. Die Daten können in die
        USA übermittelt werden. Vercel ist nach dem „EU-US Data Privacy Framework“ (DPF) zertifiziert; zusätzlich gilt
        mit Vercel ein Vertrag zur Auftragsverarbeitung (Data Processing Addendum) mit Standardvertragsklauseln.
        Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und zuverlässigen Bereitstellung der Website
        (Art. 6 Abs. 1 lit. f DSGVO).
      </P>
      <H3>IONOS (Domain und DNS)</H3>
      <P>
        Unsere Domain ist bei der IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Deutschland, registriert; IONOS
        betreibt außerdem die DNS-Einträge, die Ihren Browser zum richtigen Server leiten. Dabei verarbeitet IONOS
        technische Verbindungsdaten anfragender Systeme (z. B. IP-Adressen der DNS-Anfragen). Rechtsgrundlage ist unser
        berechtigtes Interesse an einer zuverlässigen Erreichbarkeit der Website (Art. 6 Abs. 1 lit. f DSGVO).
      </P>

      <H2>3. Allgemeine Hinweise und Pflichtinformationen</H2>
      <H3>Speicherdauer</H3>
      <P>
        Soweit in dieser Erklärung keine speziellere Speicherdauer genannt ist, speichern wir Ihre personenbezogenen
        Daten, bis der Zweck der Verarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine
        Einwilligung widerrufen, löschen wir Ihre Daten, sofern keine gesetzlichen Aufbewahrungspflichten (z. B. nach
        Steuer- oder Handelsrecht) entgegenstehen.
      </P>
      <H3>Rechtsgrundlagen</H3>
      <P>
        Wir verarbeiten Daten auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, bei besonderen Kategorien wie
        Gesundheitsdaten Art. 9 Abs. 2 lit. a DSGVO), zur Vertragserfüllung oder für vorvertragliche Maßnahmen (Art. 6
        Abs. 1 lit. b DSGVO), zur Erfüllung rechtlicher Pflichten (Art. 6 Abs. 1 lit. c DSGVO) oder auf Grundlage
        unseres berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO). Für das Speichern von Informationen auf Ihrem
        Endgerät oder den Zugriff darauf (z. B. Cookies) gilt zusätzlich § 25 TDDDG.
      </P>
      <H3>Empfänger und Datenübermittlung in Drittstaaten</H3>
      <P>
        Wir geben Daten nur an die in dieser Erklärung genannten Dienstleister weiter, soweit das für den jeweiligen
        Zweck erforderlich ist. Einige dieser Dienstleister haben ihren Sitz in den USA oder verarbeiten Daten dort. Die
        Übermittlung stützt sich auf das „EU-US Data Privacy Framework“ (soweit der Anbieter zertifiziert ist) oder auf
        Standardvertragsklauseln der EU-Kommission. In den USA kann ein mit der EU vergleichbares Datenschutzniveau nicht
        in jedem Fall garantiert werden.
      </P>
      <H3>Widerruf, Widerspruch, Ihre Rechte</H3>
      <P>
        Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Dazu genügt eine formlose
        E-Mail an kontakt@mein-beamtenportal.de; bei Cookie-Einwilligungen auch die Einstellung im Cookie-Banner. Soweit
        die Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO beruht, können Sie ihr aus Gründen, die sich aus Ihrer besonderen
        Situation ergeben, widersprechen. Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
        Verarbeitung, Datenübertragbarkeit und auf Beschwerde bei einer Aufsichtsbehörde. Zuständig ist der
        Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg, Lautenschlagerstraße 20,
        70173 Stuttgart.
      </P>
      <H3>SSL- bzw. TLS-Verschlüsselung</H3>
      <P>
        Diese Seite nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung
        erkennen Sie am „https://“ in der Adresszeile Ihres Browsers.
      </P>

      <H2>4. Datenerfassung auf dieser Website</H2>
      <H3>Cookies und Ihre Einwilligung</H3>
      <P>
        Beim ersten Besuch werden Sie über ein Cookie-Banner um Ihre Einwilligung gebeten. Technisch notwendig ist nur
        die Speicherung Ihrer Auswahl. Dienste zur Reichweitenmessung (Microsoft Clarity) und, falls wir Anzeigen
        schalten, zur Erfolgsmessung (Google Ads) werden erst nach Ihrer Einwilligung geladen. Ihre Entscheidung wird
        ausschließlich lokal in Ihrem Browser (Local Storage) gespeichert und nicht an uns übertragen. Rechtsgrundlage
        für die Speicherung Ihrer Auswahl ist unser berechtigtes Interesse, Ihre Entscheidung zu respektieren (Art. 6
        Abs. 1 lit. f DSGVO, § 25 Abs. 2 Nr. 2 TDDDG); die Einwilligung in die einzelnen Dienste beruht auf Art. 6 Abs. 1
        lit. a DSGVO und § 25 Abs. 1 TDDDG.
      </P>
      <H3>Kontaktaufnahme per E-Mail, Telefon oder WhatsApp</H3>
      <P>
        Wenn Sie uns per E-Mail, Telefon oder WhatsApp kontaktieren, verarbeiten wir Ihre Anfrage samt Kontaktdaten zur
        Bearbeitung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage mit einem Vertrag oder
        vorvertraglichen Maßnahmen zusammenhängt, sonst unser berechtigtes Interesse an der effektiven Bearbeitung von
        Anfragen (Art. 6 Abs. 1 lit. f DSGVO). WhatsApp wird von der WhatsApp Ireland Limited, 4 Grand Canal Square,
        Grand Canal Harbour, Dublin 2, Irland, betrieben. Die Inhalte sind Ende-zu-Ende-verschlüsselt, WhatsApp erhält
        jedoch Metadaten (z. B. Absender, Empfänger, Zeitpunkt) und teilt sie nach eigenen Angaben mit der Konzernmutter
        Meta in den USA (Datenschutzrichtlinie: www.whatsapp.com/legal/#privacy-policy). Die Verbindungen zu WhatsApp
        entstehen erst, wenn Sie einen WhatsApp-Link anklicken. Sie können auf Wunsch jederzeit auf E-Mail oder Telefon
        ausweichen.
      </P>
      <H3>Terminbuchung über Cal</H3>
      <P>
        Für die Terminbuchung verlinken wir auf unseren Buchungskalender bei Cal.com (Anbieter: Cal.com, Inc., 2093
        Philadelphia Pike #1227, Claymont, Delaware 19703, USA). Beim Klick auf den Link wechseln Sie auf die Seite des Anbieters; dort geben Sie
        Name, E-Mail-Adresse und Wunschtermin ein. Die Daten werden zur Planung, Durchführung und Nachbereitung des
        Termins verwendet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Auf unserer Landingpage für Referendare
        (Qualifizierungscheck) übergeben wir beim Klick auf die Terminbuchung zusätzlich Ihre Angaben zu Schulform,
        Start des Referendariats und Geburtsjahr als Notiz an den Kalender, damit wir uns vorbereiten können.
      </P>
      <H3>Anmeldung zum Webinar</H3>
      <P>
        Wenn Sie sich zu einem Webinar vormerken lassen, verarbeiten wir Ihren Namen und Ihre E-Mail-Adresse, um Ihnen
        die Teilnahmedaten (Teams-Link, Termin als Kalenderdatei) und Erinnerungen zu diesem Webinar zu senden. Der
        Versand erfolgt über Mailjet (siehe Ziffer 6); Ihre Adresse wird dafür in einer Kontaktliste bei Mailjet
        gespeichert, die nur für diesen Termin angelegt wird. Das Webinar selbst findet über Microsoft Teams statt (siehe
        Ziffer 8). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Durchführung der von Ihnen gewünschten Anmeldung).
        Nach dem Webinar löschen wir die Liste dieses Termins und Ihre darin gespeicherten Kontaktdaten, sofern Sie nicht
        in weitere Einladungen eingewilligt haben (siehe unten). Wenn Sie keine Erinnerungen mehr möchten, genügt eine
        kurze Antwort auf eine der E-Mails.
      </P>
      <H3>Einladungen zu weiteren Webinaren und Themen (optional)</H3>
      <P>
        Bei der Anmeldung können Sie freiwillig einwilligen, dass wir Sie auch zu weiteren Webinaren und Themen für Beamte
        per E-Mail einladen. Die Einwilligung wird im Double-Opt-in-Verfahren bestätigt: Sie erhalten eine E-Mail mit einem
        Bestätigungslink, erst mit dem Klick wird Ihre Adresse in die Einladungsliste bei Mailjet aufgenommen. Rechtsgrundlage
        ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie können sie jederzeit widerrufen, über den Abmeldelink in jeder
        dieser E-Mails oder formlos an kontakt@mein-beamtenportal.de. Ihre Adresse bleibt bis zu Ihrem Widerruf gespeichert
        und wird danach gelöscht bzw. nur noch vorgehalten, um künftige E-Mails zu verhindern.
      </P>
      <H3>BU-Check und Rechner</H3>
      <P>
        Beim BU-Check beantworten Sie Fragen zu Status, Berufsbereich, Alter, ungefährem Netto, Dienstzeit und
        gegebenenfalls zu einem bestehenden Vertrag (Rente, Beitrag, Vertragsbedingungen). Die Berechnung des Ergebnisses
        erfolgt in Ihrem Browser. Erst wenn Sie das Formular für die persönliche Einschätzung absenden (Name, E-Mail,
        optional Telefon), übermitteln wir die Angaben an uns und senden Ihnen eine Bestätigung. Rechtsgrundlage ist
        Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) für die Kontaktaufnahme; Sie können sie jederzeit widerrufen.
        Gesundheitsdaten werden im BU-Check nicht abgefragt. Der Pensionsrechner auf der Startseite arbeitet vollständig
        in Ihrem Browser; die eingegebenen Werte werden nicht an uns übermittelt.
      </P>
      <H3>Landingpage für Referendare in Baden-Württemberg</H3>
      <P>
        Der dortige Qualifizierungscheck fragt Schulform, Starttermin, Geburtsjahr und Ihre Einschätzung zu
        Vorerkrankungen ab. Die Auswertung erfolgt in Ihrem Browser; Ihre Antwort zur Gesundheit wird nicht gespeichert
        und nicht an Tracking- oder Werbedienste übermittelt. Wählen Sie die Antwort „keine Vorerkrankungen“, können Sie
        einen Termin im Kalender buchen oder uns per WhatsApp schreiben; dabei werden Schulform, Start und Geburtsjahr
        in die Terminnotiz bzw. die WhatsApp-Nachricht übernommen. Wählen Sie „Vorerkrankungen / laufende Behandlungen“,
        können Sie eine persönliche Einordnung anfragen. Dafür verarbeiten wir Ihre E-Mail-Adresse, optional Ihren
        Vornamen, die Angaben aus dem Check und die Information, dass Vorerkrankungen oder laufende Behandlungen
        bestehen (Gesundheitsdaten). Einzelheiten zu Erkrankungen fragen wir nicht ab. Rechtsgrundlage ist Ihre
        ausdrückliche Einwilligung (Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a DSGVO), die Sie im Formular erteilen und
        jederzeit widerrufen können. Der Versand erfolgt über Mailjet (siehe Ziffer 6).
      </P>

      <H2>5. Analyse und Marketing</H2>
      <H3>Vercel Analytics</H3>
      <P>
        Wir nutzen Vercel Analytics zur Reichweitenmessung. Anbieter ist die Vercel Inc. (Anschrift siehe Ziffer 2). Nach
        Angaben des Anbieters arbeitet der Dienst ohne Cookies und ohne persönliche Kennungen; es werden aggregierte
        Nutzungsdaten (z. B. Seitenaufrufe, Land, Browser) erhoben, IP-Adressen werden nicht gespeichert. Die Nutzung
        erfolgt auf Grundlage unseres berechtigten Interesses an der Optimierung unseres Angebots (Art. 6 Abs. 1 lit. f
        DSGVO). Eine Einwilligung nach § 25 TDDDG ist nach unserer Einschätzung nicht erforderlich, weil keine
        Informationen auf Ihrem Endgerät gespeichert oder ausgelesen werden.
      </P>
      <H3>Microsoft Clarity</H3>
      <P>
        Mit Ihrer Einwilligung nutzen wir Microsoft Clarity. Anbieter ist die Microsoft Ireland Operations Limited, One
        Microsoft Place, South County Business Park, Leopardstown, Dublin 18, Irland. Clarity erfasst, wie Besucher mit
        der Website interagieren (u. a. Klicks, Scrollverhalten, Mausbewegungen, besuchte Seiten, Geräte- und
        Browserinformationen) und kann daraus Heatmaps und Sitzungsaufzeichnungen erstellen. Dabei können Cookies
        gesetzt und Daten auch in den USA verarbeitet werden. Microsoft ist nach dem „EU-US Data Privacy Framework“
        zertifiziert. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG), die Sie
        jederzeit über das Cookie-Banner widerrufen können.
      </P>
      <H3>Google Ads (Conversion-Messung)</H3>
      <P>
        Wenn Sie über eine Google-Anzeige auf unsere Website gelangen und dem Marketing-Dienst im Cookie-Banner
        zustimmen, nutzen wir den Google-Tag von Google Ads. Anbieter ist die Google Ireland Limited, Gordon House,
        Barrow Street, Dublin 4, Irland (in den USA: Google LLC). Wir messen damit, welche Anzeigen zu Terminbuchungen
        oder Anfragen führen (Conversions). Dabei können Cookies gesetzt sowie IP-Adresse, Browser- und
        Geräteinformationen, besuchte Seiten und Conversion-Ereignisse an Google übermittelt werden, auch in die USA. Wir
        verwenden den Google Consent Mode: Ohne Ihre Einwilligung wird der Tag nicht geladen und es werden keine Daten an
        Google übermittelt. Ihre Angabe zur Gesundheit im Qualifizierungscheck wird an Google nicht übermittelt. Google
        ist nach dem „EU-US Data Privacy Framework“ zertifiziert. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1
        lit. a DSGVO, § 25 Abs. 1 TDDDG). Mehr dazu: policies.google.com/privacy.
      </P>

      <H2>6. E-Mail-Versand (Mailjet)</H2>
      <P>
        E-Mails, die Sie über unsere Formulare auslösen (Bestätigung der Webinar-Anmeldung und Erinnerungen, Bestätigung
        und Auswertung zum BU-Check, Bestätigung einer Anfrage) sowie interne Benachrichtigungen versenden wir über den
        Dienst Mailjet. Anbieter ist die Mailgun Technologies Inc., 112 E Pecan St. #1135, San Antonio, Texas 78205, USA
        (Mailjet). Dabei werden E-Mail-Adressen, Namen und der Inhalt der E-Mails bei Mailjet verarbeitet; Mailjet kann
        außerdem Zustell- und Öffnungsdaten erfassen. Die Datenübertragung in die USA wird auf Standardvertragsklauseln
        der EU-Kommission gestützt; mit Mailjet besteht ein Vertrag zur Auftragsverarbeitung. Rechtsgrundlage ist Art. 6
        Abs. 1 lit. b DSGVO bzw. unser berechtigtes Interesse an einem zuverlässigen E-Mail-Versand (Art. 6 Abs. 1
        lit. f DSGVO).
      </P>

      <H2>7. Schriften, Bilder und externe Links</H2>
      <P>
        Die verwendeten Schriften (Raleway, Mulish, Caveat) und Bilder werden von unserem eigenen Server ausgeliefert. Es
        findet dabei keine Verbindung zu Google oder anderen Anbietern statt. Links zu externen Seiten (z. B. die
        ProvenExpert-Bewertungen, LinkedIn oder WhatsApp) führen erst beim Anklicken zu den jeweiligen Anbietern; für
        deren Datenverarbeitung gelten deren Datenschutzerklärungen.
      </P>

      <H2>8. Audio- und Videokonferenzen (Microsoft Teams)</H2>
      <P>
        Für Webinare und Beratungsgespräche nutzen wir ggf. Microsoft Teams. Anbieter ist die Microsoft Ireland
        Operations Limited (Anschrift siehe Ziffer 5). Dabei werden u. a. Name, E-Mail-Adresse, IP-Adresse sowie bei
        Teilnahme Audio- und Videodaten verarbeitet. Rechtsgrundlage
        ist Art. 6 Abs. 1 lit. b DSGVO bzw. unser berechtigtes Interesse an effektiver Kommunikation (Art. 6 Abs. 1
        lit. f DSGVO). Details: privacy.microsoft.com/de-de/privacystatement.
      </P>
    </article>
  );
}
