"use client";

import { useEffect, useState } from "react";

import { MoonIcon, SunIcon } from "./icons";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // El tema real lo fija el script de arranque antes del primer paint; aquí
  // sólo lo leemos para sincronizar el estado del botón tras la hidratación.
  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";

    document.documentElement.classList.toggle("dark", next === "dark");

    try {
      localStorage.setItem("theme", next);
    } catch {
      // Modo privado o almacenamiento bloqueado: el tema aplica igual en sesión.
    }

    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Activar tema claro" : "Activar tema oscuro"}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border-subtle bg-surface text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
    >
      {/* Antes de hidratar no sabemos el tema: reservamos el hueco sin icono. */}
      {theme === null ? <span className="size-[18px]" /> : isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
