import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { SORTED_POSTS, formatDate, BOOKING_LINK } from "@/lib/content";
import { TestimonialStrip } from "@/components/TestimonialStrip";
import { Reveal } from "@/components/Reveal";

const THEMEN = [
  { href: "/welche-versicherungen-als-referendar", title: "Ich bin Referendar oder Anwärter", text: "Alle Versicherungen im Vorbereitungsdienst im Überblick: PKV, Anwartschaft, Dienstunfähigkeit, Haftpflicht." },
  { href: "/verbeamtung-auf-probe-finanzfehler", title: "Ich werde auf Probe verbeamtet", text: "Die häufigsten Finanzfehler beim Start ins Beamtenverhältnis und wie Sie sie vermeiden." },
  { href: "/pensionsrechner", title: "Ich bin Beamter auf Lebenszeit", text: "Wie hoch ist Ihre Pension wirklich, und wie groß ist die Lücke zu Ihrem heutigen Netto? Mit dem Pensionsrechner nachrechnen." },
  { href: "/pkv-fuer-beamte", title: "Ich suche die richtige Krankenversicherung", text: "Private Krankenversicherung für Beamte: Beihilfe, Tarifkriterien und Öffnungsaktion." },
];

export default function Home() {
  const latest = SORTED_POSTS.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-base">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-16 pb-0 sm:pt-20 lg:grid-cols-2">
          <div>
            <h1 className="font-hand select-none text-5xl leading-none font-bold text-primary min-[380px]:text-6xl sm:text-7xl">
              Mein Beamtenportal
            </h1>
            <p className="font-hand mt-3 text-4xl leading-tight text-balance text-primary sm:text-5xl">
              Pension, Beihilfe und PKV verstehen.
            </p>
            <p className="mt-6 max-w-md text-mediumdark">
              Ihr ungebundenes Informationsportal für Vorsorge, Beihilfe und Absicherung im
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
                Zum Ratgeber
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm pt-4 pb-6 lg:max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-3xl shadow-[0_24px_50px_-24px_rgba(0,40,85,0.35)] ring-1 ring-primary/10">
              <Image
                src="/albert-hero-beratung.webp"
                alt="Albert Sibert, ungebundener Finanzberater für Beamte, Referendare und Anwärter"
                fill
                className="object-cover object-[50%_35%]"
                unoptimized
                priority
              />
            </div>
            <a
              href="https://www.horbach.de/albert-sibert/wissenswertes/kundenbewertungen.html"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-0 left-2 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg ring-1 ring-primary/10 sm:-left-6"
            >
              <Image src="/proven-expert.webp" alt="ProvenExpert" width={36} height={36} unoptimized />
              <span className="leading-tight">
                <span className="flex items-center gap-1.5">
                  <Image src="/stars.svg" alt="" width={80} height={14} unoptimized />
                  <span className="font-heading text-sm font-bold text-primary">4,9/5</span>
                </span>
                <span className="block text-xs text-mediumdark">Kundenbewertungen</span>
              </span>
            </a>
          </div>
        </div>

        <div className="border-t border-mediumlight/40">
          <div className="mx-auto flex max-w-6xl flex-col divide-y divide-mediumlight/40 px-6 py-2 text-center text-sm text-mediumdark sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between sm:gap-10 sm:divide-y-0 sm:py-5">
            <div className="flex items-center justify-center gap-2 py-3 sm:flex-col sm:gap-0 sm:py-0">
              <span className="font-heading text-xl font-bold text-primary">&gt;400</span>
              Beamte beraten
            </div>
            <div className="flex items-center justify-center gap-2 py-3 sm:flex-col sm:gap-0 sm:py-0">
              <span className="font-heading text-xl font-bold text-primary">Seit 2019</span>
              für Beamte aktiv
            </div>
            <div className="flex items-center justify-center gap-2 py-3 sm:flex-col sm:gap-0 sm:py-0">
              <span className="font-heading text-xl font-bold text-primary">4,9/5</span>
              ProvenExpert
            </div>
          </div>
        </div>
      </section>

      {/* Themen */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-16">
        <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Für wen ich da bin</p>
        <h2 className="font-heading mb-8 max-w-2xl text-2xl font-bold text-primary sm:text-3xl">
          Wo stehen Sie gerade?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {THEMEN.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-2xl bg-base p-5 transition hover:shadow-md">
              <p className="font-heading mb-2 text-lg font-bold text-primary">{t.title}</p>
              <p className="text-sm text-mediumdark">{t.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialStrip />

      {/* Persönlich */}
      <section className="mx-auto max-w-4xl px-6 pt-20">
        <div className="rounded-3xl bg-base p-6 sm:p-10">
          <div className="mb-5 flex items-center gap-4 sm:gap-6">
            <Image
              src="/albert-portrait.webp"
              alt="Albert Sibert, Finanzberater für Beamte"
              width={422}
              height={421}
              className="size-24 shrink-0 rounded-full object-cover shadow-md ring-4 ring-white sm:size-32"
              unoptimized
            />
            <div>
              <p className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">Wer berät Sie?</p>
              <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">Hallo, ich bin Albert.</h2>
            </div>
          </div>
          <div>
            <p className="mb-3 text-mediumdark">
              Seit 2019 berate ich Beamte, Referendare und Anwärter. Ich habe selbst bei einer auf den öffentlichen Dienst
              spezialisierten PKV gearbeitet und mich dann bewusst gegen die Bindung an ein Portfolio entschieden. So kann ich Ihnen
              zeigen, was zu Ihrer Situation passt, und nicht, was ich verkaufen muss.
            </p>
            <p className="mb-5 text-mediumdark">
              Dieses Portal ist mein Weg, Ihnen vorab verständlich zu erklären, wie Beihilfe, PKV, Pension und Dienstunfähigkeit
              zusammenhängen. Wenn Sie danach noch Fragen haben, sprechen wir persönlich darüber.
            </p>
            <ul className="mb-6 grid gap-x-6 gap-y-2.5 text-sm text-primary sm:grid-cols-2">
              {[
                "Zugang zu über 250 Gesellschaften statt nur einem Portfolio",
                "Antwort meist noch am selben Tag",
                "Termine per Video, Unterschrift digital, Verträge in der Finanz-App",
                "Langjährige Expertise im öffentlichen Dienst: Beamte, Referendare und Anwärter",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Link href="/ueber-uns" className="text-sm font-semibold text-primary underline">Mehr über mich und meinen Werdegang</Link>
          </div>
        </div>
      </section>

      {/* Ablauf und Transparenz */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Ablauf</p>
        <h2 className="font-heading max-w-2xl text-2xl font-bold text-primary sm:text-3xl">
          So läuft das kostenfreie Erstgespräch
        </h2>
        <span className="mt-3 mb-10 block h-1 w-12 rounded-full bg-primary" />
        <ol className="grid gap-6 sm:grid-cols-3">
          {[
            ["1", "Termin buchen", "Sie wählen online einen Termin, per Video oder Telefon."],
            ["2", "Lücken ansehen", "In 20 Minuten gehen wir Beihilfe, PKV, Dienstunfähigkeit und Pension für Ihren Status durch."],
            ["3", "Sie entscheiden", "Sie erhalten eine ehrliche Einschätzung und entscheiden in Ruhe."],
          ].map(([n, t, d]) => (
            <li key={n} className="rounded-2xl bg-base p-6">
              <span className="font-heading mb-3 flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{n}</span>
              <p className="font-heading mb-2 text-lg font-semibold text-primary">{t}</p>
              <p className="text-sm text-mediumdark">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-3xl text-sm text-mediumdark">
          <strong className="text-primary">Transparenz:</strong> Das Erstgespräch kostet Sie nichts. Als Finanzberater werde ich bei einem Abschluss von der jeweiligen
          Gesellschaft vergütet.
        </p>
      </section>

      {/* Latest posts */}
      <section className="bg-base">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] tracking-wider text-white">Neu</span>
              Vor kurzem erschienen
            </p>
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
                prefetch={false}
                className="group flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-mediumlight/40 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                {post.featuredImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.featuredImage}
                    alt={post.featuredImageAlt || ""}
                    loading="lazy"
                    style={{ objectPosition: post.featuredImagePosition || "50% 30%" }}
                    className="aspect-[16/9] w-full object-cover"
                  />
                )}
                <div className="flex flex-col gap-3 px-6 pt-1 pb-6">
                <div className="flex items-center gap-2 text-xs text-mediumdark">
                  <span>{post.categories[0] ?? "Ratgeber"}</span>
                  <span>·</span>
                  <span>{formatDate(post.date)}</span>
                </div>
                <h3 className="font-heading text-base leading-snug font-semibold text-primary group-hover:opacity-80">
                  {post.title}
                </h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
      </section>

      {/* Absicherungs-CTA */}
      <section className="relative overflow-hidden bg-primary">
        <div className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-white/5 blur-3xl" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-6 py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-widest text-white/60 uppercase">Orientierungsgespräch</p>
            <h2 className="font-heading text-3xl leading-tight font-bold text-white sm:text-4xl">
              Beihilfe und Pension allein reichen nicht.
            </h2>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              Die Beihilfe zahlt nicht alles, die Pension deckt nicht Ihr gewohntes Einkommen, und bei Dienstunfähigkeit
              zählt jeder Monat. In 20 Minuten sehen Sie, wo Ihre Lücken liegen und was es kostet, sie zu schließen.
            </p>
            <ul className="mt-6 space-y-3 text-white/90">
              {[
                "Beihilfe, PKV, Dienstunfähigkeit und Pension für Ihren Status",
                "Ehrliche Einschätzung, was für Sie wirklich nötig ist",
                "Kostenfrei",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <svg viewBox="0 0 20 20" className="mt-1 size-5 shrink-0 text-white" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
                  </svg>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-7 text-center shadow-2xl shadow-black/20 sm:p-8">
            <Image
              src="/albert-portrait.webp"
              alt="Albert Sibert"
              width={96}
              height={96}
              className="mx-auto size-24 rounded-full object-cover ring-4 ring-base"
              unoptimized
            />
            <p className="font-heading mt-4 text-xl font-bold text-primary">20 Minuten mit Albert</p>
            <p className="mt-1 text-sm text-mediumdark">Per Video oder Telefon, Termin frei wählbar</p>
            <Link
              href={BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-primary px-6 py-4 text-base font-semibold text-white transition hover:bg-primary/90"
            >
              Jetzt Termin sichern
            </Link>
            <a
              href="https://wa.me/4917692609041"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-mediumlight/60 px-6 py-3 text-sm font-medium text-primary transition hover:bg-base"
            >
              Lieber kurz per WhatsApp schreiben
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
