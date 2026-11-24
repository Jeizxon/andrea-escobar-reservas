"use client";

import { useEffect, useState } from "react";
import { Heatmap } from "@paper-design/shaders-react";
import { cn } from "@/lib/utils";

const ICE = [
  "#050b1a",
  "#0f2550",
  "#1f4fa8",
  "#4f8ef0",
  "#9cc8ff",
  "#e2f0ff",
  "#ffffff",
];

/**
 * Elliptical radial feathering dissolves the halo and subtle shader grain
 * organically into light backgrounds without any visible rectangular edge.
 */
const RADIAL_FADE =
  "radial-gradient(ellipse 50% 42% at 50% 50%, black 72%, rgba(0,0,0,0.5) 86%, transparent 100%)";
const EDGE_FADE = {
  maskImage: RADIAL_FADE,
  WebkitMaskImage: RADIAL_FADE,
} as const;

export interface HeatmapLogoProps {
  /** Logo image URL or data URI. Only its silhouette is used, so any solid mark works. */
  image: string;
  /** Heat ramp from coolest to hottest, as hex colors. */
  colors?: string[];
  /** Fill behind the logo. Transparent by default, so the glow blends into any surface. */
  background?: string;
  /** Strength of the halo around the logo, 0 to 1. */
  glow?: number;
  className?: string;
}

/** A logo that glows like hot metal, with heat drifting slowly through it. */
export function HeatmapLogo({
  image,
  colors = ICE,
  background = "#00000000",
  glow = 0,
  className,
}: HeatmapLogoProps) {
  const reduceMotion = usePrefersReducedMotion();
  const resolvedBackground =
    background.trim().toLowerCase() === "transparent" ? "#00000000" : background;

  return (
    <div
      aria-hidden="true"
      className={cn("relative aspect-square w-80", className)}
      style={EDGE_FADE}
    >
      <Heatmap
        image={image}
        colors={colors}
        colorBack={resolvedBackground}
        contour={0.45}
        innerGlow={0.55}
        outerGlow={glow}
        noise={0.15}
        angle={0}
        scale={0.62}
        speed={reduceMotion ? 0 : 0.6}
        className="absolute inset-0"
      />
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduceMotion;
}
