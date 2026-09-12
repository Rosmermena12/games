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

/** Con quién se juega. `cpu` es lo que hay seleccionado al entrar. */
export type GameMode = "cpu" | "online";

/** En qué punto está la pantalla: menú, partida en curso o resultado. */
export type GamePhase = "lobby" | "playing" | "over";

/**
 * Ningún juego arranca solo: al entrar se ve el menú, se elige rival y la
 * partida empieza cuando alguien pulsa «Comenzar». En sala, el arranque lo da
 * el anfitrión y se anuncia al resto, de modo que los dos empiezan a la vez y
 * desde cero.
 */
export function useGameSession({ gameId, title }: UseGameSessionOptions) {
  const net = useNetSession(gameId);
  const { show: showOverlay, node: breakOverlayNode } = useBreakOverlay();

  const [mode, setMode] = useState<GameMode>("cpu");
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [score, setScore] = useState({ local: 0, rival: 0 });
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<GameOverResult | null>(null);
  /** Cada partida monta una escena nueva: nunca se arrastra estado anterior. */
  const [matchId, setMatchId] = useState(0);

  const controlsRef = useRef<GameControls | null>(null);
  const runningRef = useRef(false);

  /** Sólo se juega en red si hay sala Y el canal está realmente abierto. */
  const activeRole: NetRole = mode === "online" && net.isLive ? net.role : "solo";
  const resetKey = `${activeRole}:${difficulty}:${matchId}`;

  const setRunning = useCallback((value: boolean) => {
    runningRef.current = value;
    controlsRef.current?.setPaused(!value);
  }, []);

  const registerControls = useCallback((controls: GameControls) => {
    controlsRef.current = controls;
    // La escena puede montarse mientras hay un anuncio o el menú encima.
    controls.setPaused(!runningRef.current);
  }, []);

  const onScore = useCallback((local: number, rival: number) => {
    setScore({ local, rival });
  }, []);

  const onGameOver = useCallback(
    (value: GameOverResult) => {
      runningRef.current = false;
      setResult(value);
      setPhase("over");
    },
    [],
  );

  const bridge = useMemo<GameBridge>(
    () => ({
      role: activeRole,
      difficulty,
      send: net.send,
      subscribe: net.subscribe,
      onScore,
      onStatus: setStatus,
      onGameOver,
      registerControls,
    }),
    [activeRole, difficulty, net.send, net.subscribe, onScore, onGameOver, registerControls],
  );

  /**
   * El intersticial se muestra al abrir la página y entre partidas, pero no dos
   * veces seguidas: encadenar dos anuncios en pocos segundos molesta y AdSense
   * lo penaliza.
   */
  const lastBreakRef = useRef(0);
  const MIN_GAP_MS = 45_000;

  const runBreak = useCallback(
    async (subtitle: string) => {
      const now = Date.now();
      if (now - lastBreakRef.current < MIN_GAP_MS) return;
      lastBreakRef.current = now;
      await showOverlay(title, subtitle);
    },
    [showOverlay, title],
  );

  // Intersticial de bienvenida, una sola vez por visita a la página.
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    lastBreakRef.current = Date.now();
    void showOverlay(title, "Elige rival y empieza cuando quieras.");
  }, [showOverlay, title]);

  const beginMatch = useCallback(
    async (initiatedHere: boolean) => {
      setResult(null);
      setStatus("");
      setRunning(false);
      // El anuncio sólo lo ve quien pulsa «Comenzar». Quien arranca avisado por
      // la red entra de inmediato: la simulación vive en el anfitrión y
      // cualquier espera extra le costaría los primeros puntos de la partida.
      if (initiatedHere) {
        await runBreak("La partida empieza en unos segundos…");
        net.send({ t: "begin" });
      }
      setScore({ local: 0, rival: 0 });
      setMatchId((value) => value + 1);
      setPhase("playing");
      setRunning(true);
    },
    [net.send, runBreak, setRunning],
  );

  /** El invitado arranca cuando el anfitrión lo anuncia, no por su cuenta. */
  const beginRef = useRef(beginMatch);
  beginRef.current = beginMatch;

  useEffect(() => {
    return net.subscribe((message) => {
      if (message.t === "begin") void beginRef.current(false);
    });
  }, [net.subscribe]);

  /** Empezar es cosa del anfitrión; contra la máquina, de quien juega. */
  const canStart = mode === "cpu" || (net.role === "host" && net.isLive);

  const start = useCallback(() => {
    if (!canStart) return;
    void beginMatch(true);
  }, [beginMatch, canStart]);

  const returnToLobby = useCallback(() => {
    setRunning(false);
    setResult(null);
    setStatus("");
    setScore({ local: 0, rival: 0 });
    setPhase("lobby");
  }, [setRunning]);

  const changeMode = useCallback(
    (next: GameMode) => {
      if (next === mode) return;
      setRunning(false);
      setPhase("lobby");
      setResult(null);
      setStatus("");
      setScore({ local: 0, rival: 0 });
      // Salir de la sala al volver al modo individual evita dejar el código
      // publicado y a alguien esperando al otro lado.
      if (next === "cpu") net.leave();
      setMode(next);
    },
    [mode, net, setRunning],
  );

  // Si el rival se marcha a mitad de partida se vuelve al menú con un aviso,
  // en vez de dejar el tablero congelado sin explicación.
  useEffect(() => {
    if (net.status !== "closed" && net.status !== "error") return;
    runningRef.current = false;
    controlsRef.current?.setPaused(true);
    setPhase("lobby");
    setStatus(
      net.status === "closed"
        ? "El otro jugador ha salido de la sala."
        : "Se ha interrumpido la conexión.",
    );
  }, [net.status]);

  const action = useCallback((name: Parameters<NonNullable<GameControls["action"]>>[0]) => {
    controlsRef.current?.action?.(name);
  }, []);

  return {
    net,
    bridge,
    resetKey,
    mode,
    changeMode,
    phase,
    difficulty,
    setDifficulty,
    score,
    status,
    result,
    canStart,
    start,
    returnToLobby,
    action,
    breakOverlayNode,
    isOnline: activeRole !== "solo",
  };
}
