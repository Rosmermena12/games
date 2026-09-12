"use client";

import { ADS_CONFIG } from "@/app/_utils/ads.config";
import { AdSlot } from "./ad-slot";

interface AdRailProps {
  side: "left" | "right";
}

/**
 * Rascacielos lateral fijo. Se mantiene pegado al viewport mientras se juega y
 * desaparece por debajo de 1280px, donde no hay hueco sin tapar el tablero.
 */
export function AdRail({ side }: AdRailProps) {
  return (
    <div className="hidden xl:block">
      <div className="sticky top-24">
        <AdSlot
          slot={side === "left" ? ADS_CONFIG.slots.railLeft : ADS_CONFIG.slots.railRight}
          format="vertical"
          minHeight={600}
        />
      </div>
    </div>
  );
}
