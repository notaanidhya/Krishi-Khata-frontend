import React, { createContext, useContext, useState, useEffect } from 'react';

const ActiveFarmContext = createContext();

export const ActiveFarmProvider = ({ children }) => {
  const [activeFarm, setActiveFarm] = useState(null);
  const [farms, setFarms] = useState([]); // Populated by useFarms hook via App.jsx
  const [isLoading, setIsLoading] = useState(true); // True until farms are first loaded

  useEffect(() => {
    if (farms.length > 0) {
      // Always select the first farm (Hidden Farm architecture)
      setActiveFarm(farms[0]);
    } else {
      setActiveFarm(null);
    }
    setIsLoading(false);
  }, [farms]);

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

export const useActiveFarm = () => {
  const context = useContext(ActiveFarmContext);
  if (!context) {
    throw new Error('useActiveFarm must be used within an ActiveFarmProvider');
  }
  return context;
};
