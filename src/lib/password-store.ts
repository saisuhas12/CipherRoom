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
}

export function getRoomPasswordInMemory(slug: string): string | undefined {
  return memoryPasswordStore.get(slug);
}

export function clearRoomPasswordInMemory(slug: string): void {
  memoryPasswordStore.delete(slug);
}
