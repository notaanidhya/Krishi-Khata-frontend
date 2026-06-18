/**
 * useModalAnimation — Manages enter/exit animation states for modals.
 *
 * Instead of `if (!isOpen) return null` (which kills the DOM instantly),
 * this hook keeps the modal mounted during the exit animation, then
 * unmounts it after the animation completes.
 *
 * Usage:
 *   const { mounted, animating } = useModalAnimation(isOpen, 300);
 *   if (!mounted) return null;
 *   // Use `animating` to toggle CSS classes:
 *   //   animating === true  → "entering" (apply enter classes)
 *   //   animating === false → "exiting"  (apply exit classes)
 */

import { useState, useEffect, useCallback } from 'react';

const useModalAnimation = (isOpen, durationMs = 340) => {
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Mount immediately, then trigger enter animation on next frame
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      // Use rAF to ensure the DOM has painted the "closed" state first
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setAnimating(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    } else if (mounted) {
      // Trigger exit animation
      setAnimating(false);
      // Wait for animation to finish, then unmount
      const timer = setTimeout(() => {
        setMounted(false);
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, durationMs]); // eslint-disable-line react-hooks/exhaustive-deps

  return { mounted, animating };
};

export default useModalAnimation;
