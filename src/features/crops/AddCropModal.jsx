/**
 * AddCropModal — Krishi redesign.
 * - bg-stone-50 warm modal background
 * - Serif "Nayi Fasal Lagao" header
 * - Deep forest green inputs and submit button
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sprout, Search, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { useCropPresets, useCreateCrop } from '../../hooks/useCrop';
import useModalAnimation from '../../hooks/useModalAnimation';

const inputStyle = {
  background: '#fffdf9',
  borderColor: '#d6cfc6',
  color: 'var(--color-forest)',
};

const AddCropModal = ({ isOpen, onClose, farmId }) => {
  const { t } = useTranslation();
  const { mounted, animating } = useModalAnimation(isOpen, 380);
  const [cropName, setCropName] = useState('');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const { data: presets = [] } = useCropPresets();
  const createCropMutation = useCreateCrop();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) { setCropName(''); setPlantingDate(new Date().toISOString().split('T')[0]); setSearchFilter(''); setShowDropdown(false); }
  }, [isOpen]);

  const filteredPresets = presets.filter((p) =>
    p.toLowerCase().includes((searchFilter || cropName).toLowerCase())
  );

  const handleSelectPreset = (preset) => {
    setCropName(preset); setSearchFilter(''); setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cropName.trim()) return;
    createCropMutation.mutate(
      { farmId, cropData: { crop_name: cropName.trim(), planting_date: plantingDate } },
      { onSuccess: () => onClose() }
    );
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center modal-backdrop ${animating ? 'modal-open' : ''}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg rounded-t-3xl shadow-2xl p-6 pb-8 modal-sheet ${animating ? 'modal-open' : ''}`}
        style={{ background: 'var(--color-soil)', borderTop: '3px solid #14532d' }}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#166534,#14532d)', boxShadow: '0 4px 16px rgba(22,101,52,0.3)' }}
            >
              <Sprout size={20} className="text-white" />
            </div>
            <div>
              <h3
                className="text-lg font-bold font-serif-accent"
                style={{ color: 'var(--color-forest)' }}
              >
                {t('crops.plantNew')}
              </h3>
              <p className="text-[11px] text-stone-400 font-medium">{t('crops.newCycleSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-300 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Crop Name */}
          <div ref={dropdownRef} className="relative">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
              {t('crops.cropName')}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <Search size={16} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={cropName}
                onChange={(e) => { setCropName(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder={t('crops.searchPlaceholder')}
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm font-medium placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/25 border-2 transition-all"
                style={{ ...inputStyle, borderColor: '#d6cfc6' }}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown */}
            {showDropdown && filteredPresets.length > 0 && (
              <div
                className="absolute z-20 w-full mt-1 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                style={{ background: 'var(--color-cream)', border: '1.5px solid #d6cfc6' }}
              >
                {filteredPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      cropName === preset
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sprout size={14} className="text-emerald-600 shrink-0" />
                      {preset}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Planting Date */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
              {t('crops.plantingDate')}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <Calendar size={16} />
              </div>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700/25 border-2 transition-all"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Error */}
          {createCropMutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-xs text-red-500 font-medium">
                {createCropMutation.error?.response?.data?.detail || t('crops.createFailed')}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!cropName.trim() || createCropMutation.isPending}
            className="w-full py-3.5 text-white font-bold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg,#166534,#14532d)',
              boxShadow: '0 6px 24px rgba(22,101,52,0.35)',
            }}
          >
            {createCropMutation.isPending ? (
              <><Loader2 size={16} className="animate-spin" />{t('crops.planting')}</>
            ) : (
              <><Sprout size={16} />{t('crops.plantCrop')}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCropModal;
