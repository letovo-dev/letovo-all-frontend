'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FooterContextType {
  isFooterHidden: boolean;
  toggleFooter: () => void;
  setFooterHidden: (hidden: boolean) => void;
}

const FooterContext = createContext<FooterContextType | undefined>(undefined);

export const FooterProvider = ({ children }: { children: ReactNode }) => {
  const [isFooterHidden, setFooterHidden] = useState(false);

  const toggleFooter = () => {
    setFooterHidden(prev => !prev);
  };

  return (
    <FooterContext.Provider value={{ isFooterHidden, toggleFooter, setFooterHidden }}>
      {children}
    </FooterContext.Provider>
  );
};

export const useFooterContext = () => {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error('useFooterContext must be used within an AppProvider');
  }
  return context;
};
