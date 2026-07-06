/**
 * SmartSchedule — Premium vertical timeline for crop milestones.
 * Refined Earth botanical journal aesthetic with completed / current / upcoming states.
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

const SmartSchedule = ({ cropId, cropName, daysSincePlanting, plantingDate, isProcessing }) => {
  const { t, i18n } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['cropTasks', cropId, i18n.language],
    queryFn: () => fetchCropTasks(cropId),
    enabled: !isProcessing && !!cropId,
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
      style={{ border: '1.5px solid var(--border-subtle)', boxShadow: '0 2px 12px rgba(45,42,36,0.06)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3" style={{ background: 'var(--color-cream)' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
            boxShadow: '0 4px 16px rgba(61,90,58,0.3)',
          }}
        >
          <CalendarCheck size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h4
              className="text-sm font-bold font-serif-accent"
              style={{ color: 'var(--color-ink)' }}
            >
              {t('crops.schedule.title')}
            </h4>
            {data?.source === 'ai' && (
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider" style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}>
                <Sparkles size={10} /> AI Sync
              </span>
            )}
          </div>
          <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {t(`mandi.commodities.${cropName}`, { defaultValue: cropName })} • {milestones.filter((m) => m.completed).length}/{milestones.length} {t('crops.schedule.completed')}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 pb-5 relative" style={{ background: 'var(--color-cream)' }}>
        {(isLoading || isProcessing) && (
          <div className="absolute inset-0 flex items-center justify-center z-20 backdrop-blur-[1px]" style={{ background: 'rgba(255,253,249,0.6)' }}>
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="animate-pulse" size={24} style={{ color: 'var(--color-harvest)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-warning)' }}>Generating Smart Schedule...</span>
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
                      ? 'linear-gradient(to bottom, var(--color-forest-muted), var(--border-subtle))'
                      : 'var(--border-subtle)',
                  }}
                />
              )}

              {/* Circle node */}
              <div className="shrink-0 mt-1 relative z-10">
                {milestone.completed ? (
                  /* Completed — forest with checkmark */
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
                      boxShadow: '0 2px 8px rgba(61,90,58,0.25)',
                    }}
                  >
                    <Check size={16} className="text-white" strokeWidth={3} />
                  </div>
                ) : milestone.isCurrent ? (
                  /* Current — pulsing harvest gold */
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-harvest), var(--color-rust))',
                      boxShadow: '0 0 0 4px rgba(201,162,75,0.18), 0 2px 8px rgba(201,162,75,0.35)',
                      animation: 'smartSchedulePulse 2.2s ease-in-out infinite',
                    }}
                  >
                    <span className="text-base leading-none">{milestone.icon}</span>
                  </div>
                ) : (
                  /* Upcoming — soil/gray */
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500"
                    style={{
                      background: 'var(--color-soil-dark)',
                      border: '2px solid var(--border-subtle)',
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
                    className="text-xs font-bold transition-colors duration-300"
                    style={{
                      color: milestone.completed
                        ? 'var(--color-muted)'
                        : milestone.isCurrent
                          ? 'var(--color-ink)'
                          : 'var(--color-muted)',
                      opacity: milestone.completed ? 0.7 : 1,
                    }}
                  >
                    {milestone.task}
                  </span>
                  {milestone.completed && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: 'var(--color-success)', background: 'var(--color-forest-light)' }}>
                      {t('crops.schedule.done')}
                    </span>
                  )}
                  {milestone.isCurrent && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: 'var(--color-rust)', background: 'var(--color-warning-soft)' }}
                    >
                      {t('crops.schedule.next')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px] font-semibold tabular-nums"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {t('crops.schedule.day')} {milestone.day}
                  </span>
                  {milestone.calendarDate && (
                    <>
                      <span className="text-[9px]" style={{ color: 'var(--border-strong)' }}>•</span>
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: 'var(--color-muted)' }}
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
          0%, 100% { box-shadow: 0 0 0 4px rgba(201,162,75,0.18), 0 2px 8px rgba(201,162,75,0.35); }
          50%       { box-shadow: 0 0 0 8px rgba(201,162,75,0.10), 0 2px 12px rgba(201,162,75,0.45); }
        }
      `}
      </style>
    </div>
  );
};

export default SmartSchedule;
