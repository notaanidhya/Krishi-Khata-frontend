/**
 * AnimatedRoutes — wraps the <Routes> in framer-motion's AnimatePresence
 * so that route changes cross-fade / slide smoothly instead of snapping.
 *
 * Uses the `location` key to trigger exit/enter transitions. Each page
 * is expected to render inside a <PageShell> (which provides its own
 * entrance variant); this wrapper handles the exit animation.
 */

import React from 'react';
import { Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

const AnimatedRoutes = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {children}
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
