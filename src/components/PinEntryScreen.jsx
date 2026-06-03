/**
 * PinEntryScreen — Shown when a returning user needs to enter their PIN.
 *
 * Clean, minimal design matching the WelcomeScreen aesthetic.
 * Supports error display and loading state.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Lock, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';

const PinEntryScreen = ({ userName, onLogin, isLoading, error }) => {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    try {
      await onLogin(pin);
    } catch {
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handlePinInput = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setPin(cleaned);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #f5f0eb 0%, #ede8e1 50%, #e5e0d8 100%)' }}>
      {/* Decorative background circles */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-emerald-200/15 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl shadow-xl mb-5" style={{ background: 'linear-gradient(135deg, #166534, #14532d)', boxShadow: '0 8px 32px rgba(22,101,52,0.3)' }}>
            <Sprout size={36} className="text-amber-300" />
          </div>
          <h1 className="text-3xl font-black tracking-tight font-serif" style={{ color: 'var(--color-forest, #064e3b)' }}>
            {t('pin.greeting')}, {userName?.split(' ')[0]}
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            {t('pin.subtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-cream, #ffffff)', boxShadow: '0 4px 24px rgba(5,46,22,0.1)', border: '1.5px solid #e5e0d8' }}>
          <div className="flex items-center gap-2 mb-6">
            <Lock size={18} className="text-emerald-600" />
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-forest, #064e3b)' }}>
              {t('pin.enterPin')}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinInput(e.target.value)}
                placeholder="● ● ● ●"
                maxLength={4}
                className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-center text-2xl tracking-[0.5em] font-mono placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-600 transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                disabled={isLoading}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 mt-3 text-red-700 bg-red-50 px-3 py-2 rounded-lg">
                <AlertTriangle size={14} />
                <span className="text-xs font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pin.length !== 4 || isLoading}
              className={`w-full mt-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                pin.length === 4 && !isLoading
                  ? 'text-white active:scale-[0.98]'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
              style={pin.length === 4 && !isLoading ? { background: 'linear-gradient(135deg, #166534, #14532d)', boxShadow: '0 4px 20px rgba(22,101,52,0.35)' } : {}}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t('pin.verifying')}
                </>
              ) : (
                <>
                  <Lock size={16} />
                  {t('pin.unlock')}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          {t('pin.forgotPin')}
        </p>
      </div>
    </div>
  );
};

export default PinEntryScreen;
