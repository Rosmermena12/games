"use client";

import { useCallback } from "react";
import type { GameSummary } from "@/app/_interfaces/game";
import { GameShell } from "./game-shell";
import { MatchToolbar } from "./match-toolbar";
import { PhaserGame } from "./phaser-game";
import { StartPanel } from "./start-panel";
import { useGameSession } from "./use-game-session";
import { createPoingScene } from "../_engine/poing.scene";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function PoingGame({ game }: { game: GameSummary }) {
  const session = useGameSession({ gameId: "poing", title: "Poing" });
  const { bridge } = session;

  const sceneFactory = useCallback((phaser: any) => createPoingScene(phaser, bridge), [bridge]);

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
        ariaLabel="Tablero de Poing"
      />
    </GameShell>
  );
}
