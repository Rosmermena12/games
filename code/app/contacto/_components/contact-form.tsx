"use client";

import { useState } from "react";
import { SITE_CONFIG } from "@/app/_utils/site.config";

const SUBJECTS = [
  "Fallo en un juego",
  "Problema con el multijugador",
  "Sugerencia o idea",
  "Publicidad y colaboraciones",
  "Protección de datos",
  "Otro",
];

/**
 * El formulario compone un correo y lo abre en el cliente de la persona
 * usuaria. No enviamos el mensaje a ningún servidor intermedio, así que no hay
 * datos personales que custodiar.
 */
export function ContactForm() {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");

  const href =
    `mailto:${SITE_CONFIG.email}` +
    `?subject=${encodeURIComponent(`[${SITE_CONFIG.name}] ${subject}`)}` +
    `&body=${encodeURIComponent(message)}`;

  return (
    <form
      className="flex flex-col gap-4 rounded-card border border-border-subtle bg-surface p-5"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-fg">Motivo</span>
        <select
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-fg outline-none focus:border-fg-faint"
        >
          {SUBJECTS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-fg">Mensaje</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={6}
          placeholder="Cuéntanos qué ha pasado, en qué juego y con qué navegador."
          className="resize-y rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-fg-faint"
        />
      </label>

      <a
        href={href}
        aria-disabled={message.trim().length === 0}
        className={`self-start rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition ${
          message.trim().length === 0 ? "pointer-events-none opacity-50" : "hover:opacity-90"
        }`}
      >
        Abrir en mi correo
      </a>

      <p className="text-xs leading-relaxed text-fg-faint">
        Al pulsar el botón se abre tu programa de correo con el mensaje ya escrito. Nada se envía a
        través de este sitio, de modo que no almacenamos ni tu dirección ni el contenido.
      </p>
    </form>
  );
}
