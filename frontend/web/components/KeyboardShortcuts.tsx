// components/KeyboardShortcuts.tsx
'use client';

import { X, Keyboard } from 'lucide-react';
import { getShortcutLabel } from '@/lib/utils/shortcuts';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null;

  const shortcuts = {
    navigation: [
      { shortcutKey: 'd', ctrl: true, description: 'Go to Dashboard' },
      { shortcutKey: 't', ctrl: true, description: 'Go to Transactions' },
      { shortcutKey: 'b', ctrl: true, description: 'Go to Budgets' },
      { shortcutKey: 'r', ctrl: true, description: 'Go to Reports' },
    ],
    actions: [
      { shortcutKey: 'n', ctrl: true, description: 'New Transaction' },
      { shortcutKey: 'k', ctrl: true, description: 'Search' },
      { shortcutKey: 's', ctrl: true, description: 'Save Changes' },
      { shortcutKey: 'e', ctrl: true, description: 'Export Data' },
    ],
    general: [
      { shortcutKey: '?', shift: true, description: 'Show Keyboard Shortcuts' },
      { shortcutKey: 'Escape', description: 'Close Modal/Dialogs' },
      { shortcutKey: 'Tab', description: 'Navigate Forward' },
      { shortcutKey: 'Tab', shift: true, description: 'Navigate Backward' },
    ],
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Keyboard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Boost your productivity with these shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          {/* Navigation */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <div className="space-y-2">
              {shortcuts.navigation.map((shortcut, index) => (
                <ShortcutRow key={index} {...shortcut} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Actions
            </h3>
            <div className="space-y-2">
              {shortcuts.actions.map((shortcut, index) => (
                <ShortcutRow key={index} {...shortcut} />
              ))}
            </div>
          </div>

          {/* General */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              General
            </h3>
            <div className="space-y-2">
              {shortcuts.general.map((shortcut, index) => (
                <ShortcutRow key={index} {...shortcut} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Shift + ?</kbd> anytime to see this help
          </p>
        </div>
      </div>
    </div>
  );
}

interface ShortcutRowProps {
  shortcutKey: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
}

function ShortcutRow({ shortcutKey, ctrl, alt, shift, description }: ShortcutRowProps) {
  const label = getShortcutLabel({ key: shortcutKey, ctrl, alt, shift });

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
      <span className="text-sm text-gray-700 dark:text-gray-300">{description}</span>
      <kbd className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
        {label}
      </kbd>
    </div>
  );
}