"use client";

import { useState } from "react";
import { normalizeRoomCode } from "../_net/peer-net";
import type { NetRole, NetStatus } from "../_net/peer-net";

interface LobbyPanelProps {
  /** El anfitrión ve instrucciones para compartir; el invitado, no. */
  role: NetRole;
  status: NetStatus;
  code: string;
  detail: string;
  isLive: boolean;
  onHost: () => void;
  onJoin: (code: string) => void;
  onLeave: () => void;
}

const STATUS_LABEL: Record<NetStatus, string> = {
  idle: "Jugando contra la máquina",
  creating: "Creando la sala…",
  waiting: "Esperando a tu rival",
  connecting: "Estableciendo la conexión…",
  connected: "Conectado",
  closed: "El rival ha salido de la sala",
  error: "No se pudo conectar",
};

/**
 * Panel de sala: crear una partida genera un código corto que el rival escribe
 * en su propio navegador. No hay servidor de partida; el código sólo sirve para
 * que los dos navegadores se encuentren.
 */
export function LobbyPanel({
  role,
  status,
  code,
  detail,
  isLive,
  onHost,
  onJoin,
  onLeave,
}: LobbyPanelProps) {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const busy = status === "creating" || status === "connecting";

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      aria-label="Sala multijugador"
      className="flex flex-col gap-4 rounded-card border border-border-subtle bg-surface p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-fg">Jugar con un amigo</h2>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] ${
            isLive
              ? "bg-[var(--game-accent)]/15 text-[var(--game-accent)]"
              : "bg-surface-2 text-fg-muted"
          }`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {code && (status === "waiting" || isLive) ? (
        <div className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-2 p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-fg-faint">
            Código de invitación
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-bg px-3 py-2 text-lg font-semibold tracking-[0.3em] text-fg">
              {code}
            </code>
            <button
              type="button"
              onClick={copyCode}
              className="rounded-full border border-border-subtle px-3 py-2 text-xs font-medium text-fg transition hover:bg-surface"
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-fg-muted">
            {role === "guest"
              ? "Estás jugando en la sala de tu rival. Si la partida se corta, vuelve a introducir el código."
              : "Pásaselo a quien quieras: sólo tiene que abrir este mismo juego, escribirlo y pulsar «Unirse». Mientras esperas puedes seguir jugando contra la máquina."}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onHost}
          disabled={busy}
          className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition enabled:hover:opacity-90 disabled:opacity-50"
        >
          {code ? "Crear otra sala" : "Crear sala"}
        </button>

        <form
          className="flex flex-1 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onJoin(input);
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(normalizeRoomCode(event.target.value))}
            placeholder="CÓDIGO"
            inputMode="text"
            autoComplete="off"
            aria-label="Código de invitación"
            className="w-full min-w-0 rounded-full border border-border-subtle bg-surface-2 px-4 py-2.5 text-sm tracking-[0.2em] text-fg outline-none placeholder:tracking-normal placeholder:text-fg-faint focus:border-[var(--game-accent)]"
          />
          <button
            type="submit"
            disabled={busy || input.length < 4}
            className="rounded-full border border-border-subtle px-4 py-2.5 text-sm font-medium text-fg transition enabled:hover:bg-surface-2 disabled:opacity-50"
          >
            Unirse
          </button>
        </form>
      </div>

      {detail ? <p className="text-xs leading-relaxed text-fg-muted">{detail}</p> : null}

      {isLive || status === "waiting" ? (
        <button
          type="button"
          onClick={onLeave}
          className="self-start text-xs text-fg-faint underline underline-offset-2 transition hover:text-fg"
        >
          Salir de la sala y volver al modo individual
        </button>
      ) : null}
    </section>
  );
}
