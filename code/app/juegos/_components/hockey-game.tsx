"use client";

import { useCallback } from "react";
import type { GameSummary } from "@/app/_interfaces/game";
import { GameShell } from "./game-shell";
import { MatchToolbar } from "./match-toolbar";
import { PhaserGame } from "./phaser-game";
import { StartPanel } from "./start-panel";
import { useGameSession } from "./use-game-session";
import { createHockeyScene } from "../_engine/hockey.scene";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function HockeyGame({ game }: { game: GameSummary }) {
  const session = useGameSession({ gameId: "hockey", title: "Hockey de Mesa" });
  const { bridge } = session;

  const sceneFactory = useCallback((phaser: any) => createHockeyScene(phaser, bridge), [bridge]);

  const playing = session.phase === "playing";

  return (
    <GameShell
      game={game}
      score={session.score}
      rivalLabel={session.isOnline ? "Rival" : "Máquina"}
      status={session.status}
      breakOverlayNode={session.breakOverlayNode}
      overlay={
        playing ? null : (
          <StartPanel
            phase={session.phase}
            mode={session.mode}
            onModeChange={session.changeMode}
            difficulty={session.difficulty}
            onDifficultyChange={session.setDifficulty}
            showDifficulty
            canStart={session.canStart}
            onStart={session.start}
            result={session.result}
            onBackToMenu={session.returnToLobby}
            net={session.net}
          />
        )
      }
      toolbar={
        playing ? (
          <MatchToolbar
            canRestart={session.canStart}
            onRestart={session.start}
            onBackToMenu={session.returnToLobby}
          />
        ) : null
      }
    >
      <PhaserGame
        width={960}
        height={540}
        sceneFactory={sceneFactory}
        resetKey={session.resetKey}
        ariaLabel="Mesa de hockey"
        background="#101014"
      />
    </GameShell>
  );
}
