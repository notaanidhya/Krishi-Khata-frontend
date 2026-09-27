import React, { createContext, useContext, useState, useEffect } from 'react';

const ActiveFarmContext = createContext();

const ACTIVE_FARM_KEY = 'agroo_active_farm';

export const ActiveFarmProvider = ({ children }) => {
  const [activeFarm, setActiveFarm] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_FARM_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [farms, setFarms] = useState(() => (activeFarm ? [activeFarm] : []));
  const [isLoading, setIsLoading] = useState(!activeFarm);

  useEffect(() => {
    if (farms.length > 0) {
      // Always select the first farm (Hidden Farm architecture)
      setActiveFarm(farms[0]);
      try {
        localStorage.setItem(ACTIVE_FARM_KEY, JSON.stringify(farms[0]));
      } catch {
        // Ignore localStorage quota errors
      }
      setIsLoading(false);
    } else if (isLoading && !activeFarm) {
      setIsLoading(false);
    }
  }, [farms, activeFarm, isLoading]);

  return (
    <ActiveFarmContext.Provider value={{
      activeFarm,
      farms,
      setFarms,
      isLoading,
      setIsLoading,
    }}>
      {children}
    </ActiveFarmContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useActiveFarm = () => {
  const context = useContext(ActiveFarmContext);
  if (!context) {
    throw new Error('useActiveFarm must be used within an ActiveFarmProvider');
  }
  return context;
};
