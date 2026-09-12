import "server-only";

import { cache } from "react";

import type { ProductDTO } from "@/app/_interfaces/product";
import { productListResponseSchema } from "../_schemas/product-response.schema";
import { toProductDTO } from "./products.mapper";
import mockPayload from "./products.mock.json";

/**
 * Fuente de datos temporal: JSON mockeado con la misma forma (snake_case) que
 * devolverá el backend. Cuando exista la API real, sólo cambia el origen del
 * `raw`: la validación, el mapeo y el DTO de salida se mantienen intactos.
 */
async function fetchProductsRaw(): Promise<unknown> {
  return mockPayload;
}

export const getProductsDTO = cache(async (): Promise<ProductDTO[]> => {
  const raw = await fetchProductsRaw();
  const parsed = productListResponseSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("No se pudieron cargar los productos");
  }

  return parsed.data.items
    .map(toProductDTO)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
});

export const getProductDTO = cache(async (id: string): Promise<ProductDTO | null> => {
  const products = await getProductsDTO();

  return products.find((product) => product.id === id) ?? null;
});
