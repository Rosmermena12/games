"use client";

import { loadScript } from "@/app/_utils/load-script";

/** PeerJS vive en CDN: sólo se descarga cuando alguien abre una sala. */
const PEERJS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js";

/** Prefijo del identificador público para no chocar con otras apps de PeerJS. */
const ID_NAMESPACE = "gamesfull";

/** Sin caracteres ambiguos (0/O, 1/I/L): el código se dicta en voz alta. */
const ALPHABET = "ACDEFGHJKMNPQRSTUVWXYZ2345679";
const CODE_LENGTH = 5;

export type NetRole = "solo" | "host" | "guest";

export type NetStatus =
  | "idle"
  | "creating"
  | "waiting"
  | "connecting"
  | "connected"
  | "closed"
  | "error";

export type NetMessage = Record<string, unknown> & { t: string };

export interface NetSession {
  role: Exclude<NetRole, "solo">;
  code: string;
  send: (message: NetMessage) => void;
  subscribe: (listener: (message: NetMessage) => void) => () => void;
  close: () => void;
}

interface SessionCallbacks {
  onStatus: (status: NetStatus, detail?: string) => void;
}

export function generateRoomCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export function normalizeRoomCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);
}

function peerIdFor(gameId: string, code: string): string {
  return `${ID_NAMESPACE}-${gameId}-${code}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyPeer = any;

async function getPeerConstructor(): Promise<AnyPeer> {
  await loadScript(PEERJS_SRC);
  const ctor = (window as unknown as { Peer?: AnyPeer }).Peer;
  if (!ctor) throw new Error("PeerJS no está disponible");
  return ctor;
}

/** Conecta el `DataConnection` de PeerJS con el bus de mensajes de la sesión. */
function bindConnection(
  connection: AnyPeer,
  listeners: Set<(message: NetMessage) => void>,
  callbacks: SessionCallbacks,
) {
  connection.on("data", (raw: unknown) => {
    const message = parseMessage(raw);
    if (!message) return;
    listeners.forEach((listener) => listener(message));
  });

  connection.on("open", () => callbacks.onStatus("connected"));
  connection.on("close", () => callbacks.onStatus("closed", "La conexión se ha cerrado."));
  connection.on("error", () =>
    callbacks.onStatus("error", "Se ha perdido la conexión con el otro jugador."),
  );
}

function parseMessage(raw: unknown): NetMessage | null {
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return isMessage(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return isMessage(raw) ? raw : null;
}

function isMessage(value: unknown): value is NetMessage {
  return typeof value === "object" && value !== null && typeof (value as NetMessage).t === "string";
}

/**
 * Crea una sala y espera a que alguien entre con el código. El identificador
 * público se deriva del código, así que no hace falta servidor de emparejado:
 * basta el broker gratuito de PeerJS para el intercambio inicial de señales.
 */
export async function createRoom(gameId: string, callbacks: SessionCallbacks): Promise<NetSession> {
  const PeerCtor = await getPeerConstructor();
  const listeners = new Set<(message: NetMessage) => void>();
  callbacks.onStatus("creating");

  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const code = generateRoomCode();
    const peer: AnyPeer = new PeerCtor(peerIdFor(gameId, code), { debug: 0 });

    const taken = await new Promise<boolean>((resolve) => {
      peer.on("open", () => resolve(false));
      peer.on("error", (error: { type?: string }) => {
        resolve(error?.type === "unavailable-id");
      });
    });

    if (taken) {
      peer.destroy();
      continue;
    }

    callbacks.onStatus("waiting", code);

    let connection: AnyPeer = null;
    peer.on("connection", (incoming: AnyPeer) => {
      if (connection) {
        // Sala ocupada: se rechaza al tercero en discordia.
        incoming.close();
        return;
      }
      connection = incoming;
      callbacks.onStatus("connecting");
      bindConnection(connection, listeners, callbacks);
    });

    peer.on("error", () =>
      callbacks.onStatus("error", "Error de red. Comprueba tu conexión e inténtalo de nuevo."),
    );

    return {
      role: "host",
      code,
      send: (message) => {
        if (connection?.open) connection.send(message);
      },
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      close: () => {
        listeners.clear();
        connection?.close();
        peer.destroy();
      },
    };
  }

  throw new Error("No se pudo generar un código de sala libre. Inténtalo otra vez.");
}

/** Se une a una sala existente a partir del código de invitación. */
export async function joinRoom(
  gameId: string,
  code: string,
  callbacks: SessionCallbacks,
): Promise<NetSession> {
  const PeerCtor = await getPeerConstructor();
  const listeners = new Set<(message: NetMessage) => void>();
  callbacks.onStatus("connecting");

  const peer: AnyPeer = new PeerCtor(undefined, { debug: 0 });

  await new Promise<void>((resolve, reject) => {
    peer.on("open", () => resolve());
    peer.on("error", () => reject(new Error("No se pudo iniciar la conexión.")));
  });

  const connection: AnyPeer = peer.connect(peerIdFor(gameId, code), {
    reliable: true,
    serialization: "json",
  });

  if (!connection) throw new Error("Código de sala no válido.");

  bindConnection(connection, listeners, callbacks);

  peer.on("error", (error: { type?: string }) => {
    if (error?.type === "peer-unavailable") {
      callbacks.onStatus("error", "No existe ninguna sala con ese código o ya se ha cerrado.");
    } else {
      callbacks.onStatus("error", "Error de red. Comprueba tu conexión e inténtalo de nuevo.");
    }
  });

  return {
    role: "guest",
    code,
    send: (message) => {
      if (connection.open) connection.send(message);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    close: () => {
      listeners.clear();
      connection.close();
      peer.destroy();
    },
  };
}
