import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'
import { TicketIcon, Plus } from 'lucide-react'

export default async function SupportPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <TicketIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Support Tickets</h1>
              <p className="text-gray-600">Get help from our team</p>
            </div>
          </div>

          <Link
            href="/support/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Ticket
          </Link>
        </div>

        {/* Tickets will be loaded by client component */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8">
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    </div>
  )
}
