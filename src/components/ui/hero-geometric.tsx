"use client";

/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-namespace */
declare module "react" {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends ThreeElements {}
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// --- Shader Code (Componentry HeroGeometric) ---
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float bayerDither4x4(vec2 uv) {
    int x = int(mod(uv.x, 4.0));
    int y = int(mod(uv.y, 4.0));

    int matrix[16];
    matrix[0] = 0; matrix[1] = 8; matrix[2] = 2; matrix[3] = 10;
    matrix[4] = 12; matrix[5] = 4; matrix[6] = 14; matrix[7] = 6;
    matrix[8] = 3; matrix[9] = 11; matrix[10] = 1; matrix[11] = 9;
    matrix[12] = 15; matrix[13] = 7; matrix[14] = 13; matrix[15] = 5;

    return float(matrix[y * 4 + x]) / 16.0;
}

void main() {
    vec2 uv = vUv;
    vec2 coord = gl_FragCoord.xy;

    // Enhanced noise with time
    float noise = snoise(uv * 1.5 + vec2(uTime * 0.05, uTime * 0.03)) * 0.25;

    // Diagonal gradient from bottom-left to top-right
    float diagonal = (uv.x + uv.y) * 0.5;

    // Combine for gradient - emphasize corners
    float gradient = diagonal * 1.2 + noise;

    // Interpolate colors based on gradient
    vec3 primaryColor = uColor1;
    vec3 secondaryColor = uColor2;
    vec3 softMix = mix(primaryColor, secondaryColor, 0.33);
    vec3 lightMix = mix(primaryColor, secondaryColor, 0.66);

    // Map to colors with distinct editorial steps
    vec3 color;
    if (gradient < 0.3) {
        color = primaryColor;
    } else if (gradient < 0.55) {
        color = softMix;
    } else if (gradient < 0.8) {
        color = lightMix;
    } else {
        color = secondaryColor;
    }

    // Enhanced dithering at boundaries
    float dither = bayerDither4x4(coord);
    float threshold = fract(gradient * 4.0);

    if (gradient < 0.3 && threshold > dither * 0.5) {
        color = softMix;
    } else if (gradient >= 0.3 && gradient < 0.55 && threshold > dither * 0.5) {
        color = lightMix;
    } else if (gradient >= 0.55 && gradient < 0.8 && threshold > dither * 0.5) {
        color = secondaryColor;
    }

    // Softer fade to white - only at extreme bottom-left
    vec2 cornerDist = vec2(uv.x, uv.y);
    float fadeMask = smoothstep(0.0, 0.25, length(cornerDist));
    color = mix(vec3(1.0), color, fadeMask);

    // Subtle vignette to emphasize corners
    float vignette = smoothstep(1.2, 0.3, length(uv - 0.5));
    color = mix(color, color * 0.95, (1.0 - vignette) * 0.3);

    gl_FragColor = vec4(color, 1.0);
}
`;

const HERO_GEOMETRIC_FALLBACK_COLOR_1 = "#3B82F6";
const HERO_GEOMETRIC_FALLBACK_COLOR_2 = "#F0F9FF";
const HEX_COLOR_REGEX = /^#?[0-9a-fA-F]{6}$/;

function sanitizeHexColor(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!HEX_COLOR_REGEX.test(trimmed)) return fallback;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

const GradientPlane = ({
  color1,
  color2,
  speed = 1,
  reducedMotion = false,
}: {
  color1: string;
  color2: string;
  speed?: number;
  reducedMotion?: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const elapsedRef = useRef(0);
  const { viewport } = useThree();

  const numericSpeed = Number.isFinite(Number(speed)) ? Number(speed) : 1;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1000, 1000) },
      uColor1: {
        value: new THREE.Color(
          sanitizeHexColor(color1, HERO_GEOMETRIC_FALLBACK_COLOR_1)
        ),
      },
      uColor2: {
        value: new THREE.Color(
          sanitizeHexColor(color2, HERO_GEOMETRIC_FALLBACK_COLOR_2)
        ),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;

    if (!reducedMotion) {
      // Clamp delta to prevent large jumps when returning to a backgrounded mobile tab
      elapsedRef.current += Math.min(delta, 0.1) * numericSpeed;
    }

    const safeC1 = sanitizeHexColor(color1, HERO_GEOMETRIC_FALLBACK_COLOR_1);
    const safeC2 = sanitizeHexColor(color2, HERO_GEOMETRIC_FALLBACK_COLOR_2);

    // Update both the live THREE.ShaderMaterial uniforms (which R3F v9 shallow-clones
    // in applyProps) and the memoized object so HMR/reconcile never resets uTime.
    uniforms.uTime.value = elapsedRef.current;
    material.uniforms.uTime.value = elapsedRef.current;
    material.uniforms.uResolution.value.set(state.size.width, state.size.height);
    material.uniforms.uColor1.value.set(safeC1);
    material.uniforms.uColor2.value.set(safeC2);
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

// --- Main Component ---
export interface HeroGeometricProps extends React.ComponentPropsWithoutRef<"section"> {
  color1?: string;
  color2?: string;
  speed?: number;
}

export function HeroGeometric({
  color1 = "#3B82F6",
  color2 = "#F0F9FF",
  speed = 1,
  className,
  style,
  children,
  ...props
}: HeroGeometricProps) {
  const reducedMotion = usePrefersReducedMotion();
  const safeColor1 = sanitizeHexColor(color1, HERO_GEOMETRIC_FALLBACK_COLOR_1);
  const safeColor2 = sanitizeHexColor(color2, HERO_GEOMETRIC_FALLBACK_COLOR_2);

  return (
    <section
      className={cn(
        "relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden overflow-x-hidden",
        className
      )}
      style={{
        background: `linear-gradient(45deg, ${safeColor1} 0%, ${safeColor2} 100%)`,
        ...style,
      }}
      {...props}
    >
      {/* WebGL Background Shader */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      >
        <Canvas
          frameloop="always"
          camera={{ position: [0, 0, 1] }}
          dpr={[1, 1]}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <GradientPlane
            color1={safeColor1}
            color2={safeColor2}
            speed={speed}
            reducedMotion={reducedMotion}
          />
        </Canvas>
      </div>

      {/* Foreground Content */}
      {children ? (
        <div className="relative z-10 h-full w-full">{children}</div>
      ) : null}
    </section>
  );
}

export default HeroGeometric;
