"use server";

import { headers } from "next/headers";

export interface GeoLocation {
  countryCode: string | null;
  countryName: string | null;
}

/**
 * Retrieves the client's country using Vercel or Cloudflare edge headers.
 * Returns null if running locally or headers are unavailable.
 */
export async function getServerGeo(): Promise<GeoLocation> {
  try {
    const headersList = await headers();
    const code =
      headersList.get("x-vercel-ip-country") ||
      headersList.get("cf-ipcountry") ||
      null;

    if (!code || code === "XX" || code === "T1") {
      return { countryCode: null, countryName: null };
    }

    const countryCode = code.toUpperCase();
    let countryName: string | null = null;
    try {
      const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
      countryName = displayNames.of(countryCode) || countryCode;
    } catch {
      countryName = countryCode;
    }

    return { countryCode, countryName };
  } catch {
    return { countryCode: null, countryName: null };
  }
}
