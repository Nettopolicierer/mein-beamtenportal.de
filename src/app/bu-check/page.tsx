import type { Metadata } from "next";
import Image from "next/image";
import { ClipboardCheck, MessageCircle, FileSearch, Star, ShieldCheck } from "lucide-react";
import { BuCheckQuiz } from "./BuCheckQuiz";

export const metadata: Metadata = {
  title: "BU-Check für Beamte: Wie gut sind Sie abgesichert?",
  description:
    "Kostenfreier BU- und Dienstunfähigkeits-Check für Beamte, Referendare und Anwärter. In 1 Minute zur persönlichen Einschätzung, unabhängig und unverbindlich.",
  alternates: { canonical: "/bu-check" },
};

// Echte, bereits auf der Startseite verwendete Bewertungen - keine erfundenen Stimmen.
const QUOTES = [
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

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "1. Wenige kurze Fragen",
    text: "Status, Alter, Netto und, falls vorhanden, grobe Eckdaten Ihres Vertrags. Unterlagen brauchen Sie nicht.",
  },
  {
    icon: FileSearch,
    title: "2. Sofort-Ergebnis",
    text: "Sie sehen direkt eine grobe Spanne Ihrer Versorgungslücke und eine Ampel für Ihren Vertrag.",
  },
  {
    icon: MessageCircle,
    title: "3. Kostenfreies Gespräch",
    text: "Auf Wunsch besprechen wir die Optionen. Ohne Verkaufsdruck, auch wenn Sie nur vergleichen möchten.",
  },
];

const FAQ = [
  {
    question: "Was kostet der BU-Check?",
    answer: "Nichts. Der Check und das Erstgespräch sind kostenfrei und unverbindlich.",
  },
  {
    question: "Ist das eine BU oder eine Dienstunfähigkeitsversicherung?",
    answer:
      "Für Beamte ist meist eine Dienstunfähigkeitsversicherung (DU) die passende Lösung, oft mit Dienstunfähigkeitsklausel. Welche Variante bei Ihnen sinnvoll ist, hängt von Status und Laufbahn ab und wird im Check eingeordnet.",
  },
  {
    question: "Ich habe schon einen Vertrag. Lohnt sich der Check trotzdem?",
    answer:
      "Ja. Viele bestehende Verträge sind für Beamte nicht optimal formuliert. Ich schaue mit Ihnen auf Bedingungen, Höhe und Lücken, ohne dass Sie wechseln müssen.",
  },
  {
    question: "Muss ich Gesundheitsdaten angeben?",
    answer:
      "Hier im Check nicht. Gesundheitsfragen sind erst relevant, wenn Sie wirklich einen Antrag stellen möchten, und werden dann persönlich und anonym vorgeklärt.",
  },
  {
    question: "Werden mir Verträge aufgedrängt?",
    answer:
      "Nein. Ich arbeite unabhängig und erkläre Ihnen die Optionen verständlich. Ob Sie etwas abschließen, entscheiden allein Sie.",
  },
];

export default function BuCheckPage() {
  return (
    <article className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />

      {/* Hero mit eingebettetem Quiz */}
      <section className="bg-base">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 sm:py-16 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Kostenfreier BU-Check für Beamte
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-balance text-primary sm:text-5xl">
              Wie gut sind Sie bei Dienstunfähigkeit wirklich abgesichert?
            </h1>
            <p className="text-lg text-mediumdark">
              Beantworten Sie wenige kurze Fragen und sehen Sie sofort, wie groß Ihre Versorgungslücke bei
              Dienstunfähigkeit ungefähr ist und ob Ihr Vertrag passt. Verständlich und ohne Verpflichtung.
            </p>
            <div className="flex items-center gap-3">
              <Image src="/proven-expert.webp" alt="ProvenExpert" width={54} height={54} className="rounded-full" />
              <div className="flex flex-col text-sm text-mediumdark">
                <span className="flex items-center gap-0.5 text-[#e8742b]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </span>
                <span>4,90 von 5 Sternen auf ProvenExpert</span>
              </div>
            </div>
          </div>

          <div id="check" className="scroll-mt-24 rounded-2xl border border-mediumlight/60 bg-white p-6 shadow-xl shadow-primary/5 sm:p-8">
            <BuCheckQuiz />
          </div>
        </div>
      </section>

      {/* So läuft's ab */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="font-heading mb-8 text-2xl font-bold text-primary sm:text-3xl">So funktioniert der Check</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-mediumlight/50 p-6">
              <s.icon className="mb-3 size-7 text-primary" />
              <h3 className="mb-1.5 font-semibold text-primary">{s.title}</h3>
              <p className="text-sm text-mediumdark">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Über mich + Bewertungen */}
      <section className="bg-base">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1fr_2fr]">
          <div className="flex flex-col items-start gap-4">
            <Image
              src="/albert-portrait.webp"
              alt="Albert Sibert, unabhängiger Berater für Beamte"
              width={160}
              height={160}
              className="rounded-2xl"
            />
            <div>
              <h2 className="font-heading text-xl font-bold text-primary">Albert Sibert</h2>
              <p className="text-sm text-mediumdark">
                Unabhängiger Berater für Beamte, Referendare und Anwärter. Mein Schwerpunkt: Dienstunfähigkeit,
                Beihilfe und PKV.
              </p>
            </div>
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <ShieldCheck className="size-5" />
              Mehr als 300 Beamte beraten
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {QUOTES.map((q) => (
              <figure key={q.initials} className="rounded-2xl bg-white p-6 shadow-sm">
                <blockquote className="text-sm text-mediumdark">&bdquo;{q.quote}&ldquo;</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-primary">
                  {q.initials}, {q.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="font-heading mb-6 text-2xl font-bold text-primary sm:text-3xl">Häufige Fragen</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map((item) => (
            <details key={item.question} className="group rounded-xl border border-mediumlight/60 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold text-primary">{item.question}</summary>
              <p className="mt-3 text-sm text-mediumdark">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Abschluss-CTA */}
      <section className="bg-primary">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-14 text-center">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Finden Sie in einer Minute heraus, wo Sie stehen.
          </h2>
          <a
            href="#check"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90"
          >
            Kostenfreien BU-Check starten
          </a>
        </div>
      </section>
    </article>
  );
}
