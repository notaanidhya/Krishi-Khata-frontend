/**
 * CropDoctor — AI Crop Doctor (फसल डॉक्टर) SOS box.
 * Premium Krishi design: warm earthy aesthetic, deep emerald actions,
 * amber AI-response card with Sparkles label.
 */

import React, { useState } from 'react';
import { Stethoscope, Camera, Send, Sparkles, X, Loader2 } from 'lucide-react';
import { askCropAI } from '../../api/crop';

const inputStyle = {
  background: '#fffdf9',
  borderColor: '#d6cfc6',
  color: 'var(--color-forest)',
};

const CropDoctor = ({ cropId, cropName, daysSincePlanting }) => {
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
      style={{ border: '1.5px solid #d6cfc6', boxShadow: '0 2px 12px rgba(5,46,22,0.07)' }}
    >
      {/* Header — green gradient */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #166534, #14532d)' }}
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
          <Sparkles size={12} className="text-amber-300" />
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 pt-3 pb-2" style={{ background: '#fffdf5' }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe an issue (e.g., yellow leaves, insects)..."
          rows={3}
          className="w-full resize-none px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 transition-all rounded-xl placeholder:text-stone-300 font-medium"
          style={{
            ...inputStyle,
            border: '1.5px solid #d6cfc6',
            lineHeight: '24px',
          }}
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2" style={{ background: '#fffdf5' }}>
        {/* Camera stub — "Coming soon" tooltip pattern */}
        <button
          type="button"
          onClick={() => {
            setShowCameraHint(true);
            setTimeout(() => setShowCameraHint(false), 2000);
          }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 relative"
          style={{ background: '#f0ebe4', border: '1px solid #d6cfc6', color: '#78716c' }}
          disabled={isLoading}
        >
          <Camera size={15} />
          <span>Photo</span>
          {showCameraHint && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
              Coming soon! 📸
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-900 rotate-45 -mt-1" />
            </div>
          )}
        </button>

        <div className="flex-1" />
        {query.length > 0 && (
          <span className="text-[10px] text-stone-300 font-medium tabular-nums">
            {query.length}/2000
          </span>
        )}

        {/* Submit — deep emerald gradient */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!query.trim() || isLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={
            query.trim() && !isLoading
              ? {
                  background: 'linear-gradient(135deg, #166534, #14532d)',
                  boxShadow: '0 4px 16px rgba(22,101,52,0.3)',
                }
              : { background: '#e0dcd6', color: '#a8a29e' }
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
        <div className="px-4 pb-4" style={{ background: '#fffdf5' }}>
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
            <Loader2 size={16} className="text-emerald-600 animate-spin shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-700">Doctor is thinking...</p>
              <p className="text-[10px] text-emerald-500 font-medium mt-0.5">
                Analyzing your {cropName} on Day {daysSincePlanting}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="px-4 pb-4" style={{ background: '#fffdf5' }}>
          <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-xs text-red-500 font-medium flex-1">{error}</p>
            <button
              onClick={dismissResponse}
              className="ml-2 p-1 text-red-300 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* AI Response card — amber/warm gradient */}
      {response && !isLoading && (
        <div className="px-4 pb-4" style={{ background: '#fffdf5' }}>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              border: '1.5px solid #fcd34d',
              boxShadow: '0 2px 12px rgba(245,158,11,0.12)',
            }}
          >
            {/* AI label header */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-500" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  AI Advice
                </span>
                {response.current_stage && (
                  <span className="text-[9px] text-amber-400 font-medium ml-1">
                    • {response.current_stage}
                  </span>
                )}
              </div>
              <button
                onClick={dismissResponse}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-amber-400 hover:text-amber-600 hover:bg-amber-200/50 transition-all"
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
                    className="text-xs text-amber-900 leading-relaxed font-medium"
                    style={{ marginBottom: idx < response.answer.split('\n').filter((l) => l.trim()).length - 1 ? '8px' : '0' }}
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
