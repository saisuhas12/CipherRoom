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
  metadataBase: new URL("https://cipheroom.app"),
  title: {
    default: "CipherRoom — Temporary Encrypted Workspaces & File Sharing",
    template: "%s | CipherRoom",
  },
  description:
    "Create password-protected temporary rooms for encrypted file sharing, realtime chat, and collaborative notes. No login required. Everything auto-deletes after 24 hours.",
  keywords: [
    "cipheroom",
    "cipherroom",
    "cipher room",
    "cipheroom.app",
    "cipher room app",
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
  authors: [{ name: "CipherRoom", url: "https://cipheroom.app" }],
  creator: "CipherRoom",
  publisher: "CipherRoom",
  alternates: {
    canonical: "https://cipheroom.app",
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
    title: "CipherRoom — Temporary Encrypted Workspaces & File Sharing",
    description:
      "Create a room. Share instantly. Everything disappears in 24 hours. Zero login required.",
    url: "https://cipheroom.app",
    siteName: "CipherRoom",
    locale: "en_US",
    images: [
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
    title: "CipherRoom — Temporary Encrypted Workspaces & File Sharing",
    description: "Create a room. Share instantly. Everything disappears in 24 hours. Zero login required.",
    images: ["/Logo.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CipherRoom",
  "alternateName": ["Cipheroom", "Cipher Room", "CipherRoom App"],
  "url": "https://cipheroom.app",
  "logo": "https://cipheroom.app/Logo.png",
  "image": "https://cipheroom.app/Logo.png",
  "description":
    "Create password-protected temporary rooms for encrypted file sharing, realtime chat, and collaborative notes. Zero registration required. Everything auto-deletes after expiry.",
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
    "url": "https://cipheroom.app",
  },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
