'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MarketingPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/marketing/pages')
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-light-teal font-josefin">Redirecting...</div>
    </div>
  )
}
