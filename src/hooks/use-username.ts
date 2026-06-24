"use client";

import { useState, useEffect, useCallback } from "react";
import { usernameSchema } from "@/lib/validations";

const USERNAME_KEY = "cipherroom_username";
const USERNAME_TIMESTAMP_KEY = "cipherroom_username_ts";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useUsername() {
  const [username, setUsernameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(USERNAME_KEY);
    const timestamp = localStorage.getItem(USERNAME_TIMESTAMP_KEY);

    if (stored && timestamp) {
      const elapsed = Date.now() - parseInt(timestamp, 10);
      if (elapsed < EXPIRY_MS) {
        setUsernameState(stored);
        setNeedsUsername(false);
      } else {
        // Expired
        localStorage.removeItem(USERNAME_KEY);
        localStorage.removeItem(USERNAME_TIMESTAMP_KEY);
        setNeedsUsername(true);
      }
    } else {
      setNeedsUsername(true);
    }

    setIsLoading(false);
  }, []);

  const setUsername = useCallback((name: string) => {
    const result = usernameSchema.safeParse(name);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    localStorage.setItem(USERNAME_KEY, name);
    localStorage.setItem(USERNAME_TIMESTAMP_KEY, Date.now().toString());
    setUsernameState(name);
    setNeedsUsername(false);
    return { success: true };
  }, []);

  const clearUsername = useCallback(() => {
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(USERNAME_TIMESTAMP_KEY);
    setUsernameState(null);
    setNeedsUsername(true);
  }, []);

  return { username, isLoading, needsUsername, setUsername, clearUsername };
}
