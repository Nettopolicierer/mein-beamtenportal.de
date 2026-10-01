import { BOOKING_LINK } from "@/lib/content";

const BASE_URL = "https://mein-beamtenportal.de";
// Fest als eigene Konstante statt BASE_URL: Manche Mail-Clients folgen bei
// <img> keinem Redirect (gebrochenes Bild), daher unabhängig fixiert. PNG
// statt SVG: die meisten Mail-Clients (v.a. Outlook) stellen SVG in E-Mails
// gar nicht oder kaputt dar.
const LOGO_URL = "https://www.mein-beamtenportal.de/logo-signatur.png";

export const EMAIL_SIGNATURE_TEXT = `Beste Grüße
Albert vom Beamtenportal

────────────────────

Mein Beamtenportal
Albert Sibert
+49 176 92609041 | kontakt@mein-beamtenportal.de
Termin buchen: ${BOOKING_LINK}
Webseite: ${BASE_URL}
Impressum: ${BASE_URL}/impressum

Registrierungsnummer § 34d GewO: D-4EHE-G249E-13
Ich bin als Versicherungsvertreter (mit Erlaubnis gem. § 34d Absatz 1 Gewerbeordnung) im Bereich Versicherungen tätig.
Registrierungsnummer § 34f GewO: D-F-153-CFZK-26
Die Erlaubnis zur Finanzanlagenvermittlung gem. § 34f Absatz 1 Satz 1 Nr. 1 Gewerbeordnung wurde mir durch die IHK Region Stuttgart erteilt.

Die Eintragungen im Vermittlerregister können beim Deutschen Industrie- und Handelskammertag (DIHK) e.V., Breite Straße 29, 10178 Berlin, Telefon: 0180 6 00 58 50 (20 Cent je Anruf aus dem deutschen Festnetz, maximal 60 Cent je Anruf aus dem Mobilfunknetz) sowie im Internet unter http://www.vermittlerregister.info abgefragt werden.
Schlichtungsstelle: Schlichtungsstelle für gewerbliche Versicherungs-, Anlage- und Kreditvermittlung, Glockengießerwall 2, 20095 Hamburg; www.schlichtung-finanzberatung.de

Diese E-Mail enthält vertrauliche und/oder rechtlich geschützte Informationen. Wenn Sie nicht der richtige Adressat sind bzw. für den Empfang nicht autorisiert sind oder diese E-Mail irrtümlich erhalten haben, informieren Sie bitte den Absender und vernichten Sie diese E-Mail.`;

export const EMAIL_SIGNATURE_HTML = `
<div style="margin-top:32px;padding-top:24px;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <p style="margin:0 0 12px;font-size:14px;">Beste Grüße<br/>Albert vom Beamtenportal</p>

  <p style="margin:0 0 20px;border-top:1px solid #ccc;width:180px;font-size:1px;line-height:1px;">&nbsp;</p>

  <img src="${LOGO_URL}" alt="Mein Beamtenportal" height="36" style="display:block;height:36px;width:auto;margin:0 0 16px;" />

  <p style="margin:0 0 2px;font-size:14px;font-weight:700;">Albert Sibert</p>
  <p style="margin:0 0 2px;font-size:14px;">+49 176 92609041 | kontakt@mein-beamtenportal.de</p>
  <p style="margin:0 0 2px;font-size:14px;"><span style="font-weight:700;">Termin buchen</span> <a href="${BOOKING_LINK}" style="color:#1a1a1a;">${BOOKING_LINK}</a></p>
  <p style="margin:0 0 2px;font-size:14px;"><span style="font-weight:700;">Webseite</span> <a href="${BASE_URL}" style="color:#1a1a1a;">${BASE_URL}</a></p>
  <p style="margin:0 0 20px;font-size:14px;"><span style="font-weight:700;">Impressum</span> <a href="${BASE_URL}/impressum" style="color:#1a1a1a;">${BASE_URL}/impressum</a></p>

  <p style="margin:0 0 4px;font-size:13px;line-height:1.6;color:#1a1a1a;">
    Registrierungsnummer § 34d GewO: D-4EHE-G249E-13. Ich bin als Versicherungsvertreter
    (mit Erlaubnis gem. § 34d Absatz 1 Gewerbeordnung) im Bereich Versicherungen tätig.
  </p>
  <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#1a1a1a;">
    Registrierungsnummer § 34f GewO: D-F-153-CFZK-26. Die Erlaubnis zur
    Finanzanlagenvermittlung gem. § 34f Absatz 1 Satz 1 Nr. 1 Gewerbeordnung wurde mir
    durch die IHK Region Stuttgart erteilt.
  </p>
  <p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#1a1a1a;">
    Die Eintragungen im Vermittlerregister können bei dem Deutschen Industrie- und
    Handelskammertag (DIHK) e.V., Breite Straße 29, 10178 Berlin, Telefon: 0180 6 00 58 50
    (20 Cent je Anruf aus dem deutschen Festnetz, maximal 60 Cent je Anruf aus dem
    Mobilfunknetz) als auch im Internet unter
    <a href="http://www.vermittlerregister.info" style="color:#1a1a1a;">www.vermittlerregister.info</a>
    abgefragt werden. Schlichtungsstelle: Schlichtungsstelle für gewerbliche Versicherungs-,
    Anlage- und Kreditvermittlung, Glockengießerwall 2, 20095 Hamburg;
    <a href="https://www.schlichtung-finanzberatung.de" style="color:#1a1a1a;">www.schlichtung-finanzberatung.de</a>
  </p>

  <p style="margin:0;font-size:12px;line-height:1.6;color:#777;">
    Diese E-Mail enthält vertrauliche und/oder rechtlich geschützte Informationen. Wenn Sie
    nicht der richtige Adressat sind bzw. für den Empfang nicht autorisiert sind oder diese
    E-Mail irrtümlich erhalten haben, informieren Sie bitte den Absender und vernichten Sie
    diese E-Mail.
  </p>
</div>`;
