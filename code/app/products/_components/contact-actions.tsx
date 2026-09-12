"use client";

import type { ProductContactDTO } from "@/app/_interfaces/product";
import { MailIcon, PhoneIcon, TelegramIcon, WhatsappIcon } from "@/app/_components/icons";

type ContactChannel = "email" | "phone" | "whatsapp" | "telegram";

const ALL_CHANNELS: ContactChannel[] = ["email", "phone", "whatsapp", "telegram"];

interface ContactActionsProps {
  contact: ProductContactDTO;
  /** `compact` muestra sólo iconos; `full` añade la etiqueta de texto. */
  variant?: "compact" | "full";
  /** Canales permitidos en este contexto. El listado sólo expone el correo. */
  channels?: ContactChannel[];
  /** Aviso cuando no hay ningún canal disponible; se omite en el listado. */
  emptyMessage?: string;
}

/**
 * Sólo se renderizan los canales que el producto publica y que el contexto
 * permite: correo si hay email, y llamada/WhatsApp/Telegram si hay teléfono.
 */
export function ContactActions({
  contact,
  variant = "compact",
  channels = ALL_CHANNELS,
  emptyMessage,
}: ContactActionsProps) {
  const actions = (
    [
      { channel: "email", href: contact.mailtoUrl, label: "Enviar correo", icon: <MailIcon /> },
      { channel: "phone", href: contact.telUrl, label: "Llamar", icon: <PhoneIcon /> },
      {
        channel: "whatsapp",
        href: contact.whatsappUrl,
        label: "WhatsApp",
        icon: <WhatsappIcon />,
        external: true,
      },
      {
        channel: "telegram",
        href: contact.telegramUrl,
        label: "Telegram",
        icon: <TelegramIcon />,
        external: true,
      },
    ] satisfies Array<{
      channel: ContactChannel;
      href: string | null;
      label: string;
      icon: React.ReactNode;
      external?: boolean;
    }>
  ).filter((action): action is typeof action & { href: string } =>
    Boolean(action.href) && channels.includes(action.channel),
  );

  if (actions.length === 0) {
    return emptyMessage ? <p className="text-xs text-fg-faint">{emptyMessage}</p> : null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <a
          key={action.label}
          href={action.href}
          {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          aria-label={action.label}
          title={action.label}
          className={`inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface text-fg-muted transition-colors hover:border-fg/25 hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg ${
            variant === "full" ? "px-3.5 py-2 text-sm" : "size-9 justify-center"
          }`}
        >
          {action.icon}
          {variant === "full" ? <span>{action.label}</span> : null}
        </a>
      ))}
    </div>
  );
}