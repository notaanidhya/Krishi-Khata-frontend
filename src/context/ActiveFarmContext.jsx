import React, { createContext, useContext, useState, useEffect } from 'react';

const ActiveFarmContext = createContext();

export const ActiveFarmProvider = ({ children }) => {
  const [activeFarm, setActiveFarm] = useState(null);
  const [farms, setFarms] = useState([]); // Will be populated by an API call

  // Persist selection to localStorage for better UX
  useEffect(() => {
    const savedFarm = localStorage.getItem('activeFarmId');
    if (savedFarm && farms.length > 0) {
      const found = farms.find(f => f.id === parseInt(savedFarm));
      if (found) setActiveFarm(found);
    } else if (farms.length > 0 && !activeFarm) {
      setActiveFarm(farms[0]); // Default to first farm
    }
  }, [farms]);

  const changeActiveFarm = (farm) => {
    setActiveFarm(farm);
    localStorage.setItem('activeFarmId', farm.id);
  };

  return (
    <ActiveFarmContext.Provider value={{ activeFarm, farms, setFarms, changeActiveFarm }}>
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
