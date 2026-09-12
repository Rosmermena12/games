/**
 * DTOs seguros para cliente. No contienen campos crudos del backend.
 */

export interface ProductContactDTO {
  /** Dirección de correo, o null si el producto no la publica. */
  email: string | null;
  /** Teléfono en formato E.164 para mostrar, o null. */
  phone: string | null;
  /** Enlaces ya resueltos en servidor: el cliente sólo los renderiza. */
  mailtoUrl: string | null;
  telUrl: string | null;
  whatsappUrl: string | null;
  telegramUrl: string | null;
}

export interface ProductDTO {
  id: string;
  title: string;
  /** Texto corto para la tarjeta del listado. */
  summary: string;
  /** Texto completo para el detalle. */
  description: string;
  category: string;
  /** ISO 8601 en UTC. El formato de presentación se decide en la UI. */
  publishedAt: string;
  location: string | null;
  price: { amount: number; currency: string } | null;
  images: string[];
  contact: ProductContactDTO;
}
