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
  title: "CipherRoom — Temporary Encrypted Workspaces",
  description:
    "Create password-protected rooms for sharing files, messages, and notes. No login required. Everything auto-deletes after 24 hours.",
  keywords: [
    "encrypted",
    "temporary",
    "file sharing",
    "secure chat",
    "privacy",
    "no registration",
    "anonymous chat",
    "encrypted file sharing",
    "temporary workspace",
    "self-destructing messages",
    "secure collaboration",
    "private room",
    "no signup",
    "end-to-end encryption",
  ],
  authors: [{ name: "CipherRoom" }],
  creator: "CipherRoom",
  robots: "index, follow",
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
    title: "CipherRoom — Temporary Encrypted Workspaces",
    description:
      "Create a room. Share instantly. Everything disappears in 24 hours.",
    url: "https://cipheroom.app",
    siteName: "CipherRoom",
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
    title: "CipherRoom — Temporary Encrypted Workspaces",
    description: "Create a room. Share instantly. Everything disappears in 24 hours.",
    images: ["/Logo.png"],
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
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
