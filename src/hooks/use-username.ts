"use client";

import { useSyncExternalStore, useCallback } from "react";
import { usernameSchema } from "@/lib/validations";
import {
  encryptUsernamePayload,
  decryptUsernamePayload,
} from "@/lib/secure-storage";

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
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(USERNAME_KEY);
  if (!stored) return null;

  // Verify and decrypt encrypted payload
  const decrypted = decryptUsernamePayload(stored, EXPIRY_MS);
  if (decrypted) {
    return decrypted.username;
  }

  // If value was plain text or tampered (e.g. manually edited in DevTools),
  // reject it, purge storage, and return null.
  try {
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(USERNAME_TIMESTAMP_KEY);
  } catch {
    // Ignore storage errors
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

    // Encrypt username and timestamp with device-bound HMAC key before storing
    const { encryptedUsername, encryptedTimestamp } = encryptUsernamePayload(
      result.data,
      Date.now()
    );

    localStorage.setItem(USERNAME_KEY, encryptedUsername);
    localStorage.setItem(USERNAME_TIMESTAMP_KEY, encryptedTimestamp);
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
