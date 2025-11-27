import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

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
  title: 'SUPERNova AI - Intelligent Coaching Assistant',
  description: 'Your bold, direct, anti-BS coach for Body, Brain, and Business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${supernova.variable} ${arpDisplay.variable}`}>
      <body>{children}</body>
    </html>
  )
}
