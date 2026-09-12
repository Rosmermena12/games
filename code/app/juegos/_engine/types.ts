import type { NetMessage, NetRole } from "../_net/peer-net";

export type Difficulty = "facil" | "normal" | "dificil";

/** Mandos que la escena expone a React para los botones de la interfaz. */
export interface GameControls {
  restart: () => void;
  setPaused: (paused: boolean) => void;
  /** Acciones puntuales para los controles táctiles (mover, girar, soltar). */
  action?: (name: "left" | "right" | "rotate" | "rotateBack" | "soft" | "drop") => void;
}

export interface GameOverResult {
  /** Desde el punto de vista del jugador local. */
  outcome: "win" | "lose";
  label: string;
}

/**
 * Puente entre la escena de Phaser y React. La escena nunca toca el DOM de la
 * página: emite eventos por aquí y React se encarga de pintar marcador,
 * intersticiales y avisos de conexión.
 */
export interface GameBridge {
  role: NetRole;
  difficulty: Difficulty;
  send: (message: NetMessage) => void;
  subscribe: (listener: (message: NetMessage) => void) => () => void;
  onScore: (local: number, rival: number) => void;
  onStatus: (text: string) => void;
  onGameOver: (result: GameOverResult) => void;
  registerControls: (controls: GameControls) => void;
}
