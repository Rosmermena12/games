"use client";

import { useEffect, useState } from "react";

export type ConsentDecision = "granted" | "denied";

export interface ConsentState {
  /** Publicidad personalizada y cookies asociadas. */
  ads: ConsentDecision;
  /** Medición y estadísticas. */
  analytics: ConsentDecision;
  /** Marca de tiempo de la decisión, para poder caducarla. */
  decidedAt: number;
}

const STORAGE_KEY = "gf-consent-v1";
const CHANGE_EVENT = "gf-consent-change";
/** Meses que se respeta una decisión antes de volver a preguntar. */
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 180;

function read(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed?.ads !== "granted" && parsed?.ads !== "denied") return null;
    if (Date.now() - (parsed.decidedAt ?? 0) > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Propaga la decisión a Google Consent Mode v2 y al resto de la pestaña. */
function write(state: ConsentState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Modo privado o almacenamiento lleno: la decisión vale sólo para esta sesión. */
  }

  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("consent", "update", {
    ad_storage: state.ads,
    ad_user_data: state.ads,
    ad_personalization: state.ads,
    analytics_storage: state.analytics,
  });

  window.dispatchEvent(new CustomEvent<ConsentState>(CHANGE_EVENT, { detail: state }));
}

/**
 * Estado de consentimiento de cookies. Devuelve `null` hasta que el usuario
 * decide, para que ningún script de terceros se cargue antes de tiempo.
 */
export function useConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConsent(read());
    setHydrated(true);

    const onChange = (event: Event) => setConsent((event as CustomEvent<ConsentState>).detail);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  return {
    consent,
    hydrated,
    acceptAll: () => write({ ads: "granted", analytics: "granted", decidedAt: Date.now() }),
    rejectAll: () => write({ ads: "denied", analytics: "denied", decidedAt: Date.now() }),
    save: (ads: boolean, analytics: boolean) =>
      write({
        ads: ads ? "granted" : "denied",
        analytics: analytics ? "granted" : "denied",
        decidedAt: Date.now(),
      }),
    reset: () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignorado */
      }
      window.dispatchEvent(new CustomEvent<ConsentState | null>(CHANGE_EVENT, { detail: null as never }));
      setConsent(null);
    },
  };
}
