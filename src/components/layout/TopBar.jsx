/**
 * TopBar — Krishi redesign.
 * Deep matte forest green (emerald-900/950) with warm cream brand text.
 * Organic serif accent for "Krishi Khata" brand name.
 */

import React, { useState } from 'react';
import { Sprout, ChevronDown, MapPin } from 'lucide-react';
import { useActiveFarm } from '../../context/ActiveFarmContext';

const TopBar = () => {
  const { activeFarm, farms, changeActiveFarm } = useActiveFarm();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                <span className="text-[10px] font-medium">{activeFarm.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Farm Selector ──────────────────────────── */}
        <div className="relative">
          <button
            id="farm-selector-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 min-w-[120px] transition-all active:scale-95"
            style={{
              background: 'rgba(255,253,249,0.10)',
              border: '1px solid rgba(255,253,249,0.15)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div className="flex-1 text-left">
              <span className="text-[9px] uppercase font-bold tracking-wider block leading-none mb-0.5" style={{ color: 'rgba(253,230,138,0.65)' }}>
                Farm
              </span>
              <span className="text-sm font-semibold truncate block max-w-[100px]" style={{ color: '#fffdf9' }}>
                {activeFarm?.name || 'Select Farm'}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              style={{ color: 'rgba(253,230,138,0.75)' }}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div
                id="farm-dropdown-menu"
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up"
                style={{
                  background: 'var(--color-cream)',
                  border: '1px solid #e5e0d8',
                  boxShadow: '0 20px 60px rgba(5,46,22,0.18)',
                }}
              >
                <div className="p-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider px-2 py-1 block">
                    Your Farms
                  </span>
                  {farms.length === 0 && (
                    <p className="text-sm text-stone-400 px-2 py-3">No farms added</p>
                  )}
                  {farms.map((farm) => (
                    <button
                      key={farm.id}
                      onClick={() => { changeActiveFarm(farm); setIsDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 ${
                        activeFarm?.id === farm.id
                          ? 'bg-emerald-50 text-emerald-900 font-semibold'
                          : 'text-stone-700 hover:bg-stone-50 active:bg-stone-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        activeFarm?.id === farm.id
                          ? 'bg-emerald-800 text-white'
                          : 'bg-stone-100 text-stone-500'
                      }`}>
                        {farm.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{farm.name}</p>
                        <p className="text-[11px] text-stone-400 flex items-center gap-1">
                          <MapPin size={9} /> {farm.location}
                        </p>
                      </div>
                      {activeFarm?.id === farm.id && (
                        <div className="w-2 h-2 bg-emerald-600 rounded-full ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
