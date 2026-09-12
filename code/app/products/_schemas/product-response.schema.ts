import { z } from "zod";

/**
 * Contrato del backend (snake_case). Toda respuesta se valida antes de mapearse.
 */
export const productResponseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  summary: z.string().min(1),
  category: z.string().min(1),
  published_at: z.string().datetime(),
  location: z.string().nullable().default(null),
  price_amount: z.number().nonnegative().nullable().default(null),
  price_currency: z.string().length(3).nullable().default(null),
  images: z.array(z.string().url()).min(1),
  contact_email: z.string().email().nullable().default(null),
  contact_phone: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, "Se espera un teléfono en formato E.164")
    .nullable()
    .default(null),
});

export const productListResponseSchema = z.object({
  items: z.array(productResponseSchema),
});

export type ProductResponse = z.infer<typeof productResponseSchema>;
