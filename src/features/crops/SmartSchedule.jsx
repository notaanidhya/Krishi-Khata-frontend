/**
 * SmartSchedule — Premium vertical timeline for crop milestones.
 * Botanical journal aesthetic with completed / current / upcoming states.
 * Uses hardcoded crop schedules matching backend crop_stages.py.
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Check, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';

const fetchCropTasks = async (cropId) => {
  const { data } = await apiClient.get(`/api/v1/crops/${cropId}/tasks`);
  return data; // { tasks: [{task, icon, day, status}], source, stage }
};

/**
 * Adds a number of days to a base date string and returns a formatted date.
 */
const addDaysToDate = (isoDateStr, days, language) => {
  const date = new Date(isoDateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

const SmartSchedule = ({ cropId, cropName, daysSincePlanting, plantingDate }) => {
  const { t, i18n } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['cropTasks', cropId, i18n.language],
    queryFn: () => fetchCropTasks(cropId),
    enabled: !!cropId,
  });

  const milestones = useMemo(() => {
    if (!data?.tasks) return [];
    
    return data.tasks.map((item) => {
      const completed = item.status === 'completed';
      const isCurrent = item.status === 'current';
      
      return {
        ...item,
        completed,
        isCurrent,
        calendarDate: plantingDate && item.day !== undefined ? addDaysToDate(plantingDate, item.day, i18n.language) : null,
      };
    });
  }, [data, plantingDate, i18n.language]);

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
          <div className="flex items-center gap-1.5">
            <h4
              className="text-sm font-bold font-serif-accent"
              style={{ color: 'var(--color-forest)' }}
            >
              {t('crops.schedule.title')}
            </h4>
            {data?.source === 'ai' && (
              <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                <Sparkles size={10} /> AI Sync
              </span>
            )}
          </div>
          <p className="text-[10px] text-stone-400 font-medium mt-0.5">
            {t(`mandi.commodities.${cropName}`, { defaultValue: cropName })} • {milestones.filter((m) => m.completed).length}/{milestones.length} {t('crops.schedule.completed')}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 pb-5 relative" style={{ background: '#fffdf5' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="text-indigo-400 animate-pulse" size={24} />
              <span className="text-xs text-indigo-600 font-medium">Generating Smart Schedule...</span>
            </div>
          </div>
        )}
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
                      {t('crops.schedule.done')}
                    </span>
                  )}
                  {milestone.isCurrent && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: '#92400e', background: '#fef3c7' }}
                    >
                      {t('crops.schedule.next')}
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
                    {t('crops.schedule.day')} {milestone.day}
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
      `}
      </style>
    </div>
  );
};

export default SmartSchedule;
