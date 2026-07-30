"use client";

import { motion, MotionConfig } from "framer-motion";

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
 * Menggunakan MotionConfig reducedMotion="never" agar animasi selalu berjalan 100%
 * di semua device & browser tanpa memedulikan preferensi OS.
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
  const initial = {
    opacity: 0,
    [direction]: distance,
    ...(scale !== undefined ? { scale } : {}),
  };

  const target = {
    opacity: 1,
    [direction]: 0,
    ...(scale !== undefined ? { scale: 1 } : {}),
  };

  const transitionProps = {
    duration,
    ease: [0.21, 0.47, 0.32, 0.98] as const, // smooth spring-like cubic bezier
    delay,
  };

  return (
    <MotionConfig reducedMotion="never">
      {mode === "load" ? (
        <motion.div
          initial={initial}
          animate={target}
          transition={transitionProps}
          className={className}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          initial={initial}
          whileInView={target}
          viewport={{ once: true, amount: 0.15 }}
          transition={transitionProps}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </MotionConfig>
  );
}
