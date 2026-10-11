"use client";

import { useState, useEffect, useCallback } from "react";
import { formatTimeRemaining } from "@/lib/utils";

interface ExpiryCountdownProps {
  expiresAt: string;
  onUrgencyChange?: (urgency: "normal" | "warning" | "critical") => void;
  onExpired?: () => void;
}

export function ExpiryCountdown({ expiresAt, onUrgencyChange, onExpired }: ExpiryCountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [urgency, setUrgency] = useState<"normal" | "warning" | "critical">(
    "normal"
  );

  const handleUrgencyChange = useCallback(
    (newUrgency: "normal" | "warning" | "critical") => {
      onUrgencyChange?.(newUrgency);
    },
    [onUrgencyChange]
  );

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("Expired");
        onExpired?.();
        return;
      }

      setTimeLeft(formatTimeRemaining(expiresAt));

      // Set urgency level
      const minutesLeft = diff / (1000 * 60);
      if (minutesLeft <= 30) {
        if (urgency !== "critical") {
          setUrgency("critical");
          handleUrgencyChange("critical");
        }
      } else if (minutesLeft <= 60) {
        if (urgency !== "warning") {
          setUrgency("warning");
          handleUrgencyChange("warning");
        }
      } else {
        if (urgency !== "normal") {
          setUrgency("normal");
          handleUrgencyChange("normal");
        }
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, urgency, handleUrgencyChange, onExpired]);

  if (isExpired) {
    return (
      <div className="px-3 py-2 border border-red-500/30 bg-red-500/5">
        <p className="text-xs font-mono text-red-400">EXPIRED</p>
      </div>
    );
  }

  return (
    <div
      className={`px-3 py-2 border ${
        urgency === "critical"
          ? "border-red-500/30 bg-red-500/5"
          : urgency === "warning"
            ? "border-yellow-500/30 bg-yellow-500/5"
            : "border-border"
      }`}
    >
      <p className="text-[10px] font-mono text-muted mb-0.5">EXPIRES IN</p>
      <p
        className={`text-sm font-mono font-bold tracking-wider ${
          urgency === "critical"
            ? "text-red-400"
            : urgency === "warning"
              ? "text-yellow-400"
              : "text-foreground"
        }`}
      >
        {timeLeft}
      </p>
    </div>
  );
}
