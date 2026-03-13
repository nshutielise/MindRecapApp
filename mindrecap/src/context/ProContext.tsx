import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProContextType {
  isPro: boolean;
  upgradeToPro: () => void;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

export function ProProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const storedIsPro = localStorage.getItem('mindrecap_is_pro');
    if (storedIsPro === 'true') {
      setIsPro(true);
    }
  }, []);

  const upgradeToPro = () => {
    setIsPro(true);
    localStorage.setItem('mindrecap_is_pro', 'true');
    setShowUpgradeModal(false);
  };

  return (
    <ProContext.Provider value={{ isPro, upgradeToPro, showUpgradeModal, setShowUpgradeModal }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const context = useContext(ProContext);
  if (context === undefined) {
    throw new Error('usePro must be used within a ProProvider');
  }
  return context;
}

