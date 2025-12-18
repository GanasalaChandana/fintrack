// lib/hooks/useKeyboardShortcuts.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { matchesShortcut, type Shortcut } from '@/lib/utils/shortcuts';

export function useKeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const shortcuts: Shortcut[] = [
      // Navigation
      {
        key: 'd',
        ctrl: true,
        description: 'Go to Dashboard',
        category: 'navigation',
        action: () => router.push('/dashboard'),
      },
      {
        key: 't',
        ctrl: true,
        description: 'Go to Transactions',
        category: 'navigation',
        action: () => router.push('/transactions'),
      },
      {
        key: 'b',
        ctrl: true,
        description: 'Go to Budgets',
        category: 'navigation',
        action: () => router.push('/goals-budgets'),
      },
      {
        key: 'r',
        ctrl: true,
        description: 'Go to Reports',
        category: 'navigation',
        action: () => router.push('/reports'),
      },
      
      // Actions
      {
        key: 'n',
        ctrl: true,
        description: 'New Transaction',
        category: 'actions',
        action: () => {
          // Trigger new transaction modal
          const event = new CustomEvent('open-transaction-modal');
          window.dispatchEvent(event);
        },
      },
      {
        key: 'k',
        ctrl: true,
        description: 'Search',
        category: 'actions',
        action: () => {
          // Focus search input
          const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
          searchInput?.focus();
        },
      },
      
      // General
      {
        key: '?',
        shift: true,
        description: 'Show Keyboard Shortcuts',
        category: 'general',
        action: () => setShowHelp(true),
      },
      {
        key: 'Escape',
        description: 'Close Modal/Dialogs',
        category: 'general',
        action: () => {
          setShowHelp(false);
          // Close any open modals
          const event = new CustomEvent('close-modals');
          window.dispatchEvent(event);
        },
      },
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow '?' to show help even in inputs if Shift is pressed
        if (!(event.key === '?' && event.shiftKey)) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut)) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return {
    showHelp,
    setShowHelp,
  };
}