"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getGlobalStats, GlobalStats } from "@/lib/actions/stats";
import { LandingStats } from "@/components/landing/stats";

export function Hero() {
  const [stats, setStats] = useState<GlobalStats>({
    totalRooms: 0,
    totalFiles: 0,
    totalCountries: 0,
  });

  useEffect(() => {
    getGlobalStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => {
        console.error("Failed to load stats:", err);
      });
  }, []);

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16">
      <div className="text-center max-w-2xl mx-auto">
        {/* Terminal prompt accent */}
        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 border border-border text-xs font-mono text-muted">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span>SECURE · TEMPORARY · ZERO-KNOWLEDGE</span>
        </div>

        {/* Main title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-foreground tracking-tighter leading-none">
          CIPHE<span className="text-accent">ROOM</span>
        </h1>

        {/* Keyword-bearing subtitle for SEO */}
        <p className="mt-3 text-sm sm:text-base font-mono text-muted/70 tracking-wide">
          Temporary Encrypted Rooms for Secure Chat &amp; File Sharing
        </p>

        {/* Tagline */}
        <p className="mt-6 text-lg text-muted leading-relaxed max-w-lg mx-auto">
          Create a room. Share instantly.
          <br />
          Everything disappears in 24 hours.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10 justify-center">
          <button
            id="hero-create-room"
            suppressHydrationWarning
            className="px-8 py-3.5 bg-accent text-background font-mono font-bold text-sm hover:bg-accent/90 transition-colors cursor-pointer"
          >
            Create Room
          </button>
          <button
            id="hero-join-room"
            suppressHydrationWarning
            className="px-8 py-3.5 border border-border text-foreground font-mono font-bold text-sm hover:border-accent hover:text-accent transition-colors cursor-pointer"
          >
            Join Room
          </button>
        </div>

        {/* Live Stats Component */}
        <LandingStats stats={stats} />

        {/* Stats bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-10 text-xs font-mono text-muted">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            No Login Required
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            End-to-End Encrypted
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            Auto-Delete
          </div>
        </div>
      </div>
    </section>
  );
}
