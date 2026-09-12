"use client";

import { useCallback } from "react";
import type { GameSummary } from "@/app/_interfaces/game";
import { GameShell } from "./game-shell";
import { LobbyPanel } from "./lobby-panel";
import { PhaserGame } from "./phaser-game";
import { useGameSession } from "./use-game-session";
import { createHockeyScene } from "../_engine/hockey.scene";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function HockeyGame({ game }: { game: GameSummary }) {
  const session = useGameSession({ gameId: "hockey", title: "Hockey de Mesa" });
  const { bridge } = session;

  const sceneFactory = useCallback((phaser: any) => createHockeyScene(phaser, bridge), [bridge]);

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
      breakOverlayNode={session.breakOverlayNode}
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
        ariaLabel="Mesa de hockey"
        background="#101014"
      />
    </GameShell>
  );
}
