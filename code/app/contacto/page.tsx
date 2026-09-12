import { ContactForm } from "./_components/contact-form";
import { SITE_CONFIG } from "@/app/_utils/site.config";

export const metadata = {
  title: "Contacto",
  description:
    "Escríbenos para reportar un fallo, sugerir un juego, tratar temas de publicidad o ejercer tus derechos de protección de datos.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-3 border-b border-border-subtle pb-8">
        <h1 className="text-3xl font-medium tracking-[-0.02em] text-fg">Contacto</h1>
        <p className="text-sm leading-relaxed text-fg-muted">
          Somos un equipo pequeño y respondemos personalmente. Escribe a{" "}
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="underline underline-offset-2 hover:text-fg"
          >
            {SITE_CONFIG.email}
          </a>{" "}
          o usa el formulario. Solemos contestar en un plazo de dos o tres días laborables.
        </p>
      </header>

      <section className="flex flex-col gap-6 pt-8">
        <ContactForm />

        <div className="gf-prose">
          <h2>Qué nos ayuda a resolverlo antes</h2>
          <ul>
            <li>El juego y el modo (individual o con código de invitación).</li>
            <li>El navegador y el sistema operativo que usas.</li>
            <li>Si el problema aparece siempre o sólo a veces.</li>
            <li>Cualquier mensaje de error que hayas visto en pantalla.</li>
          </ul>

          <h2>Datos del titular</h2>
          <p>
            Titular: <strong>{SITE_CONFIG.owner}</strong>
            <br />
            Correo de contacto y de protección de datos:{" "}
            <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
          </p>
        </div>
      </section>
    </main>
  );
}
