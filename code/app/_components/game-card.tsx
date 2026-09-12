import Link from "next/link";
import type { GameSummary } from "@/app/_interfaces/game";

interface GameCardProps {
  game: GameSummary;
}

/** Card del catálogo. El acento de color se resuelve vía `data-accent`. */
export function GameCard({ game }: GameCardProps) {
  return (
    <article
      data-accent={game.accent}
      className="group relative flex flex-col overflow-hidden rounded-card border border-border-subtle bg-surface transition hover:-translate-y-0.5 hover:border-[var(--game-accent)]"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-surface-2">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(var(--game-accent) 1px, transparent 1px), linear-gradient(90deg, var(--game-accent) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <GamePreview slug={game.slug} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium tracking-[-0.01em] text-fg">{game.title}</h3>
          <p className="text-xs font-medium text-[var(--game-accent)]">{game.tagline}</p>
        </div>

        <p className="flex-1 text-sm leading-relaxed text-fg-muted">{game.description}</p>

        <ul className="flex flex-wrap gap-1.5">
          {game.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border-subtle bg-surface-2 px-2.5 py-1 text-[11px] text-fg-muted"
            >
              {tag}
            </li>
          ))}
        </ul>

        <dl className="grid grid-cols-2 gap-2 border-t border-border-subtle pt-3 text-[11px]">
          <div>
            <dt className="text-fg-faint">Jugadores</dt>
            <dd className="text-fg-muted">{game.players}</dd>
          </div>
          <div>
            <dt className="text-fg-faint">Partida</dt>
            <dd className="text-fg-muted">{game.duration}</dd>
          </div>
        </dl>

        <Link
          href={game.href}
          className="mt-1 inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90"
        >
          Jugar a {game.title}
          <span className="sr-only"> (se abre en su propia página)</span>
        </Link>
      </div>
    </article>
  );
}

/** Miniatura vectorial: evita imágenes externas y pesa prácticamente nada. */
function GamePreview({ slug }: { slug: string }) {
  const stroke = "var(--game-accent)";

  if (slug === "poing") {
    return (
      <svg viewBox="0 0 120 70" className="relative h-20 w-auto" aria-hidden>
        <rect x="1" y="1" width="118" height="68" rx="4" fill="none" stroke={stroke} strokeOpacity="0.5" />
        <line x1="60" y1="6" x2="60" y2="64" stroke={stroke} strokeOpacity="0.35" strokeDasharray="4 5" />
        <rect x="8" y="22" width="5" height="24" rx="2" fill={stroke} />
        <rect x="107" y="32" width="5" height="24" rx="2" fill={stroke} />
        <circle cx="70" cy="30" r="4" fill={stroke} />
      </svg>
    );
  }

  if (slug === "hockey") {
    return (
      <svg viewBox="0 0 120 70" className="relative h-20 w-auto" aria-hidden>
        <rect x="1" y="1" width="118" height="68" rx="8" fill="none" stroke={stroke} strokeOpacity="0.5" />
        <line x1="60" y1="4" x2="60" y2="66" stroke={stroke} strokeOpacity="0.35" />
        <circle cx="60" cy="35" r="11" fill="none" stroke={stroke} strokeOpacity="0.35" />
        <line x1="1" y1="25" x2="1" y2="45" stroke={stroke} strokeWidth="3" />
        <line x1="119" y1="25" x2="119" y2="45" stroke={stroke} strokeWidth="3" />
        <circle cx="24" cy="35" r="7" fill="none" stroke={stroke} strokeWidth="2" />
        <circle cx="84" cy="24" r="8" fill={stroke} fillOpacity="0.85" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 70" className="relative h-20 w-auto" aria-hidden>
      <rect x="34" y="1" width="52" height="68" rx="4" fill="none" stroke={stroke} strokeOpacity="0.5" />
      <rect x="38" y="46" width="11" height="11" rx="2" fill={stroke} />
      <rect x="50" y="46" width="11" height="11" rx="2" fill={stroke} fillOpacity="0.35" />
      <rect x="62" y="46" width="11" height="11" rx="2" fill={stroke} />
      <rect x="38" y="58" width="11" height="11" rx="2" fill={stroke} fillOpacity="0.35" />
      <rect x="62" y="58" width="11" height="11" rx="2" fill={stroke} fillOpacity="0.35" />
      <rect x="50" y="14" width="11" height="11" rx="5" fill={stroke} />
      <rect x="62" y="14" width="11" height="11" rx="5" fill={stroke} fillOpacity="0.35" />
    </svg>
  );
}
