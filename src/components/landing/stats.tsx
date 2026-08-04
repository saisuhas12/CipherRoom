"use client";

import { useEffect, useState } from "react";
import { GlobalStats } from "@/lib/actions/stats";

interface StatsProps {
  stats: GlobalStats;
}

export function LandingStats({ stats }: StatsProps) {
  const [animatedStats, setAnimatedStats] = useState({
    rooms: 0,
    files: 0,
    countries: 0,
  });

  const targetRooms = Math.max(stats.totalRooms, 0);
  const targetFiles = Math.max(stats.totalFiles, 0);
  const targetCountries = Math.max(stats.totalCountries, 0);

  useEffect(() => {
    const duration = 1200; // ms
    const steps = 30;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out quadratic formula
      const easeProgress = 1 - (1 - progress) * (1 - progress);

      setAnimatedStats({
        rooms: Math.round(targetRooms * easeProgress),
        files: Math.round(targetFiles * easeProgress),
        countries: Math.round(targetCountries * easeProgress),
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [targetRooms, targetFiles, targetCountries]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 px-4">
      <div className="grid grid-cols-3 divide-x divide-border border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-6 text-center">
        {/* Rooms Stat */}
        <div className="flex flex-col items-center justify-center px-2">
          <span className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-accent tracking-tight">
            {animatedStats.rooms}
            <span className="text-accent/80 text-xl sm:text-2xl ml-0.5">+</span>
          </span>
          <span className="mt-1 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted">
            Rooms Created
          </span>
        </div>

        {/* Files Stat */}
        <div className="flex flex-col items-center justify-center px-2">
          <span className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-accent tracking-tight">
            {animatedStats.files}
            <span className="text-accent/80 text-xl sm:text-2xl ml-0.5">+</span>
          </span>
          <span className="mt-1 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted">
            Files Transferred
          </span>
        </div>

        {/* Countries Stat */}
        <div className="flex flex-col items-center justify-center px-2">
          <span className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-accent tracking-tight">
            {animatedStats.countries}
            <span className="text-accent/80 text-xl sm:text-2xl ml-0.5">+</span>
          </span>
          <span className="mt-1 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted">
            Countries
          </span>
        </div>
      </div>
    </div>
  );
}
