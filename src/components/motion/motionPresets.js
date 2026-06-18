/**
 * motionPresets.js — shared framer-motion variants for Krishi Khata.
 * Spring-based, subtle, and consistent across the app.
 *
 * Import examples:
 *   import { fadeUp, staggerContainer, pressable } from '../components/motion/motionPresets';
 *   <motion.div variants={staggerContainer} initial="hidden" animate="show">
 *     <motion.div variants={fadeUp}>…</motion.div>
 *   </motion.div>
 *   <motion.button whileTap={pressable.whileTap}>…</motion.button>
 */

import { createContext } from 'react';

/* ── Easing & spring presets ─────────────────────────────── */
export const EASE_OUT = [0.25, 0.46, 0.45, 0.94];
export const EASE_SPRING = [0.34, 1.56, 0.64, 1];

/* Gentle spring used for sheets, pills, and UI feedback. */
export const spring = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
  mass: 0.8,
};

/* Slightly snappier spring for small interactive elements. */
export const springSnappy = {
  type: 'spring',
  stiffness: 420,
  damping: 28,
  mass: 0.6,
};

/* ── Container that staggers its children ────────────────── */
export const staggerContainer = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/* ── Fade + rise (default card/section entrance) ─────────── */
export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

/* ── Fade + slight scale (hero/header entrance) ──────────── */
export const fadeScale = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

/* ── Pure fade (for overlays, images, swapping content) ──── */
export const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: EASE_OUT } },
};

/* ── Slide-in from the right (detail panes, list rows) ───── */
export const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE_OUT } },
};

/* ── Page route transition (used by AnimatedRoutes) ──────── */
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE_OUT } },
};

/* ── Modal / bottom-sheet panels ─────────────────────────── */
export const sheetVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { ...spring, opacity: { duration: 0.22 } } },
  exit: { y: '100%', opacity: 0, transition: { duration: 0.28, ease: EASE_OUT } },
};

export const centerDialogVariants = {
  hidden: { y: 24, scale: 0.95, opacity: 0 },
  visible: { y: 0, scale: 1, opacity: 1, transition: { ...spring } },
  exit: { y: 16, scale: 0.96, opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } },
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28 } },
  exit: { opacity: 0, transition: { duration: 0.22 } },
};

/* ── Interactive element helpers ─────────────────────────── */
export const pressable = {
  whileTap: { scale: 0.96 },
  whileHover: { scale: 1.02 },
  transition: springSnappy,
};

/* Tap-only (no hover) for buttons that shouldn't grow on hover. */
export const tapOnly = {
  whileTap: { scale: 0.96 },
  transition: springSnappy,
};

/* ── Reduced-motion context ────────────────────────────────
   Components can read this to disable transform-based motion
   for users who prefer reduced motion (also handled globally
   via CSS, but framer-motion bypasses CSS transitions).
*/
export const MotionPreferences = createContext({ reduce: false });
