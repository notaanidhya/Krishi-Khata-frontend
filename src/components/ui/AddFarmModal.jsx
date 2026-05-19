/**
 * AddFarmModal — Create a new farm.
 *
 * Clean, Krishi-aesthetic modal with name, area, state, and district fields.
 * Uses the deep forest-green / warm clay design language.
 */

import React, { useState, useEffect } from 'react';
import { X, MapPin, Ruler, Landmark, Loader2, Tractor } from 'lucide-react';
import { useCreateFarm } from '../../hooks/useFarm';

const inputClass =
  'w-full px-4 py-3.5 rounded-xl text-base transition-all outline-none border-2 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-700';

const inputStyle = {
  background: '#fffdf9',
  borderColor: '#d6cfc6',
  color: 'var(--color-forest)',
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const AddFarmModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [areaAcres, setAreaAcres] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');

  const createFarmMutation = useCreateFarm();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setAreaAcres('');
      setState('');
      setDistrict('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !areaAcres || !state) return;

    createFarmMutation.mutate(
      {
        name: name.trim(),
        area_acres: parseFloat(areaAcres),
        state,
        district: district.trim() || state,
      },
      {
        onSuccess: (newFarm) => {
          onSuccess?.(newFarm);
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--color-soil)', borderTop: '3px solid #14532d' }}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-4" />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-4 pb-4 border-b"
          style={{ borderColor: '#e5e0d8' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #166534, #14532d)',
                boxShadow: '0 4px 16px rgba(22,101,52,0.3)',
              }}
            >
              <Tractor size={20} className="text-white" />
            </div>
            <div>
              <h2
                className="text-lg font-bold font-serif-accent"
                style={{ color: 'var(--color-forest)' }}
              >
                Create Farm
              </h2>
              <p className="text-[11px] text-stone-400 font-medium">
                Add your farmland details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-300 transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Farm Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              <Landmark size={14} /> Farm Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sukhdev Farm"
              required
              maxLength={150}
              className={inputClass}
              style={inputStyle}
              autoFocus
            />
          </div>

          {/* Area */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              <Ruler size={14} /> Area (Acres)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0.1"
              value={areaAcres}
              onChange={(e) => setAreaAcres(e.target.value)}
              placeholder="e.g. 5.0"
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* State */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              <MapPin size={14} /> State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className={`${inputClass} appearance-none`}
              style={inputStyle}
            >
              <option value="" disabled>Select your state...</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              <MapPin size={14} /> District (optional)
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Indore, Bhopal"
              maxLength={100}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Error */}
          {createFarmMutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-xs text-red-500 font-medium">
                {createFarmMutation.error?.response?.data?.detail || 'Failed to create farm. Please try again.'}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || !areaAcres || !state || createFarmMutation.isPending}
            className="w-full py-4 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #166534, #14532d)',
              boxShadow: '0 6px 24px rgba(22,101,52,0.35)',
            }}
          >
            {createFarmMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating Farm...
              </>
            ) : (
              <>
                <Tractor size={18} />
                Create My Farm
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFarmModal;
