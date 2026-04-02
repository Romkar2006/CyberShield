import React, { createContext, useContext, useEffect } from 'react';

type Theme = 'dark';

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeProviderState {
  theme: Theme;
  toggleTheme: () => void;
}

const initialState: ThemeProviderState = {
  theme: 'dark',
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Enforce dark mode globally
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    localStorage.setItem('cybershield-theme', 'dark');
  }, []);

  const toggleTheme = () => {
    // No-op to prevent state changes in dark-only environment
    console.warn('CyberShield protocol: Theme switching is disabled. Dark mode is mandatory.');
  };

  return (
    <ThemeProviderContext.Provider value={{ theme: 'dark', toggleTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
