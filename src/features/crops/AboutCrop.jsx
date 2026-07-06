import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/apiClient';

const AboutCrop = ({ cropId, isProcessing }) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['crop-about', cropId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/crops/${cropId}/about`);
      return res.data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour to save API calls
    enabled: !isProcessing && !!cropId,
  });

  if (isLoading || isProcessing) {
    return (
      <div className="krishi-card p-4 mt-4 bg-stone-50 border border-stone-200 shadow-sm animate-pulse">
        <div className="h-4 bg-stone-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-stone-200 rounded w-full mb-1"></div>
        <div className="h-3 bg-stone-200 rounded w-5/6"></div>
      </div>
    );
  }

  if (error || !data?.about) {
    return null; // Fail silently so the UI isn't broken
  }

  return (
    <div className="krishi-card p-4 mt-4 bg-gradient-to-br from-emerald-50 to-stone-50 border border-emerald-100 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={16} className="text-emerald-600" />
        <h4 className="font-bold text-sm text-emerald-800">
          {t('crops.aboutCrop', 'About this crop')}
        </h4>
      </div>
      <p className="text-sm text-emerald-900 leading-relaxed font-medium">
        {data.about}
      </p>
    </div>
  );
};

export default AboutCrop;
