"use client";

import { useEffect, useCallback, useState } from "react";

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  context?: string;
}

const GLOBAL_SHORTCUTS: Omit<Shortcut, "action">[] = [
  { key: "n", description: "New workout", modifiers: { ctrl: true } },
  { key: "d", description: "Go to Dashboard", modifiers: { ctrl: true } },
  {
    key: "g",
    description: "Go to Guild",
    modifiers: { ctrl: true, shift: true },
  },
  {
    key: "c",
    description: "Open Combat",
    modifiers: { ctrl: true, shift: true },
  },
  { key: "s", description: "Open Settings", modifiers: { ctrl: true } },
  { key: "/", description: "Open search", modifiers: { ctrl: true } },
  { key: "Escape", description: "Close modal/cancel" },
  {
    key: "?",
    description: "Show keyboard shortcuts",
    modifiers: { shift: true },
  },
];

const WORKOUT_SHORTCUTS: Omit<Shortcut, "action">[] = [
  { key: "Enter", description: "Log set", context: "workout" },
  { key: "r", description: "Start rest timer", context: "workout" },
  {
    key: "ArrowUp",
    description: "Increase weight",
    modifiers: { alt: true },
    context: "workout",
  },
  {
    key: "ArrowDown",
    description: "Decrease weight",
    modifiers: { alt: true },
    context: "workout",
  },
  {
    key: "n",
    description: "Next exercise",
    modifiers: { alt: true },
    context: "workout",
  },
  {
    key: "p",
    description: "Previous exercise",
    modifiers: { alt: true },
    context: "workout",
  },
  {
    key: "f",
    description: "Finish workout",
    modifiers: { ctrl: true, shift: true },
    context: "workout",
  },
];

/**
 * Hook to register keyboard shortcuts.
 */
export function useKeyboardShortcuts(
  shortcuts: Shortcut[],
  enabled: boolean = true,
) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const modifiersMatch =
          (shortcut.modifiers?.ctrl ?? false) === event.ctrlKey &&
          (shortcut.modifiers?.shift ?? false) === event.shiftKey &&
          (shortcut.modifiers?.alt ?? false) === event.altKey &&
          (shortcut.modifiers?.meta ?? false) === event.metaKey;

        if (event.key === shortcut.key && modifiersMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, enabled],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleHelp = useCallback(() => setShowHelp((prev) => !prev), []);

  return {
    showHelp,
    toggleHelp,
    closeHelp: () => setShowHelp(false),
  };
}

/**
 * Get all available shortcuts for display.
 */
export function getAllShortcuts(): Array<Omit<Shortcut, "action">> {
  return [...GLOBAL_SHORTCUTS, ...WORKOUT_SHORTCUTS];
}

/**
 * Format shortcut for display.
 */
export function formatShortcut(shortcut: Omit<Shortcut, "action">): string {
  const parts: string[] = [];

  if (shortcut.modifiers?.ctrl) parts.push("Ctrl");
  if (shortcut.modifiers?.shift) parts.push("Shift");
  if (shortcut.modifiers?.alt) parts.push("Alt");
  if (shortcut.modifiers?.meta) parts.push("⌘");

  parts.push(
    shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key,
  );

  return parts.join(" + ");
}

/**
 * KeyboardShortcutsHelp component props.
 */
export function getKeyboardHelpData() {
  return {
    global: GLOBAL_SHORTCUTS,
    workout: WORKOUT_SHORTCUTS,
  };
}
