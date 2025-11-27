'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import Papa from 'papaparse'

export default function ImportContactsPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [fieldMapping, setFieldMapping] = useState<any>({
    name: 'name',
    email: 'email',
    phone: 'phone',
    company: 'company',
    jobTitle: 'jobTitle',
    location: 'location',
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setResult(null)

    Papa.parse(selectedFile, {
      header: true,
      preview: 5,
      complete: (results) => {
        setPreview(results.data)
      },
    })
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const contacts = results.data
          .map((row: any) => ({
            name: row[fieldMapping.name],
            email: row[fieldMapping.email],
            phone: row[fieldMapping.phone] || undefined,
            company: row[fieldMapping.company] || undefined,
            jobTitle: row[fieldMapping.jobTitle] || undefined,
            location: row[fieldMapping.location] || undefined,
            status: 'LEAD',
          }))
          .filter((c: any) => c.name && c.email)

        try {
          const response = await fetch('/api/crm/contacts/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contacts, skipDuplicates: true }),
          })

          if (response.ok) {
            const data = await response.json()
            setResult(data)
          }
        } catch (error) {
          console.error('Import failed:', error)
        } finally {
          setImporting(false)
        }
      },
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-supernova text-light-teal">Import Contacts</h2>
        <p className="text-sm text-gray-400 font-josefin">Upload a CSV file to import contacts</p>
      </div>

      {/* Upload */}
      {!file && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border-2 border-dashed border-light-teal/30 p-12">
          <label className="flex flex-col items-center cursor-pointer">
            <Upload className="text-light-teal mb-4" size={48} />
            <span className="text-light-teal font-josefin text-lg mb-2">
              Click to upload CSV file
            </span>
            <span className="text-gray-400 font-josefin text-sm">
              CSV should include: name, email, phone, company, etc.
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Preview & Mapping */}
      {file && !result && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="text-light-teal" size={24} />
                <div>
                  <div className="font-josefin text-white">{file.name}</div>
                  <div className="text-xs text-gray-400 font-josefin">
                    {(file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null)
                  setPreview([])
                }}
                className="text-red-400 hover:text-red-300 font-josefin text-sm"
              >
                Remove
              </button>
            </div>

            {/* Field Mapping */}
            <div className="mb-6">
              <h3 className="text-lg font-supernova text-light-teal mb-3">Map CSV Columns</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(fieldMapping).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-josefin text-gray-300 mb-1 capitalize">
                      {field}
                    </label>
                    <select
                      value={fieldMapping[field]}
                      onChange={(e) =>
                        setFieldMapping({ ...fieldMapping, [field]: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-black/50 border border-light-teal/20 text-white font-josefin focus:outline-none focus:border-light-teal"
                    >
                      <option value="">-- Skip --</option>
                      {preview.length > 0 &&
                        Object.keys(preview[0]).map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div>
                <h3 className="text-lg font-supernova text-light-teal mb-3">
                  Preview (first 5 rows)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5">
                      <tr>
                        {Object.keys(preview[0]).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-2 text-left font-josefin text-light-teal"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {preview.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="px-4 py-2 font-josefin text-gray-300">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,142,0.5)] transition-all disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import Contacts'}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-400" size={32} />
            <div>
              <h3 className="text-xl font-supernova text-green-400">Import Complete</h3>
              <p className="text-gray-400 font-josefin">Your contacts have been imported</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-supernova text-green-400">{result.imported}</div>
              <div className="text-sm font-josefin text-gray-400">Imported</div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-2xl font-supernova text-yellow-400">{result.skipped}</div>
              <div className="text-sm font-josefin text-gray-400">Skipped (Duplicates)</div>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-2xl font-supernova text-red-400">
                {result.errors?.length || 0}
              </div>
              <div className="text-sm font-josefin text-gray-400">Errors</div>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="mb-6">
              <h4 className="font-josefin text-red-400 mb-2">Errors:</h4>
              <div className="space-y-1">
                {result.errors.map((error: string, i: number) => (
                  <div key={i} className="text-sm font-josefin text-gray-400">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setFile(null)
                setPreview([])
                setResult(null)
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-josefin transition-all"
            >
              Import Another File
            </button>
            <button
              onClick={() => router.push('/crm/contacts')}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,142,0.5)] transition-all"
            >
              View Contacts
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
