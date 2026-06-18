/**
 * TopBar — Refined Earth redesign.
 * Soft botanical-green gradient with the custom Krishi logo mark,
 * warm-cream serif brand name, and a premium segmented language
 * toggle (olive surface with a dusty-gold active pill).
 */

import React from 'react';
import { Languages } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeScale } from '../motion/motionPresets';
import { useActiveFarm } from '../../context/ActiveFarmContext';

const TopBar = () => {
  const { t, i18n } = useTranslation();
  const { activeFarm } = useActiveFarm();

  const currentLanguage = i18n.language || 'en';
  const isHindi = currentLanguage.startsWith('hi');

  return (
    <header
      id="topbar"
      className="sticky top-0 z-50"
      style={{
        background: 'linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-mid) 65%, var(--color-forest-muted) 100%)',
        boxShadow: '0 4px 24px -8px rgba(61, 90, 58, 0.4)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* ── Brand ──────────────────────────────────── */}
        <motion.div
          variants={fadeScale}
          initial="hidden"
          animate="show"
          className="flex items-center gap-3"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.16)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <img src="/brand/logo-mark.svg" alt="" className="w-7 h-7" />
          </div>
          <div>
            <h1
              className="text-2xl leading-none tracking-tight font-serif-accent"
              style={{ color: 'var(--color-cream)', fontWeight: 900 }}
            >
              {isHindi ? 'कृषि खाता' : 'Krishi Khata'}
            </h1>
            {activeFarm && (
              <div className="flex items-center gap-1 mt-0.5 opacity-80">
                <span className="text-[11px]">📍</span>
                <span className="text-[10px] font-bold tracking-wide uppercase" style={{ color: 'var(--color-cream)' }}>
                  {activeFarm.name}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Premium Segmented Language Selector ────────── */}
        <motion.div
          variants={fadeScale}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.08 }}
          className="flex items-center gap-2"
        >
          <Languages size={15} style={{ color: 'var(--color-harvest)' }} className="opacity-80" />

          <div
            className="relative flex items-center p-0.5 rounded-full overflow-hidden border"
            style={{
              background: 'rgba(0, 0, 0, 0.22)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Active indicator sliding background pill */}
            <motion.div
              className="absolute top-0.5 bottom-0.5 rounded-full"
              style={{
                left: isHindi ? 'calc(50% + 1px)' : '2px',
                width: 'calc(50% - 3px)',
                background: 'linear-gradient(135deg, #e7cf8f 0%, var(--color-harvest) 100%)',
                boxShadow: '0 2px 8px rgba(201, 162, 75, 0.4)',
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            />

            {/* English Option */}
            <button
              onClick={() => i18n.changeLanguage('en')}
              title="English"
              aria-label="Switch language to English"
              className="relative z-10 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
              style={{ color: isHindi ? 'rgba(255, 255, 255, 0.7)' : 'var(--color-forest)' }}
            >
              EN
            </button>

            {/* Hindi Option */}
            <button
              onClick={() => i18n.changeLanguage('hi')}
              title="हिंदी"
              aria-label="Switch language to Hindi"
              className="relative z-10 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
              style={{ color: isHindi ? 'var(--color-forest)' : 'rgba(255, 255, 255, 0.7)' }}
            >
              हिंदी
            </button>
          </div>
        </motion.div>

      </div>
    </header>
  );
};

export default TopBar;
