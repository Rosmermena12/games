/**
 * Configuración pública del sitio. Es el único lugar donde se editan nombre,
 * dominio y datos de contacto: las páginas legales y los metadatos leen de aquí.
 */
export const SITE_CONFIG = {
  name: "GamesFull",
  tagline: "Juegos multijugador en el navegador, sin instalar nada",
  description:
    "GamesFull es una plataforma gratuita de juegos multijugador que se juegan directamente en el navegador. Crea una sala, comparte el código de invitación y juega al instante contra un amigo.",
  /** Dominio de producción. Cámbialo antes de desplegar y de solicitar AdSense. */
  url: "https://games.rctest.online",
  /** Correo de contacto visible en el aviso legal y en la política de privacidad. */
  email: "contacto@rctest.online",
  /** Titular del sitio (persona o empresa). Obligatorio para el aviso legal. */
  owner: "GamesFull",
  /** País/jurisdicción aplicable en los términos de servicio. */
  jurisdiction: "España",
  /** Fecha de última revisión de los textos legales. */
  legalUpdatedAt: "12 de septiembre de 2026",
  locale: "es-ES",
} as const;
