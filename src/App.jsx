/**
 * App.jsx — Root layout with Krishi warm aesthetic.
 * Bottom nav uses deep forest green active state.
 * Page background: warm stone-50 / clay.
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { BookOpen, CloudSun, LayoutDashboard, Sprout, Users } from 'lucide-react';
import TopBar from './components/layout/TopBar';
import WelcomeScreen from './components/WelcomeScreen';
import KhataPage from './pages/KhataPage';
import DashboardPage from './pages/DashboardPage';
import CropTrackingPage from './pages/CropTrackingPage';
import CommunityPage from './pages/CommunityPage';
import { useActiveFarm } from './context/ActiveFarmContext';
import { useGhostAuth } from './hooks/useGhostAuth';

const NAV_ITEMS = [
  { to: '/',          end: true,  icon: LayoutDashboard, label: 'Home'   },
  { to: '/khata',     end: false, icon: BookOpen,        label: 'Khata'  },
  { to: '/crops',     end: false, icon: Sprout,          label: 'Crops'  },
  { to: '/community', end: false, icon: Users,           label: 'Chaupal'},
  { to: '/weather',   end: false, icon: CloudSun,        label: 'Mausam' },
];

function App() {
  const { setFarms } = useActiveFarm();
  const { isAuthenticated, register } = useGhostAuth();

  useEffect(() => {
    setFarms([
      { id: 1, name: 'Sukhdev Farm', location: 'Indore' },
      { id: 2, name: 'Green Acres',  location: 'Bhopal' },
    ]);
  }, [setFarms]);

  if (!isAuthenticated) return <WelcomeScreen onRegister={register} />;

  return (
    <Router>
      {/* Warm clay background fills the entire screen */}
      <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-soil)' }}>
        <TopBar />
        <main>
          <Routes>
            <Route path="/"          element={<DashboardPage />} />
            <Route path="/khata"     element={<KhataPage />} />
            <Route path="/crops"     element={<CropTrackingPage />} />
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
      </div>
    </Router>
  );
}

export default App;
