import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
  ],
  robots: "index, follow",
  openGraph: {
    title: "CipherRoom — Temporary Encrypted Workspaces",
    description:
      "Create a room. Share instantly. Everything disappears in 24 hours.",
    type: "website",
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
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
