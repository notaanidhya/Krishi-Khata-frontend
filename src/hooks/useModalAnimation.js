
import { useState, useEffect, useCallback } from 'react';

const useModalAnimation = (isOpen, durationMs = 340) => {
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {

      setMounted(true);

      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    } else if (mounted) {
      setAnimating(false);

      const timer = setTimeout(() => {
        setMounted(false);
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, durationMs]);

  return { mounted, animating };
};

export default useModalAnimation;
