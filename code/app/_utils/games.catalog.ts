import type { GameSummary } from "@/app/_interfaces/game";

/**
 * Catálogo de juegos. Es la única fuente de verdad: portada, rutas, sitemap y
 * enlaces internos se generan a partir de esta lista.
 */
export const GAMES: GameSummary[] = [
  {
    slug: "poing",
    title: "Poing",
    tagline: "El duelo de palas original",
    description:
      "Un Pong fiel al arcade de 1972: dos palas, una bola que acelera en cada golpe y el primero que llega a 11 puntos gana. El ángulo de rebote depende de dónde golpees la bola con la pala.",
    tags: ["Arcade", "Clásico", "1 vs 1"],
    players: "1 jugador (CPU) o 2 en línea",
    duration: "3-5 min",
    href: "/juegos/poing",
    accent: "cyan",
    controls: ["Ratón o dedo para mover la pala", "W / S o ↑ / ↓ con teclado", "P para pausar"],
  },
  {
    slug: "hockey",
    title: "Hockey de Mesa",
    tagline: "Disco grande, reflejos cortos",
    description:
      "Air hockey a 120 pasos de simulación por segundo: el disco es grande y rápido, el mazo transfiere su propia velocidad al golpear y sólo se marca por la portería central, más ancha que el mazo pero difícil de encontrar cuando el disco vuela.",
    tags: ["Arcade", "Rápido", "1 vs 1"],
    players: "1 jugador (CPU) o 2 en línea",
    duration: "3-6 min",
    href: "/juegos/hockey",
    accent: "magenta",
    controls: ["Ratón o dedo para mover el mazo", "El mazo no puede cruzar el centro", "P para pausar"],
  },
  {
    slug: "bloques",
    title: "Bloques",
    tagline: "Dos colores, cuatro en línea",
    description:
      "Puzle de cápsulas al estilo Dr. Mario simplificado a dos colores: gira la cápsula, colócala y alinea cuatro fichas del mismo color en horizontal o vertical para eliminarlas. Las combinaciones envían basura al rival.",
    tags: ["Puzle", "Versus", "Combos"],
    players: "1 jugador o 2 en línea",
    duration: "5-10 min",
    href: "/juegos/bloques",
    accent: "lime",
    controls: ["← / → mover", "↑ o X girar, Z girar al revés", "↓ bajar rápido, Espacio soltar"],
  },
];

export function getGameBySlug(slug: string): GameSummary | undefined {
  return GAMES.find((game) => game.slug === slug);
}
