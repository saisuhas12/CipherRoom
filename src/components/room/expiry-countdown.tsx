"use client";

import { useState, useEffect } from "react";
import { formatTimeRemaining } from "@/lib/utils";

interface ExpiryCountdownProps {
  expiresAt: string;
}

export function ExpiryCountdown({ expiresAt }: ExpiryCountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [urgency, setUrgency] = useState<"normal" | "warning" | "critical">(
    "normal"
  );

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("Expired");
        return;
      }

      setTimeLeft(formatTimeRemaining(expiresAt));

      // Set urgency level
      const hoursLeft = diff / (1000 * 60 * 60);
      if (hoursLeft <= 0.5) {
        setUrgency("critical");
      } else if (hoursLeft <= 1) {
        setUrgency("warning");
      } else {
        setUrgency("normal");
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

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
