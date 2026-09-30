"use client";

import { useInView } from "@/hooks/use-in-view";

type RevealVariant = "fade-up" | "fade-in" | "fade-left" | "fade-right" | "scale";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
}

const HIDDEN: Record<RevealVariant, string> = {
  "fade-up": "opacity-0 translate-y-8",
  "fade-in": "opacity-0",
  "fade-left": "opacity-0 -translate-x-8",
  "fade-right": "opacity-0 translate-x-8",
  scale: "opacity-0 scale-95",
};

const VISIBLE: Record<RevealVariant, string> = {
  "fade-up": "opacity-100 translate-y-0",
  "fade-in": "opacity-100",
  "fade-left": "opacity-100 translate-x-0",
  "fade-right": "opacity-100 translate-x-0",
  scale: "opacity-100 scale-100",
};

export function Reveal({
  children,
  className = "",
  variant = "fade-up",
  delay = 0,
  duration = 600,
}: RevealProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all will-change-transform ${inView ? VISIBLE[variant] : HIDDEN[variant]} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: inView ? `${delay}ms` : "0ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}
