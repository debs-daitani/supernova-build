'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function KnowledgeUpload() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [pillar, setPillar] = useState('BUSINESS')
  const [topics, setTopics] = useState('')
  const [level, setLevel] = useState('intermediate')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file || !title) {
      setError('File and title are required')
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('pillar', pillar)
      formData.append('topics', topics)
      formData.append('level', level)

      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setResult(data)
      setFile(null)
      setTitle('')
      setTopics('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-black text-white p-8"
      style={{
        backgroundImage: 'url("/images/dAitaniverse Stage.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-light-teal hover:text-hot-pink mb-4 font-josefin"
          >
            ← Back to Admin
          </button>
          <h1 className="text-4xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime mb-2">
            Upload Knowledge
          </h1>
          <p className="text-gray-400 font-josefin">Add PDFs, DOCXs, or Markdown files to the knowledge base</p>
        </div>

        {/* Upload Form */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-8">
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-2">
                Upload File *
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.md,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
              />
              <p className="text-xs text-gray-500 mt-1 font-josefin">
                Supported: PDF, DOCX, Markdown, Text
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-2">
                Program Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Too Good At Raising Hell"
                className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
              />
            </div>

            {/* Pillar */}
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-2">
                Pillar
              </label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
              >
                <option value="GENERAL">GENERAL</option>
                <option value="BODY">BODY - Body Acceptance & Self-Love</option>
                <option value="BRAIN">BRAIN - Neurovariance Intelligence</option>
                <option value="BUSINESS">BUSINESS - Life-First Entrepreneurship</option>
              </select>
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-2">
                Topics (comma-separated)
              </label>
              <input
                type="text"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="e.g., pricing, branding, positioning"
                className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
              />
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-josefin text-gray-300 mb-2">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-charcoal/60 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || !title || uploading}
              className={`w-full px-6 py-4 rounded-xl font-josefin font-bold text-sm transition-all ${
                !file || !title || uploading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-hot-pink to-light-teal text-white hover:scale-105 shadow-[0_0_30px_rgba(255,0,142,0.4)]'
              }`}
            >
              {uploading ? 'Processing...' : 'Upload & Process'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 font-josefin">
              {error}
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="mt-6 p-6 rounded-xl bg-green-500/20 border border-green-500/50">
              <h3 className="text-green-300 font-supernova text-xl mb-3">Upload Successful!</h3>
              <div className="text-sm text-gray-300 font-josefin space-y-1">
                <p>Program ID: {result.programId}</p>
                <p>Chunks Created: {result.chunksCreated}</p>
                <p>Word Count: {result.wordCount.toLocaleString()}</p>
                <p>Embedding Cost: ${result.embeddingCost.toFixed(4)}</p>
              </div>
              <button
                onClick={() => router.push('/admin/knowledge')}
                className="mt-4 px-4 py-2 rounded-lg bg-light-teal text-charcoal font-josefin font-bold hover:bg-hot-pink transition-colors"
              >
                View Knowledge Base
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
