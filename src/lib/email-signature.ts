import { BOOKING_LINK } from "@/lib/content";

const BASE_URL = "https://www.mein-beamtenportal.de";
// Fest als eigene Konstante statt BASE_URL: Manche Mail-Clients folgen bei
// <img> keinem Redirect (gebrochenes Bild), daher unabhängig fixiert. PNG
// statt SVG: die meisten Mail-Clients (v.a. Outlook) stellen SVG in E-Mails
// gar nicht oder kaputt dar.
// Das Logo wird zusätzlich als eingebettetes Bild (cid) mitgeschickt, damit es
// auch dann erscheint, wenn der Mail-Client externe Bilder blockiert.
const LOGO_CID = "logo-signatur";
const LOGO_BASE64 =
  "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";

export const SIGNATURE_INLINED_ATTACHMENTS = [
  {
    ContentType: "image/png",
    Filename: "logo-signatur.png",
    ContentID: LOGO_CID,
    Base64Content: LOGO_BASE64,
  },
];

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

  <img src="cid:${LOGO_CID}" alt="Mein Beamtenportal" width="134" height="56" style="display:block;height:56px;width:134px;margin:0 0 12px -8px;border:0;font-size:14px;color:#0c2d52;" />

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
