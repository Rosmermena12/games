import Link from "next/link";
import { SITE_CONFIG } from "@/app/_utils/site.config";
import { GAMES } from "@/app/_utils/games.catalog";

const LEGAL_LINKS = [
  { href: "/legal/terminos", label: "Términos de servicio" },
  { href: "/legal/privacidad", label: "Política de privacidad" },
  { href: "/legal/cookies", label: "Política de cookies" },
  { href: "/contacto", label: "Contacto" },
];

/**
 * Pie de página. Los enlaces legales deben estar accesibles desde todas las
 * páginas: es uno de los puntos que revisa Google antes de aprobar AdSense.
 */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border-subtle bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-fg">{SITE_CONFIG.name}</p>
          <p className="max-w-xs text-xs leading-relaxed text-fg-muted">{SITE_CONFIG.tagline}.</p>
          <p className="text-xs text-fg-faint">
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="underline underline-offset-2 hover:text-fg"
            >
              {SITE_CONFIG.email}
            </a>
          </p>
        </div>

        <nav aria-label="Juegos" className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-fg-faint">Juegos</p>
          {GAMES.map((game) => (
            <Link
              key={game.slug}
              href={game.href}
              className="text-xs text-fg-muted transition hover:text-fg"
            >
              {game.title}
            </Link>
          ))}
        </nav>

        <nav aria-label="Legal" className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-fg-faint">Legal</p>
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-fg-muted transition hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border-subtle">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-5 text-[11px] leading-relaxed text-fg-faint sm:px-6">
          <p>
            © {new Date().getFullYear()} {SITE_CONFIG.owner}. Todos los derechos reservados.
          </p>
          <p>
            Este sitio se financia con publicidad. Google y sus socios pueden usar cookies para
            mostrar anuncios en función de tus visitas previas. Puedes cambiar tu elección en
            cualquier momento desde la{" "}
            <Link href="/legal/cookies" className="underline underline-offset-2">
              política de cookies
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
