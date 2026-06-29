type SecurityEvent =
  | "room_created"
  | "room_join_success"
  | "room_join_failed"
  | "room_locked"
  | "room_deleted"
  | "file_uploaded"
  | "file_deleted"
  | "file_download"
  | "note_edit"
  | "room_expired_access";

type LogEntry = {
  event: SecurityEvent;
  ip: string;
  timestamp: string;
  details: Record<string, any>;
};

/**
 * Logs a structured security audit event to the console.
 * Automatically ensures no passwords or raw encryption keys are ever logged.
 */
export function logSecurityEvent(
  event: SecurityEvent,
  ip: string,
  details: Record<string, any>
) {
  // Defensive check: strip any keys containing sensitive names
  const sanitizedDetails: Record<string, any> = {};
  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("key") ||
      lowerKey.includes("token") ||
      lowerKey.includes("secret")
    ) {
      sanitizedDetails[key] = "[REDACTED]";
    } else {
      sanitizedDetails[key] = value;
    }
  }

  const logEntry: LogEntry = {
    event,
    ip,
    timestamp: new Date().toISOString(),
    details: sanitizedDetails,
  };

  console.log(JSON.stringify(logEntry));
}
