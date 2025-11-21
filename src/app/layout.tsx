import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The dAItaniverse - SUPERNova AI Platform',
  description: 'Your personalised AI-powered platform for growth and transformation',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
