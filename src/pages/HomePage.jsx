import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sprout } from 'lucide-react';

const HomePage = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, var(--color-soil) 0%, var(--color-soil-dark) 50%, #e8e2d6 100%)',
      }}
    >
      {/* Decorative ambient blurs */}
      <div
        className="absolute top-16 left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(201, 162, 75, 0.18)' }}
      />
      <div
        className="absolute bottom-16 right-12 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(92, 122, 85, 0.15)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10 p-8 rounded-3xl krishi-card flex flex-col items-center shadow-xl"
        style={{
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Brand Logo */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md"
          style={{
            background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
          }}
        >
          <img src="/brand/logo-mark.svg" alt="Krishi Khata" className="w-10 h-10" />
        </div>

        {/* Basic Hii Message */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
          style={{
            background: 'var(--color-forest-light)',
            color: 'var(--color-forest)',
          }}
        >
          <Sprout size={14} /> Introduction Page
        </span>

        <h1
          className="text-4xl font-extrabold font-serif-accent tracking-tight mb-3"
          style={{ color: 'var(--color-forest)' }}
        >
          Hii! 👋
        </h1>

        <p
          className="text-base font-medium mb-6 leading-relaxed"
          style={{ color: 'var(--color-muted)' }}
        >
          Welcome to the official introduction page for <strong className="text-[var(--color-ink)]">Krishi Khata</strong>.
          We are building something exciting here — stay tuned for updates and app downloads!
        </p>

        {/* Button to go to the main app */}
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-95 shadow-md"
          style={{
            background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
            color: '#ffffff',
          }}
        >
          <span>Go to Krishi Khata App</span>
          <ArrowRight size={16} />
        </Link>
      </motion.div>

      <p className="mt-8 text-xs font-medium relative z-10" style={{ color: 'var(--color-muted)' }}>
        Krishi Khata • Smart Farm Ledger
      </p>
    </div>
  );
};

export default HomePage;
