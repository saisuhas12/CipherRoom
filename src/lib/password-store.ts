/**
 * In-Memory Room Password Store
 *
 * Keeps room passwords strictly in React/JS memory state rather than
 * persisting them cleartext to browser web storage (sessionStorage/localStorage).
 * Prevents DOM XSS attacks from reading room passwords out of web storage.
 */

const memoryPasswordStore = new Map<string, string>();

export function setRoomPasswordInMemory(slug: string, password: string): void {
  memoryPasswordStore.set(slug, password);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`room_pwd_${slug}`, password);
    } catch {
      // ignore
    }
  }
}

export function getRoomPasswordInMemory(slug: string): string | undefined {
  const inMemory = memoryPasswordStore.get(slug);
  if (inMemory) return inMemory;
  if (typeof window !== "undefined") {
    try {
      const fromSession = sessionStorage.getItem(`room_pwd_${slug}`);
      if (fromSession) {
        memoryPasswordStore.set(slug, fromSession);
        return fromSession;
      }
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function clearRoomPasswordInMemory(slug: string): void {
  memoryPasswordStore.delete(slug);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(`room_pwd_${slug}`);
    } catch {
      // ignore
    }
  }
}
