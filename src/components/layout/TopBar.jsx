/**
 * TopBar — Krishi redesign.
 * Deep matte forest green (emerald-900/950) with warm cream brand text.
 * Organic serif accent for "Krishi Khata" brand name.
 *
 * Now includes an "Add Farm" button in the farm selector dropdown.
 */

import React from 'react';
import { Sprout, MapPin } from 'lucide-react';
import { useActiveFarm } from '../../context/ActiveFarmContext';

const TopBar = () => {
  const { activeFarm } = useActiveFarm();

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

      </div>
    </header>
  );
};

export default TopBar;
