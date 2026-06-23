

import { useState, type ReactNode } from 'react';
import { HeaderTitleContext } from '@/contexts/HeaderTitleContext';

export default function HeaderTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Dashboard');
  
  return (
    <HeaderTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </HeaderTitleContext.Provider>
  );
}