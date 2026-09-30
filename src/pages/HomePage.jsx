import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  Leaf,
  CloudSun,
  WifiOff,
  KeyRound,
  Languages,
  Download,
  ArrowRight,
} from 'lucide-react';

function GithubIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Hero Landscape illustration matching the calm rural landscape.
 * Optimized for peak performance (no continuous repainting):
 * - Sun with natural morning rays (no rotation)
 * - Distant hills, crop rows, and horizon bird
 * - Foreground sprout entrance on initial load
 */
function HeroLandscape() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 200"
        fill="none"
        className="w-full h-auto drop-shadow-sm select-none"
      >
        {/* ── Sun Group (Static, natural morning rays) ── */}
        <g>
          {/* Outer Sun Halo */}
          <circle
            cx="248"
            cy="56"
            r="22"
            fill="#c9a24b"
            fillOpacity="0.28"
          />

          {/* Sun Rays - Stationary morning orientation */}
          <g stroke="#c9a24b" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5">
            <path d="M248 22 L248 30" />
            <path d="M214 56 L222 56" />
            <path d="M274 56 L282 56" />
            <path d="M224 32 L229 37" />
            <path d="M272 32 L267 37" />
          </g>

          {/* Inner Golden Sun Core */}
          <circle
            cx="248"
            cy="56"
            r="14"
            fill="#c9a24b"
            fillOpacity="0.5"
          />
        </g>

        {/* ── Bird in the Horizon ── */}
        <path
          d="M120 50 C124 46 128 46 132 50 M132 50 C136 46 140 46 144 50"
          stroke="#6b8a9e"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.6"
        />

        {/* ── Distant Hills ── */}
        <path
          d="M0 132 C50 110 110 110 160 128 C210 146 260 116 320 134 L320 200 L0 200 Z"
          fill="#eef1e8"
        />

        {/* ── Mid Hills ── */}
        <path
          d="M0 150 C60 134 120 138 170 152 C220 166 260 144 320 156 L320 200 L0 200 Z"
          fill="#cfd9bc"
          fillOpacity="0.7"
        />

        {/* ── Foreground Field ── */}
        <path
          d="M0 172 C60 162 120 166 180 176 C240 186 270 174 320 180 L320 200 L0 200 Z"
          fill="#9aae74"
        />

        {/* ── Crop Rows ── */}
        <g stroke="#3d5a3a" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.4">
          <path d="M40 184 L48 174" />
          <path d="M70 186 L78 176" />
          <path d="M110 184 L118 174" />
          <path d="M150 188 L158 178" />
          <path d="M200 190 L208 180" />
          <path d="M250 188 L258 178" />
          <path d="M290 190 L298 180" />
        </g>

        {/* ── Foreground Sprout (Grows up on load) ── */}
        <motion.g
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.4 }}
          style={{ transformOrigin: '80px 180px' }}
        >
          <path d="M80 180 L80 162" stroke="#3d5a3a" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M80 170 C74 170 70 166 70 161 C75 159 79 163 80 170 Z" fill="#6b7b4f" />
          <path d="M80 166 C85 166 88 162 88 158 C83 157 81 161 80 166 Z" fill="#5c7a55" />
        </motion.g>
      </svg>
    </div>
  );
}

const features = [
  {
    name: 'Bahi-Khata ledger',
    description:
      'Log every sale, expense, and loan the way you always have — just in your pocket instead of a paper register.',
    icon: Wallet,
    align: 'left',
  },
  {
    name: 'Mandi price charts',
    description:
      'Track daily rates for your crops across nearby mandis, so you know where and when to sell.',
    icon: TrendingUp,
    align: 'right',
  },
  {
    name: 'Crop health tracker',
    description:
      'Follow each crop from seedling to harvest, with reminders for the stages that need your attention.',
    icon: Leaf,
    align: 'left',
  },
  {
    name: 'Weather advisories',
    description:
      'Get forecasts and alerts written for farm decisions — irrigation, spraying, and harvest timing.',
    icon: CloudSun,
    align: 'right',
  },
];

const reasons = [
  {
    icon: WifiOff,
    text: 'Works fully offline as an installable app — your entries sync once you’re back online.',
  },
  {
    icon: KeyRound,
    text: 'No passwords to remember. A private PIN keeps your ledger yours alone.',
  },
  {
    icon: Languages,
    text: 'Use it in Hindi or English, switch anytime, no settings buried in a menu.',
  },
];

function FeatureRow({ feature, index }) {
  const Icon = feature.icon;
  const isLeft = feature.align === 'left';

  const iconBlock = (
    <motion.div
      whileHover={{ scale: 1.15, rotate: isLeft ? 5 : -5 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className="flex shrink-0 items-center justify-center p-2.5 rounded-2xl bg-forest-light/60 text-forest-mid group-hover:bg-forest-light group-hover:text-forest transition-colors duration-300 shadow-sm"
    >
      <Icon className="h-7 w-7" strokeWidth={1.6} />
    </motion.div>
  );

  const textBlock = (
    <div>
      <h3 className="text-lg font-semibold text-ink group-hover:text-forest transition-colors duration-200">
        {feature.name}
      </h3>
      <p className="mt-1 max-w-md text-[15px] leading-relaxed text-muted">
        {feature.description}
      </p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -20 : 20, y: 10 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group flex items-start justify-between gap-8 border-b border-[--border-subtle] py-8 first:pt-0 last:border-b-0 cursor-default"
    >
      {isLeft ? (
        <>
          {textBlock}
          {iconBlock}
        </>
      ) : (
        <>
          {iconBlock}
          {textBlock}
        </>
      )}
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="page-ambient-khata min-h-screen bg-soil text-ink overflow-x-hidden">
      {/* ── Navbar ── */}
      <header className="border-b border-[--border-subtle] backdrop-blur-md bg-soil/90 sticky top-0 z-30 transition-all">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/home" className="flex items-center gap-2.5 group">
            <motion.img
              src="/brand/logo-mark.svg"
              alt="Krishi Khata"
              className="h-7 w-7"
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            />
            <span className="font-serif-accent text-lg text-forest tracking-tight">
              Krishi Khata
            </span>
          </Link>
          <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/"
              className="group flex items-center gap-1.5 text-[15px] font-semibold text-forest transition-colors hover:text-forest-mid"
            >
              Launch app
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Ambient Warm Glow Blobs (Static, zero GPU repainting) */}
        <div
          className="pointer-events-none absolute -left-10 top-16 h-56 w-56 rounded-full blur-3xl opacity-50"
          style={{ background: 'rgba(201, 162, 75, 0.16)' }}
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full blur-3xl opacity-50"
          style={{ background: 'rgba(107, 123, 79, 0.14)' }}
        />

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="font-serif-accent text-4xl leading-tight text-forest md:text-[2.75rem]">
              Your farm ledger, now in your pocket
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted">
              Krishi Khata brings the trusted bahi-khata online — track income,
              expenses, crops, and mandi rates without changing how you already
              keep records.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-mid transition-all whitespace-nowrap"
              >
                Open web app
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[--border-strong] px-4 py-2 text-sm font-medium text-ink/60 bg-white/40 cursor-not-allowed whitespace-nowrap"
                >
                  <Download className="h-4 w-4" />
                  Download APK
                </button>
                <span className="text-xs text-muted">Coming soon</span>
              </div>
            </div>
          </motion.div>

          {/* Living Landscape Illustration */}
          <div className="hidden md:block">
            <HeroLandscape />
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="border-t border-[--border-subtle]">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="font-serif-accent text-2xl text-forest"
          >
            Your ledger, digitized
          </motion.h2>

          <div className="mt-10">
            {features.map((feature, idx) => (
              <FeatureRow key={feature.name} feature={feature} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us Section ── */}
      <section className="border-t border-[--border-subtle] bg-cream">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="font-serif-accent text-2xl text-forest"
          >
            Why farmers choose Krishi Khata
          </motion.h2>

          <div className="mt-10">
            {reasons.map((reason, i) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group flex items-start gap-4 border-b border-[--border-subtle] py-5 px-3 -mx-3 rounded-xl transition-colors duration-150 hover:bg-[#f4f1e8]/60 first:pt-0 last:border-b-0 cursor-default"
                >
                  <div className="p-1 rounded-lg text-forest-mid transition-transform duration-150 group-hover:scale-110">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.6} />
                  </div>
                  <p className="text-[15px] leading-relaxed text-ink transition-colors duration-150 group-hover:text-forest">
                    {reason.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="border-t border-[--border-subtle]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-3xl flex-col items-start justify-between gap-6 px-6 py-14 sm:flex-row sm:items-center"
        >
          <p className="max-w-md text-base sm:text-lg text-ink font-medium leading-relaxed">
            Start keeping your khata the easy way — it takes a minute to set up.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-mid transition-all whitespace-nowrap"
            >
              Open web app
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <span className="text-xs text-muted whitespace-nowrap">APK coming soon</span>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[--border-subtle]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted md:flex-row">
          <span className="font-serif-accent text-ink">Krishi Khata</span>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-ink transition-colors">
              Launch app
            </Link>
            <a
              href="https://github.com/notaanidhya/Krishi-Khata-frontend"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-ink transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
          </div>
          <span>&copy; {new Date().getFullYear()} Krishi Khata</span>
        </div>
      </footer>
    </div>
  );
}
