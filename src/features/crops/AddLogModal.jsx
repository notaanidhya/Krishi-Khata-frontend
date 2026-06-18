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

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setNote('');
      setBaseNote('');
    }
  }

  // Voice dictation logic
  useEffect(() => {
    if (isListening && transcript) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        style={{ background: 'var(--color-soil)', borderTop: '3px solid var(--color-forest)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mt-4" style={{ background: 'var(--border-subtle)' }} />

        <div className="flex items-center justify-between px-5 pt-4 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="text-lg font-bold font-serif-accent flex items-center gap-2" style={{ color: 'var(--color-ink)' }}>
            <BookOpen size={18} style={{ color: 'var(--color-forest)' }} />
            {t('crops.addLogTitle', 'Add Diary Entry')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--color-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="relative">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('crops.addLogPlaceholder', 'E.g., Sprayed neem oil today because I saw whiteflies...')}
              rows={4}
              className="w-full p-4 rounded-2xl border-2 transition-all outline-none text-base resize-none"
              style={{
                background: 'var(--color-cream)',
                borderColor: isListening ? 'var(--color-danger)' : 'var(--border-subtle)',
                color: 'var(--color-ink)',
              }}
              disabled={addLogMutation.isPending}
            />

            {isSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={addLogMutation.isPending}
                className="absolute right-3 bottom-3 p-3 rounded-full shadow-sm transition-all"
                style={
                  isListening
                    ? { background: 'var(--color-danger)', color: '#fff', boxShadow: '0 4px 12px rgba(201,74,74,0.3)' }
                    : { background: 'var(--color-forest-light)', color: 'var(--color-forest)' }
                }
                title="Voice Dictation"
              >
                {isListening ? <MicOff size={22} className="animate-pulse" /> : <Mic size={22} />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!note.trim() || addLogMutation.isPending}
              className="flex-1 py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
                boxShadow: '0 4px 20px rgba(61,90,58,0.3)',
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
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
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
