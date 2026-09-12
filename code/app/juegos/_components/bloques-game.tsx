"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameSummary } from "@/app/_interfaces/game";
import { GameShell } from "./game-shell";
import { LobbyPanel } from "./lobby-panel";
import { PhaserGame } from "./phaser-game";
import { useGameSession } from "./use-game-session";
import { createBloquesScene, BLOQUES_VIEWPORT } from "../_engine/bloques.scene";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TOUCH_ACTIONS = [
  { name: "left", label: "←", hint: "Mover a la izquierda" },
  { name: "rotateBack", label: "↺", hint: "Girar a la izquierda" },
  { name: "rotate", label: "↻", hint: "Girar a la derecha" },
  { name: "right", label: "→", hint: "Mover a la derecha" },
  { name: "soft", label: "↓", hint: "Bajar una casilla" },
  { name: "drop", label: "⤓", hint: "Soltar hasta abajo" },
] as const;

export function BloquesGame({ game }: { game: GameSummary }) {
  const session = useGameSession({ gameId: "bloques", title: "Bloques" });
  const { bridge, action } = session;

  const sceneFactory = useCallback((phaser: any) => createBloquesScene(phaser, bridge), [bridge]);

  return (
    <GameShell
      game={game}
      score={session.score}
      rivalLabel={session.isOnline ? "Rival" : "Récord"}
      status={session.status}
      result={session.result}
      onRestart={session.restart}
      difficulty={session.difficulty}
      onDifficultyChange={session.setDifficulty}
      showDifficulty={false}
      breakOverlayNode={session.breakOverlayNode}
      aside={
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 flex-wrap gap-2" role="group" aria-label="Controles táctiles">
            {TOUCH_ACTIONS.map((item) => (
              <button
                key={item.name}
                type="button"
                title={item.hint}
                aria-label={item.hint}
                onPointerDown={(event) => {
                  event.preventDefault();
                  action(item.name);
                }}
                className="h-12 flex-1 rounded-xl border border-border-subtle bg-surface text-lg text-fg transition active:bg-surface-2"
              >
                {item.label}
              </button>
            ))}
          </div>
          {session.isOnline ? <RivalBoard /> : null}
        </div>
      }
      lobby={
        <LobbyPanel
          role={session.net.role}
          status={session.net.status}
          code={session.net.code}
          detail={session.net.detail}
          isLive={session.net.isLive}
          onHost={session.net.host}
          onJoin={session.net.join}
          onLeave={session.net.leave}
        />
      }
    >
      <PhaserGame
        width={BLOQUES_VIEWPORT.width}
        height={BLOQUES_VIEWPORT.height}
        sceneFactory={sceneFactory}
        resetKey={session.resetKey}
        ariaLabel="Tablero de Bloques"
        background="#0b0b0c"
      />
    </GameShell>
  );
}

const CELL_COLOR: Record<string, string> = {
  "1": "var(--neon-cyan)",
  "2": "var(--neon-magenta)",
};

/**
 * Miniatura del tablero del rival. La escena publica cada instantánea recibida
 * como evento del navegador para no acoplar el bucle de Phaser a React.
 */
function RivalBoard() {
  const [cells, setCells] = useState<string>("");

  useEffect(() => {
    const onSnapshot = (event: Event) => setCells((event as CustomEvent<string>).detail);
    window.addEventListener("gf-bloques-rival", onSnapshot);
    return () => window.removeEventListener("gf-bloques-rival", onSnapshot);
  }, []);

  const { cols, rows } = BLOQUES_VIEWPORT;

  return (
    <div className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-fg-faint">Tablero del rival</p>
      <div
        className="grid gap-px rounded-md bg-border-subtle p-px"
        style={{ gridTemplateColumns: `repeat(${cols}, 10px)` }}
        aria-hidden
      >
        {Array.from({ length: cols * rows }, (_, i) => (
          <span
            key={i}
            className="block h-[10px] w-[10px] rounded-[2px]"
            style={{ background: CELL_COLOR[cells[i]] ?? "var(--surface-2)" }}
          />
        ))}
      </div>
    </div>
  );
}
