/**
 * CropTrackingPage — "The Botanical Journal" Krishi redesign.
 *
 * - Serif font for crop name title (Merriweather)
 * - AI Crop Doctor for proactive issue diagnosis
 * - Smart Schedule timeline for milestone tracking
 * - Progress bar: chunky (h-3)
 * - Warm earthy color palette throughout
 */

import { useState } from 'react';
import {
  Sprout, Loader2,
  Plus, CheckCircle2, Timer, Trash2, BookOpen
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useActiveFarm } from '../context/ActiveFarmContext';
import { useCrops, useDeleteCrop, useRetryCropValidation } from '../hooks/useCrop';
import CropVisualizer from '../features/crops/CropVisualizer';
import CropDoctor from '../features/crops/CropDoctor';
import SmartSchedule from '../features/crops/SmartSchedule';
import AddCropModal from '../features/crops/AddCropModal';
import AddLogModal from '../features/crops/AddLogModal';
import AboutCrop from '../features/crops/AboutCrop';
import PageShell from '../components/layout/PageShell';
import { staggerContainer, fadeUp } from '../components/motion/motionPresets';

const CropTrackingPage = () => {
  const { t, i18n } = useTranslation();
  const { activeFarm } = useActiveFarm();
  const farmId = activeFarm?.id;

  const { data: allCrops, isLoading } = useCrops(farmId);
  const activeCrops = allCrops?.filter((c) => c.status === 'ACTIVE') || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [activeLogCropId, setActiveLogCropId] = useState(null);

  const deleteMutation = useDeleteCrop();
  const retryMutation = useRetryCropValidation();

  const handleDelete = (cropId) => {
    deleteMutation.mutate({ cropId }, { onSuccess: () => setShowDeleteConfirm(null) });
  };

  // ── No farm selected ─────────────────────────────────────
  if (!activeFarm) {
    return (
      <PageShell ambient="crops">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--color-soil-dark)' }}>
            <Sprout size={28} style={{ color: 'var(--color-muted)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>{t('crops.selectFarm')}</p>
        </div>
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell ambient="crops">
        <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
            <div className="space-y-2">
              <div className="h-5 w-28 rounded-lg skeleton-shimmer" />
              <div className="h-3 w-20 rounded-md skeleton-shimmer" />
            </div>
          </div>
          {/* Crop card skeleton */}
          <div className="rounded-3xl p-4 space-y-4 krishi-card">
            <div className="h-6 w-32 rounded-lg skeleton-shimmer" />
            <div className="rounded-2xl skeleton-shimmer" style={{ height: '80px' }} />
            <div className="rounded-2xl skeleton-shimmer" style={{ height: '260px' }} />
            <div className="rounded-2xl skeleton-shimmer" style={{ height: '120px' }} />
            <div className="rounded-2xl skeleton-shimmer" style={{ height: '160px' }} />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell ambient="crops">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        id="crop-tracking-page"
        className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4"
      >

      {/* ── Page Header ──────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))', boxShadow: '0 4px 16px -4px rgba(92,122,85,0.5)' }}
          >
            <Sprout size={20} className="text-white" />
          </div>
          <div>
            {/* Serif crop tracking title */}
            <h2
              className="text-lg font-bold font-serif-accent leading-tight"
              style={{ color: 'var(--color-forest)' }}
            >
              {t('crops.title')}
            </h2>
            <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{activeFarm.name}</p>
          </div>
        </div>
        {activeCrops.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'var(--color-forest-light)', color: 'var(--color-forest-muted)' }}
            title={t('crops.plantAnother')}
          >
            <Plus size={20} strokeWidth={2.5} />
          </motion.button>
        )}
      </motion.div>

      {/* ── EMPTY STATE ──────────────────────────────────── */}
      {activeCrops.length === 0 && !isLoading && (
        <motion.div variants={fadeUp} className="krishi-card p-8 text-center">
          <img
            src="/illustrations/empty-crops.svg"
            alt=""
            aria-hidden="true"
            className="w-44 h-36 object-contain mx-auto mb-5 opacity-95"
          />

          <h3
            className="text-lg font-bold font-serif-accent mb-1.5"
            style={{ color: 'var(--color-forest)' }}
          >
            {t('crops.emptyTitle')}
          </h3>
          <p className="text-sm font-medium mb-6 max-w-xs mx-auto" style={{ color: 'var(--color-muted)' }}>
            {t('crops.emptyText')}
          </p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-white font-bold rounded-2xl text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
              boxShadow: '0 6px 24px -4px rgba(92,122,85,0.45)',
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            {t('crops.plantNew')}
          </motion.button>
        </motion.div>
      )}

      {/* ── ACTIVE CROP CARDS ────────────────────────────── */}
      {activeCrops.map((activeCrop) => (
        <motion.div
          key={activeCrop.id}
          variants={fadeUp}
          className="rounded-3xl p-4 space-y-4 krishi-card"
        >
          {/* Crop name — serif font, botanical journal */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2 flex-1">
              <h3
                className="text-xl font-bold font-serif-accent"
                style={{ color: 'var(--color-forest)' }}
              >
                {activeCrop.crop_name}
              </h3>
              {activeCrop.is_processing && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse shadow-sm" style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)', border: '1px solid var(--color-harvest)' }}>
                  <Loader2 size={12} className="animate-spin" />
                  {t('crops.processing', 'Processing...')}
                </span>
              )}
              {activeCrop.validation_failed && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
                    Validation Failed
                  </span>
                  <button
                    onClick={() => retryMutation.mutate({ cropId: activeCrop.id })}
                    disabled={retryMutation.isPending}
                    className="px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                    style={{ background: 'var(--color-soil-dark)', color: 'var(--color-ink)' }}
                  >
                    {retryMutation.isPending && activeCrop.id === retryMutation.variables?.cropId ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : null}
                    Retry
                  </button>
                </div>
              )}
            </div>
            {!showDeleteConfirm || showDeleteConfirm !== activeCrop.id ? (
              <button
                onClick={() => setShowDeleteConfirm(activeCrop.id)}
                disabled={activeCrop.is_syncing}
                className="p-2 rounded-xl transition-all"
                style={{ color: 'var(--color-muted)' }}
                title={t('crops.deleteCrop')}
              >
                <Trash2 size={18} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: 'var(--color-danger)' }}>{t('crops.deleteConfirm')}</span>
                <button
                  onClick={() => handleDelete(activeCrop.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 text-white rounded-lg active:scale-95 transition-all"
                  style={{ background: 'var(--color-danger)' }}
                >
                  {deleteMutation.isPending && showDeleteConfirm === activeCrop.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <CheckCircle2 size={14} />
                  }
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="p-1.5 rounded-lg active:scale-95 transition-all"
                  style={{ background: 'var(--color-soil-dark)', color: 'var(--color-muted)' }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Days since planting badge */}
          <div
            className="krishi-card px-4 py-3 flex items-center justify-between"
            style={{ boxShadow: 'none', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-warning-soft)' }}>
                <Timer size={18} style={{ color: 'var(--color-harvest)' }} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{t('crops.daysSincePlanting')}</p>
                <p className="text-lg font-extrabold" style={{ color: 'var(--color-forest)' }}>
                  {activeCrop.days_since_planting}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>{t('crops.planted')}</p>
              <p className="text-xs font-bold" style={{ color: 'var(--color-ink)' }}>
                {new Date(activeCrop.planting_date + 'T00:00:00').toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Crop Visualizer */}
          <CropVisualizer growth_stage={activeCrop.current_stage} cropName={activeCrop.crop_name} />

          {/* About Crop (AI Generated Summary) */}
          <AboutCrop cropId={activeCrop.id} />

          {/* AI Crop Doctor */}
          <CropDoctor
            cropId={activeCrop.id}
            cropName={activeCrop.crop_name}
            daysSincePlanting={activeCrop.days_since_planting}
          />

          {/* Smart Schedule Timeline */}
          <SmartSchedule
            cropId={activeCrop.id}
            cropName={activeCrop.crop_name}
            daysSincePlanting={activeCrop.days_since_planting}
            plantingDate={activeCrop.planting_date}
          />

          {/* Crop Diary Section */}
          <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm flex items-center gap-1.5" style={{ color: 'var(--color-ink)' }}>
                <BookOpen size={16} style={{ color: 'var(--color-forest)' }} />
                {t('crops.diary', 'Crop Diary')}
              </h4>
              <button
                onClick={() => setActiveLogCropId(activeCrop.id)}
                disabled={activeCrop.is_syncing}
                className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors"
                style={
                  activeCrop.is_syncing
                    ? { background: 'var(--color-soil-dark)', color: 'var(--color-muted)', cursor: 'not-allowed' }
                    : { background: 'var(--color-forest-light)', color: 'var(--color-forest)' }
                }
              >
                + {t('crops.addLogBtn', 'Add Log')}
              </button>
            </div>

            {activeCrop.logs && activeCrop.logs.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {activeCrop.logs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl shadow-sm" style={{ background: 'var(--color-cream)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                        {new Date(log.log_date).toLocaleDateString()}
                      </span>
                      {log.ai_extracted_stage && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}>
                          {log.ai_extracted_stage}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>{log.raw_content}</p>
                    {log.ai_health_notes && (
                      <div className="mt-2 p-2 rounded-lg" style={{ background: 'var(--color-forest-light)', border: '1px solid var(--color-forest-muted)' }}>
                        <p className="text-xs font-medium" style={{ color: 'var(--color-forest)' }}>🩺 AI Notes: {log.ai_health_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 rounded-xl" style={{ background: 'var(--color-soil-dark)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{t('crops.noLogs', 'No diary entries yet. Add one to track progress!')}</p>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* ── Add Crop Modal ──────────────────────────────── */}
      <AddCropModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} farmId={farmId} />
      
      {/* ── Add Log Modal ──────────────────────────────── */}
      <AddLogModal 
        isOpen={!!activeLogCropId} 
        onClose={() => setActiveLogCropId(null)} 
        cropId={activeLogCropId} 
      />
      </motion.div>
    </PageShell>
  );
};

export default CropTrackingPage;
