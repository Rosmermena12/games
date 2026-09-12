import "server-only";

import type { ProductContactDTO, ProductDTO } from "@/app/_interfaces/product";
import type { ProductResponse } from "../_schemas/product-response.schema";

/** wa.me y t.me esperan el número sin "+" ni separadores. */
function toDialDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function toContactDTO(raw: ProductResponse): ProductContactDTO {
  const email = raw.contact_email;
  const phone = raw.contact_phone;
  const digits = phone ? toDialDigits(phone) : null;

  return {
    email,
    phone,
    mailtoUrl: email ? `mailto:${email}?subject=${encodeURIComponent(`Consulta: ${raw.title}`)}` : null,
    telUrl: phone ? `tel:${phone}` : null,
    whatsappUrl: digits
      ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hola, me interesa "${raw.title}".`)}`
      : null,
    telegramUrl: digits ? `https://t.me/+${digits}` : null,
  };
}

export function toProductDTO(raw: ProductResponse): ProductDTO {
  return {
    id: raw.id,
    title: raw.title,
    summary: raw.summary,
    description: raw.description,
    category: raw.category,
    publishedAt: raw.published_at,
    location: raw.location,
    price:
      raw.price_amount !== null && raw.price_currency !== null
        ? { amount: raw.price_amount, currency: raw.price_currency }
        : null,
    images: raw.images,
    contact: toContactDTO(raw),
  };
}
