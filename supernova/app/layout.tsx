import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
