"use client";

import { getFlagEmoji, getCountryName } from "@/lib/geo";

interface UserBadgeProps {
  username: string;
  countryCode?: string | null;
  countryName?: string | null;
  isCurrentUser?: boolean;
  className?: string;
  tooltipSide?: "top" | "bottom";
}

/**
 * Renders a username with a PC-only hover tooltip displaying their country flag & name.
 * Uses `@media(hover:hover) and (pointer:fine)` so the tooltip NEVER triggers on touch devices.
 */
export function UserBadge({
  username,
  countryCode,
  countryName,
  isCurrentUser = false,
  className = "",
  tooltipSide = "top",
}: UserBadgeProps) {
  const code = countryCode || "";
  const name = countryName || (code ? getCountryName(code) : "Unknown");
  const flag = getFlagEmoji(code);

  const tooltipPositionClass =
    tooltipSide === "top"
      ? "bottom-full mb-1.5 left-0"
      : "top-full mt-1.5 left-0";

  return (
    <span className="group relative inline-flex items-center cursor-default">
      {/* Username */}
      <span className={className || "font-mono font-bold text-accent"}>
        {username}
      </span>

      {/* PC-Only Hover Tooltip */}
      {code ? (
        <span
          role="tooltip"
          className={`hidden [@media(hover:hover)_and_(pointer:fine)]:group-hover:flex 
            absolute ${tooltipPositionClass} z-50 pointer-events-none items-center gap-2
            px-2.5 py-1 bg-[#141414] border border-border shadow-[0_4px_16px_rgba(0,0,0,0.8)]
            animate-fade-in whitespace-nowrap`}
        >
          {/* Flag Emoji */}
          <span className="text-sm select-none" aria-hidden="true">
            {flag}
          </span>

          {/* Country Name */}
          <span className="text-[11px] font-mono font-bold text-foreground">
            {name}
          </span>

          {/* ISO Code Badge */}
          <span className="text-[9px] font-mono text-accent bg-accent/10 border border-accent/20 px-1 py-0.2">
            {code.toUpperCase()}
          </span>

          {isCurrentUser && (
            <span className="text-[9px] font-mono text-muted">
              (You)
            </span>
          )}
        </span>
      ) : null}
    </span>
  );
}
