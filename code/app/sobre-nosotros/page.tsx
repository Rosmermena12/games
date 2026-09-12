import Link from "next/link";
import { ArticleShell } from "@/app/_components/article-shell";
import { SITE_CONFIG } from "@/app/_utils/site.config";
import { GAMES } from "@/app/_utils/games.catalog";

export const metadata = {
  title: "Sobre nosotros",
  description:
    "Quién está detrás de GamesFull, por qué existe el proyecto y cómo se construyen los juegos que encontrarás aquí.",
  alternates: { canonical: "/sobre-nosotros" },
};

export default function SobreNosotrosPage() {
  return (
    <ArticleShell
      title={`Sobre ${SITE_CONFIG.name}`}
      intro="Un proyecto pequeño con una idea fija: que jugar con alguien sea tan fácil como mandarle un código."
    >
      <h2>Por qué existe</h2>
      <p>
        Jugar con un amigo en el navegador se ha vuelto sorprendentemente incómodo. Casi todo pide
        crear una cuenta, verificar un correo, instalar una aplicación o aceptar una lista
        interminable de permisos. Nosotros queríamos lo contrario: abrir una pestaña, copiar cinco
        caracteres y estar jugando en menos de diez segundos.
      </p>
      <p>
        {SITE_CONFIG.name} nació de esa idea. Es un catálogo pequeño y cuidado de juegos arcade
        clásicos, reescritos para el navegador moderno y pensados para partidas cortas: el rato
        muerto antes de una reunión, la pausa de la comida, el viaje en tren.
      </p>

      <h2>Cómo están hechos</h2>
      <p>
        Los juegos se ejecutan con <strong>Phaser 3</strong> directamente sobre el DOM de la página,
        sin capas intermedias ni marcos flotantes, lo que mantiene el teclado enfocado y el
        rendimiento estable incluso en equipos modestos. La simulación física corre a paso fijo para
        que el resultado sea idéntico en un portátil antiguo y en un monitor de 144 Hz.
      </p>
      <p>
        El multijugador usa <strong>WebRTC</strong> mediante PeerJS: los dos navegadores se conectan
        entre sí y se intercambian las jugadas directamente. No hay servidor de partidas, lo que
        significa menos latencia, ningún coste de infraestructura y, sobre todo, ninguna base de
        datos con tus partidas dentro.
      </p>

      <h2>Qué encontrarás ahora mismo</h2>
      <ul>
        {GAMES.map((game) => (
          <li key={game.slug}>
            <Link href={game.href}>{game.title}</Link> — {game.tagline.toLowerCase()}.
          </li>
        ))}
      </ul>
      <p>
        Iremos añadiendo títulos poco a poco, priorizando los que funcionen bien en partidas de dos
        y se entiendan sin leer instrucciones.
      </p>

      <h2>Cómo se financia</h2>
      <p>
        {SITE_CONFIG.name} es gratuito y sin registro. Los gastos de dominio y alojamiento se cubren
        con la publicidad que ves a los lados del tablero y con el anuncio que aparece al empezar una
        partida. Hemos puesto un límite claro: nunca habrá anuncios encima del área de juego, ni
        vídeos con sonido que arranquen solos, ni ventanas que se abran sin que las pidas.
      </p>

      <h2>Hablemos</h2>
      <p>
        Si has encontrado un fallo, tienes una idea para un juego o quieres proponer una
        colaboración, escríbenos a{" "}
        <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a> o usa el{" "}
        <Link href="/contacto">formulario de contacto</Link>. Leemos todo.
      </p>
    </ArticleShell>
  );
}
