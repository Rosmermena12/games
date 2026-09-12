import Link from "next/link";
import { ArticleShell } from "@/app/_components/article-shell";
import { SITE_CONFIG } from "@/app/_utils/site.config";

export const metadata = {
  title: "Política de privacidad",
  description:
    "Qué datos trata GamesFull, con qué finalidad, durante cuánto tiempo y cómo ejercer tus derechos de protección de datos.",
  alternates: { canonical: "/legal/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <ArticleShell
      title="Política de privacidad"
      intro={`Cómo tratamos la información de quienes usan ${SITE_CONFIG.name}, qué hacen nuestros proveedores y qué derechos tienes sobre tus datos.`}
      updatedAt={SITE_CONFIG.legalUpdatedAt}
    >
      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos recogidos a través de este sitio es{" "}
        <strong>{SITE_CONFIG.owner}</strong>, titular de {SITE_CONFIG.name}. Puedes contactar en
        cualquier momento escribiendo a{" "}
        <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>.
      </p>

      <h2>2. Principio general: no pedimos datos personales</h2>
      <p>
        {SITE_CONFIG.name} no tiene registro de usuarios, no pide correo electrónico para jugar y no
        guarda perfiles, puntuaciones ni historiales en ningún servidor propio. Puedes usar los tres
        juegos sin facilitarnos ningún dato identificativo.
      </p>

      <h2>3. Información que se almacena en tu navegador</h2>
      <p>
        Determinadas preferencias se guardan en el almacenamiento local de tu propio dispositivo y
        nunca se envían a nosotros:
      </p>
      <ul>
        <li>
          <strong>Tema claro u oscuro</strong>, para que la próxima visita respete tu elección.
        </li>
        <li>
          <strong>Tu decisión sobre cookies</strong>, para no volver a preguntarte en cada visita.
        </li>
      </ul>
      <p>
        Puedes borrar esta información en cualquier momento vaciando los datos del sitio desde la
        configuración de tu navegador.
      </p>

      <h2>4. Partidas multijugador</h2>
      <p>
        El modo en línea funciona con WebRTC: cuando creas una sala, tu navegador se anuncia con un
        código temporal en un servidor de señalización público (el broker gratuito del proyecto
        PeerJS) que sirve únicamente para que los dos navegadores se localicen. A partir de ese
        momento, las jugadas viajan directamente entre los dos dispositivos y no pasan por nosotros.
      </p>
      <p>
        Para establecer esa conexión directa, WebRTC necesita intercambiar las direcciones IP de
        ambos participantes, igual que ocurre en cualquier videollamada. Nosotros no registramos ni
        conservamos esas direcciones. El código de sala es efímero y deja de existir cuando cierras
        la pestaña.
      </p>

      <h2>5. Publicidad y cookies de terceros</h2>
      <p>
        Este sitio se financia mediante publicidad servida por <strong>Google AdSense</strong>.
        Cuando aceptas las cookies publicitarias:
      </p>
      <ul>
        <li>
          Google, como proveedor externo, puede utilizar cookies para mostrar anuncios basados en
          visitas anteriores a este u otros sitios web.
        </li>
        <li>
          El uso por parte de Google de cookies de publicidad le permite a él y a sus socios mostrar
          anuncios basados en tu navegación.
        </li>
        <li>
          Puedes inhabilitar la publicidad personalizada visitando la{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            configuración de anuncios de Google
          </a>{" "}
          o, para proveedores externos, a través de{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            aboutads.info
          </a>
          .
        </li>
        <li>
          Puedes consultar cómo trata Google los datos en{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            «Cómo utiliza Google la información de sitios o aplicaciones que usan sus servicios»
          </a>
          .
        </li>
      </ul>
      <p>
        Si rechazas las cookies publicitarias, no cargamos el script de AdSense y verás los espacios
        publicitarios vacíos. El detalle completo está en la{" "}
        <Link href="/legal/cookies">política de cookies</Link>.
      </p>

      <h2>6. Base jurídica</h2>
      <ul>
        <li>
          <strong>Consentimiento</strong> (art. 6.1.a RGPD) para las cookies publicitarias y de
          medición. Puedes retirarlo cuando quieras.
        </li>
        <li>
          <strong>Interés legítimo</strong> (art. 6.1.f RGPD) para mantener el servicio seguro y
          operativo, incluidas las cookies técnicas imprescindibles.
        </li>
      </ul>

      <h2>7. Conservación</h2>
      <p>
        No conservamos datos personales en servidores propios. Las preferencias guardadas en tu
        navegador permanecen hasta que las borras; la decisión sobre cookies caduca a los seis
        meses, momento en el que se te vuelve a preguntar.
      </p>

      <h2>8. Tus derechos</h2>
      <p>
        Puedes solicitar el acceso, la rectificación, la supresión, la limitación, la portabilidad o
        la oposición al tratamiento de tus datos escribiendo a{" "}
        <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>. Dado que no almacenamos
        información identificativa, en la mayoría de los casos no podremos vincular una solicitud
        con datos concretos, pero atenderemos toda consulta. También puedes reclamar ante la
        autoridad de control de tu país; en España, la Agencia Española de Protección de Datos.
      </p>

      <h2>9. Menores</h2>
      <p>
        {SITE_CONFIG.name} no está dirigido específicamente a menores de 14 años ni recoge
        conscientemente datos de ellos. Si eres madre, padre o tutor y crees que un menor a tu cargo
        nos ha facilitado información, escríbenos y la eliminaremos.
      </p>

      <h2>10. Cambios en esta política</h2>
      <p>
        Podemos actualizar este texto para reflejar cambios legales o técnicos. La fecha de la
        última revisión aparece al principio de la página; los cambios sustanciales se anunciarán en
        el propio sitio.
      </p>
    </ArticleShell>
  );
}
