/**
 * PinEntryScreen — Shown when a returning user needs to enter their PIN.
 *
 * Refined Earth theme — warm paper bg, olive accents, subtle motion.
 * Supports error display and loading state.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeScale, fadeUp, spring } from '../components/motion/motionPresets';

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
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, var(--color-soil), var(--color-soil-dark), #e8e2d6)' }}
    >
      {/* Decorative background circles — gold / olive tints */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl" style={{ background: 'rgba(201,162,75,0.12)' }} />
      <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(107,123,79,0.10)' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          variants={fadeScale}
          initial="initial"
          animate="animate"
          transition={{ ...spring, delay: 0 }}
        >
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5"
            style={{
              background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
              boxShadow: '0 8px 32px rgba(61,90,58,0.25)',
            }}
          >
            <img src="/brand/logo-mark.svg" alt="Agroo" className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight font-serif" style={{ color: 'var(--color-ink)' }}>
            {t('pin.greeting')}, {userName?.split(' ')[0]}
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
            {t('pin.subtitle')}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="krishi-card rounded-2xl p-6"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ ...spring, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Lock size={18} style={{ color: 'var(--color-forest-muted)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
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
                className="w-full px-4 py-4 rounded-xl text-center text-2xl tracking-[0.5em] font-mono transition-all"
                style={{
                  background: 'var(--color-soil)',
                  border: '1.5px solid var(--color-border-subtle)',
                  color: 'var(--color-ink)',
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                style={{ color: 'var(--color-muted)' }}
                disabled={isLoading}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div
                className="flex items-center gap-1.5 mt-3 px-3 py-2 rounded-lg text-xs font-medium"
                style={{ color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}
              >
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pin.length !== 4 || isLoading}
              className="w-full mt-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300"
              style={
                pin.length === 4 && !isLoading
                  ? {
                      background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
                      boxShadow: '0 4px 20px rgba(61,90,58,0.3)',
                      color: '#fff',
                    }
                  : {
                      background: 'var(--color-soil-dark)',
                      color: 'var(--color-muted)',
                      cursor: 'not-allowed',
                    }
              }
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
        </motion.div>

        <motion.p
          className="text-center text-xs mt-6"
          style={{ color: 'var(--color-muted)' }}
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ ...spring, delay: 0.2 }}
        >
          {t('pin.forgotPin')}
        </motion.p>
      </div>
    </div>
  );
};

export default PinEntryScreen;
