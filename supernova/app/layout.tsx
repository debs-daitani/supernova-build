import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import PWAProvider from './components/PWAProvider'

// Load custom fonts
const supernova = localFont({
  src: '../public/fonts/Supernova - Personal Used.ttf',
  variable: '--font-supernova',
  display: 'swap',
})

const arpDisplay = localFont({
  src: '../public/fonts/ARPDisplay-240.ttf',
  variable: '--font-arp-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The dAItaniverse - Authentic Impactful AI',
  description: 'Your bold, direct, anti-BS coach for Body, Brain, and Business',
  icons: {
    icon: '/images/logo-icon-40.png',
    apple: '/images/logo-icon-180.png',
  },
  manifest: '/manifest.json',
  themeColor: '#1a0a2e',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'dAItaniverse',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${supernova.variable} ${arpDisplay.variable}`}>
      <body>
        <PWAProvider>{children}</PWAProvider>
      </body>
    </html>
  )
}
