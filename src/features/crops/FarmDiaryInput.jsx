/**
 * FarmDiaryInput — Krishi redesign: ruled paper / botanical journal.
 * Submit button: deep emerald-800. Header: serif font.
 */

import React, { useState } from 'react';
import { Mic, Send, PenLine, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

const FarmDiaryInput = ({ onSubmit, isSubmitting = false, lastResult = null }) => {
  const [content, setContent] = useState('');
  const [showVoiceHint, setShowVoiceHint] = useState(false);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;
    onSubmit({ raw_content: trimmed, input_type: 'text' });
    setContent('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <div
      id="farm-diary-input"
      className="overflow-hidden rounded-2xl"
      style={{ border: '1.5px solid #d6cfc6', boxShadow: '0 2px 12px rgba(5,46,22,0.07)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2" style={{ background: '#fffdf5' }}>
        <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
          <PenLine size={16} className="text-amber-700" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold font-serif-accent" style={{ color: 'var(--color-forest)' }}>
            Smart Farm Diary
          </h4>
          <p className="text-[10px] text-stone-400 font-medium">AI-powered • अपनी भाषा में लिखें</p>
        </div>
        <div className="w-6 h-6 bg-violet-50 rounded-lg flex items-center justify-center">
          <Sparkles size={12} className="text-violet-400" />
        </div>
      </div>

      {/* Ruled-paper textarea */}
      <div className="px-4 pb-2">
        <textarea
          id="diary-text-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="आज खेत में क्या देखा? What did you observe today?"
          rows={4}
          className="w-full resize-none px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 transition-all rounded-xl"
          style={{
            background: '#fffdf5',
            backgroundImage: 'repeating-linear-gradient(transparent,transparent 27px,#e5d8c855 27px,#e5d8c855 28px)',
            border: '1px solid #e5d8c8',
            color: 'var(--color-forest)',
            lineHeight: '28px',
          }}
          disabled={isSubmitting}
        />
      </div>

      {/* AI Status */}
      {lastResult && (
        <div className="px-4 pb-2">
          {lastResult.ai_analysis_failed ? (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 animate-fade-in">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-600 font-medium">AI analysis unavailable — entry saved</p>
            </div>
          ) : lastResult.ai_extracted_stage ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 animate-fade-in">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <p className="text-[11px] text-emerald-700 font-medium">
                AI detected: <strong>{lastResult.ai_extracted_stage}</strong>
                {lastResult.ai_health_notes && ` — ${lastResult.ai_health_notes}`}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2" style={{ background: '#fffdf5' }}>
        <button
          id="diary-voice-button"
          type="button"
          onClick={() => { setShowVoiceHint(true); setTimeout(() => setShowVoiceHint(false), 2000); }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 relative"
          style={{ background: '#f0ebe4', border: '1px solid #d6cfc6', color: '#78716c' }}
          disabled={isSubmitting}
        >
          <Mic size={15} />
          <span>Voice</span>
          {showVoiceHint && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
              Coming soon! 🎙️
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-900 rotate-45 -mt-1" />
            </div>
          )}
        </button>

        <div className="flex-1" />
        {content.length > 0 && (
          <span className="text-[10px] text-stone-300 font-medium tabular-nums">{content.length}/5000</span>
        )}

        <button
          id="diary-submit-button"
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={
            content.trim() && !isSubmitting
              ? { background: 'linear-gradient(135deg,#166534,#14532d)', boxShadow: '0 4px 16px rgba(22,101,52,0.3)' }
              : { background: '#e0dcd6', color: '#a8a29e' }
          }
        >
          {isSubmitting ? (
            <><Sparkles size={14} className="animate-pulse" /><span>AI is analyzing…</span></>
          ) : (
            <><Send size={14} /><span>Submit</span></>
          )}
        </button>
      </div>
    </div>
  );
};

export default FarmDiaryInput;
