// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import { TooltipProvider } from './shadcn-ui/components/ui/tooltip.tsx';
import ThemeProvider from './providers/ThemeProvider.tsx';
import HeaderTitleProvider from './providers/HeaderTitleProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <HeaderTitleProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </HeaderTitleProvider>
    </ThemeProvider>
  </BrowserRouter>
);
