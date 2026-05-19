import React, { createContext, useContext, useState, useEffect } from 'react';

const ActiveFarmContext = createContext();

export const ActiveFarmProvider = ({ children }) => {
  const [activeFarm, setActiveFarm] = useState(null);
  const [farms, setFarms] = useState([]); // Populated by useFarms hook via App.jsx
  const [isLoading, setIsLoading] = useState(true); // True until farms are first loaded

  // Persist selection to localStorage for better UX
  useEffect(() => {
    if (farms.length > 0) {
      const savedFarmId = localStorage.getItem('activeFarmId');
      if (savedFarmId) {
        const found = farms.find(f => f.id === parseInt(savedFarmId));
        if (found) {
          setActiveFarm(found);
          setIsLoading(false);
          return;
        }
      }
      // Default to first farm if none saved or saved ID not found
      if (!activeFarm || !farms.find(f => f.id === activeFarm?.id)) {
        setActiveFarm(farms[0]);
      }
    } else {
      setActiveFarm(null);
    }
    setIsLoading(false);
  }, [farms]);

  const changeActiveFarm = (farm) => {
    setActiveFarm(farm);
    localStorage.setItem('activeFarmId', farm.id);
  };

  return (
    <ActiveFarmContext.Provider value={{
      activeFarm,
      farms,
      setFarms,
      changeActiveFarm,
      isLoading,
      setIsLoading,
      hasFarms: farms.length > 0,
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
