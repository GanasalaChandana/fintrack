// lib/hooks/useThemePreference.ts
'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/stores/themeStore';

export function useThemePreference() {
  const { theme, resolvedTheme, setTheme, initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === 'dark',
  };
}