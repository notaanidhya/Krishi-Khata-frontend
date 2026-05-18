/**
 * WelcomeScreen — first-launch name capture for ghost auth.
 *
 * A minimal, beautiful onboarding screen that asks for the user's
 * display name before granting access to the app.
 */

import React, { useState } from 'react';
import { Sprout, ArrowRight, Sparkles } from 'lucide-react';

const WelcomeScreen = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    // Small delay for polish
    setTimeout(() => {
      onRegister(name.trim());
    }, 400);
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
            Krishi Khata
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
            <Sparkles size={14} className="text-emerald-500" />
            Smart Farming, Simple Living
          </p>
        </div>

        {/* Name Input Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-white/50">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Welcome to Krishi Khata
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            What is your name?
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={50}
              autoFocus
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-base"
            />

            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className={`w-full mt-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                name.trim() && !isSubmitting
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          No account needed — your data stays on this device
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
