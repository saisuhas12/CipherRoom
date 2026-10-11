"use client";

import { useState, useEffect } from "react";
import { getServerGeo } from "@/lib/actions/geo";
import { getFlagEmoji, getCountryName, guessClientCountry } from "@/lib/geo";

export interface UserGeo {
  countryCode: string;
  countryName: string;
  flag: string;
  isLoading: boolean;
}

const STORAGE_KEY = "cipherroom_user_geo";

export function useUserGeo(): UserGeo {
  const [geo, setGeo] = useState<UserGeo>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.countryCode) {
            return {
              countryCode: parsed.countryCode,
              countryName: parsed.countryName || getCountryName(parsed.countryCode),
              flag: getFlagEmoji(parsed.countryCode),
              isLoading: false,
            };
          }
        }
      } catch {
        // Fallback to loading
      }
    }
    return {
      countryCode: "",
      countryName: "",
      flag: "🌐",
      isLoading: true,
    };
  });

  useEffect(() => {
    let isMounted = true;

    async function detectGeo() {
      // If already resolved from sessionStorage, do nothing
      if (!geo.isLoading && geo.countryCode) return;

      try {
        // 1. Try server edge header via Server Action
        const serverResult = await getServerGeo();
        if (serverResult.countryCode && isMounted) {
          const finalGeo: UserGeo = {
            countryCode: serverResult.countryCode,
            countryName: serverResult.countryName || getCountryName(serverResult.countryCode),
            flag: getFlagEmoji(serverResult.countryCode),
            isLoading: false,
          };
          setGeo(finalGeo);
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(finalGeo));
          } catch {}
          return;
        }

        // 2. Fallback to client heuristics (useful for localhost development)
        const clientGuess = guessClientCountry();
        if (isMounted) {
          const finalGeo: UserGeo = {
            countryCode: clientGuess.countryCode,
            countryName: clientGuess.countryName,
            flag: getFlagEmoji(clientGuess.countryCode),
            isLoading: false,
          };
          setGeo(finalGeo);
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(finalGeo));
          } catch {}
        }
      } catch (err) {
        console.warn("Failed to detect geolocation, using fallback:", err);
        if (isMounted) {
          const fallback = guessClientCountry();
          setGeo({
            countryCode: fallback.countryCode,
            countryName: fallback.countryName,
            flag: getFlagEmoji(fallback.countryCode),
            isLoading: false,
          });
        }
      }
    }

    detectGeo();

    return () => {
      isMounted = false;
    };
  }, [geo.isLoading, geo.countryCode]);

  return geo;
}
