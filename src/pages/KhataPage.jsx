/**
 * KhataPage — "The Digital Bahi-Khata" Krishi redesign.
 *
 * - bg-stone-50 warm background
 * - Tab toggle: "General Hisab" | "Labor Hisab"
 * - Premium dark forest green Net Profit card (emerald-950)
 * - Massive clean white numbers on dark card
 * - Serif "Mera Hisab" screen title
 * - Clean transaction list with precise red/green indicators
 * - Add Transaction button: deep emerald-800
 */

import { useState } from 'react';
import {
  Plus, TrendingUp, TrendingDown, Wallet,
  Trash2, Loader2, AlertCircle, BookOpen, Users, Edit2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useActiveFarm } from '../context/ActiveFarmContext';
import { useTransactions, useSummary, useDeleteTransaction } from '../hooks/useKhata';
import TransactionForm from '../features/khata/TransactionForm';
import LaborDashboard from '../features/khata/LaborDashboard';

// ── Category label + emoji map ─────────────────────────────────
const CATEGORY_META = {
  seeds:         { label: 'Seeds',        icon: '🌱' },
  fertilizer:    { label: 'Fertilizer',   icon: '🧪' },
  pesticide:     { label: 'Pesticide',    icon: '🐛' },
  labor:         { label: 'Labor',        icon: '👷' },
  labor_wage:    { label: 'Labor Wage',   icon: '👷' },
  labor_payment: { label: 'Labor Payment',icon: '💸' },
  tractor_rent:  { label: 'Tractor Rent', icon: '🚜' },
  equipment:     { label: 'Equipment',    icon: '🔧' },
  irrigation:    { label: 'Irrigation',   icon: '💧' },
  transport:     { label: 'Transport',    icon: '🚚' },
  other_expense: { label: 'Other',        icon: '📦' },
  mandi_sale:    { label: 'Mandi Sale',   icon: '🏪' },
  subsidy:       { label: 'Subsidy',      icon: '🏛️' },
  other_income:  { label: 'Other Income', icon: '💰' },
};

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const formatDate = (dateStr, language = 'en') =>
  new Date(dateStr).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ═══════════════════════════════════════════════════════════════
//  TAB TOGGLE — "General Hisab" | "Labor Hisab"
// ═══════════════════════════════════════════════════════════════
const TabToggle = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const isLabor = activeTab === 'labor';
  return (
  <div
    className="flex rounded-xl p-1 gap-1 relative"
    style={{ background: '#e7e2db' }}
  >
    {/* Sliding pill indicator */}
    <div
      className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out"
      style={{
        left: isLabor ? 'calc(50% + 2px)' : '4px',
        width: 'calc(50% - 6px)',
        background: isLabor
          ? 'linear-gradient(135deg, #1e1b4b, #312e81)'
          : 'linear-gradient(135deg, #166534, #14532d)',
        boxShadow: isLabor
          ? '0 2px 12px rgba(30,27,75,0.3)'
          : '0 2px 12px rgba(22,101,52,0.3)',
      }}
    />
    <button
      onClick={() => onTabChange('general')}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-sm transition-colors duration-300 relative z-10 ${
        activeTab === 'general'
          ? 'text-white'
          : 'text-stone-500 hover:text-stone-700'
      }`}
    >
      <BookOpen size={16} strokeWidth={activeTab === 'general' ? 2.5 : 2} />
      {t('khata.generalTab')}
    </button>
    <button
      onClick={() => onTabChange('labor')}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-sm transition-colors duration-300 relative z-10 ${
        activeTab === 'labor'
          ? 'text-white'
          : 'text-stone-500 hover:text-stone-700'
      }`}
    >
      <Users size={16} strokeWidth={activeTab === 'labor' ? 2.5 : 2} />
      {t('khata.laborTab')}
    </button>
  </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SUMMARY CARD — Deep matte forest green, massive numbers
// ═══════════════════════════════════════════════════════════════
const SummaryCard = ({ summary, isLoading }) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-5 text-white animate-pulse"
        style={{ background: 'linear-gradient(135deg, #052e16, #14532d)', boxShadow: '0 8px 40px rgba(5,46,22,0.4)' }}
      >
        <div className="h-6 bg-white/20 rounded w-1/2 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-white/10 rounded-xl" />
          <div className="h-16 bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  const data = summary || { total_income: 0, total_expense: 0, net_profit: 0 };

  return (
    <div
      className="rounded-2xl p-5 text-white"
      style={{
        background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
        boxShadow: '0 8px 40px rgba(5,46,22,0.4)',
      }}
    >
      {/* Net Profit */}
      <div className="flex items-center gap-2 mb-1">
        <Wallet size={18} className="text-amber-300" />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(253,230,138,0.8)' }}>
          {t('khata.myProfit')}
        </span>
      </div>
      <p className={`text-4xl font-black mb-5 tracking-tight ${data.net_profit < 0 ? 'text-red-300' : 'text-white'}`}>
        {formatINR(data.net_profit)}
      </p>

      {/* Income / Expense Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(4px)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp size={14} className="text-emerald-300" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-200">{t('khata.income')}</span>
          </div>
          <p className="text-xl font-bold text-white">{formatINR(data.total_income)}</p>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(4px)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingDown size={14} className="text-red-300" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-red-200">{t('khata.kharcha')}</span>
          </div>
          <p className="text-xl font-bold text-white">{formatINR(data.total_expense)}</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  TRANSACTION CARD — Clean, precise red/green indicators
// ═══════════════════════════════════════════════════════════════
const TransactionCard = ({ txn, onEdit, onDelete, isDeleting }) => {
  const { t, i18n } = useTranslation();
  const meta = CATEGORY_META[txn.category] || { label: txn.category, icon: '📋' };
  const catLabel = t(`khata.categories.${txn.category}`, { defaultValue: meta.label });
  const isExpense = txn.type === 'expense' || txn.type === 'labor_wage';

  return (
    <div
      className="krishi-card flex items-center gap-3 p-4 tactile"
      style={{ borderLeft: `4px solid ${isExpense ? '#ef4444' : '#16a34a'}` }}
    >
      {/* Category Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: isExpense ? '#fff1f2' : '#f0fdf4' }}
      >
        {meta.icon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate" style={{ color: 'var(--color-forest)' }}>{catLabel}</p>
        {txn.description && (
          <p className="text-xs text-stone-400 truncate">{txn.description}</p>
        )}
        <p className="text-[11px] text-stone-400 mt-0.5">{formatDate(txn.transaction_date, i18n.language)}</p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className={`font-extrabold text-base ${isExpense ? 'text-red-500' : 'text-emerald-700'}`}>
          {isExpense ? '−' : '+'}{formatINR(txn.amount)}
        </p>
      </div>

      {/* Edit & Delete Buttons */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(txn)}
          disabled={isDeleting}
          className="p-2 rounded-lg hover:bg-stone-100 active:bg-stone-200 transition-colors"
          aria-label={t('khata.editLabel', 'Edit')}
        >
          <Edit2 size={16} className="text-stone-400 hover:text-emerald-700 transition-colors" />
        </button>
        <button
          onClick={() => onDelete(txn.id)}
          disabled={isDeleting}
          className="p-2 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
          aria-label={t('khata.deleteLabel')}
        >
          {isDeleting ? (
            <Loader2 size={16} className="text-red-400 animate-spin" />
          ) : (
            <Trash2 size={16} className="text-stone-300 hover:text-red-400 transition-colors" />
          )}
        </button>
      </div>
    </div>
  );
};

// ── Empty State ────────────────────────────────────────────────
const EmptyState = () => {
  const { t } = useTranslation();
  return (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: '#ecfdf5' }}
    >
      <BookOpen size={28} className="text-emerald-600" />
    </div>
    <h3 className="font-bold mb-1" style={{ color: 'var(--color-forest)' }}>{t('khata.emptyTitle')}</h3>
    <p className="text-sm text-stone-400 max-w-[240px]">
      {t('khata.emptyText')}
    </p>
  </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  KHATA PAGE
// ═══════════════════════════════════════════════════════════════
const KhataPage = () => {
  const { t } = useTranslation();
  const { activeFarm } = useActiveFarm();
  const farmId = activeFarm?.id || null;

  const [activeTab, setActiveTab] = useState('general');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: transactions = [], isLoading: txnLoading, isError: txnError } = useTransactions(farmId);
  const { data: summary, isLoading: summaryLoading } = useSummary(farmId);
  const deleteMutation = useDeleteTransaction();

  const handleDelete = (id) => {
    setDeletingId(id);
    deleteMutation.mutate(id, { onSettled: () => setDeletingId(null) });
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5 pb-28 animate-page-enter">

      {/* ── Screen Title (Serif) ──────────────────────────── */}
      <h1
        className="text-2xl font-bold font-serif-accent leading-tight"
        style={{ color: 'var(--color-forest)' }}
      >
        {t('khata.title')}
      </h1>

      {/* ── Tab Toggle ────────────────────────────────────── */}
      <TabToggle activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── General Hisab Tab ─────────────────────────────── */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          {/* ── Summary Card ─────────────────────────────────── */}
          <SummaryCard summary={summary} isLoading={summaryLoading} />

          {/* ── Add Transaction Button ───────────────────────── */}
          <button
            onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
            className="w-full py-4 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #166534, #14532d)',
              boxShadow: '0 4px 20px rgba(22,101,52,0.35)',
            }}
          >
            <Plus size={20} strokeWidth={3} />
            {t('khata.addTransaction')}
          </button>

          {/* ── Transaction List ─────────────────────────────── */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              {t('khata.recentEntries')}
            </h2>

            {txnLoading && (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="text-emerald-700 animate-spin" />
              </div>
            )}

            {txnError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100">
                <AlertCircle size={18} />
                <p className="text-sm">{t('khata.errorLoad')}</p>
              </div>
            )}

            {!txnLoading && !txnError && transactions.length === 0 && <EmptyState />}

            {!txnLoading && !txnError && transactions.length > 0 && (
              <div className="space-y-3">
                {transactions.map((txn, index) => (
                  <div
                    key={txn.id}
                    className="animate-list-item"
                    style={{ '--item-index': index }}
                  >
                    <TransactionCard
                      txn={txn}
                      onEdit={(t) => { setEditingTransaction(t); setIsFormOpen(true); }}
                      onDelete={handleDelete}
                      isDeleting={deletingId === txn.id}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Labor Hisab Tab ───────────────────────────────── */}
      {activeTab === 'labor' && <LaborDashboard />}

      {/* ── Transaction Form Modal ───────────────────────── */}
      <TransactionForm 
        isOpen={isFormOpen} 
        initialData={editingTransaction}
        onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }} 
      />
    </div>
  );
};

export default KhataPage;
