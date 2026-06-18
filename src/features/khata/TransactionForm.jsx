/**
 * TransactionForm — Krishi modal redesign.
 *
 * Refined Earth theme:
 * - warm soil bg modal background
 * - Forest green header accents
 * - Large rounded-xl inputs (krishi style)
 * - Save button: forest-mid → forest gradient (income) / danger gradient (expense)
 * - Serif "Add Transaction" header
 * - Conditional laborer dropdown when "Labor" category is selected
 * - Inline "+ Add New Majdoor" flow for creating laborers without leaving the form
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, IndianRupee, Calendar, Tag, FileText, Users, UserPlus, Loader2, Check, Mic, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useActiveFarm } from '../../context/ActiveFarmContext';
import { useAddTransaction, useUpdateTransaction } from '../../hooks/useKhata';
import { useLaborers, useCreateLaborer } from '../../hooks/useFarm';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import useModalAnimation from '../../hooks/useModalAnimation';

const EXPENSE_CATEGORIES = [
  { value: 'seeds',         icon: '🌱' },
  { value: 'fertilizer',    icon: '🧪' },
  { value: 'pesticide',     icon: '🐛' },
  { value: 'tractor_rent',  icon: '🚜' },
  { value: 'equipment',     icon: '🔧' },
  { value: 'irrigation',    icon: '💧' },
  { value: 'transport',     icon: '🚚' },
  { value: 'other_expense', icon: '📦' },
];

const INCOME_CATEGORIES = [
  { value: 'mandi_sale',   icon: '🏪' },
  { value: 'subsidy',      icon: '🏛️' },
  { value: 'other_income', icon: '💰' },
];

// ── Shared input style ─────────────────────────────────────────
const inputClass =
  'w-full px-4 py-3.5 rounded-xl text-base transition-all outline-none border-2 focus:ring-2';

const inputStyle = {
  background: 'var(--color-cream)',
  borderColor: 'var(--border-subtle)',
  color: 'var(--color-ink)',
};

const ADD_NEW_VALUE = '__add_new__';
const ADD_CUSTOM_VALUE = '__add_custom__';

const TransactionForm = ({ isOpen, onClose, initialData = null, isLaborMode = false }) => {
  const { t } = useTranslation();
  const { activeFarm } = useActiveFarm();
  const { mounted, animating } = useModalAnimation(isOpen, 380);
  const addMutation = useAddTransaction();
  const updateMutation = useUpdateTransaction();
  const createLaborerMutation = useCreateLaborer();
  
  const { isSupported, isListening, transcript, startListening, stopListening } = useVoiceInput();

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
  
  const [baseDescription, setBaseDescription] = useState('');

  // Inline laborer creation state
  const [isAddingLaborer, setIsAddingLaborer] = useState(false);
  const [newLaborerName, setNewLaborerName] = useState('');
  const [localNewLaborer, setLocalNewLaborer] = useState(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  // Populate from initialData for editing
  if (isOpen !== prevIsOpen || initialData !== prevInitialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);
    if (isOpen) {
      if (initialData) {
        setType(initialData.type === 'labor_wage' ? 'expense' : initialData.type || 'expense');
        setAmount(initialData.amount ? String(initialData.amount) : '');
        
        let initCat = initialData.category === 'labor_wage' ? 'labor' : initialData.category;
        const allPredefined = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map(c => c.value);
        if (initCat && !allPredefined.includes(initCat)) {
          setCategory(ADD_CUSTOM_VALUE);
          setCustomCategoryName(initCat);
        } else {
          setCategory(initCat || '');
          setCustomCategoryName('');
        }
        
        setLaborerId(initialData.laborer_id ? String(initialData.laborer_id) : '');
        setDescription(initialData.description || '');
        setTransactionDate(initialData.transaction_date || new Date().toISOString().split('T')[0]);
      } else {
        if (isLaborMode) {
          setType('expense');
          setCategory('labor');
        } else {
          setType('expense');
          setCategory('');
        }
        setAmount('');
        setCustomCategoryName('');
        setLaborerId('');
        setDescription('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
      }
      setIsAddingLaborer(false);
      setNewLaborerName('');
    }
  }
  
  // Voice input handling
   
  useEffect(() => {
    if (isListening && transcript) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDescription(baseDescription ? `${baseDescription} ${transcript}` : transcript);
    }
  }, [transcript, isListening, baseDescription]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setBaseDescription(description);
      startListening('hi-IN');
    }
  };


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

  const handleSaveNewLaborer = async () => {
    const trimmed = newLaborerName.trim();
    if (!trimmed || !activeFarm?.id) return;

    try {
      const newLaborer = await createLaborerMutation.mutateAsync({ farmId: activeFarm.id, name: trimmed });
      // Store locally to ensure perfect UI transition even if cache is delayed
      setLocalNewLaborer(newLaborer);
      setLaborerId(String(newLaborer.id));
      setIsAddingLaborer(false);
      setNewLaborerName('');
    } catch (error) {
      console.error('Failed to create laborer', error);
    }
  };

  const handleSubmit = async (e) => {
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

    try {
      if (initialData) {
        updateMutation.mutate({ id: initialData.id, data: payload });
        isSubmittingRef.current = false;
        onClose();
      } else {
        addMutation.mutate(payload);
        isSubmittingRef.current = false;
        setAmount(''); setCategory(''); setCustomCategoryName(''); setDescription(''); setLaborerId('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setIsAddingLaborer(false);
        setNewLaborerName('');
        onClose();
      }
    } catch (error) {
      isSubmittingRef.current = false;
    }
  };

  if (!mounted) return null;

  return (
    /* Backdrop */
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm modal-backdrop ${animating ? 'modal-open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >

      {/* Modal Card */}
      <div
        className={`w-full max-w-lg rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto modal-sheet ${animating ? 'modal-open' : ''}`}
        style={{ background: 'var(--color-soil)', borderTop: '3px solid var(--color-forest)' }}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full mx-auto mt-4" style={{ background: 'var(--border-subtle)' }} />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-4 pb-4 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2
            className="text-lg font-bold font-serif-accent"
            style={{ color: 'var(--color-ink)' }}
          >
            {initialData ? t('khata.form.editTitle', 'Edit Transaction') : t('khata.form.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--color-muted)' }}
            aria-label={t('khata.form.close')}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          {/* ── Type Toggle ──────────────────────────────── */}
          {!isLaborMode && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-3.5 rounded-xl font-bold text-sm transition-all ${
                  type === 'expense'
                    ? 'text-white scale-[1.02]'
                    : 'hover:opacity-80'
                }`}
                style={type === 'expense'
                  ? { background: 'var(--color-danger)', boxShadow: '0 4px 16px rgba(201,74,74,0.3)', color: '#fff' }
                  : { background: 'var(--color-soil-dark)', color: 'var(--color-muted)' }
                }
              >
                ↗ {t('khata.form.kharcha')}
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-3.5 rounded-xl font-bold text-sm transition-all ${
                  type === 'income'
                    ? 'text-white scale-[1.02]'
                    : 'hover:opacity-80'
                }`}
                style={type === 'income'
                  ? { background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))', boxShadow: '0 4px 16px rgba(61,90,58,0.3)', color: '#fff' }
                  : { background: 'var(--color-soil-dark)', color: 'var(--color-muted)' }
                }
              >
                ↙ {t('khata.form.amdani')}
              </button>
            </div>
          )}

          {/* ── Amount ───────────────────────────────────── */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
              <IndianRupee size={14} /> {t('khata.form.amount')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg" style={{ color: 'var(--color-muted)' }}>₹</span>
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
          {!isLaborMode && (
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
              <Tag size={14} /> {t('khata.form.category')}
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
              className={`${inputClass} appearance-none`}
              style={inputStyle}
            >
              <option value="" disabled>{t('khata.form.selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.icon} {t(`khata.categories.${cat.value}`)}</option>
              ))}
              <option value={ADD_CUSTOM_VALUE} style={{ fontWeight: 'bold', color: 'var(--color-forest)' }}>
                {t('khata.form.addCustomCategory')}
              </option>
            </select>

            {/* ── Custom Category Text Input ──────────────── */}
            {category === ADD_CUSTOM_VALUE && (
              <div
                className="mt-3 animate-slide-up"
                style={{ animationDuration: '0.2s' }}
              >
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                  {t('khata.form.customCategoryName')}
                </label>
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder={t('khata.form.customPlaceholder')}
                  maxLength={50}
                  required
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            )}
          </div>
          )}

          {/* ── Laborer Dropdown (conditional) ────────────── */}
          {isLaborCategory && (
            <div
              className="animate-slide-up"
              style={{ animationDuration: '0.2s' }}
            >
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                <Users size={14} /> {t('khata.form.selectLaborer')}
              </label>
              <select
                id="laborer-select"
                value={isAddingLaborer ? ADD_NEW_VALUE : laborerId}
                onChange={(e) => handleLaborerSelectChange(e.target.value)}
                className={`${inputClass} appearance-none`}
                style={inputStyle}
              >
                <option value="" disabled>
                  {laborersLoading ? t('khata.form.loadingLaborers') : t('khata.form.chooseLaborer')}
                </option>
                <option value="general">🏗️ {t('khata.form.otherGeneral')}</option>
                {/* Dynamically inject the newly selected laborer if it hasn't propagated from cache yet */}
                {localNewLaborer && !laborers.some(l => String(l.id) === String(localNewLaborer.id)) && (
                  <option value={String(localNewLaborer.id)}>
                    👷 {localNewLaborer.name}
                  </option>
                )}
                {laborers.map((lab) => (
                  <option key={lab.id} value={String(lab.id)}>
                    👷 {lab.name}{lab.phone_number ? ` (${lab.phone_number})` : ''}
                  </option>
                ))}
                <option value={ADD_NEW_VALUE} style={{ fontWeight: 'bold', color: 'var(--color-forest)' }}>
                  {t('khata.form.addNewMajdoor')}
                </option>
              </select>

              {/* ── Inline Laborer Creation ────────────────── */}
              {isAddingLaborer && (
                <div
                  className="mt-3 p-3.5 rounded-xl border-2 border-dashed animate-slide-up"
                  style={{
                    borderColor: 'var(--color-forest-muted)',
                    background: 'var(--color-forest-light)',
                    animationDuration: '0.2s',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <UserPlus size={14} style={{ color: 'var(--color-forest)' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-forest)' }}>
                      {t('khata.form.newLaborer')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLaborerName}
                      onChange={(e) => setNewLaborerName(e.target.value)}
                      placeholder={t('khata.form.laborerNamePlaceholder')}
                      maxLength={150}
                      autoFocus
                      className={`${inputClass} flex-1 py-2.5 text-sm`}
                      style={{ ...inputStyle, background: 'var(--color-cream)', borderColor: 'var(--color-forest-muted)' }}
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
                        background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
                        boxShadow: '0 2px 10px rgba(61,90,58,0.3)',
                      }}
                    >
                      {createLaborerMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} strokeWidth={3} />
                      )}
                      {t('khata.form.save')}
                    </button>
                  </div>
                  {createLaborerMutation.isError && (
                    <p className="text-xs mt-1.5 pl-1" style={{ color: 'var(--color-danger)' }}>
                      {t('khata.form.createFailed')}
                    </p>
                  )}
                </div>
              )}

              {laborers.length === 0 && !laborersLoading && !isAddingLaborer && (
                <p className="text-xs mt-1.5 pl-1" style={{ color: 'var(--color-muted)' }}>
                  {t('khata.form.noLaborers')}
                </p>
              )}
            </div>
          )}

          {/* ── Date ─────────────────────────────────────── */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
              <Calendar size={14} /> {t('khata.form.date')}
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
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
              <FileText size={14} /> {t('khata.form.noteOptional')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('khata.form.notePlaceholder')}
                maxLength={255}
                className={`${inputClass} ${isSupported ? 'pr-12' : ''}`}
                style={inputStyle}
              />
              {isSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                    isListening 
                      ? 'animate-pulse' 
                      : ''
                  }`}
                  style={isListening
                    ? { background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }
                    : { color: 'var(--color-forest-muted)' }
                  }
                  title="Voice input"
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
            </div>
          </div>

          {/* ── Submit Button ─────────────────────────────── */}
          <button
            type="submit"
            disabled={
              addMutation.isPending || updateMutation.isPending ||
              !amount ||
              !category ||
              (category === ADD_CUSTOM_VALUE && !customCategoryName.trim()) ||
              isAddingLaborer ||
              (isLaborMode && (!laborerId || laborerId === 'general' || laborerId === ADD_NEW_VALUE))
            }
            className="w-full py-4 rounded-xl font-bold text-base text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: type === 'expense'
                ? 'linear-gradient(135deg, var(--color-danger), #a33a3a)'
                : 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
              boxShadow: type === 'expense'
                ? '0 4px 20px rgba(201,74,74,0.3)'
                : '0 4px 20px rgba(61,90,58,0.3)',
            }}
          >
            {addMutation.isPending || updateMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {t('khata.form.saving')}
              </span>
            ) : (
              isLaborMode ? t('labor.addWage', 'Save Labor Wage') :
              initialData 
                ? t('khata.form.update', 'Update') 
                : (type === 'expense' ? t('khata.form.saveKharcha') : t('khata.form.saveAmdani'))
            )}
          </button>

          {(addMutation.isError || updateMutation.isError) && (
            <p className="text-center text-sm rounded-xl py-2 px-3" style={{ color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
              {t('khata.form.saveFailed')}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
