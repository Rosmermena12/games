import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-medium text-fg">Producto no encontrado</h1>
        <p className="text-sm leading-relaxed text-fg-muted">
          Puede que se haya retirado del catálogo o que el enlace ya no sea válido.
        </p>
        <Link
          href="/products"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}
