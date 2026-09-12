import Link from "next/link";
import { ArticleShell } from "@/app/_components/article-shell";
import { CookieSettingsButton } from "@/app/_components/cookie-settings-button";
import { SITE_CONFIG } from "@/app/_utils/site.config";

export const metadata = {
  title: "Política de cookies",
  description:
    "Qué cookies y almacenamiento local usa GamesFull, para qué sirve cada uno y cómo cambiar tu decisión en cualquier momento.",
  alternates: { canonical: "/legal/cookies" },
};

export default function CookiesPage() {
  return (
    <ArticleShell
      title="Política de cookies"
      intro="Qué se guarda en tu navegador cuando juegas, quién lo guarda y cómo revocar tu consentimiento."
      updatedAt={SITE_CONFIG.legalUpdatedAt}
    >
      <h2>1. Qué es una cookie</h2>
      <p>
        Una cookie es un pequeño archivo que un sitio web guarda en tu dispositivo para recordar
        información entre visitas. Bajo el mismo paraguas se incluyen tecnologías equivalentes como
        el almacenamiento local (<em>localStorage</em>), que es lo que utilizamos nosotros para las
        funciones propias.
      </p>

      <h2>2. Cookies que usa {SITE_CONFIG.name}</h2>

      <h3>Necesarias (siempre activas)</h3>
      <p>
        No requieren consentimiento porque son imprescindibles para prestar el servicio que has
        solicitado. Se guardan en tu navegador y nunca se envían a nuestros servidores:
      </p>
      <ul>
        <li>
          <strong>theme</strong> — recuerda si prefieres el tema claro u oscuro. Permanente hasta
          que borres los datos del sitio.
        </li>
        <li>
          <strong>gf-consent-v1</strong> — guarda tu decisión sobre esta misma política para no
          volver a preguntarte. Caduca a los seis meses.
        </li>
      </ul>

      <h3>Publicitarias (requieren tu consentimiento)</h3>
      <p>
        Las gestiona <strong>Google AdSense</strong> y sus socios. Sirven para mostrar anuncios,
        limitar el número de veces que ves el mismo, medir su eficacia y, si lo autorizas,
        personalizarlos según tu navegación. Sólo se cargan si pulsas «Aceptar todo» o activas la
        categoría de publicidad; hasta entonces el script de Google ni siquiera se descarga.
      </p>
      <ul>
        <li>
          Dominios implicados: <em>googlesyndication.com</em>, <em>doubleclick.net</em>,{" "}
          <em>google.com</em>.
        </li>
        <li>
          Finalidad: selección, entrega, medición y, con tu permiso, personalización de anuncios.
        </li>
        <li>Duración: la que establece Google para cada cookie, habitualmente entre 1 y 24 meses.</li>
      </ul>

      <h3>De medición (requieren tu consentimiento)</h3>
      <p>
        Estadísticas agregadas que nos indican qué juegos se usan más y dónde falla la experiencia.
        Nunca se combinan con datos identificativos.
      </p>

      <h2>3. Cómo gestionamos tu consentimiento</h2>
      <p>
        Aplicamos el <strong>Consent Mode v2 de Google</strong>: al cargar la página, todas las
        categorías opcionales están denegadas por defecto. Sólo cuando tomas una decisión se
        actualiza ese estado y, si aceptas, se carga la publicidad. Puedes rechazar todo con un solo
        clic, exactamente igual que aceptar.
      </p>

      <h2>4. Cambiar o retirar tu decisión</h2>
      <p>
        Puedes modificar tu elección cuando quieras desde este botón; volverá a aparecer el aviso
        inicial:
      </p>
      <p>
        <CookieSettingsButton />
      </p>
      <p>
        También puedes bloquear o eliminar cookies desde la configuración de tu navegador. Ten en
        cuenta que si bloqueas el almacenamiento local, preferencias como el tema dejarán de
        recordarse.
      </p>

      <h2>5. Más información</h2>
      <p>
        El tratamiento de datos asociado se describe en nuestra{" "}
        <Link href="/legal/privacidad">política de privacidad</Link>. Para conocer el uso que hace
        Google de la información recogida en sitios que utilizan sus servicios, consulta{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          su documentación oficial
        </a>
        .
      </p>
    </ArticleShell>
  );
}
