/**
 * TopBar — Krishi redesign.
 * Deep matte forest green (emerald-900/950) with warm cream brand text.
 * Organic serif accent for "Krishi Khata" brand name.
 *
 * Now includes an "Add Farm" button in the farm selector dropdown.
 */

import React from 'react';
import { Sprout, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TopBar = () => {
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language || 'en';
  const isHindi = currentLanguage.startsWith('hi');

  return (
    <header
      id="topbar"
      className="sticky top-0 z-50 shadow-lg"
      style={{
        background: 'linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-mid) 60%, var(--color-forest-muted) 100%)',
        boxShadow: '0 4px 20px rgba(5,46,22,0.35)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* ── Brand ──────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,253,249,0.12)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,253,249,0.15)' }}
          >
            <Sprout size={20} className="text-amber-300" />
          </div>
          <div>
            <h1
              className="text-2xl leading-none tracking-tight font-serif-accent"
              style={{ color: 'var(--color-cream)', fontWeight: 900 }}
            >
              {isHindi ? 'कृषि खाता' : 'Krishi Khata'}
            </h1>
          </div>
        </div>

        {/* ── Premium Segmented Language Selector ────────── */}
        <div className="flex items-center gap-2">
          <Languages size={15} className="text-amber-200 opacity-80" />
          
          <div 
            className="relative flex items-center p-0.5 rounded-full overflow-hidden border"
            style={{
              background: 'rgba(5, 46, 22, 0.45)',
              borderColor: 'rgba(255, 253, 249, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Active indicator sliding background pill */}
            <div 
              className="absolute top-0.5 bottom-0.5 rounded-full transition-all duration-300 ease-out"
              style={{
                left: isHindi ? 'calc(50% + 1px)' : '2px',
                width: 'calc(50% - 3px)',
                background: 'linear-gradient(135deg, #fef08a 0%, #fcd34d 100%)', // warm amber-200 to amber-300
                boxShadow: '0 2px 6px rgba(252, 211, 77, 0.25)',
              }}
            />

            {/* English Option */}
            <button
              onClick={() => i18n.changeLanguage('en')}
              title="English"
              aria-label="Switch language to English"
              className="relative z-10 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
              style={{
                color: isHindi ? 'rgba(255, 253, 249, 0.7)' : 'var(--color-forest)',
              }}
            >
              EN
            </button>

            {/* Hindi Option */}
            <button
              onClick={() => i18n.changeLanguage('hi')}
              title="हिंदी"
              aria-label="Switch language to Hindi"
              className="relative z-10 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
              style={{
                color: isHindi ? 'var(--color-forest)' : 'rgba(255, 253, 249, 0.7)',
              }}
            >
              हिंदी
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopBar;
