/**
 * WelcomeScreen — first-launch onboarding with name + PIN setup.
 *
 * Step 1: Enter your name
 * Step 2: Set a 4-digit PIN (with weak PIN validation)
 * Step 3: Confirm the PIN
 *
 * Maintains the warm Krishi aesthetic.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, ArrowRight, Sparkles, Lock, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';
import { isWeakPin } from '../hooks/useGhostAuth';

const WelcomeScreen = ({ onRegister }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1=name, 2=set PIN, 3=confirm PIN
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pinInputRef = useRef(null);
  const confirmInputRef = useRef(null);

  // Auto-focus PIN inputs
  useEffect(() => {
    if (step === 2) pinInputRef.current?.focus();
    if (step === 3) confirmInputRef.current?.focus();
  }, [step]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError(t('welcome.pinExact'));
      return;
    }
    if (isWeakPin(pin)) {
      setError(t('welcome.pinWeak'));
      return;
    }
    setStep(3);
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (confirmPin !== pin) {
      setError(t('welcome.pinMismatch'));
      setConfirmPin('');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRegister(name.trim(), pin);
    } catch (err) {
      setError(err.response?.data?.detail || t('welcome.setupFailed'));
      setIsSubmitting(false);
    }
  };

  const handlePinInput = (value, setter) => {
    // Only allow digits, max 4
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setter(cleaned);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-6">
      {/* Decorative background circles */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-teal-200/30 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-xl shadow-emerald-200/50 mb-5">
            <Sprout size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {t('welcome.appName')}
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
            <Sparkles size={14} className="text-emerald-500" />
            {t('welcome.tagline')}
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'w-10 bg-emerald-500' : 'w-6 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-white/50">
          {/* ── Step 1: Name ──────────────────────── */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {t('welcome.step1Title')}
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                {t('welcome.step1Subtitle')}
              </p>
              <form onSubmit={handleNameSubmit}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('welcome.namePlaceholder')}
                  maxLength={50}
                  autoFocus
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-base"
                />
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className={`w-full mt-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                    name.trim()
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 hover:shadow-xl active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {t('welcome.next')} <ArrowRight size={16} />
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: Set PIN ───────────────────── */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Lock size={18} className="text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  {t('welcome.step2Title')}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                {t('welcome.step2Subtitle')}
              </p>
              <form onSubmit={handlePinSubmit}>
                <div className="relative">
                  <input
                    ref={pinInputRef}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => handlePinInput(e.target.value, setPin)}
                    placeholder="● ● ● ●"
                    maxLength={4}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-1.5 mt-3 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pin.length !== 4}
                  className={`w-full mt-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                    pin.length === 4
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {t('welcome.next')} <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setPin(''); setError(''); }}
                  className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {t('welcome.back')}
                </button>
              </form>
            </>
          )}

          {/* ── Step 3: Confirm PIN ──────────────── */}
          {step === 3 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Lock size={18} className="text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  {t('welcome.step3Title')}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                {t('welcome.step3Subtitle')}
              </p>
              <form onSubmit={handleConfirmSubmit}>
                <input
                  ref={confirmInputRef}
                  type="password"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
                  placeholder="● ● ● ●"
                  maxLength={4}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                />

                {error && (
                  <div className="flex items-center gap-1.5 mt-3 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={confirmPin.length !== 4 || isSubmitting}
                  className={`w-full mt-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                    confirmPin.length === 4 && !isSubmitting
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t('welcome.settingUp')}
                    </>
                  ) : (
                    <>
                      <Sprout size={16} />
                      {t('welcome.startFarming')}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(2); setConfirmPin(''); setError(''); }}
                  className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {t('welcome.back')}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {step === 1 ? t('welcome.step1Footer') : t('welcome.step2Footer')}
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
