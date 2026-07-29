/**
 * App.jsx — Root layout with the Refined Earth aesthetic.
 * Lighter warm-paper background, per-page ambient overlays, a
 * framer-motion animated route shell, and a refined bottom nav
 * with a sliding active pill (layoutId).
 *
 * Auth flow:
 *   1. New user → WelcomeScreen (name + PIN setup)
 *   2. Returning user → PinEntryScreen (PIN verification)
 *   3. Authenticated → Dashboard with farm-aware routing
 *
 * Farm-aware: fetches user farms from the API on load.
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Navigate, NavLink } from 'react-router-dom';
import { BookOpen, CloudSun, Sprout, Users, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import TopBar from './components/layout/TopBar';
import WelcomeScreen from './components/WelcomeScreen';
import PinEntryScreen from './components/PinEntryScreen';
import AnimatedRoutes from './components/motion/AnimatedRoutes';

import KhataPage from './pages/KhataPage';
import CropTrackingPage from './pages/CropTrackingPage';
import WeatherPage from './pages/WeatherPage';
import CommunityPage from './pages/CommunityPage';
import MandiDashboard from './pages/MandiDashboard';
import { useActiveFarm } from './context/ActiveFarmContext';
import { useFarms } from './hooks/useFarm';
import { useGhostAuth } from './hooks/useGhostAuth';

const NAV_ITEMS = [
  { to: '/', end: true, icon: BookOpen, labelKey: 'nav.khata' },
  { to: '/crops', end: false, icon: Sprout, labelKey: 'nav.crops' },
  { to: '/mandi', end: false, icon: TrendingUp, labelKey: 'nav.mandi' },
  { to: '/community', end: false, icon: Users, labelKey: 'nav.chaupal' },
  { to: '/weather', end: false, icon: CloudSun, labelKey: 'nav.mausam' },
];

function App() {
  const { t } = useTranslation();
  const { setFarms, setIsLoading, isLoading: farmContextLoading } = useActiveFarm();
  const {
    isNewUser,
    needsPin,
    isAuthenticated,
    userName,
    register,
    login,
    isLoading: authLoading,
    error: authError,
  } = useGhostAuth();

  const { data: farmsData, isLoading: farmsQueryLoading } = useFarms();

  useEffect(() => {
    if (!farmsQueryLoading && farmsData) {
      setFarms(farmsData);
      setIsLoading(false);
    }
  }, [farmsData, farmsQueryLoading, setFarms, setIsLoading]);

  if (isNewUser) {
    return <WelcomeScreen onRegister={register} onLogin={login} />;
  }

  if (needsPin) {
    return (
      <PinEntryScreen
        userName={userName}
        onLogin={login}
        isLoading={authLoading}
        error={authError}
      />
    );
  }

  if (!isAuthenticated || farmsQueryLoading || farmContextLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ backgroundColor: 'var(--color-soil)' }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-forest-muted)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>{t('app.loadingFarms')}</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-soil)' }}>
        <TopBar />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'var(--color-ink)',
              color: '#fff',
              borderRadius: '14px',
              padding: '12px 16px',
              boxShadow: 'var(--shadow-elevated)',
            },
            success: {
              style: {
                background: 'var(--color-forest-mid)',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: 'var(--color-danger)',
                color: '#fff',
              },
            },
          }}
        />

        <main>
          <AnimatedRoutes>
            <Route path="/" element={<KhataPage />} />
            <Route path="/crops" element={<CropTrackingPage />} />
            <Route path="/mandi" element={<MandiDashboard />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </AnimatedRoutes>
        </main>

        <nav
          className="fixed bottom-0 left-0 right-0 px-2 py-1.5 flex justify-around items-center h-16 z-40"
          style={{
            backgroundColor: 'var(--color-cream)',
            borderTop: '1px solid var(--border-subtle)',
            boxShadow: '0 -4px 24px -6px rgba(61, 58, 36, 0.1)',
          }}
        >
          {NAV_ITEMS.map(({ to, end, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={t(labelKey)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors duration-200"
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-forest-muted)' : 'var(--color-muted)',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute top-1/2 left-1/2 rounded-xl"
                      style={{
                        width: 40,
                        height: 32,
                        x: '-50%',
                        y: '-50%',
                        backgroundColor: 'var(--color-forest-light)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <div className="relative z-10 p-1 rounded-lg">
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  </div>
                  <span className={`relative z-10 text-[10px] font-bold uppercase tracking-wide ${isActive ? '' : 'opacity-70'}`}>
                    {t(labelKey)}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

      </div>
    </Router>
  );
}

export default App;
