/**
 * TransactionForm — Krishi modal redesign.
 *
 * - bg-stone-50 warm off-white modal background
 * - Deep forest green header
 * - Large rounded-xl inputs (krishi style)
 * - Save button: bg-emerald-800
 * - Serif "Add Transaction" header
 * - Conditional laborer dropdown when "Labor" category is selected
 * - Inline "+ Add New Majdoor" flow for creating laborers without leaving the form
 */

import React, { useState, useRef } from 'react';
import { X, IndianRupee, Calendar, Tag, FileText, Users, UserPlus, Loader2, Check } from 'lucide-react';
import { useActiveFarm } from '../../context/ActiveFarmContext';
import { useAddTransaction } from '../../hooks/useKhata';
import { useLaborers, useCreateLaborer } from '../../hooks/useFarm';

const EXPENSE_CATEGORIES = [
  { value: 'seeds',         label: '🌱 Seeds' },
  { value: 'fertilizer',   label: '🧪 Fertilizer' },
  { value: 'pesticide',    label: '🐛 Pesticide' },
  { value: 'labor',        label: '👷 Labor' },
  { value: 'tractor_rent', label: '🚜 Tractor Rent' },
  { value: 'equipment',    label: '🔧 Equipment' },
  { value: 'irrigation',   label: '💧 Irrigation' },
  { value: 'transport',    label: '🚚 Transport' },
  { value: 'other_expense',label: '📦 Other Expense' },
];

const INCOME_CATEGORIES = [
  { value: 'mandi_sale',   label: '🏪 Mandi Sale' },
  { value: 'subsidy',      label: '🏛️ Subsidy' },
  { value: 'other_income', label: '💰 Other Income' },
];

// ── Shared input style ─────────────────────────────────────────
const inputClass =
  'w-full px-4 py-3.5 rounded-xl text-base transition-all outline-none border-2 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-700';

const inputStyle = { background: '#fffdf9', borderColor: '#d6cfc6', color: 'var(--color-forest)' };

const ADD_NEW_VALUE = '__add_new__';
const ADD_CUSTOM_VALUE = '__add_custom__';

const TransactionForm = ({ isOpen, onClose }) => {
  const { activeFarm } = useActiveFarm();
  const addMutation = useAddTransaction();
  const createLaborerMutation = useCreateLaborer();

  const isSubmittingRef = useRef(false);

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [laborerId, setLaborerId] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Inline laborer creation state
  const [isAddingLaborer, setIsAddingLaborer] = useState(false);
  const [newLaborerName, setNewLaborerName] = useState('');

  // Fetch laborers for the active farm (only fires when farmId is truthy)
  const { data: laborers = [], isLoading: laborersLoading } = useLaborers(activeFarm?.id);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Whether the laborer dropdown should be shown
  const isLaborCategory = type === 'expense' && category === 'labor';

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory('');
    setLaborerId(''); // Clear laborer when switching type
    setIsAddingLaborer(false);
    setNewLaborerName('');
    setCustomCategoryName('');
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    if (newCategory !== ADD_CUSTOM_VALUE) {
      setCustomCategoryName('');
    }
    // Clear laborer selection when switching away from "labor"
    if (newCategory !== 'labor') {
      setLaborerId('');
      setIsAddingLaborer(false);
      setNewLaborerName('');
    }
  };

  const handleLaborerSelectChange = (value) => {
    if (value === ADD_NEW_VALUE) {
      setIsAddingLaborer(true);
      setLaborerId('');
      setNewLaborerName('');
    } else {
      setIsAddingLaborer(false);
      setNewLaborerName('');
      setLaborerId(value);
    }
  };

  const handleSaveNewLaborer = () => {
    const trimmed = newLaborerName.trim();
    if (!trimmed || !activeFarm?.id) return;

    createLaborerMutation.mutate(
      { farmId: activeFarm.id, name: trimmed },
      {
        onSuccess: (newLaborer) => {
          // Auto-select the newly created laborer and hide the input
          setLaborerId(String(newLaborer.id));
          setIsAddingLaborer(false);
          setNewLaborerName('');
        },
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (!amount || !category) return;

    const finalCategory = category === ADD_CUSTOM_VALUE ? customCategoryName.trim() : category;
    if (!finalCategory) return;

    // Build the payload
    const payload = {
      type,
      amount: parseFloat(amount),
      category: finalCategory,
      description: description.trim() || null,
      farm_id: activeFarm?.id || null,
      transaction_date: transactionDate,
    };

    // If a specific laborer is selected (not "general"), include laborer_id
    // and override the transaction type and category to "labor_wage"
    if (isLaborCategory && laborerId && laborerId !== 'general') {
      payload.laborer_id = parseInt(laborerId, 10);
      payload.type = 'labor_wage';
      payload.category = 'labor_wage';
    }

    isSubmittingRef.current = true;

    addMutation.mutate(
      payload,
      {
        onSuccess: () => {
          isSubmittingRef.current = false;
          setAmount(''); setCategory(''); setCustomCategoryName(''); setDescription(''); setLaborerId('');
          setTransactionDate(new Date().toISOString().split('T')[0]);
          setIsAddingLaborer(false);
          setNewLaborerName('');
          onClose();
        },
        onError: () => {
          isSubmittingRef.current = false;
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">

      {/* Modal Card */}
      <div
        className="w-full max-w-lg rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--color-soil)', borderTop: '3px solid #14532d' }}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-4" />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-4 pb-4 border-b"
          style={{ borderColor: '#e5e0d8' }}
        >
          <h2
            className="text-lg font-bold font-serif-accent"
            style={{ color: 'var(--color-forest)' }}
          >
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 active:bg-stone-300 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          {/* ── Type Toggle ──────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-3.5 rounded-xl font-bold text-sm transition-all ${
                type === 'expense'
                  ? 'text-white scale-[1.02]'
                  : 'text-stone-500 hover:bg-stone-200'
              }`}
              style={type === 'expense'
                ? { background: '#ef4444', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }
                : { background: '#e7e2db' }
              }
            >
              ↗ Kharcha
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-3.5 rounded-xl font-bold text-sm transition-all ${
                type === 'income'
                  ? 'text-white scale-[1.02]'
                  : 'text-stone-500 hover:bg-stone-200'
              }`}
              style={type === 'income'
                ? { background: '#166534', boxShadow: '0 4px 16px rgba(22,101,52,0.35)' }
                : { background: '#e7e2db' }
              }
            >
              ↙ Amdani
            </button>
          </div>

          {/* ── Amount ───────────────────────────────────── */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              <IndianRupee size={14} /> Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg text-stone-400">₹</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className={`${inputClass} pl-10 text-xl font-bold`}
                style={inputStyle}
              />
            </div>
          </div>

          {/* ── Category ─────────────────────────────────── */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              <Tag size={14} /> Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
              className={`${inputClass} appearance-none`}
              style={inputStyle}
            >
              <option value="" disabled>Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
              <option value={ADD_CUSTOM_VALUE} style={{ fontWeight: 'bold', color: '#166534' }}>
                ＋ Add Custom Category
              </option>
            </select>

            {/* ── Custom Category Text Input ──────────────── */}
            {category === ADD_CUSTOM_VALUE && (
              <div
                className="mt-3 animate-slide-up"
                style={{ animationDuration: '0.2s' }}
              >
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Custom Category Name
                </label>
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="e.g. Electricity, Cow Feed, Seedlings"
                  maxLength={50}
                  required
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {/* ── Laborer Dropdown (conditional) ────────────── */}
          {isLaborCategory && (
            <div
              className="animate-slide-up"
              style={{ animationDuration: '0.2s' }}
            >
              <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                <Users size={14} /> Select Laborer (Majdoor)
              </label>
              <select
                id="laborer-select"
                value={isAddingLaborer ? ADD_NEW_VALUE : laborerId}
                onChange={(e) => handleLaborerSelectChange(e.target.value)}
                className={`${inputClass} appearance-none`}
                style={inputStyle}
              >
                <option value="" disabled>
                  {laborersLoading ? 'Loading laborers…' : 'Choose a laborer…'}
                </option>
                <option value="general">🏗️ Other / General</option>
                {laborers.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    👷 {lab.name}{lab.phone_number ? ` (${lab.phone_number})` : ''}
                  </option>
                ))}
                <option value={ADD_NEW_VALUE} style={{ fontWeight: 'bold', color: '#166534' }}>
                  ＋ Add New Majdoor
                </option>
              </select>

              {/* ── Inline Laborer Creation ────────────────── */}
              {isAddingLaborer && (
                <div
                  className="mt-3 p-3.5 rounded-xl border-2 border-dashed animate-slide-up"
                  style={{
                    borderColor: '#a7c4a0',
                    background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                    animationDuration: '0.2s',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <UserPlus size={14} className="text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      New Laborer
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLaborerName}
                      onChange={(e) => setNewLaborerName(e.target.value)}
                      placeholder="Enter Laborer Name"
                      maxLength={150}
                      autoFocus
                      className={`${inputClass} flex-1 py-2.5 text-sm`}
                      style={{ ...inputStyle, background: '#ffffff', borderColor: '#a7c4a0' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveNewLaborer();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveNewLaborer}
                      disabled={!newLaborerName.trim() || createLaborerMutation.isPending}
                      className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                      style={{
                        background: 'linear-gradient(135deg, #166534, #14532d)',
                        boxShadow: '0 2px 10px rgba(22,101,52,0.3)',
                      }}
                    >
                      {createLaborerMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} strokeWidth={3} />
                      )}
                      Save
                    </button>
                  </div>
                  {createLaborerMutation.isError && (
                    <p className="text-xs text-red-500 mt-1.5 pl-1">
                      Failed to create. Please try again.
                    </p>
                  )}
                </div>
              )}

              {laborers.length === 0 && !laborersLoading && !isAddingLaborer && (
                <p className="text-xs text-stone-400 mt-1.5 pl-1">
                  No laborers registered yet. Use "+ Add New Majdoor" above or save as general labor.
                </p>
              )}
            </div>
          )}

          {/* ── Date ─────────────────────────────────────── */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              <Calendar size={14} /> Date
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* ── Note ─────────────────────────────────────── */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              <FileText size={14} /> Note (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 2 bags of DAP fertilizer"
              maxLength={255}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* ── Submit Button ─────────────────────────────── */}
          <button
            type="submit"
            disabled={
              addMutation.isPending ||
              !amount ||
              !category ||
              (category === ADD_CUSTOM_VALUE && !customCategoryName.trim())
            }
            className="w-full py-4 rounded-xl font-bold text-base text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: type === 'expense'
                ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
                : 'linear-gradient(135deg,#166534,#14532d)',
              boxShadow: type === 'expense'
                ? '0 4px 20px rgba(220,38,38,0.3)'
                : '0 4px 20px rgba(22,101,52,0.35)',
            }}
          >
            {addMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              `Save ${type === 'expense' ? 'Kharcha' : 'Amdani'}`
            )}
          </button>

          {addMutation.isError && (
            <p className="text-center text-sm text-red-500 bg-red-50 rounded-xl py-2 px-3">
              Failed to save. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
