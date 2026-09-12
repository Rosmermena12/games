"use client";

import { useState } from "react";
import { normalizeRoomCode } from "../_net/peer-net";
import type { NetRole, NetStatus } from "../_net/peer-net";
import type { NetPlayer } from "../_net/use-net-session";

interface LobbyPanelProps {
  role: NetRole;
  status: NetStatus;
  code: string;
  detail: string;
  isLive: boolean;
  players: NetPlayer[];
  onHost: () => void;
  onJoin: (code: string) => void;
  onLeave: () => void;
}

/**
 * Sala de espera. Crear una partida genera un código corto; quien lo recibe lo
 * escribe aquí. La lista muestra a todos los ocupantes, anfitrión incluido, para
 * que se vea de un vistazo si ya se puede empezar.
 */
export function LobbyPanel({
  role,
  status,
  code,
  detail,
  isLive,
  players,
  onHost,
  onJoin,
  onLeave,
}: LobbyPanelProps) {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const busy = status === "creating" || status === "connecting";
  const inRoom = role !== "solo" && (status === "waiting" || busy || isLive);

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
    <div className="flex flex-col gap-4">
      {inRoom ? (
        <>
          {role === "host" && code ? (
            <div className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-2 p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-fg-faint">
                Código de invitación
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-bg px-3 py-2 text-center text-xl font-semibold tracking-[0.35em] text-fg">
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
                Quien lo reciba sólo tiene que abrir este mismo juego, escribirlo y pulsar «Unirse».
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-fg-faint">
              En la sala ({players.filter((player) => player.connected).length}/{players.length})
            </p>
            <ul className="flex flex-col gap-1.5">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-surface-2 px-3 py-2"
                >
                  <span
                    aria-hidden
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      player.connected ? "bg-[var(--game-accent)]" : "bg-fg-faint/40"
                    }`}
                  />
                  <span
                    className={`text-sm ${player.connected ? "text-fg" : "text-fg-faint"}`}
                  >
                    {player.label}
                  </span>
                  {player.isHost ? (
                    <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-fg-faint">
                      Anfitrión
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {detail ? <p className="text-xs leading-relaxed text-fg-muted">{detail}</p> : null}

          <button
            type="button"
            onClick={onLeave}
            className="self-start text-xs text-fg-faint underline underline-offset-2 transition hover:text-fg"
          >
            Salir de la sala
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={onHost}
            disabled={busy}
            className="rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition enabled:hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Creando la sala…" : "Crear sala e invitar"}
          </button>

          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px flex-1 bg-border-subtle" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-fg-faint">o</span>
            <span aria-hidden className="h-px flex-1 bg-border-subtle" />
          </div>

          <form
            className="flex gap-2"
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
              className="w-full min-w-0 rounded-full border border-border-subtle bg-surface-2 px-4 py-2.5 text-center text-sm tracking-[0.3em] text-fg outline-none placeholder:tracking-normal placeholder:text-fg-faint focus:border-[var(--game-accent)]"
            />
            <button
              type="submit"
              disabled={busy || input.length < 4}
              className="shrink-0 rounded-full border border-border-subtle px-4 py-2.5 text-sm font-medium text-fg transition enabled:hover:bg-surface-2 disabled:opacity-50"
            >
              Unirse
            </button>
          </form>

          {detail ? <p className="text-xs leading-relaxed text-fg-muted">{detail}</p> : null}
        </>
      )}
    </div>
  );
}
