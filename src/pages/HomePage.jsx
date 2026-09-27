import { Link } from 'react-router-dom';
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

function FeatureRow({ feature }) {
  const Icon = feature.icon;
  const iconBlock = (
    <div className="flex shrink-0 items-center justify-center">
      <Icon className="h-7 w-7 text-forest-mid" strokeWidth={1.5} />
    </div>
  );
  const textBlock = (
    <div>
      <h3 className="text-lg font-semibold text-ink">{feature.name}</h3>
      <p className="mt-1 max-w-md text-[15px] leading-relaxed text-muted">
        {feature.description}
      </p>
    </div>
  );

  return (
    <div className="flex items-start justify-between gap-8 border-b border-[--border-subtle] py-8 first:pt-0 last:border-b-0">
      {feature.align === 'left' ? (
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
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="page-ambient-khata min-h-screen bg-soil text-ink">
      {/* Navbar */}
      <header className="border-b border-[--border-subtle]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <img src="/brand/logo-mark.svg" alt="" className="h-7 w-7" />
            <span className="font-serif-accent text-lg text-forest">
              Krishi Khata
            </span>
          </div>
          <Link
            to="/"
            className="group flex items-center gap-1.5 text-[15px] font-medium text-forest transition-colors hover:text-forest-mid"
          >
            Launch app
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -left-10 top-16 h-48 w-48 rounded-full blur-3xl"
          style={{ background: 'rgba(201, 162, 75, 0.15)' }}
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full blur-3xl"
          style={{ background: 'rgba(107, 123, 79, 0.12)' }}
        />
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <h1 className="font-serif-accent text-4xl leading-tight text-forest md:text-[2.75rem]">
              Your farm ledger, now in your pocket
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted">
              Krishi Khata brings the trusted bahi-khata online — track
              income, expenses, crops, and mandi rates without changing how
              you already keep records.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/"
                className="rounded-xl px-6 py-3 text-[15px] font-semibold text-white shadow-[0_4px_20px_-4px_rgba(92,122,85,0.45)]"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-forest-mid) 0%, var(--color-forest) 100%)',
                }}
              >
                Open web app
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-2 rounded-xl border border-[--border-strong] px-5 py-3 text-[15px] font-medium text-ink/60"
                >
                  <Download className="h-4 w-4" />
                  Download APK
                </button>
                <span className="text-sm text-muted">Coming soon</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="/illustrations/welcome-hero.svg"
              alt="Farmer using Krishi Khata on a phone"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[--border-subtle]">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-serif-accent text-2xl text-forest">
            Your ledger, digitized
          </h2>
          <div className="mt-10">
            {features.map((feature) => (
              <FeatureRow key={feature.name} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="border-t border-[--border-subtle] bg-cream">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-serif-accent text-2xl text-forest">
            Why farmers choose Krishi Khata
          </h2>
          <div className="mt-10">
            {reasons.map((reason, i) => {
              const Icon = reason.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 border-b border-[--border-subtle] py-6 first:pt-0 last:border-b-0"
                >
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-forest-mid"
                    strokeWidth={1.5}
                  />
                  <p className="text-[15px] leading-relaxed text-ink">
                    {reason.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-[--border-subtle]">
        <div className="mx-auto flex max-w-3xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center">
          <p className="max-w-sm text-lg text-ink">
            Start keeping your khata the easy way — it takes a minute to set
            up.
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-xl px-6 py-3 text-[15px] font-semibold text-white shadow-[0_4px_20px_-4px_rgba(92,122,85,0.45)]"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-forest-mid) 0%, var(--color-forest) 100%)',
              }}
            >
              Open web app
            </Link>
            <span className="text-sm text-muted">APK coming soon</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[--border-subtle]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted md:flex-row">
          <span className="font-serif-accent text-ink">Krishi Khata</span>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-ink">
              Launch app
            </Link>
            <a
              href="https://github.com/notaanidhya/krishi-khata"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-ink"
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
