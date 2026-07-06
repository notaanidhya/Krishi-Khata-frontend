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
import { motion } from 'framer-motion';
import { Sprout, ArrowRight, Sparkles, Lock, AlertTriangle, Loader2, Eye, EyeOff, Globe } from 'lucide-react';
import { isWeakPin } from '../hooks/useGhostAuth';
import { checkUsername } from '../api/auth';
import { fadeUp, fadeScale } from './motion/motionPresets';

const WelcomeScreen = ({ onRegister, onLogin }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language?.startsWith('en') ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };
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
      let errorMsg = t('welcome.wrongPin');
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, var(--color-soil) 0%, var(--color-soil-dark) 50%, #e8e2d6 100%)' }}>
      {/* Language Swap Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 hover:bg-white/80 backdrop-blur-md border rounded-full transition-all shadow-sm"
          style={{ background: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.5)', color: 'var(--color-ink)' }}
        >
          <Globe size={18} />
          <span className="text-sm font-bold">{i18n.language?.startsWith('en') ? 'हिंदी' : 'English'}</span>
        </button>
      </div>

      {/* Decorative background circles — Refined Earth tones */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl" style={{ background: 'rgba(201,162,75,0.15)' }} />
      <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(107,123,79,0.12)' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo & Branding */}
        <motion.div variants={fadeScale} initial="hidden" animate="show" className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl shadow-xl mb-5" style={{ background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))', boxShadow: '0 8px 32px -8px rgba(92,122,85,0.5)' }}>
            <img src="/brand/logo-mark.svg" alt="" className="w-14 h-14" />
          </div>
          <h1 className="text-3xl font-black tracking-tight font-serif-accent" style={{ color: 'var(--color-forest)' }}>
            {t('welcome.appName')}
          </h1>
          <p className="text-sm mt-1 flex items-center justify-center gap-1" style={{ color: 'var(--color-muted)' }}>
            <Sparkles size={14} style={{ color: 'var(--color-harvest)' }} />
            {t('welcome.tagline')}
          </p>
        </motion.div>

        {/* Hero illustration */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }} className="mb-6">
          <img src="/illustrations/welcome-hero.svg" alt="" aria-hidden="true" className="w-full max-w-[280px] mx-auto opacity-90" />
        </motion.div>

        {/* Step Progress */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }} className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: s <= step ? '40px' : '24px',
                background: s <= step ? 'var(--color-forest-muted)' : 'var(--color-soil-dark)',
              }}
            />
          ))}
        </motion.div>

        {/* Card */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="rounded-2xl p-6 krishi-card">
          {/* ── Step 1: Name ──────────────────────── */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-forest)' }}>
                {t('welcome.step1Title')}
              </h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>
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
                  className="w-full px-4 py-3 border rounded-xl text-base transition-all" style={{ background: 'var(--color-soil)', borderColor: 'var(--border-subtle)', color: 'var(--color-ink)' }}
                />
                <button
                  type="submit"
                  disabled={!name.trim() || isSubmitting}
                  className={`w-full mt-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                    name.trim() && !isSubmitting
                      ? 'text-white active:scale-[0.98]'
                      : 'cursor-not-allowed'
                  }`}
                  style={name.trim() && !isSubmitting ? { background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))', boxShadow: '0 4px 20px -4px rgba(92,122,85,0.5)', color: '#fff' } : { background: 'var(--color-soil-dark)', color: 'var(--color-muted)' }}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : t('welcome.next')} 
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>

                {error && (
                  <div className="flex items-center gap-1.5 mt-4 px-3 py-2 rounded-lg" style={{ color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
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
                <Lock size={18} style={{ color: 'var(--color-forest-muted)' }} />
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-forest)' }}>
                  {t('welcome.step2Title')}
                </h2>
              </div>
              <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>
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
                    className="w-full px-4 py-4 border rounded-xl text-center text-2xl tracking-[0.5em] font-mono transition-all" style={{ background: 'var(--color-soil)', borderColor: 'var(--border-subtle)', color: 'var(--color-ink)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-1.5 mt-3 px-3 py-2 rounded-lg" style={{ color: 'var(--color-warning)', background: 'var(--color-warning-soft)' }}>
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
                      : 'cursor-not-allowed'
                  }`}
                  style={pin.length === 4 ? { background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))', boxShadow: '0 4px 20px -4px rgba(92,122,85,0.5)', color: '#fff' } : { background: 'var(--color-soil-dark)', color: 'var(--color-muted)' }}
                >
                  {t('welcome.next')} <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setPin(''); setError(''); }}
                  className="w-full mt-2 py-2 text-sm transition-colors"
                  style={{ color: 'var(--color-muted)' }}
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
                <Lock size={18} style={{ color: 'var(--color-forest-muted)' }} />
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-forest)' }}>
                  {t('welcome.step3Title')}
                </h2>
              </div>
              <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>
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
                  className="w-full px-4 py-4 border rounded-xl text-center text-2xl tracking-[0.5em] font-mono transition-all" style={{ background: 'var(--color-soil)', borderColor: 'var(--border-subtle)', color: 'var(--color-ink)' }}
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
                      : 'cursor-not-allowed'
                  }`}
                  style={confirmPin.length === 4 && !isSubmitting ? { background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))', boxShadow: '0 4px 20px -4px rgba(92,122,85,0.5)', color: '#fff' } : { background: 'var(--color-soil-dark)', color: 'var(--color-muted)' }}
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
                  className="w-full mt-2 py-2 text-sm transition-colors"
                  style={{ color: 'var(--color-muted)' }}
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
                <Lock size={18} style={{ color: 'var(--color-forest-muted)' }} />
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-forest)' }}>
                  {t('welcome.loginTitle', { name: name.split(' ')[0] })}
                </h2>
              </div>
              <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>
                {t('welcome.loginSubtitle')}
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
                    className="w-full px-4 py-4 border rounded-xl text-center text-2xl tracking-[0.5em] font-mono transition-all" style={{ background: 'var(--color-soil)', borderColor: 'var(--border-subtle)', color: 'var(--color-ink)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--color-muted)' }}
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-1.5 mt-3 px-3 py-2 rounded-lg" style={{ color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
                    <AlertTriangle size={14} />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pin.length !== 4 || isSubmitting}
                  className={`w-full mt-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                    pin.length === 4 && !isSubmitting
                      ? 'active:scale-[0.98]'
                      : 'cursor-not-allowed'
                  }`}
                  style={pin.length === 4 && !isSubmitting ? { background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))', boxShadow: '0 4px 20px rgba(61,90,58,0.3)', color: '#fff' } : { background: 'var(--color-soil-dark)', color: 'var(--color-muted)' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t('welcome.unlocking')}
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      {t('welcome.unlockAccount')}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setPin(''); setError(''); }}
                  className="w-full mt-2 py-2 text-sm transition-colors"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {t('welcome.differentUser')}
                </button>
              </form>
            </>
          )}
        </motion.div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-muted)' }}>
          {step === 1 ? t('welcome.step1Footer') : t('welcome.step2Footer')}
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
