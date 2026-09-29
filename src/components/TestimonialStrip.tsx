import Image from "next/image";

// Echte, bereits auf der Startseite (src/app/page.tsx) und auf
// albert-sibert.de/TestimonialsSection.tsx verwendete ProvenExpert-Zitate,
// anonymisiert mit Initialen der Mandant:innen.
const TESTIMONIALS = [
  {
    name: "Lena S.",
    quote:
      "100% Zufriedenheit und Weiterempfehlung: ich hatte zu jeder Zeit das Gefühl, dass auf meine Bedürfnisse eingegangen wurde.",
  },
  {
    name: "Annabell B.",
    quote:
      "Albert hat immer ein offenes Ohr, meldet sich umgehend zurück wenn man ein Anliegen hat und klärt rasch alles ab.",
  },
  {
    name: "Felipe A.",
    quote: "Vielen Dank für die super Beratung! Ich fühle mich sehr gut aufgehoben.",
  },
  {
    name: "M. S.",
    quote:
      "Meine Erfahrungen mit Herrn Sibert waren den ganzen Prozess über, vom ersten Kennenlerngespräch an, durchweg positiv. Jede Fragestellung wurde verständlich und klar beantwortet.",
  },
];

export function TestimonialStrip() {
  return (
    <div className="border-b border-mediumlight/40 bg-white py-6">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 flex items-center justify-center gap-3">
          <Image src="/proven-expert.webp" alt="ProvenExpert" width={28} height={28} unoptimized />
          <Image src="/stars.svg" alt="" width={90} height={16} unoptimized />
          <span className="text-sm text-mediumdark">4,9/5 · echte Kundenstimmen</span>
        </div>
        <div className="scrollbar-thin flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="w-72 shrink-0 snap-start rounded-xl bg-base p-4"
            >
              <p className="mb-3 text-sm text-mediumdark">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-xs font-semibold text-primary">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
