"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBreakOverlay } from "@/app/_components/break-overlay";
import { useNetSession } from "../_net/use-net-session";
import type { NetRole } from "../_net/peer-net";
import type { Difficulty, GameBridge, GameControls, GameOverResult } from "../_engine/types";

interface UseGameSessionOptions {
  gameId: string;
  title: string;
}

/**
 * Une red P2P, publicidad intersticial y estado de partida en un único objeto
 * que las páginas de juego consumen. La escena de Phaser se comunica sólo a
 * través de `bridge`, de modo que la lógica del juego no conoce React.
 */
export function useGameSession({ gameId, title }: UseGameSessionOptions) {
  const net = useNetSession(gameId);
  const interstitial = useBreakOverlay();

  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [score, setScore] = useState({ local: 0, rival: 0 });
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<GameOverResult | null>(null);

  const controlsRef = useRef<GameControls | null>(null);

  /** Mientras nadie se ha conectado se juega contra la máquina. */
  const effectiveRole: NetRole = net.isLive ? net.role : "solo";

  const onScore = useCallback((local: number, rival: number) => {
    setScore({ local, rival });
  }, []);

  const onGameOver = useCallback((value: GameOverResult) => {
    setResult(value);
  }, []);

  /** La escena tarda en cargar Phaser: si ya hay un anuncio encima, nace en pausa. */
  const overlayPausedRef = useRef(true);

  const registerControls = useCallback((controls: GameControls) => {
    controlsRef.current = controls;
    controls.setPaused(overlayPausedRef.current);
  }, []);

  const setOverlayPaused = useCallback((value: boolean) => {
    overlayPausedRef.current = value;
    controlsRef.current?.setPaused(value);
  }, []);

  const bridge = useMemo<GameBridge>(
    () => ({
      role: effectiveRole,
      difficulty,
      send: net.send,
      subscribe: net.subscribe,
      onScore,
      onStatus: setStatus,
      onGameOver,
      registerControls,
    }),
    [effectiveRole, difficulty, net.send, net.subscribe, onScore, onGameOver, registerControls],
  );

  /** Cambiar de modo o de dificultad obliga a recrear la escena. */
  const resetKey = `${effectiveRole}:${difficulty}`;

  const showBreakOverlay = useCallback(
    (subtitle: string) => interstitial.show(title, subtitle),
    [interstitial, title],
  );

  // Intersticial de bienvenida: se muestra una vez al abrir la página.
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    setOverlayPaused(true);
    void showBreakOverlay("Preparando la partida…").then(() => {
      setOverlayPaused(false);
    });
  }, [showBreakOverlay, setOverlayPaused]);

  const restart = useCallback(() => {
    setResult(null);
    setStatus("");
    setOverlayPaused(true);
    void showBreakOverlay("Nueva partida en unos segundos…").then(() => {
      controlsRef.current?.restart();
      setOverlayPaused(false);
    });
  }, [showBreakOverlay, setOverlayPaused]);

  const action = useCallback((name: Parameters<NonNullable<GameControls["action"]>>[0]) => {
    controlsRef.current?.action?.(name);
  }, []);

  useEffect(() => {
    // Al cambiar de modo el marcador anterior deja de tener sentido.
    setScore({ local: 0, rival: 0 });
    setResult(null);
  }, [resetKey]);

  return {
    net,
    bridge,
    resetKey,
    difficulty,
    setDifficulty,
    score,
    status,
    result,
    restart,
    action,
    breakOverlayNode: interstitial.node,
    isOnline: effectiveRole !== "solo",
  };
}
