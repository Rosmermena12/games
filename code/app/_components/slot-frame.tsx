"use client";

import { useEffect, useRef, useState } from "react";
import { ADS_CONFIG, areAdsEnabled } from "@/app/_utils/ads.config";
import { useConsent } from "@/app/_hooks/use-consent";
import { loadScript } from "@/app/_utils/load-script";

interface AdSlotProps {
  /** Identificador del bloque en AdSense. Vacío = marcador de posición. */
  slot: string;
  format?: "vertical" | "horizontal" | "rectangle" | "auto";
  /** Alto mínimo reservado para evitar saltos de layout (CLS). */
  minHeight?: number;
  className?: string;
  label?: string;
}

const FORMAT_TO_ADSENSE: Record<NonNullable<AdSlotProps["format"]>, string> = {
  vertical: "vertical",
  horizontal: "horizontal",
  rectangle: "rectangle",
  auto: "auto",
};

/**
 * Bloque publicitario. Sólo inyecta el script de Google cuando hay
 * consentimiento explícito y la cuenta está configurada; en cualquier otro
 * caso reserva el mismo espacio con un marcador propio, claramente etiquetado
 * como espacio publicitario para no inducir a error al usuario.
 */
export function AdSlot({
  slot,
  format = "auto",
  minHeight = 250,
  className = "",
  label = "Publicidad",
}: AdSlotProps) {
  const { consent } = useConsent();
  const containerRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const [failed, setFailed] = useState(false);

  const canServe = areAdsEnabled() && slot.trim().length > 0 && consent?.ads === "granted";

  useEffect(() => {
    if (!canServe || pushedRef.current) return;

    let cancelled = false;
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.client}`;

    loadScript(src)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const win = window as unknown as { adsbygoogle?: unknown[] };
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
        pushedRef.current = true;
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [canServe]);

  return (
    <aside
      className={`flex flex-col items-center gap-1 ${className}`}
      aria-label={label}
      style={{ minHeight }}
    >
      <span className="text-[10px] uppercase tracking-[0.16em] text-fg-faint">{label}</span>

      {canServe && !failed ? (
        <ins
          ref={containerRef}
          className="adsbygoogle block w-full"
          style={{ display: "block", width: "100%", minHeight }}
          data-ad-client={ADS_CONFIG.client}
          data-ad-slot={slot}
          data-ad-format={FORMAT_TO_ADSENSE[format]}
          data-full-width-responsive="true"
        />
      ) : (
        <div
          className="flex w-full flex-1 items-center justify-center rounded-lg border border-dashed border-border-subtle bg-surface-2 p-3 text-center text-[11px] leading-relaxed text-fg-faint"
          style={{ minHeight }}
        >
          Espacio publicitario
        </div>
      )}
    </aside>
  );
}
