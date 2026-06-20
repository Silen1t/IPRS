'use client';

import { useState, type ReactNode } from 'react';
import { HeaderTitleContext } from '@/contexts/HeaderTitleContext';

// This file ONLY exports a component. Fast Refresh is completely happy!
export default function HeaderTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Dashboard');
  
  return (
    <HeaderTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </HeaderTitleContext.Provider>
  );
}