import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cipheroom.app"),
  title: {
    default: "CipherRoom — Temporary Encrypted Rooms for Secure Chat & File Sharing",
    template: "%s | CipherRoom",
  },
  description:
    "CipherRoom lets you create temporary encrypted rooms for ephemeral file sharing, self-destructing chat, and collaborative notes. No login required. Everything auto-deletes after 24 hours.",
  keywords: [
    "cipheroom",
    "cipheroom encryption",
    "cipherroom",
    "cipherroom temp chats",
    "cipher room",
    "cipheroom.app",
    "temporary encrypted rooms",
    "ephemeral file sharing",
    "self-destructing chat",
    "auto-delete file sharing",
    "encrypted temporary workspace",
    "zero knowledge file sharing",
    "anonymous chat room",
    "temporary file transfer",
    "self-destructing messages",
    "secure collaboration",
    "private password protected room",
    "no signup file sharing",
    "end-to-end encrypted sharing",
    "ephemeral workspace",
    "privnote alternative",
    "wetransfer encrypted alternative",
    "wormhole file transfer alternative",
    "burn note alternative",
    "send files anonymously free",
    "disposable chat room online",
    "burner chat room",
    "browser based aes 256 encryption",
    "e2ee file sharing no account",
    "temporary note sharing self destruct",
    "confidential document transfer free",
  ],
  authors: [{ name: "CipherRoom", url: "https://www.cipheroom.app" }],
  creator: "CipherRoom",
  publisher: "CipherRoom",
  alternates: {
    canonical: "https://www.cipheroom.app",
    languages: {
      "x-default": "https://www.cipheroom.app",
      "en-US": "https://www.cipheroom.app",
      "en-GB": "https://www.cipheroom.app",
      "en-CA": "https://www.cipheroom.app",
      "en-AU": "https://www.cipheroom.app",
      "de": "https://www.cipheroom.app",
      "fr": "https://www.cipheroom.app",
      "es": "https://www.cipheroom.app",
      "ja": "https://www.cipheroom.app",
      "hi": "https://www.cipheroom.app",
      "pt": "https://www.cipheroom.app",
      "it": "https://www.cipheroom.app",
      "ko": "https://www.cipheroom.app",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
  openGraph: {
    title: "CipherRoom — Temporary Encrypted Rooms for Secure Chat & File Sharing",
    description:
      "Create temporary encrypted rooms for ephemeral file sharing and self-destructing chat. Zero accounts. End-to-end AES-256-GCM. Everything auto-deletes in 24 hours.",
    url: "https://www.cipheroom.app",
    siteName: "CipherRoom",
    locale: "en_US",
    alternateLocale: [
      "en_GB",
      "en_CA",
      "en_AU",
      "de_DE",
      "fr_FR",
      "es_ES",
      "ja_JP",
      "hi_IN",
      "pt_BR",
      "it_IT",
      "ko_KR",
    ],
    images: [
      {
        url: "https://www.cipheroom.app/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CipherRoom — Temporary Encrypted Rooms for Secure Chat & Ephemeral File Sharing",
        type: "image/png",
      },
      {
        url: "/Logo.png",
        width: 512,
        height: 512,
        alt: "CipherRoom Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CipherRoom — Temporary Encrypted Rooms for Secure Chat & File Sharing",
    description:
      "Create temporary encrypted rooms for ephemeral file sharing and self-destructing chat. Zero accounts. End-to-end AES-256-GCM. Everything auto-deletes in 24 hours.",
    images: ["https://www.cipheroom.app/opengraph-image"],
    creator: "@cipheroom",
  },
};

// WebApplication structured data (expanded with global features & schema)
const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CipherRoom",
  "alternateName": ["Cipheroom", "Cipher Room", "CipherRoom App"],
  "url": "https://www.cipheroom.app",
  "logo": "https://www.cipheroom.app/Logo.png",
  "image": "https://www.cipheroom.app/opengraph-image",
  "description":
    "CipherRoom lets you create temporary encrypted rooms for ephemeral file sharing, self-destructing chat, and collaborative notes. Zero registration required. Everything auto-deletes after expiry.",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "countriesSupported": "Worldwide",
  "inLanguage": ["en", "es", "de", "fr", "ja", "pt", "hi", "it", "ko"],
  "featureList": [
    "Client-Side AES-256-GCM File Encryption via Web Crypto API",
    "Zero Registration and Zero User Accounts",
    "Real-Time Ephemeral Chat with Self-Destructing Timers",
    "Collaborative Real-Time Encrypted Notes",
    "Automatic Expiration & Cascading Storage Purge (1h, 6h, 24h)",
    "In-Browser Instant Decrypted File Previews",
    "24/7 Global Public Live Chat Preview Lobby",
    "100% Free & Open Worldwide Access"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "142",
    "bestRating": "5"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "author": {
    "@type": "Organization",
    "name": "CipherRoom",
    "url": "https://www.cipheroom.app",
  },
};

// Organization structured data (enables knowledge panels)
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CipherRoom",
  "alternateName": ["Cipheroom", "Cipher Room"],
  "url": "https://www.cipheroom.app",
  "logo": "https://www.cipheroom.app/Logo.png",
  "description": "Privacy-first temporary encrypted rooms for secure file sharing and self-destructing chat.",
  "founder": {
    "@type": "Person",
    "name": "Sai Suhas Sharma",
    "url": "https://saisuhas-one.vercel.app/",
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "saisuhas1212@gmail.com",
    "contactType": "customer support",
    "url": "https://www.cipheroom.app/contact",
  },
  "sameAs": [
    "https://saisuhas-one.vercel.app/",
  ],
};

// WebSite structured data (enables sitelinks search box)
const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "CipherRoom",
  "alternateName": "Cipheroom",
  "url": "https://www.cipheroom.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        {/* Anti-fingerprinting: hides framework and server version metadata from extensions like Wappalyzer */}
        <script
          id="anti-fingerprint"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var _next = window.next;
                  Object.defineProperty(window, 'next', {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                      if (_next && typeof _next === 'object') {
                        try { delete _next.version; } catch(e){}
                      }
                      return _next;
                    },
                    set: function(v) {
                      if (v && typeof v === 'object') {
                        try { delete v.version; } catch(e){}
                        try { Object.defineProperty(v, 'version', { get: function() { return undefined; }, configurable: true }); } catch(e){}
                      }
                      _next = v;
                    }
                  });
                  if (window.React) {
                    try { delete window.React.version; } catch(e){}
                  }
                  if (window.__NEXT_DATA__) {
                    try { delete window.__NEXT_DATA__.version; } catch(e){}
                    try { delete window.__NEXT_DATA__.buildId; } catch(e){}
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
