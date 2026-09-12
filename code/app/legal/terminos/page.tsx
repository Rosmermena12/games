import Link from "next/link";
import { ArticleShell } from "@/app/_components/article-shell";
import { SITE_CONFIG } from "@/app/_utils/site.config";

export const metadata = {
  title: "Términos de servicio",
  description:
    "Condiciones de uso de GamesFull: qué puedes hacer en el sitio, qué no, y cómo se reparten las responsabilidades.",
  alternates: { canonical: "/legal/terminos" },
};

export default function TerminosPage() {
  return (
    <ArticleShell
      title="Términos de servicio"
      intro={`Estas condiciones regulan el acceso y el uso de ${SITE_CONFIG.name}. Al usar el sitio aceptas lo que se describe aquí.`}
      updatedAt={SITE_CONFIG.legalUpdatedAt}
    >
      <h2>1. Quiénes somos</h2>
      <p>
        {SITE_CONFIG.name} es un sitio web operado por <strong>{SITE_CONFIG.owner}</strong> que
        ofrece juegos gratuitos ejecutados íntegramente en el navegador. Para cualquier cuestión
        relacionada con estas condiciones puedes escribir a{" "}
        <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>.
      </p>

      <h2>2. Aceptación</h2>
      <p>
        El uso del sitio implica la aceptación plena de estos términos y de la{" "}
        <Link href="/legal/privacidad">política de privacidad</Link> y la{" "}
        <Link href="/legal/cookies">política de cookies</Link>. Si no estás de acuerdo con alguno de
        sus puntos, te pedimos que no utilices el servicio.
      </p>

      <h2>3. Servicio ofrecido</h2>
      <p>
        Ofrecemos acceso gratuito a juegos que se ejecutan en tu propio navegador, en modo
        individual o en partidas de dos jugadores mediante un código de invitación. No se requiere
        registro ni pago alguno.
      </p>
      <p>
        El servicio se presta «tal cual» y «según disponibilidad». Podemos modificar, suspender o
        retirar cualquier juego o funcionalidad en cualquier momento, sin que ello genere derecho a
        indemnización.
      </p>

      <h2>4. Uso aceptable</h2>
      <p>Al usar {SITE_CONFIG.name} te comprometes a no:</p>
      <ul>
        <li>
          Utilizar el sitio con fines ilícitos o de forma que perjudique a otras personas usuarias.
        </li>
        <li>
          Intentar acceder a partidas ajenas, interferir en las conexiones entre jugadores o alterar
          el resultado de un juego mediante herramientas externas.
        </li>
        <li>
          Introducir código malicioso, automatizar peticiones masivas o realizar acciones dirigidas
          a degradar el rendimiento del servicio.
        </li>
        <li>
          Generar clics o impresiones artificiales sobre los anuncios, ni incitar a terceros a
          hacerlo. Esta conducta vulnera además las políticas del programa publicitario.
        </li>
        <li>
          Reproducir, copiar o distribuir el contenido del sitio con fines comerciales sin
          autorización previa por escrito.
        </li>
      </ul>

      <h2>5. Partidas entre jugadores</h2>
      <p>
        El modo multijugador establece una conexión directa entre los dos navegadores participantes.
        Al compartir un código de invitación estás permitiendo que otro dispositivo se conecte al
        tuyo para intercambiar exclusivamente los datos de la partida. Comparte el código sólo con
        personas de tu confianza. No supervisamos ni moderamos el contenido de esas conexiones
        porque no pasan por nuestros sistemas.
      </p>

      <h2>6. Propiedad intelectual</h2>
      <p>
        El código, el diseño, los textos y los elementos gráficos originales de {SITE_CONFIG.name}{" "}
        pertenecen a su titular. Los juegos incluidos son desarrollos propios inspirados en géneros
        clásicos del videojuego; no están asociados, patrocinados ni avalados por los titulares de
        las marcas de los títulos históricos a los que rinden homenaje, y las marcas citadas
        pertenecen a sus respectivos propietarios.
      </p>

      <h2>7. Publicidad</h2>
      <p>
        El sitio muestra publicidad de terceros, que es lo que permite que el servicio sea gratuito.
        No somos responsables del contenido de los anuncios ni de los productos o servicios de los
        anunciantes; cualquier relación comercial derivada de un anuncio se establece exclusivamente
        entre tú y el anunciante.
      </p>

      <h2>8. Limitación de responsabilidad</h2>
      <p>
        En la medida permitida por la ley, {SITE_CONFIG.owner} no responde de daños indirectos,
        pérdida de datos o lucro cesante derivados del uso o la imposibilidad de uso del sitio.
        Tampoco garantizamos que el servicio esté libre de interrupciones o errores, ni la calidad
        de la conexión entre jugadores, que depende de la red de cada participante.
      </p>

      <h2>9. Enlaces externos</h2>
      <p>
        Algunas páginas enlazan a sitios de terceros (por ejemplo, la documentación de privacidad de
        Google). No controlamos esos sitios ni asumimos responsabilidad sobre su contenido o sus
        prácticas de privacidad.
      </p>

      <h2>10. Legislación aplicable</h2>
      <p>
        Estas condiciones se rigen por la legislación de {SITE_CONFIG.jurisdiction}. Para cualquier
        controversia, las partes se someten a los juzgados y tribunales que resulten competentes
        conforme a la normativa de consumo aplicable.
      </p>

      <h2>11. Modificaciones</h2>
      <p>
        Podemos actualizar estos términos cuando cambien el servicio o la normativa. La versión
        vigente es siempre la publicada en esta página, con su fecha de revisión.
      </p>
    </ArticleShell>
  );
}
