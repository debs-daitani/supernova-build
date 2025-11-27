import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import PWAInstall from "@/components/PWAInstall";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VENUED - Strategic Project Planning for ADHD Brains",
  description: "Get VENUED. Get it Done. Plan your projects like a tour. Execute like a headliner.",
  manifest: "/manifest.json",
  themeColor: "#FF1B8D",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VENUED",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    title: "VENUED - Strategic Project Planning for ADHD Brains",
    description: "Get VENUED. Get it Done. Plan your projects like a tour. Execute like a headliner.",
    type: "website",
    siteName: "VENUED",
  },
  twitter: {
    card: "summary_large_image",
    title: "VENUED - Strategic Project Planning for ADHD Brains",
    description: "Get VENUED. Get it Done. Plan your projects like a tour. Execute like a headliner.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <PWAInstall />
      </body>
    </html>
  );
}
