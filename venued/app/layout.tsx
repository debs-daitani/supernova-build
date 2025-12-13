import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import PWAInstall from "@/components/PWAInstall";
import OnboardingFlow from "@/components/OnboardingFlow";
import NotificationManager from "@/components/NotificationManager";
import QuickCaptureButton from "@/components/QuickCaptureButton";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#FF008E",
};

export const metadata: Metadata = {
  title: "VENUED - Strategic Project Planning for VARIANT Brains",
  description: "Get VENUED. Get it Done. Strategic project planning for VARIANT brains who build like rockstars.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VENUED",
  },
  icons: {
    icon: [
      { url: "/images/VENUED_Logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/images/VENUED_Logo.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "VENUED - Strategic Project Planning for VARIANT Brains",
    description: "Get VENUED. Get it Done. Strategic project planning for VARIANT brains who build like rockstars.",
    type: "website",
    siteName: "VENUED",
  },
  twitter: {
    card: "summary_large_image",
    title: "VENUED - Strategic Project Planning for VARIANT Brains",
    description: "Get VENUED. Get it Done. Strategic project planning for VARIANT brains who build like rockstars.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-josefin">
        {/* Background Image */}
        <div className="venued-background" aria-hidden="true" />

        <OnboardingFlow />
        <NotificationManager />
        <Navigation />
        <main className="min-h-screen relative z-10">
          {children}
        </main>
        <QuickCaptureButton />
        <PWAInstall />
      </body>
    </html>
  );
}
