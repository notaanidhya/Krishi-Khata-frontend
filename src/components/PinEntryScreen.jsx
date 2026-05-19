/**
 * PinEntryScreen — Shown when a returning user needs to enter their PIN.
 *
 * Clean, minimal design matching the WelcomeScreen aesthetic.
 * Supports error display and loading state.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sprout, Lock, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';

const PinEntryScreen = ({ userName, onLogin, isLoading, error }) => {
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

  const handleInput = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setPin(cleaned);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-6">
      <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-teal-200/30 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-xl shadow-emerald-200/50 mb-5">
            <Sprout size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Namaste, {userName || 'Kisan'} 🙏
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your PIN to continue
          </p>
        </div>

        {/* PIN Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-white/50">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={18} className="text-emerald-600" />
            <h2 className="text-base font-bold text-gray-800">
              Your 4-digit PIN
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                value={pin}
                onChange={(e) => handleInput(e.target.value)}
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
              <div className="flex items-center gap-1.5 mt-3 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertTriangle size={14} />
                <span className="text-xs font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pin.length !== 4 || isLoading}
              className={`w-full mt-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                pin.length === 4 && !isLoading
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Unlock
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Forgot your PIN? Clear app data to start fresh.
        </p>
      </div>
    </div>
  );
};

export default PinEntryScreen;
