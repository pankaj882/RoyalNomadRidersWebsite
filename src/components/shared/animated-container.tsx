"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Distance (px) to translate on entry. Kept small to stay lightweight per the performance-first brief. */
  offset?: number;
  as?: "div" | "section" | "article" | "li";
}

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

/**
 * Fades + lifts content into view once, when it enters the viewport.
 * `viewport={{ once: true }}` ensures the animation never re-triggers on
 * scroll-back, keeping repeated scroll interactions cheap.
 */
export function AnimatedContainer({
  children,
  className,
  delay = 0,
  as = "div",
}: AnimatedContainerProps) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      custom={delay}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
