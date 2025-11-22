'use client'

import { useState } from 'react'
import { FileText, Download, Calendar, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportType, setReportType] = useState<'users' | 'features' | 'revenue' | 'traffic'>('users')
  const [generating, setGenerating] = useState(false)

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates')
      return
    }

    setGenerating(true)

    try {
      // Fetch data based on report type
      const res = await fetch(
        `/api/analytics/metrics?startDate=${startDate}&endDate=${endDate}`
      )
      const data = await res.json()

      // Generate CSV
      const csv = convertToCSV(data)
      downloadCSV(csv, `${reportType}-report-${startDate}-to-${endDate}.csv`)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0]).join(',')
    const rows = data.map((row) => Object.values(row).join(','))

    return [headers, ...rows].join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Custom Reports
          </h1>
          <p className="text-gray-600">Generate and export custom analytics reports</p>
        </div>

        {/* Report Configuration */}
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">Report Configuration</h3>

          <div className="space-y-4">
            {/* Report Type */}
            <div>
              <Label>Report Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                <Button
                  variant={reportType === 'users' ? 'default' : 'outline'}
                  onClick={() => setReportType('users')}
                  className="w-full"
                >
                  Users
                </Button>
                <Button
                  variant={reportType === 'features' ? 'default' : 'outline'}
                  onClick={() => setReportType('features')}
                  className="w-full"
                >
                  Features
                </Button>
                <Button
                  variant={reportType === 'revenue' ? 'default' : 'outline'}
                  onClick={() => setReportType('revenue')}
                  className="w-full"
                >
                  Revenue
                </Button>
                <Button
                  variant={reportType === 'traffic' ? 'default' : 'outline'}
                  onClick={() => setReportType('traffic')}
                  className="w-full"
                >
                  Traffic
                </Button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateReport}
              disabled={generating || !startDate || !endDate}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
            >
              {generating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate & Download Report
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Report Templates */}
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">Quick Report Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold">Weekly Summary</h4>
              </div>
              <p className="text-sm text-gray-600">Last 7 days overview of all metrics</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold">Monthly Report</h4>
              </div>
              <p className="text-sm text-gray-600">Last 30 days comprehensive report</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold">Revenue Analysis</h4>
              </div>
              <p className="text-sm text-gray-600">Financial metrics and subscription data</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold">User Growth</h4>
              </div>
              <p className="text-sm text-gray-600">User acquisition and retention analysis</p>
            </div>
          </div>
        </Card>

        {/* Export Formats */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Available Export Formats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <p className="font-semibold mb-1">CSV</p>
              <p className="text-sm text-gray-600">Spreadsheet compatible format</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <p className="font-semibold mb-1">JSON</p>
              <p className="text-sm text-gray-600">Developer-friendly data format</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <p className="font-semibold mb-1">PDF (Coming Soon)</p>
              <p className="text-sm text-gray-600">Formatted report documents</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
