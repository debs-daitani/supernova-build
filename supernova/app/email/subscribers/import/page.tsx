'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'

export default function ImportSubscribersPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data)
        setHeaders(results.meta.fields || [])
      }
    })
  }

  const handleImport = async () => {
    if (!csvData.length) return

    setImporting(true)
    try {
      const subscribers = csvData.map((row) => ({
        email: row[fieldMapping.email],
        firstName: fieldMapping.firstName ? row[fieldMapping.firstName] : null,
        lastName: fieldMapping.lastName ? row[fieldMapping.lastName] : null,
        tags: fieldMapping.tags && row[fieldMapping.tags] ? row[fieldMapping.tags].split(',').map((t: string) => t.trim()) : [],
        source: 'IMPORT'
      }))

      const res = await fetch('/api/email/subscribers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscribers })
      })

      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error('Error importing subscribers:', error)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/email/subscribers"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-supernova text-white">Import Subscribers</h2>
          <p className="text-sm text-gray-400 font-josefin">Upload a CSV file to import subscribers</p>
        </div>
      </div>

      {!result ? (
        <>
          {/* Upload Section */}
          {!file && (
            <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-8">
              <div className="border-2 border-dashed border-light-teal/30 rounded-lg p-12 text-center">
                <Upload size={48} className="mx-auto text-light-teal mb-4" />
                <p className="text-white font-josefin mb-4">Drop your CSV file here or click to upload</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-black font-bold font-josefin cursor-pointer hover:shadow-lg hover:shadow-hot-pink/50 transition-all"
                >
                  Choose File
                </label>
              </div>
            </div>
          )}

          {/* Field Mapping */}
          {file && csvData.length > 0 && (
            <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
              <h3 className="text-xl font-supernova text-hot-pink mb-6">Map Fields</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-josefin text-gray-400 mb-2">Email (Required)</label>
                  <select
                    value={fieldMapping.email || ''}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin"
                  >
                    <option value="">Select field...</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-400 mb-2">First Name</label>
                  <select
                    value={fieldMapping.firstName || ''}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, firstName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin"
                  >
                    <option value="">Select field...</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-josefin text-gray-400 mb-2">Last Name</label>
                  <select
                    value={fieldMapping.lastName || ''}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, lastName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin"
                  >
                    <option value="">Select field...</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-400 font-josefin mb-2">Preview: {csvData.length} rows found</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {headers.slice(0, 5).map((header) => (
                          <th key={header} className="text-left py-2 px-3 text-gray-400 font-josefin">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                          {headers.slice(0, 5).map((header) => (
                            <td key={header} className="py-2 px-3 text-white font-josefin">{row[header]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={handleImport}
                disabled={!fieldMapping.email || importing}
                className="w-full mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-black font-bold font-josefin disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-hot-pink/50 transition-all"
              >
                {importing ? 'Importing...' : 'Import Subscribers'}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Results */
        <div className="backdrop-blur-xl bg-white/5 border border-hot-pink/20 rounded-2xl p-6">
          <h3 className="text-xl font-supernova text-hot-pink mb-6">Import Complete</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg">
              <CheckCircle className="text-green-400" size={24} />
              <div>
                <p className="text-white font-josefin font-bold">{result.imported} Imported</p>
                <p className="text-sm text-gray-400 font-josefin">Successfully imported subscribers</p>
              </div>
            </div>
            {result.skipped > 0 && (
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 rounded-lg">
                <XCircle className="text-yellow-400" size={24} />
                <div>
                  <p className="text-white font-josefin font-bold">{result.skipped} Skipped</p>
                  <p className="text-sm text-gray-400 font-josefin">Duplicate subscribers</p>
                </div>
              </div>
            )}
            {result.errors && result.errors.length > 0 && (
              <div className="p-4 bg-red-500/10 rounded-lg">
                <p className="text-white font-josefin font-bold mb-2">Errors:</p>
                {result.errors.map((error: string, i: number) => (
                  <p key={i} className="text-sm text-red-400 font-josefin">{error}</p>
                ))}
              </div>
            )}
            <button
              onClick={() => router.push('/email/subscribers')}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-black font-bold font-josefin hover:shadow-lg hover:shadow-hot-pink/50 transition-all"
            >
              View Subscribers
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
