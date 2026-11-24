"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { AndreaAnimatedLogo } from "@/components/AndreaAnimatedLogo";
import { HeroGeometric } from "@/components/ui/hero-geometric";

const EASE_EDITORIAL = [0.23, 1, 0.32, 1] as const;

export function HeroPortada() {
  const prefersReducedMotion = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, transform: "translateY(12px)" },
    animate: prefersReducedMotion
      ? { opacity: 1 }
      : { opacity: 1, transform: "translateY(0px)" },
    transition: {
      duration: prefersReducedMotion ? 0.2 : 0.65,
      delay: prefersReducedMotion ? 0 : delay,
      ease: EASE_EDITORIAL,
    },
  });

  return (
    <main className="h-[100dvh] min-h-[100dvh] w-full overflow-hidden overflow-x-hidden">
      <HeroGeometric
        color1="#faa7dc"
        color2="#ffffff"
        speed={3}
        aria-label="Portada de reservas Andrea Escobar"
      >
        <div
          className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-between px-5 sm:px-8"
          style={{
            paddingTop: "max(1.25rem, env(safe-area-inset-top, 0px))",
            paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          {/* Editorial top eyebrow */}
          <motion.header
            {...fadeUp(0.04)}
            className="flex items-center gap-3 pt-1 sm:pt-2"
          >
            <span
              aria-hidden="true"
              className="h-px w-6 bg-[#5E323D]/35 sm:w-9"
            />
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#4E2631] sm:text-[11px]">
              Estudio de Belleza
            </span>
            <span
              aria-hidden="true"
              className="h-px w-6 bg-[#5E323D]/35 sm:w-9"
            />
          </motion.header>

          {/* Hero centerpiece */}
          <div className="flex w-full max-w-[38rem] flex-col items-center text-center">
            {/* Animated Brand Logo */}
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, transform: "scale(0.95)" }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, transform: "scale(1)" }
              }
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.75,
                delay: prefersReducedMotion ? 0 : 0.08,
                ease: EASE_EDITORIAL,
              }}
              className="relative -mt-6 -mb-11 flex items-center justify-center sm:-mt-8 sm:-mb-14 lg:-mt-9 lg:-mb-16"
            >
              <AndreaAnimatedLogo className="w-[min(86vw,40dvh,340px)] sm:w-[min(58vw,42dvh,400px)] lg:w-[min(44vw,46dvh,450px)]" />
            </motion.div>

            {/* Editorial Headline */}
            <motion.h1
              {...fadeUp(0.16)}
              className="text-balance font-serif text-[clamp(2.1rem,8.4vw,2.85rem)] font-medium leading-[1.03] tracking-[-0.02em] text-[#2A151B] sm:text-[clamp(2.85rem,5.2vw,3.9rem)] lg:text-[clamp(3.3rem,4.4vw,4.35rem)]"
            >
              Tu momento de{" "}
              <span className="block font-normal italic text-[#6B2D3D]">
                belleza y cuidado
              </span>
            </motion.h1>

            {/* Editorial Subtitle */}
            <motion.p
              {...fadeUp(0.22)}
              className="mt-3 max-w-[32ch] text-balance text-[0.9375rem] leading-[1.58] text-[#4A2630] sm:mt-4 sm:max-w-[44ch] sm:text-[1.0625rem]"
            >
              Agenda tu próxima cita en segundos y disfruta una experiencia
              pensada para realzar tu esencia.
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              {...fadeUp(0.28)}
              className="mt-6 flex w-full justify-center sm:mt-8"
            >
              <button
                type="button"
                aria-label="Reservar cita en Andrea Escobar"
                className="cta-editorial inline-flex min-h-[52px] w-full max-w-[280px] cursor-pointer items-center justify-center gap-2.5 rounded-full border border-[#5E323D]/25 bg-[#2A151B] px-8 text-[0.9375rem] font-medium tracking-[0.02em] text-[#FFF9FB] shadow-[0_14px_34px_-12px_rgba(58,18,32,0.45)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#2A151B] sm:min-h-[56px] sm:w-auto sm:min-w-[232px] sm:px-10 sm:text-base"
              >
                <span>Reservar cita</span>
                <ArrowRight
                  aria-hidden="true"
                  className="cta-arrow h-4 w-4 shrink-0"
                  strokeWidth={1.9}
                />
              </button>
            </motion.div>
          </div>

          {/* Subtle bottom balance caption (not a footer) */}
          <motion.p
            {...fadeUp(0.34)}
            className="pb-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#562C37]/80 sm:pb-2 sm:text-[11px]"
          >
            Reserva online · Atención personalizada
          </motion.p>
        </div>
      </HeroGeometric>
    </main>
  );
}

export default HeroPortada;
