'use client'

import { useState, useEffect } from 'react'

const loadingQuotes = [
  "Getting its shit together...",
  "Tuning the instruments...",
  "Warming up the crowd...",
  "Setting the stage...",
  "Sound check in progress...",
  "Rolling out the red carpet...",
  "Backstage preparations...",
  "Almost showtime...",
  "Plugging in the amps...",
  "The band is arriving...",
  "Adjusting the lighting...",
  "Roadies at work...",
  "Building your empire...",
  "Firing up the engines...",
  "Summoning the magic...",
]

export default function Loading() {
  const [quote, setQuote] = useState('')
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    // Pick a random quote on mount
    const randomQuote = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)]
    setQuote(randomQuote)

    // Cycle through quotes every 2.5 seconds
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        const newQuote = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)]
        setQuote(newQuote)
        setFadeIn(true)
      }, 300)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <img
        src="/images/logo-full-400.png"
        alt="The dAItaniverse"
        className="max-w-[400px] w-full mb-8 animate-pulse"
      />
      <p
        className={`text-lg font-josefin transition-opacity duration-300 ${
          fadeIn ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, #FF008E, #00F0E9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {quote}
      </p>
    </div>
  )
}
