"use client";

import Link from "next/link";

import type { ProductDTO } from "@/app/_interfaces/product";
import { ContactActions } from "./contact-actions";
import { ImageCarousel } from "./image-carousel";
import { ProductMeta } from "./product-meta";

/**
 * Tarjeta del listado: sólo información de identificación y el correo.
 * Precio y canales telefónicos viven únicamente en la página de detalle.
 */
export function ProductCard({ product }: { product: ProductDTO }) {
  return (
    <article className="grid gap-5 rounded-card border border-border-subtle bg-surface p-3 transition-colors hover:border-fg/15 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] sm:gap-6 sm:p-4">
      <div className="aspect-[4/3] sm:aspect-auto sm:min-h-[13rem]">
        <ImageCarousel images={product.images} alt={product.title} className="h-full" />
      </div>

      <div className="flex flex-col gap-3 pb-1 sm:py-2 sm:pr-2">
        <ProductMeta
          category={product.category}
          publishedAt={product.publishedAt}
          location={product.location}
        />

        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-medium leading-snug tracking-[-0.01em] text-fg">
            <Link
              href={`/products/${product.id}`}
              className="rounded-sm transition-colors hover:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
            >
              {product.title}
            </Link>
          </h2>
          <p className="text-sm leading-relaxed text-fg-muted">{product.summary}</p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <ContactActions contact={product.contact} channels={["email"]} />

          <Link
            href={`/products/${product.id}`}
            className="ml-auto rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}