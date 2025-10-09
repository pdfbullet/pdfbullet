import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface PwaLayoutContextType {
  title: string;
  setTitle: (title: string) => void;
}

const PwaLayoutContext = createContext<PwaLayoutContextType | undefined>(undefined);

export const PwaLayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [title, setTitle] = useState('Home');

  const value = useMemo(() => ({ title, setTitle }), [title]);

  return (
    <PwaLayoutContext.Provider value={value}>
      {children}
    </PwaLayoutContext.Provider>
  );
};

export const usePwaLayout = () => {
  const context = useContext(PwaLayoutContext);
  if (context === undefined) {
    throw new Error('usePwaLayout must be used within a PwaLayoutProvider');
  }
  return context;
};