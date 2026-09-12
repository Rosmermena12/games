/** Metadatos de un juego del catálogo. Seguro para cliente y servidor. */
export interface GameSummary {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Etiquetas cortas mostradas en la card. */
  tags: string[];
  /** Jugadores soportados, ya formateado para la UI. */
  players: string;
  /** Duración media de una partida. */
  duration: string;
  href: string;
  /** Paleta de acento de la card: se mapea a variables CSS. */
  accent: "cyan" | "magenta" | "lime";
  /** Controles resumidos para la ficha del juego. */
  controls: string[];
}
