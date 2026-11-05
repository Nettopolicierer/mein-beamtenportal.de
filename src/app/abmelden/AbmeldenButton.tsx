"use client";

import { useState } from "react";

export default function AbmeldenButton({ e, t }: { e: string; t: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit() {
    setState("loading");
    try {
      const res = await fetch("/api/nurture-unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ e, t }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") return <p className="text-slate-700">Sie wurden abgemeldet und erhalten keine weiteren Folgemails.</p>;
  return (
    <div className="space-y-3">
      <button
        onClick={submit}
        disabled={state === "loading"}
        style={{ backgroundColor: "#1E5FA8", color: "#FFFFFF" }}
        className="rounded-xl px-6 py-3 font-bold disabled:opacity-60"
      >
        {state === "loading" ? "Wird abgemeldet…" : "Von Folgemails abmelden"}
      </button>
      {state === "error" && <p role="alert" className="text-sm text-slate-700">Das hat nicht geklappt. Schreiben Sie uns bitte an kontakt@albert-sibert.de.</p>}
    </div>
  );
}
