// Fester WhatsApp-Button unten rechts. Reiner Link (wa.me), es werden keine
// Daten geladen, bevor jemand darauf klickt.
export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/4917692609041"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Per WhatsApp schreiben"
      className="fixed right-4 bottom-20 z-30 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-black/5 transition hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 1 1 6.97 3.85Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.1-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.2 3.7.59.26 1.05.41 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.29Z" />
      </svg>
    </a>
  );
}
