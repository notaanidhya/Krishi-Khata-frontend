import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Loader2, BookOpen, Send, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAddCropLog } from '../../hooks/useCrop';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import useModalAnimation from '../../hooks/useModalAnimation';

const AddLogModal = ({ isOpen, onClose, cropId }) => {
  const { t } = useTranslation();
  const { mounted, animating } = useModalAnimation(isOpen, 380);
  const addLogMutation = useAddCropLog();
  const { isSupported, isListening, transcript, startListening, stopListening } = useVoiceInput();

  const [note, setNote] = useState('');
  const [baseNote, setBaseNote] = useState('');

  // Clear note on open/close
  useEffect(() => {
    if (isOpen) {
      setNote('');
      setBaseNote('');
    }
  }, [isOpen]);

  // Voice dictation logic
  useEffect(() => {
    if (isListening && transcript) {
      setNote(baseNote ? `${baseNote} ${transcript}` : transcript);
    }
  }, [transcript, isListening, baseNote]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setBaseNote(note);
      startListening('hi-IN');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim() || !cropId) return;

    addLogMutation.mutate(
      {
        cropId,
        logData: {
          raw_content: note.trim(),
          input_type: 'text',
          log_date: new Date().toISOString().split('T')[0],
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm modal-backdrop ${animating ? 'modal-open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full max-w-lg rounded-t-3xl shadow-2xl modal-sheet ${animating ? 'modal-open' : ''}`}
        style={{ background: 'var(--color-soil)', borderTop: '3px solid #14532d' }}
      >
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-4" />

        <div className="flex items-center justify-between px-5 pt-4 pb-4 border-b border-stone-200/60">
          <h2 className="text-lg font-bold font-serif-accent text-emerald-900 flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-700" />
            {t('crops.addLogTitle', 'Add Diary Entry')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 active:bg-stone-300 transition-colors"
          >
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="relative">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('crops.addLogPlaceholder', 'E.g., Sprayed neem oil today because I saw whiteflies...')}
              rows={4}
              className={`w-full p-4 rounded-2xl border-2 transition-all outline-none text-base resize-none ${
                isListening ? 'border-red-300 focus:border-red-400 bg-red-50/30' : 'border-[#d6cfc6] focus:border-emerald-600 bg-[#fffdf9]'
              }`}
              style={{ color: 'var(--color-forest)' }}
              disabled={addLogMutation.isPending}
            />
            
            {isSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={addLogMutation.isPending}
                className={`absolute right-3 bottom-3 p-3 rounded-full shadow-sm transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-md hover:bg-red-600' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
                title="Voice Dictation"
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!note.trim() || addLogMutation.isPending}
              className="flex-1 py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #166534, #14532d)',
                boxShadow: '0 4px 20px rgba(22,101,52,0.35)',
              }}
            >
              {addLogMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {t('crops.saveLog', 'Save to Diary')}
            </button>
          </div>

          {addLogMutation.isError && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm">
              <AlertCircle size={16} />
              <p>{t('crops.saveFailed', 'Failed to save log.')}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddLogModal;
