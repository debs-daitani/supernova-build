'use client'

import { useState, useEffect } from 'react'
import { CheckSquare, Square, Plus, Calendar, AlertCircle } from 'lucide-react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [myTasks, setMyTasks] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [filter, myTasks])

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams({
        status: filter,
        myTasks: myTasks.toString(),
      })
      const response = await fetch(`/api/crm/tasks?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'

    try {
      const response = await fetch(`/api/crm/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      URGENT: 'text-red-400 bg-red-500/10 border-red-500/20',
      HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      MEDIUM: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      LOW: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    }
    return colors[priority] || colors.MEDIUM
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Tasks</h2>
          <p className="text-sm text-gray-400 font-josefin">{tasks.length} tasks</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-hot-pink to-light-teal text-white font-josefin hover:shadow-[0_0_20px_rgba(255,0,142,0.5)] transition-all">
          <Plus size={20} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-4">
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-gray-300 font-josefin cursor-pointer">
            <input
              type="checkbox"
              checked={myTasks}
              onChange={(e) => setMyTasks(e.target.checked)}
              className="rounded"
            />
            My Tasks Only
          </label>

          <div className="flex gap-2">
            {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-josefin transition-all ${
                  filter === status
                    ? 'bg-light-teal/20 text-light-teal border border-light-teal/30'
                    : 'bg-black/50 text-gray-400 hover:text-white'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const overdue = isOverdue(task.dueDate)

          return (
            <div
              key={task.id}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-light-teal/20 p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleTaskComplete(task.id, task.status)}
                  className="mt-1 text-light-teal hover:text-light-teal/80 transition-colors"
                >
                  {task.status === 'COMPLETED' ? (
                    <CheckSquare size={24} />
                  ) : (
                    <Square size={24} />
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div
                      className={`font-josefin text-lg ${
                        task.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Priority Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-josefin border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                      {/* Status Badge */}
                      {task.status === 'IN_PROGRESS' && (
                        <span className="px-3 py-1 rounded-full text-xs font-josefin bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-gray-400 font-josefin text-sm mb-3">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm font-josefin text-gray-400">
                    {/* Due Date */}
                    {task.dueDate && (
                      <div
                        className={`flex items-center gap-2 ${
                          overdue ? 'text-red-400' : ''
                        }`}
                      >
                        <Calendar size={14} />
                        {overdue && <AlertCircle size={14} />}
                        {new Date(task.dueDate).toLocaleDateString()}
                        {overdue && ' (Overdue)'}
                      </div>
                    )}

                    {/* Contact/Deal */}
                    {task.contact && (
                      <span>
                        Contact: <span className="text-light-teal">{task.contact.name}</span>
                      </span>
                    )}
                    {task.deal && (
                      <span>
                        Deal: <span className="text-light-teal">{task.deal.title}</span>
                      </span>
                    )}

                    {/* Assigned To */}
                    {task.assignedTo && (
                      <span>
                        Assigned: <span className="text-gray-300">{task.assignedTo.name}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {tasks.length === 0 && (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-12 text-center">
            <p className="text-gray-400 font-josefin">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  )
}
