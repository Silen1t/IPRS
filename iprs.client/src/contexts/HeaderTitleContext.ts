import { createContext, useContext } from 'react';

export interface HeaderTitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

// 1. Declare and export the context object once
export const HeaderTitleContext = createContext<HeaderTitleContextType | null>(null);

// 2. Export the custom hook safely (No ESLint errors because this file doesn't export components)
export const useHeaderTitle = () => {
  const context = useContext(HeaderTitleContext);
  if (!context) {
    throw new Error('useHeaderTitle must be used inside HeaderTitleProvider');
  }
  return context;
};