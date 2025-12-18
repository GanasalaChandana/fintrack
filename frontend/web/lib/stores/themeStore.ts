// lib/stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme: Theme) => {
        set({ theme });
        
        if (typeof window === 'undefined') return;

        // Apply theme to document
        const root = window.document.documentElement;
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          root.classList.remove('light', 'dark');
          root.classList.add(systemTheme);
          set({ resolvedTheme: systemTheme });
        } else {
          root.classList.remove('light', 'dark');
          root.classList.add(theme);
          set({ resolvedTheme: theme });
        }

        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          const color = get().resolvedTheme === 'dark' ? '#1f2937' : '#ffffff';
          metaThemeColor.setAttribute('content', color);
        }
      },

      initializeTheme: () => {
        if (typeof window === 'undefined') return;

        const { theme } = get();
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
          if (get().theme === 'system') {
            get().setTheme('system');
          }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        
        // Apply initial theme
        get().setTheme(theme);
      },
    }),
    {
      name: 'fintrack-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
