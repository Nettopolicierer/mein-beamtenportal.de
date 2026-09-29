import Image from "next/image";

// Echte ProvenExpert-Zitate (teils auch auf der Startseite src/app/page.tsx
// und auf albert-sibert.de/TestimonialsSection.tsx verwendet, teils neu vom
// HORBACH-Bewertungsprofil übernommen), anonymisiert mit Initialen der
// Mandant:innen - keine erfundenen Stimmen.
const TESTIMONIALS = [
  {
    name: "Lena S.",
    quote:
      "100% Zufriedenheit und Weiterempfehlung: ich hatte zu jeder Zeit das Gefühl, dass auf meine Bedürfnisse eingegangen wurde.",
  },
  {
    name: "Jana P.",
    role: "Lehramtsstudentin",
    quote:
      "Albert hat sich mit mehreren Online-Terminen sehr viel Zeit genommen, meine Situation zu verstehen und mir daraufhin verschiedene Möglichkeiten vorgestellt. Kosten und Provision wurden offen angesprochen.",
  },
  {
    name: "Annabell B.",
    quote:
      "Albert hat immer ein offenes Ohr, meldet sich umgehend zurück wenn man ein Anliegen hat und klärt rasch alles ab.",
  },
  {
    name: "Imke N.",
    quote:
      "Die Gespräche finden immer auf Augenhöhe statt und man fühlt sich definitiv gut beraten. Der Austausch ist immer locker und freundlich.",
  },
  {
    name: "Felipe A.",
    quote:
      "Vielen Dank für die super Beratung! Ich fühle mich sehr gut aufgehoben und kann ihn an jeden weiterempfehlen.",
  },
  {
    name: "Angelina F.",
    quote:
      "Besonders hat mir die ständige Erreichbarkeit und Zuvorkommenheit gefallen. Die Gespräche waren immer angenehm, sehr freundlich und informativ.",
  },
  {
    name: "M. S.",
    quote:
      "Meine Erfahrungen mit Herrn Sibert waren den ganzen Prozess über, vom ersten Kennenlerngespräch an, durchweg positiv. Jede Fragestellung wurde verständlich und klar beantwortet.",
  },
  {
    name: "Pauline B.",
    quote:
      "Bei der Beratung wurde jede Seite beleuchtet, sodass einem auch Nachteile bekannt waren. Ich fühle mich super aufgehoben und würde Albert jederzeit wieder als meinen Berater wählen.",
  },
  {
    name: "Coralie M.",
    quote: "Albert ist ein sehr offener und ehrlicher Berater. Alles erfolgt auf Augenhöhe.",
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
              <p className="text-xs font-semibold text-primary">
                {t.name}
                {t.role && <span className="font-normal text-mediumdark"> · {t.role}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
