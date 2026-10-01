import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, X, Clock, Users, Video, Star, ShieldCheck, ArrowRight } from "lucide-react";
import { WebinarForm } from "./WebinarForm";
import { WebinarCountdown } from "./WebinarCountdown";
import { BOOKING_LINK } from "@/lib/content";
import { WEBINAR_TITLE, getNextWebinar } from "@/lib/webinar-config";

// Termine rollen monatlich weiter (siehe webinar-config.ts). Stündliche
// Revalidierung reicht, damit Seite, Schema und Metadaten auf den nächsten
// Termin springen, sobald der aktuelle vorbei ist.
export const revalidate = 3600;

// Echte, bereits auf der Startseite verwendete Bewertungen (siehe
// TestimonialStrip.tsx) - keine erfundenen Stimmen.
const TRUST_QUOTES = [
  {
    initials: "M. B.",
    role: "Lehramtsstudent",
    quote:
      'Immer freundlich und stets bereit für Rückfragen. Auch das "Mit-rein-nehmen" in die Thematik und das gute Erklären hat mir gefallen.',
  },
  {
    initials: "J. W.",
    role: "Lehrerin",
    quote:
      "Die Beratung durch Herrn Sibert war sehr angenehm, kompetent und zielführend. Er geht auf Wünsche individuell ein und nimmt sich während der Termine sehr viel Zeit.",
  },
];

function buildDescription(dateDisplay: string, timeDisplay: string) {
  return `Kostenfreies Live-Webinar für Beamte, Referendare und Anwärter am ${dateDisplay}, ${timeDisplay}: Anwartschaft, Beihilfe, PKV und Dienstunfähigkeit verständlich erklärt. Jetzt kostenfrei anmelden.`;
}

export function generateMetadata(): Metadata {
  const { dateDisplay, timeDisplay } = getNextWebinar();
  return {
    title: WEBINAR_TITLE,
    description: buildDescription(dateDisplay, timeDisplay),
    alternates: { canonical: "/webinar" },
  };
}

const LERNZIELE = [
  "Wie die Anwartschaftsversicherung funktioniert und warum ein früher Abschluss im Studium oder Referendariat bares Geld spart.",
  "Welchen Beihilfesatz Sie in Ihrem Bundesland bekommen und was das für Ihre PKV-Tarifwahl bedeutet.",
  "Die häufigsten Fehler bei der Gesundheitsprüfung – und wie Sie sie vermeiden, bevor sie zum Problem werden.",
  "Warum eine Dienstunfähigkeitsversicherung gerade in den ersten Dienstjahren so wichtig ist und worauf es bei den Bedingungen ankommt.",
  "Was bei der Öffnungsaktion zu beachten ist und bis wann Sie sie nutzen können.",
  "Worin sich PKV-Gesellschaften bei Beihilfe-konformen Tarifen, Alterungsrückstellungen und Beitragsentwicklung wirklich unterscheiden – und worauf Sie beim Vergleich achten sollten.",
  "Wie Sie in 45 Minuten selbst einschätzen, wo bei Ihnen persönlich noch Lücken bestehen.",
];

const FUER_WEN = [
  "Sie studieren auf Lehramt oder ein anderes verbeamtungsfähiges Fach und wollen sich früh absichern.",
  "Sie stehen kurz vor dem Referendariat, der Anwärterzeit oder der Verbeamtung auf Probe.",
  "Sie sind bereits verbeamtet, aber unsicher, ob Beihilfe, PKV und Dienstunfähigkeitsschutz wirklich zusammenpassen.",
  "Sie wollen verstehen, wie die einzelnen Bausteine (Anwartschaft, Beihilfe, PKV, DU) ineinandergreifen, bevor Sie etwas unterschreiben.",
];

const NICHT_FUER_WEN = [
  "Sie suchen nur eine schnelle Preisliste oder einen Online-Sofortabschluss.",
  "Sie stehen kurz vor der Pensionierung und wollen ausschließlich Ihre Pensionshöhe berechnen.",
  "Sie suchen jemanden, der Ihnen einfach irgendeinen Vertrag verkauft.",
];

function buildFaq(dateDisplay: string, timeDisplay: string) {
  return [
    {
      question: "Wann findet das Webinar statt?",
      answer: `Am ${dateDisplay} um ${timeDisplay}, ca. 45 Minuten Vortrag plus Live-Fragerunde, online via Microsoft Teams. Den Teams-Link erhalten Sie nach der Anmeldung sowie als Kalendereintrag zum direkten Speichern per E-Mail.`,
    },
    {
      question: "Kostet die Teilnahme etwas?",
      answer: "Nein, die Teilnahme ist komplett kostenfrei.",
    },
    {
      question: "Ich bin noch Student bzw. Studentin – lohnt sich das Webinar für mich schon?",
      answer:
        "Gerade dann. Die Anwartschaftsversicherung und die ersten Weichenstellungen bei Beihilfe und PKV lassen sich am günstigsten früh stellen, idealerweise schon während des Studiums oder zu Beginn des Referendariats.",
    },
    {
      question: "Was ist eine Anwartschaftsversicherung und brauche ich die wirklich?",
      answer:
        "Sie sichert Ihnen die Konditionen der privaten Krankenversicherung zu einem frühen Zeitpunkt, ohne dass Sie zu diesem Zeitpunkt schon Beiträge in voller Höhe zahlen. Ob und welche Form für Sie sinnvoll ist, ordne ich im Webinar konkret ein.",
    },
    {
      question: "Geht es im Webinar auch um meine Pension oder Pensionshöhe?",
      answer:
        "Nein, das Webinar richtet sich an Berufseinsteiger und Beamte in den ersten Dienstjahren. Es geht um Anwartschaft, Beihilfe, PKV und Dienstunfähigkeit – nicht um die Berechnung Ihrer späteren Pensionshöhe.",
    },
    {
      question: "Muss ich live dabei sein?",
      answer:
        "Eine Aufzeichnung gibt es nicht – wer den Termin nicht wahrnehmen kann, meldet sich einfach bei mir, dann vereinbaren wir stattdessen ein kurzes persönliches Gespräch.",
    },
    {
      question: "Wird im Webinar ein bestimmtes Produkt verkauft?",
      answer:
        "Nein. Das Webinar ordnet die typischen Fallstricke rund um Beihilfe, PKV und Dienstunfähigkeit unabhängig ein, ohne Empfehlung eines bestimmten Anbieters. Individuelle Fragen zu Ihrer Situation lassen sich im Anschluss in einem kostenfreien Erstgespräch klären.",
    },
    {
      question: "Gibt es nach dem Vortrag die Möglichkeit für individuelle Fragen?",
      answer:
        "Ja, direkt im Anschluss ist Zeit für Ihre Fragen live im Webinar eingeplant. Für alles, was darüber hinausgeht oder Ihre konkrete Situation betrifft, biete ich danach ein kostenfreies Erstgespräch an.",
    },
  ];
}

function CtaButton({ label = "Jetzt kostenlos anmelden" }: { label?: string }) {
  return (
    <a
      href="#anmelden"
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
    >
      {label}
      <ArrowRight className="size-4" />
    </a>
  );
}

export default function WebinarPage() {
  const { startIso, endIso, dateDisplay, timeDisplay } = getNextWebinar();
  const description = buildDescription(dateDisplay, timeDisplay);
  const faq = buildFaq(dateDisplay, timeDisplay);

  return (
    <article className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: WEBINAR_TITLE,
            description,
            startDate: startIso,
            endDate: endIso,
            eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: { "@type": "VirtualLocation", url: "https://www.mein-beamtenportal.de/webinar" },
            organizer: {
              "@type": "Person",
              name: "Albert Sibert",
              url: "https://www.mein-beamtenportal.de/ueber-uns",
            },
            isAccessibleForFree: true,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />

      {/* Hero */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 pt-16 pb-10">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Kostenfreies Live-Webinar · {dateDisplay}
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-primary md:text-4xl">
          {WEBINAR_TITLE}
        </h1>
        <p className="text-lg text-mediumdark">
          Für alle auf dem Weg in die Verbeamtung – vom Studium über das
          Referendariat bis zu den ersten Dienstjahren. In 45 Minuten zeige ich
          Ihnen live, wie Anwartschaft, Beihilfe, PKV und Dienstunfähigkeitsschutz
          zusammenspielen – und worauf Sie achten müssen, bevor Sie etwas
          unterschreiben.
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-mediumdark">
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <Clock className="size-4 text-primary" />
            {dateDisplay} · {timeDisplay} · 45 Min.
          </span>
          <span className="flex items-center gap-1.5">
            <Video className="size-4 text-primary" />
            Online via Microsoft Teams
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4 text-primary" />
            Kostenfrei
          </span>
        </div>

        <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center">
          <WebinarCountdown startIso={startIso} />
          <CtaButton />
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-mediumlight/40 pt-4 text-xs text-mediumdark">
          <span className="flex items-center gap-1.5">
            <Star className="size-3.5 fill-primary text-primary" />
            4,9/5 Sterne bei ProvenExpert
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary" />
            Finanzplaner nach §34d &amp; §34f GewO
          </span>
        </div>
      </div>

      {/* Anmeldung */}
      <div id="anmelden" className="scroll-mt-20 bg-base">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-start">
          <div className="flex flex-1 flex-col gap-3">
            <h2 className="font-heading text-2xl font-bold text-primary">Jetzt kostenlos anmelden</h2>
            <p className="text-sm text-mediumdark">
              {dateDisplay}, {timeDisplay}. Sie erhalten den Teams-Link direkt nach der
              Anmeldung sowie einen Kalendereintrag zum Speichern. Kurz vor dem Termin
              erinnere ich Sie noch einmal.
            </p>
            <p className="text-sm font-medium text-primary">
              Begrenzte Teilnehmerzahl, damit im Live-Teil jede Frage drankommt.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-mediumlight/40 sm:w-80 sm:shrink-0">
            <div className="flex items-center gap-3">
              <Image
                src="/albert-portrait.webp"
                alt="Albert Sibert, Finanzberater für Beamte"
                width={44}
                height={44}
                className="size-11 shrink-0 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-primary">Albert vom Beamtenportal</span>
                <span className="text-xs text-mediumdark">Finanzplaner nach §34d &amp; §34f GewO</span>
              </div>
            </div>
            <WebinarForm />
          </div>
        </div>
      </div>

      {/* Das nehmen Sie mit */}
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <h2 className="font-heading text-2xl font-bold text-primary">Das nehmen Sie mit</h2>
        <ul className="mt-6 flex flex-col gap-3">
          {LERNZIELE.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Für wen / nicht für wen */}
      <div className="bg-base">
        <div className="mx-auto grid w-full max-w-3xl gap-6 px-6 py-14 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-mediumlight/40">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">Für Sie, wenn</p>
            <ul className="flex flex-col gap-2.5">
              {FUER_WEN.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-mediumlight/40">
            <p className="text-xs font-semibold tracking-widest text-mediumdark uppercase">
              Eher nicht das Richtige, wenn
            </p>
            <ul className="flex flex-col gap-2.5">
              {NICHT_FUER_WEN.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-mediumdark">
                  <X className="mt-0.5 size-4 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {TRUST_QUOTES.map((t) => (
            <div key={t.initials} className="flex flex-col gap-3 rounded-xl bg-base p-5 ring-1 ring-mediumlight/40">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="size-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-mediumdark">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-xs font-medium text-primary">
                {t.initials} · {t.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-base">
        <div className="mx-auto w-full max-w-3xl px-6 py-14">
          <h2 className="font-heading mb-6 text-2xl font-bold text-primary">Häufige Fragen</h2>
          <div className="flex flex-col gap-3">
            {faq.map((item) => (
              <details key={item.question} className="rounded-xl bg-white p-5 ring-1 ring-mediumlight/40">
                <summary className="cursor-pointer font-medium text-primary">{item.question}</summary>
                <p className="mt-3 text-sm text-mediumdark">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Abschluss-CTA */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center">
        <h2 className="font-heading text-2xl font-bold text-primary">
          Sichern Sie sich jetzt Ihren Platz
        </h2>
        <p className="max-w-xl text-sm text-mediumdark">
          Kostenfrei, unverbindlich, {dateDisplay} um {timeDisplay}. Lieber direkt ein
          persönliches Gespräch?{" "}
          <Link href={BOOKING_LINK} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Erstgespräch buchen
          </Link>
          .
        </p>
        <CtaButton />
      </div>
    </article>
  );
}
