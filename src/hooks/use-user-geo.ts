"use client";

import { useState, useEffect } from "react";
import { getServerGeo } from "@/lib/actions/geo";
import { getFlagEmoji, getCountryName, guessClientCountry } from "@/lib/geo";
import { encryptSecurePayload, decryptSecurePayload } from "@/lib/secure-storage";

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
        const cachedRaw = sessionStorage.getItem(STORAGE_KEY);
        if (cachedRaw) {
          // Decrypt and verify HMAC integrity from secure-storage
          const decrypted = decryptSecurePayload<{ countryCode: string; countryName?: string }>(cachedRaw);
          if (decrypted && decrypted.countryCode) {
            return {
              countryCode: decrypted.countryCode,
              countryName: decrypted.countryName || getCountryName(decrypted.countryCode),
              flag: getFlagEmoji(decrypted.countryCode),
              isLoading: false,
            };
          } else {
            // Tampered or legacy plaintext: remove immediately
            sessionStorage.removeItem(STORAGE_KEY);
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
            // Save encrypted and tamper-evident payload to sessionStorage
            sessionStorage.setItem(STORAGE_KEY, encryptSecurePayload(finalGeo));
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
            sessionStorage.setItem(STORAGE_KEY, encryptSecurePayload(finalGeo));
          } catch {}
        }
      } catch (err) {
        console.warn("Failed to detect geolocation, using fallback:", err);
        if (isMounted) {
          const fallback = guessClientCountry();
          const fallbackGeo: UserGeo = {
            countryCode: fallback.countryCode,
            countryName: fallback.countryName,
            flag: getFlagEmoji(fallback.countryCode),
            isLoading: false,
          };
          setGeo(fallbackGeo);
          try {
            sessionStorage.setItem(STORAGE_KEY, encryptSecurePayload(fallbackGeo));
          } catch {}
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
