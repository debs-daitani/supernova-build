'use client'

import { useState } from 'react'

interface Block {
  type: string
  data: any
}

interface LandingPage {
  id: string
  title: string
  slug: string
  content: any
  settings?: any
}

export default function PublicLandingPage({ page }: { page: LandingPage }) {
  const blocks = page.content?.blocks || []

  return (
    <div
      className="min-h-screen bg-black"
      style={{
        backgroundImage: 'url("/images/dAitaniverse Stage.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="min-h-screen backdrop-blur-sm bg-black/50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {blocks.map((block: Block, index: number) => (
            <BlockRenderer key={index} block={block} pageId={page.id} />
          ))}
        </div>
      </div>
    </div>
  )
}

function BlockRenderer({ block, pageId }: { block: Block; pageId: string }) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock data={block.data} />
    case 'text':
      return <TextBlock data={block.data} />
    case 'form':
      return <FormBlock data={block.data} pageId={pageId} />
    case 'features':
      return <FeaturesBlock data={block.data} />
    case 'cta':
      return <CTABlock data={block.data} />
    case 'image':
      return <ImageBlock data={block.data} />
    default:
      return null
  }
}

function HeroBlock({ data }: { data: any }) {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl md:text-6xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-hot-pink to-orange-400 mb-6">
        {data.headline}
      </h1>
      {data.subheadline && (
        <p className="text-xl text-gray-300 font-josefin max-w-2xl mx-auto">
          {data.subheadline}
        </p>
      )}
    </div>
  )
}

function TextBlock({ data }: { data: any }) {
  return (
    <div className="py-8">
      <p className="text-gray-300 font-josefin text-lg leading-relaxed whitespace-pre-wrap">
        {data.content}
      </p>
    </div>
  )
}

function FormBlock({ data, pageId }: { data: any; pageId: string }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/marketing/pages/${pageId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-green-500/30 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-supernova text-white mb-2">Thank You!</h3>
          <p className="text-gray-400 font-josefin">
            {data.successMessage || 'Your submission has been received.'}
          </p>
        </div>
      </div>
    )
  }

  const fields = data.fields || ['email']

  return (
    <div className="py-8">
      <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-8 max-w-md mx-auto">
        <div className="space-y-4">
          {fields.includes('name') && (
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
          )}
          {fields.includes('email') && (
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-purple-500"
              />
            </div>
          )}
          {error && (
            <p className="text-red-400 text-sm font-josefin">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : data.buttonText || 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FeaturesBlock({ data }: { data: any }) {
  const items = data.items || []

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item: string, index: number) => (
          <div
            key={index}
            className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-josefin text-white">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CTABlock({ data }: { data: any }) {
  return (
    <div className="py-8 text-center">
      <a
        href={data.buttonUrl || '#'}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-hot-pink text-white font-josefin text-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all"
      >
        {data.buttonText || 'Get Started'}
        {data.price && <span className="opacity-80">- {data.price}</span>}
      </a>
    </div>
  )
}

function ImageBlock({ data }: { data: any }) {
  if (!data.url) return null

  return (
    <div className="py-8">
      <img
        src={data.url}
        alt={data.alt || ''}
        className="max-w-full mx-auto rounded-2xl"
      />
    </div>
  )
}
