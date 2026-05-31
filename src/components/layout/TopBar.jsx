/**
 * TopBar — Krishi redesign.
 * Deep matte forest green (emerald-900/950) with warm cream brand text.
 * Organic serif accent for "Krishi Khata" brand name.
 *
 * Now includes an "Add Farm" button in the farm selector dropdown.
 */

import React from 'react';
import { Sprout, MapPin, Languages } from 'lucide-react';
import { useActiveFarm } from '../../context/ActiveFarmContext';
import { useTranslation } from 'react-i18next';

const TopBar = () => {
  const { activeFarm } = useActiveFarm();
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language || 'en';
  const isHindi = currentLanguage.startsWith('hi');

  return (
    <header
      id="topbar"
      className="sticky top-0 z-50 shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #052e16 0%, #14532d 60%, #166534 100%)',
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
              className="text-lg leading-none tracking-tight font-serif-accent"
              style={{ color: '#fffdf9', fontWeight: 900 }}
            >
              Krishi Khata
            </h1>
            {activeFarm && (
              <div className="flex items-center gap-1 mt-0.5" style={{ color: 'rgba(253,230,138,0.75)' }}>
                <MapPin size={10} />
                <span className="text-[10px] font-medium">
                  {activeFarm?.district === "N/A"
                    ? "My Farm"
                    : `${activeFarm?.district || ""}, ${activeFarm?.state || ""}`}
                </span>
              </div>
            )}
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
              className="relative z-10 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider transition-colors duration-300 focus:outline-none cursor-pointer"
              style={{
                color: isHindi ? 'rgba(255, 253, 249, 0.7)' : '#052e16',
              }}
            >
              EN
            </button>

            {/* Hindi Option */}
            <button
              onClick={() => i18n.changeLanguage('hi')}
              title="हिंदी"
              className="relative z-10 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider transition-colors duration-300 focus:outline-none cursor-pointer"
              style={{
                color: isHindi ? '#052e16' : 'rgba(255, 253, 249, 0.7)',
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
