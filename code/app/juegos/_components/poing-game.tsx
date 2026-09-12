"use client";

import { useCallback } from "react";
import type { GameSummary } from "@/app/_interfaces/game";
import { GameShell } from "./game-shell";
import { LobbyPanel } from "./lobby-panel";
import { PhaserGame } from "./phaser-game";
import { useGameSession } from "./use-game-session";
import { createPoingScene } from "../_engine/poing.scene";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function PoingGame({ game }: { game: GameSummary }) {
  const session = useGameSession({ gameId: "poing", title: "Poing" });
  const { bridge } = session;

  const sceneFactory = useCallback((phaser: any) => createPoingScene(phaser, bridge), [bridge]);

  return (
    <GameShell
      game={game}
      score={session.score}
      rivalLabel={session.isOnline ? "Rival" : "Máquina"}
      status={session.status}
      result={session.result}
      onRestart={session.restart}
      difficulty={session.difficulty}
      onDifficultyChange={session.setDifficulty}
      interstitialNode={session.interstitialNode}
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
        width={960}
        height={540}
        sceneFactory={sceneFactory}
        resetKey={session.resetKey}
        ariaLabel="Tablero de Poing"
      />
    </GameShell>
  );
}
