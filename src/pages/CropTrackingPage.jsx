/**
 * CropTrackingPage — "The Botanical Journal" Krishi redesign.
 *
 * - Serif font for crop name title (Merriweather)
 * - AI Crop Doctor for proactive issue diagnosis
 * - Smart Schedule timeline for milestone tracking
 * - Progress bar: chunky (h-3)
 * - Warm earthy color palette throughout
 */

import React, { useState } from 'react';
import {
  Sprout, Loader2,
  Plus, CheckCircle2, Timer, Trash2,
} from 'lucide-react';
import { useActiveFarm } from '../context/ActiveFarmContext';
import { useCrops, useDeleteCrop } from '../hooks/useCrop';
import CropVisualizer from '../features/crops/CropVisualizer';
import CropDoctor from '../features/crops/CropDoctor';
import SmartSchedule from '../features/crops/SmartSchedule';
import AddCropModal from '../features/crops/AddCropModal';

const CropTrackingPage = () => {
  const { activeFarm } = useActiveFarm();
  const farmId = activeFarm?.id;

  const { data: allCrops, isLoading, isError } = useCrops(farmId);
  const activeCrops = allCrops?.filter((c) => c.status === 'ACTIVE') || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const deleteMutation = useDeleteCrop();

  const handleDelete = (cropId) => {
    deleteMutation.mutate({ cropId }, { onSuccess: () => setShowDeleteConfirm(null) });
  };

  // ── No farm selected ─────────────────────────────────────
  if (!activeFarm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
          <Sprout size={28} className="text-stone-300" />
        </div>
        <p className="text-stone-400 text-sm font-medium">Select a farm to view crops</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <Loader2 size={28} className="text-emerald-700 animate-spin mb-3" />
        <p className="text-stone-400 text-sm font-medium">Loading crop data...</p>
      </div>
    );
  }

  return (
    <div id="crop-tracking-page" className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #166534, #14532d)', boxShadow: '0 4px 16px rgba(22,101,52,0.3)' }}
          >
            <Sprout size={20} className="text-white" />
          </div>
          <div>
            {/* Serif crop tracking title */}
            <h2
              className="text-lg font-bold font-serif-accent leading-tight"
              style={{ color: 'var(--color-forest)' }}
            >
              Fasal Diary
            </h2>
            <p className="text-xs text-stone-400 font-medium">{activeFarm.name}</p>
          </div>
        </div>
        {activeCrops.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all"
            style={{ background: '#ecfdf5', color: '#166534' }}
            title="Plant Another Crop"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ── EMPTY STATE ──────────────────────────────────── */}
      {activeCrops.length === 0 && !isLoading && (
        <div className="krishi-card p-8 text-center">
          <div className="relative mx-auto w-32 h-32 mb-6">
            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/stages/seedling.png" alt="Plant a crop" className="w-20 h-20 object-contain opacity-80" />
            </div>
            <div className="absolute inset-0 border-2 border-dashed border-emerald-200 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
          </div>

          <h3
            className="text-lg font-bold font-serif-accent mb-1.5"
            style={{ color: 'var(--color-forest)' }}
          >
            Koi Fasal Nahi
          </h3>
          <p className="text-sm text-stone-400 font-medium mb-6 max-w-xs mx-auto">
            Start tracking your farm's journey. Plant a crop and watch it grow stage by stage.
          </p>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-white font-bold rounded-2xl text-sm transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #166534, #14532d)',
              boxShadow: '0 6px 24px rgba(22,101,52,0.35)',
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Nayi Fasal Lagao
          </button>
        </div>
      )}

      {/* ── ACTIVE CROP CARDS ────────────────────────────── */}
      {activeCrops.map((activeCrop) => (
        <div
          key={activeCrop.id}
          className="rounded-3xl p-4 space-y-4"
          style={{
            background: 'rgba(255,253,249,0.85)',
            border: '1.5px solid #e5e0d8',
            boxShadow: '0 4px 20px rgba(5,46,22,0.08)',
          }}
        >
          {/* Crop name — serif font, botanical journal */}
          <div className="flex items-center justify-between mb-2 px-1">
            <h3
              className="text-xl font-bold font-serif-accent flex-1"
              style={{ color: 'var(--color-forest)' }}
            >
              {activeCrop.crop_name}
            </h3>
            {!showDeleteConfirm || showDeleteConfirm !== activeCrop.id ? (
              <button
                onClick={() => setShowDeleteConfirm(activeCrop.id)}
                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Crop"
              >
                <Trash2 size={18} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500 font-medium">Delete?</span>
                <button
                  onClick={() => handleDelete(activeCrop.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition-all"
                >
                  {deleteMutation.isPending && showDeleteConfirm === activeCrop.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <CheckCircle2 size={14} />
                  }
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="p-1.5 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300 active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Days since planting badge */}
          <div
            className="krishi-card px-4 py-3 flex items-center justify-between"
            style={{ boxShadow: 'none', border: '1px solid #e5e0d8' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <Timer size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Days Since Planting</p>
                <p className="text-lg font-extrabold" style={{ color: 'var(--color-forest)' }}>
                  {activeCrop.days_since_planting}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-stone-400 font-medium">Planted</p>
              <p className="text-xs font-bold text-stone-600">
                {new Date(activeCrop.planting_date + 'T00:00:00').toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Crop Visualizer */}
          <CropVisualizer growth_stage={activeCrop.current_stage} cropName={activeCrop.crop_name} />

          {/* AI Crop Doctor */}
          <CropDoctor
            cropId={activeCrop.id}
            cropName={activeCrop.crop_name}
            daysSincePlanting={activeCrop.days_since_planting}
          />

          {/* Smart Schedule Timeline */}
          <SmartSchedule
            cropName={activeCrop.crop_name}
            daysSincePlanting={activeCrop.days_since_planting}
            plantingDate={activeCrop.planting_date}
          />
        </div>
      ))}

      {/* ── Add Crop Modal ──────────────────────────────── */}
      <AddCropModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} farmId={farmId} />
    </div>
  );
};

export default CropTrackingPage;
