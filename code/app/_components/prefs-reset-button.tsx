"use client";

import { useVisitorPrefs } from "@/app/_hooks/use-visitor-prefs";

/** Permite retirar el consentimiento y volver a mostrar el aviso de cookies. */
export function PrefsResetButton() {
  const { reset } = useVisitorPrefs();

  return (
    <button
      type="button"
      onClick={reset}
      className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90"
    >
      Cambiar mis preferencias de cookies
    </button>
  );
}
