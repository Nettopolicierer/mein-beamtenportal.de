import Link from "next/link";
import Image from "next/image";
import { SORTED_POSTS, formatDate, BOOKING_LINK } from "@/lib/content";
import { TestimonialStrip } from "@/components/TestimonialStrip";

const STATS = [
  { value: "Ø 66,7 %", label: "Ruhegehaltssatz bei der Beamtenpension – den Höchstsatz von 71,75 % erreichen nur wenige." },
  { value: "50–90 %", label: "übernimmt die Beihilfe je Bundesland von den Krankheitskosten – der Rest läuft über die Krankenversicherung." },
  { value: "1,79 %", label: "mehr Pension bringt jedes volle Dienstjahr nach dem Beamtenversorgungsgesetz." },
];

const BENEFITS = [
  {
    title: "Spezialisiert auf Beamte",
    text: "Ihr persönliches Konzept baut auf einer speziellen Auswahl geprüfter Produkte, um höchste Qualität zu gewährleisten.",
  },
  {
    title: "Modern & Digital",
    text: "Virtuelle Treffen, E-Signaturen und eine benutzerfreundliche Finanz-App – auf Wunsch auch persönliche Gespräche.",
  },
  {
    title: "Nachhaltiges Wissen",
    text: "Sie sollen eigenverantwortlich und selbstbewusst die besten finanziellen Entscheidungen treffen können.",
  },
  {
    title: "Alles aus einer Hand",
    text: "Eine vielfältige Palette an Versicherungsoptionen, damit Sie stets bestmöglich aufgestellt sind.",
  },
];

export default function Home() {
  const latest = SORTED_POSTS.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-base">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <h1 className="font-hand text-6xl leading-none font-bold text-primary sm:text-7xl">
              Mein Beamtenportal
            </h1>
            <p className="font-hand mt-3 text-3xl text-primary sm:text-4xl">
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

          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl lg:max-w-none">
            <Image
              src="/albert-hero.jpg"
              alt="Albert Sibert, unabhängiger Finanzberater für Beamte"
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        </div>

        <div className="border-t border-mediumlight/40">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-10 px-6 py-8 text-center text-sm text-mediumdark sm:justify-between">
            <div>
              <span className="font-heading block text-xl font-bold text-primary">&gt;300</span>
              Beamte beraten
            </div>
            <div>
              <span className="font-heading block text-xl font-bold text-primary">&gt;5</span>
              Jahre Erfahrung
            </div>
            <div>
              <span className="font-heading block text-xl font-bold text-primary">4,9/5</span>
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
        <h2 className="font-heading mb-4 max-w-2xl text-2xl font-bold text-primary sm:text-3xl">
          Beihilfe, Pension und PKV für Beamte – was Ihnen wirklich zusteht
        </h2>
        <p className="mb-12 max-w-2xl text-mediumdark">
          Das Versorgungssystem für Beamte unterscheidet sich grundlegend von der gesetzlichen
          Rente. Wer die Regeln zur Beihilfe, zur privaten Krankenversicherung, zur
          Dienstunfähigkeit und zur Pension nicht genau kennt, verschenkt häufig Geld oder verpasst
          wichtige Versorgungsansprüche.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.value} className="rounded-2xl bg-base p-6">
              <p className="font-heading mb-2 text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-mediumdark">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-base">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            Ihre Vorteile
          </p>
          <h2 className="font-heading mb-12 max-w-2xl text-2xl font-bold text-primary sm:text-3xl">
            Was Mein Beamtenportal auszeichnet
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <h3 className="font-heading mb-2 text-lg font-semibold text-primary">{b.title}</h3>
                <p className="text-sm text-mediumdark">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-primary">Neueste Beiträge</h2>
          <Link href="/ratgeber" className="text-sm font-medium text-primary hover:underline">
            Alle Beiträge →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {latest.map((post) => (
            <Link
              key={post.slug}
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
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialStrip />

      {/* Absicherungs-CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-heading mb-4 text-2xl font-bold text-white sm:text-3xl">
            Beihilfe und Pension allein reichen nicht.
          </h2>
          <p className="mb-6 text-lg text-white/90">Entscheidend ist, was Sie wirklich absichern.</p>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Die meisten Beamten gehen davon aus, gut versorgt zu sein — bis sie sehen, welche
            Lücken trotzdem bestehen. In 45 Minuten zeigen wir Ihnen, wo Handlungsbedarf besteht
            und was Sie konkret tun können.
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

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-heading mb-4 text-2xl font-bold text-primary sm:text-3xl">
          Bereit für Klarheit?
        </h2>
        <p className="mb-8 text-mediumdark">
          Unser erstes Gespräch dient in erster Linie dazu, uns persönlich kennenzulernen und
          Klarheit über Ihre Wünsche und Erwartungen zu schaffen.
        </p>
        <Link
          href={BOOKING_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Kostenfreies Erstgespräch vereinbaren
        </Link>
      </section>
    </div>
  );
}
