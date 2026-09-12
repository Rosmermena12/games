"use client";

import { useEffect, useRef, useState } from "react";
import { loadPhaser } from "../_engine/phaser-loader";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PhaserGameProps {
  /** Resolución lógica del lienzo; Phaser la escala al ancho disponible. */
  width: number;
  height: number;
  /** Devuelve la configuración de escena ya enlazada con el puente del juego. */
  sceneFactory: (phaser: any) => any;
  /** Al cambiar se destruye y recrea el juego (cambio de modo o de rival). */
  resetKey: string;
  background?: string;
  ariaLabel: string;
}

/**
 * Monta un juego de Phaser dentro de un `div`. Phaser trabaja directamente
 * sobre el DOM, así que el teclado mantiene el foco sin capas intermedias.
 */
export function PhaserGame({
  width,
  height,
  sceneFactory,
  resetKey,
  background = "#0b0b0c",
  ariaLabel,
}: PhaserGameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const factoryRef = useRef(sceneFactory);
  factoryRef.current = sceneFactory;

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let game: any = null;
    let disposed = false;

    loadPhaser()
      .then((phaser) => {
        if (disposed) return;
        game = new phaser.Game({
          type: phaser.AUTO,
          parent: host,
          width,
          height,
          backgroundColor: background,
          banner: false,
          audio: { noAudio: true },
          scale: {
            mode: phaser.Scale.FIT,
            autoCenter: phaser.Scale.CENTER_HORIZONTALLY,
          },
          scene: factoryRef.current(phaser),
        });
      })
      .catch(() => {
        if (!disposed) {
          setError(
            "No se ha podido cargar el motor del juego. Revisa tu conexión o si algún bloqueador está filtrando el CDN.",
          );
        }
      });

    return () => {
      disposed = true;
      game?.destroy(true);
    };
  }, [width, height, background, resetKey]);

  return (
    <div
      ref={hostRef}
      role="application"
      aria-label={ariaLabel}
      tabIndex={0}
      className="gf-canvas-host w-full overflow-hidden rounded-xl border border-border-subtle bg-[#0b0b0c] outline-none focus-visible:border-[var(--game-accent)]"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {error ? (
        <p className="flex h-full items-center justify-center p-6 text-center text-sm text-fg-muted">
          {error}
        </p>
      ) : null}
    </div>
  );
}
