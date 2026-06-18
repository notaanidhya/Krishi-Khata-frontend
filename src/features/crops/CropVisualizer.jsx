/**
 * CropVisualizer — Refined Earth redesign.
 * - Chunky progress bar (h-3)
 * - Warm cream card surface
 * - Botanical journal aesthetic with olive/gold/rust stage palette
 */

import React, { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Leaf, Flower2, Wheat } from 'lucide-react';

// Refined Earth stage palette — each stage uses inline styles for full control
const STAGES = [
  {
    key: 'Seedling',
    label: 'Seedling',
    imageSrc: '/stages/seedling.png',
    icon: Sprout,
    gradient: 'linear-gradient(135deg, #8aa56f, #6b7b4f)',
    description: 'Young sprout emerging from the soil',
  },
  {
    key: 'Vegetative',
    label: 'Vegetative',
    imageSrc: '/stages/vegetative.png',
    icon: Leaf,
    gradient: 'linear-gradient(135deg, #5c7a55, #3d5a3a)',
    description: 'Growing plant with lush green leaves',
  },
  {
    key: 'Flowering',
    label: 'Flowering',
    imageSrc: '/stages/flowering.png',
    icon: Flower2,
    gradient: 'linear-gradient(135deg, #c97b4a, #b5683a)',
    description: 'Beautiful flowers blooming on the plant',
  },
  {
    key: 'Ready to Harvest',
    label: 'Ready to Harvest',
    imageSrc: '/stages/harvest.png',
    icon: Wheat,
    gradient: 'linear-gradient(135deg, #c9a24b, #b58a35)',
    description: 'Mature fruit fully ripe and ready to harvest! 🎉',
  },
];

const CropVisualizer = ({ growth_stage, cropName }) => {
  const { t } = useTranslation();
  const currentIndex = useMemo(() => {
    const idx = STAGES.findIndex(
      (s) => s.key.toLowerCase() === (growth_stage || '').toLowerCase()
    );
    return idx >= 0 ? idx : 0;
  }, [growth_stage]);

  useEffect(() => {
    STAGES.forEach(stage => {
      const img = new Image();
      img.src = stage.imageSrc;
    });
  }, []);

  const stage = STAGES[currentIndex];
  const StageIcon = stage.icon;
  const progress = ((currentIndex + 1) / STAGES.length) * 100;

  return (
    <div id="crop-visualizer" className="relative">
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: 'var(--color-cream)', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 10px rgba(45,42,36,0.06)' }}
      >
        {/* Gradient Header */}
        <div className="p-4 pb-6 relative overflow-hidden" style={{ background: stage.gradient }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-2 right-8 w-2 h-2 bg-white/20 rounded-full animate-float-slow" />
            <div className="absolute top-6 right-20 w-1.5 h-1.5 bg-white/15 rounded-full animate-float-medium" />
            <div className="absolute bottom-3 left-12 w-1 h-1 bg-white/25 rounded-full animate-float-fast" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{t('crops.schedule.growthStage')}</p>
              <h3 className="text-white text-xl font-extrabold mt-0.5">{t(`crops.schedule.stages.${stage.key}`, { defaultValue: stage.label })}</h3>
              {cropName && (
                <p className="text-white/80 text-xs font-medium mt-0.5 font-serif-accent">{cropName}</p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)' }}
            >
              <StageIcon size={28} className="text-white" />
            </div>
          </div>
        </div>

        {/* Plant Visualization */}
        <div className="flex justify-center py-4 relative" style={{ background: 'linear-gradient(to bottom, rgba(238,241,232,0.5), var(--color-cream))' }}>
          <div key={stage.key} className="relative flex flex-col items-center animate-stage-enter">
            <div className="w-44 h-44 flex items-end justify-center">
              <img
                src={stage.imageSrc}
                alt={stage.label}
                className="max-h-full max-w-full object-contain transition-all duration-700 ease-out hover:scale-105"
              />
            </div>
            {/* Soil */}
            <div
              className="w-28 h-3 rounded-full shadow-lg transition-all duration-500 mt-2"
              style={{ background: 'linear-gradient(90deg, #7c5a3a, #5e4329, #7c5a3a)' }}
            />
            <div className="w-24 h-1.5 rounded-full mt-0.5" style={{ background: 'rgba(94,67,41,0.25)' }} />
          </div>
        </div>

        {/* Progress Bar — chunky h-3 */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>{t('crops.schedule.progress')}</span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{currentIndex + 1} / {STAGES.length}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-soil-dark)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%`, background: stage.gradient }}
            />
          </div>

          {/* Stage dots */}
          <div className="flex justify-between mt-3 px-1">
            {STAGES.map((s, i) => {
              const SIcon = s.icon;
              const isActive  = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={s.key} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                    style={
                      isCurrent
                        ? { background: s.gradient, boxShadow: '0 4px 12px rgba(45,42,36,0.18)', transform: 'scale(1.1)' }
                        : isActive
                          ? { background: s.gradient, opacity: 0.6 }
                          : { background: 'var(--color-soil-dark)' }
                    }
                  >
                    <SIcon size={14} style={{ color: isActive ? '#fff' : 'var(--color-muted)' }} className="transition-colors duration-500" />
                  </div>
                  <span
                    className="text-[10px] font-bold transition-colors duration-300 text-center leading-tight max-w-[52px]"
                    style={{ color: isCurrent ? 'var(--color-ink)' : isActive ? 'var(--color-muted)' : 'var(--color-muted)' }}
                  >
                    {t(`crops.schedule.stages.${s.key}`, { defaultValue: s.label })}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs mt-3 font-medium transition-all duration-500" style={{ color: 'var(--color-muted)' }}>
            {t(`crops.schedule.stageDescriptions.${stage.key}`, { defaultValue: stage.description })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CropVisualizer;
