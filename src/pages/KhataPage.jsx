import { useState } from 'react';
import {
  Plus, TrendingUp, TrendingDown, Wallet,
  Trash2, Loader2, AlertCircle, BookOpen, Users, Edit2, CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import { useActiveFarm } from '../context/ActiveFarmContext';
import { useTransactions, useSummary, useDeleteTransaction } from '../hooks/useKhata';
import TransactionForm from '../features/khata/TransactionForm';
import LaborDashboard from '../features/khata/LaborDashboard';
import PageShell from '../components/layout/PageShell';
import EmptyStateUI from '../components/ui/EmptyState';
import { staggerContainer, fadeUp } from '../components/motion/motionPresets';

const CATEGORY_META = {
  seeds: { label: 'Seeds', icon: '🌱' },
  fertilizer: { label: 'Fertilizer', icon: '🧪' },
  pesticide: { label: 'Pesticide', icon: '🐛' },
  labor: { label: 'Labor', icon: '👷' },
  labor_wage: { label: 'Labor Wage', icon: '👷' },
  labor_payment: { label: 'Labor Payment', icon: '💸' },
  tractor_rent: { label: 'Tractor Rent', icon: '🚜' },
  equipment: { label: 'Equipment', icon: '🔧' },
  irrigation: { label: 'Irrigation', icon: '💧' },
  transport: { label: 'Transport', icon: '🚚' },
  other_expense: { label: 'Other', icon: '📦' },
  mandi_sale: { label: 'मंडी बिक्री', icon: '🏪' },
  trader_sale: { label: 'व्यापारी को बिक्री', icon: '🤝' },
  subsidy: { label: 'Subsidy', icon: '🏛️' },
  other_income: { label: 'Other Income', icon: '💰' },
};

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const formatDate = (dateStr, language = 'en') =>
  new Date(dateStr).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });


const TabToggle = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const isLabor = activeTab === 'labor';
  return (
    <div
      className="flex rounded-xl p-1 gap-1 relative"
      style={{ background: 'var(--color-soil-dark)' }}
    >
      <div
        className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out"
        style={{
          left: isLabor ? 'calc(50% + 2px)' : '4px',
          width: 'calc(50% - 6px)',
          background: isLabor
            ? 'linear-gradient(135deg, #c97b4a, #b85c4a)'
            : 'linear-gradient(135deg, var(--color-forest-muted), var(--color-forest))',
          boxShadow: isLabor
            ? '0 2px 12px rgba(201,123,74,0.28)'
            : '0 2px 12px rgba(107,123,79,0.28)',
        }}
      />
      <button
        onClick={() => onTabChange('general')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-sm transition-colors duration-300 relative z-10 ${activeTab === 'general'
            ? 'text-white'
            : 'text-stone-500 hover:text-stone-700'
          }`}
      >
        <BookOpen size={16} strokeWidth={activeTab === 'general' ? 2.5 : 2} />
        {t('khata.generalTab')}
      </button>
      <button
        onClick={() => onTabChange('labor')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-sm transition-colors duration-300 relative z-10 ${activeTab === 'labor'
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

const SummaryCard = ({ summary, isLoading }) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-5 text-white animate-pulse"
        style={{ background: 'linear-gradient(135deg, var(--color-forest), var(--color-forest-mid))', boxShadow: 'var(--shadow-hero)' }}
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
        background: 'linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-mid) 55%, var(--color-forest-muted) 100%)',
        boxShadow: 'var(--shadow-hero)',
      }}
    >
      {/* Net Profit */}
      <div className="flex items-center gap-2 mb-1">
        <Wallet size={18} style={{ color: 'var(--color-harvest)' }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(231, 207, 143, 0.85)' }}>
          {t('khata.myProfit')}
        </span>
      </div>
      <p className={`text-4xl font-black mb-5 tracking-tight ${data.net_profit < 0 ? 'text-red-200' : 'text-white'}`}>
        {formatINR(data.net_profit)}
      </p>

      {/* Income / Expense Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(4px)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp size={14} className="text-emerald-200" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-100">{t('khata.income')}</span>
          </div>
          <p className="text-xl font-bold text-white">{formatINR(data.total_income)}</p>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(4px)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingDown size={14} className="text-red-200" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-red-100">{t('khata.kharcha')}</span>
          </div>
          <p className="text-xl font-bold text-white">{formatINR(data.total_expense)}</p>
        </div>
      </div>
    </div>
  );
};


const TransactionCard = ({ txn, onEdit, onDelete, isDeleting }) => {
  const { t, i18n } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const meta = CATEGORY_META[txn.category] || { label: txn.category, icon: '📋' };
  const catLabel = t(`khata.categories.${txn.category}`, { defaultValue: meta.label });
  const isExpense = txn.type === 'expense' || txn.type === 'labor_wage';

  return (
    <div
      className="krishi-card flex items-center gap-3 p-4 tactile"
      style={{ borderLeft: `4px solid ${isExpense ? 'var(--color-danger)' : 'var(--color-forest-muted)'}` }}
    >
      {/* Category Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: isExpense ? 'var(--color-danger-soft)' : 'var(--color-forest-light)' }}
      >
        {meta.icon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate" style={{ color: 'var(--color-forest)' }}>{catLabel}</p>
        {txn.description && (
          <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{txn.description}</p>
        )}
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted)' }}>{formatDate(txn.transaction_date, i18n.language)}</p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="font-extrabold text-base" style={{ color: isExpense ? 'var(--color-danger)' : 'var(--color-forest-mid)' }}>
          {isExpense ? '−' : '+'}{formatINR(txn.amount)}
        </p>
      </div>

      {/* Edit & Delete Buttons */}
      <div className="flex gap-1 shrink-0">
        {txn.isGeneralLabor ? null : txn.is_syncing ? (
          <div className="flex items-center justify-center p-2 px-4">
            <Loader2 size={16} className="text-stone-300 animate-spin" />
          </div>
        ) : !showDeleteConfirm ? (
          <>
            <button
              onClick={() => onEdit(txn)}
              disabled={isDeleting}
              className="p-2 rounded-lg hover:bg-stone-100 active:bg-stone-200 transition-colors"
              aria-label={t('khata.editLabel', 'Edit')}
            >
              <Edit2 size={16} className="text-stone-400 hover:text-emerald-700 transition-colors" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
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
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-danger)' }}>{t('khata.deleteConfirm', 'Sure?')}</span>
            <button
              onClick={() => onDelete(txn.id)}
              disabled={isDeleting}
              className="p-1.5 text-white rounded-lg active:scale-95 transition-all"
              style={{ background: 'var(--color-danger)' }}
            >
              {isDeleting
                ? <Loader2 size={14} className="animate-spin" />
                : <CheckCircle2 size={14} />
              }
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="p-1.5 rounded-lg active:scale-95 transition-all"
              style={{ background: 'var(--color-soil-dark)', color: 'var(--color-muted)' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Empty State ────────────────────────────────────────────────
const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <EmptyStateUI
      illustration="/illustrations/empty-khata.svg"
      title={t('khata.emptyTitle')}
      subtitle={t('khata.emptyText')}
    />
  );
};


const KhataPage = () => {
  const { t } = useTranslation();
  const { activeFarm } = useActiveFarm();
  const farmId = activeFarm?.id || null;

  const [activeTab, setActiveTab] = useState('general');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLaborFormMode, setIsLaborFormMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: rawTransactions = [], isLoading: txnLoading, isError: txnError } = useTransactions(farmId);
  const transactions = (() => {
    const generalTxns = rawTransactions.filter(t => !['labor_wage', 'labor_payment'].includes(t.type) && t.category !== 'labor');
    const laborTxns = rawTransactions.filter(t => ['labor_wage', 'labor_payment'].includes(t.type) || t.category === 'labor');

    const totalLaborCost = laborTxns.filter(t => t.type === 'labor_wage' || (t.category === 'labor' && t.type === 'expense')).reduce((sum, t) => sum + Number(t.amount || 0), 0);

    if (totalLaborCost > 0 || laborTxns.length > 0) {
      generalTxns.unshift({
        id: 'general-labor-aggregate',
        type: 'expense',
        category: 'labor',
        description: t('khata.totalLaborExpenses', 'Total Labor Expenses'),
        amount: totalLaborCost,
        transaction_date: laborTxns.length > 0 ? laborTxns[0].transaction_date : new Date().toISOString(),
        isGeneralLabor: true
      });
    }
    return generalTxns;
  })();
  const { data: summary, isLoading: summaryLoading } = useSummary(farmId);
  const deleteMutation = useDeleteTransaction();

  const handleDelete = (id) => {
    setDeletingId(id);
    deleteMutation.mutate(id, { onSettled: () => setDeletingId(null) });
  };

  return (
    <PageShell ambient="khata">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="px-4 py-5 max-w-lg mx-auto space-y-5 pb-28"
      >

        {/* ── Screen Title (Serif) ──────────────────────────── */}
        <motion.h1
          variants={fadeUp}
          className="text-2xl font-bold font-serif-accent leading-tight"
          style={{ color: 'var(--color-forest)' }}
        >
          {t('khata.title')}
        </motion.h1>

        {/* ── Tab Toggle ────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <TabToggle activeTab={activeTab} onTabChange={setActiveTab} />
        </motion.div>

        {/* ── General Hisab Tab ─────────────────────────────── */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            {/* ── Summary Card ─────────────────────────────────── */}
            <motion.div variants={fadeUp}>
              <SummaryCard summary={summary} isLoading={summaryLoading} />
            </motion.div>

            {/* ── Add Transaction Button ───────────────────────── */}
            <motion.button
              variants={fadeUp}
              onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
                boxShadow: '0 6px 20px -4px rgba(92,122,85,0.45)',
              }}
            >
              <Plus size={20} strokeWidth={3} />
              {t('khata.addTransaction')}
            </motion.button>

            {/* ── Transaction List ─────────────────────────────── */}
            <motion.div variants={fadeUp}>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
                {t('khata.recentEntries')}
              </h2>

              {txnLoading && (
                <div className="flex justify-center py-12">
                  <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-forest-muted)' }} />
                </div>
              )}

              {txnError && (
                <div className="flex items-center gap-2 p-4 rounded-2xl border" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', borderColor: 'rgba(184,92,74,0.2)' }}>
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
            </motion.div>
          </div>
        )}

        {/* ── Labor Hisab Tab ───────────────────────────────── */}
        {activeTab === 'labor' && <LaborDashboard onAddWage={() => { setIsLaborFormMode(true); setIsFormOpen(true); }} />}

        {/* ── Transaction Form Modal ───────────────────────── */}
        <TransactionForm
          isOpen={isFormOpen}
          initialData={editingTransaction}
          isLaborMode={isLaborFormMode}
          onClose={() => { setIsFormOpen(false); setEditingTransaction(null); setIsLaborFormMode(false); }}
        />
      </motion.div>
    </PageShell>
  );
};

export default KhataPage;
