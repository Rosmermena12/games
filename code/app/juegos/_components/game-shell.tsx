"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SideRail } from "@/app/_components/side-rail";
import { SafeArea } from "@/app/_components/boundary";
import type { GameSummary } from "@/app/_interfaces/game";

interface GameShellProps {
  game: GameSummary;
  score: { local: number; rival: number };
  rivalLabel: string;
  status: string;
  /** Pantalla de inicio o de resultado, superpuesta al tablero. */
  overlay: ReactNode;
  /** Controles visibles mientras se juega (reiniciar, salir). */
  toolbar?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  below?: ReactNode;
  breakOverlayNode: ReactNode;
}

/**
 * Marco de una partida. El juego ocupa su propia página completa —no un modal—
 * con los raíles publicitarios a los lados y el intersticial por encima de todo.
 */
export function GameShell({
  game,
  score,
  rivalLabel,
  status,
  overlay,
  toolbar,
  children,
  aside,
  below,
  breakOverlayNode,
}: GameShellProps) {
  return (
    <main data-accent={game.accent} className="mx-auto w-full max-w-[1600px] px-4 pb-8 pt-6 sm:px-6">
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
            {overlay}
          </div>

          {status ? (
            <p role="status" className="text-xs text-[var(--game-accent)]">
              {status}
            </p>
          ) : null}

          {toolbar}

          {aside}

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
