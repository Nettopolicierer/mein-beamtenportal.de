import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { SORTED_POSTS, formatDate, BOOKING_LINK } from "@/lib/content";
import { TestimonialStrip } from "@/components/TestimonialStrip";
import { PensionCalculator } from "@/components/PensionCalculator";
import { Reveal } from "@/components/Reveal";

const LEISTUNGSVERSPRECHEN = [
  "Eine umfassende Analyse Ihrer aktuellen Absicherung",
  "Den passenden PKV-Tarif abgestimmt auf Beihilfesatz und Laufbahn",
  "Berechnung Ihrer voraussichtlichen Pension und möglicher Lücken (auch bei Beamten auf Widerruf/Probe)",
  "Unabhängige Beratung zu Dienstunfähigkeitsversicherung und Altersvorsorge",
  "Antworten auf Ihre konkreten Fragen zu Bezügen, Fristen und Anträgen",
  "Persönliche Betreuung und schnelle Rückmeldung bei Fristen",
];

const STATS = [
  { value: "Ø 66,7 %", label: "Ruhegehaltssatz bei der Beamtenpension – den Höchstsatz von 71,75 % erreichen nur wenige.", source: 1 },
  { value: "50–90 %", label: "übernimmt die Beihilfe je Bundesland von den Krankheitskosten – der Rest läuft über die Krankenversicherung.", source: 2 },
  { value: "1,79 %", label: "mehr Pension bringt jedes volle Dienstjahr nach dem Beamtenversorgungsgesetz.", source: 1 },
];

const BENEFITS = [
  {
    title: "250 Gesellschaften statt 5 Tarife",
    text: "Die meisten Berater zeigen Ihnen das Portfolio ihres Arbeitgebers. Ich habe selbst bei einer auf den öffentlichen Dienst spezialisierten PKV gearbeitet – und mich bewusst gegen die Bindung an ein Portfolio entschieden.",
  },
  {
    title: `${SORTED_POSTS.length} Artikel, bevor Sie anrufen`,
    text: "Werfen Sie vorher einen Blick in meinen Ratgeber: ausführliche Antworten zu Beihilfe, PKV, Pension und Dienstunfähigkeit – bevor Sie überhaupt mit mir sprechen.",
  },
  {
    title: "Kein Callcenter, kein Sachbearbeiter",
    text: "Sie schreiben oder rufen mich direkt an, nicht eine Hotline. Rückmeldung meist noch am selben Tag.",
  },
  {
    title: "Digital, wenn's passt",
    text: "Termine per Video, Vertragsunterschrift per E-Signatur, alles einsehbar in der Finanz-App – ohne dass Sie deshalb einen Termin vor Ort verlieren.",
  },
];

export default function Home() {
  const latest = SORTED_POSTS.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-base">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-16 pb-0 sm:pt-20 lg:grid-cols-2">
          <div>
            <h1 className="font-hand text-6xl leading-none font-bold text-primary sm:text-7xl">
              Mein Beamtenportal
            </h1>
            <p className="font-hand mt-3 text-3xl text-balance text-primary sm:text-4xl">
              Pension, Beihilfe und PKV verstehen.
            </p>
            <p className="mt-6 max-w-md text-mediumdark">
              Ihr unabhängiges Informationsportal für Vorsorge, Beihilfe und Absicherung im
              öffentlichen Dienst.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={BOOKING_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Kostenfreies Erstgespräch
              </Link>
              <Link
                href="/ratgeber"
                className="rounded-lg border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                Beratung
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Image src="/proven-expert.webp" alt="ProvenExpert" width={40} height={40} unoptimized />
              <Image src="/stars.svg" alt="" width={90} height={16} unoptimized />
              <span className="text-sm text-mediumdark">4,90 von 5 Sternen</span>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-sm lg:max-w-none lg:max-h-[520px]">
            <Image
              src="/hero-illustration.png"
              alt="Mein Beamtenportal"
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
        </div>

        <div className="border-t border-mediumlight/40">
          <div className="mx-auto flex max-w-6xl flex-col divide-y divide-mediumlight/40 px-6 py-2 text-center text-sm text-mediumdark sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between sm:gap-10 sm:divide-y-0 sm:py-5">
            <div className="flex items-center justify-center gap-2 py-3 sm:flex-col sm:gap-0 sm:py-0">
              <span className="font-heading text-xl font-bold text-primary">&gt;400</span>
              Beamte beraten
            </div>
            <div className="flex items-center justify-center gap-2 py-3 sm:flex-col sm:gap-0 sm:py-0">
              <span className="font-heading text-xl font-bold text-primary">&gt;5</span>
              Jahre Erfahrung
            </div>
            <div className="flex items-center justify-center gap-2 py-3 sm:flex-col sm:gap-0 sm:py-0">
              <span className="font-heading text-xl font-bold text-primary">4,9/5</span>
              ProvenExpert
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Problem */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
          Das Beihilfe-Problem
        </p>
        <h2 className="font-heading max-w-2xl text-2xl font-bold text-primary sm:text-3xl">
          Beihilfe, Pension und PKV für Beamte – was Ihnen wirklich zusteht
        </h2>
        <span className="mt-3 mb-4 block h-1 w-12 rounded-full bg-primary" />
        <p className="mb-12 max-w-2xl text-mediumdark">
          Das Versorgungssystem für Beamte unterscheidet sich grundlegend von der gesetzlichen
          Rente. Wer die Regeln zur Beihilfe, zur privaten Krankenversicherung, zur
          Dienstunfähigkeit und zur Pension nicht genau kennt, verschenkt häufig Geld oder verpasst
          wichtige Versorgungsansprüche.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.value} delay={i * 100}>
              <div className="rounded-2xl bg-base p-6">
                <p className="font-heading mb-2 text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-mediumdark">
                  {s.label} <sup>({s.source})</sup>
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-4 text-xs text-mediumdark/70">
          (1) Beamtenversorgungsgesetz (BeamtVG), § 14. (2) Bundesbeihilfeverordnung (BBhV) bzw.
          jeweilige Landesbeihilfeverordnung.
        </p>
      </section>

      {/* Pensions-Rechner */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal variant="scale">
          <PensionCalculator />
        </Reveal>
      </section>

      {/* Benefits */}
      <section className="bg-base">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            Ihre Vorteile
          </p>
          <h2 className="font-heading max-w-2xl text-2xl font-bold text-primary sm:text-3xl">
            Was Mein Beamtenportal auszeichnet
          </h2>
          <span className="mt-3 mb-12 block h-1 w-12 rounded-full bg-primary" />
          <div className="grid gap-8 sm:grid-cols-2">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 80} variant="fade-up">
                <div>
                  <h3 className="font-heading mb-2 text-lg font-semibold text-primary">{b.title}</h3>
                  <p className="text-sm text-mediumdark">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary">Neueste Beiträge</h2>
            <span className="mt-3 block h-1 w-12 rounded-full bg-primary" />
          </div>
          <Link href="/ratgeber" className="text-sm font-medium text-primary hover:underline">
            Alle Beiträge →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {latest.map((post, i) => (
            <Reveal key={post.slug} delay={i * 80}>
              <Link
                href={`/${post.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-mediumlight/40 bg-white p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center gap-2 text-xs text-mediumdark">
                  <span>{post.categories[0] ?? "Ratgeber"}</span>
                  <span>·</span>
                  <span>{formatDate(post.date)}</span>
                </div>
                <h3 className="font-heading text-base leading-snug font-semibold text-primary group-hover:opacity-80">
                  {post.title}
                </h3>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialStrip />

      {/* Absicherungs-CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Beihilfe und Pension allein reichen nicht.
          </h2>
          <span className="mx-auto mt-3 mb-4 block h-1 w-12 rounded-full bg-white/40" />
          <p className="mb-6 text-lg text-white/90">Entscheidend ist, was Sie wirklich absichern.</p>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Die Beihilfe zahlt nicht alles, die Pension deckt nicht Ihr gewohntes Einkommen, und
            bei Dienstunfähigkeit zählt jeder Monat, den Sie zu spät handeln. In 30 Minuten sehen
            Sie schwarz auf weiß, wo Ihre Lücken liegen – und was es kostet, sie zu schließen.
          </p>
          <Link
            href={BOOKING_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-primary hover:bg-white/90"
          >
            Jetzt Termin sichern
          </Link>
        </div>
      </section>

      {/* Leistungsversprechen */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <Reveal>
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            Beratung
          </p>
          <h2 className="font-heading max-w-2xl text-2xl font-bold text-primary sm:text-3xl">
            Mein Leistungsversprechen für Ihre Beihilfe und Vorsorge
          </h2>
          <span className="mt-3 mb-6 block h-1 w-12 rounded-full bg-primary" />
          <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {LEISTUNGSVERSPRECHEN.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-mediumdark">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="bg-base">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
            Bereit für Klarheit?
          </h2>
          <span className="mx-auto mt-3 mb-4 block h-1 w-12 rounded-full bg-primary" />
          <p className="mb-8 text-mediumdark">
            In 30 Minuten schaue ich mir Ihre konkrete Situation an: wo bei Beihilfe, PKV oder im
            Ernstfall einer Dienstunfähigkeit Lücken bestehen – und was sich davon für Sie wirklich
            zu schließen lohnt.
          </p>
          <Link
            href={BOOKING_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Kostenfreies Erstgespräch vereinbaren
          </Link>
        </div>
      </section>
    </div>
  );
}
