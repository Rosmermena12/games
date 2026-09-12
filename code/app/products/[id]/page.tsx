import Link from "next/link";
import { notFound } from "next/navigation";

import { ChevronLeftIcon } from "@/app/_components/icons";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { formatPrice, formatPublishedDate } from "@/app/_utils/format";
import { CategoryBadge } from "../_components/product-meta";
import { ContactActions } from "../_components/contact-actions";
import { ProductGallery } from "../_components/product-gallery";
import { getProductDTO } from "../_internal/products.dal";

type ProductPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductDTO(id);

  if (!product) return { title: "Producto no encontrado" };

  return { title: `${product.title} — Catálogo`, description: product.summary };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductDTO(id);

  if (!product) notFound();

  // Ficha de datos: añadir campos aquí no exige tocar el maquetado.
  const specs: Array<{ label: string; value: string }> = [
    { label: "Categoría", value: product.category },
    { label: "Publicado", value: formatPublishedDate(product.publishedAt) },
    ...(product.location ? [{ label: "Ubicación", value: product.location }] : []),
    ...(product.price
      ? [{ label: "Precio", value: formatPrice(product.price.amount, product.price.currency) }]
      : []),
    { label: "Referencia", value: product.id.toUpperCase() },
  ];

  return (
    <main className="min-h-screen bg-bg px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-center justify-between gap-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-full py-1 text-sm text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          >
            <ChevronLeftIcon width={16} height={16} />
            Volver al catálogo
          </Link>

          <ThemeToggle />
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-8">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <CategoryBadge category={product.category} />
              <h1 className="text-3xl font-medium leading-tight tracking-[-0.02em] text-fg sm:text-4xl">
                {product.title}
              </h1>
              {product.price ? (
                <p className="text-xl font-medium tabular-nums text-fg">
                  {formatPrice(product.price.amount, product.price.currency)}
                </p>
              ) : null}
              <p className="text-sm leading-relaxed text-fg-muted">{product.description}</p>
            </div>

            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-fg-faint">
                Ficha
              </h2>
              <dl className="divide-y divide-border-subtle border-y border-border-subtle text-sm">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-6 py-2.5">
                    <dt className="text-fg-muted">{spec.label}</dt>
                    <dd className="text-right text-fg">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-fg-faint">
                Contacto
              </h2>
              <ContactActions
                contact={product.contact}
                variant="full"
                emptyMessage="Este producto no tiene datos de contacto publicados."
              />
              {product.contact.email || product.contact.phone ? (
                <p className="text-xs text-fg-faint">
                  {[product.contact.email, product.contact.phone].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
