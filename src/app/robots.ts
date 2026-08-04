import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/room/"],
      },
    ],
    sitemap: "https://cipheroom.app/sitemap.xml",
  };
}
