import Link from "next/link";
import { ArticleShell } from "@/app/_components/article-shell";
import { GAMES } from "@/app/_utils/games.catalog";

export const metadata = {
  title: "Cómo jugar",
  description:
    "Guía del multijugador por código de invitación en GamesFull y explicación de las reglas de Poing, Hockey de Mesa y Bloques.",
  alternates: { canonical: "/como-jugar" },
};

export default function ComoJugarPage() {
  return (
    <ArticleShell
      title="Cómo jugar"
      intro="El multijugador de GamesFull funciona con un código de cinco caracteres. Aquí tienes el proceso completo y las reglas de cada juego."
    >
      <h2>Partida en línea, paso a paso</h2>
      <ul>
        <li>
          <strong>Abre el juego</strong> que quieras. Empezarás jugando contra la máquina mientras
          preparas la sala.
        </li>
        <li>
          <strong>Pulsa «Crear sala»</strong>. Aparecerá un código de cinco caracteres, por ejemplo{" "}
          <em>K7RQ2</em>.
        </li>
        <li>
          <strong>Comparte el código</strong> con la otra persona por el chat que uses. El botón
          «Copiar» lo deja listo en el portapapeles.
        </li>
        <li>
          <strong>La otra persona abre el mismo juego</strong>, escribe el código en el campo de
          texto y pulsa «Unirse».
        </li>
        <li>
          <strong>La partida arranca sola</strong> en cuanto los dos navegadores se conectan. El
          marcador se pone a cero y la máquina deja de jugar.
        </li>
      </ul>

      <h3>Si no consigues conectar</h3>
      <ul>
        <li>
          Comprueba que los dos habéis abierto <em>el mismo juego</em>: los códigos no se comparten
          entre títulos distintos.
        </li>
        <li>
          El código caduca cuando quien creó la sala cierra la pestaña. Si ha pasado un rato, crea
          una sala nueva.
        </li>
        <li>
          Algunas redes corporativas y VPN bloquean las conexiones directas entre navegadores. Probar
          desde otra red suele resolverlo.
        </li>
        <li>
          Las extensiones que bloquean scripts pueden impedir la carga del motor de juego. Añade el
          sitio a la lista de excepciones si usas una.
        </li>
      </ul>

      <h2>Reglas de cada juego</h2>

      <h3>Poing</h3>
      <p>
        Dos palas, una bola. Cada vez que la bola toca una pala acelera un poco, y el ángulo de
        salida depende del punto de la pala donde impacte: por el centro sale recta, por los
        extremos sale muy abierta. Gana quien llegue antes a <strong>11 puntos</strong>.
      </p>
      <p>
        Se controla con el ratón, con el dedo o con las teclas W y S (o las flechas arriba y abajo).
        La tecla P pausa la partida.
      </p>

      <h3>Hockey de Mesa</h3>
      <p>
        El disco es grande y rápido, y el mazo le transfiere su propia velocidad: un golpe seco lo
        dispara, un toque suave lo coloca. El mazo no puede cruzar la línea central.
      </p>
      <p>
        Sólo se marca por la <strong>portería central</strong>: el resto del fondo es banda y
        devuelve el disco. La portería es más ancha que el mazo, así que no puedes taparla entera y
        toca anticipar la trayectoria. Gana quien llegue a <strong>7 goles</strong>.
      </p>

      <h3>Bloques</h3>
      <p>
        Caen cápsulas de dos fichas que pueden ser de dos colores. Gíralas y colócalas hasta alinear{" "}
        <strong>cuatro fichas del mismo color</strong> en horizontal o en vertical: entonces
        desaparecen y lo que estaba encima cae. Si al caer se forma otra línea, se encadena una
        cascada y puntúa mucho más.
      </p>
      <p>
        En partida en línea, cada jugador tiene su propio tablero. Las combinaciones grandes y las
        cascadas envían <strong>fichas de basura</strong> al rival, que aparecen en columnas al azar
        en su siguiente cápsula. Pierde quien desborde el tablero primero.
      </p>
      <p>
        Controles: flechas izquierda y derecha para mover, flecha arriba o X para girar, Z para girar
        al revés, flecha abajo para bajar más rápido y espacio para soltar de golpe. En móvil tienes
        los mismos botones bajo el tablero.
      </p>

      <h2>Empieza a jugar</h2>
      <ul>
        {GAMES.map((game) => (
          <li key={game.slug}>
            <Link href={game.href}>{game.title}</Link> — {game.players}, {game.duration}.
          </li>
        ))}
      </ul>
    </ArticleShell>
  );
}
