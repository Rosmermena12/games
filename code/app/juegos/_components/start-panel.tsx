"use client";

import { LobbyPanel } from "./lobby-panel";
import type { GameMode, GamePhase } from "./use-game-session";
import type { Difficulty, GameOverResult } from "../_engine/types";
import type { NetRole, NetStatus } from "../_net/peer-net";
import type { NetPlayer } from "../_net/use-net-session";

interface StartPanelProps {
  phase: GamePhase;
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  difficulty: Difficulty;
  onDifficultyChange: (value: Difficulty) => void;
  /** Bloques no tiene rival por IA: se oculta el selector de dificultad. */
  showDifficulty: boolean;
  canStart: boolean;
  onStart: () => void;
  result: GameOverResult | null;
  onBackToMenu: () => void;
  net: {
    role: NetRole;
    status: NetStatus;
    code: string;
    detail: string;
    isLive: boolean;
    players: NetPlayer[];
    host: () => void;
    join: (code: string) => void;
    leave: () => void;
  };
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  facil: "Fácil",
  normal: "Normal",
  dificil: "Difícil",
};

/**
 * Pantalla previa a la partida, superpuesta al tablero. Sustituye al arranque
 * automático: se elige rival y no pasa nada hasta que alguien pulsa el botón.
 */
export function StartPanel({
  phase,
  mode,
  onModeChange,
  difficulty,
  onDifficultyChange,
  showDifficulty,
  canStart,
  onStart,
  result,
  onBackToMenu,
  net,
}: StartPanelProps) {
  const isOver = phase === "over";

  return (
    <div className="gf-fade-in absolute inset-0 z-20 flex items-center justify-center overflow-y-auto rounded-xl bg-bg/92 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-sm flex-col gap-4">
        {isOver && result ? (
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-fg-faint">
              {result.outcome === "win" ? "Victoria" : "Fin de la partida"}
            </p>
            <p className="text-xl font-medium text-fg">{result.label}</p>
          </div>
        ) : (
          <p className="text-center text-xs uppercase tracking-[0.18em] text-fg-faint">
            Elige rival
          </p>
        )}

        <div
          role="group"
          aria-label="Modo de juego"
          className="grid grid-cols-2 gap-1 rounded-full border border-border-subtle p-1"
        >
          {(
            [
              { value: "cpu", label: "Contra la máquina" },
              { value: "online", label: "Invitar a alguien" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onModeChange(option.value)}
              aria-pressed={mode === option.value}
              className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                mode === option.value
                  ? "bg-accent text-accent-fg"
                  : "text-fg-muted hover:bg-surface-2"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {mode === "cpu" ? (
          <div className="flex flex-col gap-3">
            {showDifficulty ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-fg-faint">Dificultad</p>
                <div className="grid grid-cols-3 gap-1 rounded-full border border-border-subtle p-1">
                  {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onDifficultyChange(level)}
                      aria-pressed={difficulty === level}
                      className={`rounded-full px-2 py-1.5 text-[11px] font-medium transition ${
                        difficulty === level
                          ? "bg-accent text-accent-fg"
                          : "text-fg-muted hover:bg-surface-2"
                      }`}
                    >
                      {DIFFICULTY_LABEL[level]}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <LobbyPanel
            role={net.role}
            status={net.status}
            code={net.code}
            detail={net.detail}
            isLive={net.isLive}
            players={net.players}
            onHost={net.host}
            onJoin={net.join}
            onLeave={net.leave}
          />
        )}

        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isOver ? "Jugar otra vez" : "Comenzar partida"}
        </button>

        {mode === "online" && !canStart ? (
          <p className="text-center text-xs leading-relaxed text-fg-muted">
            {net.role === "guest"
              ? "Ya estás dentro. La partida empieza cuando el anfitrión pulse «Comenzar»."
              : "Comparte el código: podrás empezar en cuanto la otra persona entre en la sala."}
          </p>
        ) : null}

        {isOver ? (
          <button
            type="button"
            onClick={onBackToMenu}
            className="text-center text-xs text-fg-faint underline underline-offset-2 transition hover:text-fg"
          >
            Cambiar de rival
          </button>
        ) : null}
      </div>
    </div>
  );
}
