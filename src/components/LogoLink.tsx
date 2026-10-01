"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LogoLink({
  width,
  height,
  className,
  linkClassName,
  priority,
}: {
  width: number;
  height: number;
  className?: string;
  linkClassName?: string;
  priority?: boolean;
}) {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      aria-label="Zur Startseite"
      draggable={false}
      className={`select-none [-webkit-touch-callout:none] ${linkClassName ?? ""}`}
      onClick={() => {
        if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <Image
        src="/logo.svg"
        alt="Mein Beamtenportal"
        width={width}
        height={height}
        priority={priority}
        draggable={false}
        className={`select-none pointer-events-none ${className ?? ""}`}
      />
    </Link>
  );
}
