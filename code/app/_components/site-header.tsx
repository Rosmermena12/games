import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { SITE_CONFIG } from "@/app/_utils/site.config";
import { GAMES } from "@/app/_utils/games.catalog";

const NAV_LINKS = [
  { href: "/como-jugar", label: "Cómo jugar" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
];

/** Cabecera común. Mantiene los juegos a un clic desde cualquier página. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label={`${SITE_CONFIG.name} — inicio`}>
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[13px] font-bold text-accent-fg"
          >
            GF
          </span>
          <span className="text-sm font-semibold tracking-[-0.01em] text-fg">
            {SITE_CONFIG.name}
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {GAMES.map((game) => (
            <Link
              key={game.slug}
              href={game.href}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-fg-muted transition hover:bg-surface-2 hover:text-fg"
            >
              {game.title}
            </Link>
          ))}
          <span aria-hidden className="mx-1 h-4 w-px bg-border-subtle" />
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-fg-muted transition hover:bg-surface-2 hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
