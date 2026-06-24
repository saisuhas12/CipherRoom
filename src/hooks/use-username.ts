"use client";

import { useSyncExternalStore, useCallback } from "react";
import { usernameSchema } from "@/lib/validations";

const USERNAME_KEY = "cipherroom_username";
const USERNAME_TIMESTAMP_KEY = "cipherroom_username_ts";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// External store listeners for useSyncExternalStore
let listeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  listeners = [...listeners, callback];
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function getSnapshot(): string | null {
  const stored = localStorage.getItem(USERNAME_KEY);
  const timestamp = localStorage.getItem(USERNAME_TIMESTAMP_KEY);
  if (stored && timestamp) {
    const elapsed = Date.now() - parseInt(timestamp, 10);
    if (elapsed < EXPIRY_MS) return stored;
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(USERNAME_TIMESTAMP_KEY);
  }
  return null;
}

function getServerSnapshot(): string | null {
  return null;
}

export function useUsername() {
  const username = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isLoading = false;
  const needsUsername = username === null;

  const setUsername = useCallback((name: string) => {
    const result = usernameSchema.safeParse(name);
    if (!result.success) {
      const issues = result.error.issues;
      const message = issues && issues.length > 0 ? issues[0].message : "Invalid username";
      return { error: message };
    }

    localStorage.setItem(USERNAME_KEY, name);
    localStorage.setItem(USERNAME_TIMESTAMP_KEY, Date.now().toString());
    emitChange();
    return { success: true as const };
  }, []);

  const clearUsername = useCallback(() => {
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(USERNAME_TIMESTAMP_KEY);
    emitChange();
  }, []);

  return { username, isLoading, needsUsername, setUsername, clearUsername };
}
