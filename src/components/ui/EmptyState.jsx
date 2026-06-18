/**
 * EmptyState — a consistent, gentle empty-state block with a custom
 * minimal SVG illustration, headline, subtext, and optional action.
 *
 * Usage:
 *   <EmptyState
 *     illustration="/illustrations/empty-khata.svg"
 *     title="Abhi koi hisab nahi"
 *     subtitle="Naya transaction add karke shuruaat karein"
 *     action={<button>…</button>}
 *   />
 */

import React from 'react';
import { motion } from 'framer-motion';
import { fadeScale } from '../motion/motionPresets';

const EmptyState = ({ illustration, title, subtitle, action, className = '' }) => {
  return (
    <motion.div
      variants={fadeScale}
      initial="hidden"
      animate="show"
      className={`flex flex-col items-center justify-center text-center px-8 py-12 ${className}`}
    >
      {illustration && (
        <img
          src={illustration}
          alt=""
          aria-hidden="true"
          className="w-44 h-36 object-contain mb-5 opacity-95"
        />
      )}
      {title && (
        <h3
          className="font-serif-accent text-lg font-bold mb-1.5"
          style={{ color: 'var(--color-ink)' }}
        >
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          {subtitle}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
