import { createContext, useContext } from 'react';

interface HeaderTitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

export const HeaderTitleContext = createContext<HeaderTitleContextType | null>(null);

const useHeaderTitle = () => {
  const context = useContext(HeaderTitleContext);
  if (!context) {
    throw new Error('useHeaderTitle must be used inside HeaderTitleProvider');
  }
  return context;
};

export default useHeaderTitle;