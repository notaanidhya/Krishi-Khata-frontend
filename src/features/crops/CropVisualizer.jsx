/**
 * CropVisualizer — Krishi redesign.
 * - Chunky progress bar (h-3)
 * - Warm card surface
 * - Botanical journal aesthetic
 */

import React, { useMemo } from 'react';
import { Sprout, Leaf, Flower2, Wheat } from 'lucide-react';

const STAGES = [
  {
    key: 'Seedling',
    label: 'Seedling',
    imageSrc: '/stages/seedling.png',
    icon: Sprout,
    color: 'from-lime-400 to-emerald-400',
    bgRing: 'ring-lime-200',
    dotColor: 'bg-lime-500',
    soilGlow: 'shadow-lime-300/40',
    description: 'Young sprout emerging from the soil',
  },
  {
    key: 'Vegetative',
    label: 'Vegetative',
    imageSrc: '/stages/vegetative.png',
    icon: Leaf,
    color: 'from-emerald-400 to-green-500',
    bgRing: 'ring-emerald-200',
    dotColor: 'bg-emerald-500',
    soilGlow: 'shadow-emerald-300/40',
    description: 'Growing plant with lush green leaves',
  },
  {
    key: 'Flowering',
    label: 'Flowering',
    imageSrc: '/stages/flowering.png',
    icon: Flower2,
    color: 'from-pink-400 to-rose-400',
    bgRing: 'ring-pink-200',
    dotColor: 'bg-pink-500',
    soilGlow: 'shadow-pink-300/40',
    description: 'Beautiful flowers blooming on the plant',
  },
  {
    key: 'Ready to Harvest',
    label: 'Ready to Harvest',
    imageSrc: '/stages/harvest.png',
    icon: Wheat,
    color: 'from-amber-400 to-yellow-500',
    bgRing: 'ring-amber-200',
    dotColor: 'bg-amber-500',
    soilGlow: 'shadow-amber-300/40',
    description: 'Mature fruit fully ripe and ready to harvest! 🎉',
  },
];

const CropVisualizer = ({ growth_stage, cropName }) => {
  const currentIndex = useMemo(() => {
    const idx = STAGES.findIndex(
      (s) => s.key.toLowerCase() === (growth_stage || '').toLowerCase()
    );
    return idx >= 0 ? idx : 0;
  }, [growth_stage]);

  const stage = STAGES[currentIndex];
  const StageIcon = stage.icon;
  const progress = ((currentIndex + 1) / STAGES.length) * 100;

  return (
    <div id="crop-visualizer" className="relative">
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: 'var(--color-cream)', border: '1px solid #e5e0d8', boxShadow: '0 2px 10px rgba(5,46,22,0.07)' }}
      >
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${stage.color} p-4 pb-6 relative overflow-hidden`}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-2 right-8 w-2 h-2 bg-white/20 rounded-full animate-float-slow" />
            <div className="absolute top-6 right-20 w-1.5 h-1.5 bg-white/15 rounded-full animate-float-medium" />
            <div className="absolute bottom-3 left-12 w-1 h-1 bg-white/25 rounded-full animate-float-fast" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Growth Stage</p>
              <h3 className="text-white text-xl font-extrabold mt-0.5">{stage.label}</h3>
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
        <div className="flex justify-center py-4 relative" style={{ background: 'linear-gradient(to bottom, #f0fdf4/50, var(--color-cream))' }}>
          <div className="relative flex flex-col items-center">
            <div className="w-44 h-44 flex items-end justify-center">
              <img
                src={stage.imageSrc}
                alt={stage.label}
                className="max-h-full max-w-full object-contain transition-all duration-700 ease-out hover:scale-105"
              />
            </div>
            {/* Soil */}
            <div
              className={`w-28 h-3 rounded-full shadow-lg ${stage.soilGlow} transition-all duration-500 mt-2`}
              style={{ background: 'linear-gradient(90deg, #92400e, #78350f, #92400e)' }}
            />
            <div className="w-24 h-1.5 rounded-full mt-0.5" style={{ background: 'rgba(120,53,15,0.25)' }} />
          </div>
        </div>

        {/* Progress Bar — chunky h-3 */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wide">Progress</span>
            <span className="text-xs text-stone-500 font-medium">{currentIndex + 1} / {STAGES.length}</span>
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${stage.color} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${progress}%` }}
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCurrent
                        ? `bg-gradient-to-br ${s.color} shadow-md ring-2 ${s.bgRing} scale-110`
                        : isActive
                        ? `bg-gradient-to-br ${s.color} opacity-60`
                        : 'bg-stone-100'
                    }`}
                  >
                    <SIcon size={14} className={`transition-colors duration-500 ${isActive ? 'text-white' : 'text-stone-300'}`} />
                  </div>
                  <span
                    className={`text-[9px] font-bold transition-colors duration-300 text-center leading-tight max-w-[52px] ${
                      isCurrent ? 'text-emerald-900' : isActive ? 'text-stone-500' : 'text-stone-300'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-stone-400 mt-3 font-medium transition-all duration-500">
            {stage.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CropVisualizer;
