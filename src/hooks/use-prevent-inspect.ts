"use client";

import { useEffect } from "react";

/**
 * Custom hook to disable right-click context menu and common developer tool
 * keyboard shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C).
 * Provides a hardened "vault-like" UX deterrence for sensitive room pages.
 */
export function usePreventInspect(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    // 1. Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Block Inspect & DevTools keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
      const altOrOpt = e.altKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      // F12 key
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I or Cmd+Option+I (Inspect)
      if (ctrlOrCmd && (shift || altOrOpt) && key === "i") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+J or Cmd+Option+J (Console)
      if (ctrlOrCmd && (shift || altOrOpt) && key === "j") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+C or Cmd+Option+C (Inspect Element Picker)
      if (ctrlOrCmd && (shift || altOrOpt) && key === "c") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U or Cmd+Option+U (View Source)
      if (ctrlOrCmd && (key === "u" || (altOrOpt && key === "u"))) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S or Cmd+S (Save Web Page)
      if (ctrlOrCmd && key === "s") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
}
