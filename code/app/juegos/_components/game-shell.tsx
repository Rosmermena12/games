"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SideRail } from "@/app/_components/side-rail";
import { SafeArea } from "@/app/_components/boundary";
import type { GameSummary } from "@/app/_interfaces/game";
import type { Difficulty, GameOverResult } from "../_engine/types";

interface GameShellProps {
  game: GameSummary;
  score: { local: number; rival: number };
  rivalLabel: string;
  status: string;
  result: GameOverResult | null;
  onRestart: () => void;
  difficulty: Difficulty;
  onDifficultyChange: (value: Difficulty) => void;
  /** Bloques no tiene rival por IA, así que oculta el selector. */
  showDifficulty?: boolean;
  lobby: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  below?: ReactNode;
  breakOverlayNode: ReactNode;
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  facil: "Fácil",
  normal: "Normal",
  dificil: "Difícil",
};

/**
 * Marco de una partida. El juego ocupa su propia página completa —no un modal—
 * con los raíles publicitarios a los lados y el intersticial por encima de todo.
 */
export function GameShell({
  game,
  score,
  rivalLabel,
  status,
  result,
  onRestart,
  difficulty,
  onDifficultyChange,
  showDifficulty = true,
  lobby,
  children,
  aside,
  below,
  breakOverlayNode,
}: GameShellProps) {
  return (
    <main
      data-accent={game.accent}
      className="mx-auto w-full max-w-[1600px] px-4 pb-8 pt-6 sm:px-6"
    >
      <nav aria-label="Migas de pan" className="mb-4 text-xs text-fg-faint">
        <Link href="/" className="transition hover:text-fg">
          Inicio
        </Link>
        <span aria-hidden className="px-1.5">
          /
        </span>
        <span className="text-fg-muted">{game.title}</span>
      </nav>

      <div className="gf-play-grid">
        <SafeArea>
          <SideRail side="left" />
        </SafeArea>

        <div className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-medium tracking-[-0.02em] text-fg sm:text-3xl">
                {game.title}
              </h1>
              <p className="text-sm text-fg-muted">{game.tagline}</p>
            </div>

            <div className="flex items-center gap-4 rounded-card border border-border-subtle bg-surface px-4 py-2">
              <ScoreCell label="Tú" value={score.local} highlight />
              <span aria-hidden className="h-8 w-px bg-border-subtle" />
              <ScoreCell label={rivalLabel} value={score.rival} />
            </div>
          </header>

          <div className="relative">
            {children}

            {result ? (
              <div className="gf-fade-in absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-bg/85 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-fg-faint">
                  {result.outcome === "win" ? "Victoria" : "Fin de la partida"}
                </p>
                <p className="text-xl font-medium text-fg">{result.label}</p>
                <button
                  type="button"
                  onClick={onRestart}
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90"
                >
                  Jugar otra vez
                </button>
              </div>
            ) : null}
          </div>

          {status ? (
            <p role="status" className="text-xs text-[var(--game-accent)]">
              {status}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRestart}
              className="rounded-full border border-border-subtle px-4 py-2 text-xs font-medium text-fg transition hover:bg-surface-2"
            >
              Reiniciar partida
            </button>

            {showDifficulty ? (
              <div className="flex items-center gap-1 rounded-full border border-border-subtle p-1">
                <span className="px-2 text-[11px] text-fg-faint">Máquina</span>
                {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onDifficultyChange(level)}
                    aria-pressed={difficulty === level}
                    className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                      difficulty === level
                        ? "bg-accent text-accent-fg"
                        : "text-fg-muted hover:bg-surface-2"
                    }`}
                  >
                    {DIFFICULTY_LABEL[level]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {aside}

          {lobby}

          <section className="flex flex-col gap-3 rounded-card border border-border-subtle bg-surface p-4">
            <h2 className="text-sm font-medium text-fg">Cómo se juega a {game.title}</h2>
            <p className="text-sm leading-relaxed text-fg-muted">{game.description}</p>
            <ul className="flex flex-col gap-1.5">
              {game.controls.map((control) => (
                <li key={control} className="text-xs text-fg-muted">
                  · {control}
                </li>
              ))}
            </ul>
          </section>

          {below}
        </div>

        <SafeArea>
          <SideRail side="right" />
        </SafeArea>
      </div>

      <SafeArea>{breakOverlayNode}</SafeArea>
    </main>
  );
}

function ScoreCell({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-[0.14em] text-fg-faint">{label}</span>
      <span
        className={`text-2xl font-semibold tabular-nums ${
          highlight ? "text-[var(--game-accent)]" : "text-fg"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
