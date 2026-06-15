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
import { checkUsername } from '../api/auth';

const WelcomeScreen = ({ onRegister, onLogin }) => {
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
    if (step === 4) pinInputRef.current?.focus();
  }, [step]);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const { exists } = await checkUsername(name.trim());
      if (exists) {
        setStep(4); // Go to login
      } else {
        setStep(2); // Go to register
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || t('welcome.setupFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError(t('welcome.pinExact'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogin(name.trim(), pin);
    } catch (err) {
      let errorMsg = 'Wrong PIN. Please try again.';
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail[0].msg || errorMsg;
      }
      setError(errorMsg);
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #f5f0eb 0%, #ede8e1 50%, #e5e0d8 100%)' }}>
      {/* Decorative background circles */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-emerald-200/15 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl shadow-xl mb-5" style={{ background: 'linear-gradient(135deg, #166534, #14532d)', boxShadow: '0 8px 32px rgba(22,101,52,0.3)' }}>
            <Sprout size={36} className="text-amber-300" />
          </div>
          <h1 className="text-3xl font-black tracking-tight font-serif-accent" style={{ color: 'var(--color-forest)' }}>
            {t('welcome.appName')}
          </h1>
          <p className="text-sm text-stone-500 mt-1 flex items-center justify-center gap-1">
            <Sparkles size={14} className="text-amber-500" />
            {t('welcome.tagline')}
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'w-10 bg-emerald-700' : 'w-6 bg-stone-300'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-cream)', boxShadow: '0 4px 24px rgba(5,46,22,0.1)', border: '1.5px solid #e5e0d8' }}>
          {/* ── Step 1: Name ──────────────────────── */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-forest)' }}>
                {t('welcome.step1Title')}
              </h2>
              <p className="text-sm text-stone-500 mb-5">
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
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-600 transition-all text-base"
                />
                <button
                  type="submit"
                  disabled={!name.trim() || isSubmitting}
                  className={`w-full mt-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                    name.trim() && !isSubmitting
                      ? 'text-white active:scale-[0.98]'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                  style={name.trim() && !isSubmitting ? { background: 'linear-gradient(135deg, #166534, #14532d)', boxShadow: '0 4px 20px rgba(22,101,52,0.35)' } : {}}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : t('welcome.next')} 
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>

                {error && (
                  <div className="flex items-center gap-1.5 mt-4 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                )}
              </form>
            </>
          )}

          {/* ── Step 2: Set PIN ───────────────────── */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Lock size={18} className="text-emerald-600" />
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-forest)' }}>
                  {t('welcome.step2Title')}
                </h2>
              </div>
              <p className="text-sm text-stone-500 mb-5">
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
                    className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-center text-2xl tracking-[0.5em] font-mono placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
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
                      ? 'text-white active:scale-[0.98]'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                  style={pin.length === 4 ? { background: 'linear-gradient(135deg, #166534, #14532d)', boxShadow: '0 4px 20px rgba(22,101,52,0.35)' } : {}}
                >
                  {t('welcome.next')} <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setPin(''); setError(''); }}
                  className="w-full mt-2 py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
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
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-forest)' }}>
                  {t('welcome.step3Title')}
                </h2>
              </div>
              <p className="text-sm text-stone-500 mb-5">
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
                  className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-center text-2xl tracking-[0.5em] font-mono placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-600 transition-all"
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
                      ? 'text-white active:scale-[0.98]'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                  style={confirmPin.length === 4 && !isSubmitting ? { background: 'linear-gradient(135deg, #166534, #14532d)', boxShadow: '0 4px 20px rgba(22,101,52,0.35)' } : {}}
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
                  className="w-full mt-2 py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {t('welcome.back')}
                </button>
              </form>
            </>
          )}

          {/* ── Step 4: Login PIN ──────────────── */}
          {step === 4 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Lock size={18} className="text-emerald-600" />
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-forest)' }}>
                  Welcome back, {name.split(' ')[0]}!
                </h2>
              </div>
              <p className="text-sm text-stone-500 mb-5">
                Enter your PIN to unlock your account.
              </p>
              <form onSubmit={handleLoginSubmit}>
                <div className="relative">
                  <input
                    ref={pinInputRef}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => handlePinInput(e.target.value, setPin)}
                    placeholder="● ● ● ●"
                    maxLength={4}
                    className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-center text-2xl tracking-[0.5em] font-mono placeholder-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-1.5 mt-3 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pin.length !== 4 || isSubmitting}
                  className={`w-full mt-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                    pin.length === 4 && !isSubmitting
                      ? 'text-white active:scale-[0.98]'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                  style={pin.length === 4 && !isSubmitting ? { background: 'linear-gradient(135deg, #166534, #14532d)', boxShadow: '0 4px 20px rgba(22,101,52,0.35)' } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Unlock Account
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setPin(''); setError(''); }}
                  className="w-full mt-2 py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Different User
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          {step === 1 ? t('welcome.step1Footer') : t('welcome.step2Footer')}
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
