/**
 * PageShell — wraps a page with its ambient background treatment and
 * a framer-motion entrance animation.
 *
 * Usage:
 *   import PageShell from '../components/layout/PageShell';
 *   <PageShell ambient="khata" title="Mera Hisab"> …page content… </PageShell>
 *
 * The ambient prop selects one of the per-page background utilities
 * defined in index.css (.page-ambient-*). Each is a very subtle,
 * CSS-only treatment that gives the page a distinct character.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../motion/motionPresets';

const AMBIENT_CLASS = {
  khata: 'page-ambient-khata',
  crops: 'page-ambient-crops',
  weather: 'page-ambient-weather',
  mandi: 'page-ambient-mandi',
  chaupal: 'page-ambient-chaupal',
};

const PageShell = ({ ambient = 'khata', className = '', children }) => {
  const ambientClass = AMBIENT_CLASS[ambient] || '';

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={`min-h-[calc(100vh-4rem)] ${ambientClass} ${className}`}
      style={{ backgroundColor: 'var(--color-soil)' }}
    >
      {children}
    </motion.div>
  );
};

export default PageShell;
