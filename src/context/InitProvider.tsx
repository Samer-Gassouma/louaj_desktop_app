import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InitContextType {
  isInitialized: boolean;
  isInitializing: boolean;
  shouldShowLogin: boolean;
  systemStatus: {
    networkConnected: boolean;
    authValid: boolean;
    printerConnected: boolean;
    appUpToDate: boolean;
  };
  completeInitialization: (shouldShowLogin: boolean) => void;
  resetInitialization: () => void;
}

const InitContext = createContext<InitContextType>({
  isInitialized: false,
  isInitializing: true,
  shouldShowLogin: false,
  systemStatus: {
    networkConnected: false,
    authValid: false,
    printerConnected: false,
    appUpToDate: false,
  },
  completeInitialization: () => {},
  resetInitialization: () => {},
});

export const useInit = () => {
  const context = useContext(InitContext);
  if (!context) {
    throw new Error('useInit must be used within an InitProvider');
  }
  return context;
};

interface InitProviderProps {
  children: ReactNode;
}

export const InitProvider: React.FC<InitProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [shouldShowLogin, setShouldShowLogin] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    networkConnected: false,
    authValid: false,
    printerConnected: false,
    appUpToDate: false,
  });

  const completeInitialization = (shouldShowLogin: boolean) => {
    setShouldShowLogin(shouldShowLogin);
    setIsInitialized(true);
    setIsInitializing(false);
    
    // Update system status based on initialization results
    setSystemStatus({
      networkConnected: true, // We'll assume network is connected if init completes
      authValid: !shouldShowLogin,
      printerConnected: Math.random() > 0.3, // Simulate printer detection
      appUpToDate: Math.random() > 0.05, // Simulate update check
    });
  };

  const resetInitialization = () => {
    setIsInitialized(false);
    setIsInitializing(true);
    setShouldShowLogin(false);
    setSystemStatus({
      networkConnected: false,
      authValid: false,
      printerConnected: false,
      appUpToDate: false,
    });
  };

  const value: InitContextType = {
    isInitialized,
    isInitializing,
    shouldShowLogin,
    systemStatus,
    completeInitialization,
    resetInitialization,
  };

  return (
    <InitContext.Provider value={value}>
      {children}
    </InitContext.Provider>
  );
}; 