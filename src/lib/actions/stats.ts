"use server";

import { createServerClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export interface GlobalStats {
  totalRooms: number;
  totalFiles: number;
  totalCountries: number;
}

/**
 * Internal uncached fetch of global stats from Supabase.
 */
async function fetchGlobalStatsFromDB(): Promise<GlobalStats> {
  try {
    const supabase = createServerClient();

    // 1. Query total rooms and total files from global_stats table
    const { data: statsData } = await supabase
      .from("global_stats")
      .select("total_rooms, total_files")
      .eq("id", 1)
      .maybeSingle();

    // 2. Query total unique countries count
    const { count: countriesCount } = await supabase
      .from("global_countries")
      .select("*", { count: "exact", head: true });

    return {
      totalRooms: Number(statsData?.total_rooms || 0),
      totalFiles: Number(statsData?.total_files || 0),
      totalCountries: Number(countriesCount || 0),
    };
  } catch (error) {
    console.error("Failed to fetch global stats:", error);
    return {
      totalRooms: 0,
      totalFiles: 0,
      totalCountries: 0,
    };
  }
}

/**
 * Public cached function to retrieve global stats.
 * Uses Next.js unstable_cache with a 60-second revalidation period
 * ensuring 0ms added latency for landing page visitors.
 */
export const getGlobalStats = unstable_cache(
  async () => fetchGlobalStatsFromDB(),
  ["cipherroom-global-stats"],
  { revalidate: 60 }
);

/**
 * Increment room counter in DB (called during createRoom).
 */
export async function recordRoomCreated(userCountry?: string | null) {
  try {
    const supabase = createServerClient();
    await supabase.rpc("increment_room_count", {
      user_country: userCountry || null,
    });
  } catch (error) {
    // Non-blocking: stats failure should never prevent room creation
    console.error("Failed to record room creation stat:", error);
  }
}

/**
 * Increment file counter in DB (called during file upload).
 */
export async function recordFileTransferred() {
  try {
    const supabase = createServerClient();
    await supabase.rpc("increment_file_count");
  } catch (error) {
    // Non-blocking: stats failure should never prevent file uploads
    console.error("Failed to record file transfer stat:", error);
  }
}
