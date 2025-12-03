"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference
    const stored = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored === "true" || (stored === null && prefersDark);
    setDarkMode(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.documentElement.classList.toggle("dark", newMode);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}

// Dark Mode Toggle Button Component
export function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="rounded-lg border-2 border-gray-300 bg-white p-2.5 transition-all hover:scale-105 hover:shadow-lg dark:border-gray-600 dark:bg-gray-800"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
}
