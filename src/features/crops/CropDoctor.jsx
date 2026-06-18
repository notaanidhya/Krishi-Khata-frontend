/**
 * CropDoctor — AI Crop Doctor (फसल डॉक्टर) SOS box.
 * Refined Earth aesthetic: warm ivory bg, forest-mid actions,
 * harvest gold AI-response card with Sparkles label.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stethoscope, Camera, Send, Sparkles, X, Loader2 } from 'lucide-react';
import { askCropAI } from '../../api/crop';

const inputStyle = {
  background: 'var(--color-cream)',
  borderColor: 'var(--border-subtle)',
  color: 'var(--color-ink)',
};

const CropDoctor = ({ cropId, cropName, daysSincePlanting }) => {
  const { i18n } = useTranslation();
  const isHindi = i18n.language && i18n.language.startsWith('hi');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [showCameraHint, setShowCameraHint] = useState(false);

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await askCropAI(cropId, trimmed);
      setResponse(result);
      setQuery('');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Could not reach the Crop Doctor. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const dismissResponse = () => {
    setResponse(null);
    setError(null);
  };

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ border: '1.5px solid var(--border-subtle)', boxShadow: '0 2px 12px rgba(45,42,36,0.06)' }}
    >
      {/* Header — forest gradient */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }}
        >
          <Stethoscope size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold font-serif-accent text-white">
            Crop Doctor (फसल डॉक्टर)
          </h4>
          <p className="text-[10px] text-white/60 font-medium">
            {cropName} • Day {daysSincePlanting}
          </p>
        </div>
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          <Sparkles size={12} style={{ color: 'var(--color-harvest)' }} />
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 pt-3 pb-2" style={{ background: 'var(--color-cream)' }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isHindi ? "समस्या बताएं (जैसे, पीली पत्तियां, कीड़े)..." : "Describe an issue (e.g., yellow leaves, insects)..."}
          rows={3}
          className="w-full resize-none px-3 py-3 text-sm focus:outline-none transition-all rounded-xl font-medium"
          style={{
            ...inputStyle,
            border: '1.5px solid var(--border-subtle)',
            lineHeight: '24px',
          }}
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2" style={{ background: 'var(--color-cream)' }}>
        {/* Camera stub — "Coming soon" tooltip pattern */}
        <button
          type="button"
          onClick={() => {
            setShowCameraHint(true);
            setTimeout(() => setShowCameraHint(false), 2000);
          }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 relative"
          style={{ background: 'var(--color-soil-dark)', border: '1px solid var(--border-subtle)', color: 'var(--color-muted)' }}
          disabled={isLoading}
        >
          <Camera size={15} />
          <span>Photo</span>
          {showCameraHint && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-white text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg animate-fade-in" style={{ background: 'var(--color-forest)' }}>
              Coming soon! 📸
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 -mt-1" style={{ background: 'var(--color-forest)' }} />
            </div>
          )}
        </button>

        <div className="flex-1" />
        {query.length > 0 && (
          <span className="text-[10px] font-medium tabular-nums" style={{ color: 'var(--color-muted)' }}>
            {query.length}/2000
          </span>
        )}

        {/* Submit — forest gradient */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!query.trim() || isLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={
            query.trim() && !isLoading
              ? {
                  background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
                  boxShadow: '0 4px 16px rgba(61,90,58,0.3)',
                }
              : { background: 'var(--color-soil-dark)', color: 'var(--color-muted)' }
          }
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Asking…</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>Ask Doctor</span>
            </>
          )}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="px-4 pb-4" style={{ background: 'var(--color-cream)' }}>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--color-forest-light)', border: '1px solid var(--color-forest-muted)' }}>
            <Loader2 size={16} className="animate-spin shrink-0" style={{ color: 'var(--color-forest)' }} />
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--color-forest)' }}>Doctor is thinking...</p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--color-forest-muted)' }}>
                Analyzing your {cropName} on Day {daysSincePlanting}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="px-4 pb-4" style={{ background: 'var(--color-cream)' }}>
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'var(--color-danger-soft)', border: '1px solid var(--color-danger)' }}>
            <p className="text-xs font-medium flex-1" style={{ color: 'var(--color-danger)' }}>{error}</p>
            <button
              onClick={dismissResponse}
              className="ml-2 p-1 transition-colors"
              style={{ color: 'var(--color-danger)' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* AI Response card — harvest gold gradient */}
      {response && !isLoading && (
        <div className="px-4 pb-4" style={{ background: 'var(--color-cream)' }}>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--color-warning-soft), #fbe8c8)',
              border: '1.5px solid var(--color-harvest)',
              boxShadow: '0 2px 12px rgba(201,162,75,0.15)',
            }}
          >
            {/* AI label header */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} style={{ color: 'var(--color-harvest)' }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-warning)' }}>
                  AI Advice
                </span>
                {response.current_stage && (
                  <span className="text-[9px] font-medium ml-1" style={{ color: 'var(--color-rust)' }}>
                    • {response.current_stage}
                  </span>
                )}
              </div>
              <button
                onClick={dismissResponse}
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                style={{ color: 'var(--color-warning)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Response body */}
            <div className="px-4 pb-4">
              {response.answer
                .split('\n')
                .filter((line) => line.trim() !== '')
                .map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="text-xs leading-relaxed font-medium"
                    style={{ color: 'var(--color-ink)', marginBottom: idx < response.answer.split('\n').filter((l) => l.trim()).length - 1 ? '8px' : '0' }}
                  >
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropDoctor;
