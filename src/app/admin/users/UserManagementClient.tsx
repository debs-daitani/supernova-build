'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Search,
  Crown,
  Shield,
  Filter,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'

interface UserData {
  id: string
  email: string
  role: string
  lifetimeAccess: boolean
  migratedFromWix: boolean
  emailConsent: boolean
  createdAt: string
  profile?: {
    firstName: string
    lastName: string
  }
  _count: {
    programEnrollments: number
    bookmarks: number
  }
  usageTracking: Array<{
    month: string
    supernovaMessages: number
  }>
}

interface Stats {
  totalUsers: number
  migratedUsers: number
  quizTesters: number
  byRole: {
    FREE: number
    UPGRADE: number
    MEMBER: number
    ADMIN: number
  }
}

export function UserManagementClient() {
  const [users, setUsers] = useState<UserData[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter, page])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })

      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users)
      setStats(data.stats)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update user')

      await fetchUsers()
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return 'bg-gray-100 text-gray-700'
      case 'UPGRADE':
        return 'bg-purple-100 text-purple-700'
      case 'MEMBER':
        return 'bg-pink-100 text-pink-700'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage users and membership tiers</p>
              </div>
            </div>

            <button
              onClick={fetchUsers}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <span className="text-sm font-semibold px-4 py-2 rounded-full bg-blue-100 text-blue-700">
            ⚡ Admin Dashboard
          </span>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Migrated from Wix</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.migratedUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-pink-600" />
                <div>
                  <p className="text-sm text-gray-600">Quiz Testers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.quizTesters}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">MEMBER Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.byRole.MEMBER}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Search by Email or Name
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search..."
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter by Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="">All Roles</option>
                <option value="FREE">FREE</option>
                <option value="UPGRADE">UPGRADE</option>
                <option value="MEMBER">MEMBER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                        User
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                        Role
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                        Lifetime
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                        Migrated
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                        Activity
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                        Joined
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">{user.email}</p>
                            {user.profile && (
                              <p className="text-sm text-gray-600">
                                {user.profile.firstName} {user.profile.lastName}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {editingUser === user.id ? (
                            <select
                              defaultValue={user.role}
                              onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                              className="text-xs font-semibold px-2 py-1 rounded-full border-2 border-purple-300"
                            >
                              <option value="FREE">FREE</option>
                              <option value="UPGRADE">UPGRADE</option>
                              <option value="MEMBER">MEMBER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          ) : (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getTierColor(user.role)}`}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {user.lifetimeAccess ? (
                            <Crown className="w-5 h-5 text-pink-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {user.migratedFromWix ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-sm">
                            <p className="text-gray-600">{user._count.programEnrollments} courses</p>
                            <p className="text-gray-600">{user._count.bookmarks} bookmarks</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-xs text-gray-600">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {format(new Date(user.createdAt), 'dd MMM yyyy')}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() =>
                              setEditingUser(editingUser === user.id ? null : user.id)
                            }
                            className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                          >
                            {editingUser === user.id ? 'Cancel' : 'Edit'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t-2 border-gray-200">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
