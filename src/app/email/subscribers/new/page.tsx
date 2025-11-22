'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Plus, Upload } from 'lucide-react'

export default function AddSubscriberPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'single' | 'import'>('single')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Single subscriber form
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    tags: '',
  })

  // CSV import
  const [csvData, setCsvData] = useState('')
  const [importResults, setImportResults] = useState<any>(null)

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/email/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add subscriber')
      }

      setSuccess('Subscriber added successfully!')
      setTimeout(() => router.push('/email/subscribers'), 1500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleImportCSV = async () => {
    setError('')
    setLoading(true)
    setImportResults(null)

    try {
      // Parse CSV
      const lines = csvData.trim().split('\n')
      if (lines.length < 2) {
        throw new Error('CSV must have headers and at least one row')
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
      const subscribers = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
        const sub: any = {}

        headers.forEach((header, index) => {
          if (header === 'email') sub.email = values[index]
          if (header === 'firstname' || header === 'first name') sub.firstName = values[index]
          if (header === 'lastname' || header === 'last name') sub.lastName = values[index]
          if (header === 'tags') {
            sub.tags = values[index]?.split(';').map((t) => t.trim()).filter(Boolean) || []
          }
        })

        return sub
      }).filter((sub) => sub.email)

      // Import
      const response = await fetch('/api/email/subscribers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscribers }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to import subscribers')
      }

      const results = await response.json()
      setImportResults(results)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/email/subscribers"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subscribers
          </Link>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Add Subscribers</h1>
              <p className="text-gray-600">Add individual subscribers or import from CSV</p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 mb-6">
          <div className="border-b-2 border-gray-200 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'single'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Mail className="w-5 h-5 inline-block mr-2" />
                Add Single
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'import'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Upload className="w-5 h-5 inline-block mr-2" />
                Import CSV
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Single Subscriber Form */}
            {activeTab === 'single' && (
              <form onSubmit={handleAddSingle} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="subscriber@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="customer, newsletter, vip"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple tags with commas
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Subscriber'}
                  </button>
                  <Link
                    href="/email/subscribers"
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            )}

            {/* CSV Import */}
            {activeTab === 'import' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV Format Instructions
                  </label>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 mb-2">
                      Your CSV should have these columns (first row):
                    </p>
                    <code className="text-xs bg-white px-2 py-1 rounded">
                      email,firstName,lastName,tags
                    </code>
                    <p className="text-xs text-blue-700 mt-2">
                      Example: john@example.com,John,Doe,customer;vip
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste CSV Data
                  </label>
                  <textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    rows={12}
                    placeholder="email,firstName,lastName,tags&#10;john@example.com,John,Doe,customer;vip&#10;jane@example.com,Jane,Smith,newsletter"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500 font-mono text-sm"
                  />
                </div>

                {importResults && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                    <h3 className="font-bold text-green-900 mb-3">Import Results</h3>
                    <div className="space-y-2 text-sm text-green-800">
                      <p>Total: {importResults.total}</p>
                      <p>Added: {importResults.added}</p>
                      <p>Skipped: {importResults.skipped}</p>
                      {importResults.errors.length > 0 && (
                        <div className="mt-4">
                          <p className="font-medium mb-2">Errors:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            {importResults.errors.slice(0, 10).map((err: string, i: number) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => router.push('/email/subscribers')}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                    >
                      View Subscribers
                    </button>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleImportCSV}
                    disabled={!csvData.trim() || loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Importing...' : 'Import Subscribers'}
                  </button>
                  <Link
                    href="/email/subscribers"
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
