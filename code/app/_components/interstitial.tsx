"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ADS_CONFIG } from "@/app/_utils/ads.config";
import { AdSlot } from "./ad-slot";

interface OverlayProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

function InterstitialOverlay({ title, subtitle, onClose }: OverlayProps) {
  const [remaining, setRemaining] = useState<number>(ADS_CONFIG.interstitialSeconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && remaining <= 0) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [remaining, onClose]);

  const closable = remaining <= 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Publicidad a pantalla completa"
      className="gf-fade-in fixed inset-0 z-[70] flex flex-col items-center justify-center gap-5 bg-bg/98 p-5 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-1 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-fg-faint">Publicidad</p>
        <h2 className="text-lg font-medium text-fg">{title}</h2>
        <p className="text-xs text-fg-muted">{subtitle}</p>
      </div>

      <AdSlot
        slot={ADS_CONFIG.slots.interstitial}
        format="rectangle"
        minHeight={250}
        className="w-full max-w-[336px]"
      />

      <button
        type="button"
        onClick={onClose}
        disabled={!closable}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {closable ? "Continuar" : `Continuar en ${remaining}\u00a0s`}
      </button>

      <p className="max-w-xs text-center text-[11px] leading-relaxed text-fg-faint">
        Los anuncios mantienen GamesFull gratuito. Siempre puedes cerrarlos y seguir jugando.
      </p>
    </div>
  );
}

interface InterstitialRequest {
  title: string;
  subtitle: string;
}

/**
 * Intersticial a pantalla completa entre pantallas de juego. `show()` devuelve
 * una promesa que se resuelve cuando el usuario lo cierra, de modo que el juego
 * puede esperar sin arrancar por detrás.
 */
export function useInterstitial() {
  const [request, setRequest] = useState<InterstitialRequest | null>(null);
  const resolverRef = useRef<(() => void) | null>(null);

  const show = useCallback((title: string, subtitle: string) => {
    return new Promise<void>((resolve) => {
      resolverRef.current?.();
      resolverRef.current = resolve;
      setRequest({ title, subtitle });
    });
  }, []);

  const close = useCallback(() => {
    setRequest(null);
    resolverRef.current?.();
    resolverRef.current = null;
  }, []);

  const node = request ? (
    <InterstitialOverlay title={request.title} subtitle={request.subtitle} onClose={close} />
  ) : null;

  return { show, node, isOpen: request !== null };
}
