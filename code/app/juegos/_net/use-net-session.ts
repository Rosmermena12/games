"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createRoom,
  joinRoom,
  normalizeRoomCode,
  type NetMessage,
  type NetRole,
  type NetSession,
  type NetStatus,
} from "./peer-net";

/** Un participante de la sala, tal y como aparece en la lista de jugadores. */
export interface NetPlayer {
  id: string;
  label: string;
  isYou: boolean;
  isHost: boolean;
  connected: boolean;
}

interface UseNetSessionResult {
  role: NetRole;
  status: NetStatus;
  code: string;
  detail: string;
  /** `true` cuando el canal está abierto y se pueden enviar jugadas. */
  isLive: boolean;
  /** Ocupantes de la sala, el anfitrión incluido. Vacío fuera de una sala. */
  players: NetPlayer[];
  host: () => Promise<void>;
  join: (code: string) => Promise<void>;
  leave: () => void;
  send: (message: NetMessage) => void;
  subscribe: (listener: (message: NetMessage) => void) => () => void;
}

/**
 * Envuelve la sesión P2P en estado de React. Los mensajes se reparten desde un
 * bus propio para que el bucle de Phaser pueda suscribirse una sola vez y no
 * dependa de re-renderizados.
 */
export function useNetSession(gameId: string): UseNetSessionResult {
  const [role, setRole] = useState<NetRole>("solo");
  const [status, setStatus] = useState<NetStatus>("idle");
  const [code, setCode] = useState("");
  const [detail, setDetail] = useState("");

  const sessionRef = useRef<NetSession | null>(null);
  const listenersRef = useRef(new Set<(message: NetMessage) => void>());
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleStatus = useCallback((next: NetStatus, extra?: string) => {
    setStatus(next);
    if (next === "waiting" && extra) {
      setCode(extra);
      setDetail("");
      return;
    }
    setDetail(extra ?? "");
  }, []);

  const attach = useCallback((session: NetSession) => {
    sessionRef.current = session;
    setRole(session.role);
    setCode(session.code);
    unsubscribeRef.current = session.subscribe((message) => {
      listenersRef.current.forEach((listener) => listener(message));
    });
  }, []);

  const leave = useCallback(() => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    sessionRef.current?.close();
    sessionRef.current = null;
    setRole("solo");
    setStatus("idle");
    setCode("");
    setDetail("");
  }, []);

  const host = useCallback(async () => {
    leave();
    try {
      const session = await createRoom(gameId, { onStatus: handleStatus });
      attach(session);
    } catch (error) {
      setStatus("error");
      setDetail(error instanceof Error ? error.message : "No se pudo crear la sala.");
    }
  }, [gameId, attach, handleStatus, leave]);

  const join = useCallback(
    async (rawCode: string) => {
      const clean = normalizeRoomCode(rawCode);
      if (clean.length < 4) {
        setStatus("error");
        setDetail("El código de invitación no parece completo.");
        return;
      }
      leave();
      try {
        const session = await joinRoom(gameId, clean, { onStatus: handleStatus });
        attach(session);
      } catch (error) {
        setStatus("error");
        setDetail(error instanceof Error ? error.message : "No se pudo entrar en la sala.");
      }
    },
    [gameId, attach, handleStatus, leave],
  );

  const send = useCallback((message: NetMessage) => {
    sessionRef.current?.send(message);
  }, []);

  const subscribe = useCallback((listener: (message: NetMessage) => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      sessionRef.current?.close();
    };
  }, []);

  /**
   * Hoy la sala es de dos, pero la lista se construye como colección para que
   * admitir más participantes no obligue a rehacer la interfaz.
   */
  const players = useMemo<NetPlayer[]>(() => {
    if (role === "solo") return [];

    const rivalConnected = status === "connected";

    if (role === "host") {
      return [
        { id: "host", label: "Tú (anfitrión)", isYou: true, isHost: true, connected: true },
        {
          id: "guest",
          label: rivalConnected ? "Invitado" : "Esperando invitado…",
          isYou: false,
          isHost: false,
          connected: rivalConnected,
        },
      ];
    }

    return [
      { id: "host", label: "Anfitrión", isYou: false, isHost: true, connected: rivalConnected },
      { id: "guest", label: "Tú", isYou: true, isHost: false, connected: true },
    ];
  }, [role, status]);

  return {
    role,
    status,
    code,
    detail,
    isLive: status === "connected",
    players,
    host,
    join,
    leave,
    send,
    subscribe,
  };
}
