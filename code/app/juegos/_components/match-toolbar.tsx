"use client";

interface MatchToolbarProps {
  /** En sala, sólo el anfitrión puede reiniciar para los dos. */
  canRestart: boolean;
  onRestart: () => void;
  onBackToMenu: () => void;
}

/** Controles disponibles mientras la partida está en marcha. */
export function MatchToolbar({ canRestart, onRestart, onBackToMenu }: MatchToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onRestart}
        disabled={!canRestart}
        className="rounded-full border border-border-subtle px-4 py-2 text-xs font-medium text-fg transition enabled:hover:bg-surface-2 disabled:opacity-40"
      >
        Reiniciar partida
      </button>
      <button
        type="button"
        onClick={onBackToMenu}
        className="rounded-full px-4 py-2 text-xs font-medium text-fg-muted transition hover:bg-surface-2 hover:text-fg"
      >
        Salir al menú
      </button>
    </div>
  );
}
