"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function WebinarForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/webinar-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error ?? "Etwas ist schiefgelaufen.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMessage("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <CheckCircle2 className="size-5 shrink-0" />
        Fertig! Sie erhalten den Teams-Link in Kürze per E-Mail.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ihr Name"
        className="h-11 w-full rounded-lg border border-mediumlight bg-white px-4 text-sm outline-none focus-visible:border-primary"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ihre@email.de"
        className="h-11 w-full rounded-lg border border-mediumlight bg-white px-4 text-sm outline-none focus-visible:border-primary"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {status === "loading" ? "Wird gesendet…" : "Unverbindlich vormerken lassen"}
      </button>
      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
      <p className="text-xs text-mediumdark">Kein Spam. Details dazu in der Datenschutzerklärung.</p>
    </form>
  );
}
