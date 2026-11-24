"use client";

import { HeatmapLogo } from "@/components/ui/heatmap-logo";
import { cn } from "@/lib/utils";

const ANDREA_PEACH_COLORS = [
  "#7a443b",
  "#c97f72",
  "#f3b1a0",
  "#fbd2c6",
  "#fff1ec",
  "#ffffff",
];

export interface AndreaAnimatedLogoProps {
  className?: string;
  /** Rampa de colores hex del más oscuro al más brillante. */
  colors?: string[];
  /** Fondo detrás del logo. Por defecto "transparent" (mapeado a #00000000 para @paper-design/shaders). */
  background?: string;
}

/**
 * Logo animado reutilizable de Andrea Escobar con efecto de mapa de calor / metal caliente.
 * Fondo transparente por defecto para montarlo sobre cualquier sección.
 */
export function AndreaAnimatedLogo({
  className = "w-80 md:w-[420px]",
  colors = ANDREA_PEACH_COLORS,
  background = "transparent",
}: AndreaAnimatedLogoProps) {
  // @paper-design/shaders solo acepta hex/rgb/hsl; "transparent" se traduce a #00000000
  const resolvedBackground =
    background.trim().toLowerCase() === "transparent" ? "#00000000" : background;

  return (
    <div
      role="img"
      aria-label="Andrea Escobar"
      className={cn("relative aspect-square", className)}
    >
      <HeatmapLogo
        image="/logo-andrea.png"
        colors={colors}
        glow={0.25}
        background={resolvedBackground}
        className="h-full w-full"
      />
    </div>
  );
}

export default AndreaAnimatedLogo;
