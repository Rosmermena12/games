"use client";

import { useMemo, useState } from "react";

import type { ProductDTO } from "@/app/_interfaces/product";
import { ProductCard } from "./product-card";

const ALL = "Todas";

export function ProductCatalog({ products }: { products: ProductDTO[] }) {
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(products.map((product) => product.category))).sort()],
    [products],
  );

  const visible = useMemo(
    () => (category === ALL ? products : products.filter((p) => p.category === category)),
    [products, category],
  );

  return (
    <>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {categories.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setCategory(option)}
            aria-pressed={category === option}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg ${
              category === option
                ? "border-transparent bg-accent text-accent-fg"
                : "border-border-subtle text-fg-muted hover:bg-surface-2 hover:text-fg"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-fg-faint">
          No hay productos en esta categoría.
        </p>
      ) : null}
    </>
  );
}
