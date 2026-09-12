"use client";

export default function ProductsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-medium text-fg">No se pudo cargar el catálogo</h1>
        <p className="text-sm leading-relaxed text-fg-muted">
          Ha ocurrido un problema al obtener los productos. Vuelve a intentarlo en unos segundos.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
