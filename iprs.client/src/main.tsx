// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import App from './App.tsx';
import { ThemeProvider } from './shadcn-ui/components/providers/theme-provider.tsx';
import { BrowserRouter } from 'react-router';
import { TooltipProvider } from './shadcn-ui/components/ui/tooltip.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </BrowserRouter>
);
