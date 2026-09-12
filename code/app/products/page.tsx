import { ThemeToggle } from "@/app/_components/theme-toggle";
import { ProductCatalog } from "./_components/product-catalog";
import { getProductsDTO } from "./_internal/products.dal";

export const metadata = {
  title: "Catálogo — Productos",
};

export default async function ProductsPage() {
  const products = await getProductsDTO();

  return (
    <main className="min-h-screen bg-bg px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-fg-faint">
              Catálogo
            </p>
            <h1 className="text-3xl font-medium tracking-[-0.02em] text-fg sm:text-4xl">
              Productos
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-fg-muted">
              {products.length} piezas disponibles. Abre el detalle para ver la galería completa y
              contactar directamente con cada vendedor.
            </p>
          </div>

          <ThemeToggle />
        </header>

        <ProductCatalog products={products} />
      </div>
    </main>
  );
}
