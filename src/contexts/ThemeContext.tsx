import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Then check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);

    // Update CSS variables based on theme
    if (theme === 'dark') {
      root.style.setProperty('--background', '0 0% 0%');
      root.style.setProperty('--foreground', '0 0% 100%');
      root.style.setProperty('--card', '0 0% 3%');
      root.style.setProperty('--card-foreground', '0 0% 100%');
      root.style.setProperty('--popover', '0 0% 3%');
      root.style.setProperty('--popover-foreground', '0 0% 100%');
      root.style.setProperty('--primary', '270 100% 50%');
      root.style.setProperty('--primary-foreground', '0 0% 100%');
      root.style.setProperty('--secondary', '270 100% 20%');
      root.style.setProperty('--secondary-foreground', '0 0% 100%');
      root.style.setProperty('--muted', '270 100% 10%');
      root.style.setProperty('--muted-foreground', '270 100% 80%');
      root.style.setProperty('--accent', '320 100% 50%');
      root.style.setProperty('--accent-foreground', '0 0% 100%');
      root.style.setProperty('--destructive', '0 100% 50%');
      root.style.setProperty('--destructive-foreground', '0 0% 100%');
      root.style.setProperty('--border', '270 100% 20%');
      root.style.setProperty('--input', '270 100% 20%');
      root.style.setProperty('--ring', '270 100% 50%');
      root.style.setProperty('--radius', '0.5rem');
      root.style.setProperty('--pulse-purple', '270 100% 50%');
      root.style.setProperty('--pulse-blue', '200 100% 50%');
      root.style.setProperty('--pulse-cyan', '180 100% 50%');
      root.style.setProperty('--pulse-pink', '320 100% 50%');
    } else {
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--foreground', '270 100% 10%');
      root.style.setProperty('--card', '0 0% 98%');
      root.style.setProperty('--card-foreground', '270 100% 10%');
      root.style.setProperty('--popover', '0 0% 98%');
      root.style.setProperty('--popover-foreground', '270 100% 10%');
      root.style.setProperty('--primary', '270 100% 60%');
      root.style.setProperty('--primary-foreground', '0 0% 100%');
      root.style.setProperty('--secondary', '270 100% 90%');
      root.style.setProperty('--secondary-foreground', '270 100% 20%');
      root.style.setProperty('--muted', '270 100% 95%');
      root.style.setProperty('--muted-foreground', '270 100% 40%');
      root.style.setProperty('--accent', '320 100% 60%');
      root.style.setProperty('--accent-foreground', '0 0% 100%');
      root.style.setProperty('--destructive', '0 100% 60%');
      root.style.setProperty('--destructive-foreground', '0 0% 100%');
      root.style.setProperty('--border', '270 100% 90%');
      root.style.setProperty('--input', '270 100% 90%');
      root.style.setProperty('--ring', '270 100% 60%');
      root.style.setProperty('--radius', '0.5rem');
      root.style.setProperty('--pulse-purple', '270 100% 60%');
      root.style.setProperty('--pulse-blue', '200 100% 60%');
      root.style.setProperty('--pulse-cyan', '180 100% 60%');
      root.style.setProperty('--pulse-pink', '320 100% 60%');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
