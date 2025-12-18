// lib/utils/shortcuts.ts

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'general';
}

export const getShortcutLabel = (shortcut: Omit<Shortcut, 'action' | 'description' | 'category'>) => {
  const parts = [];
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  
  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
};

export const matchesShortcut = (
  event: KeyboardEvent,
  shortcut: Pick<Shortcut, 'key' | 'ctrl' | 'alt' | 'shift'>
): boolean => {
  const key = event.key.toLowerCase();
  const targetKey = shortcut.key.toLowerCase();
  
  // Check if the main key matches
  if (key !== targetKey) return false;
  
  // Check modifiers
  const ctrlPressed = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
  const altPressed = event.altKey;
  const shiftPressed = event.shiftKey;
  
  return (
    (shortcut.ctrl ? ctrlPressed : !ctrlPressed) &&
    (shortcut.alt ? altPressed : !altPressed) &&
    (shortcut.shift ? shiftPressed : !shiftPressed)
  );
};