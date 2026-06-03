/**
 * SmartSchedule — Premium vertical timeline for crop milestones.
 * Botanical journal aesthetic with completed / current / upcoming states.
 * Uses hardcoded crop schedules matching backend crop_stages.py.
 */

import React, { useMemo } from 'react';
import { CalendarCheck, Check } from 'lucide-react';

const CROP_SCHEDULES = {
  Wheat: [
    { day: 0, task: 'Sowing (बुआई)', icon: '🌱' },
    { day: 7, task: 'First Irrigation', icon: '💧' },
    { day: 15, task: 'Weeding (निराई)', icon: '🌿' },
    { day: 21, task: 'First Fertilizer (DAP/Urea)', icon: '🧪' },
    { day: 45, task: 'Second Fertilizer', icon: '🧪' },
    { day: 60, task: 'Pest Inspection', icon: '🐛' },
    { day: 90, task: 'Flowering Stage Care', icon: '🌸' },
    { day: 110, task: 'Pre-Harvest Check', icon: '📋' },
    { day: 120, task: 'Harvest (कटाई)', icon: '🌾' },
  ],
  Rice: [
    { day: 0, task: 'Nursery Sowing (बुआई)', icon: '🌱' },
    { day: 21, task: 'Transplanting (रोपाई)', icon: '🌾' },
    { day: 30, task: 'First Weeding', icon: '🌿' },
    { day: 35, task: 'Fertilizer Application', icon: '🧪' },
    { day: 55, task: 'Second Weeding', icon: '🌿' },
    { day: 65, task: 'Pest/Disease Check', icon: '🐛' },
    { day: 95, task: 'Flowering Care', icon: '🌸' },
    { day: 120, task: 'Grain Filling Watch', icon: '👀' },
    { day: 130, task: 'Harvest (कटाई)', icon: '🌾' },
  ],
  Maize: [
    { day: 0, task: 'Sowing (बुआई)', icon: '🌱' },
    { day: 7, task: 'First Irrigation', icon: '💧' },
    { day: 14, task: 'Thinning & Gap Filling', icon: '✂️' },
    { day: 20, task: 'First Fertilizer (Urea)', icon: '🧪' },
    { day: 30, task: 'Weeding (निराई)', icon: '🌿' },
    { day: 45, task: 'Second Fertilizer', icon: '🧪' },
    { day: 55, task: 'Pest Inspection', icon: '🐛' },
    { day: 65, task: 'Tasseling Care', icon: '🌸' },
    { day: 85, task: 'Cob Development Watch', icon: '👀' },
    { day: 100, task: 'Harvest (कटाई)', icon: '🌾' },
  ],
  Bajra: [
    { day: 0, task: 'Sowing (बुआई)', icon: '🌱' },
    { day: 7, task: 'First Irrigation', icon: '💧' },
    { day: 15, task: 'Thinning', icon: '✂️' },
    { day: 20, task: 'Fertilizer Application', icon: '🧪' },
    { day: 30, task: 'Weeding (निराई)', icon: '🌿' },
    { day: 45, task: 'Pest/Disease Check', icon: '🐛' },
    { day: 55, task: 'Ear Head Formation', icon: '🌸' },
    { day: 70, task: 'Grain Filling Watch', icon: '👀' },
    { day: 85, task: 'Harvest (कटाई)', icon: '🌾' },
  ],
  Tomato: [
    { day: 0, task: 'Nursery Sowing (बुआई)', icon: '🌱' },
    { day: 25, task: 'Transplanting (रोपाई)', icon: '🌿' },
    { day: 35, task: 'Staking & First Fertilizer', icon: '🧪' },
    { day: 45, task: 'Weeding & Mulching', icon: '🌿' },
    { day: 55, task: 'Flowering Care', icon: '🌸' },
    { day: 65, task: 'Pest/Disease Spray', icon: '🐛' },
    { day: 75, task: 'Fruit Setting Watch', icon: '👀' },
    { day: 90, task: 'First Harvest Pick', icon: '🍅' },
    { day: 120, task: 'Final Harvest (कटाई)', icon: '🌾' },
  ],
  Cotton: [
    { day: 0, task: 'Sowing (बुआई)', icon: '🌱' },
    { day: 10, task: 'First Irrigation', icon: '💧' },
    { day: 20, task: 'Thinning & Gap Filling', icon: '✂️' },
    { day: 30, task: 'First Fertilizer (Urea)', icon: '🧪' },
    { day: 45, task: 'Weeding (निराई)', icon: '🌿' },
    { day: 60, task: 'Pest Inspection (Bollworm)', icon: '🐛' },
    { day: 80, task: 'Flowering & Boll Formation', icon: '🌸' },
    { day: 100, task: 'Boll Opening Watch', icon: '👀' },
    { day: 130, task: 'First Picking', icon: '🌾' },
    { day: 150, task: 'Final Picking (कटाई)', icon: '🌾' },
  ],
  Soybean: [
    { day: 0, task: 'Sowing (बुआई)', icon: '🌱' },
    { day: 10, task: 'First Irrigation', icon: '💧' },
    { day: 20, task: 'Weeding (निराई)', icon: '🌿' },
    { day: 25, task: 'Fertilizer Application', icon: '🧪' },
    { day: 40, task: 'Second Weeding', icon: '🌿' },
    { day: 50, task: 'Pest/Disease Check', icon: '🐛' },
    { day: 60, task: 'Flowering Care', icon: '🌸' },
    { day: 80, task: 'Pod Filling Watch', icon: '👀' },
    { day: 100, task: 'Harvest (कटाई)', icon: '🌾' },
  ],
};

const DEFAULT_SCHEDULE = [
  { day: 0, task: 'Sowing (बुआई)', icon: '🌱' },
  { day: 10, task: 'First Irrigation', icon: '💧' },
  { day: 20, task: 'Weeding (निराई)', icon: '🌿' },
  { day: 30, task: 'Fertilizer Application', icon: '🧪' },
  { day: 50, task: 'Pest Inspection', icon: '🐛' },
  { day: 70, task: 'Flowering Stage Care', icon: '🌸' },
  { day: 90, task: 'Pre-Harvest Check', icon: '📋' },
  { day: 110, task: 'Harvest (कटाई)', icon: '🌾' },
];

/**
 * Returns the schedule for a given crop name.
 * Tries exact match first, then case-insensitive, then falls back to default.
 */
const getSchedule = (cropName) => {
  if (!cropName) return DEFAULT_SCHEDULE;
  if (CROP_SCHEDULES[cropName]) return CROP_SCHEDULES[cropName];
  const key = Object.keys(CROP_SCHEDULES).find(
    (k) => k.toLowerCase() === cropName.toLowerCase()
  );
  return key ? CROP_SCHEDULES[key] : DEFAULT_SCHEDULE;
};

/**
 * Adds a number of days to a base date string and returns a formatted date.
 */
const addDaysToDate = (isoDateStr, days) => {
  const date = new Date(isoDateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

const SmartSchedule = ({ cropName, daysSincePlanting, plantingDate }) => {
  const milestones = useMemo(() => {
    const schedule = getSchedule(cropName);
    const firstIncompleteIndex = schedule.findIndex((item) => item.day > daysSincePlanting);
    
    return schedule.map((item, index) => {
      const completed = item.day <= daysSincePlanting;
      const isCurrent = index === firstIncompleteIndex;
      
      return {
        ...item,
        completed,
        isCurrent,
        calendarDate: plantingDate ? addDaysToDate(plantingDate, item.day) : null,
      };
    });
  }, [cropName, daysSincePlanting, plantingDate]);

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ border: '1.5px solid #d6cfc6', boxShadow: '0 2px 12px rgba(5,46,22,0.07)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3" style={{ background: '#fffdf5' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #166534, #14532d)',
            boxShadow: '0 4px 16px rgba(22,101,52,0.3)',
          }}
        >
          <CalendarCheck size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h4
            className="text-sm font-bold font-serif-accent"
            style={{ color: 'var(--color-forest)' }}
          >
            Smart Schedule
          </h4>
          <p className="text-[10px] text-stone-400 font-medium">
            {cropName} • {milestones.filter((m) => m.completed).length}/{milestones.length} completed
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 pb-5" style={{ background: '#fffdf5' }}>
        {milestones.map((milestone, index) => {
          const isLast = index === milestones.length - 1;

          return (
            <div
              key={milestone.day}
              className="relative flex gap-3"
              style={{ paddingBottom: isLast ? 0 : '4px' }}
            >
              {/* Vertical connecting line */}
              {!isLast && (
                <div
                  className="absolute left-[17px] top-[36px] bottom-0 w-px"
                  style={{
                    background: milestone.completed
                      ? 'linear-gradient(to bottom, #86efac, #d1d5db)'
                      : '#e7e5e4',
                  }}
                />
              )}

              {/* Circle node */}
              <div className="shrink-0 mt-1 relative z-10">
                {milestone.completed ? (
                  /* Completed — green with checkmark */
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500"
                    style={{
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                    }}
                  >
                    <Check size={16} className="text-white" strokeWidth={3} />
                  </div>
                ) : milestone.isCurrent ? (
                  /* Current — pulsing amber/gold */
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      boxShadow: '0 0 0 4px rgba(245,158,11,0.18), 0 2px 8px rgba(245,158,11,0.35)',
                      animation: 'smartSchedulePulse 2.2s ease-in-out infinite',
                    }}
                  >
                    <span className="text-base leading-none">{milestone.icon}</span>
                  </div>
                ) : (
                  /* Upcoming — stone/gray */
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500"
                    style={{
                      background: '#f5f5f4',
                      border: '2px solid #e7e5e4',
                    }}
                  >
                    <span className="text-base leading-none opacity-50">{milestone.icon}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold transition-colors duration-300 ${
                      milestone.completed
                        ? 'text-stone-400'
                        : milestone.isCurrent
                        ? 'text-amber-800'
                        : 'text-stone-300'
                    }`}
                    style={
                      milestone.isCurrent
                        ? { color: 'var(--color-forest)' }
                        : undefined
                    }
                  >
                    {milestone.task}
                  </span>
                  {milestone.completed && (
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded">
                      Done
                    </span>
                  )}
                  {milestone.isCurrent && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: '#92400e', background: '#fef3c7' }}
                    >
                      Next
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] font-semibold tabular-nums ${
                      milestone.completed
                        ? 'text-stone-300'
                        : milestone.isCurrent
                        ? 'text-amber-600'
                        : 'text-stone-300'
                    }`}
                  >
                    Day {milestone.day}
                  </span>
                  {milestone.calendarDate && (
                    <>
                      <span className="text-[9px] text-stone-200">•</span>
                      <span
                        className={`text-[10px] font-medium ${
                          milestone.completed
                            ? 'text-stone-300'
                            : milestone.isCurrent
                            ? 'text-amber-500'
                            : 'text-stone-300'
                        }`}
                      >
                        {milestone.calendarDate}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline keyframes for the pulse animation */}
      <style>{`
        @keyframes smartSchedulePulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(245,158,11,0.18), 0 2px 8px rgba(245,158,11,0.35); }
          50%       { box-shadow: 0 0 0 8px rgba(245,158,11,0.10), 0 2px 12px rgba(245,158,11,0.45); }
        }
      `}</style>
    </div>
  );
};

export default SmartSchedule;
