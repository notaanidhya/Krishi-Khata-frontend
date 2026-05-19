/**
 * EmptyFarmState — Shown when a new user has no farms.
 *
 * Beautiful, centered call-to-action with a warm earthy design.
 * Encourages the user to create their first farm.
 */

import React from 'react';
import { Sprout, Plus, Tractor } from 'lucide-react';

const EmptyFarmState = ({ onCreateFarm }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      {/* Decorative Icon Group */}
      <div className="relative mb-8">
        {/* Outer glow ring */}
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
            boxShadow: '0 0 60px rgba(22,101,52,0.12)',
          }}
        >
          {/* Inner circle with icon */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #166534, #14532d)',
              boxShadow: '0 8px 32px rgba(22,101,52,0.35)',
            }}
          >
            <Tractor size={42} className="text-white" />
          </div>
        </div>

        {/* Floating sprout icons */}
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-100 animate-float-slow">
          <Sprout size={18} className="text-amber-600" />
        </div>
        <div className="absolute -bottom-1 -left-3 w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-100 animate-float-medium">
          <Sprout size={14} className="text-emerald-600" />
        </div>

        {/* Animated dashed orbit */}
        <div
          className="absolute inset-[-12px] border-2 border-dashed border-emerald-200/50 rounded-full animate-spin"
          style={{ animationDuration: '25s' }}
        />
      </div>

      {/* Welcome Text */}
      <h2
        className="text-2xl font-bold font-serif-accent mb-3 leading-tight"
        style={{ color: 'var(--color-forest)' }}
      >
        Welcome to Krishi Khata!
      </h2>
      <p className="text-sm text-stone-500 font-medium max-w-xs leading-relaxed mb-8">
        Create your first farm to start tracking your crops and expenses.
        Your entire farming journey starts here. 🌾
      </p>

      {/* CTA Button */}
      <button
        onClick={onCreateFarm}
        className="flex items-center gap-2.5 px-8 py-4 text-white font-bold text-base rounded-2xl transition-all active:scale-[0.97] animate-fab-pulse"
        style={{
          background: 'linear-gradient(135deg, #166534, #14532d)',
          boxShadow: '0 8px 32px rgba(22,101,52,0.45)',
        }}
      >
        <Plus size={22} strokeWidth={3} />
        Create My First Farm
      </button>

      {/* Subtle note */}
      <p className="text-[11px] text-stone-300 mt-4 font-medium">
        You can add more farms later from the top bar
      </p>
    </div>
  );
};

export default EmptyFarmState;
