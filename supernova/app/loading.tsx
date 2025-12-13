'use client'

import { useState, useEffect } from 'react'

const loadingMessages = [
  "The dAItaniverse is soundchecking...",
  "The dAItaniverse is getting ready to rock...",
  "The dAItaniverse is getting its shit together...",
  "The dAItaniverse is preparing your stage...",
]

export default function Loading() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Pick a random message on mount
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    setMessage(randomMessage)
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <img
        src="/images/logo-full-400.png"
        alt="The dAItaniverse"
        className="max-w-[400px] w-full mb-8 animate-pulse"
      />
      <p className="text-[#888888] text-lg font-josefin">
        {message}
      </p>
    </div>
  )
}
