"use client";

import Link from "next/link";

/** Fallo al cargar un juego: se ofrece reintentar sin perder la navegación. */
export default function GameError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-fg">
        El juego no ha podido arrancar
      </h1>
      <p className="text-sm leading-relaxed text-fg-muted">
        Puede deberse a una conexión inestable o a una extensión del navegador que esté bloqueando
        el motor del juego. Vuelve a intentarlo; si sigue fallando, prueba en otra pestaña.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-full border border-border-subtle px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface-2"
        >
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}
