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
 * Shows EmptyFarmState if no farms exist, otherwise renders the dashboard.
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { BookOpen, CloudSun, LayoutDashboard, Sprout, Users, Loader2 } from 'lucide-react';
import TopBar from './components/layout/TopBar';
import WelcomeScreen from './components/WelcomeScreen';
import PinEntryScreen from './components/PinEntryScreen';
import EmptyFarmState from './components/ui/EmptyFarmState';
import AddFarmModal from './components/ui/AddFarmModal';
import KhataPage from './pages/KhataPage';
import DashboardPage from './pages/DashboardPage';
import CropTrackingPage from './pages/CropTrackingPage';
import CommunityPage from './pages/CommunityPage';
import { useActiveFarm } from './context/ActiveFarmContext';
import { useFarms } from './hooks/useFarm';
import { useGhostAuth } from './hooks/useGhostAuth';

const NAV_ITEMS = [
  { to: '/',          end: true,  icon: LayoutDashboard, label: 'Home'   },
  { to: '/khata',     end: false, icon: BookOpen,        label: 'Khata'  },
  { to: '/crops',     end: false, icon: Sprout,          label: 'Crops'  },
  { to: '/community', end: false, icon: Users,           label: 'Chaupal'},
  { to: '/weather',   end: false, icon: CloudSun,        label: 'Mausam' },
];

function App() {
  const { setFarms, setIsLoading, hasFarms, isLoading: farmContextLoading } = useActiveFarm();
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
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);

  // Sync fetched farms into the ActiveFarmContext
  useEffect(() => {
    if (!farmsQueryLoading && farmsData) {
      setFarms(farmsData);
      setIsLoading(false);
    }
  }, [farmsData, farmsQueryLoading, setFarms, setIsLoading]);

  // ── Auth Gate: New User → WelcomeScreen ─────────────────────
  if (isNewUser) {
    return <WelcomeScreen onRegister={register} />;
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
        <p className="text-sm text-stone-400 font-medium">Loading your farms...</p>
      </div>
    );
  }

  return (
    <Router>
      {/* Warm clay background fills the entire screen */}
      <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-soil)' }}>
        <TopBar onAddFarm={() => setShowAddFarmModal(true)} />

        <main>
          {!hasFarms ? (
            /* ── Empty State: No farms yet ─────────────────── */
            <EmptyFarmState onCreateFarm={() => setShowAddFarmModal(true)} />
          ) : (
            /* ── Normal Routes ─────────────────────────────── */
            <Routes>
              <Route path="/"          element={<DashboardPage />} />
              <Route path="/khata"     element={<KhataPage />} />
              <Route path="/crops"     element={<CropTrackingPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          )}
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
          {NAV_ITEMS.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Add Farm Modal (Global) ─────────────────────── */}
        <AddFarmModal
          isOpen={showAddFarmModal}
          onClose={() => setShowAddFarmModal(false)}
          onSuccess={(newFarm) => {
            // Refetch happens via TanStack invalidation in the hook.
            // The context will be updated via the useEffect above.
          }}
        />
      </div>
    </Router>
  );
}

export default App;
