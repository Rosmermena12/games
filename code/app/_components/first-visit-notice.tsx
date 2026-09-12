"use client";

import Link from "next/link";
import { useState } from "react";
import { useVisitorPrefs } from "@/app/_hooks/use-visitor-prefs";

/**
 * Aviso de cookies previo a cualquier script de terceros. Es el requisito que
 * AdSense comprueba para tráfico del EEE, Reino Unido y Suiza: se puede
 * rechazar con el mismo número de clics que aceptar y la decisión se guarda.
 */
export function FirstVisitNotice() {
  const { consent, hydrated, acceptAll, rejectAll, save } = useVisitorPrefs();
  const [showDetails, setShowDetails] = useState(false);
  const [ads, setAds] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  if (!hydrated || consent) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="gf-fade-in fixed inset-x-0 bottom-0 z-[60] border-t border-border-subtle bg-surface/95 p-4 backdrop-blur sm:p-5"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-fg">Cookies y publicidad</h2>
          <p className="text-xs leading-relaxed text-fg-muted">
            Usamos cookies propias necesarias para que los juegos funcionen y cookies de terceros
            (Google AdSense) para mostrar anuncios que mantienen el sitio gratuito. Puedes aceptar,
            rechazar o elegir qué permites. Más detalles en nuestra{" "}
            <Link href="/legal/cookies" className="underline underline-offset-2 hover:text-fg">
              política de cookies
            </Link>{" "}
            y en la{" "}
            <Link href="/legal/privacidad" className="underline underline-offset-2 hover:text-fg">
              política de privacidad
            </Link>
            .
          </p>
        </div>

        {showDetails ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-2 p-3">
            <label className="flex items-start gap-3 text-xs text-fg-muted">
              <input type="checkbox" checked disabled className="mt-0.5" />
              <span>
                <span className="font-medium text-fg">Necesarias</span> — preferencias de tema,
                sonido y estado de la partida. Siempre activas.
              </span>
            </label>
            <label className="flex items-start gap-3 text-xs text-fg-muted">
              <input
                type="checkbox"
                checked={ads}
                onChange={(event) => setAds(event.target.checked)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium text-fg">Publicidad</span> — Google AdSense y sus
                socios pueden usar cookies para personalizar y medir anuncios.
              </span>
            </label>
            <label className="flex items-start gap-3 text-xs text-fg-muted">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium text-fg">Medición</span> — estadísticas agregadas de
                uso para saber qué juegos funcionan mejor.
              </span>
            </label>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-fg transition hover:opacity-90"
          >
            Aceptar todo
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="rounded-full border border-border-subtle px-4 py-2 text-xs font-medium text-fg transition hover:bg-surface-2"
          >
            Rechazar todo
          </button>
          {showDetails ? (
            <button
              type="button"
              onClick={() => save(ads, analytics)}
              className="rounded-full border border-border-subtle px-4 py-2 text-xs font-medium text-fg transition hover:bg-surface-2"
            >
              Guardar selección
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="rounded-full px-4 py-2 text-xs font-medium text-fg-muted underline underline-offset-2 transition hover:text-fg"
            >
              Configurar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
