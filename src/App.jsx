/**
 * App.jsx — Root layout with Krishi warm aesthetic.
 * Bottom nav uses deep forest green active state.
 * Page background: warm stone-50 / clay.
 *
 * Auth flow:
 *   1. New user → WelcomeScreen (name + PIN setup)
 *   2. Returning user → PinEntryScreen (PIN verification)
 *   3. Authenticated → Dashboard with farm-aware routing
 *
 * Farm-aware: fetches user farms from the API on load.
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { BookOpen, CloudSun, Sprout, Users, Loader2, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import TopBar from './components/layout/TopBar';
import WelcomeScreen from './components/WelcomeScreen';
import PinEntryScreen from './components/PinEntryScreen';

import KhataPage from './pages/KhataPage';
import CropTrackingPage from './pages/CropTrackingPage';
import WeatherPage from './pages/WeatherPage';
import CommunityPage from './pages/CommunityPage';
import MandiDashboard from './pages/MandiDashboard';
import { useActiveFarm } from './context/ActiveFarmContext';
import { useFarms } from './hooks/useFarm';
import { useGhostAuth } from './hooks/useGhostAuth';

const NAV_ITEMS = [
  { to: '/',          end: true,  icon: BookOpen,        labelKey: 'nav.khata'   },
  { to: '/crops',     end: false, icon: Sprout,          labelKey: 'nav.crops'   },
  { to: '/mandi',     end: false, icon: TrendingUp,      labelKey: 'nav.mandi'   },
  { to: '/community', end: false, icon: Users,           labelKey: 'nav.chaupal' },
  { to: '/weather',   end: false, icon: CloudSun,        labelKey: 'nav.mausam'  },
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
    checkUsername,
    isLoading: authLoading,
    error: authError,
  } = useGhostAuth();

  const { data: farmsData, isLoading: farmsQueryLoading } = useFarms();

  // Sync fetched farms into the ActiveFarmContext
  useEffect(() => {
    if (!farmsQueryLoading && farmsData) {
      setFarms(farmsData);
      setIsLoading(false);
    }
  }, [farmsData, farmsQueryLoading, setFarms, setIsLoading]);

  // ── Auth Gate: New User → WelcomeScreen ─────────────────────
  if (isNewUser) {
    return <WelcomeScreen onRegister={register} onLogin={login} />;
  }

  // ── Auth Gate: Returning User → PIN Entry ────────────────────
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

  // ── Authenticated but loading farms ──────────────────────────
  if (!isAuthenticated || farmsQueryLoading || farmContextLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ backgroundColor: 'var(--color-soil)' }}
      >
        <Loader2 size={32} className="text-emerald-700 animate-spin" />
        <p className="text-sm text-stone-400 font-medium">{t('app.loadingFarms')}</p>
      </div>
    );
  }

  return (
    <Router>
      {/* Warm clay background fills the entire screen */}
      <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-soil)' }}>
        <TopBar />
        <Toaster 
          position="bottom-center" 
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              style: {
                background: '#166534',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: '#dc2626',
                color: '#fff',
              },
            },
          }} 
        />

        <main>
          {/* ── Normal Routes ─────────────────────────────── */}
          <Routes>
            <Route path="/"          element={<KhataPage />} />
            <Route path="/crops"     element={<CropTrackingPage />} />
            <Route path="/mandi"     element={<MandiDashboard />} />
            <Route path="/weather"   element={<WeatherPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* ── Mobile Bottom Navigation ── */}
        <nav
          className="fixed bottom-0 left-0 right-0 px-2 py-1.5 flex justify-around items-center h-16 z-40"
          style={{
            backgroundColor: 'var(--color-cream)',
            borderTop: '1px solid #e5e0d8',
            boxShadow: '0 -4px 24px rgba(5,46,22,0.07)',
          }}
        >
          {NAV_ITEMS.map(({ to, end, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={t(labelKey)}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-800'
                    : 'text-stone-400 hover:text-stone-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-emerald-800' : ''}`}>
                    {t(labelKey)}
                  </span>
                  <div className={`nav-indicator-dot ${isActive ? 'nav-indicator-dot--active' : 'nav-indicator-dot--inactive'}`} />
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
