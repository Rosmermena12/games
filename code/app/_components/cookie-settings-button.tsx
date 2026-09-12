"use client";

import { useConsent } from "@/app/_hooks/use-consent";

/** Permite retirar el consentimiento y volver a mostrar el aviso de cookies. */
export function CookieSettingsButton() {
  const { reset } = useConsent();

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
