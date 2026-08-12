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
  ],
  authors: [{ name: "CipherRoom", url: "https://www.cipheroom.app" }],
  creator: "CipherRoom",
  publisher: "CipherRoom",
  alternates: {
    canonical: "https://www.cipheroom.app",
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
      "Create temporary encrypted rooms for ephemeral file sharing and self-destructing chat. No login. Everything disappears in 24 hours.",
    url: "https://www.cipheroom.app",
    siteName: "CipherRoom",
    locale: "en_US",
    images: [
      {
        url: "/Logo.png",
        width: 512,
        height: 512,
        alt: "CipherRoom — Temporary Encrypted Rooms",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CipherRoom — Temporary Encrypted Rooms for Secure Chat & File Sharing",
    description: "Create temporary encrypted rooms for ephemeral file sharing and self-destructing chat. No login. Everything disappears in 24 hours.",
    images: ["/Logo.png"],
  },
};

// WebApplication structured data (existing, updated)
const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CipherRoom",
  "alternateName": ["Cipheroom", "Cipher Room", "CipherRoom App"],
  "url": "https://www.cipheroom.app",
  "logo": "https://www.cipheroom.app/Logo.png",
  "image": "https://www.cipheroom.app/Logo.png",
  "description":
    "CipherRoom lets you create temporary encrypted rooms for ephemeral file sharing, self-destructing chat, and collaborative notes. Zero registration required. Everything auto-deletes after expiry.",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
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
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
