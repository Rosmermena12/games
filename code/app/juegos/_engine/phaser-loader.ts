"use client";

import { loadScript } from "@/app/_utils/load-script";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Phaser 3 desde CDN: no entra en el bundle y no se evalúa en el servidor. */
const PHASER_SRC = "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js";

export async function loadPhaser(): Promise<any> {
  await loadScript(PHASER_SRC);
  const phaser = (window as unknown as { Phaser?: any }).Phaser;
  if (!phaser) throw new Error("Phaser no está disponible");
  return phaser;
}
