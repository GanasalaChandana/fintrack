"use client";

import { useEffect, useState } from "react";
import { Keyboard, X, Command } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
}

export function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show help with ?
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Check all shortcuts
      for (const shortcut of shortcuts) {
        const keys = shortcut.keys;
        const modifierMatch =
          (keys.includes("ctrl") && e.ctrlKey) ||
          (keys.includes("cmd") && e.metaKey) ||
          (!keys.includes("ctrl") && !keys.includes("cmd"));

        const keyMatch = keys.some((key) =>
          key !== "ctrl" && key !== "cmd" ? e.key.toLowerCase() === key.toLowerCase() : false
        );

        if (modifierMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl transition-transform hover:scale-110 md:bottom-8 md:right-8"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="h-6 w-6" />
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                  <Keyboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
                  <p className="text-sm text-gray-600">Power user features</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                  >
                    <span className="font-medium text-gray-700">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <div key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-gray-400">+</span>}
                          <kbd className="min-w-[2rem] rounded-md border-2 border-gray-300 bg-white px-2 py-1 text-center text-sm font-semibold text-gray-700 shadow-sm">
                            {key === "cmd" ? <Command className="inline h-4 w-4" /> : key.toUpperCase()}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
              Press <kbd className="rounded bg-white px-2 py-1 font-bold">?</kbd> anytime to toggle this help
            </div>
          </div>
        </div>
      )}
    </>
  );
}

