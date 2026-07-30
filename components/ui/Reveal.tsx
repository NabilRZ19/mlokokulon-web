"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  /** Modes: "scroll" (animates when scrolled into view) or "load" (animates immediately on page load) */
  mode?: "scroll" | "load";
  /** Axis untuk animasi masuk — default "y" (slide up) */
  direction?: "y" | "x";
  /** Jarak geser awal (px) — default 20 */
  distance?: number;
  /** Skala awal (opsional) — contoh 0.95 */
  scale?: number;
  className?: string;
}

/**
 * Reveal — wrapper animasi framer-motion untuk efek Load & Scroll.
 *
 * Contoh Pemakaian:
 *
 * 1. Animasi saat Load Halaman (Hero / Header):
 *    <Reveal mode="load" duration={0.6}>
 *      <HeroContent />
 *    </Reveal>
 *
 * 2. Animasi saat Scroll (Section):
 *    <Reveal mode="scroll" delay={0.1}>
 *      <SectionContent />
 *    </Reveal>
 */
export function Reveal({
  children,
  delay = 0,
  duration = 0.5,
  mode = "scroll",
  direction = "y",
  distance = 20,
  scale,
  className,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  const initial = prefersReducedMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        [direction]: distance,
        ...(scale !== undefined ? { scale } : {}),
      };

  const target = prefersReducedMotion
    ? { opacity: 1 }
    : {
        opacity: 1,
        [direction]: 0,
        ...(scale !== undefined ? { scale: 1 } : {}),
      };

  const transitionProps = {
    duration: prefersReducedMotion ? 0.15 : duration,
    ease: [0.21, 0.47, 0.32, 0.98] as const, // smooth spring-like cubic bezier
    delay,
  };

  if (mode === "load") {
    return (
      <motion.div
        initial={initial}
        animate={target}
        transition={transitionProps}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial}
      whileInView={target}
      viewport={{ once: true, amount: 0.15 }}
      transition={transitionProps}
      className={className}
    >
      {children}
    </motion.div>
  );
}
