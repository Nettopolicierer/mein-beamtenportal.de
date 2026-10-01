"use client";

import { useEffect, useState } from "react";

function parts(msLeft: number) {
  const s = Math.max(0, Math.floor(msLeft / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function WebinarCountdown({ startIso }: { startIso: string }) {
  const target = new Date(startIso).getTime();
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (left === null) {
    return <div className="h-[68px]" aria-hidden />;
  }

  if (left <= 0) {
    return (
      <p className="text-sm font-medium text-primary">
        Das Webinar läuft gerade – oder der nächste Termin steht in Kürze fest.
      </p>
    );
  }

  const p = parts(left);
  const cells: [number, string][] = [
    [p.d, "Tage"],
    [p.h, "Std"],
    [p.m, "Min"],
    [p.s, "Sek"],
  ];

  return (
    <div className="flex gap-2">
      {cells.map(([value, label]) => (
        <div
          key={label}
          className="flex min-w-14 flex-col items-center rounded-lg bg-base px-2 py-2 ring-1 ring-mediumlight/40"
        >
          <span className="font-mono text-xl font-semibold tabular-nums text-primary">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-medium tracking-wide text-mediumdark uppercase">{label}</span>
        </div>
      ))}
    </div>
  );
}
