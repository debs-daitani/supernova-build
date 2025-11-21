'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react'
import Papa from 'papaparse'
import type { CSVRow, MigrationResult } from '@/lib/migration'

interface PreviewData {
  valid: ValidatedUser[]
  errors: Array<{ row: number; email: string; error: string }>
}

interface ValidatedUser {
  email: string
  firstName: string
  lastName: string
  isQuizTester: boolean
  quizScores?: {
    body: number
    brain: number
    business: number
  }
}

export function MigrationDashboardClient() {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCSVData] = useState<CSVRow[] | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setFile(selectedFile)
    setError(null)
    setPreview(null)
    setResult(null)

    // Parse CSV
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCSVData(results.data as CSVRow[])
      },
      error: (error) => {
        setError(`CSV parsing error: ${error.message}`)
      },
    })
  }

  const handlePreview = async () => {
    if (!csvData) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/migration/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: csvData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Preview failed')
      }

      const data: MigrationResult = await response.json()

      setPreview({
        valid: data.users || [],
        errors: data.errors,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview CSV')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (dryRun = false) => {
    if (!csvData || !file) return

    setImporting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/migration/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: csvData,
          filename: file.name,
          dryRun,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Import failed')
      }

      const data: MigrationResult = await response.json()
      setResult(data)

      if (!dryRun && data.success) {
        // Clear form on successful import
        setFile(null)
        setCSVData(null)
        setPreview(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import users')
    } finally {
      setImporting(false)
    }
  }

  const downloadSampleCSV = () => {
    const csv = `email,firstName,lastName,isQuizTester,quizPillar1Score,quizPillar2Score,quizPillar3Score,signupDate,emailConsent
ria@example.com,Ria,Jackson,true,85,72,90,2024-10-15,true
rachel@example.com,Rachel,Rocco,true,78,88,92,2024-10-14,true
subscriber@example.com,Jane,Doe,false,,,,,true`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_migration.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadErrorLog = () => {
    if (!result || !result.errors.length) return

    const csv = `Row,Email,Error\n${result.errors.map((e) => `${e.row},"${e.email}","${e.error}"`).join('\n')}`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'migration_errors.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">User Migration</h1>
              <p className="text-gray-600">Import users from Wix to The dAItaniverse</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <span className="text-sm font-semibold px-4 py-2 rounded-full bg-blue-100 text-blue-700">
              ⚡ Admin Dashboard
            </span>
            <button
              onClick={downloadSampleCSV}
              className="text-sm font-semibold px-4 py-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Sample CSV
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && !result.success && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Import Completed with Errors</h3>
              <p className="text-amber-700">
                Imported: {result.importedCount}, Errors: {result.errorCount}
              </p>
              {result.errors.length > 0 && (
                <button
                  onClick={downloadErrorLog}
                  className="mt-2 text-sm font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Error Log
                </button>
              )}
            </div>
          </div>
        )}

        {result && result.success && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Import Successful!</h3>
              <p className="text-green-700">Successfully imported {result.importedCount} users</p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Upload CSV File
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: <span className="font-semibold">{file.name}</span> (
                {csvData?.length || 0} rows)
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePreview}
              disabled={!csvData || loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Validating...' : 'Preview Import'}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {preview && (
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview Results</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600 font-semibold">Valid Users</p>
                <p className="text-3xl font-bold text-green-700">{preview.valid.length}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 font-semibold">Errors</p>
                <p className="text-3xl font-bold text-red-700">{preview.errors.length}</p>
              </div>
            </div>

            {preview.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-red-900 mb-2">Errors:</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {preview.errors.slice(0, 10).map((err, idx) => (
                    <div key={idx} className="text-sm text-red-700 mb-2">
                      <strong>Row {err.row}:</strong> {err.email} - {err.error}
                    </div>
                  ))}
                  {preview.errors.length > 10 && (
                    <p className="text-sm text-red-600 font-semibold mt-2">
                      ... and {preview.errors.length - 10} more errors
                    </p>
                  )}
                </div>
              </div>
            )}

            {preview.valid.length > 0 && (
              <>
                <h3 className="font-semibold text-gray-900 mb-2">First 10 Valid Users:</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 px-2">Email</th>
                        <th className="text-left py-2 px-2">Name</th>
                        <th className="text-left py-2 px-2">Quiz Tester</th>
                        <th className="text-left py-2 px-2">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.valid.slice(0, 10).map((user, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 px-2">{user.email}</td>
                          <td className="py-2 px-2">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="py-2 px-2">
                            {user.isQuizTester ? (
                              <span className="text-green-600 font-semibold">✓ Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="py-2 px-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                user.isQuizTester
                                  ? 'bg-pink-100 text-pink-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {user.isQuizTester ? 'MEMBER' : 'FREE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleImport(true)}
                    disabled={importing}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {importing ? 'Processing...' : 'Dry Run (Test Only)'}
                  </button>
                  <button
                    onClick={() => handleImport(false)}
                    disabled={importing}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {importing ? 'Importing...' : '✓ Execute Import'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">CSV Format Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              <strong>Required columns:</strong> email
            </li>
            <li>
              <strong>Optional columns:</strong> firstName, lastName, isQuizTester (true/false),
              quizPillar1Score (Body), quizPillar2Score (Brain), quizPillar3Score (Business),
              signupDate (YYYY-MM-DD), emailConsent (true/false)
            </li>
            <li>Quiz testers will receive MEMBER tier with lifetime access</li>
            <li>Regular subscribers will receive FREE tier</li>
            <li>Quiz scores must be between 0-100</li>
            <li>Duplicate emails will be skipped</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
