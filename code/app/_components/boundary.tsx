"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface SafeAreaProps {
  children: ReactNode;
  /** Qué pintar si la rama falla. Por defecto, nada. */
  fallback?: ReactNode;
}

interface SafeAreaState {
  failed: boolean;
}

/**
 * Aísla una rama opcional del árbol. Existe por un caso muy concreto: los
 * bloqueadores de contenido cancelan la descarga de algunos chunks del cliente
 * (`ERR_BLOCKED_BY_CLIENT`), y un import dinámico fallido propaga el error
 * hasta la raíz y deja la página en blanco. Con esta barrera, lo que se pierde
 * es sólo el bloque bloqueado; el juego y el contenido siguen funcionando.
 */
export class SafeArea extends Component<SafeAreaProps, SafeAreaState> {
  state: SafeAreaState = { failed: false };

  static getDerivedStateFromError(): SafeAreaState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Sin telemetría: sólo deja rastro en consola para poder diagnosticarlo.
    console.warn("Bloque opcional no disponible:", error.message, info.componentStack);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
