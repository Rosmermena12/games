import Link from "next/link";
import { GameCard } from "./_components/game-card";
import { AdSlot } from "./_components/ad-slot";
import { GAMES } from "./_utils/games.catalog";
import { SITE_CONFIG } from "./_utils/site.config";
import { ADS_CONFIG } from "./_utils/ads.config";

export const metadata = {
  title: { absolute: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}` },
  description: SITE_CONFIG.description,
};

const STEPS = [
  {
    title: "Elige un juego",
    body: "Cada juego se abre en su propia página a pantalla completa. No hay descargas, cuentas ni instalaciones: el navegador es la consola.",
  },
  {
    title: "Crea la sala",
    body: "Pulsa «Crear sala» y GamesFull genera un código de invitación de cinco caracteres. Cópialo y mándaselo a quien quieras por el chat que uses.",
  },
  {
    title: "Tu amigo lo escribe",
    body: "La otra persona abre el mismo juego, pega el código y pulsa «Unirse». La partida arranca en cuanto los dos navegadores se dan la mano.",
  },
  {
    title: "Jugáis directamente",
    body: "La conexión es de navegador a navegador mediante WebRTC. Las jugadas no pasan por ningún servidor intermedio, así que la latencia es la mínima posible.",
  },
];

const FAQ = [
  {
    q: "¿Tengo que registrarme para jugar?",
    a: "No. GamesFull no tiene cuentas ni formularios de registro. Entras, eliges juego y juegas. Si quieres partida en línea sólo necesitas compartir el código de invitación con la otra persona.",
  },
  {
    q: "¿Cómo funciona el código de invitación?",
    a: "Al crear una sala tu navegador se registra con un identificador corto y queda a la espera. Cuando tu rival introduce ese mismo código, los dos navegadores establecen una conexión directa (WebRTC) y se intercambian las jugadas entre ellos. No guardamos partidas ni retransmitimos el juego desde nuestros servidores.",
  },
  {
    q: "¿Puedo jugar solo?",
    a: "Sí. Poing y Hockey de Mesa incluyen un rival controlado por la máquina con tres niveles de dificultad, y Bloques tiene modo de una sola persona para batir tu propia puntuación.",
  },
  {
    q: "¿Funciona en el móvil?",
    a: "Sí. Los tres juegos aceptan control táctil y el tablero se adapta al tamaño de pantalla. En pantallas pequeñas los anuncios laterales se ocultan para no estorbar al tablero.",
  },
  {
    q: "¿Por qué hay anuncios?",
    a: "Los anuncios son lo que permite que GamesFull sea gratuito y sin registro. Verás un anuncio a pantalla completa al abrir un juego y al reiniciar una partida, y banners a los lados mientras juegas; nunca encima del tablero.",
  },
  {
    q: "¿Qué datos recogéis?",
    a: "Ninguno que te identifique por nuestra parte: las preferencias de tema y el consentimiento de cookies se guardan en tu propio navegador. Nuestro proveedor de publicidad sí puede usar cookies, y por eso te preguntamos antes de cargar nada. Lo explicamos en detalle en la política de privacidad.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
      <section className="flex flex-col gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-fg-faint">
          Juegos en el navegador
        </p>
        <h1 className="max-w-3xl text-3xl font-medium leading-tight tracking-[-0.02em] text-fg sm:text-5xl">
          Juega con quien quieras compartiendo un código
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-fg-muted sm:text-base">
          {SITE_CONFIG.description} Sin registros, sin descargas y sin esperas: tres juegos arcade
          reinterpretados para jugarse de navegador a navegador.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href={GAMES[0].href}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90"
          >
            Empezar por Poing
          </Link>
          <Link
            href="/como-jugar"
            className="rounded-full border border-border-subtle px-5 py-2.5 text-sm font-medium text-fg transition hover:bg-surface-2"
          >
            Cómo funciona el multijugador
          </Link>
        </div>
      </section>

      <section aria-labelledby="catalogo" className="mt-12 flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <h2 id="catalogo" className="text-xl font-medium tracking-[-0.01em] text-fg">
            Nuestros juegos
          </h2>
          <p className="text-xs text-fg-faint">{GAMES.length} disponibles</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>

      <AdSlot
        slot={ADS_CONFIG.slots.inline}
        format="horizontal"
        minHeight={100}
        className="mt-10 w-full"
      />

      <section aria-labelledby="como-va" className="mt-14 flex flex-col gap-5">
        <h2 id="como-va" className="text-xl font-medium tracking-[-0.01em] text-fg">
          Cómo se juega en línea
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface p-5"
            >
              <span className="text-xs font-semibold text-fg-faint">0{index + 1}</span>
              <h3 className="text-sm font-medium text-fg">{step.title}</h3>
              <p className="text-xs leading-relaxed text-fg-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq" className="mt-14 flex flex-col gap-4">
        <h2 id="faq" className="text-xl font-medium tracking-[-0.01em] text-fg">
          Preguntas frecuentes
        </h2>
        <div className="flex flex-col gap-2">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-card border border-border-subtle bg-surface p-4 open:bg-surface-2"
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-fg marker:hidden">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
