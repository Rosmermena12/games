/**
 * Formateadores deterministas: locale y zona horaria fijos para que servidor y
 * cliente produzcan el mismo texto y no se rompa la hidratación.
 */

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatPublishedDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate)).replace(".", "");
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
