"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { getNextWebinar, WEBINAR_DATES_ISO, WEBINAR_TITLE } from "@/lib/webinar-config";

const STORAGE_KEY = "webinar-banner-dismissed";

export function WebinarBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const lastIso = WEBINAR_DATES_ISO[WEBINAR_DATES_ISO.length - 1];
    // Nichts mehr terminiert: Banner ausblenden, bis neue Termine ergänzt werden.
    if (Date.now() > new Date(lastIso).getTime()) return;
    if (pathname === "/webinar" || pathname === "/bu-check") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    const { dateDisplay, timeDisplay } = getNextWebinar();
    setLabel(`${dateDisplay}, ${timeDisplay}`);
    setVisible(true);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="relative flex w-full items-center justify-center bg-primary px-10 py-2 text-center text-sm text-white">
      <Link href="/webinar" className="group flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
        <span className="font-medium">
          Kostenfreies Live-Webinar: {WEBINAR_TITLE} · {label}
        </span>
        <span className="rounded-full bg-white/15 px-3 py-0.5 text-xs font-semibold whitespace-nowrap group-hover:bg-white/25">
          Jetzt kostenlos anmelden →
        </span>
      </Link>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          sessionStorage.setItem(STORAGE_KEY, "1");
        }}
        aria-label="Banner schließen"
        className="absolute right-3 text-white/70 hover:text-white"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
