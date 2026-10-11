/**
 * Geolocation & Country Utilities
 * Converts ISO 3166-1 alpha-2 country codes to Unicode flag emojis and human-readable names.
 */

/**
 * Converts a 2-letter country code (e.g., "US", "IN") into a Unicode emoji flag.
 */
export function getFlagEmoji(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const upper = countryCode.toUpperCase();
  const codePoints = [...upper].map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Returns the human-readable English name for a 2-letter country code.
 */
export function getCountryName(countryCode: string | null | undefined): string {
  if (!countryCode) return "Unknown";
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(countryCode.toUpperCase()) || countryCode.toUpperCase();
  } catch {
    return countryCode.toUpperCase();
  }
}

/**
 * Common timezone prefix to country code mapping for local development fallback.
 */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Los_Angeles": "US",
  "America/Denver": "US",
  "America/Phoenix": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "Europe/London": "GB",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Rome": "IT",
  "Europe/Madrid": "ES",
  "Europe/Amsterdam": "NL",
  "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR",
  "Asia/Singapore": "SG",
  "Asia/Dubai": "AE",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "America/Sao_Paulo": "BR",
};

/**
 * Infers a reasonable country code in browser environments when edge headers are absent (e.g. localhost dev).
 */
export function guessClientCountry(): { countryCode: string; countryName: string } {
  if (typeof window === "undefined") {
    return { countryCode: "US", countryName: "United States" };
  }

  // 1. Try timezone matching
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_COUNTRY[tz]) {
      const code = TIMEZONE_TO_COUNTRY[tz];
      return { countryCode: code, countryName: getCountryName(code) };
    }
  } catch {
    // Continue to next heuristic
  }

  // 2. Try browser language tag (e.g. "en-IN", "fr-FR")
  try {
    const lang = navigator.language || (navigator.languages && navigator.languages[0]) || "";
    const parts = lang.split("-");
    if (parts.length > 1 && parts[1].length === 2) {
      const code = parts[1].toUpperCase();
      return { countryCode: code, countryName: getCountryName(code) };
    }
  } catch {
    // Continue
  }

  return { countryCode: "US", countryName: "United States" };
}
