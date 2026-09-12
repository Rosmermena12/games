"use client";

import { SLOTS_CONFIG } from "@/app/_utils/slots.config";
import { SlotFrame } from "./slot-frame";

interface SideRailProps {
  side: "left" | "right";
}

/**
 * Rascacielos lateral fijo. Se mantiene pegado al viewport mientras se juega y
 * desaparece por debajo de 1280px, donde no hay hueco sin tapar el tablero.
 */
export function SideRail({ side }: SideRailProps) {
  return (
    <div className="hidden xl:block">
      <div className="sticky top-24">
        <SlotFrame
          slot={side === "left" ? SLOTS_CONFIG.slots.railLeft : SLOTS_CONFIG.slots.railRight}
          format="vertical"
          minHeight={600}
        />
      </div>
    </div>
  );
}
